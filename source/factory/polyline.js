// # Polyline factory
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
// + [Canvas-011](../../demo/canvas-011.html) - Shape entity (make, clone, method); drag and drop shape entitys
// + [Canvas-012](../../demo/canvas-012.html) - Shape entity position; shape entity as a path for other artefacts to follow
// + [Canvas-013](../../demo/canvas-013.html) - Path-defined entitys: oval, rectangle, line, quadratic, bezier, tetragon, polygon, star, spiral
// + [Canvas-014](../../demo/canvas-014.html) - Line, quadratic and bezier entitys - control lock alternatives
// + [Canvas-018](../../demo/canvas-018.html) - Phrase entity - text along a path
// + [Canvas-019](../../demo/canvas-019.html) - Artefact collision detection
// + [Canvas-024](../../demo/canvas-024.html) - Loom entity functionality
// + [DOM-015](../../demo/dom-015.html) - Use stacked DOM artefact corners as pivot points
// + [Component-004](../../demo/component-004.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors, artefact } from '../core/library.js';
import { mergeOver, isa_obj, pushUnique, xt, xta, removeItem } from '../core/utilities.js';

import { makeCoordinate } from '../factory/coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import shapeMix from '../mixin/shapeBasic.js';
import filterMix from '../mixin/filter.js';


// #### Polyline constructor
const Polyline = function (items = {}) {

    this.pins = [];
    this.currentPins = [];
    this.controlledLineOffset = makeCoordinate();

    this.shapeInit(items);

    return this;
};


// #### Polyline prototype
let P = Polyline.prototype = Object.create(Object.prototype);
P.type = 'Polyline';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = shapeMix(P);
P = filterMix(P);


// #### Polyline attributes
// [copy relevant parts from shape-original js]
let defaultAttributes = {

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
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['controlledLineOffset']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, []);
P.packetFunctions = pushUnique(P.packetFunctions, []);

