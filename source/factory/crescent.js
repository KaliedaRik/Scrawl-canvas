// # Crescent factory
// Crescent entitys are formed by the intersection of two circles, rendered onto a DOM &lt;canvas> element using the Canvas 2D API's [Path2D interface](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) - specifically the arc() method.
// + Positioning functionality for the Crescent is supplied by the __position__ mixin, while rendering functionality comes from the __entity__ mixin.
// + Crescent dimensions are tied closely to its __radius__ attribute; relative dimensions are calculated using the Crescent's Cell container's width.
// + Crescents can use CSS color Strings for their fillStyle and strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects.
// + They will also accept __Filter__ objects.
// + They can use __Anchor__ objects for user navigation.
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__.
// + They can be animated directly, or using delta animation, or act as the target for __Tween__ animations.
// + Crescents can be cloned, and killed.

// #### Demos:
// + [Canvas-055](../../demo/canvas-055.html) - Crescent entity functionality


// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, mergeOver, xta, xto, Ωempty } from '../core/utilities.js';

import { releaseCoordinate, requestCoordinate } from './coordinate.js';

import { releaseCell, requestCell } from './cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

import { _radian, DESTINATION_OUT, ENTITY, T_CRESCENT } from '../core/shared-vars.js';


// #### Crescent constructor
const Crescent = function (items = Ωempty) {

    if (!xto(items.dimensions, items.width, items.height, items.radius)) items.radius = 5;

    this.entityInit(items);

    return this;
};


// #### Crescent prototype
const P = Crescent.prototype = doCreate();
P.type = T_CRESCENT;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [entity](../mixin/entity.html)
baseMix(P);
entityMix(P);


