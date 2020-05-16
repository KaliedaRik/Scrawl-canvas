// # Shape factory
// Shape entitys represent a diverse range of shapes rendered onto a DOM &lt;canvas> element using the Canvas API's [Path2D interface](https://developer.mozilla.org/en-US/docs/Web/API/Path2D).
// 
// Scrawl-canvas includes a number of ___convenience factory functions___ for generating Shape objects:
// + __makeShape__ - the most versatile factory - takes an [SVG &lt;path> String](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) and converts it (as best as it can) into a Shape entity (species: `default`).
// + __makeLine__ - creates a straight line Shape entity (species: `line`).
// + __makeQuadratic__ - creates a quadratic line Shape entity (species: `quadratic`).
// + __makeBezier__ - creates a bezier line Shape entity (species: `bezier`).
// + __makeRectangle__ - creates a rectangle Shape entity (species: `rectangle`).
// + __makeOval__ - creates an oval Shape entity (species: `oval`).
// + __makeTetragon__ - creates a four-sided Shape entity (species: `tetragon`).
// + __makePolygon__ - creates a regular, multi-sided Shape entity with equal-length sides (species: `polygon`).
// + __makeStar__ - creates a star Shape entity (species: `star`).
// + __makeSpiral__ - creates a spiral Shape entity (species: `spiral`).
// + __makePolyline__ - creates an irregular, multi-sided Shape line or curve entity (either open or closed) using a set of coordinates (species: `polyline`).
// + (Under the hood, all Shapes are created using SVG Path Strings)
//
// The `line`, `quadratic` and `bezier` Shapes come with additional Coordinates which can be used to position them in the display. These Coordinates can be manipulated and animated in the same way as `start`, `handle` and `offset` Coordinates.
// + the __end__ Coordinate is used by all three species - the pseudo-attributes are __endX__, __endY__
// + the __control__ Coordinate is specific to `quadratic` Shapes - pseudo-attributes: __controlX__, __controlY__
// + the __startControl__ and __endControl__ Coordinates are specific to `bezier` Shapes - pseudo-attributes: __startControlX__ and __startControlY__, __endControlX__ and __endControlY__.
// + all of these Coordinates can be positioned absolutely (px Numbers), relatively (% Strings), or by reference to other Artefacts.
//
// By default, a Shape entity is just that - an entity. It can be positioned, cloned, filtered etc like any other entity:
// + Positioning functionality for the Shape is supplied by the __position__ mixin, while rendering functionality comes from the __entity__ mixin. 
// + Dimensions, however, have no meaning for Shape entitys - their width and height are determined by their SVG path data Strings; use `scale` instead.
// + Shapes can use CSS color Strings for their fillStyle and strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects. 
// + They will also accept __Filter__ objects.
// + They can use __Anchor__ objects for user navigation. 
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__. 
// + They can be __animated__ directly, or using delta animation, or act as the target for __Tween__ animations.
// + Shapes can be cloned, and killed.


// #### Using Shape entitys as Scrawl-canvas paths
// A path is a track - straight, or curved, or as complex as required - placed across a container which artefacts can use as a source of their positioning data. We can animate an artifact to move along the path:
// + To turn a Shape into a path, set its `useAsPath` flag to `true`.
// + The artefact can then set its `path` attribute to the Shape's name-String (or the Shape itself), and set its `lockTo` Array values to `"path"`.
// + We position the artefact by setting its `pathPosition` attribute to a float Number value between `0.0 - 1.0`, with `0` being the start of the path, and `1` being its end.
// + Shape entitys can use other Shapes as a path.
// + Phrase entitys can use a path to position their text block; they can also use a path to position each letter individually along the path (use the path as their text's baseline).
// + Artefacts (and letters) can be rotated so that they match the rotation at that point along the path - ___tangential rotation___ by setting their `addPathRotation` flag to `true`.
// + Animate an artefact along the path by either using the artefact's `delta` object, or triggering a Tween to perform the movement.

// TODO: consider whether it would be worthwhile to break this file down into modules specific to each Shape species, alongside a mixin for common functionality between them. Also: consider adding the following Shape species:
// + __radialshape__ (makeRadialShape) - use path and repeat arguments; functionality will be to: swivel the path around a central point 'repeat' number of times (angle = 360/repeat) and turn the resulting radial shape into a single path value
// + __boxedshape__ (makeBoxedShape) - I'm a bit fuzzy about this one, but I want to somehow _box up_ (relativize) other Shape paths with box width/height values which can then be manipulated - allowing us to stretch the Shape path to match its box dimensions


// #### Demos:
// + [Canvas-011](../../demo/canvas-011.html) - Shape entity (make, clone, method); drag and drop shape entitys
// + [Canvas-012](../../demo/canvas-012.html) - Shape entity position; shape entity as a path for other artefacts to follow
// + [Canvas-013](../../demo/canvas-013.html) - Defined Shape entitys: oval, rectangle, line, quadratic, bezier, tetragon, polygon, star, spiral
// + [Canvas-014](../../demo/canvas-014.html) - Line, quadratic and bezier Shapes - control lock alternatives
// + [Canvas-018](../../demo/canvas-018.html) - Phrase entity - text along a path
// + [Canvas-019](../../demo/canvas-019.html) - Artefact collision detection
// + [Canvas-024](../../demo/canvas-024.html) - Loom entity functionality
// + [DOM-015](../../demo/dom-015.html) - Use stacked DOM artefact corners as pivot points
// + [Component-004](../../demo/component-004.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors, radian, artefact } from '../core/library.js';
import { mergeOver, isa_boolean, isa_obj, xt, xta, addStrings, xtGet, defaultNonReturnFunction, capitalize, removeItem, pushUnique } from '../core/utilities.js';

import { requestVector, releaseVector } from './vector.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';

import calculatePath from '../mixin/shapePathCalculation.js';


// #### Shape constructor
const Shape = function (items = {}) {

    this.startControl = makeCoordinate();
    this.control = makeCoordinate();
    this.endControl = makeCoordinate();
    this.end = makeCoordinate();

    this.currentStartControl = makeCoordinate();
    this.currentControl = makeCoordinate();
    this.currentEndControl = makeCoordinate();
    this.currentEnd = makeCoordinate();

    this.controlledLineOffset = makeCoordinate();

    this.startControlLockTo = 'coord';
    this.controlLockTo = 'coord';
    this.endControlLockTo = 'coord';
    this.endLockTo = 'coord';

    // Required by `polyline` species
    this.pins = [];

    this.entityInit(items);

    this.units = [];
    this.unitLengths = [];
    this.unitPartials = [];

    this.pathed = [];

    this.localBox = [];

    this.dirtyStartControl = true;
    this.dirtyEndControl = true;
    this.dirtyControl = true;
    this.dirtyEnd = true;

    this.dirtySpecies = true;
    this.dirtyPathObject = true;

    return this;
};


// #### Shape prototype
let P = Shape.prototype = Object.create(Object.prototype);
P.type = 'Shape';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = filterMix(P);


