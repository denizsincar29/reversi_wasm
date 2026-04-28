import { PLAYER, SIZE } from './constants.js';
import { gameState } from './state.js';

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

export function updateUI() {
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
