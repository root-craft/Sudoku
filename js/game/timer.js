import { getState } from './state.js';

let timerInterval = null;
let timerSec = 0;

export function startTimer() {
  stopTimer();
  timerSec = 0;
  const state = getState();
  timerInterval = setInterval(() => {
    if (!state.paused && !state.gameWon) {
      timerSec++;
      updateTimerDisplay();
    }
  }, 1000);
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function togglePause() {
  const state = getState();
  if (state.gameWon) return;
  state.paused = !state.paused;
  updateTimerDisplay();
  return state.paused;
}

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getTimerSeconds() {
  return timerSec;
}

/** Seeds the timer with a previously saved elapsed value and refreshes the display. */
export function setTimerSeconds(sec) {
  timerSec = sec;
  updateTimerDisplay();
}


function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(timerSec);
  }
  
  const timerEl = document.getElementById('timer');
  const pauseBtn = document.getElementById('pause-btn');
  const overlay = document.getElementById('paused-overlay');
  const state = getState();
  
  if (timerEl) timerEl.classList.toggle('paused', state.paused);
  if (pauseBtn) pauseBtn.textContent = state.paused ? '▶' : '⏸';
  if (overlay) overlay.classList.toggle('visible', state.paused);
}

export function resetTimer() {
  timerSec = 0;
  updateTimerDisplay();
}