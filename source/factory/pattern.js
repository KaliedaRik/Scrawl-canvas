/*
# Pattern factory

TODO - documentation
*/
import { constructors, cell } from '../core/library.js';
import { mergeOver, isa_fn } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetConsumerMix from '../mixin/assetConsumer.js';

/*
## Pattern constructor
*/
const Pattern = function (items = {}) {

	this.makeName(items.name);
	this.register();
	this.set(this.defs);
	this.set(items);

	return this;
};

/*
## Pattern object prototype setup
*/
let P = Pattern.prototype = Object.create(Object.prototype);

P.type = 'Pattern';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = assetConsumerMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*
TODO - documentation
*/
	repeat: 'repeat',
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*
TODO - documentation
*/
P.repeatValues = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']

S.repeat = function (item) {

	if (this.repeatValues.indexOf(item) >= 0) this.repeat = item;
	else this.repeat = this.defs.repeat;
};

/*
## Define prototype functions
*/

/*
TODO - documentation
*/
P.buildStyle = function (mycell = {}) {
	
	if (this.sourceLoaded && mycell) {

		let engine = false;

		if (mycell.substring) {

			let realcell = cell[mycell];

			if (realcell && realcell.engine) engine = realcell.engine;
		}
		else if (mycell.engine) engine = mycell.engine;

		if (engine) return engine.createPattern(this.source, this.repeat);
	}
	return 'rgba(0,0,0,0)';
};

/*
TODO - documentation
*/
P.getData = function (entity, cell, isFill) {

	if (this.dirtyAsset) this.cleanAsset();
	this.asset.checkSource(this.sourceNaturalWidth, this.sourceNaturalHeight);

	return this.buildStyle(cell);
};

/*
Replaces clone functionality from mixin/base.js
*/
P.clone = function (items = {}) {

	let self = this,
		regex = /^(local|dirty|current)/,
		copied;

	if (this.asset || this.source) {

		let tempAsset = this.asset,
			tempSource = this.source;

		delete this.asset;
		delete this.source;

		copied = JSON.parse(JSON.stringify(this));

		this.asset = tempAsset;
		this.source = tempSource;
	}
	else copied = JSON.parse(JSON.stringify(this));

	copied.name = (items.name) ? items.name : generateUuid();

	Object.entries(this).forEach(([key, value]) => {

		if (regex.test(key)) delete copied[key];
		if (isa_fn(this[key])) copied[key] = self[key];
	}, this);

	let clone = new Pattern(copied);
	clone.set(items);

	return clone;
};

/*
## Exported factory function
*/
const makePattern = function (items) {
	return new Pattern(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Pattern = Pattern;


/*
TODO - documentation
*/
export {
	makePattern,
};
