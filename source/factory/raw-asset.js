// # RawAsset factory
// The Scrawl-canvas RawAsset object allows developers to extend the ability and functionality of the library. It can:
// + Act as a link between third-party code and Scrawl-canvas, for instance allowing us to use the output of a Delauney triangulation library to render Voronoi cells into a Scrawl-canvas scene
// + Interpret the output of complex machine learning models (for instance: TensorFlow and MediaPipe models) to build real-time scenes
// + Build complex displays from simpler building blocks - for instance by interpreting the output from a NoiseAsset object to process an image asset, allowing us to simulate impressionistic styles of painting.


// #### Demos:
// + [Canvas-052](../../demo/canvas-052.html) - Create and use a RawAsset object to modify an image asset
// + [Delaunator-002](../../demo/delaunator-002.html) - Responsive Voronoi cells in a RawAsset wrapper
// + [MediaPipe-001](../../demo/mediapipe-001.html) - MediaPipe Selfie Segmentation - model image output
// + [MediaPipe-002](../../demo/mediapipe-002.html) - MediaPipe Face Mesh - model image output
// + [MediaPipe-003](../../demo/mediapipe-003.html) - MediaPipe Face Mesh - working with the mesh coordinates
// + [TensorFlow-001](../../demo/tensorflow-001.html) - Tensorflow tfjs-models / body-pix experiment - follow my eyes
// + [TensorFlow-002](../../demo/tensorflow-002.html) - Tensorflow tfjs-models / body-pix experiment - model image output


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, isa_fn, mergeOver, xt, λnull, λthis, Ωempty } from '../core/utilities.js';

import { makeQuaternion } from './quaternion.js';
import { makeVector } from './vector.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';

import { _2D, _entries, ASSET, CANVAS, T_COORDINATE, T_QUATERNION, T_RAW_ASSET, T_VECTOR } from '../core/shared-vars.js';


// #### RawAsset constructor
const RawAsset = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.subscribers = [];

    this.set(this.defs);

    this.updateSource = λnull;

    const keytypes = items.keytypes || {};

    if (items.userAttributes) {

        items.userAttributes.forEach(att => {

            this.addAttribute(att);

            if (att.type) keytypes[att.key] = att.type;
        });
    }

    this.initializeAttributes(keytypes);

    this.set(items);

    const cell = document.createElement(CANVAS);
    cell.width = 0;
    cell.height = 0;

    this.element = cell;
    this.engine = cell.getContext(_2D, {willReadFrequently: true});

    if (items.subscribe) this.subscribers.push(items.subscribe);

    return this;
};


// #### RawAsset prototype
const P = RawAsset.prototype = doCreate();
P.type = T_RAW_ASSET;
P.lib = ASSET;
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
baseMix(P);
assetMix(P);


// #### RawAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
// + The __element__ and __engine__ attributes are excluded from the defaults object
const defaultAttributes = {

    // __keytypes__ - a Javascript object made up of `key:String` attributes. Used as part of the factory when generating assets which use user-defined attributes that need to be Scrawl-canvas Quaternions, Vectors (like gravity) or Coordinates.
    // + the `key` should be the attribute's name
    // + the `value` should be a String - either `'Quaternion'`, `'Vector'` or `'Coordinate'`.
    keytypes: null,

    // __data__ - can be anything which needs to be processed and then applied to the canvas to create a source image for Picture entitys, Pattern styles, or filters.
    data: null,

    // __updateSource__ - a user-defined function which will be run every time a subscriber invokes checkSource when the `dirtyData` flag is set to true
    // + At a minimum, the function will need to set the canvas element's dimensions (__width__ and __height__, both Numbers) and make an effort to draw something onto the canvas element 
    updateSource: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// Assets do not take part in the packet or clone systems; they can, however, be used for importing and actioning packets as they retain those base functions
P.saveAsPacket = function () {

    return [this.name, this.type, this.lib, {}];
};
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;


// #### Clone management
P.clone = λthis;


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __source, engine__
S.source = λnull;
S.element = λnull;
S.engine = λnull;

S.data = function (item) {

    if (item) {

        this.data = item;
        this.dirtyData = true;
    }
};

S.updateSource = function (item) {

    if (item && isa_fn(item)) {

        this.updateSource = item;
        this.dirtyData = true;
    }
};


// #### Prototype functions

// `checkSource`
// + Gets invoked by subscribers (who have a handle to the asset instance object) as part of the display cycle.
P.checkSource = function (width, height) {

    if (!this.source) this.source = this.element;

    const source = this.source;

    if (source) {

        let notify = false;

        if (this.dirtyData) {

            this.dirtyData = false;
            this.updateSource(this);
            notify = true;
        }

        this.sourceLoaded = true;

        if (!this.sourceNaturalWidth || !this.sourceNaturalHeight || this.sourceNaturalWidth != width || this.sourceNaturalHeight != height) {

            this.sourceNaturalWidth = source.width;
            this.sourceNaturalHeight = source.height;
            notify = true;
        }

        if (notify && this.sourceNaturalWidth && this.sourceNaturalHeight) this.notifySubscribers();
    }
    else this.sourceLoaded = false;
};

// `subscribeAction` - Overrides mixin/asset.js function
P.subscribeAction = function (sub = {}) {

    this.subscribers.push(sub);
    sub.asset = this;
    sub.source = this.element;
    this.notifySubscriber(sub)
};

// `addAttribute`, `removeAttribute` - we can use these functions to add and remove other attributes to the RawAsset object.
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
// ```
export const makeRawAsset = function (items) {

    if (!items) return false;
    return new RawAsset(items);
};

constructors.RawAsset = RawAsset;
