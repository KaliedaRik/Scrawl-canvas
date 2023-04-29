// # RenderAnimation factory
// RenderAnimation objects are animations that aim to simplify coding up Display cycles. They remove the worry of dealing with the Scrawl-canvas __Display cycle__ while also exposing a suite of Display cycle hook functions - attributes which can accept a function to be run at various points during each Display cycle:
// + `commence` - triggers at the start of the Display cycle, before the `clear` cascade begins.
// + `afterClear` - triggers when the `clear` cascade completes, before the `compile` cascade begins.
// + `afterCompile` - triggers when the `compile` cascade completes, before the `show` cascade begins.
// + `afterShow` - triggers at the end of the Display cycle, after the `show` cascade completes.
// + `afterCreated` - triggers once, after the first Display cycle completes.
// + `error` - triggers when the Display cycle throws an error.
//
// The RenderAnimation object also supports the Animation object's __animation hook functions__:
// + `onRun` - triggers each time the RenderAnimation object's `run` function is invoked
// + `onHalt` - triggers each time the RenderAnimation object's `halt` function is invoked
// + `onKill` - triggers each time the RenderAnimation object's `kill` function is invoked
//
// In addition to RenderAnimation attributes, the factory's argument object can include three additional boolean flags, which influence the make functionality:
// + __delay__ - default: `false`. When set to true, will prevent the animation running immediately; to start the animation, invoke its __run__ function
// + __observe__ - default: `false`. When set to true, will add an IntersectionObserver to the target's DOM element, which in turn assigns a disconnect function to the `RenderAnimation.observe` attribute. The attribute can also be a Javascript object containing options to be applied to the observer (`root`, `rootMargin`, `threshold`)
// + __noTarget__ - default: `false`. the `renderAnimation` factory function expects to receive a Canvas or Stack artefact (or an array of such artefacts) in the `target` attribute of its argument object. When no target attribute is supplied, the RenderAnimation object will operate across all Canvas and Stack elements on the page. If the target is not a Canvas or Stack, then set the `noTarget` attribute to `true`.


// #### Demos:
// + Most Demos use RenderAnimation for managing their Display cycle


// #### Imports
import { artefact, constructors } from '../core/library.js';

import { clear, compile, show } from '../core/display-cycle.js';

import { makeAnimationObserver } from '../core/events.js';

import { doCreate, isa_boolean, mergeOver, xt, λnull, λthis, Ωempty } from '../core/utilities.js';

import { animateAdd, animateIncludes, animateRemove } from '../core/animation-loop.js';

import { forceUpdate } from '../core/system-flags.js';

import baseMix from '../mixin/base.js';

import { _assign, _isArray, ANIMATION, T_RENDER_ANIMATION } from '../core/shared-vars.js';


// #### RenderAnimation constructor
const RenderAnimation = function (items = Ωempty) {

    let target;

    this.noTarget = (items.noTarget != null) ? items.noTarget : false;

    // Handle cases where no target has been defined - the animation will affect all stacks and canvases
    if (!items.target && !items.noTarget) target = {
        clear: clear,
        compile: compile,
        show: show,
        checkAccessibilityValues: λnull,
    };

    // Handle cases where we have multiple targets - each needs its own render animation
    else if (_isArray(items.target)) {

        const multiReturn = [];

        items.target.forEach(tempTarget => {

            const tempItems = _assign({}, items);
            tempItems.name = `${tempItems.name}_${tempTarget.name}`;
            tempItems.target = tempTarget;
            multiReturn.push(new RenderAnimation(tempItems));
        });

        return multiReturn;
    }

    // Default case where we have a single target
    else target = (items.target && items.target.substring) ? artefact[items.target] : items.target;

    this.makeName(items.name);

    // These attributes are the same as for the Animation object
    this.order = (xt(items.order)) ? items.order : this.defs.order;

    this.onRun = items.onRun || λnull;
    this.onHalt = items.onHalt || λnull;
    this.onKill = items.onKill || λnull;

    // These attributes are specific to RenderAnimation
    this.target = target;

    this.commence = items.commence || λnull;
    this.afterClear = items.afterClear || λnull;
    this.afterCompile = items.afterCompile || λnull;
    this.afterShow = items.afterShow || λnull;
    this.afterCreated = items.afterCreated || λnull;
    this.error = items.error || λnull;

    this.readyToInitialize = true;

    // ##### The Display cycle animation function
    this.fn = function () {

        if (this.noTarget) {

            this.commence();
            this.afterClear();
            this.afterCompile();
            this.afterShow();

            if (this.readyToInitialize) {

                this.afterCreated(this);
                this.readyToInitialize = false;
            }
        }
        else if (this.isRunning()) {

            this.commence();
            this.target.clear();
            this.afterClear();
            this.target.compile();
            this.afterCompile();
            this.target.show();
            this.afterShow();

            if (this.readyToInitialize) {

                this.target.checkAccessibilityValues();

                this.afterCreated(this);
                this.readyToInitialize = false;
            }
        }
    }

    // Register in Scrawl-canvas library
    this.register();

    // The `observer` attribute
    const obs = items.observer || false;

    if (obs) {

        // Edge case: canvas/stack removed or replaced, affecting DOM. Best to queue the creation of the observer until after the DOM has settled down
        // + Fix resulted from errors noticed in demo DOM-017
        setTimeout(() => {
            if (isa_boolean(obs)) this.observer = makeAnimationObserver(this, this.target);
            else this.observer = makeAnimationObserver(this, this.target, obs);
        }, 0);
    }

    // Start the animation immediately, unless flagged otherwise
    if(!items.delay) this.run();

    return this;
};


