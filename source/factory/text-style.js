// # TextStyle factory
// We have two use cases for this artefact
// + __mutable__ - used by Label entitys as their only TextStyle; by EnhancedText entitys as their default TextStyle
// + __immutable__ - set once and used by EnhancedText entitys to amend the styling of their default TextStyle as the text string requires


// Mapping TextStyle attributes to CSS computed attributes
// + canvasFont           - local, not mapped
// + direction            - map directly
// + fillStyle            - map to variable `--SC-fill-style`
// + fontFamily           - map directly
// + fontKerning          - map directly
// + fontSize             - map directly
// + fontSizeValue        - local, not mapped
// + fontStretch          - map directly
// + fontString           - local, not mapped
// + fontStyle            - map directly
// + fontVariantCaps      - map directly
// + fontWeight           - map directly
// + highlightStyle       - map to variable `--SC-highlight-style`
// + includeHighlight     - local, not mapped
// + includeUnderline     - local, not mapped
// + isDefaultTextStyle   - local, not mapped
// + letterSpaceValue     - local, not mapped
// + letterSpacing        - map directly
// + lineDashOffset       - local, not mapped
// + lineWidth            - map to variable `--SC-stroke-width`
// + name                 - local, not mapped
// + strokeStyle          - map to variable `--SC-stroke-style`
// + textRendering        - map directly
// + underlineGap         - map to variable `--SC-underline-gap`
// + underlineOffset      - map to variable `--SC-underline-offset`
// + underlineStyle       - map to variable `--SC-underline-style`
// + underlineWidth       - map to variable `--SC-underline-width`
// + unitRotation         - local, not mapped
// + wordSpaceValue       - local, not mapped
// + wordSpacing          - map directly



// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';

import { _isArray, _isFinite, _keys, AUTO, BLACK, DEFAULT_FONT_SIZE, DEFAULT_FONT, FONT_STRETCH_VALS, LINE_DASH, LTR, NAME, NORMAL, PC, SANS_SERIF, T_TEXT_STYLE, TEXTSTYLE, UNDEF, YELLOW, ZERO_STR } from '../helper/shared-vars.js';

// #### Wheel constructor
const TextStyle = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.isDefaultTextStyle = !!items.isDefaultTextStyle;

    if (this.isDefaultTextStyle) {

        this.set(this.defs);

        this.set(items);
    }
    else this.set(items, true);

    return this;
};


