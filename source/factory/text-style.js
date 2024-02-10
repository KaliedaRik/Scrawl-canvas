// # TextStyle factory
// We have two use cases for this artefact
// + __mutable__ - used by Label entitys as their only TextStyle; by EnhancedText entitys as their default TextStyle
// + __immutable__ - set once and used by EnhancedText entitys to amend the styling of their default TextStyle as the text string requires



// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';

import { _keys, AUTO, BLACK, DEFAULT_FONT_SIZE, DEFAULT_FONT, LINE_DASH, LTR, NAME, NORMAL, SANS_SERIF, T_TEXT_STYLE, TEXTSTYLE, UNDEF, YELLOW, ZERO_STR } from '../helper/shared-vars.js';

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

    // Canvas state - text-related attributes used by text units
    direction: LTR,
    fontKerning: NORMAL,
    fontStretch: NORMAL,
    fontVariantCaps: NORMAL,
    textRendering: AUTO,

    // Canvas state - non-text-related attributes used by text units
    fillStyle: BLACK,
    lineDash: null,
    lineDashOffset: 0,
    lineWidth: 1,
    strokeStyle: BLACK,

    // Canvas state - text-related attributes ignored by text units
    /*
    font - Cannot be set. Managed by local attributes 'fontString', 'canvasFont'
    textAlign - Cannot be set. Always has the value of 'left'
    textBaseline - Cannot be set. Always has the value of 'top'
    letterSpacing - Can be set/deltaSet. Managed by local attribute 'letterSpaceValue'
    wordSpacing - Can be set/deltaSet. Managed by local attribute 'wordSpaceValue'
    */
    canvasFont: DEFAULT_FONT,
    fontString: DEFAULT_FONT,
    letterSpaceValue: 0,
    wordSpaceValue: 0,

    // Canvas state - non-text-related attributes ignored by text units
    /*
    globalAlpha - Can be set/deltaSet. Handled by the entity, not here
    globalCompositeOperation - Can be set. Handled by the entity, not here
    lineCap - Cannot be set. Always has the value of 'round'
    lineJoin - Cannot be set. Always has the value of 'round'
    miterLimit - Cannot be set. Irrelevant as lineJoin/lineCap are permanently set to 'round'
    shadowOffsetX - Can be set/deltaSet. Handled by the entity, not here
    shadowOffsetY - Can be set/deltaSet. Handled by the entity, not here
    shadowBlur - Can be set/deltaSet. Handled by the entity, not here
    shadowColor - Can be set. Handled by the entity, not here
    filter - Can be set. Handled by the entity, not here
    imageSmoothingEnabled - Can be set. Handled by the entity, not here
    imageSmoothingQuality - Can be set. Handled by the entity, not here
    */

    // Unit font-related attributes
    fontFamily: SANS_SERIF,
    fontSize: DEFAULT_FONT_SIZE,
    fontStyle: NORMAL,
    fontWeight: NORMAL,
    /*
    fontSizeValue - Internal attribute, not stored in defs object
    lineHeight - Handled by the entity, not here
    */

    // Unit underline styling
    includeUnderline: false,
    underlineGap: 3,
    underlineOffset: 0,
    underlineStyle: ZERO_STR,
    underlineWidth: 1,

    // Unit highlight styling
    highlightStyle: YELLOW,
    includeHighlight: false,
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

// G.rawFont = function () {

//     return this.fontString;
// };
// G.canvasFont = function () {

//     return this.canvasFont;
// };
// G.fontFamily = function () {

//     return this.fontFamily;
// };
S.fontString = function (item) {

    if (item?.substring) this.fontString = item;
};

S.fontSize = function (item) {

    this.fontSize = (item.toFixed) ? `${item}px` : item.toLowerCase();
};

S.fontStyle = function (item) {

    if (item?.substring) this.fontStyle = item.toLowerCase();
};

S.fontVariantCaps = function (item) {

    if (item?.substring) this.fontVariantCaps = item.toLowerCase();
};

S.fontStretch = function (item) {

    if (item?.substring) this.fontStretch = item.toLowerCase();
};

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

    this.letterSpaceValue += (!item?.toFixed) ? parseFloat(item) : 0;
};
S.letterSpacing = function (item) {

    this.letterSpaceValue = (!item?.toFixed) ? parseFloat(item) : 0;
};

G.wordSpaceValue = function () {

    return this.wordSpaceValue;
};
G.wordSpacing = function () {

    return `${this.wordSpaceValue}px`;
};
D.wordSpacing = function (item) {

    this.wordSpaceValue += (!item?.toFixed) ? parseFloat(item) : 0;
};
S.wordSpacing = function (item) {

    this.wordSpaceValue = (!item?.toFixed) ? parseFloat(item) : 0;
};

S.textRendering = function (item) {

    if (item?.substring) this.textRendering = item;
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
