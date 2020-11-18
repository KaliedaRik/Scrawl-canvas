// # World factory
// The world factory object defines values to be used when calculating particle mechanics motion and position. This includes the 3-dimensional value of gravity.
//
// One key difference between World objects and other Scrawl-canvas objects is that we can define additional attributes (including their getter and setter functions) on the object using the `addAttribute` (and `removeAttribute`) functions.

// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-002](../../demo/particles-002.html) - Emitter using artefacts
// + [particles-003](../../demo/particles-003.html) - Position Emitter entity: start; pivot; mimic; path; mouse; drag-and-drop
// + [particles-004](../../demo/particles-004.html) - Emit particles along the length of a path
// + [particles-005](../../demo/particles-005.html) - Emit particles from inside an artefact's area
// + [particles-006](../../demo/particles-006.html) - Fixed number of Particles in a field; preAction and postAction functionality
// + [particles-007](../../demo/particles-007.html) - Particle Force objects: generation and functionality
// + [particles-008](../../demo/particles-008.html) - Net entity: generation and basic functionality, including Spring objects
// + [particles-009](../../demo/particles-009.html) - Net particles: drag-and-drop; collisions




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

    if (!this.action) this.action = λnull;

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

    // __airDensity__, measured in kilograms/meter3 (used in `air-drag` force calculations)
    airDensity: 1.23,

    // __worldScale__ - where a value of 1 represents 1px == 1meterSquared (used in `air-drag` force calculations)
    worldScale: 0.0001,

    // __tickMultiplier__ - a positive float Number value. Larger values increase the physics effect - equivalent to speeding up the animation
    tickMultiplier: 1,

    // __keytypes__ - a Javascript object made up of `key:String` attributes. Used as part of the factory when generating worlds which use user-defined attributes that need to be Scrawl-canvas Quaternions, Vectors (like gravity) or Coordinates.
    // + the `key` should be the attribute's name
    // + the `value` should be a String - either `'Quaternion'`, `'Vector'` or `'Coordinate'`.
    keytypes: null,
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

