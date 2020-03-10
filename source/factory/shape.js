
// # Shape factory

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality
import { constructors, radian, artefact } from '../core/library.js';
import { mergeOver, xt, xta, addStrings, xtGet, defaultNonReturnFunction, capitalize, removeItem, pushUnique } from '../core/utilities.js';

import { requestVector, releaseVector } from './vector.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';

import calculatePath from '../mixin/shapePathCalculation.js';


// ## Shape constructor
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


// ## Shape object prototype setup
let P = Shape.prototype = Object.create(Object.prototype);
P.type = 'Shape';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// Apply mixins to prototype object
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = filterMix(P);


// ## Define default attributes
let defaultAttributes = {

// The box represents the rectangle surrounding the shape
    localBox: null,


// Current species supported, note that the parameters required by each species' 'make?' function differ:

// + default '' (makeShape)
// + __line__ (makeLine) 
// + __quadratic__ (makeQuadratic)
// + __bezier__ (makeBezier)
// + __rectangle__ (makeRectangle)
// + __oval__ (makeOval)
// + __tetragon__ (makeTetragon)
// + __polygon__ (makePolygon)
// + __star__ (makeStar)
// + __spiral__ (makeSpiral)

// TODO: The following species are under consideration - currently their 'make?' functions return a 'm0,0' Shape entity

// + __radialshape__ (makeRadialShape) - use path and repeat arguments; functionality will be to: swivel the path around a central point 'repeat' number of times (angle = 360/repeat) and turn the resulting radial shape into a single path value

// + __boxedshape__ (makeBoxedShape) - I'm a bit fuzzy about this one, but I want to somehow _box up_ (relativize) other Shape paths with box width/height values which can then be manipulated - allowing us to stretch the Shape path to match its box dimensions

// + __polyline__ (makePolyline) - a shape for freehand drawing. Should include a 'points' Array which could include [x,y] coordinates, or possibly any object containing x/y values (eg Vectors). The functionality would be to construct a long line (linear, possibly also quadratic for smoother lines) from the [points] data
    species: '',


// TODO - documentation
    pathed: null,

// TODO - documentation
    pathDefinition: '',


// Useful for development
    showBoundingBox: false,
    boundingBoxColor: 'rgba(0,0,0,0.5)',


// Sets a minimum dimensions size (in px) for calculating the bounding box
    minimumBoundingBoxDimensions: 20,
    

// By default, a Shape entity is just lines on the screen. It needs to be explicitly defined as a 'path' if it is to be used as a path by other artefacts.
    useAsPath: false,
    length: 0,
    pathCalculatedOnce: false,


// Used when doing length calculations - the smaller this value, the greater the precision of the final length value
    precision: 10,


// Used by 'spiral' species
    loops: 0,
    loopIncrement: 0.2,
    innerRadius: 0,


// Used by 'rectangle' species
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


// Used by 'oval' and 'tetragon' species
    radiusX: 5,
    radiusY: 5,
    intersectX: 0.5,
    intersectY: 0.5,
    offshootA: 0.55,
    offshootB: 0,


// Used by 'polygon' species
    sides: 0,
    sideLength: 0,


// Used by 'star' species
    radius1: 0,
    radius2: 0,
    points: 0,
    twist: 0,


// TODO - documentation

// Used by 'line', 'quadratic', 'bezier' species
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
    controlledLineOffset: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);



// ## Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['dimensions', 'pathed', 'controlledLineOffset']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, ['startControl', 'control', 'endControl', 'end']);
P.packetObjects = pushUnique(P.packetObjects, ['startControlPivot', 'startControlPath', 'controlPivot', 'controlPath', 'endControlPivot', 'endControlPath', 'endPivot', 'endPath']);
P.packetFunctions = pushUnique(P.packetFunctions, []);

