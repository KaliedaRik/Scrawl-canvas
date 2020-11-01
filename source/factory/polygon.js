// # Polygon factory
// A factory for generating various straight-edged polygon shape-based entitys
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
// + [Component-004](../../demo/component-004.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import { requestVector, releaseVector } from './vector.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';


// #### Polygon constructor
const Polygon = function (items = {}) {

    this.shapeInit(items);
    return this;
};


// #### Polygon prototype
let P = Polygon.prototype = Object.create(Object.prototype);
P.type = 'Polygon';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [shapeBasic](../mixin/shapeBasic.html)
P = baseMix(P);
P = shapeMix(P);


// #### Polygon attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
// + Attributes defined in the [shapeBasic mixin](../mixin/shapeBasic.html): __species, useAsPath, precision, pathDefinition, showBoundingBox, boundingBoxColor, minimumBoundingBoxDimensions, constantPathSpeed__.
let defaultAttributes = {

    sides: 0,
    radius: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let S = P.setters,
    D = P.deltaSetters;

// __sides__
S.sides = function (item) {

    this.sides = item;
    this.updateDirty();
};
D.sides = function (item) {

    this.sides += item;
    this.updateDirty();
};

// __sideLength__
S.radius = function (item) {

    this.radius = item;
    this.updateDirty();
};
D.radius = function (item) {

    this.radius += item;
    this.updateDirty();
};


// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;

    let p = 'M0,0';
    p = this.makePolygonPath();

    this.pathDefinition = p;
};


// `makePolygonPath` - internal helper function - called by `cleanSpecies`
P.makePolygonPath = function () {

    let radius = this.radius,
        sides = this.sides,
        turn = 360 / sides,
        myPath = ``,
        yPts = [],
        currentY = 0,
        myMax, myMin, myYoffset;

    let v = requestVector({x: 0, y: -radius});

    for (let i = 0; i < sides; i++) {

        v.rotate(turn);
        currentY += v.y;
        yPts.push(currentY);
        myPath += `${v.x.toFixed(1)},${v.y.toFixed(1)} `;
    }

    releaseVector(v);

    myMin = Math.min(...yPts);
    myMax = Math.max(...yPts);
    myYoffset = (((Math.abs(myMin) + Math.abs(myMax)) - radius) / 2).toFixed(1);

    myPath = `m0,${myYoffset}l${myPath}z`;

    return myPath;
};


// #### Factories

// ##### makePolygon
// Accepts argument with attributes:
// + __sides__ (required) - integer positive Number (greater than 2) representing the number of sides the Shape will have
// + __radius__ (required) - float Number representing the distance (in px) from the center of the Shape to the first angle on the Shape's circumference.
//
// ```
// scrawl.makePolygon({
//
//     name: 'triangle',
//
//     startX: 20,
//     startY: 935,
//
//     radius: 60,
//     sides: 3,
//
//     fillStyle: 'lightblue',
//     method: 'fillAndDraw',
// });
// ```
const makePolygon = function (items = {}) {

    items.species = 'polygon';
    return new Polygon(items);
};

constructors.Polygon = Polygon;


// #### Exports
export {
    makePolygon,
};
