// # Phrase factory
// Phrase entitys are graphical text rectangles rendered onto a DOM &lt;canvas> element using the Canvas API's [CanvasRenderingContext2D interface](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) - in particular the `fillRect`, `strokeRect`, `fillText` and `strokeText` methods.
// + Positioning functionality for the Phrase is supplied by the __position__ mixin, while rendering functionality comes from the __entity__ mixin. 
// + Phrases can use CSS color Strings for their fillStyle and strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects. 
// + They will also accept __Filter__ objects.
// + They can use __Anchor__ objects for user navigation. 
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__. 
// + They can be __animated__ directly, or using delta animation, or act as the target for __Tween__ animations.
// + Phrases can be cloned, and killed.
//
// Phrase entity __dimensions__ work differently to that of other entitys:
// + The `width` attribute is required for multi-line text. When set, Phrase entitys will automatically render text longer than its width in multiple lines on the canvas.
// + The `height` attribute is normally disregarded. Instead height is calculated as a combination of the font `size`, `lineheight`, and the number of lines of text that need to be rendered on the canvas - which itself depends on the text's length and the entity's `width` attribute.
//
// __Be aware that text is _always_ rendered as a graphic, not a block.__ 
// + Scrawl-canvas ignores all attempts to set the canvas context engine's `textAlign` and `textBaseline` attributes, which are permanently set to the defaults `left` and `top` respectively. 
// + Each glyph (letter) is stamped separately onto the canvas - this allows us to include letterspacing and justification functionality, and to allow text to be styled on a per-glyph basis (overline/underline, highlight, color, bold/italics, etc).
//
// Phrase entitys use [FontAttribute objects](./fontAttribute.html) to help manage their text font:
// + More than one font family can be used in a single Phrase.
// + Font styles are also supported: a single Phrase can include multiple episodes of __bold__, _italic_, etc.
// + More than one font size can be displayed within a Phrase.
// + Letter spacing is supported, both across the entire text and within the text.
// + Beyond fonts, ranges of letters within the Phrase text can be background highlighted, or given overlines and/or underlines.
//
// Phrase entitys fully support __text along a path__ at the Phrase, word and letter levels.
//
// Phrase entity text content is __accessible to assistive technologies__ such as screen readers, by default.


// #### Demos:
// + [Canvas-015](../../demo/canvas-015.html) - Phrase entity (make, clone, method, multiline)
// + [Canvas-016](../../demo/canvas-016.html) - Phrase entity position and font attributes; Block mimic functionality
// + [Canvas-017](../../demo/canvas-017.html) - Phrase entity - test lineHeight, letterSpacing and justify attributes; setSectionStyles() functionality
// + [Canvas-018](../../demo/canvas-018.html) - Phrase entity - text along a path
// + [Canvas-019](../../demo/canvas-019.html) - Artefact collision detection
// + [Canvas-029](../../demo/canvas-029.html) - Phrase entitys and gradients
// + [Component-001](../../demo/component-001.html) - Scrawl-canvas DOM element components
// + [Component-004](../../demo/component-004.html) - Scrawl-canvas packets - save and load a range of different entitys
// + [Component-005](../../demo/component-005.html) - Scrawl-canvas modularized code - London crime charts


// #### Imports
import { constructors, cell, cellnames, styles, stylesnames, artefact } from '../core/library.js';
import { scrawlCanvasHold } from '../core/document.js';
import { mergeOver, pushUnique, xt, xta, isa_obj, isa_number } from '../core/utilities.js';

import { requestCell, releaseCell } from './cell.js';

import { makeFontAttributes } from './fontAttributes.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';


// Constants used by Phrase entitys
const fontHeightCalculator = document.createElement('div');
fontHeightCalculator.style.padding = 0;
fontHeightCalculator.style.border = 0;
fontHeightCalculator.style.margin = 0;
fontHeightCalculator.style.height = 'auto';
fontHeightCalculator.style.lineHeight = 1;
fontHeightCalculator.style.boxSizing = 'border-box';
fontHeightCalculator.innerHTML = '|/}ÁÅþ§¶¿∑ƒ⌈⌊qwertyd0123456789QWERTY';
scrawlCanvasHold.appendChild(fontHeightCalculator);

const textEntityConverter = document.createElement('textarea');


// __ensureFloat__ - return the value provided as a floating point number of given precision; return 0 if not a number
const ensureFloat = (val, precision) => {

    val = parseFloat(val);

    if (!isa_number(val)) val = 0;
    if (!isa_number(precision)) precision = 0;

    return parseFloat(val.toFixed(precision));
};


// __ensurePositiveFloat__ - return the value provided as a positive floating point number of given precision; return 0 if not a number
const ensurePositiveFloat = (val, precision) => {

    val = parseFloat(val);

    if (!isa_number(val)) val = 0;
    if (!isa_number(precision)) precision = 0;

    return Math.abs(parseFloat(val.toFixed(precision)));
};


// __ensureString__ - return a String representation of the value
const ensureString = (val) => {

    return (val.substring) ? val : val.toString;
};


// #### Phrase constructor
const Phrase = function (items = {}) {

    this.fontAttributes = makeFontAttributes(items);

    delete items.font;
    delete items.style;
    delete items.variant;
    delete items.weight;
    delete items.stretch;
    delete items.size;
    delete items.sizeValue;
    delete items.sizeMetric;
    delete items.family;

    this.entityInit(items);

    this.sectionStyles = [];
    this.sectionClasses = {
        'DEFAULTS': { defaults: true },
        'BOLD': { weight: 'bold' },
        'ITALIC': { style: 'italic' },
        'SMALL-CAPS': { variant: 'small-caps' },
        'HIGHLIGHT': { highlight: true },
        'UNDERLINE': { underline: true },
        'OVERLINE': { overline: true },
        '/BOLD': { weight: 'normal' },
        '/ITALIC': { style: 'normal' },
        '/SMALL-CAPS': { variant: 'normal' },
        '/HIGHLIGHT': { highlight: false },
        '/UNDERLINE': { underline: false },
        '/OVERLINE': { overline: false }
    };

    this.dirtyDimensions = true;
    this.dirtyText = true;
    this.dirtyFont = true;
    this.dirtyPathObject = true;

    return this;
};