P.packetSpeciesCheck = ['loops', 'loopIncrement', 'innerRadius', 'rectangleWidth', 'rectangleHeight', 'radiusTLX', 'radiusTLY', 'radiusTRX', 'radiusTRY', 'radiusBRX', 'radiusBRY', 'radiusBLX', 'radiusBLY', 'radiusX', 'radiusY', 'intersectX', 'intersectY', 'offshootA', 'offshootB', 'sides', 'sideLength', 'radius1', 'radius2', 'points', 'twist', 'startControl', 'control', 'endControl', 'end', 'startControlPivot', 'startControlPivotCorner', 'addStartControlPivotHandle', 'addStartControlPivotOffset', 'startControlPath', 'startControlPathPosition', 'addStartControlPathHandle', 'addStartControlPathOffset', 'startControlLockTo', 'controlPivot', 'controlPivotCorner', 'addControlPivotHandle', 'addControlPivotOffset', 'controlPath', 'controlPathPosition', 'addControlPathHandle', 'addControlPathOffset', 'controlLockTo', 'endControlPivot', 'endControlPivotCorner', 'addEndControlPivotHandle', 'addEndControlPivotOffset', 'endControlPath', 'endControlPathPosition', 'addEndControlPathHandle', 'addEndControlPathOffset', 'endControlLockTo', 'endPivot', 'endPivotCorner', 'addEndPivotHandle', 'addEndPivotOffset', 'endPath', 'endPathPosition', 'addEndPathHandle', 'addEndPathOffset', 'endLockTo', 'pathDefinition'];

P.packetSpeciesInclusions = {
    spiral: ['loops', 'loopIncrement', 'innerRadius'],
    rectangle: ['rectangleWidth', 'rectangleHeight', 'radiusTLX', 'radiusTLY', 'radiusTRX', 'radiusTRY', 'radiusBRX', 'radiusBRY', 'radiusBLX', 'radiusBLY'],
    oval: ['radiusX', 'radiusY', 'intersectX', 'intersectY', 'offshootA', 'offshootB'],
    tetragon: ['radiusX', 'radiusY', 'intersectX', 'intersectY', 'offshootA', 'offshootB'],
    polygon: ['sides', 'sideLength'],
    star: ['radius1', 'radius2', 'points', 'twist'],
    line: ['end', 'endPivot', 'endPivotCorner', 'addEndPivotHandle', 'addEndPivotOffset', 'endPath', 'endPathPosition', 'addEndPathHandle', 'addEndPathOffset', 'endLockTo'],
    quadratic: ['end', 'endPivot', 'endPivotCorner', 'addEndPivotHandle', 'addEndPivotOffset', 'endPath', 'endPathPosition', 'addEndPathHandle', 'addEndPathOffset', 'endLockTo', 'control', 'controlPivot', 'controlPivotCorner', 'addControlPivotHandle', 'addControlPivotOffset', 'controlPath', 'controlPathPosition', 'addControlPathHandle', 'addControlPathOffset', 'controlLockTo'],
    bezier: ['end', 'endPivot', 'endPivotCorner', 'addEndPivotHandle', 'addEndPivotOffset', 'endPath', 'endPathPosition', 'addEndPathHandle', 'addEndPathOffset', 'endLockTo', 'startControl', 'startControlPivot', 'startControlPivotCorner', 'addStartControlPivotHandle', 'addStartControlPivotOffset', 'startControlPath', 'startControlPathPosition', 'addStartControlPathHandle', 'addStartControlPathOffset', 'startControlLockTo', 'endControl', 'endControlPivot', 'endControlPivotCorner', 'addEndControlPivotHandle', 'addEndControlPivotOffset', 'endControlPath', 'endControlPathPosition', 'addEndControlPathHandle', 'addEndControlPathOffset', 'endControlLockTo'],
    default: ['pathDefinition'],
};

// Overwrites mixin/entity.js function
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
    });

    return copy;
};



// ## Define getter, setter and deltaSetter functions
let S = P.setters,
    D = P.deltaSetters;

// TODO - documentation
S.pathDefinition = function (item) {

    if (item.substring) this.pathDefinition = item;
    this.dirtyPathObject = true;
};

// TODO - documentation
S.species = function (item) {

    if (xt(item)) {

        if (item) this.dirtyPathObject = true;

        this.species = item;
        this.updateDirty();
    }
};

// TODO - documentation
S.useStartAsControlPoint = function (item) {

    this.useStartAsControlPoint = item;

    if (!item) {

        let controlledLine = this.controlledLineOffset;
        controlledLine[0] = 0;
        controlledLine[1] = 0;
    }

    this.updateDirty();
};

