// # Mesh factory
// The Scrawl-canvas Mesh entity applies a Net particle system to an image, allowing the image to be deformed by dragging particles around the canvas. This is a similar concept to [Photoshop warp meshes](https://helpx.adobe.com/uk/photoshop/using/warp-images-shapes-paths.html) and (more distantly) [the Gimp's cage tool](https://docs.gimp.org/2.10/en/gimp-tool-cage.html).
//
// Mesh entitys are ___composite entitys___ - an entity that relies on other entitys for its basic functionality.
// + Every Mesh object requires a [Net](./net.html) entity create the grid that it uses for transforming its image.
// + A Mesh entity also requires a [Picture](./picture.html) entity to act as its image source.
// + Meshes can (in theory) use CSS color Strings for their strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects.
// + They can (in theory) use __Anchor__ objects for user navigation.
// + They can (in theory) be rendered to the canvas by including them in a __Cell__ object's __Group__.
// + They can (in theory) be __animated__ directly, or using delta animation, or act as the target for __Tween__ animations.
// + Meshes can (in theory) be cloned, and killed.
//
// ___Note that this is experimental technology!___
// + The Mesh entity code base shares many similarities to that of the Loom entity; some of the code has been copied over from that file directly.
// + Current code does not use [position](./mixin/position.html) or [entity](./mixin/entity.html) mixins, meaning much of the code here has been copied over from those mixins (DRY issue).
// + TODO: packet management, clone and kill functionality not yet tested. Much of the other functionality also lacks tests.


// #### Demos:
// + [Particles-008](../../demo/particles-008.html) - Net entity: generation and basic functionality, including Spring objects
// + [Particles-016](../../demo/particles-016.html) - Mesh entitys


// #### Imports
import { artefact, constructors, group } from '../core/library.js';

import { addStrings, doCreate, mergeOver, pushUnique, xta, λnull, λthis, Ωempty } from '../helper/utilities.js';

import { currentCorePosition } from '../core/user-interaction.js';

import { makeState } from './state.js';

import { releaseCell, requestCell } from '../helper/cell-fragment.js';

import { releaseArray, requestArray } from '../helper/array-pool.js';

import { currentGroup } from './canvas.js';

import baseMix from '../mixin/base.js';
import deltaMix from '../mixin/delta.js';
import hiddenElementsMix from '../mixin/hiddenDomElements.js';
import anchorMix from '../mixin/anchor.js';
import buttonMix from '../mixin/button.js';

import { _atan2, _ceil, _isArray, _keys, _max, _min, _parse, _piHalf, _sqrt, ARG_SPLITTER, DESTINATION_OUT, ENTITY, FILL, NAME, STATE_KEYS, T_CELL, T_GROUP, T_MESH, T_NET, T_PICTURE, UNDEF, ZERO_STR } from '../helper/shared-vars.js';


// #### Mesh constructor
const Mesh = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.modifyConstructorInputForAnchorButton(items);

    this.set(this.defs);

    this.state = makeState();

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


// #### Mesh prototype
const P = Mesh.prototype = doCreate();
P.type = T_MESH;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
deltaMix(P);
hiddenElementsMix(P);
anchorMix(P);
buttonMix(P);


