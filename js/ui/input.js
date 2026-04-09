import { enterNumber, clearCell, selectCell, doUndo, clearMultiSelect, toggleMultiSelect } from '../game/actions.js';
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
  if (!cell) return;
  const idx = parseInt(cell.dataset.index);

  if (e.shiftKey) {
    // Shift+Click: add/remove from the multi-select pool
    toggleMultiSelect(idx);
  } else {
    // Normal click: single-cell selection (clears multi-select internally)
    selectCell(idx);
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
  const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  if (e.key >= '1' && e.key <= '9') {
    e.preventDefault();
    enterNumber(parseInt(e.key));
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    clearCell();
  } else if (arrowKeys.includes(e.key)) {
    e.preventDefault();
    clearMultiSelect();

    if (state.selected < 0) {
      // Nothing selected: jump to the centre of the board
      selectCell(40);
    } else {
      const cur = state.selected;
      let next = cur;
      if      (e.key === 'ArrowRight') next = (cur + 1)       % 81;  // wraps row → next row
      else if (e.key === 'ArrowLeft')  next = (cur + 80)      % 81;  // wraps row → prev row
      else if (e.key === 'ArrowDown')  next = (cur + 9)       % 81;  // wraps col bottom → top
      else if (e.key === 'ArrowUp')    next = (cur - 9 + 81)  % 81;  // wraps col top → bottom
      selectCell(next);
    }
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