// Invalidate dimensions setters - dimensions are an emergent property of shapes, not a defining property
S.width = defaultNonReturnFunction;
S.height = defaultNonReturnFunction;
S.dimensions = defaultNonReturnFunction;
D.width = defaultNonReturnFunction;
D.height = defaultNonReturnFunction;
D.dimensions = defaultNonReturnFunction;


// TODO - documentation
S.endPivot = function (item) {

    this.setControlHelper(item, 'endPivot', 'end');
    this.updateDirty();
    this.dirtyEnd = true;
};

S.endPath = function (item) {

    this.setControlHelper(item, 'endPath', 'end');
    this.updateDirty();
    this.dirtyEnd = true;
};

S.controlPivot = function (item) {

    this.setControlHelper(item, 'controlPivot', 'control');
    this.updateDirty();
    this.dirtyControl = true;
};

S.controlPath = function (item) {

    this.setControlHelper(item, 'controlPath', 'control');
    this.updateDirty();
    this.dirtyControl = true;
};

S.endControlPivot = function (item) {

    this.setControlHelper(item, 'endControlPivot', 'endControl');
    this.updateDirty();
    this.dirtyEndControl = true;
};

S.endControlPath = function (item) {

    this.setControlHelper(item, 'endControlPath', 'endControl');
    this.updateDirty();
    this.dirtyEndControl = true;
};

S.startControlPivot = function (item) {

    this.setControlHelper(item, 'startControlPivot', 'startControl');
    this.updateDirty();
    this.dirtyStartControl = true;
};

S.startControlPath = function (item) {

    this.setControlHelper(item, 'startControlPath', 'startControl');
    this.updateDirty();
    this.dirtyStartControl = true;
};

// TODO - documentation
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


// TODO 
// - we also need the ...LockXTo, ...LockYTo versions
// - make sure this functionality replicates the original!
S.startControlLockTo = function (item) {

    this.startControlLockTo = item;
    this.updateDirty();
    this.dirtyStartControlLock = true;
};

S.endControlLockTo = function (item) {

    this.endControlLockTo = item;
    this.updateDirty();
    this.dirtyEndControlLock = true;
};

S.controlLockTo = function (item) {

    this.controlLockTo = item;
    this.updateDirty();
    this.dirtyControlLock = true;
};

S.endLockTo = function (item) {

    this.endLockTo = item;
    this.updateDirty();
    this.dirtyEndLock = true;
};

// TODO - documentation
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

// TODO - documentation
S.sides = function (item) {

    this.sides = item;
    this.updateDirty();
};

D.sides = function (item) {

    this.sides += item;
    this.updateDirty();
};

S.sideLength = function (item) {

    this.sideLength = item;
    this.updateDirty();
};

D.sideLength = function (item) {

    this.sideLength += item;
    this.updateDirty();
};

// TODO - documentation
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

// TODO - documentation
S.points = function (item) {

    this.points = item;
    this.updateDirty();
};

D.points = function (item) {

    this.points += item;
    this.updateDirty();
};

// TODO - documentation
S.twist = function (item) {

    this.twist = item;
    this.updateDirty();
};

D.twist = function (item) {

    this.twist += item;
    this.updateDirty();
};

// TODO - documentation
S.loops = function (item) {

    this.loops = item;
    this.updateDirty();
};

D.loops = function (item) {

    this.loops += item;
    this.updateDirty();
};

// TODO - documentation
S.innerRadius = function (item) {

    this.innerRadius = item;
    this.updateDirty();
};

D.innerRadius = function (item) {

    this.innerRadius += item;
    this.updateDirty();
};



// ## Define prototype functions


// TODO - documentation
P.updateDirty = function () {

    this.dirtySpecies = true;
    this.dirtyPathObject = true;
};

// TODO - documentation
P.setRectHelper = function (item, corners) {

    this.updateDirty();

    corners.forEach(corner => {

        this[corner] = item;
    }, this);
};

// TODO - documentation
P.deltaRectHelper = function (item, corners) {

    this.updateDirty();

    corners.forEach(corner => {

        this[corner] = addStrings(this[corner], item);
    }, this);
};

