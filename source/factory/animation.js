/*
# Animation factory

TODO - documentation

#### Instantiate objects from the factory

Use the __scrawl.makeAnimation({key:value})__ function - see Demo DOM-001 for an example

Almost all of the Demos use __alternative methods for generating animation objects__:

+ scrawl.makeRender - use this function to create an animation object which will __control the display cycle for a canvas__ or stack. The function allows users to add a number of hook functions that will trigger at various points in the display cycle, alongside functions that will trigger whenever the animation object starts running, stops running, or errors.

+ scrawl.makeTween, scrawl.makeTicker - both of these factory functions use animation objects under the hood

+ scrawl.makeComponent - used in component files, the factory function will automatically add an animation object to the component, alongside much of the functionality supplied by makeRender. It will also creat an IntersectionObserver on the window object that will automatically run/stop the animation object dependant on its canvas element's position in the browser/device viewport.

#### Library storage: YES

+ scrawl.library.animation

#### Clone functionality: YES, BUT ...

__Warning__: this functionality has not been tested, nor is it high on my list for testing!

It's simpler to set up an animation object from scratch, rather than clone it from an existing animation object.

#### Kill functionality: YES, BUT ...

Every animation object can (in theory) be removed using its __kill__ function; this functionality has not been tested, nor is it high on my list for testing!

TODO: review and update kill functionality through the entire Scrawl-canvas system
*/
import { animation, constructors } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xt, 
	defaultNonReturnFunction, defaultPromiseReturnFunction } from '../core/utilities.js';
import { animate, resortAnimations } from '../core/animationloop.js';

import baseMix from '../mixin/base.js';

/*
## Animation constructor
*/
const Animation = function (items = {}) {

	this.makeName(items.name);
	this.order = (xt(items.order)) ? items.order : this.defs.order;
	this.fn = items.fn || defaultPromiseReturnFunction;
	this.onRun = items.onRun || defaultNonReturnFunction;
	this.onHalt = items.onHalt || defaultNonReturnFunction;
	this.onKill = items.onKill || defaultNonReturnFunction;

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
Determines the order in which each animation object will be actioned during the Display cycle. Higher order animations will be processed after lower order animations
*/
	order: 1,

/*
The main function that the animation object will run on each RequestAnimationFrame tick. This function __must return a Promise__.
*/
	fn: null,

/*
The animation object supports some __animation hook functions__:

+ onRun - triggers each time the animation object's .run function is invoked
+ onHalt - triggers each time the animation object's .halt function is invoked
+ onKill - triggers each time the animation object's .kill function is invoked
*/
	onRun: null,
	onHalt: null,
	onKill: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


/*
## Packet management
*/
P.packetExclusions = pushUnique(P.packetExclusions, []);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, []);
P.packetFunctions = pushUnique(P.packetFunctions, ['onRun', 'onHalt', 'onKill', 'fn']);

/*
Overwrites postCloneAction function in mixin/base.js
*/
P.postCloneAction = function(clone, items) {

	if (this.fn) clone.fn = this.fn;
	if (this.onRun) clone.onRun = this.onRun;
	if (this.onHalt) clone.onHalt = this.onHalt;
	if (this.onKill) clone.onKill = this.onKill;

	if (items.sharedState) clone.state = this.state;

	return clone;
};


/*
## Define prototype functions
*/

/*
Start the animation, if it is not already running
*/
P.run = function () {

	this.onRun();
	pushUnique(animate, this.name);
	resortAnimations();
	return this;
};

/*
Returns true if animation is running; false otherwise
*/
P.isRunning = function () {

	return (animate.indexOf(this.name) >= 0) ? true : false;
};

/*
Stop the animation, if it is already running
*/
P.halt = function () {

	this.onHalt();
	removeItem(animate, this.name);
	resortAnimations();
	return this;
};

/*
Stop the animation if it is already running, and remove it from the Scrawl-canvas library
*/
P.kill = function () {

	this.onKill();
	removeItem(animate, this.name);
	resortAnimations();

	this.deregister();
	
	return true;
};

/*
## Exported factory function

The factory takes a single object argument which includes the following attributes:

+ __name__ (optional) - String - default: random UUID String generated at time of object construction
+ __order__ (optional) - Number - default: 10
+ __delay__ (optional) - Boolean - default: false
+ __fn__ (required) - Promise-based Function - default: blank non-return function (will break the Animation loop!)

Note: by default, animations start running as soon as they are created. To prevent this include a __delay__ attribute, set to true, in the argument object.
*/
const makeAnimation = function (items) {
	
	return new Animation(items);
};

constructors.Animation = Animation;

/*
TODO - documentation
*/
export {
	makeAnimation,
};
