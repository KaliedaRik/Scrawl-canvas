
// # Phrase factory

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality
import { constructors, cell, cellnames, styles, stylesnames, artefact } from '../core/library.js';
import { scrawlCanvasHold } from '../core/document.js';
import { mergeOver, pushUnique, xt, ensurePositiveFloat, ensureFloat, ensureString } from '../core/utilities.js';

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


// ## Phrase constructor
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

    this.glyphStyles = [];

    this.dirtyText = true;
    this.dirtyFont = true;
    this.dirtyPathObject = true;

    return this;
};


// ## Phrase object prototype setup
let P = Phrase.prototype = Object.create(Object.prototype);
P.type = 'Phrase';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// Apply mixins to prototype object
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = filterMix(P);


// ## Define default attributes
let defaultAttributes = {


// TODO - documentation

// How many of these attributes need to be in the defs section? If they're internal, they should not be here!
    text: '',
    textPositions: null,


// TODO - documentation
    textLines: null,
    textLineWidths: null,
    textLineWords: null,

    treatWordAsGlyph: false,

    textGlyphs: null,
    textGlyphWidths: null,


// Accessibility feature - when __exposeText__ is set to true, Scrawl-canvas will create an element in the DOM and mirror its current text value in that element. The element - a div - is attached to the canvas element's textHold element, which immediately follows that element and has zero dimensions, so its contents don't interfere with the flow of the rest of the DOM content.
    exposeText: false,


// Glyphs (individual letters) can be individually styled by adding a styling object to the __glyphStyles__ array. Subsequent glyphs will inherit those styles until a second styling object is encountered further along the array.

// Subsequent styling objects will alter specified attributes, leaving other attributes in their current (not default) state. To reset all attributes to their defaults and at the same time change selected attributes, include _defaults: true_ in the object.

// The styling object can take one or more of the following attributes:

// + style - eg 'italic'
// + variant - eg 'small-caps'
// + weight - eg 'bold'
// + stretch
// + size - any permitted font size value
// + family 

// + space - alter the letterSpacing values to spread or condense glyphs

// + fill - fillStyle to be applied to the glyph
// + stroke - strokeStyle to be applied to the glyph

// + highlight - boolean - whether highlight should be applied to the glyph

// + underline - boolean - whether underline should be applied to the glyph
// + overline - boolean - whether overline should be applied to the glyph

// + defaults - boolean - setting this to true will set the glyph (and subsequent glyphs) to the Phrase entity's current font and fill/stroke style values

// Example: "make the word __glyphs__ bold"

//    myPhrase.setGlyphStyles(14, {weight: 'bold'});
//    myPhrase.setGlyphStyles(20, {defaults: true});
//    myPhrase.setGlyphStyles(22, {fill: 'red'});
    glyphStyles: [],


// Permitted values are: 'left' (default), 'center', 'right', 'full'
    justify: 'left',


// A multiplier applied to the font height to add space between lines of text
    lineHeight: 1.5,


// The position and stroke style to be applied to a glyph when it is set to show underline or overline
    overlinePosition: 0.1,
    overlineStyle: 'rgb(250,0,0)',
    underlinePosition: 0.6,
    underlineStyle: 'rgb(250,0,0)',


// The fill style to be applied to a glyph when it is set to show background highlighting
    highlightStyle: 'rgba(250,218,94,0.4)',


// A set number of pixels to place between each glyph. Positive numbers only
    letterSpacing: 0,

// TODO - documentation
    textPath: '',
    textPathPosition: 0,
    textPathDirection: 'ltr',
    textPathLoop: true,
    addTextPathRoll: true,

// TODO - documentation
    boundingBoxColor: 'rgba(0,0,0,0.5)',
    showBoundingBox: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// ## Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['textPositions', 'textLines', 'textLineWidths', 'textLineWords', 'textGlyphs', 'textGlyphWidths', 'fontAttributes']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, []);
P.packetFunctions = pushUnique(P.packetFunctions, []);

P.finalizePacketOut = function (copy, items) {

    let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
    copy = mergeOver(copy, stateCopy);

    let fontAttributesCopy = JSON.parse(this.fontAttributes.saveAsPacket(items))[3];
    delete fontAttributesCopy.name;
    copy = mergeOver(copy, fontAttributesCopy);

    copy = this.handlePacketAnchor(copy, items);

    return copy;
};



// ## Define getter, setter and deltaSetter functions
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;


// Overwrites mixin/position.js function
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


// TODO - documentation

// Retrieving aspects of the font string
G.style = function () {

    return this.fontAttributes.get('style');
};
G.variant = function () {

    return this.fontAttributes.get('variant');
};
G.weight = function () {

    return this.fontAttributes.get('weight');
};
G.stretch = function () {

    return this.fontAttributes.get('stretch');
};
G.size = function () {

    return this.fontAttributes.get('size');
};
G.sizeValue = function () {

    return this.fontAttributes.get('sizeValue');
};
G.sizeMetric = function () {

    return this.fontAttributes.get('sizeMetric');
};
G.family = function () {

    return this.fontAttributes.get('family');
};
G.font = function () {

    return this.fontAttributes.get('font');
};

// TODO - documentation
S.font = function (item) {

    this.fontAttributes.set({font: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};
S.style = function (item) {

    this.fontAttributes.set({style: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};
S.variant = function (item) {

    this.fontAttributes.set({variant: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};
S.weight = function (item) {

    this.fontAttributes.set({weight: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};
S.stretch = function (item) {

    this.fontAttributes.set({stretch: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};
S.size = function (item) {

    this.fontAttributes.set({size: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
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
S.sizeMetric = function (item) {

    this.fontAttributes.set({sizeMetric: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};
S.family = function (item) {
    
    this.fontAttributes.set({family: item});

    this.dirtyFont = true;
    this.dirtyPathObject = true;
};


// TODO - documentation

// Handling text updates
S.textPath = function (item) {

    this.textPath = item;

    this.dirtyHandle = true;
    this.dirtyText = true;
    this.dirtyPathObject = true;
};

// TODO - documentation
S.text = function (item) {

    this.text = ensureString(item);
    
    this.dirtyText = true;
    this.dirtyPathObject = true;
};

// TODO - documentation
P.permittedJustifications = ['left', 'right', 'center', 'full'];
S.justify = function (item) {

    if (this.permittedJustifications.indexOf(item) >= 0) this.justify = item;
    
    this.dirtyText = true;
    this.dirtyPathObject = true;
};


// TODO - documentation

// Handling text width - overwrites functions defined in mixin/entity.js
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


// TODO - documentation

// Manipulating lineHeight and letterSpacing attributes
S.lineHeight = function (item) {

    this.lineHeight = ensurePositiveFloat(item, 3);

    this.dirtyPathObject = true;
    this.dirtyText = true;
};
D.lineHeight = function (item) {

    this.lineHeight += ensureFloat(item, 3);
    if (this.lineHeight < 0) this.lineHeight = 0;

    this.dirtyPathObject = true;
    this.dirtyText = true;
};

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


// TODO - documentation

// textPathPosition needs to take into account whether the text is looping along the path, or not
S.textPathPosition = function (item) {

    if (this.textPathLoop) {

        item = Math.abs(item);
        this.textPathPosition = item - Math.floor(item);
    }
    else this.textPathPosition = item;
};

D.textPathPosition = function (item) {

    let newVal = this.textPathPosition + item;

    if (this.textPathLoop) {

        newVal = Math.abs(newVal);
        this.textPathPosition = newVal - Math.floor(newVal);
    }
    else this.textPathPosition = newVal;
};


// ## Define prototype functions

// TODO - documentation
P.setGlyphStyles = function (args, ...pos) {

    if (args && Array.isArray(pos)) {

        let styles = this.glyphStyles,
            slot, style, i, iz;

        for (i = 0, iz = pos.length; i < iz; i++) {

            slot = pos[i];
            style = styles[slot];

            if (!style) styles[slot] = args;
            else mergeOver(style, args);
        }

        this.dirtyPathObject = true;
        this.dirtyText = true;
    }

    return this;
};

// TODO - documentation
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

// TODO - documentation
P.buildText = function () {

    this.dirtyText = false;
    this.text = this.convertTextEntityCharacters(this.text);
    this.calculateTextPositions(this.text);

    if (this.exposeText) {

        if (!this.exposedTextHold) {

            let myhold = document.createElement('div');
            myhold.id = `${this.name}-text-hold`;
            this.exposedTextHold = myhold;
            this.exposedTextHoldAttached = false;
        }

        this.exposedTextHold.textContent = this.text;

        if (!this.exposedTextHoldAttached) {

            if(this.currentHost && this.currentHost.controller && this.currentHost.controller.textHold) {

                this.currentHost.controller.textHold.appendChild(this.exposedTextHold);
                this.exposedTextHoldAttached = true;
            }
        }
    }
};


// TODO - documentation

// To get convert any HTML entity (eg: &lt; &epsilon;) in the text string into their required glyphs

// Also removes excessive white space
P.convertTextEntityCharacters = function (item) {

    let mytext = item.trim();

    mytext = mytext.replace(/[\s\uFEFF\xA0]+/g, ' ');

    textEntityConverter.innerHTML = mytext;
    return textEntityConverter.value;
};

// TODO - documentation

// (If you are not a fan of big, complex functions ... look away now!)
P.calculateTextPositions = function (mytext) {

    // 0. strokeStyle/fillStyle helper function
    // TODO: need to check (with a demo-test) that we can use gradients and patterns as styles
    let makeStyle = function (item) {

        if (item.substring) {

            let brokenStyle = false;

            if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
            else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];

            if (brokenStyle) return brokenStyle.getData(self, host, true);
            else return item;
        }
        else return item.getData(self, host, true);
    };

    // 1. setup - get values for text? arrays, current?, highlight?, ?Attributes, etc
    // TODO - check code uses all of these local variables; remove those that are not used
    let myCell = requestCell(),
        engine = myCell.engine;

    let self = this,
        host = (this.group && this.group.getHost) ? this.group.getHost() : myCell;

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

    let glyphStyles = this.glyphStyles;

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

    // 2. create textGlyphs array
    // - also shove the default font into the fontLibrary array
    textGlyphs = (treatWordAsGlyph) ? this.text.split(' ') : this.text.split('');
    fontArray.push(currentFont);

    // 3. textPositions array will include an array of data for each glyph
    // - [font, strokeStyle, fillStyle, highlight, underline, overline, text, startX, startY, (pathData)]
    // - and populate spacesArray with space position data (for full justify calculations later)
    // TODO - does current code use SpacesArray? If not, refactor code to delete it
    for (i = 0, iz = textGlyphs.length; i < iz; i++) {

        item = textGlyphs[i];

        textPositions[i] = [, , , , , , item, 0, 0, 0];

        if (item === ' ') spacesArray.push(i);
    }

    // 4. process the glyphStyles array to start populating the textPositions arrays
    if (!glyphStyles[0]) glyphStyles[0] = {
        family: glyphAttributes.family,
        size: (glyphAttributes.sizeValue) ? `${glyphAttributes.sizeValue}${glyphAttributes.sizeMetric}` : glyphAttributes.sizeMetric,
        stretch: glyphAttributes.stretch,
        style: glyphAttributes.style,
        variant: glyphAttributes.variant,
        weight: glyphAttributes.weight,
    };

    for (i = 0, iz = glyphStyles.length; i < iz; i++) {

        gStyle = glyphStyles[i];

        if (gStyle) {

            gPos = textPositions[i];

            if (i === 0) {
                gPos[0] = currentFont;
                gPos[1] = currentStrokeStyle;
                gPos[2] = currentFillStyle;
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

        // setup textGlyphWidths array, populating it with current letterSpacing values
        textGlyphWidths[i] = currentSpace;
    }

    // finish populating textGlyphWidths
    for (i = 0, iz = textGlyphs.length; i < iz; i++) {

        if (xt(textGlyphWidths[i])) currentSpace = textGlyphWidths[i];

        textGlyphWidths[i] = currentSpace;
    }

    // 5. calculate the text height value
    // - all lines in a multiline Phrase will use the maximum text height value, even if they don't include the biggest value
    fontArray.forEach(font => {

        fontHeightCalculator.style.font = font;
        item = fontHeightCalculator.clientHeight;
        fontLibrary[font] = item;
    });

    maxHeight = Math.max(...Object.values(fontLibrary));

    // 6. calculate glyph width values
    // - this is the tricky bit as, ideally, we need to take into account font kerning values
    // - however kerning values go out of the window when font attributes (especially size) change in mid-text
    // - and we need to remember that letterSpacing can also be different in different parts of the text
    // - this is also the best place to populate the textLine arrays

    // TODO - none of this takes into consideration the needs of RTL scripts eg Arabic, Hebrew, etc - needs testing, review and necessary refactor to fix (if required)

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

    // calculate text line arrays
    // TODO: create a demo-test for treatWordAsGlyph
    for (i = 0, iz = textPositions.length; i < iz; i++) {

        glyphArr = textPositions[i];
        glyph = glyphArr[6];

        glyphWidth = singles[i] + textGlyphWidths[i];
        textGlyphWidths[i] = glyphWidth;

        if (treatWordAsGlyph || glyph === ' ') ends = i;

        lineLen += glyphWidth;
        totalLen += glyphWidth;

        // need starts to be less than ends
        // - this should make sure we pick up individual words that are longer than the Phrase entity's width
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

        // need to pick up the last (or only) line
        if (i + 1 === iz) {

            // pick up single line
            if (lineLen === totalLen) {

                fragment = this.text;

                textLines.push(fragment);
                textLineWords.push((treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length);
                textLineWidths.push(totalLen);
            }

            // final line of multiline text
            else {

                fragment = textGlyphs.slice(starts).join('');
                textLines.push(fragment);
                len = (treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length;
                textLineWords.push(len);

                len = textGlyphWidths.slice(starts).reduce((a, v) => a + v, 0);
                textLineWidths.push(len);
            }
        }

        // and complete the population of data for highlight, overline, underline
        if (xt(glyphArr[3])) highlightFlag = glyphArr[3];
        if (xt(glyphArr[4])) underlineFlag = glyphArr[4];
        if (xt(glyphArr[5])) overlineFlag = glyphArr[5];

        glyphArr[3] = highlightFlag;
        glyphArr[4] = underlineFlag;
        glyphArr[5] = overlineFlag;
    }

    // handle path positioning (which we'll assume will need to be done for every display cycle) separately during stamping
    if (!path) {

        // 7. calculate localHeight
        if (scale <= 0) scale = 1;
        dims[1] = ((((textLines.length - 1) * maxHeight) * lineHeight) + maxHeight) / scale;

        this.cleanHandle();
        this.dirtyHandle = false;
        handle = this.currentHandle;
        
        handleX = -handle[0] * scale;
        handleY = -handle[1] * scale;

        // 8. we should now be in a position where we can calculate each glyph's startXY values

        // - we have 2 non-path scenarios: full-justified text; and regular text

        // Scenario 1: justify === 'full'
        if (justify === 'full') {

            cursor = 0;
            height = handleY + (maxHeight / 2);

            for (i = 0, iz = textLineWidths.length; i < iz; i++) {

                len = handleX;

                if (textLineWords[i] > 1) space = (width - textLineWidths[i]) / (textLineWords[i] - 1);
                else space = 0;

                for (j = 0, jz = textLines[i].length; j < jz; j++) {

                    item = textPositions[cursor];

                    if (item[6] === ' ') textGlyphWidths[cursor] += space;

                    item[7] = len;
                    item[8] = height;
                    item[9] = textGlyphWidths[cursor];

                    len += textGlyphWidths[cursor];

                    cursor++;
                }

                cursor++;
                height += (maxHeight * lineHeight);
            }
        }

        // Scenario 2: regular text - justify === 'left', or 'centre', or 'right'
        else {

            cursor = 0;
            height = handleY + (maxHeight / 2);

            for (i = 0, iz = textLineWidths.length; i < iz; i++) {

                if (justify === 'right') len = (width - textLineWidths[i]) + handleX;
                else if (justify === 'center') len = ((width - textLineWidths[i]) / 2) + handleX;
                else len = handleX;

                for (j = 0, jz = textLines[i].length; j < jz; j++) {

                    item = textPositions[cursor];

                    item[7] = len;
                    item[8] = height;
                    item[9] = textGlyphWidths[cursor];

                    len += textGlyphWidths[cursor];

                    cursor++;
                }

                cursor++;
                height += (maxHeight * lineHeight);
            }
        }
    }

    // 9. clean up and exit
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

// TODO - documentation
P.calculateGlyphPathPositions = function () {

    let path = this.getTextPath(),
        len = path.length,
        textPos = this.textPositions,
        widths = this.textGlyphWidths,
        direction = (this.textPathDirection === 'ltr') ? true : false,
        pathPos = this.textPathPosition,
        distance, posArray, i, iz, width,
        justify = this.justify,
        loop = this.textPathLoop;

    for (i = 0, iz = textPos.length; i < iz; i++) {

        posArray = textPos[i];
        width = widths[i];

        // TODO - using non-left justified text buggers up letter kerning along the line
        // - but left-justified makes the letters lean a little to the left
        if (justify === 'right') posArray[7] = -width;
        else if (justify === 'center') posArray[7] = -width / 2;

        posArray[10] = (pathPos <= 1 && pathPos >= 0) ? path.getPathPositionData(pathPos) : false;
        posArray[9] = width;

        if (direction) pathPos += (width / len);
        else pathPos -= (width / len);

        if (loop && (pathPos > 1 || pathPos < 0)) {

            pathPos = (pathPos > 0.5) ? pathPos - 1 : pathPos + 1;
        }
    }
};


// TODO - documentation

// Fonts don't have accessible paths
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {
        
        if (this.dirtyFont && this.fontAttributes) {

            this.dirtyFont = false;
            this.fontAttributes.buildFont(this.scale);
            this.dirtyText = true;
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

        p.rect(x, y, w, h);
    }
};

// TODO - documentation
P.regularStampSynchronousActions = function () {

    let dest = this.currentHost, 
        method = this.method,
        engine, i, iz, pos, data,
        preStamper = this.preStamper,
        stamper = this.stamper;

    if (dest) {

        engine = dest.engine;

        if (!this.noCanvasEngineUpdates) dest.setEngine(this);

        if (this.method === 'none') {

            this.performRotation(engine);
        }

        else if (this.textPath) {

            this.getTextPath();
            this.calculateGlyphPathPositions();

            pos = this.textPositions;

            let item, pathData,
                addTextPathRoll = this.addTextPathRoll,
                aPR = this.addPathRotation,
                cr = this.currentRotation;

            this.addPathRotation = addTextPathRoll;

            for (i = 0, iz = pos.length; i < iz; i++) {

                item = pos[i];

                pathData = item[10];

                if (pathData) {

                    this.currentPathData = pathData;
                    if (addTextPathRoll) this.currentRotation = pathData.angle;

                    dest.rotateDestination(engine, pathData.x, pathData.y, this);

                    data = preStamper(engine, this, item);
                    stamper[method](engine, this, data);
                }
            }

            this.addPathRotation = aPR;
            this.currentRotation = cr;
        }

        else {

            pos = this.textPositions;

            this.performRotation(engine);

            for (i = 0, iz = pos.length; i < iz; i++) {

                data = preStamper(engine, this, pos[i]);
                stamper[method](engine, this, data);
            }

            if (this.showBoundingBox) this.drawBoundingBox(engine);
        }
    }
};

// TODO - documentation
P.preStamper = function (engine, entity, args) {

    let [font, strokeStyle, fillStyle, highlight, underline, overline, ...data] = args;

    if (font) engine.font = font;

    if (highlight || underline || overline) {

        let highlightStyle = entity.highlightStyle,
            height = entity.textHeight,
            halfHeight = height / 2,
            underlineStyle = entity.underlineStyle,
            underlinePosition = entity.underlinePosition,
            overlineStyle = entity.overlineStyle,
            overlinePosition = entity.overlinePosition;

        engine.save();

        if (highlight) {

            engine.fillStyle = highlightStyle;
            engine.fillRect(data[1], data[2] - halfHeight, data[3], height);
        }

        if (underline) {

            engine.strokeStyle = underlineStyle;
            engine.strokeRect(data[1], data[2] - halfHeight + (height * underlinePosition), data[3], 1);
        }

        if (overline) {

            engine.strokeStyle = overlineStyle;
            engine.strokeRect(data[1], data[2] - halfHeight + (height * overlinePosition), data[3], 1);
        }

        engine.restore();
    }

    if (strokeStyle) engine.strokeStyle = strokeStyle;
    if (fillStyle) engine.fillStyle = fillStyle;

    return data;
};

// TODO - documentation
P.stamper = {

    draw: function (engine, entity, data) { 

        engine.strokeText(...data);
    },
    fill: function (engine, entity, data) { 

        engine.fillText(...data);
    },
    drawAndFill: function (engine, entity, data) { 

        engine.strokeText(...data);
        entity.currentHost.clearShadow();
        engine.fillText(...data);
        entity.currentHost.restoreShadow(entity);
    },
    fillAndDraw: function (engine, entity, data) { 

        engine.strokeText(...data);
        entity.currentHost.clearShadow();
        engine.fillText(...data);
        engine.strokeText(...data);
        entity.currentHost.restoreShadow(entity);
    },
    drawThenFill: function (engine, entity, data) { 

        engine.strokeText(...data);
        engine.fillText(...data);
    },
    fillThenDraw: function (engine, entity, data) { 

        engine.fillText(...data);
        engine.strokeText(...data);
    },
    clear: function (engine, entity, data) { 

        let gco = engine.globalCompositeOperation;
        engine.globalCompositeOperation = 'destination-out';
        engine.fillText(...data);
        engine.globalCompositeOperation = gco;
    },    
};

// TODO - documentation
P.drawBoundingBox = function (engine) {

    let handle = this.currentHandle,
        dims = this.currentDimensions,
        scale = this.currentScale,
        floor = Math.floor,
        ceil = Math.ceil;

    engine.save();
    engine.strokeStyle = this.boundingBoxColor;
    engine.lineWidth = 1;
    engine.globalCompositeOperation = 'source-over';
    engine.globalAlpha = 1;
    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;
    engine.strokeRect(floor(-handle[0] * scale), floor(-handle[1] * scale), ceil(dims[0] * scale), ceil(dims[1] * scale));
    engine.restore();
};

// TODO - documentation
P.performRotation = function (engine) {

    let dest = this.currentHost;

    if (dest) {

        let stamp = this.currentStampPosition;

        dest.rotateDestination(engine, stamp[0], stamp[1], this);
    }
};



// ## Exported factory function
const makePhrase = function (items) {
    return new Phrase(items);
};

constructors.Phrase = Phrase;

export {
    makePhrase,
};
