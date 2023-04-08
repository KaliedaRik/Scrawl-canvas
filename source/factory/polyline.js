// # Polyline factory
// A factory for generating an open or closed line/curve based shape entity, using a set of pins to mark the course the line
//
// ___To be aware - this entity factory is experimental; its API will be subject to short-notice breaking changes as we amend and improve the entity's functionality___
//
// Path-defined entitys represent a diverse range of shapes rendered onto a DOM &lt;canvas> element using the Canvas API's [Path2D interface](https://developer.mozilla.org/en-US/docs/Web/API/Path2D). They use the [shapeBasic](../mixin/shapeBasic.html) and [shapePathCalculation](../mixin/shapePathCalculation.html) (some also use [shapeCurve](../mixin/shapeCurve.html)) mixins to define much of their functionality.
// 
// All path-defined entitys can be positioned, cloned, filtered etc:
// + Positioning functionality for the entity is supplied by the __position__ mixin, while rendering functionality comes from the __entity__ mixin. 
// + Dimensions, however, have little meaning for path-defined entitys - their width and height are determined by their SVG path data Strings; use `scale` instead.
// + Path-defined entitys can use CSS color Strings for their fillStyle and strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects. 
// + They will also accept __Filter__ objects.
// + They can use __Anchor__ objects for user navigation. 
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__. 
// + They can be __animated__ directly, or using delta animation, or act as the target for __Tween__ animations.
// + Path-defined entitys can be cloned, and killed.


// #### Using path-defined entitys as Scrawl-canvas paths
// A path is a track - straight, or curved, or as complex as required - placed across a container which artefacts can use as a source of their positioning data. We can animate an artifact to move along the path:
// + To enable a path-defined entity to be used as a path by other artefacts, set its `useAsPath` flag to `true`.
// + The artefact can then set its `path` attribute to the path-defined entity's name-String (or the entity itself), and set its `lockTo` Array values to `"path"`.
// + We position the artefact by setting its `pathPosition` attribute to a float Number value between `0.0 - 1.0`, with `0` being the start of the path, and `1` being its end.
// + Path-defined entitys can use other path-defined entitys as a path.
// + Phrase entitys can use a path to position their text block; they can also use a path to position each letter individually along the path.
// + Artefacts (and letters) can be rotated so that they match the rotation at that point along the path - ___tangential rotation___ by setting their `addPathRotation` flag to `true`.
// + Animate an artefact along the path by either using the artefact's `delta` object, or triggering a Tween to perform the movement.


// #### Demos:
// + [Canvas-030](../../demo/canvas-030.html) - Polyline entity functionality
// + [Canvas-032](../../demo/canvas-032.html) - Freehand drawing


// #### Imports
import { 
    artefact, 
    constructors, 
    particle, 
} from '../core/library.js';

import { 
    correctForZero, 
    doCreate,
    isa_boolean, 
    isa_obj, 
    mergeOver, 
    pushUnique, 
    removeItem, 
    xt, 
    xta, 
    Ωempty, 
} from '../core/utilities.js';

import { makeCoordinate } from '../factory/coordinate.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';

import { 
    _floor,
    _isArray,
    _keys,
    _parse,
    _pow,
    _sqrt,
} from '../core/shared-vars.js';


// Local constants
const BOTTOM = 'bottom',
    CENTER = 'center',
    ENTITY = 'entity',
    LEFT = 'left',
    MOUSE = 'mouse',
    PARTICLE = 'particle',
    PINS = 'pins',
    PIVOT = 'pivot',
    POLYLINE = 'polyline',
    RIGHT = 'right',
    START = 'start',
    T_POLYLINE = 'Polyline',
    TOP = 'top',
    ZERO_PATH = 'M0,0';


// #### Polyline constructor
const Polyline = function (items = Ωempty) {

    this.pins = [];
    this.currentPins = [];
    this.controlledLineOffset = makeCoordinate();

    this.shapeInit(items);

    return this;
};