// #### Phrase prototype
let P = Phrase.prototype = Object.create(Object.prototype);
P.type = 'Phrase';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = filterMix(P);


// #### Phrase attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, handle, offset, dimensions, delta, noDeltaUpdates, pivot, pivotCorner, pivoted, addPivotHandle, addPivotOffset, addPivotRotation, path, pathPosition, addPathHandle, addPathOffset, addPathRotation, mimic, mimicked, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic, lockTo, scale, roll, collides, sensorSpacing, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates__.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil, filterAlpha, filterComposite__.
let defaultAttributes = {

// __text__ - the text String to be displayed by the Phrase
    text: '',

// __width__ - Number or String
// + In addition to normal dimensional values, Phrase entitys will accept the String label __'auto'__ (default). When set to 'auto' the width will be calculated as the natural, single line text length.
    width: 'auto',

// __exposeText__ - Boolean accessibility feature
// + When __exposeText__ is set to true (default), Scrawl-canvas will create an element in the DOM and mirror its current text value in that element. 
// + The element - a &lt;div> - is attached to the canvas element's textHold element, which immediately follows that element and has zero dimensions, so its contents don't interfere with the flow of the rest of the DOM content.
    exposeText: true,

// __lineHeight__ - a positive float Number multiplier applied to the font height to add space between lines of text
    lineHeight: 1.15,

// __letterSpacing__ - a positive float Number representing a set number of pixels to place between each glyph (letter). Can be overridden for letter ranges using styling objects
    letterSpacing: 0,

// __justify__ - String value to indicate how the text should justify itself within its dimensions box.
// + Permitted values are: `left` (default), `center`, `right`, `full` (for 'justified' text).
    justify: 'left',

// ##### In-text styling

// __sectionClasses__ - Array of styling objects
//
// Glyphs (letters) can be individually styled by adding a ___styling object___ to the `sectionClasses` Array, and then adding __section style markup__ to the Phrase's text String attribute. Subsequent glyphs will inherit those styles until a second style marker updating or terminating that particular style is encountered.
//
// The following font attributes can be modified on a per-glyph basis using section classes:
// + `style` - eg 'italic'
// + `variant` - eg 'small-caps'
// + `weight` - eg 'bold'
// + `stretch`
// + `size` - any permitted font size value
// + `family` - font family
// + `space` - alter the letterSpacing values to spread or condense glyphs
// + `fill` - fillStyle to be applied to the glyph
// + `stroke` - strokeStyle to be applied to the glyph
// + `highlight` - boolean - whether highlight should be applied to the glyph
// + `underline` - boolean - whether underline should be applied to the glyph
// + `overline` - boolean - whether overline should be applied to the glyph
// + `defaults` - boolean - setting this to true will set the glyph (and subsequent glyphs) to the Phrase entity's current font and fill/stroke style values
//
// Usage: 
// 1. Add styling objects to the `sectionClasses` Array - a number of styling objects are pre-defined for every Phrase entity; these can be added to, modified or deleted at any time using the `addSectionClass` and `removeSectionClass` functions.
// 2. If necessary, update the entity's `sectionClassMarker` delimiter attrbute. The attribute has to be a String, but that string can define a Regular Expression - for example setting the attribute to `[§<>]` will identify style markup delimeted by both `§marker-label§` and `<marker-label>`.
// 3. Add section style markup to the Phrase entity's text attribute value.
//
// ```
// let myPhrase = scrawl.makePhrase({
//     name: 'my-phrase',
//     text: 'This is §RED§some red text§DEFAULTS§ for demonstration.'
// });
//
// myPhrase.addSectionClass('RED', { fill: 'red' });
// ```
//
// The following classes are pre-defined for every Phrase entity:
// + `DEFAULTS` - remove all inline glyph styling from this point on
// + `BOLD`, `/BOLD` - add/remove bold styling
// + `ITALIC`, `/ITALIC` - add/remove italic styling
// + `SMALL-CAPS`, `/SMALL-CAPS` - add/remove small-caps styling
// + `HIGHLIGHT`, `/HIGHLIGHT` - add/remove glyph background highlight
// + `UNDERLINE`, `/UNDERLINE` - add/remove glyph underline
// + `OVERLINE`, `/OVERLINE` - add/remove glyph overline
    sectionClassMarker: '§',
    sectionClasses: null,

// ##### Overlines, underlines, highlighting
// We set the position and style for overlines, underlines and background highlight on a per-Phrase entity level, then apply them to glyphs using __sectionClasses__ styling objects.
// + over/underline decoration positions are float Numbers (generally) in the range `0 - 1` which represent where on the Phrase text line the decoration should appear. The values are relative to line heights, which in turn depend on font size and Phrase lineHeight attributes.
// + for __strikethrough__ text, use appropriately positioned overlines.
// + over/underline decoration style values, and the highlight style value, can be any valid CSS color String.

// __overlinePosition__, __overlineStyle__
    overlinePosition: -0.1,
    overlineStyle: 'rgb(250,0,0)',

// __underlinePosition__, __underlineStyle__
    underlinePosition: 0.6,
    underlineStyle: 'rgb(250,0,0)',

// __highlightStyle__
    highlightStyle: 'rgba(250,218,94,0.4)',

// ##### Bounding box
// The bounding box represents the Phrase entity's collision detection ___hit area___. It contains all of the entity's text, including line spacing.

// __boundingBoxColor__
    boundingBoxColor: 'rgba(0,0,0,0.5)',

// __showBoundingBox__ - Boolean flag indicating whether the Phrase entity's bounding box should be displayed
    showBoundingBox: false,

// ##### Text along a path
// Phrase entitys, alongside other artefacts, can use a [Shape entity](./shape.html) as a ___reference path___ to determine its location in the canvas display - achieved by setting the `path`, `pathPosition`, etc attributes as required.
// + In this case, the Phrase's text will appear as boxed text, with straight lines of text.
//
// We have an additional use case for Phrase text: to ___map each letter along the length of a Shape entity's path___. For this, we have specific `textPath`, `textPathPosition`, etc attributes.

// __textPath__ - Shape entity to be used as the text path; can be supplied either as the entity object itself, or as the entity's name-String.
    textPath: '',

// __textPathPosition__ - float Number value between `0.0 - 1.0` representing the text's first character's position on the path.
    textPathPosition: 0,

// __textPathLoop__ - Boolean flag - when true (default) the first character's position will loop back to `0` when it passes `1` (and vice versa).
    textPathLoop: true,

// __addTextPathRoll__ - Boolean flag - when true (default) each glyph in the text will rotate to match its position's tangent on the path.
    addTextPathRoll: true,

// __textPathDirection__ - String with values `ltr` or `rtl` - affects how the text glyphs will arrange themselves along the path.
    textPathDirection: 'ltr',

// __treatWordAsGlyph__ - Boolean flag - when true, Scrawl-canvas will treat each word in the text as if it was a glyph/letter; default: false.
    treatWordAsGlyph: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['textPositions', 'textLines', 'textLineWidths', 'textLineWords', 'textGlyphs', 'textGlyphWidths', 'fontAttributes']);

