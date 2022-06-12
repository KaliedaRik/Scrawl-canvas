// # Core library
// Scrawl-canvas stores most of the objects it creates in a centralized space, so that they can be referenced from other places in the code base, and from user-written code. 
//
// While some sections are dedicated to a single type of object, other sections are aggregations - this may lead to name conflicts if coders are not rigorous in their naming conventions when creating objects (through the __make__ factory functions).
//
// `Exported object` (to modules and scrawl object). Scrawl-canvas exposes the library, and its sections, for import into other script files

// No imports required


// Current version
export const version = '8.9.0';


// Objects created using the __makeAnchor__ factory
export const anchor = {};
export const anchornames = [];


// Objects created using the __makeAnimation__ and __makeRender__ factories
export const animation = {};
export const animationnames = [];


// Objects - specifically tickers - created using the __makeTicker__ and __makeTween__ factories
export const animationtickers = {};
export const animationtickersnames = [];


// An aggregate of all contents in the canvas, element, entity and stack sections of the library.
export const artefact = {};
export const artefactnames = [];


// Scrawl-canvas wrappers for visual media (images, videos, sprites). Anything that a Picture entity or Pattern style can use as their asset source needs to be included in this section of the library
export const asset = {};
export const assetnames = [];


// Canvas element wrappers created during Scrawl-canvas initialization, and the __makeCanvas__, __getCanvas__ and __addCanvas__ factories
export const canvas = {};
export const canvasnames = [];


// Objects created using the __makeCell__ and __canvas.buildCell__ factories
export const cell = {};
export const cellnames = [];


// DOM element wrappers created during Scrawl-canvas initialization, and created using the __makeElement__, __Stack.addExistingDomElement__ and __Stack.addNewElement__ factories
export const element = {};
export const elementnames = [];


// All canvas-related artefacts (Blocks, Wheels, etc) get stored in the __entity__ section of the library. 
export const entity = {};
export const entitynames = [];


// Objects created using the __makeFilter__ factory
export const filter = {};
export const filternames = [];


// Used internally by Phrase artefacts
export const fontattribute = {};
export const fontattributenames = [];


// Objects created using the __makeGroup__ factory, and generated as part of the process of creating Stack and Canvas artefacts, and Cell assets.
export const group = {};
export const groupnames = [];
    

// Used internally by Gradient and RadialGradient styles
export const palette = {};
export const palettenames = [];
    

// Physics-related objects
export const particle = {};
export const particlenames = [];
    
export const force = {};
export const forcenames = [];

export const spring = {};
export const springnames = [];
    
export const world = {};
export const worldnames = [];
    
// Section classes are used with Phrase entitys - we store the class definitions in the library so that they can be easily shared between Phrases
export const sectionClasses = {
    'DEFAULTS': { defaults: true },

    'b': { weight: 'bold' },
    '/b': { weight: 'normal' },
    'strong': { weight: 'bold' },
    '/strong': { weight: 'normal' },
    'BOLD': { weight: 'bold' },
    '/BOLD': { weight: 'normal' },

    'i': { style: 'italic' },
    '/i': { style: 'normal' },
    'em': { style: 'italic' },
    '/em': { style: 'normal' },
    'ITALIC': { style: 'italic' },
    '/ITALIC': { style: 'normal' },

    'u': { underline: true },
    '/u': { underline: false },
    'UNDERLINE': { underline: true },
    '/UNDERLINE': { underline: false },

    'OVERLINE': { overline: true },
    '/OVERLINE': { overline: false },

    'SMALL-CAPS': { variant: 'small-caps' },
    '/SMALL-CAPS': { variant: 'normal' },

    'HIGHLIGHT': { highlight: true },
    '/HIGHLIGHT': { highlight: false },
};

// Stack element wrappers created during Scrawl-canvas initialization, and created using the __makeStack__ and __addStack__ factories
export const stack = {};
export const stacknames = [];


// Objects created using the __makeTween__ and __makeAction__ factories
export const tween = {};
export const tweennames = [];
    

// Objects created using the __makeGradient__, __makeRadialGradient__, __makePattern__ and __makeColor__ factories
export const styles = {};
export const stylesnames = [];


// DOM unstackedElement wrappers created using the __makeUnstackedElement__ and __makeSnippet__ factories
export const unstackedelement = {};
export const unstackedelementnames = [];


// All __makeXXX__ factory functions get added as references to the __constructors__ section of the library - used mainly as part of Scrawl-canvas cloning functionality.
export const constructors = {};


// Convenience value, used internally
export const radian = Math.PI / 180;


