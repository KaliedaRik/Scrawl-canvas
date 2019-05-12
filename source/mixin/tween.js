/*
# Tween mixin
*/
import { constructors, animationtickers } from '../core/library.js';
import { generateUuid, mergeOver, isa_fn, isa_obj, xt, xtGet, convertTime, locateTarget, defaultNonReturnFunction } from '../core/utilities.js';

export default function (P = {}) {

/*
## Define attributes

All factories using the filter mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*

*/
		ticker: '',

/*

*/
		targets: null,

/*

*/
		time: 0,

/*

*/
		action: null,

/*

*/
		reverseOnCycleEnd: false,

/*

*/
		reversed: false,

/*

*/
		order: 1
	};
	P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = P.getters,
		S = P.setters;

/*

*/
	G.targets = function () {

		return [].concat(this.targets);
	};

/*

*/
	S.targets = function (item = []) {

		this.setTargets(item);
	};

/*

*/
	S.action = function (item) {

		this.action = item;
		
		if (typeof this.action !== 'function') this.action = defaultNonReturnFunction;
	};

/*
## Define functions to be added to the factory prototype
*/

/*

*/
	P.calculateEffectiveTime = function (item) {

		let time = xtGet(item, this.time),
			calculatedTime = convertTime(time),
			cTime = calculatedTime[1],
			cType = calculatedTime[0],
			ticker, 
			tickerDuration = 0;

		this.effectiveTime = 0;

		if (cType === '%' && cTime <= 100) {

			if (this.ticker) {

				ticker = animationtickers[this.ticker];

				if (ticker) {

					tickerDuration = ticker.effectiveDuration;
					this.effectiveTime = tickerDuration * (cTime / 100);
				}
			}
		}
		else this.effectiveTime = cTime;

		return this;
	};

/*

*/
	P.addToTicker = function (item) {

		let tick;

		if (xt(item)) {

			if (this.ticker && this.ticker !== item) this.removeFromTicker(this.ticker);

			tick = animationtickers[item];

			if (xt(tick)) {

				this.ticker = item;
				tick.subscribe(this.name);
				this.calculateEffectiveTime();
			}
		}
		return this;
	};

/*

*/
	P.removeFromTicker = function (item) {

		let tick;

		item = (xt(item)) ? item : this.ticker;

		if (item) {

			tick = animationtickers[item];

			if (xt(tick)) {

				this.ticker = '';
				tick.unsubscribe(this.name);
			}
		}
		return this;
	};

/*

*/
	P.setTargets = function (items) {

		items = [].concat(items);

		let newTargets = [];

		items.forEach(item => {

			if (isa_fn(item)) {

				if (isa_fn(item.set)) newTargets.push(item);
			}
			else if (isa_obj(item) && xt(item.name)) newTargets.push(item);
			else {

				let result = locateTarget(item);

				if (result) newTargets.push(result);
			}
		});

		this.targets = newTargets;

		return this;
	};

/*

*/
	P.addToTargets = function (items) {

		items = [].concat(items);

		items.forEach(item => {

			if (typeof item === 'function') {

				if (typeof item.set === 'function') this.targets.push(item);
			}
			else {

				result = locateTarget(item);

				if (result) this.targets.push(result);
			}
		}, this);

		return this;
	};

/*

*/
	P.removeFromTargets = function (items) {

		items = [].concat(items);

		let identifiers = [],
			newTargets = [].concat(this.targets);

		newTargets.forEach(target => {

			let type = target.type || 'unknown',
				name = target.name || 'unnamed';

			if (type !== 'unknown' && name !== 'unnamed') identifiers.push(`${type}_${name}`);
		});

		items.forEach(item => {

			let myObj;
			
			if (typeof item === 'function') myObj = item;
			else myObj = locateTarget(item);

			if (myObj) {

				let type = myObj.type || 'unknown',
					name = myObj.name || 'unnamed';

				if (type !== 'unknown' && name !== 'unnamed') {

					let objName = `${type}_${name}`,
						doRemove = identifiers.indexOf(objName);

					if (doRemove >= 0) newTargets[doRemove] = false;
				}
			}
		});

		this.targets = [];

		newTargets.forEach(target => {

			if (target) this.targets.push(target);
		}, this);

		return this;
	};

/*
Overwrites the clone function in mixin/base.js
*/
	P.clone = function (items = {}) {

		let self = this,
			regex = /^(local|dirty|current)/;

		let copied = JSON.parse(JSON.stringify(this));
		copied.name = (items.name) ? items.name : generateUuid();

		Object.entries(this).forEach(([key, value]) => {

			if (regex.test(key)) delete copied[key];
			if (isa_fn(this[key])) copied[key] = self[key];
		}, this);

		if (items.useNewTicker) {

			let ticker = animationtickers[this.ticker];
			delete copied.ticker;
			copied.cycles = (xt(items.cycles)) ? items.cycles : (ticker) ? ticker.cycles : 1;
		}

		let clone = new constructors[this.type](copied);
		clone.set(items);

		return clone;
	};

/*

*/
	P.kill = function () {

		let t;

		if (this.ticker === this.name + '_ticker') {

			t = animationtickers[this.ticker];
			
			if (t) t.kill();
		}
		else if (this.ticker) this.removeFromTicker(this.ticker);

		this.deregister();

		return true;
	};

	return P;
};
