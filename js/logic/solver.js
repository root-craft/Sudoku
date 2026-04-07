import { isValid } from './validator.js';
import { CELL_COUNT } from '../core/grid.js';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function solve(board, randomize = false) {
  const copy = [...board];
  let foundSolution = null;

  function solveRecursive() {
    let minIdx = -1;
    let minCandidates = 10;

    for (let i = 0; i < CELL_COUNT; i++) {
      if (copy[i] === 0) {
        let cnt = 0;
        for (let v = 1; v <= 9; v++) {
          if (isValid(copy, i, v)) cnt++;
        }
        if (cnt === 0) return false;
        if (cnt < minCandidates) {
          minCandidates = cnt;
          minIdx = i;
          if (cnt === 1) break;
        }
      }
    }

    if (minIdx === -1) {
      foundSolution = [...copy];
      return true;
    }

    const nums = randomize ? shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]) : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (const v of nums) {
      if (isValid(copy, minIdx, v)) {
        copy[minIdx] = v;
        if (solveRecursive()) return true;
        copy[minIdx] = 0;
      }
    }
    return false;
  }

  solveRecursive();
  return foundSolution;
}