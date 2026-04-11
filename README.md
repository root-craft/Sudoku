# Sudoku Web App

A feature-rich, production-ready Sudoku application built with Vanilla JavaScript, HTML5, and CSS3. The application is completely client-side and requires no backend, making it perfect for hosting on GitHub Pages or any static web host.

## Features

- **Difficulty Levels:** Play on Easy, Medium, or Hard modes.
- **Auto-Save & Persistence:** Board state, notes, error counts, and the timer are automatically saved to `localStorage`. You can safely close the tab and resume your game later without losing progress.
- **Advanced Navigation & Multi-select:**
  - Wrap-around arrow-key navigation for seamless board movement.
  - Automatically jump to the center of the board if nothing is selected.
  - `Shift + Click` to select multiple cells and apply a candidate/number to all of them simultaneously.
- **Notes & Auto-Candidates:** 
  - Toggle candidates mode to take notes.
  - Optional setting to automatically update notes when definitive numbers are placed.
- **Hints & Validation:**
  - Check partial cells or the whole puzzle.
  - Smart Hint system to strategically reveal one correct answer.
  - Error Counter and "Show Wrong Entries" live feedback toggle.
- **Custom Highlights Options:** Highlight conflicts, same-numbers, or the currently selected row, column, and 3x3 box dynamically.

## Installation and Execution

Since this app is built purely with static technologies, there are no package managers or build steps required.

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd Sudoku
   ```
2. Open `index.html` in any modern web browser or serve via a basic local web server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```

## Architecture

The logic has been modularized cleanly under the `js/` directory:
- `core/` - Grid definitions and cell structures.
- `features/` - Complex mechanics like validation and note-taking logic.
- `game/` - Game loop state, board actions, history (undo), and timers.
- `storage/` - Serializing state and user settings to the browser's Local Storage.
- `ui/` - Separating pure view rendering from game logic.