P.finalizePacketOut = function (copy, items) {

    let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
    copy = mergeOver(copy, stateCopy);

    let fontAttributesCopy = JSON.parse(this.fontAttributes.saveAsPacket(items))[3];
    delete fontAttributesCopy.name;
    copy = mergeOver(copy, fontAttributesCopy);

    copy = this.handlePacketAnchor(copy, items);

    return copy;
};


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.factoryKill = function () {

    if (this.exposedTextHold) this.exposedTextHold.remove();
};


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;


// __handle__
S.handleX = function (coord) {

    if (coord != null) {

        this.handle[0] = coord;
        this.dirtyHandle = true;
        this.dirtyText = true;
        this.dirtyPathObject = true;
    }
};
S.handleY = function (coord) {

    if (coord != null) {

        this.handle[1] = coord;
        this.dirtyHandle = true;
        this.dirtyText = true;
        this.dirtyPathObject = true;
    }
};
S.handle = function (x, y) {

    this.setCoordinateHelper('handle', x, y);
    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};
D.handleX = function (coord) {

    let c = this.handle;
    c[0] = addStrings(c[0], coord);
    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};
D.handleY = function (coord) {

    let c = this.handle;
    c[1] = addStrings(c[1], coord);
    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};
D.handle = function (x, y) {

    this.setDeltaCoordinateHelper('handle', x, y);
    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};

// __text__
G.text = function () {

    return this.currentText || this.text || '';
};
S.text = function (item) {

    this.text = ensureString(item);
    
    this.dirtyText = true;
    this.dirtyPathObject = true;
    this.dirtyDimensions = true;
};

// __justify__
P.permittedJustifications = ['left', 'right', 'center', 'full'];
S.justify = function (item) {

    if (this.permittedJustifications.indexOf(item) >= 0) this.justify = item;
    
    this.dirtyText = true;
    this.dirtyPathObject = true;
};

// __width__
S.width = function (item) {

    this.dimensions[0] = item;

    this.dirtyDimensions = true;
    this.dirtyHandle = true;
    this.dirtyPathObject = true;
    this.dirtyText = true;
};
D.width = function (item) {

    let c = this.dimensions;
    c[0] = addStrings(c[0], item);

    this.dirtyDimensions = true;
    this.dirtyHandle = true;
    this.dirtyPathObject = true;
    this.dirtyText = true;
};

// __scale__
S.scale = function (item) {

    this.scale = item;

    this.dirtyDimensions = true;
    this.dirtyHandle = true;
    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyScale = true;
};
D.scale = function (item) {

    this.scale += item;

    this.dirtyDimensions = true;
    this.dirtyHandle = true;
    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyScale = true;
};

// __lineHeight__
S.lineHeight = function (item) {

    this.lineHeight = ensurePositiveFloat(item, 3);

    // TODO: temporary fix that needs a longer-term solution
    // + text display, entity height and pathObject fall out of sync at small/negative values
    // + won't be resolved without a proper fix for the height issue!
    if (this.lineHeight < 0.5) this.lineHeight = 0.5;
    
    this.dirtyPathObject = true;
    this.dirtyText = true;
};
D.lineHeight = function (item) {

    this.lineHeight += ensureFloat(item, 3);

    // TODO: temporary fix that needs a longer-term solution (see setter above)
    if (this.lineHeight < 0.5) this.lineHeight = 0.5;

    this.dirtyPathObject = true;
    this.dirtyText = true;
};

// __letterSpacing__
S.letterSpacing = function (item) {

    this.letterSpacing = ensurePositiveFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
};
D.letterSpacing = function (item) {

    this.letterSpacing += ensureFloat(item, 3);
    if (this.letterSpacing < 0) this.letterSpacing = 0;

    this.dirtyPathObject = true;
    this.dirtyText = true;
};

// __overlinePosition__
S.overlinePosition = function (item) {

    this.overlinePosition = ensureFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
};
D.overlinePosition = function (item) {

    this.overlinePosition += ensureFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
};

// __underlinePosition__
S.underlinePosition = function (item) {

    this.underlinePosition = ensureFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
};
D.underlinePosition = function (item) {

    this.underlinePosition += ensureFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
};

// __textPath__
S.textPath = function (item) {

    this.textPath = item;

    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};

