import { getState } from './state.js';

const MAX_UNDO = 100;

export function saveState() {
  const state = getState();
  state.undoStack.push({
    board: [...state.board],
    notes: state.notes.map(s => new Set(s)),
    errorCount: state.errorCount
  });
  if (state.undoStack.length > MAX_UNDO) {
    state.undoStack.shift();
  }
}

export function undo() {
  const state = getState();
  if (state.undoStack.length === 0) return false;
  
  const prev = state.undoStack.pop();
  state.board = prev.board;
  state.notes = prev.notes;
  state.errorCount = prev.errorCount;
  return true;
}

export function canUndo() {
  return getState().undoStack.length > 0;
}