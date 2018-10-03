/* tslint:disable */
import * as wasm from './wasm_game_of_life_bg';

/**
*/
export const Cell = Object.freeze({ Dead:0,Alive:1, });

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
    * @param {number} arg0
    * @param {number} arg1
    * @returns {Universe}
    */
    static random(arg0, arg1) {
        return Universe.__wrap(wasm.universe_random(arg0, arg1));
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
    * @returns {void}
    */
    tick() {
        return wasm.universe_tick(this.ptr);
    }
}

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

export function __wbindgen_throw(ptr, len) {
    throw new Error(getStringFromWasm(ptr, len));
}

