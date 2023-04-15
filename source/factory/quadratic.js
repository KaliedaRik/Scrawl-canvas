// # Quadratic factory
// A factory for generating quadratic curve shape-based entitys
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
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { artefact, constructors } from '../core/library.js';

import { addStrings, doCreate, mergeOver, pushUnique, Ωempty } from '../core/utilities.js';

import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';
import curveMix from '../mixin/shape-curve.js';

import { CONTROL, CONTROL_PARTICLE, CONTROL_PATH, CONTROL_PIVOT, ENTITY, PATH, QUADRATIC, T_QUADRATIC, ZERO_PATH, ZERO_STR } from '../core/shared-vars.js';


// #### Quadratic constructor
const Quadratic = function (items = Ωempty) {

    this.control = makeCoordinate();
    this.currentControl = makeCoordinate();
    this.controlLockTo = 'coord';

    this.curveInit(items);
    this.shapeInit(items);

    this.dirtyControl = true;

    return this;
};


// #### Quadratic prototype
const P = Quadratic.prototype = doCreate();
P.type = T_QUADRATIC;
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


// #### Quadratic attributes
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
// + Attributes defined in the [shapeCurve mixin](../mixin/shapeCurve.html): __end, endPivot, endPivotCorner, addEndPivotHandle, addEndPivotOffset, endPath, endPathPosition, addEndPathHandle, addEndPathOffset, endLockTo, useStartAsControlPoint__.
const defaultAttributes = {

// The __control__ coordinate ('pin') defines the quadratic curve's control point.
// + Similar to the `start` coordinate, the `control` coordinate can be updated using the pseudo-attributes __controlX__ and __controlY__.
    control: null,

// __controlPivot__, __controlPivotCorner__, __addControlPivotHandle__, __addControlPivotOffset__
// + Like the `start` coordinate, the `control` coordinate can be __pivoted__ to another artefact. These attributes are used in the same way as the `pivot`, 'pivotCorner', `addPivotHandle` and `addPivotOffset` attributes. 
    controlPivot: ZERO_STR,
    controlPivotCorner: ZERO_STR,
    addControlPivotHandle: false,
    addControlPivotOffset: false,

// __controlPath__, __controlPathPosition__, __addControlPathHandle__, __addControlPathOffset__
// + Like the `start` coordinate, the `control` coordinate can be __pathed__ to another artefact. These attributes are used in the same way as the `path`, 'pathPosition', `addPathHandle` and `addPathOffset` attributes.
    controlPath: ZERO_STR,
    controlPathPosition: 0,
    addControlPathHandle: false,
    addControlPathOffset: true,

// __controlParticle__ - attribute to store any particle the artefact mey be using for its position reference
    controlParticle: ZERO_STR,

// __controlLockTo__
// + Like the `start` coordinate, the `control` coordinate can swap between using absolute and relative positioning by setting this attribute. Accepted values are: `coord` (default, for absolute positioning), `pivot`, `path`, `mouse`.
// + The control coordinate does not support 'mimic' relative positioning.
// + The control lock does not support setting the `x` and `y` coordinates separately - its value is a string argument, not an `[x, y]` array!
    controlLockTo: ZERO_STR,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetCoordinates = pushUnique(P.packetCoordinates, ['control']);
P.packetObjects = pushUnique(P.packetObjects, ['controlPivot', 'controlPath']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __controlPivot__
S.controlPivot = function (item) {

    this.setControlHelper(item, CONTROL_PIVOT, CONTROL);
    this.updateDirty();
    this.dirtyControl = true;
};

// __controlParticle__
S.controlParticle = function (item) {

    this.setControlHelper(item, CONTROL_PARTICLE, CONTROL);
    this.updateDirty();
    this.dirtyControl = true;
};

// __controlPath__
S.controlPath = function (item) {

    this.setControlHelper(item, CONTROL_PATH, CONTROL);
    this.updateDirty();
    this.dirtyControl = true;
    this.currentControlPathData = false;
};

// __controlPathPosition__
S.controlPathPosition = function (item) {

    this.controlPathPosition = item;
    this.dirtyControl = true;
    this.currentControlPathData = false;
    this.dirtyFilterIdentifier = true;
};
D.controlPathPosition = function (item) {

    this.controlPathPosition += item;
    this.dirtyControl = true;
    this.currentControlPathData = false;
    this.dirtyFilterIdentifier = true;
};

// __control__
// + pseudo-attributes __controlX__, __controlY__
G.controlPositionX = function () {

    return this.currentControl[0];
};
G.controlPositionY = function () {

    return this.currentControl[1];
};
G.controlPosition = function () {

    return [].concat(this.currentControl);
};

S.controlX = function (coord) {

    if (coord != null) {

        this.control[0] = coord;
        this.updateDirty();
        this.dirtyControl = true;
        this.currentControlPathData = false;
    }
};
S.controlY = function (coord) {

    if (coord != null) {

        this.control[1] = coord;
        this.updateDirty();
        this.dirtyControl = true;
        this.currentControlPathData = false;
    }
};
S.control = function (x, y) {

    this.setCoordinateHelper(CONTROL, x, y);
    this.updateDirty();
    this.dirtyControl = true;
    this.currentControlPathData = false;
};
D.controlX = function (coord) {

    const c = this.control;
    c[0] = addStrings(c[0], coord);
    this.updateDirty();
    this.dirtyControl = true;
    this.currentControlPathData = false;
};
D.controlY = function (coord) {

    const c = this.control;
    c[1] = addStrings(c[1], coord);
    this.updateDirty();
    this.dirtyControl = true;
    this.currentControlPathData = false;
};
D.control = function (x, y) {

    this.setDeltaCoordinateHelper(CONTROL, x, y);
    this.updateDirty();
    this.dirtyControl = true;
    this.currentControlPathData = false;
};

// __controlLockTo__
S.controlLockTo = function (item) {

    this.controlLockTo = item;
    this.updateDirty();
    this.dirtyControlLock = true;
    this.currentControlPathData = false;
};


// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;
    this.pathDefinition = this.makeQuadraticPath();
};

// `makeQuadraticPath` - internal helper function - called by `cleanSpecies`
P.makeQuadraticPath = function () {
    
    let [startX, startY] = this.currentStampPosition;
    let [controlX, controlY] = this.currentControl;
    let [endX, endY] = this.currentEnd;

    let cx = (controlX - startX).toFixed(2),
        cy = (controlY - startY).toFixed(2),
        ex = (endX - startX).toFixed(2),
        ey = (endY - startY).toFixed(2);

    return `${ZERO_PATH}q${cx},${cy} ${ex},${ey}`;
};

// `cleanDimensions` - internal helper function called by `prepareStamp` 
// + Dimensional data has no meaning in the context of Shape entitys (beyond positioning handle Coordinates): width and height are emergent properties that cannot be set on the entity.
P.cleanDimensions = function () {

    this.dirtyDimensions = false;
    this.dirtyHandle = true;
    this.dirtyOffset = true;

    this.dirtyStart = true;
    this.dirtyControl = true;
    this.dirtyEnd = true;

    this.dirtyFilterIdentifier = true;
};

P.preparePinsForStamp = function () {

    const dirtyPins = this.dirtyPins,
        ePivot = this.endPivot,
        ePath = this.endPath,
        cPivot = this.controlPivot,
        cPath = this.controlPath;

    for (let i = 0, iz = dirtyPins.length, name; i < iz; i++) {

        name = dirtyPins[i];

        if ((cPivot && cPivot.name === name) || (cPath && cPath.name == name)) {

            this.dirtyControl = true;
            if (this.controlLockTo.includes(PATH)) this.currentControlPathData = false;
        }

        if ((ePivot && ePivot.name === name) || (ePath && ePath.name == name)) {

            this.dirtyEnd = true;
            if (this.endLockTo.includes(PATH)) this.currentEndPathData = false;
        }
    };
    dirtyPins.length = 0;
};

// #### Factories

// ##### makeQuadratic
// Accepts argument with attributes:
// + __start__ (___startX___, ___startY___) Coordinate, or __pivot__/__mimic__/__path__ reference artefact (required)
// + __control__ (___controlX___, ___controlY___) Coordinate, or __controlPivot__/__controlPath__ reference artefact (required) 
// + __end__ (___endX___, ___endY___) Coordinate, or __endPivot__/__endPath__ reference artefact (required) 
// + If using reference artefacts, may also need to set the __lockTo__ (___lockXTo___, ___lockYTo___), __controlLockTo__ and __endLockTo__ lock attributes
// + additional reference-linked attributes for the `control` coordinate: __controlPivotCorner__, __addControlPivotHandle__, __addControlPivotOffset__, __controlPathPosition__, __addControlPathHandle__, __addControlPathOffset__
// + additional reference-linked attributes for the `end` coordinate: __endPivotCorner__, __addEndPivotHandle__, __addEndPivotOffset__, __endPathPosition__, __addEndPathHandle__, __addEndPathOffset__
//
// ```
// scrawl.makeQuadratic({
//
//     name: 'my-quadratic',
//
//     startX: '5%',
//     startY: '26.5%',
//
//     controlX: '50%',
//     controlY: '18%',
//
//     endX: '95%',
//     endY: '26.5%',
//
//     handleY: 'center',
//
//     lineWidth: 3,
//     lineCap: 'round',
//     strokeStyle: 'darkseagreen',
//
//     method: 'draw',
// });
// ```
export const makeQuadratic = function (items = Ωempty) {

    if (!items) return false;
    items.species = QUADRATIC;
    return new Quadratic(items);
};

constructors.Quadratic = Quadratic;