// #### Crescent attributes
const defaultAttributes = {

// __outerRadius__, __innerRadius__ - the circles' radius measured in Number pixels, or as a String% - `'10%'` - of the Cell's width
    outerRadius: 20,
    innerRadius: 10,

// __displacement__ - the displacement (rightwards) of the inner circle relative to the outer circle. Measured in positive Number pixels; negative values will be set to `0`
    displacement: 0,

// __displayIntersect__ - a Boolean flag determining which of the two parts of the combined circles to display. Defaults to `false`, which shows the portion of the outer circle not covered by the inner circle; set to `true`, will display the intersection of the inner and outer circles
    displayIntersect: false,
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


// __width__ and __height__ (and dimensions) values are largely irrelevant to Crescent entitys; they get used internally purely as part of the Display cycle stamp functionality.

// If they are used to (delta)set the entity's values then outerRadius will be set to the supplied width value with String% values calculated from the entity's host's width, while innerRadius will be set to the supplied height value with String% values calculated from the entity's host's height
S.outerRadius = function (val) {

    if (val != null) {

        this.outerRadius = val;
        this.dirtyDimensions = true;
        this.dirtyFilterIdentifier = true;
    }
};
D.outerRadius = function (val) {

    if (val != null) {

        this.outerRadius = addStrings(this.outerRadius, val);
        this.dirtyDimensions = true;
        this.dirtyFilterIdentifier = true;
    }
};

S.innerRadius = function (val) {

    if (val != null) {

        this.innerRadius = val;
        this.dirtyDimensions = true;
        this.dirtyFilterIdentifier = true;
    }
};
D.innerRadius = function (val) {

    if (val != null) {

        this.innerRadius = addStrings(this.innerRadius, val);
        this.dirtyDimensions = true;
        this.dirtyFilterIdentifier = true;
    }
};

S.width = S.outerRadius;
D.width = D.outerRadius;
S.height = S.innerRadius;
D.height = D.innerRadius;

S.displacement = function (val) {

    if (val != null && val.toFixed && val >= 0) {

        let d = val;

        if (d < 0) d = 0;
        this.displacement = d;

        this.dirtyDimensions = true;
        this.dirtyFilterIdentifier = true;
    }
};
D.displacement = function (val) {

    if (val != null && val.toFixed) {

        let d = addStrings(this.displacement, val);

        if (d.toFixed && d < 0) d = 0;

        this.displacement = d;
        this.dirtyDimensions = true;
        this.dirtyFilterIdentifier = true;
    }
};

S.displayIntersect = function (val) {

    this.displayIntersect = val;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

// #### Prototype functions

// Dimensions calculations - overwrites mixin/position.js function
P.cleanDimensionsAdditionalActions = function () {

    const { outerRadius:oR, innerRadius:iR, displacement:disp } = this;

    const host = this.getHost();

    let hostDims;

    if (host) hostDims = (host.currentDimensions) ? host.currentDimensions : [host.w, host.h];
    else hostDims = [300, 150];

    const [w, h] = hostDims;

    this.currentOuterRadius = (oR.substring) ? (parseFloat(oR) / 100) * w : oR;
    this.currentInnerRadius = (iR.substring) ? (parseFloat(iR) / 100) * h : iR;

    this.currentDisplacement = (disp.substring) ? (parseFloat(disp) / 100) * w : disp;

    this.currentDimensions[0] = this.currentDimensions[1] = this.currentOuterRadius * 2;

    this.dirtyPathObject = true;

};

// `calculateInterception` - internal function to calculate how the two circles interact
P.calculateInterception = function () {

    if (!xta(this.currentOuterRadius, this.currentInnerRadius, this.currentDisplacement)) this.cleanDimensionsAdditionalActions();

    const { currentOuterRadius:oR, currentInnerRadius:iR, currentDisplacement:disp } = this;

    this.outerCircleStart = 0;
    this.outerCircleEnd = 360 * _radian;
    this.innerCircleStart = 0;
    this.innerCircleEnd = 360 * _radian;

    this.drawOuterCircle = false;
    this.drawDonut = false;

    const dMax = oR + iR,
        dMin = oR - iR;

    const equalCircles = (!dMin) ? true : false;

    if (equalCircles && !disp) this.drawOuterCircle = true;
    else {

        if (disp >= dMax) this.drawOuterCircle = true;
        else if (disp < dMax && disp > dMin) {

            const cell = requestCell();

            const {engine, element} = cell;

            const v = requestCoordinate();

            let a, b;

            // Decided to calculate the start/end angles for each circle through brute force
            // + Trigonometry is the proper answer, but I can't get the equations to stay still and play nicely
            // + So instead we draw circles on a canvas and rotate a vector to see when it enters/leaves the circles
/* eslint-disable-next-line */
            element.width = element.width;
            engine.fillStyle = 'black';

            engine.save();

            engine.beginPath();
            engine.arc(0, 0, oR, 0, Math.PI * 2);

            v.setFromArray([iR, 0]);

            for (a = 0; a < 360; a += 0.5) {

                v.rotate(0.5);
                if(engine.isPointInPath(v[0] + disp, v[1])) break;
            }

            engine.restore();
            engine.save();

            engine.beginPath();
            engine.arc(disp, 0, iR, 0, Math.PI * 2);

            v.setFromArray([oR, 0]);

            for (b = 0; b < 360; b += 0.5) {
                v.rotate(0.5);
                if(!engine.isPointInPath(...v)) break;
            }

            engine.restore();

            this.outerCircleStart = -b * _radian;
            this.outerCircleEnd = b * _radian;
            this.innerCircleStart = a * _radian;
            this.innerCircleEnd = -a * _radian;

            releaseCoordinate(v);
            releaseCell(cell);
        }
        else this.drawDonut = true;
    }
};

// Calculate the Crescent entity's __Path2D object__
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

        this.calculateInterception();

        const { currentStampHandlePosition:handle, currentScale:scale, outerCircleStart:ocs, outerCircleEnd:oce, innerCircleStart:ics, innerCircleEnd:ice, drawOuterCircle, displayIntersect } = this;

        let { currentOuterRadius:oR, currentInnerRadius:iR, currentDisplacement:disp } = this;

        const p = this.pathObject = new Path2D();

        oR *= scale;
        iR *= scale;
        disp *= scale;

        const x = oR - (handle[0] * scale),
            y = oR - (handle[1] * scale);


        if (drawOuterCircle) {

            p.arc(x, y, oR, ocs, oce);
            p.closePath();

            this.pathObjectOuter = false;
            this.pathObjectInner = false;
        }
        else {

            const pOuter = this.pathObjectOuter = new Path2D();
            const pInner = this.pathObjectInner = new Path2D();

            if (displayIntersect) p.arc(x, y, oR, ocs, oce);
            else p.arc(x, y, oR, ocs, oce, true);

            p.arc(x + disp, y, iR, ics, ice);
            p.closePath();

            pOuter.arc(x, y, oR, ocs, oce, true);
            pOuter.closePath();

            pInner.arc(x + disp, y, iR, ics, ice);
            pInner.closePath();
        }
    }
};

