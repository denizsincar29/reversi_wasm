import { PLAYER, SIZE } from './constants.js';
import { gameState } from './state.js';
import { TRANSLATIONS } from './i18n.js';

export function announce(message) {
    console.log('Announce:', message);
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
}

export function setupBoard(handleCellClick) {
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

export function flipPiece(r, c, player) {
    const cell = document.getElementById(`cell-${r}-${c}`);
    if (!cell) return;

    let disk = cell.querySelector('.disk');
    if (!disk) return;

    disk.classList.remove('flipping');
    void disk.offsetWidth; // Trigger reflow
    disk.classList.add('flipping');

    const isBlack = player === PLAYER.BLACK;
    // Delay the color change to the middle of the flip animation
    setTimeout(() => {
        disk.classList.remove('black', 'white');
        disk.classList.add(isBlack ? 'black' : 'white');
        disk.textContent = isBlack ? '●' : '○';
    }, 250);
}

export function updateLanguageUI() {
    const t = TRANSLATIONS[gameState.language];

    // Update elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'TITLE') {
                document.title = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    // Update elements with data-i18n-label
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
        const key = el.getAttribute('data-i18n-label');
        if (t[key]) {
            el.setAttribute('aria-label', t[key]);
        }
    });

    // Update language select to match state
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.value = gameState.language;
    }
}

export function updateUI(skipIndices = []) {
    const skipSet = new Set(skipIndices.map(i => Number(i)));
    const grid = gameState.board.get_grid();
    const turn = gameState.board.get_turn();
    const legalMoves = gameState.board.get_legal_moves_js(turn);
    const t = TRANSLATIONS[gameState.language];

    // Update board cells
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const idx = r * SIZE + c;
            if (skipSet.has(idx)) continue;

            const cell = document.getElementById(`cell-${r}-${c}`);
            const piece = grid[idx];

            // Update ARIA label
            const coord = `${String.fromCharCode(65 + c)}${r + 1}`;
            const pieceName = piece === PLAYER.BLACK ? ` ${t.black.toLowerCase()}` : (piece === PLAYER.WHITE ? ` ${t.white.toLowerCase()}` : '');
            cell.setAttribute('aria-label', `${coord}${pieceName}`);

            // Update or create disk
            let disk = cell.querySelector('.disk');
            if (piece !== PLAYER.EMPTY) {
                if (!disk) {
                    disk = document.createElement('div');
                    cell.appendChild(disk);
                }
                const isBlack = piece === PLAYER.BLACK;
                disk.className = `disk ${isBlack ? 'black' : 'white'}`;
                disk.textContent = isBlack ? '●' : '○';
            } else if (disk) {
                disk.remove();
            }

            // Mark legal moves
            cell.classList.toggle('legal-move', legalMoves.includes(idx));
        }
    }

    // Update status
    const status = document.getElementById('status');
    const turnText = turn === PLAYER.BLACK ? t.turn_black : t.turn_white;
    const yourText = turn === gameState.humanColor ? t.your_turn : t.ai_turn;
    status.textContent = `${turnText}${yourText}`;

    // Update score
    const blackCount = gameState.board.get_count(PLAYER.BLACK);
    const whiteCount = gameState.board.get_count(PLAYER.WHITE);
    const scoreContent = document.getElementById('score-content');
    scoreContent.innerHTML = `
        <span class="black-count">${blackCount}</span>
        <span class="white-count">${whiteCount}</span>
    `;

    // Update legal moves
    const movesText = legalMoves.length === 0 ? t.none : legalMoves.map(idx => {
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        return String.fromCharCode(65 + c) + (r + 1);
    }).join(', ');
    document.getElementById('moves-content').textContent = movesText;

    // Update button states
    document.getElementById('pass-btn').disabled = legalMoves.length > 0 || gameState.board.get_turn() !== gameState.humanColor || gameState.aiMode === 'eve';
    document.getElementById('undo-btn').disabled = gameState.board.get_history_len() === 0;
}

export function selectCell(r, c) {
    document.querySelectorAll('.board-cell').forEach(cell => {
        cell.classList.remove('selected');
    });

    const cell = document.getElementById(`cell-${r}-${c}`);
    if (cell) {
        cell.classList.add('selected');
        cell.focus();
        gameState.selectedCell = { r, c };
    }
}
