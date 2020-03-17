// # Core initialization
//
// A single, `exported function` (to modules). This needs to run once after the scrawl.js module (or equivalent) loads


// Imports
import { startCoreAnimationLoop } from './animationloop.js';
import { getCanvases, getStacks } from './document.js';
import { startCoreListeners, applyCoreResizeListener, applyCoreScrollListener } from './userInteraction.js';


const init = function () {

	// #### Environment checks

	// Flags to indicate if Scrawl-canvas is running in a touch-enabled environment. We lodge the results in the window object so other parts of the Scrawl-canvas code base can quickly check them

	// Flag to indicate whether the device is touch-enabled
    window.scrawlEnvironmentTouchSupported = ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) ? true : false;

	// Flag to indicate if Scrawl-canvas can use OffscreenCanvas interface
    window.scrawlEnvironmentOffscreenCanvasSupported = ('OffscreenCanvas' in window) ? true : false;


	// #### Initialization

	// Discovery phase - collect all canvas elements present in the DOM, and any other elements with a 'data-stack' attribute
    getStacks();
    getCanvases();

	// Start the core animation loop
    startCoreAnimationLoop();

	// Start the core listeners on the window object
    applyCoreResizeListener();
    applyCoreScrollListener();
    startCoreListeners();
};

export {
    init,
};
