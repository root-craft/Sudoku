import { getState, incrementErrorCount, setGameWon } from './state.js';
import { saveState, undo } from './history.js';
import { removeCandidateFromPeers, initCandidates } from '../features/notes.js';
import { checkWin } from './win.js';
import { updateCellDisplay, renderGrid } from '../ui/render.js';
import { applyHighlights } from '../ui/highlights.js';
import { updateNumpadDim } from '../ui/input.js';
import { getSettings } from '../storage/settings.js';
import { CELL_COUNT } from '../core/grid.js';

export function enterNumber(n) {
  const state = getState();
  const settings = getSettings();

  if (state.selected < 0 || state.gameWon) return;
  if (state.given[state.selected] !== 0) return;

  saveState();

  if (state.mode === 'candidate') {
    if (state.board[state.selected] !== 0) {
      state.board[state.selected] = 0;
    }
    if (state.notes[state.selected].has(n)) {
      state.notes[state.selected].delete(n);
    } else {
      state.notes[state.selected].add(n);
    }
  } else {
    state.notes[state.selected].clear();
    state.board[state.selected] = n;

    if (settings.checkGuesses && n !== state.solution[state.selected]) {
      incrementErrorCount();
      const errorCountEl = document.getElementById('error-count');
      if (errorCountEl) errorCountEl.textContent = getState().errorCount;
    }

    if (settings.autoCandidate) {
      removeCandidateFromPeers(state.selected, n);
    }
  }

  const cell = document.querySelector(`.cell[data-index="${state.selected}"]`);
  if (cell) updateCellDisplay(cell, state.selected);

  updateNumpadDim();
  checkWin();
}

export function clearCell() {
  const state = getState();

  if (state.selected < 0 || state.gameWon) return;
  if (state.given[state.selected] !== 0) return;

  saveState();

  state.board[state.selected] = 0;
  state.notes[state.selected].clear();

  const cell = document.querySelector(`.cell[data-index="${state.selected}"]`);
  if (cell) updateCellDisplay(cell, state.selected);

  updateNumpadDim();
}

export function doUndo() {
  if (!undo()) return false;

  const state = getState();
  const errorCountEl = document.getElementById('error-count');
  if (errorCountEl) errorCountEl.textContent = state.errorCount;

  renderGrid();
  if (state.selected >= 0) {
    const cell = document.querySelector(`.cell[data-index="${state.selected}"]`);
    if (cell) cell.classList.add('selected');
    applyHighlights();
  }
  updateNumpadDim();
  return true;
}

export function getHint() {
  const state = getState();
  if (state.gameWon) return;

  const emptyCells = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    if (state.board[i] !== state.solution[i]) emptyCells.push(i);
  }
  if (emptyCells.length === 0) return;

  const hintIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  state.board[hintIdx] = state.solution[hintIdx];
  state.notes[hintIdx].clear();

  const cell = document.querySelector(`.cell[data-index="${hintIdx}"]`);
  if (cell) {
    cell.classList.add('hint-reveal');
    setTimeout(() => cell.classList.remove('hint-reveal'), 500);
    updateCellDisplay(cell, hintIdx);
  }

  updateNumpadDim();
  checkWin();
}

export function revealCell() {
  const state = getState();

  if (state.selected < 0 || state.gameWon) return;
  if (state.given[state.selected] !== 0) return;

  state.board[state.selected] = state.solution[state.selected];
  state.notes[state.selected].clear();

  const cell = document.querySelector(`.cell[data-index="${state.selected}"]`);
  if (cell) updateCellDisplay(cell, state.selected);

  updateNumpadDim();
  checkWin();
}

export function revealPuzzle() {
  const state = getState();

  for (let i = 0; i < CELL_COUNT; i++) {
    if (state.given[i] === 0) {
      state.board[i] = state.solution[i];
      state.notes[i].clear();
    }
  }
  state.gameWon = true;
  renderGrid();
}

export function resetPuzzle() {
  if (!confirm('Reset puzzle? All your progress will be lost.')) return false;

  const state = getState();

  for (let i = 0; i < CELL_COUNT; i++) {
    if (state.given[i] === 0) {
      state.board[i] = 0;
      state.notes[i].clear();
    }
  }

  state.undoStack = [];
  state.gameWon = false;
  state.errorCount = 0;
  state.paused = false;

  const errorCountEl = document.getElementById('error-count');
  const timerDisplay = document.getElementById('timer-display');
  const timerEl = document.getElementById('timer');
  const pauseBtn = document.getElementById('pause-btn');
  const overlay = document.getElementById('paused-overlay');

  if (errorCountEl) errorCountEl.textContent = '0';
  if (timerDisplay) timerDisplay.textContent = '0:00';
  if (timerEl) timerEl.classList.remove('paused');
  if (pauseBtn) pauseBtn.textContent = '⏸';
  if (overlay) overlay.classList.remove('visible');

  renderGrid();
  return true;
}

export function selectCell(idx) {
  const state = getState();
  if (state.gameWon) return;

  document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));

  if (idx >= 0) {
    state.selected = idx;
    const cell = document.querySelector(`.cell[data-index="${idx}"]`);
    if (cell) cell.classList.add('selected');
    applyHighlights();
  } else {
    state.selected = -1;
    document.querySelectorAll('.cell').forEach(c => {
      c.classList.remove('highlight-row', 'highlight-box', 'highlight-same', 'highlight-conflict');
    });
  }
}