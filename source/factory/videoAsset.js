/*
# VideoAsset factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';

/*
## VideoAsset constructor
*/
const VideoAsset = function (items = {}) {

	return this;
};

/*
## VideoAsset object prototype setup
*/
let P = VideoAsset.prototype = Object.create(Object.prototype);
P.type = 'Video';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = false;

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
const makeVideoAsset = function (items) {
	return new VideoAsset(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.VideoAsset = VideoAsset;

export {
	makeVideoAsset,
};
