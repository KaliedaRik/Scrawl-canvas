// # Color factory
// Color objects generate CSS rgb() or rgba() color strings, which can then be used to set an entity's [State](./state.html) object's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
// + Factory can accept any legal CSS color keyword as an attribute, alongside '#nnn' and '#nnnnnn' hexadecimal Strings. It will accept 'rgb()' and 'rgba()' strings under certain conditions.
// + It can also accept __r__, __g__, __b__ and __a__ channel Number attributes (0-255 integers for r, g, b; 0-1 float Number for a), from which a color can be constructed.
// + It can be used to generate random colors, using channel __max__ and __min__ integer Number attributes to limit the range of the random colors.
// + It can be deltaAnimated by setting channel __shift__ float Number attributes and setting the __autoUpdate__ Boolean flag to true. Delta animations can run until values hit their set max/min values, or can bounce between min and max values, depending on the setting of the channel __bounce__ Boolean flags.
// + It can also be animated directly, or using delta animation, or act as the target for __Tween__ animations.
// + Colors can be cloned, and killed.

// TODO: The color object does not yet handle the following color inputs:
// + `hsl[a](H, S, L[, A])` - color will be treated as transparent black
// + `hsl[a](H S L[ / A])` - color will be treated as transparent black
// + for `rgb()` and `rgba()`, if any of the values (including alpha) is given as a %Number, all values will be treated as percentages (in the spec, rgb values all need to be either integer Number 0-255, or %Number 0%-100%, but channels cannot mix the two notations, whereas the alpha value format _can_ differ from rgb value format)

// #### Demos:
// + [Canvas-031](../../demo/canvas-031.html) - Cell generation and processing order - kaleidoscope clock
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets; save and load a range of different entitys
// + [DOM-009](../../demo/dom-009.html) - Stop and restart the main animation loop; add and remove event listener; retrieve all artefacts at a given coordinate
// + [DOM-012](../../demo/dom-012.html) - Add and remove (kill) Scrawl-canvas canvas elements programmatically


// #### Imports
import { constructors, entity, radian } from '../core/library.js';
import { mergeOver, xt, xtGet, isa_obj, isa_fn, easeEngines, Ωempty, λfirstArg, pushUnique, interpolate } from '../core/utilities.js';

import { requestCell, releaseCell } from './cell.js';

import baseMix from '../mixin/base.js';


// #### Color constructor
const Color = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);

    this.rgb = [];
    this.rgb_max = [];
    this.rgb_min = [];

    this.hsl = [];
    this.hsl_max = [];
    this.hsl_min = [];

    this.hwb = [];
    this.hwb_max = [];
    this.hwb_min = [];

    this.xyz = [];
    this.xyz_max = [];
    this.xyz_min = [];

    this.lab = [];
    this.lab_max = [];
    this.lab_min = [];

    this.lch = [];
    this.lch_max = [];
    this.lch_min = [];

    this.easingFunction = λfirstArg;

    this.convert('transparent');
    this.convert('black', '_min');
    this.convert('white', '_max');

    this.set(items);

    return this;
};


