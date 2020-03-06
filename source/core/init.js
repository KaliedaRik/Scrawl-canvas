/*
# Core initialization - this needs to run once after the scrawl.js file (or equivalent) loads

*/

import { startCoreAnimationLoop } from './animationloop.js';
import { getCanvases, getStacks } from './document.js';
import { startCoreListeners, applyCoreResizeListener, applyCoreScrollListener } from './userInteraction.js';


const init = function () {

/*
## Perform some environment checks - lodge the results in the window object so other parts of the Scrawl-canvas code base can quickly check them
*/

/*
Flag to indicate if Scrawl-canvas is running in a touch-enabled environment
*/
	window.scrawlEnvironmentTouchSupported = ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) ? true : false;

/*
Flag to indicate if Scrawl-canvas can use OffscreenCanvas interface
*/
	window.scrawlEnvironmentOffscreenCanvasSupported = ('OffscreenCanvas' in window) ? true : false;


/*
## Initialize Scrawl-canvas on the page
*/

/*
Discovery phase - collect all canvas elements present in the DOM, and any other elements with a 'data-stack' attribute
*/
	getStacks();
	getCanvases();

/*
Start the core animation loop
*/ 
	startCoreAnimationLoop();

/*
Start the core listeners on the window object
*/
	applyCoreResizeListener();
	applyCoreScrollListener();
	startCoreListeners();
};


/*
TODO - documentation
*/
export {
	init,
};
