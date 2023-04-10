// # Core initialization
// A single, `exported function` (to modules). This needs to run once after the scrawl.js module (or equivalent) loads


// #### Imports
import { startCoreAnimationLoop } from './animation-loop.js';
import { getCanvases } from '../factory/canvas.js';
import { getStacks } from '../factory/stack.js';

import { startCoreListeners, applyCoreResizeListener, applyCoreScrollListener } from './user-interaction.js';


export const init = function () {

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
