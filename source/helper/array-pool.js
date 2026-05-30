// # Array pools
// Used internally to minimise the number of Array objects created/disposed during operations


// #### Imports
import { constructors } from '../core/library.js';

import { makeAnimation } from '../factory/animation.js';

// Shared constants
import { _create, _isFinite, _now } from './shared-vars.js';

// Local constants
const T_GENERIC_ARRAY = 'GenericArray';


// #### GenericArray constructor
const GenericArray = function () {

    const a = [];
    a.type = T_GENERIC_ARRAY;
    return a;
};

constructors.GenericArray = GenericArray;


// #### GenericArray prototype
const P = GenericArray.prototype = _create(Array.prototype);
P.constructor = GenericArray;
P.type = T_GENERIC_ARRAY;


// #### GenericArray pool

const genericArrayPool = [];

export const requestArray = function (...args) {

    if (!genericArrayPool.length) genericArrayPool.push(new GenericArray());

    const a = genericArrayPool.pop();

    if (args.length) a.push(...args);

    return a;
};

export const releaseArray = function (...args) {

    args.forEach(a => {

        if (a && a.type === T_GENERIC_ARRAY) {

            a.length = 0;
            genericArrayPool.push(a);
        }
    });

    if (genericArrayPool.length > 256) genericArrayPool.length = 64;
};


// ### Typed pools

const harnessPool = [];

const requestHarness = () => {

    if (harnessPool.length) return harnessPool.pop();
    else {

        return {
            length: 0,
            array: null,
            stamp: 0,
        };
    }
};

const releaseHarness = (...harnesses) => {

    harnesses.forEach(harness => {

        harness.length = 0;
        harness.array = null;
        harness.stamp = 0;

        harnessPool.push(harness);
    });

    if (harnessPool.length > 256) harnessPool.length = 64;
};


// Uint8ClampedArray pool
const ui8Pool = [];

export const requestUI8Array = (length = 0, fillValue = false) => {

    for (let i = 0, iz = ui8Pool.length; i < iz; i++) {

        const harness = ui8Pool[i];

        if (length === harness.length) {

            const array = harness.array;
            ui8Pool.splice(i, 1);
            releaseHarness(harness);

            return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
        }
    }

    const array = new Uint8ClampedArray(length);

    return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
};

export const releaseUI8Array = (...args) => {

    args.forEach(a => {

        if (a && a.constructor === Uint8ClampedArray) {

            const harness = requestHarness();

            harness.length = a.length;
            harness.array = a;
            harness.stamp = _now();

            ui8Pool.push(harness);
        }
    });
};


// Int32Array pool
const int32Pool = [];

export const requestInt32Array = (length = 0, fillValue = false) => {

    for (let i = 0, iz = int32Pool.length; i < iz; i++) {

        const harness = int32Pool[i];

        if (length === harness.length) {

            const array = harness.array;
            int32Pool.splice(i, 1);
            releaseHarness(harness);

            return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
        }
    }

    const array = new Int32Array(length);

    return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
};

export const releaseInt32Array = (...args) => {

    args.forEach(a => {

        if (a && a.constructor === Int32Array) {

            const harness = requestHarness();

            harness.length = a.length;
            harness.array = a;
            harness.stamp = _now();

            int32Pool.push(harness);
        }
    });
};


// Float32Array pool
const float32Pool = [];

export const requestFloat32Array = (length = 0, fillValue = false) => {

    for (let i = 0, iz = float32Pool.length; i < iz; i++) {

        const harness = float32Pool[i];

        if (length === harness.length) {

            const array = harness.array;
            float32Pool.splice(i, 1);
            releaseHarness(harness);

            return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
        }
    }

    const array = new Float32Array(length);

    return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
};

export const releaseFloat32Array = (...args) => {

    args.forEach(a => {

        if (a && a.constructor === Float32Array) {

            const harness = requestHarness();

            harness.length = a.length;
            harness.array = a;
            harness.stamp = _now();

            float32Pool.push(harness);
        }
    });
};


// Float64Array pool
const float64Pool = [];

export const requestFloat64Array = (length = 0, fillValue = false) => {

    for (let i = 0, iz = float64Pool.length; i < iz; i++) {

        const harness = float64Pool[i];

        if (length === harness.length) {

            const array = harness.array;
            float64Pool.splice(i, 1);
            releaseHarness(harness);

            return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
        }
    }

    const array = new Float64Array(length);

    return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
};

export const releaseFloat64Array = (...args) => {

    args.forEach(a => {

        if (a && a.constructor === Float64Array) {

            const harness = requestHarness();

            harness.length = a.length;
            harness.array = a;
            harness.stamp = _now();

            float64Pool.push(harness);
        }
    });
};


// Typed array pools hygeine
let purgeChoke = 500;
let purgeLastPerformed = 0;

export const setArrayPoolsPurgeChoke = (val) => {

    if (_isFinite(val) && val >= 10 && val <= 5000) purgeChoke = val;
};


const purgeItems = [],
    keepItems = [];

const purgeArrayPools = () => {

    const now = _now(),
        choke = now - purgeChoke;

    if (purgeLastPerformed < choke) {

        purgeLastPerformed = now;

        let i, iz, item;


        // float32
        purgeItems.length = 0;
        keepItems.length = 0;

        for (i = 0, iz = float32Pool.length; i < iz; i++) {

            item = float32Pool[i];
            if (item.stamp < choke) purgeItems.push(item);
            else keepItems.push(item);
        }

        float32Pool.length = 0;
        float32Pool.push(...keepItems);

        releaseHarness(...purgeItems);


        // float64
        purgeItems.length = 0;
        keepItems.length = 0;

        for (i = 0, iz = float64Pool.length; i < iz; i++) {

            item = float64Pool[i];
            if (item.stamp < choke) purgeItems.push(item);
            else keepItems.push(item);
        }

        float64Pool.length = 0;
        float64Pool.push(...keepItems);

        releaseHarness(...purgeItems);


        // int32
        purgeItems.length = 0;
        keepItems.length = 0;

        for (i = 0, iz = int32Pool.length; i < iz; i++) {

            item = int32Pool[i];
            if (item.stamp < choke) purgeItems.push(item);
            else keepItems.push(item);
        }

        int32Pool.length = 0;
        int32Pool.push(...keepItems);

        releaseHarness(...purgeItems);


        // ui8
        purgeItems.length = 0;
        keepItems.length = 0;

        for (i = 0, iz = ui8Pool.length; i < iz; i++) {

            item = ui8Pool[i];
            if (item.stamp < choke) purgeItems.push(item);
            else keepItems.push(item);
        }

        ui8Pool.length = 0;
        ui8Pool.push(...keepItems);

        releaseHarness(...purgeItems);
    }
};

// `core-array-pools-hygiene` animation object runs every RAF cycle
setTimeout(() => {

    makeAnimation({

        name: 'SC-core-array-pools-hygiene',
        order: 997,
        fn: () => purgeArrayPools(),
    });
}, 0)