// TODO - documentation
P.setControlHelper = function (item, attr, label) {

    let oldControl = this[attr],
        newControl = (item.substring) ? artefact[item] : item;

    if (newControl && newControl.isArtefact) {

        if (oldControl && oldControl.isArtefact && oldControl[`${label}Subscriber`]) removeItem(oldControl[`${label}Subscriber`], this.name);

        if (newControl[`${label}Subscriber`]) pushUnique(newControl[`${label}Subscriber`], this.name);

        this[attr] = newControl;
    }
};

// TODO - documentation
P.midInitActions = function (items) {

    this.set(items);
};

// TODO - documentation
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

// TODO - documentation
P.getBezierXY = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

    let T = 1 - t;

    return {
        x: (Math.pow(T, 3) * sx) + (3 * t * Math.pow(T, 2) * cp1x) + (3 * t * t * T * cp2x) + (t * t * t * ex),
        y: (Math.pow(T, 3) * sy) + (3 * t * Math.pow(T, 2) * cp1y) + (3 * t * t * T * cp2y) + (t * t * t * ey)
    };
};

P.getQuadraticXY = function (t, sx, sy, cp1x, cp1y, ex, ey) {

    let T = 1 - t;

    return {
        x: T * T * sx + 2 * T * t * cp1x + t * t * ex,
        y: T * T * sy + 2 * T * t * cp1y + t * t * ey
    };
};

P.getLinearXY = function (t, sx, sy, ex, ey) {

    return {
        x: sx + ((ex - sx) * t),
        y: sy + ((ey - sy) * t)
    };
};

// TODO - documentation
P.getBezierAngle = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

    let T = 1 - t,
        dx = Math.pow(T, 2) * (cp1x - sx) + 2 * t * T * (cp2x - cp1x) + t * t * (ex - cp2x),
        dy = Math.pow(T, 2) * (cp1y - sy) + 2 * t * T * (cp2y - cp1y) + t * t * (ey - cp2y);

    return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
};

P.getQuadraticAngle = function (t, sx, sy, cp1x, cp1y, ex, ey) {

    let T = 1 - t,
        dx = 2 * T * (cp1x - sx) + 2 * t * (ex - cp1x),
        dy = 2 * T * (cp1y - sy) + 2 * t * (ey - cp1y);

    return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
};

P.getLinearAngle = function (t, sx, sy, ex, ey) {

    let dx = ex - sx,
        dy = ey - sy;

    return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
};

