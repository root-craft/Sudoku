import { getState } from '../game/state.js';
import { getSettings } from '../storage/settings.js';
import { getRowIndices, getColIndices, getBoxIndices } from '../core/grid.js';

export function applyHighlights() {
  const state = getState();
  const settings = getSettings();
  
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight-row', 'highlight-box', 'highlight-same', 'highlight-conflict');
  });

  if (state.selected < 0) return;

  const { selected, board } = state;
  const row = Math.floor(selected / 9);
  const col = selected % 9;
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  const selectedVal = board[selected];

  const rowIndices = getRowIndices(row);
  const colIndices = getColIndices(col);
  const boxIndices = getBoxIndices(box);

  document.querySelectorAll('.cell').forEach(cell => {
    const idx = parseInt(cell.dataset.index);

    if (settings.highlightRowCol) {
      if (rowIndices.includes(idx)) cell.classList.add('highlight-row');
      if (colIndices.includes(idx)) cell.classList.add('highlight-row');
    }

    if (settings.highlightBox && boxIndices.includes(idx)) {
      cell.classList.add('highlight-box');
    }

    if (settings.highlightIdentical && selectedVal !== 0 && board[idx] === selectedVal) {
      cell.classList.add('highlight-same');
    }

    if (settings.highlightConflicts && selectedVal !== 0 && idx !== selected) {
      const peers = getPeersForCell(selected);
      if (peers.includes(idx) && board[idx] === selectedVal) {
        cell.classList.add('highlight-conflict');
      }
    }
  });
}

function getPeersForCell(idx) {
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 9);
  
  const peers = new Set();
  
  for (let i = 0; i < 9; i++) {
    peers.add(row * 9 + i);
    peers.add(i * 9 + col);
  }
  
  const boxStart = Math.floor(box / 3) * 27 + (box % 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      peers.add(boxStart + r * 9 + c);
    }
  }
  
  peers.delete(idx);
  return [...peers];
}