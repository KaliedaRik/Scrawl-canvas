// # Loom factory
// A Loom offers functionality to render an image onto a &lt;canvas> element, where the image is not a rectangle - it can have curved borders. It can also offer the illusion of flat 3D images in the canvas, giving them perspective.
//
// Loom entitys are ___composite entitys___ - an entity that relies on other entitys for its basic functionality.
// + Every Loom object requires two (or one) path-enabled [Shape](./shape.html) entitys to act as its left and right tracks.
// + A Loom entity also requires a [Picture](./picture.html) entity to act as its image source.
// + Looms can use CSS color Strings for their strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects.
// + They can use __Anchor__ objects for user navigation.
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__.
// + They can be __animated__ directly, or using delta animation, or act as the target for __Tween__ animations.
// + Looms can be cloned, and killed.
//
// ___Note that this is experimental technology!___
// + Current code does not use [position](./mixin/position.html) or [entity](./mixin/entity.html) mixins, meaning much of the code here has been copied over from those mixins (DRY issue).
// + TODO: clone functionality not yet tested. A possible use case is to clome a Loom so they share the same Shape struts, but have different Picture sources and `from/toPathStart/End` cursor values - multiple images tracked and animated.


// #### Demos:
// + [Canvas-024](../../demo/canvas-024.html) - Loom entity functionality
// + [DOM-015](../../demo/dom-015.html) - Use stacked DOM artefact corners as pivot points


// #### Imports
import { artefact, constructors, group } from '../core/library.js';

import { addStrings, doCreate, mergeDiscard, mergeOver, pushUnique, removeItem, xta, λnull, λthis, Ωempty } from '../core/utilities.js';

import { currentCorePosition } from '../core/user-interaction.js';

import { makeState } from './state.js';

import { releaseCell, requestCell } from './cell-fragment.js';

import { currentGroup } from './canvas.js';

import baseMix from '../mixin/base.js';
import deltaMix from '../mixin/delta.js';
import hiddenElementsMix from '../mixin/hiddenDomElements.js';
import anchorMix from '../mixin/anchor.js';
import buttonMix from '../mixin/button.js';

import { _atan2, _ceil, _cos, _floor, _hypot, _isArray, _keys, _max, _min, _parse, _piHalf, _sin, BLACK, DESTINATION_OUT, ENTITY, FILL, GOOD_HOST, NAME, SOURCE_OVER, STATE_KEYS, T_GROUP, T_LOOM, T_PICTURE, UNDEF, ZERO_STR } from '../core/shared-vars.js';


// #### Loom constructor
const Loom = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.state = makeState(Ωempty);

    this.modifyConstructorInputForAnchorButton(items);

    this.set(this.defs);

    if (!items.group) items.group = currentGroup;

    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    this.delta = {};

    this.set(items);

    this.fromPathData = [];
    this.toPathData = [];

    this.watchFromPath = null;
    this.watchIndex = -1;
    this.engineInstructions = [];
    this.engineDeltaLengths = [];

    return this;
};


// #### Loom prototype
const P = Loom.prototype = doCreate();
P.type = T_LOOM;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
deltaMix(P);
hiddenElementsMix(P);
anchorMix(P);
buttonMix(P);


