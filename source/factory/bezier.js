// # Bezier factory
// A factory for generating bezier curve shape-based entitys
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
// + [Canvas-011](../../demo/canvas-011.html) - Shape entity (make, clone, method); drag and drop shape entitys
// + [Canvas-012](../../demo/canvas-012.html) - Shape entity position; shape entity as a path for other artefacts to follow
// + [Canvas-013](../../demo/canvas-013.html) - Path-defined entitys: oval, rectangle, line, quadratic, bezier, tetragon, polygon, star, spiral
// + [Canvas-014](../../demo/canvas-014.html) - Line, quadratic and bezier entitys - control lock alternatives
// + [Canvas-018](../../demo/canvas-018.html) - Phrase entity - text along a path
// + [Canvas-024](../../demo/canvas-024.html) - Loom entity functionality
// + [Canvas-030](../../demo/canvas-030.html) - Polyline entity functionality
// + [Canvas-038](../../demo/canvas-038.html) - Responsive Shape-based entitys
// + [DOM-015](../../demo/dom-015.html) - Use stacked DOM artefact corners as pivot points
// + [Packets-004](../../demo/packets-002.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, mergeOver, pushUnique, Ωempty } from '../core/utilities.js';

import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';
import curveMix from '../mixin/shape-curve.js';

import { BEZIER, COORD, END_CONTROL, END_CONTROL_PARTICLE, END_CONTROL_PATH, END_CONTROL_PIVOT, ENTITY, PATH, START_CONTROL, START_CONTROL_PARTICLE, START_CONTROL_PATH, START_CONTROL_PIVOT, T_BEZIER, ZERO_STR } from '../core/shared-vars.js';


// #### Bezier constructor
const Bezier = function (items = Ωempty) {

    this.startControl = makeCoordinate();
    this.endControl = makeCoordinate();

    this.currentStartControl = makeCoordinate();
    this.currentEndControl = makeCoordinate();

    this.startControlLockTo = COORD;
    this.endControlLockTo = COORD;

    this.curveInit(items);
    this.shapeInit(items);

    this.dirtyStartControl = true;
    this.dirtyEndControl = true;

    return this;
};


// #### Bezier prototype
const P = Bezier.prototype = doCreate();
P.type = T_BEZIER;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [shapeBasic](../mixin/shapeBasic.html)
// + [shapeCurve](../mixin/shapeCurve.html)
baseMix(P);
shapeMix(P);
curveMix(P);


