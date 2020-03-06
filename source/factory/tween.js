/*
# Tween factory

TODO - documentation
*/
import { constructors, animationtickers, radian } from '../core/library.js';
import { mergeOver, xt, xtGet, xto, convertTime, defaultNonReturnFunction } from '../core/utilities.js';

import { makeTicker } from './ticker.js';

import baseMix from '../mixin/base.js';
import tweenMix from '../mixin/tween.js';

/*
## Tween constructor
*/
const Tween = function (items = {}) {

	let tn;

	this.makeName(items.name);
	this.register();

	this.set(this.defs);
	this.set(items);

	this.setDefinitionsValues();

	this.status = 'before';
	this.calculateEffectiveTime();
	this.calculateEffectiveDuration();

	if (animationtickers[items.ticker]) this.addToTicker(items.ticker);
	else {

		// Here is where we create the ticker - will have same name as the tween
		tn = `${this.name}_ticker`;

		makeTicker({
			name: tn,
			order: this.order,
			subscribers: this.name,
			duration: this.effectiveDuration,
			eventChoke: xtGet(items.eventChoke, 0),
			cycles: xtGet(items.cycles, 1),
			killOnComplete: xtGet(items.killOnComplete, false)
		});

		this.ticker = tn;

		animationtickers[tn].recalculateEffectiveDuration();
	}

	return this;
};

/*
## Tween object prototype setup
*/
let P = Tween.prototype = Object.create(Object.prototype);
P.type = 'Tween';
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
TODO - documentation
*/
	definitions: null,

/*
TODO - documentation
*/
	duration: 0,

/*
TODO - documentation
*/
	commenceAction: null,
	completeAction: null,

/*
TODO - documentation
*/
	killOnComplete: false,

/*
Hook functions that can be invoked at the end of each relevant operation
*/
	onRun: null,
	onHalt: null,
	onResume: null,
	onReverse: null,
	onSeekTo: null,
	onSeekFor: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters;

/*
TODO - documentation
*/
G.definitions = function() {

	return [].concat(this.definitions);
};

S.definitions = function (item) {

	this.definitions = [].concat(item);
	this.setDefinitionsValues();
};

/*
TODO - documentation
*/
S.commenceAction = function (item) {

	this.commenceAction = item;
	
	if (typeof this.commenceAction !== 'function') this.commenceAction = defaultNonReturnFunction;
};

S.completeAction = function (item) {

	this.completeAction = item;

	if (typeof this.completeAction !== 'function') this.completeAction = defaultNonReturnFunction;
};


/*
## Define prototype functions
*/

/*
TODO - documentation

Overwrites function defined in mixin/base.js
*/
P.set = function (items) {

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
	else if (xto(items.time, items.duration)) {

		this.calculateEffectiveTime();
		this.calculateEffectiveDuration();
	}

	return this;
};

/*
TODO - documentation
*/
P.getEndTime = function () {

	return this.effectiveTime + this.effectiveDuration;
};

/*
TODO - documentation
*/
P.calculateEffectiveDuration = function (item) {

	let tweenDuration = xtGet(item, this.duration),
		calculatedDur = convertTime(tweenDuration),
		cDur = calculatedDur[1],
		cType = calculatedDur[0],
		ticker = this.ticker,
		myticker, 
		tickerDuration = 0;

	this.effectiveDuration = 0;

	if (cType === '%') {
	
		if (ticker) {
	
			myticker = animationtickers[ticker];
	
			if (myticker) {
	
				tickerDuration = myticker.effectiveDuration;
				this.effectiveDuration = tickerDuration * (cDur / 100);
			}
		}
	}
	else this.effectiveDuration = cDur;

	return this;
};

