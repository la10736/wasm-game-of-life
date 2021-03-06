/* tslint:disable */
import * as wasm from './wasm_game_of_life_bg';

/**
*/
export const Cell = Object.freeze({ Dead:0,Alive:1, });

const __wbg_time_96506d9a603f1ede_target = console.time;

let cachedDecoder = new TextDecoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

export function __wbg_time_96506d9a603f1ede(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);
    __wbg_time_96506d9a603f1ede_target(varg0);
}

const __wbg_timeEnd_4c80ca1a031be605_target = console.timeEnd;

export function __wbg_timeEnd_4c80ca1a031be605(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);
    __wbg_timeEnd_4c80ca1a031be605_target(varg0);
}

const __wbg_random_083ad9047bc62741_target = Math.random.bind(Math) || function() {
    throw new Error(`wasm-bindgen: Math.random.bind(Math) does not exist`);
};

export function __wbg_random_083ad9047bc62741() {
    return __wbg_random_083ad9047bc62741_target();
}

function freeUniverse(ptr) {

    wasm.__wbg_universe_free(ptr);
}
/**
*/
export class Universe {

    static __wrap(ptr) {
        const obj = Object.create(Universe.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeUniverse(ptr);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {Universe}
    */
    static new(arg0, arg1) {
        return Universe.__wrap(wasm.universe_new(arg0, arg1));
    }
    /**
    * @returns {Universe}
    */
    static example() {
        return Universe.__wrap(wasm.universe_example());
    }
    /**
    * @returns {void}
    */
    random() {
        return wasm.universe_random(this.ptr);
    }
    /**
    * @returns {void}
    */
    clear() {
        return wasm.universe_clear(this.ptr);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {Universe}
    */
    static new_random(arg0, arg1) {
        return Universe.__wrap(wasm.universe_new_random(arg0, arg1));
    }
    /**
    * @returns {number}
    */
    width() {
        return wasm.universe_width(this.ptr);
    }
    /**
    * @returns {number}
    */
    height() {
        return wasm.universe_height(this.ptr);
    }
    /**
    * @returns {number}
    */
    cells() {
        return wasm.universe_cells(this.ptr);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {void}
    */
    toggle_cell(arg0, arg1) {
        return wasm.universe_toggle_cell(this.ptr, arg0, arg1);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {void}
    */
    set_cell(arg0, arg1) {
        return wasm.universe_set_cell(this.ptr, arg0, arg1);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {void}
    */
    clear_cell(arg0, arg1) {
        return wasm.universe_clear_cell(this.ptr, arg0, arg1);
    }
    /**
    * @returns {void}
    */
    tick() {
        return wasm.universe_tick(this.ptr);
    }
}

export function __wbindgen_throw(ptr, len) {
    throw new Error(getStringFromWasm(ptr, len));
}