// #### Loom attributes
const defaultAttributes = {

// __fromPath__, __toPath__ - A Loom entity uses 2 Shape paths to construct a frame between which the image will be redrawn. These attributes can be set using the Shapes' name-String, or the Shape objects themselves
// + The positioning, scaling etc of each strut is set in the constituent Shape entitys, not the Loom entity.
// + We can use a single path for both attributes, though nothing will show if the `start/end` attributs do not have differing values.
    fromPath: null,
    toPath: null,

// __fromPathStart__, __fromPathEnd__ and __toPathStart__, __toPathEnd__ - float Numbers generally between `0.0 - 1.0` - The Loom entity can set the start and end cursors on each of its path struts, between which the image will be drawn.
// + These can be animated to allow the image to _flow_ between one part of the display and another, changing its shape as it moves.
    fromPathStart: 0,
    fromPathEnd: 1,

    toPathStart: 0,
    toPathEnd: 1,

// __synchronizePathCursors__ - Boolean flag - To make sure the `from...` and `to...` strut start points, and end points, have the same value set the attribute to `true` (default).
// + Setting it to `false` allows the cursors to be set independently on each strut ... which in turn may lead to unexpected display consequences.
    synchronizePathCursors: true,

//  __loopPathCursors__ - Boolean flag - For animation purposes, the image will move between the struts with the bottom of the page appearing again at the top of the Loom as it moves down (and vice versa).
// + To change this functionality - so that the image slowly disappears as it animates up and down past the ends of the struts, set the attribute to `false`.
    loopPathCursors: true,
    constantPathSpeed: true,

// __isHorizontalCopy__ - Boolean flag - Copying the source image to the output happens, by default, by rows - which effectively means the struts are on the left-hand and right-hand edges of the image.
// + To change this to columns (which sets the struts to the top and bottom edges of the image) set the attribute to `false`
    isHorizontalCopy: true,

// __showBoundingBox__ (Boolean), __boundingBoxColor__ (CSS color String) - Mainly for library development/testing work - shows the loom entity's bounding box - which is calculated from the constituent Shape entitys' current bounding boxes.
    showBoundingBox: false,
    boundingBoxColor: BLACK,

// __source__ - The Picture entity source for this loom. For initialization and/or `set`, we can supply either the Picture entity itself, or its name-String value.
// + The content image displayed by the Loom entity are set in the Picture entity, not the Loom, and can be any artefact supported by the Picture (image, video, sprite, or a Cell artefact).
// + Note that any ___filters should be applied to the Picture entity___; Loom entitys do not support filter functionality but will apply a Picture's filters to the source image as-and-where appropriate.
    source: null,

// __sourceIsVideoOrSprite__ - Boolean flag - If the Picture entity is hosting a video or sprite asset, we need to update the input on every frame.
// + It's easier to tell the Loom entity to do this using a flag, rather than get the Picture entity to update all its Loom subscribers on every display cycle.
// + For Pictures using image assets the flag must be set to `false` (the default); setting the flag to `true` will significantly degrade display and animation performance.
    sourceIsVideoOrSprite: false,

// The current Frame drawing process often leads to [moiré interference patterns](https://en.wikipedia.org/wiki/Moir%C3%A9_pattern) appearing in the resulting image. Scrawl-canvas uses a resize trick to blur out these patterns.
//
// __interferenceLoops__ (positive integer Number), __interferenceFactor__ (positive float Number) - The interferenceFactor attribute sets the resizing ratio; while he interferenceLoops attribute sets the number of times the image gets resized.
// + If inteference patterns still appear in the final image, tweak these values to see if a better output can be achieved.
    interferenceLoops: 2,
    interferenceFactor: 1.03,

// The Loom entity does not use the [position](./mixin/position.html) or [entity](./mixin/entity.html) mixins (used by most other entitys) as its positioning is entirely dependent on the position, rotation, scale etc of its constituent Shape path entity struts.
//
// It does, however, use these attributes (alongside their setters and getters): __visibility__, __order__, __delta__, __host__, __group__, __anchor__, __collides__.
    visibility: true,
    calculateOrder: 0,
    stampOrder: 0,
    host: null,
    group: null,
    anchor: null,

// __noCanvasEngineUpdates__ - Boolean flag - Canvas engine updates are required for the Loom's border - strokeStyle and line styling; if a Loom is to be drawn without a border, then setting this flag to `true` may help improve rendering efficiency.
    noCanvasEngineUpdates: false,


// __noDeltaUpdates__ - Boolean flag - Loom entitys support delta animation - achieved by updating the `...path` attributes by appropriate (and small!) values. If the Loom is not going to be animated by delta values, setting the flag to `true` may help improve rendering efficiency.
    noDeltaUpdates: false,


// __onEnter__, __onLeave__, __onDown__, __onUp__ - Loom entitys support ___collision detection___, reporting a hit when a test coordinate falls within the Loom's output image. As a result, Looms can also accept and act on the four __on__ functions - see [entity event listener functions](../mixin/entity.html#section-11) for more details.
    onEnter: null,
    onLeave: null,
    onDown: null,
    onUp: null,


// __noUserInteraction__ - Boolean flag - To switch off collision detection for a Loom entity - which might help improve rendering efficiency - set the flag to `true`.
    noUserInteraction: false,


// [Anchor objects](./anchor.html) can be assigned to Loom entitys, meaning the following attributes are supported:
// + anchorDescription
// + anchorType
// + anchorTarget
// + anchorRel
// + anchorReferrerPolicy
// + anchorPing
// + anchorHreflang
// + anchorHref
// + anchorDownload
//
// And the anchor attributes can also be supplied as a key:value object assigned to the __anchor__ attribute:
// ```
//     anchor: {
//         description
//         download
//         href
//         hreflang
//         ping
//         referrerpolicy
//         rel:
//         target:
//         anchorType
//         clickAction:
//     }
// ```
//
// Note that Loom entitys DO NOT SUPPORT the sensor component of the Scrawl-canvas collisions system and will return an empty array when asked to supply sensor coordinates for testing against other artefacts.

// __method__ - All normal Scrawl-canvas entity stamping methods are supported.
    method: FILL,


// Loom entitys support appropriate styling attributes, mainly for their stroke styles (used with the `draw`, `drawAndFill`, `fillAndDraw`, `drawThenFill` and `fillThenDraw` stamping methods).
// + These ___state___ attributes are stored directly on the object, rather than in a separate [State](./state.html) object.
//
// The following attributes are thus supported:
//
// Alpha and Composite operations will be applied to both the Loom entity's border (the Shape entitys, with connecting lines between their paths' start and end points) and fill (the image displayed between the Loom's struts)
// + __globalAlpha__
// + __globalCompositeOperation__
//
// All line attributes are supported
// + __lineWidth__
// + __lineCap__
// + __lineJoin__
// + __lineDash__
// + __lineDashOffset__
// + __miterLimit__
//
// The Loom entity's strokeStyle can be any style supported by Scrawl-canvas - color strings, gradient objects, and pattern objects
// + __strokeStyle__
//
// The shadow attributes will only be applied to the stroke (border), not to the Loom's fill (image)
// + __shadowOffsetX__
// + __shadowOffsetY__
// + __shadowBlur__
// + __shadowColor__
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['pathObject', 'state']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, ['^(local|dirty|current)', 'Subscriber$']);
P.packetObjects = pushUnique(P.packetObjects, ['group', 'fromPath', 'toPath', 'source']);
P.packetFunctions = pushUnique(P.packetFunctions, ['onEnter', 'onLeave', 'onDown', 'onUp']);

