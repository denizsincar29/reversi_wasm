/* tslint:disable */
/* eslint-disable */

export class AIMove {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    cell_index: number;
    score: number;
}

export class AlphaBetaPlayer {
    free(): void;
    [Symbol.dispose](): void;
    choose_move(board: Uint8Array, player: number): AIMove;
    constructor(depth: number);
    depth: number;
}

export class Board {
    free(): void;
    [Symbol.dispose](): void;
    apply_move_js(player: number, r: number, c: number): MoveResult;
    check_is_terminal(): boolean;
    clone_js(): Board;
    get_count(player: number): number;
    get_game_winner(): number;
    get_grid(): Uint8Array;
    get_legal_moves_js(player: number): Uint32Array;
    get_score_js(player: number): number;
    get_turn(): number;
    other_js(player: number): number;
    set_grid(grid: Uint8Array): void;
    set_turn(turn: number): void;
    constructor();
}

export class MinimaxPlayer {
    free(): void;
    [Symbol.dispose](): void;
    choose_move(board: Uint8Array, player: number): AIMove;
    constructor(depth: number);
    depth: number;
}

export class MoveResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly board: Board;
    readonly flipped_indices: Uint32Array;
}

export function init(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_aimove_free: (a: number, b: number) => void;
    readonly __wbg_alphabetaplayer_free: (a: number, b: number) => void;
    readonly __wbg_get_aimove_cell_index: (a: number) => number;
    readonly __wbg_get_aimove_score: (a: number) => number;
    readonly __wbg_get_alphabetaplayer_depth: (a: number) => number;
    readonly __wbg_set_aimove_cell_index: (a: number, b: number) => void;
    readonly __wbg_set_aimove_score: (a: number, b: number) => void;
    readonly __wbg_set_alphabetaplayer_depth: (a: number, b: number) => void;
    readonly alphabetaplayer_choose_move: (a: number, b: number, c: number, d: number) => number;
    readonly alphabetaplayer_new: (a: number) => number;
    readonly init: () => void;
    readonly __wbg_board_free: (a: number, b: number) => void;
    readonly __wbg_moveresult_free: (a: number, b: number) => void;
    readonly board_apply_move_js: (a: number, b: number, c: number, d: number) => number;
    readonly board_check_is_terminal: (a: number) => number;
    readonly board_clone_js: (a: number) => number;
    readonly board_get_count: (a: number, b: number) => number;
    readonly board_get_game_winner: (a: number) => number;
    readonly board_get_grid: (a: number) => [number, number];
    readonly board_get_legal_moves_js: (a: number, b: number) => [number, number];
    readonly board_get_score_js: (a: number, b: number) => number;
    readonly board_get_turn: (a: number) => number;
    readonly board_other_js: (a: number, b: number) => number;
    readonly board_set_grid: (a: number, b: number, c: number) => void;
    readonly board_set_turn: (a: number, b: number) => void;
    readonly board_wasm_new: () => number;
    readonly moveresult_board: (a: number) => number;
    readonly moveresult_flipped_indices: (a: number) => [number, number];
    readonly __wbg_get_minimaxplayer_depth: (a: number) => number;
    readonly __wbg_minimaxplayer_free: (a: number, b: number) => void;
    readonly __wbg_set_minimaxplayer_depth: (a: number, b: number) => void;
    readonly minimaxplayer_choose_move: (a: number, b: number, c: number, d: number) => number;
    readonly minimaxplayer_new: (a: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
