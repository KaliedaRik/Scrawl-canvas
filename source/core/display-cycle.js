// # The Display cycle
// Scrawl-canvas breaks down the Display cycle into three parts: __clear__; __compile__; and __show__. These can be triggered either as a single, combined __render__ operation, or separately as-and-when needed.
//
// The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value
//
// Each display cycle function is a normal Javascript function, invoked with no arguments and returning no status
//
// Note that Scrawl-canvas supplies a convenience function - __makeRender()__ - for automating the process of creating an animation object to handle the Display cycle


// #### Imports
import { artefact } from "./library.js";

import { getSortedRootElements } from './document-rootElements.js';


// Local constants
const CLEAR = 'clear',
    COMPILE = 'compile',
    SHOW = 'show',
    RENDER = 'render';


// Helper functions coordinate the actions required to complete a display cycle
const displayCycleHelper = function (items) {

    if (items.length) return items;
    return getSortedRootElements();
};

const displayCycleBatchProcess = function (rootWrappers, method) {

    let i, iz, name, item;

    for (i = 0, iz = rootWrappers.length; i < iz; i++) {

        name = rootWrappers[i];
        item = artefact[name];

        if (item && item[method]) item[method]();
    }
};

// ##### Clear
//
// + For canvas artefacts, clear its Cell assets' display (reset all pixels to 0, or the designated background color) ready for them to be redrawn
// + For stack artefacts - no action required

// `Exported function` (to modules and scrawl object). 
export const clear = function (...items) {

    const wrappers = displayCycleHelper(items);
    displayCycleBatchProcess(wrappers, CLEAR);
};

// ##### Compile
//
// + For both canvas and stack artefacts, perform necessary entity/element positional calculations
// + Additionally for canvas artefacts, stamp associated entitys onto the canvas's constituent cell assets

// `Exported function` (to modules and scrawl object). 
export const compile = function (...items) {

    const wrappers = displayCycleHelper(items);
    displayCycleBatchProcess(wrappers, COMPILE);
};

// ##### Show
//
// + For canvas artefacts, stamp additional 'layer' canvases onto the base canvas, then copy the base canvas onto the display canvas
// + For stack artefacts - invoke the __domShow__ function, if any of its constituent elements require DOM-related updating

// `Exported function` (to modules and scrawl object). 
export const show = function (...items) {

    const wrappers = displayCycleHelper(items);
    displayCycleBatchProcess(wrappers, SHOW);
};

// ##### Render
//
// + Orchestrate the clear, compile and show actions on each stack and canvas DOM element

// `Exported function` (to modules and scrawl object). 
export const render = function (...items) {

    const wrappers = displayCycleHelper(items);
    displayCycleBatchProcess(wrappers, RENDER);
};
