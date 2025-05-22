// # LineSpiral factory
// A factory for generating 'degenerate' spiral shape-based entitys


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, Ωempty } from '../helper/utilities.js';

import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

// Shared constants
import { ENTITY, ZERO_PATH } from '../helper/shared-vars.js';

// Local constants
const LINE_SPIRAL = 'linespiral',
    T_LINE_SPIRAL = 'LineSpiral';


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
baseMix(P);
shapeMix(P);


// #### LineSpiral attributes
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
    this.pathDefinition = this.makeLineSpiralPath();
};


// `makeLineSpiralPath` - internal helper function - called by `cleanSpecies`
P.makeLineSpiralPath = function () {

    let path = `${ZERO_PATH} m`;

    const {startRadius, radiusIncrement, radiusIncrementAdjust, startAngle, angleIncrement, angleIncrementAdjust, stepLimit} = this;

    const coord = requestCoordinate();

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

    const [x, y] = this.localBox,
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
