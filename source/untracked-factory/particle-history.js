// # ParticleHistory factory
//
// __ParticleHistory__ objects are Arrays in which Scrawl-canvas records history data for a given particle at a specified time. The array holds data in the following format:
// ```
// [
//     Number:particle-life-time-remaining,
//     Number:particle-z-position,
//     Number:particle-x-position,
//     Number:particle-y-position
// ]
// ```
//
// Because of the number of ParticleHistory arrays that can be generated and discarded in even a simple particle physics animation, Scrawl-canvas includes functionality to pool and reuse ParticleHistory arrays. The exported functions `requestParticleHistory` and `releaseParticleHistory` give us access to the pool mechanism.


// #### Imports
import { constructors } from '../core/library.js';

// Shared constants
import { _create, _setPrototypeOf } from '../helper/shared-vars.js';

// Local constants
const T_PARTICLE_HISTORY = 'ParticleHistory';


// #### ParticleHistory constructor
const ParticleHistory = function () {

    const h = Array(4).fill(0);

    _setPrototypeOf(h, ParticleHistory.prototype);

    return h;
};


// #### ParticleHistory prototype
const P = ParticleHistory.prototype = _create(Array.prototype);
P.constructor = ParticleHistory;
P.type = T_PARTICLE_HISTORY;


// #### Mixins
// ParticleHistory Arrays do not use mixins - they are regular Javascript Arrays. As such, they do not possess packet, clone or kill functionality.


// #### ParticleHistory attributes
// There are no attributes. The constructor returns an Array containing two members, whose prototype object includes functions for manipulating those members in various ways.


// #### Get, Set, deltaSet
// There are no getter or setter functions.


// #### Prototype functions
// There are no additional prototype functions.


// #### ParticleHistory pool
// An attempt to reuse history arrays rather than constantly creating and deleting them
const particleHistoryPool = [];

// `exported function` - retrieve a ParticleHistory from the history pool
export const requestParticleHistory = function () {

    if (!particleHistoryPool.length) particleHistoryPool.push(new ParticleHistory());

    return particleHistoryPool.pop();
};

// `exported function` - return a ParticleHistory array to the history pool. Failing to return arrays to the pool may lead to more inefficient code and possible memory leaks.
export const releaseParticleHistory = function (...args) {

    args.forEach(h => {

        if (h && h.type === T_PARTICLE_HISTORY) {

            h.fill(0);
            particleHistoryPool.push(h);

            // Do not keep excessive numbers of under-utilised arrays in the pool
            if (particleHistoryPool.length > 200) particleHistoryPool.length -= 100;
        }
    });
};

constructors.ParticleHistory = ParticleHistory;
