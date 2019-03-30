/*
# Ticker factory
*/
import { constructors, animationtickers, animationtickersnames, tween } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xt, xtGet, bucketSort, convertTime, defaultNonReturnFunction } from '../core/utilities.js';

import { makeAnimation } from './animation.js';

import baseMix from '../mixin/base.js';

let testIsObject = Object.prototype.toString;

/*
## Ticker constructor
*/
const Ticker = function (items = {}) {

	this.makeName(items.name);
	this.register();
	this.set(this.defs);
	this.set(items);

/*

*/
	this.subscribers = [];

/*

*/
	this.cycleCount = 0;

/*

*/
	this.active = false;

/*

*/
	this.effectiveDuration = 0;

/*

*/
	this.startTime = 0;

/*

*/
	this.currentTime = 0;

/*

*/
	this.tick = 0;

/*

*/
	this.lastEvent = 0;

	if (items.subscribers) this.subscribe(items.subscribers);

	this.setEffectiveDuration();
	return this;
};

/*
## Ticker object prototype setup
*/
let Tp = Ticker.prototype = Object.create(Object.prototype);
Tp.type = 'Ticker';
Tp.lib = 'animationtickers';
Tp.artefact = false;

/*
Apply mixins to prototype object
*/
Tp = baseMix(Tp);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	order: 1,

/*

*/
	duration: 0,

/*

*/
	subscribers: null,

/*

*/
	killOnComplete: false,

/*

*/
	cycles: 1,

/*

*/
	eventChoke: 0
};
Tp.defs = mergeOver(Tp.defs, defaultAttributes);

let G = Tp.getters,
	S = Tp.setters;

/*

*/
G.subscribers = function () {

	return [].concat(this.subscribers);
};

/*

*/
S.order = function (item) {

	this.order = item;
	
	if (this.active) tickerAnimationsFlag = true;
};

/*

*/
S.cycles = function (item) {

	this.cycles = item;
	
	if (!this.cycles) this.cycleCount = 0;
};

/*

*/
S.subscribers = function (item) {

	this.subscribers = [];
	this.subscribe(item);
};

/*

*/
S.duration = function (item) {

	let i, iz, o;

	this.duration = item;
	this.setEffectiveDuration();

	if(xt(this.subscribers)){

		for (i = 0, iz = this.subscribers.length; i < iz; i++) {
		
			o = tween[this.subscribers[i]];

			if (o) {

				o.calculateEffectiveTime();

				if (o.type === 'Tween') o.calculateEffectiveDuration();
			}
		}
	}
};

/*
## Define prototype functions
*/

/*

*/
Tp.makeTickerUpdateEvent = function() {

	return new CustomEvent('tickerupdate', {
		detail: {
			name: this.name,
			type: 'Ticker',
			tick: this.tick,
			reverseTick: this.effectiveDuration - this.tick
		},
		bubbles: true,
		cancelable: true
	});
};

/*

*/
Tp.subscribe = function (items) {

	let myItems = [].concat(items),
		i, iz, item, name;

	for (i = 0, iz = myItems.length; i < iz; i++) {

		item = myItems[i];
		
		if(item != null){

			if (item.substring) name = item;
			else name = (testIsObject.call(item) === '[object Object]' && item.name) ? item.name : false;

			if (name) pushUnique(this.subscribers, name);
		}
	}

	if (myItems.length) {

		this.sortSubscribers();
		this.recalculateEffectiveDuration();
	}

	return this;
};

/*

*/
Tp.unsubscribe = function (items) {

	var myItems = [].concat(items),
		i, iz, item, name;

	for (i = 0, iz = myItems.length; i < iz; i++) {

		item = items[i];

		if (item.substring) name = item;
		else name = (testIsObject.call(item) === '[object Object]' && item.name) ? item.name : false;

		if (name) removeItem(this.subscribers, name);
	}

	if (myItems.length) {

		this.sortSubscribers();
		this.recalculateEffectiveDuration();
	}

	return this;
};