P.processPacketOut = function (key, value, incs) {

    let result = true;

    if(!incs.includes(key) && value === this.defs[key]) result = false;

    return result;
};

P.finalizePacketOut = function (copy, items) {

    const stateCopy = _parse(this.state.saveAsPacket(items))[3];
    copy = mergeOver(copy, stateCopy);

    copy = this.handlePacketAnchor(copy, items);

    return copy;
};

P.handlePacketAnchor = function (copy, items) {

    if (this.anchor) {

        const a = _parse(this.anchor.saveAsPacket(items))[3];
        copy.anchor = a;
    }
    return copy;
}


// #### Clone management
// TODO - this functionality is currently disabled, need to enable it and make it work properly
P.clone = λthis;


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __get__ - copied over from the entity mixin
P.get = function (item) {

    const getter = this.getters[item];

    if (getter) return getter.call(this);

    else {

        const state = this.state;

        let def = this.defs[item],
            val;

        if (def != null) {

            val = this[item];
            return (typeof val != UNDEF) ? val : def;
        }

        def = state.defs[item];

        if (def != null) {

            val = state[item];
            return (typeof val != UNDEF) ? val : def;
        }
        return null;
    }
};

// __set__ - copied over from the entity mixin.
P.set = function (items = Ωempty) {

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs,
            state = this.state;

        const stateSetters = (state) ? state.setters : Ωempty;
        const stateDefs = (state) ? state.defs : Ωempty;

        let fn, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key != NAME && value != null) {

                if (!STATE_KEYS.includes(key)) {

                    fn = setters[key];

                    if (fn) fn.call(this, value);
                    else if (typeof defs[key] != UNDEF) this[key] = value;
                }
                else {

                    fn = stateSetters[key];

                    if (fn) fn.call(state, value);
                    else if (typeof stateDefs[key] != UNDEF) state[key] = value;
                }
            }
        }
    }
    return this;
};

// __setDelta__ - copied over from the entity mixin.
P.setDelta = function (items = Ωempty) {

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.deltaSetters,
            defs = this.defs,
            state = this.state;

        const stateSetters = (state) ? state.deltaSetters : Ωempty;
        const stateDefs = (state) ? state.defs : Ωempty;

        let fn, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key != NAME && value != null) {

                if (!STATE_KEYS.includes(key)) {

                    fn = setters[key];

                    if (fn) fn.call(this, value);
                    else if (typeof defs[key] != UNDEF) this[key] = addStrings(this[key], value);
                }
                else {

                    fn = stateSetters[key];

                    if (fn) fn.call(state, value);
                    else if (typeof stateDefs[key] != UNDEF) state[key] = addStrings(state[key], value);
                }
            }
        }
    }
    return this;
};

// __host__, __getHost__ - copied over from the position mixin.
S.host = function (item) {

    if (item) {

        const host = artefact[item];

        if (host && host.here) this.host = host.name;
        else this.host = item;
    }
    else this.host = ZERO_STR;
};

// __group__ - copied over from the position mixin.
G.group = function () {

    return (this.group) ? this.group.name : ZERO_STR;
};
S.group = function (item) {

    let g;

    if (item) {

        if (this.group && this.group.type == T_GROUP) this.group.removeArtefacts(this.name);

        if (item.substring) {

            g = group[item];

            if (g) this.group = g;
            else this.group = item;
        }
        else this.group = item;
    }

    if (this.group && this.group.type == T_GROUP) this.group.addArtefacts(this.name);
};

// __getHere__ - returns current core position.
P.getHere = function () {

    return currentCorePosition;
};

// __delta__ - copied over from the position mixin.
S.delta = function (items) {

    if (items) this.delta = mergeDiscard(this.delta, items);
};


// __fromPath__
S.fromPath = function (item) {

    if (item) {

        const oldPath = this.fromPath,
            newPath = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newPath && newPath.name && newPath.useAsPath) {

            if (oldPath && oldPath.name != newPath.name) removeItem(oldPath.pathed, name);

            pushUnique(newPath.pathed, name);

            this.fromPath = newPath;

            this.dirtyStart = true;
        }
    }
};

// __toPath__
S.toPath = function (item) {

    if (item) {

        const oldPath = this.toPath,
            newPath = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newPath && newPath.name && newPath.useAsPath) {

            if (oldPath && oldPath.name != newPath.name) removeItem(oldPath.pathed, name);

            pushUnique(newPath.pathed, name);

            this.toPath = newPath;

            this.dirtyStart = true;
        }
    }
};

// __source__
S.source = function (item) {

    item = (item.substring) ? artefact[item] : item;

    if (item && item.type == T_PICTURE) {

        const src = this.source;

        if (src && src.type == T_PICTURE) src.imageUnsubscribe(this.name);

        this.source = item;
        item.imageSubscribe(this.name);
        this.dirtyInput = true;
    }
};

// __isHorizontalCopy__
S.isHorizontalCopy = function (item) {

    this.isHorizontalCopy = (item) ? true : false;
    this.dirtyPathData = true;
};

