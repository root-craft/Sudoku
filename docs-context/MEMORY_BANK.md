# Sudoku Project — Memory Bank

**Generated:** 2026-01-04  
**Purpose:** Comprehensive project knowledge base for AI agents and developers

---

## Project Overview

### What This Is
A production-grade, single-file HTML Sudoku game matching NYT Sudoku quality and features. Includes procedural puzzle generation with difficulty grading, full keyboard/mouse controls, timer, settings, and win detection.

### Technical Stack
- **Single HTML file** — no external dependencies except Google Fonts
- **Pure JavaScript** — no libraries, frameworks, or build tools
- **CSS Grid + Flexbox** — responsive layout
- **Fonts:** DM Serif Display (heading), DM Mono (UI/numbers)

### Key Constraints
- No external JS libraries
- No server-side code
- Must run entirely in-browser
- Deterministic puzzle generation
- Unique solution guarantee for every puzzle

---

## Architecture

### State Management
```javascript
// Core game state
board[]           // int[81] — current player board (0=empty, 1-9=filled)
given[]           // int[81] — immutable original clues
solution[]        // int[81] — complete valid solution
notes[]           // Set[81] — candidate notes per cell
selected          // int — currently selected cell index (0-80, -1=none)
mode              // 'normal' | 'candidate'
undoStack[]       // array of state snapshots
timerSec          // int — elapsed seconds
paused            // bool
errorCount        // int
settings{}        // object with 8 boolean flags
```

### Module Structure
```
┌─────────────────────────────────────┐
│  SudokuGenerator (IIFE module)     │
│  ├─ generate(difficulty)           │
│  ├─ hasUniqueSolution(board)       │
│  ├─ solve(board)                   │
│  └─ classify(board)                │
└─────────────────────────────────────┘
           ↓ provides puzzles to
┌─────────────────────────────────────┐
│  Game Logic (global scope)         │
│  ├─ newGame(difficulty)            │
│  ├─ renderGrid()                   │
│  ├─ selectCell(idx)                │
│  ├─ enterNumber(n)                 │
│  ├─ applyHighlights()              │
│  ├─ checkWin()                     │
│  └─ timer/undo/menu functions      │
└─────────────────────────────────────┘
           ↓ manipulates
┌─────────────────────────────────────┐
│  DOM (HTML structure)              │
│  ├─ #grid (81 .cell divs)         │
│  ├─ #numpad (1-9 buttons)          │
│  ├─ modals (settings, menu, win)   │
│  └─ controls (timer, tabs, etc)    │
└─────────────────────────────────────┘
```

---

## Core Features

### 1. Difficulty System
| Level | Clues | Techniques Required | Generation Time |
|-------|-------|---------------------|-----------------|
| Easy | 36-40 | Naked singles only | <50ms |
| Medium | 28-34 | Hidden singles, naked pairs | <200ms |
| Hard | 22-27 | X-wing, swordfish, forcing chains | <500ms |

**Critical:** Both clue count AND technique analysis must agree on difficulty. Mismatches require regeneration.

### 2. Input Modes
- **Normal mode:** Click number → fills cell (or marks red if wrong + check mode on)
- **Candidate mode:** Click number → toggles pencil mark in 3×3 mini-grid within cell
- **Auto-candidate mode:** When placing a digit, automatically removes that candidate from all peer cells (same row/col/box)

### 3. Highlighting System (Priority Order)
Applied simultaneously, layered from lowest to highest z-index:

1. **Box highlight** — subtle tint on 3×3 box containing selected cell
2. **Row/column highlight** — stronger tint on entire row + column
3. **Same number highlight** — warm tint on all cells with same digit
4. **Selected cell** — distinct border + warm background
5. **Conflict highlight** — red tint on peers with same digit (if setting enabled)

All controlled by settings toggles. Must apply in real-time without re-rendering entire grid.

### 4. Settings (8 toggles)
```javascript
settings = {
  checkGuesses: false,        // Mark wrong entries red immediately
  autoCandidate: false,       // Start new games in auto-candidate mode
  showErrorCounter: false,    // Display mistake count (NEW badge)
  showTimer: true,            // Show/hide timer
  highlightConflicts: true,   // Red tint on conflicting cells
  highlightRowCol: true,      // Tint row/column (NEW badge)
  highlightBox: true,         // Tint 3×3 box (NEW badge)
  highlightIdentical: true,   // Tint same numbers (NEW badge)
}
```

