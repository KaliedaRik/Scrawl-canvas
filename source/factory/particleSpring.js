// # Spring factory
// The Scrawl-canvas particle physics engine is a simple system designed to allow developers a way to add particle-based effects to their canvas animation scenes. The physics engine is built on top of the following components:
// + [Particle objects](./particle.html), which represent a 3-dimensional coordinate - based on a Scrawl-canvas [Vector object](./vector.html) - and include a history of recent positions which we can use to determine how to display that particle on screen.
// + [History arrays](./particleHistory.html) which can be pooled (reused) to cut down on Array creation and distruction during the animation.
// + [Force objects](./particleForce.html) which define the general and occasional forces to be applied to each particle in the system as the animation progresses - a __gravity__ force object is pre-defined by Scrawl-canvas.
// + [Spring objects](./particleSpring.html) used to define a constraint (connection) between two particles in a system.
// + [World objects](./particleWorld.html) where we can store attributes and values used by various objects; these attributes can be set up so that they will be inherited by clones of the World object. We can also influence the speed of the physics animation here.
//
// We do not have to handle particle generation and manipulation ourselves. Instead, Scrawl-canvas gives us three dedicated __entitys__ which we use to add particle animation effects to the canvas scene. These entitys are:
// + [Tracer](./tracer.html) - this entity generates a single non-recycled (in other words: long lasting) particle with a history, which we can use to display trace effects in the animation.
// + [Emitter](./emitter.html) - an entity which generates a stream of short-lived, recycled particles, each with its own history. Emitters are highly versatile entitys which can generate a wide range of effects.
// + [Net](./net.html) - a (generally) larger entity which uses both forces and springs to manage the animation of its non-recycled particles. Note that other artefacts can use Net particles as a reference for their own positioning.
//
// #### Particle physics
// The Scrawl-canvas particle physics engine system is based on a fairly classical understanding of particle ___kinetics___ (applying forces and constraints to a small, spherical object in 3D space) and ___kinematics___ (the movement of the small object in response to the forces and constraints applied to it).
//
// A Scrawl-canvas __Spring__ object connects together two Particle objects, linking them together with a set of constraints which together exert a spring force on the Particles.
// + Currently Scrawl-canvas offers only the spring constraint for connecting Particles; it does not (yet) define joint or other types of constraint.
// + The [Net](./net.html) entity is, at the moment, the only entity which makes use of Spring objects.
//
// The Spring factory uses the Base mixin, thus Spring objects can be cloned and killed like other Scrawl-canvas objects. Spring objects are stored in the `scrawl.library.spring` section of the Scrawl-canvas library object.


// #### Demos:
// + [particles-008](../../demo/particles-008.html) - Net entity: generation and basic functionality, including Spring objects
// + [particles-009](../../demo/particles-009.html) - Net particles: drag-and-drop functionality
// + [particles-010](../../demo/particles-010.html) - Net entity: using a shape path as a net template


// #### Imports
import { constructors, particle } from '../core/library.js';
import { mergeOver, pushUnique, λnull } from '../core/utilities.js';

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
let defaultAttributes = {

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
let S = P.setters;

// `particleFrom`, `particleTo`
S.particleFrom = function (item) {

    if (item.substring) item = particle[item];

    if (item && item.type === 'Particle') this.particleFrom = item;
};
S.particleTo = function (item) {

    if (item.substring) item = particle[item];

    if (item && item.type === 'Particle') this.particleTo = item;
};


// #### Prototype functions
// `applySpring` - internal function
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

