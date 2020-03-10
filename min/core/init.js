import { startCoreAnimationLoop } from './animationloop.js';
import { getCanvases, getStacks } from './document.js';
import { startCoreListeners, applyCoreResizeListener, applyCoreScrollListener } from './userInteraction.js';
const init = function () {
window.scrawlEnvironmentTouchSupported = ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch)) ? true : false;
window.scrawlEnvironmentOffscreenCanvasSupported = ('OffscreenCanvas' in window) ? true : false;
getStacks();
getCanvases();
startCoreAnimationLoop();
applyCoreResizeListener();
applyCoreScrollListener();
startCoreListeners();
};
export {
init,
};
