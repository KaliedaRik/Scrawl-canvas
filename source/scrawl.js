// # Scrawl-canvas
//
// #### Version 8.17.0 - 3 January 2026


// ## Initialize Scrawl-canvas
import { init as _init } from './core/init.js';
export const init = _init;

if (typeof window !== 'undefined') _init();

// ## Export Scrawl-canvas module functions
export {
    startCoreAnimationLoop,
    stopCoreAnimationLoop,
} from './core/animation-loop.js';
export {
    clear,
    compile,
    show,
    render,
} from './core/display-cycle.js';
export { recalculateFonts } from './core/document.js';
export {
    addListener,
    removeListener,
    addNativeListener,
    removeNativeListener,
    makeAnimationObserver,
} from './core/events.js';
export * as library from './core/library.js';
export {
    checkFontIsLoaded,
    findArtefact,
    findAsset,
    findCanvas,
    findCell,
    findElement,
    findEntity,
    findFilter,
    findGroup,
    findPattern,
    findStack,
    findStyles,
    findTween,
    getFontMetadata,
    purge,
} from './core/library.js';
export { seededRandomNumberGenerator } from './helper/random-seed.js';
export { makeSnippet } from './core/snippets.js';
export {
    setFilterMemoizationChoke,
    setWorkstoreLifetimeLength,
    setWorkstorePurgeChoke,
} from './helper/workstore.js';
export { getLastUsedReducePalette } from './helper/filter-engine.js';
export {
    currentCorePosition,
    startCoreListeners,
    stopCoreListeners,
    getTouchActionChoke,
    setTouchActionChoke,
    getPixelRatio,
    setPixelRatioChangeAction,
    getIgnorePixelRatio,
    setIgnorePixelRatio,
    purgeFontMetadata,
} from './core/user-interaction.js';
export { forceUpdate } from './helper/system-flags.js';
export { makeAction } from './factory/action.js';
export { makeAnimation } from './factory/animation.js';
export { makeBlock } from './factory/block.js';
export { makeBezier } from './factory/bezier.js';
export {
    addCanvas,
    getCanvas,
    setCurrentCanvas,
} from './factory/canvas.js';
export { makeCog } from './factory/cog.js';
export { makeColor } from './factory/color.js';
export { makeConicGradient } from './factory/conic-gradient.js';
export { makeCrescent } from './factory/crescent.js';
export { makeEmitter } from './factory/emitter.js';
export { makeEnhancedLabel } from './factory/enhanced-label.js';
export { makeFilter } from './factory/filter.js';
export { makeForce } from './factory/particle-force.js';
export { makeGradient } from './factory/gradient.js';
export { makeGrid } from './factory/grid.js';
export { makeGroup } from './factory/group.js';
export {
    importImage,
    importDomImage,
    importImageBitmap,
    createImageFromCell,
    createImageFromGroup,
    createImageFromEntity,
} from './asset-management/image-asset.js';
export { makeLabel } from './factory/label.js';
export { makeLine } from './factory/line.js';
export { makeLineSpiral } from './factory/line-spiral.js';
export { makeLoom } from './factory/loom.js';
export { makeMesh } from './factory/mesh.js';
export { makeNet } from './factory/net.js';
export {
    makeNoise,
    makeNoiseAsset,
} from './asset-management/noise-asset.js';
export { makeOval } from './factory/oval.js';
export { makePattern } from './factory/pattern.js';
export { makePicture } from './factory/picture.js';
export { makePolygon } from './factory/polygon.js';
export { makePolyline } from './factory/polyline.js';
export { makeQuadratic } from './factory/quadratic.js';
export { makeRadialGradient } from './factory/radial-gradient.js';
export { makeRawAsset } from './asset-management/raw-asset.js';
export { makeReactionDiffusionAsset } from './asset-management/reaction-diffusion-asset.js';
export { makeRectangle } from './factory/rectangle.js';
export { makeRender } from './factory/render-animation.js';
export { makeShape } from './factory/shape.js';
export { makeSpiral } from './factory/spiral.js';
export { importSprite } from './asset-management/sprite-asset.js';
export { makeSpring } from './factory/particle-spring.js';
export {
    addStack,
    getStack,
} from './factory/stack.js';
export { makeStar } from './factory/star.js';
export { makeTetragon } from './factory/tetragon.js';
export { makeTicker } from './factory/ticker.js';
export { makeTracer } from './factory/tracer.js';
export { makeTween } from './factory/tween.js';
export {
    importDomVideo,
    importVideo,
    importMediaStream,
    importScreenCapture,
} from './asset-management/video-asset.js';
export { makeWheel } from './factory/wheel.js';
export { makeWorld } from './factory/particle-world.js';

export {
    requestCoordinate,
    releaseCoordinate,
} from './untracked-factory/coordinate.js';
export { makeDragZone } from './untracked-factory/drag-zone.js';
export { makeKeyboardZone } from './untracked-factory/keyboard-zone.js';
export {
    observeAndUpdate,
    makeUpdater,
    initializeDomInputs,
} from './untracked-factory/observe-update.js';
export {
    requestQuaternion,
    releaseQuaternion,
} from './untracked-factory/quaternion.js';
export {
    requestVector,
    releaseVector,
} from './untracked-factory/vector.js';
