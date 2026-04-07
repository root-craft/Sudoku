import { enterNumber, clearCell, selectCell, doUndo } from '../game/actions.js';
import { getState } from '../game/state.js';
import { togglePause } from '../game/timer.js';

export function updateNumpadDim() {
  const state = getState();
  const counts = {};
  
  for (let n = 1; n <= 9; n++) counts[n] = 0;
  for (const v of state.board) if (v !== 0) counts[v]++;

  document.querySelectorAll('.numpad button').forEach(btn => {
    const n = parseInt(btn.dataset.num);
    btn.classList.toggle('dimmed', counts[n] >= 9);
  });
}

export function handleCellClick(e) {
  const cell = e.target.closest('.cell');
  if (cell) {
    selectCell(parseInt(cell.dataset.index));
  }
}

export function handleNumpadClick(e) {
  const btn = e.target.closest('button[data-num]');
  if (btn) {
    enterNumber(parseInt(btn.dataset.num));
  }
}

export function handleDifficultyClick(e) {
  const btn = e.target.closest('.difficulty-tabs button');
  if (btn) {
    return btn.dataset.difficulty;
  }
  return null;
}

export function handleModeClick(e) {
  const btn = e.target.closest('.mode-toggle button');
  if (btn) {
    return btn.dataset.mode;
  }
  return null;
}

export function handleKeydown(e) {
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal && settingsModal.classList.contains('visible')) return;

  const state = getState();

  if (state.selected < 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    return;
  }

  if (e.key >= '1' && e.key <= '9') {
    e.preventDefault();
    enterNumber(parseInt(e.key));
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    clearCell();
  } else if (e.key === 'ArrowUp' && state.selected >= 9) {
    e.preventDefault();
    selectCell(state.selected - 9);
  } else if (e.key === 'ArrowDown' && state.selected < 72) {
    e.preventDefault();
    selectCell(state.selected + 9);
  } else if (e.key === 'ArrowLeft' && state.selected % 9 > 0) {
    e.preventDefault();
    selectCell(state.selected - 1);
  } else if (e.key === 'ArrowRight' && state.selected % 9 < 8) {
    e.preventDefault();
    selectCell(state.selected + 1);
  } else if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    doUndo();
  } else if (e.key === ' ') {
    e.preventDefault();
    togglePause();
  }
}

export function handleClearBtn() {
  clearCell();
}

export function handleUndoBtn() {
  doUndo();
}