### 5. Menu Actions (••• dropdown)
1. **Hint** — reveals one random unfilled/incorrect cell
2. **Check cell** — green/red outline on selected cell
3. **Check puzzle** — alert with error count or "Looking good!"
4. **Reveal cell** — fills selected cell with solution
5. **Reveal puzzle** — fills entire board (ends game)
6. **Reset puzzle** — clears all user input, restarts timer (red text, destructive)

### 6. Keyboard Controls
```
1-9          → Enter digit (respects current mode)
Delete/Bksp  → Clear selected cell
Arrow keys   → Navigate grid
Ctrl+Z       → Undo
```

### 7. Timer
- Format: `M:SS` (e.g., `0:05`, `12:34`)
- Starts on new game
- Pause button shows full-board overlay: "Paused — click to resume"
- Stops on win
- Hidden if `showTimer` setting is off

### 8. Win Detection
- Triggered when all 81 cells filled
- Validates: `board[i] === solution[i]` for all i
- Shows modal with:
  - Checkmark icon
  - "Puzzle solved!" heading
  - Difficulty + time (e.g., "Easy · 3:21")
  - "Play next puzzle" button

---

## Puzzle Generation Algorithm

### Phase 1: Solved Grid Generation
```
1. Create empty 81-cell board
2. Backtracking solver with Fisher-Yates shuffle at EVERY recursive call
3. Ensures full randomness across all cells, not just first row
4. Returns complete valid 9×9 grid
```

### Phase 2: Clue Removal
```
1. Copy solved grid
2. Shuffle cell positions [0..80]
3. For each position:
   a. Remove clue (set to 0)
   b. Count solutions (stop at 2)
   c. If count !== 1: restore clue, skip
   d. If clue count <= target: stop
4. Return puzzle with unique solution
```

**Critical optimization:** `countSolutions` must stop at 2, not find all solutions. This keeps generation fast.

### Phase 3: Difficulty Classification
```
1. Count clues
2. Run constraint-based solver, track techniques used
3. Classify by hardest technique required:
   - Naked singles only → Easy
   - Hidden singles → Medium
   - Pairs/triples/advanced → Hard
4. Verify clue count matches technique level
5. If mismatch: regenerate
```

### Solver Techniques (in order of application)
1. **Naked singles** — cell has only 1 valid candidate
2. **Hidden singles** — digit can only go in 1 cell within a unit
3. **Naked pairs/triples** — N cells in unit contain exactly N candidates total
4. **Backtracking fallback** — MRV heuristic (pick cell with fewest candidates)

---

## Visual Design Specification

### Color Palette (CSS Variables)
```css
--bg: #fafaf8;              /* Main background */
--bg2: #f2f1ec;             /* Secondary background */
--bg3: #e8e6df;             /* Tertiary background */
--text: #1a1a18;            /* Primary text */
--text2: #5a5955;           /* Secondary text */
--text3: #9a9890;           /* Tertiary text */
--border: #d4d2cb;          /* Thin borders */
--border2: #b8b6ae;         /* Thick borders */
--cell-bg: #ffffff;         /* Empty cell background */
--cell-given: #f0efe9;      /* Given cell background */
--accent: #e8650a;          /* Primary accent (orange) */
--accent-light: #fef0e6;    /* Light accent */
--highlight-row: #f5f4ee;   /* Row/col highlight */
--highlight-box: #eceae2;   /* Box highlight */
--conflict: #fde8e8;        /* Conflict highlight */
--conflict-text: #c0392b;   /* Error text */
--selected: #fff3e8;        /* Selected cell bg */
--selected-border: #e8650a; /* Selected cell border */
--btn-bg: #f2f1ec;          /* Button background */
--btn-hover: #e8e6df;       /* Button hover */
--error: #e74c3c;           /* Error red */
--success: #27ae60;         /* Success green */
```

### Typography Scale
```css
/* Heading */
font-family: 'DM Serif Display', serif;
font-size: 32px;

/* Grid numbers */
font-family: 'DM Mono', monospace;
font-size: 20px;
font-weight: 500;

/* Candidate notes */
font-family: 'DM Mono', monospace;
font-size: 9px;

/* UI labels */
font-family: 'DM Mono', monospace;
font-size: 12-13px;
```

