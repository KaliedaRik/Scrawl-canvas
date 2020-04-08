import {
startCoreAnimationLoop,
stopCoreAnimationLoop,
} from './core/animationloop.js';
import {
makeComponent,
} from './core/component.js';
import {
addStack,
getStack,
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
import { init } from './core/init.js';
init();
export default {
library,
startCoreAnimationLoop,
stopCoreAnimationLoop,
currentCorePosition,
startCoreListeners,
stopCoreListeners,
observeAndUpdate,
makeDragZone,
makeComponent,
addStack,
getStack,
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
makeAction,
makeAnimation,
makeBlock,
makeColor,
requestCoordinate,
releaseCoordinate,
makeFilter,
makeGradient,
makeGrid,
makeGroup,
importImage,
importDomImage,
createImageFromCell,
createImageFromGroup,
createImageFromEntity,
makeLoom,
makePattern,
makePhrase,
makePicture,
requestQuaternion,
releaseQuaternion,
makeRadialGradient,
makeRender,
makeShape,
makeLine,
makeQuadratic,
makeBezier,
makeRectangle,
makeOval,
makeTetragon,
makePolygon,
makeStar,
makeSpiral,
importSprite,
makeTicker,
makeTween,
requestVector,
releaseVector,
importDomVideo,
importVideo,
importMediaStream,
makeWheel,
};
