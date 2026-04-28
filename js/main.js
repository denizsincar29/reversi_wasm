import init, { Board, AlphaBetaPlayer, MinimaxPlayer } from '../reversi_wasm.js';
import { PLAYER, SIZE } from './constants.js';
import { gameState, setWasm } from './state.js';
import { setupBoard, updateUI, selectCell, announce } from './ui.js';
import { handleCellClick, makeAIMove, startNewGame, getHint, passTurn, undoMove, announceScore, announceLegalMoves } from './game.js';

// Initialize WASM and start game when ready
async function initializeGame() {
    try {
        if (gameState.board) gameState.board.free();
        gameState.board = new Board();

        setupBoard(handleCellClick);
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

function handleKeyboard(event) {
    if (gameState.isAIThinking) return;

    const isBoardFocused = document.activeElement &&
                          (document.activeElement.classList.contains('board-cell') ||
                           document.activeElement.id === 'board-container');

    const cell = document.querySelector('.board-cell.selected') ||
                 (document.activeElement && document.activeElement.classList.contains('board-cell') ? document.activeElement : null);

    let r = 0, c = 0;
    if (cell) {
        r = parseInt(cell.dataset.row);
        c = parseInt(cell.dataset.col);
    } else if (gameState.selectedCell) {
        r = gameState.selectedCell.r;
        c = gameState.selectedCell.c;
    }

    switch (event.key) {
        case 'ArrowUp':
            if (!isBoardFocused) return;
            event.preventDefault();
            r = Math.max(0, r - 1);
            selectCell(r, c);
            break;
        case 'ArrowDown':
            if (!isBoardFocused) return;
            event.preventDefault();
            r = Math.min(SIZE - 1, r + 1);
            selectCell(r, c);
            break;
        case 'ArrowLeft':
            if (!isBoardFocused) return;
            event.preventDefault();
            c = Math.max(0, c - 1);
            selectCell(r, c);
            break;
        case 'ArrowRight':
            if (!isBoardFocused) return;
            event.preventDefault();
            c = Math.min(SIZE - 1, c + 1);
            selectCell(r, c);
            break;
        case 'Enter':
            if (!isBoardFocused) return;
            event.preventDefault();
            handleCellClick(r, c);
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
        case 'b':
        case 'B':
            if (!event.altKey && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                if (gameState.selectedCell) {
                    selectCell(gameState.selectedCell.r, gameState.selectedCell.c);
                } else {
                    selectCell(0, 0);
                }
            }
            break;
    }
}

function startGameWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGame);
    } else {
        initializeGame();
    }
}

init().then(() => {
    setWasm({ Board, AlphaBetaPlayer, MinimaxPlayer });
    console.log('WASM loaded successfully');
    startGameWhenReady();
}).catch(err => {
    console.error('Failed to load WASM:', err);
});