### Grid Dimensions
```
Grid: 432px × 432px
Cell: 48px × 48px (exactly square)
Cell border: 1px solid var(--border)
Box border: 2px solid var(--text)
Outer border: 2px solid var(--text)
```

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ [Sudoku]                          [Date]    │
│ [Easy|Medium|Hard] [Timer ⏸] [New] [⚙][•••]│
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐   ┌──────────────────┐   │
│  │             │   │ [Normal|Candidate]│   │
│  │   9×9 Grid  │   │                   │   │
│  │   432×432   │   │  [1] [2] [3]     │   │
│  │             │   │  [4] [5] [6]     │   │
│  │             │   │  [7] [8] [9]     │   │
│  │             │   │                   │   │
│  └─────────────┘   │  [✕ Clear]       │   │
│                     │  [↩ Undo]        │   │
│                     │  [ ] Auto cand.  │   │
│                     └──────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Data Structures & Algorithms

### Cell Indexing
```
Row-major order: index = row * 9 + col
Row from index: Math.floor(idx / 9)
Col from index: idx % 9
Box from index: Math.floor(row/3)*3 + Math.floor(col/3)
```

### Peer Calculation (O(1) lookup)
For any cell at index `idx`, peers are:
- Same row: `[row*9 .. row*9+8]` excluding idx
- Same col: `[col, col+9, col+18, ..., col+72]` excluding idx
- Same box: 9 cells in 3×3 box excluding idx

**Optimization:** Pre-compute peer sets at initialization, store in `peers[81]` array.

### Candidate Notes Storage
```javascript
notes = Array.from({ length: 81 }, () => new Set());
// notes[idx] = Set of integers 1-9
// Empty set = no notes
// Set operations: add(), delete(), has(), clear()
```

### Undo Stack Structure
```javascript
undoStack = [
  {
    board: int[81],
    notes: Set[81],
    errorCount: int,
    timerSec: int,
  },
  // ... more snapshots
]
```

**Critical:** Deep copy notes array (each Set must be cloned). Shallow copy will cause undo bugs.

### Complexity Targets
| Operation | Target | Actual |
|-----------|--------|--------|
| Render grid | O(81) = O(1) | 81 cell updates |
| Apply highlights | O(27) = O(1) | Max 27 peers |
| Enter number | O(27) | Update + peer check |
| Check win | O(81) = O(1) | Compare arrays |
| Generate Easy | O(n) | <50ms |
| Generate Hard | O(n²) | <500ms |

---

## Critical Invariants

### Game State
1. `board[i] === 0` OR `board[i] === solution[i]` (no wrong values stored, only displayed)
   - **Exception:** If `checkGuesses` is OFF, wrong values ARE stored in board
2. `given[i] !== 0` implies cell is immutable (cannot be edited)
3. `selected >= -1 && selected <= 80`
4. `notes[i].size === 0` if `board[i] !== 0` (no notes on filled cells)
5. Timer only runs when `!paused && !gameWon`

### Puzzle Generation
1. Every generated puzzle has exactly 1 solution
2. `given[i] === solution[i]` for all non-zero given cells
3. Solution satisfies all Sudoku constraints (rows, cols, boxes)
4. Clue count matches difficulty range
5. Technique classification matches difficulty

### UI Consistency
1. Exactly one cell selected at a time (or none)
2. Mode toggle reflects current `mode` state
3. Numpad buttons dim when digit count === 9
4. Settings apply immediately without game restart
5. Modals block interaction with game board

---

## Edge Cases & Error Handling

### Puzzle Generation Failures
- **Timeout:** If generation exceeds time budget, retry once with new seed
- **Classification mismatch:** Regenerate until clue count + technique agree
- **No solution:** Should never happen if backtracking is correct; log error if it does

### User Input Edge Cases
- **Clicking given cell:** Ignore, do not select
- **Entering number in given cell:** Ignore
- **Undo on empty stack:** Ignore, do not error
- **Keyboard nav at grid edge:** Wrap or stop at boundary
- **Pause during win modal:** Timer already stopped, ignore

### Performance Edge Cases
- **Rapid clicking:** Debounce or queue actions to prevent race conditions
- **Large undo stack:** Limit to last 100 actions to prevent memory bloat
- **Modal spam:** Disable open button while modal is visible

---

## Testing Checklist

### Puzzle Generation
- [ ] Easy puzzles have 36-40 clues
- [ ] Medium puzzles have 28-34 clues
- [ ] Hard puzzles have 22-27 clues
- [ ] All puzzles have unique solutions
- [ ] `validatePuzzle()` passes for 100 generated puzzles per difficulty
- [ ] Generation completes within time budget 95% of the time