// #### TextStyle prototype
const P = TextStyle.prototype = doCreate();
P.type = T_TEXT_STYLE;
P.lib = TEXTSTYLE;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### TextStyle attributes
const defaultAttributes = {

    // #### Canvas state - text-related attributes used by text units
    direction: LTR,
    fontKerning: NORMAL,
    fontStretch: NORMAL,
    fontVariantCaps: NORMAL,
    textRendering: AUTO,

    // #### Canvas state - non-text-related attributes used by text units
    fillStyle: BLACK,
    lineDash: null,
    lineDashOffset: 0,
    lineWidth: 1,
    strokeStyle: BLACK,

    // #### Canvas state - text-related attributes ignored by text units
    /*
    `font` - Cannot be set. Managed by local attributes 'fontString', 'canvasFont'
    `textAlign` - Cannot be set. Always has the value of 'left'
    `textBaseline` - Cannot be set. Always has the value of 'top'
    `letterSpacing` - Can be set/deltaSet. Managed by local attribute 'letterSpaceValue'
    `wordSpacing` - Can be set/deltaSet. Managed by local attribute 'wordSpaceValue'
    */
    canvasFont: DEFAULT_FONT,
    fontString: DEFAULT_FONT,
    letterSpaceValue: 0,
    wordSpaceValue: 0,

    // #### Canvas state - non-text-related attributes ignored by text units
    /*
    `globalAlpha` - Can be set/deltaSet. Handled by the entity, not here
    `globalCompositeOperation` - Can be set. Handled by the entity, not here
    `lineCap` - Cannot be set. Always has the value of 'round'
    `lineJoin` - Cannot be set. Always has the value of 'round'
    `miterLimit` - Cannot be set. Irrelevant as lineJoin/lineCap are permanently set to 'round'
    `filter` - Can be set. Handled by the entity, not here
    `imageSmoothingEnabled` - Can be set. Handled by the entity, not here
    `imageSmoothingQuality` - Can be set. Handled by the entity, not here

    Note that shadow functionality is not supported by EnhancedLabels
    `shadowOffsetX` - Can be set/deltaSet. Handled by the entity, not here.
    `shadowOffsetY` - Can be set/deltaSet. Handled by the entity, not here.
    `shadowBlur` - Can be set/deltaSet. Handled by the entity, not here.
    `shadowColor` - Can be set. Handled by the entity, not here.
    */

    // #### Unit font-related attributes
    fontFamily: SANS_SERIF,
    fontSize: DEFAULT_FONT_SIZE,
    fontStyle: NORMAL,
    fontWeight: NORMAL,
    /*
    `fontSizeValue` - Internal attribute, not stored in defs object
    `lineHeight` - Handled by the entity (as `lineSpacing`), not here
    */

    // #### Unit underline styling
    // Underlines go behind the text, with clear guttering between the text characters and the underline
    // + Supports gradients, patterns and CSS color strings
    // + The underline thickness is adjustable via the `underlineWidth` attribute
    // + The position of the underline can be determined by the  `underlineOffset` attribute, which takes a unit number where `0` is the top of the font height and `1` represents the bottom of the font height
    // + the thickness of the gap between characters and the underline, where they overlap, is controlled by the `underlineGap` attribute, measured in pixels
    includeUnderline: false,
    underlineGap: 3,
    underlineOffset: 0,
    underlineStyle: ZERO_STR,
    underlineWidth: 1,

    // #### Unit overline styling
    // Overlines go over the text, with no guttering
    // + Supports gradients, patterns and CSS color strings
    // + The overline thickness is adjustable via the `overlineWidth` attribute
    // + The position of the overline can be determined by the  `overlineOffset` attribute, which takes a unit number where `0` is the top of the font height and `1` represents the bottom of the font height
    includeOverline: false,
    overlineOffset: 0,
    overlineStyle: ZERO_STR,
    overlineWidth: 1,

    // #### Unit highlight styling
    // Highlight goes behind the text and any underline, with no guttering provided. It is the full font height.
    // + Supports gradients, patterns and CSS color strings
    highlightStyle: YELLOW,
    includeHighlight: false,

    // #### Unit offsets and rotations
    // __unitOffset__ - Array of string enum, string% relative value, or absolute number (px) value.
    // + Horizontal enum values are 'left' (default), 'center', 'right' relative to the text unit's width (including `letterSpacing`)
    // + Vertical enum values are 'top' (default), 'center', 'bottom', 'hanging' (font-dependent), 'middle' (which is an alias of center), 'alphabetic' (font-dependent), 'ideographic' (font-dependent) - all relative to the font's reported height
    // + String% values are relative to the text unit's width and the font's reported height
    // + Number values are pixel distances from the top-left corner of the text unit
    // + __unitOffsetX__ and __unitOffsetY__ are supported pseudo-elements for getting and setting this attribute
    unitOffset: null,

    // __unitRotation__ - number representing degrees. A value of `0` (default) will display the text unit in alignment with its path; positive values rotate the text unit clockwise
    unitRotation: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.processPacketOut = function (key, value, incs) {

    let result = true;

    switch (key) {

        case LINE_DASH :

            if (!value.length) {

                result = (incs.includes(LINE_DASH)) ? true : false;
            }
            break;

        default :

            if (!incs.includes(key) && value === this.defs[key]) result = false;
    }
    return result;
};

P.finalizePacketOut = function (copy) {

    const fill = copy.fillStyle,
        stroke = copy.strokeStyle;

    if (fill && !fill.substring) copy.fillStyle = fill.name;
    if (stroke && !stroke.substring) copy.strokeStyle = stroke.name;

    return copy;
};


// #### Clone management
// Handled by Label and EnhancedLabel entity, not by the TextStyle object


// #### Kill management
// Handled by Label and EnhancedLabel entity, not by the TextStyle object


// #### Get, Set, deltaSet
// `set` - overwrites 'mixin/entity.js' function
P.set = function (items = Ωempty, override = false) {

    if (this.isDefaultTextStyle || override) {

        let i, key, val, fn;

        const keys = _keys(items),
            keysLen = keys.length;

        if (keysLen) {

            const setters = this.setters,
                defs = this.defs;

            for (i = 0; i < keysLen; i++) {

                key = keys[i];
                val = items[key];

                if (key && key != NAME && val != null) {

                    fn = setters[key];

                    if (fn) fn.call(this, val);
                    else if (typeof defs[key] != UNDEF) this[key] = val;
                }
            }
        }
    }
    return this;
};

// `setDelta` - overwrites 'mixin/entity.js' function
P.setDelta = function (items = Ωempty, override = false) {

    if (this.isDefaultTextStyle || override) {

        let i, key, val, fn;

        const keys = _keys(items),
            keysLen = keys.length;

        if (keysLen) {

            const setters = this.deltaSetters,
                defs = this.defs;

            for (i = 0; i < keysLen; i++) {

                key = keys[i];
                val = items[key];

                if (key && key != NAME && val != null) {

                    fn = setters[key];

                    if (fn) fn.call(this, val);
                    else if (typeof defs[key] != UNDEF) this[key] = addStrings(this[key], val);
                }
            }
        }
    }
    return this;
};


const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

S.fontString = function (item) {

    if (item?.substring) this.fontString = item;
};

S.fontSize = function (item) {

    const val = (!item?.toFixed) ? parseFloat(item) : item;

    if (_isFinite(val)) {

        this.fontSizeValue = val;
        this.fontSize = `${val}px`;
    }
};

S.fontStyle = function (item) {

    if (item?.substring) this.fontStyle = item.toLowerCase();
};

S.fontVariantCaps = function (item) {

    if (item?.substring) this.fontVariantCaps = item.toLowerCase();
};

S.fontStretch = function (item) {

    if (item?.substring) {

        this.fontStretch = this.fontStretchHelper(item);
    }
};
P.fontStretchHelper = function (item) {

    if (!item.substring) return NORMAL;

    item = item.toLowerCase();

    if (FONT_STRETCH_VALS.includes(item)) return item;

    if (item.includes(PC)) {

        const val = parseFloat(item);

        if (_isFinite(val)) {
            if (val <= 50) return FONT_STRETCH_VALS[0];
            else if (val <= 62.5) return FONT_STRETCH_VALS[1];
            else if (val <= 75) return FONT_STRETCH_VALS[2];
            else if (val <= 87.5) return FONT_STRETCH_VALS[3];
            else if (val >= 200) return FONT_STRETCH_VALS[7];
            else if (val >= 150) return FONT_STRETCH_VALS[6];
            else if (val >= 125) return FONT_STRETCH_VALS[5];
            else if (val >= 112.5) return FONT_STRETCH_VALS[4];
        }
    }
    return NORMAL;

}

S.fontWeight = function (item) {

    this.fontWeight = (item.toFixed) ? `${item}` : item;
};

S.direction = function (item) {

    if (item?.substring) this.direction = item;
};

S.fontKerning = function (item) {

    if (item?.substring) this.fontKerning = item;
};


G.letterSpaceValue = function () {

    return this.letterSpaceValue;
};
G.letterSpacing = function () {

    return `${this.letterSpaceValue}px`;
};
D.letterSpacing = function (item) {

    if (item === NORMAL) item = 0;

    const val = (!item?.toFixed) ? parseFloat(item) : item;

    if (_isFinite(val)) {

        this.letterSpaceValue += val;
        this.letterSpacing = `${this.letterSpaceValue}px`;
    }
};
S.letterSpacing = function (item) {

    if (item === NORMAL) item = 0;

    const val = (!item?.toFixed) ? parseFloat(item) : item;

    if (_isFinite(val)) {

        this.letterSpaceValue = val;
        this.letterSpacing = `${val}px`;
    }
};

G.wordSpaceValue = function () {

    return this.wordSpaceValue;
};
G.wordSpacing = function () {

    return `${this.wordSpaceValue}px`;
};
D.wordSpacing = function (item) {

    const val = (!item?.toFixed) ? parseFloat(item) : item;

    if (_isFinite(val)) {

        this.wordSpaceValue += val;
        this.wordSpacing = `${this.wordSpaceValue}px`;
    }
};
S.wordSpacing = function (item) {

    const val = (!item?.toFixed) ? parseFloat(item) : item;

    if (_isFinite(val)) {

        this.wordSpaceValue = val;
        this.wordSpacing = `${val}px`;
    }
};

S.textRendering = function (item) {

    if (item?.substring) this.textRendering = item;
};

G.unitOffset = function () {

    return [...this.unitOffset];
};
G.unitOffsetX = function () {

    return this.unitOffset[0];
};
G.unitOffsetY = function () {

    return this.unitOffset[1];
};
S.unitOffset = function (item) {

    if (_isArray(item) && item.length === 2) {

        if (this.unitOffset == null) this.createUnitOffset();

        this.unitOffset[0] = item[0];
        this.unitOffset[1] = item[1];
    }
};
S.unitOffsetX = function (item) {

    if (this.unitOffset == null) this.createUnitOffset();

    this.unitOffset[0] = item;
};
S.unitOffsetY = function (item) {

    if (this.unitOffset == null) this.createUnitOffset();

    this.unitOffset[1] = item;
};

P.createUnitOffset = function () {

    this.unitOffset = ['top', 'left'];
};

D.unitRotation = function (item) {

    if (item.toFixed) this.unitRotation += item;
};
S.unitRotation = function (item) {

    if (item.toFixed) this.unitRotation = item;
};

G.textAlign = λnull;
S.textAlign = λnull;
G.textBaseline = λnull;
S.textBaseline = λnull;


// #### Prototype functions



// #### Factory
// ```
// example needed
// ```
export const makeTextStyle = function (items) {

    if (!items) return false;
    return new TextStyle(items);
};

constructors.TextStyle = TextStyle;
