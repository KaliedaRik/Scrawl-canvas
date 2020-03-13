
// # FontAttributes factory

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality


// ## Imports
import { constructors } from '../core/library.js';
import { mergeOver, xt } from '../core/utilities.js';

import { requestCell, releaseCell } from './cell.js';

import baseMix from '../mixin/base.js';

/*
## FontAttributes constructor
*/
const FontAttributes = function (items = {}) {

    this.makeName(items.name);
    this.set(this.defs);
    this.set(items);

    return this;
};


// ## FontAttributes object prototype setup

// Note - constructor uses naming functionality, but doesn't actually store the FontAttribute instances in the library - instead they are referenced directly from each Phrase instance. The library.fontattribute Object and library.fontattributenames Array are permanently empty.

// FontAttribute instances get cloned as part of the Phrase stamp functionality (because of subsequent 'update' invocations on them). If we stored FA instances in the library we'd risk running out of memory, or slowing up code speed, as the cloned instances are pretty temporary and get thrown away whenever a new Phrase.set invocation (involving font attributes) happens.
let P = FontAttributes.prototype = Object.create(Object.prototype);
P.type = 'FontAttributes';
P.lib = 'fontattribute';



// Apply mixins to prototype object
P = baseMix(P);



// ## Define default attributes
let defaultAttributes = {


// __font-style__

// _values:_ 
// + 'normal', 'italic', 'oblique'

// CANVAS CONTEXT ENGINE - does not handle oblique slope values
    style: 'normal',


// __font-variant__ - the standard indicates that canvas context engine should only recognise 'normal' and 'small-caps' values

// Scrawl-canvas ignores all other possible values. Do not use them in font strings.
// + font-variant-caps
// + font-variant-numeric
// + font-variant-ligatures
// + font-variant-east-asian
// + font-variant-alternates

// CANVAS CONTEXT ENGINE - only accepts 'small caps'
    variant: 'normal',


// __font-weight__

// _Values:_ 
// + 'normal', 'bold', 'lighter', 'bolder'; or
// + a number (between 1 and 1000)

// ('normal' translates to 400; 'bold' translates to 700)

// CANVAS CONTEXT ENGINE - doesn't seem to recognise number values (for Garamond), but doesn't choke on their presence either
    weight: 'normal',



// __font-stretch__

// _Values:_ 
// + 'normal' (default), 
// + 'semi-condensed', 'condensed', 'extra-condensed', 'ultra-condensed', 
// + 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded', 

// (Ignoring 'number%' values as it clashes with font-size % values, which are far more likely to be used in a font string)

// CANVAS CONTEXT ENGINE - doesn't seem to recognise font-stretch values (for Garamond), but doesn't choke on their presence either
    stretch: 'normal',


// __font-size__

// Standard says "with the 'font-size' component converted to CSS pixels" - hoping this means that canvas font will do this for us, rather than having to convert in code - if not, extract it by sticking an interim css style against the internal &lt;div> to get computed value?

// Values can be: 

// _Absolute or relative string values:_
// + 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large' 
// + 'smaller', 'larger'

// _Length values:_ 
// + 1.2em, 1.2ch, 1.2ex, 1.2rem
// + (experimental!) 1.2cap, 1.2ic, 1.2lh, 1.2rlh
// + 1.2vh, 1.2vw, 1.2vmin, 1.2vmax
// + (experimental!) 1.2vi, 1.2vb
// + 1.2px, 1.2cm, 1.2mm, 1.2in, 1.2pc, 1.2pt
// + (experimental!) 1.2Q

// Note that only the following have wide support; these are the only metrics this code tests for: em, ch, ex, rem, vh, vw, vmin, vmax, px, cm, mm, in, pc, pt

// _Percent values: 
// + 1.2%

// (Percent values clash with font-stretch % values - assume any number followed by a % is a font-size value)

// GOTCHA NOTE 1: font-size is never a number; it must always have a metric. Tweens should be able to handle this requirement with no issues.

// GOTCHA NOTE 2: the canvas context engine refuses to handle line heights appended to the font size value (eg: 12px/1.2) and expects all line height values to = 'normal'. Scrawl-canvas handles line height for multiline phrases using an alternative mechanism. Thus including a /lineheight value in a font string may cause .set() functionality to fail in unexpected ways.
    sizeValue: 12,
    sizeMetric: 'px',


// __font-family__ - always comes at the end of the string. More than one can be included, with each separated by commas - be aware that string may often include quotes around font families with spaces in their names.

// Generic font names have been extended - values include: 
// + 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'math', 'emoji', 'fangsong'

// GOTCHA NOTE: current functionality tests the supplied string with the expectation that the font families will be preceded by a font size metric value. To set the fontFamily value direct, put a font size metric at the start of the string - % will do - followed by a space and then the font family string:

//    phraseInstance.set({
//        font: '% "Gill Sans", sans-serif'
//    })
    family: 'sans-serif',

};
P.defs = mergeOver(P.defs, defaultAttributes);


