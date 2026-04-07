import { getState } from '../game/state.js';
import { CELL_COUNT } from '../core/grid.js';
import { getSettings } from '../storage/settings.js';
import { hasConflict } from '../features/validation.js';

export function renderGrid() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  
  grid.innerHTML = '';

  const state = getState();

  for (let i = 0; i < CELL_COUNT; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;

    if (state.given[i] !== 0) {
      cell.classList.add('given');
    }

    const col = i % 9;
    const row = Math.floor(i / 9);
    if (col === 2 || col === 5) cell.classList.add('border-right');
    if (row === 2 || row === 5) cell.classList.add('border-bottom');

    updateCellDisplay(cell, i);
    grid.appendChild(cell);
  }
}

export function updateCellDisplay(cell, idx) {
  const state = getState();
  const settings = getSettings();
  const { board, given, notes } = state;
  
  const val = board[idx];
  const isGiven = given[idx] !== 0;

  cell.classList.remove('given', 'has-note', 'wrong', 'error-cell', 'conflict-dot');

  if (isGiven) {
    cell.classList.add('given');
    cell.textContent = given[idx];
  } else if (notes[idx].size > 0 && val === 0) {
    cell.classList.add('has-note');
    cell.textContent = '';
    cell.dataset.value = '';
    cell.innerHTML = '<div class="notes-grid"></div>';
    const notesGrid = cell.querySelector('.notes-grid');
    for (let n = 1; n <= 9; n++) {
      const noteEl = document.createElement('span');
      noteEl.className = 'note' + (notes[idx].has(n) ? ' active' : '');
      noteEl.textContent = notes[idx].has(n) ? n : '';
      notesGrid.appendChild(noteEl);
    }
  } else {
    cell.textContent = val || '';
    if (settings.checkGuesses && val !== 0 && val !== state.solution[idx]) {
      cell.classList.add('wrong');
    }

    if (val !== 0 && !isGiven && hasConflict(idx)) {
      cell.classList.add('conflict-dot');
    }
  }
}

export function updateDifficultyTabs(difficulty) {
  document.querySelectorAll('.difficulty-tabs button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
  });
}

export function updateModeTabs(mode) {
  document.querySelectorAll('.mode-toggle button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

export function updateErrorCount() {
  const state = getState();
  const errorCountEl = document.getElementById('error-count');
  if (errorCountEl) errorCountEl.textContent = state.errorCount;
}