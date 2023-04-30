// # FontAttributes factory
// FontAttribute objects are used exclusively by [Phrase](./phrase.html) entitys. They hold data about the Phrase entity's current font
// + The constructor uses naming functionality (from the [base](../mixin/base.html) mixin), but doesn't actually store FontAttribute instances in the [library](../core/library.html)
// + Instead they are referenced directly from each Phrase instance.
// + FontAttribute instances get cloned as part of the Phrase stamp functionality (because of subsequent 'update' invocations on them).
// + If we stored FA instances in the library we'd risk running out of memory, or slowing up code speed, as the cloned instances are pretty temporary and get thrown away whenever a new Phrase.set invocation (involving font attributes) happens.
//
// The Phrase entity includes functionality to allow the getting and setting of FontAttribute attributes directly on the entity instance.
//
// Note that &lt;canvas> context engines will attempt to display [variable fonts](https://web.dev/variable-fonts/), but the added functionality of those fonts is, for the most part, ignored. Scrawl-canvas makes no overt attempts to overcome this limitation.


// #### Demos:
// + All Phrase-related demos use FontAttribute objects in the background. Developers should never need to deal with them directly


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, xt, Ωempty } from '../core/utilities.js';

import { releaseCell, requestCell } from './cell-fragment.js';

import baseMix from '../mixin/base.js';

import { _isArray, _max, _min, _PC, _Q, BOLD, BOLDER, CAP, CH, CM, CONDENSED, DEFAULT_SIZE, EM, EX, EXPANDED, EXTRA_CONDENSED, EXTRA_EXPANDED, FONT_ATTRIBUTE, IC, IN, ITALIC, LARGE, LARGER, LH, LIGHTER, MEDIUM, MM, NORMAL, OBLIQUE, PC, PT, PX, REM, RFS_ARRAY_1, RFS_ARRAY_2, RLH, SANS_SERIF, SEMI_CONDENSED, SEMI_EXPANDED, SIZE_SUFFIX, SMALL, SMALL_CAPS, SMALLER, SPACE, STOP, T_CELL, T_FONT_ATTRIBUTES, ULTRA_CONDENSED, ULTRA_EXPANDED, VB, VH, VI, VMAX, VMIN, VW, X_LARGE, X_SMALL, XX_LARGE, XX_SMALL, XXX_LARGE, ZERO_STR } from '../core/shared-vars.js';



// #### FontAttributes constructor
const FontAttributes = function (items = Ωempty) {

    this.makeName(items.name);
    this.set(this.defs);
    this.set(items);

    return this;
};


// #### FontAttributes prototype
const P = FontAttributes.prototype = doCreate();
P.type = T_FONT_ATTRIBUTES;
P.lib = FONT_ATTRIBUTE;


// #### Mixins
baseMix(P);


