// # Ticker factory
// Ticker objects represent a timeline against which [Tween](./tween.html) and [Action](./action.html) objects will run.
// + ___A Ticker is an animation___ (but not a Scrawl-canvas [Animation](./animation.html)) object; it defines a `fn` function internally which will check through all Tween and Action objects subscribing to it and, where appropriate, trigger their `update` functions.
// + This module defines and launches a `coreTickersAnimation` Animation object; all Ticker objects get added to this object when their `run` or `resume` functions are triggered.
// + The `coreTickersAnimation` object runs in the Scrawl-canvas `animationLoop` which is tied to the browser/device's requestAnimationFrame (RAF) functionality.
// + `coreTickersAnimation` runs before other Animation objects, thus ___Tween/Action updates happen before any Display cycle functionality___.
// + Unlike Animation objects, ___Ticker objects do not run automatically___ as soon as they have been created.
// + To trigger a Ticker object, invoke its `run` or `resume` functions.
//
// Ticker objects have an ___effective duration___ - a set number of milliseconds for which they will run.
// + We can set this value directly, using the `duration` attribute.
// + We can also ask the Ticker to calculate its own effective duration, taking into accout the start times and duration of its currently subscribed Tweens and Actions
// + By default a Ticker will run once, then terminate (remove itself from the `coreTickersAnimation` function). This counts as 1 cycle.
// + We can get the Ticker to run multiple times before terminating, by setting its `cycles` attribute to a positive integer Number value.
// + Setting the `cycles` attribute to `0` causes the Ticker to run continuously once started, until told to stop.
// + Note that Tickers always run forwards, never backwards. Tweens and Actions can be reversed by setting the appropriate flags on them.
//
// Tickers (unlike Animations) take part in Scrawl-canvas packet functionality; they can be saved, restored and cloned.
//
// Tickers can be controlled through a set of trigger functions: __run, halt, reverse, resume, seekTo, seekFor, complete, reset__.
// + We can add ___Ticker hook functions___ to each of these trigger functions.
//
// A Ticker can be made to dispatch a [DOM Custom Event](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) at regular intervals as it runs, by setting its `eventChoke` attribute to a Number value (representing milliseconds) greater than `0`.
// + The Custom Event is named `tickerupdate`.
// + Its `detail` object includes the following attributes: __name__ (Ticker name-String); __type__ (`Ticker`); __tick__ (milliseconds since Ticker started running); __reverseTick__ (milliseconds remaining until Ticker completes its current cycle).
// + The Event bubbles, and is cancelable.
//
// Tickers are very closely associated with Tweens.
// + Each Ticker can have more than one Tween (and 0 or more Actions) subscribed to it.
// + Tweens and Actions can be told to subscribe to a Ticker when they are created; they can change their Ticker subscription at any time.
// + ___A Tween can make its own Ticker when it is created.___


// TODO: basic packet and kill functionality tested in Demo DOM-004, but there's a lot of Ticker/Tween/Action functionality that needs to be explored and tested further:
// + If we kill a Ticker but leave associated Tweens untouched, will running those Tweens crash the script?
// + Can we successfully clone a Tween whose Ticker has been killed?
// + A Ticker can have more than one subscribed Tween/Action; can (should?) Tweens/Actions be able to subscribe to more than one Ticker? _Initial thoughts: no - if such functionality required, clone the Tween/Action_
// + Can Tickers be nested? How could we use nested Tickers? _Initial thoughts: yes to nesting, possibly use an Action on one ticker to run/halt a second Ticker; one use case may be to break up a complex animation into smaller, more discrete parts? But this all begs the question: if we halt a nested Ticker (via user interaction), how would we cascade that through to parent/sibling Tickers?_
// + Possible additional demo - tie a more complex Ticker/Tween/Action sequence to a graphical timeline - see blog post [Adding some canvas love to Hexo](https://blog.rikworks.co.uk/2018/05/26/Adding-some-canvas-love-to-Hexo/).
// + Would be a Big Win if we can tether Ticker/Tween/Actions to progress while a video plays - opens up the world of ___interactive video___.