// #### Color prototype
let P = Color.prototype = Object.create(Object.prototype);
P.type = 'Color';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Color attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {


// A Color object can hold details of three colors
// + The 'current', or last evaluated color
// + The 'maximum' range color; relevant attributes are suffixed with `_max`
// + The 'minimum' range color; relevant attributes are suffixed with `_min`
// 
// On recieving a color to store or process, the Color object will calculate the color's values in several different color spaces: `RGB`, `HSL`, `HWB`, `XYZ`, `LAB`, `LCH`
    rgb: null,
    rgb_max: null,
    rgb_min: null,

    hsl: null,
    hsl_max: null,
    hsl_min: null,

// hwb() color Strings are not yet widely supported as valid input into browser canvas engines
    hwb: null,
    hwb_max: null,
    hwb_min: null,

// xyz() colors are not valid CSS color strings; they are an intermediary step on the way to converting rgb color values into lab notation
    xyz: null,
    xyz_max: null,
    xyz_min: null,

// lab() color Strings are not yet widely supported as valid input into browser canvas engines
    lab: null,
    lab_max: null,
    lab_min: null,

// lch() color Strings are not yet widely supported as valid input into browser canvas engines
    lch: null,
    lch_max: null,
    lch_min: null,

// The __easing__ and __easingFunction__ attributes affect the `getRangeColor` function, applying an easing function to those requests. Value may be a predefined easing String name, or a function accepting a Number value and returning a Number value, both values to be positive floats in the range 0-1
    easing: 'linear',
    easingFunction: null,

// __colorSpace__ - String value defining the color space to be used by the Color object for its internal calculations.
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH'`
    colorSpace: 'RGB',

// __returnColorAs__ - String value defining the type of color String the Color object will return.
// + This is a shorter list than the internal colorSpace attribute as we only return values for CSS specified color spaces. Note that some of these color spaces are not widely supported across browsers and will lead to errors in canvases displayed on non-supported browsers
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'LAB', 'LCH'`
    returnColorAs: 'RGB',


// ##### Non-retained argument attributes (for factory, clone, set functions)
//
// __random__ - the factory function, and the clone function, can ask the Color object to set its initial channel values randomly by including this attribute in the argument object; if the attribute resolves to true, random color functionality is invoked to set the r, g and b channel attributes to appropriately random values.
//
// __color__, __minimumColor__, __maximumColor__ - CSS color definition Strings which the Color object will attempt to convert into various color space values.
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetFunctions = pushUnique(P.packetFunctions, ['easingFunction']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// Overwrites ./mixin/base.js
P.kill = function () {

    let myname = this.name;

    // Remove style from all entity state objects
    Object.entries(entity).forEach(([name, ent]) => {

        let state = ent.state;

        if (state) {

            let fill = state.fillStyle,
                stroke = state.strokeStyle,
                shadow = state.shadowColor;

            if (isa_obj(fill) && fill.name === myname) state.fillStyle = state.defs.fillStyle;
            if (isa_obj(stroke) && stroke.name === myname) state.strokeStyle = state.defs.strokeStyle;
            if (isa_obj(shadow) && shadow.name === myname) state.shadowColor = state.defs.shadowColor;
        }
    });
    
    // Remove style from the Scrawl-canvas library
    this.deregister();
    
    return this;
};


// #### Get, Set, deltaSet

// `get` - overrides function in mixin/base.js
P.get = function (item) {

    if (!xt(item)) {

        return this.getCurrentColor();
    }
    else if (item.toFixed) {

        return this.getRangeColor(item);
    }
    else if (item === 'min') {

        return this.getMinimumColor();
    }
    else if (item === 'max') {

        return this.getMaximumColor();
    }
    else if (item === 'random') {

        this.generateRandomColor();
        return this.getCurrentColor();
    }
    else{

        let getter = this.getters[item];

        if (getter) return getter.call(this);

        else {

            let def = this.defs[item];

            if (typeof def != 'undefined') {

                let val = this[item];
                return (typeof val != 'undefined') ? val : def;
            }
            return undef;
        }
    }
};


// `set` - overrides function in mixin/base.js - see above for the additional attributes the set object argument can use.
P.set = function (items = Ωempty) {

    const keys = Object.keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs;
        
        let predefined, i, iz, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key !== 'name' && value != null) {

                predefined = setters[key];

                if (predefined) predefined.call(this, value);
                else if (typeof defs[key] !== 'undefined') this[key] = value;
            }
        }
        if (items.random) this.generateRandomColor();
    }
    return this;
};

// #### Get, Set, deltaSet
let S = P.setters;

// The `color`, `minimumColor` and `maximumColor` functions take in a CSS color String and converts it into a set of arrays containing data relevant to various color spaces. __Note that browsers vary in the range of color spaces they support.__
// + Widely supported: various RGB space color Strings - keywords, hex values, `rgb()`, `rgba()`
// + Widely supported: HSL space color Strings - `hsl()`, `hsla()`
// + Valid, but poorly supported: HWB, LAB, LCH color spaces - `hwb()`, `lab()`, `lch()`
// + Not valid or supported: XYZ color space - `xyz()` - used internally to convert between RGB and LAB spaces
//
// These setter functions have complementary Color object functions: `setColor`, `setMinimumColor`, `setMaximumColor`
S.color = function (item) {

    this.convert(item);
};

P.setColor = function (item) {

    this.convert(item);
    return this;
};

S.minimumColor = function (item) {

    this.convert(item, '_min');
};
P.setMinimumColor = function (item) {

    this.convert(item, '_min');
    return this;
};

S.maximumColor = function (item) {

    this.convert(item, '_max');
};
P.setMaximumColor = function (item) {

    this.convert(item, '_max');
    return this;
};

// `easing` (and its complementary Color object functions: `setEasing`) - we can apply easing functions to colors, for instance when invoking the Color object's `getRangeColor()` function to return the most appropriate color between the Color object's minimum and maximum color values
// + Can accept a String value identifying an SC pre-defined easing function (default: `linear`)
// + Can also accept a function accepting a single Number argument (a value between 0-1) and returning an eased Number (again, between 0-1)
S.easing = function (item) {

    this.setEasingHelper(item);
};
S.easingFunction = S.easing;

P.setEasing = function (item) {

    this.setEasingHelper(item);
    return this;
};
P.setEasingFunction = P.setEasing;
P.setEasingHelper = function (item) {

    if (isa_fn(item)) {

        this.easing = 'function';
        this.easingFunction = item;
    }
    else if (item.substring && easeEngines[item]) {

        this.easing = item; 
        this.easingFunction = λfirstArg;
    }
    else {

        this.easing = 'linear'; 
        this.easingFunction = λfirstArg;
    }
};

P.internalColorSpaces = ['RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH'];
S.colorSpace = function (item) {

    this.setColorSpaceHelper(item);
};
P.setColorSpace = function (item) {

    this.setColorSpaceHelper(item);
    return this;
};
P.setColorSpaceHelper = function (item) {

    if (item.substring) {

        item = item.toUpperCase();

        if (this.internalColorSpaces.includes(item)) {

            const current = this.getCurrentColor(),
                min = this.getMinimumColor(),
                max = this.getMaximumColor();

            this.colorSpace = item.toUpperCase();
            this.updateColorConversions(current, min, max);
        }
    }
};

P.returnedColorSpaces = ['RGB', 'HSL', 'HWB', 'LAB', 'LCH'];
S.returnColorAs = function (item) {

    this.setReturnColorAsHelper(item);
};
P.setReturnColorAs = function (item) {
    
    this.setReturnColorAsHelper(item);
    return this;
};
P.setReturnColorAsHelper = function (item) {
    
    if (item.substring) {

        item = item.toUpperCase();

        if (this.returnedColorSpaces.includes(item)) {

            const current = this.getCurrentColor(),
                min = this.getMinimumColor(),
                max = this.getMaximumColor();

            this.returnColorAs = item.toUpperCase();
            this.updateColorConversions(current, min, max);
        }
    }
};


// #### Prototype functions

P.updateColorConversions = function (current, min, max) {

    this.convert(current);
    this.convert(min, '_min');
    this.convert(max, '_max');
};

// `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
P.getData = function () {

    return this.getCurrentColor();
};

P.getCurrentColor = function () {

    const { rgb, hsl, hwb, lab, lch } = this;
    return this.returnColor(rgb, hsl, hwb, lab, lch);
};

P.getMinimumColor = function () {

    const { rgb_min, hsl_min, hwb_min, lab_min, lch_min } = this;
    return this.returnColor(rgb_min, hsl_min, hwb_min, lab_min, lch_min);
};

P.getMaximumColor = function () {

    const { rgb_max, hsl_max, hwb_max, lab_max, lch_max } = this;
    return this.returnColor(rgb_max, hsl_max, hwb_max, lab_max, lch_max);
};

P.returnColor = function (rgb, hsl, hwb, lab, lch) {

    if (rgb == null) {

        ({rgb, hsl, hwb, lab, lch} = this);
    }

    const { buildColorString, returnColorAs } = this;

    switch (returnColorAs) {

        case 'RGB' : return buildColorString(...rgb, 'RGB');

        case 'HSL' : return buildColorString(...hsl, 'HSL');

        case 'HWB' :
            if (!supportsHWB) return buildColorString(...rgb, 'RGB');
            return buildColorString(...hwb, 'HWB');

        case 'LAB' :
            if (!supportsLAB) return buildColorString(...rgb, 'RGB');
            return buildColorString(...lab, 'LAB');

        case 'LCH' :
            if (!supportsLCH) return buildColorString(...rgb, 'RGB');
            return buildColorString(...lch, 'LCH');

        default :
            return 'rgba(0 0 0 / 0)';
    }
};

P.returnColorFromValues = function (b, c, d, a) {

    const { colorSpace, returnColorAs } = this;

    let col = this.buildColorString(b, c, d, a, colorSpace);

    let flag = false;
    if ('XYZ' === colorSpace) flag = true;
    else if (colorSpace !== returnColorAs) flag = true;
    else if ('HWB' === returnColorAs && !supportsHWB) flag = true;
    else if ('LAB' === returnColorAs && !supportsLAB) flag = true;
    else if ('LCH' === returnColorAs && !supportsLCH) flag = true;

    if (flag) {

        this.setColor(col);
        return this.returnColor();
    }
    return col;
};

P.buildColorString = function (a, b, c, d, req) {

    if (!req) req = this.returnColorAs;

    switch (req) {

        case 'RGB' : return `rgba(${Math.round(a)} ${Math.round(b)} ${Math.round(c)} / ${d})`;
        case 'HSL' : return `hsl(${a} ${b}% ${c}% / ${d})`;
        case 'HWB' : return `hwb(${a} ${b}% ${c}% / ${d})`;
        case 'LAB' : return `lab(${a}% ${b} ${c} / ${d})`;
        case 'LCH' : return `lch(${a}% ${b} ${c} / ${d})`;
        case 'XYZ' : return `xyz(${a}% ${b} ${c} / ${d})`;
        default : return 'rgba(0 0 0 / 0)';
    }
}

// `generateRandomColor` - generate a random, fully opaque color
P.generateRandomColor = function () {

    let r = Math.floor(Math.random() * 256),
        g = Math.floor(Math.random() * 256),
        b= Math.floor(Math.random() * 256);

    if (r > 255) r = 255;
    if (g > 255) g = 255;
    if (b > 255) b = 255;

    this.setColor(`rgb(${r} ${g} ${b})`);
};

// `getRangeColor` - function which generates a color in the range between the minimum and maximum colors. 
// + when the argument is `0` the minimum color is returned; values below 0 are rounded up to 0
// + when the argument is `1` the maximum color is returned; values above 1 are rounded down to 1
// + values between `0` and `1` will return a blended color between the minimum and maximum colors
// + non-Number arguments should return the Color's current color value
P.getRangeColor = function (item) {

    if (xt(item) && item.toFixed) {

        const { calculateRangeColorValues, buildColorString, setColor, getCurrentColor, colorSpace } = this;

        const vals = calculateRangeColorValues(item);

        const res = buildColorString(...vals, colorSpace);

        setColor(res);
    }
    return getCurrentColor();
};

// `calculateRangeColorValues` - internal helper function
P.calculateRangeColorValues = function (item) {

    const { colorSpace, easing, easingFunction } = this;

    let a, b, c, d;

    const col = colorSpace.toLowerCase();

    const [bMin, cMin, dMin, aMin] = this[`${col}_min`];
    const [bMax, cMax, dMax, aMax] = this[`${col}_max`];

    let engine = easingFunction;
    if (easing !== 'function' && easeEngines[easing]) engine = easeEngines[easing];

    const val = engine(item);

    if (aMin === aMax) a = aMin;
    else a = interpolate(val, aMin, aMax);

    if (bMin === bMax) b = bMin;
    else b = interpolate(val, bMin, bMax);

    if (cMin === cMax) c = cMin;
    else c = interpolate(val, cMin, cMax);

    if (dMin === dMax) d = dMin;
    else d = interpolate(val, dMin, dMax);

    return [b, c, d, a];
};

// `convert` - internal function. Takes a color string and converts it into a variety of color space values. Makes use of the following functions:
// + `convertHSLtoRGB`, `convertRGBtoHSL`
// + `convertHWBtoRGB`, `convertRGBtoHWB`, `convertRGBHtoHWB`
// + `convertXYZtoRGB`, `convertRGBtoXYZ`
// + `convertXYZtoLAB`, `convertLABtoXYZ`
// + `convertLABtoLCH`, `convertLCHtoLAB`
P.convert = function (color, suffix = '') {

    // Currently converting to as many color spaces as possible - we can make this more sane by only converting for the colors we want to convert (RGB + the internal color space + the returned color space)

    color = color.toLowerCase();

    const rgb = this[`rgb${suffix}`];
    const hsl = this[`hsl${suffix}`];
    const hwb = this[`hwb${suffix}`];
    const xyz = this[`xyz${suffix}`];
    const lab = this[`lab${suffix}`];
    const lch = this[`lch${suffix}`];

    // Initializing defs in the constructor causes an error - this should avoid it
    if (!rgb) return this;

    rgb.length = 0;
    hsl.length = 0;
    hwb.length = 0;
    xyz.length = 0;
    lab.length = 0;
    lch.length = 0;

    let r = 0,
        g = 0,
        b = 0,
        a = 0;

    // TODO: make this more efficient so we only convert to the color spaces we need (RGB, internal color space, return color space)
    if (color.indexOf('hwb') >= 0 && !supportsHWB) {

        // This could be handled better via a regex, but also need to deal with angle units
        color = color.replace('hwb', '');
        color = color.replace('(', '');
        color = color.replace(')', '');
        color = color.replace('/', '');

        const vals = color.split(' ').filter(e => e != null && e !== '');

        let hue = vals[0];
        if (hue.indexOf('deg') >= 0) hue = parseFloat(hue)
        else if (hue.indexOf('rad') >= 0) hue = parseFloat(hue) / radian;
        else if (hue.indexOf('grad') >= 0) hue = (parseFloat(hue) / 400) * 360;
        else if (hue.indexOf('turn') >= 0) hue = parseFloat(hue) * 360;
        else hue = parseFloat(hue);

       let white = parseFloat(vals[1]),
           black = parseFloat(vals[2]),
           alpha = vals[3];

        if (alpha != null) {

            a = (alpha.indexOf('%') >= 0) ? parseFloat(alpha) / 100 : parseFloat(alpha);
        }
        else a = 1;

        let [b, c, d] = this.convertHWBtoRGB(hue, white, black);

        b = Math.floor(b * 256);
        if (b > 255) b = 255;
        if (b < 0) b = 0;

        c = Math.floor(c * 256);
        if (c > 255) c = 255;
        if (c < 0) c = 0;

        d = Math.floor(d * 256);
        if (d > 255) d = 255;
        if (d < 0) d = 0;

        rgb.push(b, c, d, a);
        hsl.push(...this.convertRGBtoHSL(b, c, d), a);
        hwb.push(hue, white, black, a);
        xyz.push(...this.convertRGBtoXYZ(b, c, d), a);
        lab.push(...this.convertXYZtoLAB(xyz[0], xyz[1], xyz[2]), a);
        lch.push(...this.convertLABtoLCH(lab[0], lab[1], lab[2]), a);
    } 
    // The Color specification doesn't define an XYZ standard input for CSS. So we have to make one up ourselves. SC expects to receive colors defined in the XYZ color space to be raw float Numbers separated by spaces and (if required) a slash followed by the alpha value
    // + `xyz(x-value y-value z-value)` (with alpha = 1, opaque)
    // + `xyz(x-value y-value z-value / alpha-value)`
    else if (color.indexOf('xyz') >= 0) {
        
        color = color.replace('xyz', '');
        color = color.replace('(', '');
        color = color.replace(')', '');
        color = color.replace('/', '');

        const vals = color.split(' ').filter(e => e != null && e !== '');

        const x = parseFloat(vals[0]),
            y = parseFloat(vals[1]),
            z = parseFloat(vals[2]),
            alpha = vals[3];

        a = (alpha != null) ? parseFloat(alpha) : 1;

        rgb.push(...this.convertXYZtoRGB(x, y, z), a);
        hsl.push(...this.convertRGBtoHSL(rgb[0], rgb[1], rgb[2]), a);
        hwb.push(...this.convertRGBHtoHWB(rgb[0], rgb[1], rgb[2], hsl[0]), a);
        xyz.push(x, y, z, a);
        lab.push(...this.convertXYZtoLAB(x, y, z), a);
        lch.push(...this.convertLABtoLCH(lab[0], lab[1], lab[2]), a);
    }
    else if (color.indexOf('lab') >= 0 && !supportsLAB) {

        color = color.replace('lab', '');
        color = color.replace('(', '');
        color = color.replace(')', '');
        color = color.replace('/', '');

        const vals = color.split(' ').filter(e => e != null && e !== '');

        const b = parseFloat(vals[0]),
            c = parseFloat(vals[1]),
            d = parseFloat(vals[2]),
            alpha = vals[3];

        a = (alpha != null) ? parseFloat(alpha) : 1;

        lab.push(b, c, d, a);
        xyz.push(...this.convertLABtoXYZ(b, c, d), a);
        rgb.push(...this.convertXYZtoRGB(xyz[0], xyz[1], xyz[2]), a);
        hsl.push(...this.convertRGBtoHSL(rgb[0], rgb[1], rgb[2]), a);
        hwb.push(...this.convertRGBHtoHWB(rgb[0], rgb[1], rgb[2], hsl[0]), a);
        lch.push(...this.convertLABtoLCH(b, c, d), a);
    }
    else if (color.indexOf('lch') >= 0 && !supportsLCH) {

        color = color.replace('lch', '');
        color = color.replace('(', '');
        color = color.replace(')', '');
        color = color.replace('/', '');

        const vals = color.split(' ').filter(e => e != null && e !== '');

        const b = parseFloat(vals[0]),
            c = parseFloat(vals[1]),
            d = parseFloat(vals[2]),
            alpha = vals[3];

        a = (alpha != null) ? parseFloat(alpha) : 1;

        lch.push(b, c, d, a);
        lab.push(...this.convertLCHtoLAB(b, c, d), a);
        xyz.push(...this.convertLABtoXYZ(lab[0], lab[1], lab[2]), a);
        rgb.push(...this.convertXYZtoRGB(xyz[0], xyz[1], xyz[2]), a);
        hsl.push(...this.convertRGBtoHSL(rgb[0], rgb[1], rgb[2]), a);
        hwb.push(...this.convertRGBHtoHWB(rgb[0], rgb[1], rgb[2], hsl[0]), a);
    }
    else {

        [r, g, b, a] = this.getColorFromCanvas(color);
        rgb.push(r, g, b, a);
        hsl.push(...this.convertRGBtoHSL(r, g, b), a);
        hwb.push(...this.convertRGBHtoHWB(r, g, b, hsl[0]), a);
        xyz.push(...this.convertRGBtoXYZ(r, g, b), a);
        lab.push(...this.convertXYZtoLAB(xyz[0], xyz[1], xyz[2]), a);
        lch.push(...this.convertLABtoLCH(lab[0], lab[1], lab[2]), a);
    }
    return this;
};

P.getColorFromCanvas = function (color) {

    let r = 0,
        g = 0,
        b = 0,
        a = 0;

    const cell = requestCell();

    const { element, engine } = cell;

    element.width = 1;
    element.height = 1;

    engine.save();
    engine.globalAlpha = 1;
    engine.globalCompositeOperation = 'source-over';
    engine.fillStyle = color;

    engine.fillRect(0, 0, 1, 1);

    const image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;

        a /= 255;
    }
    engine.restore();
    releaseCell(cell);

    return [r, g, b, a];
};