// #### FontAttributes attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
const defaultAttributes = {

// __font__ - pseudo-attribute String which gets broken down into its component parts.
// + Once the breakdown completes the font string gets reassembled and then passed through a &lt;canvas> element's context engine to determine the actual font String that will be used by the engine. This value gets stored in the __temperedFontString__ attribute.

// _font-style_ - saved in the __style__ String attribute - acceptable values are: `normal`, `italic` and `oblique`. Note that browser handling of oblique (sloped rather than explicitly italic) fonts by their respective canvas context engines is, at best, idiosyncratic.
// + To explicitly use an oblique font design (often called 'slanted' or 'sloped'), reference the font face directly in the `family` or font strings.
    style: NORMAL,


// _font-variant_ - saved in the __variant__ String attribute - the standard indicates that canvas context engine should only recognise `normal` and `small-caps` values. Do not use other possibilities (_font-variant-caps, font-variant-numeric, font-variant-ligatures, font-variant-east-asian, font-variant-alternates_) in font strings; scrawl-canvas will remove and/or ignore them when it parses the font string.
    variant: NORMAL,


// _font-weight_ - saved in the __weight__ String attribute - acceptable values are: `normal`, `bold`, `lighter`, `bolder`; or a number (100. 200, 300, ... 900). Bold is generally the equivalent of 700, and normal is 400; lighter/bolder are values relative to the &lt;canvas> element's computed font weight. Note that browser handling of font weight requirements by their respective canvas context engines is not entirely standards compliant - for instance Safari browsers will generally ignore weight assertions in font strings.
// + To explicitly use a light, bold or heavy font design, reference the font face directly in the `family` or font strings.
    weight: NORMAL,

// __font-stretch__ - saved in the __stretch__ String attribute acceptable values are: `normal`, `semi-condensed`, `condensed`, `extra-condensed`, `ultra-condensed`, `semi-expanded`, `expanded`, `extra-expanded`, `ultra-expanded`. Browser support for these values by the &lt;canvas> element's context engine is, for the most part, non-existant.
// + To explicitly use a condensed or stretched font design, reference the font face directly in the `family` or font strings.
    stretch: NORMAL,


// _font-size_ - broken into two parts and saved in the __sizeValue__ Number and __sizeMetric__ String, each of which can be set separately. The W3C HTML Canvas 2D Context Recommendation states: _"with the 'font-size' component converted to CSS pixels"_. However, Scrawl-canvas makes every effort to respect and interpret non-px-based font-size requests.
// + Note that these pixel values are representative of the &lt;canvas> element's intrinsic drawing area dimensions, not of any such measure modified by CSS dimension rules (width, height, scale, skew, etc) applied to the canvas.
//
// Length values relative to some intrinsic propertly of the font - Scrawl-canvas will not attempt to interpret the following, instead treating them as some fixed proportion of the &lt;canvas> element's computed font size:
// + `1em` is the &lt;canvas> element's computed font size
// + `1rem` is the document root (&lt;html>) element's computed font size
// + `1lh` is the &lt;canvas> element's computed font size multiplied by the entity's line height value
// + `1rlh` is the document root (&lt;html>) element's computed font size multiplied by the entity's line height value
// + `1ex` is ≈ '0.5em'
// + `1cap`, `1ch`, `1ic` are all ≈ '1em'
//
// Length percentage values, with calculation based on the &lt;canvas> element's computed font size:
// + `120%` = '1.2em'
//
// Non-numerical values (in the Fonts standards, 'absolute-size' and 'relative-size' keywords) will calculate a size based on the &lt;canvas> element's computed font size:
// + `xx-small` = 60% of the computed font size
// + `x-small` = 75% of the computed font size
// + `small` = 89% of the computed font size
// + `medium` = 100% of the computed font size
// + `large` = 120% of the computed font size
// + `x-large` = 150% of the computed font size
// + `xx-large` = 200% of the computed font size
// + `xxx-large` = 300% of the computed font size
// + `smaller` = 80% of the computed font size
// + `larger` = 130% of the computed font size
//
// Length values relative to the browser's viewport (window) dimensions:
// + `1vw` and `1vh` represent 1% of the viewport's width and height, respectively
// + `1vmax` - is 1% of the larger viewport dimension
// + `1vmin` - is 1% of the smaller viewport dimension
// + Scrawl-canvas treats `1vi` as ≈ 1vw, and `1vb` as ≈ 1vh
//
// Absolute length values convert as follow:
// + `1in` (inch) = 96px
// + `1cm` (centimeter) = 37.80px
// + `1mm` (millimeter) = 3.78px
// + `1Q` (quarter mm) = 0.95px
// + `1pc` (pica) = 16px
// + `1pt` (point) = 1.33px
// + `1px` (pixel) = 1px
//
// Note: we break down the `size` attribute into two components: __sizeValue__ and __sizeMetric__. Line height values are ignored and, when present in a font string, may break the code!
    sizeValue: 12,
    sizeMetric: PX,


// __font-family__ - any part of the font string that comes after the above declarations.
// + It is generally a good idea to include one of the preset defaults - `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`, `system-ui`, `math`, `emoji`, `fangsong` - at the end of the font or family string, to act as a fallback default as other fonts load.
// + Scrawl-canvas will attempt to redraw the display when fonts complete their (asynchronous) upload, but this may fail and need to be triggered manually.
    family: SANS_SERIF,

};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional clone functionality required
// P.packetExclusions = pushUnique(P.packetExclusions, ['font']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters;