// #### Polyline prototype
const P = Polyline.prototype = doCreate();
P.type = T_POLYLINE;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [shapeBasic](../mixin/shapeBasic.html)
baseMix(P);
shapeMix(P);


// #### Polyline attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, calculateOrder, stampOrder, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, filter___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
// + Attributes defined in the [shapeBasic mixin](../mixin/shapeBasic.html): __species, useAsPath, precision, pathDefinition, showBoundingBox, boundingBoxColor, minimumBoundingBoxDimensions, constantPathSpeed__.
const defaultAttributes = {

    // The __pins__ attribute takes an array with elements which are:
    // + [x, y] coordinate arrays, where values can be absolute (Numbers) and/or relative (String%) values
    // + Artefact objects, or their name-String values
    // + (`set` function will also accept an object with attributes: `index, x, y` - to be used by Tweens)
    pins: null,

    // __tension__ - gives us the curviness of the line:
    // + 0 - straight lines connecting the pins
    // + 0.4ish - reasonable looking curves
    // + 1 - exaggerated curves
    // + negative values - add loops at the pins
    tension: 0,

    // __closed__ - whether to connect all the pins (true), or run from first to last pin only (false)
    closed: false,

    mapToPins: false,

    // __useParticlesAsPins__ - when true, all pins should map directly to Particle objects (as supplied in a Net entity)
    useParticlesAsPins: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['controlledLineOffset']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, []);
P.packetFunctions = pushUnique(P.packetFunctions, []);

P.finalizePacketOut = function (copy, items) {

    const stateCopy = _parse(this.state.saveAsPacket(items))[3];
    copy = mergeOver(copy, stateCopy);

    copy = this.handlePacketAnchor(copy, items);

    _keys(copy).forEach(key => {

        if (key == PINS) {

            const temp = [];

            copy.pins.forEach(pin => {

                if (isa_obj(pin)) temp.push(pin.name);
                else if (_isArray(pin)) temp.push([].concat(pin));
                else temp.push(pin);
            });
            copy.pins = temp;
        }
    });
    return copy;
};


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

G.pins = function (item) {

    if (xt(item)) return this.getPinAt(item);
    return this.currentPins.concat();
};
S.pins = function (item) {

    if (xt(item)) {

        let pins = this.pins;

        if (_isArray(item)) {

            pins.forEach((item, index) => this.removePinAt(index));

            pins.length = 0;
            pins.push(...item);
            this.updateDirty();
        }
        else if (isa_obj(item) && xt(item.index)) {

            let element = pins[item.index];

            if (_isArray(element)) {

                if (xt(item.x)) element[0] = item.x;
                if (xt(item.y)) element[1] = item.y;
                this.updateDirty();
            }
        }
    }
};
D.pins = function (item) {

    if (xt(item)) {

        let pins = this.pins;

        if (isa_obj(item) && xt(item.index)) {

            let element = pins[item.index];

            if (_isArray(element)) {

                if (xt(item.x)) element[0] = addStrings(element[0], item.x);
                if (xt(item.y)) element[1] = addStrings(element[1], item.y);
                this.updateDirty();
            }
        }
    }
};

S.tension = function (item) {

    if (item.toFixed) {

        this.tension = item;
        this.updateDirty();
    }
};
D.tension = function (item) {

    if (item.toFixed) {

        this.tension += item;
        this.updateDirty();
    }
};

S.closed = function (item) {

    this.closed = item;
    this.updateDirty();
};

S.mapToPins = function (item) {

    this.mapToPins = item;
    this.updateDirty();
};

// __flipUpend__
S.flipUpend = function (item) {

    this.flipUpend = item;
    this.updateDirty();
};

// __flipReverse__
S.flipReverse = function (item) {

    this.flipReverse = item;
    this.updateDirty();
};

// __flipReverse__
S.useAsPath = function (item) {

    this.useAsPath = item;
    this.updateDirty();
};

