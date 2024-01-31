// # Phrase factory
//
// __THE PHRASE ENTITY IS DEPRECATED__ and will be removed from the library in a future update
// + Use the new `Label` and `EnhancedLabel` entitys instead
//
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


// #### Imports
import { artefact, cell, cellnames, constructors, sectionClasses, styles, stylesnames } from '../core/library.js';

import { addStrings, doCreate, isa_number, isa_obj, mergeOver, pushUnique, xt, xta, Ωempty } from '../helper/utilities.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import { releaseArray, requestArray } from '../helper/array-pool.js';

import { makeFontAttributes } from '../untracked-factory/font-attributes.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

import { _abs, _parse, _ceil, _assign, _max, _values, _floor, ARIA_HIDDEN, ARIA_LIVE, AUTO, BLACK, BORDER_BOX, CENTER, CLASS_REGEX, CLIP, DATA_TAB_ORDER, DEF_HIGHLIGHT, DEF_LINE_COLOR, DEF_SECTION_MARKERS, DEF_SECTION_PLACEHOLDER, DEFAULT, DESTINATION_OUT, DIV, ENTITY, FAMILY, FULL, HALFTRANS, HANDLE, JUSTIFICATIONS, LEFT, LTR, NONE, POLITE, RIGHT, SIZE, SIZE_METRIC, SIZE_VALUE, SOURCE_OVER, SPACE, STYLE, T_CANVAS, T_CELL, T_PHRASE, T_SHAPE, TEXTAREA, TOP, TRUE, VARIANT, WEIGHT, ZERO_STR } from '../helper/shared-vars.js';


// Local constants
const defaultTextForHeightMeasurements = '|/}ÁÅþ§¶¿∑ƒ⌈⌊qwertyd0123456789QWERTY';

const textEntityConverter = document.createElement(TEXTAREA);


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

    return _abs(parseFloat(val.toFixed(precision)));
};


// __ensureString__ - return a String representation of the value
const ensureString = (val) => {

    return (val.substring) ? val : val.toString;
};


// #### Phrase constructor
const Phrase = function (items = Ωempty) {

    this.fontAttributes = makeFontAttributes(Ωempty);

    this.entityInit(items);

    this.dirtyDimensions = true;
    this.dirtyText = true;
    this.dirtyFont = true;
    this.dirtyPathObject = true;

    return this;
};


// #### Phrase prototype
const P = Phrase.prototype = doCreate();
P.type = T_PHRASE;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [entity](../mixin/entity.html)
baseMix(P);
entityMix(P);

P.midInitActions = function () {

    this.sectionStyles = [];
};


