const version = '8.0.9';
const anchor = {};
const anchornames = [];
const animation = {};
const animationnames = [];
const animationtickers = {};
const animationtickersnames = [];
const artefact = {};
const artefactnames = [];
const asset = {};
const assetnames = [];
const canvas = {};
const canvasnames = [];
const cell = {};
const cellnames = [];
const element = {};
const elementnames = [];
const entity = {};
const entitynames = [];
const filter = {};
const filternames = [];
const fontattribute = {};
const fontattributenames = [];
const group = {};
const groupnames = [];
const palette = {};
const palettenames = [];
const stack = {};
const stacknames = [];
const tween = {};
const tweennames = [];
const styles = {};
const stylesnames = [];
const unstackedelement = {};
const unstackedelementnames = [];
const constructors = {};
const radian = Math.PI / 180;
const css = new Set(['all', 'background', 'backgroundAttachment', 'backgroundBlendMode', 'backgroundClip', 'backgroundColor', 'backgroundOrigin', 'backgroundPosition', 'backgroundRepeat', 'border', 'borderBottom', 'borderBottomColor', 'borderBottomStyle', 'borderBottomWidth', 'borderCollapse', 'borderColor', 'borderLeft', 'borderLeftColor', 'borderLeftStyle', 'borderLeftWidth', 'borderRight', 'borderRightColor', 'borderRightStyle', 'borderRightWidth', 'borderSpacing', 'borderStyle', 'borderTop', 'borderTopColor', 'borderTopStyle', 'borderTopWidth', 'borderWidth', 'clear', 'color', 'columns', 'content', 'counterIncrement', 'counterReset', 'cursor', 'direction', 'display', 'emptyCells', 'float', 'font', 'fontFamily', 'fontSize', 'fontSizeAdjust', 'fontStretch', 'fontStyle', 'fontSynthesis', 'fontVariant', 'fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition', 'fontWeight', 'grid', 'gridArea', 'gridAutoColumns', 'gridAutoFlow', 'gridAutoPosition', 'gridAutoRows', 'gridColumn', 'gridColumnStart', 'gridColumnEnd', 'gridRow', 'gridRowStart', 'gridRowEnd', 'gridTemplate', 'gridTemplateAreas', 'gridTemplateRows', 'gridTemplateColumns', 'imageResolution', 'imeMode', 'inherit', 'inlineSize', 'isolation', 'letterSpacing', 'lineBreak', 'lineHeight', 'listStyle', 'listStyleImage', 'listStylePosition', 'listStyleType', 'margin', 'marginBlockStart', 'marginBlockEnd', 'marginInlineStart', 'marginInlineEnd', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'marks', 'mask', 'maskType', 'maxWidth', 'maxHeight', 'maxBlockSize', 'maxInlineSize', 'maxZoom', 'minWidth', 'minHeight', 'minBlockSize', 'minInlineSize', 'minZoom', 'mixBlendMode', 'objectFit', 'objectPosition', 'offsetBlockStart', 'offsetBlockEnd', 'offsetInlineStart', 'offsetInlineEnd', 'orphans', 'overflow', 'overflowWrap', 'overflowX', 'overflowY', 'pad', 'padding', 'paddingBlockStart', 'paddingBlockEnd', 'paddingInlineStart', 'paddingInlineEnd', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'pageBreakAfter', 'pageBreakBefore', 'pageBreakInside', 'pointerEvents', 'position', 'prefix', 'quotes', 'rubyAlign', 'rubyMerge', 'rubyPosition', 'scrollBehavior', 'scrollSnapCoordinate', 'scrollSnapDestination', 'scrollSnapPointsX', 'scrollSnapPointsY', 'scrollSnapType', 'scrollSnapTypeX', 'scrollSnapTypeY', 'shapeImageThreshold', 'shapeMargin', 'shapeOutside', 'tableLayout', 'textAlign', 'textDecoration', 'textIndent', 'textOrientation', 'textOverflow', 'textRendering', 'textShadow', 'textTransform', 'textUnderlinePosition', 'unicodeRange', 'unset', 'verticalAlign', 'widows', 'willChange', 'wordBreak', 'wordSpacing', 'wordWrap', 'zIndex']);
const xcss = new Set(['alignContent', 'alignItems', 'alignSelf', 'animation', 'animationDelay', 'animationDirection', 'animationDuration', 'animationFillMode', 'animationIterationCount', 'animationName', 'animationPlayState', 'animationTimingFunction', 'backfaceVisibility', 'backgroundImage', 'backgroundSize', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderImage', 'borderImageOutset', 'borderImageRepeat', 'borderImageSlice', 'borderImageSource', 'borderImageWidth', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'boxDecorationBreak', 'boxShadow', 'boxSizing', 'columnCount', 'columnFill', 'columnGap', 'columnRule', 'columnRuleColor', 'columnRuleStyle', 'columnRuleWidth', 'columnSpan', 'columnWidth', 'filter', 'flex', 'flexBasis', 'flexDirection', 'flexFlow', 'flexGrow', 'flexShrink', 'flexWrap', 'fontFeatureSettings', 'fontKerning', 'fontLanguageOverride', 'hyphens', 'imageRendering', 'imageOrientation', 'initial', 'justifyContent', 'linearGradient', 'opacity', 'order', 'orientation', 'outline', 'outlineColor', 'outlineOffset', 'outlineStyle', 'outlineWidth', 'resize', 'tabSize', 'textAlignLast', 'textCombineUpright', 'textDecorationColor', 'textDecorationLine', 'textDecorationStyle', 'touchAction', 'transformStyle', 'transition', 'transitionDelay', 'transitionDuration', 'transitionProperty', 'transitionTimingFunction', 'unicodeBidi', 'whiteSpace', 'writingMode']);
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
