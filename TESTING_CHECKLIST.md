# Reversi WASM - Testing Checklist

## ✅ Build Status

- [x] Rust code compiles without errors
- [x] WASM package generated successfully
- [x] All frontend files present (index.html, style.css, script.js)
- [x] Sound files available (15 audio files in sounds/)
- [x] JavaScript encoding updated (u8 constants instead of 'B'/'W')

## 🎮 Game Logic Testing

### New Game Initialization
- [ ] Click "New Game" button
- [ ] Verify 4 disks in center: Black D5, E4 / White D4, E5
- [ ] Score should show: Black 2, White 2
- [ ] Verify board colors are correct (Black ●, White ○)

### Player Movement
- [ ] Click on a legal move cell
- [ ] Disk placement animates and sound plays
- [ ] Flipped opponent disks animate and change color
- [ ] Score updates correctly
- [ ] Turn switches to opponent

### Legal Move Highlighting  
- [ ] Legal moves show as white dots
- [ ] Only valid moves are marked
- [ ] Illegal moves are blocked with sound effect
- [ ] Legal moves list updates in right panel

### Pass Turn
- [ ] When player has no legal moves, "Pass" button activates
- [ ] Clicking "Pass" switches to opponent without placing disk
- [ ] Audio plays for pass event
- [ ] Status updates: "Opponent's turn"

### Game End Detection
- [ ] Game ends when neither player can move
- [ ] Final score displays correctly
- [ ] Winner announcement is accurate
- [ ] Game cannot continue after completion

## 🤖 AI Opponents Testing

### Alpha-Beta Player
- [ ] Create new game as White (Black plays first)
- [ ] Verify AI makes a move quickly
- [ ] AI moves are legal
- [ ] Can change difficulty (1-8) and observe speed change
- [ ] Higher difficulty = longer thinking time

### Minimax Player
- [ ] Switch to Minimax in settings
- [ ] Verify AI makes moves (should be similar in strength)
- [ ] Can adjust difficulty level
- [ ] Validate move legality

### AI vs Hint Button
- [ ] Click "Hint" when it's your turn
- [ ] Hint suggests a legal move
- [ ] Hint move is highlighted on board
- [ ] Hint doesn't auto-execute the move

## 🎵 Audio System Testing

### Sound Playback
- [ ] Disk placement plays audio
- [ ] Move sequences play with multiple sounds
- [ ] Pass turn has unique sound
- [ ] Invalid move plays error sound
- [ ] All sounds complete without cutting off

### Spatial Audio (Advanced)
- [ ] Moves in top row sound higher pitched
- [ ] Moves in bottom row sound lower pitched
- [ ] Moves on left side sound panned left
- [ ] Moves on right side sound panned right
- [ ] Corner moves (A1, H8) have distinct pitch/pan

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Arrow keys move focus around board
- [ ] Visual highlight shows selected cell
- [ ] Enter key places disk (same as clicking)
- [ ] Space key passes turn
- [ ] Tab focuses buttons in order

### Screen Reader Support
- [ ] Alt+A announces current score
- [ ] Alt+M announces legal moves
- [ ] Status updates are spoken by screen reader
- [ ] Game over message reads clearly
- [ ] All buttons have descriptive labels

### Visual Contrast
- [ ] Green board is high contrast with white/black disks
- [ ] Focused cell has yellow outline (visible)
- [ ] Legal moves show as white dots (clear)
- [ ] Text is readable on all backgrounds
- [ ] Color not the only distinguishing factor

## 📱 Responsive Design Testing

### Desktop (1920x1080)
- [ ] Full layout with sidebar on left
- [ ] Board centered in main area
- [ ] Score panel visible on right
- [ ] All buttons accessible

### Tablet (768x1024)
- [ ] Layout stacks vertically when narrow
- [ ] Touch targets are large enough (44px minimum)
- [ ] Board remains playable with keyboard
- [ ] Text doesn't overflow

