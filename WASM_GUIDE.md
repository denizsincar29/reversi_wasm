# Reversi / Othello - WebAssembly Edition

A fast, beautiful, accessible Reversi game built with Rust + WebAssembly.

## Features

- **Pure Rust/WASM** - No Python, no Gradio, no external dependencies (except sound files)
- **Beautiful UI** - Chess-board style with accessibility first
- **Fully Accessible** - Screen reader support, keyboard navigation (arrow keys, Enter, Space)
- **Excellent AI** - Alpha-Beta pruning and Minimax algorithms with adjustable depth
- **High Performance** - u8-optimized board representation for fast alpha-beta search
- **Audio Feedback** - Spatial audio with pitch-based row positioning and stereo panning by column
- **Responsive Design** - Works on desktop, tablet, and mobile

## Running Locally

### Option 1: Quick Start with Python HTTP Server

```bash
cd /path/to/reversi_wasm
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Option 2: Node.js HTTP Server

```bash
cd /path/to/reversi_wasm
npx http-server
```

### Option 3: VS Code Live Server

1. Install the "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

## How to Play

1. **Select your color** - Black goes first
2. **Choose AI opponent** - Alpha-Beta (faster) or Minimax
3. **Adjust difficulty** - Higher depth = stronger AI (1-8)
4. **Click cells** or use arrow keys + Enter to play

### Keyboard Controls

- **Arrow Keys** - Navigate the board
- **Enter** - Play at selected cell
- **Space** - Pass turn (if no legal moves)
- **Alt+A** - Announce score
- **Alt+M** - Announce legal moves
- **AI Hint** - Get a suggestion from the AI

## Game Rules

Reversi is played on an 8×8 board. Players take turns placing disks:

- **Black** plays first
- **Legal moves** flip opponent disks in straight lines (horizontal, vertical, diagonal)
- **Must flip at least one disk** to make a legal move
- **Pass** if you have no legal moves
- **Game ends** when neither player can move
- **Winner** has the most disks on the board

## Building from Source

### Requirements

- Rust 1.56+ with `wasm32-unknown-unknown` target
- `wasm-pack`
- Python/Node.js (for local server)

### Build

```bash
# Install wasm-pack if needed
curl https://rustwasm.org/wasm-pack/installer/init.sh -sSf | sh

# Build optimized WASM
wasm-pack build --target web --release

# Serve and open in browser
python -m http.server 8000
```

## Performance Optimizations

### Board Representation
- **u8 encoding** (0=empty, 1=black, 2=white)
- **64 bytes per board** (vs 256 for u32)
- **4x faster copying** in alpha-beta recursion

### Algorithm
- **Alpha-Beta Pruning** - Eliminates impossible branches
- **Heuristic Scoring** - Disc count + mobility + corner control
- **Move Ordering** - Pruned branches reduce search space

### Audio
- **Pitch by row** - BASE_FREQ (16000 Hz) + row × 1000 Hz
- **Stereo pan by column** - Column position mapped to left-right pan
- **Spatial cues** - Same audio encoding as original Python version

## File Structure

```
reversi_wasm/
├── src/
│   ├── board.rs           # Board state & game logic
│   ├── ai_utils.rs        # Shared AI utilities
│   ├── alpha_beta.rs      # Alpha-Beta player
│   ├── minimax.rs         # Minimax player
│   └── lib.rs             # WASM module exports
├── index.html             # Game UI
├── style.css              # Styling & responsive design
├── script.js              # Frontend & event handling
├── sounds/                # Audio files
└── pkg/                   # Compiled WASM (auto-generated)
```

## Audio Files

Place these in `sounds/` directory (from the original Python project):
- `disk.wav` - Disk placement
- `black.wav` - Black disk flip
- `white.wav` - White disk flip
- `pass.wav` - Pass turn
- `error.wav` - Invalid move

## Accessibility

- **Screen reader support** with aria-live regions
- **Keyboard-only navigation** - No mouse required
- **High contrast colors** - Dark green board, clear disk markers
- **Semantic HTML** - Proper landmarks and headings
- **Alt text** - All interactive elements labeled

## Architecture

### Rust/WASM Side
- **Board struct** - Immutable board cloning for search
- **Legal moves** - Direction-based flipping logic
- **AI engines** - Recursive minimax with alpha-beta pruning
- **Heuristic** - Weighted scoring function

### JavaScript Side
- **WASM loader** - Dynamic ES6 import
- **Audio engine** - Web Audio API with spatial panning
- **UI controller** - Event handling and screen updates
- **Game loop** - Turn-based with AI thinking simulation

## Known Limitations

- AI depth limited to 8 (depth search is exponential)
- No game saving/loading (stateless design)
- No network multiplayer (single client only)
- Board audio requires Web Audio API support

## Future Enhancements

- [ ] Game history & undo optimization
- [ ] Opening book for strong early game play
- [ ] Transposition table for memoization
- [ ] Iterative deepening for better time management
- [ ] Endgame solver for perfect play
- [ ] Network multiplayer (WebSocket)

## License

Dual licensed under MIT and Apache-2.0.

---

**Built with:** Rust • WebAssembly • Web Audio API • Accessible HTML/CSS/JS

**Original Python version:** https://github.com/denizsincar29/reversi_wasm (the-pythoneon folder)