// __size__ - pseudo-attribute
// + getter returns a CSS fontSize String
G.size = function () {

    return (this.sizeValue) ? `${this.sizeValue}${this.sizeMetric}` : this.sizeMetric;
};

// + setter breaks the fontSize String into __sizeValue__ and __sizeMetric__ values
S.size = function (item) {

    if (xt(item)) {

        let size = 0,
            metric = MEDIUM;

        if (item.includes(XX_SMALL)) metric = XX_SMALL;
        else if (item.includes(X_SMALL)) metric = X_SMALL;
        else if (item.includes(SMALLER)) metric = SMALLER;
        else if (item.includes(SMALL)) metric = SMALL;
        else if (item.includes(MEDIUM)) metric = MEDIUM;
        else if (item.includes(XXX_LARGE)) metric = XXX_LARGE;
        else if (item.includes(XX_LARGE)) metric = XX_LARGE;
        else if (item.includes(X_LARGE)) metric = X_LARGE;
        else if (item.includes(LARGER)) metric = LARGER;
        else if (item.includes(LARGE)) metric = LARGE;

        else {
            size = 12;
            metric = PX
        }

        let val, suffix;

        let r = item.match(/(\d+\.\d+|\d+|\.\d+)(rem|em|rlh|lh|ex|cap|ch|ic|%|vw|vh|vmax|vmin|vi|vb|in|cm|mm|Q|pc|pt|px)?/i);

        if (_isArray(r)) {

            [, val, suffix] = r;

            if (val && suffix && val != STOP) {

                size = val;
                metric = suffix;
            }
        }
        else {

            r = item.match(/\/(\d+\.\d+|\d+|\.\d+)(rem|em|rlh|lh|ex|cap|ch|ic|%|vw|vh|vmax|vmin|vi|vb|in|cm|mm|Q|pc|pt|px)?/i);

            if (_isArray(r)) {

                [, val, suffix] = r;

                if (val && suffix && val != STOP) {

                    size = val;
                    metric = suffix;
                }
            }
        }
        if (size != this.sizeValue) {

            this.sizeValue = size;
            this.dirtyFont = true;
        }
        if (metric != this.sizeMetric) {

            this.sizeMetric = metric;
            this.dirtyFont = true;
        }
    }
};

S.sizeValue = function (item) {

    if (xt(item) && item !== this.sizeValue) {

        this.sizeValue = item;
        this.dirtyFont = true;
    }
}

S.sizeMetric = function (item) {

    if (xt(item) && item !== this.sizeMetric) {

        this.sizeMetric = item;
        this.dirtyFont = true;
    }
}

// __font__ - pseudo-attribute which calls various functions to break down the font String into its constituent parts
S.font = function (item) {

    if (xt(item)) {

        S.style.call(this, item);
        S.variant.call(this, item);
        S.weight.call(this, item);
        S.stretch.call(this, item);
        S.size.call(this, item);
        S.family.call(this, item);
    }
};

// __style__
S.style = function (item) {

    if (xt(item)) {

        let v = NORMAL;

        v = (item.includes(ITALIC)) ? ITALIC : v;
        v = (item.includes(OBLIQUE)) ? OBLIQUE : v;

        if (v != this.style) {

            this.style = v;
            this.dirtyFont = true;
        }
    }
};

// __variant__
S.variant = function (item) {

    if (xt(item)) {

        let v = NORMAL;

        v = (item.includes(SMALL_CAPS)) ? SMALL_CAPS : v;

        if (v !== this.variant) {

            this.variant = v;
            this.dirtyFont = true;
        }
    }
};