// #### Demos:
// + All Tween and Action-related Demos necessarily include Tickers
// + [Canvas-005](../../demo/canvas-005.html) - Cell-locked, and Entity-locked, gradients; animating gradients by delta, and by tween
// + [Canvas-006](../../demo/canvas-006.html) - Canvas tween stress test
// + [DOM-004](../../demo/dom-004.html) - Limitless rockets (clone and destroy elements, tweens, tickers)
// + [DOM-005](../../demo/dom-005.html) - DOM tween stress test
// + [DOM-006](../../demo/dom-006.html) - Tween actions on a DOM element; tracking tween and ticker activity (analytics)
// + [Snippets-001](../../demo/snippets-001.html) - Scrawl-canvas DOM element snippets


// #### Imports
import { animation, animationtickers, constructors, tween } from '../core/library.js';

import { convertTime, doCreate, isa_obj, mergeOver, pushUnique, removeItem, xt, xtGet, Ωempty } from '../core/utilities.js';

import { makeAnimation } from './animation.js';

import { releaseArray, requestArray } from './array-pool.js';

import baseMix from '../mixin/base.js';

import { _floor, _isArray, _now, _seal, ANIMATIONTICKERS, FUNCTION, PC, T_RENDER_ANIMATION, T_TICKER, T_TWEEN, TICKERUPDATE } from '../core/shared-vars.js';


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
    this.lastEvent = 0;

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
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
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

// __eventChoke__ - positive Number representing the time to elapse before the Ticker creates and emits another event. A value of `0` stops the Ticker emitting events as it runs.
    eventChoke: 0,

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
P.kill = function () {

    if (this.active) this.halt();

    removeItem(tickerAnimations, this.name);
    tickerAnimationsFlag = true;

    this.deregister();

    return true;
};

// `killTweens` - remove a Ticker's subscribed Tweens from Scrawl-canvas system.
// + If the function is invoked with a truthy argument, the Ticker will also be removed from the system.
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


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters;

// __subscribers__ - see also the `subscribe` and `unsubscribe` functions below
// + getter returns a copy of the `subscribers` Array, containing Tween and Action object name-Strings.
// + setter accepts a Tween or Action name-String, or an Array of such Strings. Will replace the existing `subscribers` Array with this new data.
G.subscribers = function () {

    return [].concat(this.subscribers);
};
S.subscribers = function (item) {

    this.subscribers = [];
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

                if (target.type == T_TWEEN) target.calculateEffectiveDuration();
            }
        }
    }
};


// #### Subscription management

// `subscribe` - accepts a Tween or Action name-String, or an Array of such Strings.
P.subscribe = function (items) {

    const myItems = requestArray();
    if (_isArray(items)) myItems.push(...items);
    else myItems.push(items);

    let i, iz, item, name;

    for (i = 0, iz = myItems.length; i < iz; i++) {

        item = myItems[i];

        if(item != null){

            if (item.substring) name = item;
            else name = (isa_obj(item) && item.name) ? item.name : false;

            if (name) pushUnique(this.subscribers, name);
        }
    }

    if (myItems.length) {

        this.sortSubscribers();
        this.recalculateEffectiveDuration();
    }
    releaseArray(myItems);
    return this;
};