// __synchronizePathCursors__
S.synchronizePathCursors = function (item) {

    this.synchronizePathCursors = (item) ? true : false;

    if (item) {

        this.toPathStart = this.fromPathStart;
        this.toPathEnd = this.fromPathEnd;
    }

    this.dirtyPathData = true;
};

// __loopPathCursors__
S.loopPathCursors = function (item) {

    this.loopPathCursors = (item) ? true : false;

    if (item) {

        let c = this.fromPathStart;
        if (c < 0 || c > 1) this.fromPathStart = c - _floor(c);

        c = this.fromPathEnd
        if (c < 0 || c > 1) this.fromPathEnd = c - _floor(c);

        c = this.toPathStart
        if (c < 0 || c > 1) this.toPathStart = c - _floor(c);

        c = this.toPathEnd
        if (c < 0 || c > 1) this.toPathEnd = c - _floor(c);
    }

    this.dirtyOutput = true;
};

// __fromPathStart__
S.fromPathStart = function (item) {

    if (this.loopPathCursors && (item < 0 || item > 1)) item = item - _floor(item);
    this.fromPathStart = item;
    if (this.synchronizePathCursors) this.toPathStart = item;
    this.dirtyPathData = true;
};
D.fromPathStart = function (item) {

    let val = this.fromPathStart += item;

    if (this.loopPathCursors && (val < 0 || val > 1)) val = val - _floor(val);
    this.fromPathStart = val;
    if (this.synchronizePathCursors) this.toPathStart = val;
    this.dirtyPathData = true;
};

// __fromPathEnd__
S.fromPathEnd = function (item) {

    if (this.loopPathCursors && (item < 0 || item > 1)) item = item - _floor(item);
    this.fromPathEnd = item;
    if (this.synchronizePathCursors) this.toPathEnd = item;
    this.dirtyPathData = true;
};
D.fromPathEnd = function (item) {

    let val = this.fromPathEnd += item;

    if (this.loopPathCursors && (val < 0 || val > 1)) val = val - _floor(val);
    this.fromPathEnd = val;
    if (this.synchronizePathCursors) this.toPathEnd = val;
    this.dirtyPathData = true;
};

// __toPathStart__
S.toPathStart = function (item) {

    if (this.loopPathCursors && (item < 0 || item > 1)) item = item - _floor(item);
    this.toPathStart = item;
    if (this.synchronizePathCursors) this.fromPathStart = item;
    this.dirtyPathData = true;
};
D.toPathStart = function (item) {

    let val = this.toPathStart += item;

    if (this.loopPathCursors && (val < 0 || val > 1)) val = val - _floor(val);
    this.toPathStart = val;
    if (this.synchronizePathCursors) this.fromPathStart = val;
    this.dirtyPathData = true;
};

// __toPathEnd__
S.toPathEnd = function (item) {

    if (this.loopPathCursors && (item < 0 || item > 1)) item = item - _floor(item);
    this.toPathEnd = item;
    if (this.synchronizePathCursors) this.fromPathEnd = item;
    this.dirtyPathData = true;
};
D.toPathEnd = function (item) {

    let val = this.toPathEnd += item;

    if (this.loopPathCursors && (val < 0 || val > 1)) val = val - _floor(val);
    this.toPathEnd = val;
    if (this.synchronizePathCursors) this.fromPathEnd = val;
    this.dirtyPathData = true;
};


// #### Prototype functions

// `getHost` - copied over from the position mixin.
P.getHost = function () {

    if (this.currentHost) return this.currentHost;
    else if (this.host) {

        const host = artefact[this.host];

        if (host) {

            this.currentHost = host;
            this.dirtyHost = true;
            return this.currentHost;
        }
    }
    return currentCorePosition;
};

// Invalidate mid-init functionality
P.midInitActions = λnull;

// Force the Loom entity to update
// + Because it doesn't automatically keep check of changes in its picture source
P.update = function () {

    this.dirtyInput = true;
    this.dirtyOutput = true;
};


// #### Display cycle functionality