### Mobile (375x667)
- [ ] Single column layout
- [ ] Board scales to fill viewport
- [ ] Buttons stack vertically
- [ ] Can play full game without scrolling much
- [ ] Touch interactions work smoothly

## 🐛 Edge Cases Testing

### Multiple Passes
- [ ] Both players have no moves (game ends)
- [ ] Undo after pass returns correct state
- [ ] Multiple disks flip in single move
- [ ] Chain flips across entire board work

### Undo Functionality
- [ ] "Undo" button disabled at game start
- [ ] After move, undo restores previous board
- [ ] Multiple undos work sequentially
- [ ] After undo, can replay differently

### Difficulty Levels
- [ ] Difficulty 1 = quick moves
- [ ] Difficulty 4 = noticeable delay
- [ ] Difficulty 8 = significant thinking time
- [ ] Slider updates shown in real-time

## 🔧 Performance Testing

### Build Time
- [ ] `wasm-pack build --target web --release` completes in < 1 second
- [ ] No compilation errors or warnings (except unused set_panic_hook in utils.rs)

### Runtime Performance
- [ ] New game starts instantly (< 100ms)
- [ ] AI move generation smooth (no UI freeze)
- [ ] Board updates without lag
- [ ] Multiple games can be played in sequence without slowdown
- [ ] Memory usage stable (no leaks)

### WASM Size
- [ ] reversi_wasm.js ~14-15 KB
- [ ] reversi_wasm_bg.wasm ~28-30 KB (uncompressed)
- [ ] Total with gzip ~8-10 KB
- [ ] Loads quickly on slow connections

## 🔄 Cross-Browser Testing

- [ ] Chrome/Edge (WASM supported)
- [ ] Firefox (WASM supported)
- [ ] Safari (WASM supported)
- [ ] Mobile Safari iOS (test on iPhone/iPad)
- [ ] Chrome Mobile Android

## 🎯 Full Game Scenarios

### Scenario 1: Human vs Alpha-Beta Easy
1. [ ] New game, Human = Black, AI = Alpha-Beta (difficulty 2)
2. [ ] Play several moves
3. [ ] Let game reach completion
4. [ ] Verify final score announcement

### Scenario 2: Human vs Minimax Hard
1. [ ] New game, Human = White, AI = Minimax (difficulty 8)
2. [ ] Play through full game
3. [ ] Verify AI doesn't make obviously bad moves
4. [ ] Check game ends correctly

### Scenario 3: Keyboard-Only Play
1. [ ] Play entire game using only keyboard
2. [ ] No mouse required
3. [ ] Screen reader can follow game
4. [ ] All information accessible

### Scenario 4: Multiple Games in Sequence
1. [ ] Play game to completion
2. [ ] Click "New Game"
3. [ ] Play another game
4. [ ] Verify no state carries over
5. [ ] Repeat 3+ times

## 📋 Browser Console Checks

Open browser DevTools (F12) and check:
- [ ] No JavaScript errors in Console
- [ ] No WASM instantiation errors
- [ ] Web Audio API initialized successfully
- [ ] All fetch requests for sounds succeed (status 200)
- [ ] No deprecated API warnings

## 🚀 Deployment Checklist

- [ ] All files committed to git
- [ ] Cargo.toml has correct metadata
- [ ] README.md updated with instructions
- [ ] WASM_GUIDE.md created with detailed info
- [ ] pkg/ directory is auto-generated (not committed)
- [ ] .gitignore excludes build artifacts
- [ ] License files present (MIT + Apache-2.0)

## 🎊 Final Sign-Off

**Ready for production when:**
- [ ] All mandatory tests pass
- [ ] All game scenarios complete successfully
- [ ] No console errors
- [ ] Accessibility verified with screen reader
- [ ] Performance acceptable (< 500ms for depth 8 AI move)
- [ ] Builds successfully with `wasm-pack build --target web --release`

---

**Test Date:** _______________  
**Tester:** _______________  
**Status:** _______________
