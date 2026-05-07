// # Color factory
//
// **NOTE – Why Scrawl-canvas HSL/HWB gradients don’t match CSS**
//
// Browsers treat hsl() and hwb() as *alternate notations of sRGB*. For gradients, CSS first resolves all stops to sRGB and then interpolates channels in RGB (premultiplied alpha). Result: CSS gradients for RGB/HSL/HWB look the same.
//
// Scrawl-canvas intentionally interpolates *in the declared internal space*. For HSL and HWB the code blends the cylindrical components (with shortest-arc hue wrapping), which produces more saturated, “truer HSL/HWB” midpoints than RGB-space blends. That’s why gradients built in the HSL/HWB color space tend to be more colorful, and differ from equivalent CSS gradients.
//
// **NOTE – Why Scrawl-canvas LCH/OKLCH gradients don’t match CSS**
//
// Most browsers currently render lch() and oklch() gradient stops by converting them to the *Cartesian* forms (Lab / Oklab) and then interpolating linearly in that space (premultiplied-alpha, then mapped to sRGB). Hue is only used to form a/b (or A/B), it is not interpolated as an angle; achromatic stops effectively collapse to Lab/Oklab vectors. In practice this makes CSS LCH ≈ CSS LAB and CSS OKLCH ≈ CSS OKLAB.
//
// Scrawl-canvas intentionally interpolates in the *cylindrical* spaces themselves: L linearly; H with shortest-arc wrapping; C linearly, with chroma gently clipped/fit to the output gamut. That preserves hue continuity and tends to produce more saturated “LCH-like / OKLCH-like” midpoints (e.g. a magenta ridge between red→blue), hence the visual difference from equivalent CSS gradients.


// #### Imports
import { constructors, entity } from '../core/library.js';

import { clamp, correctAngle, doCreate, easeEngines, interpolate, isa_fn, isa_obj, mergeOver, pushUnique, Ωempty } from '../helper/utilities.js';

import { colorEngine } from '../helper/color-engine.js';

import baseMix from '../mixin/base.js';

// Shared constants
import { _isArray, _isFinite, _keys, _random, _values, BLACK, BLANK, INT_COLOR_SPACES, LINEAR, NAME, RANDOM, RGB, STYLES, T_COLOR, UNDEF, WHITE } from '../helper/shared-vars.js';

// Local constants
const RET_COLOR_SPACES = ['rgb', 'hsl', 'hwb', 'lab', 'lch', 'oklab', 'oklch'],
    HSL = 'hsl',
    HWB = 'hwb',
    LAB = 'lab',
    LCH = 'lch',
    OKLAB = 'oklab',
    OKLCH = 'oklch',
    XYZ = 'xyz',
    MAX = 'max',
    MIN = 'min',
    EPS = 0.0001;

// Local helper functions
//
// `interpolateShortestHue` - Interpolate angles in degrees along the shortest arc, result in [0,360)
const interpolateShortestHue = (t, h1, h2) => {

    const d = ((h2 - h1 + 540) % 360) - 180;
    return correctAngle(h1 + t * d);
};