// TODO - documentation
P.getPathPositionData = function (pos) {

    if (xt(pos) && pos.toFixed) {

        let remainder = pos % 1,
            unitPartials = this.unitPartials,
            previousLen = 0, 
            stoppingLen, myLen, i, iz, unit, species;

        // ... because sometimes everything doesn't all add up to 1
        if (pos === 0) remainder = 0;
        else if (pos === 1) remainder = 0.9999;

        // 1. determine the pertinent subpath to use for calculation
        for (i = 0, iz = unitPartials.length; i < iz; i++) {

            species = this.units[i][0];
            if (species === 'move' || species === 'close' || species === 'unknown') continue;

            stoppingLen = unitPartials[i];

            if (remainder <= stoppingLen) {

                // 2. calculate point along the subpath the pos value represents
                unit = this.units[i];
                myLen = (remainder - previousLen) / (stoppingLen - previousLen);

                break;
            }

            previousLen = stoppingLen;
        }

        // 3. get coordinates and angle at that point from subpath; return results
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

// TODO - documentation
P.cleanControlLock = function (label) {

    let capLabel = capitalize(label);

    this[`dirty${capLabel}Lock`] = false;
    this[`dirty${capLabel}`] = true;
};

// TODO - documentation
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


// TODO - documentation

// Overwrites mixin/position.js function
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

// TODO - documentation
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


// TODO - documentation

// Overwrites mixin/position.js function
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

// TODO - documentation
P.prepareStamp = function() {

    if (this.dirtyHost) this.dirtyHost = false;

    if (this.dirtyLock) this.cleanLock();
    if (this.dirtyStartControlLock) this.cleanControlLock('startControl');
    if (this.dirtyEndControlLock) this.cleanControlLock('endControl');
    if (this.dirtyControlLock) this.cleanControlLock('control');
    if (this.dirtyEndLock) this.cleanControlLock('end');

    if (this.startControlLockTo === 'path') this.dirtyStartControl = true;
    if (this.endControlLockTo === 'path') this.dirtyEndControl = true;
    if (this.controlLockTo === 'path') this.dirtyControl = true;
    if (this.endLockTo === 'path') this.dirtyEnd = true;

    if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyStartControl || this.dirtyEndControl || this.dirtyControl || this.dirtyEnd || this.dirtyHandle) {

        this.dirtyPathObject = true;
        this.dirtyCollision = true;

        if (this.useStartAsControlPoint && this.dirtyStart) {

            this.dirtySpecies = true;
            this.pathCalculatedOnce = false;
        }

        if (this.dirtyScale || this.dirtySpecies || this.dirtyStartControl || this.dirtyEndControl || this.dirtyControl || this.dirtyEnd)  this.pathCalculatedOnce = false;

    }

    if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {

        this.dirtyStampPositions = true;
        this.dirtyCollision = true;

        if (this.useStartAsControlPoint) {

            this.dirtySpecies = true;
            this.dirtyPathObject = true;
            this.pathCalculatedOnce = false;
        }
    }

    if (this.dirtyRotation || this.dirtyOffset) this.dirtyCollision = true;

    if (this.dirtyCollision && !this.useAsPath) {

        this.useAsPath = true;
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

    if (this.dirtySpecies) this.cleanSpecies();
    if (this.dirtyPathObject) this.cleanPathObject();

    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
};

// TODO - documentation
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

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

// TODO - documentation
P.cleanDimensions = function () {

    this.dirtyDimensions = false;
    this.dirtyHandle = true;

    this.dirtyStart = true;
    this.dirtyStartControl = true;
    this.dirtyEndControl = true;
    this.dirtyControl = true;
    this.dirtyEnd = true;
};

// TODO - documentation
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

// TODO - documentation
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

// TODO - documentation
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

        case 'radialshape' :
            p = this.makeRadialShapePath();
            break;

        case 'boxedshape' :
            p = this.makeBoxedShapePath();
            break;

        case 'polyline' :
            p = this.makePolylinePath();
            break;

        case 'spiral' :
            p = this.makeSpiralPath();
            break;

        default :
            p = this.pathDefinition;
    }
    this.pathDefinition = p;
};

