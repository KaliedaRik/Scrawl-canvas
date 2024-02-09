// # Line factory
// A factory for generating straight linbe shape-based entitys
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

import { doCreate, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';
import curveMix from '../mixin/shape-curve.js';

import { ENTITY, LINE, PATH, T_LINE, ZERO_PATH } from '../helper/shared-vars.js';


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
