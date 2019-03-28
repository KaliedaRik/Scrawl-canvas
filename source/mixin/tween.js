/*
# Tween mixin
*/
import { animationtickers, constructors, tween, tweennames } from '../core/library.js';
import { generateUuid, mergeOver, removeItem, isa_fn, isa_obj, xt, xtGet, convertTime, locateTarget, defaultNonReturnFunction } from '../core/utilities.js';

export default function (obj = {}) {

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
	obj.defs = mergeOver(obj.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = obj.getters,
		S = obj.setters;

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
	obj.calculateEffectiveTime = function (item) {

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
	obj.addToTicker = function (item) {

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
	obj.removeFromTicker = function (item) {

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
	obj.setTargets = function (items) {

		items = [].concat(items);

		let newTargets = [],
			item, i, iz, result;

		for (i = 0, iz = items.length; i < iz; i++) {

			item = items[i];

			if (isa_fn(item)) {

				if (isa_fn(item.set)) newTargets.push(item);
			}
			else if (isa_obj(item) && xt(item.name)) newTargets.push(item);
			else {

				result = locateTarget(item);

				if (result) newTargets.push(result);
			}
		}

		this.targets = newTargets;

		return this;
	};

/*

*/
	obj.addToTargets = function (items) {

		items = [].concat(items);

		let item, i, iz, result;

		for (i = 0, iz = items.length; i < iz; i++) {

			item = items[i];
			
			if (typeof item === 'function') {

				if (typeof item.set === 'function') this.targets.push(item);
			}
			else {

				result = locateTarget(item);

				if (result) this.targets.push(result);
			}
		}
		return this;
	};

/*

*/
	// WARNING - possibly plays with scrawl names???
	obj.removeFromTargets = function (items) {

		items = [].concat(items);

		let item, i, iz, j, jz, k, kz,
			t, type, name, doRemove, myObj, objName,
			identifiers = [],
			newTargets = [].concat(this.targets);

		for (j = 0, jz = newTargets.length; j < jz; j++) {

			t = newTargets[j];
			type = t.type || 'unknown';
			name = t.name || 'unnamed';

			if (type !== 'unknown' && name !== 'unnamed') identifiers.push(`${type}_${name}`);
		}

		for (i = 0, iz = items.length; i < iz; i++) {

			item = items[i];
			myObj = false;
			
			if (typeof item === 'function') myObj = item;
			else myObj = my.locateTarget(item);

			if (myObj) {

				type = myObj.type || 'unknown';
				name = myObj.name || 'unnamed';

				if (type !== 'unknown' && name !== 'unnamed') {

					objName = `${type}_${name}`;
					doRemove = identifiers.indexOf(objName);

					if (doRemove >= 0) newTargets[doRemove] = false;
				}
			}
		}

		this.targets = [];

		for (k = 0, kz = newTargets; k < kz; k++) {

			if (newTargets[k]) this.targets.push(newTargets[k]);
		}

		return this;
	};

/*

*/
	obj.clone = function (items = {}) {

		let copied, clone, keys, key,
			that, i, iz, ticker,
			a = animationtickers;

		copied = JSON.parse(JSON.stringify(this));
		copied.name = (items.name) ? items.name : generateUuid();

		keys = Object.keys(this);
		that = this;

		for (i = 0, iz = keys.length; i < iz; i++) {

			key = keys[i];
			
			if (/^(local|dirty|current)/.test(key)) delete copied[key];

			if (isa_fn(this[key])) copied[key] = that[key];
		}

		if (items.useNewTicker) {

			delete copied.ticker;
			ticker = a[this.ticker];
			copied.cycles = (xt(items.cycles)) ? items.cycles : (ticker) ? ticker.cycles : 1;
		}

		clone = new constructors[this.type](copied);
		clone.set(items);

		return clone;
	};

/*

*/
	obj.kill = function () {

		let t;

		if (this.ticker === this.name + '_ticker') {

			t = animationtickers[this.ticker];
			
			if (t) t.kill();
		}
		else if (this.ticker) this.removeFromTicker(this.ticker);

		delete tween[this.name];
		removeItem(tweennames, this.name);

		return true;
	};

	return obj;
};