// #### Shape attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, handle, offset, dimensions, delta, noDeltaUpdates, pivot, pivotCorner, pivoted, addPivotHandle, addPivotOffset, addPivotRotation, path, pathPosition, addPathHandle, addPathOffset, addPathRotation, mimic, mimicked, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic, lockTo, scale, roll, collides, sensorSpacing, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates__.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil, filterAlpha, filterComposite__.
let defaultAttributes = {

// __species__ - internal attribute: we cannot change a Shape's species once it has been crearted! Current species supported:
// + default '' (makeShape)
// + `line` (makeLine) 
// + `quadratic` (makeQuadratic)
// + `bezier` (makeBezier)
// + `rectangle` (makeRectangle)
// + `oval` (makeOval)
// + `tetragon` (makeTetragon)
// + `polygon` (makePolygon)
// + `star` (makeStar)
// + `spiral` (makeSpiral)
// + `polyline` (makePolyline)
    species: '',


// __useAsPath__ - by default, a Shape entity is just lines on the screen. It needs to be explicitly defined as a 'path' if it is to be used as a path by other artefacts.
    useAsPath: false,


// __precision__ - used when doing length calculations - the smaller this value, the greater the precision of the final length value
    precision: 10,


// Attributes used by `default` species
    pathDefinition: '',


// Attributes used by `spiral` species
    loops: 1,
    loopIncrement: 1,
    drawFromLoop: 0,


// Attributes used by `polyline` species
    tension: 0,
    pins: null,
    closed: false,
    mapToPins: false,


// Attributes used by `rectangle` species
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


// Attributes used by `oval` and `tetragon` species (offshoot attributes also used by the `rectangle` species)
    radiusX: 5,
    radiusY: 5,
    intersectX: 0.5,
    intersectY: 0.5,
    offshootA: 0.55,
    offshootB: 0,


// Attributes used by `polygon` species
    sides: 0,
    sideLength: 0,


// Attributes used by `star` species
    radius1: 0,
    radius2: 0,
    points: 0,
    twist: 0,


// Attributes used by `line`, `quadratic`, `bezier` species
    startControl: null,
    control: null,
    endControl: null,
    end: null,

    currentStartControl: null,
    currentControl: null,
    currentEndControl: null,
    currentEnd: null,

    startControlPivot: '',
    startControlPivotCorner: '',
    addStartControlPivotHandle: false,
    addStartControlPivotOffset: false,
    startControlPath: '',
    startControlPathPosition: 0,
    addStartControlPathHandle: false,
    addStartControlPathOffset: true,
    startControlLockTo: '',

    controlPivot: '',
    controlPivotCorner: '',
    addControlPivotHandle: false,
    addControlPivotOffset: false,
    controlPath: '',
    controlPathPosition: 0,
    addControlPathHandle: false,
    addControlPathOffset: true,
    controlLockTo: '',

    endControlPivot: '',
    endControlPivotCorner: '',
    addEndControlPivotHandle: false,
    addEndControlPivotOffset: false,
    endControlPath: '',
    endControlPathPosition: 0,
    addEndControlPathHandle: false,
    addEndControlPathOffset: true,
    endControlLockTo: '',

    endPivot: '',
    endPivotCorner: '',
    addEndPivotHandle: false,
    addEndPivotOffset: false,
    endPath: '',
    endPathPosition: 0,
    addEndPathHandle: false,
    addEndPathOffset: true,
    endLockTo: '',

    useStartAsControlPoint: false,


// __bounding box__ attributes - useful for development work
    showBoundingBox: false,
    boundingBoxColor: 'rgba(0,0,0,0.5)',
    minimumBoundingBoxDimensions: 20,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['dimensions', 'pathed', 'controlledLineOffset']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, ['startControl', 'control', 'endControl', 'end']);
P.packetObjects = pushUnique(P.packetObjects, ['startControlPivot', 'startControlPath', 'controlPivot', 'controlPath', 'endControlPivot', 'endControlPath', 'endPivot', 'endPath']);
P.packetFunctions = pushUnique(P.packetFunctions, []);

P.packetSpeciesCheck = ['loops', 'loopIncrement', 'drawFromLoop', 'rectangleWidth', 'rectangleHeight', 'radiusTLX', 'radiusTLY', 'radiusTRX', 'radiusTRY', 'radiusBRX', 'radiusBRY', 'radiusBLX', 'radiusBLY', 'radiusX', 'radiusY', 'intersectX', 'intersectY', 'offshootA', 'offshootB', 'sides', 'sideLength', 'radius1', 'radius2', 'points', 'twist', 'startControl', 'control', 'endControl', 'end', 'startControlPivot', 'startControlPivotCorner', 'addStartControlPivotHandle', 'addStartControlPivotOffset', 'startControlPath', 'startControlPathPosition', 'addStartControlPathHandle', 'addStartControlPathOffset', 'startControlLockTo', 'controlPivot', 'controlPivotCorner', 'addControlPivotHandle', 'addControlPivotOffset', 'controlPath', 'controlPathPosition', 'addControlPathHandle', 'addControlPathOffset', 'controlLockTo', 'endControlPivot', 'endControlPivotCorner', 'addEndControlPivotHandle', 'addEndControlPivotOffset', 'endControlPath', 'endControlPathPosition', 'addEndControlPathHandle', 'addEndControlPathOffset', 'endControlLockTo', 'endPivot', 'endPivotCorner', 'addEndPivotHandle', 'addEndPivotOffset', 'endPath', 'endPathPosition', 'addEndPathHandle', 'addEndPathOffset', 'endLockTo', 'pathDefinition', 'tension', 'pins', 'closed', 'mapToPins'];

P.packetSpeciesInclusions = {
    spiral: ['loops', 'loopIncrement', 'drawFromLoop'],
    rectangle: ['rectangleWidth', 'rectangleHeight', 'radiusTLX', 'radiusTLY', 'radiusTRX', 'radiusTRY', 'radiusBRX', 'radiusBRY', 'radiusBLX', 'radiusBLY'],
    oval: ['radiusX', 'radiusY', 'intersectX', 'intersectY', 'offshootA', 'offshootB'],
    tetragon: ['radiusX', 'radiusY', 'intersectX', 'intersectY', 'offshootA', 'offshootB'],
    polygon: ['sides', 'sideLength'],
    star: ['radius1', 'radius2', 'points', 'twist'],
    line: ['end', 'endPivot', 'endPivotCorner', 'addEndPivotHandle', 'addEndPivotOffset', 'endPath', 'endPathPosition', 'addEndPathHandle', 'addEndPathOffset', 'endLockTo'],
    quadratic: ['end', 'endPivot', 'endPivotCorner', 'addEndPivotHandle', 'addEndPivotOffset', 'endPath', 'endPathPosition', 'addEndPathHandle', 'addEndPathOffset', 'endLockTo', 'control', 'controlPivot', 'controlPivotCorner', 'addControlPivotHandle', 'addControlPivotOffset', 'controlPath', 'controlPathPosition', 'addControlPathHandle', 'addControlPathOffset', 'controlLockTo'],
    bezier: ['end', 'endPivot', 'endPivotCorner', 'addEndPivotHandle', 'addEndPivotOffset', 'endPath', 'endPathPosition', 'addEndPathHandle', 'addEndPathOffset', 'endLockTo', 'startControl', 'startControlPivot', 'startControlPivotCorner', 'addStartControlPivotHandle', 'addStartControlPivotOffset', 'startControlPath', 'startControlPathPosition', 'addStartControlPathHandle', 'addStartControlPathOffset', 'startControlLockTo', 'endControl', 'endControlPivot', 'endControlPivotCorner', 'addEndControlPivotHandle', 'addEndControlPivotOffset', 'endControlPath', 'endControlPathPosition', 'addEndControlPathHandle', 'addEndControlPathOffset', 'endControlLockTo'],
    default: ['pathDefinition'],
    polyline: ['tension', 'pins', 'closed', 'mapToPins'],
};

P.finalizePacketOut = function (copy, items) {

    let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
    copy = mergeOver(copy, stateCopy);

    copy = this.handlePacketAnchor(copy, items);

    let keyCheck = this.packetSpeciesCheck,
        inclusions = this.packetSpeciesInclusions.default;

    if (copy.species) inclusions = this.packetSpeciesInclusions[copy.species] || [];

    Object.keys(copy).forEach(key => {

        if (keyCheck.indexOf(key) >= 0) {

            if (inclusions.indexOf(key) < 0) delete copy[key];
        }

        // Additional work required for `polyline` species
        else if (key === 'pins') {

            // Iterate through the array - if artefacts are included, only want their names
        }
    });

    return copy;
};

// #### Clone management
// No additional clone functionality required


// #### Kill management
P.factoryKill = function () {

    Object.entries(artefact).forEach(([name, art]) => {

        if (art.name !== this.name) {

            if (art.startControlPivot && art.startControlPivot.name === this.name) art.set({ startControlPivot: false});
            if (art.controlPivot && art.controlPivot.name === this.name) art.set({ controlPivot: false});
            if (art.endControlPivot && art.endControlPivot.name === this.name) art.set({ endControlPivot: false});
            if (art.endPivot && art.endPivot.name === this.name) art.set({ endPivot: false});

            if (art.startControlPath && art.startControlPath.name === this.name) art.set({ startControlPath: false});
            if (art.controlPath && art.controlPath.name === this.name) art.set({ controlPath: false});
            if (art.endControlPath && art.endControlPath.name === this.name) art.set({ endControlPath: false});
            if (art.endPath && art.endPath.name === this.name) art.set({ endPath: false});

            // Need to figure out how we are going to get artefacts to use the polyline pins as their reference point - will need changes in the position mixin as well as this file.
        }
    });
};


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __pathDefinition__
S.pathDefinition = function (item) {

    if (item.substring) this.pathDefinition = item;
    this.dirtyPathObject = true;
};

// __species__ - used internally
S.species = function (item) {

    if (xt(item)) {

        if (item) this.dirtyPathObject = true;

        this.species = item;
        this.updateDirty();
    }
};

// __useStartAsControlPoint__
S.useStartAsControlPoint = function (item) {

    this.useStartAsControlPoint = item;

    if (!item) {

        let controlledLine = this.controlledLineOffset;
        controlledLine[0] = 0;
        controlledLine[1] = 0;
    }

    this.updateDirty();
};

