// # Label factory
// TODO - documentation

// #### Demos:
// + TODO - demos


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

import { ENTITY, T_LABEL } from '../helper/shared-vars.js';


// #### Label constructor
const Label = function (items = Ωempty) {

    this.entityInit(items);

    return this;
};


// #### Label prototype
const P = Label.prototype = doCreate();
P.type = T_LABEL;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
entityMix(P);


// #### Label attributes
const defaultAttributes = {

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

console.log('Label', S, D);


// #### Prototype functions

// Calculate the Label entity's __Path2D object__
P.cleanPathObject = function () {

    this.dirtyPathObject = false;
};


// #### Factory
// ```
// scrawl.makeLabel({
//
//     name: 'mylabel-fill',
//
// }).clone({
//
//     name: 'mylabel-draw',
// });
// ```
export const makeLabel = function (items) {

    if (!items) return false;
    return new Label(items);
};

constructors.Label = Label;
