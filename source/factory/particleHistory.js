// # ParticleHistory factory
// Details ...


// #### Imports
import { constructors } from '../core/library.js';
import { λnull } from '../core/utilities.js';


// #### ParticleHistory constructor
const ParticleHistory = function (items) {

    let history = [];

    Object.setPrototypeOf(history, ParticleHistory.prototype);

    if (items) history.set(items);

    return history;
};


// #### ParticleHistory prototype
let P = ParticleHistory.prototype = Object.create(Array.prototype);
P.constructor = ParticleHistory;
P.type = 'ParticleHistory';


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
const requestParticleHistoryObject = function (items, y) {

    if (!particleHistoryPool.length) particleHistoryPool.push(new ParticleHistory());

    let c = particleHistoryPool.shift();
    return c
};

// `exported function` - return a ParticleHistory array to the history pool. Failing to return arrays to the pool may lead to more inefficient code and possible memory leaks.
const releaseParticleHistoryObject = function (history) {

    if (history && history.type === 'ParticleHistory') {

        history.length = 0;
        particleHistoryPool.push(history);
    }
};


// #### Factory
const makeParticleHistory = function (items) {

    return new ParticleHistory(items);
};

constructors.ParticleHistory = ParticleHistory;


// #### Exports
export {
    makeParticleHistory,
    requestParticleHistoryObject,
    releaseParticleHistoryObject,
};