// #### RenderAnimation prototype
const P = RenderAnimation.prototype = doCreate();
P.type = T_RENDER_ANIMATION;
P.lib = ANIMATION;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### RenderAnimation attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
const defaultAttributes = {

// __order__ - positive integer Number. Determines the order in which each animation object will be actioned during the Display cycle. Higher order animations will be processed after lower order animations.
    order: 1,

// __onRun__, __onHalt__, __onKill__
//
// The [Animation object](./animation.html) supports the following ___animation hook functions___:
// + `onRun` - triggers each time the animation object's `run` function is invoked.
// + `onHalt` - triggers each time the animation object's `halt` function is invoked.
// + `onKill` - triggers each time the animation object's `kill` function is invoked.
    onRun: null,
    onHalt: null,
    onKill: null,

// __commence__, __afterClear__, __afterCompile__, __afterShow__, __afterCreated__, __error__
//
// RenderAnimation objects support the following ___Display cycle hook functions___:
// + `commence` - triggers at the start of the Display cycle, before the `clear` cascade begins.
// + `afterClear` - triggers when the `clear` cascade completes, before the `compile` cascade begins.
// + `afterCompile` - triggers when the `compile` cascade completes, before the `show` cascade begins.
// + `afterShow` - triggers at the end of the Display cycle, after the `show` cascade completes.
// + `afterCreated` - triggers once, after the first Display cycle completes.
// + `error` - triggers when the Display cycle throws an error.
    commence: null,
    afterClear: null,
    afterCompile: null,
    afterShow: null,
    afterCreated: null,
    error: null,

// __target__ - handle to the [Stack](./stack.html) or [Cell](./cell.html) wrapper object; each can have its own Display cycle animation.
// + Can be supplied in the argument object as either a name-String for the target object, or the target object itself
// + Will also accept an Array of Strings and/or objects
// + Artefacts that are not Canvases or Stacks can be targets - in such cases the `noTarget` attribute in the factory function's argument object should be set to `true`
    target: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// Animations do not take part in the packet or clone systems; they can, however, be used for importing and actioning packets as they retain those base functions
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};


// #### Clone management
P.clone = λthis;


// #### Kill management
// Stops the animation if it is already running, and removes it from the Scrawl-canvas library
P.kill = function () {

    this.onKill();
    animateRemove(this.name);

    this.deregister();
    
    return true;
};



// #### Get, Set, deltaSet
// No additional get/set functionality required


// #### Prototype functions

// `run` - start the animation, if it is not already running
P.run = function () {

    this.onRun();
    animateAdd(this.name);

    if (this.target) this.target.checkAccessibilityValues();
    
    setTimeout(() => forceUpdate(), 20);

    return this;
};


// `start` - start the animation, if it is not already running. Will re-run the `afterCreated` hook, which is ignored by the `run()` function.
P.start = function () {

    this.readyToInitialize = true;
    return this.run();
};


// `isRunning` - returns Boolean true if animation is running; false otherwise
P.isRunning = function () {

    return animateIncludes(this.name);
};


// `halt` - stop the animation, if it is already running
P.halt = function () {

    this.onHalt();
    animateRemove(this.name);
    return this;
};


// #### Factory
// ```
// let report = function () {
//
//     let testTicker = Date.now(),
//         testTime, testNow,
//         testMessage = document.querySelector('#reportmessage');
//
//     return function () {
//
//         testNow = Date.now();
//         testTime = testNow - testTicker;
//         testTicker = testNow;
//
//         testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms`;
//     };
// }();
//
// scrawl.makeRender({
//
//     name: 'demo-animation',
//     target: scrawl.library.canvas['my-canvas-id'],
//     afterShow: report,
// });
// ```
export const makeRender = function (items) {
    
    if (!items) return false;
    return new RenderAnimation(items);
};

constructors.RenderAnimation = RenderAnimation;