P.finalizePacketOut = function (copy, items) {

    let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
    copy = mergeOver(copy, stateCopy);

    copy = this.handlePacketAnchor(copy, items);

    Object.keys(copy).forEach(key => {

        if (key === 'pins') {

            let temp = [];

            copy.pins.forEach(pin => {

                if (isa_obj(pin)) temp.push(pin.name);
                else if (Array.isArray(pin)) temp.push([].concat(pin));
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
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

G.pins = function (item) {

    if (xt(item)) return this.getPinAt(item);
    return this.currentPins.concat();
};
S.pins = function (item) {

    if (xt(item)) {

        let pins = this.pins;

        if (Array.isArray(item)) {

            pins.forEach((item, index) => this.removePinAt(index));

            pins.length = 0;
            pins.push(...item);
            this.updateDirty();
            this.dirtyPins = true;
        }
        else if (isa_obj(item) && xt(item.index)) {

            let element = pins[item.index];

            if (Array.isArray(element)) {

                if (xt(item.x)) element[0] = item.x;
                if (xt(item.y)) element[1] = item.y;
                this.updateDirty();
                this.dirtyPins = true;
            }
        }
    }
};
D.pins = function (item) {

    if (xt(item)) {

        let pins = this.pins;

        if (isa_obj(item) && xt(item.index)) {

            let element = pins[item.index];

            if (Array.isArray(element)) {

                if (xt(item.x)) element[0] = addStrings(element[0], item.x);
                if (xt(item.y)) element[1] = addStrings(element[1], item.y);
                this.updateDirty();
                this.dirtyPins = true;
            }
        }
    }
};

S.tension = function (item) {

    if (item.toFixed) {

        this.tension = item;
        this.updateDirty();
        this.dirtyPins = true;
    }
};
D.tension = function (item) {

    if (item.toFixed) {

        this.tension += item;
        this.updateDirty();
        this.dirtyPins = true;
    }
};

S.closed = function (item) {

    this.closed = item;
    this.updateDirty();
    this.dirtyPins = true;
};

S.mapToPins = function (item) {

    this.mapToPins = item;
    this.updateDirty();
    this.dirtyPins = true;
};



// #### Prototype functions

// `getPinAt` - 
P.getPinAt = function (index, coord) {

    let pins = this.currentPins,
        pin = pins[Math.floor(index)],
        origin = pins[0];

    let [x, y, w, h] = this.localBox;

    let [px, py] = pin;
    let [ox, oy] = origin;
    let [lx, ly] = this.localOffset;
    let [sx, sy] = this.currentStampPosition;
    let dx, dy;

    if (this.mapToPins) {
        dx = px - ox + x;
        dy = py - ox + y;
    }
    else {
        dx = px - lx;
        dy = py - ly;
    }

    // TODO: the current functionality does not yet correct for entity scale, roll or flip. Needs fixing.

    if (pin) {

        if (coord) {

            if (coord === 'x') return sx + dx;
            if (coord === 'y') return sy + dy;
        }
        return [sx + dx, sy + dy];
    }
    return [sx + dx, sy + dy];
};

// `updatePinAt` - 
P.updatePinAt = function (item, index) {

    if (xta(item, index)) {

        index = Math.floor(index);

        let pins = this.pins;

        if (index < pins.length && index >= 0) {

            let oldPin = pins[index];

            if (isa_obj(oldPin) && oldPin.pivoted) removeItem(oldPin.pivoted, this.name);

            pins[index] = item;
            this.updateDirty();
            this.dirtyPins = true;
        }
    }
};

// `removePinAt` - 
P.removePinAt = function (index) {

    index = Math.floor(index);

    let pins = this.pins;

    if (index < pins.length && index >= 0) {

        let oldPin = pins[index];

        if (isa_obj(oldPin) && oldPin.pivoted) removeItem(oldPin.pivoted, this.name);

        pins[index] = null;
        this.updateDirty();
        this.dirtyPins = true;
    }
};

// `prepareStamp` - the purpose of most of these actions is described in the [entity mixin function](http://localhost:8080/docs/source/mixin/entity.html#section-31) that this function overwrites
P.prepareStamp = function() {

    if (this.dirtyHost) this.dirtyHost = false;

    if (this.dirtyPins || this.dirtyLock) this.dirtySpecies = true;

    if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyHandle) {

        this.dirtyPathObject = true;
        if (this.collides) this.dirtyCollision = true;

        if (this.dirtyScale || this.dirtySpecies)  this.pathCalculatedOnce = false;
   }

    if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {

        this.dirtyStampPositions = true;
        if (this.collides) this.dirtyCollision = true;
    }

    if ((this.dirtyRotation || this.dirtyOffset) && this.collides) this.dirtyCollision = true;

    if (this.dirtyCollision && !this.useAsPath) {

        this.dirtyPathObject = true;
        this.pathCalculatedOnce = false;
    }

    if (this.dirtyScale) this.cleanScale();

    if (this.dirtyStart) this.cleanStart();

    if (this.dirtyOffset) this.cleanOffset();
    if (this.dirtyRotation) this.cleanRotation();

    if (this.dirtyStampPositions) this.cleanStampPositions();

    if (this.dirtySpecies) this.cleanSpecies();
    if (this.dirtyPathObject) this.cleanPathObject();

    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
};

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;

    let p = 'M0,0';
    p = this.makePolylinePath();

    this.pathDefinition = p;
};

// `getPathParts` - internal helper function - called by `makePolylinePath`
P.getPathParts = function (x0, y0, x1, y1, x2, y2, t) {

    let squareroot = Math.sqrt,
        power = Math.pow;

    let d01 = squareroot(power(x1 - x0,2) + power(y1 - y0, 2)),
        d12 = squareroot(power(x2 - x1,2) + power(y2 - y1, 2)),
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

    let p = `m0,0l`;

    for (let i = 2; i < coords.length; i += 6) {

        p += `${coords[i] - x},${coords[i + 1] - y} `;

        x = coords[i];
        y = coords[i + 1];
    }
    return p;
};

// `buildCurve` - internal helper function - called by `makePolylinePath`
P.buildCurve = function (x, y, coords) {

    let p = `m0,0c`,
        counter = 0;

    for (let i = 0; i < coords.length; i += 2) {

        p += `${coords[i] - x},${coords[i + 1] - y} `;

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
    if (coord === 'left' || coord === 'top') return 0;
    if (coord === 'right' || coord === 'bottom') return dim;
    if (coord === 'center') return dim / 2;
    return (parseFloat(coord) / 100) * dim;
};

// `cleanPinsArray` - internal helper function - called by `makePolylinePath`
P.cleanPinsArray = function () {

    this.dirtyPins = false;

    let pins = this.pins,
        current = this.currentPins;

    current.length = 0;

    let w = 1,
        h = 1,
        here = this.getHere(),
        clean = this.cleanCoordinate,
        x, y;

    if (xta(here, here.w, here.h)) {

        w = here.w; 
        h = here.h;
    }

    pins.forEach((item, index) => {

        let temp;

        if (item && item.substring) {

            temp = artefact[item];
            pins[index] = temp;
        }
        else temp = item;

        if (temp) {

            if (Array.isArray(temp)) {

                [x, y] = temp;

                current.push([clean(x, w), clean(y, h)]);
            }
            else if (isa_obj(temp) && temp.currentStart) {

                let name = this.name;

                if (temp.pivoted.indexOf(name) < 0) pushUnique(temp.pivoted, name);

                current.push([...temp.currentStampPosition]);
            }
        }
    });

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


// `makePolylinePath` - internal helper function - called by `cleanSpecies`
P.makePolylinePath = function () {

    let getPathParts = this.getPathParts,
        buildLine = this.buildLine,
        buildCurve = this.buildCurve,
        pins = this.pins,
        cPin = this.currentPins, 
        tension = this.tension,
        closed = this.closed;

    // 1. go through the pins array and get current values for each, pushed into currentPins array
    if (this.dirtyPins) this.cleanPinsArray();

    // 2. build the line
    let cLen = cPin.length,
        first = cPin[0],
        last = cPin[cLen - 1],
        calc = [],
        result = 'm0,0';

    if (closed) {

        let startPoint = [].concat(...getPathParts(...last, ...first, ...cPin[1], tension));

        for (let i = 0; i < cLen - 2; i++) {

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

        for (let i = 0; i < cLen - 2; i++) {

            calc = calc.concat(...getPathParts(...cPin[i], ...cPin[i + 1], ...cPin[i + 2], tension));
        }
        calc.push(last[0], last[1], last[0], last[1]);

        if (tension) result = buildCurve(first[0], first[1], calc);
        else result = buildLine(first[0], first[1], calc);
    }
    return result;
};

P.calculateLocalPathAdditionalActions = function () {

    let [x, y, w, h] = this.localBox,
        def = this.pathDefinition;

    if (this.mapToPins) {

        this.set({
            start: this.currentPins[0],
        });
    }
    else this.pathDefinition = def.replace('m0,0', `m${-x},${-y}`);

    this.pathCalculatedOnce = false;

    // ALWAYS, when invoking `calculateLocalPath` from `calculateLocalPathAdditionalActions`, include the second argument, set to `true`! Failure to do this leads to an infinite loop which will make your machine weep.
    // + We need to recalculate the local path to take into account the offset required to put the Oval entity's start coordinates at the top-left of the local box, and to recalculate the data used by other artefacts to place themselves on, or move along, its path.
    this.calculateLocalPath(this.pathDefinition, true);
};

// #### Factories

// ##### makePolyline
// Accepts argument with attributes:
// + __pins__ (required) - an Array of either coordinate (`[x, y]`) arrays with coordinates defined as absolute (Number) or relative (String%) values; or artefact objects (or their name-String values).
// + __tension__ float Number representing the bendiness of the line - for example: `0` (straight lines); `0.3` (a reasonably curved line).
// + __closed__ Boolean - when set, the start and end pins will be joined to complete the shape
// + __mapToPins__ Boolean - when set, the line will directly map to it's pin coordinates
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
const makePolyline = function (items = {}) {

    items.species = 'polyline';
    return new Polyline(items);
};

constructors.Polyline = Polyline;


// #### Exports
export {
    makePolyline,
};
