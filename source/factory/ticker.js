// # Ticker factory
// Ticker objects represent a timeline against which [Tween](./tween.html) and [Action](./action.html) objects will run.


// #### Imports
import { animation, animationtickers, constructors, tween } from '../core/library.js';

import { convertTime, doCreate, isa_obj, mergeOver, pushUnique, removeItem, xt, Ωempty } from '../helper/utilities.js';

import { makeAnimation } from './animation.js';

import { releaseArray, requestArray } from '../helper/array-pool.js';

import baseMix from '../mixin/base.js';

// Shared constants
import { _floor, _now, FUNCTION, PC, T_ACTION, T_RENDER_ANIMATION, T_TICKER, T_TWEEN, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const ANIMATIONTICKERS = 'animationtickers'


// #### Ticker constructor
const Ticker = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.subscribers = [];
    this.subscriberObjects = [];

    this.set(this.defs);
    this.set(items);

    this.cycleCount = 0;
    this.active = false;
    this.effectiveDuration = 0;
    this.startTime = 0;
    this.currentTime = 0;
    this.tick = 0;

    if (items.subscribers) this.subscribe(items.subscribers);

    this.setEffectiveDuration();
    return this;
};


// #### Ticker prototype
const P = Ticker.prototype = doCreate();
P.type = T_TICKER;
P.lib = ANIMATIONTICKERS;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Ticker attributes
const defaultAttributes = {

// __order__ - positive integer Number - determines the order in which each Ticker animation object will be actioned before the Display cycle starts.
// + Higher order Tickers will be processed after lower order Tickers.
// + Tickers with the same `order` value will be processed in the order in which they were defined in code.
    order: 1,

// __duration__ - can accept a variety of values:
// + Number, representing milliseconds.
// + String time value, for example `'500ms', '0.5s'`.
// + (% String values cannot be used with Ticker objects - they have nothing to measure such a relative value against).
    duration: 0,

// __subscribers__ - Array of Tween and Action name-Strings. Use `subscribe` and `unsubscribe` functions rather than the `set` function to add/remove Tweens and/or Actions to/from the Ticker
    subscribers: null,

// __killOnComplete__ - Boolean flag. When set, the Ticker will kill both itself and all Tweens and Actions associated with it at the end of its run
    killOnComplete: false,

// __cycles__ - positive integer Number representing the number of cycles the Ticker will run before it completes.
// + A value of `0` indicates that the Ticker should repeat itself forever, until its `halt`, `seekTo`, `seekFor`, `complete` or `reset` functions are triggered.
// + Note that Tween and Action animation direction is determined by those objects (via their `reverseOnCycleEnd` and `reversed` flags). Tickers always repeat in a forwards direction - they loop back to their start; they never reverse time.
    cycles: 1,

// __observer__ - String name of a RenderAnimation object, or the object itself - halt/resume the ticker based on the running state of the animation object
    observer: null,

// The Ticker object supports some __hook functions__:
// + __onRun__ - triggers each time the Ticker's `run` function is invoked
// + __onHalt__ - triggers each time the Ticker's `halt` function is invoked
// + __onReverse__ - triggers each time the Ticker's `reverse` function is invoked
// + __onResume__ - triggers each time the Ticker's `resume` function is invoked
// + __onSeekTo__ - triggers each time the Ticker's `seekTo` function is invoked
// + __onSeekFor__ - triggers each time the Ticker's `seekFor` function is invoked
// + __onComplete__ - triggers each time the Ticker's `complete` function is invoked
// + __onReset__ - triggers each time the Ticker's `reset` function is invoked
    onRun: null,
    onHalt: null,
    onReverse: null,
    onResume: null,
    onSeekTo: null,
    onSeekFor: null,
    onComplete: null,
    onReset: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['subscribers']);
P.packetFunctions = pushUnique(P.packetFunctions, ['onRun', 'onHalt', 'onReverse', 'onResume', 'onSeekTo', 'onSeekFor', 'onComplete', 'onReset']);


// #### Clone management
// No additional clone functionality required.