/*

*/
Tp.recalculateEffectiveDuration = function() {

	let i, iz, obj, durationValue, duration = 0;

	if (!this.duration) {

		for (i = 0, iz = this.subscribers.length; i < iz; i++) {

			obj = tween[this.subscribers[i]];
			durationValue = obj.getEndTime();

			if (durationValue > duration) duration = durationValue;
		}

		this.effectiveDuration = duration;
	}
	else this.setEffectiveDuration(); // shouldn't cause an infinite loop ...

	return this;
};

/*

*/
Tp.setEffectiveDuration = function() {

	let temp;

	if (this.duration) {
	
		temp = convertTime(this.duration);

		if (temp[0] === '%') {

			// cannot use percentage values for ticker durations
			this.duration = 0
			this.recalculateEffectiveDuration();
		}
		else this.effectiveDuration = temp[1];
	}
	return this;
};

/*

*/
Tp.sortSubscribers = function () {

	if(this.subscribers.length > 1) this.subscribers = bucketSort('tween', 'effectiveTime', this.subscribers);
};

/*

*/
Tp.fn = function (reverseOrder) {

	let i, iz, subs, sub, eTime, now, e;
	
	let result = {
		tick: 0,
		reverseTick: 0,
		willLoop: false,
		next: false
	};

	reverseOrder = xt(reverseOrder) ? reverseOrder : false;

	if (this.active && this.startTime) {

		if (!this.cycles || this.cycleCount < this.cycles) {

			this.currentTime = Date.now();
			this.tick = this.currentTime - this.startTime;

			if (!this.cycles || this.cycleCount + 1 < this.cycles) {

				if (this.tick >= this.effectiveDuration) {

					this.tick = 0;
					this.startTime = this.currentTime;
					result.tick = this.effectiveDuration;
					result.reverseTick = 0;
					result.willLoop = true;

					if (this.cycles) this.cycleCount++;
				}
				else {

					result.tick = this.tick;
					result.reverseTick = this.effectiveDuration - this.tick;
				}
				result.next = true;
			}
			else {

				if (this.tick >= this.effectiveDuration) {

					result.tick = this.effectiveDuration;
					result.reverseTick = 0;
					this.active = false;
					
					if (this.cycles) this.cycleCount++;
				}
				else {

					result.tick = this.tick;
					result.reverseTick = this.effectiveDuration - this.tick;
					result.next = true;
				}
			}

			subs = this.subscribers;

			if (reverseOrder) {

				for (i = subs.length - 1; i >= 0; i--) {

					sub = tween[subs[i]];
					sub.update(result);
				}
			}
			else{

				for (i = 0, iz = subs.length; i < iz; i++) {

					sub = tween[subs[i]];
					sub.update(result);
				}
			}

			if (this.eventChoke) {

				eTime = this.lastEvent + this.eventChoke;
				now = Date.now();

				if (eTime < now) {

					e = this.makeTickerUpdateEvent();
					window.dispatchEvent(e);
					this.lastEvent = now;
				}
			}

			if (!this.active) this.halt();

			if (this.killOnComplete && this.cycleCount >= this.cycles) this.killTweens(true);
		}
	}
};

/*

*/
Tp.updateSubscribers = function(items, reversed) {
	
	let subs = this.subscribers,
		i, iz;

	reversed = (xt(reversed)) ? reversed : false;

	if (reversed) {

		for (i = subs.length - 1; i >= 0; i--) {

			tween[subs[i]].set(items);
		}
	}
	else{

		for (i = 0, iz = subs.length; i < iz; i++) {

			tween[subs[i]].set(items);
		}
	}
	return this;
};

/*

*/
Tp.changeSubscriberDirection = function () {

	var subs = this.subscribers,
		sub, i, iz;

	for (i = 0, iz = subs.length; i < iz; i++) {

		sub = tween[subs[i]];
		sub.reversed = !sub.reversed;
	}
	return this;
};

/*

*/
Tp.run = function () {

	if (!this.active) {

		this.startTime = this.currentTime = Date.now();
		this.cycleCount = 0;

		this.updateSubscribers({
			reversed: false
		});

		this.active = true;

		pushUnique(tickerAnimations, this.name);
		tickerAnimationsFlag = true;
	}

	return this;
};

