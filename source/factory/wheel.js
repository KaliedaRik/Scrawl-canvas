// # Wheel factory
// Wheel entitys are circles and part-circles rendered onto a DOM &lt;canvas> element using the Canvas 2D API's [Path2D interface](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) - specifically the arc() and lineTo() methods.
// + Positioning functionality for the Wheel is supplied by the __position__ mixin, while rendering functionality comes from the __entity__ mixin.
// + Wheel dimensions are tied closely to its __radius__ attribute; relative dimensions are calculated using the Wheel's Cell container's width.
// + Wheels can use CSS color Strings for their fillStyle and strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects.
// + They will also accept __Filter__ objects.
// + They can use __Anchor__ objects for user navigation.
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__.
// + They can be animated directly, or using delta animation, or act as the target for __Tween__ animations.
// + Wheels can be cloned, and killed.


// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, isa_number, mergeOver, xt, xto, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

import { _radian, DIMENSIONS, ENTITY, PC, T_WHEEL } from '../helper/shared-vars.js';

// __ensureFloat__ - return the value provided as a floating point number of given precision; return 0 if not a number
const ensureFloat = (val, precision) => {

    val = parseFloat(val);

    if (!isa_number(val)) val = 0;
    if (!isa_number(precision)) precision = 0;

    return parseFloat(val.toFixed(precision));
};


// #### Wheel constructor
const Wheel = function (items = Ωempty) {

    if (!xto(items.dimensions, items.width, items.height, items.radius)) items.radius = 5;

    this.entityInit(items);

    return this;
};


// #### Wheel prototype
const P = Wheel.prototype = doCreate();
P.type = T_WHEEL;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
entityMix(P);


