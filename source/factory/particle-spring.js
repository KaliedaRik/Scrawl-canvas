// # Spring factory
// Spring objects are used to define a constraint (connection) between two particles in a system.


// #### Imports
import { constructors, particle } from '../core/library.js';

import { doCreate, mergeOver, pushUnique, Ωempty } from '../helper/utilities.js';

import { releaseVector, requestVector } from '../untracked-factory/vector.js';

import baseMix from '../mixin/base.js';

// Shared constants
import { T_PARTICLE } from '../helper/shared-vars.js';

// Local constants
const SPRING = 'spring',
    T_SPRING = 'Spring';


// #### Spring constructor
const Spring = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);

    this.set(items);

    return this;
};


// #### Spring prototype
const P = Spring.prototype = doCreate();
P.type = T_SPRING;
P.lib = SPRING;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Spring attributes
const defaultAttributes = {

    // __particleFrom__, __particleTo__ - String name of a Particle, or the Particle object itself. These attributes hold references to the Particle objects involved in this constraint.
    particleFrom: null,
    particleFromIsStatic: false,

    particleTo: null,
    particleToIsStatic: false,

    // `springConstant` - float Number. Larger values make the spring stiffer. Suggested values: 5 - 300
    springConstant: 50,

    // `damperConstant` - float Number. Larger values forces the spring to take a longer time to come to equilibrium. Suggested values: 5 - 50
    damperConstant: 10,

    // `restLength` - The spring's ideal length - the further away from its ideal, the more force the spring will apply to its connected body objects to get them back to their optimal distance
    restLength: 1,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetObjects = pushUnique(P.packetObjects, ['particleFrom', 'particleTo']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.kill = function () {

    this.deregister();

    return true;
};


// #### Get, Set, deltaSet
const S = P.setters;

// `particleFrom`, `particleTo`
S.particleFrom = function (item) {

    if (item.substring) item = particle[item];

    if (item && item.type === T_PARTICLE) this.particleFrom = item;
};
S.particleTo = function (item) {

    if (item.substring) item = particle[item];

    if (item && item.type === T_PARTICLE) this.particleTo = item;
};


// #### Prototype functions
// `applySpring` - internal function
P.applySpring = function () {

    const { particleFrom, particleTo, particleFromIsStatic, particleToIsStatic, springConstant, damperConstant, restLength } = this;

    if (!(particleFrom && particleTo)) return;

    const { position: fromPos, velocity: fromVel, load: fromLoad } = particleFrom;
    const { position: toPos,   velocity: toVel,   load: toLoad   } = particleTo;

    const dPos = requestVector(toPos).vectorSubtract(fromPos);
    const len = dPos.getMagnitude();

    if (!len) {

        releaseVector(dPos);
        return;
    }

    const n = requestVector(dPos).normalize();
    const dVel = requestVector(toVel).vectorSubtract(fromVel);

    const force = requestVector(n).scalarMultiply(springConstant * (len - restLength));

    const vAlong = dVel.getDot(n);

    force.vectorAddScaled(n, damperConstant * vAlong);

    if (!particleFromIsStatic)fromLoad.vectorAdd(force);

    if (!particleToIsStatic) toLoad.vectorSubtract(force);

    releaseVector(dPos, n, dVel, force);
};


// #### Factory
// ```
// scrawl.makeNet({
//
//     name: 'test-net',
//
//     generate: function () {
//
//         let { name, particleStore, springs, springConstant, damperConstant } = this;
//
//         let leftParticle, rightParticle;
//
//         // generate particles
//         leftParticle = makeParticle({
//
//             name: `${name}-left`,
//
//             positionX: 0,
//             positionY: 0,
//         });
//
//         rightParticle = leftParticle.clone({
//
//             name: `${name}-right`,
//             positionX: 100,
//         });
//
//         leftParticle.run(0, 0, false);
//         rightParticle.run(0, 0, false);
//
//         particleStore.push(leftParticle, rightParticle);
//
//         // generate spring
//         let mySpring = makeSpring({
//
//             name: `${name}-link-${i}-${i+1}`,
//
//             particleFrom: leftParticle,
//             particleTo: rightParticle,
//
//             springConstant,
//             damperConstant,
//
//             restLength: 100,
//         });
//
//         springs.push(mySpring);
//     },
//
//     ...
//
// }).run();
// ```
export const makeSpring = function (items) {

    if (!items) return false;
    return new Spring(items);
};

constructors.Spring = Spring;