// #### Kill management
// `kill` - remove Ticker from Scrawl-canvas system.
P.kill = function (killTweens = true, autokill = true) {

    if (killTweens) {

        const subs = [...this.subscribers];

        for (let i = 0, iz = subs.length; i < iz; i++) {

            const sub = tween[subs[i]];

            if (sub) {

                sub.completeAction();
                sub.kill();
            }
        }
    }

    if (autokill) {

        if (this.active) this.halt();

        removeItem(tickerAnimations, this.name);
        tickerAnimationsFlag = true;

        this.deregister();

        return true;
    }
    return this;
};

// `killTweens` - remove a Ticker's subscribed Tweens from Scrawl-canvas system.
// + If the function is invoked with a truthy argument, the Ticker will also be removed from the system.
P.killTweens = function(autokill = false) {

    return this.kill(true, autokill);
};


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters;

// __subscribers__ - see also the `subscribe` and `unsubscribe` functions below
// + getter returns a copy of the `subscribers` Array, containing Tween and Action object name-Strings.
// + setter accepts a Tween or Action name-String, or an Array of such Strings. Will replace the existing `subscribers` Array with this new data.
G.subscribers = function () {

    return [...this.subscribers];
};
S.subscribers = function (item) {

    this.subscribe(item);
};

// __order__
S.order = function (item) {

    this.order = item;

    if (this.active) tickerAnimationsFlag = true;
};

// __cycles__
S.cycles = function (item) {

    this.cycles = item;

    if (!this.cycles) this.cycleCount = 0;
};

// __duration__ - changes to the `duration` (and as a consequence `effectiveDuration`) attributes will be cascaded down to subscribed Tweens and Actions immediately.
S.duration = function (item) {

    let i, iz, target;

    const subscribers = this.subscribers;

    this.duration = item;
    this.setEffectiveDuration();

    if(xt(subscribers)){

        for (i = 0, iz = subscribers.length; i < iz; i++) {

            target = tween[subscribers[i]];

            if (target) {

                target.calculateEffectiveTime();

                if (target.type === T_TWEEN) target.calculateEffectiveDuration();
            }
        }
    }
};


// #### Subscription management

// `subscribe` - can accept one or more arguments, each of which can be:
// + a Tween or Action name-String, or the Tween or Action objects themselves
// + an Array of such name-Strings or objects
P.subscribe = function (...args) {

    const items = args.flat(Infinity);

    if (items.length) {

        items.forEach(item => {

            let obj;

            if (item.substring) obj = tween[item];
            else if (isa_obj(item) && (item.type === T_ACTION || item.type === T_TWEEN)) obj = item;

            if (obj) {

                pushUnique(this.subscribers, obj.name);
                obj.ticker = this.name;
                obj.calculateEffectiveTime();
            }
        });

        this.sortSubscribers();
        this.recalculateEffectiveDuration();
    }
    return this;
};

// `unsubscribe` - can accept one or more arguments, each of which can be:
// + a Tween or Action name-String, or the Tween or Action objects themselves
// + an Array of such name-Strings or objects
P.unsubscribe = function (...args) {

    const items = args.flat(Infinity);

    if (items.length) {

        items.forEach(item => {

            let obj;

            if (item.substring) obj = tween[item];
            else if (isa_obj(item) && (item.type === T_ACTION || item.type === T_TWEEN)) obj = item;

            if (obj) {

                removeItem(this.subscribers, obj.name);
                obj.ticker = ZERO_STR;
            }
        });

        this.sortSubscribers();
        this.recalculateEffectiveDuration();
    }
    return this;
};

// `repopulateSubscriberObjects`
P.repopulateSubscriberObjects = function () {

    const arr = this.subscriberObjects,
        subs = this.subscribers;

    let t;

    arr.length = 0;

    subs.forEach(sub => {

        t = tween[sub];
        if (t) arr.push(t);
    });
};

// `getSubscriberObjects`
P.getSubscriberObjects = function () {

    if (this.subscribers.length && !this.subscriberObjects.length) this.repopulateSubscriberObjects();

    return this.subscriberObjects;
};

