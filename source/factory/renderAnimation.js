// # RenderAnimation factory
// RenderAnimation objects are animations that aim to simplify coding up Display cycles. They remove the need to worry about Promises, while at the same time exposing a suite of Display cycle hooks - attributes which can accept a function to be run at various points during a Display cycle 
// + `commence` - triggers at the start of the Display cycle, before the `clear` cascade begins.
// + `afterClear` - triggers when the `clear` cascade completes, before the `compile` cascade begins.
// + `afterCompile` - triggers when the `compile` cascade completes, before the `show` cascade begins.
// + `afterShow` - triggers at the end of the Display cycle, after the `show` cascade completes.
// + `afterCreated` - triggers once, after the first Display cycle completes.
// + `error` - triggers when the Display cycle throws an error.
//
// Note that all the above functions should be normal, synchronous functions. The Animation object will run them within its main, asynchronous (Promise-based) function.
//
// The RenderAnimation object also supports the Animation object's __animation hook functions__:
// + `onRun` - triggers each time the RenderAnimation object's `run` function is invoked
// + `onHalt` - triggers each time the RenderAnimation object's `halt` function is invoked
// + `onKill` - triggers each time the RenderAnimation object's `kill` function is invoked
//
// In addition to RenderAnimation attributes, the factory's argument object can include two additional flags, which influence the make functionality:
// + __delay__ - when set to true, will prevent the animation running immediately; to start the animation, invoke its __run__ function
// + __observe__ - when set to true, will add an IntersectionObserver to the target's DOM element, which in turn assigns a disconnect function to the `RenderAnimation.observe` attribute


// #### Demos:
// + Most Demos use RenderAnimation for managing their Display cycle


// #### Imports
import { animation, artefact, constructors } from '../core/library.js';
import { clear, compile, show } from '../core/document.js';
import { makeAnimationObserver } from '../core/events.js';
import { mergeOver, pushUnique, removeItem, xt, λnull, λthis, Ωempty, isa_boolean } from '../core/utilities.js';
import { animate, resortAnimations } from '../core/animationloop.js';
import { forceUpdate } from '../core/userInteraction.js';

import baseMix from '../mixin/base.js';


// #### RenderAnimation constructor
const RenderAnimation = function (items = Ωempty) {

    let target;

    // Handle cases where no target has been defined - the animation will affect all stacks and canvases
    if (!items.target) target = {
        clear: clear,
        compile: compile,
        show: show,
        checkAccessibilityValues: λnull,
    };

    // Handle cases where we have multiple targets - each needs its own render animation
    else if (Array.isArray(items.target)) {

        let multiReturn = []

        items.target.forEach(tempTarget => {

            let tempItems = Object.assign({}, items);
            tempItems.name = `${tempItems.name}_${tempTarget.name}`;
            tempItems.target = tempTarget;
            multiReturn.push(new RenderAnimation(tempItems));
        });

        return multiReturn;
    }

    // Default case where we have a single target
    else target = (items.target.substring) ? artefact[items.target] : items.target;

    // Without a target, we can progress no further
    if (!target || !target.clear || !target.compile || !target.show) return false;

    // All should be good - proceed with animation creation
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

    // ##### The Display cycle Promise chain
    this.fn = function () {

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

    // Register in Scrawl-canvas library
    this.register();

    // The `observer` attribute
    const obs = items.observer || false;

    if (obs) {

        if (isa_boolean(obs)) this.observer = makeAnimationObserver(this, this.target);
        else this.observer = makeAnimationObserver(this, this.target, obs);
    }

    // Start the animation immediately, unless flagged otherwise
    if(!items.delay) this.run();

    return this;
};


// #### RenderAnimation prototype
let P = RenderAnimation.prototype = Object.create(Object.prototype);

P.type = 'RenderAnimation';
P.lib = 'animation';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### RenderAnimation attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

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
// + Will also accept an Array of Strings and/or obvjects
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
    removeItem(animate, this.name);
    resortAnimations();

    this.deregister();
    
    return true;
};



// #### Get, Set, deltaSet
// No additional get/set functionality required


// #### Prototype functions

// `run` - start the animation, if it is not already running
P.run = function () {

    this.onRun();
    pushUnique(animate, this.name);
    resortAnimations();

    this.target.checkAccessibilityValues();
    
    setTimeout(() => forceUpdate(), 20);
    
    return this;
};


// `isRunning` - returns Boolean true if animation is running; false otherwise
P.isRunning = function () {

    return (animate.indexOf(this.name) >= 0) ? true : false;
};


// `halt` - stop the animation, if it is already running
P.halt = function () {

    this.onHalt();
    removeItem(animate, this.name);
    resortAnimations();
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
const makeRender = function (items) {
    
    if (!items) return false;
    return new RenderAnimation(items);
};

constructors.RenderAnimation = RenderAnimation;


// #### Exports
export {
    makeRender,
};