// Invalidate __dimensions__ setters - dimensions are an emergent property of shapes, not a defining property
S.width = defaultNonReturnFunction;
S.height = defaultNonReturnFunction;
S.dimensions = defaultNonReturnFunction;
D.width = defaultNonReturnFunction;
D.height = defaultNonReturnFunction;
D.dimensions = defaultNonReturnFunction;


// __endPivot__
S.endPivot = function (item) {

    this.setControlHelper(item, 'endPivot', 'end');
    this.updateDirty();
    this.dirtyEnd = true;
};

// __endPath__
S.endPath = function (item) {

    this.setControlHelper(item, 'endPath', 'end');
    this.updateDirty();
    this.dirtyEnd = true;
};

// __controlPivot__
S.controlPivot = function (item) {

    this.setControlHelper(item, 'controlPivot', 'control');
    this.updateDirty();
    this.dirtyControl = true;
};

// __controlPath__
S.controlPath = function (item) {

    this.setControlHelper(item, 'controlPath', 'control');
    this.updateDirty();
    this.dirtyControl = true;
};

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

// __control__
// + pseudo-attributes __controlX__, __controlY__
S.controlX = function (coord) {

    if (coord != null) {

        this.control[0] = coord;
        this.updateDirty();
        this.dirtyControl = true;
    }
};
S.controlY = function (coord) {

    if (coord != null) {

        this.control[1] = coord;
        this.updateDirty();
        this.dirtyControl = true;
    }
};
S.control = function (x, y) {

    this.setCoordinateHelper('control', x, y);
    this.updateDirty();
    this.dirtyControl = true;
};
D.controlX = function (coord) {

    let c = this.control;
    c[0] = addStrings(c[0], coord);
    this.updateDirty();
    this.dirtyControl = true;
};
D.controlY = function (coord) {

    let c = this.control;
    c[1] = addStrings(c[1], coord);
    this.updateDirty();
    this.dirtyControl = true;
};
D.control = function (x, y) {

    this.setDeltaCoordinateHelper('control', x, y);
    this.updateDirty();
    this.dirtyControl = true;
};

