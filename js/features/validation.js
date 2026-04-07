import { getState } from '../game/state.js';
import { precomputedPeers } from '../core/grid.js';

export function checkCell() {
  const state = getState();

  if (state.selected < 0 || state.gameWon) return;
  if (state.given[state.selected] !== 0) return;

  const cell = document.querySelector(`.cell[data-index="${state.selected}"]`);
  if (!cell || state.board[state.selected] === 0) return;

  cell.classList.remove('error-cell');

  if (state.board[state.selected] === state.solution[state.selected]) {
    cell.classList.add('check-valid');
    setTimeout(() => cell.classList.remove('check-valid'), 300);
  } else {
    cell.classList.add('error-cell');
    setTimeout(() => cell.classList.remove('error-cell'), 2500);
  }
}

export function checkPuzzle() {
  const state = getState();
  if (state.gameWon) return;

  document.querySelectorAll('.cell.error-cell').forEach(c => c.classList.remove('error-cell'));

  for (let i = 0; i < state.board.length; i++) {
    if (state.board[i] !== 0 && state.board[i] !== state.solution[i]) {
      const cell = document.querySelector(`.cell[data-index="${i}"]`);
      if (cell) cell.classList.add('error-cell');
    }
  }

  setTimeout(() => {
    document.querySelectorAll('.cell.error-cell').forEach(c => c.classList.remove('error-cell'));
  }, 2500);
}

export function hasConflict(idx) {
  const state = getState();
  const val = state.board[idx];
  if (val === 0) return false;
  return precomputedPeers[idx].some(p => state.board[p] === val);
}