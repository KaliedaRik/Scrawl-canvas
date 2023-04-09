// # Color factory

// #### Demos:
// While any entity using a color style will make use of color functionality, the following demos are most relevant for testing this functionality
// + [Canvas-003](../../demo/canvas-003.html) - Linear gradients
// + [Canvas-031](../../demo/canvas-031.html) - Cell generation and processing order - kaleidoscope clock
// + [Canvas-047](../../demo/canvas-047.html) - Easing functions for Color and Tween factories
// + [Canvas-059](../../demo/canvas-059.html) - CSS color space strings - rgb-key, rgb-hex, rgb(), rgba(), hsl(), hsla(), hwb(), lab(), lch(), oklab(), oklch()
// + [Filters-027](../../demo/filters-027.html) - Parameters for: reducePalette filter
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets; save and load a range of different entitys
// + [DOM-009](../../demo/dom-009.html) - Stop and restart the main animation loop; add and remove event listener; retrieve all artefacts at a given coordinate
// + [DOM-012](../../demo/dom-012.html) - Add and remove (kill) Scrawl-canvas canvas elements programmatically


// #### Imports
import { constructors, entity } from '../core/library.js';

import { correctAngle, doCreate, easeEngines, interpolate, isa_fn, isa_obj, mergeOver, pushUnique, xt, xtGet, λfirstArg, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';

import { _abs, _atan2, _cbrt, _cos, _entries, _floor, _freeze, _isArray, _keys, _max, _min, _pi, _pow, _radian,  _random, _round, _sin, _sqrt, _0, _2D, _HSL, _HWB, _LAB, _LCH, _MAX, _MIN, _OKLAB, _OKLCH, _RGB, _XYZ, BLACK, BLACK_HEX, BLANK, CANVAS, DEG, FUNCTION, GRAD, HSL, HSL_HWB_ARRAY, HWB, INT_COLOR_SPACES, LAB, LCH, LINEAR, MAX, MIN, NAME, NONE, OKLAB, OKLCH, PC, RAD, RANDOM, RET_COLOR_SPACES, RGB, SOURCE_OVER, SPACE, STYLES, T_COLOR, TURN, UNDEF, WHITE, XYZ, ZERO_STR } from '../core/shared-vars.js';


// Local constants
const E = 216/24389;
const K = 24389/27;
const cbrt = (_cbrt != null) ? _cbrt : (val) => _pow(val, 1 / 3);

const D50 = _freeze([0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585]);
const D65 = _freeze([0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290]);

const D65_to_D50_matrix = _freeze([
    _freeze([  1.0479298208405488,    0.022946793341019088,  -0.05019222954313557 ]),
    _freeze([  0.029627815688159344,  0.990434484573249,     -0.01707382502938514 ]),
    _freeze([ -0.009243058152591178,  0.015055144896577895,   0.7518742899580008  ])
]);

const D50_to_D65_matrix = _freeze([
    _freeze([  0.9554734527042182,   -0.023098536874261423,  0.0632593086610217   ]),
    _freeze([ -0.028369706963208136,  1.0099954580058226,    0.021041398966943008 ]),
    _freeze([  0.012314001688319899, -0.020507696433477912,  1.3303659366080753   ])
]);

const convertRGBtoXYZ_matrix = _freeze([
    _freeze([ 506752 / 1228815,  87881 / 245763,   12673 /   70218 ]),
    _freeze([  87098 /  409605, 175762 / 245763,   12673 /  175545 ]),
    _freeze([   7918 /  409605,  87881 / 737289, 1001167 / 1053270 ])
]);

const convertXYZtoRGB_matrix = _freeze([
    _freeze([   12831 /   3959,    -329 /    214, -1974 /   3959 ]),
    _freeze([ -851781 / 878810, 1648619 / 878810, 36519 / 878810 ]),
    _freeze([     705 /  12673,   -2585 /  12673,   705 /    667 ])
]);

const XYZtoLMS = _freeze([
    _freeze([ 0.8190224432164319,    0.3619062562801221,   -0.12887378261216414  ]),
    _freeze([ 0.0329836671980271,    0.9292868468965546,     0.03614466816999844 ]),
    _freeze([ 0.048177199566046255,  0.26423952494422764,    0.6335478258136937  ])
]);

const LMStoOKLab = _freeze([
    _freeze([  0.2104542553,   0.7936177850,  -0.0040720468 ]),
    _freeze([  1.9779984951,  -2.4285922050,   0.4505937099 ]),
    _freeze([  0.0259040371,   0.7827717662,  -0.8086757660 ])
]);

const LMStoXYZ =  _freeze([
    _freeze([  1.2268798733741557,  -0.5578149965554813,   0.28139105017721583 ]),
    _freeze([ -0.04057576262431372,  1.1122868293970594,  -0.07171106666151701 ]),
    _freeze([ -0.07637294974672142, -0.4214933239627914,   1.5869240244272418  ])
]);

const OKLabtoLMS = _freeze([
    _freeze([ 0.99999999845051981432,  0.39633779217376785678,   0.21580375806075880339  ]),
    _freeze([ 1.0000000088817607767,  -0.1055613423236563494,   -0.063854174771705903402 ]),
    _freeze([ 1.0000000546724109177,  -0.089484182094965759684, -1.2914855378640917399   ])
]);

// Local dedicated canvas
const element = document.createElement(CANVAS);
element.width = 1;
element.height = 1;

const engine = element.getContext(_2D, {
    willReadFrequently: true,
});
engine.globalAlpha = 1;
engine.globalCompositeOperation = SOURCE_OVER;

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

    this.oklab = [];
    this.oklab_max = [];
    this.oklab_min = [];

    this.oklch = [];
    this.oklch_max = [];
    this.oklch_min = [];

    this.easingFunction = λfirstArg;

    this.convert(BLANK);
    this.convert(BLACK, _MIN);
    this.convert(WHITE, _MAX);

    this.set(items);

    return this;
};


