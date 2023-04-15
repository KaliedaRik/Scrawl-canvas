// # Cog factory
// A factory for generating star shape-based entitys
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
// + [Canvas-013](../../demo/canvas-013.html) - Path-defined entitys: oval, rectangle, line, quadratic, bezier, tetragon, polygon, star, spiral, cog
// + [Canvas-014](../../demo/canvas-014.html) - Line, quadratic and bezier entitys - control lock alternatives
// + [Canvas-018](../../demo/canvas-018.html) - Phrase entity - text along a path
// + [Canvas-024](../../demo/canvas-024.html) - Loom entity functionality
// + [Canvas-030](../../demo/canvas-030.html) - Polyline entity functionality
// + [Canvas-038](../../demo/canvas-038.html) - Responsive Shape-based entitys
// + [DOM-015](../../demo/dom-015.html) - Use stacked DOM artefact corners as pivot points
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors } from '../core/library.js';
import { doCreate, mergeOver, Ωempty } from '../core/utilities.js';

import { releaseVector, requestVector } from './vector.js';

import { releaseArray, requestArray } from '../factory/array-pool.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

import { _abs, _min, BEZIER, ENTITY, LINE, PERMITTED_CURVES, QUADRATIC, T_COG, ZERO_PATH } from '../core/shared-vars.js';


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
// + [base](../mixin/base.html)
// + [shapeBasic](../mixin/shapeBasic.html)
baseMix(P);
shapeMix(P);


// #### Cog attributes
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

    this.outerRadius += item;
    this.updateDirty();
};
S.innerRadius = function (item) {

    this.innerRadius = item;
    this.updateDirty();
};
D.innerRadius = function (item) {

    this.innerRadius += item;
    this.updateDirty();
};

// __outerControlsDistance__, __innerControlsDistance__
S.outerControlsDistance = function (item) {

    this.outerControlsDistance = item;
    this.updateDirty();
};
D.outerControlsDistance = function (item) {

    this.outerControlsDistance += item;
    this.updateDirty();
};
S.innerControlsDistance = function (item) {

    this.innerControlsDistance = item;
    this.updateDirty();
};
D.innerControlsDistance = function (item) {

    this.innerControlsDistance += item;
    this.updateDirty();
};

// __outerControlsOffset__, __innerControlsOffset__
S.outerControlsOffset = function (item) {

    this.outerControlsOffset = item;
    this.updateDirty();
};
D.outerControlsOffset = function (item) {

    this.outerControlsOffset += item;
    this.updateDirty();
};
S.innerControlsOffset = function (item) {

    this.innerControlsOffset = item;
    this.updateDirty();
};
D.innerControlsOffset = function (item) {

    this.innerControlsOffset += item;
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

    const turn = 360 / points,
        xPts = requestArray();

    let currentTrailX, currentTrailY, currentPointX, currentPointY, currentLeadX, currentLeadY, 
        controlStartX, controlStartY, deltaX, deltaY, controlEndX, controlEndY,
        myMin, myXoffset, myYoffset, i,
        myPath = '';

    if (outerRadius.substring || innerRadius.substring || outerControlsDistance.substring || innerControlsDistance.substring || outerControlsOffset.substring || innerControlsOffset.substring) {

        const host = this.getHost();

        if (host) {

            const [hW, hH] = host.currentDimensions;

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

    xPts.push(currentPointX);

    if (curve == BEZIER) {

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
            xPts.push(currentPointX);
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
            xPts.push(currentPointX);
            deltaY = parseFloat((outerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;
        }
    }
    else if (curve == QUADRATIC) {

        for (i = 0; i < points; i++) {

            deltaX = parseFloat((outerPointLead.x - currentPointX).toFixed(1));
            deltaY = parseFloat((outerPointLead.y - currentPointY).toFixed(1));
            myPath += `${deltaX},${deltaY} `;

            innerPoint.rotate(turn);
            innerPointLead.rotate(turn);

            deltaX = parseFloat((innerPoint.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            xPts.push(currentPointX);
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
            xPts.push(currentPointX);
            deltaY = parseFloat((outerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;
        }
    }
    else {

        for (i = 0; i < points; i++) {

            deltaX = parseFloat((outerPointLead.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            xPts.push(currentPointX);
            deltaY = parseFloat((outerPointLead.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            innerPointTrail.rotate(turn);
            innerPoint.rotate(turn);
            innerPointLead.rotate(turn);

            deltaX = parseFloat((innerPointTrail.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            xPts.push(currentPointX);
            deltaY = parseFloat((innerPointTrail.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((innerPoint.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            xPts.push(currentPointX);
            deltaY = parseFloat((innerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((innerPointLead.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            xPts.push(currentPointX);
            deltaY = parseFloat((innerPointLead.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            outerPointTrail.rotate(turn);
            outerPoint.rotate(turn);
            outerPointLead.rotate(turn);

            deltaX = parseFloat((outerPointTrail.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            xPts.push(currentPointX);
            deltaY = parseFloat((outerPointTrail.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;

            deltaX = parseFloat((outerPoint.x - currentPointX).toFixed(1));
            currentPointX += deltaX;
            xPts.push(currentPointX);
            deltaY = parseFloat((outerPoint.y - currentPointY).toFixed(1));
            currentPointY += deltaY;
            myPath += `${deltaX},${deltaY} `;
        }
    }
    releaseVector(outerPoint, outerPointLead, outerPointTrail, innerPoint, innerPointLead, innerPointTrail);

    myMin = _min(...xPts);
    myXoffset = _abs(myMin).toFixed(1);

    releaseArray(xPts);

    if (curve == BEZIER) return `m${myXoffset},0c${myPath}z`;
    if (curve == QUADRATIC) return `m${myXoffset},0q${myPath}z`;
    return `m${myXoffset},0l${myPath}z`;
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