// `sortSubscribers` - internal Helper function called by `subscribe` and `unsubscribe`
P.sortSubscribers = function () {

    const subs = this.subscribers,
        len = subs.length;

    if(len > 1) {

        const buckets = requestArray();

        let i, sub;

        for (i = 0; i < len; i++) {

            sub = tween[subs[i]];

            if (sub) buckets.push(sub);
        }

        if (buckets.length > 1) buckets.sort((a, b) => a.effectiveTime - b.effectiveTime);

        subs.length = 0;

        for (i = 0; i < buckets.length; i++) {

            subs.push(buckets[i].name);
        }

        releaseArray(buckets);
    }
    this.repopulateSubscriberObjects();
};

// `updateSubscribers` - internal function called by the `run`, `reset` and `complete` functions below.
// + First argument is an object that gets applied as the argument to each Tween/Action object's `set` function.
// + Second argument is a Boolean; when set, subscribed Tween/Actions will be told to reverse their current direction.
P.updateSubscribers = function(items, reversed) {

    reversed = (xt(reversed)) ? reversed : false;

    const subs = this.getSubscriberObjects();

    let i, iz;

    if (reversed) {

        for (i = subs.length - 1; i >= 0; i--) {

            subs[i].set(items);
        }
    }
    else{

        for (i = 0, iz = subs.length; i < iz; i++) {

            subs[i].set(items);
        }
    }
    return this;
};

// `changeSubscriberDirection` - internal function - when invoked, Tween/Actions will be told to reverse their current direction.
P.changeSubscriberDirection = function () {

    const subs = this.getSubscriberObjects();

    subs.forEach(sub => sub.reversed = !sub.reversed);

    return this;
};


// #### Animation

// `recalculateEffectiveDuration` - where a Ticker has not been given a `duration` value, it needs to consult its subscribed Tween/Action objects to calculate an `effectiveDuration` value with sufficient time allocated for each Tween to run to completion, and each Action to trigger.
// + Tween/Actions with a relative `time` attribute - eg: `30%` - will not be included in the calculation.
// + Tweens can overlap - they do not all have to start and end at the same time, nor do they need to run sequentially.
P.recalculateEffectiveDuration = function() {

    const subs = this.getSubscriberObjects();

    let durationValue,
        duration = 0;

    if (!this.duration) {

        subs.forEach(sub => {

            durationValue = sub.getEndTime();

            if (durationValue > duration) duration = durationValue;
        });
        this.effectiveDuration = duration;
    }
    // Shouldn't cause an infinite loop ...
    else this.setEffectiveDuration();

    return this;
};

// `setEffectiveDuration` - internal helper function - convert `duration` value into `effectiveDuration` value.
P.setEffectiveDuration = function() {

    let temp;

    if (this.duration) {

        temp = convertTime(this.duration);

        // Cannot use %-String values for Ticker `duration` attribute
        if (temp[0] === PC) {

            this.duration = 0
            this.recalculateEffectiveDuration();
        }
        else this.effectiveDuration = temp[1];
    }
    return this;
};

// `checkObserverRunningState` - internal helper function
P.checkObserverRunningState = function () {

    let observer = this.observer;

    if (observer) {

        if (observer.substring) {

            const anim = animation[observer];

            if (anim && anim.type === T_RENDER_ANIMATION) {

                observer = this.observer = anim;
            }
            else return true;
        }
        if (observer.type === T_RENDER_ANIMATION) {

            return observer.isRunning();
        }
    }
    return true;
};

// `fn` - internal - the __animation function__ will trigger once per RequestAnimationFrame (RAF) tick - approximately 60 times a second, depending on other calculation work.
// + Only triggers when the Ticker is running in a qualifying state.
// + __reverseOrder__ argument is a Boolean value; when set, subscribed Tween/Action objects will be processed in reverse order.
P.fn = function (reverseOrder) {

    // Determine the order in which subscribed objects will be processed
    reverseOrder = xt(reverseOrder) ? reverseOrder : false;

    // Request a `result` object from the pool.
    const result = requestResultObject();

    const startTime = this.startTime,
        cycles = this.cycles,
        effectiveDuration = this.effectiveDuration;

    let i, iz, subs,
        currentTime, tick,
        active = this.active,
        cycleCount = this.cycleCount;

    // Process only if the Ticker is currently ___active___ and has a ___startTime___ value assigned to it.
    if (active && startTime) {

        // Process only if the Ticker's `cycles` attribute has been set to `0`, or if the Ticker has not yet completed all its cycles.
        if (!cycles || cycleCount < cycles) {

            currentTime = this.currentTime = _now();
            tick = this.tick = currentTime - startTime;

            // Update the results object
            // + Functionality performed if the ___Tween is not on its final cycle___.
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
            // + Functionality performed only when the ___Tween is on its final cycle___.
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

            // Invoke the `update` function on each subscribed Tween/Action
            subs = this.getSubscriberObjects();

            if (reverseOrder) {

                for (i = subs.length - 1; i >= 0; i--) {

                    subs[i].update(result);
                }
            }
            else{

                for (i = 0, iz = subs.length; i < iz; i++) {

                    subs[i].update(result);
                }
            }

            // If this invocation of the function has completed the Ticker's run, switch it off.
            if (!active) this.halt();

            // If the Ticker's run is completed and the `killOnComplete` flag is set, kill everything.
            if (this.killOnComplete && cycleCount >= cycles) this.killTweens(true);
        }
    }
    // Release the `result` object back to the pool.
    releaseResultObject(result);
};