// From [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/#rgb-to-hsl) - which is wrong because when I checked it sets up the hue value as NaN (!!!?!). So instead I've gone with the suggested answer in [this CSS-Tricks article](https://css-tricks.com/converting-color-spaces-in-javascript/)
P.convertRGBtoHSL = function (red, green, blue) {

    red /= 256;
    green /= 256;
    blue /= 256;

    let max = Math.max(red, green, blue);
    let min = Math.min(red, green, blue);
    let [hue, sat, light] = [0, 0, (min + max)/2];
    let d = max - min;

    if (d !== 0) {
        sat = (light === 0 || light === 1)
            ? 0
            : (max - light) / Math.min(light, 1 - light);

        switch (max) {
            case red:   hue = (green - blue) / d + (green < blue ? 6 : 0); break;
            case green: hue = (blue - red) / d + 2; break;
            case blue:  hue = (red - green) / d + 4;
        }

        hue = hue * 60;
    }

    return [hue, sat * 100, light * 100];
};

// From [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/#hsl-to-rgb)
P.convertHSLtoRGB = function (hue, sat, light) {
    
    hue = hue % 360;

    if (hue < 0) {
        hue += 360;
    }

    sat /= 100;
    light /= 100;

    const f = function (n) {
        let k = (n + hue/30) % 12;
        let a = sat * Math.min(light, 1 - light);
        return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    }
    return [f(0), f(8), f(4)];
};

