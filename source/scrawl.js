// # Scrawl-canvas
//
// #### Version 8.9.0 - 16 Jun 2022
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
import { init as _init } from './core/init.js';
export const init = _init;

if (typeof window !== 'undefined') _init();

// ## Export Scrawl-canvas module functions
export { 
    startCoreAnimationLoop, 
    stopCoreAnimationLoop,
} from './core/animationloop.js';
export { 
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
export { 
    addListener,
    removeListener,
    addNativeListener,
    removeNativeListener,
    makeAnimationObserver,
    getPixelRatio,
    setPixelRatioChangeAction,
    getIgnorePixelRatio,
    setIgnorePixelRatio,
} from './core/events.js';
export * as library from './core/library.js';
export { seededRandomNumberGenerator } from './core/random-seed.js';
export { makeSnippet } from './core/snippets.js';
export { 
    currentCorePosition, 
    startCoreListeners, 
    stopCoreListeners, 
    observeAndUpdate,
    forceUpdate,
    makeDragZone,
    getTouchActionChoke,
    setTouchActionChoke,
} from './core/userInteraction.js';
export { makeAction } from './factory/action.js';
export { makeAnimation } from './factory/animation.js';
export { makeBlock } from './factory/block.js';
export { makeBezier } from './factory/bezier.js';
export { makeCog } from './factory/cog.js';
export { makeColor } from './factory/color.js';
export { makeConicGradient } from './factory/conicGradient.js';
export { 
    requestCoordinate,
    releaseCoordinate,
} from './factory/coordinate.js';
export { makeCrescent } from './factory/crescent.js';
export { makeEmitter } from './factory/emitter.js';
export { makeFilter } from './factory/filter.js';
export { setFilterMemoizationChoke } from './factory/filterEngine.js';
export { makeForce } from './factory/particleForce.js';
export { makeGradient } from './factory/gradient.js';
export { makeGrid } from './factory/grid.js';
export { makeGroup } from './factory/group.js';
export { 
    importImage,
    importDomImage,
    createImageFromCell,
    createImageFromGroup,
    createImageFromEntity,
} from './factory/imageAsset.js';
export { makeLine } from './factory/line.js';
export { makeLineSpiral } from './factory/lineSpiral.js';
export { makeLoom } from './factory/loom.js';
export { makeMesh } from './factory/mesh.js';
export { makeNet } from './factory/net.js';
export { 
    makeNoise,
    makeNoiseAsset,
} from './factory/noiseAsset.js';
export { makeOval } from './factory/oval.js';
export { makePattern } from './factory/pattern.js';
export { makePhrase } from './factory/phrase.js';
export { makePicture } from './factory/picture.js';
export { makePolygon } from './factory/polygon.js';
export { makePolyline } from './factory/polyline.js';
export { makeQuadratic } from './factory/quadratic.js';
export { 
    requestQuaternion,
    releaseQuaternion,
} from './factory/quaternion.js';
export { makeRadialGradient } from './factory/radialGradient.js';
export { makeRawAsset } from './factory/rawAsset.js';
export { makeReactionDiffusionAsset } from './factory/rdAsset.js';
export { makeRectangle } from './factory/rectangle.js';
export { makeRender } from './factory/renderAnimation.js';
export { makeShape } from './factory/shape.js';
export { makeSpiral } from './factory/spiral.js';
export { importSprite } from './factory/spriteAsset.js';
export { makeSpring } from './factory/particleSpring.js';
export { makeStar } from './factory/star.js';
export { makeTetragon } from './factory/tetragon.js';
export { makeTicker } from './factory/ticker.js';
export { makeTracer } from './factory/tracer.js';
export { makeTween } from './factory/tween.js';
export { 
    requestVector, 
    releaseVector,
} from './factory/vector.js';
export { 
    importDomVideo,
    importVideo,
    importMediaStream,
} from './factory/videoAsset.js';
export { makeWheel } from './factory/wheel.js';
export { makeWorld } from './factory/particleWorld.js';
