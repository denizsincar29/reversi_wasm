import { PLAYER, SIZE } from './constants.js';
import { gameState, wasm } from './state.js';
import { audioEngine } from './audio.js';
import { announce, updateUI, selectCell, flipPiece } from './ui.js';
import { TRANSLATIONS } from './i18n.js';

export function downloadDebugLogs() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState.debugLogs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "reversi_debug.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    const t = TRANSLATIONS[gameState.language];
    announce(t.debug_downloaded);
}

export async function handleCellClick(r, c) {
    const t = TRANSLATIONS[gameState.language];
    if (gameState.aiMode === 'eve') {
        announce(t.eve_active);
        return;
    }
    if (gameState.isAIThinking || gameState.board.get_turn() !== gameState.humanColor) {
        announce(t.not_your_turn);
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
        announce(t.invalid_move(`${String.fromCharCode(65 + c)}${r + 1}`));
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

    // Update UI but skip the flipped pieces and the new move to animate them
    updateUI([...flippedIndices, moveIndex]);

    // Place the new piece
    const newCell = document.getElementById(`cell-${r}-${c}`);
    if (newCell && !newCell.querySelector('.disk')) {
        const disk = document.createElement('div');
        const isBlack = gameState.humanColor === PLAYER.BLACK;
        disk.className = `disk ${isBlack ? 'black' : 'white'} placing`;
        disk.textContent = isBlack ? '●' : '○';
        newCell.appendChild(disk);
    }

    // Play move sequence
    await audioEngine.playMoveSequence(gameState.humanColor, r, c, flippedIndices, (fr, fc) => {
        flipPiece(fr, fc, gameState.humanColor);
    });

    // Debug logging
    gameState.debugLogs.push({
        type: 'player_move',
        r, c,
        flippedIndices,
        fen: gameState.board.to_fen()
    });

    // Announce move
    const coord = String.fromCharCode(65 + c) + (r + 1);
    const playerName = gameState.humanColor === PLAYER.BLACK ? 'black' : 'white';
    announce(t.announcements.playerMove(coord, playerName, flippedIndices.length));

    // Comment on move quality
    const evaluation = gameState.board.get_last_eval();
    let qualityPhrases;
    if (evaluation > 20) qualityPhrases = t.quality.excellent;
    else if (evaluation > 5) qualityPhrases = t.quality.good;
    else if (evaluation > -5) qualityPhrases = t.quality.fair;
    else if (evaluation > -20) qualityPhrases = t.quality.bad;
    else qualityPhrases = t.quality.blunder;

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
    const t = TRANSLATIONS[gameState.language];

    // Pick a random thinking phrase
    const thinkingPhrase = t.thinking[Math.floor(Math.random() * t.thinking.length)];
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
            announce(t.announcements.pass(player === PLAYER.BLACK ? 'Black' : 'White'));

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

    // Update UI but skip the flipped pieces and the new move to animate them
    const moveIndex = r * SIZE + c;
    updateUI([...flippedIndices, moveIndex]);

    // Place the new piece
    const newCell = document.getElementById(`cell-${r}-${c}`);
    if (newCell && !newCell.querySelector('.disk')) {
        const disk = document.createElement('div');
        const isBlack = player === PLAYER.BLACK;
        disk.className = `disk ${isBlack ? 'black' : 'white'} placing`;
        disk.textContent = isBlack ? '●' : '○';
        newCell.appendChild(disk);
    }

    // Play move sequence
    await audioEngine.playMoveSequence(player, r, c, flippedIndices, (fr, fc) => {
        flipPiece(fr, fc, player);
    });

    // Debug logging
    gameState.debugLogs.push({
        type: 'ai_move',
        r, c,
        flippedIndices,
        fen: gameState.board.to_fen()
    });

    // Announce move
    const coord = String.fromCharCode(65 + c) + (r + 1);
    const playerName = player === PLAYER.BLACK ? 'black' : 'white';

    // Determine perspective
    if (gameState.aiMode === 'eve') {
        const name = player === PLAYER.BLACK ? 'Black AI' : 'White AI';
        announce(t.announcements.aiMoveThirdPerson(name, coord, playerName, flippedIndices.length));
    } else {
        announce(t.announcements.aiMoveFirstPerson(coord, playerName, flippedIndices.length));
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
    gameState.debugLogs = [{
        type: 'start_game',
        fen: gameState.board.to_fen()
    }];
    updateUI();
    const t = TRANSLATIONS[gameState.language];
    announce(t.new_game_started);

    if (gameState.aiMode === 'eve' || gameState.board.get_turn() !== gameState.humanColor) {
        await makeAIMove();
    }
}

export async function passTurn() {
    const t = TRANSLATIONS[gameState.language];
    try {
        gameState.board.pass();
        await audioEngine.play('pass.wav');
        const nextPlayer = gameState.board.get_turn();
        const message = nextPlayer === gameState.humanColor ? t.turn_passed_your_turn : t.turn_passed_ai_turn;
        announce(message);
        updateUI();

        if (nextPlayer !== gameState.humanColor) {
            await makeAIMove();
        }
    } catch (e) {
        console.error(e);
    }
}

export async function undoMove() {
    const t = TRANSLATIONS[gameState.language];
    if (gameState.board.undo()) {
        gameState.debugLogs.push({
            type: 'undo',
            fen: gameState.board.to_fen()
        });
        updateUI();
        announce(t.move_undone);
    }
}

export async function getHint() {
    const t = TRANSLATIONS[gameState.language];
    if (gameState.board.get_turn() !== gameState.humanColor) {
        announce(t.wait_turn);
        return;
    }

    const legalMoves = gameState.board.get_legal_moves_js();

    if (legalMoves.length === 0) {
        announce(t.no_legal_moves);
        return;
    }

    // Get hint from AI with shallow depth
    let hintMoveObj = gameState.board.choose_ai_move(2);
    let hintMove = hintMoveObj.cell_index;
    hintMoveObj.free();

    if (hintMove >= 0 && hintMove < 64) {
        const r = Math.floor(hintMove / SIZE);
        const c = hintMove % SIZE;
        announce(t.hint_message(`${String.fromCharCode(65 + c)}${r + 1}`));
        selectCell(r, c);
    }
}

export function announceScore() {
    const t = TRANSLATIONS[gameState.language];
    const blackCount = gameState.board.get_count(PLAYER.BLACK);
    const whiteCount = gameState.board.get_count(PLAYER.WHITE);
    const advantage = blackCount - whiteCount;
    let advantageText = t.tied;
    if (advantage > 0) {
        advantageText = t.black_ahead(advantage);
    } else if (advantage < 0) {
        advantageText = t.white_ahead(-advantage);
    }
    announce(t.score_summary(blackCount, whiteCount, advantageText));
}

export function announceLegalMoves() {
    const t = TRANSLATIONS[gameState.language];
    const legalMoves = gameState.board.get_legal_moves_js();
    const movesText = legalMoves.length === 0 ? t.no_legal_moves : legalMoves.map(idx => {
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        return String.fromCharCode(65 + c) + (r + 1);
    }).join(', ');
    announce(t.legal_moves_list(movesText));
}

export function announceGameOver() {
    const t = TRANSLATIONS[gameState.language];
    const winner = gameState.board.get_game_winner();
    const blackCount = gameState.board.get_count(PLAYER.BLACK);
    const whiteCount = gameState.board.get_count(PLAYER.WHITE);

    let message = '';
    if (winner === PLAYER.BLACK) {
        message = t.game_over_win('Black', blackCount, whiteCount);
    } else if (winner === PLAYER.WHITE) {
        message = t.game_over_win('White', whiteCount, blackCount);
    } else if (winner === 0) {  // Draw
        message = t.game_over_draw(blackCount, whiteCount);
    } else {
        message = t.game_over_final(blackCount, whiteCount);
    }

    announce(message);
}
