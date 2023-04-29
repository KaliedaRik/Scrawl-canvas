// # Rectangle factory
// A factory for generating rectangular shape-based entitys, including round-cornered rectangles
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
// + [Canvas-014](../../demo/canvas-014.html) - Line, Quadratic and Bezier entitys - control lock alternatives
// + [Canvas-018](../../demo/canvas-018.html) - Phrase entity - text along a path
// + [Canvas-024](../../demo/canvas-024.html) - Loom entity functionality
// + [Canvas-030](../../demo/canvas-030.html) - Polyline entity functionality
// + [Canvas-038](../../demo/canvas-038.html) - Responsive Shape-based entitys
// + [DOM-015](../../demo/dom-015.html) - Use stacked DOM artefact corners as pivot points
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, mergeOver, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

import { ENTITY, RADIUS_ARRAY_ALL, RADIUS_ARRAY_BOTTOM, RADIUS_ARRAY_BOTTOM_LEFT, RADIUS_ARRAY_BOTTOM_LEFT_X, RADIUS_ARRAY_BOTTOM_LEFT_Y, RADIUS_ARRAY_BOTTOM_RIGHT, RADIUS_ARRAY_BOTTOM_RIGHT_X, RADIUS_ARRAY_BOTTOM_RIGHT_Y, RADIUS_ARRAY_BOTTOM_X, RADIUS_ARRAY_BOTTOM_Y, RADIUS_ARRAY_LEFT, RADIUS_ARRAY_LEFT_X, RADIUS_ARRAY_LEFT_Y, RADIUS_ARRAY_RIGHT, RADIUS_ARRAY_RIGHT_X, RADIUS_ARRAY_RIGHT_Y, RADIUS_ARRAY_TOP, RADIUS_ARRAY_TOP_LEFT, RADIUS_ARRAY_TOP_LEFT_X, RADIUS_ARRAY_TOP_LEFT_Y, RADIUS_ARRAY_TOP_RIGHT, RADIUS_ARRAY_TOP_RIGHT_X, RADIUS_ARRAY_TOP_RIGHT_Y, RADIUS_ARRAY_TOP_X, RADIUS_ARRAY_TOP_Y, RADIUS_ARRAY_X, RADIUS_ARRAY_Y, RECTANGLE, T_RECTANGLE, ZERO_PATH } from '../core/shared-vars.js';


// #### Rectangle constructor
const Rectangle = function (items = Ωempty) {

    this.shapeInit(items);

    this.currentRectangleWidth = 1;
    this.currentRectangleHeight = 1;

    return this;
};


// #### Rectangle prototype
const P = Rectangle.prototype = doCreate();
P.type = T_RECTANGLE;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [shapeBasic](../mixin/shapeBasic.html)
baseMix(P);
shapeMix(P);


// #### Rectangle attributes
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

    rectangleWidth: 10,
    rectangleHeight: 10,
    radiusTLX: 0,
    radiusTLY: 0,
    radiusTRX: 0,
    radiusTRY: 0,
    radiusBRX: 0,
    radiusBRY: 0,
    radiusBLX: 0,
    radiusBLY: 0,
    offshootA: 0.55,
    offshootB: 0,
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

