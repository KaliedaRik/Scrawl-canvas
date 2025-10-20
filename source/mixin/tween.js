// # Tween mixin
// This mixin defines attributes and functions shared by [Tween](../factory/tween.html) objects and [Action](../factory/action.html) objects
// + [Ticker](../factory/ticker.html) objects do not use this mixin


// #### Imports
import * as library from '../core/library.js';

import { animationtickers } from '../core/library.js';

import { convertTime, isa_fn, isa_obj, mergeOver, xt, xtGet, λnull, Ωempty } from '../helper/utilities.js';

import { releaseArray, requestArray } from '../helper/array-pool.js';

// Shared constants
import { FUNCTION, PC, T_TICKER, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const TARGET_SECTIONS = ['artefact', 'group', 'animation', 'animationtickers', 'world', 'tween', 'styles', 'filter'];


// Helper function
const locateTarget = (item) => {

    if(item && item.substring) {

        let result;

        return (TARGET_SECTIONS.some(section => {

            result = library[section][item];
            return result;

        })) ? result : false;
    }
    return false;
};


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __order__ - integer Number (defaults to `1`) - the order in which Tween/Actions run is determined by their order value: Tween/Actions with a lower order value run before those with a higher value
// + Run order for Tween/Actions with the same order value is determined by the order in which they are defined in code
        order: 1,

// __ticker__ - String - the name-String of the Ticker the Tween/Action uses for its timeline
        ticker: ZERO_STR,

// __targets__ - Array containing the Scrawl-canvas objects on which the Tween/Action will act; one Tween/Action can modify attributes in multiple objects
        targets: null,

// __time__ - the timeline time when the Tween/Action activates and runs.
// + Tween/Actions given a time value of `0` will run as soon as their associated Ticker timeline runs; values greater than 0 will delay their run until that time is reached on the timeline.
// + Time can be set as a Number value representing milliseconds
// + It can also be set as a time string - `3s` is 3000 milliseconds; `200ms` is 200 milliseconds
// + Or it can be set as a percentage String - `30%` - measured against the duration of the Ticker timeline.
        time: 0,

// __action__ - a user-defined function which will run every time the Tween/Action completes an update - generally once each Display cycle while the Tween/Action is running
        action: null,

// __reverseOnCycleEnd__ - Boolean flag; when set, the Tween/Action will reverse its direction and continue running, rather than halt.
        reverseOnCycleEnd: false,

// __reversed__ - internal Boolean flag indicating whether the Tween/Action is running in `forwards` or `backwards` mode
        reversed: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
    P.kill = function () {

        const ticker = this.ticker;

        if (ticker === `${this.name}_ticker`) {

            const t = animationtickers[ticker];

            if (t) t.kill(false);
        }
        else if (ticker) this.removeFromTicker(ticker);

        this.deregister();

        return true;
    };


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters;

// __targets__
// + the getter returns a fresh copy of the current targets Array
    G.targets = function () {

        return [...this.targets];
    };

    S.targets = function (item) {

        this.setTargets(item);
    };

// __action__
    S.action = function (item) {

        this.action = item;

        if (typeof this.action !== FUNCTION) this.action = λnull;
    };


// #### Prototype functions

// `calculateEffectiveTime`
// The ___effective time___ is the time, relative to the Tween/Action's associated Ticker timeline, when the Tween/Action will start running
    P.calculateEffectiveTime = function (item) {

        const [cType, cTime] = convertTime(xtGet(item, this.time));

        this.effectiveTime = 0;

        if (cType === PC && cTime <= 100) {

            if (this.ticker) {

                const ticker = animationtickers[this.ticker];

                if (ticker) this.effectiveTime = ticker.effectiveDuration * (cTime / 100);
            }
        }
        else this.effectiveTime = cTime;

        return this;
    };

// `addToTicker`
    P.addToTicker = function (item) {

        if (item && !item.substring && item.name && item.type === T_TICKER) item = item.name;

        if (xt(item)) {

            const oldT = this.ticker,
                newT = animationtickers[item];

            if (oldT && oldT !== item) this.removeFromTicker(oldT);

            if (xt(newT)) {

                this.ticker = item;
                newT.subscribe(this.name);
            }
        }
        return this;
    };

// `removeFromTicker`
    P.removeFromTicker = function (item) {

        if (item && !item.substring && item.name && item.type === T_TICKER) item = item.name;
        if (!item) item = this.ticker;

        if (item) {

            const tick = animationtickers[item];

            if (xt(tick)) {

                this.ticker = ZERO_STR;
                tick.unsubscribe(this.name);
            }
        }
        return this;
    };

    const populateTargetArrays = function (...args) {

        const targetnames = requestArray(),
            targets = requestArray();

        const items = args.flat(Infinity);

        items.forEach(item => {

            if (item != null) {

                // Handle bespoke functions with a set function
                if (isa_fn(item) && isa_fn(item.set)) targets.push(item);

                // Handle strings
                else if (item.substring && !targetnames.includes(item)) {

                    const result = locateTarget(item);

                    if (result) {

                        targetnames.push(item);
                        targets.push(result);
                    }
                }

                // Handle SC objects
                else if (isa_obj(item) && isa_fn(item.set) && item.name && !targetnames.includes(item.name)) {

                    targetnames.push(item.name);
                    targets.push(item);
                }
            }
        });
        releaseArray(targetnames);

        return targets;
    }

// `setTargets`
    P.setTargets = function (...args) {

        const targets = populateTargetArrays(args);

        this.targets.length = 0;
        this.targets.push(...targets);

        releaseArray(targets);
    };

// `addToTargets`
    P.addToTargets = function (...args) {

        const targets = populateTargetArrays(args);

        const currentTargets = [...this.targets];

        const currentTargetNames = currentTargets.map(t => t.name || '');

        targets.forEach(t => {

            if (!t.name) currentTargets.push(t);

            else if (!currentTargetNames.includes(t.name)) currentTargets.push(t);
        });

        this.targets.length = 0;
        this.targets.push(...currentTargets);

        releaseArray(targets);
    };

// `removeFromTargets`
    P.removeFromTargets = function (...args) {

        const targets = populateTargetArrays(args),
            currentTargets = [...this.targets],
            currentTargetNames = currentTargets.map(t => t.name || '');

        const targetsToRemove = requestArray(),
            functionsToKeep = requestArray();

        targets.forEach(t => {

            if (!t.name) functionsToKeep.push(t);
            else if (currentTargetNames.includes(t.name)) targetsToRemove.push(t.name);
        });

        this.targets.length = 0;
        this.targets.push(...functionsToKeep);
        this.targets.push(...currentTargets.filter(t => {

            if (!t.name) return false;
            return !targetsToRemove.includes(t.name);
        }));

        releaseArray(targets, targetsToRemove, functionsToKeep);
    };

// `checkForTarget`
    P.checkForTarget = function (item) {

        if (item.substring) return this.targets.some(t => t.name === item);

        if (!item.name) return false

        return this.targets.some(t => t.name === item.name);
    };

    P.run = λnull;
    P.isRunning = λnull;
    P.halt = λnull;
    P.reverse = λnull;
    P.resume = λnull;
    P.seekTo = λnull;
    P.seekFor = λnull;
}