// #### Color prototype
const P = Color.prototype = doCreate();
P.type = T_COLOR;
P.lib = STYLES;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Color attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
const defaultAttributes = {


// A Color object can hold details of three colors
// + The 'current', or last evaluated color
// + The 'maximum' range color; relevant attributes are suffixed with `_max`
// + The 'minimum' range color; relevant attributes are suffixed with `_min`
// 
// On recieving a color to store or process, the Color object will calculate the color's values in several different color spaces: `RGB`, `HSL`, `HWB`, `XYZ`, `LAB`, `LCH`, `OKLAB`, `OKLCH`
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

// oklab() color Strings are not yet widely supported as valid input into browser canvas engines
    oklab: null,
    oklab_max: null,
    oklab_min: null,

// oklch() color Strings are not yet widely supported as valid input into browser canvas engines
    oklch: null,
    oklch_max: null,
    oklch_min: null,

// The __easing__ and __easingFunction__ attributes affect the `getRangeColor` function, applying an easing function to those requests. Value may be a predefined easing String name, or a function accepting a Number value and returning a Number value, both values to be positive floats in the range 0-1
    easing: LINEAR,
    easingFunction: null,

// __colorSpace__ - String value defining the color space to be used by the Color object for its internal calculations.
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH', 'OKLAB', 'OKLCH'`
    colorSpace: RGB,

// __returnColorAs__ - String value defining the type of color String the Color object will return.
// + This is a shorter list than the internal colorSpace attribute as we only return values for CSS specified color spaces. Note that some of these color spaces are not widely supported across browsers and will lead to errors in canvases displayed on non-supported browsers
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'LAB', 'LCH', 'OKLAB', 'OKLCH'`
    returnColorAs: RGB,


// ##### Non-retained argument attributes (for factory, clone, set functions)
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

    const myname = this.name;

    // Remove style from all entity state objects
    _entries(entity).forEach(([name, ent]) => {

        const state = ent.state;

        if (state) {

            const fill = state.fillStyle,
                stroke = state.strokeStyle,
                shadow = state.shadowColor;

            if (isa_obj(fill) && fill.name == myname) state.fillStyle = state.defs.fillStyle;
            if (isa_obj(stroke) && stroke.name == myname) state.strokeStyle = state.defs.strokeStyle;
            if (isa_obj(shadow) && shadow.name == myname) state.shadowColor = state.defs.shadowColor;
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
    else if (item == MIN) {

        return this.getMinimumColor();
    }
    else if (item == MAX) {

        return this.getMaximumColor();
    }
    else if (item == RANDOM) {

        this.generateRandomColor();
        return this.getCurrentColor();
    }
    else{

        let getter = this.getters[item];

        if (getter) return getter.call(this);

        else {

            let def = this.defs[item];

            if (typeof def != UNDEF) {

                let val = this[item];
                return (typeof val != UNDEF) ? val : def;
            }
            return undef;
        }
    }
};

// `set` - overrides function in mixin/base.js - see above for the additional attributes the set object argument can use.
P.set = function (items = Ωempty) {

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs;
        
        let predefined, i, iz, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key != NAME && value != null) {

                predefined = setters[key];

                if (predefined) predefined.call(this, value);
                else if (typeof defs[key] != UNDEF) this[key] = value;
            }
        }
        if (items.random) this.generateRandomColor();
    }
    return this;
};

// #### Get, Set, deltaSet
const S = P.setters;

// The `color`, `minimumColor` and `maximumColor` functions take in a CSS color String and converts it into a set of arrays containing data relevant to various color spaces. __Note that browsers vary in the range of color spaces they support.__
// + Widely supported: various RGB space color Strings - keywords, hex values, `rgb()`, `rgba()`
// + Widely supported: HSL space color Strings - `hsl()`, `hsla()`
// + Valid, but poorly supported: HWB, LAB, LCH, OKLAB, OKLCH color spaces - `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`
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

    this.convert(item, _MIN);
};
P.setMinimumColor = function (item) {

    this.convert(item, _MIN);
    return this;
};

S.maximumColor = function (item) {

    this.convert(item, _MAX);
};
P.setMaximumColor = function (item) {

    this.convert(item, _MAX);
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

        this.easing = FUNCTION;
        this.easingFunction = item;
    }
    else if (item.substring && easeEngines[item]) {

        this.easing = item; 
        this.easingFunction = λfirstArg;
    }
    else {

        this.easing = LINEAR; 
        this.easingFunction = λfirstArg;
    }
};

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

        if (INT_COLOR_SPACES.includes(item)) {

            const current = this.getCurrentColor(),
                min = this.getMinimumColor(),
                max = this.getMaximumColor();

            this.colorSpace = item.toUpperCase();
            this.updateColorConversions(current, min, max);
        }
    }
};

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

        if (RET_COLOR_SPACES.includes(item)) {

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
    this.convert(min, _MIN);
    this.convert(max, _MAX);
};

// `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
P.getData = function () {

    return this.getCurrentColor();
};

// `getCurrentColor` - returns current color
P.getCurrentColor = function () {

    const { rgb, hsl, hwb, lab, lch, oklab, oklch } = this;
    return this.returnColor(rgb, hsl, hwb, lab, lch, oklab, oklch);
};

// `getMinimumColor` - returns current color
P.getMinimumColor = function () {

    const { rgb_min, hsl_min, hwb_min, lab_min, lch_min, oklab_min, oklch_min } = this;
    return this.returnColor(rgb_min, hsl_min, hwb_min, lab_min, lch_min, oklab_min, oklch_min);
};

// `getMaximumColor` - returns current color
P.getMaximumColor = function () {

    const { rgb_max, hsl_max, hwb_max, lab_max, lch_max, oklab_max, oklch_max } = this;
    return this.returnColor(rgb_max, hsl_max, hwb_max, lab_max, lch_max, oklab_max, oklch_max);
};

// `returnColor` - internal helper function
P.returnColor = function (rgb, hsl, hwb, lab, lch, oklab, oklch) {

    if (rgb == null) {

        ({rgb, hsl, hwb, lab, lch, oklab, oklch} = this);
    }

    const { buildColorString, returnColorAs } = this;

    switch (returnColorAs) {

        case RGB: return buildColorString(...rgb, RGB);

        case HSL : return buildColorString(...hsl, HSL);

        case HWB :
            if (!supportsHWB) return buildColorString(...rgb, RGB);
            return buildColorString(...hwb, HWB);

        case LAB :
            if (!supportsLAB) return buildColorString(...rgb, RGB);
            return buildColorString(...lab, LAB);

        case LCH :
            if (!supportsLCH) return buildColorString(...rgb, RGB);
            return buildColorString(...lch, LCH);

        case OKLAB :
            if (!supportsOKLAB) return buildColorString(...rgb, RGB);
            return buildColorString(...oklab, OKLAB);

        case OKLCH :
            if (!supportsOKLCH) return buildColorString(...rgb, RGB);
            return buildColorString(...oklch, OKLCH);

        default :
            return BLANK;
    }
};

// `returnColorFromValues` - internal helper function
P.returnColorFromValues = function (b, c, d, a) {

    const { colorSpace, returnColorAs } = this;

    let col = this.buildColorString(b, c, d, a, colorSpace);

    let flag = false;
    if (XYZ == colorSpace) flag = true;
    else if (colorSpace != returnColorAs) flag = true;
    else if (HWB == returnColorAs && !supportsHWB) flag = true;
    else if (LAB == returnColorAs && !supportsLAB) flag = true;
    else if (LCH == returnColorAs && !supportsLCH) flag = true;
    else if (OKLAB == returnColorAs && !supportsOKLAB) flag = true;
    else if (OKLCH == returnColorAs && !supportsOKLCH) flag = true;

    if (flag) {

        this.setColor(col);
        return this.returnColor();
    }
    return col;
};

// `buildColorString` - internal helper function
P.buildColorString = function (a, b, c, d, req) {

    if (!req) req = this.returnColorAs;

    switch (req) {

        case RGB : return `rgb(${_round(a)} ${_round(b)} ${_round(c)} / ${d})`;
        case HSL : return `hsl(${a} ${b}% ${c}% / ${d})`;
        case HWB : return `hwb(${a} ${b}% ${c}% / ${d})`;
        case LAB : return `lab(${a}% ${b} ${c} / ${d})`;
        case LCH : return `lch(${a}% ${b} ${c} / ${d})`;
        case OKLAB : return `oklab(${a * 100}% ${b} ${c} / ${d})`;
        case OKLCH : return `oklch(${a * 100}% ${b} ${c} / ${d})`;
        case XYZ : return `xyz(${a} ${b} ${c} / ${d})`;
        default : return BLANK;
    }
}

// `generateRandomColor` - generate a random, fully opaque color
P.generateRandomColor = function () {

    let r = _floor(_random() * 256),
        g = _floor(_random() * 256),
        b= _floor(_random() * 256);

    if (r > 255) r = 255;
    if (g > 255) g = 255;
    if (b > 255) b = 255;

    this.setColor(`rgb(${r} ${g} ${b})`);
};

// `checkColor` - input is a CSS color string; output will be a color string which is displayable on the user's device/browser
P.checkColor = function (item) {

    if (item.substring) {

        let colSpace = RGB;

        if (item.includes(_HSL)) colSpace = HSL;
        else if (item.includes(_HWB)) colSpace = HWB;
        else if (item.includes(_OKLAB)) colSpace = OKLAB;
        else if (item.includes(_OKLCH)) colSpace = OKLCH;
        else if (item.includes(_LAB)) colSpace = LAB;
        else if (item.includes(_LCH)) colSpace = LCH;
        else if (item.includes(_XYZ)) colSpace = XYZ;

        if (RGB == colSpace || HSL == colSpace) return item;

        this.colorSpace = colSpace;

        let colRet = colSpace;
        if (XYZ == colSpace) colRet = RGB;

        this.returnColorAs = colSpace;

        this.convert(item);

        return this.returnColor();
    }
    return BLANK;
};

// `getRangeColor` - function which generates a color in the range between the minimum and maximum colors. 
// + when the argument is `0` the minimum color is returned; values below 0 are rounded up to 0
// + when the argument is `1` the maximum color is returned; values above 1 are rounded down to 1
// + values between `0` and `1` will return a blended color between the minimum and maximum colors
// + non-Number arguments should return the Color's current color value
P.getRangeColor = function (item, internalGradientBuild = false) {

    if (xt(item) && item.toFixed) {

        let col = this.colorSpace;

        // KNOWN issue with HSL/HWB/LCH/OKLCH gradients which this line attempts to fix
        if (internalGradientBuild) {

            if (HSL_HWB_ARRAY.includes(col)) col = RGB;
            else if (LCH == col) col = LAB;
            else if (OKLCH == col) col = OKLAB;
        }

        const vals = this.calculateRangeColorValues(item, internalGradientBuild),
            res = this.buildColorString(...vals, col);

        this.setColor(res);
    }
    return this.getCurrentColor();
};

// `calculateRangeColorValues` - internal helper function
P.calculateRangeColorValues = function (item, internalGradientBuild = false) {

    const { colorSpace, easing, easingFunction } = this;

    let a, b, c, d, test;

    let col = colorSpace.toLowerCase();

    // KNOWN issue with HSL/HWB/LCH gradients which this line attempts to fix
    if (internalGradientBuild) {

        if (HSL_HWB_ARRAY.includes(colorSpace)) col = _RGB;
        else if (LCH == colorSpace) col = _LAB;
        else if (OKLCH == colorSpace) col = _OKLAB;
    }

    const [bMin, cMin, dMin, aMin] = this[`${col}_min`];
    const [bMax, cMax, dMax, aMax] = this[`${col}_max`];

    let e = easingFunction;

    if (!internalGradientBuild && easing != FUNCTION && easeEngines[easing]) e = easeEngines[easing];

    const val = (internalGradientBuild) ? item : e(item);

    switch (col) {

        // These aren't producing colors like CSS gradients - something wierd about seeing bright violet between red/blue, instead of a more muddy purple (matching what gets presented in the RGB color space) which CSS gradients present.
        case _HSL :
        case _HWB :

            test = bMax - bMin;

            if (bMin === bMax) b = bMin;
            else if (test > 180 || test < -180) {

                b = (test > 0) ? 
                    interpolate(val, bMin + 360, bMax) :
                    interpolate(val, bMin - 360, bMax);
            }
            else {
                b = interpolate(val, bMin, bMax);
            }

            if (aMin === aMax) a = aMin;
            else a = interpolate(val, aMin, aMax);

            if (cMin === cMax) c = cMin;
            else c = interpolate(val, cMin, cMax);

            if (dMin === dMax) d = dMin;
            else d = interpolate(val, dMin, dMax);

            return [b, c, d, a];

        // LCH, OKLCH also has the HSL/HWB issue, but not as pronounced
        case _LCH :
        case _OKLCH :

            test = dMax - dMin;

            if (dMin === dMax) d = dMin;
            else if (test > 180 || test < -180) {

                d = (test > 0) ? 
                    interpolate(val, dMin + 360, dMax) :
                    interpolate(val, dMin - 360, dMax);
            }
            else {
                d = interpolate(val, dMin, dMax);
            }

            if (aMin === aMax) a = aMin;
            else a = interpolate(val, aMin, aMax);

            if (cMin === cMax) c = cMin;
            else c = interpolate(val, cMin, cMax);

            if (bMin === bMax) b = bMin;
            else b = interpolate(val, bMin, bMax);

            return [b, c, d, a];

        // RGB/LAB/OKLAB generate color gradients matching CSS. XYZ also looks good.
        default : 

            if (aMin === aMax) a = aMin;
            else a = interpolate(val, aMin, aMax);

            if (bMin === bMax) b = bMin;
            else b = interpolate(val, bMin, bMax);

            if (cMin === cMax) c = cMin;
            else c = interpolate(val, cMin, cMax);

            if (dMin === dMax) d = dMin;
            else d = interpolate(val, dMin, dMax);

            return [b, c, d, a];
    }
};

// `getAlphaValue` - internal helper function
P.getAlphaValue = function (alpha) {

    let a = 1;

    if (alpha != null) {

        if (alpha.includes(PC)) a = parseFloat(alpha) / 100;
        else a = parseFloat(alpha);
    }
    // This test should capture alpha values of `none`
    if (isNaN(a)) a = 1;
    else if (a > 1) a = 1;
    else if ( a < 0) a = 0;

    return a;
};

// `getHueValue` - internal helper function - because the CSS `hue` definition is massively overloaded with possibilities
P.getHueValue = function (hue) {

    if (hue == NONE) return 0;

    if (hue.includes(DEG)) hue = parseFloat(hue)
    else if (hue.includes(RAD)) hue = parseFloat(hue) / _radian;
    else if (hue.includes(GRAD)) hue = (parseFloat(hue) / 400) * 360;
    else if (hue.includes(TURN)) hue = parseFloat(hue) * 360;
    else hue = parseFloat(hue);

    // We test and correct for the hue-related `none` value here
    if (isNaN(hue)) return 0;

    return correctAngle(hue);
};

// `getColorValuesFromString` - internal helper function
P.getColorValuesFromString = function(str, col) {

    str = str.replace(col, ZERO_STR);
    str = str.replace('(', ZERO_STR);
    str = str.replace(')', ZERO_STR);
    str = str.replace('/', ZERO_STR);

    const res = str.split(SPACE).filter(e => e != null && e !== ZERO_STR);

    // We test and correct for the `none` value here (excluding alpha channel)
    if (res[0] == null || res[0] == NONE) res[0] = _0;
    if (res[1] == null || res[1] == NONE) res[1] = _0;
    if (res[2] == null || res[2] == NONE) res[2] = _0;

    return res;
};

// `extractFromHwbColorString` - internal helper function
// + TODO: this function differs from other `extractFrom...` functions in that it returns RGB color values - consider changing this so that it better matches the operation of the other functions?
P.extractFromHwbColorString = function (color) {

    const { getAlphaValue, getHueValue, getColorValuesFromString } = this;
    let vals, a, b, c, d, hue, white, black;

    vals = getColorValuesFromString(color, _HWB);

    hue = getHueValue(vals[0]);
    white = parseFloat(vals[1]);
    black = parseFloat(vals[2]);
    a = getAlphaValue(vals[3]);

    [b, c, d] = this.convertHWBtoRGB(hue, white, black);

    b = _floor(b * 255);
    if (b > 255) b = 255;
    if (b < 0) b = 0;

    c = _floor(c * 255);
    if (c > 255) c = 255;
    if (c < 0) c = 0;

    d = _floor(d * 255);
    if (d > 255) d = 255;
    if (d < 0) d = 0;

    return [a, b, c, d];
};

// `extractFromXyzColorString` - internal helper function
// + Note: The Color specification doesn't define an XYZ standard input for CSS. So we have to make one up ourselves. SC expects to receive colors defined in the XYZ color space to be raw float Numbers separated by spaces and (if required) a slash followed by the alpha value
// + `xyz(x-value y-value z-value)` (with alpha = 1, opaque)
// + `xyz(x-value y-value z-value / alpha-value)`
P.extractFromXyzColorString = function (color) {

    const { getAlphaValue, getColorValuesFromString } = this;
    let vals, a, b, c, d;

    vals = getColorValuesFromString(color, _XYZ);
    b = parseFloat(vals[0]);
    c = parseFloat(vals[1]);
    d = parseFloat(vals[2]);
    a = getAlphaValue(vals[3]);

    return [a, b, c, d];
};

// `extractFromLabColorString` - internal helper function
// + Corrects for channel bounds, as suggested in the CSS Color Module spec
P.extractFromLabColorString = function (color) {

    const { getAlphaValue, getColorValuesFromString } = this;
    let vals, a, b, c, d;

    vals = getColorValuesFromString(color, _LAB);
    b = parseFloat(vals[0]);
    if (b > 100) b = 100;
    if (b < 0) b = 0;

    c = (vals[1].includes(PC)) ? parseFloat(vals[1]) * 1.25 : parseFloat(vals[1]);
    if (c > 160) c = 160;
    if (c < -160) c = -160;

    d = (vals[2].includes(PC)) ? parseFloat(vals[2]) * 1.25 : parseFloat(vals[2]);
    if (d > 160) d = 160;
    if (d < -160) d = -160;

    a = getAlphaValue(vals[3]);

    return [a, b, c, d];
};

// `extractFromOklabColorString` - internal helper function
// + Corrects for channel bounds, as suggested in the CSS Color Module spec
P.extractFromOklabColorString = function (color) {

    const { getAlphaValue, getColorValuesFromString } = this;
    let vals, a, b, c, d;

    vals = getColorValuesFromString(color, _OKLAB);
    b = (vals[0].includes(PC)) ? parseFloat(vals[0]) / 100 : parseFloat(vals[0]);
    if (b > 1) b = 1;
    if (b < 0) b = 0;

    c = (vals[1].includes(PC)) ? (parseFloat(vals[1]) / 100) * 0.4 : parseFloat(vals[1]);
    if (c > 0.5) c = 0.5;
    if (c < -0.5) c = -0.5;

    d = (vals[2].includes(PC)) ? (parseFloat(vals[2]) / 100) * 0.4 : parseFloat(vals[2]);
    if (d > 0.5) d = 0.5;
    if (d < -0.5) d = -0.5;

    a = getAlphaValue(vals[3]);

    return [a, b, c, d];
};

// `extractFromLchColorString` - internal helper function
// + Corrects for channel bounds, as suggested in the CSS Color Module spec
P.extractFromLchColorString = function (color) {

    const { getAlphaValue, getHueValue, getColorValuesFromString } = this;
    let vals, a, b, c, d;

    vals = getColorValuesFromString(color, _LCH);
    b = parseFloat(vals[0]);
    if (b > 100) b = 100;
    if (b < 0) b = 0;

    c = (vals[1].includes(PC)) ? parseFloat(vals[1]) * 1.5 : parseFloat(vals[1]);
    if (c > 230) c = 230;
    if (c < 0) c = 0;

    d = getHueValue(vals[2]);
    a = getAlphaValue(vals[3]);

    return [a, b, c, d];
};

// `extractFromOklchColorString` - internal helper function
// + Corrects for channel bounds, as suggested in the CSS Color Module spec
P.extractFromOklchColorString = function (color) {

    const { getAlphaValue, getHueValue, getColorValuesFromString } = this;
    let vals, a, b, c, d;

    vals = getColorValuesFromString(color, _OKLCH);
    b = b = (vals[0].includes(PC)) ? parseFloat(vals[0]) / 100 : parseFloat(vals[0]);
    if (b > 1) b = 1;
    if (b < 0) b = 0;

    c = (vals[1].includes(PC)) ? (parseFloat(vals[1]) / 100) * 0.4 : parseFloat(vals[1]);
    if (c > 0.4) c = 0.4;
    if (c < 0) c = 0;

    d = getHueValue(vals[2]);
    a = getAlphaValue(vals[3]);

    return [a, b, c, d];
};

// `convert` - internal function. Takes a color string and converts it into a variety of color space values. Makes use of the following functions:
// + `convertHSLtoRGB`, `convertRGBtoHSL`
// + `convertHWBtoRGB`, `convertRGBtoHWB`, `convertRGBHtoHWB`
// + `convertXYZtoRGB`, `convertRGBtoXYZ`
// + `convertXYZtoLAB`, `convertLABtoXYZ`
// + `convertLABtoLCH`, `convertLCHtoLAB`
// + `convertXYZtoOKLAB`, `convertOKLABtoXYZ`
// + `convertOKLABtoOKLCH`, `convertOKLCHtoOKLAB`
P.convert = function (color, suffix = ZERO_STR) {

    // Currently converting to as many color spaces as possible - we can make this more sane by only converting for the colors we want to convert (RGB + the internal color space + the returned color space)

    color = color.toLowerCase();

    const rgb = this[`rgb${suffix}`];
    const hsl = this[`hsl${suffix}`];
    const hwb = this[`hwb${suffix}`];
    const xyz = this[`xyz${suffix}`];
    const lab = this[`lab${suffix}`];
    const lch = this[`lch${suffix}`];
    const oklab = this[`oklab${suffix}`];
    const oklch = this[`oklch${suffix}`];

    // Initializing defs in the constructor causes an error - this should avoid it
    if (!rgb) return this;

    rgb.length = 0;
    hsl.length = 0;
    hwb.length = 0;
    xyz.length = 0;
    lab.length = 0;
    lch.length = 0;
    oklab.length = 0;
    oklch.length = 0;

    let a, b, c, d;

    if (color.includes(_HWB) && !supportsHWB) {

        [a, b, c, d] = this.extractFromHwbColorString(color);

        rgb.push(b, c, d, a);
        hsl.push(...this.convertRGBtoHSL(b, c, d), a);
        hwb.push(hue, white, black, a);
        xyz.push(...this.convertRGBtoXYZ(b, c, d), a);
        lab.push(...this.convertXYZtoLAB(xyz[0], xyz[1], xyz[2]), a);
        lch.push(...this.convertLABtoLCH(lab[0], lab[1], lab[2]), a);
        oklab.push(...this.convertXYZtoOKLAB(xyz[0], xyz[1], xyz[2]), a);
        oklch.push(...this.convertOKLABtoOKLCH(oklab[0], oklab[1], oklab[2]), a);
    } 
    else if (color.includes(_XYZ)) {
        
        [a, b, c, d] = this.extractFromXyzColorString(color);

        rgb.push(...this.convertXYZtoRGB(b, c, d), a);
        hsl.push(...this.convertRGBtoHSL(rgb[0], rgb[1], rgb[2]), a);
        hwb.push(...this.convertRGBHtoHWB(rgb[0], rgb[1], rgb[2], hsl[0]), a);
        xyz.push(b, c, d, a);
        lab.push(...this.convertXYZtoLAB(b, c, d), a);
        lch.push(...this.convertLABtoLCH(lab[0], lab[1], lab[2]), a);
        oklab.push(...this.convertXYZtoOKLAB(xyz[0], xyz[1], xyz[2]), a);
        oklch.push(...this.convertOKLABtoOKLCH(oklab[0], oklab[1], oklab[2]), a);
    }
    else if (color.includes(_OKLAB) && !supportsOKLAB) {

        [a, b, c, d] = this.extractFromOklabColorString(color);

        oklab.push(b, c, d, a);
        oklch.push(...this.convertOKLABtoOKLCH(b, c, d), a);
        xyz.push(...this.convertOKLABtoXYZ(b, c, d), a);
        lab.push(...this.convertXYZtoLAB(xyz[0], xyz[1], xyz[2]), a);
        lch.push(...this.convertLABtoLCH(lab[0], lab[1], lab[2]), a);
        rgb.push(...this.convertXYZtoRGB(xyz[0], xyz[1], xyz[2]), a);
        hsl.push(...this.convertRGBtoHSL(rgb[0], rgb[1], rgb[2]), a);
        hwb.push(...this.convertRGBHtoHWB(rgb[0], rgb[1], rgb[2], hsl[0]), a);
    }
    else if (color.includes(_OKLCH) && !supportsOKLCH) {

        [a, b, c, d] = this.extractFromOklchColorString(color);

        oklch.push(b, c, d, a);
        oklab.push(...this.convertOKLCHtoOKLAB(b, c, d), a);
        xyz.push(...this.convertOKLABtoXYZ(oklab[0], oklab[1], oklab[2]), a);
        lab.push(...this.convertXYZtoLAB(xyz[0], xyz[1], xyz[2]), a);
        lch.push(...this.convertLABtoLCH(lab[0], lab[1], lab[2]), a);
        rgb.push(...this.convertXYZtoRGB(xyz[0], xyz[1], xyz[2]), a);
        hsl.push(...this.convertRGBtoHSL(rgb[0], rgb[1], rgb[2]), a);
        hwb.push(...this.convertRGBHtoHWB(rgb[0], rgb[1], rgb[2], hsl[0]), a);
    }
    else if (color.includes(_LAB) && !supportsLAB) {

        [a, b, c, d] = this.extractFromLabColorString(color);

        lab.push(b, c, d, a);
        xyz.push(...this.convertLABtoXYZ(b, c, d), a);
        rgb.push(...this.convertXYZtoRGB(xyz[0], xyz[1], xyz[2]), a);
        hsl.push(...this.convertRGBtoHSL(rgb[0], rgb[1], rgb[2]), a);
        hwb.push(...this.convertRGBHtoHWB(rgb[0], rgb[1], rgb[2], hsl[0]), a);
        lch.push(...this.convertLABtoLCH(b, c, d), a);
        oklab.push(...this.convertXYZtoOKLAB(xyz[0], xyz[1], xyz[2]), a);
        oklch.push(...this.convertOKLABtoOKLCH(oklab[0], oklab[1], oklab[2]), a);
    }
    else if (color.includes(_LCH) && !supportsLCH) {

        [a, b, c, d] = this.extractFromLchColorString(color);

        lch.push(b, c, d, a);
        lab.push(...this.convertLCHtoLAB(b, c, d), a);
        xyz.push(...this.convertLABtoXYZ(lab[0], lab[1], lab[2]), a);
        rgb.push(...this.convertXYZtoRGB(xyz[0], xyz[1], xyz[2]), a);
        hsl.push(...this.convertRGBtoHSL(rgb[0], rgb[1], rgb[2]), a);
        hwb.push(...this.convertRGBHtoHWB(rgb[0], rgb[1], rgb[2], hsl[0]), a);
        oklab.push(...this.convertXYZtoOKLAB(xyz[0], xyz[1], xyz[2]), a);
        oklch.push(...this.convertOKLABtoOKLCH(oklab[0], oklab[1], oklab[2]), a);
    }
    else {

        [b, c, d, a] = this.getColorFromCanvas(color);

        rgb.push(b, c, d, a);
        hsl.push(...this.convertRGBtoHSL(b, c, d), a);
        hwb.push(...this.convertRGBHtoHWB(b, c, d, hsl[0]), a);
        xyz.push(...this.convertRGBtoXYZ(b, c, d), a);
        lab.push(...this.convertXYZtoLAB(xyz[0], xyz[1], xyz[2]), a);
        lch.push(...this.convertLABtoLCH(lab[0], lab[1], lab[2]), a);
        oklab.push(...this.convertXYZtoOKLAB(xyz[0], xyz[1], xyz[2]), a);
        oklch.push(...this.convertOKLABtoOKLCH(oklab[0], oklab[1], oklab[2]), a);
    }
    return this;
};


// `extractRGBfromColor` - takes a color string and returns it's RGB equivalent channel values:
P.extractRGBfromColor = function (color) {

    color = color.toLowerCase();

    let a, b, c, d;

    if (color.includes(_HWB) && !supportsHWB) {

        [a, b, c, d] = this.extractFromHwbColorString(color);
        return [b, c, d, a];
    } 
    else if (color.includes(_XYZ)) {
        
        [a, b, c, d] = this.extractFromXyzColorString(color);
        return [...this.convertXYZtoRGB(b, c, d), a];
    }
    else if (color.includes(_OKLAB) && !supportsOKLAB) {

        [a, b, c, d] = this.extractFromOklabColorString(color);
        return [...this.convertXYZtoRGB(...this.convertOKLABtoXYZ(b, c, d)), a]; 
    }
    else if (color.includes(_OKLCH) && !supportsOKLCH) {

        [a, b, c, d] = this.extractFromOklchColorString(color);
        return [...this.convertXYZtoRGB(...this.convertOKLABtoXYZ(...this.convertOKLCHtoOKLAB(b, c, d))), a]; 
    }
    else if (color.includes(_LAB) && !supportsLAB) {

        [a, b, c, d] = this.extractFromLabColorString(color);
        return [...this.convertXYZtoRGB(...this.convertLABtoXYZ(b, c, d)), a]; 
    }
    else if (color.includes(_LCH) && !supportsLCH) {

        [a, b, c, d] = this.extractFromLchColorString(color);
        return [...this.convertXYZtoRGB(...this.convertLABtoXYZ(...this.convertLCHtoLAB(b, c, d))), a]; 
    }
    else return this.getColorFromCanvas(color);
};

// `convertRGBtoHex` - takes 3 rgb color values (range 0-255) and returns a #hex string:
P.convertRGBtoHex = function (red, green, blue) {

    if (red.substring) red = parseInt(red, 10);
    if (green.substring) green = parseInt(green, 10);
    if (blue.substring) blue = parseInt(blue, 10);

    if (!isNaN(red) && !isNaN(green) && !isNaN(blue)) {

        const r = (_0 + (red).toString(16)).slice(-2),
            g = (_0 + (green).toString(16)).slice(-2),
            b = (_0 + (blue).toString(16)).slice(-2);

        return `#${r}${g}${b}`;
    }
    return BLACK_HEX;
};

// `getColorFromCanvas` - internal helper function
P.getColorFromCanvas = function (color) {

    let r = 0,
        g = 0,
        b = 0,
        a = 0;

    engine.clearRect(0, 0, 1, 1);
    engine.fillStyle = color;
    engine.fillRect(0, 0, 1, 1);

    const image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;

        a /= 255;
    }
    return [r, g, b, a];
};


