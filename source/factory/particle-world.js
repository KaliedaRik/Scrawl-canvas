// # World factory
// World objects can store attributes and values used by various objects; these attributes can be set up so that they will be inherited by clones of the World object. We can also influence the speed of the physics animation here.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, isa_fn, mergeOver, xt, Ωempty } from '../helper/utilities.js';

import { makeQuaternion } from '../untracked-factory/quaternion.js';
import { makeVector } from '../untracked-factory/vector.js';
import { makeCoordinate } from '../untracked-factory/coordinate.js';

import baseMix from '../mixin/base.js';

// Shared constants
import { _entries, T_COORDINATE, T_QUATERNION, T_VECTOR, T_WORLD } from '../helper/shared-vars.js';

// Local constants
const WORLD = 'world';


// #### World constructor
const World = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    const keytypes = items.keytypes || {};
    if (!keytypes.gravity) keytypes.gravity = T_VECTOR;
    if (!items.gravity) items.gravity = [0, 9.81, 0];

    if (items.userAttributes) {

        items.userAttributes.forEach(att => {

            this.addAttribute(att);

            if (att.type) keytypes[att.key] = att.type;
        });
    }

    this.initializeAttributes(keytypes);

    this.set(this.defs);

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

    for (const [key, value] of _entries(types)) {

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
