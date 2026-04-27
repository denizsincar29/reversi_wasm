const SIZE = 8;

// Player encoding (must match Rust)
const PLAYER = {
    EMPTY: 0,
    BLACK: 1,
    WHITE: 2
};

// Convert player number to display
function playerToDisplay(p) {
    switch(p) {
        case PLAYER.BLACK: return 'B';
        case PLAYER.WHITE: return 'W';
        default: return '.';
    }
}

// Reverse
function displayToPlayer(c) {
    switch(c) {
        case 'B': return PLAYER.BLACK;
        case 'W': return PLAYER.WHITE;
        default: return PLAYER.EMPTY;
    }
}

// Import Phrases
import { PHRASES } from './phrases.js';

// Import WASM module
import init, { Board, AlphaBetaPlayer, MinimaxPlayer } from './reversi_wasm.js';

// Audio configuration
const AUDIO_CONFIG = {
    BASE_FREQ: 16000,
    STEP: 1000,
    DEFAULT_SAMPLE_RATE: 22050,
    sounds: ['disk.wav', 'white.wav', 'black.wav', 'error.wav', 'pass.wav']
};

// Game State
let wasm = null;

// Initialize WASM and start game when ready
function startGameWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGame);
    } else {
        initializeGame();
    }
}

init().then(() => {
    wasm = { Board, AlphaBetaPlayer, MinimaxPlayer };
    console.log('WASM loaded successfully');
    startGameWhenReady();
}).catch(err => {
    console.error('Failed to load WASM:', err);
});

let gameState = {
    board: null,
    turn: PLAYER.BLACK,
    humanColor: PLAYER.BLACK,
    aiType: 'alphabeta',
    aiDepth: 3,
    aiMode: 'pve',
    moveHistory: [],
    selectedCell: null,
    isAIThinking: false,
};

// Audio Engine
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.buffers = {};
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            if (this.ctx && this.ctx.state === 'closed') {
                this.ctx = null;
            }

            if (this.ctx) {
                if (this.ctx.state === 'suspended') {
                    await this.ctx.resume().catch(() => {});
                }
                return;
            }

            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            if (this.ctx.state === 'suspended') {
                await this.ctx.resume().catch(() => {});
            }

            // Load audio files
            const soundPromises = AUDIO_CONFIG.sounds.map(sound => this.loadSound(sound));
            await Promise.all(soundPromises);
        })();

        return this.initPromise;
    }

    async loadSound(soundName) {
        try {
            const url = `sounds/${soundName}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${soundName}`);
            const arrayBuffer = await response.arrayBuffer();
            this.buffers[soundName] = await this.ctx.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.warn(`Could not load sound ${soundName}:`, error);
        }
    }

    async play(soundName, r = undefined, c = undefined) {
        try {
            await this.init();

            if (!this.ctx || !this.buffers[soundName]) {
                console.warn(`Cannot play ${soundName}: context or buffer missing`);
                return;
            }

            if (this.ctx.state === 'suspended') {
                await this.ctx.resume().catch(() => {});
            }

            if (this.ctx.state !== 'running') return;

            const source = this.ctx.createBufferSource();
            source.buffer = this.buffers[soundName];

            // Adjust pitch based on row
            if (r !== undefined) {
                const targetFreq = AUDIO_CONFIG.BASE_FREQ + r * AUDIO_CONFIG.STEP;
                source.playbackRate.value = targetFreq / AUDIO_CONFIG.DEFAULT_SAMPLE_RATE;
            }

            // Adjust pan based on column
            const panner = this.ctx.createStereoPanner();
            if (c !== undefined) {
                panner.pan.value = (2 * c / 7) - 1.0;
            } else {
                panner.pan.value = 0;
            }

            source.connect(panner).connect(this.ctx.destination);
            source.start();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    async playMoveSequence(player, r, c, flippedIndices) {
        await this.play('disk.wav', r, c);
        const sound = player === PLAYER.WHITE ? 'white.wav' : 'black.wav';

        for (const idx of flippedIndices) {
            const fr = Math.floor(idx / SIZE);
            const fc = idx % SIZE;
            await new Promise(resolve => setTimeout(resolve, 120));
            await this.play(sound, fr, fc);
        }
    }
}

const audioEngine = new AudioEngine();

// Screen Reader Announcements
function announce(message) {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
        announcer.textContent = message;
    }
}

