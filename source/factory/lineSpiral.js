// # LineSpiral factory
// A factory for generating 'degenerate' spiral shape-based entitys
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
import { constructors } from '../core/library.js';

import { 
    doCreate,
    mergeOver, 
    Ωempty, 
} from '../core/utilities.js';

import { 
    releaseCoordinate, 
    requestCoordinate, 
} from './coordinate.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';


// Local constants
const T_LINE_SPIRAL = 'LineSpiral',
    ENTITY = 'entity',
    ZERO_PATH = 'M0,0',
    LINE_SPIRAL = 'linespiral';


// #### LineSpiral constructor
const LineSpiral = function (items = Ωempty) {

    this.shapeInit(items);
    return this;
};


// #### LineSpiral prototype
const P = LineSpiral.prototype = doCreate();
P.type = T_LINE_SPIRAL;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [shapeBasic](../mixin/shapeBasic.html)
baseMix(P);
shapeMix(P);


// #### LineSpiral attributes
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

    startRadius: 0,
    radiusIncrement: 0.1,
    radiusIncrementAdjust: 1,

    startAngle: 0,
    angleIncrement: 5,
    angleIncrementAdjust: 1,

    stepLimit: 100,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const S = P.setters,
    D = P.deltaSetters;

// __startRadius__
S.startRadius = function (item) {

    this.startRadius = item;
    this.updateDirty();
};
D.startRadius = function (item) {

    this.startRadius += item;
    this.updateDirty();
};

// __radiusIncrement__
S.radiusIncrement = function (item) {

    this.radiusIncrement = item;
    this.updateDirty();
};
D.radiusIncrement = function (item) {

    this.radiusIncrement += item;
    this.updateDirty();
};

// __radiusIncrementAdjust__
S.radiusIncrementAdjust = function (item) {

    this.radiusIncrementAdjust = item;
    this.updateDirty();
};
D.radiusIncrementAdjust = function (item) {

    this.radiusIncrementAdjust += item;
    this.updateDirty();
};

// __startAngle__
S.startAngle = function (item) {

    this.startAngle = item;
    this.updateDirty();
};
D.startAngle = function (item) {

    this.startAngle += item;
    this.updateDirty();
};

// __angleIncrement__
S.angleIncrement = function (item) {

    this.angleIncrement = item;
    this.updateDirty();
};
D.angleIncrement = function (item) {

    this.angleIncrement += item;
    this.updateDirty();
};

// __angleIncrementAdjust__
S.angleIncrementAdjust = function (item) {

    this.angleIncrementAdjust = item;
    this.updateDirty();
};
D.angleIncrementAdjust = function (item) {

    this.angleIncrementAdjust += item;
    this.updateDirty();
};

// __stepLimit__
S.stepLimit = function (item) {

    this.stepLimit = item;
    this.updateDirty();
};
D.stepLimit = function (item) {

    this.stepLimit += item;
    this.updateDirty();
};



// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;

    let p = ZERO_PATH;
    p = this.makeLineSpiralPath();

    this.pathDefinition = p;
};


// `makeLineSpiralPath` - internal helper function - called by `cleanSpecies`
P.makeLineSpiralPath = function () {

    let path = `${ZERO_PATH} m`;

    let {startRadius, radiusIncrement, radiusIncrementAdjust, startAngle, angleIncrement, angleIncrementAdjust, stepLimit} = this;

    let coord = requestCoordinate();

    let currentAngle = startAngle,
        currentAngleIncrement = angleIncrement,
        currentRadius = startRadius,
        currentRadiusIncrement = radiusIncrement,
        counter = 0;

    coord.setFromArray([0, currentRadius]).rotate(currentAngle);

    path += `${coord[0].toFixed(1)},${coord[1].toFixed(1)}l`;

    while (counter < stepLimit) {

        counter ++;

        currentAngleIncrement *= angleIncrementAdjust;
        currentAngle += currentAngleIncrement;

        currentRadiusIncrement *= radiusIncrementAdjust;
        currentRadius += currentRadiusIncrement;

        coord.setFromArray([0, currentRadius]).rotate(currentAngle);

        path += `${coord[0].toFixed(1)},${coord[1].toFixed(1)} `;
    }
    releaseCoordinate(coord);
    return path;
};

P.calculateLocalPathAdditionalActions = function () {

    let [x, y, w, h] = this.localBox,
        scale = this.scale;

    this.pathDefinition = this.pathDefinition.replace(`${ZERO_PATH} `, `m${-x / scale},${-y / scale}`);

    this.pathCalculatedOnce = false;

    // ALWAYS, when invoking `calculateLocalPath` from `calculateLocalPathAdditionalActions`, include the second argument, set to `true`! Failure to do this leads to an infinite loop which will make your machine weep.
    // + We need to recalculate the local path to take into account the offset required to put the Spiral entity's start coordinates at the top-left of the local box, and to recalculate the data used by other artefacts to place themselves on, or move along, its path.
    this.calculateLocalPath(this.pathDefinition, true);
};


// #### Factories

// ##### makeSpiral
// A spiral drawn from an inner-radius outwards by a given number of loops, with the distance between each loop determined by a given increment. Accepts argument with attributes:
// + __loops__ (required) - positive float Number representing the number of times the Shape line will wind arount the Shape's center point
// + __loopIncrement__ - float Number representative of the distance between successive loops; negative values have the effect of rotating the spiral 180 degrees
// + __drawFromLoop__ - positive integer Number representing the loop on which the spiral starts to be drawn
//
// ```
// scrawl.makeLineSpiral({
//
//     name: 'myLineSpiral',
//
//     strokeStyle: 'darkgreen',
//     method: 'draw',
//
//     startX: 50,
//     startY: 100,
//
//     loops: 5,
//     loopIncrement: 0.8,
//     drawFromLoop: 1,
// });
// ```
export const makeLineSpiral = function (items) {

    if (!items) return false;
    items.species = LINE_SPIRAL;
    return new LineSpiral(items);
};

constructors.LineSpiral = LineSpiral;
