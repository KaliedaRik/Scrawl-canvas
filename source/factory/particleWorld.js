// # World factory
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


// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-002](../../demo/particles-002.html) - Emitter using artefacts
// + [particles-003](../../demo/particles-003.html) - Position Emitter entity: start; pivot; mimic; path; mouse; drag-and-drop
// + [particles-004](../../demo/particles-004.html) - Emit particles along the length of a path
// + [particles-005](../../demo/particles-005.html) - Emit particles from inside an artefact's area
// + [particles-006](../../demo/particles-006.html) - Fixed number of particles in a field; preAction and postAction functionality
// + [particles-007](../../demo/particles-007.html) - Particle Force objects: generation and functionality
// + [particles-008](../../demo/particles-008.html) - Net entity: generation and basic functionality, including Spring objects
// + [particles-009](../../demo/particles-009.html) - Net particles: drag-and-drop functionality
// + [particles-010](../../demo/particles-010.html) - Net entity: using a shape path as a net template
// + [particles-012](../../demo/particles-012.html) - Use Net entity particles as reference coordinates for other artefacts
// + [canvas-040](../../demo/canvas-040.html) - Trace out a Shape path over time


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, isa_fn, mergeOver, xt, Ωempty } from '../core/utilities.js';

import { makeQuaternion } from './quaternion.js';
import { makeVector } from './vector.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';

import { _entries, T_COORDINATE, T_QUATERNION, T_VECTOR, T_WORLD, WORLD } from '../core/shared-vars.js';


// #### World constructor
const World = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);

    let keytypes = items.keytypes || {};
    if (!keytypes.gravity) keytypes.gravity = T_VECTOR;
    if (!items.gravity) items.gravity = [0, 9.81, 0];

    if (items.userAttributes) {

        items.userAttributes.forEach(att => {

            this.addAttribute(att);

            if (att.type) keytypes[att.key] = att.type;
        });
    }

    this.initializeAttributes(keytypes);

    this.set(items);

    return this;
};


// #### World prototype
const P = World.prototype = doCreate();
P.type = T_WORLD;
P.lib = WORLD;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### World attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
const defaultAttributes = {

    // x, y and z components of __gravity__, measured in meters/secondSquared (used in `gravity` force calculations)
    gravity: null,

    // __tickMultiplier__ - a positive float Number value. Larger values increase the physics effect - equivalent to speeding up the animation
    tickMultiplier: 1,

    // __keytypes__ - a Javascript object made up of `key:String` attributes. Used as part of the factory when generating worlds which use user-defined attributes that need to be Scrawl-canvas Quaternions, Vectors (like gravity) or Coordinates.
    // + the `key` should be the attribute's name
    // + the `value` should be a String - either `'Quaternion'`, `'Vector'` or `'Coordinate'`.
    keytypes: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet management functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.kill = function () {

    this.deregister();

    return true;
};


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __gravity__, with pseudo-attributes _gravityX_, _gravityY_, _gravityZ_
S.gravityX = function (item) { if (this.gravity && xt(item)) this.gravity.setX(item); };
S.gravityY = function (item) { if (this.gravity && xt(item)) this.gravity.setY(item); };
S.gravityZ = function (item) { if (this.gravity && xt(item)) this.gravity.setZ(item); };
S.gravity = function (item) { if (this.gravity && xt(item)) this.gravity.set(item); };


// #### Prototype functions

// `addAttribute`, `removeAttribute` - we can use these functions to add and remove other attributes to the World object. See the following Demos for examples of constructing a World object and adding attributes to it: 
// + [particles-007](../../demo/particles-007.html) Particle Force objects: generation and functionality; and 
// + [particles-008](../../demo/particles-008.html) Net entity: generation and basic functionality, including Spring objects.
P.addAttribute = function (items = Ωempty) {

    const {key, defaultValue, setter, deltaSetter, getter} = items;

    if (key && key.substring) {

        this.defs[key] = xt(defaultValue) ? defaultValue : null;
        this[key] = xt(defaultValue) ? defaultValue : null;

        if (isa_fn(setter)) S[key] = setter;
        if (isa_fn(deltaSetter)) D[key] = deltaSetter;
        if (isa_fn(getter)) G[key] = getter;
    }
    return this;
};
P.removeAttribute = function (key) {

    if (key && key.substring) {

        delete this.defs[key];
        delete this[key];
        delete G[key];
        delete S[key];
        delete D[key];
    }

    return this;
};

// `initializeAttributes` - internal function called by the constructor.
P.initializeAttributes = function (types) {

    for (let [key, value] of _entries(types)) {

        switch (value) {

            case T_QUATERNION :
                this[key] = makeQuaternion();
                break;

            case T_VECTOR :
                this[key] = makeVector();
                break;

            case T_COORDINATE :
                this[key] = makeCoordinate();
                break;
        }
    }
};


// #### Factory
// ```
// scrawl.makeWorld({
//
//     name: 'demo-world',
//
//     tickMultiplier: 2,
//
//     userAttributes: [
//
//         {
//             key: 'testCoordinate', 
//             type: 'Coordinate',
//             getter: function () { return [].concat(this.testCoordinate) },
//             setter: function (item) { this.testCoordinate.set(item) },
//         },
//         {
//             key: 'particleColor', 
//             defaultValue: '#F0F8FF',
//         },
//     ],
//     testCoordinate: [100, 100],
// });
// ```
export const makeWorld = function (items) {

    if (!items) return false;
    return new World(items);
};

constructors.World = World;
