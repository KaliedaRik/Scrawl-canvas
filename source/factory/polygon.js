// # Polygon factory
// A factory for generating various straight-edged polygon shape-based entitys


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, Ωempty } from '../helper/utilities.js';

import { releaseVector, requestVector } from '../untracked-factory/vector.js';

import { releaseArray, requestArray } from '../helper/array-pool.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

// Shared constants
import { _abs, _max, _min, ENTITY, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const POLYGON = 'polygon',
    T_POLYGON = 'Polygon';


// #### Polygon constructor
const Polygon = function (items = Ωempty) {

    this.shapeInit(items);
    return this;
};


// #### Polygon prototype
const P = Polygon.prototype = doCreate();
P.type = T_POLYGON;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
shapeMix(P);


// #### Polygon attributes
const defaultAttributes = {

    sides: 0,
    sideLength: 0,

    // DEPRECATED - this is the (misleading) old name for the sideLength attribute
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
const S = P.setters,
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
S.sideLength = function (item) {

    this.sideLength = item;
    this.updateDirty();
};
D.sideLength = function (item) {

    this.sideLength += item;
    this.updateDirty();
};

// DEPRECATED - this is the (misleading) old name for the sideLength attribute
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
    this.pathDefinition = this.makePolygonPath();
};


// `makePolygonPath` - internal helper function - called by `cleanSpecies`
P.makePolygonPath = function () {

    // `radius` attribute is deprecated!
    const sideLength = this.sideLength || this.radius,
        sides = this.sides,
        turn = 360 / sides,
        yPts = requestArray();

    let currentY = 0,
        myPath = ZERO_STR;

    const v = requestVector({x: 0, y: -sideLength});

    for (let i = 0; i < sides; i++) {

        v.rotate(turn);
        currentY += v.y;
        yPts.push(currentY);
        myPath += `${v.x.toFixed(1)},${v.y.toFixed(1)} `;
    }

    releaseVector(v);

    const myMin = _min(...yPts),
        myMax = _max(...yPts),
        myYoffset = (((_abs(myMin) + _abs(myMax)) - sideLength) / 2).toFixed(1);

    myPath = `m0,${myYoffset}l${myPath}z`;

    releaseArray(yPts);

    return myPath;
};


// #### Factories

// ##### makePolygon
// Accepts argument with attributes:
// + __sides__ (required) - integer positive Number (greater than 2) representing the number of sides the Shape will have
// + __sideLength__ (required) - float Number representing the length (in px) of each of the shape's sides.
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
export const makePolygon = function (items) {

    if (!items) return false;
    items.species = POLYGON;
    return new Polygon(items);
};

constructors.Polygon = Polygon;