// ## Packet management

// TODO


// ## Define getter, setter and deltaSetter functions
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

G.size = function () {

    return (this.sizeValue) ? `${this.sizeValue}${this.sizeMetric}` : this.sizeMetric;
};

// TODO - documentation
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

// TODO - documentation
S.style = function (item) {

    let v = 'normal';

    if (xt(item)) {

        v = (item.indexOf('italic') >= 0) ? 'italic' : v;
        v = (item.indexOf('oblique') >= 0) ? 'oblique' : v;
    }

    this.style = v;
};

S.variant = function (item) {

    let v = 'normal';

    v = (item.indexOf('small-caps') >= 0) ? 'small-caps' : v;

    this.variant = v;
};

S.weight = function (item) {

    let v = 'normal';

    if (xt(item)) {

        // handling direct entry of numbers
        if (item.toFixed) v = item;
        else {

            v = (item.indexOf('bold') >= 0) ? 'bold' : v;
            v = (item.indexOf('lighter') >= 0) ? 'lighter' : v;
            v = (item.indexOf('bolder') >= 0) ? 'bolder' : v;

            // putting spaces around the number should help identify it as a Weight value within the font string the string
            v = (item.indexOf(' 100 ') >= 0) ? '100' : v;
            v = (item.indexOf(' 200 ') >= 0) ? '200' : v;
            v = (item.indexOf(' 300 ') >= 0) ? '300' : v;
            v = (item.indexOf(' 400 ') >= 0) ? '400' : v;
            v = (item.indexOf(' 500 ') >= 0) ? '500' : v;
            v = (item.indexOf(' 600 ') >= 0) ? '600' : v;
            v = (item.indexOf(' 700 ') >= 0) ? '700' : v;
            v = (item.indexOf(' 800 ') >= 0) ? '800' : v;
            v = (item.indexOf(' 900 ') >= 0) ? '900' : v;

            // also need to capture instances where a number value has been directly set with no other font attributes around it
            v = (/^\d00$/.test(item)) ? item : v;
        }
    }

    this.weight = v;
};

S.stretch = function (item) {

    let v = 'normal';

    if (xt(item)) {

        v = (item.indexOf('semi-condensed') >= 0) ? 'semi-condensed' : v;
        v = (item.indexOf('condensed') >= 0) ? 'condensed' : v;
        v = (item.indexOf('extra-condensed') >= 0) ? 'extra-condensed' : v;
        v = (item.indexOf('ultra-condensed') >= 0) ? 'ultra-condensed' : v;
        v = (item.indexOf('semi-condensed') >= 0) ? 'semi-condensed' : v;
        v = (item.indexOf('condensed') >= 0) ? 'condensed' : v;
        v = (item.indexOf('extra-condensed') >= 0) ? 'extra-condensed' : v;
        v = (item.indexOf('ultra-condensed') >= 0) ? 'ultra-condensed' : v;
    }

    this.stretch = v;
};

