// # Spring factory
// Details

// #### Demos:
// + [particles-008](../../demo/particles-008.html) - Net entity: generation and basic functionality, including Spring objects
// + [particles-009](../../demo/particles-009.html) - Net particles: drag-and-drop functionality
// + [particles-010](../../demo/particles-010.html) - Net entity: using a shape path as a net template


// #### Imports
import { constructors, particle } from '../core/library.js';
import { mergeOver, pushUnique, λnull, isa_fn } from '../core/utilities.js';

import { requestVector, releaseVector } from './vector.js';

import baseMix from '../mixin/base.js';


// #### Spring constructor
const Spring = function (items = {}) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);

    this.set(items);

    if (!this.action) this.action = λnull;

    return this;
};


// #### Spring prototype
let P = Spring.prototype = Object.create(Object.prototype);
P.type = 'Spring';
P.lib = 'spring';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Spring attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [tween mixin](../mixin/tween.html): __order__, __ticker__, __targets__, __time__, __action__, __reverseOnCycleEnd__, __reversed__.
let defaultAttributes = {

    particleFrom: null,
    particleFromIsStatic: false,

    particleTo: null,
    particleToIsStatic: false,

    // `springConstant` - Larger values make the spring stiffer. Suggested values: 5 - 300
    springConstant: 50,

    // `damperConstant` - Larger values forces the spring to take a longer time to come to equilibrium. Suggested values: 5 - 50
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
let S = P.setters;

S.particleFrom = function (item) {

    if (item.substring) item = particle[item];

    if (item && item.type === 'Particle') this.particleFrom = item;
};

S.particleTo = function (item) {

    if (item.substring) item = particle[item];

    if (item && item.type === 'Particle') this.particleTo = item;
};


P.applySpring = function () {

    let {particleFrom, particleTo, particleFromIsStatic, particleToIsStatic, springConstant, damperConstant, restLength} = this;

    if (particleFrom && particleTo) {

        let {position: fromPosition, velocity: fromVelocity, load: fromLoad} = particleFrom;
        let {position: toPosition, velocity: toVelocity, load: toLoad} = particleTo;

        let dVelocity = requestVector(toVelocity).vectorSubtract(fromVelocity),
            dPosition = requestVector(toPosition).vectorSubtract(fromPosition);

        let firstNorm = requestVector(dPosition).normalize(),
            secondNorm = requestVector(firstNorm);

        firstNorm.scalarMultiply(springConstant * (dPosition.getMagnitude() - restLength));
        dVelocity.vectorMultiply(secondNorm).scalarMultiply(damperConstant).vectorMultiply(secondNorm);

        let force = requestVector(firstNorm).vectorAdd(dVelocity);

        if (!particleFromIsStatic) fromLoad.vectorAdd(force);
        if (!particleToIsStatic) toLoad.vectorSubtract(force);

        releaseVector(dVelocity, dPosition, firstNorm, secondNorm, force);
    }
};


// #### Factory
const makeSpring = function (items) {
    return new Spring(items);
};

constructors.Spring = Spring;


// #### Exports
export {
    makeSpring,
};

