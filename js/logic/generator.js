import { CELL_COUNT } from '../core/grid.js';
import { solve } from './solver.js';
import { countSolutions } from './validator.js';
import { classify } from './classifier.js';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generate(difficulty) {
  const targetClues = difficulty === 'easy' ? 38 : difficulty === 'medium' ? 31 : 24;

  let board = Array(CELL_COUNT).fill(0);

  const filled = solve(board, true);
  if (!filled) return null;
  board = filled;

  const solution = [...board];
  const positions = shuffle([...Array(CELL_COUNT).keys()]);
  let clueCount = CELL_COUNT;

  for (const pos of positions) {
    if (clueCount <= targetClues) break;

    const backup = board[pos];
    board[pos] = 0;

    if (countSolutions(board) !== 1) {
      board[pos] = backup;
    } else {
      clueCount--;
    }
  }

  const classified = classify(board);
  if (classified !== difficulty) {
    return generate(difficulty);
  }

  return { puzzle: [...board], solution };
}