S.radius = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_ALL);
};
S.radiusX = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_X);
};
S.radiusY = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_Y);
};
S.radiusT = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_TOP);
};
S.radiusB = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_BOTTOM);
};
S.radiusL = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_LEFT);
};
S.radiusR = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_RIGHT);
};
S.radiusTX = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_TOP_X);
};
S.radiusBX = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_BOTTOM_X);
};
S.radiusLX = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_LEFT_X);
};
S.radiusRX = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_RIGHT_X);
};
S.radiusTY = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_TOP_Y);
};
S.radiusBY = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_BOTTOM_Y);
};
S.radiusLY = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_LEFT_Y);
};
S.radiusRY = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_RIGHT_Y);
};
S.radiusTL = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_TOP_LEFT);
};
S.radiusTR = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_TOP_RIGHT);
};
S.radiusBL = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_BOTTOM_LEFT);
};
S.radiusBR = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_BOTTOM_RIGHT);
};
S.radiusTLX = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_TOP_LEFT_X);
};
S.radiusTLY = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_TOP_LEFT_Y);
};
S.radiusTRX = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_TOP_RIGHT_X);
};
S.radiusTRY = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_TOP_RIGHT_Y);
};
S.radiusBRX = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_BOTTOM_RIGHT_X);
};
S.radiusBRY = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_BOTTOM_RIGHT_Y);
};
S.radiusBLX = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_BOTTOM_LEFT_X);
};
S.radiusBLY = function (item) {

    this.setRectHelper(item, RADIUS_ARRAY_BOTTOM_LEFT_Y);
};
D.radius = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_ALL);
};
D.radiusX = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_X);
};
D.radiusY = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_Y);
};
D.radiusT = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_TOP);
};
D.radiusB = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_BOTTOM);
};
D.radiusL = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_LEFT);
};
D.radiusR = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_RIGHT);
};
D.radiusTX = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_TOP_X);
};
D.radiusBX = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_BOTTOM_X);
};
D.radiusLX = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_LEFT_X);
};
D.radiusRX = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_RIGHT_X);
};
D.radiusTY = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_TOP_Y);
};
D.radiusBY = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_BOTTOM_Y);
};
D.radiusLY = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_LEFT_Y);
};
D.radiusRY = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_RIGHT_Y);
};
D.radiusTL = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_TOP_LEFT);
};
D.radiusTR = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_TOP_RIGHT);
};
D.radiusBL = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_BOTTOM_LEFT);
};
D.radiusBR = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_BOTTOM_RIGHT);
};
D.radiusTLX = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_TOP_LEFT_X);
};
D.radiusTLY = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_TOP_LEFT_Y);
};
D.radiusTRX = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_TOP_RIGHT_X);
};
D.radiusTRY = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_TOP_RIGHT_Y);
};
D.radiusBRX = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_BOTTOM_RIGHT_X);
};
D.radiusBRY = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_BOTTOM_RIGHT_Y);
};
D.radiusBLX = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_BOTTOM_LEFT_X);
};
D.radiusBLY = function (item) {

    this.deltaRectHelper(item, RADIUS_ARRAY_BOTTOM_LEFT_Y);
};

S.offshootA = function (item) {

    this.offshootA = item;
    this.updateDirty();
};
S.offshootB = function (item) {

    this.offshootB = item;
    this.updateDirty();
};
D.offshootA = function (item) {

    if (item.toFixed) {

        this.offshootA += item;
        this.updateDirty();
    }
};
D.offshootB = function (item) {

    if (item.toFixed) {

        this.offshootB += item;
        this.updateDirty();
    }
};

S.rectangleWidth = function (val) {

    if (val != null) {

        this.rectangleWidth = val;
        this.dirtyDimensions = true;
        this.dirtyFilterIdentifier = true;
    }
};
S.rectangleHeight = function (val) {

    if (val != null) {

        this.rectangleHeight = val;
        this.dirtyDimensions = true;
        this.dirtyFilterIdentifier = true;
    }
};
D.rectangleWidth = function (val) {

    this.rectangleWidth = addStrings(this.rectangleWidth, val);
    this.dirtyDimensions = true;
    this.dirtyFilterIdentifier = true;
};
D.rectangleHeight = function (val) {

    this.rectangleHeight = addStrings(this.rectangleHeight, val);
    this.dirtyDimensions = true;
    this.dirtyFilterIdentifier = true;
};


// #### Prototype functions

// `setRectHelper` - internal setter helper function
P.setRectHelper = function (item, corners) {

    this.updateDirty();

    corners.forEach(corner => {

        this[corner] = item;
    }, this);
};

// `deltaRectHelper` - internal setter helper function
P.deltaRectHelper = function (item, corners) {

    this.updateDirty();

    corners.forEach(corner => {

        this[corner] = addStrings(this[corner], item);
    }, this);
};

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;
    this.pathDefinition = this.makeRectanglePath();
};