// #### Phrase attributes
const defaultAttributes = {

// __text__ - the text String to be displayed by the Phrase
    text: ZERO_STR,

// __width__ - Number or String
// + In addition to normal dimensional values, Phrase entitys will accept the String label __'auto'__ (default). When set to 'auto' the width will be calculated as the natural, single line text length.
    width: AUTO,

// __textIsAccessible__ - Boolean accessibility feature. Note that `exposeText` has become a pseudo-attribute for `textIsAccessible`
// + The Phrase entity now uses the functionality supplied by the Label entity to make its text content accessible. This introduces the new `accessibleText`, `accessibleTextPlaceholder` and `accessibleTextOrder` attributes.

    textIsAccessible: true,
    accessibleText: DEF_SECTION_PLACEHOLDER,
    accessibleTextPlaceholder: DEF_SECTION_PLACEHOLDER,
    accessibleTextOrder: 0,

// __lineHeight__ - a positive float Number multiplier applied to the font height to add space between lines of text
    lineHeight: 1.15,

// __letterSpacing__ - a positive float Number representing a set number of pixels to place between each glyph (letter). Can be overridden for letter ranges using styling objects
    letterSpacing: 0,

// __justify__ - String value to indicate how the text should justify itself within its dimensions box.
// + Permitted values are: `left` (default), `center`, `right`, `full` (for 'justified' text).
    justify: LEFT,

// ##### In-text styling

// __sectionClasses__ - Array of styling objects
//
// Glyphs (letters) can be individually styled by adding a ___styling object___ to the global `sectionClasses` Array (which is stored in the Library, not the Phrase prototype or entity), and then adding __section style markup__ to the Phrase's text String attribute. Subsequent glyphs will inherit those styles until a second style marker updating or terminating that particular style is encountered.
//
// The following font attributes can be modified on a per-glyph basis using section classes:
// + `style` - eg 'italic'
// + `variant` - eg 'small-caps'
// + `weight` - eg 'bold'
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
// + `b`, `/b`, `strong`, `/strong`, `BOLD`, `/BOLD`  - add/remove bold styling
// + `i`, `/i`, `em`, `/em`, `ITALIC`, `/ITALIC` - add/remove italic styling
// + (Deprecated!) `SMALL-CAPS`, `/SMALL-CAPS` - add/remove small-caps styling
// + `HIGHLIGHT`, `/HIGHLIGHT` - add/remove glyph background highlight
// + `u`, `/u`, `UNDERLINE`, `/UNDERLINE` - add/remove glyph underline
// + `OVERLINE`, `/OVERLINE` - add/remove glyph overline
    sectionClassMarker: DEF_SECTION_MARKERS,

// ##### Overlines, underlines, highlighting
// We set the position and style for overlines, underlines and background highlight on a per-Phrase entity level, then apply them to glyphs using __sectionClasses__ styling objects.
// + over/underline decoration positions are float Numbers (generally) in the range `0 - 1` which represent where on the Phrase text line the decoration should appear. The values are relative to line heights, which in turn depend on font size and Phrase lineHeight attributes.
// + for __strikethrough__ text, use appropriately positioned overlines.
// + over/underline decoration style values, and the highlight style value, can be any valid CSS color String.

// __overlinePosition__, __overlineStyle__
    overlinePosition: -0.1,
    overlineStyle: DEF_LINE_COLOR,
    overlineWidth: 1,
    noOverlineGlyphs: ZERO_STR,

// __underlinePosition__, __underlineStyle__
    underlinePosition: 0.6,
    underlineStyle: DEF_LINE_COLOR,
    underlineWidth: 1,
    noUnderlineGlyphs: ZERO_STR,

// __highlightStyle__
    highlightStyle: DEF_HIGHLIGHT,

// ##### Bounding box
// The bounding box represents the Phrase entity's collision detection ___hit area___. It contains all of the entity's text, including line spacing.

// __boundingBoxColor__
    boundingBoxColor: HALFTRANS,

// __showBoundingBox__ - Boolean flag indicating whether the Phrase entity's bounding box should be displayed
    showBoundingBox: false,

// ##### Text along a path
// Phrase entitys, alongside other artefacts, can use a [Shape entity](./shape.html) as a ___reference path___ to determine its location in the canvas display - achieved by setting the `path`, `pathPosition`, etc attributes as required.
// + In this case, the Phrase's text will appear as boxed text, with straight lines of text.
//
// We have an additional use case for Phrase text: to ___map each letter along the length of a Shape entity's path___. For this, we have specific `textPath`, `textPathPosition`, etc attributes.

// __textPath__ - Shape entity to be used as the text path; can be supplied either as the entity object itself, or as the entity's name-String.
    textPath: ZERO_STR,

// __textPathPosition__ - float Number value between `0.0 - 1.0` representing the text's first character's position on the path.
    textPathPosition: 0,

// __textPathLoop__ - Boolean flag - when true (default) the first character's position will loop back to `0` when it passes `1` (and vice versa).
    textPathLoop: true,

// __addTextPathRoll__ - Boolean flag - when true (default) each glyph in the text will rotate to match its position's tangent on the path.
    addTextPathRoll: true,

// __textPathDirection__ - String with values `ltr` or `rtl` - affects how the text glyphs will arrange themselves along the path.
    textPathDirection: LTR,

// __treatWordAsGlyph__ - Boolean flag - when true, Scrawl-canvas will treat each word in the text as if it was a glyph/letter; default: false.
    treatWordAsGlyph: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['textPositions', 'textLines', 'textLineWidths', 'textLineWords', 'textGlyphs', 'textGlyphWidths', 'fontAttributes']);

P.finalizePacketOut = function (copy, items) {

    const stateCopy = _parse(this.state.saveAsPacket(items))[3];
    copy = mergeOver(copy, stateCopy);

    const fontAttributesCopy = _parse(this.fontAttributes.saveAsPacket(items))[3];
    delete fontAttributesCopy.name;
    copy = mergeOver(copy, fontAttributesCopy);

    copy = this.handlePacketAnchor(copy, items);

    return copy;
};


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.factoryKill = function () {

    if (this.accessibleTextHold) this.accessibleTextHold.remove();

    const hold = this.getCanvasTextHold(this.currentHost);
    if (hold) hold.dirtyTextTabOrder = true;
};


// #### Get, Set, deltaSet
const G = P.getters,
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

    this.setCoordinateHelper(HANDLE, x, y);
    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};
D.handleX = function (coord) {

    const c = this.handle;
    c[0] = addStrings(c[0], coord);
    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};
D.handleY = function (coord) {

    const c = this.handle;
    c[1] = addStrings(c[1], coord);
    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};
D.handle = function (x, y) {

    this.setDeltaCoordinateHelper(HANDLE, x, y);
    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};

// __text__
G.text = function () {

    return this.currentText || this.text || ZERO_STR;
};
S.text = function (item) {

    this.text = ensureString(item);

    this.dirtyText = true;
    this.dirtyPathObject = true;
    this.dirtyDimensions = true;
    this.dirtyFilterIdentifier = true;
};