// __weight__
S.weight = function (item) {

    if (xt(item)) {

        let v = NORMAL;

        // Handling direct entry of numbers
        if (item.toFixed) v = item;
        else {

            v = (item.includes(BOLD)) ? BOLD : v;
            v = (item.includes(LIGHTER)) ? LIGHTER : v;
            v = (item.includes(BOLDER)) ? BOLDER : v;

            // Putting spaces around the number should help identify it as a Weight value within the font string the string
            v = (item.includes(' 100 ')) ? '100' : v;
            v = (item.includes(' 200 ')) ? '200' : v;
            v = (item.includes(' 300 ')) ? '300' : v;
            v = (item.includes(' 400 ')) ? '400' : v;
            v = (item.includes(' 500 ')) ? '500' : v;
            v = (item.includes(' 600 ')) ? '600' : v;
            v = (item.includes(' 700 ')) ? '700' : v;
            v = (item.includes(' 800 ')) ? '800' : v;
            v = (item.includes(' 900 ')) ? '900' : v;

            // Also need to capture instances where a number value has been directly set with no other font attributes around it
            v = (/^\d00$/.test(item)) ? item : v;
        }

        if (v != this.weight) {

            this.weight = v;
            this.dirtyFont = true;
        }
    }
};

// __stretch__
S.stretch = function (item) {

    if (xt(item)) {

        let v = NORMAL;

        v = (item.includes(CONDENSED)) ? CONDENSED : v;
        v = (item.includes(SEMI_CONDENSED)) ? SEMI_CONDENSED : v;
        v = (item.includes(EXTRA_CONDENSED)) ? EXTRA_CONDENSED : v;
        v = (item.includes(ULTRA_CONDENSED)) ? ULTRA_CONDENSED : v;
        v = (item.includes(EXPANDED)) ? EXPANDED : v;
        v = (item.includes(SEMI_EXPANDED)) ? SEMI_EXPANDED : v;
        v = (item.includes(EXTRA_EXPANDED)) ? EXTRA_EXPANDED : v;
        v = (item.includes(ULTRA_EXPANDED)) ? ULTRA_EXPANDED : v;

        if (v != this.stretch) {

            this.stretch = v;
            this.dirtyFont = true;
        }
    }
};

// __family__
S.family = function (item) {

    if (xt(item)) {

        let v = SANS_SERIF;

        const itemArray = item.split(SPACE),
            len = itemArray.length;

        if (len === 1) v = item;

        let counter = 0,
            flag = true;

        while (flag) {

            if (counter === len) flag = false;
            else {

                const el = itemArray[counter];

                if (!el.length) counter++;
                else if (RFS_ARRAY_1.includes(el)) counter++;
                else if (RFS_ARRAY_2.includes(el[0])) counter++;
                else flag = false;
            }
        }
        if (counter < len) v = itemArray.slice(counter).join(SPACE);

        if (v != this.family) {

            this.family = v;
            this.dirtyFont = true;
        }
    }
};


// #### Prototype functions
P.getFontString = function() {

    if (!this.dirtyFont && this.temperedFontString) return this.temperedFontString;
    else return this.buildFont();
}

P.updateMetadata = function (scale, lineHeight, host) {

    if (scale && scale.toFixed && scale > 0 && scale !== this.scale) {

        this.scale = scale;
        this.dirtyFont = true;
    }

    if (lineHeight && lineHeight.toFixed && lineHeight > 0 && lineHeight !== this.lineHeight) {

        this.lineHeight = lineHeight;
        this.dirtyFont = true;
    }

    const currentHost = (this.host && this.host.type && this.host.type == T_CELL) ? this.host.name : ZERO_STR;
    if (host && host.type && host.type == T_CELL && host.name !== currentHost) {

        this.host = host;
        this.dirtyFont = true;
    }
};

