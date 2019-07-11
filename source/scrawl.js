/*
# Scrawl-canvas

### Version 8.0.0 (alpha) - 25 June 2019

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

import { 
	startCoreAnimationLoop, 
	stopCoreAnimationLoop,
} from './core/animationloop.js';

import { 
	addStack,
	addCanvas,
	setCurrentCanvas,
	addListener,
	removeListener,
	addNativeListener,
	removeNativeListener,
	clear,
	compile,
	show,
	render,
	makeRender,
	setScrawlPath,
} from './core/document.js';

import * as library from './core/library.js';

import { 
	currentCorePosition, 
	startCoreListeners, 
	stopCoreListeners, 
	applyCoreResizeListener, 
	applyCoreMoveListener, 
	applyCoreScrollListener,
	observeAndUpdate,
	makeDragZone,
} from './core/userInteraction.js';


import { 
	makeAction,
} from './factory/action.js';


import { 
	makeAnimation,
} from './factory/animation.js';


import { 
	makeColor,
} from './factory/color.js';


import { 
	makeBlock,
} from './factory/block.js';


import { 
	requestCoordinate, 
	releaseCoordinate,
	checkCoordinate,
	coordinatePoolLength,
} from './factory/coordinate.js';


import { 
	cellPoolLength,
} from './factory/cell.js';


import { 
	makeFilter,
} from './factory/filter.js';


import { 
	makeGradient,
} from './factory/gradient.js';


import { 
	makeGroup,
} from './factory/group.js';


import { 
	makeImageAsset,
	importImage,
	importDomImage,
	createImageFromCell,
	createImageFromGroup,
	createImageFromEntity,
} from './factory/imageAsset.js';


import { 
	makePattern,
} from './factory/pattern.js';


import { 
	makePhrase,
} from './factory/phrase.js';


import { 
	makePicture,
} from './factory/picture.js';


import { 
	requestQuaternion, 
	releaseQuaternion,
	checkQuaternion,
	quaternionPoolLength,
} from './factory/quaternion.js';


import { 
	makeRadialGradient,
} from './factory/radialGradient.js';


import { 
	makeShape,
	makeLine,
	makeQuadratic,
	makeBezier,
	makeRectangle,
	makeOval,
	makeTetragon,
	makePolygon,
	makeStar,
	makeRadialShape,
	makeBoxedShape,
	makePolyline,
	makeSpiral,
} from './factory/shape.js';


import { 
	importSprite,
} from './factory/spriteAsset.js';


import { 
	makeTicker,
} from './factory/ticker.js';


import { 
	makeTween,
} from './factory/tween.js';


import { 
	makeUserObject,
} from './factory/userObject.js';


import { 
	requestVector, 
	releaseVector,
	checkVector,
	vectorPoolLength,
} from './factory/vector.js';


import { 
	makeVideoAsset,
	importDomVideo,
	importVideo,
	importMediaStream,
} from './factory/videoAsset.js';


import { 
	makeWheel,
} from './factory/wheel.js';


/*
## Initialize Scrawl-canvas
*/

import { init } from './core/init.js';
init();


/*
## Export selected functionalities that users can use in their scripts
*/
export default {

	// core/library.js
	library,


	// core/animationloop.js
	startCoreAnimationLoop, 
	stopCoreAnimationLoop,


	// core/userInteraction.js
	currentCorePosition,
	startCoreListeners,
	stopCoreListeners,
	applyCoreResizeListener,
	applyCoreMoveListener,
	applyCoreScrollListener,
	observeAndUpdate,
	makeDragZone,


	// core/document.js
	addStack,
	addCanvas,
	setCurrentCanvas,
	addListener,
	removeListener,
	addNativeListener,
	removeNativeListener,
	clear,
	compile,
	show,
	render,
	makeRender,
	setScrawlPath,


	// factory/action.js
	makeAction,


	// factory/animation.js
	makeAnimation,


	// factory/block.js
	makeBlock,


	// factory/cell.js
	cellPoolLength,


	// factory/color.js
	// colorList,
	makeColor,


	// factory/coordinate.js
	requestCoordinate, 
	releaseCoordinate,
	checkCoordinate,
	coordinatePoolLength,


	// factory/filter.js
	makeFilter,


	// factory/gradient.js
	makeGradient,


	// factory/group.js
	makeGroup,


	// factory/imageAsset.js
	makeImageAsset,
	importImage,
	importDomImage,
	createImageFromCell,
	createImageFromGroup,
	createImageFromEntity,


	// factory/pattern.js
	makePattern,


	// factory/phrase.js
	makePhrase,


	// factory/picture.js
	makePicture,


	// factory/quaternion.js
	requestQuaternion, 
	releaseQuaternion,
	checkQuaternion,
	quaternionPoolLength,


	// factory/radialGradient.js
	makeRadialGradient,


	// factory/shape.js
	makeShape,
	makeLine,
	makeQuadratic,
	makeBezier,
	makeRectangle,
	makeOval,
	makeTetragon,
	makePolygon,
	makeStar,
	makeRadialShape,
	makeBoxedShape,
	makePolyline,
	makeSpiral,


	// factory/spriteAsset.js
	importSprite,


	// factory/ticker.js
	makeTicker,


	// factory/tween.js
	makeTween,


	// factory/userObject.js
	makeUserObject,


	// factory/vector.js
	requestVector, 
	releaseVector,
	checkVector,
	vectorPoolLength,


	// factory/videoAsset.js
	makeVideoAsset,
	importDomVideo,
	importVideo,
	importMediaStream,


	// factory/wheel.js
	makeWheel,
};