// #### Color space conversions
// The following functionality has been lifted/adapted from [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/)

// `convertRGBtoHSL` - internal helper function
P.convertRGBtoHSL = function (red, green, blue) {

    red /= 255;
    green /= 255;
    blue /= 255;

    let max = _max(red, green, blue);
    let min = _min(red, green, blue);
    let [hue, sat, light] = [0, 0, (min + max)/2];
    let d = max - min;

    if (d !== 0) {
        sat = (light === 0 || light === 1)
            ? 0
            : (max - light) / _min(light, 1 - light);

        switch (max) {
            case red:   hue = (green - blue) / d + (green < blue ? 6 : 0); break;
            case green: hue = (blue - red) / d + 2; break;
            case blue:  hue = (red - green) / d + 4;
        }

        hue = hue * 60;
    }

    return [hue, sat * 100, light * 100];
};

// `convertHSLtoRGB` - internal helper function
P.convertHSLtoRGB = function (hue, sat, light) {
    
    hue = correctAngle(hue);
    sat /= 100;
    light /= 100;

    const f = function (n) {
        let k = (n + hue/30) % 12;
        let a = sat * _min(light, 1 - light);
        return light - a * _max(-1, _min(k - 3, 9 - k, 1));
    }
    return [f(0), f(8), f(4)];
};

