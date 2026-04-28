import { PLAYER } from './constants.js';

export let wasm = null;

export const gameState = {
    board: null,
    turn: PLAYER.BLACK,
    humanColor: PLAYER.BLACK,
    aiType: 'alphabeta',
    aiDepth: 3,
    aiMode: 'pve',
    selectedCell: null,
    isAIThinking: false,
};

export function setWasm(w) {
    wasm = w;
}

export function playerToDisplay(p) {
    switch(p) {
        case PLAYER.BLACK: return 'B';
        case PLAYER.WHITE: return 'W';
        default: return '.';
    }
}

export function displayToPlayer(c) {
    switch(c) {
        case 'B': return PLAYER.BLACK;
        case 'W': return PLAYER.WHITE;
        default: return PLAYER.EMPTY;
    }
}