// #### Animation control

// `run`
// + Start the Ticker from time 0.
// + Trigger the object's `onRun` function.
P.run = function () {

    if (!this.active) {

        this.startTime = this.currentTime = _now();
        this.cycleCount = 0;

        this.updateSubscribers({
            reversed: false
        });

        this.active = true;

        pushUnique(tickerAnimations, this.name);
        tickerAnimationsFlag = true;

        if (typeof this.onRun === FUNCTION) this.onRun();
    }
    return this;
};

// `isRunning` - check to see if Ticker is in a running state.
P.isRunning = function () {

    return this.active;
};

// `reset`
// + Halt the Ticker, if it is running.
// + Set all attributes to their initial values.
// + Update subscribed Tween/Actions.
// + Trigger the object's `onReset` function.
P.reset = function () {

    if (this.active) this.halt();

    this.startTime = this.currentTime = _now();
    this.cycleCount = 0;

    this.updateSubscribers({
        reversed: false
    });

    this.active = true;

    this.fn(true);
    this.active = false;

    if (typeof this.onReset === FUNCTION) this.onReset();

    return this;
};

// `complete`
// + Halt the Ticker, if it is running.
// + Set all attributes to their initial values.
// + Update subscribed Tween/Actions.
// + Trigger the object's `onComplete` function.
P.complete = function () {

    if (this.active) this.halt();

    this.startTime = this.currentTime = _now();
    this.cycleCount = 0;

    this.updateSubscribers({
        reversed: true
    });

    this.active = true;

    this.fn();
    this.active = false;

    if (typeof this.onComplete === FUNCTION) this.onComplete();

    return this;
};

// `reverse` - simulates a reversal in the Ticker's animation.
// + Halt the Ticker, if it is running.
// + Trigger the object's `onReverse` function.
// + after recalculation, resume the Ticker - if required.
// + Function accepts a Boolean argument - if true, Ticker will start playing "in reverse".
// + Directionality is determined by Tween/Action object attribute settings, not the Ticker.
P.reverse = function (resume = false) {

    if (this.active) this.halt();

    const timePlayed = this.currentTime - this.startTime;
    this.startTime = this.currentTime - (this.effectiveDuration - timePlayed);
    this.changeSubscriberDirection();
    this.active = true;

    this.fn();
    this.active = false;

    if (typeof this.onReverse === FUNCTION) this.onReverse();

    if (resume) this.resume();

    return this;
};

// `halt`
// + Stop the Ticker at its current point in time
// + Trigger the object's `onHalt` function.
P.halt = function () {

    this.active = false;
    removeItem(tickerAnimations, this.name);
    tickerAnimationsFlag = true;

    if (typeof this.onHalt === FUNCTION) this.onHalt();

    return this;
};

// `resume` - this function can also be triggered by the `reverse`, `seekTo` and `seekFor` functions
// + Start the Ticker from its current point in time
// + Trigger the object's `onResume` function.
P.resume = function () {

    let now, current, start;

    if (!this.active) {

        now = _now();
        current = this.currentTime;
        start = this.startTime;
        this.startTime = now - (current - start);
        this.currentTime = now;
        this.active = true;
        pushUnique(tickerAnimations, this.name);
        tickerAnimationsFlag = true;

        if (typeof this.onResume === FUNCTION) this.onResume();

    }
    return this;
};