// `convertRGBtoHWB` - internal helper function
P.convertRGBtoHWB = function (red, green, blue) {

    let hsl = this.convertRGBtoHSL(red, green, blue, suffix);

    red /= 256;
    green /= 256;
    blue /= 256;

    let white = _min(red, green, blue);
    let black = 1 - _max(red, green, blue);

    return [hsl[0], white * 100, black * 100];
};

// `convertRGBHtoHWB` - internal helper function
P.convertRGBHtoHWB = function (red, green, blue, hue) {

    red /= 256;
    green /= 256;
    blue /= 256;

    let white = _min(red, green, blue);
    let black = 1 - _max(red, green, blue);

    return [hue, white * 100, black * 100];
};

// `convertHWBtoRGB` - internal helper function
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

// `multiplyMatrices` - internal helper function
// + From [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/multiply-matrices.js)
P.multiplyMatrices = function (A, B) {

    const m = A.length;

    if (!_isArray(A[0])) A = [A];
    if (!_isArray(B[0])) B = B.map(x => [x]);

    const p = B[0].length;
    const B_cols = B[0].map((_, i) => B.map(x => x[i]));

    let product = A.map(row => B_cols.map(col => {

        if (!_isArray(row)) {

            return col.reduce((a, c) => a + c * row, 0);
        }
        return row.reduce((a, c, i) => a + c * (col[i] || 0), 0);
    }));

    if (m === 1) product = product[0];

    if (p === 1) return product.map(x => x[0]);

    return product;
};

