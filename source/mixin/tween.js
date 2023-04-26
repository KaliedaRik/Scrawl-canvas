// # Tween mixin
// This mixin defines attributes and functions shared by [Tween](../factory/tween.html) objects and [Action](../factory/action.html) objects
// + [Ticker](../factory/ticker.html) objects do not use this mixin


// #### Imports
import * as library from '../core/library.js';

import { animationtickers } from '../core/library.js';

import { convertTime, isa_fn, isa_obj, mergeOver, xt, xtGet, λnull, Ωempty } from '../core/utilities.js';

import { releaseArray, requestArray } from '../factory/array-pool.js';

import { FUNCTION, PC, TARGET_SECTIONS, UNKNOWN, UNNAMED, ZERO_STR } from '../core/shared-vars.js';


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
// + Time can be set as a Number value representing microseconds
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

        if (ticker == `${this.name}_ticker`) {

            const t = animationtickers[ticker];
            
            if (t) t.kill();
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

        return [].concat(this.targets);
    };

    S.targets = function (item = []) {

        this.setTargets(item);
    };

// __action__
    S.action = function (item) {

        this.action = item;
        
        if (typeof this.action != FUNCTION) this.action = λnull;
    };


// #### Prototype functions

// `calculateEffectiveTime`
// The ___effective time___ is the time, relative to the Tween/Action's associated Ticker timeline, when the Tween/Action will start running
    P.calculateEffectiveTime = function (item) {

        const [cType, cTime] = convertTime(xtGet(item, this.time));

        this.effectiveTime = 0;

        if (cType == PC && cTime <= 100) {

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

        if (xt(item)) {

            const oldT = this.ticker,
                newT = animationtickers[item];

            if (oldT && oldT != item) this.removeFromTicker(oldT);

            if (xt(newT)) {

                this.ticker = item;
                newT.subscribe(this.name);
                this.calculateEffectiveTime();
            }
        }
        return this;
    };

// `removeFromTicker`
    P.removeFromTicker = function (item) {

        item = (xt(item)) ? item : this.ticker;

        if (item) {

            const tick = animationtickers[item];

            if (xt(tick)) {

                this.ticker = ZERO_STR;
                tick.unsubscribe(this.name);
            }
        }
        return this;
    };

// `setTargets`
    P.setTargets = function (items) {

        items = [].concat(items);

        const newTargets = requestArray();

        items.forEach(item => {

            if (isa_fn(item)) {

                if (isa_fn(item.set)) newTargets.push(item);
            }
            else if (isa_obj(item) && xt(item.name)) newTargets.push(item);
            else {

                const result = locateTarget(item);

                if (result) newTargets.push(result);
            }
        });

        if (!this.targets) this.targets = [];
        this.targets.length = 0;
        this.targets.push(...newTargets);
        releaseArray(newTargets);

        return this;
    };

// `addToTargets`
    P.addToTargets = function (items) {

        items = [].concat(items);

        let result;

        items.forEach(item => {

            if (typeof item == FUNCTION) {

                if (typeof item.set == FUNCTION) this.targets.push(item);
            }
            else {

                result = locateTarget(item);

                if (result) this.targets.push(result);
            }
        }, this);

        return this;
    };

// `removeFromTargets`
    P.removeFromTargets = function (items) {

        items = [].concat(items);

        const identifiers = requestArray(),
            newTargets = [].concat(this.targets);

        newTargets.forEach(target => {

            let type = target.type || UNKNOWN,
                name = target.name || UNNAMED;

            if (type != UNKNOWN && name != UNNAMED) identifiers.push(`${type}_${name}`);
        });

        items.forEach(item => {

            let myObj;
            
            if (typeof item == FUNCTION) myObj = item;
            else myObj = locateTarget(item);

            if (myObj) {

                let type = myObj.type || UNKNOWN,
                    name = myObj.name || UNNAMED;

                if (type != UNKNOWN && name != UNNAMED) {

                    let objName = `${type}_${name}`,
                        doRemove = identifiers.indexOf(objName);

                    if (doRemove >= 0) newTargets[doRemove] = false;
                }
            }
        });

        if (!this.targets) this.targets = [];
        const t = this.targets;
        t.length = 0;

        newTargets.forEach(target => {

            if (target) t.push(target);
        }, this);

        return this;
    };

// `checkForTarget`
    P.checkForTarget = function (item) {

        if (!item.substring) return false;

        return this.targets.some(t => t.name == item);
    };

    P.run = λnull;
    P.isRunning = λnull;
    P.halt = λnull;
    P.reverse = λnull;
    P.resume = λnull;
    P.seekTo = λnull;
    P.seekFor = λnull;
}