// __pivot__
S.pivot = function (item) {

    if (isa_boolean(item) && !item) {

        this.pivot = null;

        if (this.lockTo[0] == PIVOT) this.lockTo[0] = START;
        if (this.lockTo[1] == PIVOT) this.lockTo[1] = START;

        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    }
    else {

        const oldPivot = this.pivot,
            newPivot = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newPivot && newPivot.name) {

            if (oldPivot && oldPivot.name != newPivot.name) removeItem(oldPivot.pivoted, name);

            pushUnique(newPivot.pivoted, name);

            this.pivot = newPivot;
            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
    }
    this.updateDirty();
};


// #### Prototype functions

// `updateDirty` - internal setter helper function
P.updateDirty = function () {

    this.dirtySpecies = true;
    this.dirtyPathObject = true;
    this.dirtyPins = true;
};

// `getPinAt` - 
P.getPinAt = function (index) {

    const i = _floor(index);

    if (this.useAsPath) {

        const pos = this.getPathPositionData(this.unitPartials[i]);
        return [pos.x, pos.y];
    }
    else {

        const pins = this.currentPins,
            pin = pins[i];

        const [x, y, w, h] = this.localBox;

        const [px, py] = pin;
        const [ox, oy] = pins[0];
        const [lx, ly] = this.localOffset;
        const [sx, sy] = this.currentStampPosition;
        let dx, dy;

        if (this.mapToPins) {
            dx = px - ox + x;
            dy = py - ox + y;
        }
        else {
            dx = px - lx;
            dy = py - ly;
        }
        return [sx + dx, sy + dy];
    }
    return [0, 0];
};

// `updatePinAt` - 
P.updatePinAt = function (item, index) {

    if (xta(item, index)) {

        index = _floor(index);

        const pins = this.pins;

        if (index < pins.length && index >= 0) {

            const oldPin = pins[index];

            if (isa_obj(oldPin) && oldPin.pivoted) removeItem(oldPin.pivoted, this.name);

            pins[index] = item;
            this.updateDirty();
        }
    }
};

// `removePinAt` - 
P.removePinAt = function (index) {

    index = _floor(index);

    const pins = this.pins;

    if (index < pins.length && index >= 0) {

        const oldPin = pins[index];

        if (isa_obj(oldPin) && oldPin.pivoted) removeItem(oldPin.pivoted, this.name);

        pins[index] = null;
        this.updateDirty();
    }
};

// `prepareStamp` - the purpose of most of these actions is described in the [entity mixin function](http://localhost:8080/docs/source/mixin/entity.html#section-31) that this function overwrites
P.prepareStamp = function() {

    if (this.dirtyHost) this.dirtyHost = false;

    if (this.useParticlesAsPins) this.dirtyPins = true;

    if (this.dirtyPins || this.dirtyLock) this.dirtySpecies = true;

    if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyHandle) {

        this.dirtyPathObject = true;

        if (this.dirtyScale || this.dirtySpecies)  this.pathCalculatedOnce = false;
    }

    if (this.isBeingDragged || this.lockTo.includes(MOUSE) || this.lockTo.includes(PARTICLE)) this.dirtyStampPositions = true;

    if (this.dirtyScale) this.cleanScale();

    if (this.dirtyStart) this.cleanStart();

    if (this.dirtyOffset) this.cleanOffset();
    if (this.dirtyRotation) this.cleanRotation();

    if (this.dirtyStampPositions) this.cleanStampPositions();

    if (this.dirtySpecies) this.cleanSpecies();

    if (this.dirtyPathObject) {

        this.cleanPathObject();
        this.updatePathSubscribers();
    }

    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
};

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;

    let p = ZERO_PATH;
    p = this.makePolylinePath();

    this.pathDefinition = p;
};