// `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
P.draw = function (engine) {

    if (!this.drawDonut) engine.stroke(this.pathObject);
    else {
        engine.stroke(this.pathObjectOuter);
        engine.stroke(this.pathObjectInner);
    }
};

// `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
P.fill = function (engine) {

    engine.fill(this.pathObject, this.winding);
};

// `drawAndFill` - stamp the entity stroke, then fill, then remove shadow and repeat
P.drawAndFill = function (engine) {

    if (!this.drawDonut) {

        const p = this.pathObject;

        engine.stroke(p);
        engine.fill(p, this.winding);
        this.currentHost.clearShadow();
        engine.stroke(p);
        engine.fill(p, this.winding);
    }
    else {

        const p = this.pathObject,
            pOuter = this.pathObjectOuter,
            pInner = this.pathObjectInner;

        engine.stroke(pOuter);
        engine.stroke(pInner);
        engine.fill(p, this.winding);
        this.currentHost.clearShadow();
        engine.stroke(pOuter);
        engine.stroke(pInner);
        engine.fill(p, this.winding);
    }
};

// `drawAndFill` - stamp the entity fill, then stroke, then remove shadow and repeat
P.fillAndDraw = function (engine) {

    if (!this.drawDonut) {

        const p = this.pathObject;

        engine.fill(p, this.winding);
        engine.stroke(p);
        this.currentHost.clearShadow();
        engine.fill(p, this.winding);
        engine.stroke(p);
    }
    else {

        const p = this.pathObject,
            pOuter = this.pathObjectOuter,
            pInner = this.pathObjectInner;

        engine.fill(p, this.winding);
        engine.stroke(pOuter);
        engine.stroke(pInner);
        this.currentHost.clearShadow();
        engine.fill(p, this.winding);
        engine.stroke(pOuter);
        engine.stroke(pInner);
    }
};

// `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
P.drawThenFill = function (engine) {

    if (!this.drawDonut) {

        const p = this.pathObject;

        engine.stroke(p);
        engine.fill(p, this.winding);
    }
    else {

        const p = this.pathObject,
            pOuter = this.pathObjectOuter,
            pInner = this.pathObjectInner;

        engine.stroke(pOuter);
        engine.stroke(pInner);
        engine.fill(p, this.winding);
    }
};

// `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
P.fillThenDraw = function (engine) {

    if (!this.drawDonut) {

        const p = this.pathObject;

        engine.fill(p, this.winding);
        engine.stroke(p);
    }
    else {

        const p = this.pathObject,
            pOuter = this.pathObjectOuter,
            pInner = this.pathObjectInner;

        engine.fill(p, this.winding);
        engine.stroke(pOuter);
        engine.stroke(pInner);
    }
};

// `clip` - restrict drawing activities to the entity's enclosed area
P.clip = function (engine) {

    engine.clip(this.pathObject, this.winding);
 };

// `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
P.clear = function (engine) {

    const gco = engine.globalCompositeOperation;

    engine.globalCompositeOperation = DESTINATION_OUT;
    engine.fill(this.pathObject, this.winding);

    engine.globalCompositeOperation = gco;
};

// #### Factory
// ```
// ```
export const makeCrescent = function (items) {

    if (!items) return false;
    return new Crescent(items);
};

constructors.Crescent = Crescent;