// `convertRGBtoXYZ` - internal helper function
P.lin_sRGB = function (myRgb) {

    return myRgb.map(val => {

        const sign = val < 0 ? -1 : 1;
        const abs = _abs(val);

        if (abs < 0.04045) return val / 12.92;
        return sign * (_pow((abs + 0.055) / 1.055, 2.4));
    });
}
P.convertRGBtoXYZ = function (r, g, b) {

    const sRGB = [r / 255, g / 255, b / 255];
    const lRGB = this.lin_sRGB(sRGB)

    return this.multiplyMatrices([...convertRGBtoXYZ_matrix], [...lRGB]);
};

P.convertRGBtoOKLAB = function (r, g, b) {

    const [_r, _g, _b] = this.lin_sRGB([r / 255, g / 255, b / 255])

    const l = 0.4122214708 * _r + 0.5363325363 * _g + 0.0514459929 * _b;
    const m = 0.2119034982 * _r + 0.6806995451 * _g + 0.1073969566 * _b;
    const s = 0.0883024619 * _r + 0.2817188376 * _g + 0.6299787005 * _b;

    const _l = cbrt(l);
    const _m = cbrt(m);
    const _s = cbrt(s);

    return [
        0.2104542553 * _l + 0.7936177850 * _m - 0.0040720468 * _s,
        1.9779984951 * _l - 2.4285922050 * _m + 0.4505937099 * _s,
        0.0259040371 * _l + 0.7827717662 * _m - 0.8086757660 * _s,
    ];
};

