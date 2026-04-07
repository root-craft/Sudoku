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

  const peers = [];
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);

  for (let i = 0; i < 9; i++) {
    peers.push(row * 9 + i);
    peers.push(i * 9 + col);
  }

  const boxStart = Math.floor(box / 3) * 27 + (box % 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      peers.push(boxStart + r * 9 + c);
    }
  }

  new Set(peers).forEach(p => {
    if (p !== idx && board[p] === 0 && notes[p].has(n)) {
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