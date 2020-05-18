// # Bezier factory
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
import { mergeOver, addStrings, pushUnique } from '../core/utilities.js';

import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import shapeMix from '../mixin/shapeBasic.js';
import curveMix from '../mixin/shapeCurve.js';
import filterMix from '../mixin/filter.js';


// #### Bezier constructor
const Bezier = function (items = {}) {

    this.startControl = makeCoordinate();
    this.endControl = makeCoordinate();

    this.currentStartControl = makeCoordinate();
    this.currentEndControl = makeCoordinate();

    this.startControlLockTo = 'coord';
    this.endControlLockTo = 'coord';

    this.curveInit(items);
    this.shapeInit(items);

    this.dirtyStartControl = true;
    this.dirtyEndControl = true;

    return this;
};


// #### Bezier prototype
let P = Bezier.prototype = Object.create(Object.prototype);
P.type = 'Bezier';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = shapeMix(P);
P = curveMix(P);
P = filterMix(P);


// #### Bezier attributes
let defaultAttributes = {

    startControl: null,
    endControl: null,

    currentStartControl: null,
    currentEndControl: null,

    startControlPivot: '',
    startControlPivotCorner: '',
    addStartControlPivotHandle: false,
    addStartControlPivotOffset: false,
    startControlPath: '',
    startControlPathPosition: 0,
    addStartControlPathHandle: false,
    addStartControlPathOffset: true,
    startControlLockTo: '',

    endControlPivot: '',
    endControlPivotCorner: '',
    addEndControlPivotHandle: false,
    addEndControlPivotOffset: false,
    endControlPath: '',
    endControlPathPosition: 0,
    addEndControlPathHandle: false,
    addEndControlPathOffset: true,
    endControlLockTo: '',
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, []);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, ['startControl', 'endControl']);
P.packetObjects = pushUnique(P.packetObjects, ['startControlPivot', 'startControlPath', 'endControlPivot', 'endControlPath']);
P.packetFunctions = pushUnique(P.packetFunctions, []);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __endControlPivot__
S.endControlPivot = function (item) {

    this.setControlHelper(item, 'endControlPivot', 'endControl');
    this.updateDirty();
    this.dirtyEndControl = true;
};

// __endControlPath__
S.endControlPath = function (item) {

    this.setControlHelper(item, 'endControlPath', 'endControl');
    this.updateDirty();
    this.dirtyEndControl = true;
};

// __startControlPivot__
S.startControlPivot = function (item) {

    this.setControlHelper(item, 'startControlPivot', 'startControl');
    this.updateDirty();
    this.dirtyStartControl = true;
};

// __startControlPath__
S.startControlPath = function (item) {

    this.setControlHelper(item, 'startControlPath', 'startControl');
    this.updateDirty();
    this.dirtyStartControl = true;
};

// __startControl__
// + pseudo-attributes __startControlX__, __startControlY__
S.startControlX = function (coord) {

    if (coord != null) {

        this.startControl[0] = coord;
        this.updateDirty();
        this.dirtyStartControl = true;
    }
};
S.startControlY = function (coord) {

    if (coord != null) {

        this.startControl[1] = coord;
        this.updateDirty();
        this.dirtyStartControl = true;
    }
};
S.startControl = function (x, y) {

    this.setCoordinateHelper('startControl', x, y);
    this.updateDirty();
    this.dirtyStartControl = true;
};
D.startControlX = function (coord) {

    let c = this.startControl;
    c[0] = addStrings(c[0], coord);
    this.updateDirty();
    this.dirtyStartControl = true;
};
D.startControlY = function (coord) {

    let c = this.startControl;
    c[1] = addStrings(c[1], coord);
    this.updateDirty();
    this.dirtyStartControl = true;
};
D.startControl = function (x, y) {

    this.setDeltaCoordinateHelper('startControl', x, y);
    this.updateDirty();
    this.dirtyStartControl = true;
};

// __endControl__
// + pseudo-attributes __endControlX__, __endControlY__
S.endControlX = function (coord) {

    if (coord != null) {

        this.endControl[0] = coord;
        this.updateDirty();
        this.dirtyEndControl = true;
    }
};
S.endControlY = function (coord) {

    if (coord != null) {

        this.endControl[1] = coord;
        this.updateDirty();
        this.dirtyEndControl = true;
    }
};
S.endControl = function (x, y) {

    this.setCoordinateHelper('endControl', x, y);
    this.updateDirty();
    this.dirtyEndControl = true;
};
D.endControlX = function (coord) {

    let c = this.endControl;
    c[0] = addStrings(c[0], coord);
    this.updateDirty();
    this.dirtyEndControl = true;
};
D.endControlY = function (coord) {

    let c = this.endControl;
    c[1] = addStrings(c[1], coord);
    this.updateDirty();
    this.dirtyEndControl = true;
};
D.endControl = function (x, y) {

    this.setDeltaCoordinateHelper('endControl', x, y);
    this.updateDirty();
    this.dirtyEndControl = true;
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
};


// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;

    let p = 'M0,0';

    p = this.makeBezierPath();
    
    this.pathDefinition = p;
};

// `makeBezierPath` - internal helper function - called by `cleanSpecies`
P.makeBezierPath = function () {
    
    let [startX, startY] = this.currentStampPosition;
    let [startControlX, startControlY] = this.currentStartControl;
    let [endControlX, endControlY] = this.currentEndControl;
    let [endX, endY] = this.currentEnd;

    return `m0,0c${(startControlX - startX)},${(startControlY - startY)} ${(endControlX - startX)},${(endControlY - startY)} ${(endX - startX)},${(endY - startY)}`;
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
const makeBezier = function (items = {}) {

    items.species = 'bezier';
    return new Bezier(items);
};

constructors.Bezier = Bezier;


// #### Exports
export {
    makeBezier,
};