// From [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/#rgb-to-hwb)
P.convertRGBtoHWB = function (red, green, blue) {

    let hsl = this.convertRGBtoHSL(red, green, blue, suffix);

    red /= 256;
    green /= 256;
    blue /= 256;

    let white = Math.min(red, green, blue);
    let black = 1 - Math.max(red, green, blue);

    return [hsl[0], white * 100, black * 100];
};

// From [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/#rgb-to-hwb)
P.convertRGBHtoHWB = function (red, green, blue, hue) {

    red /= 256;
    green /= 256;
    blue /= 256;

    let white = Math.min(red, green, blue);
    let black = 1 - Math.max(red, green, blue);

    return [hue, white * 100, black * 100];
};

// From [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/#hwb-to-rgb)
P.convertHWBtoRGB = function (hue, white, black) {
    
    white /= 100;
    black /= 100;

    if (white + black >= 1) {
    
        let gray = white / (white + black);
        return [gray, gray, gray];
    }

    let rgb = this.convertHSLtoRGB(hue, 100, 50);

    for (let i = 0; i < 3; i++) {

        rgb[i] *= (1 - white - black);
        rgb[i] += white;
    }
    return rgb;
};

// Code relating to XYZ conversion taken and adapted from the [vinaypillai/ac-colors repository](https://github.com/vinaypillai/ac-colors/blob/master/index.js) on GitHub
P.convertRGBtoXYZ = function (red, green, blue) {

    const invertGammaCorrection = function (val) {

        if (val <= 0.04045) return val / 12.92;
        return Math.pow((val + 0.055) / 1.055, 2.4);
    };

    red /= 255;
    green /= 255;
    blue /= 255;

    const r = invertGammaCorrection(red),
        g = invertGammaCorrection(green),
        b = invertGammaCorrection(blue);

    const x = (0.4124 * r) + (0.3576 * g) + (0.1805 * b),
        y = (0.2126 * r) + (0.7152 * g) + (0.0722 * b),
        z = (0.0193 * r) + (0.1192 * g) + (0.9505 * b);

    return [x * 100 + 0, y * 100 + 0, z * 100 + 0];
};

