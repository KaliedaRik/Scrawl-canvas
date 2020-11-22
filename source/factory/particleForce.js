// # Force factory
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
// A Scrawl-canvas __Force__ object is, essentially, a wrapper around an `action` function which calculates a force operating on a particle. The force object __must__ have a unique name. Also ...
//
// The action function __must__ accept three arguments, in the following order:
// + a Particle object
// + a World object
// + a Cell object
//
// The function __must add__ the result of its calculation to the Particle object's `load` Vector.
//
// ... See the __gravity force__, below, for an example of how to construct a Force object.
//
// The Force factory uses the Base mixin, thus Force objects can be cloned and killed like other Scrawl-canvas objects. Force objects are stored in the `scrawl.library.force` section of the Scrawl-canvas library object.


// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-007](../../demo/particles-007.html) - Particle Force objects: generation and functionality
// + [particles-008](../../demo/particles-008.html) - Net entity: generation and basic functionality, including Spring objects
// + [particles-009](../../demo/particles-009.html) - Net particles: drag-and-drop functionality
// + [particles-012](../../demo/particles-012.html) - Use Net entity particles as reference coordinates for other artefacts


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique, λnull, isa_fn } from '../core/utilities.js';

import { requestVector, releaseVector } from './vector.js';

import baseMix from '../mixin/base.js';


// #### Force constructor
const Force = function (items = {}) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);

    this.set(items);

    if (!this.action) this.action = λnull;

    return this;
};


// #### Force prototype
let P = Force.prototype = Object.create(Object.prototype);
P.type = 'Force';
P.lib = 'force';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Force attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

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
let S = P.setters;

S.action = function (item) {

    if (isa_fn(item)) this.action = item;
    else this.action = λnull;
}


// #### Factory
const makeForce = function (items) {
    return new Force(items);
};

constructors.Force = Force;


makeForce({

    name: 'gravity',
    action: (particle, world, host) => {

        let {mass, load} = particle;

        let c = requestVector();

        c.setFromVector(world.gravity).scalarMultiply(mass);
        load.vectorAdd(c);

        releaseVector(c);
    },
});


// #### Exports
export {
    makeForce,
};