// __textPathPosition__
S.textPathPosition = function (item) {

    if (this.textPathLoop) {

        if (item < 0) item = Math.abs(item);
        if (item > 1) item = item % 1;
        this.textPathPosition = parseFloat(item.toFixed(6));
    }
    else this.textPathPosition = item;
};
D.textPathPosition = function (item) {

    let newVal = this.textPathPosition + item;

    if (this.textPathLoop) {

        if (newVal < 0) newVal += 1;
        if (newVal > 1) newVal = newVal % 1;
        this.textPathPosition = parseFloat(newVal.toFixed(6));
    }
    else this.textPathPosition = newVal;
};


// ##### FontAttribute attributes
// Phrase entitys break down fonts into their constituent parts using [FontAttribute](./fontAttribute.html) objects.
// + The Canvas API standards for using fonts on a canvas (`font`, `textAlign`, `textBaseline`) are near-useless, and often lead to a sub-par display of text. 
// + Thus Phrase entitys hide these from the developer, instead giving them functions to get/set/update fonts which align more closely with CSS standards.
// + Note that the Canvas API only supports a subset of possible CSS font-related values, and that the level of support for even these will vary between browsers/devices. The Phrase entity will do work to ensure the font strings passed to the Canvas API CanvasRenderingContext2D engine will be valid (thus avoiding unnecessary runtime errors), but this may not be the same as a developer specifies in their code.