P.convertXYZtoRGB = function (x, y, z) {

    const addGammaCorrection = function (val) {

        if (val <= 0.0031308) return 12.92 * val;
        return (1.055 * Math.pow(val, 1 / 2.4)) - 0.055;
    };

    x /= 100;
    y /= 100;
    z /= 100;

    const r = (3.2406254773200533 * x) - (1.5372079722103187 * y) - (0.4986285986982479 * z),
      g = (-0.9689307147293197 * x) + (1.8757560608852415 * y) + (0.041517523842953964 * z),
      b = (0.055710120445510616 * x) + (-0.2040210505984867 * y) + (1.0569959422543882 * z);

    const red = addGammaCorrection(r),
        green = addGammaCorrection(g),
        blue = addGammaCorrection(b);

    return [Math.round(red * 255) + 0, Math.round(green * 255) + 0, Math.round(blue * 255) + 0];
};

P.convertXYZtoLAB = function (x, y, z) {

    const iX = 95.05,
        iY = 100,
        iZ = 108.9,
        eps = 216 / 24389,
        kap = 24389 / 27;

    const cbrt = (Math.cbrt != null) ? Math.cbrt : (val) => Math.pow(val, 1 / 3);

    const fwdTrans = (val) => (val > eps) ? cbrt(val) : ((kap * val) + 16) / 116;

    x /= iX;
    y /= iY;
    z /= iZ;

    const fX = fwdTrans(x),
        fY = fwdTrans(y),
        fZ = fwdTrans(z);

    const l = 116 * fY - 16,
        a = 500 * (fX - fY),
        b = 200 * (fY - fZ);

    return [l + 0, a + 0, b + 0];
};