// TODO - documentation
P.draw = function (engine) {

    engine.stroke(this.pathObject);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

P.fill = function (engine) {

    engine.fill(this.pathObject, this.winding);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

P.drawAndFill = function (engine) {

    let p = this.pathObject;

    engine.stroke(p);
    this.currentHost.clearShadow();
    engine.fill(p, this.winding);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

P.fillAndDraw = function (engine) {

    let p = this.pathObject;

    engine.stroke(p);
    this.currentHost.clearShadow();
    engine.fill(p, this.winding);
    engine.stroke(p);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

P.drawThenFill = function (engine) {

    let p = this.pathObject;

    engine.stroke(p);
    engine.fill(p, this.winding);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

P.fillThenDraw = function (engine) {

    let p = this.pathObject;

    engine.fill(p, this.winding);
    engine.stroke(p);
    if (this.showBoundingBox) this.drawBoundingBox(engine);
},

P.clear = function (engine) {

    let gco = engine.globalCompositeOperation;

    engine.globalCompositeOperation = 'destination-out';
    engine.fill(this.pathObject, this.winding);
    
    engine.globalCompositeOperation = gco;

    if (this.showBoundingBox) this.drawBoundingBox(engine);
},    

// TODO - documentation
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


// TODO - documentation
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


// TODO - documentation
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

// TODO - documentation
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

// TODO - documentation
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

// TODO - documentation
P.makeBezierPath = function () {
    
    let [startX, startY] = this.currentStampPosition;
    let [startControlX, startControlY] = this.currentStartControl;
    let [endControlX, endControlY] = this.currentEndControl;
    let [endX, endY] = this.currentEnd;

    return `m0,0c${(startControlX - startX)},${(startControlY - startY)} ${(endControlX - startX)},${(endControlY - startY)} ${(endX - startX)},${(endY - startY)}`;
};

// TODO - documentation
P.makeQuadraticPath = function () {
    
    let [startX, startY] = this.currentStampPosition;
    let [controlX, controlY] = this.currentControl;
    let [endX, endY] = this.currentEnd;

    return `m0,0q${(controlX - startX)},${(controlY - startY)} ${(endX - startX)},${(endY - startY)}`;
};

// TODO - documentation
P.makeLinearPath = function () {

    let [startX, startY] = this.currentStampPosition;
    let [endX, endY] = this.currentEnd;

    return `m0,0l${(endX - startX)},${(endY - startY)}`;
};

// TODO - documentation
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

// TODO - documentation
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


// TODO: Use path and repeat arguments; functionality will be to: swivel the path around a central point 'repeat' number of times (angle = 360/repeat) and turn the resulting radial shape into a single path value
P.makeRadialShapePath = function () {
    
    let a = 0;

    return `m0,0`;
};


// TODO: I'm a bit fuzzy about this one, but I want to somehow _box up_ (relativize) other Shape paths with box width/height values which can then be manipulated - allowing us to stretch the Shape path to match its box dimensions
P.makeBoxedShapePath = function () {
    
    let a = 0;

    return `m0,0`;
};


// TODO: A shape for freehand drawing. Should include a 'points' Array which could include [x,y] coordinates, or possibly any object containing x/y values (eg Vectors). The functionality would be to construct a long line (linear, possibly also quadratic for smoother lines) from the [points] data
P.makePolylinePath = function () {
    
    let a = 0;

    return `m0,0`;
};


// Taken from this page - https://rosettacode.org/wiki/Archimedean_spiral#JavaScript

// TODO: find a solution that uses far fewer sub-units
// - current solution uses lots of short lines
// - shoule be able to achieve the same effect using 4 bezier curves per turn
// - beziers would also offer a way to make much more interesting 'spiral' shapes 
P.makeSpiralPath = function () {
    
    let loops = this.loops,
        loopIncrement = this.loopIncrement,
        innerRadius = this.innerRadius;

    let myAngle = 0,
        angleIncrement = 0.1,
        angleSteps = loops * 2 * Math.PI,
        steps = angleSteps / angleIncrement,
        xPts = [],
        yPts = [],
        x, y, minX, minY, maxX, maxY, i;

    let currentX = innerRadius,
        currentY = 0;

    let myPath = `l`;

    for (i = 0; i < steps; i++) {

        x = innerRadius * Math.cos(myAngle);
        y = innerRadius * Math.sin(myAngle);

        myPath += `${x - currentX},${y - currentY} `;

        currentX = x; 
        currentY = y;

        xPts.push(currentX);
        yPts.push(currentY);

        innerRadius += loopIncrement; 
        myAngle += angleIncrement;
    }

    minX = Math.abs(Math.min(...xPts));
    minY = Math.abs(Math.min(...yPts));

    myPath = `m${minX + this.innerRadius},${minY}${myPath}`;

    return myPath;
};



// ## Exported factory functions
const makeShape = function (items) {

    return new Shape(items);
};

const makeLine = function (items = {}) {

    items.species = 'line';
    return new Shape(items);
};

const makeQuadratic = function (items = {}) {

    items.species = 'quadratic';
    return new Shape(items);
};

const makeBezier = function (items = {}) {

    items.species = 'bezier';
    return new Shape(items);
};

const makeRectangle = function (items = {}) {

    items.species = 'rectangle';
    return new Shape(items);
};

const makeOval = function (items = {}) {

    items.species = 'oval';
    return new Shape(items);
};

const makeTetragon = function (items = {}) {

    items.species = 'tetragon';
    return new Shape(items);
};

const makePolygon = function (items = {}) {

    items.species = 'polygon';
    return new Shape(items);
};

const makeStar = function (items = {}) {

    items.species = 'star';
    return new Shape(items);
};

const makeRadialShape = function (items = {}) {

    items.species = 'radialshape';
    return new Shape(items);
};

const makeBoxedShape = function (items = {}) {

    items.species = 'boxedshape';
    return new Shape(items);
};

const makePolyline = function (items = {}) {

    items.species = 'polyline';
    return new Shape(items);
};

const makeSpiral = function (items = {}) {

    items.species = 'spiral';
    return new Shape(items);
};

constructors.Shape = Shape;

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
    makeRadialShape,
    makeBoxedShape,
    makePolyline,
    makeSpiral
};
