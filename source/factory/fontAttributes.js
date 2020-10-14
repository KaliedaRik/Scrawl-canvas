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
import { mergeOver, xt } from '../core/utilities.js';

import { requestCell, releaseCell } from './cell.js';

import baseMix from '../mixin/base.js';


// #### FontAttributes constructor
const FontAttributes = function (items = {}) {

    this.makeName(items.name);
    this.set(this.defs);
    this.set(items);

    return this;
};


// #### FontAttributes prototype
let P = FontAttributes.prototype = Object.create(Object.prototype);
P.type = 'FontAttributes';
P.lib = 'fontattribute';


// #### Mixins
P = baseMix(P);


// #### FontAttributes attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

// __font-style__
//
// _values:_ 
// + `normal`, `italic`, `oblique`
//
// CANVAS CONTEXT ENGINE - does not handle `oblique` slope values
    style: 'normal',


// __font-variant__ - the standard indicates that canvas context engine should only recognise `normal` and `small-caps` values
//
// CANVAS CONTEXT ENGINE - complies with the standard, thus Scrawl-canvas ignores all other possible values. Do not use them in font strings:
// + `font-variant-caps`
// + `font-variant-numeric`
// + `font-variant-ligatures`
// + `font-variant-east-asian`
// + `font-variant-alternates`
//
// 
    variant: 'normal',


// __font-weight__
//
// _Values:_ 
// + `normal`, `bold`, `lighter`, `bolder`; or
// + a number (between 1 and 1000, usually in 100 steps between 100 and 900)
//
// (`normal` translates to 400; `bold` translates to 700)
//
// CANVAS CONTEXT ENGINE - does seem to recognise both keyword and (x00) number values, but the interpretation of these values can be somewhat erratic. `normal` and `bold` keywords are generally respected and actioned as expected.
    weight: 'normal',



// __font-stretch__
//
// _Values:_ 
// + `normal` (default)
// + `semi-condensed`, `condensed`, `extra-condensed`, `ultra-condensed`
// + `semi-expanded`, `expanded`, `extra-expanded`, `ultra-expanded`
//
// We ignore number% values (permitted values are 50% - 200%) because the context engine only accepts a single font string and the syntax requirements for that font string are that "font-stretch may only be a single keyword value"
//
// CANVAS CONTEXT ENGINE - doesn't seem to recognise font-stretch values (for Garamond), but doesn't choke on their presence either
    stretch: 'normal',


// __font-size__
//
// Standard says: _"with the 'font-size' component converted to CSS pixels"_ 
// + TODO: hoping this means that canvas font will do this for us, rather than having to convert in code - if not, extract it by sticking an interim css style against the internal &lt;div> to get computed value?
//
// Values can be: 
//
// _Absolute or relative string values:_
// + `xx-small`, `x-small`, `small`, `medium`, `large`, `x-large`, `xx-large` 
// + `smaller`, `larger`
//
// _Length values:_ 
// + `1.2em`, `1.2ch`, `1.2ex`, `1.2rem`
// + (experimental!) `1.2cap`, `1.2ic`, `1.2lh`, `1.2rlh`
// + `1.2vh`, `1.2vw`, `1.2vmin`, `1.2vmax`
// + (experimental!) `1.2vi`, `1.2vb`
// + `1.2px`, `1.2cm`, `1.2mm`, `1.2in`, `1.2pc`, `1.2pt`
// + (experimental!) `1.2Q`
//
// Note that only the following have wide support; these are the only metrics this code tests for: `em`, `ch`, `ex`, `rem`, `vh`, `vw`, `vmin`, `vmax`, `px`, `cm`, `mm`, `in`, `pc`, `pt`
//
// _Percent values:_ 
// + `1.2%`
//
// (Percent values clash with font-stretch % values - assume any number followed by a % is a font-size value)
//
// GOTCHA NOTE 1: font-size is never a number; it must always have a metric. Tweens should be able to handle this requirement with no issues.
//
// GOTCHA NOTE 2: the canvas context engine refuses to handle line heights appended to the font size value (eg: `12px/1.2`) and expects all line height values to = `normal`. Scrawl-canvas handles line height for multiline phrases using an alternative mechanism. Thus including a `/lineheight` value in a font string may cause `Phrase.set` functionality to fail in unexpected ways.
    sizeValue: 12,
    sizeMetric: 'px',