// `convertXYZtoRGB` - internal helper function
P.gam_sRGB = function (myRgb) {

    return myRgb.map(val => {

        const sign = val < 0 ? -1 : 1;
        const abs = _abs(val);

        if (abs > 0.0031308) return sign * (1.055 * _pow(abs, 1/2.4) - 0.055);
        return 12.92 * val;
    });
}
P.convertXYZtoRGB = function (x, y, z) {

    const lRGB = this.multiplyMatrices([...convertXYZtoRGB_matrix], [x, y, z]);
    const sRGB = this.gam_sRGB(lRGB);

    return [
        _round(sRGB[0] * 255),
        _round(sRGB[1] * 255),
        _round(sRGB[2] * 255),
    ];
};

// `convertXYZtoLAB` - internal helper function
P.convertXYZtoLAB = function (x, y, z) {

    const toD50 = this.multiplyMatrices([...D65_to_D50_matrix], [x, y, z]);
    const xyz = toD50.map((val, i) => val / D50[i]);
    const f = xyz.map(val => val > E ? cbrt(val) : (K * val + 16) / 116);

    return [
        (116 * f[1]) - 16,
        500 * (f[0] - f[1]),
        200 * (f[1] - f[2]),
    ];
};

// `convertLABtoXYZ` - internal helper function
P.convertLABtoXYZ = function (l, a, b) {

    const f = [];

    f[1] = (l + 16) / 116;
    f[0] = a / 500 + f[1];
    f[2] = f[1] - b / 200;

    const xyz = [
        (_pow(f[0], 3) > E) ? _pow(f[0], 3) : (116 * f[0] - 16) / K,
        (l > K * E) ? _pow((l + 16) / 116, 3) : l / K,
        (_pow(f[2], 3) > E) ? _pow(f[2], 3) : (116 * f[2] - 16) / K,
    ];

    const toD50 = xyz.map((val, i) => val * D50[i]);

    return this.multiplyMatrices([...D50_to_D65_matrix], [...toD50]);
};

