// # The Animation Loop
//
// Scrawl-canvas runs a single, centralized requestAnimationFrame (RAF) function - __animationLoop__ - for all animation objects. 
//
// Animation objects are Scrawl-canvas objects with a __fn__ attribute - a function which returns a Promise; all Animation objects contained in the __animate__ array will be invoked as part of a Promise.all action. Once the Promise.all resolves, _animationLoop_ is invoked again.
//
// The RAF function is first invoked as part of Scrawl-canvas initialization when it loads into a web page, and continues to run while the __doAnimation__ flag remains true.
//
// To stop the RAF:
//
//     scrawl.stopCoreAnimationLoop()
//
// To restart the RAF after it has been stopped:
//
//     scrawl.startCoreAnimationLoop()
//
// ... Functionality tested in [Demo DOM-009](../../demo/dom-009.html)
//
// As part of initialization, two animation objects are created and added to the __animate__ array:
// + __coreTickersAnimation__ (order: 0) - which will invoke all ticker animations currently subscribed to it - [factory/ticker.js](../factory/ticker.html)
// + __coreListenersTracker__ (order: 0) - which channels window-based events (mouse/touch movement, viewport resize, scrolling) to Scrawl-canvas objects that need to take action in response (thus choking such actions to a maximum 60-per-second) - [core/userInteraction.js](./userInteraction.html)
//
// Additional animations can be created via a number of 'make' functions:
// + makeAnimation (runs by default) - [factory/animation.js](../factory/animation.html)
// + makeRender (runs by default) - [factory/renderAnimation.js](../factory/renderAnimation.html)
// + makeTicker (halted by default) - [factory/ticker.js](../factory/ticker.html)
// + makeTween (halted by default) - [factory/tween.js](../factory/tween.html)
//
// These objects can be added to the _animate_ Array by invoking their __run__ function, and removed by invoking their __halt__ function.
//
// The order in which animations objects run during each RAF cycle (= __Display cycle__) can be (partly) determined by the objects' __order__ attribute: those with a lower order value will be invoked before those with a higher value.
//
// Note that ticker/tween animations will all run before other animations (order differences between tickers/tween objects will be respected).


// #### Functionality

// Imports
import { animation } from "./library.js";

// Local variables 
let doAnimation = false,
    resortBatchAnimations = true,
    animate_sorted = [];

// `Exported array` (to modules). The __animate__ array, which holds handles to all animation objects due to be run at the next RAF invocation, is exported to other modules so code can add/remove animation objects as required.
let animate = [];

// `Exported function` (to modules). Force the animation objects to be sorted at the start of the next RAF invocation
const resortAnimations = function () {
    resortBatchAnimations = true;
};

// Scrawl-canvas animation sorter uses a 'bucket sort' algorithm
const sortAnimations = function () {

    if (resortBatchAnimations) {

        resortBatchAnimations = false;

        let floor = Math.floor,
            buckets = [];

        animate.forEach(name => {

            let obj = animation[name];

            if (obj) {

                let order = floor(obj.order) || 0;

                if (!buckets[order]) buckets[order] = [];

                buckets[order].push(obj);
            }
        });

        animate_sorted = buckets.reduce((a, v) => a.concat(v), []);
    }
};

// The __requestAnimationFrame__ function
const animationLoop = function () {

    let promises = [];

    if (resortBatchAnimations) sortAnimations();

    animate_sorted.forEach((item) => {

        if (item.fn) promises.push(item.fn());
    });

    Promise.all(promises)
    .then(() => {

        if (doAnimation) window.requestAnimationFrame(() => animationLoop());
    })
    .catch((err) => console.log('animationLoop error: ', err.message));
};

// `Exported function` (modules and scrawl object). Start the RAF function running
const startCoreAnimationLoop = function () {

    doAnimation = true;
    animationLoop();
};

// `Exported function` (modules and scrawl object). Halt the RAF function
const stopCoreAnimationLoop = function () {
    
    doAnimation = false;
};

export {
    animate,
    resortAnimations,
    startCoreAnimationLoop,
    stopCoreAnimationLoop,
};