// __justify__
S.justify = function (item) {

    if (JUSTIFICATIONS.includes(item)) this.justify = item;

    this.dirtyText = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
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

    const c = this.dimensions;
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

    // TODO: text display, entity height and pathObject fall out of sync at small/negative values
    // + This is a temporary fix
    if (this.lineHeight < 0.5) this.lineHeight = 0.5;

    this.dirtyPathObject = true;
    this.dirtyText = true;
    this.dirtyFilterIdentifier = true;
};
D.lineHeight = function (item) {

    this.lineHeight += ensureFloat(item, 3);

    // TODO: text display, entity height and pathObject fall out of sync at small/negative values
    // + This is a temporary fix
    if (this.lineHeight < 0.5) this.lineHeight = 0.5;

    this.dirtyPathObject = true;
    this.dirtyText = true;
    this.dirtyFilterIdentifier = true;
};

// __letterSpacing__
S.letterSpacing = function (item) {

    this.letterSpacing = ensurePositiveFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
    this.dirtyFilterIdentifier = true;
};
D.letterSpacing = function (item) {

    this.letterSpacing += ensureFloat(item, 3);
    if (this.letterSpacing < 0) this.letterSpacing = 0;

    this.dirtyPathObject = true;
    this.dirtyText = true;
    this.dirtyFilterIdentifier = true;
};

// __overlinePosition__
S.overlinePosition = function (item) {

    this.overlinePosition = ensureFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
    this.dirtyFilterIdentifier = true;
};
D.overlinePosition = function (item) {

    this.overlinePosition += ensureFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
    this.dirtyFilterIdentifier = true;
};

// __noOverlineGlyphs__
S.noOverlineGlyphs = function (item) {

    if (item.substring) this.noOverlineGlyphs = item;
};

// __underlinePosition__
S.underlinePosition = function (item) {

    this.underlinePosition = ensureFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
    this.dirtyFilterIdentifier = true;
};
D.underlinePosition = function (item) {

    this.underlinePosition += ensureFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
    this.dirtyFilterIdentifier = true;
};

// __noUnderlineGlyphs__
S.noUnderlineGlyphs = function (item) {

    if (item.substring) this.noUnderlineGlyphs = item;
};

