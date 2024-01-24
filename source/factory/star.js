// # Star factory
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
// + [Canvas-013](../../demo/canvas-013.html) - Path-defined entitys: oval, rectangle, line, quadratic, bezier, tetragon, polygon, star, spiral
// + [Canvas-014](../../demo/canvas-014.html) - Line, quadratic and bezier entitys - control lock alternatives
// + [Canvas-018](../../demo/canvas-018.html) - Phrase entity - text along a path
// + [Canvas-024](../../demo/canvas-024.html) - Loom entity functionality
// + [Canvas-030](../../demo/canvas-030.html) - Polyline entity functionality
// + [Canvas-038](../../demo/canvas-038.html) - Responsive Shape-based entitys
// + [DOM-015](../../demo/dom-015.html) - Use stacked DOM artefact corners as pivot points
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, Ωempty } from '../helper/utilities.js';

import { releaseVector, requestVector } from '../untracked-factory/vector.js';

import { releaseArray, requestArray } from '../helper/array-pool.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

import { _abs, _min, ENTITY, STAR, T_STAR, ZERO_STR } from '../helper/shared-vars.js';


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
        turn = 360 / points,
        xPts = requestArray();

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

    xPts.push(currentX);

    v2.rotate(-turn/2);
    v2.rotate(twist);

    for (let i = 0; i < points; i++) {

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

    const myMin = _min(...xPts),
        myXoffset = _abs(myMin).toFixed(1);

    myPath = `m${myXoffset},0l${myPath}z`;

    releaseArray(xPts);

    return myPath;
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