// Initialize WASM and UI
async function initializeGame() {
    try {
        gameState.board = new wasm.Board();
        
        setupBoard();
        setupEventListeners();
        updateUI();
        const colorName = gameState.humanColor === PLAYER.BLACK ? 'Black' : 'White';
        announce(`Game initialized. You are playing as ${colorName}`);
        
        if (gameState.humanColor === PLAYER.WHITE) {
            await makeAIMove();
        }
    } catch (error) {
        console.error('Failed to initialize WASM:', error);
        announce('Error loading game. Please refresh the page.');
    }
}

// Setup Board HTML
function setupBoard() {
    const boardContainer = document.getElementById('board-container');
    boardContainer.innerHTML = '';

    // Column labels top
    const topRow = document.createElement('div');
    topRow.className = 'board-label';
    boardContainer.appendChild(topRow);

    for (let c = 0; c < SIZE; c++) {
        const label = document.createElement('div');
        label.className = 'board-label';
        label.textContent = String.fromCharCode(65 + c);
        boardContainer.appendChild(label);
    }

    const topRight = document.createElement('div');
    topRight.className = 'board-label';
    boardContainer.appendChild(topRight);

    // Board cells with row labels
    for (let r = 0; r < SIZE; r++) {
        const leftLabel = document.createElement('div');
        leftLabel.className = 'board-label';
        leftLabel.textContent = (r + 1).toString();
        boardContainer.appendChild(leftLabel);

        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('button');
            cell.className = 'board-cell';
            cell.id = `cell-${r}-${c}`;
            cell.setAttribute('aria-label', `${String.fromCharCode(65 + c)}${r + 1}`);
            cell.setAttribute('data-row', r);
            cell.setAttribute('data-col', c);
            cell.addEventListener('click', () => handleCellClick(r, c));
            boardContainer.appendChild(cell);
        }

        const rightLabel = document.createElement('div');
        rightLabel.className = 'board-label';
        rightLabel.textContent = (r + 1).toString();
        boardContainer.appendChild(rightLabel);
    }

    // Column labels bottom
    const bottomLeft = document.createElement('div');
    bottomLeft.className = 'board-label';
    boardContainer.appendChild(bottomLeft);

    for (let c = 0; c < SIZE; c++) {
        const label = document.createElement('div');
        label.className = 'board-label';
        label.textContent = String.fromCharCode(65 + c);
        boardContainer.appendChild(label);
    }

    const bottomRight = document.createElement('div');
    bottomRight.className = 'board-label';
    boardContainer.appendChild(bottomRight);
}

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);
    document.getElementById('hint-btn').addEventListener('click', getHint);
    document.getElementById('pass-btn').addEventListener('click', passTurn);
    document.getElementById('undo-btn').addEventListener('click', undoMove);

    document.querySelectorAll('input[name="human-color"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            gameState.humanColor = e.target.value === 'B' ? PLAYER.BLACK : PLAYER.WHITE;
        });
    });

    document.querySelectorAll('input[name="ai-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            gameState.aiType = e.target.value;
        });
    });

    document.querySelectorAll('input[name="game-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            gameState.aiMode = e.target.value;
        });
    });

    document.getElementById('ai-depth').addEventListener('change', (e) => {
        gameState.aiDepth = parseInt(e.target.value);
        document.getElementById('depth-display').textContent = e.target.value;
    });

    // Keyboard Navigation
    document.addEventListener('keydown', handleKeyboard);
}