P.convertLABtoXYZ = function (l, a, b) {

    const iX = 95.05,
        iY = 100,
        iZ = 108.9,
        eps = 216 / 24389,
        kap = 24389 / 27;

    const fY = (l + 16) / 116,
        fZ = (fY - b / 200),
        fX = a / 500 + fY;

    const xR = (Math.pow(fX, 3) > eps) ? Math.pow(fX, 3) : (116 * fX - 16) / kap,
        yR = (l > kap * eps) ? Math.pow((l + 16) / 116, 3) : l / kap,
        zR = (Math.pow(fZ, 3) > eps) ? Math.pow(fZ, 3) : (116 * fZ - 16) / kap;

    return [xR * iX + 0, yR * iY + 0, zR * iZ];
};

P.convertLABtoLCH = function (l, a, b) {

    const maxZeroTolerance = Math.pow(10, -12);

    b = (Math.abs(b) < Color.maxZeroTolerance) ? 0 : b;

    const c = Math.sqrt(a * a + b * b);

    const h = (Math.atan2(b, a) >= 0) ?
        Math.atan2(b, a) / Math.PI * 180 :
        Math.atan2(b, a) / Math.PI * 180 + 360;

    return [l + 0, c + 0, h + 0];
};

P.convertLCHtoLAB = function (l, c, h) {

    const a = c * Math.cos(h / 180 * Math.PI);
    const b = c * Math.sin(h / 180 * Math.PI);

    return [l + 0, a + 0, b + 0];
};


