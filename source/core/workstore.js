// # Workstore

import { makeAnimation } from '../factory/animation.js';
import { _keys, _now } from './shared-vars.js';


// `workstore`, `workstoreLastAccessed` - Scrawl-canvas maintains a semi-permanent storage space for some processing objects that are computationally expensive, for instance grids, matrix reference data objects, etc. The engine also maintains a record of when each of these processing objects was last accessed and will remove objects if they have not been accessed in the last few seconds.
const workstore = {};
const workstoreLastAccessed = {};

// `lifetimeLength` - measure in milliseconds before an entry in the workstore goes stale and gets removed from the workstore
let lifetimeLength = 1000;

// `setWorkstoreLifetimeLength`
export const setWorkstoreLifetimeLength = (val) => {

    if (val.toFixed && !isNaN(val) && val >= 200 && val <= 10000) lifetimeLength = val;
};

// `setFilterMemoizationChoke` - DEPRECATED in favour of `setWorkstoreLifetimeLength`
export const setFilterMemoizationChoke = (val) => {

    if (val.toFixed && !isNaN(val) && val >= 200 && val <= 10000) lifetimeLength = val;
};

// `getWorkstoreItem`, `setWorkstoreItem` - retrieve, or set, the value stored at the identifier key
export const getWorkstoreItem = (identifier) => {

    if (workstore[identifier]) {

        workstoreLastAccessed[identifier] = _now();
        return workstore[identifier];
    }
    return null;
};

export const setWorkstoreItem = (identifier, value) => {

    workstore[identifier] = value;
    workstoreLastAccessed[identifier] = _now();
};

// `getOrAddWorkstoreItem` - retrieves the value stored at the identifier key. If the key does not exist, create and populate it with the value array/object, then return that value;
export const getOrAddWorkstoreItem = function (identifier, value = []) {

    const now = _now();

    if (workstore[identifier]) {

        workstoreLastAccessed[identifier] = now;
        return workstore[identifier];
    }

    workstore[identifier] = value;
    workstoreLastAccessed[identifier] = now;
    return workstore[identifier];
};

// `setAndReturnWorkstoreItem` - create or set the value stored at the identifier key, then return that value;
export const setAndReturnWorkstoreItem = function (identifier, value = []) {

    workstore[identifier] = value;
    workstoreLastAccessed[identifier] = _now();
    return workstore[identifier];
};


// #### Workstore hygeine
// `purgeChoke`, `purgeLastPerformed` - minimum time between purge runs, and when the last purge took place
let purgeChoke = 200;
let purgeLastPerformed = 0;

// `setWorkstorePurgeChoke`
export const setWorkstorePurgeChoke = (val) => {

    if (val.toFixed && !isNaN(val) && val >= 10 && val <= 5000) purgeChoke = val;
};

// `purgeWorkstore` - internal function
const purgeWorkstore = () => {

    const now = _now(),
        choke = now - purgeChoke;

    if (purgeLastPerformed < choke) {

        const workstoreKeys = _keys(workstore),
            workstoreChoke = now - lifetimeLength;

        for (let i = 0, iz = workstoreKeys.length, s; i < iz; i++) {

            s = workstoreKeys[i];

            if (workstoreLastAccessed[s] < workstoreChoke) {

                delete workstore[s];
                delete workstoreLastAccessed[s];
            }
        }
        purgeLastPerformed = now;
    }
};

// `core-workstore-hygeine` animation object runs every RAF cycle
makeAnimation({

    name: 'core-workstore-hygeine',
    order: 0,
    fn: () => purgeWorkstore(),
});
