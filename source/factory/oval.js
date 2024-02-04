// # Oval factory
// A factory for generating oval shape-based entitys
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


// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, mergeOver, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

import { ENTITY, OVAL, RADIUS_X, RADIUS_XY, RADIUS_Y, T_OVAL, ZERO_PATH } from '../helper/shared-vars.js';


// #### Oval constructor
const Oval = function (items = Ωempty) {

    this.shapeInit(items);
    return this;
};


// #### Oval prototype
const P = Oval.prototype = doCreate();
P.type = T_OVAL;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
shapeMix(P);


// #### Oval attributes
const defaultAttributes = {

    radiusX: 5,
    radiusY: 5,
    intersectX: 0.5,
    intersectY: 0.5,
    offshootA: 0.55,
    offshootB: 0,
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

S.radius = function (item) {

    this.setRectHelper(item, RADIUS_XY);
};
S.radiusX = function (item) {

    this.setRectHelper(item, RADIUS_X);
};
S.radiusY = function (item) {

    this.setRectHelper(item, RADIUS_Y);
};
D.radius = function (item) {

    this.deltaRectHelper(item, RADIUS_XY);
};
D.radiusX = function (item) {

    this.deltaRectHelper(item, RADIUS_X);
};
D.radiusY = function (item) {

    this.deltaRectHelper(item, RADIUS_Y);
};

S.offshootA = function (item) {

    this.offshootA = item;
    this.updateDirty();
};
S.offshootB = function (item) {

    this.offshootB = item;
    this.updateDirty();
};
D.offshootA = function (item) {

    if (item.toFixed) {

        this.offshootA += item;
        this.updateDirty();
    }
};
D.offshootB = function (item) {

    if (item.toFixed) {

        this.offshootB += item;
        this.updateDirty();
    }
};

S.intersectA = function (item) {

    this.intersectA = item;
    this.updateDirty();
};
S.intersectB = function (item) {

    this.intersectB = item;
    this.updateDirty();
};
D.intersectA = function (item) {

    if (item.toFixed) {

        this.intersectA += item;
        this.updateDirty();
    }
};
D.intersectB = function (item) {

    if (item.toFixed) {

        this.intersectB += item;
        this.updateDirty();
    }
};


// #### Prototype functions

// `setRectHelper` - internal setter helper function
P.setRectHelper = function (item, corners) {

    this.updateDirty();

    corners.forEach(corner => {

        this[corner] = item;
    }, this);
};

// `deltaRectHelper` - internal setter helper function
P.deltaRectHelper = function (item, corners) {

    this.updateDirty();

    corners.forEach(corner => {

        this[corner] = addStrings(this[corner], item);
    }, this);
};


// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;
    this.pathDefinition = this.makeOvalPath();
};


// `makeOvalPath` - internal helper function - called by `cleanSpecies`
P.makeOvalPath = function () {

    const A = parseFloat(this.offshootA.toFixed(6)),
        B = parseFloat(this.offshootB.toFixed(6)),
        radiusX = this.radiusX,
        radiusY = this.radiusY;

    let width, height;

    if (radiusX.substring || radiusY.substring) {

        const host = this.getHost();

        if (host) {

            const [hW, hH] = host.currentDimensions;

            const rx = (radiusX.substring) ? (parseFloat(radiusX) / 100) * hW : radiusX,
                ry = (radiusY.substring) ? (parseFloat(radiusY) / 100) * hH : radiusY;

            width = rx * 2;
            height = ry * 2;
        }
    }
    else {

        width = radiusX * 2;
        height = radiusY * 2;
    }

    const port = parseFloat((width * this.intersectX).toFixed(2)),
        starboard = parseFloat((width - port).toFixed(2)),
        fore = parseFloat((height * this.intersectY).toFixed(2)),
        aft = parseFloat((height - fore).toFixed(2));

    let myData = ZERO_PATH;

    myData += `c${starboard * A},${fore * B} ${starboard - (starboard * B)},${fore - (fore * A)}, ${starboard},${fore} `;
    myData += `${-starboard * B},${aft * A} ${-starboard + (starboard * A)},${aft - (aft * B)} ${-starboard},${aft} `;
    myData += `${-port * A},${-aft * B} ${-port + (port * B)},${-aft + (aft * A)} ${-port},${-aft} `;
    myData += `${port * B},${-fore * A} ${port - (port * A)},${-fore + (fore * B)} ${port},${-fore}z`;

    return myData;
};

P.calculateLocalPathAdditionalActions = function () {

    const [x, y] = this.localBox;

    this.pathDefinition = this.pathDefinition.replace(ZERO_PATH, `m${-x},${-y}`);

    this.pathCalculatedOnce = false;

    // ALWAYS, when invoking `calculateLocalPath` from `calculateLocalPathAdditionalActions`, include the second argument, set to `true`! Failure to do this leads to an infinite loop which will make your machine weep.
    // + We need to recalculate the local path to take into account the offset required to put the Oval entity's start coordinates at the top-left of the local box, and to recalculate the data used by other artefacts to place themselves on, or move along, its path.
    this.calculateLocalPath(this.pathDefinition, true);
};


// #### Factories

// ##### makeOval
// Scrawl-canvas uses quadratic curves internally to create the curved path.
// + The _bend_ of these curves is set by the quadratic's control point which doesn't have its own coordinate but is rather calculated using two float Number variables: __offshootA__ (default: `0.55`) and __offshootB__ (default: `0`) - change these values to make the quarter-curves more or less bendy.
// + The main shape of the oval is determined by differing radius lengths in the `x` and `y` directions, as set by the attributes __radiusX__ and __radiusY__; to set both radiuses to the same value, use ____radius____ instead.
// + The radius values can be: _absolute_ (using Number values); or _relative_ using %-String values - with the y radius representing a portion of the Cell container's height and the x radius the Cell's width.
// + The radiuses (as diameter lines) cross in the middle of the oval shape. We can move the position of where the intersection happens by setting a float Number value between `0.0 - 1.0` (or beyond those limits) for the __intersectX__ and __intersectY__ attributes.
// + `intersectX` (default: `0.5`) represents the point at which the `y` diameter crosses the `x` diameter, with `0` being the left end and `1` being the right end.
// + `intersectY` (default: `0.5`) represents the point at which the `x` diameter crosses the `y` diameter, with `0` being the top end and `1` being the bottom end.
//
// ```
// scrawl.makeOval({
//
//     name: 'egg',
//
//     fillStyle: 'lightGreen',
//     method: 'fillAndDraw',
//
//     startX: 20,
//     startY: 20,
//
//     radiusX: '7%',
//     radiusY: '3%',
//
//     intersectY: 0.6,
// });
// ```
export const makeOval = function (items) {

    if (!items) return false;
    items.species = OVAL;
    return new Oval(items);
};

constructors.Oval = Oval;
