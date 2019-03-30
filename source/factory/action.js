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
let Ap = Action.prototype = Object.create(Object.prototype);
Ap.type = 'Action';
Ap.lib = 'tween';
Ap.artefact = false;

/*
Apply mixins to prototype object
*/
Ap = baseMix(Ap);
Ap = tweenMix(Ap);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	revert: null
};
Ap.defs = mergeOver(Ap.defs, defaultAttributes);

let G = Ap.getters,
	S = Ap.setters;

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
Ap.set = function(items) {

	let key, i, iz, s,
		setters = this.setters,
		keys = Object.keys(items),
		d = this.defs,
		ticker = (xt(items.ticker)) ? this.ticker : false;

	for (i = 0, iz = keys.length; i < iz; i++) {

		key = keys[i];

		if (key !== 'name') {

			s = setters[key];
			
			if (s) s.call(this, items[key]);
			else if (typeof d[key] !== 'undefined') this[key] = items[key];
		}
	}

	if (ticker) {

		this.ticker = ticker;
		this.addToTicker(items.ticker);
	}
	else if (xt(items.time)) this.calculateEffectiveTime();

	return this;
};

/*

*/
Ap.getEndTime = function () {
	return this.effectiveTime;
};

/*

*/
Ap.update = function (items) {

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
