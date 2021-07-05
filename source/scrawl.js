// # Scrawl-canvas
//
// #### Version 8.5.4 - 29 Jun 2021
//
// ---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ---------------------------------------------------------------------------------


// ## Initialize Scrawl-canvas
import { init } from './core/init.js';
init();


// ## Import Scrawl-canvas modules
import { 
    startCoreAnimationLoop, 
    stopCoreAnimationLoop,
} from './core/animationloop.js';


import { 
    addStack,
    getStack,
    addCanvas,
    getCanvas,
    setCurrentCanvas,
    clear,
    compile,
    show,
    render,
} from './core/document.js';

import { 
    addListener,
    removeListener,
    addNativeListener,
    removeNativeListener,
    makeAnimationObserver,
    reducedMotionActions,
    setReduceMotionAction,
    setNoPreferenceMotionAction,
    colorSchemeActions,
    setColorSchemeDarkAction,
    setColorSchemeLightAction,
} from './core/events.js';


import * as library from './core/library.js';


import { 
    makeSnippet,
} from './core/snippets.js';


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
    makeBezier,
} from './factory/bezier.js';


import { 
    makeCog,
} from './factory/cog.js';


import { 
    makeColor,
} from './factory/color.js';


import { 
    makeConicGradient,
} from './factory/conicGradient.js';


import { 
    requestCoordinate, 
    releaseCoordinate,
} from './factory/coordinate.js';


import { 
    makeCrescent,
} from './factory/crescent.js';


import { 
    makeEmitter,
} from './factory/emitter.js';


import { 
    makeFilter,
} from './factory/filter.js';


import { 
    makeForce,
} from './factory/particleForce.js';


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
    makeLine,
} from './factory/line.js';


import { 
    makeLineSpiral,
} from './factory/lineSpiral.js';


import { 
    makeLoom,
} from './factory/loom.js';


import { 
    makeMesh,
} from './factory/mesh.js';


import { 
    makeNet,
} from './factory/net.js';


import { 
    makeNoise,
    makeNoiseAsset,
} from './factory/noiseAsset.js';


import { 
    makeOval,
} from './factory/oval.js';


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
    makePolygon,
} from './factory/polygon.js';


import { 
    makePolyline,
} from './factory/polyline.js';


import { 
    makeQuadratic,
} from './factory/quadratic.js';


import { 
    requestQuaternion, 
    releaseQuaternion,
} from './factory/quaternion.js';


import { 
    makeRadialGradient,
} from './factory/radialGradient.js';


import { 
    makeRawAsset,
} from './factory/rawAsset.js';


import { 
    makeReactionDiffusionAsset,
} from './factory/rdAsset.js';


import { 
    makeRectangle,
} from './factory/rectangle.js';


import { 
    makeRender,
} from './factory/renderAnimation.js';


import { 
    makeShape,
} from './factory/shape.js';


import { 
    makeSpiral,
} from './factory/spiral.js';


import { 
    importSprite,
} from './factory/spriteAsset.js';


import { 
    makeSpring,
} from './factory/particleSpring.js';


import { 
    makeStar,
} from './factory/star.js';


import { 
    makeTetragon,
} from './factory/tetragon.js';


import { 
    makeTicker,
} from './factory/ticker.js';


import { 
    makeTracer,
} from './factory/tracer.js';


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


import { 
    makeWorld,
} from './factory/particleWorld.js';



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


    // core/document.js
    addStack,
    getStack,
    addCanvas,
    getCanvas,
    setCurrentCanvas,
    clear,
    compile,
    show,
    render,


    // core/events.js
    addListener,
    removeListener,
    addNativeListener,
    removeNativeListener,
    makeAnimationObserver,
    reducedMotionActions,
    setReduceMotionAction,
    setNoPreferenceMotionAction,
    colorSchemeActions,
    setColorSchemeDarkAction,
    setColorSchemeLightAction,


    // core/snippets.js
    makeSnippet,


    // factory/action.js
    makeAction,


    // factory/animation.js
    makeAnimation,


    // factory/bezier.js
    makeBezier,


    // factory/block.js
    makeBlock,


    // factory/cog.js
    makeCog,


    // factory/color.js
    makeColor,


    // factory/conicGradient.js
    makeConicGradient,


    // factory/coordinate.js
    requestCoordinate, 
    releaseCoordinate,


    // factory/crescent.js
    makeCrescent,


    // factory/emitter.js
    makeEmitter,


    // factory/filter.js
    makeFilter,


    // factory/particleForce.js
    makeForce,


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


    // factory/line.js
    makeLine,


    // factory/lineSpiral.js
    makeLineSpiral,


    // factory/loom.js
    makeLoom,


    // factory/mesh.js
    makeMesh,


    // factory/net.js
    makeNet,


    // factory/noiseAsset.js
    makeNoise,
    makeNoiseAsset,


    // factory/oval.js
    makeOval,


    // factory/pattern.js
    makePattern,


    // factory/phrase.js
    makePhrase,


    // factory/picture.js
    makePicture,


    // factory/polygon.js
    makePolygon,


    // factory/polyline.js
    makePolyline,


    // factory/quadratic.js
    makeQuadratic,


    // factory/quaternion.js
    requestQuaternion, 
    releaseQuaternion,


    // factory/radialGradient.js
    makeRadialGradient,


    // factory/rawAsset.js
    makeRawAsset,


    // factory/rdAsset.js
    makeReactionDiffusionAsset,


    // factory/rectangle.js
    makeRectangle,


    // factory/renderAnimation.js
    makeRender,


    // factory/shape.js
    makeShape,


    // factory/spiral.js
    makeSpiral,


    // factory/particleSpring.js
    makeSpring,


    // factory/spriteAsset.js
    importSprite,


    // factory/star.js
    makeStar,


    // factory/tetragon.js
    makeTetragon,


    // factory/ticker.js
    makeTicker,


    // factory/tracer.js
    makeTracer,


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


    // factory/particleWorld.js
    makeWorld,
};