// __end__
// + pseudo-attributes __endX__, __endY__
S.endX = function (coord) {

    if (coord != null) {

        this.end[0] = coord;
        this.updateDirty();
        this.dirtyEnd = true;
    }
};
S.endY = function (coord) {

    if (coord != null) {

        this.end[1] = coord;
        this.updateDirty();
        this.dirtyEnd = true;
    }
};
S.end = function (x, y) {

    this.setCoordinateHelper('end', x, y);
    this.updateDirty();
    this.dirtyEnd = true;
};
D.endX = function (coord) {

    let c = this.end;
    c[0] = addStrings(c[0], coord);
    this.updateDirty();
    this.dirtyEnd = true;
};
D.endY = function (coord) {

    let c = this.end;
    c[1] = addStrings(c[1], coord);
    this.updateDirty();
    this.dirtyEnd = true;
};
D.end = function (x, y) {

    this.setDeltaCoordinateHelper('end', x, y);
    this.updateDirty();
    this.dirtyEnd = true;
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

// __controlLockTo__
S.controlLockTo = function (item) {

    this.controlLockTo = item;
    this.updateDirty();
    this.dirtyControlLock = true;
};

// __endLockTo__
S.endLockTo = function (item) {

    this.endLockTo = item;
    this.updateDirty();
    this.dirtyEndLock = true;
};

// A variety of attributes with the word __radius__ in them
// + Including: __radius__, __radiusX__, __radiusY__, __radiusT__, __radiusB__, __radiusL__, __radiusR__, __radiusTX__, __radiusBX__, __radiusLX__, __radiusRX__, __radiusTY__, __radiusBY__, __radiusLY__, __radiusRY__, __radiusTL__, __radiusTR__, __radiusBL__, __radiusBR__, __radiusTLX__, __radiusTRX__, __radiusBRX__, __radiusBLX__, __radiusTLY__, __radiusTRY__, __radiusBRY__, __radiusBLY__, __radius1__, __radius2__drawFromLoop
S.radius = function (item) {

    this.setRectHelper(item, ['radiusTLX', 'radiusTRX', 'radiusBRX', 'radiusBLX', 'radiusX', 'radiusTLY', 'radiusTRY', 'radiusBRY', 'radiusBLY', 'radiusY']);
};
S.radiusX = function (item) {

    this.setRectHelper(item, ['radiusTLX', 'radiusTRX', 'radiusBRX', 'radiusBLX', 'radiusX']);
};
S.radiusY = function (item) {

    this.setRectHelper(item, ['radiusTLY', 'radiusTRY', 'radiusBRY', 'radiusBLY', 'radiusY']);
};
S.radiusT = function (item) {

    this.setRectHelper(item, ['radiusTLX', 'radiusTLY', 'radiusTRX', 'radiusTRY']);
};
S.radiusB = function (item) {

    this.setRectHelper(item, ['radiusBRX', 'radiusBRY', 'radiusBLX', 'radiusBLY']);
};
S.radiusL = function (item) {

    this.setRectHelper(item, ['radiusTLX', 'radiusTLY', 'radiusBLX', 'radiusBLY']);
};
S.radiusR = function (item) {

    this.setRectHelper(item, ['radiusTRX', 'radiusTRY', 'radiusBRX', 'radiusBRY']);
};
S.radiusTX = function (item) {

    this.setRectHelper(item, ['radiusTLX', 'radiusTRX']);
};
S.radiusBX = function (item) {

    this.setRectHelper(item, ['radiusBRX', 'radiusBLX']);
};
S.radiusLX = function (item) {

    this.setRectHelper(item, ['radiusTLX', 'radiusBLX']);
};
S.radiusRX = function (item) {

    this.setRectHelper(item, ['radiusTRX', 'radiusBRX']);
};
S.radiusTY = function (item) {

    this.setRectHelper(item, ['radiusTLY', 'radiusTRY']);
};
S.radiusBY = function (item) {

    this.setRectHelper(item, ['radiusBRY', 'radiusBLY']);
};
S.radiusLY = function (item) {

    this.setRectHelper(item, ['radiusTLY', 'radiusBLY']);
};
S.radiusRY = function (item) {

    this.setRectHelper(item, ['radiusTRY', 'radiusBRY']);
};
S.radiusTL = function (item) {

    this.setRectHelper(item, ['radiusTLX', 'radiusTLY']);
};
S.radiusTR = function (item) {

    this.setRectHelper(item, ['radiusTRX', 'radiusTRY']);
};
S.radiusBL = function (item) {

    this.setRectHelper(item, ['radiusBLX', 'radiusBLY']);
};
S.radiusBR = function (item) {

    this.setRectHelper(item, ['radiusBRX', 'radiusBRY']);
};
S.radiusTLX = function (item) {

    this.setRectHelper(item, ['radiusTLX']);
};
S.radiusTLY = function (item) {

    this.setRectHelper(item, ['radiusTLY']);
};
S.radiusTRX = function (item) {

    this.setRectHelper(item, ['radiusTRX']);
};
S.radiusTRY = function (item) {

    this.setRectHelper(item, ['radiusTRY']);
};
S.radiusBRX = function (item) {

    this.setRectHelper(item, ['radiusBRX']);
};
S.radiusBRY = function (item) {

    this.setRectHelper(item, ['radiusBRY']);
};
S.radiusBLX = function (item) {

    this.setRectHelper(item, ['radiusBLX']);
};
S.radiusBLY = function (item) {

    this.setRectHelper(item, ['radiusBLY']);
};
D.radius = function (item) {

    this.deltaRectHelper(item, ['radiusTLX', 'radiusTRX', 'radiusBRX', 'radiusBLX', 'radiusX', 'radiusTLY', 'radiusTRY', 'radiusBRY', 'radiusBLY', 'radiusY']);
};
D.radiusX = function (item) {

    this.deltaRectHelper(item, ['radiusTLX', 'radiusTRX', 'radiusBRX', 'radiusBLX', 'radiusX']);
};
D.radiusY = function (item) {

    this.deltaRectHelper(item, ['radiusTLY', 'radiusTRY', 'radiusBRY', 'radiusBLY', 'radiusY']);
};
D.radiusT = function (item) {

    this.deltaRectHelper(item, ['radiusTLX', 'radiusTLY', 'radiusTRX', 'radiusTRY']);
};
D.radiusB = function (item) {

    this.deltaRectHelper(item, ['radiusBRX', 'radiusBRY', 'radiusBLX', 'radiusBLY']);
};
D.radiusL = function (item) {

    this.deltaRectHelper(item, ['radiusTLX', 'radiusTLY', 'radiusBLX', 'radiusBLY']);
};
D.radiusR = function (item) {

    this.deltaRectHelper(item, ['radiusTRX', 'radiusTRY', 'radiusBRX', 'radiusBRY']);
};
D.radiusTX = function (item) {

    this.deltaRectHelper(item, ['radiusTLX', 'radiusTRX']);
};
D.radiusBX = function (item) {

    this.deltaRectHelper(item, ['radiusBRX', 'radiusBLX']);
};
D.radiusLX = function (item) {

    this.deltaRectHelper(item, ['radiusTLX', 'radiusBLX']);
};
D.radiusRX = function (item) {

    this.deltaRectHelper(item, ['radiusTRX', 'radiusBRX']);
};
D.radiusTY = function (item) {

    this.deltaRectHelper(item, ['radiusTLY', 'radiusTRY']);
};
D.radiusBY = function (item) {

    this.deltaRectHelper(item, ['radiusBRY', 'radiusBLY']);
};
D.radiusLY = function (item) {

    this.deltaRectHelper(item, ['radiusTLY', 'radiusBLY']);
};
D.radiusRY = function (item) {

    this.deltaRectHelper(item, ['radiusTRY', 'radiusBRY']);
};
D.radiusTL = function (item) {

    this.deltaRectHelper(item, ['radiusTLX', 'radiusTLY']);
};
D.radiusTR = function (item) {

    this.deltaRectHelper(item, ['radiusTRX', 'radiusTRY']);
};
D.radiusBL = function (item) {

    this.deltaRectHelper(item, ['radiusBLX', 'radiusBLY']);
};
D.radiusBR = function (item) {

    this.deltaRectHelper(item, ['radiusBRX', 'radiusBRY']);
};
D.radiusTLX = function (item) {

    this.deltaRectHelper(item, ['radiusTLX']);
};
D.radiusTLY = function (item) {

    this.deltaRectHelper(item, ['radiusTLY']);
};
D.radiusTRX = function (item) {

    this.deltaRectHelper(item, ['radiusTRX']);
};
D.radiusTRY = function (item) {

    this.deltaRectHelper(item, ['radiusTRY']);
};
D.radiusBRX = function (item) {

    this.deltaRectHelper(item, ['radiusBRX']);
};
D.radiusBRY = function (item) {

    this.deltaRectHelper(item, ['radiusBRY']);
};
D.radiusBLX = function (item) {

    this.deltaRectHelper(item, ['radiusBLX']);
};
D.radiusBLY = function (item) {

    this.deltaRectHelper(item, ['radiusBLY']);
};
S.radius1 = function (item) {

    this.radius1 = item;
    this.updateDirty();
};
D.radius1 = function (item) {

    this.radius1 += item;
    this.updateDirty();
};
S.radius2 = function (item) {

    this.radius2 = item;
    this.updateDirty();
};
D.radius2 = function (item) {

    this.radius2 += item;
    this.updateDirty();
};
S.drawFromLoop = function (item) {

    this.drawFromLoop = item;
    this.updateDirty();
};
D.drawFromLoop = function (item) {

    this.drawFromLoop += item;
    this.updateDirty();
};

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
S.sideLength = function (item) {

    this.sideLength = item;
    this.updateDirty();
};
D.sideLength = function (item) {

    this.sideLength += item;
    this.updateDirty();
};

// __points__
S.points = function (item) {

    this.points = item;
    this.updateDirty();
};
D.points = function (item) {

    this.points += item;
    this.updateDirty();
};

// __twist__
S.twist = function (item) {

    this.twist = item;
    this.updateDirty();
};
D.twist = function (item) {

    this.twist += item;
    this.updateDirty();
};

// __loops__
S.loops = function (item) {

    this.loops = item;
    this.updateDirty();
};
D.loops = function (item) {

    this.loops += item;
    this.updateDirty();
};

// __pins__ - specific to `polyline` species
G.pins = function (item) {

    if (xt(item)) return this.getPinAt(item);
    return this.currentPins.concat();
};
P.getPinAt = function (index) {

    let pins = this.currentPins;

    if (!index || !index.toFixed || index >= pin.length) return [].concat(pins[0]);
    else return [].concat(pins[Math.floor(index)]);
};
S.pins = function (item) {

    if (xt(item) && this.species === 'polyline') {

        let pins = this.pins;

        if (Array.isArray(item)) {

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

    if (xt(item) && this.species === 'polyline') {

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
P.updatePinAt = function (item, index) {

    if (xta(item, index)) {

        let pins = this.pins;

        if (index < pins.length && index >= 0) {

            pins[Math.floor(index)] = item;
            this.updateDirty();
            this.dirtyPins = true;
        }
    }
};
P.removePinAt = function (index) {

    let pins = this.pins;

    if (index < pins.length && index >= 0) {

        pins[Math.floor(index)] = null;
        this.updateDirty();
        this.dirtyPins = true;
    }
};


// #### Prototype functions

// `updateDirty` - internal setter helper function
P.updateDirty = function () {

    this.dirtySpecies = true;
    this.dirtyPathObject = true;
};

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

// `setControlHelper` - internal setter helper function
P.setControlHelper = function (item, attr, label) {

    if (isa_boolean(item) && !item) {

        this[attr] = null;

        if (attr.indexOf('Pivot') > 0) {

            if (this[`${label}LockTo`] === 'pivot') {

                this[`${label}LockTo`] = 'start';

                if (label === 'startControl') this.dirtyStartControlLock = true;
                else if (label === 'control') this.dirtyControlLock = true;
                else if (label === 'endControl') this.dirtyEndControlLock = true;
                else this.dirtyEndLock = true;
            }
        }
        else {

            if (this[`${label}LockTo`] === 'path') {

                this[`${label}LockTo`] = 'start';

                if (label === 'startControl') this.dirtyStartControlLock = true;
                else if (label === 'control') this.dirtyControlLock = true;
                else if (label === 'endControl') this.dirtyEndControlLock = true;
                else this.dirtyEndLock = true;
            }
        }
    }
    else if (item) {

        let oldControl = this[attr],
            newControl = (item.substring) ? artefact[item] : item;

        if (newControl && newControl.isArtefact) {

            if (oldControl && oldControl.isArtefact && oldControl[`${label}Subscriber`]) removeItem(oldControl[`${label}Subscriber`], this.name);

            if (newControl[`${label}Subscriber`]) pushUnique(newControl[`${label}Subscriber`], this.name);

            this[attr] = newControl;
        }
    }
};

// `midInitActions` - internal constructor helper function
P.midInitActions = function (items) {

    this.set(items);
};



// #### Path-related functionality

// `positionPointOnPath`
P.positionPointOnPath = function (vals) {

    let v = requestVector(vals);

    v.vectorSubtract(this.currentStampHandlePosition);

    if(this.flipReverse) v.x = -v.x;
    if(this.flipUpend) v.y = -v.y;

    v.rotate(this.roll);

    v.vectorAdd(this.currentStampPosition);

    let res = {
        x: v.x,
        y: v.y
    }

    releaseVector(v);

    return res;
};

// `getBezierXY`
P.getBezierXY = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

    let T = 1 - t;

    return {
        x: (Math.pow(T, 3) * sx) + (3 * t * Math.pow(T, 2) * cp1x) + (3 * t * t * T * cp2x) + (t * t * t * ex),
        y: (Math.pow(T, 3) * sy) + (3 * t * Math.pow(T, 2) * cp1y) + (3 * t * t * T * cp2y) + (t * t * t * ey)
    };
};

// `getQuadraticXY`
P.getQuadraticXY = function (t, sx, sy, cp1x, cp1y, ex, ey) {

    let T = 1 - t;

    return {
        x: T * T * sx + 2 * T * t * cp1x + t * t * ex,
        y: T * T * sy + 2 * T * t * cp1y + t * t * ey
    };
};

// `getLinearXY`
P.getLinearXY = function (t, sx, sy, ex, ey) {

    return {
        x: sx + ((ex - sx) * t),
        y: sy + ((ey - sy) * t)
    };
};

// `getBezierAngle`
P.getBezierAngle = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

    let T = 1 - t,
        dx = Math.pow(T, 2) * (cp1x - sx) + 2 * t * T * (cp2x - cp1x) + t * t * (ex - cp2x),
        dy = Math.pow(T, 2) * (cp1y - sy) + 2 * t * T * (cp2y - cp1y) + t * t * (ey - cp2y);

    return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
};

// `getQuadraticAngle`
P.getQuadraticAngle = function (t, sx, sy, cp1x, cp1y, ex, ey) {

    let T = 1 - t,
        dx = 2 * T * (cp1x - sx) + 2 * t * (ex - cp1x),
        dy = 2 * T * (cp1y - sy) + 2 * t * (ey - cp1y);

    return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
};

// `getLinearAngle`
P.getLinearAngle = function (t, sx, sy, ex, ey) {

    let dx = ex - sx,
        dy = ey - sy;

    return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
};

// `getPathPositionData`
P.getPathPositionData = function (pos) {

    if (xt(pos) && pos.toFixed) {

        let remainder = pos % 1,
            unitPartials = this.unitPartials,
            previousLen = 0, 
            stoppingLen, myLen, i, iz, unit, species;

        // ... because sometimes everything doesn't all add up to 1
        if (pos === 0) remainder = 0;
        else if (pos === 1) remainder = 0.9999;

        // 1. Determine the pertinent subpath to use for calculation
        for (i = 0, iz = unitPartials.length; i < iz; i++) {

            species = this.units[i][0];
            if (species === 'move' || species === 'close' || species === 'unknown') continue;

            stoppingLen = unitPartials[i];

            if (remainder <= stoppingLen) {

                // 2. Calculate point along the subpath the pos value represents
                unit = this.units[i];
                myLen = (remainder - previousLen) / (stoppingLen - previousLen);

                break;
            }

            previousLen = stoppingLen;
        }

        // 3. Get coordinates and angle at that point from subpath; return results
        if (unit) {

            let [unitSpecies, ...vars] = unit;

            let myPoint, angle;

            switch (unitSpecies) {

                case 'linear' :
                    myPoint = this.positionPointOnPath(this.getLinearXY(myLen, ...vars));
                    angle = this.getLinearAngle(myLen, ...vars);
                    break;

                case 'quadratic' :
                    myPoint = this.positionPointOnPath(this.getQuadraticXY(myLen, ...vars));
                    angle = this.getQuadraticAngle(myLen, ...vars);
                    break;
                    
                case 'bezier' :
                    myPoint = this.positionPointOnPath(this.getBezierXY(myLen, ...vars));
                    angle = this.getBezierAngle(myLen, ...vars);
                    break;
            }

            let flipAngle = 0
            if (this.flipReverse) flipAngle++;
            if (this.flipUpend) flipAngle++;

            if (flipAngle === 1) angle = -angle;

            angle += this.roll;

            let stamp = this.currentStampPosition,
                lineOffset = this.controlledLineOffset,
                localBox = this.localBox;

            myPoint.x += lineOffset[0];
            myPoint.y += lineOffset[1];

            myPoint.angle = angle;

            return myPoint;
        }
    }
    return false;
}


// #### Collision detection

// `calculateSensors`
P.calculateSensors = function () {

    let sensorSpacing = this.sensorSpacing || 50,
        length = this.length,
        segments = parseInt(length / sensorSpacing, 10),
        pos = 0,
        data, i, iz;

    if (segments < 4) segments = 4;

    let segmentLength = 1 / segments;

    let sensors = this.currentSensors;
    sensors.length = 0;

    data = this.getPathPositionData(0);
    sensors.push([data.x, data.y]);
    
    for (i = 0; i < segments; i++) {

        pos += segmentLength;
        data = this.getPathPositionData(pos);
        sensors.push([data.x, data.y]);
    }
};


// #### Display cycle functionality

// `prepareStamp` - the purpose of most of these actions is described in the [entity mixin function](http://localhost:8080/docs/source/mixin/entity.html#section-31) that this function overwrites
P.prepareStamp = function() {

    if (this.dirtyHost) this.dirtyHost = false;

// `dirtyLock` flags (one for each control) - trigger __cleanLock__ functions - which in turn set appropriate dirty flags on the entity.
    if (this.dirtyLock) this.cleanLock();
    if (this.dirtyStartControlLock) this.cleanControlLock('startControl');
    if (this.dirtyEndControlLock) this.cleanControlLock('endControl');
    if (this.dirtyControlLock) this.cleanControlLock('control');
    if (this.dirtyEndLock) this.cleanControlLock('end');

    if (this.startControlLockTo === 'path') this.dirtyStartControl = true;
    if (this.endControlLockTo === 'path') this.dirtyEndControl = true;
    if (this.controlLockTo === 'path') this.dirtyControl = true;
    if (this.endLockTo === 'path') this.dirtyEnd = true;

    if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyStartControl || this.dirtyEndControl || this.dirtyControl || this.dirtyEnd || this.dirtyHandle || this.dirtyPins) {

        this.dirtyPathObject = true;
        if (this.collides) this.dirtyCollision = true;

// `dirtySpecies` flag is specific to Shape entitys
        if (this.useStartAsControlPoint && this.dirtyStart) {

            this.dirtySpecies = true;
            this.pathCalculatedOnce = false;
        }

// `pathCalculatedOnce` - calculating path data is an expensive operation - use this flag to limit the calculation to run only when needed
        if (this.dirtyScale || this.dirtySpecies || this.dirtyStartControl || this.dirtyEndControl || this.dirtyControl || this.dirtyEnd || this.dirtyPins)  this.pathCalculatedOnce = false;

    }

    if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {

        this.dirtyStampPositions = true;
        if (this.collides) this.dirtyCollision = true;

// `useStartAsControlPoint` 
// + When false, this flag indicates that line, quadratic and bezier shapes should treat `start` Coordinate updates as an instruction to move the entire Shape. 
// + When true, the Coordinate is used to define the shape of the Shape relative to its other control/end Coordinates
        if (this.useStartAsControlPoint) {

            this.dirtySpecies = true;
            this.dirtyPathObject = true;
            this.pathCalculatedOnce = false;
        }
    }

    if ((this.dirtyRotation || this.dirtyOffset) && this.collides) this.dirtyCollision = true;

    if (this.dirtyCollision && !this.useAsPath) {

        this.dirtyPathObject = true;
        this.pathCalculatedOnce = false;
    }

    if (this.dirtyScale) this.cleanScale();

    if (this.dirtyStart) this.cleanStart();
    if (this.dirtyStartControl) this.cleanControl('startControl');
    if (this.dirtyEndControl) this.cleanControl('endControl');
    if (this.dirtyControl) this.cleanControl('control');
    if (this.dirtyEnd) this.cleanControl('end');

    if (this.dirtyOffset) this.cleanOffset();
    if (this.dirtyRotation) this.cleanRotation();

    if (this.dirtyStampPositions) this.cleanStampPositions();

// `cleanSpecies` - creates the SVG path String which will be used by `cleanPathObject` - each species creates the local path in its own way
    if (this.dirtySpecies) this.cleanSpecies();
    if (this.dirtyPathObject) this.cleanPathObject();

    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
};

// `cleanControlLock` - internal helper function - called by `prepareStamp`
P.cleanControlLock = function (label) {

    let capLabel = capitalize(label);

    this[`dirty${capLabel}Lock`] = false;
    this[`dirty${capLabel}`] = true;
};

// `cleanControl` - internal helper function - called by `prepareStamp`
P.cleanControl = function (label) {

    let capLabel = capitalize(label);

    this[`dirty${capLabel}`] = false;

    let pivotLabel = `${label}Pivot`,
        pathLabel = `${label}Path`,
        pivot = this[pivotLabel],
        path = this[pathLabel],
        art, pathData;

    if (pivot && pivot.substring) {

        art = artefact[pivot];

        if (art) pivot = art;
    }

    if (path && path.substring) {

        art = artefact[path];

        if (art) path = art;
    }

    let lock = this[`${label}LockTo`], 
        x, y, ox, oy, here, flag,
        raw = this[label],
        current = this[`current${capLabel}`];

    if (lock === 'pivot' && (!pivot || pivot.substring)) lock = 'coord';
    else if (lock === 'path' && (!path || path.substring)) lock = 'coord';

    switch(lock) {

        case 'pivot' :

            if (this.pivotCorner && pivot.getCornerCoordinate) {

                [x, y] = pivot.getCornerCoordinate(this[`${label}PivotCorner`]);
            }
            else [x, y] = pivot.currentStampPosition;

            if (!this.addPivotOffset) {

                [ox, oy] = pivot.currentOffset;
                x -= ox;
                y -= oy;
            }

            break;

        case 'path' :

            pathData = this.getControlPathData(path, label, capLabel);

            x = pathData.x;
            y = pathData.y;

            if (!this.addPathOffset) {

                x -= path.currentOffset[0];
                y -= path.currentOffset[1];
            }

            break;

        case 'mouse' :

            here = this.getHere();

            x = here.x || 0;
            y = here.y || 0;

            break;

        default :
            
            x = y = 0;

            here = this.getHere();

            if (xt(here)) {

                if (xta(here.w, here.h)) {

                    this.cleanPosition(current, raw, [here.w, here.h]);
                    [x, y] = current;
                }
            }
    }

    current[0] = x;
    current[1] = y;

    this.dirtySpecies = true;
    this.dirtyPathObject = true;

    this.updatePathSubscribers();
};

// `getControlPathData` - internal helper function - called by `cleanControl`
P.getControlPathData = function (path, label, capLabel) {

    let pathPos = this[`${label}PathPosition`],
        tempPos = pathPos,
        pathData = path.getPathPositionData(pathPos);

    if (pathPos < 0) pathPos += 1;
    if (pathPos > 1) pathPos = pathPos % 1;

    pathPos = parseFloat(pathPos.toFixed(6));
    if (pathPos !== tempPos) this[`${label}PathPosition`] = pathPos;

    if (pathData) return pathData;

    else {

        let here = this.getHere();

        if (xt(here)) {

            if (xta(here.w, here.h)) {

                let current = this[`current${capLabel}`];

                this.cleanPosition(current, this[label], [here.w, here.h]);

                return {
                    x: current[0],
                    y: current[1]
                };
            }
        }
        return {
            x: 0,
            y: 0
        };
    }
};

// `cleanDimensions` - internal helper function called by `prepareStamp` 
// + Dimensional data has no meaning in the context of Shape entitys (beyond positioning handle Coordinates): width and height are emergent properties that cannot be set on the entity.
P.cleanDimensions = function () {

    this.dirtyDimensions = false;
    this.dirtyHandle = true;

    this.dirtyStart = true;
    this.dirtyStartControl = true;
    this.dirtyEndControl = true;
    this.dirtyControl = true;
    this.dirtyEnd = true;
};

// `cleanPathObject` - internal helper function - called by `prepareStamp`
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

        if (this.species === 'polyline' && this.dirtyPins) this.makePolylinePath();

        this.calculateLocalPath(this.pathDefinition);
        this.cleanStampPositionsAdditionalActions();

        if (this.dirtyDimensions) this.cleanDimensions();
        if (this.dirtyHandle) this.cleanHandle();
        if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

        let handle = this.currentStampHandlePosition,
            controlledLine = this.controlledLineOffset;

        this.pathObject = new Path2D(`m${-handle[0] + controlledLine[0]},${-handle[1] + controlledLine[1]}${this.localPath}`);
    }
};