// `cleanDimensions` - internal helper function called by `prepareStamp` 
// + Unlike other Shape entitys, Rectangles have settable dimensions `rectangleWidth` and `rectangleWidth`.
P.cleanDimensions = function () {

    this.dirtyDimensions = false;

    const host = this.getHost();

    if (host) {

        const hostDims = (host.currentDimensions) ? host.currentDimensions : [host.w, host.h],
            oldW = this.currentRectangleWidth || 1,
            oldH = this.currentRectangleHeight || 1;

        let w = this.rectangleWidth,
            h = this.rectangleHeight;

        if (w.substring) w = (parseFloat(w) / 100) * hostDims[0];

        if (h.substring) h = (parseFloat(h) / 100) * hostDims[1];

        const mimic = this.mimic;
        
        let mimicDims;

        if (mimic && mimic.name && this.useMimicDimensions) mimicDims = mimic.currentDimensions;

        if (mimicDims) {

            this.currentRectangleWidth = (this.addOwnDimensionsToMimic) ? mimicDims[0] + w : mimicDims[0];
            this.currentRectangleHeight = (this.addOwnDimensionsToMimic) ? mimicDims[1] + h : mimicDims[1];
        }
        else {

            this.currentRectangleWidth = w;
            this.currentRectangleHeight = h;
        }

        this.currentDimensions[0] = this.currentRectangleWidth;
        this.currentDimensions[1] = this.currentRectangleHeight;

        this.dirtyStart = true;
        this.dirtyHandle = true;
        this.dirtyOffset = true;

        if (oldW !== this.currentRectangleWidth || oldH !== this.currentRectangleHeight) this.dirtyPositionSubscribers = true;

        if (this.mimicked && this.mimicked.length) this.dirtyMimicDimensions = true;
    }
    else this.dirtyDimensions = true;
};


// `makeRectanglePath` - internal helper function - called by `cleanSpecies`
P.makeRectanglePath = function () {

    if (this.dirtyDimensions) this.cleanDimensions()

    const width = this.currentRectangleWidth,
        height = this.currentRectangleHeight;

    const A = this.offshootA,
        B = this.offshootB;

    let _tlx = this.radiusTLX,
        _tly = this.radiusTLY,
        _trx = this.radiusTRX,
        _try = this.radiusTRY,
        _brx = this.radiusBRX,
        _bry = this.radiusBRY,
        _blx = this.radiusBLX,
        _bly = this.radiusBLY;

    if (_tlx.substring || _tly.substring || _trx.substring || _try.substring || _brx.substring || _bry.substring || _blx.substring || _bly.substring) {

        _tlx = (_tlx.substring) ? (parseFloat(_tlx) / 100) * width : _tlx;
        _tly = (_tly.substring) ? (parseFloat(_tly) / 100) * height : _tly;
        _trx = (_trx.substring) ? (parseFloat(_trx) / 100) * width : _trx;
        _try = (_try.substring) ? (parseFloat(_try) / 100) * height : _try;
        _brx = (_brx.substring) ? (parseFloat(_brx) / 100) * width : _brx;
        _bry = (_bry.substring) ? (parseFloat(_bry) / 100) * height : _bry;
        _blx = (_blx.substring) ? (parseFloat(_blx) / 100) * width : _blx;
        _bly = (_bly.substring) ? (parseFloat(_bly) / 100) * height : _bly;
    }

    let myData = ZERO_PATH;

    if (width - _tlx - _trx !== 0) myData += `h${width - _tlx - _trx}`;

    if (_trx + _try !== 0) myData += `c${_trx * A},${_try * B} ${_trx - (_trx * B)},${_try - (_try * A)}, ${_trx},${_try}`;
    
    if (height - _try - _bry !== 0) myData += `v${height - _try - _bry}`;
    
    if (_brx + _bry !== 0) myData += `c${-_brx * B},${_bry * A} ${-_brx + (_brx * A)},${_bry - (_bry * B)} ${-_brx},${_bry}`;
    
    if (-width + _blx + _brx !== 0) myData += `h${-width + _blx + _brx}`;
    
    if (_blx + _bly !== 0) myData += `c${-_blx * A},${-_bly * B} ${-_blx + (_blx * B)},${-_bly + (_bly * A)} ${-_blx},${-_bly}`;
    
    if (-height + _tly + _bly !== 0) myData += `v${-height + _tly + _bly}`;
    
    if (_tlx + _tly !== 0) myData += `c${_tlx * B},${-_tly * A} ${_tlx - (_tlx * A)},${-_tly + (_tly * B)} ${_tlx},${-_tly}`;

    myData += 'z';

    return myData;
};