// `getPathParts` - internal helper function - called by `makePolylinePath`
P.getPathParts = function (x0, y0, x1, y1, x2, y2, t) {

    const d01 = _sqrt(_pow(x1 - x0, 2) + _pow(y1 - y0, 2)),
        d12 = _sqrt(_pow(x2 - x1, 2) + _pow(y2 - y1, 2)),
        fa = t * d01 / (d01 + d12),
        fb = t * d12 / (d01 + d12),
        p1x = x1 - fa * (x2 - x0),
        p1y = y1 - fa * (y2 - y0),
        p2x = x1 + fb * (x2 - x0),
        p2y = y1 + fb * (y2 - y0);

    return [p1x, p1y, x1, y1, p2x, p2y];
};

// `buildLine` - internal helper function - called by `makePolylinePath`
P.buildLine = function (x, y, coords) {

    let p = `${ZERO_PATH}l`;

    for (let i = 2; i < coords.length; i += 6) {

        p += `${correctForZero(coords[i] - x)},${correctForZero(coords[i + 1] - y)} `;

        x = coords[i];
        y = coords[i + 1];
    }
    return p;
};

// `buildCurve` - internal helper function - called by `makePolylinePath`
P.buildCurve = function (x, y, coords) {

    let p = `${ZERO_PATH}c`,
        counter = 0;

    for (let i = 0; i < coords.length; i += 2) {

        p += `${correctForZero(coords[i] - x)},${correctForZero(coords[i + 1] - y)} `;

        counter++;

        if (counter > 2) {

            x = coords[i];
            y = coords[i + 1];
            counter = 0;
        }
    }
    return p;
};

// `cleanCoordinate` - internal helper function - called by `cleanPinsArray`
P.cleanCoordinate = function (coord, dim) {

    if (coord.toFixed) return coord;
    if (coord == LEFT || coord == TOP) return 0;
    if (coord == RIGHT || coord == BOTTOM) return dim;
    if (coord == CENTER) return dim / 2;
    return (parseFloat(coord) / 100) * dim;
};

// `cleanPinsArray` - internal helper function - called by `makePolylinePath`
P.cleanPinsArray = function () {

    this.dirtyPins = false;

    const pins = this.pins,
        current = this.currentPins;

    current.length = 0;

    if (this.useParticlesAsPins) {

        pins.forEach((part, index) => {

            let temp;

            if (part && part.substring) {

                temp = particle[part];
                if (temp) pins[index] = temp;
            }
            else temp = part;

            const pos = (temp && temp.position) ? temp.position : false;

            if (pos) current.push([pos.x, pos.y]);
        });

        if (!current.length) this.dirtyPins = true;
    }
    else {

        const host = this.getHost(),
            clean = this.cleanCoordinate;

        let w = 1,
            h = 1,
            x, y, dims;

        if (host) {

            dims = host.currentDimensions;

            if (dims) {

                [w, h] = dims;
            }
        }

        pins.forEach((item, index) => {

            let temp;

            if (item && item.substring) {

                temp = artefact[item];
                pins[index] = temp;
            }
            else temp = item;

            if (temp) {

                if (_isArray(temp)) {

                    [x, y] = temp;

                    current.push([clean(x, w), clean(y, h)]);
                }
                else if (isa_obj(temp) && temp.currentStart) {

                    let name = this.name;

                    if (!temp.pivoted.includes(name)) pushUnique(temp.pivoted, name);

                    current.push([...temp.currentStampPosition]);
                }
            }
        });
    }

    if (current.length) {

        // Calculate the local offset
        let mx = current[0][0],
            my = current[0][1];

        current.forEach(e => {

            if (e[0] < mx) mx = e[0];
            if (e[1] < my) my = e[1];
        })
        this.localOffset = [mx, my];

        this.updatePivotSubscribers();
    }
};