// `calculateLocalPath` - internal helper function - called by `cleanPathObject`
P.calculateLocalPath = function (d) {

    let res;

    if (this.collides) this.useAsPath = true;

    if (!this.pathCalculatedOnce) {

        res = calculatePath(d, this.currentScale, this.currentStart, this.useAsPath, this.precision);
        this.pathCalculatedOnce = true;
    }

    if (res) {

        this.localPath = res.localPath;
        this.units = res.units;
        this.unitLengths = res.unitLengths;
        this.unitPartials = res.unitPartials;
        this.length = res.length;

        let maxX = res.maxX,
            maxY = res.maxY,
            minX = res.minX,
            minY = res.minY;

        let dims = this.dimensions,
            currentDims = this.currentDimensions,
            box = this.localBox;

        dims[0] = parseFloat((maxX - minX).toFixed(1));
        dims[1] = parseFloat((maxY - minY).toFixed(1));
        
        if(dims[0] !== currentDims[0] || dims[1] !== currentDims[1]) {

            currentDims[0] = dims[0];
            currentDims[1] = dims[1];
            this.dirtyHandle = true;
        }


        box.length = 0;
        box.push(parseFloat(minX.toFixed(1)), parseFloat(minY.toFixed(1)), dims[0], dims[1]);
    }
};

