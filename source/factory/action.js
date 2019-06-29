/*
# Action factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, xt, defaultNonReturnFunction } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import tweenMix from '../mixin/tween.js';

/*
## Action constructor
*/
const Action = function (items = {}) {

	this.makeName(items.name);
	this.register();
	this.set(this.defs);
	this.set(items);

	this.calculateEffectiveTime();

	if (xt(items.ticker)) this.addToTicker(items.ticker);

	return this;
};

/*
## Action object prototype setup
*/
let P = Action.prototype = Object.create(Object.prototype);
P.type = 'Action';
P.lib = 'tween';
P.isArtefact = false;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = tweenMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*
__revert__ - a function that is triggered when a tween is running in reverse direction. Should be a counterpart to the __action__ function (defined in mixin/tween.js) to reverse the actions performed by that function.
*/
	revert: null
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters;

S.revert = function (item) {

	this.revert = item;

	if (typeof this.revert !== 'function') this.revert = defaultNonReturnFunction;
};

S.triggered = function (item) {

	if (this.triggered !== item) {

		if (item) this.action();
		else this.revert();

		this.triggered = item;
	}
};


/*
## Define prototype functions
*/

/*
Overrides the set() functionality defined in mixin/base.js
*/
P.set = function (items = {}) {

	if (items) {

		let setters = this.setters,
			defs = this.defs,
			ticker = (xt(items.ticker)) ? this.ticker : false;

		Object.entries(items).forEach(([key, value]) => {

			if (key !== 'name') {

				let predefined = setters[key];

				if (predefined) predefined.call(this, value);
				else if (typeof defs[key] !== 'undefined') this[key] = value;
			}
		}, this);

		if (ticker) {

			this.ticker = ticker;
			this.addToTicker(items.ticker);
		}
		else if (xt(items.time)) this.calculateEffectiveTime();
	}
	return this;
};


/*
Ticker-related help function
*/
P.getEndTime = function () {
	return this.effectiveTime;
};

/*
The __update__ function checks to see if the action (or revert) functions need to be invoked, and invokes them as-and-when required.

ISSUE: 0% times will fire the action function when the ticker is moving both forwards and backwards, but never fires the revert function. All other %times appear to work as expected. Thus I don't consider this to be a show stopper.
*/
P.update = function (items) {

	let reversed = this.reversed,
		effectiveTime = this.effectiveTime,
		triggered = this.triggered,
		reverseOnCycleEnd = this.reverseOnCycleEnd,
		tick = items.tick,
		reverseTick = items.reverseTick,
		willLoop = items.willLoop,
		next = items.next;

	if (reversed) {

		if (reverseTick >= effectiveTime) {

			if (!triggered) {

				this.action();
				this.triggered = true;
			}
		}
		else {

			if (triggered) {

				this.revert();
				this.triggered = false;
			}
		}
	}
	else {
		if (tick >= effectiveTime) {

			if (!triggered) {

				this.action();
				this.triggered = true;
			}
		}
		else {

			if (triggered) {

				this.revert();
				this.triggered = false;
			}
		}
	}

	if (willLoop) this.triggered = !this.triggered;

	return true;
};

/*
## Exported factory function
*/
const makeAction = function (items) {
	return new Action(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Action = Action;

export {
	makeAction,
};