/*

*/
Tp.reset = function () {

	if (this.active) this.halt();

	this.startTime = this.currentTime = Date.now();
	this.cycleCount = 0;

	this.updateSubscribers({
		reversed: false
	});

	this.active = true;

	this.fn(true);
	this.active = false;

	return this;
};

/*

*/
Tp.complete = function () {

	if (this.active) this.halt();

	this.startTime = this.currentTime = Date.now();
	this.cycleCount = 0;

	this.updateSubscribers({
		reversed: true
	});

	this.active = true;

	this.fn();
	this.active = false;

	return this;
};

/*

*/
Tp.reverse = function (resume = false) {

	let timePlayed;

	resume = xtGet(resume, false);

	if (this.active) {
		this.halt();
	}

	timePlayed = this.currentTime - this.startTime;
	this.startTime = this.currentTime - (this.effectiveDuration - timePlayed);
	this.changeSubscriberDirection();
	this.active = true;

	this.fn();
	this.active = false;
	
	if (resume) this.resume();

	return this;
};

/*

*/
Tp.halt = function () {

	this.active = false;
	pushUnique(tickerAnimations, this.name);
	tickerAnimationsFlag = true;
	return this;
};

/*

*/
Tp.resume = function () {

	let now, current, start;

	if (!this.active) {

		now = Date.now(),
		current = this.currentTime,
		start = this.startTime;
		this.startTime = now - (current - start);
		this.currentTime = now;
		this.active = true;
		pushUnique(tickerAnimations, this.name);
		tickerAnimationsFlag = true;
	}

	return this;
};

/*

*/
Tp.seekTo = function (milliseconds, resume = false) {

	let backwards = false;

	milliseconds = __xtGet(milliseconds, 0);

	if (this.active) this.halt();

	if (this.cycles && this.cycleCount >= this.cycles) this.cycleCount = this.cycles - 1;

	if (milliseconds < this.tick) backwards = true;

	this.currentTime = Date.now();
	this.startTime = this.currentTime - milliseconds;
	this.active = true;

	this.fn(backwards);
	this.active = false;

	if (resume) this.resume();

	return this;
};

/*

*/
Tp.seekFor = function (milliseconds, resume = false) {

	let backwards = false;

	milliseconds = __xtGet(milliseconds, 0);

	if (this.active) this.halt();

	if (this.cycles && this.cycleCount >= this.cycles) this.cycleCount = this.cycles - 1;

	this.startTime -= milliseconds;

	if (milliseconds < 0) backwards = true;

	this.active = true;

	this.fn(backwards);
	this.active = false;

	if (resume) this.resume();

	return this;
};

/*

*/
Tp.kill = function () {

	if (this.active) this.halt();

	delete animationtickers[this.name];
	removeItem(animationtickersnames, this.name);
	removeItem(tickerAnimations, this.name);
	tickerAnimationsFlag = true;

	return true;
};

/*

*/
Tp.killTweens = function(autokill = false) {

	let i, iz, sub;

	for (i = 0, iz = this.subscribers.length; i < iz; i++) {

		sub = tween[this.subscribers[i]];
		sub.completeAction();
		sub.kill();
	}

	if (autokill) {

		this.kill();
		return true;
	}

	return this;
};


/*
## Ticker animation controller
*/
let tickerAnimations = [];

let tickerAnimationsFlag = true;

const coreTickersAnimation = makeAnimation({

	name: 'coreTickersAnimation',
	order: 0,
	fn: function () {

		return new Promise((resolve) => {
			
			let i, iz, t;

			if (tickerAnimationsFlag) {

				tickerAnimationsFlag = false;
				if (tickerAnimations.length > 1) tickerAnimations = bucketSort('animationtickers', 'order', tickerAnimations);
			}

			for (i = 0, iz = tickerAnimations.length; i < iz; i++) {

				t = animationtickers[tickerAnimations[i]];
				
				if (t.fn) t.fn();
			}

			resolve(true);
		});
	}
});


/*
## Exported factory function
*/
const makeTicker = function (items) {
	return new Ticker(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Ticker = Ticker;

export {
	makeTicker,
};
