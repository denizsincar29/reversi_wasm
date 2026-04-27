/* @ts-self-types="./reversi_wasm.d.ts" */

export class AIMove {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(AIMove.prototype);
        obj.__wbg_ptr = ptr;
        AIMoveFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AIMoveFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_aimove_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get cell_index() {
        const ret = wasm.__wbg_get_aimove_cell_index(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get score() {
        const ret = wasm.__wbg_get_aimove_score(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set cell_index(arg0) {
        wasm.__wbg_set_aimove_cell_index(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set score(arg0) {
        wasm.__wbg_set_aimove_score(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) AIMove.prototype[Symbol.dispose] = AIMove.prototype.free;

export class AlphaBetaPlayer {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AlphaBetaPlayerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_alphabetaplayer_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} board
     * @param {number} player
     * @returns {AIMove}
     */
    choose_move(board, player) {
        const ptr0 = passArray8ToWasm0(board, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.alphabetaplayer_choose_move(this.__wbg_ptr, ptr0, len0, player);
        return AIMove.__wrap(ret);
    }
    /**
     * @param {number} depth
     */
    constructor(depth) {
        const ret = wasm.alphabetaplayer_new(depth);
        this.__wbg_ptr = ret >>> 0;
        AlphaBetaPlayerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {number}
     */
    get depth() {
        const ret = wasm.__wbg_get_alphabetaplayer_depth(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set depth(arg0) {
        wasm.__wbg_set_alphabetaplayer_depth(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) AlphaBetaPlayer.prototype[Symbol.dispose] = AlphaBetaPlayer.prototype.free;

export class Board {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Board.prototype);
        obj.__wbg_ptr = ptr;
        BoardFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BoardFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_board_free(ptr, 0);
    }
    /**
     * @param {number} player
     * @param {number} r
     * @param {number} c
     * @returns {MoveResult}
     */
    apply_move_js(player, r, c) {
        const ret = wasm.board_apply_move_js(this.__wbg_ptr, player, r, c);
        return MoveResult.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    check_is_terminal() {
        const ret = wasm.board_check_is_terminal(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {Board}
     */
    clone_js() {
        const ret = wasm.board_clone_js(this.__wbg_ptr);
        return Board.__wrap(ret);
    }
    /**
     * @param {number} player
     * @returns {number}
     */
    get_count(player) {
        const ret = wasm.board_get_count(this.__wbg_ptr, player);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get_game_winner() {
        const ret = wasm.board_get_game_winner(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Uint8Array}
     */
    get_grid() {
        const ret = wasm.board_get_grid(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {number} player
     * @returns {Uint32Array}
     */
    get_legal_moves_js(player) {
        const ret = wasm.board_get_legal_moves_js(this.__wbg_ptr, player);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {number}
     */
    get_turn() {
        const ret = wasm.board_get_turn(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} player
     * @returns {number}
     */
    other_js(player) {
        const ret = wasm.board_other_js(this.__wbg_ptr, player);
        return ret;
    }
    /**
     * @param {Uint8Array} grid
     */
    set_grid(grid) {
        const ptr0 = passArray8ToWasm0(grid, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.board_set_grid(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} turn
     */
    set_turn(turn) {
        wasm.board_set_turn(this.__wbg_ptr, turn);
    }
    constructor() {
        const ret = wasm.board_wasm_new();
        this.__wbg_ptr = ret >>> 0;
        BoardFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) Board.prototype[Symbol.dispose] = Board.prototype.free;

export class MinimaxPlayer {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MinimaxPlayerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_minimaxplayer_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get depth() {
        const ret = wasm.__wbg_get_minimaxplayer_depth(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {Uint8Array} board
     * @param {number} player
     * @returns {AIMove}
     */
    choose_move(board, player) {
        const ptr0 = passArray8ToWasm0(board, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.minimaxplayer_choose_move(this.__wbg_ptr, ptr0, len0, player);
        return AIMove.__wrap(ret);
    }
    /**
     * @param {number} depth
     */
    constructor(depth) {
        const ret = wasm.minimaxplayer_new(depth);
        this.__wbg_ptr = ret >>> 0;
        MinimaxPlayerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} arg0
     */
    set depth(arg0) {
        wasm.__wbg_set_minimaxplayer_depth(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) MinimaxPlayer.prototype[Symbol.dispose] = MinimaxPlayer.prototype.free;

export class MoveResult {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MoveResult.prototype);
        obj.__wbg_ptr = ptr;
        MoveResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MoveResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_moveresult_free(ptr, 0);
    }
    /**
     * @returns {Board}
     */
    get board() {
        const ret = wasm.moveresult_board(this.__wbg_ptr);
        return Board.__wrap(ret);
    }
    /**
     * @returns {Uint32Array}
     */
    get flipped_indices() {
        const ret = wasm.moveresult_flipped_indices(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) MoveResult.prototype[Symbol.dispose] = MoveResult.prototype.free;

export function init() {
    wasm.init();
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_6b64449b9b9ed33c: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./reversi_wasm_bg.js": import0,
    };
}

const AIMoveFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_aimove_free(ptr >>> 0, 1));
const AlphaBetaPlayerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_alphabetaplayer_free(ptr >>> 0, 1));
const BoardFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_board_free(ptr >>> 0, 1));
const MinimaxPlayerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_minimaxplayer_free(ptr >>> 0, 1));
const MoveResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_moveresult_free(ptr >>> 0, 1));

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('reversi_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
