// # Force factory
// Force objects define the general and occasional forces to be applied to each particle in the particle system as the animation progresses - a __gravity__ force object is pre-defined by Scrawl-canvas.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, isa_fn, mergeOver, pushUnique, λnull, Ωempty } from '../helper/utilities.js';

import { releaseVector, requestVector } from '../untracked-factory/vector.js';

import baseMix from '../mixin/base.js';

// Shared constants (none imported)

// Local constants
const FORCE = 'force',
    GRAVITY = 'gravity',
    T_FORCE = 'Force';


// #### Force constructor
const Force = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);

    this.set(items);

    if (!this.action) this.action = λnull;

    return this;
};


// #### Force prototype
const P = Force.prototype = doCreate();
P.type = T_FORCE;
P.lib = FORCE;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Force attributes
const defaultAttributes = {

    action: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetFunctions = pushUnique(P.packetFunctions, ['action']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.kill = function () {

    this.deregister();

    return true;
};


// #### Get, Set, deltaSet
const S = P.setters;

S.action = function (item) {

    if (isa_fn(item)) this.action = item;
    else this.action = λnull;
};


// #### Factory
// ```
// let myRepellorBall = scrawl.makeWheel({
//
//     name: 'big-ball',
//     radius: 30,
// });
//
// scrawl.makeForce({
//
//     name: 'example-repellor',
//     action: (particle, world, host) => {
//
//         let {load, position} = particle;
//
//         let ballPosition = myRepellorBall.get('position');
//
//         let tempVector = scrawl.requestVector(ballPosition).vectorSubtract(position);
//
//         let magnitude = tempVector.getMagnitude();
//
//         if (magnitude && magnitude < myRepellorBall.get('radius')) {
//
//             tempVector.scalarMultiply(1 / (magnitude / 1000));
//             load.vectorSubtract(tempVector)
//         }
//         scrawl.releaseVector(tempVector);
//     },
// });
// ```
export const makeForce = function (items) {

    if (!items) return false;
    return new Force(items);
};

constructors.Force = Force;


// #### Gravity force
// Seeing as it's such a common requirement, we pre-create it here
makeForce({

    name: GRAVITY,
    action: (particle, world) => {

        const {mass, load} = particle;

        const c = requestVector();

        c.setFromVector(world.gravity).scalarMultiply(mass);
        load.vectorAdd(c);

        releaseVector(c);
    },
});
