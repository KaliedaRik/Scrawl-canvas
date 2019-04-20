/*
# SpritesheetAsset factory
*/
import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';

/*
## SpritesheetAsset constructor
*/
const SpritesheetAsset = function (items = {}) {

	return this;
};

/*
## SpritesheetAsset object prototype setup
*/
let P = SpritesheetAsset.prototype = Object.create(Object.prototype);
P.type = 'Spritesheet';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = assetMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*

*/


/*
## Define prototype functions
*/

/*

*/


/*
## Exported factory function
*/
const makeSpritesheetAsset = function (items) {
	return new SpritesheetAsset(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.SpritesheetAsset = SpritesheetAsset;

export {
	makeSpritesheetAsset,
};
