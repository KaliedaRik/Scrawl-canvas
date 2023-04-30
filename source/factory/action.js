// # Action factory
// Actions are (reversible) functions added to a Scrawl-canvas [Ticker](./ticker.html) timeline. They trigger as the ticker passes through the point (along the ticker's timeline):
// + if the timeline is moving forwards the __action__ function will be invoked
// + if the timeline is moving backwards the __revert__ function will be invoked


// TODO: basic packet and kill functionality tested in Demo DOM-004, but there's a lot of Ticker/Tween/Action functionality that needs to be explored and tested further (see [Ticker TODO section](./ticker.html#section-2) for issues and suggested work).


// #### Demos:
// + [DOM-006](../../demo/dom-006.html)- Tween actions on a DOM element; tracking tween and ticker activity (analytics)


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, pushUnique, xt, λnull, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import tweenMix from '../mixin/tween.js';

import { _isArray, _keys, FUNCTION, NAME, T_ACTION, TWEEN, UNDEF } from '../core/shared-vars.js';


// #### Action constructor
const Action = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);

    this.action = λnull;
    this.revert = λnull;

    this.set(items);

    this.calculateEffectiveTime();

    if (xt(items.ticker)) this.addToTicker(items.ticker);

    return this;
};


// #### Action prototype
const P = Action.prototype = doCreate();
P.type = T_ACTION;
P.lib = TWEEN;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);
tweenMix(P);


// #### Action attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [tween mixin](../mixin/tween.html): __order__, __ticker__, __targets__, __time__, __action__, __reverseOnCycleEnd__, __reversed__.
const defaultAttributes = {

// __revert__ - a function that is triggered when a tween is running in reverse direction. Should be a counterpart to the __action__ function (defined in mixin/tween.js) to reverse the actions performed by that function.
    revert: null
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['targets']);
P.packetFunctions = pushUnique(P.packetFunctions, ['revert', 'action']);

P.finalizePacketOut = function (copy) {

    if (_isArray(this.targets)) copy.targets = this.targets.map(t => t.name);

    return copy;
};


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const S = P.setters;

// Argument must be a function, or a variable holding a reference to a function
S.revert = function (item) {

    this.revert = item;

    if (typeof this.revert != FUNCTION) this.revert = λnull;
};

// Internal attribute. Set true after the ticker moves past the instance's time value (and set false if the ticker is moving backwards)
S.triggered = function (item) {

    if (this.triggered !== item) {

        if (item) this.action();
        else this.revert();

        this.triggered = item;
    }
};

// `set` - we perform some additional functionality in the Action `set` function
// + updating the Action's Ticker object happens here
// + recalculating effectiveDuration happens here if the __time__ value change
P.set = function (items = Ωempty) {

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs;

        let fn, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key != NAME && value != null) {

                fn = setters[key];

                if (fn) fn.call(this, value);
                else if (typeof defs[key] != UNDEF) this[key] = value;
            }
        }

        const ticker = (xt(items.ticker)) ? this.ticker : false;

        if (ticker) {

            this.ticker = ticker;
            this.addToTicker(items.ticker);
        }
        else if (xt(items.time)) this.calculateEffectiveTime();
    }
    return this;
};


// #### Animation

// `getEndTime` - Ticker-related help function
P.getEndTime = function () {
    return this.effectiveTime;
};

// `update` - check to see if the action (or revert) functions need to be invoked, and invokes them as-and-when required.
//
// TODO: 0% times will fire the action function when the ticker is moving both forwards and backwards, but never fires the revert function. All other %times appear to work as expected.
P.update = function (items) {

    const { tick, reverseTick, willLoop } = items;
    const { reversed, effectiveTime, triggered } = this;

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
export const makeAction = function (items) {

    if (!items) return false;
    return new Action(items);
};

constructors.Action = Action;
