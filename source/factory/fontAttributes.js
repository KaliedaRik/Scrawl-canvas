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
import { mergeOver, pushUnique, xt, Ωempty } from '../core/utilities.js';

import { requestCell, releaseCell } from './cell-fragment.js';

import baseMix from '../mixin/base.js';


// #### FontAttributes constructor
const FontAttributes = function (items = Ωempty) {

    this.makeName(items.name);
    this.set(this.defs);
    this.set(items);

    return this;
};


// #### FontAttributes prototype
const P = FontAttributes.prototype = Object.create(Object.prototype);
P.type = 'FontAttributes';
P.lib = 'fontattribute';


// #### Mixins
baseMix(P);


// #### FontAttributes attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
const defaultAttributes = {

// __font__ - pseudo-attribute String which gets broken down into its component parts.
// + Once the breakdown completes the font string gets reassembled and then passed through a &lt;canvas> element's context engine to determine the actual font String that will be used by the engine. This value gets stored in the __temperedFontString__ attribute.

// _font-style_ - saved in the __style__ String attribute - acceptable values are: `normal`, `italic` and `oblique`. Note that browser handling of oblique (sloped rather than explicitly italic) fonts by their respective canvas context engines is, at best, idiosyncratic.
// + To explicitly use an oblique font design (often called 'slanted' or 'sloped'), reference the font face directly in the `family` or font strings.
    style: 'normal',


// _font-variant_ - saved in the __variant__ String attribute - the standard indicates that canvas context engine should only recognise `normal` and `small-caps` values. Do not use other possibilities (_font-variant-caps, font-variant-numeric, font-variant-ligatures, font-variant-east-asian, font-variant-alternates_) in font strings; scrawl-canvas will remove and/or ignore them when it parses the font string.
    variant: 'normal',


// _font-weight_ - saved in the __weight__ String attribute - acceptable values are: `normal`, `bold`, `lighter`, `bolder`; or a number (100. 200, 300, ... 900). Bold is generally the equivalent of 700, and normal is 400; lighter/bolder are values relative to the &lt;canvas> element's computed font weight. Note that browser handling of font weight requirements by their respective canvas context engines is not entirely standards compliant - for instance Safari browsers will generally ignore weight assertions in font strings.
// + To explicitly use a light, bold or heavy font design, reference the font face directly in the `family` or font strings.
    weight: 'normal',



// __font-stretch__ - saved in the __stretch__ String attribute acceptable values are: `normal`, `semi-condensed`, `condensed`, `extra-condensed`, `ultra-condensed`, `semi-expanded`, `expanded`, `extra-expanded`, `ultra-expanded`. Browser support for these values by the &lt;canvas> element's context engine is, for the most part, non-existant.
// + To explicitly use a condensed or stretched font design, reference the font face directly in the `family` or font strings.
    stretch: 'normal',


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
    sizeMetric: 'px',


// __font-family__ - any part of the font string that comes after the above declarations.
// + It is generally a good idea to include one of the preset defaults - `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`, `system-ui`, `math`, `emoji`, `fangsong` - at the end of the font or family string, to act as a fallback default as other fonts load.
// + Scrawl-canvas will attempt to redraw the display when fonts complete their (asynchronous) upload, but this may fail and need to be triggered manually.
    family: 'sans-serif',

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
    S = P.setters,
    D = P.deltaSetters;

// __size__ - pseudo-attribute 
// + getter returns a CSS fontSize String
G.size = function () {

    return (this.sizeValue) ? `${this.sizeValue}${this.sizeMetric}` : this.sizeMetric;
};

// + setter breaks the fontSize String into __sizeValue__ and __sizeMetric__ values
S.size = function (item) {

    if (xt(item)) {

        let res, 
            size = 0, 
            metric = 'medium';

        if (item.includes('xx-small')) metric = 'xx-small';
        else if (item.includes('x-small')) metric = 'x-small';
        else if (item.includes('smaller')) metric = 'smaller';
        else if (item.includes('small')) metric = 'small';
        else if (item.includes('medium')) metric = 'medium';
        else if (item.includes('xxx-large')) metric = 'xxx-large';
        else if (item.includes('xx-large')) metric = 'xx-large';
        else if (item.includes('x-large')) metric = 'x-large';
        else if (item.includes('larger')) metric = 'larger';
        else if (item.includes('large')) metric = 'large';

        else {
            size = 12;
            metric = 'px'
        }

        let full, val, suffix;

        let r = item.match(/(\d+\.\d+|\d+|\.\d+)(rem|em|rlh|lh|ex|cap|ch|ic|%|vw|vh|vmax|vmin|vi|vb|in|cm|mm|Q|pc|pt|px)?/i);

        if (Array.isArray(r)) {

            [full, val, suffix] = r;

            if (val && suffix && val != '.') {

                size = val;
                metric = suffix;
            }
        }
        else {

            r = item.match(/\/(\d+\.\d+|\d+|\.\d+)(rem|em|rlh|lh|ex|cap|ch|ic|%|vw|vh|vmax|vmin|vi|vb|in|cm|mm|Q|pc|pt|px)?/i);

            if (Array.isArray(r)) {

                [full, val, suffix] = r;

                if (val && suffix && val != '.') {

                    size = val;
                    metric = suffix;
                }
            }
        }
        if (size !== this.sizeValue) {

            this.sizeValue = size;
            this.dirtyFont = true;
        }
        if (metric !== this.sizeMetric) {

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

        let v = 'normal';

        v = (item.includes('italic')) ? 'italic' : v;
        v = (item.includes('oblique')) ? 'oblique' : v;

        if (v !== this.style) {

            this.style = v;
            this.dirtyFont = true;
        }
    }
};

// __variant__
S.variant = function (item) {

    if (xt(item)) {

        let v = 'normal';

        v = (item.includes('small-caps')) ? 'small-caps' : v;

        if (v !== this.variant) {

            this.variant = v;
            this.dirtyFont = true;
        }
    }
};

// __weight__
S.weight = function (item) {

    if (xt(item)) {

        let v = 'normal';

        // Handling direct entry of numbers
        if (item.toFixed) v = item;
        else {

            v = (item.includes('bold')) ? 'bold' : v;
            v = (item.includes('lighter')) ? 'lighter' : v;
            v = (item.includes('bolder')) ? 'bolder' : v;

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

        if (v !== this.weight) {

            this.weight = v;
            this.dirtyFont = true;
        }
    }
};

// __stretch__
S.stretch = function (item) {

    if (xt(item)) {

        let v = 'normal';

        v = (item.includes('condensed')) ? 'condensed' : v;
        v = (item.includes('semi-condensed')) ? 'semi-condensed' : v;
        v = (item.includes('extra-condensed')) ? 'extra-condensed' : v;
        v = (item.includes('ultra-condensed')) ? 'ultra-condensed' : v;
        v = (item.includes('expanded')) ? 'expanded' : v;
        v = (item.includes('semi-expanded')) ? 'semi-expanded' : v;
        v = (item.includes('extra-expanded')) ? 'extra-expanded' : v;
        v = (item.includes('ultra-expanded')) ? 'ultra-expanded' : v;

        if (v !== this.stretch) {

            this.stretch = v;
            this.dirtyFont = true;
        }
    }
};

// __family__
P.rfsTestArray1 = ['italic','oblique','small-caps','normal','bold','lighter','bolder','ultra-condensed','extra-condensed','semi-condensed','condensed','ultra-expanded','extra-expanded','semi-expanded','expanded','xx-small','x-small','small','medium','xxx-large','xx-large','x-large','large'];
P.rfsTestArray2 = ['0','1','2','3','4','5','6','7','8','9'];
S.family = function (item) {

    if (xt(item)) {

        let v = 'sans-serif';

        let itemArray = item.split(' '),
            len = itemArray.length;

        if (len === 1) v = item;

        let counter = 0,
            flag = true;

        while (flag) {

            if (counter === len) flag = false;
            else {

                let el = itemArray[counter];

                if (!el.length) counter++;
                else if (this.rfsTestArray1.includes(el)) counter++;
                else if (this.rfsTestArray2.includes(el[0])) counter++;
                else flag = false;
            }
        }
        if (counter < len) v = itemArray.slice(counter).join(' ');

        if (v !== this.family) {

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
    
    let currentHost = (this.host && this.host.type && this.host.type === 'Cell') ? this.host.name : '';
    if (host && host.type && host.type === 'Cell' && host.name !== currentHost) {

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

            if (!['in', 'cm', 'mm', 'Q', 'pc', 'pt', 'px'].includes(sizeMetric)) {

                this.dirtyFont = true;
                return '12px';
            }
        }
        else {

            [parentSize, rootSize, viewportWidth, viewportHeight] = host.getComputedFontSizes();
        }

        if (isNaN(sizeValue)) sizeValue = 12;

        let res = parentSize;

        switch (sizeMetric) {

            case 'rem' :
                res = rootSize * sizeValue;
                break;

            case 'em' :
                res = parentSize * sizeValue;
                break;

            case 'rlh' :
                res = (rootSize * lineHeight) * sizeValue;
                break;

            case 'lh' :
                res = (parentSize * lineHeight) * sizeValue;
                break;

            case 'ex' :
                res = (parentSize / 2) * sizeValue;
                break;

            case 'cap' :
                res = parentSize * sizeValue;
                break;

            case 'ch' :
                res = parentSize * sizeValue;
                break;

            case 'ic' :
                res = parentSize * sizeValue;
                break;

            case '%' :
                res = (parentSize / 100) * sizeValue;
                break;

            case 'vw' :
                res = (viewportWidth / 100) * sizeValue;
                break;

            case 'vh' :
                res = (viewportHeight / 100) * sizeValue;
                break;

            case 'vmax' :
                res = (Math.max(viewportWidth, viewportHeight) / 100) * sizeValue;
                break;

            case 'vmin' :
                res = (Math.min(viewportWidth, viewportHeight) / 100) * sizeValue;
                break;

            case 'vi' :
                res = (viewportWidth / 100) * sizeValue;
                break;

            case 'vb' :
                res = (viewportHeight / 100) * sizeValue;
                break;

            case 'in' :
                res = 96 * sizeValue;
                break;

            case 'cm' :
                res = 37.8 * sizeValue;
                break;

            case 'mm' :
                res = 3.78 * sizeValue;
                break;

            case 'Q' :
                res = 0.95 * sizeValue;
                break;

            case 'pc' :
                res = 16 * sizeValue;
                break;

            case 'pt' :
                res = 1.33 * sizeValue;
                break;

            case 'px' :
                res = sizeValue;
                break;

            case 'xx-small' :
                res = 0.6 * parentSize;
                break;

            case 'x-small' :
                res = 0.75 * parentSize;
                break;

            case 'smaller' :
                res = 0.8 * parentSize;
                break;

            case 'small' :
                res = 0.89 * parentSize;
                break;

            case 'xxx-large' :
                res = 3 * parentSize;
                break;

            case 'xx-large' :
                res = 2 * parentSize;
                break;

            case 'x-large' :
                res = 1.5 * parentSize;
                break;

            case 'larger' :
                res = 1.3 * parentSize;
                break;

            case 'large' :
                res = 1.2 * parentSize;
                break;
        }
        return `${res * scale}px`;
    }
    return '12px';
}

// `buildFont` - internal function
// + Takes into account a scaling factor
P.buildFont = function () {

    this.dirtyFont = false;

    let font = ''

    if (this.style !== 'normal') font += `${this.style} `;
    if (this.variant !== 'normal') font += `${this.variant} `;
    if (this.weight !== 'normal') font += `${this.weight} `;
    if (this.stretch !== 'normal') font += `${this.stretch} `;

    font += `${this.calculateSize()} `;

    font += `${this.family}`;

    // Temper the font string. Submit it to a canvas context engine to see what it makes of it
    let myCell = requestCell();
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