// `seekTo`
// + First argument - Number representing the millisecond time to move to on the Ticker's timeline
// + Second argument - Boolean - if true, Ticker will resume playing from new point
// + Halt the Ticker, if it is running.
// + Update the Ticker's `currentTime`, `startTime` attributes
// + Trigger the object's `onSeekTo` function.
// + Resume the Ticker - if required.
P.seekTo = function (milliseconds = 0, resume = false) {

    let backwards = false;

    if (this.active) this.halt();

    if (this.cycles && this.cycleCount >= this.cycles) this.cycleCount = this.cycles - 1;

    if (milliseconds < this.tick) backwards = true;

    this.currentTime = _now();
    this.startTime = this.currentTime - milliseconds;
    this.active = true;

    this.fn(backwards);
    this.active = false;

    if (typeof this.onSeekTo === FUNCTION) this.onSeekTo();

    if (resume) this.resume();

    return this;
};

// `seekFor`
// + First argument - Number representing the number of milliseconds to move along the  Ticker's timeline (forwards or backwards)
// + Second argument - Boolean - if true, Ticker will resume playing from new point
// + Halt the Ticker, if it is running.
// + Update the Ticker's `currentTime`, `startTime` attributes
// + Trigger the object's `onSeekFor` function.
// + Resume the Ticker - if required.
P.seekFor = function (milliseconds = 0, resume = false) {

    let backwards = false;

    if (this.active) this.halt();

    if (this.cycles && this.cycleCount >= this.cycles) this.cycleCount = this.cycles - 1;

    this.startTime -= milliseconds;

    if (milliseconds < 0) backwards = true;

    this.active = true;

    this.fn(backwards);
    this.active = false;

    if (typeof this.onSeekFor === FUNCTION) this.onSeekFor();

    if (resume) this.resume();

    return this;
};


// #### Ticker animation controller
const tickerAnimations = [];
let tickerAnimationsFlag = true;

// `coreTickersAnimation`
makeAnimation({

    name: 'SC-core-tickers-animation',
    order: 0,
    fn: function () {

        // We only sort active Ticker objects when absolutely necessary.
        // + Sorted using a bucket sort algorithm.
        let arr, obj, order, i, iz, name;

        if (tickerAnimationsFlag) {

            tickerAnimationsFlag = false;

            const buckets = requestArray();

            for (i = 0, iz = tickerAnimations.length; i < iz; i++) {

                obj = animationtickers[tickerAnimations[i]];

                if (obj) {

                    order = _floor(obj.order) || 0;

                    if (!buckets[order]) buckets[order] = requestArray();

                    buckets[order].push(obj.name);
                }
            }
            tickerAnimations.length = 0;

            for (i = 0, iz = buckets.length; i < iz; i++) {

                arr = buckets[i];

                if (arr) {

                    tickerAnimations.push(...arr);
                    releaseArray(arr);
                }
            }
            releaseArray(buckets);
        }

        // Invoke each Ticker's `fn` function.
        // + It's up to the Ticker object to decide whether it's active
        for (i = 0, iz = tickerAnimations.length; i < iz; i++) {

            name = tickerAnimations[i];
            obj= animationtickers[name];

            if (obj && obj.fn && obj.checkObserverRunningState()) obj.fn();
        }
    }
});


// #### ResultObject pool
// TODO: do we need a pool for this?
// + To use a pool result object, request it using `requestResultObject` function.
// + It is imperative that requested result objects are released - `releaseResultObject` - once work with them completes.
const resultObjectPool = [];

// `requestResultObject`
const requestResultObject = function () {

    if (!resultObjectPool.length) {

        resultObjectPool.push({
            tick: 0,
            reverseTick: 0,
            willLoop: false,
            next: false
        });
    }

    return resultObjectPool.pop();
};

// `releaseResultObject`
const releaseResultObject = function (r) {

    if (r) {

        r.tick = 0;
        r.reverseTick = 0;
        r.willLoop = false;
        r.next = false;
        resultObjectPool.push(r);
    }
};


// #### Factory
export const makeTicker = function (items) {

    if (!items) return false;
    return new Ticker(items);
};

constructors.Ticker = Ticker;
