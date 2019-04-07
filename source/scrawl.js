/*
# Scrawl-canvas

### Version 8.0.0 (alpha) - 24 March 2019

---------------------------------------------------------------------------------
The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
---------------------------------------------------------------------------------
*/

/*
## Import Scrawl-canvas modules
*/

/*
### ./core/animationloop.js
*/
import { startCoreAnimationLoop, 
	stopCoreAnimationLoop } from './core/animationloop.js';

/*
### ./core/DOM.js
*/
import { getCanvases,
	getStacks,
	addCanvas,
	addStack,
	setCurrentCanvas,
	addListener,
	removeListener,
	addNativeListener,
	removeNativeListener,
	// clear,
	compile,
	show,
	render,
	setScrawlPath } from './core/DOM.js';

/*
### ./core/library.js
*/
import * as library from './core/library.js';

/*
### ./core/userInteraction.js
*/
import { currentCorePosition, 
	startCoreListeners, 
	stopCoreListeners, 
	applyCoreResizeListener, 
	applyCoreMoveListener, 
	applyCoreScrollListener } from './core/userInteraction.js';

/*
### ./core/utilities.js

Not importing any utilities - they remain private to Scrawl-canvas
*/ 


/*
### ./factory/action.js
*/
import { makeAction } from './factory/action.js';

/*
### ./factory/animation.js
*/
import { makeAnimation } from './factory/animation.js';

/*
### ./factory/block.js
*/
import { makeBlock } from './factory/block.js';

/*
### ./factory/canvas.js

Not importing 'makeCanvas' - use __addCanvas__ instead
*/ 

/*
### ./factory/cell.js

Not importing 'makeCell' - cells get generated from Canvas artefacts
*/ 

/*
### ./factory/color.js
*/
import { makeColor } from './factory/color.js';

/*
### ./factory/element.js

Not importing 'makeElement' - elements get generated from Stack artefacts
*/ 

/*
### ./factory/filter.js
*/
import { makeFilter } from './factory/filter.js';

/*
### ./factory/gradient.js
*/
import { makeGradient } from './factory/gradient.js';

/*
### ./factory/group.js
*/
import { makeGroup } from './factory/group.js';

/*
### ./factory/imageAsset.js

Not importing 'makeImageAsset' - use importImage, importDomImage, makePicture and makePattern instead
*/ 
import { importImage, importDomImage, createImageFromCell, createImageFromGroup, createImageFromEntity } from './factory/imageAsset.js';

/*
### ./factory/palette.js

Not importing 'makePalette' - palettes are private to gradient and radial gradient styles
*/ 

/*
### ./factory/picture.js
*/
import { makePicture } from './factory/picture.js';

/*
### ./factory/point.js
*/
import { makePoint } from './factory/point.js';

/*
### ./factory/quaternion.js

Not importing 'makeQuaternion' - get quaternions from the pool instead
*/ 
import { requestQuaternion, 
	releaseQuaternion } from './factory/quaternion.js';

/*
### ./factory/radialGradient.js
*/
import { makeRadialGradient } from './factory/radialGradient.js';

/*
### ./factory/spritesheet.js

Not importing 'makeSpritesheetAsset' - object is private to Scrawl-canvas
*/ 

/*
### ./factory/stack.js

Not importing 'makeStack' - use __addStack__ instead
*/ 

/*
### ./factory/state.js

Not importing 'makeState' - object is private to Scrawl-canvas
*/ 

/*
### ./factory/ticker.js
*/
import { makeTicker } from './factory/ticker.js';

/*
### ./factory/tween.js
*/
import { makeTween } from './factory/tween.js';

/*
### ./factory/userObject.js
*/
import { makeUserObject } from './factory/userObject.js';

/*
### ./factory/vector.js

Not importing 'makeVector' - get vectors from the pool instead
*/ 
import { requestVector, 
	releaseVector } from './factory/vector.js';

/*
### ./factory/videoAsset.js

Not importing 'makeVideoAsset' - object is private to Scrawl-canvas
*/ 

/*
### ./factory/wheel.js
*/
import { makeWheel } from './factory/wheel.js';


/*
### Mixin and worker files

All mixin and worker files are internal to Scrawl-canvas and don't need to be imported by this file
*/


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


/*
## Export selected functionalities that users can use in their scripts
*/
export default {
	library,

	startCoreAnimationLoop, 
	stopCoreAnimationLoop,

	currentCorePosition,

	startCoreListeners,
	stopCoreListeners,
	applyCoreResizeListener,
	applyCoreMoveListener,
	applyCoreScrollListener,

	makeAnimation,

	makeAction,
	makeTicker,
	makeTween,
	makeUserObject,

	makeColor,
	makeGradient,
	makeRadialGradient,

	makeFilter,

	makeGroup,

	makeBlock,
	makePicture,
	makePoint,
	makeWheel,

	requestQuaternion, 
	releaseQuaternion,
	requestVector, 
	releaseVector,

	addStack,
	addCanvas,
	setCurrentCanvas,

	importImage, 
	importDomImage,
	createImageFromCell, 
	createImageFromGroup, 
	createImageFromEntity,

	addListener,
	removeListener,
	addNativeListener,
	removeNativeListener,

	// clear,
	compile,
	show,
	render,

	setScrawlPath,
};