// #### Mesh attributes
const defaultAttributes = {

// __net__ - A Mesh entity requires a Net entity, set to generate a weak or strong net, to supply Particle objects to act as its mapping coordinates.
    net: null,

// __isHorizontalCopy__ - Boolean flag - Copying the source image to the output happens, by default, by rows - which effectively means the struts are on the left-hand and right-hand edges of the image.
// + To change this to columns (which sets the struts to the top and bottom edges of the image) set the attribute to `false`
    isHorizontalCopy: true,

// __source__ - The Picture entity source for this Mesh. For initialization and/or `set`, we can supply either the Picture entity itself, or its name-String value.
// + The content image displayed by the Mesh entity are set in the Picture entity, not the Mesh, and can be any artefact supported by the Picture (image, video, sprite, or a Cell artefact).
// + Note that any ___filters should be applied to the Picture entity___; Mesh entitys do not support filter functionality but will apply a Picture's filters to the source image as-and-where appropriate.
    source: null,

// __sourceIsVideoOrSprite__ - Boolean flag - If the Picture entity is hosting a video or sprite asset, we need to update the input on every frame.
// + It's easier to tell the Mesh entity to do this using a flag, rather than get the Picture entity to update all its Mesh subscribers on every display cycle.
// + For Pictures using image assets the flag must be set to `false` (the default); setting the flag to `true` will significantly degrade display and animation performance.
    sourceIsVideoOrSprite: false,

// The current Frame drawing process often leads to [moiré interference patterns](https://en.wikipedia.org/wiki/Moir%C3%A9_pattern) appearing in the resulting image. Scrawl-canvas uses a resize trick to blur out these patterns.
//
// __interferenceLoops__ (positive integer Number), __interferenceFactor__ (positive float Number) - The interferenceFactor attribute sets the resizing ratio; while he interferenceLoops attribute sets the number of times the image gets resized.
// + If inteference patterns still appear in the final image, tweak these values to see if a better output can be achieved.
    interferenceLoops: 2,
    interferenceFactor: 1.03,

// The Mesh entity does not use the [position](./mixin/position.html) or [entity](./mixin/entity.html) mixins (used by most other entitys) as its positioning is entirely dependent on the position, rotation, scale etc of its constituent Shape path entity struts.
//
// It does, however, use these attributes (alongside their setters and getters): __visibility__, __order__, __delta__, __host__, __group__, __anchor__, __collides__.
    visibility: true,
    calculateOrder: 0,
    stampOrder: 0,
    delta: null,
    host: null,
    group: null,
    anchor: null,

// __noCanvasEngineUpdates__ - Boolean flag - Canvas engine updates are required for the Mesh's border - strokeStyle and line styling; if a Mesh is to be drawn without a border, then setting this flag to `true` may help improve rendering efficiency.
    noCanvasEngineUpdates: false,


// __noDeltaUpdates__ - Boolean flag - Mesh entitys support delta animation - achieved by updating the `...path` attributes by appropriate (and small!) values. If the Mesh is not going to be animated by delta values, setting the flag to `true` may help improve rendering efficiency.
    noDeltaUpdates: false,


// __onEnter__, __onLeave__, __onDown__, __onUp__ - Mesh entitys support ___collision detection___, reporting a hit when a test coordinate falls within the Mesh's output image. As a result, Looms can also accept and act on the four __on__ functions - see [entity event listener functions](../mixin/entity.html#section-11) for more details.
    onEnter: null,
    onLeave: null,
    onDown: null,
    onUp: null,


// __noUserInteraction__ - Boolean flag - To switch off collision detection for a Mesh entity - which might help improve rendering efficiency - set the flag to `true`.
    noUserInteraction: false,


// [Anchor objects](./anchor.html) can be assigned to Mesh entitys, meaning the following attributes are supported:
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
// __method__ - All normal Scrawl-canvas entity stamping methods are supported.
    method: FILL,


// Mesh entitys support appropriate styling attributes, mainly for their stroke styles (used with the `draw`, `drawAndFill`, `fillAndDraw`, `drawThenFill` and `fillThenDraw` stamping methods).
// + These ___state___ attributes are stored directly on the object, rather than in a separate [State](./state.html) object.
//
// The following attributes are thus supported:
//
// Alpha and Composite operations will be applied to both the Mesh entity's border (the Shape entitys, with connecting lines between their paths' start and end points) and fill (the image displayed between the Mesh's struts)
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
// The Mesh entity's strokeStyle can be any style supported by Scrawl-canvas - color strings, gradient objects, and pattern objects
// + __strokeStyle__
//
// The shadow attributes will only be applied to the stroke (border), not to the Mesh's fill (image)
// + __shadowOffsetX__
// + __shadowOffsetY__
// + __shadowBlur__
// + __shadowColor__
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['pathObject', 'state']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, ['^(local|dirty|current)', 'Subscriber$']);
P.packetObjects = pushUnique(P.packetObjects, ['group', 'net', 'source']);
P.packetFunctions = pushUnique(P.packetFunctions, ['onEnter', 'onLeave', 'onDown', 'onUp']);