// #### Color constructor
const Color = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.color = null;
    this.currentColorData = [];
    this.currentColorInternalData = [];
    this.currentColorReturnData = [];
    this.currentColorString = '';

    this.maximumColor = null;
    this.currentMaximumColorData = [];
    this.currentMaximumColorInternalData = [];
    this.currentMaximumColorReturnData = [];
    this.currentMaximumColorString = '';

    this.minimumColor = null;
    this.currentMinimumColorData = [];
    this.currentMinimumColorInternalData = [];
    this.currentMinimumColorReturnData = [];
    this.currentMinimumColorString = '';

    this.set(this.defs);

    this.easing = LINEAR;

    this.currentRangePoint = -1;

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
const defaultAttributes = {

// __colorSpace__ - String value defining the color space to be used by the Color object for its internal calculations.
// + Accepted values from: `'rgb', 'hsl', 'hwb', 'xyz', 'lab', 'lch', 'oklab', 'oklch'` (mixed capitals acceptable eg 'RGB' as strings will be lowercased)
    colorSpace: RGB,

// __returnColorAs__ - String value defining the type of color String the Color object will return.
// + This is a shorter list than the internal colorSpace attribute as we only return values for CSS specified color spaces.
// + Accepted values from: `'rgb', 'hsl', 'hwb', 'lab', 'lch', 'oklab', 'oklch'` (mixed capitals acceptable eg 'RGB' as strings will be lowercased)
    returnColorAs: RGB,

// __color__ - CSS (Color level 4) String value defining the object's main color.
    color: BLANK,

// __maxColor__ - CSS (Color level 4) String value defining the object's maximum color. Used with both range color and random color functionality.
    maximumColor: WHITE,

// __minColor__ - CSS (Color level 4) String value defining the object's maximum color. Used with both range color and random color functionality.
    minimumColor: BLACK,

// The __easing__ attribute affects the `getRangeColor` function, applying an easing function to those requests. Value may be a predefined easing String name, or a function accepting a Number value and returning a Number value, both values to be positive floats in the range 0-1
    easing: LINEAR,
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
    _values(entity).forEach(ent => {

        const state = ent.state;

        if (state) {

            const fill = state.fillStyle,
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

// `get` - overrides function in mixin/base.js - this function has several overrides:
// + `get()` - return the object's main color string.
// + `get(Number)` - returns a range color string, between the minimum and maximum colors as modified by the current easing engine function. Argument must be a positive number in the range 0.0 - 1.0.
// + `get('min')` - return the object's minimum color string.
// + `get('max')` - return the object's maximum color string.
// + `get('random')` - return a random color string, between the minimum and maximum colors; this value also becomes the object's new main color.
P.get = function (item) {

    if (item.toFixed) {

        return this.getRangeColor(item);
    }
    else if (item === MIN) {

        return this.getMinimumColorString();
    }
    else if (item === MAX) {

        return this.getMaximumColorString();
    }
    else if (item === RANDOM) {

        return this.generateRandomColor();
    }
    else {

        return this.getMainColorString();
    }
};

// `set` - overrides function in mixin/base.js.
P.set = function (items = Ωempty) {

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs;

        let predefined, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key !== NAME && value != null) {

                predefined = setters[key];

                if (predefined) predefined.call(this, value);
                else if (typeof defs[key] !== UNDEF) this[key] = value;
            }
        }

        // If users invoke `color.set({ random: true, key: value, ... })` the object will generate a new, random main color.
        if (items.random) this.generateRandomColor();
    }
    return this;
};

const S = P.setters;
// The `color` function takes a CSS (Color level 4) String argument and performs immidiate work to calculate the related `current` attributes.
S.color = function (item) {

    this.setMainColor(item);
};

// The `minimumColor` function takes a CSS (Color level 4) String argument and performs immidiate work to calculate the related `current` attributes.
S.minimumColor = function (item) {

    this.setMinimumColor(item);
};

// The `maximumColor` function takes a CSS (Color level 4) String argument and performs immidiate work to calculate the related `current` attributes.
S.maximumColor = function (item) {

    this.setMaximumColor(item);
};

// `easing` - we can apply easing functions to colors, for instance when invoking the Color object's `getRangeColor()` function to return the most appropriate color between the Color object's minimum and maximum color values.
// + Can accept a String value identifying an SC pre-defined easing function (default: `linear`).
// + Can also accept a function which takes a single Number argument (between 0.0 and 1.0) and returns an eased Number (again, between 0-1).
// + For legacy reasons, this function also maps to `easingFunction`.
S.easing = function (item) {

    this.setEasingHelper(item);
};
S.easingFunction = S.easing;


S.colorSpace = function (item) {

    this.setColorSpaceHelper(item);
};

S.returnColorAs = function (item) {

    this.setReturnColorAsHelper(item);
};


// #### Prototype functions
// The `setColor` function takes a CSS (Color level 4) String argument and performs immidiate work to calculate the related `current` attributes.
// + `this.currentRangePoint` - must be set to `-1` as part of this work
P.setMainColor = function (item) {

    if (item.substring) {

        this.color = item;

        const col = this.currentColorData = colorEngine.getColorValuesFromString(item);

        const int = this.currentColorInternalData = colorEngine.convertColorData(col, this.colorSpace);

        const ret = this.currentColorReturnData = colorEngine.convertColorData(int, this.returnColorAs);

        this.currentColorString = colorEngine.buildColorStringFromData(ret);

        this.currentRangePoint = -1;
    }
};

// The `setMinimumColor` function takes a CSS (Color level 4) String argument and performs immidiate work to calculate the related `current` attributes.
// + `this.currentRangePoint` - must be set to `-1` as part of this work.
P.setMinimumColor = function (item) {

    if (item.substring) {

        this.minimumColor = item;

        const col = this.currentMinimumColorData = colorEngine.getColorValuesFromString(item);

        const int = this.currentMinimumColorInternalData = colorEngine.convertColorData(col, this.colorSpace);

        const ret = this.currentMinimumColorReturnData = colorEngine.convertColorData(int, this.returnColorAs);

        this.currentMinimumColorString = colorEngine.buildColorStringFromData(ret);

        this.currentRangePoint = -1;
    }
};

// The `setMaximumColor` function takes a CSS (Color level 4) String argument and performs immidiate work to calculate the related `current` attributes.
// + `this.currentRangePoint` - must be set to `-1` as part of this work.
P.setMaximumColor = function (item) {

    if (item.substring) {

        this.maximumColor = item;

        const col = this.currentMaximumColorData = colorEngine.getColorValuesFromString(item);

        const int = this.currentMaximumColorInternalData = colorEngine.convertColorData(col, this.colorSpace);

        const ret = this.currentMaximumColorReturnData = colorEngine.convertColorData(int, this.returnColorAs);

        this.currentMaximumColorString = colorEngine.buildColorStringFromData(ret);

        this.currentRangePoint = -1;
    }
};

// The `setEasingHelper` function accepts the following arguments:
// + Can accept a String value identifying an SC pre-defined easing function (default: `linear`).
// + Can also accept a function which takes a single Number argument (between 0.0 and 1.0) and returns an eased Number (again, between 0-1).
// + `this.currentRangePoint` - must be set to `-1` as part of this work.
P.setEasingHelper = function (item) {

    if (isa_fn(item) || (item.substring && easeEngines[item])) {

        this.easing = item;
    }
    else {

        this.easing = LINEAR;
    }

    this.currentRangePoint = -1;
};

// The `setColorSpaceHelper` function takes a CSS (Color level 4) String argument and performs immidiate work to calculate the related `current` attributes.
// + Permitted strings: 'RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH', 'OKLAB', 'OKLCH' (lowercase and mixed case alternatives permitted).
P.setColorSpaceHelper = function (item) {

    if (item != null && item.toLowerCase) {

        item = item.toLowerCase();

        if (INT_COLOR_SPACES.includes(item)) {

            if (this.colorSpace == null) this.colorSpace = item;
            else {

                if (item !== this.colorSpace) {

                    this.colorSpace = item;

                    // Max
                    const maxInt = colorEngine.convertColorData(this.currentMaximumColorData, this.colorSpace);
                    this.currentMaximumColorInternalData = maxInt;

                    const maxRet = colorEngine.convertColorData(maxInt, this.returnColorAs);
                    this.currentMaximumColorReturnData = maxRet;

                    this.currentMaximumColorString = colorEngine.buildColorStringFromData(maxRet);

                    // Min
                    const minInt = colorEngine.convertColorData(this.currentMinimumColorData, item);
                    this.currentMinimumColorInternalData = minInt;

                    const minRet = colorEngine.convertColorData(minInt, this.returnColorAs);
                    this.currentMinimumColorReturnData = minRet;

                    this.currentMinimumColorString = colorEngine.buildColorStringFromData(minRet);

                    // Main
                    const mainInt = colorEngine.convertColorData(this.currentColorData, item);
                    this.currentColorInternalData = mainInt;

                    const mainRet = colorEngine.convertColorData(mainInt, this.returnColorAs);
                    this.currentColorReturnData = mainRet;

                    this.currentColorString = colorEngine.buildColorStringFromData(mainRet);

                    this.currentRangePoint = -1;
                }
            }
        }
    }
};

// The `setReturnColorAsHelper` function takes a colorSpace String argument and performs immidiate work to calculate the related `current` attributes.
// + Permitted strings: 'RGB', 'HSL', 'HWB', 'LAB', 'LCH', 'OKLAB', 'OKLCH' (lowercase and mixed case alternatives permitted).
P.setReturnColorAsHelper = function (item) {

    if (item != null && item.toLowerCase) {

        item = item.toLowerCase();

        if (RET_COLOR_SPACES.includes(item)) {

            if (this.returnColorAs == null) this.returnColorAs = item;
            else {

                if (item !== this.returnColorAs) {

                    this.returnColorAs = item;

                    // Max
                    const maxRet = colorEngine.convertColorData(this.currentMaximumColorInternalData, this.returnColorAs);
                    this.currentMaximumColorReturnData = maxRet;

                    this.currentMaximumColorString = colorEngine.buildColorStringFromData(maxRet);

                    // Min
                    const minRet = colorEngine.convertColorData(this.currentMinimumColorInternalData, this.returnColorAs);
                    this.currentMinimumColorReturnData = minRet;

                    this.currentMinimumColorString = colorEngine.buildColorStringFromData(minRet);

                    // Main
                    const mainRet = colorEngine.convertColorData(this.currentColorInternalData, this.returnColorAs);
                    this.currentColorReturnData = mainRet;

                    this.currentColorString = colorEngine.buildColorStringFromData(mainRet);

                    this.currentRangePoint = -1;
                }
            }
        }
    }
};

P.getMinimumColorString = function () {

    return this.currentMinimumColorString;
};

P.getMaximumColorString = function () {

    return this.currentMaximumColorString;
};

P.getMainColorString = function () {

    return this.currentColorString;
};

P.getRangeColor = function (item) {

    if (!_isFinite(item)) item = 0;

    const {
        currentMinimumColorInternalData: min,
        currentMaximumColorInternalData: max,
        colorSpace,
        returnColorAs,
        easing,
        currentRangePoint,
    } = this;

        const val = isa_fn(easing) ? easing(item) : easeEngines[easing](item);

        if (val !== currentRangePoint) {

            let c1 = interpolate(val, min[1], max[1]),
                c2 = interpolate(val, min[2], max[2]),
                c3 = interpolate(val, min[3], max[3]),
                alpha = interpolate(val, min[4], max[4]),
                cMin, cMax;

            // We need to clamp color channels to meet colorSpace requirements
            switch (colorSpace) {

                case RGB :
                    c1 = clamp(c1, 0, 255);
                    c2 = clamp(c2, 0, 255);
                    c3 = clamp(c3, 0, 255);
                    break;

                case OKLCH :
                    c1 = clamp(c1, 0, 1);
                    c2 = clamp(c2, 0, 0.4);

                    cMin = min[2];
                    cMax = max[2];
                    if (cMin <= EPS && cMax <= EPS) c3 = correctAngle(max[3]);
                    else if (cMin <= EPS) c3 = correctAngle(max[3]);
                    else if (cMax <= EPS) c3 = correctAngle(min[3]);
                    else c3 = interpolateShortestHue(val, min[3], max[3]);

                    break;

                case OKLAB :
                    c1 = clamp(c1, 0, 1);
                    c2 = clamp(c2, -0.4, 0.4);
                    c3 = clamp(c3, -0.4, 0.4);
                    break;

                case LCH :
                    c1 = clamp(c1, 0, 100);
                    c2 = clamp(c2, 0, 230);

                    cMin = min[2];
                    cMax = max[2];
                    if (cMin <= EPS && cMax <= EPS) c3 = correctAngle(max[3]);
                    else if (cMin <= EPS) c3 = correctAngle(max[3]);
                    else if (cMax <= EPS) c3 = correctAngle(min[3]);
                    else c3 = interpolateShortestHue(val, min[3], max[3]);

                    break;

                case LAB :
                    c1 = clamp(c1, 0, 100);
                    c2 = clamp(c2, -125, 125);
                    c3 = clamp(c3, -125, 125);
                    break;

                case HSL :
                    c1 = interpolateShortestHue(val, min[1], max[1]);
                    c2 = clamp(c2, 0, 100);
                    c3 = clamp(c3, 0, 100);
                    break;

                case HWB :
                    c1 = interpolateShortestHue(val, min[1], max[1]);
                    c2 = clamp(c2, 0, 100);
                    c3 = clamp(c3, 0, 100);
                    break;

                case XYZ :
                    c1 = clamp(c1, -0.001, 1.2);
                    c2 = clamp(c2, -0.001, 1.2);
                    c3 = clamp(c3, -0.001, 1.2);
                    break;
            }

            alpha = clamp(alpha, 0, 1);

            const data = [colorSpace, c1, c2, c3, alpha];
            this.currentColorInternalData = data;

            const res = colorEngine.convertColorData(data, returnColorAs);
            this.currentColorReturnData = res;

            this.currentColorString = colorEngine.buildColorStringFromData(res);

            this.currentRangePoint = val;
        }
    // }
    return this.currentColorString;
};

P.generateRandomColor = function () {

    const {
        currentMinimumColorInternalData: min,
        currentMaximumColorInternalData: max,
        colorSpace,
        returnColorAs,
    } = this;

    if (_isArray(min) && _isArray(max)) {

        let c1 = interpolate(_random(), min[1], max[1]),
            c2 = interpolate(_random(), min[2], max[2]),
            c3 = interpolate(_random(), min[3], max[3]),
            alpha = interpolate(_random(), min[4], max[4]);

        let cMin, cMax;

        // We need to clamp color channels to meet colorSpace requirements
        switch (colorSpace) {

            case RGB :
                c1 = clamp(c1, 0, 255);
                c2 = clamp(c2, 0, 255);
                c3 = clamp(c3, 0, 255);
                break;

            case OKLCH :
                c1 = clamp(c1, 0, 1);
                c2 = clamp(c2, 0, 0.4);

                cMin = min[2];
                cMax = max[2];
                if (cMin <= EPS && cMax <= EPS) c3 = correctAngle(max[3]);
                else if (cMin <= EPS) c3 = correctAngle(max[3]);
                else if (cMax <= EPS) c3 = correctAngle(min[3]);
                else c3 = interpolateShortestHue(_random(), min[3], max[3]);

                break;

            case OKLAB :
                c1  = clamp(c1, 0, 1);
                c2 = clamp(c2, -0.4, 0.4);
                c3 = clamp(c3, -0.4, 0.4);
                break;

            case LCH :
                c1 = clamp(c1, 0, 100);
                c2 = clamp(c2, 0, 230);

                cMin = min[2];
                cMax = max[2];
                if (cMin <= EPS && cMax <= EPS) c3 = correctAngle(max[3]);
                else if (cMin <= EPS) c3 = correctAngle(max[3]);
                else if (cMax <= EPS) c3 = correctAngle(min[3]);
                else c3 = interpolateShortestHue(_random(), min[3], max[3]);

                break;

            case LAB :
                c1 = clamp(c1, 0, 100);
                c2 = clamp(c2, -125, 125);
                c3 = clamp(c3, -125, 125);
                break;

            case HSL :
                c1 = interpolateShortestHue(_random(), min[1], max[1]);
                c2 = clamp(c2, 0, 100);
                c3 = clamp(c3, 0, 100);
                break;

            case HWB :
                c1 = interpolateShortestHue(_random(), min[1], max[1]);
                c2 = clamp(c2, 0, 100);
                c3 = clamp(c3, 0, 100);
                break;

            case XYZ :
                c1 = clamp(c1, -0.001, 1.2);
                c2 = clamp(c2, -0.001, 1.2);
                c3 = clamp(c3, -0.001, 1.2);
                break;
        }

        alpha = clamp(alpha, 0, 1);

        const data = [colorSpace, c1, c2, c3, alpha];
        this.currentColorInternalData = data;

        const res = colorEngine.convertColorData(data, returnColorAs);
        this.currentColorReturnData = res;

        this.currentColorString = colorEngine.buildColorStringFromData(res);

        this.currentRangePoint = -1;
    }
    return this.currentColorString;
};

// `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
P.getData = function () {

    return this.currentColorString;
};


// #### Passing functions from the color engine through to the factory instance's API
//
// `buildColorStringFromData`
// + Returns appropriate color strings from input data in the form `[space, c1, c2, c3, a]`
// + space ∈ {'rgb','hsl','hwb','lab','lch','oklab','oklch'}
P.buildColorStringFromData = colorEngine.buildColorStringFromData;

// `extractRGBfromColorString` - returns the R, G and B channel values (0 to 255) from a valid CSS Colors level 4 string
P.extractRGBfromColorString = colorEngine.extractRGBfromColorString

// `extractDatafromColorString` - returns the R, G, B (0 to 255) and A (0 to 1) channel values from a valid CSS Colors level 4 string, together with its color space value.
// + Returns an Array in the format `[colorSpace, red, green, blue, alpha]`
P.extractDatafromColorString = colorEngine.getColorValuesFromString

// `convertRGBtoHex`
P.convertRGBtoHex = colorEngine.convertRGBtoHex;


// #### Factory
// ```
// const mycol = scrawl.makeColor({
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
//     fillStyle: mycol.getRangeColor(Math.random()),
//     method: 'fill',
// });
// ```
export const makeColor = function (items) {

    if (!items) return false;
    return new Color(items);
};

constructors.Color = Color;