// Handle Keyboard Events
function handleKeyboard(event) {
    if (gameState.isAIThinking) return;

    const cell = document.querySelector('.board-cell.selected');
    let r = 0, c = 0;

    if (cell) {
        r = parseInt(cell.dataset.row);
        c = parseInt(cell.dataset.col);
    }

    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            r = Math.max(0, r - 1);
            selectCell(r, c);
            break;
        case 'ArrowDown':
            event.preventDefault();
            r = Math.min(SIZE - 1, r + 1);
            selectCell(r, c);
            break;
        case 'ArrowLeft':
            event.preventDefault();
            c = Math.max(0, c - 1);
            selectCell(r, c);
            break;
        case 'ArrowRight':
            event.preventDefault();
            c = Math.min(SIZE - 1, c + 1);
            selectCell(r, c);
            break;
        case 'Enter':
            event.preventDefault();
            handleCellClick(r, c);
            break;
        case ' ':
            event.preventDefault();
            passTurn();
            break;
        case 'a':
        case 'A':
            if (event.altKey) {
                event.preventDefault();
                announceScore();
            }
            break;
        case 'm':
        case 'M':
            if (event.altKey) {
                event.preventDefault();
                announceLegalMoves();
            }
            break;
    }
}

// Select and focus cell
function selectCell(r, c) {
    document.querySelectorAll('.board-cell').forEach(cell => {
        cell.classList.remove('selected');
    });

    const cell = document.getElementById(`cell-${r}-${c}`);
    if (cell) {
        cell.classList.add('selected');
        cell.focus();
    }
}

// Handle Cell Click
async function handleCellClick(r, c) {
    if (gameState.aiMode === 'eve') {
        announce('AI vs AI mode is active.');
        return;
    }
    if (gameState.isAIThinking || gameState.board.get_turn() !== gameState.humanColor) {
        announce('It\'s not your turn.');
        return;
    }

    const legalMoves = gameState.board.get_legal_moves_js(gameState.humanColor);
    const moveIndex = r * SIZE + c;

    if (!legalMoves.includes(moveIndex)) {
        await audioEngine.play('error.wav');
        announce(`Invalid move at ${String.fromCharCode(65 + c)}${r + 1}`);
        return;
    }

    // Make the move
    const moveResult = gameState.board.apply_move_js(gameState.humanColor, r, c);
    const flippedIndices = moveResult.flipped_indices;
    gameState.board = moveResult.board;
    gameState.moveHistory.push(gameState.board);

    // Play move sequence
    await audioEngine.playMoveSequence(gameState.humanColor, r, c, flippedIndices);

    // Announce move
    const coord = String.fromCharCode(65 + c) + (r + 1);
    const playerName = gameState.humanColor === PLAYER.BLACK ? 'black' : 'white';
    announce(PHRASES.announcements.playerMove(coord, playerName, flippedIndices.length));

    // Comment on move quality
    const evaluation = moveResult.score;
    let qualityPhrases;
    if (evaluation > 20) qualityPhrases = PHRASES.quality.excellent;
    else if (evaluation > 5) qualityPhrases = PHRASES.quality.good;
    else if (evaluation > -5) qualityPhrases = PHRASES.quality.fair;
    else if (evaluation > -20) qualityPhrases = PHRASES.quality.bad;
    else qualityPhrases = PHRASES.quality.blunder;

    const comment = qualityPhrases[Math.floor(Math.random() * qualityPhrases.length)];
    setTimeout(() => announce(comment), 1500);

    updateUI();

    // Check if game is over
    if (gameState.board.check_is_terminal()) {
        announceGameOver();
        return;
    }

    // AI Turn
    if (gameState.board.get_turn() !== gameState.humanColor) {
        await makeAIMove();
    }
}

