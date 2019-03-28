/*
# Animation factory
*/
import { animation, animationnames, constructors } from '../core/library.js';
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
let Ap = Animation.prototype = Object.create(Object.prototype);

Ap.type = 'Animation';
Ap.lib = 'animation';
Ap.artefact = false;

/*
Apply mixins to prototype object
*/
Ap = baseMix(Ap);

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
Ap.defs = mergeOver(Ap.defs, defaultAttributes);

/*
## Define prototype functions
*/

/*

*/
Ap.run = function () {

	pushUnique(animate, this.name);
	resortAnimations();
	return this;
};

/*

*/
Ap.isRunning = function () {

	return (animate.indexOf(this.name >= 0)) ? true : false;
};

/*

*/
Ap.halt = function () {

	removeItem(animate, this.name);
	resortAnimations();
	return this;
};

/*

*/
Ap.kill = function () {

	removeItem(animate, this.name);
	removeItem(animationnames, this.name);
	resortAnimations();
	delete animation[this.name];
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
