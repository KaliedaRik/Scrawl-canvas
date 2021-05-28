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
import { constructors, artefact } from '../core/library.js';
import { mergeOver, addStrings, pushUnique, Ωempty } from '../core/utilities.js';

import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
import curveMix from '../mixin/shapeCurve.js';


// #### Bezier constructor
const Bezier = function (items = Ωempty) {

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
// + [base](../mixin/base.html)
// + [shapeBasic](../mixin/shapeBasic.html)
// + [shapeCurve](../mixin/shapeCurve.html)
P = baseMix(P);
P = shapeMix(P);
P = curveMix(P);


// #### Bezier attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, filter___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
// + Attributes defined in the [shapeBasic mixin](../mixin/shapeBasic.html): __species, useAsPath, precision, pathDefinition, showBoundingBox, boundingBoxColor, minimumBoundingBoxDimensions, constantPathSpeed__.
// + Attributes defined in the [shapeCurve mixin](../mixin/shapeCurve.html): __end, endPivot, endPivotCorner, addEndPivotHandle, addEndPivotOffset, endPath, endPathPosition, addEndPathHandle, addEndPathOffset, endLockTo, useStartAsControlPoint__.
let defaultAttributes = {

// The __startControl__ coordinate ('pin') defines the bezier curve's first control point.
// + Similar to the `start` coordinate, the `startControl` coordinate can be updated using the pseudo-attributes __startControlX__ and __startControlY__.
    startControl: null,

// __startControlPivot__, __startControlPivotCorner__, __addStartControlPivotHandle__, __addStartControlPivotOffset__
// + Like the `start` coordinate, the `startControl` coordinate can be __pivoted__ to another artefact. These attributes are used in the same way as the `pivot`, 'pivotCorner', `addPivotHandle` and `addPivotOffset` attributes. 
    startControlPivot: '',
    startControlPivotCorner: '',
    addStartControlPivotHandle: false,
    addStartControlPivotOffset: false,

// __startControlPath__, __startControlPathPosition__, __addStartControlPathHandle__, __addStartControlPathOffset__
// + Like the `start` coordinate, the `startControl` coordinate can be __pathed__ to another artefact. These attributes are used in the same way as the `path`, 'pathPosition', `addPathHandle` and `addPathOffset` attributes.
    startControlPath: '',
    startControlPathPosition: 0,
    addStartControlPathHandle: false,
    addStartControlPathOffset: true,

// __startControlParticle__ - attribute to store any particle the artefact mey be using for its position reference
    startControlParticle: '',

// The __endControl__ coordinate ('pin') defines the bezier curve's second control point.
// + Similar to the `start` coordinate, the `endControl` coordinate can be updated using the pseudo-attributes __endControlX__ and __endControlY__.
    endControl: null,

// __endControlPivot__, __endControlPivotCorner__, __addEndControlPivotHandle__, __addEndControlPivotOffset__
// + Like the `start` coordinate, the `endControl` coordinate can be __pivoted__ to another artefact. These attributes are used in the same way as the `pivot`, 'pivotCorner', `addPivotHandle` and `addPivotOffset` attributes. 
    endControlPivot: '',
    endControlPivotCorner: '',
    addEndControlPivotHandle: false,
    addEndControlPivotOffset: false,

// __endControlPath__, __endControlPathPosition__, __addEndControlPathHandle__, __addEndControlPathOffset__
// + Like the `start` coordinate, the `endControl` coordinate can be __pathed__ to another artefact. These attributes are used in the same way as the `path`, 'pathPosition', `addPathHandle` and `addPathOffset` attributes.
    endControlPath: '',
    endControlPathPosition: 0,
    addEndControlPathHandle: false,
    addEndControlPathOffset: true,

// __endControlParticle__ - attribute to store any particle the artefact mey be using for its position reference
    endControlParticle: '',

// __startControlLockTo__, __endControlLockTo__
// + Like the `start` coordinate, the `startControl` and `endControl` coordinate can swap between using absolute and relative positioning by setting this attribute. Accepted values are: `coord` (default, for absolute positioning), `pivot`, `path`, `mouse`.
// + These coordinates do not support 'mimic' relative positioning.
// + These locks do not support setting the `x` and `y` coordinates separately - their value is a string argument, not an `[x, y]` array!
    startControlLockTo: '',
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

// __endControlParticle__
S.endControlParticle = function (item) {

    this.setControlHelper(item, 'endControlParticle', 'endControl');
    this.updateDirty();
    this.dirtyEndControl = true;
};

// __endControlPath__
S.endControlPath = function (item) {

    this.setControlHelper(item, 'endControlPath', 'endControl');
    this.updateDirty();
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};

// __endControlPathPosition__
S.endControlPathPosition = function (item) {

    this.endControlPathPosition = item;
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};
D.endControlPathPosition = function (item) {

    this.endControlPathPosition += item;
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};

// __startControlPivot__
S.startControlPivot = function (item) {

    this.setControlHelper(item, 'startControlPivot', 'startControl');
    this.updateDirty();
    this.dirtyStartControl = true;
};

// __startControlParticle__
S.startControlParticle = function (item) {

    this.setControlHelper(item, 'startControlParticle', 'startControl');
    this.updateDirty();
    this.dirtyStartControl = true;
};

// __startControlPath__
S.startControlPath = function (item) {

    this.setControlHelper(item, 'startControlPath', 'startControl');
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};

// __startControlPathPosition__
S.startControlPathPosition = function (item) {

    this.startControlPathPosition = item;
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};
D.startControlPathPosition = function (item) {

    this.startControlPathPosition += item;
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};

// __startControl__
// + pseudo-attributes __startControlX__, __startControlY__
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

    this.setCoordinateHelper('startControl', x, y);
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};
D.startControlX = function (coord) {

    let c = this.startControl;
    c[0] = addStrings(c[0], coord);
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};
D.startControlY = function (coord) {

    let c = this.startControl;
    c[1] = addStrings(c[1], coord);
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};
D.startControl = function (x, y) {

    this.setDeltaCoordinateHelper('startControl', x, y);
    this.updateDirty();
    this.dirtyStartControl = true;
    this.currentStartControlPathData = false;
};

// __endControl__
// + pseudo-attributes __endControlX__, __endControlY__
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

    this.setCoordinateHelper('endControl', x, y);
    this.updateDirty();
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};
D.endControlX = function (coord) {

    let c = this.endControl;
    c[0] = addStrings(c[0], coord);
    this.updateDirty();
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};
D.endControlY = function (coord) {

    let c = this.endControl;
    c[1] = addStrings(c[1], coord);
    this.updateDirty();
    this.dirtyEndControl = true;
    this.currentEndControlPathData = false;
};
D.endControl = function (x, y) {

    this.setDeltaCoordinateHelper('endControl', x, y);
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

    let scx = (startControlX - startX).toFixed(2),
        scy = (startControlY - startY).toFixed(2),
        ecx = (endControlX - startX).toFixed(2),
        ecy = (endControlY - startY).toFixed(2),
        ex = (endX - startX).toFixed(2),
        ey = (endY - startY).toFixed(2);

    return `m0,0c${scx},${scy} ${ecx},${ecy} ${ex},${ey}`;
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
            if (this.startControlLockTo.includes('path')) this.currentStartControlPathData = false;
        }

        if ((ecPivot && ecPivot.name == name) || (ecPath && ecPath.name == name)) {

            this.dirtyEndControl = true;
            if (this.endControlLockTo.includes('path')) this.currentEndControlPathData = false;
        }

        if ((ePivot && ePivot.name == name) || (ePath && ePath.name == name)) {

            this.dirtyEnd = true;
            if (this.endLockTo.includes('path')) this.currentEndPathData = false;
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
const makeBezier = function (items = Ωempty) {

    if (!items) return false;
    items.species = 'bezier';
    return new Bezier(items);
};

constructors.Bezier = Bezier;


// #### Exports
export {
    makeBezier,
};