S.size = function (item) {

    if (xt(item)) {

        let res, 
            size = 0, 
            metric = 'medium';

        // Canvas context engine (Chrome on MacBook Pro) interprets this as 9px Garamond
        if (item.indexOf('xx-small') >= 0) metric = 'xx-small';

        // Canvas context engine (Chrome on MacBook Pro) interprets this as 10px Garamond
        else if (item.indexOf('x-small') >= 0) metric = 'x-small';

        // Canvas context engine (Chrome on MacBook Pro) interprets this as 8.33px Garamond
        else if (item.indexOf('smaller') >= 0) metric = 'smaller';

        // Canvas context engine (Chrome on MacBook Pro) interprets this as 13px Garamond
        else if (item.indexOf('small') >= 0) metric = 'small';

        // Canvas context engine (Chrome on MacBook Pro) interprets this as 32px Garamond
        else if (item.indexOf('xx-large') >= 0) metric = 'xx-large';

        // Canvas context engine (Chrome on MacBook Pro) interprets this as 24px Garamond
        else if (item.indexOf('x-large') >= 0) metric = 'x-large';

        // Canvas context engine (Chrome on MacBook Pro) interprets this as 12px Garamond
        else if (item.indexOf('larger') >= 0) metric = 'larger';

        // Canvas context engine (Chrome on MacBook Pro) interprets this as 18px Garamond
        else if (item.indexOf('large') >= 0) metric = 'large';

        // Canvas context engine (Chrome on MacBook Pro) interprets this as 16px Garamond
        else if (item.indexOf('medium') >= 0) metric = 'medium';
        else {
            size = 12;
            metric = 'px'
        }

        // for when the size has stuff before it in the string (which can, sadly, include numbers)
        if (/.* (\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i.test(item)) {
            
            res = item.match(/.* (\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i);
            size = (res[1] !== '.') ? parseFloat(res[1]) : 12;
            metric = res[2];
        }
        // for when the size starts the string
        else if (/^(\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i.test(item)) {
            
            res = item.match(/^(\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i);
            size = (res[1] !== '.') ? parseFloat(res[1]) : 12;
            metric = res[2];
        }

        this.sizeValue = size;
        this.sizeMetric = metric;
    }
};

S.family = function (item) {

    if (xt(item)) {

        let guess = item.match(/( xx-small| x-small| small| medium| large| x-large| xx-large| smaller| larger|\d%|\dem|\dch|\dex|\drem|\dvh|\dvw|\dvmin|\dvmax|\dpx|\dcm|\dmm|\din|\dpc|\dpt) (.*)$/i);

        this.family = (guess && guess[2]) ? guess[2] : item;
    }
};


// ## Define prototype functions


// TODO - documentation
P.buildFont = function (scale = 1) {

    let font = ''

    if (this.style !== 'normal') font += `${this.style} `;
    if (this.variant !== 'normal') font += `${this.variant} `;
    if (this.weight !== 'normal') font += `${this.weight} `;
    if (this.stretch !== 'normal') font += `${this.stretch} `;
    if (this.sizeValue) font += `${this.sizeValue * scale}${this.sizeMetric} `;
    else font += `${this.sizeMetric} `;

    font += `${this.family}`;

    // Temper the font string. Submit it to a canvas context engine to see what it makes of it
    let myCell = requestCell();

    myCell.engine.font = font;
    font = myCell.engine.font;

    releaseCell(myCell);
    return font;
};

// TODO - documentation
P.update = function (scale = 1, items) {

    if (items) this.set(items);

    return this.buildFont(scale);
};



// ## Exported factory function
const makeFontAttributes = function (items) {
    return new FontAttributes(items);
};

constructors.FontAttributes = FontAttributes;

export {
    makeFontAttributes,
};
