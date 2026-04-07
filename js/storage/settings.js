export const DEFAULT_SETTINGS = {
  checkGuesses: false,
  autoCandidate: true,
  showErrorCounter: false,
  showTimer: true,
  highlightConflicts: true,
  highlightRowCol: true,
  highlightBox: true,
  highlightIdentical: true
};

let settings = { ...DEFAULT_SETTINGS };

export function loadSettings() {
  const saved = localStorage.getItem('sudokuSettings');
  if (saved) {
    settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  }
  return settings;
}

export function saveSetting(key, val) {
  settings[key] = val;
  localStorage.setItem('sudokuSettings', JSON.stringify(settings));
}

export function getSettings() {
  return settings;
}

export function getSetting(key) {
  return settings[key];
}