P.calculateSize = function () {

    if (this.host) {

        let {scale, lineHeight, host, sizeValue, sizeMetric} = this;

        let gcfs = host.getComputedFontSizes(),
            parentSize, rootSize, viewportWidth, viewportHeight;

        if (!gcfs) {

            if (!SIZE_SUFFIX.includes(sizeMetric)) {

                this.dirtyFont = true;
                return DEFAULT_SIZE;
            }
        }
        else {

            [parentSize, rootSize, viewportWidth, viewportHeight] = host.getComputedFontSizes();
        }

        if (isNaN(sizeValue)) sizeValue = 12;

        let res = parentSize;

        switch (sizeMetric) {

            case REM :
                res = rootSize * sizeValue;
                break;

            case EM :
                res = parentSize * sizeValue;
                break;

            case RLH :
                res = (rootSize * lineHeight) * sizeValue;
                break;

            case LH :
                res = (parentSize * lineHeight) * sizeValue;
                break;

            case EX :
                res = (parentSize / 2) * sizeValue;
                break;

            case CAP :
                res = parentSize * sizeValue;
                break;

            case CH :
                res = parentSize * sizeValue;
                break;

            case IC :
                res = parentSize * sizeValue;
                break;

            case PC :
                res = (parentSize / 100) * sizeValue;
                break;

            case VW :
                res = (viewportWidth / 100) * sizeValue;
                break;

            case VH :
                res = (viewportHeight / 100) * sizeValue;
                break;

            case VMAX :
                res = (_max(viewportWidth, viewportHeight) / 100) * sizeValue;
                break;

            case VMIN :
                res = (_min(viewportWidth, viewportHeight) / 100) * sizeValue;
                break;

            case VI :
                res = (viewportWidth / 100) * sizeValue;
                break;

            case VB :
                res = (viewportHeight / 100) * sizeValue;
                break;

            case IN :
                res = 96 * sizeValue;
                break;

            case CM :
                res = 37.8 * sizeValue;
                break;

            case MM :
                res = 3.78 * sizeValue;
                break;

            case _Q :
                res = 0.95 * sizeValue;
                break;

            case _PC :
                res = 16 * sizeValue;
                break;

            case PT :
                res = 1.33 * sizeValue;
                break;

            case PX :
                res = sizeValue;
                break;

            case XX_SMALL :
                res = 0.6 * parentSize;
                break;

            case X_SMALL :
                res = 0.75 * parentSize;
                break;

            case SMALLER :
                res = 0.8 * parentSize;
                break;

            case SMALL :
                res = 0.89 * parentSize;
                break;

            case XXX_LARGE :
                res = 3 * parentSize;
                break;

            case XX_LARGE :
                res = 2 * parentSize;
                break;

            case X_LARGE :
                res = 1.5 * parentSize;
                break;

            case LARGER :
                res = 1.3 * parentSize;
                break;

            case LARGE :
                res = 1.2 * parentSize;
                break;
        }
        return `${res * scale}px`;
    }
    return `${12 * this.scale}px`;
}

// `buildFont` - internal function
// + Takes into account a scaling factor
P.buildFont = function () {

    this.dirtyFont = false;

    let font = ZERO_STR;

    if (this.style != NORMAL) font += `${this.style} `;
    if (this.variant != NORMAL) font += `${this.variant} `;
    if (this.weight != NORMAL) font += `${this.weight} `;
    if (this.stretch != NORMAL) font += `${this.stretch} `;

    font += `${this.calculateSize()} `;

    font += `${this.family}`;

    // Temper the font string. Submit it to a canvas context engine to see what it makes of it
    const myCell = requestCell();
    myCell.engine.font = font;
    font = myCell.engine.font;
    releaseCell(myCell);

    this.temperedFontString = font;

    return font;
};

// `update` - `sets` items, then calls `buildFont`
P.update = function (items) {

    if (items) this.set(items);
    return this.getFontString();
};


// #### Factory
export const makeFontAttributes = function (items) {

    if (!items) return false;
    return new FontAttributes(items);
};

constructors.FontAttributes = FontAttributes;
