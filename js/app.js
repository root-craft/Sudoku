import { newGame, getState, setMode, restoreGame } from './game/state.js';
import { startTimer, togglePause } from './game/timer.js';
import { renderGrid, updateDifficultyTabs, updateModeTabs, updateErrorCount } from './ui/render.js';
import { applyHighlights } from './ui/highlights.js';
import { handleCellClick, handleNumpadClick, handleKeydown, updateNumpadDim, handleClearBtn, handleUndoBtn } from './ui/input.js';
import { showModal, hideModal, applySettings } from './ui/modals.js';
import { getSettings, loadSettings, saveSetting } from './storage/settings.js';
import { loadProgress, clearProgress } from './storage/progress.js';
import { enterNumber, clearCell, selectCell, doUndo, getHint, revealCell, revealPuzzle, resetPuzzle } from './game/actions.js';
import { checkCell, checkPuzzle } from './features/validation.js';
import { initCandidates, clearAllCandidates } from './features/notes.js';

function initApp() {
  const dateEl = document.getElementById('date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  loadSettings();
  applySettings();

  const settings = getSettings();
  const saved = loadProgress();

  if (saved) {
    // Resume previous unfinished game
    restoreGame(saved);
  } else {
    const result = newGame('easy');
    if (!result) {
      alert('Failed to generate puzzle. Please try again.');
      return;
    }
    if (settings.autoCandidate) initCandidates();
  }

  const state = getState();
  renderGrid();
  updateDifficultyTabs(state.currentDifficulty);
  updateModeTabs(state.mode);
  updateErrorCount();
  startTimer();
  hideModal('win-modal');
  selectCell(0);

  setupEventListeners();
}

function setupEventListeners() {
  const grid = document.getElementById('grid');
  if (grid) grid.addEventListener('click', handleCellClick);

  const numpad = document.querySelector('.numpad');
  if (numpad) numpad.addEventListener('click', handleNumpadClick);

  document.querySelectorAll('.difficulty-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      const difficulty = btn.dataset.difficulty;
      const settings = getSettings();

      clearProgress(); // discard old save before starting fresh
      const result = newGame(difficulty);
      if (result) {
        if (settings.autoCandidate) initCandidates();
        renderGrid();
        updateDifficultyTabs(difficulty);
        updateModeTabs(getState().mode);
        updateErrorCount();
        startTimer();
        hideModal('win-modal');
        selectCell(0);
      }
    });
  });

  document.querySelectorAll('.mode-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      setMode(btn.dataset.mode);
      updateModeTabs(btn.dataset.mode);
    });
  });

  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) clearBtn.addEventListener('click', handleClearBtn);

  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) undoBtn.addEventListener('click', handleUndoBtn);

  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

  const pausedOverlay = document.getElementById('paused-overlay');
  if (pausedOverlay) pausedOverlay.addEventListener('click', togglePause);

  const newBtn = document.getElementById('new-btn');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      const state = getState();
      const settings = getSettings();
      clearProgress();
      const result = newGame(state.currentDifficulty);
      if (result) {
        if (settings.autoCandidate) initCandidates();
        renderGrid();
        updateErrorCount();
        startTimer();
        hideModal('win-modal');
        selectCell(0);
      }
    });
  }

  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) settingsBtn.addEventListener('click', () => showModal('settings-modal'));

  const closeSettings = document.getElementById('close-settings');
  if (closeSettings) closeSettings.addEventListener('click', () => hideModal('settings-modal'));

  const hintBtn = document.getElementById('hint-btn');
  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      getHint();
      document.getElementById('menu-dropdown').classList.remove('visible');
    });
  }

  const checkCellBtn = document.getElementById('check-cell-btn');
  if (checkCellBtn) {
    checkCellBtn.addEventListener('click', () => {
      checkCell();
      document.getElementById('menu-dropdown').classList.remove('visible');
    });
  }

  const checkPuzzleBtn = document.getElementById('check-puzzle-btn');
  if (checkPuzzleBtn) {
    checkPuzzleBtn.addEventListener('click', () => {
      checkPuzzle();
      document.getElementById('menu-dropdown').classList.remove('visible');
    });
  }

  const revealCellBtn = document.getElementById('reveal-cell-btn');
  if (revealCellBtn) {
    revealCellBtn.addEventListener('click', () => {
      revealCell();
      document.getElementById('menu-dropdown').classList.remove('visible');
    });
  }

  const revealPuzzleBtn = document.getElementById('reveal-puzzle-btn');
  if (revealPuzzleBtn) {
    revealPuzzleBtn.addEventListener('click', () => {
      revealPuzzle();
      document.getElementById('menu-dropdown').classList.remove('visible');
    });
  }

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('menu-dropdown').classList.remove('visible');
      if (resetPuzzle()) {
        clearProgress(); // board is back to start; wipe the save
        startTimer();
      }
    });
  }

  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById('menu-dropdown').classList.toggle('visible');
    });
  }

  document.addEventListener('click', () => {
    document.getElementById('menu-dropdown').classList.remove('visible');
  });

  const nextPuzzleBtn = document.getElementById('next-puzzle-btn');
  if (nextPuzzleBtn) {
    nextPuzzleBtn.addEventListener('click', () => {
      const state = getState();
      const settings = getSettings();
      clearProgress();
      const result = newGame(state.currentDifficulty);
      if (result) {
        if (settings.autoCandidate) initCandidates();
        renderGrid();
        updateErrorCount();
        startTimer();
        hideModal('win-modal');
        selectCell(0);
      }
    });
  }

  document.getElementById('setting-checkGuesses').addEventListener('change', e => {
    saveSetting('checkGuesses', e.target.checked);
    applySettings();
  });

  document.getElementById('setting-autoCandidate').addEventListener('change', e => {
    saveSetting('autoCandidate', e.target.checked);
    setMode(e.target.checked ? 'candidate' : 'normal');
    updateModeTabs(getState().mode);
    
    if (e.target.checked) {
      initCandidates();
    } else {
      clearAllCandidates();
    }
    renderGrid();
    applySettings();
  });

  document.getElementById('setting-showErrorCounter').addEventListener('change', e => {
    saveSetting('showErrorCounter', e.target.checked);
    applySettings();
  });

  document.getElementById('setting-showTimer').addEventListener('change', e => {
    saveSetting('showTimer', e.target.checked);
    applySettings();
  });

  document.getElementById('setting-highlightConflicts').addEventListener('change', e => {
    saveSetting('highlightConflicts', e.target.checked);
    applySettings();
  });

  document.getElementById('setting-highlightRowCol').addEventListener('change', e => {
    saveSetting('highlightRowCol', e.target.checked);
    applySettings();
  });

  document.getElementById('setting-highlightBox').addEventListener('change', e => {
    saveSetting('highlightBox', e.target.checked);
    applySettings();
  });

  document.getElementById('setting-highlightIdentical').addEventListener('change', e => {
    saveSetting('highlightIdentical', e.target.checked);
    applySettings();
  });

  document.getElementById('auto-candidate').addEventListener('change', e => {
    saveSetting('autoCandidate', e.target.checked);
    setMode(e.target.checked ? 'candidate' : 'normal');
    updateModeTabs(getState().mode);
    
    if (e.target.checked) {
      initCandidates();
    } else {
      clearAllCandidates();
    }
    renderGrid();
    applySettings();
  });

  document.addEventListener('keydown', handleKeydown);

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', handleModalOverlayClick);
  });
}

document.addEventListener('DOMContentLoaded', initApp);