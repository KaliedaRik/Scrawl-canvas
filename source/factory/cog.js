// # Cog factory
// A factory for generating star shape-based entitys


// #### Imports
import { constructors } from '../core/library.js';
import { addStrings, doCreate, mergeOver, Ωempty } from '../helper/utilities.js';

import { releaseVector, requestVector } from '../untracked-factory/vector.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

// Shared constants
import { BEZIER, ENTITY, QUADRATIC, ZERO_PATH, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const PERMITTED_CURVES = ['line', 'quadratic', 'bezier'],
    T_COG = 'Cog';


// #### Cog constructor
const Cog = function (items = Ωempty) {

    this.shapeInit(items);
    return this;
};


// #### Cog prototype
const P = Cog.prototype = doCreate();
P.type = T_COG;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
shapeMix(P);


// #### Cog attributes
const defaultAttributes = {

    outerRadius: 0,
    innerRadius: 0,
    outerControlsDistance: 0,
    innerControlsDistance: 0,
    outerControlsOffset: 0,
    innerControlsOffset: 0,
    points: 0,
    twist: 0,
    curve: BEZIER,
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

// __outerRadius__, __innerRadius__
S.outerRadius = function (item) {

    this.outerRadius = item;
    this.updateDirty();
};
D.outerRadius = function (item) {

    this.outerRadius = addStrings(this.outerRadius, item);
    this.updateDirty();
};
S.innerRadius = function (item) {

    this.innerRadius = item;
    this.updateDirty();
};
D.innerRadius = function (item) {

    this.innerRadius = addStrings(this.innerRadius, item);
    this.updateDirty();
};

// __outerControlsDistance__, __innerControlsDistance__
S.outerControlsDistance = function (item) {

    this.outerControlsDistance = item;
    this.updateDirty();
};
D.outerControlsDistance = function (item) {

    this.outerControlsDistance = addStrings(this.outerControlsDistance, item);
    this.updateDirty();
};
S.innerControlsDistance = function (item) {

    this.innerControlsDistance = item;
    this.updateDirty();
};
D.innerControlsDistance = function (item) {

    this.innerControlsDistance = addStrings(this.innerControlsDistance, item);
    this.updateDirty();
};

// __outerControlsOffset__, __innerControlsOffset__
S.outerControlsOffset = function (item) {

    this.outerControlsOffset = item;
    this.updateDirty();
};
D.outerControlsOffset = function (item) {

    this.outerControlsOffset = addStrings(this.outerControlsOffset, item);
    this.updateDirty();
};
S.innerControlsOffset = function (item) {

    this.innerControlsOffset = item;
    this.updateDirty();
};
D.innerControlsOffset = function (item) {

    this.innerControlsOffset = addStrings(this.innerControlsOffset, item);
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

// __useBezierCurve__
S.curve = function (item) {

    if (item && PERMITTED_CURVES.includes(item)) this.curve = item;
    else this.curve = BEZIER;

    this.updateDirty();
};

// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;
    this.pathDefinition = this.makeCogPath();
};


// `makeCogPath` - internal helper function - called by `cleanSpecies`
P.makeCogPath = function () {

    const { points, twist, curve } = this;

    let { outerRadius, innerRadius, outerControlsDistance, innerControlsDistance, outerControlsOffset, innerControlsOffset } = this;

    const turn = 360 / points;

    let currentPointX, currentPointY, deltaX, deltaY, i,
        myPath = ZERO_STR;

    if (outerRadius.substring || innerRadius.substring || outerControlsDistance.substring || innerControlsDistance.substring || outerControlsOffset.substring || innerControlsOffset.substring) {

        const host = this.getHost();

        if (host) {

            const [hW] = host.currentDimensions;

            outerRadius = (outerRadius.substring) ? (parseFloat(outerRadius) / 100) * hW : outerRadius;
            innerRadius = (innerRadius.substring) ? (parseFloat(innerRadius) / 100) * hW : innerRadius;
            outerControlsDistance = (outerControlsDistance.substring) ? (parseFloat(outerControlsDistance) / 100) * hW : outerControlsDistance;
            innerControlsDistance = (innerControlsDistance.substring) ? (parseFloat(innerControlsDistance) / 100) * hW : innerControlsDistance;
            outerControlsOffset = (outerControlsOffset.substring) ? (parseFloat(outerControlsOffset) / 100) * hW : outerControlsOffset;
            innerControlsOffset = (innerControlsOffset.substring) ? (parseFloat(innerControlsOffset) / 100) * hW : innerControlsOffset;
        }
    }

    const outerPoint = requestVector({x: 0, y: -outerRadius}),
        innerPoint = requestVector({x: 0, y: -innerRadius}),
        outerPointLead = requestVector({x: outerControlsDistance + outerControlsOffset, y: -outerRadius}),
        innerPointTrail = requestVector({x: -innerControlsDistance + innerControlsOffset, y: -innerRadius}),
        innerPointLead = requestVector({x: innerControlsDistance + innerControlsOffset, y: -innerRadius}),
        outerPointTrail = requestVector({x: -outerControlsDistance + outerControlsOffset, y: -outerRadius});

    innerPointTrail.rotate(-turn/2);
    innerPointTrail.rotate(twist);
    innerPoint.rotate(-turn/2);
    innerPoint.rotate(twist);
    innerPointLead.rotate(-turn/2);
    innerPointLead.rotate(twist);

    currentPointX = outerPoint.x;
    currentPointY = outerPoint.y;

    if (curve === BEZIER) {

        for (i = 0; i < points; i++) {

            deltaX = parseFloat((outerPointLead.x - currentPointX).toFixed(1));
            deltaY = parseFloat((outerPointLead.y - currentPointY).toFixed(1));
            myPath += `${deltaX},${deltaY} `;

            innerPointTrail.rotate(turn);
            innerPoint.rotate(turn);
            innerPointLead.rotate(turn);

            deltaX = parseFloat((innerPointTrail.x - currentPointX).toFixed(1));
            deltaY = parseFloat((innerPointTrail.y - currentPointY).toFixed(1));
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((innerPoint.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((innerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((innerPointLead.x - currentPointX).toFixed(1));
            deltaY = parseFloat((innerPointLead.y - currentPointY).toFixed(1));
            myPath += `${deltaX},${deltaY} `;

            outerPointTrail.rotate(turn);
            outerPoint.rotate(turn);
            outerPointLead.rotate(turn);

            deltaX = parseFloat((outerPointTrail.x - currentPointX).toFixed(1));
            deltaY = parseFloat((outerPointTrail.y - currentPointY).toFixed(1));
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((outerPoint.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((outerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;
        }
    }
    else if (curve === QUADRATIC) {

        for (i = 0; i < points; i++) {

            deltaX = parseFloat((outerPointLead.x - currentPointX).toFixed(1));
            deltaY = parseFloat((outerPointLead.y - currentPointY).toFixed(1));
            myPath += `${deltaX},${deltaY} `;

            innerPoint.rotate(turn);
            innerPointLead.rotate(turn);

            deltaX = parseFloat((innerPoint.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((innerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((innerPointLead.x - currentPointX).toFixed(1));
            deltaY = parseFloat((innerPointLead.y - currentPointY).toFixed(1));
            myPath += `${deltaX},${deltaY} `;

            outerPoint.rotate(turn);
            outerPointLead.rotate(turn);

            deltaX = parseFloat((outerPoint.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((outerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;
        }
    }
    else {

        for (i = 0; i < points; i++) {

            deltaX = parseFloat((outerPointLead.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((outerPointLead.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            innerPointTrail.rotate(turn);
            innerPoint.rotate(turn);
            innerPointLead.rotate(turn);

            deltaX = parseFloat((innerPointTrail.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((innerPointTrail.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((innerPoint.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((innerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((innerPointLead.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((innerPointLead.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            outerPointTrail.rotate(turn);
            outerPoint.rotate(turn);
            outerPointLead.rotate(turn);

            deltaX = parseFloat((outerPointTrail.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((outerPointTrail.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((outerPoint.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            deltaY = parseFloat((outerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;
        }
    }
    releaseVector(outerPoint, outerPointLead, outerPointTrail, innerPoint, innerPointLead, innerPointTrail);

    if (curve === BEZIER) return `${ZERO_PATH}c${myPath}z`;
    if (curve === QUADRATIC) return `${ZERO_PATH}q${myPath}z`;
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

// ##### makeCog
// Accepts argument with attributes:
// + __outerRadius__ (required) - the _outer_ radius representing the distance between the center of the Shape and the tips of its (acute angle) points.
// + __innerRadius__ (required) - the _inner_ radius representing the distance between the center of the Shape and the obtuse angle at the valley between the tips of its (acute angle) points.
// + ... where these radius values are supplied as %Strings, they are calculated as relative to the canvas/cell ___width___ value.
// + __outerControlsDistance__, __innerControlsDistance__ - a Number value measuring the distance from each point to its leading and trailing control points - use this to create more square pegs (useBezierCurve: false) or a more curved tooth outline
// + __outerControlsOffset__, __innerControlsOffset__ - a Number value which can be used to offset the control points so that the trailing control point is more distant than the leading control point (or vice versa)
// + __points__ (required) - a positive integer Number representing the number of points the star will have.
// + __twist__ - a float Number representing the degrees by which the star's second radius will be rotated out of line from its first radius; the default value `0` will produce a star with all of its sides of equal length and the star's valleys falling midway between its connecting points.
// + __curve__ - String: one of 'bezier' (default); 'quadratic'; or 'line' - when this flag is set, the entity will be built using the appropriate curve.
// + Note that the use of _inner_ and _outer_ above is purely descriptive: `innerRadius` can be larger than `outerRadius`
//
// ```
// scrawl.makeCog({
//
//   name: 'smooth-cog',
//   startX: 20,
//   startY: 1980,
//   outerRadius: 80,
//   innerRadius: 60,
//   outerControlsDistance: 10,
//   innerControlsDistance: 6,
//   points: 12,
//   fillStyle: 'coral',
//   lineWidth: 2,
//   method: 'fillAndDraw',
// });
// ```
export const makeCog = function (items) {

    if (!items) return false;
    items.species = 'cog';
    return new Cog(items);
};

constructors.Cog = Cog;
