// # Scrawl-canvas
//
// #### Version 8.8.0 - 30 Jan 2022
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
    makeDragZone,
    getTouchActionChoke,
    setTouchActionChoke,
} from './core/userInteraction.js';
export { makeAction as _makeAction } from './factory/action.js';
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

/*
// ## Import/Export Scrawl-canvas module functions
import { 
    startCoreAnimationLoop as _startCoreAnimationLoop, 
    stopCoreAnimationLoop as _stopCoreAnimationLoop,
} from './core/animationloop.js';
export const startCoreAnimationLoop = _startCoreAnimationLoop;
export const stopCoreAnimationLoop = _stopCoreAnimationLoop;


import { 
    addStack as _addStack,
    getStack as _getStack,
    addCanvas as _addCanvas,
    getCanvas as _getCanvas,
    setCurrentCanvas as _setCurrentCanvas,
    clear as _clear,
    compile as _compile,
    show as _show,
    render as _render,
} from './core/document.js';
export const addStack = _addStack;
export const getStack = _getStack;
export const addCanvas = _addCanvas;
export const getCanvas = _getCanvas;
export const setCurrentCanvas = _setCurrentCanvas;
export const clear = _clear;
export const compile = _compile;
export const show = _show;
export const render = _render;


import { 
    addListener as _addListener,
    removeListener as _removeListener,
    addNativeListener as _addNativeListener,
    removeNativeListener as _removeNativeListener,
    makeAnimationObserver as _makeAnimationObserver,
    getPixelRatio as _getPixelRatio,
    setPixelRatioChangeAction as _setPixelRatioChangeAction,
    getIgnorePixelRatio as _getIgnorePixelRatio,
    setIgnorePixelRatio as _setIgnorePixelRatio,
} from './core/events.js';
export const addListener = _addListener;
export const removeListener = _removeListener;
export const addNativeListener = _addNativeListener;
export const removeNativeListener = _removeNativeListener;
export const makeAnimationObserver = _makeAnimationObserver;
export const getPixelRatio = _getPixelRatio;
export const setPixelRatioChangeAction = _setPixelRatioChangeAction;
export const getIgnorePixelRatio = _getIgnorePixelRatio;
export const setIgnorePixelRatio = _setIgnorePixelRatio;


import * as _library from './core/library.js';
export const library = _library;


import { 
    seededRandomNumberGenerator as _seededRandomNumberGenerator,
} from './core/random-seed.js';
export const seededRandomNumberGenerator = _seededRandomNumberGenerator;


import { 
    makeSnippet as _makeSnippet,
} from './core/snippets.js';
export const makeSnippet = _makeSnippet;


import { 
    currentCorePosition as _currentCorePosition, 
    startCoreListeners as _startCoreListeners, 
    stopCoreListeners as _stopCoreListeners, 
    observeAndUpdate as _observeAndUpdate,
    makeDragZone as _makeDragZone,
    getTouchActionChoke as _getTouchActionChoke,
    setTouchActionChoke as _setTouchActionChoke,
} from './core/userInteraction.js';
export const currentCorePosition = _currentCorePosition;
export const startCoreListeners = _startCoreListeners;
export const stopCoreListeners = _stopCoreListeners;
export const observeAndUpdate = _observeAndUpdate;
export const makeDragZone = _makeDragZone;
export const getTouchActionChoke = _getTouchActionChoke;
export const setTouchActionChoke = _setTouchActionChoke;


import { 
    makeAction as _makeAction,
} from './factory/action.js';
export const makeAction = _makeAction;


import { 
    makeAnimation as _makeAnimation,
} from './factory/animation.js';
export const makeAnimation = _makeAnimation;


import { 
    makeBlock as _makeBlock,
} from './factory/block.js';
export const makeBlock = _makeBlock;


import { 
    makeBezier as _makeBezier,
} from './factory/bezier.js';
export const makeBezier = _makeBezier;


import { 
    makeCog as _makeCog,
} from './factory/cog.js';
export const makeCog = _makeCog;


import { 
    makeColor as _makeColor,
} from './factory/color.js';
export const makeColor = _makeColor;


import { 
    makeConicGradient as _makeConicGradient,
} from './factory/conicGradient.js';
export const makeConicGradient = _makeConicGradient;


import { 
    requestCoordinate as _requestCoordinate, 
    releaseCoordinate as _releaseCoordinate,
} from './factory/coordinate.js';
export const requestCoordinate = _requestCoordinate; 
export const releaseCoordinate = _releaseCoordinate;


import { 
    makeCrescent as _makeCrescent,
} from './factory/crescent.js';
export const makeCrescent = _makeCrescent;


import { 
    makeEmitter as _makeEmitter,
} from './factory/emitter.js';
export const makeEmitter = _makeEmitter;


import { 
    makeFilter as _makeFilter,
} from './factory/filter.js';
export const makeFilter = _makeFilter;


import { 
    setFilterMemoizationChoke as _setFilterMemoizationChoke,
} from './factory/filterEngine.js';
export const setFilterMemoizationChoke = _setFilterMemoizationChoke;


import { 
    makeForce as _makeForce,
} from './factory/particleForce.js';
export const makeForce = _makeForce;


import { 
    makeGradient as _makeGradient,
} from './factory/gradient.js';
export const makeGradient = _makeGradient;


import { 
    makeGrid as _makeGrid,
} from './factory/grid.js';
export const makeGrid = _makeGrid;


import { 
    makeGroup as _makeGroup,
} from './factory/group.js';
export const makeGroup = _makeGroup;


import { 
    importImage as _importImage,
    importDomImage as _importDomImage,
    createImageFromCell as _createImageFromCell,
    createImageFromGroup as _createImageFromGroup,
    createImageFromEntity as _createImageFromEntity,
} from './factory/imageAsset.js';
export const importImage = _importImage;
export const importDomImage = _importDomImage;
export const createImageFromCell = _createImageFromCell;
export const createImageFromGroup = _createImageFromGroup;
export const createImageFromEntity = _createImageFromEntity;


import { 
    makeLine as _makeLine,
} from './factory/line.js';
export const makeLine = _makeLine;


import { 
    makeLineSpiral as _makeLineSpiral,
} from './factory/lineSpiral.js';
export const makeLineSpiral = _makeLineSpiral;


import { 
    makeLoom as _makeLoom,
} from './factory/loom.js';
export const makeLoom = _makeLoom;


import { 
    makeMesh as _makeMesh,
} from './factory/mesh.js';
export const makeMesh = _makeMesh;


import { 
    makeNet as _makeNet,
} from './factory/net.js';
export const makeNet = _makeNet;


import { 
    makeNoise as _makeNoise,
    makeNoiseAsset as _makeNoiseAsset,
} from './factory/noiseAsset.js';
export const makeNoise = _makeNoise;
export const makeNoiseAsset = _makeNoiseAsset;


import { 
    makeOval as _makeOval,
} from './factory/oval.js';
export const makeOval = _makeOval;


import { 
    makePattern as _makePattern,
} from './factory/pattern.js';
export const makePattern = _makePattern;


import { 
    makePhrase as _makePhrase,
} from './factory/phrase.js';
export const makePhrase = _makePhrase;


import { 
    makePicture as _makePicture,
} from './factory/picture.js';
export const makePicture = _makePicture;


import { 
    makePolygon as _makePolygon,
} from './factory/polygon.js';
export const makePolygon = _makePolygon;


import { 
    makePolyline as _makePolyline,
} from './factory/polyline.js';
export const makePolyline = _makePolyline;


import { 
    makeQuadratic as _makeQuadratic,
} from './factory/quadratic.js';
export const makeQuadratic = _makeQuadratic;


import { 
    requestQuaternion as _requestQuaternion,
    releaseQuaternion as _releaseQuaternion,
} from './factory/quaternion.js';
export const requestQuaternion = _requestQuaternion;
export const releaseQuaternion = _releaseQuaternion;


import { 
    makeRadialGradient as _makeRadialGradient,
} from './factory/radialGradient.js';
export const makeRadialGradient = _makeRadialGradient;


import { 
    makeRawAsset as _makeRawAsset,
} from './factory/rawAsset.js';
export const makeRawAsset = _makeRawAsset;


import { 
    makeReactionDiffusionAsset as _makeReactionDiffusionAsset,
} from './factory/rdAsset.js';
export const makeReactionDiffusionAsset = _makeReactionDiffusionAsset;


import { 
    makeRectangle as _makeRectangle,
} from './factory/rectangle.js';
export const makeRectangle = _makeRectangle;


import { 
    makeRender as _makeRender,
} from './factory/renderAnimation.js';
export const makeRender = _makeRender;


import { 
    makeShape as _makeShape,
} from './factory/shape.js';
export const makeShape = _makeShape;


import { 
    makeSpiral as _makeSpiral,
} from './factory/spiral.js';
export const makeSpiral = _makeSpiral;


import { 
    importSprite as _importSprite,
} from './factory/spriteAsset.js';
export const importSprite = _importSprite;


import { 
    makeSpring as _makeSpring,
} from './factory/particleSpring.js';
export const makeSpring = _makeSpring;


import { 
    makeStar as _makeStar,
} from './factory/star.js';
export const makeStar = _makeStar;


import { 
    makeTetragon as _makeTetragon,
} from './factory/tetragon.js';
export const makeTetragon = _makeTetragon;


import { 
    makeTicker as _makeTicker,
} from './factory/ticker.js';
export const makeTicker = _makeTicker;


import { 
    makeTracer as _makeTracer,
} from './factory/tracer.js';
export const makeTracer = _makeTracer;


import { 
    makeTween as _makeTween,
} from './factory/tween.js';
export const makeTween = _makeTween;


import { 
    requestVector as _requestVector, 
    releaseVector as _releaseVector,
} from './factory/vector.js';
export const requestVector = _requestVector; 
export const releaseVector = _releaseVector;


import { 
    importDomVideo as _importDomVideo,
    importVideo as _importVideo,
    importMediaStream as _importMediaStream,
} from './factory/videoAsset.js';
export const importDomVideo = _importDomVideo;
export const importVideo = _importVideo;
export const importMediaStream = _importMediaStream;


import { 
    makeWheel as _makeWheel,
} from './factory/wheel.js';
export const makeWheel = _makeWheel;


import { 
    makeWorld as _makeWorld,
} from './factory/particleWorld.js';
export const makeWorld = _makeWorld;



// ## Export selected functionalities that users can use in their scripts
export default {
    addCanvas: _addCanvas,
    addListener: _addListener,
    addNativeListener: _addNativeListener,
    addStack: _addStack,
    clear: _clear,
    compile: _compile,
    createImageFromCell: _createImageFromCell,
    createImageFromEntity: _createImageFromEntity,
    createImageFromGroup: _createImageFromGroup,
    currentCorePosition: _currentCorePosition,
    getCanvas: _getCanvas,
    getIgnorePixelRatio: _getIgnorePixelRatio,
    getPixelRatio: _getPixelRatio,
    getStack: _getStack,
    getTouchActionChoke: _getTouchActionChoke,
    importDomImage: _importDomImage,
    importDomVideo: _importDomVideo,
    importImage: _importImage,
    importMediaStream: _importMediaStream,
    importSprite: _importSprite,
    importVideo: _importVideo,
    init: _init,
    library: _library,
    makeAction: _makeAction,
    makeAnimation: _makeAnimation,
    makeAnimationObserver: _makeAnimationObserver,
    makeBezier: _makeBezier,
    makeBlock: _makeBlock,
    makeCog: _makeCog,
    makeColor: _makeColor,
    makeConicGradient: _makeConicGradient,
    makeCrescent: _makeCrescent,
    makeDragZone: _makeDragZone,
    makeEmitter: _makeEmitter,
    makeFilter: _makeFilter,
    makeForce: _makeForce,
    makeGradient: _makeGradient,
    makeGrid: _makeGrid,
    makeGroup: _makeGroup,
    makeLine: _makeLine,
    makeLineSpiral: _makeLineSpiral,
    makeLoom: _makeLoom,
    makeMesh: _makeMesh,
    makeNet: _makeNet,
    makeNoise: _makeNoise,
    makeNoiseAsset: _makeNoiseAsset,
    makeOval: _makeOval,
    makePattern: _makePattern,
    makePhrase: _makePhrase,
    makePicture: _makePicture,
    makePolygon: _makePolygon,
    makePolyline: _makePolyline,
    makeQuadratic: _makeQuadratic,
    makeRadialGradient: _makeRadialGradient,
    makeRawAsset: _makeRawAsset,
    makeReactionDiffusionAsset: _makeReactionDiffusionAsset,
    makeRectangle: _makeRectangle,
    makeRender: _makeRender,
    makeShape: _makeShape,
    makeSnippet: _makeSnippet,
    makeSpiral: _makeSpiral,
    makeSpring: _makeSpring,
    makeStar: _makeStar,
    makeTetragon: _makeTetragon,
    makeTicker: _makeTicker,
    makeTracer: _makeTracer,
    makeTween: _makeTween,
    makeWheel: _makeWheel,
    makeWorld: _makeWorld,
    observeAndUpdate: _observeAndUpdate,
    releaseCoordinate: _releaseCoordinate,
    releaseQuaternion: _releaseQuaternion,
    releaseVector: _releaseVector,
    removeListener: _removeListener,
    removeNativeListener: _removeNativeListener,
    render: _render,
    requestCoordinate: _requestCoordinate, 
    requestQuaternion: _requestQuaternion, 
    requestVector: _requestVector, 
    seededRandomNumberGenerator: _seededRandomNumberGenerator,
    setCurrentCanvas: _setCurrentCanvas,
    setFilterMemoizationChoke: _setFilterMemoizationChoke,
    setIgnorePixelRatio: _setIgnorePixelRatio,
    setPixelRatioChangeAction: _setPixelRatioChangeAction,
    setTouchActionChoke: _setTouchActionChoke,
    show: _show,
    startCoreAnimationLoop: _startCoreAnimationLoop, 
    startCoreListeners: _startCoreListeners,
    stopCoreAnimationLoop: _stopCoreAnimationLoop,
    stopCoreListeners: _stopCoreListeners,
};
*/


