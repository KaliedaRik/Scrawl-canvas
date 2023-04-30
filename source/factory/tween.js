// # Tween factory
// A ___tween___ - _inbetween animation_ - is a small, targeted, time-limited animation where we define the start and end points (_key frames_) of the animation, and a method for calculating the intermediate values between the two (_interpolation_, using an _easing_ function).
//
// Scrawl-canvas includes a full range of functionality to implement tweening. Any Scrawl-canvas object that includes a `set` function, which accepts a `{key:value}` object as its single argument, can be tweened.
// + Tween animations are defined by creating a Tween object using the `makeTween` factory function.
// + Each Tween object includes a `targets` Array - one Tween may animate many objects.
// + Each Tween also includes a `definitions` Array which sets out the details of the animation to be performed.
// + The `definitions` Array can include multiple objects, each defining a change to a specific attribute that needs to be applied to the target objects.
// + __Any number-type attribute can be animated using a Tween__ - this includes integer and float Numbers, percentage Strings (`12.5%`) and measurement Strings (`20px`).
// + We can run multiple Tween animations at the same time; Tweens can overlap (start one tween while another is running).
// + We can dynamically halt, resume, restart and terminate Tweens in response to user interactions.
// + Tweens include `packet` functionality: they can be saved, and cloned.
//
// Scrawl-canvas separates the timing aspects of its Tweens from their definitions.
// + Tweens run against a ___timeline___ object called a [Ticker](./ticker.html).
// + When we define a Tween, we can either assign it to an existing Ticker, or get the Tween factory to create a new Ticker for it.
// + Tickers can also have [Action](./action.html) objects assigned to them, allowing us to trigger functions at specific points along the timeline.

// ##### Using other tween factories
// We don't recommend using other tween factories - such as [Greensock](https://greensock.com/) - with Scrawl-canvas objects at this time.
// + The reason is simple. All updates to Scrawl-canvas objects should be made through their dedicated `set`, `setDelta` and related functions, which take a single Javascript object as their argument.
// + When attributes are updated in this way, Scrawl-canvas makes sure various `dirty` flags get set (among other work), so the object can update itself appropriately at the most convenient time for itself.
// + Libraries like GSAP works by directly updating object attributes, which misses out the necessary work of setting the appropriate `dirty` flags - thus the object will not know that it needs to do work.
// + ___This does not mean you can't use other tween libraries in your web page___ - just be aware of the limitations of trying to use them with Scrawl-canvas objects!


// TODO: basic packet and kill functionality tested in Demo DOM-004, but there's a lot of Ticker/Tween/Action functionality that needs to be explored and tested further (see [Ticker TODO section](./ticker.html#section-2) for issues and suggested work).


// #### Demos:
// + [Canvas-005](../../demo/canvas-005.html) - Cell-locked, and Entity-locked, gradients; animating gradients by delta, and by tween
// + [Canvas-006](../../demo/canvas-006.html) - Canvas tween stress test
// + [DOM-004](../../demo/dom-004.html) - Limitless rockets (clone and destroy elements, tweens, tickers)
// + [DOM-005](../../demo/dom-005.html) - DOM tween stress test
// + [DOM-006](../../demo/dom-006.html) - Tween actions on a DOM element; tracking tween and ticker activity (analytics)
// + [Snippets-001](../../demo/snippets-001.html) - Scrawl-canvas DOM element snippets


// #### Imports
import { animationtickers, constructors } from '../core/library.js';

import { convertTime, doCreate, easeEngines, mergeOver, pushUnique, xt, xtGet, xto, λnull, Ωempty } from '../core/utilities.js';

import { makeTicker } from './ticker.js';

import baseMix from '../mixin/base.js';
import tweenMix from '../mixin/tween.js';

import { _isArray, _keys, _round, FUNCTION, LINEAR, NAME, PC, T_GROUP, T_TWEEN, TWEEN, UNDEF, ZERO_STR } from '../core/shared-vars.js';


