import { getState, incrementErrorCount, setGameWon } from './state.js';
import { saveState, undo } from './history.js';
import { removeCandidateFromPeers, initCandidates } from '../features/notes.js';
import { checkWin } from './win.js';
import { updateCellDisplay, renderGrid } from '../ui/render.js';
import { applyHighlights } from '../ui/highlights.js';
import { updateNumpadDim } from '../ui/input.js';
import { getSettings } from '../storage/settings.js';
import { saveProgress } from '../storage/progress.js';
import { CELL_COUNT } from '../core/grid.js';

export function enterNumber(n, asNote = false) {
  const state = getState();
  const settings = getSettings();

  if (state.gameWon) return;

  // ── Multi-select mode ────────────────────────────────────────────────────
  if (state.selectedCells && state.selectedCells.length > 0) {
    saveState();
    state.selectedCells.forEach(idx => {
      if (state.given[idx] !== 0) return; // skip given clues
      if (state.mode === 'candidate') {
        if (state.board[idx] !== 0) state.board[idx] = 0;
        if (state.notes[idx].has(n)) {
          state.notes[idx].delete(n);
        } else {
          state.notes[idx].add(n);
        }
      } else {
        state.notes[idx].clear();
        state.board[idx] = n;
        if (settings.checkGuesses && n !== state.solution[idx]) {
          incrementErrorCount();
        }
        if (settings.autoCandidate) {
          removeCandidateFromPeers(idx, n);
        }
      }
      const cell = document.querySelector(`.cell[data-index="${idx}"]`);
      if (cell) updateCellDisplay(cell, idx);
    });
    const errorCountEl = document.getElementById('error-count');
    if (errorCountEl) errorCountEl.textContent = state.errorCount;
    updateNumpadDim();
    checkWin();
    saveProgress();
    return;
  }

  // ── Single-cell mode ─────────────────────────────────────────────────────
  if (state.selected < 0) return;
  if (state.given[state.selected] !== 0) return;

  saveState();

  if (state.mode === 'candidate' || asNote) {
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
  saveProgress();
}

export function clearCell() {
  const state = getState();

  if (state.gameWon) return;

  // ── Multi-select mode ────────────────────────────────────────────────────
  if (state.selectedCells && state.selectedCells.length > 0) {
    saveState();
    state.selectedCells.forEach(idx => {
      if (state.given[idx] !== 0) return;
      state.board[idx] = 0;
      state.notes[idx].clear();
      const cell = document.querySelector(`.cell[data-index="${idx}"]`);
      if (cell) updateCellDisplay(cell, idx);
    });
    updateNumpadDim();
    saveProgress();
    return;
  }

  // ── Single-cell mode ─────────────────────────────────────────────────────
  if (state.selected < 0) return;
  if (state.given[state.selected] !== 0) return;

  saveState();

  state.board[state.selected] = 0;
  state.notes[state.selected].clear();

  const cell = document.querySelector(`.cell[data-index="${state.selected}"]`);
  if (cell) updateCellDisplay(cell, state.selected);

  updateNumpadDim();
  saveProgress();
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
  saveProgress(); // persist the rolled-back board so refresh reflects the undo
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
  saveProgress();
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
  saveProgress();
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

  // Always clear multi-selection when explicitly selecting a single cell
  document.querySelectorAll('.cell.multi-selected').forEach(c => c.classList.remove('multi-selected'));
  state.selectedCells = [];

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

// ── Multi-select helpers ──────────────────────────────────────────────────────

/** Removes the multi-selected class from every cell and empties the array. */
export function clearMultiSelect() {
  const state = getState();
  document.querySelectorAll('.cell.multi-selected').forEach(c => c.classList.remove('multi-selected'));
  state.selectedCells = [];
}

/**
 * Toggles a cell in/out of the multi-select set.
 * The primary .selected cell is not affected.
 */
export function toggleMultiSelect(idx) {
  const state = getState();
  if (state.gameWon) return;

  const pos = state.selectedCells.indexOf(idx);
  const cell = document.querySelector(`.cell[data-index="${idx}"]`);

  if (pos >= 0) {
    state.selectedCells.splice(pos, 1);
    if (cell) cell.classList.remove('multi-selected');
  } else {
    state.selectedCells.push(idx);
    if (cell) cell.classList.add('multi-selected');
  }
}