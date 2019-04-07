/*
# Action factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique, xt, defaultNonReturnFunction } from '../core/utilities.js';

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

*/
	revert: null
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters;

/*

*/
S.revert = function (item) {

	this.revert = item;

	if (typeof this.revert !== 'function') this.revert = defaultNonReturnFunction;
};

/*

*/
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

*/
P.set = function (items = {}) {

// console.log('action set', this.name, items);
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

*/
P.getEndTime = function () {
	return this.effectiveTime;
};

/*

*/
P.update = function (items) {

	if (this.reversed) {

		if (items.reverseTick >= this.effectiveTime) {

			if (!this.triggered) {

				this.action();
				this.triggered = true;
			}
		}
		else {

			if (this.triggered) {

				this.revert();
				this.triggered = false;
			}
		}
	}
	else {
		if (items.tick >= this.effectiveTime) {

			if (!this.triggered) {

				this.action();
				this.triggered = true;
			}
		}
		else {

			if (this.triggered) {

				this.revert();
				this.triggered = false;
			}
		}
	}

	if (this.reverseOnCycleEnd && items.willLoop) {

		if (items.next) this.reversed = !this.reversed;
		else {

			this.reversed = false;
			this.triggered = false;
		}
	}
	
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