// #### Tween constructor
const Tween = function (items = Ωempty) {

    let tn;

    this.makeName(items.name);
    this.register();

    this.set(this.defs);
    this.set(items);

    this.setDefinitionsValues();

    // `status` magic numbers: `-1` = "before"; `0` = "running"; `1` = "after".
    this.status = -1;
    this.calculateEffectiveTime();
    this.calculateEffectiveDuration();

// All Tweens require a Ticker to act as their timeline.
// + If no Ticker attribute is included in the argument object, or the Ticker cannot be located, a new Ticker will be created for this Tween.
    if (animationtickers[items.ticker]) this.addToTicker(items.ticker);
    else {

        tn = `${this.name}_ticker`;

        makeTicker({
            name: tn,
            order: this.order,
            subscribers: this.name,
            duration: this.effectiveDuration,
            eventChoke: xtGet(items.eventChoke, 0),
            cycles: xtGet(items.cycles, 1),
            killOnComplete: xtGet(items.killOnComplete, false),
            observer: items.observer,
        });

        this.ticker = tn;

        animationtickers[tn].recalculateEffectiveDuration();
    }
    return this;
};


// #### Tween prototype
const P = Tween.prototype = doCreate();
P.type = T_TWEEN;
P.lib = TWEEN;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);
tweenMix(P);


// #### Tween attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [tween mixin](../mixin/tween.html): __order__, __ticker__, __targets__, __time__, __action__, __reverseOnCycleEnd__, __reversed__.
const defaultAttributes = {

// __definitions__ - Array of objects defining the animations to be performed by the Tween. Object attributes include:
// + __attribute__ (required) - String attribute key.
// + __start__ - Number or String value for this attribute's start point.
// + __end__ - Number or String value for this attribute's end point.
// + __integer__ - Boolean flag indicating whether we should force results to be integers (default: false)
// + __engine__ - String name for the easing function ___engine___ to be used to animate this change; or an easing function supplied by the developer.
//
// Scrawl-canvas includes functionality to allow `start` and `end` values to be defined as Strings, with a measurement suffix (`%`, `px`, etc) attached to the number.
// + These values should be of a type that the target object (generally an artefact) expects to receive in its `set` function.
// + Any object with a `set` function that takes an object as its argument can be tweened.
    definitions: null,

// __duration__ - can accept a variety of values:
// + Number, representing milliseconds.
// + String time value, for example `'500ms', '0.5s'`.
// + % String value - `20%` - a relative value measured against the Ticker's ___effective duration___. For example, if the Ticker has an effective duration of 5000 (5 seconds), and the Tween wants to run for 20% of that time, the Tween's effective duration will be 1000 (1 second).
    duration: 0,

// __killOnComplete__ - Boolean flag; if set, the Tween will kill itself when it completes
    killOnComplete: false,

// The Tween object supports some __tween animation hook functions__:
// + __commenceAction__ - runs immediately before the Tween's `run` function is invoked
// + __onRun__ - triggers immediately after the Tween's `run` function is invoked
// + __onHalt__ - triggers immediately after the Tween's `halt` function is invoked
// + __onResume__ - triggers immediately after the Tween's `resume` function is invoked
// + __onReverse__ - triggers immediately after the Tween's `reverse` function is invoked
// + __onSeekTo__ - triggers immediately after the Tween's `seekTo` function is invoked
// + __onSeekFor__ - triggers immediately after the Tween's `seekFor` function is invoked
// + __completeAction__ - triggers after the Tween completes its run
    commenceAction: null,
    onRun: null,
    onHalt: null,
    onResume: null,
    onReverse: null,
    onSeekTo: null,
    onSeekFor: null,
    completeAction: null,

// __ticker__ - String name of Ticker object which this Tween will associate itself with.
// + If no Ticker is specified when building a new Tween, it will create a new Ticker object (sharing its `name` attribute) to associate with.
// + If the attributes below are included in the argument object, they will be passed on to the new Ticker.
// + This attribute is kept in the Tween object, but is excluded from the Tween prototype's `defs` object.

// The following [Ticker](./ticker.html)-related attributes are not stored in the Tween object:
// + __cycles__ - positive integer Number representing the number of cycles the Ticker will undertake before it completes.
// + __eventChoke__ Number representing minimum number of milliseconds between Ticker event emissions
// + __observer__ - String name of a RenderAnimation object, or the object itself - halt/resume the ticker based on the running state of the animation object
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['definitions', 'targets']);
P.packetFunctions = pushUnique(P.packetFunctions, ['commenceAction', 'completeAction', 'onRun', 'onHalt', 'onResume', 'onReverse', 'onSeekTo', 'onSeekFor', 'action']);

