// # Workstore
// Scrawl-canvas maintains a semi-permanent storage space for some processing objects that are computationally expensive, for instance grids, matrix reference data objects, etc. The engine also maintains a record of when each of these processing objects was last accessed and will remove objects if they have not been accessed in the last few seconds.

import { makeAnimation } from '../factory/animation.js';
import { _isFinite, _keys, _now } from './shared-vars.js';


// ### The workstore object
// ```
// key: {
//   value: any,
//   stamp: timestamp (Date.now),
// }
// ```
const workstore = Object.create(null);


// ### Workstore lifetime management
let lifetimeLength = 1000;

export const setWorkstoreLifetimeLength = (val) => {

    if (_isFinite(val) && val >= 200 && val <= 10000) lifetimeLength = val;
};

export const setFilterMemoizationChoke = (val) => {

    if (_isFinite(val) && val >= 200 && val <= 10000) lifetimeLength = val;
};


// Workstore access
export const checkForWorkstoreItem = (identifier) => {

    const item = workstore[identifier];

    if (!item) return false;

    item.stamp = _now();
    return true;
};

export const getWorkstoreItem = (identifier) => {

    const item = workstore[identifier];

    if (item) {

        item.stamp = _now();
        return item.value;
    }
    return null;
};

export const setWorkstoreItem = (identifier, value) => {

    workstore[identifier] = {
        value,
        stamp: _now(),
    };
};

export const getOrAddWorkstoreItem = function (identifier, value = []) {

    const item = workstore[identifier],
        now = _now();

    if (item) {

        item.stamp = now;
        return item.value;
    }

    workstore[identifier] = {
        value,
        stamp: now,
    };
    return value;
};

export const setAndReturnWorkstoreItem = function (identifier, value = []) {

    const item = workstore[identifier],
        now = _now();

    if (item) {

        item.stamp = now;
        item.value = value;
        return value;
    }

    workstore[identifier] = {
        value,
        stamp: now,
    };
    return value;
};


// Workstore hygeine
let purgeChoke = 200;
let purgeLastPerformed = 0;

export const setWorkstorePurgeChoke = (val) => {

    if (_isFinite(val) && val >= 10 && val <= 5000) purgeChoke = val;
};


const purgeWorkstore = () => {

    const now = _now(),
        choke = now - purgeChoke;

    if (purgeLastPerformed < choke) {

        const workstoreKeys = _keys(workstore),
            workstoreChoke = now - lifetimeLength;

        for (let i = 0, iz = workstoreKeys.length, identifier, item; i < iz; i++) {

            identifier = workstoreKeys[i];
            item = workstore[identifier];

            if (item.stamp < workstoreChoke) delete workstore[identifier];
        }

        purgeLastPerformed = now;
    }
};


// `core-workstore-hygeine` animation object runs every RAF cycle
makeAnimation({

    name: 'SC-core-workstore-hygiene',
    order: 998,

    fn: () => purgeWorkstore(),
});
