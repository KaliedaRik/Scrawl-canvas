// # Animation factory
// Animations lie at the heart of Scrawl-canvas functionality. While static [Canvas](./canvas.html) and [Stack](./stack.html) displays can be rendered once and then forgotten, any Canvas or Stack that implements any form of user interaction, or movement in the display, needs to implement an Animation object to make that functionality happen.
//
// NOTE that Animation objects do not take part in Scrawl-canvas's `packet` save-and-load functionality, as a result of which they cannot be cloned.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, xt, λnull, λcloneError, Ωempty } from '../helper/utilities.js';

import { forceUpdate } from '../helper/system-flags.js';

import { animateAdd, animateIncludes, animateRemove } from '../core/animation-loop.js';

import baseMix from '../mixin/base.js';

// Shared constants
import { ANIMATION } from '../helper/shared-vars.js';

// Local constants
const T_ANIMATION = 'Animation';


// #### Animation constructor
const Animation = function (items = Ωempty) {

    this.makeName(items.name);
    this.order = (xt(items.order)) ? items.order : this.defs.order;
    this.fn = items.fn || λnull;
    this.onRun = items.onRun || λnull;
    this.onHalt = items.onHalt || λnull;
    this.onKill = items.onKill || λnull;
    this.maxFrameRate = items.maxFrameRate || 60;
    this.lastRun = 0;
    this.chokedAnimation = true;

    this.register();

    if(!items.delay) this.run();

    return this;
};


// #### Animation prototype
const P = Animation.prototype = doCreate();

P.type = T_ANIMATION;
P.lib = ANIMATION;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Animation attributes
const defaultAttributes = {

// __order__ - positive integer Number - determines the order in which each Animation object will be actioned before the Display cycle starts.
// + Higher order Animations will be processed after lower order Animations.
// + Animations with the same `order` value will be processed in the order in which they were defined in code.
    order: 1,

// __maxFrameRate__ - positive integer Number. A frames-per-second choke to prevent animation running too fast.
    maxFrameRate: 60,

// __fn__ - the main function that the Animation object will run on each RequestAnimationFrame tick.
    fn: null,

// The Animation object supports some __animation hook functions__:
// + __onRun__ - triggers each time the Animation object's `run` function is invoked
// + __onHalt__ - triggers each time the Animation object's `halt` function is invoked
// + __onKill__ - triggers each time the Animation object's `kill` function is invoked
    onRun: null,
    onHalt: null,
    onKill: null,

// __delay__ - by default, Animation objects will start running as soon as they are created. To prevent this happening the constructor argument can take a non-retained `delay` Boolean flag which, when set to true, will prevent the Animation object from adding itself to the Scrawl-canvas animation loop. The animation can be started at any subsequent time by invoking its `run` function.
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// This functionality is disabled for Animation objects
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};


// #### Clone management
// This functionality is disabled for Animation objects
P.clone = λcloneError;


// #### Kill management
// Kill functionality is managed as one of the Animation object's hook functions - see below


// #### Get, Set, deltaSet
// No additional getter or setter functionality required


// #### Prototype functions

// `run` - start the animation, if it is not already running
P.run = function () {

    this.onRun();
    animateAdd(this.name);

    setTimeout(() => forceUpdate(), 20);

    return this;
};


// `isRunning` - returns true if animation is running; false otherwise
P.isRunning = function () {

    return animateIncludes(this.name);
};


// `halt` - stop the animation, if it is already running
P.halt = function () {

    this.onHalt();
    animateRemove(this.name);
    return this;
};


// `kill` - stop the animation if it is already running, and remove it from the Scrawl-canvas library
P.kill = function () {

    this.onKill();
    animateRemove(this.name);

    this.deregister();

    return true;
};


// #### Factory
// ```
// scrawl.makeAnimation({
//
//     name: 'demo-animation',
//
//     fn: () => {
//         scrawl.render();
//     },
// });
// ```
export const makeAnimation = function (items) {

    if (!items) return false;
    return new Animation(items);
};

constructors.Animation = Animation;