// `prepareStamp` - function called as part of the Display cycle `compile` step.
// + This function is called before we get into the entity stamp promise cascade (thus it's a synchronous function). This is where we need to check whether we need to recalculate the path data which we'll use later to build the Loom entity's output image.
// + We only need to recalculate the path data on the initial render, and afterwards when the __dirtyPathData__ flag has been set.
// + If we perform the recalculation, then we need to make sure to set the __dirtyOutput__ flag, which will trigger the output image build.
P.prepareStamp = function() {

    const fPath = this.fromPath,
        tPath = this.toPath;

    // Sanity check 1
    // + `getBoundingBox` will recalculate and set the `dirtyPathData` flag
    // + if paths have set the Loom's `dirtyStart` flag
    const [startX, startY] = this.getBoundingBox();

    // Sanity check 2
    // + we can set the `dirtyPathData` ourselves if paths `start/end` coordinates have changed
    // + in case Shape path `roll/scale/flip/etc` updates don't get messaged to the Loom entity
    if (!this.dirtyPathData) {

        const {x: testFromStartX, y: testFromStartY} = fPath.getPathPositionData(0);
        const {x: testFromEndX, y: testFromEndY} = fPath.getPathPositionData(1);
        const {x: testToStartX, y: testToStartY} = tPath.getPathPositionData(0);
        const {x: testToEndX, y: testToEndY} = tPath.getPathPositionData(1);

        const localPathTests = [testFromStartX, testFromStartY, testFromEndX, testFromEndY, testToStartX, testToStartY, testToEndX, testToEndY];

        if (!this.pathTests || this.pathTests.some((item, index) => item !== localPathTests[index])) {

            this.pathTests = localPathTests;
            this.dirtyPathData = true;
        }
    }

    if (this.dirtyPathData || !this.fromPathData.length) {

        this.dirtyPathData = false;

        this.watchIndex = -1;
        this.engineInstructions.length = 0;
        this.engineDeltaLengths.length = 0;

        const fromPathData = this.fromPathData;
        fromPathData.length = 0;

        const toPathData = this.toPathData;
        toPathData.length = 0;

        if(fPath && tPath) {

            const fPathLength = _ceil(fPath.length),
                tPathLength = _ceil(tPath.length);

            const pathSteps = this.setSourceDimension(_max(fPathLength, tPathLength));

            const fPathStart = this.fromPathStart,
                fPathEnd = this.fromPathEnd,
                tPathStart = this.toPathStart,
                tPathEnd = this.toPathEnd,
                pathSpeed = this.constantPathSpeed;

            let fPartial, tPartial;

            if (fPathStart < fPathEnd) fPartial = fPathEnd - fPathStart;
            else fPartial = fPathEnd + (1 - fPathStart);
            if (fPartial < 0.005) fPartial = 0.005;

            if (tPathStart < tPathEnd) tPartial = tPathEnd - tPathStart;
            else tPartial = tPathEnd + (1 - tPathStart);
            if (tPartial < 0.005) tPartial = 0.005;

            const minPartial = _ceil(_min(fPartial, tPartial)),
                pathDelta = 1 / (pathSteps * (1 / minPartial));

            let x, y, cursor;

            for (cursor = 0; cursor <= 1; cursor += pathDelta) {

                ({x, y} = fPath.getPathPositionData(cursor, pathSpeed));
                fromPathData.push([x - startX, y - startY]);

                ({x, y} = tPath.getPathPositionData(cursor, pathSpeed));
                toPathData.push([x - startX, y - startY]);
            }

            this.fromPathSteps = fPartial / minPartial;
            this.toPathSteps = tPartial / minPartial;

            this.watchFromPath = (this.fromPathSteps === 1) ? true : false;

            this.dirtyOutput = true;
        }
        else this.dirtyPathData = true;
    }

    // `prepareStampTabsHelper` is defined in the `mixin/hiddenDomElements.js` file - handles updates to anchor and button objects
    this.prepareStampTabsHelper();
};

// `setSourceDimension` - internal function called by `prepareStamp`.
// + We make the source dimensions a square of the longest path length
// + This way, we can do a horizontal scan, or a vertical scan with no further calculation
P.setSourceDimension = function (val) {

    // + `prepareStamp` does the dimension calculation itself, then supplies the new value
    // + we just need to update this.sourceDimension and set the dirtyInput flag
    if (val) {

        if (this.sourceDimension !== val) {

            this.sourceDimension = val;
            this.dirtyInput = true;
        }
    }

    // if other functions call setSourceDimension, they will do it without supplying a new value
    // + in which case we can calculate and update it here
    // + other functions do it as a sanity check
    else {

        const fPath = this.fromPath,
            tPath = this.toPath;

        if(fPath && tPath) {

            const fPathLength = _ceil(fPath.length),
                tPathLength = _ceil(tPath.length);

            const steps = _max(fPathLength, tPathLength);

            if (this.sourceDimension !== steps) this.sourceDimension = steps;
        }
        else this.sourceDimension = 0;
    }
    return this.sourceDimension;
};

// `simpleStamp` - Simple stamping is entirely synchronous
// + TODO: we may have to disable this functionality for the Loom entity, if we use a Web Assembly module for either the prepareStamp calculations, or to build the output image itself
P.simpleStamp = function (host, changes) {

    if (host && GOOD_HOST.includes(host.type)) {

        this.currentHost = host;

        if (changes) {

            this.set(changes);
            this.prepareStamp();
        }
        this.regularStamp();
    }
};

// `stamp` - All entity stamping, except for simple stamps, goes through this function.
// + While other entitys have to worry about applying filters as part of the stamping process, this is not an issue for Loom entitys because filters are defined on, and applied to, the source Picture entity, not the Loom itself
//
// Here we check which dirty flags need actioning, and call a range of different functions to process the work. These flags are:
// + `dirtyInput` - the Picture entity has reported a change in its source, or copy attributes)
// + `dirtyOutput` - to render the cleaned input, or take account that the Loom paths' cursors have changed)
P.stamp = function (force = false, host, changes) {

    if (force) {

        if (host && GOOD_HOST.includes(host.type)) this.currentHost = host;

        if (changes) {

            this.set(changes);
            this.prepareStamp();
        }
        return this.regularStamp();
    }

    if (this.visibility) {

        // if (this.sourceIsVideoOrSprite || this.dirtyInput) this.sourceImageData = this.cleanInput();
        if (this.sourceIsVideoOrSprite || this.dirtyInput) this.cleanInput();

        if (this.dirtyOutput) this.output = this.cleanOutput();

        this.regularStamp();
    }
};

// #### Clean functions

