/*
# Animation factory
*/
import { animation, constructors } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xt, defaultNonReturnFunction } from '../core/utilities.js';
import { animate, resortAnimations } from '../core/animationloop.js';

import baseMix from '../mixin/base.js';

/*
## Animation constructor
*/
const Animation = function (items = {}) {

	this.makeName(items.name);
	this.order = (xt(items.order)) ? items.order : this.defs.order;
	this.fn = items.fn || this.defs.fn;

	this.register();

	if(!items.delay) this.run();

	return this;
};

/*
## Animation object prototype setup
*/
let P = Animation.prototype = Object.create(Object.prototype);

P.type = 'Animation';
P.lib = 'animation';
P.isArtefact = false;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	order: 1,

/*

*/
	fn: defaultNonReturnFunction
};
P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Define prototype functions
*/

/*

*/
P.run = function () {

	pushUnique(animate, this.name);
	resortAnimations();
	return this;
};

/*

*/
P.isRunning = function () {

	return (animate.indexOf(this.name >= 0)) ? true : false;
};

/*

*/
P.halt = function () {

	removeItem(animate, this.name);
	resortAnimations();
	return this;
};

/*

*/
P.kill = function () {

	removeItem(animate, this.name);
	resortAnimations();

	this.deregister();
	
	return true;
};

/*
## Exported factory function
*/
const makeAnimation = function (items) {
	
	return new Animation(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Animation = Animation;

export {
	makeAnimation,
};
