import { PLAYER, SIZE } from './constants.js';
import { gameState, wasm } from './state.js';
import { audioEngine } from './audio.js';
import { announce, updateUI, selectCell } from './ui.js';
import { PHRASES } from '../phrases.js';

export async function handleCellClick(r, c) {
    if (gameState.aiMode === 'eve') {
        announce('AI vs AI mode is active.');
        return;
    }
    if (gameState.isAIThinking || gameState.board.get_turn() !== gameState.humanColor) {
        announce('It\'s not your turn.');
        return;
    }

    const legalMoves = gameState.board.get_legal_moves_js();
    // if no legal moves, pass turn
    if (legalMoves.length === 0) {
        await passTurn();
        updateUI();
        return;
    }
    const moveIndex = r * SIZE + c;

    if (!legalMoves.includes(moveIndex)) {
        await audioEngine.play('error.wav');
        announce(`Invalid move at ${String.fromCharCode(65 + c)}${r + 1}`);
        return;
    }

    // Make the move
    let flippedIndices;
    try {
        flippedIndices = gameState.board.apply_move_js(r, c);
    } catch (e) {
        console.error(e);
        return;
    }

    // Update UI immediately to show the current board state
    updateUI();

    // Play move sequence
    audioEngine.playMoveSequence(gameState.humanColor, r, c, flippedIndices);

    // Announce move
    const coord = String.fromCharCode(65 + c) + (r + 1);
    const playerName = gameState.humanColor === PLAYER.BLACK ? 'black' : 'white';
    announce(PHRASES.announcements.playerMove(coord, playerName, flippedIndices.length));

    // Comment on move quality
    const evaluation = gameState.board.get_last_eval();
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

export async function makeAIMove() {
    gameState.isAIThinking = true;

    // Pick a random thinking phrase
    const thinkingPhrase = PHRASES.thinking[Math.floor(Math.random() * PHRASES.thinking.length)];
    announce(thinkingPhrase);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const player = gameState.board.get_turn();
    const legalMoves = gameState.board.get_legal_moves_js();

    if (legalMoves.length === 0) {
        // Pass
        try {
            gameState.board.pass();
            await audioEngine.play('pass.wav');
            announce(PHRASES.announcements.pass(player === PLAYER.BLACK ? 'Black' : 'White'));

            updateUI();

            if (gameState.board.check_is_terminal()) {
                announceGameOver();
                gameState.isAIThinking = false;
                return;
            }

            if (gameState.aiMode === 'eve' || gameState.board.get_turn() !== gameState.humanColor) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await makeAIMove();
            }
        } catch (e) {
            console.error(e);
        }

        gameState.isAIThinking = false;
        return;
    }

    // Get AI move
    let aiMoveObj = gameState.board.choose_ai_move(gameState.aiDepth);
    let aiMove = aiMoveObj.cell_index;
    aiMoveObj.free();

    if (aiMove < 0 || aiMove >= 64) {
        aiMove = legalMoves[0];
    }

    const r = Math.floor(aiMove / SIZE);
    const c = aiMove % SIZE;

    // Apply move
    let flippedIndices;
    try {
        flippedIndices = gameState.board.apply_move_js(r, c);
    } catch (e) {
        console.error(e);
        gameState.isAIThinking = false;
        return;
    }

    // Update UI immediately to show the current board state
    updateUI();

    // Play move sequence
    audioEngine.playMoveSequence(player, r, c, flippedIndices);

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

export async function startNewGame() {
    if (gameState.board) gameState.board.free();

    gameState.board = new wasm.Board();
    gameState.turn = PLAYER.BLACK;
    updateUI();
    announce('New game started.');

    if (gameState.aiMode === 'eve' || gameState.board.get_turn() !== gameState.humanColor) {
        await makeAIMove();
    }
}

export async function passTurn() {
    try {
        gameState.board.pass();
        await audioEngine.play('pass.wav');
        const nextPlayer = gameState.board.get_turn();
        announce('Turn passed. ' + (nextPlayer === gameState.humanColor ? 'Your turn.' : 'AI turn.'));
        updateUI();

        if (nextPlayer !== gameState.humanColor) {
            await makeAIMove();
        }
    } catch (e) {
        console.error(e);
    }
}

export async function undoMove() {
    if (gameState.board.undo()) {
        updateUI();
        announce('Move undone.');
    }
}

export async function getHint() {
    if (gameState.board.get_turn() !== gameState.humanColor) {
        announce('Wait for your turn.');
        return;
    }

    const legalMoves = gameState.board.get_legal_moves_js();

    if (legalMoves.length === 0) {
        announce('No legal moves available.');
        return;
    }

    // Get hint from AI with shallow depth
    let hintMoveObj = gameState.board.choose_ai_move(2);
    let hintMove = hintMoveObj.cell_index;
    hintMoveObj.free();

    if (hintMove >= 0 && hintMove < 64) {
        const r = Math.floor(hintMove / SIZE);
        const c = hintMove % SIZE;
        announce(`Hint: Play at ${String.fromCharCode(65 + c)}${r + 1}`);
        selectCell(r, c);
    }
}

export function announceScore() {
    const blackCount = gameState.board.get_count(PLAYER.BLACK);
    const whiteCount = gameState.board.get_count(PLAYER.WHITE);
    const advantage = blackCount - whiteCount;
    let advantageText = 'Both players are tied.';
    if (advantage > 0) {
        advantageText = `Black is ahead by ${advantage} pieces.`;
    } else if (advantage < 0) {
        advantageText = `White is ahead by ${-advantage} pieces.`;
    }
    announce(`Score: Black ${blackCount}, White ${whiteCount}. ${advantageText}`);
}

export function announceLegalMoves() {
    const legalMoves = gameState.board.get_legal_moves_js();
    const movesText = legalMoves.length === 0 ? 'No legal moves' : legalMoves.map(idx => {
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        return String.fromCharCode(65 + c) + (r + 1);
    }).join(', ');
    announce(`Legal moves: ${movesText}`);
}

export function announceGameOver() {
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