// `cleanStampPositionsAdditionalActions` - internal helper function - called by `cleanPathObject`
P.cleanStampPositionsAdditionalActions = function () {

    if (this.useStartAsControlPoint) {

        let [x, y] = this.localBox,
            lineOffset = this.controlledLineOffset;

        lineOffset[0] = (x < 0) ? x : 0;
        lineOffset[1] = (y < 0) ? y : 0;

        this.dirtyPathObject = true;
    }

    if (this.path && this.lockTo.indexOf('path') >= 0) {

        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    }
};

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;

    let p = 'M0,0';

    switch (this.species) {

        case 'line' :
            p = this.makeLinearPath();
            break;

        case 'quadratic' :
            p = this.makeQuadraticPath();
            break;

        case 'bezier' :
            p = this.makeBezierPath();
            break;

        case 'oval' :
            p = this.makeOvalPath();
            break;

        case 'rectangle' :
            p = this.makeRectanglePath();
            break;

        case 'tetragon' :
            p = this.makeTetragonPath();
            break;

        case 'polygon' :
            p = this.makePolygonPath();
            break;

        case 'star' :
            p = this.makeStarPath();
            break;

        case 'spiral' :
            p = this.makeSpiralPath();
            break;

        case 'polyline' :
            p = this.makePolylinePath();
            break;

        default :
            p = this.pathDefinition;
    }
    this.pathDefinition = p;
};

// `makeOvalPath` - internal helper function - called by `cleanSpecies`
P.makeOvalPath = function () {

    let A = this.offshootA,
        B = this.offshootB,
        radiusX = this.radiusX,
        radiusY = this.radiusY,
        width, height;

    if (radiusX.substring || radiusY.substring) {

        let here = this.getHere();

        let rx = (radiusX.substring) ? (parseFloat(radiusX) / 100) * here.w : radiusX,
            ry = (radiusY.substring) ? (parseFloat(radiusY) / 100) * here.h : radiusY;

        width = rx * 2;
        height = ry * 2;
    }
    else {

        width = radiusX * 2;
        height = radiusY * 2;
    }

    let port = width * this.intersectX,
        starboard = width - port,
        fore = height * this.intersectY,
        aft = height - fore;

    let myData = `m${port},0`;

    myData += `c${starboard * A},${fore * B} ${starboard - (starboard * B)},${fore - (fore * A)}, ${starboard},${fore} `;
    myData += `${-starboard * B},${aft * A} ${-starboard + (starboard * A)},${aft - (aft * B)} ${-starboard},${aft} `;
    myData += `${-port * A},${-aft * B} ${-port + (port * B)},${-aft + (aft * A)} ${-port},${-aft} `;
    myData += `${port * B},${-fore * A} ${port - (port * A)},${-fore + (fore * B)} ${port},${-fore}z`;

    return myData;
};

// `makeTetragonPath` - internal helper function - called by `cleanSpecies`
P.makeTetragonPath = function () {

    let radiusX = this.radiusX,
        radiusY = this.radiusY,
        width, height;

    if (radiusX.substring || radiusY.substring) {

        let here = this.getHere(),
            rx = (radiusX.substring) ? (parseFloat(radiusX) / 100) * here.w : radiusX,
            ry = (radiusY.substring) ? (parseFloat(radiusY) / 100) * here.h : radiusY;

        width = rx * 2;
        height = ry * 2;
    }
    else {

        width = radiusX * 2;
        height = radiusY * 2;
    }

    let port = width * this.intersectX,
        starboard = width - port,
        fore = height * this.intersectY,
        aft = height - fore;

    let myData = `m${port},0`;

    myData += `l${starboard},${fore} ${-starboard},${aft} ${-port},${-aft} ${port},${-fore}z`;

    return myData;
};