P.calculateLocalPathAdditionalActions = function () {

    const [x, y] = this.localBox;

    this.pathDefinition = this.pathDefinition.replace(ZERO_PATH, `m${-x},${-y}`);

    this.pathCalculatedOnce = false;

    // ALWAYS, when invoking `calculateLocalPath` from `calculateLocalPathAdditionalActions`, include the second argument, set to `true`! Failure to do this leads to an infinite loop which will make your machine weep.
    // + We need to recalculate the local path to take into account the offset required to put the Rectangle entity's start coordinates at the top-left of the local box, and to recalculate the data used by other artefacts to place themselves on, or move along, its path.
    this.calculateLocalPath(this.pathDefinition, true);
};


// #### Factories

// ##### makeRectangle
// Essentially this Shape looks like a Block with rounded corners
//
// Rectangle Shapes are unique in that they require width and height dimensions, supplied in the __rectangleWidth__ and __rectangleHeight__ attributes.
//
// Internally, Scrawl-canvas uses quadratic curves to construct the corners. The _bend_ of these corners is set by the quadratic's control point which doesn't have its own coordinate but is rather calculated using two float Number variables: __offshootA__ (default: `0.55`) and __offshootB__ (default: `0`) - change these values to make the corners more or less bendy.
// 
// Each corner of the rectangle can be rounded using __radius__ values. Like the ___oval Shape___, the corner has both a horizontal `x` radius and a vertical `y` radius. Thus to draw a rectangle, we need to supply a total of 8 radius measurements:
// + __radiusTLX__ - the __T__op __L__eft corner's `x` radius
// + __radiusTLY__ - the __T__op __L__eft corner's `y` radius
// + __radiusTRX__ - the __T__op __R__ight corner's `x` radius
// + __radiusTRY__ - the __T__op __R__ight corner's `y` radius
// + __radiusBRX__ - the __B__ottom __R__ight corner's `x` radius
// + __radiusBRY__ - the __B__ottom __R__ight corner's `y` radius
// + __radiusBLX__ - the __B__ottom __L__eft corner's `x` radius
// + __radiusBLY__ - the __B__ottom __L__eft corner's `y` radius
//
// For convenience a lot of ___pseudo-attributes___ are supplied, which make defining the radius of each corner a bit easier. We achieve this by adding a letter or combination of letters to the word `'radius'`:
// + ___radius___ - all 8 radius values are set to the given distance (measured in px)
// + ___radiusX___ - the 4 `x` radius values
// + ___radiusY___ - the 4 `y` radius values
// + ___radiusT___ - the 4 `top` radius values
// + ___radiusTX___ - both `x` radius values for the `top` corners
// + ___radiusTY___ - both `y` radius values for the `top` corners
// + ___radiusB___ - the 4 `bottom` radius values
// + ___radiusBX___ - both `x` radius values for the `bottom` corners
// + ___radiusBY___ - both `y` radius values for the `bottom` corners
// + ___radiusL___ - the 4 `left` radius values
// + ___radiusLX___ - both `x` radius values for the `left` corners
// + ___radiusLY___ - both `y` radius values for the `left` corners
// + ___radiusR___ - the 4 `right` radius values
// + ___radiusRX___ - both `x` radius values for the `right` corners
// + ___radiusRY___ - both `y` radius values for the `right` corners
// + ___radiusTL___ - both radius values for the `top left` corner
// + ___radiusTR___ - both radius values for the `top right` corner
// + ___radiusBL___ - both radius values for the `bottom left` corner
// + ___radiusBR___ - both radius values for the `bottom right` corner
//
// ```
// scrawl.makeRectangle({
//
//     name: 'tab',
//
//     startX: 20,
//     startY: 200,
//
//     rectangleWidth: 120,
//     rectangleHeight: 80,
//
//     radiusT: 20,
//     radiusB: 0,
//
//     fillStyle: 'lightblue',
//     method: 'fillAndDraw',
// });
// ```
export const makeRectangle = function (items) {

    if (!items) return false;
    items.species = RECTANGLE;
    return new Rectangle(items);
};

constructors.Rectangle = Rectangle;
