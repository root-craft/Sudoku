import { precomputedPeers, CELL_COUNT } from '../core/grid.js';

export function isValid(board, idx, val) {
  for (const p of precomputedPeers[idx]) {
    if (board[p] === val) return false;
  }
  return true;
}

export function countSolutions(board, maxCount = 2) {
  const copy = [...board];
  let count = 0;

  function solveRecursive() {
    if (count >= maxCount) return;

    let minIdx = -1;
    let minCandidates = 10;

    for (let i = 0; i < CELL_COUNT; i++) {
      if (copy[i] === 0) {
        const candidates = [];
        for (let v = 1; v <= 9; v++) {
          if (isValid(copy, i, v)) candidates.push(v);
        }
        if (candidates.length === 0) return;
        if (candidates.length < minCandidates) {
          minCandidates = candidates.length;
          minIdx = i;
        }
      }
    }

    if (minIdx === -1) {
      count++;
      return;
    }

    for (let v = 1; v <= 9; v++) {
      if (isValid(copy, minIdx, v)) {
        copy[minIdx] = v;
        solveRecursive();
        copy[minIdx] = 0;
      }
    }
  }

  solveRecursive();
  return count;
}