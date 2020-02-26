/*
# Ticker factory
*/
import { constructors, animationtickers, tween } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xt, xtGet, convertTime } from '../core/utilities.js';

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
let P = Ticker.prototype = Object.create(Object.prototype);
P.type = 'Ticker';
P.lib = 'animationtickers';
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
	eventChoke: 0,

/*
Hook functions that can be invoked at the end of each relevant operation
*/
	onRun: null,
	onHalt: null,
	onResume: null,
	onReverse: null,
	onSeekTo: null,
	onSeekFor: null,
	onComplete: null,
	onReset: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters;

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

	let i, iz, target,
		subscribers = this.subscribers;

	this.duration = item;
	this.setEffectiveDuration();

	if(xt(subscribers)){

		for (i = 0, iz = subscribers.length; i < iz; i++) {
		
			target = tween[subscribers[i]];

			if (target) {

				target.calculateEffectiveTime();

				if (target.type === 'Tween') target.calculateEffectiveDuration();
			}
		}
	}
};

/*
## Define prototype functions
*/

/*

*/
P.makeTickerUpdateEvent = function() {

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
P.subscribe = function (items) {

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
P.unsubscribe = function (items) {

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
P.recalculateEffectiveDuration = function() {

	let i, iz, obj, durationValue, 
		subscribers = this.subscribers,
		duration = 0;

	if (!this.duration) {

		for (i = 0, iz = subscribers.length; i < iz; i++) {

			obj = tween[subscribers[i]];
			durationValue = obj.getEndTime();

			if (durationValue > duration) duration = durationValue;
		}
		this.effectiveDuration = duration;
	}
	// Shouldn't cause an infinite loop ...
	else this.setEffectiveDuration();

	return this;
};

/*

*/
P.setEffectiveDuration = function() {

	let temp;

	if (this.duration) {
	
		temp = convertTime(this.duration);

		if (temp[0] === '%') {

			// Cannot use percentage values for ticker durations
			this.duration = 0
			this.recalculateEffectiveDuration();
		}
		else this.effectiveDuration = temp[1];
	}
	return this;
};

/*

*/
P.sortSubscribers = function () {

	let mysubscribers = this.subscribers;

	if(mysubscribers.length > 1) {

		let subs = [].concat(mysubscribers),
			floor = Math.floor,
			buckets = [];

		subs.forEach(obj => {

			let effectiveTime = floor(obj.effectiveTime) || 0;

			if (!buckets[effectiveTime]) buckets[effectiveTime] = [];

			buckets[effectiveTime].push(obj);
		});

		this.subscribers = buckets.reduce((a, v) => a.concat(v), []);
	}
};

/*

*/
P.fn = function (reverseOrder) {

	let result = {
		tick: 0,
		reverseTick: 0,
		willLoop: false,
		next: false
	};

	reverseOrder = xt(reverseOrder) ? reverseOrder : false;

	let i, iz, subs, sub, eTime, now, e,
		active = this.active,
		startTime = this.startTime,
		currentTime, tick,
		cycles = this.cycles,
		cycleCount = this.cycleCount,
		effectiveDuration = this.effectiveDuration,
		eventChoke = this.eventChoke;
	
	if (active && startTime) {

		if (!cycles || cycleCount < cycles) {

			currentTime = this.currentTime = Date.now();
			tick = this.tick = currentTime - startTime;

			if (!cycles || cycleCount + 1 < cycles) {

				if (tick >= effectiveDuration) {

					tick = this.tick = 0;
					this.startTime = this.currentTime;
					result.tick = effectiveDuration;
					result.reverseTick = 0;
					result.willLoop = true;

					if (cycles) {

						cycleCount++;
						this.cycleCount = cycleCount;
					}
				}
				else {

					result.tick = tick;
					result.reverseTick = effectiveDuration - tick;
				}
				result.next = true;
			}
			else {

				if (tick >= effectiveDuration) {

					result.tick = effectiveDuration;
					result.reverseTick = 0;
					active = this.active = false;
					
					if (cycles) {

						cycleCount++
						this.cycleCount = cycleCount;
					}
				}
				else {

					result.tick = tick;
					result.reverseTick = effectiveDuration - tick;
					result.next = true;
				}
			}

			subs = this.subscribers;

			if (reverseOrder) {

				for (i = subs.length - 1; i >= 0; i--) {

					tween[subs[i]].update(result);
				}
			}
			else{

				for (i = 0, iz = subs.length; i < iz; i++) {

					tween[subs[i]].update(result);
				}
			}

			if (eventChoke) {

				eTime = this.lastEvent + eventChoke;
				now = Date.now();

				if (eTime < now) {

					e = this.makeTickerUpdateEvent();
					window.dispatchEvent(e);
					this.lastEvent = now;
				}
			}

			if (!active) this.halt();

			if (this.killOnComplete && cycleCount >= cycles) this.killTweens(true);
		}
	}
};

/*

*/
P.updateSubscribers = function(items, reversed) {
	
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
P.changeSubscriberDirection = function () {

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
P.run = function () {

	if (!this.active) {

		this.startTime = this.currentTime = Date.now();
		this.cycleCount = 0;

		this.updateSubscribers({
			reversed: false
		});

		this.active = true;

		pushUnique(tickerAnimations, this.name);
		tickerAnimationsFlag = true;

		if (typeof this.onRun === 'function') this.onRun();
	}

	return this;
};

/*

*/
P.isRunning = function () {

	return this.active;
};

/*

*/
P.reset = function () {

	if (this.active) this.halt();

	this.startTime = this.currentTime = Date.now();
	this.cycleCount = 0;

	this.updateSubscribers({
		reversed: false
	});

	this.active = true;

	this.fn(true);
	this.active = false;

	if (typeof this.onReset === 'function') this.onReset();

	return this;
};

/*

*/
P.complete = function () {

	if (this.active) this.halt();

	this.startTime = this.currentTime = Date.now();
	this.cycleCount = 0;

	this.updateSubscribers({
		reversed: true
	});

	this.active = true;

	this.fn();
	this.active = false;

	if (typeof this.onComplete === 'function') this.onComplete();

	return this;
};

/*

*/
P.reverse = function (resume = false) {

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

	if (typeof this.onResume === 'function') this.onResume();

	return this;
};

/*

*/
P.halt = function () {

	this.active = false;
	pushUnique(tickerAnimations, this.name);
	tickerAnimationsFlag = true;

	if (typeof this.onHalt === 'function') this.onHalt();

	return this;
};

/*

*/
P.resume = function () {

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

		if (typeof this.onResume === 'function') this.onResume();

	}
	return this;
};

/*

*/
P.seekTo = function (milliseconds, resume = false) {

	let backwards = false;

	milliseconds = xtGet(milliseconds, 0);

	if (this.active) this.halt();

	if (this.cycles && this.cycleCount >= this.cycles) this.cycleCount = this.cycles - 1;

	if (milliseconds < this.tick) backwards = true;

	this.currentTime = Date.now();
	this.startTime = this.currentTime - milliseconds;
	this.active = true;

	this.fn(backwards);
	this.active = false;

	if (typeof this.onSeekTo === 'function') this.onSeekTo();

	if (resume) this.resume();

	return this;
};

/*

*/
P.seekFor = function (milliseconds, resume = false) {

	let backwards = false;

	milliseconds = __xtGet(milliseconds, 0);

	if (this.active) this.halt();

	if (this.cycles && this.cycleCount >= this.cycles) this.cycleCount = this.cycles - 1;

	this.startTime -= milliseconds;

	if (milliseconds < 0) backwards = true;

	this.active = true;

	this.fn(backwards);
	this.active = false;

	if (typeof this.onSeekFor === 'function') this.onSeekFor();

	if (resume) this.resume();

	return this;
};

/*

*/
P.kill = function () {

	if (this.active) this.halt();

	removeItem(tickerAnimations, this.name);
	tickerAnimationsFlag = true;

	this.deregister();

	return true;
};

/*

*/
P.killTweens = function(autokill = false) {

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

				let tans = [].concat(tickerAnimations),
					floor = Math.floor,
					buckets = [];

				tans.forEach(name => {

					let obj = animationtickers[name];

					if (xt(obj)) {

						let order = floor(obj.order) || 0;

						if (!buckets[order]) buckets[order] = [];

						buckets[order].push(obj.name);
					}
				});

				tickerAnimations = buckets.reduce((a, v) => a.concat(v), []);
			}

			tickerAnimations.forEach(name => {

				let obj = animationtickers[name];

				if (obj && obj.fn) obj.fn();

			});
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
