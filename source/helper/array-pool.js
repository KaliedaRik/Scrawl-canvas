// # Array pools
// Used internally to minimise the number of Array objects created/disposed during operations


// #### Imports
import { constructors } from '../core/library.js';

// Shared constants
import { _create, _setPrototypeOf } from './shared-vars.js';

// Local constants
const T_GENERIC_ARRAY = 'GenericArray';


// #### GenericArray constructor
const GenericArray = function () {

    const a = [];
    _setPrototypeOf(a, GenericArray.prototype);
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

            if (genericArrayPool.length > 512) {

                console.log('purging genericArrayPool');
                genericArrayPool.length = 256;
            }
        }
    });
};