// We need to check whether the browser supports various color spaces. The simplest way to do that is to feed a color into a canvas element's engine, stamp a pixel, then check to see if the pixel is black (space not supported)
// + We check for HWB, LAB andf LCH color space support
// + We assume that the browser always supports RGB and HSL  color spaces
// + We don't check for XYZ color space support because it is not part of the [CSS Color Module Level 4 specification](https://www.w3.org/TR/css-color-4/)
let supportsHWB = false;
let supportsLAB = false;
let supportsLCH = false;

const browserChecker = function () {

    let r = 0,
        g = 0,
        b = 0,
        a = 0,
        image;

    const cell = requestCell();

    const { element, engine } = cell;

    element.width = 1;
    element.height = 1;

    engine.save();
    engine.globalAlpha = 1;
    engine.globalCompositeOperation = 'source-over';

    // Test for HWB support
    engine.fillStyle = 'hwb(90 10% 10%)';
    engine.fillRect(0, 0, 1, 1);

    image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;
    }
    if (r || g || b) supportsHWB = true;

    // Test for LAB support
    engine.fillStyle = 'lab(29.2345% 39.3825 20.0664)';
    engine.clearRect(0, 0, 1, 1);
    engine.fillRect(0, 0, 1, 1);

    image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;
    }
    if (r || g || b) supportsLAB = true;

    // Test for LCH support
    engine.fillStyle = 'lch(29.2345% 44.2 27)';
    engine.clearRect(0, 0, 1, 1);
    engine.fillRect(0, 0, 1, 1);

    image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;
    }
    if (r || g || b) supportsLCH = true;

    engine.restore();
    releaseCell(cell);
};
browserChecker();

// #### Factory
// ```
// scrawl.makeColor({
//
//     name: 'myColorObject',
//
//     r: 100,
//     g: 50,
//     b: 10,
//
//     rShift: 0.1,
//     gShift: 1,
//     bShift: -1.3,
//
//     rBounce: true,
//     gBounce: true,
//     bBounce: true,
//
//     rMax: 160,
//     gMax: 180,
//     bMax: 150,
//
//     autoUpdate: true,
// });
//
// scrawl.makeBlock({
//
//     name: 'block-tester',
//
//     width: 120,
//     height: 40,
//
//     startX: 60,
//     startY: 60,
//
//     fillStyle: 'myColorObject',
//     method: 'fill',
// });
// ```
const makeColor = function (items) {

    if (!items) return false;
    return new Color(items);
};

constructors.Color = Color;

// #### Exports
export {
    makeColor,
};
