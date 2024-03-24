// # Shape factory
// A factory for generating shape-based entitys from SVG path Strings
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
// + EnhancedLabel entitys can use a path to position their text units; they can also use a path to position each letter individually along the path.
// + Artefacts (and letters) can be rotated so that they match the rotation at that point along the path - ___tangential rotation___ by setting their `addPathRotation` flag to `true`.
// + Animate an artefact along the path by either using the artefact's `delta` object, or triggering a Tween to perform the movement.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

import { T_SHAPE, ENTITY } from '../helper/shared-vars.js';


// #### Shape constructor
const Shape = function (items = Ωempty) {

    this.shapeInit(items);
    return this;
};


// #### Shape prototype
const P = Shape.prototype = doCreate();
P.type = T_SHAPE;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
shapeMix(P);


// #### Shape attributes
// No additional attributes required beyond those supplied by the mixins


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
// let S = P.setters;


// #### Prototype functions

// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;
};

P.cleanStampHandlePositionsAdditionalActions = function () {

    const box = this.localBox,
        stampHandle = this.currentStampHandlePosition;

    stampHandle[0] += box[0];
    stampHandle[1] += box[1];
};

// #### Factories

// ##### makeShape
// Accepts argument with attributes:
// + `pathDefinition` (required) - an [SVG `d` attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) String
//
// ```
// scrawl.makeShape({
//
//     name: 'myArrow',
//
//     pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',
//
//     startX: 300,
//     startY: 200,
//     handleX: '50%',
//     handleY: '50%',
//
//     scale: 0.2,
//     scaleOutline: false,
//
//     fillStyle: 'lightgreen',
//
//     method: 'fill',
// });
// ```
export const makeShape = function (items) {

    if (!items) return false;
    return new Shape(items);
};

constructors.Shape = Shape;
