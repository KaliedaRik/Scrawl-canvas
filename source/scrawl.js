
// # Scrawl-canvas

// #### Version 8.0.2 (alpha) - 10 March 2020

// ---------------------------------------------------------------------------------
// The MIT License (MIT)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ---------------------------------------------------------------------------------



// ## Import Scrawl-canvas modules
import { 
    startCoreAnimationLoop, 
    stopCoreAnimationLoop,
} from './core/animationloop.js';


import { 
    makeComponent,
} from './core/component.js';


import { 
    addStack,
    addCanvas,
    getCanvas,
    setCurrentCanvas,
    addListener,
    removeListener,
    addNativeListener,
    removeNativeListener,
    clear,
    compile,
    show,
    render,
    makeAnimationObserver,
} from './core/document.js';

import * as library from './core/library.js';

import { 
    currentCorePosition, 
    startCoreListeners, 
    stopCoreListeners, 
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
    makeBlock,
} from './factory/block.js';


import { 
    makeColor,
} from './factory/color.js';


import { 
    requestCoordinate, 
    releaseCoordinate,
} from './factory/coordinate.js';


import { 
    makeFilter,
} from './factory/filter.js';


import { 
    makeGradient,
} from './factory/gradient.js';


import { 
    makeGrid,
} from './factory/grid.js';


import { 
    makeGroup,
} from './factory/group.js';


import { 
    importImage,
    importDomImage,
    createImageFromCell,
    createImageFromGroup,
    createImageFromEntity,
} from './factory/imageAsset.js';


import { 
    makeLoom,
} from './factory/loom.js';


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
} from './factory/quaternion.js';


import { 
    makeRadialGradient,
} from './factory/radialGradient.js';


import { 
    makeRender,
} from './factory/renderAnimation.js';


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
    requestVector, 
    releaseVector,
} from './factory/vector.js';


import { 
    importDomVideo,
    importVideo,
    importMediaStream,
} from './factory/videoAsset.js';


import { 
    makeWheel,
} from './factory/wheel.js';



// ## Initialize Scrawl-canvas
import { init } from './core/init.js';
init();



// ## Export selected functionalities that users can use in their scripts
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
    observeAndUpdate,
    makeDragZone,


    // core/component.js
    makeComponent,


    // core/document.js
    addStack,
    addCanvas,
    getCanvas,
    setCurrentCanvas,
    addListener,
    removeListener,
    addNativeListener,
    removeNativeListener,
    clear,
    compile,
    show,
    render,
    makeAnimationObserver,


    // factory/action.js
    makeAction,


    // factory/animation.js
    makeAnimation,


    // factory/block.js
    makeBlock,


    // factory/color.js
    makeColor,


    // factory/coordinate.js
    requestCoordinate, 
    releaseCoordinate,


    // factory/filter.js
    makeFilter,


    // factory/gradient.js
    makeGradient,


    // factory/grid.js
    makeGrid,


    // factory/group.js
    makeGroup,


    // factory/imageAsset.js
    importImage,
    importDomImage,
    createImageFromCell,
    createImageFromGroup,
    createImageFromEntity,


    // factory/loom.js
    makeLoom,


    // factory/pattern.js
    makePattern,


    // factory/phrase.js
    makePhrase,


    // factory/picture.js
    makePicture,


    // factory/quaternion.js
    requestQuaternion, 
    releaseQuaternion,


    // factory/radialGradient.js
    makeRadialGradient,


    // factory/renderAnimation.js
    makeRender,


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


    // factory/vector.js
    requestVector, 
    releaseVector,


    // factory/videoAsset.js
    importDomVideo,
    importVideo,
    importMediaStream,


    // factory/wheel.js
    makeWheel,
};