### Game Mechanics
- [ ] Timer starts on new game
- [ ] Timer pauses/resumes correctly
- [ ] Timer stops on win
- [ ] Undo reverts every action type (fill, note, clear)
- [ ] Undo stack does not corrupt on rapid undo
- [ ] Win modal appears only when puzzle is 100% correct
- [ ] "Play next puzzle" loads new puzzle at same difficulty

### Input Modes
- [ ] Normal mode fills cells
- [ ] Candidate mode toggles notes
- [ ] Auto-candidate removes notes from peers
- [ ] Keyboard input respects current mode
- [ ] Mode toggle updates button styles

### Highlighting
- [ ] All 5 highlight types apply correctly
- [ ] Highlights update immediately on cell selection
- [ ] Disabling a highlight setting removes it in real-time
- [ ] No visual glitches when multiple highlights overlap

### Settings
- [ ] All 8 settings toggle correctly
- [ ] Settings persist across games (localStorage)
- [ ] "Check guesses" marks wrong entries red
- [ ] "Show timer" hides/shows timer
- [ ] Error counter increments on wrong entry (if enabled)

### Menu Actions
- [ ] Hint reveals a random unfilled cell
- [ ] Check cell shows green/red outline
- [ ] Check puzzle counts errors correctly
- [ ] Reveal cell fills selected cell
- [ ] Reveal puzzle fills entire board
- [ ] Reset puzzle clears user input and restarts timer

### Keyboard Controls
- [ ] Arrow keys navigate grid
- [ ] 1-9 keys enter digits
- [ ] Delete/Backspace clears cell
- [ ] Ctrl+Z undoes
- [ ] Tab does not break focus

### Visual Consistency
- [ ] Grid is exactly square
- [ ] Box borders are 2px, cell borders are 1px
- [ ] Given cells have distinct background
- [ ] Wrong cells (if check mode on) are red
- [ ] Numpad buttons dim when digit count === 9
- [ ] Modals center correctly
- [ ] No layout shift on modal open/close

---

## Performance Benchmarks

### Target Metrics
```
First paint: <100ms
Grid render: <16ms (60fps)
Highlight update: <8ms
Undo action: <5ms
Easy generation: <50ms
Medium generation: <200ms
Hard generation: <500ms
```

### Optimization Strategies
1. **Pre-compute peer sets** — calculate once at init, reuse
2. **Batch DOM updates** — use DocumentFragment or innerHTML
3. **CSS for highlights** — add/remove classes, not inline styles
4. **Debounce rapid input** — prevent double-clicks
5. **Lazy modal rendering** — create on first open, reuse
6. **Generator in worker** — offload to Web Worker if >500ms (future enhancement)

---

## Future Enhancements (Out of Scope for V1)

### Gameplay
- [ ] Daily puzzle mode (seeded by date)
- [ ] Streak tracking
- [ ] Personal best times per difficulty
- [ ] Mistake limit mode (3 strikes)
- [ ] Pencil/pen mode (permanent vs temporary marks)

### Generation
- [ ] Symmetry patterns (rotational, reflective)
- [ ] Minimal clue puzzles (17-clue challenge)
- [ ] Custom difficulty (user sets clue count)
- [ ] Puzzle import/export (string format)

### UI/UX
- [ ] Dark mode
- [ ] Color themes
- [ ] Animations (cell fill, win celebration)
- [ ] Sound effects (optional)
- [ ] Mobile touch gestures
- [ ] Responsive layout (tablet, phone)

### Technical
- [ ] Web Worker for generation
- [ ] IndexedDB for puzzle history
- [ ] Service Worker for offline play
- [ ] PWA manifest
- [ ] Share puzzle (URL with encoded state)

---

## File Structure (Single HTML File)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sudoku</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Serif+Display&display=swap" rel="stylesheet">
  <style>
    /* CSS variables */
    /* Reset & base styles */
    /* Layout */
    /* Grid */
    /* Numpad */
    /* Modals */
    /* Buttons */
    /* Highlights */
  </style>
