import { getState } from '../game/state.js';

const PROGRESS_KEY = 'sudokuProgress';

/**
 * Persists the current board, notes, given clues, solution, difficulty,
 * and error count to localStorage. If the game is already won we wipe any
 * stale save instead of persisting a completed puzzle.
 */
export function saveProgress() {
  const state = getState();

  if (state.gameWon) {
    clearProgress();
    return;
  }

  const data = {
    board:      [...state.board],
    given:      [...state.given],
    solution:   [...state.solution],
    notes:      state.notes.map(s => [...s]),
    difficulty: state.currentDifficulty,
    errorCount: state.errorCount,
  };

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    // Storage quota exceeded – silently swallow
    console.warn('saveProgress: could not write to localStorage', e);
  }
}

/**
 * Returns the previously saved progress object, or null if none exists /
 * the stored JSON is corrupt.
 */
export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Removes any saved progress (call when user starts a fresh game). */
export function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}
