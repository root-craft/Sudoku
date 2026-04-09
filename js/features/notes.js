import { getState } from '../game/state.js';
import { precomputedPeers, CELL_COUNT } from '../core/grid.js';
import { updateCellDisplay } from '../ui/render.js';

export function initCandidates() {
  const state = getState();
  const { board, notes } = state;

  for (let i = 0; i < CELL_COUNT; i++) {
    if (board[i] === 0) {
      for (let v = 1; v <= 9; v++) {
        if (precomputedPeers[i].every(p => board[p] !== v)) {
          notes[i].add(v);
        }
      }
    }
  }
}

export function removeCandidateFromPeers(idx, n) {
  const state = getState();
  const { board, notes } = state;

  // precomputedPeers[idx] is already a de-duplicated array excluding idx itself,
  // so no Math, no Set allocation needed here.
  precomputedPeers[idx].forEach(p => {
    if (board[p] === 0 && notes[p].has(n)) {
      notes[p].delete(n);
      const cell = document.querySelector(`.cell[data-index="${p}"]`);
      if (cell) updateCellDisplay(cell, p);
    }
  });
}

export function clearAllCandidates() {
  const state = getState();
  for (let i = 0; i < CELL_COUNT; i++) {
    state.notes[i].clear();
  }
}