// Convenience set, used internally
export const css = new Set(['all', 'background', 'backgroundAttachment', 'backgroundBlendMode', 'backgroundClip', 'backgroundColor', 'backgroundOrigin', 'backgroundPosition', 'backgroundRepeat', 'border', 'borderBottom', 'borderBottomColor', 'borderBottomStyle', 'borderBottomWidth', 'borderCollapse', 'borderColor', 'borderLeft', 'borderLeftColor', 'borderLeftStyle', 'borderLeftWidth', 'borderRight', 'borderRightColor', 'borderRightStyle', 'borderRightWidth', 'borderSpacing', 'borderStyle', 'borderTop', 'borderTopColor', 'borderTopStyle', 'borderTopWidth', 'borderWidth', 'clear', 'color', 'columns', 'content', 'counterIncrement', 'counterReset', 'cursor', 'direction', 'display', 'emptyCells', 'float', 'font', 'fontFamily', 'fontSize', 'fontSizeAdjust', 'fontStretch', 'fontStyle', 'fontSynthesis', 'fontVariant', 'fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition', 'fontWeight', 'grid', 'gridArea', 'gridAutoColumns', 'gridAutoFlow', 'gridAutoPosition', 'gridAutoRows', 'gridColumn', 'gridColumnStart', 'gridColumnEnd', 'gridRow', 'gridRowStart', 'gridRowEnd', 'gridTemplate', 'gridTemplateAreas', 'gridTemplateRows', 'gridTemplateColumns', 'imageResolution', 'imeMode', 'inherit', 'inlineSize', 'isolation', 'letterSpacing', 'lineBreak', 'lineHeight', 'listStyle', 'listStyleImage', 'listStylePosition', 'listStyleType', 'margin', 'marginBlockStart', 'marginBlockEnd', 'marginInlineStart', 'marginInlineEnd', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'marks', 'mask', 'maskType', 'maxWidth', 'maxHeight', 'maxBlockSize', 'maxInlineSize', 'maxZoom', 'minWidth', 'minHeight', 'minBlockSize', 'minInlineSize', 'minZoom', 'mixBlendMode', 'objectFit', 'objectPosition', 'offsetBlockStart', 'offsetBlockEnd', 'offsetInlineStart', 'offsetInlineEnd', 'orphans', 'overflow', 'overflowWrap', 'overflowX', 'overflowY', 'pad', 'padding', 'paddingBlockStart', 'paddingBlockEnd', 'paddingInlineStart', 'paddingInlineEnd', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'pageBreakAfter', 'pageBreakBefore', 'pageBreakInside', 'pointerEvents', 'position', 'prefix', 'quotes', 'rubyAlign', 'rubyMerge', 'rubyPosition', 'scrollBehavior', 'scrollSnapCoordinate', 'scrollSnapDestination', 'scrollSnapPointsX', 'scrollSnapPointsY', 'scrollSnapType', 'scrollSnapTypeX', 'scrollSnapTypeY', 'shapeImageThreshold', 'shapeMargin', 'shapeOutside', 'tableLayout', 'textAlign', 'textDecoration', 'textIndent', 'textOrientation', 'textOverflow', 'textRendering', 'textShadow', 'textTransform', 'textUnderlinePosition', 'unicodeRange', 'unset', 'verticalAlign', 'widows', 'willChange', 'wordBreak', 'wordSpacing', 'wordWrap', 'zIndex']);
        

// Convenience set, used internally
export const xcss = new Set(['alignContent', 'alignItems', 'alignSelf', 'animation', 'animationDelay', 'animationDirection', 'animationDuration', 'animationFillMode', 'animationIterationCount', 'animationName', 'animationPlayState', 'animationTimingFunction', 'backfaceVisibility', 'backgroundImage', 'backgroundSize', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderImage', 'borderImageOutset', 'borderImageRepeat', 'borderImageSlice', 'borderImageSource', 'borderImageWidth', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'boxDecorationBreak', 'boxShadow', 'boxSizing', 'columnCount', 'columnFill', 'columnGap', 'columnRule', 'columnRuleColor', 'columnRuleStyle', 'columnRuleWidth', 'columnSpan', 'columnWidth', 'filter', 'flex', 'flexBasis', 'flexDirection', 'flexFlow', 'flexGrow', 'flexShrink', 'flexWrap', 'fontFeatureSettings', 'fontKerning', 'fontLanguageOverride', 'hyphens', 'imageRendering', 'imageOrientation', 'initial', 'justifyContent', 'linearGradient', 'opacity', 'order', 'orientation', 'outline', 'outlineColor', 'outlineOffset', 'outlineStyle', 'outlineWidth', 'resize', 'tabSize', 'textAlignLast', 'textCombineUpright', 'textDecorationColor', 'textDecorationLine', 'textDecorationStyle', 'touchAction', 'transformStyle', 'transition', 'transitionDelay', 'transitionDuration', 'transitionProperty', 'transitionTimingFunction', 'unicodeBidi', 'whiteSpace', 'writingMode']);
