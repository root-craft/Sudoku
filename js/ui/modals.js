import { getSettings } from '../storage/settings.js';
import { applyHighlights } from './highlights.js';
import { getState } from '../game/state.js';

export function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('visible');
}

export function hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('visible');
}

export function handleModalOverlayClick(e) {
  if (e.target.classList.contains('modal-overlay')) {
    hideModal(e.target.id);
  }
}

export function applySettings() {
  const settings = getSettings();

  const mapping = {
    'setting-checkGuesses': 'checkGuesses',
    'setting-autoCandidate': 'autoCandidate',
    'setting-showErrorCounter': 'showErrorCounter',
    'setting-showTimer': 'showTimer',
    'setting-highlightConflicts': 'highlightConflicts',
    'setting-highlightRowCol': 'highlightRowCol',
    'setting-highlightBox': 'highlightBox',
    'setting-highlightIdentical': 'highlightIdentical',
    'auto-candidate': 'autoCandidate'
  };

  for (const [id, key] of Object.entries(mapping)) {
    const el = document.getElementById(id);
    if (el) el.checked = settings[key];
  }

  const timerEl = document.getElementById('timer');
  const errorCounterEl = document.getElementById('error-counter');
  if (timerEl) timerEl.classList.toggle('hidden', !settings.showTimer);
  if (errorCounterEl) errorCounterEl.classList.toggle('visible', settings.showErrorCounter);

  const state = getState();
  if (state.selected >= 0) {
    applyHighlights();
  }
}