// __textPath__
S.textPath = function (item) {

    this.textPath = item;

    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

// __textPathPosition__
S.textPathPosition = function (item) {

    if (this.textPathLoop) {

        if (item < 0) item = _abs(item);
        if (item > 1) item = item % 1;
        this.textPathPosition = parseFloat(item.toFixed(6));
    }
    else this.textPathPosition = item;
    this.dirtyFilterIdentifier = true;
};
D.textPathPosition = function (item) {

    let newVal = this.textPathPosition + item;

    if (this.textPathLoop) {

        if (newVal < 0) newVal += 1;
        if (newVal > 1) newVal = newVal % 1;
        this.textPathPosition = parseFloat(newVal.toFixed(6));
    }
    else this.textPathPosition = newVal;
    this.dirtyFilterIdentifier = true;
};


// ##### FontAttribute attributes
// Phrase entitys break down fonts into their constituent parts using [FontAttribute](./fontAttribute.html) objects.
// + The Canvas API standards for using fonts on a canvas (`font`, `textAlign`, `textBaseline`) are near-useless, and often lead to a sub-par display of text.
// + Thus Phrase entitys hide these from the developer, instead giving them functions to get/set/update fonts which align more closely with CSS standards.
// + Note that the Canvas API only supports a subset of possible CSS font-related values, and that the level of support for even these will vary between browsers/devices. The Phrase entity will do work to ensure the font strings passed to the Canvas API CanvasRenderingContext2D engine will be valid (thus avoiding unnecessary runtime errors), but this may not be the same as a developer specifies in their code.

// __font__ - the desired CSS font (`get` returns the actual font String being used)
// + The font String is not retained. Rather we break it down into its constituent parts, and rebuild the font String when needed.
G.font = function () {

    return this.fontAttributes.getFontString();
};
S.font = function (item) {

    this.fontAttributes.set({font: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

// __style__ - CSS `font-style` String
G.style = function () {

    return this.fontAttributes.get(STYLE);
};
S.style = function (item) {

    this.fontAttributes.set({style: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

// __variant__ - CSS `font-variant` String
G.variant = function () {

    return this.fontAttributes.get(VARIANT);
};
S.variant = function (item) {

    this.fontAttributes.set({variant: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

// __weight__ - CSS `font-weight` String
G.weight = function () {

    return this.fontAttributes.get(WEIGHT);
};
S.weight = function (item) {

    this.fontAttributes.set({weight: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

// __size__ - CSS `font-size` String
G.size = function () {

    return this.fontAttributes.get(SIZE);
};
S.size = function (item) {

    this.fontAttributes.set({size: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

// __sizeValue__ - the Number part of the font's size value
G.sizeValue = function () {

    return this.fontAttributes.get(SIZE_VALUE);
};
S.sizeValue = function (item) {

    this.fontAttributes.set({sizeValue: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};
D.sizeValue = function (item) {

    this.fontAttributes.deltaSet({sizeValue: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

// __sizeMetric__ - the String metric part of the font's size value
G.sizeMetric = function () {

    return this.fontAttributes.get(SIZE_METRIC);
};
S.sizeMetric = function (item) {

    this.fontAttributes.set({sizeMetric: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};

// __family__ - CSS `font-family` String
G.family = function () {

    return this.fontAttributes.get(FAMILY);
};
S.family = function (item) {

    this.fontAttributes.set({family: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};


// #### Accessibility

G.accessibleText = function () {

    return this.getAccessibleText();
};
S.accessibleText = function (item) {

    if (item?.substring) {

        this.accessibleText = item;
        this.dirtyText = true;
        this.dirtyAccessibleText = true;
    }
};

S.accessibleTextPlaceholder = function (item) {

    if (item?.substring) {

        this.accessibleTextPlaceholder = item;
        this.dirtyText = true;
        this.dirtyAccessibleText = true;
    }
};

S.accessibleTextOrder = function (item) {

    if (item?.toFixed) {

        this.accessibleTextOrder = item;
        this.dirtyText = true;
        this.dirtyAccessibleText = true;
    }
};

G.textIsAccessible = function () {

    return this.textIsAccessible;
};
S.textIsAccessible = function (item) {

    this.textIsAccessible = !!item;
    this.dirtyText = true;
    this.dirtyAccessibleText = true;
};

// Deprecated attribute mapped to equivalent
G.exposeText = G.textIsAccessible;
S.exposeText = S.textIsAccessible;


// #### Prototype functions

// `cleanDimensionsAdditionalActions` - local overwrite
P.cleanDimensionsAdditionalActions = function () {

    this.fontAttributes.dirtyFont = true;
    this.fontAttributes.updateMetadata(this.scale, this.lineHeight, this.getHost());

    if (this.dimensions[0] == AUTO) {

        this.buildText();

        const myCell = requestCell(),
            engine = myCell.engine;

        engine.font = this.fontAttributes.getFontString();

        this.currentDimensions[0] = _ceil(engine.measureText(this.currentText).width / this.scale);

        releaseCell(myCell);
    }

    if (this.textLines) this.currentDimensions[1] = _ceil((this.textHeight * this.textLines.length * this.lineHeight) / this.scale);
    else this.dirtyDimensions = true;
};

// `setSectionStyles` - internal function
P.setSectionStyles = function (text) {

    const search = new RegExp(this.sectionClassMarker),
        parseArray = text.split(search),
        styles = this.sectionStyles,
        classes = sectionClasses,
        parsedText = [];

    let classObj, index, styleObj;

    styles.length = 0;

    parseArray.forEach(item => {

        classObj = classes[item];

        if (classObj) {

            index = parsedText.length;
            styleObj = styles[index];

            if (!styleObj) styles[index] = _assign({}, classObj);
            else _assign(styleObj, classObj);
        }
        else if (xt(item)) parsedText.push(...item);
    });
    return parsedText.join('');
};

// `addSectionClass`, `removeSectionClass` - add and remove section class definitions to the entity's `sectionClasses` object.
//
// WARNING: the SectionClass object has been moved to the library, rather than created individually on each Phrase entity. This means that changes to the object will affect all phrases that make use of that class. __Namespacing new classes is strongly recommended!__
P.addSectionClass = function (label, obj) {

    if (xta(label, obj) && label.substring && isa_obj(obj)) {

        // this.sectionClasses[label] = obj;
        sectionClasses[label] = obj;
    }
    this.dirtyText = true;
    this.dirtyPathObject = true;

    return this;
};

P.removeSectionClass = function (label) {

    // delete this.sectionClasses[label];
    delete sectionClasses[label];

    this.dirtyText = true;
    this.dirtyPathObject = true;

    return this;
};

// `getTextPath` - internal function
P.getTextPath = function () {

    let path = this.textPath;

    if (path && path.substring) {

        path = this.textPath = artefact[this.textPath];

        if (path.type == T_SHAPE && path.useAsPath) path.pathed.push(this.name);
        else {

            path = this.path = false;
        }
    }

    return path;
};

P.getAccessibleText = function () {

    const {accessibleText, accessibleTextPlaceholder, text} = this;
    return accessibleText.replace(accessibleTextPlaceholder, text);
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
            this.dirtyText = true;
            this.dirtyMimicDimensions = true;
            this.dirtyPositionSubscribers = true;
        }
        if (this.dirtyText) this.buildText();

        if (this.dirtyHandle) this.cleanHandle();

        const p = this.pathObject = new Path2D();

        const handle = this.currentHandle,
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

    if (isNaN(this.currentDimensions[0])) this.dirtyText = true;
    else {

        this.calculateTextPositions(t);

        if (this.dirtyAccessibleText) this.updateAccessibleTextHold();
    }
};

P.getCanvasTextHold = function (item) {

    if (item && item.type == T_CELL && item.controller && item.controller.type == T_CANVAS && item.controller.textHold) return item.controller;

    if (item && item.type == T_CELL && item.currentHost) return this.getCanvasTextHold(item.currentHost);

    return false;
};

P.updateAccessibleTextHold = function () {

    this.dirtyAccessibleText = false;

    if (this.textIsAccessible) {

        if (!this.accessibleTextHold) {

            const myhold = document.createElement(DIV);
            myhold.id = `${this.name}-text-hold`;
            myhold.setAttribute(ARIA_LIVE, POLITE);
            myhold.setAttribute(DATA_TAB_ORDER, this.accessibleTextOrder);
            this.accessibleTextHold = myhold;
            this.accessibleTextHoldAttached = false;
        }

        this.accessibleTextHold.textContent = this.getAccessibleText();

        if (this.currentHost) {

            const hold = this.getCanvasTextHold(this.currentHost);

            if (hold && hold.textHold) {

                if (!this.accessibleTextHoldAttached) {

                    hold.textHold.appendChild(this.accessibleTextHold);
                    this.accessibleTextHoldAttached = true;
                }
                hold.dirtyTextTabOrder = true;
            }
        }
    }
    else {

        if (this.accessibleTextHold) {

            this.accessibleTextHold.remove();
            this.accessibleTextHold = null;
            this.accessibleTextHoldAttached = false;

            const hold = this.getCanvasTextHold(this.currentHost);
            if (hold) hold.dirtyTextTabOrder = true;
        }
    }
};


// `convertTextEntityCharacters` - internal function called by `buildText`
// + To convert any HTML entity (eg: &lt; &epsilon;) in the text string into their required glyphs
// + Also removes excessive white space
P.convertTextEntityCharacters = function (item) {

    let mytext = item.trim();
    mytext = mytext.replace(CLASS_REGEX, SPACE);
    textEntityConverter.innerHTML = mytext;
    mytext = textEntityConverter.value;
    return mytext;
};

// `calculateTextPositions` - internal function called by `buildText`
// + If you are not a fan of big, complex functions ... look away now!
P.calculateTextPositions = function (mytext) {

    // 0. `strokeStyle` and `fillStyle` helper function
    const makeStyle = function (art) {

        if (!host) {

            self.dirtyPathObject = true;
            self.dirtyText = true;
            return BLACK;
        }

        if (art.substring) {

            let brokenStyle = false;

            if (stylesnames.includes(art)) brokenStyle = styles[art];
            else if (cellnames.includes(art)) brokenStyle = cell[art];

            if (brokenStyle) return brokenStyle;
        }
        return art;
    };

    // 1. Setup - get values for text? arrays, current?, highlight?, ?Attributes, etc
    const myCell = requestCell(),
        engine = myCell.engine;

    const self = this,
        host = (this.group && this.group.getHost) ? this.group.getHost() : false;

    let fontHeightCalculator = null;
    if (host) {

        const controller = host.getController();

        if (controller) fontHeightCalculator = controller.fontHeightCalculator;
    }

    const textGlyphWidths = requestArray(),
        textLines = requestArray(),
        textLineWidths = requestArray(),
        textLineWords = requestArray(),
        textPositions = requestArray();

    let gStyle, gPos, item,
        starts, ends, cursor, height,
        space, i, iz, j, jz;

    const singles = requestArray(),
        pairs = requestArray(),
        path = this.getTextPath();

    let fragment, len, glyphArr, glyph, nextGlyph, glyphWidth, lineLen, totalLen;

    const fontAttributes = this.fontAttributes,
        glyphAttributes = Object.create(fontAttributes);

    const sectionStyles = this.sectionStyles;

    const state = this.state,
        fontLibrary = {},
        fontArray = requestArray();

    let scale = this.currentScale;

    const dims = this.currentDimensions,
        width = dims[0] * scale,
        treatWordAsGlyph = this.treatWordAsGlyph,
        lineHeight = this.lineHeight,
        justify = this.justify;

    fontAttributes.updateMetadata(scale, lineHeight, host);
    glyphAttributes.updateMetadata(scale, lineHeight, host);

    const defaultFont = fontAttributes.getFontString(),
        defaultFillStyle = makeStyle(state.fillStyle),
        defaultStrokeStyle = makeStyle(state.strokeStyle),
        defaultSpace = this.letterSpacing * scale;

    let currentFont = defaultFont,
        currentFillStyle = defaultFillStyle,
        currentStrokeStyle = defaultStrokeStyle,
        currentSpace = defaultSpace;

    if (this.highlightStyle) makeStyle(this.highlightStyle);
    if (this.underlineStyle) makeStyle(this.underlineStyle);
    if (this.overlineStyle) makeStyle(this.overlineStyle);

    let highlightFlag = false,
        underlineFlag = false,
        overlineFlag = false,
        maxHeight = 0;

    // 2. Create `textGlyphs` array
    // + also shove the default font into the `fontLibrary` array
    const textGlyphs = requestArray();
    if (treatWordAsGlyph) textGlyphs.push(...mytext.join('').split(SPACE));
    else textGlyphs.push(...mytext);

    fontArray.push(currentFont);

    // 3. `textPositions` array will include an array of data for each glyph
    // + `[font, strokeStyle, fillStyle, highlight, underline, overline, text, startX, startY, (pathData)]`
    // + and populate `spacesArray` with space position data (for full justify calculations later)
    for (i = 0, iz = textGlyphs.length; i < iz; i++) {

        item = textGlyphs[i];

/* eslint-disable-next-line */
        textPositions[i] = [, , , , , , item, 0, 0, 0];
    }

    // 4. Process the `sectionStyles` array to start populating the `textPositions` arrays
    if (!sectionStyles[0]) sectionStyles[0] = {
        family: glyphAttributes.family,
        size: (glyphAttributes.sizeValue) ? `${glyphAttributes.sizeValue}${glyphAttributes.sizeMetric}` : glyphAttributes.sizeMetric,
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
                    currentFont = glyphAttributes.update(fontAttributes);
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

                    if (DEFAULT == item) currentStrokeStyle = defaultStrokeStyle;
                    else currentStrokeStyle = makeStyle(gStyle.stroke);
                    gPos[1] = currentStrokeStyle;
                }

                item = gStyle.fill;
                if (item && item !== currentFillStyle) {

                    if (DEFAULT == item) currentFillStyle = defaultFillStyle;
                    else currentFillStyle = makeStyle(gStyle.fill);
                    gPos[2] = currentFillStyle;
                }

                item = gStyle.space;
                if (xt(item) && item !== currentSpace) currentSpace = item * scale

                item = gStyle.highlight;
                if (xt(item) && item !== highlightFlag) {

                    highlightFlag = item;
                    gPos[3] = highlightFlag;
                }

                item = gStyle.underline;
                if (xt(item) && item !== underlineFlag) {

                    underlineFlag = item;
                    gPos[4] = underlineFlag;
                }

                item = gStyle.overline;
                if (xt(item) && item !== overlineFlag) {

                    overlineFlag = item;
                    gPos[5] = overlineFlag;
                }

                if (i !== 0 && (gStyle.variant || gStyle.weight || gStyle.style || gStyle.size || gStyle.sizeValue || gStyle.sizeMetric || gStyle.family || gStyle.font)) {

                    item = glyphAttributes.update(gStyle);
                    if (item !== currentFont) {

                        currentFont = item;
                        gPos[0] = currentFont;

                        if (!fontArray.includes(currentFont)) fontArray.push(currentFont);
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
    engine.save();
    fontArray.forEach(font => {

        engine.font = font;

        const f = engine.measureText(defaultTextForHeightMeasurements);

        if (f.actualBoundingBoxAscent != null && f.actualBoundingBoxDescent != null) {

            fontLibrary[font] = _ceil(f.actualBoundingBoxAscent + f.actualBoundingBoxDescent);
        }
        else {

            // browsers differ in the value thy return for this measurement
            if (fontHeightCalculator) {

                fontHeightCalculator.style.font = font;
                item = fontHeightCalculator.clientHeight;
                fontLibrary[font] = item;
            }
            else fontLibrary[font] = 12;
        }
    });
    engine.restore();

    maxHeight = _max(..._values(fontLibrary));

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

        glyphArr = textPositions[i + 1];
        nextGlyph = (!treatWordAsGlyph && glyphArr) ? glyphArr[6] : false;

        len = (nextGlyph) ? engine.measureText(`${glyph}${nextGlyph}`).width : false;
        pairs.push(len);
    }

    for (i = 0, iz = pairs.length; i < iz; i++) {

        glyph = pairs[i];

        if (glyph) {

            len = singles[i] + singles[i + 1];
            gPos = textPositions[i + 1];

            if (len > glyph && !gPos[0]) {

                singles[i] -= (len - glyph);
            }
        }
    }

    // Calculate text line arrays
    for (i = 0, iz = textPositions.length; i < iz; i++) {

        glyphArr = textPositions[i];
        glyph = glyphArr[6];

        glyphWidth = singles[i] + textGlyphWidths[i];
        textGlyphWidths[i] = glyphWidth;

        if (treatWordAsGlyph || glyph == SPACE) ends = i;

        lineLen += glyphWidth;
        totalLen += glyphWidth;

        // Need `starts` to be less than `ends`
        // + This should make sure we pick up individual words that are longer than the Phrase entity's width
        if (lineLen >= width && starts < ends) {

            fragment = textGlyphs.slice(starts, ends).join(ZERO_STR);
            textLines.push(fragment);
            len = (treatWordAsGlyph) ? fragment.split(SPACE).length - 1 : fragment.split(SPACE).length;
            textLineWords.push(len);

            len = textGlyphWidths.slice(starts, ends).reduce((a, v) => a + v, 0);
            textLineWidths.push(len);

            lineLen -= len;
            starts = ends + 1;
        }

        // Need to pick up the last (or only) line
        if (i + 1 == iz) {

            // Pick up single line
            if (lineLen == totalLen) {

                fragment = mytext;

                textLines.push(fragment);
                textLineWords.push((treatWordAsGlyph) ? fragment.split(SPACE).length - 1 : fragment.split(SPACE).length);
                textLineWidths.push(totalLen);
            }

            // Final line of multiline text
            else {

                fragment = textGlyphs.slice(starts).join(ZERO_STR);
                textLines.push(fragment);
                len = (treatWordAsGlyph) ? fragment.split(SPACE).length - 1 : fragment.split(SPACE).length;
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

    dims[1] = _ceil((maxHeight * textLines.length * lineHeight) / scale);

    this.cleanHandle();
    this.dirtyHandle = false;

    const handle = this.currentHandle,
        handleX = -handle[0] * scale,
        handleY = -handle[1] * scale;

    // Handle path positioning (which we'll assume will need to be done for every display cycle) separately during stamping
    if (!path) {

        // 8. We should now be in a position where we can calculate each glyph's `startXY` values
        // + We have 2 non-path scenarios: full-justified text; and regular text

        // Scenario 1: `justify === 'full'`
        if (justify == FULL) {

            cursor = 0;
            height = handleY;

            for (i = 0, iz = textLineWidths.length; i < iz; i++) {

                len = handleX;

                if (i < iz - 1 && textLineWords[i] > 1) space = (width - textLineWidths[i]) / (textLineWords[i] - 1);
                else space = 0;

                for (j = 0, jz = [...textLines[i]].length; j < jz; j++) {

                    item = textPositions[cursor];

                    if (item[6] == SPACE) textGlyphWidths[cursor] += space;

                    item[7] = _floor(len);
                    item[8] = _floor(height);
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

                if (justify == RIGHT) len = (width - textLineWidths[i]) + handleX;
                else if (justify == CENTER) len = ((width - textLineWidths[i]) / 2) + handleX;
                else len = handleX;

                for (j = 0, jz = [...textLines[i]].length; j < jz; j++) {

                    item = textPositions[cursor];

                    // BUG: There's an issue here which causes the function to fail when `treatWordAsGlyph` flag is set to true. Affects non-path-referencing Phrase entitys. This test to see if item exists is a temporary fix.
                    // + Question: do we only care about treating word as glyph when it references a path? Probably no - we need to care about attempts to add space between letters (glyphs) as that may have an unwanted effect on heavily kerned fonts, or fonts with a lot of ligatures between various glyphs.
                    if (item) {

                        item[7] = _floor(len);
                        item[8] = _floor(height);
                        item[9] = textGlyphWidths[cursor];
                    }
                    len += textGlyphWidths[cursor];
                    cursor++;
                }

                cursor++;
                height += (maxHeight * lineHeight);
            }
        }
    }

    // 9. Clean up and exit
    if (!this.textGlyphs) this.textGlyphs = [];
    this.textGlyphs.length = 0;
    this.textGlyphs.push(...textGlyphs);
    releaseArray(textGlyphs);

    if (!this.textGlyphWidths) this.textGlyphWidths = [];
    this.textGlyphWidths.length = 0;
    this.textGlyphWidths.push(...textGlyphWidths);
    releaseArray(textGlyphWidths);

    if (!this.textLines) this.textLines = [];
    this.textLines.length = 0;
    this.textLines.push(...textLines);
    releaseArray(textLines);

    if (!this.textLineWidths) this.textLineWidths = [];
    this.textLineWidths.length = 0;
    this.textLineWidths.push(...textLineWidths);
    releaseArray(textLineWidths);

    if (!this.textLineWords) this.textLineWords = [];
    this.textLineWords.length = 0;
    this.textLineWords.push(...textLineWords);
    releaseArray(textLineWords);

    if (!this.textPositions) this.textPositions = [];
    this.textPositions.length = 0;
    this.textPositions.push(...textPositions);
    releaseArray(textPositions);

    this.textHeight = maxHeight;
    this.textLength = totalLen;

    this.fontLibrary = fontLibrary;

    releaseArray(fontArray);
    releaseArray(singles);
    releaseArray(pairs);

    releaseCell(myCell);
};


// ##### Stamping the entity onto a Cell wrapper &lt;canvas> element

// `regularStamp` - overwrites the mixin/entity.js function
P.regularStamp = function () {

    if (this.currentHost) {

        const { currentHost, method, preStamper, stamper, addTextPathRoll, currentHandle } = this;

        const engine = currentHost.engine;

        let i, iz, pos, data;

        if (method == NONE) this.performRotation(engine);

        // Scrawl-canvas clips canvases to the Phrase's hit area
        // + To 'clip' to the text, use stamp order and globalCompositeOperation instead
        else if (method == CLIP) {

            this.performRotation(engine);
            engine.clip(this.pathObject, this.winding);
        }

        else if (this.textPath) {

            if (!this.noCanvasEngineUpdates) currentHost.setEngine(this);

            // __Needs investigating:__ for some reason when applying a filter to a phrase entity the pool cell gets its baseline reset to default, which displaces the filter effect upwards. These lines fix the immediate issue, but don't solve the deeper mystery.
            engine.textBaseline = TOP;
            engine.textAlign = LEFT;

            this.getTextPath();
            this.calculateGlyphPathPositions();

            pos = this.textPositions;

            let p, pathData;

            const cr = this.currentRotation;

            // TODO: is this still needed?
            const aPR = this.addPathRotation;
            this.addPathRotation = addTextPathRoll;

            for (i = 0, iz = pos.length; i < iz; i++) {

                p = pos[i];
                pathData = p[10];

                if (pathData) {

                    this.currentPathData = pathData;
                    if (addTextPathRoll) this.currentRotation = pathData.angle;

                    currentHost.rotateDestination(engine, pathData.x, pathData.y, this);

                    engine.translate(-currentHandle[0], -currentHandle[1]);

                    data = preStamper(currentHost, engine, this, p);
                    stamper[method](engine, this, data);
                }
            }

            // TODO: is this still needed?
            this.addPathRotation = aPR;

            this.currentRotation = cr;
        }
        else {

            this.performRotation(engine);

            if (!this.noCanvasEngineUpdates) currentHost.setEngine(this);

            // ... See above
            engine.textBaseline = TOP;
            engine.textAlign = LEFT;

            pos = this.textPositions;

            for (i = 0, iz = pos.length; i < iz; i++) {

                data = preStamper(currentHost, engine, this, pos[i]);
                stamper[method](engine, this, data);
            }
            if (this.showBoundingBox) this.drawBoundingBox(engine);
        }
    }
};

// `calculateGlyphPathPositions` - internal helper function called by `regularStamp`
P.calculateGlyphPathPositions = function () {

    const path = this.getTextPath(),
        len = path.length,
        textPos = this.textPositions,
        widths = this.textGlyphWidths,
        direction = (this.textPathDirection == LTR) ? true : false,
        justify = this.justify,
        loop = this.textPathLoop,
        pathSpeed = this.constantPathSpeed;

    let posArray, i, iz, width,
        pathPos = this.textPathPosition,
        localPathPos;

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

            case CENTER :
                localPathPos = pathPos + ((width / 2) / len);
                posArray[7] = -width / 2;
                break;

            case RIGHT :
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

// `preStamper` - internal helper function called by `regularStamp`
P.preStamper = function (dest, engine, entity, args) {

    const makeStyle = function (s) {

        if (s.getData) return s.getData(entity, dest);

        return s;
    };

    const [font, strokeStyle, fillStyle, highlight, underline, overline, ...data] = args;

    if (font) engine.font = font;

    if (highlight || underline || overline) {

        const { highlightStyle, textHeight, underlineStyle, underlineWidth, underlinePosition, noUnderlineGlyphs, overlineStyle, overlineWidth, overlinePosition } = entity;

        engine.save();

        // data[0] - glyph
        // data[1] - xpos
        // data[2] - ypos
        // data[3] - width
        if (highlight) {

            engine.fillStyle = makeStyle(highlightStyle);
            engine.fillRect(data[1], data[2], data[3], textHeight);
        }

        if (underline && !noUnderlineGlyphs.includes(data[0])) {

            engine.fillStyle = makeStyle(underlineStyle);
            engine.fillRect(data[1], data[2] + (textHeight * underlinePosition), data[3], underlineWidth);
        }

        if (overline) {

            engine.fillStyle = makeStyle(overlineStyle);
            engine.fillRect(data[1], data[2] + (textHeight * overlinePosition), data[3], overlineWidth);
        }
        engine.restore();
    }

    if (strokeStyle) engine.strokeStyle = makeStyle(strokeStyle);
    if (fillStyle) engine.fillStyle = makeStyle(fillStyle);

    return data;
};

// `stamper` - object holding stamp method functions - functions called by `regularStamp`
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
        engine.fillText(...data);
        entity.currentHost.clearShadow();
        engine.strokeText(...data);
        engine.fillText(...data);
        entity.currentHost.restoreShadow(entity);
    },

    // `stamper.fillAndDraw`
    fillAndDraw: function (engine, entity, data) {

        engine.fillText(...data);
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

        const gco = engine.globalCompositeOperation;
        engine.globalCompositeOperation = DESTINATION_OUT;
        engine.fillText(...data);
        engine.globalCompositeOperation = gco;
    },
};

// `drawBoundingBox` - internal helper function called by `regularStamp`
P.drawBoundingBox = function (engine) {

    engine.save();
    engine.strokeStyle = this.boundingBoxColor;
    engine.lineWidth = 1;
    engine.globalCompositeOperation = SOURCE_OVER;
    engine.globalAlpha = 1;
    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;
    engine.stroke(this.pathObject);
    engine.restore();
};

// `performRotation` - internal helper function called by `regularStamp`
// + When doing text along a path, we have to perform a rendering context transformation for every glyph
// + In other cases, we perform the action on a per-line basis
P.performRotation = function (engine) {

    const dest = this.currentHost;

    if (dest) {

        const [x, y] = this.currentStampPosition;

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
export const makePhrase = function (items) {

    if (!items) return false;
    return new Phrase(items);
};

constructors.Phrase = Phrase;