/*
TODO - documentation
*/
P.update = function (items = {}) {

	let starts, ends,
		tick = items.tick || 0,
		revTick = items.reverseTick || 0,
		status = 'running',
		effectiveTime = this.effectiveTime,
		effectiveDuration = this.effectiveDuration,
		reversed = this.reversed;

	// Should we do work for this tween?
	if (!reversed) {

		starts = effectiveTime;
		ends = effectiveTime + effectiveDuration;

		if (tick < starts) status = 'before';
		else if (tick > ends) status = 'after';
	}
	else {

		starts = effectiveTime + effectiveDuration;
		ends = effectiveTime;

		if (revTick > starts) status = 'after';
		else if (revTick < ends) status = 'before';
	}

	// For tweens with a duration > 0
	if (effectiveDuration) {

		if (status === 'running' || status !== this.status) {

			this.status = status;
			this.doSimpleUpdate(items);
			if (!items.next) this.status = (reversed) ? 'before' : 'after';
		}
	}
	// For tweens with a duration == 0
	else {

		if (status !== this.status) {

			this.status = status;
			this.doSimpleUpdate(items);
			if (!items.next) this.status = (reversed) ? 'before' : 'after';
		}
	}

	if (items.willLoop) {

		if (this.reverseOnCycleEnd) this.reversed = !reversed;
		else this.status = 'before';
	}

	return true;
};

/*
TODO - documentation
*/
P.doSimpleUpdate = function (items = {}) {

	let starts = this.effectiveTime,
		effectiveTick,
		actions = this.engineActions,
		effectiveDuration = this.effectiveDuration,
		status = this.status,
		definitions = this.definitions,
		targets = this.targets,
		action = this.action,
		i, iz, j, jz, progress,
		setObj = {};

	effectiveTick = (this.reversed) ? items.reverseTick - starts : items.tick - starts;

	if (effectiveDuration && status === 'running') progress = effectiveTick / effectiveDuration;
	else progress = (status === 'after') ? 1 : 0;

	let def, engine, val, effectiveStart, effectiveChange, int, suffix, attribute;

	for (i = 0, iz = definitions.length; i < iz; i++) {

		def = definitions[i];
		engine = def.engine;
		effectiveStart = def.effectiveStart;
		effectiveChange = def.effectiveChange;
		int = def.integer;
		suffix = def.suffix;
		attribute = def.attribute;

		if (engine.substring) val = actions[engine](effectiveStart, effectiveChange, progress);
		else val = engine(effectiveStart, effectiveChange, progress);

		if (int) val = Math.round(val);

		if (suffix) val += suffix;

		setObj[attribute] = val;
	}

	for (j = 0, jz = targets.length; j < jz; j++) {

		targets[j].set(setObj);
	}

	if (action) action();
};

/*
TODO - documentation
*/
P.engineActions = {

	out: function (start, change, position) {
		
		let temp = 1 - position;
		return (start + change) + (Math.cos((position * 90) * radian) * -change);
	},

	in : function (start, change, position) {

		return start + (Math.sin((position * 90) * radian) * change);
	},

	easeIn: function (start, change, position) {
		
		let temp = 1 - position;
		return (start + change) + ((temp * temp) * -change);
	},

	easeIn3: function (start, change, position) {

		let temp = 1 - position;
		return (start + change) + ((temp * temp * temp) * -change);
	},

	easeIn4: function (start, change, position) {

		let temp = 1 - position;
		return (start + change) + ((temp * temp * temp * temp) * -change);
	},

	easeIn5: function (start, change, position) {

		let temp = 1 - position;
		return (start + change) + ((temp * temp * temp * temp * temp) * -change);
	},

	easeOutIn: function (start, change, position) {

		let temp = 1 - position;

		return (position < 0.5) ?
			start + ((position * position) * change * 2) :
			(start + change) + ((temp * temp) * -change * 2);
	},

	easeOutIn3: function (start, change, position) {

		let temp = 1 - position;

		return (position < 0.5) ?
			start + ((position * position * position) * change * 4) :
			(start + change) + ((temp * temp * temp) * -change * 4);
	},

	easeOutIn4: function (start, change, position) {

		let temp = 1 - position;

		return (position < 0.5) ?
			start + ((position * position * position * position) * change * 8) :
			(start + change) + ((temp * temp * temp * temp) * -change * 8);
	},

	easeOutIn5: function (start, change, position) {

		let temp = 1 - position;

		return (position < 0.5) ?
			start + ((position * position * position * position * position) * change * 16) :
			(start + change) + ((temp * temp * temp * temp * temp) * -change * 16);
	},

	easeOut: function (start, change, position) {

		return start + ((position * position) * change);
	},

	easeOut3: function (start, change, position) {

		return start + ((position * position * position) * change);
	},

	easeOut4: function (start, change, position) {

		return start + ((position * position * position * position) * change);
	},

	easeOut5: function (start, change, position) {

		return start + ((position * position * position * position * position) * change);
	},

	linear: function (start, change, position) {

		return start + (position * change);
	}
};