// Make AI Move
async function makeAIMove() {
    gameState.isAIThinking = true;

    // Pick a random thinking phrase
    const thinkingPhrase = PHRASES.thinking[Math.floor(Math.random() * PHRASES.thinking.length)];
    announce(thinkingPhrase);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const grid = gameState.board.get_grid();
    const player = gameState.board.get_turn();
    const legalMoves = gameState.board.get_legal_moves_js(player);

    if (legalMoves.length === 0) {
        // Pass
        gameState.board.set_turn(gameState.board.other_js(player));
        await audioEngine.play('pass.wav');
        announce(PHRASES.announcements.pass(player === PLAYER.BLACK ? 'Black' : 'White'));
        gameState.isAIThinking = false;
        updateUI();
        return;
    }

    // Get AI move
    let aiMoveObj = null;
    try {
        if (gameState.aiType === 'alphabeta') {
            const ai = new wasm.AlphaBetaPlayer(gameState.aiDepth);
            aiMoveObj = ai.choose_move(grid, player);
        } else {
            const ai = new wasm.MinimaxPlayer(gameState.aiDepth);
            aiMoveObj = ai.choose_move(grid, player);
        }
    } catch (error) {
        console.error('AI Error:', error);
        aiMoveObj = { cell_index: legalMoves[0], score: 0 };
    }

    let aiMove = aiMoveObj.cell_index;
    if (aiMove < 0 || aiMove >= 64) {
        aiMove = legalMoves[0];
    }

    const r = Math.floor(aiMove / SIZE);
    const c = aiMove % SIZE;

    // Apply move
    const moveResult = gameState.board.apply_move_js(player, r, c);
    const flippedIndices = moveResult.flipped_indices;
    gameState.board = moveResult.board;
    gameState.moveHistory.push(gameState.board);

    // Play move sequence
    await audioEngine.playMoveSequence(player, r, c, flippedIndices);

    // Announce move
    const coord = String.fromCharCode(65 + c) + (r + 1);
    const playerName = player === PLAYER.BLACK ? 'black' : 'white';

    // Determine perspective
    if (gameState.aiMode === 'eve') {
        const name = player === PLAYER.BLACK ? 'Black AI' : 'White AI';
        announce(PHRASES.announcements.aiMoveThirdPerson(name, coord, playerName, flippedIndices.length));
    } else {
        announce(PHRASES.announcements.aiMoveFirstPerson(coord, playerName, flippedIndices.length));
    }

    updateUI();

    // Check if game is over
    if (gameState.board.check_is_terminal()) {
        announceGameOver();
        gameState.isAIThinking = false;
        return;
    }

    // Check next move
    const nextPlayer = gameState.board.get_turn();
    if (gameState.aiMode === 'eve' || nextPlayer !== gameState.humanColor) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await makeAIMove();
    }

    gameState.isAIThinking = false;
}

// Update UI
function updateUI() {
    const grid = gameState.board.get_grid();
    const legalMoves = gameState.board.get_legal_moves_js(gameState.board.get_turn());

    // Update board cells
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            const idx = r * SIZE + c;
            const piece = grid[idx];

            // Update ARIA label
            const coord = `${String.fromCharCode(65 + c)}${r + 1}`;
            const pieceName = piece === PLAYER.BLACK ? ' black' : (piece === PLAYER.WHITE ? ' white' : '');
            cell.setAttribute('aria-label', `${coord}${pieceName}`);

            // Remove old disks
            const oldDisk = cell.querySelector('.disk');
            if (oldDisk) oldDisk.remove();

            // Add new disk
            if (piece !== PLAYER.EMPTY) {
                const disk = document.createElement('div');
                const isBlack = piece === PLAYER.BLACK;
                disk.className = `disk ${isBlack ? 'black' : 'white'}`;
                disk.textContent = isBlack ? '●' : '○';
                cell.appendChild(disk);
            }

            // Mark legal moves
            cell.classList.toggle('legal-move', legalMoves.includes(idx));
        }
    }

    // Update status
    const status = document.getElementById('status');
    const turn = gameState.board.get_turn();
    const turnText = turn === PLAYER.BLACK ? 'Black' : 'White';
    const yourText = turn === gameState.humanColor ? ' (Your turn)' : ' (AI)';
    status.textContent = `${turnText}'s turn${yourText}`;

    // Update score
    const blackCount = gameState.board.get_count(PLAYER.BLACK);
    const whiteCount = gameState.board.get_count(PLAYER.WHITE);
    const scoreContent = document.getElementById('score-content');
    scoreContent.innerHTML = `
        <span class="black-count">${blackCount}</span>
        <span class="white-count">${whiteCount}</span>
    `;

    // Update legal moves
    const movesText = legalMoves.length === 0 ? 'None' : legalMoves.map(idx => {
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        return String.fromCharCode(65 + c) + (r + 1);
    }).join(', ');
    document.getElementById('moves-content').textContent = movesText;

    // Update button states
    document.getElementById('pass-btn').disabled = legalMoves.length > 0 || gameState.board.get_turn() !== gameState.humanColor || gameState.aiMode === 'eve';
}