// `convertLABtoLCH` - internal helper function
P.convertLABtoLCH = function (l, a, b) {

    const hue = _atan2(b, a) * 180 / _pi;

    return [
        l,
        _sqrt(_pow(a, 2) + _pow(b, 2)),
        (hue >= 0) ? hue : hue + 360
    ];
};

// `convertLCHtoLAB` - internal helper function
P.convertLCHtoLAB = function (l, c, h) {

    return [
        l,
        c * _cos(h * _pi / 180),
        c * _sin(h * _pi / 180),
    ];
};

// `convertXYZtoOKLAB` - internal helper function
P.convertXYZtoOKLAB = function (x, y, z) {

    const LMS = this.multiplyMatrices([...XYZtoLMS], [x, y, z]);
    return this.multiplyMatrices([...LMStoOKLab], LMS.map(c => cbrt(c)));
};

// `convertOKLABtoXYZ` - internal helper function
P.convertOKLABtoXYZ = function (l, a, b) {

    const LMSnl = this.multiplyMatrices([...OKLabtoLMS], [l, a, b]);
    return this.multiplyMatrices([...LMStoXYZ], LMSnl.map(c => c ** 3));
};

// `convertOKLABtoOKLCH` - internal helper function
P.convertOKLABtoOKLCH = function (l, a, b) {

    const hue = _atan2(b, a) * 180 / _pi;

    return [
        l,
        _sqrt(a ** 2 + b ** 2),
        hue >= 0 ? hue : hue + 360,
    ];
};