// #### Bezier attributes
const defaultAttributes = {

// The __startControl__ coordinate ('pin') defines the bezier curve's first control point.
// + Similar to the `start` coordinate, the `startControl` coordinate can be updated using the pseudo-attributes __startControlX__ and __startControlY__.
    startControl: null,

// __startControlPivot__, __startControlPivotCorner__, __addStartControlPivotHandle__, __addStartControlPivotOffset__
// + Like the `start` coordinate, the `startControl` coordinate can be __pivoted__ to another artefact. These attributes are used in the same way as the `pivot`, 'pivotCorner', `addPivotHandle` and `addPivotOffset` attributes.
    startControlPivot: ZERO_STR,
    startControlPivotCorner: ZERO_STR,
    addStartControlPivotHandle: false,
    addStartControlPivotOffset: false,

// __startControlPath__, __startControlPathPosition__, __addStartControlPathHandle__, __addStartControlPathOffset__
// + Like the `start` coordinate, the `startControl` coordinate can be __pathed__ to another artefact. These attributes are used in the same way as the `path`, 'pathPosition', `addPathHandle` and `addPathOffset` attributes.
    startControlPath: ZERO_STR,
    startControlPathPosition: 0,
    addStartControlPathHandle: false,
    addStartControlPathOffset: true,

// __startControlParticle__ - attribute to store any particle the artefact mey be using for its position reference
    startControlParticle: ZERO_STR,

// The __endControl__ coordinate ('pin') defines the bezier curve's second control point.
// + Similar to the `start` coordinate, the `endControl` coordinate can be updated using the pseudo-attributes __endControlX__ and __endControlY__.
    endControl: null,

// __endControlPivot__, __endControlPivotCorner__, __addEndControlPivotHandle__, __addEndControlPivotOffset__
// + Like the `start` coordinate, the `endControl` coordinate can be __pivoted__ to another artefact. These attributes are used in the same way as the `pivot`, 'pivotCorner', `addPivotHandle` and `addPivotOffset` attributes.
    endControlPivot: ZERO_STR,
    endControlPivotCorner: ZERO_STR,
    addEndControlPivotHandle: false,
    addEndControlPivotOffset: false,

// __endControlPath__, __endControlPathPosition__, __addEndControlPathHandle__, __addEndControlPathOffset__
// + Like the `start` coordinate, the `endControl` coordinate can be __pathed__ to another artefact. These attributes are used in the same way as the `path`, 'pathPosition', `addPathHandle` and `addPathOffset` attributes.
    endControlPath: ZERO_STR,
    endControlPathPosition: 0,
    addEndControlPathHandle: false,
    addEndControlPathOffset: true,

// __endControlParticle__ - attribute to store any particle the artefact mey be using for its position reference
    endControlParticle: ZERO_STR,

// __startControlLockTo__, __endControlLockTo__
// + Like the `start` coordinate, the `startControl` and `endControl` coordinate can swap between using absolute and relative positioning by setting this attribute. Accepted values are: `coord` (default, for absolute positioning), `pivot`, `path`, `mouse`.
// + These coordinates do not support 'mimic' relative positioning.
// + These locks do not support setting the `x` and `y` coordinates separately - their value is a string argument, not an `[x, y]` array!
    startControlLockTo: ZERO_STR,
    endControlLockTo: ZERO_STR,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetCoordinates = pushUnique(P.packetCoordinates, ['startControl', 'endControl']);
P.packetObjects = pushUnique(P.packetObjects, ['startControlPivot', 'startControlParticle', 'startControlPath', 'endControlPivot', 'endControlParticle', 'endControlPath']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __endControlPivot__
S.endControlPivot = function (item) {

    this.setControlHelper(item, END_CONTROL_PIVOT, END_CONTROL);
    this.updateDirty();
    this.dirtyEndControl = true;
};

// __endControlParticle__
S.endControlParticle = function (item) {

    this.setControlHelper(item, END_CONTROL_PARTICLE, END_CONTROL);
    this.updateDirty();
    this.dirtyEndControl = true;
};

// __endControlPath__
S.endControlPath = function (item) {

    this.setControlHelper(item, END_CONTROL_PATH, END_CONTROL);
    this.updateDirty();
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};

// __endControlPathPosition__
S.endControlPathPosition = function (item) {

    this.endControlPathPosition = item;
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
    this.dirtyFilterIdentifier = true;
};
D.endControlPathPosition = function (item) {

    this.endControlPathPosition += item;
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
    this.dirtyFilterIdentifier = true;
};

// __startControlPivot__
S.startControlPivot = function (item) {

    this.setControlHelper(item, START_CONTROL_PIVOT, START_CONTROL);
    this.updateDirty();
    this.dirtyStartControl = true;
};

// __startControlParticle__
S.startControlParticle = function (item) {

    this.setControlHelper(item, START_CONTROL_PARTICLE, START_CONTROL);
    this.updateDirty();
    this.dirtyStartControl = true;
};

// __startControlPath__
S.startControlPath = function (item) {

    this.setControlHelper(item, START_CONTROL_PATH, START_CONTROL);
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};

// __startControlPathPosition__
S.startControlPathPosition = function (item) {

    this.startControlPathPosition = item;
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
    this.dirtyFilterIdentifier = true;
};
D.startControlPathPosition = function (item) {

    this.startControlPathPosition += item;
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
    this.dirtyFilterIdentifier = true;
};

// __startControl__
// + pseudo-attributes __startControlX__, __startControlY__
G.startControlPositionX = function () {

    return this.currentStartControl[0];
};
G.startControlPositionY = function () {

    return this.currentStartControl[1];
};
G.startControlPosition = function () {

    return [].concat(this.currentStartControl);
};

S.startControlX = function (coord) {

    if (coord != null) {

        this.startControl[0] = coord;
        this.updateDirty();
        this.dirtyStartControl = true;
        this.currentStartControlPathData = false;
    }
};
S.startControlY = function (coord) {

    if (coord != null) {

        this.startControl[1] = coord;
        this.updateDirty();
        this.dirtyStartControl = true;
        this.currentStartControlPathData = false;
    }
};
S.startControl = function (x, y) {

    this.setCoordinateHelper(START_CONTROL, x, y);
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};
D.startControlX = function (coord) {

    const c = this.startControl;
    c[0] = addStrings(c[0], coord);
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};
D.startControlY = function (coord) {

    const c = this.startControl;
    c[1] = addStrings(c[1], coord);
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};
D.startControl = function (x, y) {

    this.setDeltaCoordinateHelper(START_CONTROL, x, y);
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};

// __endControl__
// + pseudo-attributes __endControlX__, __endControlY__
G.endControlPositionX = function () {

    return this.currentEndControl[0];
};
G.endControlPositionY = function () {

    return this.currentEndControl[1];
};
G.endControlPosition = function () {

    return [].concat(this.currentEndControl);
};

S.endControlX = function (coord) {

    if (coord != null) {

        this.endControl[0] = coord;
        this.updateDirty();
        this.dirtyEndControl = true;
        this.currentEndControlPathData = false;
    }
};
S.endControlY = function (coord) {

    if (coord != null) {

        this.endControl[1] = coord;
        this.updateDirty();
        this.dirtyEndControl = true;
        this.currentEndControlPathData = false;
    }
};
S.endControl = function (x, y) {

    this.setCoordinateHelper(END_CONTROL, x, y);
    this.updateDirty();
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};
D.endControlX = function (coord) {

    const c = this.endControl;
    c[0] = addStrings(c[0], coord);
    this.updateDirty();
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};
D.endControlY = function (coord) {

    const c = this.endControl;
    c[1] = addStrings(c[1], coord);
    this.updateDirty();
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};
D.endControl = function (x, y) {

    this.setDeltaCoordinateHelper(END_CONTROL, x, y);
    this.updateDirty();
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};

// __startControlLockTo__
S.startControlLockTo = function (item) {

    this.startControlLockTo = item;
    this.updateDirty();
    this.dirtyStartControlLock = true;
};

// __endControlLockTo__
S.endControlLockTo = function (item) {

    this.endControlLockTo = item;
    this.updateDirty();
    this.dirtyEndControlLock = true;
    this.currentEndControlPathData = false;
};


// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;
    this.pathDefinition = this.makeBezierPath();
};

// `makeBezierPath` - internal helper function - called by `cleanSpecies`
P.makeBezierPath = function () {

    const [sX, sY] = this.currentStampPosition;
    const [sCX, sCY] = this.currentStartControl;
    const [eCX, eCY] = this.currentEndControl;
    const [eX, eY] = this.currentEnd;

    return `m0,0c${(sCX - sX).toFixed(2)},${(sCY - sY).toFixed(2)} ${(eCX - sX).toFixed(2)},${(eCY - sY).toFixed(2)} ${(eX - sX).toFixed(2)},${(eY - sY).toFixed(2)}`;
};

// `cleanDimensions` - internal helper function called by `prepareStamp`
// + Dimensional data has no meaning in the context of Shape entitys (beyond positioning handle Coordinates): width and height are emergent properties that cannot be set on the entity.
P.cleanDimensions = function () {

    this.dirtyDimensions = false;
    this.dirtyHandle = true;
    this.dirtyOffset = true;

    this.dirtyStart = true;
    this.dirtyStartControl = true;
    this.dirtyEndControl = true;
    this.dirtyEnd = true;

    this.dirtyFilterIdentifier = true;
};

P.preparePinsForStamp = function () {

    const dirtyPins = this.dirtyPins,
        ePivot = this.endPivot,
        ePath = this.endPath,
        scPivot = this.startControlPivot,
        scPath = this.startControlPath,
        ecPivot = this.endControlPivot,
        ecPath = this.endControlPath;

    for (let i = 0, iz = dirtyPins.length, name; i < iz; i++) {

        name = dirtyPins[i];

        if ((scPivot && scPivot.name == name) || (scPath && scPath.name == name)) {

            this.dirtyStartControl = true;
            if (this.startControlLockTo.includes(PATH)) this.currentStartControlPathData = false;
        }

        if ((ecPivot && ecPivot.name == name) || (ecPath && ecPath.name == name)) {

            this.dirtyEndControl = true;
            if (this.endControlLockTo.includes(PATH)) this.currentEndControlPathData = false;
        }

        if ((ePivot && ePivot.name == name) || (ePath && ePath.name == name)) {

            this.dirtyEnd = true;
            if (this.endLockTo.includes(PATH)) this.currentEndPathData = false;
        }
    }
    dirtyPins.length = 0;
};

// #### Factories

// ##### makeBezier
// Accepts argument with attributes:
// + __start__ (___startX___, ___startY___) Coordinate, or __pivot__/__mimic__/__path__ reference artefact (required)
// + __startControl__ (___startControlX___, ___startControlY___) Coordinate, or __startControlPivot__/__startControlPath__ reference artefact (required)
// + __endControl__ (__endCcontrolX___, __endCcontrolY___) Coordinate, or __endControlPivot__/__endControlPath__ reference artefact (required)
// + __end__ (___endX___, ___endY___) Coordinate, or __endPivot__/__endPath__ reference artefact (required)
// + If using reference artefacts, may also need to set the __lockTo__ (___lockXTo___, ___lockYTo___), __startControlLockTo__, __endControlLockTo__ and __endLockTo__ lock attributes
// + additional reference-linked attributes for the `startControl` coordinate: __startControlPivotCorner__, __addStartControlPivotHandle__, __addStartControlPivotOffset__, __startControlPathPosition__, __addStartControlPathHandle__, __addStartControlPathOffset__
// + additional reference-linked attributes for the `endControl` coordinate: __endControlPivotCorner__, __addEndControlPivotHandle__, __addEndControlPivotOffset__, __endControlPathPosition__, __addEndControlPathHandle__, __addEndControlPathOffset__
// + additional reference-linked attributes for the `end` coordinate: __endPivotCorner__, __addEndPivotHandle__, __addEndPivotOffset__, __endPathPosition__, __addEndPathHandle__, __addEndPathOffset__
//
// ```
// scrawl.makeBezier({
//
//     name: 'bezier-curve',
//
//     startX: '5%',
//     startY: '36%',
//
//     startControlX: '40%',
//     startControlY: '31%',
//
//     endControlX: '60%',
//     endControlY: '41%',
//
//     endX: '95%',
//     endY: '36%',
//
//     handleY: 'center',
//
//     lineWidth: 3,
//     lineCap: 'round',
//     strokeStyle: 'linen',
//
//     method: 'draw',
// });
// ```
export const makeBezier = function (items = Ωempty) {

    if (!items) return false;
    items.species = BEZIER;
    return new Bezier(items);
};

constructors.Bezier = Bezier;