</head>
<body>
  <!-- Header -->
  <!-- Controls (tabs, timer, buttons) -->
  <!-- Main layout (grid + numpad) -->
  <!-- Modals (settings, menu, win) -->

  <script>
    // ===== SUDOKU GENERATOR MODULE =====
    const SudokuGenerator = (() => {
      // Private helpers
      // Public API
    })();

    // ===== GAME STATE =====
    let board, given, solution, notes, selected, mode, undoStack, timerSec, paused, errorCount, settings;

    // ===== CORE FUNCTIONS =====
    function newGame(difficulty) { }
    function renderGrid() { }
    function selectCell(idx) { }
    function applyHighlights() { }
    function enterNumber(n) { }
    function clearCell() { }
    function undoAction() { }
    function checkWin() { }
    function startTimer() { }
    function stopTimer() { }
    function togglePause() { }
    function getHint() { }
    function checkCell() { }
    function checkPuzzle() { }
    function revealCell() { }
    function revealPuzzle() { }
    function resetPuzzle() { }
    function showModal(id) { }
    function hideModal(id) { }
    function saveSetting(key, val) { }

    // ===== EVENT LISTENERS =====
    // Grid clicks
    // Numpad clicks
    // Keyboard input
    // Modal interactions
    // Settings toggles

    // ===== INITIALIZATION =====
    document.addEventListener('DOMContentLoaded', () => {
      // Load settings from localStorage
      // Initialize first game
    });
  </script>
</body>
</html>
```

---

## Code Style Guidelines

### Naming Conventions
```javascript
// Variables: camelCase
let selectedCell, timerInterval, undoStack;

// Constants: UPPER_SNAKE_CASE
const GRID_SIZE = 9;
const CELL_COUNT = 81;

// Functions: camelCase, verb-first
function renderGrid() { }
function hasConflict(idx) { }
function getPeers(idx) { }

// CSS classes: kebab-case
.cell-given, .cell-selected, .highlight-row
```

### Comment Style
```javascript
// Single-line for brief explanations
let board = Array(81).fill(0); // Row-major order

/**
 * Multi-line for complex functions
 * @param {number} idx - Cell index (0-80)
 * @param {number} val - Digit to place (1-9)
 * @returns {boolean} - True if valid placement
 */
function isValid(idx, val) { }

// DSA ANALYSIS (required for complex logic)
// Input size: 81 cells (constant)
// Operation: peer lookup
// Chosen: pre-computed array — O(1) lookup
// Rejected: calculate on-demand — O(27) per lookup
```

### Error Handling
```javascript
// Fail loudly on critical errors
if (!solution) {
  console.error('Puzzle generation failed');
  alert('Failed to generate puzzle. Please try again.');
  return;
}

// Silent fallback for non-critical
const savedSettings = localStorage.getItem('settings');
settings = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
```

---

## Glossary

**Given** — Pre-filled cell in the initial puzzle (immutable)  
**Candidate** — Possible digit for an empty cell (pencil mark)  
**Peer** — Cell in same row, column, or 3×3 box  
**Naked single** — Cell with only one valid candidate  
**Hidden single** — Digit that can only go in one cell within a unit  
**Naked pair** — Two cells in a unit that together contain exactly 2 candidates  
**Unit** — Row, column, or 3×3 box  
**Clue** — Same as "given"  
**Box** — One of nine 3×3 sub-grids  
**MRV** — Minimum Remaining Values (heuristic for backtracking)  
**Constraint propagation** — Iteratively eliminating impossible candidates  
**Unique solution** — Puzzle has exactly one valid completion  

---

## References & Resources

### Sudoku Theory
- [Sudoku solving techniques](https://www.sudokuwiki.org/sudoku.htm)
- [Minimum clue count (17)](https://arxiv.org/abs/1201.0749)
- [Difficulty grading](https://www.sudokuwiki.org/Sudoku_Creation_and_Grading.pdf)

### Algorithm Design
- [Backtracking algorithm](https://en.wikipedia.org/wiki/Sudoku_solving_algorithms#Backtracking)
- [Constraint satisfaction](https://en.wikipedia.org/wiki/Constraint_satisfaction_problem)
- [Dancing Links (DLX)](https://arxiv.org/abs/cs/0011047) — advanced, not used in V1

### UI/UX Inspiration
- [NYT Games Sudoku](https://www.nytimes.com/puzzles/sudoku)
- [Cracking the Cryptic](https://www.youtube.com/c/CrackingTheCryptic)

---

## Changelog

**2026-01-04** — Initial Memory Bank created  
- Documented all requirements from master build prompt
- Defined architecture, algorithms, and data structures
- Established testing checklist and performance benchmarks
- Created glossary and reference section

---

## Contact & Maintenance

**Project Owner:** [Your Name]  
**Last Updated:** 2026-01-04  
**Status:** Active Development  

For questions or updates, refer to this Memory Bank as the single source of truth for project requirements and design decisions.
