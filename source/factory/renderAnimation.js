
// # RenderAnimation factory

// RenderAnimation objects are animations that aim to simplify coding up Display cycles. They remove the need to worry about promises, while at the same time exposing a suite of Display cycle hooks - attributes which can accept a function to be run at various points during a Display cycle 

// + __afterCreated__ - a run-only-once function which will trigger after the first display/animation cycle completes
// + __commence__ - runs at the start of the display cycle, before the 'clear' action
// + __afterClear__ - runs between the display cycle 'clear' and 'compile' actions
// + __afterCompile__ - runs between the display cycle 'compile' and 'show' actions
// + __afterShow__ - runs at the end of each display cycle, after the 'show' action

// + __error__ - an error function can be used to report issues should the internalized promise chain break down for any particular reason

// Note that all the above functions should be normal, synchronous functions. The Animation object will run them within its main, asynchronous (Promise-based) function.

// The RenderAnimation object also supports the Animation object's __animation hook functions__:

// + __onRun__ - triggers each time the RenderAnimation object's .run function is invoked
// + __onHalt__ - triggers each time the RenderAnimation object's .halt function is invoked
// + __onKill__ - triggers each time the RenderAnimation object's .kill function is invoked

// #### Instantiate objects from the factory

//    // Function to display frames-per-second data, and other information relevant to the demo
//    let report = function () {
//
//        let testTicker = Date.now(),
//            testTime, testNow,
//            testMessage = document.querySelector('#reportmessage');
//
//        return function () {
//
//            testNow = Date.now();
//            testTime = testNow - testTicker;
//            testTicker = testNow;
//
//            testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms;
//        };
//    }();
//
//
//    // Create the Animation loop which will run the Display cycle
//    scrawl.makeRender({
//
//        name: 'demo-animation',
//        target: scrawl.library.canvas['my-canvas-id'],
//        afterShow: report,
//    });

// In addition to RenderAnimation attributes, the argument object can include two additional flags, which influence the make functionality:

// + __delay__ - when set to true, will prevent the animation running immediately; to start the animation, invoke its __run__ function
// + __observe__ - when set to true, will add an IntersectionObserver to the target's DOM element using the core/document.js __makeAnimationObserver__ function, which in turn assigns a disconnect function to the RenderAnimation.observe attribute

// #### Library storage: YES

// + scrawl.library.animation

// #### Clone functionality: NO

// Clone functionality is disabled for all animation objects, and packet functionality is severely curtailed.

// The same render animation can be applied to multiple targets as part of the factory's makeRender function, by setting the target attribute to an array containing either the name-String of each target, or the target object itself (Canvas, Stack), or a mix of both.

// #### Kill functionality: 

// TODO: review and update kill functionality through the entire Scrawl-canvas system


// ## Imports
import { animation, artefact, constructors } from '../core/library.js';
import { clear, compile, show, makeAnimationObserver } from '../core/document.js';
import { mergeOver, pushUnique, removeItem, xt, isa_obj, isa_fn, 
    defaultNonReturnFunction, defaultPromiseReturnFunction, defaultThisReturnFunction } from '../core/utilities.js';
import { animate, resortAnimations } from '../core/animationloop.js';

import baseMix from '../mixin/base.js';


// ## RenderAnimation constructor
const RenderAnimation = function (items = {}) {

    let target;

    // Handle cases where no target has been defined - the animation will affect all stacks and canvases
    if (!items.target) target = {
        clear: clear,
        compile: compile,
        show: show
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

    this.onRun = items.onRun || defaultNonReturnFunction;
    this.onHalt = items.onHalt || defaultNonReturnFunction;
    this.onKill = items.onKill || defaultNonReturnFunction;

    // These attributes are specific to RenderAnimation
    this.target = target;

    this.commence = items.commence || defaultNonReturnFunction;
    this.afterClear = items.afterClear || defaultNonReturnFunction;
    this.afterCompile = items.afterCompile || defaultNonReturnFunction;
    this.afterShow = items.afterShow || defaultNonReturnFunction;
    this.afterCreated = items.afterCreated || defaultNonReturnFunction;
    this.error = items.error || defaultNonReturnFunction;

    this.readyToInitialize = true;

    let self = this;

    // The all-important fn function
    this.fn = function () {

        return new Promise((resolve, reject) => {

            Promise.resolve(self.commence())
            .then(() => self.target.clear())
            .then(() => Promise.resolve(self.afterClear()))
            .then(() => self.target.compile())
            .then(() => Promise.resolve(self.afterCompile()))
            .then(() => self.target.show())
            .then(() => Promise.resolve(self.afterShow()))
            .then(() => {

                if (self.readyToInitialize) {

                    self.afterCreated();
                    self.readyToInitialize = false;
                }

                resolve(true);
            })
            .catch(err => {

                self.error(err);
                reject(err);
            });
        });

    }

    // Register in Scrawl-canvas library
    this.register();

    if (items.observer) this.observer = makeAnimationObserver(this, this.target);

    if(!items.delay) this.run();

    return this;
};


// ## RenderAnimation object prototype setup
let P = RenderAnimation.prototype = Object.create(Object.prototype);

P.type = 'RenderAnimation';
P.lib = 'animation';
P.isArtefact = false;
P.isAsset = false;


// Apply mixins to prototype object
P = baseMix(P);


// ## Define default attributes
let defaultAttributes = {

// Determines the order in which each animation object will be actioned during the Display cycle. Higher order animations will be processed after lower order animations
    order: 1,

// The animation object supports some __animation hook functions__:

// + onRun - triggers each time the animation object's .run function is invoked
// + onHalt - triggers each time the animation object's .halt function is invoked
// + onKill - triggers each time the animation object's .kill function is invoked
    onRun: null,
    onHalt: null,
    onKill: null,

// Display cycle hooks
    commence: null,
    afterClear: null,
    afterCompile: null,
    afterShow: null,
    afterCreated: null,
    error: null,

// Target
    target: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// ## Packet/Clone management
// This functionality is disabled for RenderAnimation objects
P.stringifyFunction = defaultNonReturnFunction;
P.processPacketOut = defaultNonReturnFunction;
P.finalizePacketOut = defaultNonReturnFunction;
P.saveAsPacket = () => `[${this.name}, ${this.type}, ${this.lib}, {}]`;
P.clone = defaultThisReturnFunction;


// ## Define prototype functions

// Start the animation, if it is not already running
P.run = function () {

    this.onRun();
    pushUnique(animate, this.name);
    resortAnimations();
    return this;
};


// Returns true if animation is running; false otherwise
P.isRunning = function () {

    return (animate.indexOf(this.name) >= 0) ? true : false;
};


// Stop the animation, if it is already running
P.halt = function () {

    this.onHalt();
    removeItem(animate, this.name);
    resortAnimations();
    return this;
};


// Stop the animation if it is already running, and remove it from the Scrawl-canvas library
P.kill = function () {

    this.onKill();
    removeItem(animate, this.name);
    resortAnimations();

    this.deregister();
    
    return true;
};


// ## Exported factory function
const makeRender = function (items) {
    
    return new RenderAnimation(items);
};

constructors.RenderAnimation = RenderAnimation;

export {
    makeRender,
};
