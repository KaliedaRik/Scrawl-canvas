// # ParticleHistory factory
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
// Because of the number of ParticleHistory arrays that can be generated and discarded in even a simple particle physics animation, Scrawl-canvas includes functionality to pool and reuse ParticleHistory arrays. The exported functions `requestParticleHistoryObject` and `releaseParticleHistoryObject` give us access to the pool mechanism.


// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-002](../../demo/particles-002.html) - Emitter using artefacts
// + [particles-005](../../demo/particles-005.html) - Emit particles from inside an artefact's area
// + [particles-011](../../demo/particles-011.html) - Tracer entity: basic functionality
// + [particles-012](../../demo/particles-012.html) - Use Net entity particles as reference coordinates for other artefacts


// #### Imports
import { constructors } from '../core/library.js';

import { _create, _seal, _setPrototypeOf, T_PARTICLE_HISTORY } from '../core/shared-vars.js';


// #### ParticleHistory constructor
const ParticleHistory = function () {

    const h = Array(4).fill(0);

    _setPrototypeOf(h, ParticleHistory.prototype);

    return _seal(h);
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

    return particleHistoryPool.shift();
};

// `exported function` - return a ParticleHistory array to the history pool. Failing to return arrays to the pool may lead to more inefficient code and possible memory leaks.
export const releaseParticleHistory = function (h) {

    if (h && h.type == T_PARTICLE_HISTORY) {

        h.fill(0);
        particleHistoryPool.push(h);

        // Do not keep excessive numbers of under-utilised arrays in the pool
        if (particleHistoryPool.length > 100) particleHistoryPool.length = 0;
    }
};

constructors.ParticleHistory = ParticleHistory;