// `cleanInput` - internal function called by `stamp`
P.cleanInput = function () {

    this.dirtyInput = false;

    const sourceDimension = this.sourceDimension;

    if (!sourceDimension) {

        this.dirtyInput = true;
        return false;
    }

    const cell = requestCell(),
        engine = cell.engine,
        canvas = cell.element;

    canvas.width = sourceDimension;
    canvas.height = sourceDimension;
    engine.setTransform(1, 0, 0, 1, 0, 0);

    this.source.stamp(true, cell, {
        startX: 0,
        startY: 0,
        handleX: 0,
        handleY: 0,
        offsetX: 0,
        offsetY: 0,
        roll: 0,
        scale: 1,

        width: sourceDimension,
        height: sourceDimension,

        method: FILL,
    });

    this.sourceImageData = engine.getImageData(0, 0, sourceDimension, sourceDimension);

    releaseCell(cell);
    // return engine.getImageData(0, 0, sourceDimension, sourceDimension);
};

// `cleanOutput` - internal function called by `stamp`
// + If you're not a fan of big functions, please look away now.
P.cleanOutput = function () {

    this.dirtyOutput = false;

    const sourceDimension = this.sourceDimension,
        sourceData = this.sourceImageData;

    if (sourceDimension && sourceData) {

        const fromPathData = this.fromPathData,
            toPathData = this.toPathData,

            dataLen = fromPathData.length,

            fPathStart = this.fromPathStart,
            fStep = this.fromPathSteps || 1,

            tPathStart = this.toPathStart,
            tStep = this.toPathSteps || 1,

            magicVerticalPi = _piHalf - 1.5708,

            isHorizontalCopy = this.isHorizontalCopy,
            loop = this.loopPathCursors,

            watchFromPath = this.watchFromPath,
            engineInstructions = this.engineInstructions,
            engineDeltaLengths = this.engineDeltaLengths;

        let fCursor = fPathStart * dataLen,
            tCursor = tPathStart * dataLen,
            watchIndex = this.watchIndex,
            fx, fy, tx, ty, dx, dy, dLength, dAngle, cos, sin, i, j,
            instruction;

        let [, , outputWidth, outputHeight] = this.getBoundingBox();

        outputWidth = ~~outputWidth;
        outputHeight = ~~outputHeight;

        const inputCell = requestCell(),
            inputEngine = inputCell.engine,
            inputCanvas = inputCell.element;

        inputCanvas.width = sourceDimension;
        inputCanvas.height = sourceDimension;
        inputEngine.setTransform(1, 0, 0, 1, 0, 0);
        inputEngine.putImageData(sourceData, 0, 0);

        const outputCell = requestCell(),
            outputEngine = outputCell.engine,
            outputCanvas = outputCell.element;

        outputCanvas.width = outputWidth;
        outputCanvas.height = outputHeight;
        outputEngine.globalAlpha = this.state.globalAlpha;
        outputEngine.setTransform(1, 0, 0, 1, 0, 0);

        if(!engineInstructions.length) {

            for (i = 0; i < sourceDimension; i++) {

                if (watchIndex < 0) {

                    if (watchFromPath && fCursor < 1) watchIndex = i;
                    else if (!watchFromPath && tCursor < 1) watchIndex = i;
                }

                if (fCursor < dataLen && tCursor < dataLen && fCursor >= 0 && tCursor >= 0) {

                    [fx, fy] = fromPathData[_floor(fCursor)];
                    [tx, ty] = toPathData[_floor(tCursor)];

                    dx = tx - fx;
                    dy = ty - fy;

                    dLength = _hypot(dx, dy);

                    if (isHorizontalCopy) {

                        dAngle = -_atan2(dx, dy) + _piHalf;
                        cos = _cos(dAngle);
                        sin = _sin(dAngle);

                        engineInstructions.push([cos, sin, -sin, cos, fx, fy]);
                        engineDeltaLengths.push(dLength);
                    }
                    else {

                        dAngle = -_atan2(dx, dy) + magicVerticalPi;
                        cos = _cos(dAngle);
                        sin = _sin(dAngle);

                        engineInstructions.push([cos, sin, -sin, cos, fx, fy, dLength]);
                        engineDeltaLengths.push(dLength);
                    }
                }
                else {

                    engineInstructions.push(false);
                    engineDeltaLengths.push(false);
                }

                fCursor += fStep;
                tCursor += tStep;

                if (loop) {

                    if (fCursor >= dataLen) fCursor -= dataLen;
                    if (tCursor >= dataLen) tCursor -= dataLen;
                }
            }
            if (watchIndex < 0) watchIndex = 0;
            this.watchIndex = watchIndex;
        }

        if (isHorizontalCopy) {


            for (i = 0; i < sourceDimension; i++) {

                instruction = engineInstructions[watchIndex];

                if (instruction) {

                    outputEngine.setTransform(...instruction);
                    outputEngine.drawImage(inputCanvas, 0, ~~watchIndex, ~~sourceDimension, 1, 0, 0, ~~engineDeltaLengths[watchIndex], 1);
                }
                watchIndex++;

                if (watchIndex >= sourceDimension) watchIndex = 0;
            }
        }
        else {

            for (i = 0; i < sourceDimension; i++) {

                instruction = engineInstructions[watchIndex];

                if (instruction) {

                    outputEngine.setTransform(...instruction);
                    outputEngine.drawImage(inputCanvas, ~~watchIndex, 0, 1, ~~sourceDimension, 0, 0, 1, ~~engineDeltaLengths[watchIndex]);
                }
                watchIndex++;

                if (watchIndex >= sourceDimension) watchIndex = 0;
            }
        }

        const iFactor = this.interferenceFactor,
            iLoops = this.interferenceLoops,

            iWidth = ~~(outputWidth * iFactor) + 1,
            iHeight = ~~(outputHeight * iFactor) + 1;

        inputCanvas.width = iWidth;
        inputCanvas.height = iHeight;

        outputEngine.setTransform(1, 0, 0, 1, 0, 0);
        inputEngine.setTransform(1, 0, 0, 1, 0, 0);

        for (j = 0; j < iLoops; j++) {

            inputEngine.drawImage(outputCanvas, 0, 0, outputWidth, outputHeight, 0, 0, iWidth, iHeight);
            outputEngine.drawImage(inputCanvas, 0, 0, iWidth, iHeight, 0, 0, outputWidth, outputHeight);
        }

        const outputData = outputEngine.getImageData(0, 0, outputWidth, outputHeight);

        releaseCell(inputCell);
        releaseCell(outputCell);

        this.dirtyTargetImage = true;

        return outputData;
    }
    return false;
};

