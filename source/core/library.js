// # Core library
// Scrawl-canvas stores most of the objects it creates in a centralized space, so that they can be referenced from other places in the code base, and from user-written code. 
//
// While some sections are dedicated to a single type of object, other sections are aggregations - this may lead to name conflicts if coders are not rigorous in their naming conventions when creating objects (through the __make__ factory functions).
//
// `Exported object` (to modules and scrawl object). Scrawl-canvas exposes the library, and its sections, for import into other script files

// No imports required


// Current version
const version = '8.0.10';


// Objects created using the __makeAnchor__ factory
const anchor = {};
const anchornames = [];


// Objects created using the __makeAnimation__ and __makeRender__ factories
const animation = {};
const animationnames = [];


// Objects - specifically tickers - created using the __makeTicker__ and __makeTween__ factories
const animationtickers = {};
const animationtickersnames = [];


// An aggregate of all contents in the canvas, element, entity and stack sections of the library.
const artefact = {};
const artefactnames = [];


// Scrawl-canvas wrappers for visual media (images, videos, sprites). Anything that a Picture entity or Pattern style can use as their asset source needs to be included in this section of the library
const asset = {};
const assetnames = [];


// Canvas element wrappers created during Scrawl-canvas initialization, and the __makeCanvas__, __getCanvas__ and __addCanvas__ factories
const canvas = {};
const canvasnames = [];


// Objects created using the __makeCell__ and __canvas.buildCell__ factories
const cell = {};
const cellnames = [];


// DOM element wrappers created during Scrawl-canvas initialization, and created using the __makeElement__, __Stack.addExistingDomElement__ and __Stack.addNewElement__ factories
const element = {};
const elementnames = [];


// All canvas-related artefacts (Blocks, Wheels, etc) get stored in the __entity__ section of the library. 
const entity = {};
const entitynames = [];


// Objects created using the __makeFilter__ factory
const filter = {};
const filternames = [];


// Used internally by Phrase artefacts
const fontattribute = {};
const fontattributenames = [];


// Objects created using the __makeGroup__ factory, and generated as part of the process of creating Stack and Canvas artefacts, and Cell assets.
const group = {};
const groupnames = [];
    

// Used internally by Gradient and RadialGradient styles
const palette = {};
const palettenames = [];
    

// Stack element wrappers created during Scrawl-canvas initialization, and created using the __makeStack__ and __addStack__ factories
const stack = {};
const stacknames = [];


// Objects created using the __makeTween__ and __makeAction__ factories
const tween = {};
const tweennames = [];
    

// Objects created using the __makeGradient__, __makeRadialGradient__, __makePattern__ and __makeColor__ factories
const styles = {};
const stylesnames = [];


// DOM unstackedElement wrappers created using the __makeUnstackedElement__ and __makeComponent__ factories
const unstackedelement = {};
const unstackedelementnames = [];


// All __makeXXX__ factory functions get added as references to the __constructors__ section of the library - used mainly as part of Scrawl-canvas cloning functionality.
const constructors = {};


// Convenience value, used internally
const radian = Math.PI / 180;


