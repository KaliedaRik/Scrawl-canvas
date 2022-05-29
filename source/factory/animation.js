// # Animation factory
// Animations lie at the heart of Scrawl-canvas functionality. While static [Canvas](./canvas.html) and [Stack](./stack.html) displays can be rendered once and then forgotten, any Canvas or Stack that implements any form of user interaction, or movement in the display, needs to implement an Animation object to make that functionality happen.
//
// There are a number of ways to create an Animation object:
// + `scrawl.makeAnimation` - as coded by this factory - will supply a very basic Animation object. The factory requires that we supply it with a Promise-based `fn` function which will be added to the core Scrawl-canvas animation loop.
//
// Because creating an Animation object from this factory can be quite fiddly, Scrawl-canvas supplies some additional convenience factories to make the process easier: 
// + `scrawl.makeRender` - use this function to create an animation object which will __control the Display cycle for a canvas or stack__. The function allows users to add a number of hook functions that will trigger at various points in the Display cycle, alongside functions that will trigger whenever the animation object starts running, stops running, or errors.
// + `scrawl.makeTween` and `scrawl.makeTicker` - both of these factory functions use animation objects under the hood
// + `scrawl.makeSnippet` - used in snippet files, the factory function will automatically add an animation object to the snippet, alongside much of the functionality supplied by `makeRender`. It will also create an `IntersectionObserver` on the window object that will automatically run/stop the animation object dependant on its canvas element's position in the browser/device viewport.
//
// Animation objects can be controlled through some simple functions: `run` to start the animation running; `halt` to stop it; and `kill` to remove it from the system.
// 
// NOTE that Animation objects do not take part in Scrawl-canvas's `packet` save-and-load functionality, as a result of which they cannot be cloned.


// #### Demos:
// + All the demos run some form of animation - mostly created via `scrawl.makeRender` - see the [RenderAnimation factory](./renderAnimation.html) for details
// + [DOM-001](../../demo/dom-001.html) - Loading the scrawl-canvas library using a script tag in the HTML code
// + [DOM-010](../../demo/dom-010.html) - Add and remove (kill) Scrawl-canvas stack elements programmatically


// #### Imports
import { animation, constructors } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xt, λnull, λpromise, λthis, Ωempty } from '../core/utilities.js';
import { forceUpdate } from '../core/userInteraction.js';
import { animate, resortAnimations } from '../core/animationloop.js';

import baseMix from '../mixin/base.js';


// #### Animation constructor
const Animation = function (items = Ωempty) {

    this.makeName(items.name);
    this.order = (xt(items.order)) ? items.order : this.defs.order;
    this.fn = items.fn || λpromise;
    this.onRun = items.onRun || λnull;
    this.onHalt = items.onHalt || λnull;
    this.onKill = items.onKill || λnull;

    this.register();

    if(!items.delay) this.run();

    return this;
};


// #### Animation prototype
let P = Animation.prototype = Object.create(Object.prototype);

P.type = 'Animation';
P.lib = 'animation';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Animation attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

// __order__ - positive integer Number - determines the order in which each Animation object will be actioned before the Display cycle starts. 
// + Higher order Animations will be processed after lower order Animations. 
// + Animations with the same `order` value will be processed in the order in which they were defined in code.
    order: 1,

// __fn__ - the main function that the Animation object will run on each RequestAnimationFrame tick. This function __must return a Promise__.
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
P.clone = λthis;


// #### Kill management
// Kill functionality is managed as one of the Animation object's hook functions - see below


// #### Get, Set, deltaSet
// No additional getter or setter functionality required


// #### Prototype functions

// `run` - start the animation, if it is not already running
P.run = function () {

    this.onRun();
    pushUnique(animate, this.name);
    resortAnimations();

    setTimeout(() => forceUpdate(), 20);
    
    return this;
};


// `isRunning` - returns true if animation is running; false otherwise
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


// `kill` - stop the animation if it is already running, and remove it from the Scrawl-canvas library
P.kill = function () {

    this.onKill();
    removeItem(animate, this.name);
    resortAnimations();

    this.deregister();
    
    return true;
};


// #### Factory
// ```
// scrawl.makeAnimation({
//
//     name: 'demo-animation',
//
//     // Function MUST return a Promise object, and that promise must ALWAYS resolve (not reject)
//     fn: function () {
//
//         return new Promise((resolve) => {
//
//             // Renders all stack and canvas elements in the document
//             scrawl.render()
//             .then(() => resolve(true))
//             .catch(err => resolve(false));
//         });
//     }
// });
// ```
const makeAnimation = function (items) {
    
    if (!items) return false;
    return new Animation(items);
};

constructors.Animation = Animation;


// #### Exports
export {
    makeAnimation,
};
