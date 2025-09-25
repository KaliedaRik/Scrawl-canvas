// # Shape factory
// A factory for generating shape-based entitys from SVG path Strings


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

// Shared constants
import { ENTITY } from '../helper/shared-vars.js';

// Local constants
const T_SHAPE = 'Shape';


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

    const box = this.localBox;

    if (!box || box.length < 2) return;

    const stampHandle = this.currentStampHandlePosition;

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