// `makeRectanglePath` - internal helper function - called by `cleanSpecies`
P.makeRectanglePath = function () {

    let width = this.rectangleWidth,
        height = this.rectangleHeight;

    let A = this.offshootA,
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

    let myData = `m${_tlx},0`;

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

// `makeBezierPath` - internal helper function - called by `cleanSpecies`
P.makeBezierPath = function () {
    
    let [startX, startY] = this.currentStampPosition;
    let [startControlX, startControlY] = this.currentStartControl;
    let [endControlX, endControlY] = this.currentEndControl;
    let [endX, endY] = this.currentEnd;

    return `m0,0c${(startControlX - startX)},${(startControlY - startY)} ${(endControlX - startX)},${(endControlY - startY)} ${(endX - startX)},${(endY - startY)}`;
};

// `makeQuadraticPath` - internal helper function - called by `cleanSpecies`
P.makeQuadraticPath = function () {
    
    let [startX, startY] = this.currentStampPosition;
    let [controlX, controlY] = this.currentControl;
    let [endX, endY] = this.currentEnd;

    return `m0,0q${(controlX - startX)},${(controlY - startY)} ${(endX - startX)},${(endY - startY)}`;
};

// `makeLinearPath` - internal helper function - called by `cleanSpecies`
P.makeLinearPath = function () {

    let [startX, startY] = this.currentStampPosition;
    let [endX, endY] = this.currentEnd;

    return `m0,0l${(endX - startX)},${(endY - startY)}`;
};

// `makePolygonPath` - internal helper function - called by `cleanSpecies`
P.makePolygonPath = function () {
    
    let sideLength = this.sideLength,
        sides = this.sides,
        turn = 360 / sides,
        myPath = ``,
        yPts = [],
        currentY = 0,
        myMax, myMin, myYoffset;

    let v = requestVector({x: 0, y: -sideLength});

    for (let i = 0; i < sides; i++) {

        v.rotate(turn);
        currentY += v.y;
        yPts.push(currentY);
        myPath += `${v.x.toFixed(1)},${v.y.toFixed(1)} `;
    }

    releaseVector(v);

    myMin = Math.min(...yPts);
    myMax = Math.max(...yPts);
    myYoffset = (((Math.abs(myMin) + Math.abs(myMax)) - sideLength) / 2).toFixed(1);

    myPath = `m0,${myYoffset}l${myPath}z`;

    return myPath;
};

// `makeStarPath` - internal helper function - called by `cleanSpecies`
P.makeStarPath = function () {
    
    let points = this.points,
        twist = this.twist,
        radius1 = this.radius1,
        radius2 = this.radius2,
        turn = 360 / points,
        xPts = [],
        currentX, currentY, x, y,
        myMin, myXoffset, myYoffset, i,
        myPath = '';

    let v1 = requestVector({x: 0, y: -radius1}),
        v2 = requestVector({x: 0, y: -radius2});

    currentX = v1.x;
    currentY = v1.y;

    xPts.push(currentX);

    v2.rotate(-turn/2);
    v2.rotate(twist);

    for (i = 0; i < points; i++) {

        v2.rotate(turn);

        x = parseFloat((v2.x - currentX).toFixed(1));
        currentX += x;
        xPts.push(currentX);

        y = parseFloat((v2.y - currentY).toFixed(1));
        currentY += y;

        myPath += `${x},${y} `;

        v1.rotate(turn);

        x = parseFloat((v1.x - currentX).toFixed(1));
        currentX += x;
        xPts.push(currentX);

        y = parseFloat((v1.y - currentY).toFixed(1));
        currentY += y;

        myPath += `${x},${y} `;

    }

    releaseVector(v1);
    releaseVector(v2);

    myMin = Math.min(...xPts);
    myXoffset = Math.abs(myMin).toFixed(1);

    myPath = `m${myXoffset},0l${myPath}z`;

    return myPath;
};


// `makeSpiralPath` - internal helper function - called by `cleanSpecies`
P.makeSpiralPath = function () {
    
    let loops = Math.floor(this.loops),
        loopIncrement = this.loopIncrement,
        drawFromLoop = Math.floor(this.drawFromLoop);

    let x1, y1, x2, y2, x3, y3,
        sx1, sy1, sx2, sy2, sx3, sy3;

    // Magic numbers!
    // + These numbers produce an Archimedian spiral
    // + The first loop has effective dimensions of 2px by 2px
    // + Each additional loop increases the dimensions by 2px
    let firstTurn = [
        [0.043, 0, 0.082, -0.035, 0.088, -0.088],
        [0.007, -0.057, -0.024, -0.121, -0.088, -0.162],
        [-0.07, -0.045, -0.169, -0.054, -0.265, -0.015],
        [-0.106, 0.043, -0.194, 0.138, -0.235, 0.265],
        [-0.044, 0.139, -0.026, 0.3, 0.058, 0.442],
        [0.091, 0.153, 0.25, 0.267, 0.442, 0.308],
        [0.206, 0.044, 0.431, -0.001, 0.619, -0.131],
        [0.2, -0.139, 0.34, -0.361, 0.381, -0.619]
    ];

    let subsequentTurns = [
        [0, -0.27, -0.11, -0.52, -0.29, -0.71],
        [-0.19, -0.19, -0.44, -0.29, -0.71, -0.29],
        [-0.27, 0, -0.52, 0.11, -0.71, 0.29],
        [-0.19, 0.19, -0.29, 0.44, -0.29, 0.71],
        [0, 0.27, 0.11, 0.52, 0.29, 0.71],
        [0.19, 0.19, 0.44, 0.29, 0.71, 0.29],
        [0.27, 0, 0.52, -0.11, 0.71, -0.29],
        [0.19, -0.19, 0.29, -0.44, 0.29, -0.71]
    ];

    let currentTurn = [];

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

// `makePolylinePath` - internal helper function - called by `cleanSpecies`
P.makePolylinePath = function () {

    this.dirtyPins = false;

    // 0. local functions to help construct the path string
    const getPathParts = function (x0, y0, x1, y1, x2, y2, t, coords) {

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

        coords.push(p1x, p1y, x1, y1, p2x, p2y);
    };

    const buildLine = function (x, y, coords) {

        let p = `m0,0l`;

        for (let i = 2; i < coords.length; i += 6) {

            p += `${coords[i] - x},${coords[i + 1] - y} `;

            x = coords[i];
            y = coords[i + 1];
        }
        return p;
    };

    const buildCurve = function (x, y, coords) {

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


    // 1. go through the pins array and get current values for each, pushed into currentPins array
    let pins = this.pins,
        current, temp,
        tension = this.tension,
        closed = this.closed;

    if (!this.currentPins) this.currentPins = [];

    current = this.currentPins
    current.length = 0;

    // An item in the pins array can be one of: a two-member array; or an artefact object; or an artefact's name-string:
    pins.forEach((item, index) => {

        if (item && item.substring) {

            temp = artefact[item];
            pins[index] = temp;
        }
        else temp = item;

        if (temp) {

            if (Array.isArray(temp)) {

                // need to deal with %relative values here

                current.push([...temp]);
            }
            else if (isa_obj(temp) && temp.currentStart) {

                current.push([...temp.currentStart]);
            }
        }
    });

    // 2. build the line
    let cLen = current.length,
        first = current[0],
        last = current[cLen - 1],
        calc = [],
        result = 'm0,0';

    if (closed) {

        getPathParts(...last, ...first, ...current[1], tension, calc);

        let startPoint = [].concat(calc);
        calc.length = 0;

        for (let i = 0; i < cLen - 2; i++) {

            getPathParts(...current[i], ...current[i + 1], ...current[i + 2], tension, calc);
        }

        getPathParts(...current[cLen - 2], ...last, ...first, tension, calc);

        calc.unshift(startPoint[4], startPoint[5]);
        calc.push(startPoint[0], startPoint[1], startPoint[2], startPoint[3]);

        if (tension) result = buildCurve(first[0], first[1], calc) + 'z';
        else result = buildLine(first[0], first[1], calc) + 'z';

    }
    else {

        calc.push(first[0], first[1]);

        for (let i = 0; i < cLen - 2; i++) {

            getPathParts(...current[i], ...current[i + 1], ...current[i + 2], tension, calc);
        }
        calc.push(last[0], last[1], last[0], last[1]);

        if (tension) result = buildCurve(first[0], first[1], calc);
        else result = buildLine(first[0], first[1], calc);
    }

    if (this.mapToPins) {

        let init = (closed) ? 4 : 2,
            minX = first[0], 
            minY = first[1], 
            startX = first[0], 
            startY = first[1],
            skip = 6;

        for (let i = init, iz = calc.length; i < iz; i += skip) {

            if (calc[i] < minX) minX = calc[i];
            if (calc[i + 1] < minY) minY = calc[i + 1];
        }

        this.set({
            offsetX: startX + (minX - startX), 
            offsetY: startY + (minY - startY), 
        });
    }
    return result;
};


// #### Subscriber management

// `updatePathSubscribers`
P.updatePathSubscribers = function () {

    this.pathed.forEach(name => {

        let instance = artefact[name];

        if (instance) {

            instance.dirtyStart = true;
            if (instance.addPathHandle) instance.dirtyHandle = true;
            if (instance.addPathOffset) instance.dirtyOffset = true;
            if (instance.addPathRotation) instance.dirtyRotation = true;
        }
    });
};

// #### Stamp methods
// All actual drawing is achieved using the entity's pre-calculated [Path2D object](https://developer.mozilla.org/en-US/docs/Web/API/Path2D).

// `draw`
P.draw = function (engine) {

    engine.stroke(this.pathObject);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

// `fill`
P.fill = function (engine) {

    engine.fill(this.pathObject, this.winding);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

// `drawAndFill`
P.drawAndFill = function (engine) {

    let p = this.pathObject;

    engine.stroke(p);
    this.currentHost.clearShadow();
    engine.fill(p, this.winding);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

// `fillAndDraw`
P.fillAndDraw = function (engine) {

    let p = this.pathObject;

    engine.stroke(p);
    this.currentHost.clearShadow();
    engine.fill(p, this.winding);
    engine.stroke(p);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

// `drawThenFill`
P.drawThenFill = function (engine) {

    let p = this.pathObject;

    engine.stroke(p);
    engine.fill(p, this.winding);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

// `fillThenDraw`
P.fillThenDraw = function (engine) {

    let p = this.pathObject;

    engine.fill(p, this.winding);
    engine.stroke(p);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

// `clear`
P.clear = function (engine) {

    let gco = engine.globalCompositeOperation;

    engine.globalCompositeOperation = 'destination-out';
    engine.fill(this.pathObject, this.winding);
    
    engine.globalCompositeOperation = gco;

    if (this.showBoundingBox) this.drawBoundingBox(engine);
},    

// `drawBoundingBox`
P.drawBoundingBox = function (engine) {

    engine.save();

    engine.strokeStyle = this.boundingBoxColor;
    engine.lineWidth = 1;
    engine.globalCompositeOperation = 'source-over';
    engine.globalAlpha = 1;
    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;

    engine.strokeRect(...this.getBoundingBox());

    engine.restore();
};

// `getBoundingBox`
P.getBoundingBox = function () {

    let floor = Math.floor,
        ceil = Math.ceil,
        minDims = this.minimumBoundingBoxDimensions;

    let [x, y, w, h] = this.localBox;
    let [lx, ly] = this.controlledLineOffset;
    let [hX, hY] = this.currentStampHandlePosition;
    let [sX, sY] = this.currentStampPosition;

    // Pad out excessively thin widths and heights
    if (w < minDims) w = minDims;
    if (h < minDims) h = minDims;

    return [floor(x - hX + lx), floor(y - hY + ly), ceil(w), ceil(h), sX, sY];
};

// #### Factories

// ##### makeShape 
// Accepts argument with attributes:
// + `pathDefinition` (required) - an [SVG `d` attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) String
//
// ```
// scrawl.makeShape({
//
//     name: 'myArrow',
//
//     pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',
//
//     startX: 300,
//     startY: 200,
//     handleX: '50%',
//     handleY: '50%',
//
//     scale: 0.2,
//     scaleOutline: false,
//
//     fillStyle: 'lightgreen',
//
//     method: 'fill',
// });
// ```
const makeShape = function (items) {

    return new Shape(items);
};

// ##### makeLine
// Accepts argument with attributes:
// + __start__ (___startX___, ___startY___) Coordinate, or __pivot__/__mimic__/__path__ reference artefact (required)
// + __end__ (___endX___, ___endY___) Coordinate, or __endPivot__/__endPath__ reference artefact (required) 
// + If using reference artefacts, may also need to set the __lockTo__ (___lockXTo___, ___lockYTo___) and __endLockTo__ lock attributes
// + additional reference-linked attributes for the `end` coordinate: __endPivotCorner__, __addEndPivotHandle__, __addEndPivotOffset__, __endPathPosition__, __addEndPathHandle__, __addEndPathOffset__
//
// ```
// scrawl.makeLine({
//
//     name: 'my-line',
//
//     startX: 20,
//     startY: 300,
//
//     endX: 580,
//     endY: 275,
//
//     lineWidth: 3,
//     lineCap: 'round',
//
//     strokeStyle: 'darkgoldenrod',
//     method: 'draw',
// });
// ```
const makeLine = function (items = {}) {

    items.species = 'line';
    return new Shape(items);
};

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
const makeQuadratic = function (items = {}) {

    items.species = 'quadratic';
    return new Shape(items);
};

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
    return new Shape(items);
};

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
const makeRectangle = function (items = {}) {

    items.species = 'rectangle';
    return new Shape(items);
};

// ##### makeOval
// Scrawl-canvas uses quadratic curves internally to create the curved path. 
// + The _bend_ of these curves is set by the quadratic's control point which doesn't have its own coordinate but is rather calculated using two float Number variables: __offshootA__ (default: `0.55`) and __offshootB__ (default: `0`) - change these values to make the quarter-curves more or less bendy.
// + The main shape of the oval is determined by differing radius lengths in the `x` and `y` directions, as set by the attributes __radiusX__ and __radiusY__; to set both radiuses to the same value, use ____radius____ instead.
// + The radius values can be: _absolute_ (using Number values); or _relative_ using %-String values - with the y radius representing a portion of the Cell container's height and the x radius the Cell's width.
// + The radiuses (as diameter lines) cross in the middle of the oval shape. We can move the position of where the intersection happens by setting a float Number value between `0.0 - 1.0` (or beyond those limits) for the __intersectX__ and __intersectY__ attributes. 
// + `intersectX` (default: `0.5`) represents the point at which the `y` diameter crosses the `x` diameter, with `0` being the left end and `1` being the right end.
// + `intersectY` (default: `0.5`) represents the point at which the `x` diameter crosses the `y` diameter, with `0` being the top end and `1` being the bottom end.
//
// ```
// scrawl.makeOval({
//
//     name: 'egg',
//
//     fillStyle: 'lightGreen',
//     method: 'fillAndDraw',
//
//     startX: 20,
//     startY: 20,
//
//     radiusX: '7%',
//     radiusY: '3%',
//
//     intersectY: 0.6,
// });
// ```
const makeOval = function (items = {}) {

    items.species = 'oval';
    return new Shape(items);
};

// ##### makeTetragon
// Scrawl-canvas uses lines internally to create the Shape path. 
// + The main shape of the tetragon is determined by differing radius lengths in the `x` and `y` directions, as set by the attributes __radiusX__ and __radiusY__; to set both radiuses to the same value, use ___radius___ instead.
// + The radius values can be: _absolute_ (using Number values); or _relative_ using %-String values - with the y radius representing a portion of the Cell container's height and the x radius the Cell's width.
// + The radiuses (as diameter lines) cross in the middle of the tetragon shape. We can move the position of where the intersection happens by setting a float Number value between `0.0 - 1.0` (or beyond those limits) for the __intersectX__ and __intersectY__ attributes. 
// + `intersectX` (default: `0.5`) represents the point at which the `y` diameter crosses the `x` diameter, with `0` being the left end and `1` being the right end.
// + `intersectY` (default: `0.5`) represents the point at which the `x` diameter crosses the `y` diameter, with `0` being the top end and `1` being the bottom end.
//
// ```
// scrawl.makeTetragon({
//
//     name: 'diamond',
//
//     fillStyle: 'lightGreen',
//     method: 'fillAndDraw',
//
//     startX: 20,
//     startY: 750,
//
//     radiusX: 40,
//     radiusY: 60,
// });
// ```
const makeTetragon = function (items = {}) {

    items.species = 'tetragon';
    return new Shape(items);
};

// ##### makePolygon
// Accepts argument with attributes:
// + __sides__ (required) - integer positive Number (greater than 2) representing the number of sides the Shape will have
// + __sideLength__ (required) - float Number representing the distance (in px) from the center of the Shape to the first angle on the Shape's circumference.
// + TODO: consider renaming `sideLength` because it is not the length of the side; it is the radius of the circle in which the Shape fits
//
// ```
// scrawl.makePolygon({
//
//     name: 'triangle',
//
//     startX: 20,
//     startY: 935,
//
//     sideLength: 60,
//     sides: 3,
//
//     fillStyle: 'lightblue',
//     method: 'fillAndDraw',
// });
// ```
const makePolygon = function (items = {}) {

    items.species = 'polygon';
    return new Shape(items);
};

// ##### makeStar
// Accepts argument with attributes:
// + __radius1__ (required) - the _outer_ radius representing the distance between the center of the Shape and the tips of its (acute angle) points.
// + __radius2__ (required) - the _inner_ radius representing the distance between the center of the Shape and the obtuse angle at the valley between the tips of its (acute angle) points.
// + __points__ (required) - a positive integer Number representing the number of points the star will have.
// + __twist__ - a float Number representing the degrees by which the star's second radius will be rotated out of line from its first radius; the default value `0` will produce a star with all of its sides of equal length and the star's valleys falling midway between its connecting points.
// + Note that the use of _inner_ and _outer_ above is purely descriptive: `radius2` can be larger than `radius1`
//
// ```
// scrawl.makeStar({
//
//     name: '5star',
//
//     startX: 20,
//     startY: 100,
//
//     radius1: 80,
//     radius2: 50,
//
//     points: 5,
//
//     fillStyle: 'linen',
//     method: 'fillAndDraw',
// });
// ```
const makeStar = function (items = {}) {

    items.species = 'star';
    return new Shape(items);
};

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
    return new Shape(items);
};

// ##### makePolyline
// [add text], with attributes:
// + [list of attributes]
//
// ```
// scrawl.makePolyline({
//
//     name: 'myPolyline',
//
//     strokeStyle: 'darkgreen',
//     method: 'draw',
//
//     startX: 50,
//     startY: 100,
//
// });
// ```
const makePolyline = function (items = {}) {

    items.species = 'polyline';
    return new Shape(items);
};

constructors.Shape = Shape;


// #### Exports
export {
    makeShape,

    makeLine,
    makeQuadratic,
    makeBezier,
    makeRectangle,
    makeOval,

    makeTetragon,
    makePolygon,
    makeStar,
    makeSpiral,
    makePolyline,
};