P.finalizePacketOut = function (copy) {

    if (_isArray(this.targets)) copy.targets = this.targets.map(t => t.name);

    if (_isArray(this.definitions)) {

        copy.definitions = this.definitions.map(d => {

            const res = {};
            res.attribute = d.attribute;
            res.start = d.start;
            res.end = d.end;

            if (d.engine && d.engine.substring) res.engine = d.engine.substring;
            else {

                if (xt(d.engine) && d.engine !== null) {

                    const e = this.stringifyFunction(d.engine);

                    if (e) {

                        res.engine = e;
                        res.engineIsFunction = true;
                    }
                }
            }
            return res;
        });
    }
    return copy;
};


// #### Clone management
// When cloning a ticker, we can use an additional attribute in the clone function's argument object:
// + __useNewTicker__ - Boolean flag - when set, the clone will also create its own Ticker object
P.postCloneAction = function(clone, items) {

    if (items.useNewTicker) {

        const ticker = animationtickers[this.ticker];

        if (xt(items.cycles)) clone.cycles = items.cycles;
        else if (ticker) clone.cycles = ticker.cycles;
        else clone.cycles = 1;

        const cloneTicker = animationtickers[clone.ticker];
        cloneTicker.cycles = clone.cycles;

        if (xt(items.duration)) {

            clone.duration = items.duration;
            clone.calculateEffectiveDuration();

            if (cloneTicker) cloneTicker.recalculateEffectiveDuration();
        }
    }

    if (_isArray(clone.definitions)) {

        clone.definitions.forEach((def, index) => {

            if (def.engineIsFunction) def.engine = this.definitions[index].engine;
        });
    }

    return clone;
};


// #### Kill management
// No additional kill functionality required
// + Tweens have the ability to auto-destruct when they complete their run, if their `killOnComplete` flag has been set to `true`.


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters;

// __definitions__
G.definitions = function() {

    return [].concat(this.definitions);
};

S.definitions = function (item) {

    this.definitions = [].concat(item);
    this.setDefinitionsValues();
};

// __commenceAction__
S.commenceAction = function (item) {

    this.commenceAction = item;

    if (typeof this.commenceAction != FUNCTION) this.commenceAction = λnull;
};

// __completeAction__
S.completeAction = function (item) {

    this.completeAction = item;

    if (typeof this.completeAction != FUNCTION) this.completeAction = λnull;
};

