// # Array pools
// Used internally to minimise the number of Array objects created/disposed during operations


// #### Imports
import { constructors } from '../core/library.js';

import { _create, _setPrototypeOf, T_GENERIC_ARRAY } from './shared-vars.js';


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

export const requestArray = function () {

    if (!genericArrayPool.length) genericArrayPool.push(new GenericArray());

    return genericArrayPool.shift();
};

export const releaseArray = function (a) {

    if (a && a.type === T_GENERIC_ARRAY) {

        a.length = 0;
        genericArrayPool.push(a);

        if (genericArrayPool.length > 20) {

            console.log('purging genericArrayPool');
            genericArrayPool.length = 10;
        }
    }
};