// `unsubscribe` - accepts a Tween or Action name-String, or an Array of such Strings.
P.unsubscribe = function (items) {

    const myItems = requestArray();
    if (_isArray(items)) myItems.push(...items);
    else myItems.push(items);

    let i, iz, item, name;

    for (i = 0, iz = myItems.length; i < iz; i++) {

        item = items[i];

        if (item.substring) name = item;
        else name = (isa_obj(item) && item.name) ? item.name : false;

        if (name) removeItem(this.subscribers, name);
    }

    if (myItems.length) {

        this.sortSubscribers();
        this.recalculateEffectiveDuration();
    }
    releaseArray(myItems);
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

        let i, iz, obj, eTime;

        for (i = 0; i < len; i++) {

            obj = subs[i];

            eTime = _floor(obj.effectiveTime) || 0;

            if (!buckets[eTime]) buckets[eTime] = requestArray();

            buckets[eTime].push(obj);
        }

        subs.length = 0;

        for (i = 0, iz = buckets.length; i < iz; i++) {

            obj = buckets[i];

            if (obj) {

                subs.push(...obj);
                releaseArray(obj);
            }
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

// #### Events

// `makeTickerUpdateEvent` - internal function - generates a new CustomEvent object.
P.makeTickerUpdateEvent = function() {

    return new CustomEvent(TICKERUPDATE, {
        detail: {
            name: this.name,
            type: T_TICKER,
            tick: this.tick,
            reverseTick: this.effectiveDuration - this.tick
        },
        bubbles: true,
        cancelable: true
    });
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
        if (temp[0] == PC) {

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

            if (anim && anim.type == T_RENDER_ANIMATION) {

                observer = this.observer = anim;
            }
            else return true;
        }
        if (observer.type == T_RENDER_ANIMATION) {

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
        effectiveDuration = this.effectiveDuration,
        eventChoke = this.eventChoke;

    let i, iz, subs, eTime, now, e,
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

            // Dispatch the Ticker Event, if required.
            if (eventChoke) {

                eTime = this.lastEvent + eventChoke;
                now = _now();

                if (eTime < now) {

                    e = this.makeTickerUpdateEvent();
                    window.dispatchEvent(e);
                    this.lastEvent = now;
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

        if (typeof this.onRun == FUNCTION) this.onRun();
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

    if (typeof this.onReset == FUNCTION) this.onReset();

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

    if (typeof this.onComplete == FUNCTION) this.onComplete();

    return this;
};

// `reverse` - simulates a reversal in the Ticker's animation.
// + Halt the Ticker, if it is running.
// + Trigger the object's `onReverse` function.
// + after recalculation, resume the Ticker - if required.
// + Function accepts a Boolean argument - if true, Ticker will start playing "in reverse".
// + Directionality is determined by Tween/Action object attribute settings, not the Ticker.
P.reverse = function (resume = false) {

    resume = xtGet(resume, false);

    if (this.active) {
        this.halt();
    }

    const timePlayed = this.currentTime - this.startTime;
    this.startTime = this.currentTime - (this.effectiveDuration - timePlayed);
    this.changeSubscriberDirection();
    this.active = true;

    this.fn();
    this.active = false;

    if (typeof this.onReverse == FUNCTION) this.onReverse();

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

    if (typeof this.onHalt == FUNCTION) this.onHalt();

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

        if (typeof this.onResume == FUNCTION) this.onResume();

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
P.seekTo = function (milliseconds, resume = false) {

    let backwards = false;

    milliseconds = xtGet(milliseconds, 0);

    if (this.active) this.halt();

    if (this.cycles && this.cycleCount >= this.cycles) this.cycleCount = this.cycles - 1;

    if (milliseconds < this.tick) backwards = true;

    this.currentTime = _now();
    this.startTime = this.currentTime - milliseconds;
    this.active = true;

    this.fn(backwards);
    this.active = false;

    if (typeof this.onSeekTo == FUNCTION) this.onSeekTo();

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
P.seekFor = function (milliseconds, resume = false) {

    let backwards = false;

    milliseconds = xtGet(milliseconds, 0);

    if (this.active) this.halt();

    if (this.cycles && this.cycleCount >= this.cycles) this.cycleCount = this.cycles - 1;

    this.startTime -= milliseconds;

    if (milliseconds < 0) backwards = true;

    this.active = true;

    this.fn(backwards);
    this.active = false;

    if (typeof this.onSeekFor == FUNCTION) this.onSeekFor();

    if (resume) this.resume();

    return this;
};


// #### Ticker animation controller
const tickerAnimations = [];
let tickerAnimationsFlag = true;

// `coreTickersAnimation`
makeAnimation({

    name: 'coreTickersAnimation',
    order: 0,
    fn: function () {

        // We only sort active Ticker objects when absolutely necessary.
        // + Sorted using a bucket sort algorithm.
        let arr, obj, order, i, iz, name;

        if (tickerAnimationsFlag) {

            tickerAnimationsFlag = false;

            const buckets = requestArray();

            for (i = 0, iz = tickerAnimations.length; i < iz; i++) {

                obj = tickerAnimations[i];

                if (obj) {

                    order = _floor(obj.order) || 0;

                    if (!buckets[order]) buckets[order] = requestArray();

                    buckets[order].push(obj);
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

        resultObjectPool.push(_seal({
            tick: 0,
            reverseTick: 0,
            willLoop: false,
            next: false
        }));
    }

    return resultObjectPool.shift();
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
