// # Star factory
// A factory for generating star shape-based entitys


// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, mergeOver, Ωempty } from '../helper/utilities.js';

import { releaseVector, requestVector } from '../untracked-factory/vector.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

// Shared constants
import { ENTITY, ZERO_PATH, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const STAR = 'star',
    T_STAR = 'Star';


// #### Star constructor
const Star = function (items = Ωempty) {

    this.shapeInit(items);
    return this;
};


// #### Star prototype
const P = Star.prototype = doCreate();
P.type = T_STAR;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
shapeMix(P);


// #### Star attributes
const defaultAttributes = {

    radius1: 0,
    radius2: 0,
    points: 0,
    twist: 0,
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

// __radius1__, __radius2__
S.radius1 = function (item) {

    this.radius1 = item;
    this.updateDirty();
};
D.radius1 = function (item) {

    this.radius1 = addStrings(this.radius1, item);
    this.updateDirty();
};
S.radius2 = function (item) {

    this.radius2 = item;
    this.updateDirty();
};
D.radius2 = function (item) {

    this.radius2 = addStrings(this.radius2, item);
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


// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;
    this.pathDefinition = this.makeStarPath();
};


// `makeStarPath` - internal helper function - called by `cleanSpecies`
P.makeStarPath = function () {

    const points = this.points,
        twist = this.twist,
        turn = 360 / points;

    let radius1 = this.radius1,
        radius2 = this.radius2;

    let currentX, currentY, x, y,
        myPath = ZERO_STR;

    if (radius1.substring || radius2.substring) {

        const host = this.getHost();

        if (host) {

            const hW = host.currentDimensions[0];

            radius1 = (radius1.substring) ? (parseFloat(radius1) / 100) * hW : radius1;
            radius2 = (radius2.substring) ? (parseFloat(radius2) / 100) * hW : radius2;
        }
    }

    const v1 = requestVector({x: 0, y: -radius1}),
        v2 = requestVector({x: 0, y: -radius2});

    currentX = v1.x;
    currentY = v1.y;

    v2.rotate(-turn/2);
    v2.rotate(twist);

    for (let i = 0; i < points; i++) {

        v2.rotate(turn);

        x = parseFloat((v2.x - currentX).toFixed(1));
        currentX += x;

        y = parseFloat((v2.y - currentY).toFixed(1));
        currentY += y;

        myPath += `${x},${y} `;

        v1.rotate(turn);

        x = parseFloat((v1.x - currentX).toFixed(1));
        currentX += x;

        y = parseFloat((v1.y - currentY).toFixed(1));
        currentY += y;

        myPath += `${x},${y} `;

    }

    releaseVector(v1, v2);

    return `${ZERO_PATH}l${myPath}z`;
};

P.calculateLocalPathAdditionalActions = function () {

    let scale = this.scale;

    if (scale < 0.001) scale = 0.001;

    const [x, y] = this.localBox;

    this.pathDefinition = this.pathDefinition.replace(ZERO_PATH, `m${-x / scale},${-y / scale}`);

    this.pathCalculatedOnce = false;

    // ALWAYS, when invoking `calculateLocalPath` from `calculateLocalPathAdditionalActions`, include the second argument, set to `true`! Failure to do this leads to an infinite loop which will make your machine weep.
    // + We need to recalculate the local path to take into account the offset required to put the Rectangle entity's start coordinates at the top-left of the local box, and to recalculate the data used by other artefacts to place themselves on, or move along, its path.
    this.calculateLocalPath(this.pathDefinition, true);
};


// #### Factories

// ##### makeStar
// Accepts argument with attributes:
// + __radius1__ (required) - the _outer_ radius representing the distance between the center of the Shape and the tips of its (acute angle) points.
// + __radius2__ (required) - the _inner_ radius representing the distance between the center of the Shape and the obtuse angle at the valley between the tips of its (acute angle) points.
// + ... where these radius values are supplied as %Strings, they are calculated as relative to the canvas/cell ___width___ value.
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
export const makeStar = function (items) {

    if (!items) return false;
    items.species = STAR;
    return new Star(items);
};

constructors.Star = Star;