// Convenience set, used internally
const css = new Set(['all', 'background', 'backgroundAttachment', 'backgroundBlendMode', 'backgroundClip', 'backgroundColor', 'backgroundOrigin', 'backgroundPosition', 'backgroundRepeat', 'border', 'borderBottom', 'borderBottomColor', 'borderBottomStyle', 'borderBottomWidth', 'borderCollapse', 'borderColor', 'borderLeft', 'borderLeftColor', 'borderLeftStyle', 'borderLeftWidth', 'borderRight', 'borderRightColor', 'borderRightStyle', 'borderRightWidth', 'borderSpacing', 'borderStyle', 'borderTop', 'borderTopColor', 'borderTopStyle', 'borderTopWidth', 'borderWidth', 'clear', 'color', 'columns', 'content', 'counterIncrement', 'counterReset', 'cursor', 'direction', 'display', 'emptyCells', 'float', 'font', 'fontFamily', 'fontSize', 'fontSizeAdjust', 'fontStretch', 'fontStyle', 'fontSynthesis', 'fontVariant', 'fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition', 'fontWeight', 'grid', 'gridArea', 'gridAutoColumns', 'gridAutoFlow', 'gridAutoPosition', 'gridAutoRows', 'gridColumn', 'gridColumnStart', 'gridColumnEnd', 'gridRow', 'gridRowStart', 'gridRowEnd', 'gridTemplate', 'gridTemplateAreas', 'gridTemplateRows', 'gridTemplateColumns', 'imageResolution', 'imeMode', 'inherit', 'inlineSize', 'isolation', 'letterSpacing', 'lineBreak', 'lineHeight', 'listStyle', 'listStyleImage', 'listStylePosition', 'listStyleType', 'margin', 'marginBlockStart', 'marginBlockEnd', 'marginInlineStart', 'marginInlineEnd', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'marks', 'mask', 'maskType', 'maxWidth', 'maxHeight', 'maxBlockSize', 'maxInlineSize', 'maxZoom', 'minWidth', 'minHeight', 'minBlockSize', 'minInlineSize', 'minZoom', 'mixBlendMode', 'objectFit', 'objectPosition', 'offsetBlockStart', 'offsetBlockEnd', 'offsetInlineStart', 'offsetInlineEnd', 'orphans', 'overflow', 'overflowWrap', 'overflowX', 'overflowY', 'pad', 'padding', 'paddingBlockStart', 'paddingBlockEnd', 'paddingInlineStart', 'paddingInlineEnd', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'pageBreakAfter', 'pageBreakBefore', 'pageBreakInside', 'pointerEvents', 'position', 'prefix', 'quotes', 'rubyAlign', 'rubyMerge', 'rubyPosition', 'scrollBehavior', 'scrollSnapCoordinate', 'scrollSnapDestination', 'scrollSnapPointsX', 'scrollSnapPointsY', 'scrollSnapType', 'scrollSnapTypeX', 'scrollSnapTypeY', 'shapeImageThreshold', 'shapeMargin', 'shapeOutside', 'tableLayout', 'textAlign', 'textDecoration', 'textIndent', 'textOrientation', 'textOverflow', 'textRendering', 'textShadow', 'textTransform', 'textUnderlinePosition', 'unicodeRange', 'unset', 'verticalAlign', 'widows', 'willChange', 'wordBreak', 'wordSpacing', 'wordWrap', 'zIndex']);
        

// Convenience set, used internally
const xcss = new Set(['alignContent', 'alignItems', 'alignSelf', 'animation', 'animationDelay', 'animationDirection', 'animationDuration', 'animationFillMode', 'animationIterationCount', 'animationName', 'animationPlayState', 'animationTimingFunction', 'backfaceVisibility', 'backgroundImage', 'backgroundSize', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderImage', 'borderImageOutset', 'borderImageRepeat', 'borderImageSlice', 'borderImageSource', 'borderImageWidth', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'boxDecorationBreak', 'boxShadow', 'boxSizing', 'columnCount', 'columnFill', 'columnGap', 'columnRule', 'columnRuleColor', 'columnRuleStyle', 'columnRuleWidth', 'columnSpan', 'columnWidth', 'filter', 'flex', 'flexBasis', 'flexDirection', 'flexFlow', 'flexGrow', 'flexShrink', 'flexWrap', 'fontFeatureSettings', 'fontKerning', 'fontLanguageOverride', 'hyphens', 'imageRendering', 'imageOrientation', 'initial', 'justifyContent', 'linearGradient', 'opacity', 'order', 'orientation', 'outline', 'outlineColor', 'outlineOffset', 'outlineStyle', 'outlineWidth', 'resize', 'tabSize', 'textAlignLast', 'textCombineUpright', 'textDecorationColor', 'textDecorationLine', 'textDecorationStyle', 'touchAction', 'transformStyle', 'transition', 'transitionDelay', 'transitionDuration', 'transitionProperty', 'transitionTimingFunction', 'unicodeBidi', 'whiteSpace', 'writingMode']);

// #### Exports
export {
    version,
    anchor,
    anchornames,
    animation,
    animationnames,
    asset,
    assetnames,
    animationtickers,
    animationtickersnames,
    artefact,
    artefactnames,
    canvas,
    canvasnames,
    cell,
    cellnames,
    element,
    elementnames,
    entity,
    entitynames,
    filter,
    filternames,
    fontattribute,
    fontattributenames,
    group,
    groupnames,
    palette,
    palettenames,
    stack,
    stacknames,
    styles,
    stylesnames,
    tween,
    tweennames,
    unstackedelement,
    unstackedelementnames,
    constructors,
    radian,
    css,
    xcss,
};
