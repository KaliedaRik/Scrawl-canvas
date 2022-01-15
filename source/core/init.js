// # Core initialization
// A single, `exported function` (to modules). This needs to run once after the scrawl.js module (or equivalent) loads


// #### Imports
import { startCoreAnimationLoop } from './animationloop.js';
import { getCanvases, getStacks } from './document.js';
import { startCoreListeners, applyCoreResizeListener, applyCoreScrollListener } from './userInteraction.js';

import { makeColor } from '../factory/color.js';


const init = function () {

	// #### Environment checks

	// Flags to indicate if Scrawl-canvas is running in a touch-enabled environment. We lodge the results in the window object so other parts of the Scrawl-canvas code base can quickly check them

	// Flag to indicate whether the device is touch-enabled
    window.scrawlEnvironmentTouchSupported = ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) ? true : false;


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

	// Dedicated entity state color engine - this allows the user to set a fillStyle, strokeStyle or shadowColor attribute to any CSS color string
	// + Can't set this as part of the State factory initialization as it appears to run before the Color factory initializes
	window.scrawlEnvironmentColorChecker = makeColor({
	    name: 'entity-colorEngine-do-not-overwrite',
	});

};

// #### Exports
export {
    init,
};