// __font__ - the desired CSS font (`get` returns the actual font String being used)
// + The font String is not retained. Rather we break it down into its constituent parts, and rebuild the font String when needed.
G.font = function () {

    return this.fontAttributes.get('font');
};
S.font = function (item) {

    this.fontAttributes.set({font: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};

// __style__ - CSS `font-style` String - `normal`, `italic`
G.style = function () {

    return this.fontAttributes.get('style');
};
S.style = function (item) {

    this.fontAttributes.set({style: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};

// __variant__ - CSS `font-variant` String - `normal`, `small-caps`
G.variant = function () {

    return this.fontAttributes.get('variant');
};
S.variant = function (item) {

    this.fontAttributes.set({variant: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};

// __weight__ - CSS `font-weight` String - `normal`, `bold`, `lighter`, `bolder`, or an integer Number (between `1` and `1000`)
G.weight = function () {

    return this.fontAttributes.get('weight');
};
S.weight = function (item) {

    this.fontAttributes.set({weight: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};

// __stretch__ - CSS `font-stretch` String - `normal`
G.stretch = function () {

    return this.fontAttributes.get('stretch');
};
S.stretch = function (item) {

    this.fontAttributes.set({stretch: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};

// __size__ - CSS `font-size` String:
// + `xx-small`, `x-small`, `small`, `medium`, `large`, `x-large`, `xx-large` 
// + `smaller`, `larger`
// + `120%`
// + `1.2rem`, `12px`, etc - Scrawl-canvas will work with the following metrics: `em`, `ch`, `ex`, `rem`, `vh`, `vw`, `vmin`, `vmax`, `px`, `cm`, `mm`, `in`, `pc`, `pt`
G.size = function () {

    return this.fontAttributes.get('size');
};
S.size = function (item) {

    this.fontAttributes.set({size: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};

// __sizeValue__ - the Number part of the font's size value
G.sizeValue = function () {

    return this.fontAttributes.get('sizeValue');
};
S.sizeValue = function (item) {

    this.fontAttributes.set({sizeValue: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};
D.sizeValue = function (item) {

    this.fontAttributes.deltaSet({sizeValue: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};

// __sizeMetric__ - the String metric part of the font's size value
G.sizeMetric = function () {

    return this.fontAttributes.get('sizeMetric');
};
S.sizeMetric = function (item) {

    this.fontAttributes.set({sizeMetric: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};

// __family__ - CSS `font-family` String
G.family = function () {

    return this.fontAttributes.get('family');
};
S.family = function (item) {
    
    this.fontAttributes.set({family: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};


// #### Prototype functions

P.cleanDimensionsAdditionalActions = function () {

    if (this.dimensions[0] === 'auto') {

        if (!this.currentText) this.buildText();

        let myCell = requestCell(),
            engine = myCell.engine;

        engine.font = this.fontAttributes.buildFont();

        this.currentDimensions[0] = Math.ceil(engine.measureText(this.currentText).width);

        releaseCell(myCell);
    }

    this.currentDimensions[1] = Math.ceil((this.textHeight * this.textLines.length * this.lineHeight) / this.scale);
};

// `setSectionStyles` - internal function
P.setSectionStyles = function (text) {

    let search = new RegExp(this.sectionClassMarker),
        parseArray = text.split(search),
        styles = this.sectionStyles,
        classes = this.sectionClasses,
        parsedText = '',
        classObj, index, styleObj;

    styles.length = 0;

    parseArray.forEach(item => {

        classObj = classes[item];

        if (classObj) {

            index = parsedText.length;
            styleObj = styles[index];

            if (!styleObj) styles[index] = Object.assign({}, classObj);
            else Object.assign(styleObj, classObj);
        }
        else if (xt(item)) parsedText += item;
    });
    return parsedText;
};

// `addSectionClass`, `removeSectionClass` - add and remove section class definitions to the entity's `sectionClasses` object.
P.addSectionClass = function (label, obj) {

    if (xta(label, obj) && label.substring && isa_obj(obj)) {

        this.sectionClasses[label] = obj;
    }
    this.dirtyText = true;
    this.dirtyPathObject = true;

    return this;
};

P.removeSectionClass = function (label) {

    delete this.sectionClasses[label];

    this.dirtyText = true;
    this.dirtyPathObject = true;

    return this;
};

// `getTextPath` - internal function
P.getTextPath = function () {

    let path = this.textPath;

    if (path && path.substring) {

        path = this.textPath = artefact[this.textPath];

        if (path.type === 'Shape' && path.useAsPath) path.pathed.push(this.name);
        else {

            path = this.path = false;
        }
    }

    return path;
};

// #### Display cycle functionality
// Phrase entitys, because they handle graphical text which has its own special requirements and methods in the Canvas API, has to overwrite a substantial portion of the Display cycle functionality defined in the entity mixin.

// `cleanPathObject` - overwrites mixin/entity.js functionality so that it can deal with the `dirtyFont`, `dirtyText` and `dirtyHandle` flags 
// + Fonts don't have accessible paths; Phrase entity pathObjects represent the bounding box around the entity's text.
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {
        
        if (this.dirtyFont && this.fontAttributes) {

            this.dirtyFont = false;
            this.fontAttributes.buildFont(this.scale);
            this.dirtyText = true;
            this.dirtyMimicDimensions = true;
        }
        if (this.dirtyText) this.buildText();

        if (this.dirtyHandle) this.cleanHandle();

        let p = this.pathObject = new Path2D();
        
        let handle = this.currentHandle,
            dims = this.currentDimensions,

            scale = this.currentScale,
            x = -handle[0] * scale,
            y = -handle[1] * scale,
            w = dims[0] * scale,
            h = dims[1] * scale;

        this.boxStartValues = [x, y];

        p.rect(x, y, w, h);
    }
};

// `buildText` - internal function called by `cleanPathObject`
P.buildText = function () {

    this.dirtyText = false;

    let t = this.convertTextEntityCharacters(this.text);

    t = this.setSectionStyles(t);

    this.currentText = t;

    this.calculateTextPositions(t);

    if (this.exposeText) {

        if (!this.exposedTextHold) {

            let myhold = document.createElement('div');
            myhold.id = `${this.name}-text-hold`;
            this.exposedTextHold = myhold;
            this.exposedTextHoldAttached = false;
        }

        this.exposedTextHold.textContent = t;

        if (!this.exposedTextHoldAttached) {

            if(this.currentHost && this.currentHost.controller && this.currentHost.controller.textHold) {

                this.currentHost.controller.textHold.appendChild(this.exposedTextHold);
                this.exposedTextHoldAttached = true;
            }
        }
    }
};


// `convertTextEntityCharacters` - internal function called by `buildText`
// + To convert any HTML entity (eg: &lt; &epsilon;) in the text string into their required glyphs
// + Also removes excessive white space
P.convertTextEntityCharacters = function (item) {

    let mytext = item.trim();

    mytext = mytext.replace(/[\s\uFEFF\xA0]+/g, ' ');

    textEntityConverter.innerHTML = mytext;
    return textEntityConverter.value;
};

// `calculateTextPositions` - internal function called by `buildText`
// + If you are not a fan of big, complex functions ... look away now!
P.calculateTextPositions = function (mytext) {

    // 0. `strokeStyle` and `fillStyle` helper function
    const makeStyle = function (item) {

        if (!host) {

            self.dirtyPathObject = true;
            self.dirtyText = true;
            return 'black';
        }

        if (item.substring) {

            let brokenStyle = false;

            if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
            else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];

            if (brokenStyle) return brokenStyle;
        }
        return item;
    };

    // 1. Setup - get values for text? arrays, current?, highlight?, ?Attributes, etc
    let myCell = requestCell(),
        engine = myCell.engine;

    let self = this,
        host = (this.group && this.group.getHost) ? this.group.getHost() : false;

    let textGlyphs, 
        textGlyphWidths = [], 
        textLines = [], 
        textLineWidths = [],
        textLineWords = [], 
        textPositions = [],
        spacesArray = [],
        gStyle, gPos, item, 
        starts, ends, cursor, word, height,
        space, i, iz, j, jz, k, kz;

    let fragment, len, glyphArr, glyph, nextGlyph, glyphWidth, lineLen, totalLen,
        singles = [],
        pairs = [],
        path = this.getTextPath(),
        direction, loop, rotate;

    let fontAttributes = this.fontAttributes,
        glyphAttributes = fontAttributes.clone({});

    let sectionStyles = this.sectionStyles;

    let state = this.state,
        fontLibrary = {},
        fontArray = [];

    let scale = this.currentScale,
        dims = this.currentDimensions,
        width = dims[0] * scale,
        treatWordAsGlyph = this.treatWordAsGlyph,
        lineHeight = this.lineHeight,
        justify = this.justify,
        handle, handleX, handleY;

    let defaultFont = fontAttributes.update(scale), 
        defaultFillStyle = makeStyle(state.fillStyle), 
        defaultStrokeStyle = makeStyle(state.strokeStyle), 
        defaultSpace = this.letterSpacing * scale, 

        currentFont = defaultFont, 
        currentFillStyle = defaultFillStyle, 
        currentStrokeStyle = defaultStrokeStyle, 
        currentSpace = defaultSpace;

    let highlightStyle = (this.highlightStyle) ? makeStyle(this.highlightStyle) : false,
        highlightFlag = false;

    let underlineStyle = (this.underlineStyle) ? makeStyle(this.underlineStyle) : false,
        underlinePosition = this.underlinePosition,
        underlineFlag = false;

    let overlineStyle = (this.overlineStyle) ? makeStyle(this.overlineStyle) : false,
        overlinePosition = this.overlinePosition,
        overlineFlag = false;

    let maxHeight = 0;

    // 2. Create `textGlyphs` array
    // + also shove the default font into the `fontLibrary` array
    textGlyphs = (treatWordAsGlyph) ? mytext.split(' ') : mytext.split('');
    fontArray.push(currentFont);

    // 3. `textPositions` array will include an array of data for each glyph
    // + `[font, strokeStyle, fillStyle, highlight, underline, overline, text, startX, startY, (pathData)]`
    // + and populate `spacesArray` with space position data (for full justify calculations later)
    for (i = 0, iz = textGlyphs.length; i < iz; i++) {

        item = textGlyphs[i];

        textPositions[i] = [, , , , , , item, 0, 0, 0];

        if (item === ' ') spacesArray.push(i);
    }

    // 4. Process the `sectionStyles` array to start populating the `textPositions` arrays
    if (!sectionStyles[0]) sectionStyles[0] = {
        family: glyphAttributes.family,
        size: (glyphAttributes.sizeValue) ? `${glyphAttributes.sizeValue}${glyphAttributes.sizeMetric}` : glyphAttributes.sizeMetric,
        stretch: glyphAttributes.stretch,
        style: glyphAttributes.style,
        variant: glyphAttributes.variant,
        weight: glyphAttributes.weight,
    };

    for (i = 0, iz = sectionStyles.length; i < iz; i++) {

        gStyle = sectionStyles[i];

        if (gStyle) {

            gPos = textPositions[i];

            if (gPos) {

                if (i === 0) {
                    gPos[0] = currentFont;
                    gPos[3] = highlightFlag;
                    gPos[4] = underlineFlag;
                    gPos[5] = overlineFlag;
                }

                if (gStyle.defaults) {
                    currentFont = glyphAttributes.update(scale, fontAttributes);
                    currentStrokeStyle = defaultStrokeStyle;
                    currentFillStyle = defaultFillStyle;
                    currentSpace = defaultSpace;
                    gPos[0] = currentFont;
                    gPos[1] = currentStrokeStyle;
                    gPos[2] = currentFillStyle;
                    gPos[3] = highlightFlag;
                    gPos[4] = underlineFlag;
                    gPos[5] = overlineFlag;
                }

                item = gStyle.stroke;
                if (item && item !== currentStrokeStyle) {

                    currentStrokeStyle = makeStyle(gStyle.stroke);
                    gPos[1] = currentStrokeStyle;
                };

                item = gStyle.fill;
                if (item && item !== currentFillStyle) {

                    currentFillStyle = makeStyle(gStyle.fill);
                    gPos[2] = currentFillStyle;
                };

                item = gStyle.space;
                if (xt(item) && item !== currentSpace) currentSpace = item * scale

                item = gStyle.highlight;
                if (xt(item) && item !== highlightFlag) {

                    highlightFlag = item;
                    gPos[3] = highlightFlag;
                };

                item = gStyle.underline;
                if (xt(item) && item !== underlineFlag) {

                    underlineFlag = item;
                    gPos[4] = underlineFlag;
                };

                item = gStyle.overline;
                if (xt(item) && item !== overlineFlag) {

                    overlineFlag = item;
                    gPos[5] = overlineFlag;
                };

                if (i !== 0 && (gStyle.variant || gStyle.weight || gStyle.style || gStyle.stretch || gStyle.size || gStyle.sizeValue || gStyle.sizeMetric || gStyle.family || gStyle.font)) {

                    item = glyphAttributes.update(scale, gStyle);
                    if (item !== currentFont) {

                        currentFont = item;
                        gPos[0] = currentFont;

                        if (fontArray.indexOf(currentFont) < 0) fontArray.push(currentFont);
                    }
                }
            }
        }

        // Setup `textGlyphWidths` array, populating it with current letterSpacing values
        textGlyphWidths[i] = currentSpace;
    }

    // Finish populating `textGlyphWidths`
    for (i = 0, iz = textGlyphs.length; i < iz; i++) {

        if (xt(textGlyphWidths[i])) currentSpace = textGlyphWidths[i];

        textGlyphWidths[i] = currentSpace;
    }

    // 5. Calculate the text `height` value
    // + All lines in a multiline Phrase will use the maximum text height value, even if they don't include the biggest value
    fontArray.forEach(font => {

        fontHeightCalculator.style.font = font;
        item = fontHeightCalculator.clientHeight;
        fontLibrary[font] = item;
    });

    maxHeight = Math.max(...Object.values(fontLibrary));

    // 6. Calculate glyph `width` values
    // + This is the tricky bit as, ideally, we need to take into account font kerning values
    // + However kerning values go out of the window when font attributes (especially size) change in mid-text
    // + And we need to remember that `letterSpacing` can also be different in different parts of the text
    // + This is also the best place to populate the `textLine` arrays
    totalLen = lineLen = starts = ends = 0;

    for (i = 0, iz = textPositions.length; i < iz; i++) {

        glyphArr = textPositions[i];
        glyph = glyphArr[6];

        if (glyphArr[0]) engine.font = glyphArr[0];

        singles.push(engine.measureText(glyph).width);
        
        nextGlyph = textPositions[i + 1];
        nextGlyph = (!treatWordAsGlyph && nextGlyph) ? nextGlyph[6] : false;

        len = (nextGlyph) ? engine.measureText(`${glyph}${nextGlyph}`).width : false;
        pairs.push(len);
    }

    for (i = 0, iz = pairs.length; i < iz; i++) {

        glyph = pairs[i];

        if (glyph) {

            len = singles[i] + singles[i + 1];
            gPos = textPositions[i + 1];

            if (len > glyph && !gPos[0]) singles[i] -= (len - glyph);
        }
    }

    // Calculate text line arrays
    for (i = 0, iz = textPositions.length; i < iz; i++) {

        glyphArr = textPositions[i];
        glyph = glyphArr[6];

        glyphWidth = singles[i] + textGlyphWidths[i];
        textGlyphWidths[i] = glyphWidth;

        if (treatWordAsGlyph || glyph === ' ') ends = i;

        lineLen += glyphWidth;
        totalLen += glyphWidth;

        // Need `starts` to be less than `ends`
        // + This should make sure we pick up individual words that are longer than the Phrase entity's width
        if (lineLen >= width && starts < ends) {

            fragment = textGlyphs.slice(starts, ends).join('');
            textLines.push(fragment);
            len = (treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length;
            textLineWords.push(len);

            len = textGlyphWidths.slice(starts, ends).reduce((a, v) => a + v, 0);
            textLineWidths.push(len);

            lineLen -= len;
            starts = ends + 1;
        }

        // Need to pick up the last (or only) line
        if (i + 1 === iz) {

            // Pick up single line
            if (lineLen === totalLen) {

                fragment = mytext;

                textLines.push(fragment);
                textLineWords.push((treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length);
                textLineWidths.push(totalLen);
            }

            // Final line of multiline text
            else {

                fragment = textGlyphs.slice(starts).join('');
                textLines.push(fragment);
                len = (treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length;
                textLineWords.push(len);

                len = textGlyphWidths.slice(starts).reduce((a, v) => a + v, 0);
                textLineWidths.push(len);
            }
        }

        // ... And complete the population of data for `highlight`, `overline`, `underline`
        if (xt(glyphArr[3])) highlightFlag = glyphArr[3];
        if (xt(glyphArr[4])) underlineFlag = glyphArr[4];
        if (xt(glyphArr[5])) overlineFlag = glyphArr[5];

        glyphArr[3] = highlightFlag;
        glyphArr[4] = underlineFlag;
        glyphArr[5] = overlineFlag;
    }

    // 7. Calculate `localHeight`
    if (scale <= 0) scale = 1;

    dims[1] = Math.ceil((maxHeight * textLines.length * lineHeight) / scale);

    this.cleanHandle();
    this.dirtyHandle = false;
    handle = this.currentHandle;
    
    handleX = -handle[0] * scale;
    handleY = -handle[1] * scale;

    // Handle path positioning (which we'll assume will need to be done for every display cycle) separately during stamping
    if (!path) {

        // 8. We should now be in a position where we can calculate each glyph's `startXY` values
        // + We have 2 non-path scenarios: full-justified text; and regular text

        // Scenario 1: `justify === 'full'`
        if (justify === 'full') {

            cursor = 0;
            height = handleY;

            for (i = 0, iz = textLineWidths.length; i < iz; i++) {

                len = handleX;

                if (textLineWords[i] > 1) space = (width - textLineWidths[i]) / (textLineWords[i] - 1);
                else space = 0;

                for (j = 0, jz = textLines[i].length; j < jz; j++) {

                    item = textPositions[cursor];

                    if (item[6] === ' ') textGlyphWidths[cursor] += space;

                    item[7] = Math.floor(len);
                    item[8] = Math.floor(height);
                    item[9] = textGlyphWidths[cursor];

                    len += textGlyphWidths[cursor];

                    cursor++;
                }

                cursor++;
                height += (maxHeight * lineHeight);
            }
        }

        // Scenario 2: regular text - `justify === 'left'`, or `'centre'`, or `'right'`
        else {

            cursor = 0;
            height = handleY;

            for (i = 0, iz = textLineWidths.length; i < iz; i++) {

                if (justify === 'right') len = (width - textLineWidths[i]) + handleX;
                else if (justify === 'center') len = ((width - textLineWidths[i]) / 2) + handleX;
                else len = handleX;

                for (j = 0, jz = textLines[i].length; j < jz; j++) {

                    item = textPositions[cursor];

                    item[7] = Math.floor(len);
                    item[8] = Math.floor(height);
                    item[9] = textGlyphWidths[cursor];

                    len += textGlyphWidths[cursor];

                    cursor++;
                }

                cursor++;
                height += (maxHeight * lineHeight);
            }
        }
    }

    // 9. Clean up and exit
    this.textGlyphs = textGlyphs;
    this.textGlyphWidths = textGlyphWidths;
    this.textLines = textLines;
    this.textLineWidths = textLineWidths;
    this.textLineWords = textLineWords;
    this.textPositions = textPositions;
    this.textHeight = maxHeight;
    this.textLength = totalLen;
    this.fontLibrary = fontLibrary;

    releaseCell(myCell);
};


// ##### Stamping the entity onto a Cell wrapper &lt;canvas> element

// `regularStampSynchronousActions` - overwrites the mixin/entity.js function
P.regularStampSynchronousActions = function () {

    let dest = this.currentHost, 
        method = this.method,
        engine, i, iz, pos, data,
        preStamper = this.preStamper,
        stamper = this.stamper;

    if (dest) {

        engine = dest.engine;

        if (this.method === 'none') this.performRotation(engine);

        else if (this.textPath) {

            if (!this.noCanvasEngineUpdates) dest.setEngine(this);

            this.getTextPath();
            this.calculateGlyphPathPositions();

            pos = this.textPositions;

            let item, pathData,
                addTextPathRoll = this.addTextPathRoll,
                aPR = this.addPathRotation,
                cr = this.currentRotation,
                handle = this.currentHandle;

            this.addPathRotation = addTextPathRoll;

            for (i = 0, iz = pos.length; i < iz; i++) {

                item = pos[i];

                pathData = item[10];

                if (pathData) {

                    this.currentPathData = pathData;
                    if (addTextPathRoll) this.currentRotation = pathData.angle;

                    dest.rotateDestination(engine, pathData.x, pathData.y, this);

                    engine.translate(-handle[0], -handle[1]);

                    data = preStamper(dest, engine, this, item);
                    stamper[method](engine, this, data);
                }
            }
            this.addPathRotation = aPR;
            this.currentRotation = cr;
        }
        else {

            this.performRotation(engine);

            if (!this.noCanvasEngineUpdates) dest.setEngine(this);

            pos = this.textPositions;

            for (i = 0, iz = pos.length; i < iz; i++) {

                data = preStamper(dest, engine, this, pos[i]);
                stamper[method](engine, this, data);
            }
            if (this.showBoundingBox) this.drawBoundingBox(engine);
        }
    }
};

// `calculateGlyphPathPositions` - internal helper function called by `regularStampSynchronousActions`
P.calculateGlyphPathPositions = function () {

    let path = this.getTextPath(),
        len = path.length,
        textPos = this.textPositions,
        widths = this.textGlyphWidths,
        direction = (this.textPathDirection === 'ltr') ? true : false,
        pathPos = this.textPathPosition,
        distance, posArray, i, iz, width,
        justify = this.justify,
        loop = this.textPathLoop,
        localPathPos,
        pathSpeed = this.constantPathSpeed;

    for (i = 0, iz = textPos.length; i < iz; i++) {

        // textPathPosition Array indexes [
        // 0-font - font definition, or null
        // 1-strokeStyle - Boolean
        // 2-fillStyle - Boolean 
        // 3-highlight - Boolean
        // 4-underline - Boolean
        // 5-overline - Boolean 
        // 6-text - String
        // 7-startX - Number - on paths, acts as a negative offset for justifying glyphs
        // 8-startY - Number
        // 9-pathData - Object {x: Number (px), y: Number (px), angle: Number (degrees)}
        // ]
        posArray = textPos[i];
        width = widths[i];

        switch (justify) {

            case 'center' :
                localPathPos = pathPos + ((width / 2) / len);
                posArray[7] = -width / 2;
                break;

            case 'right' :
                localPathPos = pathPos + (width / len);
                posArray[7] = -width;
                break;

            default :
                localPathPos = pathPos;
        }

        if (loop && (localPathPos > 1 || localPathPos < 0)) {

            localPathPos = (localPathPos > 0.5) ? localPathPos - 1 : localPathPos + 1;
        }

        posArray[10] = (localPathPos <= 1 && localPathPos >= 0) ? 
            path.getPathPositionData(localPathPos, pathSpeed) : 
            false;

        posArray[9] = width;

        if (direction) pathPos += (width / len);
        else pathPos -= (width / len);

        if (loop && (pathPos > 1 || pathPos < 0)) {

            pathPos = (pathPos > 0.5) ? pathPos - 1 : pathPos + 1;
        }
    }
};

// `preStamper` - internal helper function called by `regularStampSynchronousActions`
P.preStamper = function (dest, engine, entity, args) {

    const makeStyle = function (item) {

        if (item.getData) return item.getData(entity, dest);

        return item;
    };

    let [font, strokeStyle, fillStyle, highlight, underline, overline, ...data] = args;

    if (font) engine.font = font;

    if (highlight || underline || overline) {

        let highlightStyle = entity.highlightStyle,
            height = entity.textHeight,
            underlineStyle = entity.underlineStyle,
            underlinePosition = entity.underlinePosition,
            overlineStyle = entity.overlineStyle,
            overlinePosition = entity.overlinePosition;

        engine.save();

        // data[0] - glyph
        // data[1] - xpos
        // data[2] - ypos
        // data[3] - width
        if (highlight) {

            engine.fillStyle = makeStyle(highlightStyle);
            engine.fillRect(data[1], data[2], data[3], height);
        }

        if (underline) {

            engine.strokeStyle = makeStyle(underlineStyle);
            engine.strokeRect(data[1], data[2] + (height * underlinePosition), data[3], 1);
        }

        if (overline) {

            engine.strokeStyle = makeStyle(overlineStyle);
            engine.strokeRect(data[1], data[2] + (height * overlinePosition), data[3], 1);
        }
        engine.restore();
    }

    if (strokeStyle) engine.strokeStyle = makeStyle(strokeStyle);
    if (fillStyle) engine.fillStyle = makeStyle(fillStyle);

    return data;
};

// `stamper` - object holding stamp method functions - functions called by `regularStampSynchronousActions`
P.stamper = {

    // `stamper.draw`
    draw: function (engine, entity, data) { 

        engine.strokeText(...data);
    },

    // `stamper.fill`
    fill: function (engine, entity, data) { 

        engine.fillText(...data);
    },

    // `stamper.drawAndFill`
    drawAndFill: function (engine, entity, data) { 

        engine.strokeText(...data);
        entity.currentHost.clearShadow();
        engine.fillText(...data);
        entity.currentHost.restoreShadow(entity);
    },

    // `stamper.fillAndDraw`
    fillAndDraw: function (engine, entity, data) { 

        engine.strokeText(...data);
        entity.currentHost.clearShadow();
        engine.fillText(...data);
        engine.strokeText(...data);
        entity.currentHost.restoreShadow(entity);
    },

    // `stamper.drawThenFill`
    drawThenFill: function (engine, entity, data) { 

        engine.strokeText(...data);
        engine.fillText(...data);
    },

    // `stamper.fillThenDraw`
    fillThenDraw: function (engine, entity, data) { 

        engine.fillText(...data);
        engine.strokeText(...data);
    },

    // `stamper.clear`
    clear: function (engine, entity, data) { 

        let gco = engine.globalCompositeOperation;
        engine.globalCompositeOperation = 'destination-out';
        engine.fillText(...data);
        engine.globalCompositeOperation = gco;
    },    
};

// `drawBoundingBox` - internal helper function called by `regularStampSynchronousActions`
P.drawBoundingBox = function (engine) {

    engine.save();
    engine.strokeStyle = this.boundingBoxColor;
    engine.lineWidth = 1;
    engine.globalCompositeOperation = 'source-over';
    engine.globalAlpha = 1;
    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;
    engine.stroke(this.pathObject);
    engine.restore();
};

// `performRotation` - internal helper function called by `regularStampSynchronousActions`
// + When doing text along a path, we have to perform a rendering context transformation for every glyph
// + In other cases, we perform the action on a per-line basis
P.performRotation = function (engine) {

    let dest = this.currentHost;

    if (dest) {

        let [x, y] = this.currentStampPosition;

        dest.rotateDestination(engine, x, y, this);
    }
};


// #### Factory
// ```
// scrawl.makePhrase({
//
//     name: 'myphrase_fill',
//
//     text: 'H&epsilon;lj&ouml;!',
//     font: 'bold 40px Garamond, serif',
//
//     width: 120,
//
//     startX: '14%',
//     startY: '28%',
//     handleX: 'center',
//     handleY: 'center',
//
//     justify: 'center',
//     lineHeight: 1,
//
//     fillStyle: 'green',
//     strokeStyle: 'gold',
//
//     lineWidth: 2,
//     lineJoin: 'round',
//
//     shadowOffsetX: 2,
//     shadowOffsetY: 2,
//     shadowBlur: 2,
//     shadowColor: 'black',
//
// }).clone({
//
//     name: 'myphrase_draw',
//     startX: '38%',
//     method: 'draw',
// });
// ```
const makePhrase = function (items) {
    return new Phrase(items);
};

constructors.Phrase = Phrase;


// #### Exports
export {
    makePhrase,
};
