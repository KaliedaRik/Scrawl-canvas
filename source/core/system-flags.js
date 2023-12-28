// # System flags


let trackMouse = false;
export const getTrackMouse = () => trackMouse;
export const setTrackMouse = (val) => trackMouse = val;

let mouseChanged = false;
export const getMouseChanged = () => mouseChanged;
export const setMouseChanged = (val) => mouseChanged = val;

let viewportChanged = false;
export const getViewportChanged = () => viewportChanged;
export const setViewportChanged = (val) => viewportChanged = val;

let prefersContrastChanged = false;
export const getPrefersContrastChanged = () => prefersContrastChanged;
export const setPrefersContrastChanged = (val) => prefersContrastChanged = val;

let prefersReducedMotionChanged = false;
export const getPrefersReducedMotionChanged = () => prefersReducedMotionChanged;
export const setPrefersReducedMotionChanged = (val) => prefersReducedMotionChanged = val;

let prefersDarkColorSchemeChanged = false;
export const getPrefersDarkColorSchemeChanged = () => prefersDarkColorSchemeChanged;
export const setPrefersDarkColorSchemeChanged = (val) => prefersDarkColorSchemeChanged = val;

let prefersReduceTransparencyChanged = false;
export const getPrefersReduceTransparencyChanged = () => prefersReduceTransparencyChanged;
export const setPrefersReduceTransparencyChanged = (val) => prefersReduceTransparencyChanged = val;

let prefersReduceDataChanged = false;
export const getPrefersReduceDataChanged = () => prefersReduceDataChanged;
export const setPrefersReduceDataChanged = (val) => prefersReduceDataChanged = val;

let resortBatchAnimations = true;
export const getResortBatchAnimations = () => resortBatchAnimations;
export const setResortBatchAnimations = (val) => resortBatchAnimations = val;

let doAnimation = false;
export const getDoAnimation = () => doAnimation;
export const setDoAnimation = (val) => doAnimation = val;

let rootElementsSort = true;
export const getRootElementsSort = () => rootElementsSort;
export const setRootElementsSort = (val) => rootElementsSort = val;

let displaySupportsP3ColorChanged = false;
export const getDisplaySupportsP3ColorChanged = () => displaySupportsP3ColorChanged;
export const setDisplaySupportsP3ColorChanged = (val) => displaySupportsP3ColorChanged = val;


export const forceUpdate = function () {

    mouseChanged = true;
    viewportChanged = true;
};


// Wide Gamut 2D Graphics using HTML Canvas
// - The following code taken from [this Webkit article](https://webkit.org/blog/12058/wide-gamut-2d-graphics-using-html-canvas/)

