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




// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique, λnull, isa_fn, xt } from '../core/utilities.js';

import { makeQuaternion } from './quaternion.js';
import { makeVector } from './vector.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';


// #### World constructor
const World = function (items = {}) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);

    let keytypes = items.keytypes || {};
    if (!keytypes.gravity) keytypes.gravity = 'Vector';
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
let P = World.prototype = Object.create(Object.prototype);
P.type = 'World';
P.lib = 'world';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### World attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

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
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

S.gravityX = function (item) { if (this.gravity && xt(item)) this.gravity.setX(item); };
S.gravityY = function (item) { if (this.gravity && xt(item)) this.gravity.setY(item); };
S.gravityZ = function (item) { if (this.gravity && xt(item)) this.gravity.setZ(item); };
S.gravity = function (item) { if (this.gravity && xt(item)) this.gravity.set(item); };

P.addAttribute = function (items = {}) {

    let {key, defaultValue, setter, deltaSetter, getter} = items;

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

P.initializeAttributes = function (types) {

    for (let [key, value] of Object.entries(types)) {

        switch (value) {

            case 'Quaternion' :
                this[key] = makeQuaternion();
                break;

            case 'Vector' :
                this[key] = makeVector();
                break;

            case 'Coordinate' :
                this[key] = makeCoordinate();
                break;
        }
    }};


// #### Factory
const makeWorld = function (items) {
    return new World(items);
};

constructors.World = World;


// #### Exports
export {
    makeWorld,
};