// `convertOKLCHtoOKLAB` - internal helper function
P.convertOKLCHtoOKLAB = function (l, c, h) {

    return [
        l,
        c * _cos(h * _pi / 180),
        c * _sin(h * _pi / 180),
    ];
};


// #### Color blending
// The following functions are used by the Blend filter
// + Input is the six RGB parts (Integers clamped to the 0-255 range) of the input and mix channels
// + Output is the RGB version of the mixed HSL colors generated from the RGB inputs

// `calculateColorBlend` - internal helper function
P.calculateColorBlend = function (iR, iG, iB, mR, mG, mB) {

    const [iH, iS, iL] = this.convertRGBtoHSL(iR, iG, iB);
    const [mH, mS, mL] = this.convertRGBtoHSL(mR, mG, mB);

    const [r, g, b] = this.convertHSLtoRGB(iH, iS, mL);

    return [_round(r * 255), _round(g * 255), _round(b * 255)];
};

// `calculateHueBlend` - internal helper function
P.calculateHueBlend = function (iR, iG, iB, mR, mG, mB) {

    const [iH, iS, iL] = this.convertRGBtoHSL(iR, iG, iB);
    const [mH, mS, mL] = this.convertRGBtoHSL(mR, mG, mB);

    const [r, g, b] = this.convertHSLtoRGB(iH, mS, mL);

    return [_round(r * 255), _round(g * 255), _round(b * 255)];
};

// `calculateSaturationBlend` - internal helper function
P.calculateSaturationBlend = function (iR, iG, iB, mR, mG, mB) {

    const [iH, iS, iL] = this.convertRGBtoHSL(iR, iG, iB);
    const [mH, mS, mL] = this.convertRGBtoHSL(mR, mG, mB);

    const [r, g, b] = this.convertHSLtoRGB(mH, iS, mL);

    return [_round(r * 255), _round(g * 255), _round(b * 255)];
};

// `calculateLuminosityBlend` - internal helper function
P.calculateLuminosityBlend = function (iR, iG, iB, mR, mG, mB) {

    const [iH, iS, iL] = this.convertRGBtoHSL(iR, iG, iB);
    const [mH, mS, mL] = this.convertRGBtoHSL(mR, mG, mB);

    const [r, g, b] = this.convertHSLtoRGB(mH, mS, iL);

    return [_round(r * 255), _round(g * 255), _round(b * 255)];
};


// #### Browser color space support
// We need to check whether the browser supports various color spaces. The simplest way to do that is to feed a color into a canvas element's engine, stamp a pixel, then check to see if the pixel is black (space not supported)
// + We check for HWB, LAB andf LCH color space support
// + We assume that the browser always supports RGB and HSL  color spaces
// + We don't check for XYZ color space support because it is not part of the [CSS Color Module Level 4 specification](https://www.w3.org/TR/css-color-4/)
// + We don't check for OKLAB, OKLCH support at this time (Nov 2022)
let supportsHWB = false;
let supportsLAB = false;
let supportsLCH = false;
let supportsOKLAB = false;
let supportsOKLCH = false;

const browserChecker = function () {

    let r = 0,
        g = 0,
        b = 0,
        a = 0,
        image,
        col = '#ffffff00';

    // Test for HWB support
    engine.fillStyle = 'hwb(90 10% 10%)';
    engine.fillRect(0, 0, 1, 1);

    image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;
    }
    if (r || g || b) supportsHWB = true;

    // Firefox (v96.0.1) fails silently when setting engine to unsupported color, leaving engine value unchanged, which in turn leaves our test rgb values unchanged, thus giving us a false positive for the test
    // - This additional safety net test identifies and corrects for that bug
    if (supportsHWB && col === engine.fillStyle) supportsHWB = false;
    else col = engine.fillStyle;

    // Test for LAB support
    engine.fillStyle = 'lab(29.2345% 39.3825 20.0664)';
    engine.clearRect(0, 0, 1, 1);
    engine.fillRect(0, 0, 1, 1);

    image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;
    }
    if (r || g || b) supportsLAB = true;

    // Firefox safety net
    if (supportsLAB && col === engine.fillStyle) supportsLAB = false;
    else col = engine.fillStyle;

    // Test for LCH support
    engine.fillStyle = 'lch(52.2345% 72.2 56.2)';
    engine.clearRect(0, 0, 1, 1);
    engine.fillRect(0, 0, 1, 1);

    image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;
    }
    if (r || g || b) supportsLCH = true;

    // Firefox safety net
    if (supportsLCH && col === engine.fillStyle) supportsLCH = false;
    else col = engine.fillStyle;

    // Test for OKLAB support
    // + Assume no browser supports OKLAB. Safari's implementation is incomplete (Nov 2022)

    engine.fillStyle = 'oklab(59.686% 0.1009 0.1192)';
    engine.clearRect(0, 0, 1, 1);
    engine.fillRect(0, 0, 1, 1);

    image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;
    }
    if (r || g || b) supportsOKLAB = true;

    // Firefox safety net
    if (supportsOKLAB && col === engine.fillStyle) supportsOKLAB = false;
    else col = engine.fillStyle;

    // Test for OKLCH support
    // + Assume no browser supports OKLCH. Safari's implementation is incomplete (Nov 2022)

    engine.fillStyle = 'oklch(59.686% 0.15619 49.7694)';
    engine.clearRect(0, 0, 1, 1);
    engine.fillRect(0, 0, 1, 1);

    image = engine.getImageData(0, 0, 1, 1);

    if (image && image.data) {

        [r, g, b, a] = image.data;
    }
    if (r || g || b) supportsOKLCH = true;

    // Firefox safety net
    if (supportsOKLCH && col === engine.fillStyle) supportsOKLCH = false;
    else col = engine.fillStyle;
};
browserChecker();


// #### Factory
// ```
// scrawl.makeColor({
//
//     name: 'myColorObject',
//
//     minimumColor: 'red',
//     maximumColor: 'green',
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
//     fillStyle: myColorObject.getRangeColor(Math.random()),
//     method: 'fill',
// });
// ```
export const makeColor = function (items) {

    if (!items) return false;
    return new Color(items);
};

constructors.Color = Color;