// `regularStamp` - internal function called by `stamp`
P.regularStamp = function () {

    const dest = this.currentHost;

    if (dest) {

        const engine = dest.engine;

        if (!this.noCanvasEngineUpdates) dest.setEngine(this);

        this[this.method](engine);
    }
};

// `getBoundingBox` - internal function called by `prepareStamp` and `cleanOutput` functions, as well as the various ___method___ functions.
// + Loom calculates its bounding box from the Shape path entitys associated with it
// + This function recalculates when presented with a `dirtyStart` flag - we rely on the Shape entitys to tell us when their paths have changed/updated
// + Results get stashed in the __boundingBox__ attribute for easier access, but all the method functions call this function just in case the box needs recalculating.
P.getBoundingBox = function () {

    const fPath = this.fromPath,
        tPath = this.toPath;

    if(fPath && tPath) {

        if (this.dirtyStart) {

            if (fPath.getBoundingBox && tPath.getBoundingBox) {

                this.dirtyStart = false;

/* eslint-disable-next-line */
                let [lsx, lsy, sw, sh, sx, sy] = fPath.getBoundingBox();
/* eslint-disable-next-line */
                let [lex, ley, ew, eh, ex, ey] = tPath.getBoundingBox();

                if (isNaN(lsx) || isNaN(lsy) || isNaN(sw) || isNaN(sh) || isNaN(sx) || isNaN(sy) || isNaN(lex) || isNaN(ley) || isNaN(ew) || isNaN(eh) || isNaN(ex) || isNaN(ey)) this.dirtyStart = true;

                if (lsx == lex && lsy == ley && sw == ew && sh == eh && sx == ex && sy == ey) this.dirtyStart = true;

                lsx += sx;
                lsy += sy;
                lex += ex;
                ley += ey;

                const minX = _min(lsx, lex),
                    maxX = _max(lsx + sw, lex + ew),
                    minY = _min(lsy, ley),
                    maxY = _max(lsy + sh, ley + eh);

                this.boundingBox = [minX, minY, maxX - minX, maxY - minY];

                this.dirtyPathData = true;
            }
            else this.boundingBox = [0, 0, 0, 0];
        }
    }
    else this.boundingBox = [0, 0, 0, 0];

    return this.boundingBox;
};


// ##### Stamp methods
// These 'method' functions stamp the Loom entity onto the canvas context supplied to them in the `engine` argument.

// `fill`
P.fill = function (engine) {


    this.doFill(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);

};