// `makePolylinePath` - internal helper function - called by `cleanSpecies`
P.makePolylinePath = function () {

    const getPathParts = this.getPathParts,
        buildLine = this.buildLine,
        buildCurve = this.buildCurve,
        pins = this.pins,
        cPin = this.currentPins, 
        tension = this.tension,
        closed = this.closed;

    // 1. go through the pins array and get current values for each, pushed into currentPins array
    if (this.dirtyPins) this.cleanPinsArray();

    if (cPin.length) {

        // 2. build the line
        const cLen = cPin.length,
            first = cPin[0],
            last = cPin[cLen - 1];

        let calc = [],
            result = ZERO_PATH,
            i;

        if (closed) {

            const startPoint = [].concat(...getPathParts(...last, ...first, ...cPin[1], tension));

            for (i = 0; i < cLen - 2; i++) {

                calc = calc.concat(...getPathParts(...cPin[i], ...cPin[i + 1], ...cPin[i + 2], tension));
            }

            calc = calc.concat(...getPathParts(...cPin[cLen - 2], ...last, ...first, tension));

            calc.unshift(startPoint[4], startPoint[5]);
            calc.push(startPoint[0], startPoint[1], startPoint[2], startPoint[3]);

            if (tension) result = buildCurve(first[0], first[1], calc) + 'z';
            else result = buildLine(first[0], first[1], calc) + 'z';
        }
        else {

            calc.push(first[0], first[1]);

            for (i = 0; i < cLen - 2; i++) {

                calc = calc.concat(...getPathParts(...cPin[i], ...cPin[i + 1], ...cPin[i + 2], tension));
            }
            calc.push(last[0], last[1], last[0], last[1]);

            if (tension) result = buildCurve(first[0], first[1], calc);
            else result = buildLine(first[0], first[1], calc);
        }
        return result;
    }
    return ZERO_PATH;
};

P.calculateLocalPathAdditionalActions = function () {

    const [x, y, w, h] = this.localBox,
        def = this.pathDefinition;

    if (this.mapToPins) {

        this.set({
            start: this.currentPins[0],
        });
    }
    else this.pathDefinition = def.replace(ZERO_PATH, `m${-x},${-y}`);

    this.pathCalculatedOnce = false;

    // ALWAYS, when invoking `calculateLocalPath` from `calculateLocalPathAdditionalActions`, include the second argument, set to `true`! Failure to do this leads to an infinite loop which will make your machine weep.
    // + We need to recalculate the local path to take into account the offset required to put the Oval entity's start coordinates at the top-left of the local box, and to recalculate the data used by other artefacts to place themselves on, or move along, its path.
    this.calculateLocalPath(this.pathDefinition, true);
};

// `updatePathSubscribers`
P.updatePathSubscribers = function () {

    this.pathed.forEach(name => {

        const instance = artefact[name];

        if (instance) instance.dirtyStart = true;
    });
};

// #### Factories

// ##### makePolyline
// Accepts argument with attributes:
// + __pins__ (required) - an Array of either coordinate (`[x, y]`) arrays with coordinates defined as absolute (Number) or relative (String%) values; or artefact objects (or their name-String values).
// + __tension__ float Number representing the bendiness of the line - for example: `0` (straight lines); `0.3` (a reasonably curved line).
// + __closed__ Boolean - when set, the start and end pins will be joined to complete the shape
// + __mapToPins__ Boolean - when set, the line will map to its initial pin coordinate
//
// ```
// scrawl.makePolyline({
//
//     name: 'my-polyline',
//
//     pins: [[10, 10], ['20%', '90%'], [120, 'center']],
//
//     tension: 0.3,
//     closed: true,
//     mapToPins: true,
//
//     strokeStyle: 'orange',
//     lineWidth: 6,
//     lineCap: 'round',
//     lineJoin: 'round',
//     shadowColor: 'black',
//
//     method: 'draw',
// });
// ```
export const makePolyline = function (items) {

    if (!items) return false;
    items.species = POLYLINE;
    return new Polyline(items);
};

constructors.Polyline = Polyline;
