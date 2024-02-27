// # TextStyle factory
// We have two use cases for this artefact
// + __mutable__ - used by Label entitys as their only TextStyle; by EnhancedText entitys as their default TextStyle
// + __immutable__ - set once and used by EnhancedText entitys to amend the styling of their default TextStyle as the text string requires


// CSS property `direction`                      maps to TextStyle `direction`
// CSS property `font-family`                    maps to TextStyle `fontFamily`
// CSS property `font-kerning`                   maps to TextStyle `fontKerning`
// CSS property `font-size`                      maps to TextStyle `fontSize`
// CSS property `font-stretch`                   maps to TextStyle `fontStretch`
// CSS property `font-style`                     maps to TextStyle `fontStyle`
// CSS property `font-variant-caps`              maps to TextStyle `fontVariantCaps`
// CSS property `font-weight`                    maps to TextStyle `fontWeight`
// CSS property `letter-spacing`                 maps to TextStyle `letterSpacing`
// CSS property `text-rendering`                 maps to TextStyle `textRendering`
// CSS property `word-spacing`                   maps to TextStyle `wordSpacing`
//
// CSS custom property `--SC-fill-style`         maps to TextStyle `fillStyle`
// CSS custom property `--SC-stroke-style`       maps to TextStyle `strokeStyle`
// CSS custom property `--SC-stroke-width`       maps to TextStyle `lineWidth`
//
// CSS custom property `--SC-include-highlight`  maps to TextStyle `includeHighlight`
// CSS custom property `--SC-highlight-style`    maps to TextStyle `highlightStyle`
//
// CSS custom property `--SC-include-overline`   maps to TextStyle `includeOverline`
// CSS custom property `--SC-overline-offset`    maps to TextStyle `overlineOffset`
// CSS custom property `--SC-overline-style`     maps to TextStyle `overlineStyle`
// CSS custom property `--SC-overline-width`     maps to TextStyle `overlineWidth`
//
// CSS custom property `--SC-include-underline`  maps to TextStyle `includeUnderline`
// CSS custom property `--SC-underline-gap`      maps to TextStyle `underlineGap`
// CSS custom property `--SC-underline-offset`   maps to TextStyle `underlineOffset`
// CSS custom property `--SC-underline-style`    maps to TextStyle `underlineStyle`
// CSS custom property `--SC-underline-width`    maps to TextStyle `underlineWidth`
//
// CSS custom property `--SC-method`             maps to TextStyle `method`
// ```
// <!-- Example CSS markup -->
// <style>
// /*
//    SC will expose each EnhancedLabel entity
//    by adding its name as a class to a hidden <div> element
//    when processing its text attribute (whenever updated)
//
//    Styling for the text string can take place within this class.
//    SC checks/imports/uses the attributes and custom properties listed above.
//    The custom properties can also be used as normal, for text displayed in non-JS environments.
// */
// .demo-my-label {
//
//     /* bold, italic, etc */
//     & b {
//         font-weight: bold;
//     }
//
//     & .bold {
//         font-weight: bold;
//     }
//
//     & strong {
//         --SC-include-highlight: true;
//         --SC-highlight-style: honeydew;
//
//         font-weight: bold;
//         background-color: var(--SC-highlight-style);
//     }
//
//     & i {
//         font-style: italic;
//     }
//
//     & em {
//         --SC-fill-style: blue;
//
//         font-style: italic;
//         color: var(--SC-fill-style);
//     }
//
//     & .italic {
//         font-style: italic;
//     }
//
//     & u {
//         --SC-include-underline: true;
//         text-decoration: underline;
//     }
//
//     /* underline, strikethrough */
//     & s {
//         --SC-include-overline: true;
//         --SC-overline-offset: 0.4;
//         --SC-overline-style: red;
//         --SC-overline-width: 5px;
//
//         text-decoration: line-through var(--SC-overline-style) var(--SC-overline-width);
//     }
//
//     & .underline {
//         --SC-include-underline: true;
//
//         text-decoration: underline;
//         font-variant: small-caps;
//     }
//
//     & .strike {
//         --SC-fill-style: gray;
//
//         --SC-include-overline: true;
//         --SC-overline-offset: 0.5;
//         --SC-overline-style: gray;
//         --SC-overline-width: 2px;
//
//         color: var(--SC-fill-style);
//         text-decoration-line: line-through;
//         text-decoration-color: var(--SC-overline-style);
//         text-decoration-thickness: var(--SC-overline-width);
//     }
//
//     /* letter- and word-spacing */
//     & .letter-spaced {
//         letter-spacing: 10px;
//     }
//
//     & .word-spaced {
//         word-spacing: 0.8rem;
//     }
//
//     /*.fonts */
//     & .make-bigger {
//         font-size: 120%;
//     }
//
//     & .make-monospace {
//         font-family: monospace;
//     }
//
//     /* colors */
//     & .red {
//         --SC-fill-style: red;
//
//         color: var(--SC-fill-style);
//     }
// }
// </style>
// ```


// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';

import { _isArray, _isFinite, _keys, AUTO, BLACK, DEFAULT_FONT_SIZE, DEFAULT_FONT, FILL, FONT_STRETCH_VALS, LINE_DASH, LTR, NAME, NORMAL, PC, SANS_SERIF, T_TEXT_STYLE, TEXTSTYLE, TRANSPARENT, UNDEF, YELLOW, ZERO_STR } from '../helper/shared-vars.js';

// #### Wheel constructor
const TextStyle = function (items = Ωempty) {

    this.isDefaultTextStyle = !!items.isDefaultTextStyle;

    if (this.isDefaultTextStyle) {

        this.set(this.defs);

        this.set(items);

        this.letterSpacing = `${this.letterSpaceValue}px`;
        this.wordSpacing = `${this.wordSpaceValue}px`;

        this.shadowBlur = 0;
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.shadowColor = TRANSPARENT;
    }
    else this.set(items, true);

    return this;
};


// #### TextStyle prototype
const P = TextStyle.prototype = doCreate();
P.type = T_TEXT_STYLE;


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
    `textAlign` - Cannot be set. Always has the value of 'left'.
    `textBaseline` - Cannot be set. Always has the value of 'top'.
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

    // #### Unit stamp method
    // One from: 'fill' (default), 'draw', 'fillAndDraw', 'drawAndFill'
    // + Other method values ('fillThenDraw', 'drawThenFill', 'clear', 'clip', 'none') will default to 'fill'
    method: FILL,
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

    if (item?.substring) this.fontSize = item.toLowerCase();
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
// No additional functionality defined


// #### Factory
// ```
// example needed
// ```
export const makeTextStyle = function (items) {

    if (!items) return false;
    return new TextStyle(items);
};

constructors.TextStyle = TextStyle;