// `set` - we perform some additional functionality in the Tween `set` function
// + updating the Tween's Ticker object happens here
// + recalculating effectiveDuration happens here if the __time__ or __duration__ values change
P.set = function (items = Ωempty) {

    const setters = this.setters,
        keys = _keys(items),
        d = this.defs,
        ticker = (xt(items.ticker)) ? this.ticker : false;

    let key, i, iz, s;

    for (i = 0, iz = keys.length; i < iz; i++) {

        key = keys[i];

        if (key != NAME) {

            s = setters[key];

            if (s) s.call(this, items[key]);
            else if (typeof d[key] != UNDEF) this[key] = items[key];
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


// #### Animation

// `getEndTime` - Ticker-related help function
P.getEndTime = function () {

    return this.effectiveTime + this.effectiveDuration;
};

// `calculateEffectiveDuration`
P.calculateEffectiveDuration = function (item) {

    const tweenDuration = xtGet(item, this.duration),
        calculatedDur = convertTime(tweenDuration),
        cDur = calculatedDur[1],
        cType = calculatedDur[0],
        ticker = this.ticker;

    let myticker,
        tickerDuration = 0;

    this.effectiveDuration = 0;

    if (cType == PC) {

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

// `update` - ___main animation function___, invoked by the Ticker that this Tween subscribes to; runs once per RequestAnimationFrame while the Ticker is running.
// + `items` argument is a Ticker ResultObject - Ticker handles all the request and release functionality for this pool object. Treat the `items` object as ___read-only___.
// + `status` magic numbers: `-1` = "before"; `0` = "running"; `1` = "after".
P.update = function (items = Ωempty) {

    const tick = items.tick || 0,
        revTick = items.reverseTick || 0,
        effectiveTime = this.effectiveTime,
        effectiveDuration = this.effectiveDuration,
        reversed = this.reversed;

    let starts, ends,
        status = 0;

    // Should we do work for this Tween?
    if (!reversed) {

        starts = effectiveTime;
        ends = effectiveTime + effectiveDuration;

        if (tick < starts) status = -1;
        else if (tick > ends) status = 1;
    }
    else {

        starts = effectiveTime + effectiveDuration;
        ends = effectiveTime;

        if (revTick > starts) status = 1;
        else if (revTick < ends) status = -1;
    }

    // For Tweens with a duration > 0
    if (effectiveDuration) {

        if (!status || status != this.status) {

            this.status = status;
            this.doSimpleUpdate(items);

            if (!items.next) this.status = (reversed) ? -1 : 1;
        }
    }
    // For Tweens with a duration == 0
    else {

        if (status != this.status) {

            this.status = status;
            this.doSimpleUpdate(items);

            if (!items.next) this.status = (reversed) ? -1 : 1;
        }
    }

    if (items.willLoop) {

        if (this.reverseOnCycleEnd) this.reversed = !reversed;
        else this.status = -1;
    }
};

// `doSimpleUpdate` - internal function called by `update` function.
P.doSimpleUpdate = function (items = Ωempty) {

    // We create handles to a bunch of attributes so that we only need to look them up once each time the function runs
    const starts = this.effectiveTime,
        actions = this.engineActions,
        effectiveDuration = this.effectiveDuration,
        status = this.status,
        definitions = this.definitions,
        targets = this.targets,
        action = this.action,

        // We store the `setObj` object as an attribute on the Tween object for convenience, and to cut down on the number of objects created during the lifetime of the Tween.
        setObj = this.setObj || {};

    let def, engine, val, effectiveStart, effectiveChange, int, suffix, attribute,
        i, iz, j, jz, progress,
        effectiveTick;

    effectiveTick = (this.reversed) ? items.reverseTick - starts : items.tick - starts;

    if (effectiveDuration && !status) progress = effectiveTick / effectiveDuration;
    else progress = (status > 0) ? 1 : 0;

    for (i = 0, iz = definitions.length; i < iz; i++) {

        def = definitions[i];
        engine = def.engine;
        effectiveStart = def.effectiveStart;
        effectiveChange = def.effectiveChange;
        int = def.integer;
        suffix = def.suffix;
        attribute = def.attribute;

        // Invoke the appropriate easing function for this particular definition object
        if (engine.substring) val = actions(engine, effectiveStart, effectiveChange, progress);
        else val = engine(effectiveStart, effectiveChange, progress);

        if (int) val = _round(val);

        if (suffix) val += suffix;

        setObj[attribute] = val;
    }

    for (j = 0, jz = targets.length; j < jz; j++) {

        const t = targets[j];

        if (T_GROUP == t.type) t.setArtefacts(setObj);
        else t.set(setObj);
    }

    this.setObj = setObj;

    // We call the `action` attribute function (if it is defined) at the completion of every update.
    if (action) action();
};

// `engineActions` - internal function to run built-in easing engines
// + __engine__ - String name of the required easing. All built-in easing engines are defined in the `core/utilities` file
// + __start__ - the `effectiveStart` value, in milliseconds.
// + __change__ - the time in milliseconds that this animation will take (`effectiveEnd - effectiveStart`).
// + __position__ - the time elapsed since this Tween started running
//
// Scrawl-canvas easing engines use the following metaphor to define their names:
// + `out` indicates an acceleration. Think of a train leaving the station.
// + `in` indicates a deceleration. Think of a train arriving the station.
// + For the legacy engines, igher numbers indicates a more intense change between starting, middle and ending speeds
P.engineActions = function(engine, start, change, position) {

    const e = (null != easeEngines[engine]) ? engine : LINEAR;
    return start + (change * easeEngines[e](position));
};

// `setDefinitionsValues` - convert `start` and `end` values into float Numbers.
// + Scrawl-canvas includes functionality to allow `start` and `end` values to be defined as Strings, with a measurement suffix (`%`, `px`, etc) attached to the number
P.setDefinitionsValues = function () {

    const parseDefinitionsValue = this.parseDefinitionsValue,
        definitions = this.definitions;

    let i, iz, temp, def;

    for (i = 0, iz = definitions.length; i < iz; i++) {

        def = definitions[i];

        if (def) {

            temp = parseDefinitionsValue(def.start);
            def.effectiveStart = temp[1];
            def.suffix = temp[0];
            temp = parseDefinitionsValue(def.end);
            def.effectiveEnd = temp[1];

            // The default easing function is `linear`
            if (!xt(def.engine)) def.engine = LINEAR;

            def.effectiveChange = def.effectiveEnd - def.effectiveStart;
        }
    }
    return this;
};

// `parseDefinitionsValue` - internal function invoked by `setDefinitionsValues` function.
P.parseDefinitionsValue = function (item) {

    const result = [ZERO_STR, 0];

    if (xt(item)) {

        if (item.toFixed) result[1] = item;
        else if (item.substring) {

            const a = item.match(/^-?\d+\.?\d*(\D*)/);

            if (xt(a[0])) result[1] = parseFloat(a);
            if (xt(a[1])) result[0] = a[1];
        }
    }
    return result;
};


// #### Animation control

// `run`
// + Start the Tween from its starting values.
// + Trigger the object's `onRun` function.
P.run = function () {

    const t = animationtickers[this.ticker];

    if (t) {

        this.commenceAction();
        t.run();

        if (typeof this.onRun == FUNCTION) this.onRun();
    }
    return this;
};

// `isRunning` - check to see if Tween is in a running state.
P.isRunning = function () {

    const tick = animationtickers[this.ticker];

    if (tick) return tick.isRunning();
    return false;
};

// `halt`
// + Stop the Tween at its current point in time
// + Trigger the object's `onHalt` function.
P.halt = function() {

    const t = animationtickers[this.ticker];

    if (t) {

        t.halt();

        if (typeof this.onHalt == FUNCTION) this.onHalt();
    }
    return this;
};

// `reverse`
// + Halt the Tween, if it is running.
// + Trigger the object's `onReverse` function.
P.reverse = function() {

    const t = animationtickers[this.ticker];

    if (t) {

        t.reverse();

        if (typeof this.onReverse == FUNCTION) this.onReverse();
    }
    return this;
};

// `resume`
// + Start the Tween from its current point in time
// + Trigger the object's `onResume` function.
P.resume = function() {

    const t = animationtickers[this.ticker];

    if (t) {

        t.resume();

        if (typeof this.onResume == FUNCTION) this.onResume();
    }
    return this;
};

// `seekTo`
// + Argument - Number representing the millisecond time to move to on the Tween's Ticker's timeline
// + Trigger the object's `onSeekTo` function.
P.seekTo = function(milliseconds) {

    const t = animationtickers[this.ticker];

    if (t) {

        t.seekTo(milliseconds);

        if (typeof this.onSeekTo == FUNCTION) this.onSeekTo();
    }
    return this;
};

// `seekFor`
// + Argument - Number representing the number of milliseconds to move along the Tween's Ticker's timeline (forwards or backwards)
// + Trigger the object's `onSeekFor` function.
P.seekFor = function(milliseconds) {

    const t = animationtickers[this.ticker];

    if (t) {

        t.seekFor(milliseconds);

        if (typeof this.onSeekFor == FUNCTION) this.onSeekFor();
    }
    return this;
};


// #### Factory
// ```
// scrawl.makeTween({
//
//     name: 'my-tween',
//
//     duration: 2500,
//
//     targets: scrawl.artefact['my-phrase'],
//
//     definitions: [
//         {
//             attribute: 'textPathPosition',
//             start: 1,
//             end: 0,
//             engine: 'easeIn'
//         },
//         {
//             attribute: 'globalAlpha',
//             start: 0,
//             end: 1,
//             engine: 'easeIn'
//         },
//         {
//             attribute: 'scale',
//             start: 0.4,
//             end: 1,
//             engine: 'easeIn'
//         },
//     ]
// });
// ```
export const makeTween = function (items) {

    if (!items) return false;
    return new Tween(items);
};

constructors.Tween = Tween;