// Game Control Functions
async function startNewGame() {
    gameState.board = new wasm.Board();
    gameState.moveHistory = [];
    gameState.turn = PLAYER.BLACK;
    updateUI();
    announce('New game started.');

    if (gameState.aiMode === 'eve' || gameState.board.get_turn() !== gameState.humanColor) {
        await makeAIMove();
    }
}

async function passTurn() {
    const nextPlayer = gameState.board.other_js(gameState.board.get_turn());
    gameState.board.set_turn(nextPlayer);
    await audioEngine.play('pass.wav');
    announce('You passed. ' + (nextPlayer === gameState.humanColor ? 'Your turn.' : 'AI turn.'));
    updateUI();

    if (nextPlayer !== gameState.humanColor) {
        await makeAIMove();
    }
}

async function undoMove() {
    if (gameState.moveHistory.length > 0) {
        gameState.moveHistory.pop();
        gameState.board = gameState.moveHistory[gameState.moveHistory.length - 1] || new wasm.Board();
        updateUI();
        announce('Move undone.');
    }
}

async function getHint() {
    if (gameState.board.get_turn() !== gameState.humanColor) {
        announce('Wait for your turn.');
        return;
    }

    const grid = gameState.board.get_grid();
    const legalMoves = gameState.board.get_legal_moves_js(gameState.humanColor);

    if (legalMoves.length === 0) {
        announce('No legal moves available.');
        return;
    }

    // Get hint from AI with shallow depth
    let hintMove = -1;
    try {
        const ai = new wasm.MinimaxPlayer(2);
        hintMove = ai.choose_move(grid, gameState.humanColor);
    } catch (error) {
        hintMove = legalMoves[0];
    }

    if (hintMove >= 0 && hintMove < 64) {
        const r = Math.floor(hintMove / SIZE);
        const c = hintMove % SIZE;
        announce(`Hint: Play at ${String.fromCharCode(65 + c)}${r + 1}`);
        selectCell(r, c);
    }
}

function announceScore() {
    const blackCount = gameState.board.get_count(PLAYER.BLACK);
    const whiteCount = gameState.board.get_count(PLAYER.WHITE);
    announce(`Score: Black ${blackCount}, White ${whiteCount}`);
}

function announceLegalMoves() {
    const legalMoves = gameState.board.get_legal_moves_js(gameState.board.get_turn());
    const movesText = legalMoves.length === 0 ? 'No legal moves' : legalMoves.map(idx => {
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        return String.fromCharCode(65 + c) + (r + 1);
    }).join(', ');
    announce(`Legal moves: ${movesText}`);
}

function announceGameOver() {
    const winner = gameState.board.get_game_winner();
    const blackCount = gameState.board.get_count(PLAYER.BLACK);
    const whiteCount = gameState.board.get_count(PLAYER.WHITE);

    let message = '';
    if (winner === PLAYER.BLACK) {
        message = `Game Over. Black wins ${blackCount} to ${whiteCount}.`;
    } else if (winner === PLAYER.WHITE) {
        message = `Game Over. White wins ${whiteCount} to ${blackCount}.`;
    } else if (winner === 0) {  // Draw
        message = `Game Over. Draw at ${blackCount} to ${whiteCount}.`;
    } else {
        message = `Game Over. Final score: Black ${blackCount}, White ${whiteCount}.`;
    }

    announce(message);
}

// Initialization happens when WASM and DOM are both ready
// (see startGameWhenReady() above)
