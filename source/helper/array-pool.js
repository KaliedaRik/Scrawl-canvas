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
    if (genericArrayPool.length > 256) {

        console.log('purging genericArrayPool', genericArrayPool.length);
        genericArrayPool.length = 64;
    }
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
    if (harnessPool.length > 256) {

        console.log('purging harnessPool', harnessPool.length);
        harnessPool.length = 64;
    }
};

// Temporary during dev work
let tempTraceChoke = 2000,
    traceLastPerformed = 0,
    i32created = 0,
    i32served = 0,
    f32created = 0,
    f32served = 0,
    f64created = 0,
    f64served = 0;

const int32Pool = [];

export const requestInt32Array = (length = 0, fillValue = false) => {

    for (let i = 0, iz = int32Pool.length; i < iz; i++) {

        const harness = int32Pool[i];

        if (length === harness.length) {

            const array = harness.array;

            int32Pool.splice(i, 1);

            releaseHarness(harness);

// Temporary during dev work
            i32served++;

            return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
        }
    }

// Temporary during dev work
    i32created++;

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

const float32Pool = [];

export const requestFloat32Array = (length = 0, fillValue = false) => {

    for (let i = 0, iz = float32Pool.length; i < iz; i++) {

        const harness = float32Pool[i];

        if (length === harness.length) {

            const array = harness.array;

            float32Pool.splice(i, 1);

            releaseHarness(harness);

// Temporary during dev work
            f32served++;

            return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
        }
    }

// Temporary during dev work
    f32created++;

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

const float64Pool = [];

export const requestFloat64Array = (length = 0, fillValue = false) => {

    for (let i = 0, iz = float64Pool.length; i < iz; i++) {

        const harness = float64Pool[i];

        if (length === harness.length) {

            const array = harness.array;

            float64Pool.splice(i, 1);

            releaseHarness(harness);

// Temporary during dev work
            f64served++;

            return (_isFinite(fillValue)) ? array.fill(fillValue) : array;
        }
    }

// Temporary during dev work
    f64created++;

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

// Temporary during dev work
        const traceChoke = now - tempTraceChoke,
            traceFlag = traceLastPerformed < traceChoke;

        if (traceFlag) traceLastPerformed = now;

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

// Temporary during dev work
        if (traceFlag) {

            console.log(`f32 hygiene - created: ${f32created}, served ${f32served}, purgeItems ${purgeItems.length}, keepItems ${keepItems.length}`);

            f32created = 0;
            f32served = 0;
        }

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

// Temporary during dev work
        if (traceFlag) {

            console.log(`f64 hygiene - created: ${f64created}, served ${f64served}, purgeItems ${purgeItems.length}, keepItems ${keepItems.length}`);

            f64created = 0;
            f64served = 0;
        }

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

// Temporary during dev work
        if (traceFlag) {

            console.log(`i32 hygiene - created: ${i32created}, served ${i32served}, purgeItems ${purgeItems.length}, keepItems ${keepItems.length}`);

            i32created = 0;
            i32served = 0;
        }
    }
};

// `core-workstore-hygeine` animation object runs every RAF cycle
setTimeout(() => {

    makeAnimation({

        name: 'SC-core-array-pools-hygiene',
        order: 997,
        fn: () => purgeArrayPools(),
    });
}, 0)