// `draw`
P.draw = function (engine) {

    this.doStroke(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `drawAndFill`
P.drawAndFill = function (engine) {

    this.doStroke(engine);
    this.currentHost.clearShadow();
    this.doFill(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `fillAndDraw`
P.fillAndDraw = function (engine) {

    this.doFill(engine);
    this.currentHost.clearShadow();
    this.doStroke(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `drawThenFill`
P.drawThenFill = function (engine) {

    this.doStroke(engine);
    this.doFill(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `fillThenDraw`
P.fillThenDraw = function (engine) {

    this.doFill(engine);
    this.doStroke(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `clear`
P.clear = function (engine) {

    const output = this.output,
        canvas = (this.currentHost) ? this.currentHost.element : false,
        gco = engine.globalCompositeOperation;

    if (output && canvas) {

        const tempCell = requestCell(),
            tempEngine = tempCell.engine,
            tempCanvas = tempCell.element;

        let [x, y, w, h] = this.getBoundingBox();

        x = ~~x;
        y = ~~y;
        w = ~~w;
        h = ~~h;

        tempCanvas.width = w;
        tempCanvas.height = h;

        tempEngine.putImageData(output, 0, 0);
        engine.setTransform(1, 0, 0, 1, 0, 0);
        engine.globalCompositeOperation = DESTINATION_OUT;
        engine.drawImage(tempCanvas, 0, 0, w, h, x, y, w, h);
        engine.globalCompositeOperation = gco;

        releaseCell(tempCell);
        if (this.showBoundingBox) this.drawBoundingBox(engine);
    }
};

// `none`, `clip`
P.none = λnull;
P.clip = λnull;

// These __stroke__ and __fill__ functions handle most of the stuff that the method functions require to stamp the Loom entity onto a canvas cell.

// `doStroke`
P.doStroke = function (engine) {

    const fPath = this.fromPath,
        tPath = this.toPath;

    if(fPath && fPath.getBoundingBox && tPath && tPath.getBoundingBox) {

        const host = this.currentHost;

        if (host) {

            const fStart = fPath.currentStampPosition,
                fEnd = fPath.getPathPositionData(1),
                tStart = tPath.currentStampPosition,
                tEnd = tPath.getPathPositionData(1);

            host.rotateDestination(engine, fStart[0], fStart[1], fPath);
            engine.stroke(fPath.pathObject);

            host.rotateDestination(engine, tStart[0], tStart[1], fPath);
            engine.stroke(tPath.pathObject);

            engine.setTransform(1, 0, 0, 1, 0, 0);
            engine.beginPath()
            engine.moveTo(fEnd.x, fEnd.y);
            engine.lineTo(tEnd.x, tEnd.y);
            engine.moveTo(...tStart);
            engine.lineTo(...fStart);
            engine.closePath();
            engine.stroke();
        }
    }
};

// `doFill`
// + Canvas API's `putImageData` function turns transparent pixels in the output into transparent in the host canvas - which is not what we want
// + Problem solved by putting output into a pool cell, then drawing it from there to the host cell
P.doFill = function (engine) {

    const output = this.output,
        canvas = (this.currentHost) ? this.currentHost.element : false;

    if (output && canvas) {

        const tempCell = requestCell(),
            tempEngine = tempCell.engine,
            tempCanvas = tempCell.element;

        let [x, y, w, h] = this.getBoundingBox();

        x = ~~x;
        y = ~~y;
        w = ~~w;
        h = ~~h;

        tempCanvas.width = w;
        tempCanvas.height = h;

        tempEngine.putImageData(output, 0, 0);
        engine.setTransform(1, 0, 0, 1, 0, 0);
        engine.drawImage(tempCanvas, 0, 0, w, h, x, y, w, h);

        releaseCell(tempCell);
    }
};

// `drawBoundingBox`
// + Usually only need to draw the bounding box during development work, to make sure the getBoundingBox calculation is operating correctly
P.drawBoundingBox = function (engine) {

    if (this.dirtyStart) this.getBoundingBox();

    engine.save();

    const t = engine.getTransform();
    engine.setTransform(1, 0, 0, 1, 0, 0);

    engine.strokeStyle = this.boundingBoxColor;
    engine.lineWidth = 1;
    engine.globalCompositeOperation = SOURCE_OVER;
    engine.globalAlpha = 1;
    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;

    engine.strokeRect(...this.boundingBox);

    engine.restore();
    engine.setTransform(t);
};


// #### Collision functionality

// The `checkHit` functionality can be used in the same way it is for other entitys (and groups)
// + One difference is that this function checks hits against an ImageData object, thus doesn't need to be supplied with a pool canvas so that it can do its job
// + Note: will check for the `dirtyTargetImage` flag, which normally gets checked as part of the rendering cycle
P.checkHit = function (items = []) {

    if (this.noUserInteraction) return false;

    const tests = (!_isArray(items)) ?  [items] : items,
        targetData = (this.output && this.output.data) ? this.output.data : false;

    let tx, ty, cx, cy, index;

    if (targetData) {

        const [x, y, w, h] = this.getBoundingBox();

        if (tests.some(test => {

            if (_isArray(test)) {

                tx = test[0];
                ty = test[1];
            }
            else if (xta(test, test.x, test.y)) {

                tx = test.x;
                ty = test.y;
            }
            else return false;

            if (!tx.toFixed || !ty.toFixed || isNaN(tx) || isNaN(ty)) return false;

            cx = tx - x;
            cy = ty - y;

            if (cx < 0 || cx > w || cy < 0 || cy > h) return false;

            index = (((cy * w) + cx) * 4) + 3;

            if (targetData) return (targetData[index] > 0) ? true : false;
            else return false;

        }, this)) {

            return {
                x: tx,
                y: ty,
                artefact: this
            };
        }
    }
    return false;
};


// #### Factory
// ```
// scrawl.makeQuadratic({
//
//     name: 'my-quad',
//     // [... rest of definition]
// });
//
// let myBez = scrawl.makeBezier({
//
//     name: 'my-bezier',
//     // [... rest of definition]
// });
//
// scrawl.makePicture({
//
//     name: 'myFlower',
//
//     // Loom will respect the Picture's copy attributes when creating its output
//     copyStartX: 0,
//     copyStartY: 0,
//
//     copyWidth: '100%',
//     copyHeight: '100%',
//
//     // Best practice - set visibility to false
//     visibility: false,
//
//     // [... rest of definition]
// });
//
// let myLoom = scrawl.makeLoom({
//
//     name: 'display-loom',
//
//     fromPath: 'my-quad',
//     toPath: myBez,
//
//     source: 'myFlower',
//
//     lineWidth: 2,
//     lineCap: 'round',
//     strokeStyle: 'orange',
//
//     boundingBoxColor: 'red',
//     showBoundingBox: true,
//
//     method: 'fillThenDraw',
// });
// ```
export const makeLoom = function (items) {

    if (!items) return false;
    return new Loom(items);
};

constructors.Loom = Loom;
