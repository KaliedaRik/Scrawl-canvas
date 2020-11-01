// # Spiral factory
// A factory for generating spiral shape-based entitys
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

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';


// #### Spiral constructor
const Spiral = function (items = {}) {

    this.shapeInit(items);
    return this;
};


// #### Spiral prototype
let P = Spiral.prototype = Object.create(Object.prototype);
P.type = 'Spiral';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [shapeBasic](../mixin/shapeBasic.html)
P = baseMix(P);
P = shapeMix(P);


// #### Spiral attributes
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

    loops: 1,
    loopIncrement: 1,
    drawFromLoop: 0,
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

// __loops__
S.loops = function (item) {

    this.loops = item;
    this.updateDirty();
};
D.loops = function (item) {

    this.loops += item;
    this.updateDirty();
};

// __loopIncrement__
S.loopIncrement = function (item) {

    this.loopIncrement = item;
    this.updateDirty();
};
D.loopIncrement = function (item) {

    this.loopIncrement += item;
    this.updateDirty();
};

// __drawFromLoop__
S.drawFromLoop = function (item) {

    this.drawFromLoop = Math.floor(item);
    this.updateDirty();
};
D.drawFromLoop = function (item) {

    this.drawFromLoop = Math.floor(this.drawFromLoop + item);
    this.updateDirty();
};


// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;

    let p = 'M0,0';
    p = this.makeSpiralPath();

    this.pathDefinition = p;
};


// Magic numbers!
// + These numbers produce an Archimedian spiral
// + The first loop has effective dimensions of 2px by 2px
// + Each additional loop increases the dimensions by 2px
P.firstTurn = [
    [0.043, 0, 0.082, -0.035, 0.088, -0.088],
    [0.007, -0.057, -0.024, -0.121, -0.088, -0.162],
    [-0.07, -0.045, -0.169, -0.054, -0.265, -0.015],
    [-0.106, 0.043, -0.194, 0.138, -0.235, 0.265],
    [-0.044, 0.139, -0.026, 0.3, 0.058, 0.442],
    [0.091, 0.153, 0.25, 0.267, 0.442, 0.308],
    [0.206, 0.044, 0.431, -0.001, 0.619, -0.131],
    [0.2, -0.139, 0.34, -0.361, 0.381, -0.619]
];
P.subsequentTurns = [
    [0, -0.27, -0.11, -0.52, -0.29, -0.71],
    [-0.19, -0.19, -0.44, -0.29, -0.71, -0.29],
    [-0.27, 0, -0.52, 0.11, -0.71, 0.29],
    [-0.19, 0.19, -0.29, 0.44, -0.29, 0.71],
    [0, 0.27, 0.11, 0.52, 0.29, 0.71],
    [0.19, 0.19, 0.44, 0.29, 0.71, 0.29],
    [0.27, 0, 0.52, -0.11, 0.71, -0.29],
    [0.19, -0.19, 0.29, -0.44, 0.29, -0.71]
];

// `makeSpiralPath` - internal helper function - called by `cleanSpecies`
P.makeSpiralPath = function () {

    let loops = Math.floor(this.loops),
        loopIncrement = this.loopIncrement,
        drawFromLoop = Math.floor(this.drawFromLoop),
        x1, y1, x2, y2, x3, y3,
        sx1, sy1, sx2, sy2, sx3, sy3,
        firstTurn = this.firstTurn,
        subsequentTurns = this.subsequentTurns,
        currentTurn = [];

    for (let i = 0; i < firstTurn.length; i++) {

        [x1, y1, x2, y2, x3, y3] = firstTurn[i];
        currentTurn.push([x1 * loopIncrement, y1 * loopIncrement, x2 * loopIncrement, y2 * loopIncrement, x3 * loopIncrement, y3 * loopIncrement]);
    }

    let path = 'm0,0';

    for (let j = 0; j < loops; j++) {

        for (let i = 0; i < currentTurn.length; i++) {

            [x1, y1, x2, y2, x3, y3] = currentTurn[i];

            if (j >= drawFromLoop) path += `c${x1},${y1} ${x2},${y2} ${x3},${y3}`;

            [sx1, sy1, sx2, sy2, sx3, sy3] = subsequentTurns[i];
            currentTurn[i] = [x1 + (sx1 * loopIncrement), y1 + (sy1 * loopIncrement), x2 + (sx2 * loopIncrement), y2 + (sy2 * loopIncrement), x3 + (sx3 * loopIncrement), y3 + (sy3 * loopIncrement)];
        }
    }
    return path;
};

P.calculateLocalPathAdditionalActions = function () {

    let [x, y, w, h] = this.localBox,
        scale = this.scale;

    this.pathDefinition = this.pathDefinition.replace('m0,0', `m${-x / scale},${-y / scale}`);

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
// scrawl.makeSpiral({
//
//     name: 'mySpiral',
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
const makeSpiral = function (items = {}) {

    items.species = 'spiral';
    return new Spiral(items);
};

constructors.Spiral = Spiral;


// #### Exports
export {
    makeSpiral,
};