// #### Wheel attributes
const defaultAttributes = {

// __radius__ - the circle's radius measured in Number pixels, or as a String% - `'10%' - of the Cell's width
    radius: 5,

// __startAngle__, __endAngle__ - the Number angles at which the rendered arc starts and ends, in __degrees__ (not radians), with 0&deg; and 360&deg; set horizontally to the right (+ve x axis) of the circle's center.
    startAngle: 0,
    endAngle: 360,

// __clockwise__ - a Boolean flag which, when true, draws the arc in a clockwise rotation between the start and end angles; a false value causes the arc to be drawn in an anti-clockwise direction.
    clockwise: true,

// __includeCenter__ - a Boolean flag which, when true, draws a line from the end angle to the center of the circle
    includeCenter: false,

// __closed__ - a Boolean flag which, when true, draws a line from the end angle to the start angle. If includeCenter has been set to true, the line will be drawn from the center of the circle to the start angle position on the circle circumference.
    closed: true,
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


// __width__ and __height__ (and dimensions) values are largely irrelevant to Wheel entitys; they get used internally purely as part of the Display cycle stamp functionality.

// If they are used to (delta)set the entity's values then the radius will be set to half the supplied value with String% values calculated from the entity's host's width, while height and width will equalize to maintain dimensional integrity.
S.width = function (val) {

    if (val != null) {

        const dims = this.dimensions;

        dims[0] = dims[1] = val;
        this.dimensionsHelper();
    }
};
D.width = function (val) {

    const dims = this.dimensions;

    dims[0] = dims[1] = addStrings(dims[0], val);
    this.dimensionsHelper();
};

S.height = function (val) {

    if (val != null) {

        const dims = this.dimensions;

        dims[0] = dims[1] = val;
        this.dimensionsHelper();
    }
};
D.height = function (val) {

    const dims = this.dimensions;

    dims[0] = dims[1] = addStrings(dims[0], val);
    this.dimensionsHelper();
};

S.dimensions = function (w, h) {

    this.setCoordinateHelper(DIMENSIONS, w, h);
    this.dimensionsHelper();
};
D.dimensions = function (w, h) {

    this.setDeltaCoordinateHelper(DIMENSIONS, w, h);
    this.dimensionsHelper();
}

// Setters for attributes specific to the Wheel entity
S.radius = function (val) {

    this.radius = val;
    this.radiusHelper();
};
D.radius = function (val) {

    this.radius = addStrings(this.radius, val);
    this.radiusHelper();
};

S.startAngle = function (val) {

    this.startAngle = ensureFloat(val, 4);
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};
D.startAngle = function (val) {

    this.startAngle += ensureFloat(val, 4);
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

S.endAngle = function (val) {

    this.endAngle = ensureFloat(val, 4);
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};
D.endAngle = function (val) {

    this.endAngle += ensureFloat(val, 4);
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

S.closed = function (bool) {

    if(xt(bool)) {

        this.closed = !!bool;
        this.dirtyPathObject = true;
        this.dirtyFilterIdentifier = true;
    }
};

S.includeCenter = function (bool) {

    if(xt(bool)) {

        this.includeCenter = !!bool;
        this.dirtyPathObject = true;
        this.dirtyFilterIdentifier = true;
    }
};

S.clockwise = function (bool) {

    if(xt(bool)) {

        this.clockwise = !!bool;
        this.dirtyPathObject = true;
        this.dirtyFilterIdentifier = true;
    }
};


// #### Prototype functions

// Internal functions for reconciling dimensions and radius attribute values
P.dimensionsHelper = function () {

    const width = this.dimensions[0];

    if (width.substring) this.radius = `${(parseFloat(width) / 2)}%`;
    else this.radius = (width / 2);

    this.dirtyDimensions = true;
    this.dirtyFilterIdentifier = true;
};
P.radiusHelper = function () {

    const radius = this.radius,
        dims = this.dimensions;

    if (radius.substring) dims[0] = dims[1] = (parseFloat(radius) * 2) + PC;
    else dims[0] = dims[1] = (radius * 2);

    this.dirtyDimensions = true;
    this.dirtyFilterIdentifier = true;
};

// Dimensions calculations - overwrites mixin/position.js function
P.cleanDimensionsAdditionalActions = function () {

    const radius = this.radius,
        dims = this.currentDimensions,
        calculatedRadius = (radius.substring) ? (parseFloat(radius) / 100) * dims[0] : radius;

    if (dims[0] !== calculatedRadius * 2) {

        dims[1] = dims[0];
        this.currentRadius = dims[0] / 2;
    }
    else this.currentRadius = calculatedRadius;
};

// Calculate the Wheel entity's __Path2D object__
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

        const p = this.pathObject = new Path2D();

        const handle = this.currentStampHandlePosition,
            scale = this.currentScale,
            radius = this.currentRadius * scale,
            x = radius - (handle[0] * scale),
            y = radius - (handle[1] * scale),
            starts = this.startAngle * _radian,
            ends = this.endAngle * _radian;

        p.arc(x, y, radius, starts, ends, !this.clockwise);

        if (this.includeCenter) {

            p.lineTo(x, y);
            p.closePath();
        }
        else if (this.closed) p.closePath();
    }
};


// #### Factory
// ```
// scrawl.makeWheel({
//
//     name: 'mywheel-fill',
//     radius: 50,
//     startAngle: 15,
//     endAngle: -15,
//     includeCenter: true,
//
//     startX: 475,
//     startY: 475,
//
//     fillStyle: 'purple',
//     strokeStyle: 'gold',
//
//     lineWidth: 6,
//     lineJoin: 'round',
//     shadowOffsetX: 4,
//     shadowOffsetY: 4,
//     shadowBlur: 2,
//     shadowColor: 'black',
//
// }).clone({
//
//     name: 'mywheel-draw',
//     startX: 325,
//
//     method: 'draw',
//     sharedState: true,
// });
// ```
export const makeWheel = function (items) {

    if (!items) return false;
    return new Wheel(items);
};

constructors.Wheel = Wheel;