/*
TODO - documentation
*/
P.setDefinitionsValues = function () {

	let i, iz, temp, def,
		parseDefinitionsValue = this.parseDefinitionsValue,
		definitions = this.definitions;

	for (i = 0, iz = definitions.length; i < iz; i++) {

		def = definitions[i];

		if (def) {

			temp = parseDefinitionsValue(def.start);
			def.effectiveStart = temp[1];
			def.suffix = temp[0];
			temp = parseDefinitionsValue(def.end);
			def.effectiveEnd = temp[1];
			
			if (!xt(def.engine)) def.engine = 'linear';

			def.effectiveChange = def.effectiveEnd - def.effectiveStart;
		}
	}
	return this;
};

/*
TODO - documentation
*/
P.parseDefinitionsValue = function (item) {

	let result = ['', 0],
		a;

	if (xt(item)) {

		if (item.toFixed) result[1] = item;
		else if (item.substring) {

			a = item.match(/^-?\d+\.?\d*(\D*)/);
			
			if (xt(a[0])) result[1] = parseFloat(a);
			if (xt(a[1])) result[0] = a[1];
		}
	}

	return result;
};

/*
TODO - documentation
*/
P.run = function () {

	let t = animationtickers[this.ticker];

	if (t) {

		this.commenceAction();
		t.run();

		if (typeof this.onRun === 'function') this.onRun();
	}
	return this;
};

/*
TODO - documentation
*/
P.isRunning = function () {

	let tick = animationtickers[this.ticker];

	if (tick) return tick.isRunning();
	return false;
};

/*
TODO - documentation
*/
P.halt = function() {

	let t = animationtickers[this.ticker];

	if (t) {

		t.halt();

		if (typeof this.onHalt === 'function') this.onHalt();
	}
	return this;
};

/*
TODO - documentation
*/
P.reverse = function() {

	let t = animationtickers[this.ticker];

	if (t) {

		t.reverse();

		if (typeof this.onReverse === 'function') this.onReverse();
	}
	return this;
};

/*
TODO - documentation
*/
P.resume = function() {

	let t = animationtickers[this.ticker];

	if (t) {

		t.resume();

		if (typeof this.onResume === 'function') this.onResume();
	}
	return this;
};

/*
TODO - documentation
*/
P.seekTo = function(milliseconds) {

	let t = animationtickers[this.ticker];

	if (t) {

		t.seekTo(milliseconds);

		if (typeof this.onSeekTo === 'function') this.onSeekTo();
	}
	return this;
};

/*
TODO - documentation
*/
P.seekFor = function(milliseconds) {

	let t = animationtickers[this.ticker];

	if (t) {

		t.seekFor(milliseconds);

		if (typeof this.onSeekFor === 'function') this.onSeekFor();
	}
	return this;
};

/*
## Exported factory function
*/
const makeTween = function (items) {
	return new Tween(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Tween = Tween;


/*
TODO - documentation
*/
export {
	makeTween,
};
