import { CELL_COUNT } from '../core/grid.js';
import { generate } from '../logic/generator.js';
import { precomputedPeers } from '../core/grid.js';
import { getSettings } from '../storage/settings.js';

const state = {
  board: [],
  given: [],
  solution: [],
  notes: [],
  selected: -1,
  mode: 'normal',
  currentDifficulty: 'easy',
  gameWon: false,
  errorCount: 0,
  paused: false,
  undoStack: []
};

export function getState() {
  return state;
}

export function newGame(difficulty = 'easy') {
  const settings = getSettings();
  
  state.currentDifficulty = difficulty;
  state.selected = -1;
  state.mode = settings.autoCandidate ? 'candidate' : 'normal';
  state.undoStack = [];
  state.gameWon = false;
  state.errorCount = 0;
  state.paused = false;
  state.notes = Array.from({ length: CELL_COUNT }, () => new Set());

  const result = generate(difficulty);
  if (!result) {
    console.error('Puzzle generation failed');
    return false;
  }

  state.board = [...result.puzzle];
  state.given = [...result.puzzle];
  state.solution = result.solution;

  return true;
}

export function setSelected(idx) {
  state.selected = idx;
}

export function setMode(mode) {
  state.mode = mode;
}

export function setGameWon(won) {
  state.gameWon = won;
}

export function incrementErrorCount() {
  state.errorCount++;
  return state.errorCount;
}

export function resetErrorCount() {
  state.errorCount = 0;
}

export { precomputedPeers };
export { CELL_COUNT };