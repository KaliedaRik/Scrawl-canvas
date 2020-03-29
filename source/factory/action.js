// # Action factory
// Actions are (reversible) functions added to a Scrawl-canvas [Ticker](./ticker.html) timeline. They trigger as the ticker passes through the point (along the ticker's timeline):
// + if the timeline is moving forwards the __action__ function will be invoked
// + if the timeline is moving backwards the __revert__ function will be invoked

// #### Demos:
// + [DOM-006](../../demo/dom-006.html)- Tween actions on a DOM element; tracking tween and ticker activity (analytics)


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique, xt, defaultNonReturnFunction } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import tweenMix from '../mixin/tween.js';


// #### Action constructor
const Action = function (items = {}) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);
    this.set(items);

    this.calculateEffectiveTime();

    if (xt(items.ticker)) this.addToTicker(items.ticker);

    return this;
};


// #### Action prototype
let P = Action.prototype = Object.create(Object.prototype);
P.type = 'Action';
P.lib = 'tween';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [tween](../mixin/tween.html)
P = baseMix(P);
P = tweenMix(P);


// #### Action attributes
let defaultAttributes = {

// __revert__ - a function that is triggered when a tween is running in reverse direction. Should be a counterpart to the __action__ function (defined in mixin/tween.js) to reverse the actions performed by that function.
    revert: null
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['targets']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, []);
P.packetFunctions = pushUnique(P.packetFunctions, ['revert', 'action']);

P.finalizePacketOut = function (copy, items) {

    if (Array.isArray(this.targets)) copy.targets = this.targets.map(t => t.name);

    return copy;
};


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let S = P.setters;

// Argument must be a function, or a variable holding a reference to a function
S.revert = function (item) {

    this.revert = item;

    if (typeof this.revert !== 'function') this.revert = defaultNonReturnFunction;
};

// Internal attribute. Set true after the ticker moves past the instance's time value (and set false if the ticker is moving backwards)
S.triggered = function (item) {

    if (this.triggered !== item) {

        if (item) this.action();
        else this.revert();

        this.triggered = item;
    }
};


// #### Prototype functions

// Overrides the set() functionality defined in mixin/base.js
P.set = function (items = {}) {

    if (items) {

        let setters = this.setters,
            defs = this.defs,
            ticker = (xt(items.ticker)) ? this.ticker : false;

        Object.entries(items).forEach(([key, value]) => {

            if (key !== 'name') {

                let predefined = setters[key];

                if (predefined) predefined.call(this, value);
                else if (typeof defs[key] !== 'undefined') this[key] = value;
            }
        }, this);

        if (ticker) {

            this.ticker = ticker;
            this.addToTicker(items.ticker);
        }
        else if (xt(items.time)) this.calculateEffectiveTime();
    }
    return this;
};

// Ticker-related help function
P.getEndTime = function () {
    return this.effectiveTime;
};

// The __update__ function checks to see if the action (or revert) functions need to be invoked, and invokes them as-and-when required.
//
// TODO: 0% times will fire the action function when the ticker is moving both forwards and backwards, but never fires the revert function. All other %times appear to work as expected.
P.update = function (items) {

    let reversed = this.reversed,
        effectiveTime = this.effectiveTime,
        triggered = this.triggered,
        reverseOnCycleEnd = this.reverseOnCycleEnd,
        tick = items.tick,
        reverseTick = items.reverseTick,
        willLoop = items.willLoop,
        next = items.next;

    if (reversed) {

        if (reverseTick >= effectiveTime) {

            if (!triggered) {

                this.action();
                this.triggered = true;
            }
        }
        else {

            if (triggered) {

                this.revert();
                this.triggered = false;
            }
        }
    }
    else {
        if (tick >= effectiveTime) {

            if (!triggered) {

                this.action();
                this.triggered = true;
            }
        }
        else {

            if (triggered) {

                this.revert();
                this.triggered = false;
            }
        }
    }

    if (willLoop) this.triggered = !this.triggered;

    return true;
};


// #### Factory
// ```
// let myaction = scrawl.makeAction({
//
//     // Unique name (can be computer generated)
//     name: 'red',
//
//     // Scrawl-canvas ticker object, or its name String
//     ticker: tickerObject,
//
//     // Any Scrawl-canvas object that can be actioned
//     // - or that object's name String
//     // - or a (mixed) array of targets
//     targets: scrawlCanvasObject,
//
//     // String% distance from ticker start, or a similar time value
//     time: '6.25%',
//
//     // 'action' and 'revert' functions, to be applied to targets
//     action: function () { 
//         element.set({ 
//             css: { 
//                 backgroundColor: 'red', 
//             },
//         });
//     },
//
//     revert: function () {
//         element.set({ 
//             css: { 
//                 backgroundColor: 'blue', 
//             },
//         });
//     },
// });
// ```
const makeAction = function (items) {
    return new Action(items);
};

constructors.Action = Action;

// #### Exports
export {
    makeAction,
};
