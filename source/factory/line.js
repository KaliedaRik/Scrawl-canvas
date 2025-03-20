// # Line factory
// A factory for generating straight linbe shape-based entitys


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';
import curveMix from '../mixin/shape-curve.js';

// Shared constants
import { ENTITY, PATH, T_LINE, ZERO_PATH } from '../helper/shared-vars.js';

// Local constants
const LINE = 'line';


// #### Line constructor
const Line = function (items = Ωempty) {

    this.curveInit(items);
    this.shapeInit(items);

    return this;
};


// #### Line prototype
const P = Line.prototype = doCreate();
P.type = T_LINE;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
shapeMix(P);
curveMix(P);


// #### Line attributes
// No additional attributes required


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
// No additional getter/setter functionality required


// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;
    this.pathDefinition = this.makeLinePath();
};

// `makeLinePath` - internal helper function - called by `cleanSpecies`
P.makeLinePath = function () {

    let p = ZERO_PATH;
    const { currentStampPosition, currentEnd } = this;

    if (currentStampPosition && currentEnd) {

        const [startX, startY] = this.currentStampPosition;
        const [endX, endY] = this.currentEnd;

        const x = (endX - startX).toFixed(2),
            y = (endY - startY).toFixed(2);

        p = `m0,0l${x},${y}`;
    }
    return p;
};

// `cleanDimensions` - internal helper function called by `prepareStamp`
// + Dimensional data has no meaning in the context of Shape entitys (beyond positioning handle Coordinates): width and height are emergent properties that cannot be set on the entity.
P.cleanDimensions = function () {

    this.dirtyDimensions = false;
    this.dirtyHandle = true;
    this.dirtyOffset = true;

    this.dirtyStart = true;
    this.dirtyEnd = true;
};

P.preparePinsForStamp = function () {

    const dirtyPins = this.dirtyPins,
        ePivot = this.endPivot,
        ePath = this.endPath;

    let i, iz, name;

    for (i = 0, iz = dirtyPins.length; i < iz; i++) {

        name = dirtyPins[i];

        if ((ePivot && ePivot.name === name) || (ePath && ePath.name === name)) {

            this.dirtyEnd = true;
            if (this.endLockTo.includes(PATH)) this.currentEndPathData = false;
        }
    }
    dirtyPins.length = 0;
};

// #### Factories

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
export const makeLine = function (items) {

    if (!items) return false;
    items.species = LINE;
    return new Line(items);
};

constructors.Line = Line;