P.processPacketOut = function (key, value, incl) {

    let result = true;

    if(!incl.includes(key) < 0 && value === this.defs[key]) result = false;

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
    S = P.setters;

// __get__ - copied over from the entity mixin
P.get = function (item) {

    const getter = this.getters[item];

    if (getter) return getter.call(this);

    else {

        const state = this.state;

        let def = this.defs[item],
            val;

        if (typeof def != UNDEF) {

            val = this[item];
            return (typeof val != UNDEF) ? val : def;
        }

        def = state.defs[item];

        if (typeof def != UNDEF) {

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
                    else if (typeof defs[key] != UNDEF) {

                        this[key] = value;
                        this.dirtyFilterIdentifier = true;
                    }
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
                    else if (typeof defs[key] != UNDEF) {

                        this[key] = addStrings(this[key], value);
                        this.dirtyFilterIdentifier = true;
                    }
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
    this.dirtyFilterIdentifier = true;
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

// __net__
S.net = function (item) {

    if (item) {

        item = (item.substring) ? artefact[item] : item;

        if (item && item.type == T_NET) {

            this.net = item;
            this.dirtyStart = true;
        }
        this.dirtyFilterIdentifier = true;
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
        this.dirtyFilterIdentifier = true;
    }
};

// __isHorizontalCopy__
S.isHorizontalCopy = function (item) {

    this.isHorizontalCopy = (item) ? true : false;
    this.dirtyPathData = true;
    this.dirtyFilterIdentifier = true;
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

// #### Display cycle functionality

// `prepareStamp` - function called as part of the Display cycle `compile` step.
// + This function is called before we get into the entity stamp promise cascade (thus it's a synchronous function). This is where we need to check whether we need to recalculate the path data which we'll use later to build the Mesh entity's output image.
// + We only need to recalculate the path data on the initial render, and afterwards when the __dirtyPathData__ flag has been set.
// + If we perform the recalculation, then we need to make sure to set the __dirtyOutput__ flag, which will trigger the output image build.
P.prepareStamp = function() {

    this.badNet = true;
    this.dirtyParticles = false;

    if (!this.particlePositions) this.particlePositions = [];

    const {net, particlePositions} = this;

    if (net && net.particleStore && net.particleStore.length > 3) {

        const {rows, columns, particleStore} = net;

        if (rows && columns) {

            this.badNet = false;
            this.rows = rows;
            this.columns = columns;

            // Sanity check
            // + We will recalculate stuff if any of the net particles have moved since the last check. This is most simply done by constructing a string of all current particle position values and comparing it to the previous string. If they are the same, then we can use the stashed image construct, otherwise we build and stash a new image construct

            const checkPositions = [];

            particleStore.forEach(p => {

                const pos = p.position;
                const {x, y} = pos;

                checkPositions.push([x, y]);
            });
            const checkPositionsString = checkPositions.join(ARG_SPLITTER),
                particlePositionsString = particlePositions.join(ARG_SPLITTER);

            if (particlePositionsString !== checkPositionsString) {

                this.particlePositions = checkPositions;
                this.dirtyInput = true;
            }

            if (this.sourceIsVideoOrSprite) this.dirtyInput = true;
        }
    }

    // `prepareStampTabsHelper` is defined in the `mixin/hiddenDomElements.js` file - handles updates to anchor and button objects
    this.prepareStampTabsHelper();
};

// `setSourceDimension` - internal function called by `prepareStamp`.
// + We make the source dimensions a square of the longest row 'path'
// + This way, we can do a horizontal scan, or a vertical scan with no further calculation
//
// This function also:
// + Calculates the bounding box
// + Creates the perimeter path object
// + Stores the (relative) lengths of individual struts in each row
//
// TODO: consider drawing order of squares - is there a way we can predict which squares are going to be behind other squares ...
// + For instance by adding together the particle z values for each square, then filling in the lowest square first?
// + May also be a way of calculating a cull of squares so that we don't need to fill in squares entirely covered by other squares?
P.setSourceDimension = function () {

    if (!this.badNet) {

        const {columns, rows, particlePositions} = this;

        const results = requestArray(),
            lengths = requestArray(),
            xPos = requestArray(),
            yPos = requestArray(),
            top = requestArray(),
            left = requestArray(),
            right = requestArray(),
            coords = requestArray(),
            bottom = requestArray();

        let x, xz, y, res, pos, coord, x0, x1, y0, y1, dx, dy, len, l, i, iz, j, jz;

        for (y = 0; y < rows; y++) {

            res = 0;
            len = lengths[y] = requestArray();
            coord = coords[y] = [];

            for (x = 0, xz = columns - 1; x < xz; x++) {

                pos = (y * columns) + x;

                [x0, y0] = particlePositions[pos];
                [x1, y1] = particlePositions[pos + 1];

                coord.push([x0, y0, x1, y1]);

                if (x == 0) {

                    left.push([x0, y0]);
                }
                else if (x == xz - 1) {

                    right.push([x1, y1]);
                }
                else if (y == 0) {

                    top.push([x0, y0]);

                    if (x == xz - 2) top.push([x1, y1]);
                }
                else if (y == rows - 1) {

                    bottom.push([x0, y0]);

                    if (x == xz - 2) bottom.push([x1, y1]);
                }

                xPos.push(x0, x1);
                yPos.push(y0, y1);

                dx = x1 - x0;
                dy = y1 - y0;

                l = _sqrt((dx * dx) + (dy * dy));
                res += l;
                len.push(l);
            }
            results.push(res);
        }
        this.sourceDimension = _max(...results);

        // Sanity check - the particle system, when it breaks down, can create some massive dimension values!
        const host = this.currentHost || this.getHost();
        if (host) {

            const max = _max(...host.currentDimensions);
            if (this.sourceDimension > max) this.sourceDimension = max;
        }

        for (i = 0, iz = lengths.length; i < iz; i++) {

            l = results[i];
            len = lengths[i];
            coord = coords[i];

            for (j = 0, jz = len.length; j < jz; j++) {

                if (l) len[j] = len[j] / l;

                coord[j].push(len[j]);
            }
        }

        if (!this.struts) this.struts = [];
        this.struts.length = 0;
        this.struts.push(...coords);

        const xMin = _min(...xPos),
            yMin = _min(...yPos),
            xMax = _max(...xPos),
            yMax = _max(...yPos);

        this.boundingBox = [xMin, yMin, xMax - xMin, yMax - yMin];

        left.reverse();
        bottom.reverse();

        let p = `M${top[0][0]},${top[0][1]}L`;

        for (i = 1, iz = top.length; i < iz; i++) {

            [x, y] = top[i];
            p += `${x},${y} `;
        }
        for (i = 0, iz = right.length; i < iz; i++) {

            [x, y] = right[i];
            p += `${x},${y} `;
        }
        for (i = 0, iz = bottom.length; i < iz; i++) {

            [x, y] = bottom[i];
            p += `${x},${y} `;
        }
        for (i = 0, iz = left.length; i < iz; i++) {

            [x, y] = left[i];
            p += `${x},${y} `;
        }
        p += 'z';

        this.pathObject = new Path2D(p);

        lengths.forEach(a => releaseArray(a));
        releaseArray(lengths);
        releaseArray(results);
        releaseArray(xPos);
        releaseArray(yPos);
        releaseArray(top);
        releaseArray(left);
        releaseArray(right);
        releaseArray(bottom);
        releaseArray(coords);
    }
};

// `simpleStamp` - Simple stamping is entirely synchronous
// + TODO: we may have to disable this functionality for the Mesh entity, if we use a Web Assembly module for either the prepareStamp calculations, or to build the output image itself
P.simpleStamp = function (host, changes) {

    if (host && host.type == T_CELL) {

        this.currentHost = host;

        if (changes) {

            this.set(changes);
            this.prepareStamp();
        }

        this.regularStamp();
    }
};

// `stamp` - All entity stamping, except for simple stamps, goes through this function, which needs to return a Promise which will resolve in due course.
// + While other entitys have to worry about applying filters as part of the stamping process, this is not an issue for Mesh entitys because filters are defined on, and applied to, the source Picture entity, not the Mesh itself
//
// Here we check which dirty flags need actioning, and call a range of different functions to process the work. These flags are:
// + `dirtyInput` - the Picture entity has reported a change in its source, or copy attributes)
P.stamp = function (force = false, host, changes) {

    if (force) {

        if (host && host.type == T_CELL) this.currentHost = host;

        if (changes) {

            this.set(changes);
            this.prepareStamp();
        }
        this.regularStamp();
    }

    if (this.visibility) {

        if (this.dirtyInput) {

            this.sourceImageData = this.cleanInput();

            if (this.sourceImageData) this.output = this.cleanOutput();
            else this.dirtyInput = true;
        }

        if (this.output) this.regularStamp();
    }
};

// #### Clean functions

// `cleanInput` - internal function called by `stamp`
P.cleanInput = function () {

    this.dirtyInput = false;

    this.setSourceDimension();

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
    })
    const sourceImageData = engine.getImageData(0, 0, sourceDimension, sourceDimension);

    releaseCell(cell);
    return sourceImageData;
};

// `cleanOutput` - internal function called by `stamp`
// + If you're not a fan of big functions, please look away now.
P.cleanOutput = function () {

    this.dirtyOutput = false;

    const {sourceImageData, columns, rows, struts, boundingBox} = this;

    const sourceDimension = _ceil(this.sourceDimension);

    if (sourceImageData && rows - 1 > 0) {

/* eslint-disable-next-line */
        let [startX, startY, outputWidth, outputHeight] = boundingBox;

        outputWidth = ~~(startX + outputWidth);
        outputHeight = ~~(startY + outputHeight);

        const inputCell = requestCell(),
            inputEngine = inputCell.engine,
            inputCanvas = inputCell.element;

        inputCanvas.width = sourceDimension;
        inputCanvas.height = sourceDimension;
        inputEngine.setTransform(1, 0, 0, 1, 0, 0);
        inputEngine.putImageData(sourceImageData, 0, 0);

        const outputCell = requestCell(),
            outputEngine = outputCell.engine,
            outputCanvas = outputCell.element;

        outputCanvas.width = outputWidth;
        outputCanvas.height = outputHeight;
        outputEngine.globalAlpha = this.state.globalAlpha;
        outputEngine.setTransform(1, 0, 0, 1, 0, 0);

        const inputStrutHeight = parseFloat((sourceDimension / (rows - 1)).toFixed(4)),
            inputStrutWidth = parseFloat((sourceDimension / (columns - 1)).toFixed(4));

        let topStruts, baseStruts,
            maxLen, iStep, xtStep, ytStep, xbStep, ybStep, tx, ty, bx, by, sx, sy,
            xLen, yLen, stripLength, stripAngle,
            c, cz, r, rz, i;

        for (r = 0, rz = rows - 1; r < rz; r++) {

            topStruts = struts[r];
            baseStruts = struts[r + 1];

            for (c = 0, cz = columns - 1; c < cz; c++) {

/* eslint-disable-next-line */
                let [ltx, lty, rtx, rty, tLen] = topStruts[c];
/* eslint-disable-next-line */
                let [lbx, lby, rbx, rby, bLen] = baseStruts[c];

                tLen *= sourceDimension;
                bLen *= sourceDimension;

                maxLen = _max(tLen, bLen, inputStrutWidth);

                iStep = inputStrutWidth / maxLen;

                xtStep = (rtx - ltx) / maxLen;
                ytStep = (rty - lty) / maxLen;
                xbStep = (rbx - lbx) / maxLen;
                ybStep = (rby - lby) / maxLen;

                for (i = 0; i < maxLen; i++) {

                    tx = ltx + (xtStep * i);
                    ty = lty + (ytStep * i);
                    bx = lbx + (xbStep * i);
                    by = lby + (ybStep * i);
                    sy = r * inputStrutHeight;
                    sx = (c * inputStrutWidth) + (iStep * i);

                    xLen = tx - bx;
                    yLen = ty - by;
                    stripLength = _sqrt((xLen * xLen) + (yLen * yLen));
                    stripAngle = _atan2(yLen, xLen) + _piHalf;

                    outputEngine.setTransform(1, 0, 0, 1, tx, ty);
                    outputEngine.rotate(stripAngle);

                    // Safari bugfix because we fall foul of of the Safari source-out-of-bounds bug
                    // + [Stack Overflow question identifying the issue](https://stackoverflow.com/questions/35500999/cropping-with-drawimage-not-working-in-safari)
                    const testHeight = (sy + inputStrutHeight > sourceDimension) ? sourceDimension - sy : inputStrutHeight;

                    outputEngine.drawImage(inputCanvas, ~~sx, ~~sy, 1, ~~testHeight, 0, 0, 1, ~~stripLength);
                }
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

        for (let j = 0; j < iLoops; j++) {

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


// ##### Stamp methods
// These 'method' functions stamp the Mesh entity onto the canvas context supplied to them in the `engine` argument.

// `fill`
P.fill = function (engine) {

    this.doFill(engine);
};

// `draw`
P.draw = function (engine) {

    this.doStroke(engine);
};

// `drawAndFill`
P.drawAndFill = function (engine) {

    this.doStroke(engine);
    this.currentHost.clearShadow();
    this.doFill(engine);
};

// `fillAndDraw`
P.fillAndDraw = function (engine) {

    this.doFill(engine);
    this.currentHost.clearShadow();
    this.doStroke(engine);
};

// `drawThenFill`
P.drawThenFill = function (engine) {

    this.doStroke(engine);
    this.doFill(engine);
};

// `fillThenDraw`
P.fillThenDraw = function (engine) {

    this.doFill(engine);
    this.doStroke(engine);
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

        const w = canvas.width,
            h = canvas.height;

        tempCanvas.width = w;
        tempCanvas.height = h;

        tempEngine.putImageData(output, 0, 0);
        engine.setTransform(1, 0, 0, 1, 0, 0);
        engine.globalCompositeOperation = DESTINATION_OUT;
        engine.drawImage(tempCanvas, 0, 0);
        engine.globalCompositeOperation = gco;

        releaseCell(tempCell);
    }
};

// `none`, `clip`
P.none = λnull;
P.clip = λnull;


// These __stroke__ and __fill__ functions handle most of the stuff that the method functions require to stamp the Mesh entity onto a canvas cell.

// `doStroke`
P.doStroke = function (engine) {

    engine.setTransform(1, 0, 0, 1, 0, 0);
    engine.stroke(this.pathObject);
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

        const w = canvas.width,
            h = canvas.height;

        tempCanvas.width = w;
        tempCanvas.height = h;

        tempEngine.putImageData(output, 0, 0);
        engine.setTransform(1, 0, 0, 1, 0, 0);
        engine.drawImage(tempCanvas, 0, 0);

        releaseCell(tempCell);
    }
};


// #### Collision functionality

// `checkHit`
// + Overwrites mixin/position.js function
P.checkHit = function (items = [], mycell) {

    if (this.noUserInteraction) return false;

    if (!this.pathObject) return false;

    const tests = (!_isArray(items)) ?  [items] : items,
        engine = mycell.engine;

    let poolCellFlag = false,
        tx, ty;

    if (!mycell) {

        mycell = requestCell();
        poolCellFlag = true;
    }

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

        return engine.isPointInPath(this.pathObject, tx, ty, this.winding);

    }, this)) {

        const r = {
            x: tx,
            y: ty,
            artefact: this
        };

        if (poolCellFlag) releaseCell(mycell);

        return r;
    }

    if (poolCellFlag) releaseCell(mycell);

    return false;
};


// #### Factory
// ```
// let myMesh = scrawl.makeMesh({

//     name: 'display-mesh',

//     net: 'test-net',
//     source: 'my-flower',

//     lineWidth: 2,
//     lineJoin: 'round',
//     strokeStyle: 'orange',

//     method: 'fillThenDraw',

//     onEnter: function () { this.set({ lineWidth: 6 }) },
//     onLeave: function () { this.set({ lineWidth: 2 }) },
// });
// ```
export const makeMesh = function (items) {

    if (!items) return false;
    return new Mesh(items);
};

constructors.Mesh = Mesh;
