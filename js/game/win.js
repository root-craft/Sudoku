import { getState, setGameWon } from './state.js';
import { stopTimer, getTimerSeconds, formatTime } from './timer.js';

export function checkWin() {
  const state = getState();
  if (state.gameWon) return false;
  
  for (let i = 0; i < state.board.length; i++) {
    if (state.board[i] !== state.solution[i]) return false;
  }

  state.gameWon = true;
  stopTimer();
  showWinModal();
  return true;
}

function showWinModal() {
  const state = getState();
  const modal = document.getElementById('win-modal');
  const stats = document.getElementById('win-stats');
  
  if (stats) {
    const difficulty = state.currentDifficulty.charAt(0).toUpperCase() + state.currentDifficulty.slice(1);
    stats.textContent = `${difficulty} · ${formatTime(getTimerSeconds())}`;
  }
  
  if (modal) modal.classList.add('visible');
}

export function isGameWon() {
  return getState().gameWon;
}