// __font-family__ 
// + Always comes at the end of the string. 
// + More than one can be included, with each separated by commas
// + Be aware that string may often include quotes around font families with spaces in their names.
//
// Generic font names have been extended - values include: 
// + `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`, `system-ui`, `math`, `emoji`, `fangsong`
//
// GOTCHA NOTE: current functionality tests the supplied string with the expectation that the font families will be preceded by a font size metric value. To set the fontFamily value direct, put a font size metric at the start of the string - % will do - followed by a space and then the font family string:
// ```
// phraseInstance.set({
//     font: '% "Gill Sans", sans-serif'
// })
// ```
    family: 'sans-serif',

};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let G = P.getters,
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

        // For when the size has stuff before it in the string (which can, sadly, include numbers)
        if (/.* (\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i.test(item)) {
            
            res = item.match(/.* (\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i);
            size = (res[1] !== '.') ? parseFloat(res[1]) : 12;
            metric = res[2];
        }
        // For when the size starts the string
        else if (/^(\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i.test(item)) {
            
            res = item.match(/^(\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i);
            size = (res[1] !== '.') ? parseFloat(res[1]) : 12;
            metric = res[2];
        }

        this.sizeValue = size;
        this.sizeMetric = metric;
    }
};

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

    let v = 'normal';

    if (xt(item)) {

        v = (item.indexOf('italic') >= 0) ? 'italic' : v;
        v = (item.indexOf('oblique') >= 0) ? 'oblique' : v;
    }

    this.style = v;
};

// __variant__
S.variant = function (item) {

    let v = 'normal';

    v = (item.indexOf('small-caps') >= 0) ? 'small-caps' : v;

    this.variant = v;
};

// __weight__
S.weight = function (item) {

    let v = 'normal';

    if (xt(item)) {

        // Handling direct entry of numbers
        if (item.toFixed) v = item;
        else {

            v = (item.indexOf('bold') >= 0) ? 'bold' : v;
            v = (item.indexOf('lighter') >= 0) ? 'lighter' : v;
            v = (item.indexOf('bolder') >= 0) ? 'bolder' : v;

            // Putting spaces around the number should help identify it as a Weight value within the font string the string
            v = (item.indexOf(' 100 ') >= 0) ? '100' : v;
            v = (item.indexOf(' 200 ') >= 0) ? '200' : v;
            v = (item.indexOf(' 300 ') >= 0) ? '300' : v;
            v = (item.indexOf(' 400 ') >= 0) ? '400' : v;
            v = (item.indexOf(' 500 ') >= 0) ? '500' : v;
            v = (item.indexOf(' 600 ') >= 0) ? '600' : v;
            v = (item.indexOf(' 700 ') >= 0) ? '700' : v;
            v = (item.indexOf(' 800 ') >= 0) ? '800' : v;
            v = (item.indexOf(' 900 ') >= 0) ? '900' : v;

            // Also need to capture instances where a number value has been directly set with no other font attributes around it
            v = (/^\d00$/.test(item)) ? item : v;
        }
    }

    this.weight = v;
};

// __stretch__
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

// __family__
S.family = function (item) {

    if (xt(item)) {

        let guess = item.match(/( xx-small| x-small| small| medium| large| x-large| xx-large| smaller| larger|\d%|\dem|\dch|\dex|\drem|\dvh|\dvw|\dvmin|\dvmax|\dpx|\dcm|\dmm|\din|\dpc|\dpt) (.*)$/i);

        this.family = (guess && guess[2]) ? guess[2] : item;
    }
};


// #### Prototype functions

// `buildFont` - internal function
// + Takes into account a scaling factor
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

// `update` - `sets` items, then calls `buildFont`
P.update = function (scale = 1, items) {

    if (items) this.set(items);

    return this.buildFont(scale);
};


// #### Factory
const makeFontAttributes = function (items) {
    return new FontAttributes(items);
};

constructors.FontAttributes = FontAttributes;


// #### Exports
export {
    makeFontAttributes,
};
