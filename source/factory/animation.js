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
Determines the order in which animation functions - which are promises - will be actioned during the Display cycle. Higher order animations will be processed after lower order animations
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
Start the animation, if it is not already running
*/
P.run = function () {

	pushUnique(animate, this.name);
	resortAnimations();
	return this;
};

/*
Returns true if animation is running; false otherwise
*/
P.isRunning = function () {

	return (animate.indexOf(this.name >= 0)) ? true : false;
};

/*
Stop the animation, if it is already running
*/
P.halt = function () {

	removeItem(animate, this.name);
	resortAnimations();
	return this;
};

/*
Stop the animation if it is already running, and remove it from the Scrawl-canvas library
*/
P.kill = function () {

	removeItem(animate, this.name);
	resortAnimations();

	this.deregister();
	
	return true;
};

/*
## Exported factory function

The factory takes a single object argument which includes the following attributes:

* __name__ (optional) - String - default: random UUID String generated at time of object construction
* __order__ (optional) - Number - default: 10
* __delay__ (optional) - Boolean - default: false
* __fn__ (required) - Promise-based Function - default: blank non-return function (will break the Animation loop!)

Note: by default, animations start running as soon as they are created. To prevent this include a __delay__ attribute, set to true, in the argument object.
*/
const makeAnimation = function (items) {
	
	return new Animation(items);
};

constructors.Animation = Animation;

export {
	makeAnimation,
};
