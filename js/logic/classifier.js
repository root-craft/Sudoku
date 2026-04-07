import { precomputedPeers, CELL_COUNT } from '../core/grid.js';

export function classify(board) {
  let backtracks = 0;

  function isValid(snap, idx, val) {
    for (const p of precomputedPeers[idx]) {
      if (snap[p] === val) return false;
    }
    return true;
  }

  function solveRecursive(snap) {
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < CELL_COUNT; i++) {
        if (snap[i] === 0) {
          let count = 0, val = 0;
          for (let v = 1; v <= 9; v++) {
            if (isValid(snap, i, v)) {
              count++;
              val = v;
              if (count > 1) break;
            }
          }
          if (count === 0) return false;
          if (count === 1) {
            snap[i] = val;
            changed = true;
          }
        }
      }
    }

    let emptyIdx = -1;
    for (let i = 0; i < CELL_COUNT; i++) {
      if (snap[i] === 0) {
        emptyIdx = i;
        break;
      }
    }
    if (emptyIdx === -1) return true;

    backtracks++;
    for (let v = 1; v <= 9; v++) {
      if (isValid(snap, emptyIdx, v)) {
        const next = [...snap];
        next[emptyIdx] = v;
        if (solveRecursive(next)) return true;
      }
    }
    return false;
  }

  solveRecursive([...board]);
  const clueCount = board.filter(v => v !== 0).length;

  if (clueCount >= 36 && backtracks === 0) return 'easy';
  if (clueCount >= 28 && backtracks <= 2) return 'medium';
  return 'hard';
}