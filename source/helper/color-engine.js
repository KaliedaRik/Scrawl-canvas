// # Scrawl-canvas color engine
// TODO: documentation


import { constructors } from '../core/library.js';

import { clamp, clamp8, correctAngle, doCreate } from './utilities.js';

import { checkForWorkstoreItem, getWorkstoreItem, setWorkstoreItem } from './workstore.js';

// Shared constants
import { _2D, _atan2, _cos, _floor, _isArray, _isFinite, _max, _min, _pow, _radian, _round, _sin, _sqrt, BLANK, CANVAS, SOURCE_OVER, T_COLOR_ENGINE, ZERO_STR } from './shared-vars.js';


// #### Local dedicated canvas
const element = document.createElement(CANVAS);
element.width = 1;
element.height = 1;

const engine = element.getContext(_2D, {
    willReadFrequently: true,
});
engine.globalAlpha = 1;
engine.globalCompositeOperation = SOURCE_OVER;


// #### ColorEngine constructor
const ColorEngine = function () {

    return this;
};


// #### ColorEngine prototype
const P = ColorEngine.prototype = doCreate();
P.type = T_COLOR_ENGINE;


// #### Grayscale functions

// `getMetricLinearGrayscaleValue` - Returns linear Y scaled to 0..255 (metric, not display-correct)
P.getMetricLinearGrayscaleValue = function (r, g, b) {

    const R = toLinear(r),
        G = toLinear(g),
        B = toLinear(b);

    const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;

    return (Y * 255 + 0.5) | 0;
};

// `getDisplayLinearGrayscaleValue` - Returns a DISPLAY-ready sRGB gray value 0..255 that matches perceived lightness
P.getDisplayLinearGrayscaleValue = function (r, g, b) {

    const R = toLinear(r),
        G = toLinear(g),
        B = toLinear(b);

    const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;

    return encodeLinearToSRGB8(Y);
};

// `getBestGray` - alias of `getDisplayLinearGrayscaleValue`
P.getBestGray = P.getDisplayLinearGrayscaleValue;

// `getBT709GrayscaleValue` - Classic BT.709 luma (Y′) from gamma-encoded channels
P.getBT709GrayscaleValue = function (r, g, b) {

    return (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.5) | 0;
};

// `getGray` - alias of `getBT709GrayscaleValue`
P.getGray = P.getBT709GrayscaleValue;

// `getBT601GrayscaleValue` - SD-era BT.601 luma — sometimes preferred for “legacy video” look
P.getBT601GrayscaleValue = function (r, g, b) {

    return (0.299 * r + 0.587 * g + 0.114 * b + 0.5) | 0;
};

// `getRGBGrayscaleValue` - Naive average
P.getRGBGrayscaleValue = function (r, g, b) {

    return ((r + g + b) / 3 + 0.5) | 0;
};


// #### Extract channel values from CSS color strings
//
// Helper functions
const COMMA = ',',
    COMMA_SPLIT = /\s*,\s*/,
    DEG = 'deg',
    FAIL = [0, 0, 0, 0],
    GRAD = 'grad',
    HEX = '#',
    HSL = 'hsl',
    HSL_MATCH = /^(?:hsl|hsla)\s*\(\s*([^)]+)\s*\)$/,
    HWB = 'hwb',
    HWB_MATCH = /^hwb\s*\(\s*([^)]+)\s*\)$/,
    INC_COLOR = 'color(',
    INC_COLOR_FROM = 'color(from',
    INC_COLOR_MIX = 'color-mix(',
    INC_HASH = '#',
    INC_HSL = 'hsl(',
    INC_HSLA = 'hsla(',
    INC_HWB = 'hwb(',
    INC_LAB = 'lab(',
    INC_LCH = 'lch(',
    INC_OKLAB = 'oklab(',
    INC_OKLCH = 'oklch(',
    INC_RGB = 'rgb(',
    INC_RGBA = 'rgba(',
    LAB = 'lab',
    LAB_MATCH = /^lab\s*\(\s*([^)]+)\s*\)$/,
    LCH = 'lch',
    LCH_MATCH = /^lch\s*\(\s*([^)]+)\s*\)$/,
    MATCH_ANGLE = /[a-z%]+$/,
    NONE = 'none',
    OKLAB = 'oklab',
    OKLCH = 'oklch',
    PCT = '%',
    RAD = 'rad',
    RGB = 'rgb',
    RGBA_MATCH = /^(?:rgb|rgba)\s*\(\s*([^)]+)\s*\)$/,
    SLASH = '/',
    SPACE_KILL = /\s+/g,
    SPACE_SPLIT = /\s+/,
    STRING = 'string',
    TEST_HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}(?:[0-9a-f]{2})?)$/,
    TEST_PCT = /%$/,
    TEXT_ZERO = '0',
    TO_DEG = 180 / Math.PI,
    TURN = 'turn',
    XYZ = 'xyz';


// A small pool of reusable objects, for returning results from helper functions
const helperResultsPool = [];
const requestHelperResult = () => {

    if (helperResultsPool.length) {

        const h = helperResultsPool.pop();
        h.ok = false;
        h.value = 0;
        return h;
    }
    else return { ok: false, value: 0 };
};
const releaseHelperResult = (...helpers) => {

    for (const h of helpers) {

        helperResultsPool.push(h);
    }
};

// `parseRgbChannel` - parse an RGB channel (number 0 - 255 or percentage 0% - 100%)
const parseRgbChannel = (input) => {

    input = input.trim();
    if (!input) return NaN;

    if (TEST_PCT.test(input)) {

        const v = parseFloat(input.slice(0, -1));
        if (!_isFinite(v)) return NaN;

        return _round(clamp(v, 0, 100) * 255 / 100);
    }
    else {

        const v = parseFloat(input);
        if (!_isFinite(v)) return NaN;

        return _round(clamp(v, 0, 255));
    }
};

// `parseAlphaChannel` - parse alpha (number 0.0 - 1.0 or percentage 0% - 100%)
const parseAlphaChannel = (input) => {

    input = input.trim();
    if (!input) return NaN;

    if (TEST_PCT.test(input)) {

        const v = parseFloat(input.slice(0, -1));
        if (!_isFinite(v)) return NaN;
        return clamp(v / 100, 0, 1);
    }
    else {

        const v = parseFloat(input);
        if (!_isFinite(v)) return NaN;
        return clamp(v, 0, 1);
    }
};

// `parseAngleOrNone` - parse angle values to return a Number value between 0 - 359
// + Note that for the purposes of this module the keyword 'none' returns a value of `0`, not the `null` value mandated by the CSS color spec 4 documentation
const parseAngleOrNone = (input) => {

    input = input.trim().toLowerCase();

    if (!input) return NaN;
    if (input === NONE) return 0;

    const unitMatch = input.match(MATCH_ANGLE),
        unit = unitMatch ? unitMatch[0] : ZERO_STR,
        num = parseFloat(input);

    if (!_isFinite(num)) return NaN;

    let deg;

    switch (unit) {

        case ZERO_STR:
        case DEG:
            deg = num;
            break;

        case RAD:
            deg = num * TO_DEG;
            break;

        case GRAD:
            deg = num * 0.9;
            break;

        case TURN:
            deg = num * 360;
            break;

        default:
            return NaN;
    }

    deg = ((deg % 360) + 360) % 360;

    return deg;
};

// `parsePercentOrNone` - parse a percentage value to return a Number value between 0 - 100
// + Note that for the purposes of this module the keyword 'none' returns a value of `0`, not the `null` value mandated by the CSS color spec 4 documentation
const parsePercentOrNone = (input) => {

    const res = requestHelperResult();

    input = input.trim().toLowerCase();

    if (!input) return res;

    if (input === NONE) {

        res.ok = true;
        return res;
    }

    const isPct = TEST_PCT.test(input),
        num = parseFloat(isPct ? input.slice(0, -1) : input);

    if (!_isFinite(num)) return res;

    const pct = clamp(num, 0, 100);

    res.ok = true;
    res.value = pct;

    return res;
};

// `parseNumberOrNone` - parse a value to return a Number value
// + Note that for the purposes of this module the keyword 'none' returns a value of `0`, not the `null` value mandated by the CSS color spec 4 documentation
const parseNumberOrNone = (input) => {

    const res = requestHelperResult();

    input = input.trim().toLowerCase();

    if (!input) return res;

    if (input === NONE) {

        res.ok = true;
        return res;
    }

    if (input.endsWith(PCT)) input = input.slice(0, -1);

    const v = parseFloat(input);

    if (!_isFinite(v)) return res;

    res.ok = true;
    res.value = v;

    return res;
};

// Map OKLCH chroma: <number> or <percentage>; 'none' => 0; clamp to [0.0, 0.4]
const parseOklchChroma = (input) => {

    const res = requestHelperResult();

    input = input.trim().toLowerCase();
    if (!input) return res;

    if (input === NONE) {

        res.ok = true;
        return res;
    }

    const isPct = input.endsWith(PCT);
    if (isPct) input = input.slice(0, -1);

    const v = parseFloat(input);
    if (!_isFinite(v)) return res;

    const mapped = isPct ? (v / 100) * 0.4 : v;

    res.ok = true;
    res.value = clamp(mapped, 0, 0.4);

    return res;
};


// `parseHexToRGBA` - for #RGB, #RGBA, #RRGGBB and #RRGGBBAA inputs. Returns [r, g, b, a] where:
// + rgb are in the range `0 - 255`
// + a is in the range `0.0 - 1.0`
const parseHexToRGBA = (input) => {

    if (typeof input !== STRING) return FAIL;

    const s = input.trim().toLowerCase().replace(SPACE_KILL, ZERO_STR);

    if (!TEST_HEX.test(s)) return FAIL;

    let h = s.slice(1);

    if (h.length === 3 || h.length === 4) h = h.split(ZERO_STR).map(ch => ch + ch).join(ZERO_STR);

    const r = parseInt(h.slice(0, 2), 16),
        g = parseInt(h.slice(2, 4), 16),
        b = parseInt(h.slice(4, 6), 16),
        a = (h.length === 8) ? parseInt(h.slice(6, 8), 16) / 255 : 1;

    if (!_isFinite(r) || !_isFinite(g) || !_isFinite(b) || !_isFinite(a)) return FAIL;

    return [r, g, b, a];
};

// `parseRgbFunctionToRGBA` - for rgb() and rgba() inputs. Returns [r, g, b, a] where:
// + rgb are in the range `0 - 255`
// + a is in the range `0.0 - 1.0`
const parseRgbFunctionToRGBA = (input) => {

    if (typeof input !== STRING) return FAIL;

    const s = input.trim().toLowerCase(),
        m = s.match(RGBA_MATCH);

    if (!m) return FAIL;

    const inner = m[1].trim();

    let tokens,
        a = 1;

    if (inner.includes(COMMA)) {

        tokens = inner.split(COMMA_SPLIT);

        if (tokens.length !== 3 && tokens.length !== 4) return FAIL;

        if (tokens.length === 4) a = parseAlphaChannel(tokens[3]);
    }
    else {

        const slashSplit = inner.split(SLASH);

        if (slashSplit.length === 1) {

            tokens = slashSplit[0].trim().split(SPACE_SPLIT).filter(Boolean);

            if (tokens.length !== 3) return FAIL;
        }
        else if (slashSplit.length === 2) {

            const rgbPart = slashSplit[0].trim();
            const alphaPart = slashSplit[1].trim();
            tokens = rgbPart.split(SPACE_SPLIT).filter(Boolean);

            if (tokens.length !== 3 || !alphaPart) return FAIL;

            a = parseAlphaChannel(alphaPart);
        }
        else return FAIL;
    }

    const r = parseRgbChannel(tokens[0]),
        g = parseRgbChannel(tokens[1]),
        b = parseRgbChannel(tokens[2]);

    if (!_isFinite(r) || !_isFinite(g) || !_isFinite(b) || !_isFinite(a)) return FAIL;

    return [r, g, b, a];
};

// `parseHslFunctionToHSLA` - for `hsl()` and `hsla()` input. Returns [h, s, l, a] where:
// + h is in the range 0 - 360 (degrees)
// + s and l are in the range 0 - 100 (%)
// + a is in the range 0.0 - 1.0
const parseHslFunctionToHSLA = (input) => {

    if (!input.substring) return FAIL;

    const s = input.trim().toLowerCase(),
        m = s.match(HSL_MATCH);

    if (!m) return FAIL;

    const inner = m[1].trim();

    let tokens,
        a = 1;

    if (inner.includes(COMMA)) {

        tokens = inner.split(COMMA_SPLIT);
        if (tokens.length !== 3 && tokens.length !== 4) return FAIL;

        if (tokens.length === 4) {

            a = parseAlphaChannel(tokens[3]);
            if (!_isFinite(a)) return FAIL;
        }
    }
    else {

        const slashSplit = inner.split(SLASH);

        if (slashSplit.length === 1) {

            tokens = slashSplit[0].trim().split(SPACE_SPLIT).filter(Boolean);
            if (tokens.length !== 3) return FAIL;
        }
        else if (slashSplit.length === 2) {

            const left = slashSplit[0].trim();
            const right = slashSplit[1].trim();

            tokens = left.split(SPACE_SPLIT).filter(Boolean);

            if (tokens.length !== 3 || !right) return FAIL;

            a = parseAlphaChannel(right);
            if (!_isFinite(a)) return FAIL;
        }
        else return FAIL;
    }

    const h = parseAngleOrNone(tokens[0]),
        sRes = parsePercentOrNone(tokens[1]),
        lRes = parsePercentOrNone(tokens[2]);

    if (!sRes.ok || !lRes.ok || !_isFinite(h)) {

        releaseHelperResult(sRes, lRes);
        return FAIL;
    }

    const sPct = sRes.value,
        lPct = lRes.value;

    releaseHelperResult(sRes, lRes);

    return [h, sPct, lPct, a];
};

// `parseHwbFunctionToHWBA` - for `hwb()` input. Returns [h, w, b, a] where:
// + h is in the range 0 - 360 (degrees)
// + w and b are in the range 0 - 100 (%)
// + a is in the range 0.0 - 1.0
const parseHwbFunctionToHWBA = (input) => {

    if (typeof input !== STRING) return FAIL;

    const s = input.trim().toLowerCase();
    if (s.includes(COMMA)) return FAIL;

    const m = s.match(HWB_MATCH);
    if (!m) return FAIL;

    const inner = m[1].trim();

    let tokens,
        a = 1;

    const slashSplit = inner.split(SLASH);

    if (slashSplit.length === 1) {

        tokens = slashSplit[0].trim().split(SPACE_SPLIT).filter(Boolean);

        if (tokens.length !== 3) return FAIL;
    }
    else if (slashSplit.length === 2) {

        const left = slashSplit[0].trim();
        const right = slashSplit[1].trim();
        tokens = left.split(SPACE_SPLIT).filter(Boolean);

        if (tokens.length !== 3 || !right) return FAIL;

        a = parseAlphaChannel(right);
        if (!_isFinite(a)) return FAIL;

    }
    else return FAIL;

    const h = parseAngleOrNone(tokens[0]),
        wRes = parsePercentOrNone(tokens[1]),
        bRes = parsePercentOrNone(tokens[2]);

    if (!_isFinite(h) || !wRes.ok || !bRes.ok) {

        releaseHelperResult(wRes, bRes);
        return FAIL;
    }

    const wPct = wRes.value,
        bPct = bRes.value;

    releaseHelperResult(wRes, bRes);

    return [h, wPct, bPct, a];
};


// `parseLabFunctionToLABA` - for lab() input. Returns [L, a, b, alpha] where:
// + L is in the range 0 – 100
// + a, b are clamped to [-125, 125]; 'none' resolves to 0
// + alpha is in the range 0.0 – 1.0
const parseLabFunctionToLABA = (input) => {

    if (typeof input !== STRING) return FAIL;

    const s = input.trim().toLowerCase();
    if (s.includes(COMMA)) return FAIL;

    const m = s.match(LAB_MATCH);
    if (!m) return FAIL;

    const inner = m[1].trim();

    let tokens,
        alpha = 1;

    const slashSplit = inner.split(SLASH);

    if (slashSplit.length === 1) {

        tokens = slashSplit[0].trim().split(SPACE_SPLIT).filter(Boolean);

        if (tokens.length !== 3) return FAIL;
    }
    else if (slashSplit.length === 2) {

        const left  = slashSplit[0].trim();
        const right = slashSplit[1].trim();
        tokens = left.split(SPACE_SPLIT).filter(Boolean);

        if (tokens.length !== 3 || !right) return FAIL;

        alpha = parseAlphaChannel(right);
        if (!_isFinite(alpha)) return FAIL;
    }
    else return FAIL;

    const lRes = parsePercentOrNone(tokens[0]),
        aRes = parseNumberOrNone(tokens[1]),
        bRes = parseNumberOrNone(tokens[2]);

    if (!lRes.ok || !aRes.ok || !bRes.ok) {

        releaseHelperResult(lRes, aRes, bRes);
        return FAIL;
    }

    const L = clamp(lRes.value, 0, 100),
        aCh = clamp(aRes.value, -125, 125),
        bCh = clamp(bRes.value, -125, 125);

    releaseHelperResult(lRes, aRes, bRes);

    if (!_isFinite(L) || !_isFinite(aCh) || !_isFinite(bCh)) return FAIL;

    return [L, aCh, bCh, alpha];
};

// `parseLchFunctionToLCHA` - for `lch()` input. Returns [L, C, h, a] where:
// + L is 0–100 (clamped; via parsePercentOrNone)
// + C is 0–150 (clamped; via parseNumberOrNone; 'none' => 0)
// + h is angle in [0,360) (accepts 'none' => 0)
// + a is 0.0–1.0
const parseLchFunctionToLCHA = (input) => {

    if (typeof input !== STRING) return FAIL;

    const s = input.trim().toLowerCase();
    if (s.includes(COMMA)) return FAIL;

    const m = s.match(LCH_MATCH);
    if (!m) return FAIL;

    const inner = m[1].trim();

    let tokens,
        a = 1;

    const slashSplit = inner.split(SLASH);

    if (slashSplit.length === 1 || slashSplit.length === 2) {

        const left = slashSplit[0].trim();
        tokens = left.split(SPACE_SPLIT).filter(Boolean);

        if (tokens.length !== 3) return FAIL;

        if (slashSplit.length === 2) {

            const right = slashSplit[1].trim();

            if (!right) return FAIL;

            a = parseAlphaChannel(right);
            if (!_isFinite(a)) return FAIL;
        }
    } else return FAIL;

    const lRes = parsePercentOrNone(tokens[0]),
        cRes = parseNumberOrNone(tokens[1]),
        hue  = parseAngleOrNone(tokens[2]);

    if (!lRes.ok || !cRes.ok || !_isFinite(hue)) {

        releaseHelperResult(lRes, cRes);
        return FAIL;
    }

    const L = clamp(lRes.value, 0, 100),
        C = clamp(cRes.value, 0, 150),
        h = hue;

    releaseHelperResult(lRes, cRes);

    if (!_isFinite(L) || !_isFinite(C) || !_isFinite(h)) return FAIL;

    return [L, C, h, a];
};

// `parseOklabFunctionToOKLABA` - for `oklab()` input. Returns [L, a, b, alpha] where:
// + L is: 0-1 (as per standard); or 0–100 (non-standard percentage semantics)
// + a, b are numbers in [-0.4, 0.4]; percentage inputs [-100%, 100%] map to [-0.4, 0.4]; 'none' => 0
// + alpha is 0.0–1.0
const parseOklabFunctionToOKLABA = (input) => {

    if (typeof input !== STRING) return FAIL;

    const s = input.trim().toLowerCase();
    if (s.includes(COMMA)) return FAIL;

    const m = s.match(/^oklab\s*\(\s*([^)]+)\s*\)$/);
    if (!m) return FAIL;

    const inner = m[1].trim();

    let tokens,
        alpha = 1;

    const slashSplit = inner.split(SLASH);

    if (slashSplit.length === 1) {

        tokens = slashSplit[0].trim().split(SPACE_SPLIT).filter(Boolean);
        if (tokens.length !== 3) return FAIL;

    }
    else if (slashSplit.length === 2) {

        const left  = slashSplit[0].trim(),
            right = slashSplit[1].trim();

        tokens = left.split(SPACE_SPLIT).filter(Boolean);
        if (tokens.length !== 3 || !right) return FAIL;

        alpha = parseAlphaChannel(right);
        if (!_isFinite(alpha)) return FAIL;

    }
    else return FAIL;

    const lIsPct = tokens[0].endsWith('%'),
        aIsPct = tokens[1].endsWith('%'),
        bIsPct = tokens[2].endsWith('%');

    const lRes = lIsPct ? parsePercentOrNone(tokens[0]) : parseNumberOrNone(tokens[0]),
        aRes = parseNumberOrNone(tokens[1]),
        bRes = parseNumberOrNone(tokens[2]);

    if (!lRes.ok || !aRes.ok || !bRes.ok) {

        releaseHelperResult(lRes, aRes, bRes);
        return FAIL;
    }

    let lVal = lRes.value;
    if (lIsPct) lVal = lVal * 0.01;

    let aVal = aRes.value;
    if (aIsPct) aVal = aVal * 0.004;

    let bVal = bRes.value;
    if (bIsPct) bVal = bVal * 0.004;

    const L = clamp(lVal, 0, 1),
        aCh = clamp(aVal, -0.4, 0.4),
        bCh = clamp(bVal, -0.4, 0.4);

    releaseHelperResult(lRes, aRes, bRes);

    if (!_isFinite(L) || !_isFinite(aCh) || !_isFinite(bCh)) return FAIL;

    return [L, aCh, bCh, alpha];
};

// `parseOklchFunctionToOKLCHA` - for `oklch()` input. Returns [L, C, h, a] where:
// + L is: 0-1 (as per standard); or 0–100 (non-standard percentage semantics)
// + C is 0.0–0.4 (clamped; via parseOklchChroma; 'none' => 0)
// + h is angle in [0,360) (accepts 'none' => 0; via parseAngleOrNone)
// + a is 0.0–1.0
const parseOklchFunctionToOKLCHA = (input) => {

    if (typeof input !== STRING) return FAIL;

    const s = input.trim().toLowerCase();
    if (s.includes(COMMA)) return FAIL;

    const m = s.match(/^oklch\s*\(\s*([^)]+)\s*\)$/);
    if (!m) return FAIL;

    const inner = m[1].trim();

    const slashSplit = inner.split(SLASH);

    let tokens,
        a = 1;

    if (slashSplit.length === 1 || slashSplit.length === 2) {

        const left = slashSplit[0].trim();
        tokens = left.split(SPACE_SPLIT).filter(Boolean);

        if (tokens.length !== 3) return FAIL;

        if (slashSplit.length === 2) {

            const right = slashSplit[1].trim();

            if (!right) return FAIL;

            a = parseAlphaChannel(right);

            if (!_isFinite(a)) return FAIL;
        }
    }
    else return FAIL;

    const lIsPct = tokens[0].endsWith('%');

    const lRes = lIsPct ? parsePercentOrNone(tokens[0]) : parseNumberOrNone(tokens[0]),
        cRes = parseOklchChroma(tokens[1]),
        hue  = parseAngleOrNone(tokens[2]);

    if (!lRes.ok || !cRes.ok || !_isFinite(hue)) {

        releaseHelperResult(lRes, cRes);
        return FAIL;
    }

    const lVal = lRes.value * (lIsPct ? 0.01 : 1);

    const L = clamp(lVal, 0, 1),
        C = cRes.value;

    releaseHelperResult(lRes, cRes);

    if (!_isFinite(L) || !_isFinite(C) || !_isFinite(hue)) return FAIL;

    return [L, C, hue, a];
};


// `getColorStringsCache` - Manages a map of colorstring: [rgba] values. The function retrieves it from the workstore or - if it has not yet been created or has been deleted - creates, stores and returns it to the calling function.
const COLOR_STRINGS_CACHE = 'rgb-and-ok-space-color-values-cache';
const getColorStringsCache = function () {

    if (!checkForWorkstoreItem(COLOR_STRINGS_CACHE)) {

        setWorkstoreItem(COLOR_STRINGS_CACHE, new Map());
    }

    return getWorkstoreItem(COLOR_STRINGS_CACHE);
};

const parseColorStringFromCanvas = (input) => {

    const key = input.trim(),
        cache = getColorStringsCache(),
        hit = cache.get(key);

    if (hit) return hit;

    const prev = engine.fillStyle;
    engine.fillStyle = '#010203';

    const baseline = engine.fillStyle;
    engine.fillStyle = key;

    const applied = engine.fillStyle;

    if (applied === baseline && key !== baseline) {

        const out = [...FAIL];
        cache.set(key, out);
        engine.fillStyle = prev;

        return out;
    }

    engine.clearRect(0, 0, 1, 1);
    engine.fillRect(0, 0, 1, 1);

    const d = engine.getImageData(0, 0, 1, 1).data;
    const out = [d[0], d[1], d[2], d[3] / 255];

    cache.set(key, out);

    engine.fillStyle = prev;

    return out;
};

// `getColorValuesFromString` - Returns [space, c1, c2, c3, a]
// + space ∈ {'rgb','hsl','hwb','lab','lch','oklab','oklch'}
const getColorValuesFromString = P.getColorValuesFromString = function (input) {

    if (typeof input !== STRING) return [RGB, 0, 0, 0, 0];

    const s = input.trim().toLowerCase();
    if (!s) return [RGB, 0, 0, 0, 0];

    if (s.includes(INC_COLOR_MIX) || s.includes(INC_COLOR_FROM)) return [RGB, 0, 0, 0, 0];

    const asResult = (space, arr4) => [space, arr4[0], arr4[1], arr4[2], arr4[3]];

    if (s.includes(INC_HASH)) {

        const vals = parseHexToRGBA(input);
        return asResult(RGB, vals);
    }

    if (s.includes(INC_OKLCH)) {

        const vals = parseOklchFunctionToOKLCHA(input);
        return asResult(OKLCH, vals);
    }

    if (s.includes(INC_OKLAB)) {

        const vals = parseOklabFunctionToOKLABA(input);
        return asResult(OKLAB, vals);
    }

    if (s.includes(INC_LCH)) {

        const vals = parseLchFunctionToLCHA(input);
        return asResult(LCH, vals);
    }

    if (s.includes(INC_LAB)) {

        const vals = parseLabFunctionToLABA(input);
        return asResult(LAB, vals);
    }

    if (s.includes(INC_RGB) || s.includes(INC_RGBA)) {

        const vals = parseRgbFunctionToRGBA(input);
        return asResult(RGB, vals);
    }

    if (s.includes(INC_HSL) || s.includes(INC_HSLA)) {

        const vals = parseHslFunctionToHSLA(input);
        return asResult(HSL, vals);
    }

    if (s.includes(INC_HWB)) {

        const vals = parseHwbFunctionToHWBA(input);
        return asResult(HWB, vals);
    }

    if (s.includes(INC_COLOR)) {

        const vals = parseColorStringFromCanvas(input);
        return asResult(RGB, vals);
    }

    const vals = parseColorStringFromCanvas(input);
    return asResult(RGB, vals);
};

// `extractRGBfromColorString` - returns the R, G and B channel values (0 to 255) from a valid CSS Colors level 4 string
P.extractRGBfromColorString = function (item) {

    const data = getColorValuesFromString(item);

    if (data[0] === RGB) return [data[1], data[2], data[3]];

    const out = convertColorData(data, RGB);

    return [out[1], out[2], out[3]];
};


// #### Color string creation
// `buildColorStringFromData`
// + Returns appropriate color strings from input data in the form `[space, c1, c2, c3, a]`
// + space ∈ {'rgb','hsl','hwb','lab','lch','oklab','oklch'}
P.buildColorStringFromData = function (data) {

    if (data == null || !_isArray(data) || data.length !== 5) return BLANK;

    const [space, c1, c2, c3, alpha] = data;

    if (typeof space !== STRING || !_isFinite(c1) || !_isFinite(c2) || !_isFinite(c3)) return BLANK;

    let a = _isFinite(alpha) ? alpha : 1;
    a = a > 1 ? 1 : a < 0 ? 0 : a;

    let R, G, B, H, S, L, W, A, C;

    switch (space) {

        case RGB:
            R = clamp8(_round(clamp(c1, 0, 255)));
            G = clamp8(_round(clamp(c2, 0, 255)));
            B = clamp8(_round(clamp(c3, 0, 255)));
            return `rgb(${R} ${G} ${B} / ${a})`;

        case HSL:
            H = correctAngle(c1);
            S = clamp(c2, 0, 100);
            L = clamp(c3, 0, 100);
            return `hsl(${H} ${S}% ${L}% / ${a})`;

        case HWB:
            H = correctAngle(c1);
            W = clamp(c2, 0, 100);
            B = clamp(c3, 0, 100);
            return `hwb(${H} ${W}% ${B}% / ${a})`;

        case LAB:
            L = clamp(c1, 0, 100);
            A = clamp(c2, -125, 125);
            B = clamp(c3, -125, 125);
            return `lab(${L}% ${A} ${B} / ${a})`;

        case LCH:
            L = clamp(c1, 0, 100);
            C = clamp(c2, 0, 230);
            H = correctAngle(c3);
            return `lch(${L}% ${C} ${H} / ${a})`;

        case OKLAB:
            L = clamp(c1, 0, 1);
            A = clamp(c2, -0.4, 0.4);
            B = clamp(c3, -0.4, 0.4);
            return `oklab(${L} ${A} ${B} / ${a})`;

        case OKLCH:
            L = clamp(c1, 0, 1);
            C = clamp(c2, 0, 0.4);
            H = correctAngle(c3);
            return `oklch(${L} ${C} ${H} / ${a})`;

        case XYZ:
            {
                const [lStar, aStar, bStar] = convertXYZtoLAB(c1, c2, c3);
                L = clamp(lStar, 0, 100);
                A = clamp(aStar, -125, 125);
                B = clamp(bStar, -125, 125);
                return `lab(${L}% ${A} ${B} / ${a})`;
            }

        default:
            return BLANK;
    }
};

P.convertRGBtoHex = function (r, g, b) {

    r = _max(0, _round(_min(255, _isFinite(r) ? r : 0)));
    g = _max(0, _round(_min(255, _isFinite(g) ? g : 0)));
    b = _max(0, _round(_min(255, _isFinite(b) ? b : 0)));

    return HEX + [r, g, b]
        .map(x => x.toString(16).padStart(2, TEXT_ZERO))
        .join(ZERO_STR);
};


// #### Color RGB <-> OK* caching
const AB_GRANULARITY = 625,
    C_GRANULARITY = 250,
    H_GRANULARITY = 1.5,
    HIGH_GRANULARITY = 1000,
    HIGH_STEP = 400,
    LAB_STRIDE_A = 501,
    LAB_STRIDE_L = 501 * 501,
    LCH_STRIDE_C = 540,
    LCH_STRIDE_L = 201 * 540,
    LOW_GRANULARITY = 250,
    LOW_L_CEILING = 0.4,
    MAKE_AB_POSITIVE = 0.4,
    MAX_AB = 0.4,
    MAX_C = 0.8,
    MAX_L = 1,
    MED_GRANULARITY = 600,
    MED_L_CEILING = 0.9,
    MED_STEP = 100,
    MIN_AB = -0.4,
    MIN_C = 0,
    MIN_L = 0,
    RGB_OK_CACHE = 'rgb-and-ok-spaces-color-values-cache';


// `getRgbOkCache` - Manages the three color point libraries. The function retrieves them from the workstore or - if they have not yet been created or have been deleted - creates, stores and returns them to the calling function.
const getRgbOkCache = P.getRgbOkCache = function () {

    if (!checkForWorkstoreItem(RGB_OK_CACHE)) {

        setWorkstoreItem(RGB_OK_CACHE, {
            labColorLib: new Map(),
            lchColorLib: new Map(),
            rgbColorLib: new Map(),
        });
    }

    return getWorkstoreItem(RGB_OK_CACHE);
};

// `getOkValsForRgb` - returns an array of OKLAB/OKLCH calculated values for a given RGB color point
// + Arguments __r, g, b__ - positive integer clamped between 0-255 - RGB red, green and blue channel values
// + Argument __libs__ - the object returned by the `getRgbOkCache` function
// + Return an array: `[oklab|oklch_L, oklab_A, oklab_B, oklch_C, oklch_H]`
P.getOkValsForRgb = function (r, g, b, libs) {

    if (libs == null) libs = getRgbOkCache();

    const k = rgbKey(r, g, b),
        hit = libs.rgbColorLib.get(k);

    if (hit !== undefined) return hit;

    const lab = convertRGBtoOKLAB(r, g, b),
        lch = convertOKLABtoOKLCH(lab[0], lab[1], lab[2]),
        vals = [lab[0], lab[1], lab[2], lch[1], lch[2]];

    libs.rgbColorLib.set(k, vals);

    libs.labColorLib.set(labKeyFromLab(lab[0], lab[1], lab[2]), [r, g, b]);
    libs.lchColorLib.set(lchKeyFromLch(lch[0], lch[1], lch[2]),   [r, g, b]);

    return vals;
};

// `getRgbValsForOklch` - returns an array of RGB channel values for a given OKLCH color point.
// + Argument __libs__ - the object returned by the `getRgbOkCache` function
// + Return an array of RGB color values: `[r, g, b]`
P.getRgbValsForOklch = function (l, ac, bh, libs) {

    if (libs == null) libs = getRgbOkCache();

    const k = lchKeyFromLch(l, ac, bh),
        hit = libs.lchColorLib.get(k);

    if (hit !== undefined) return hit;

    const lab = convertOKLCHtoOKLAB(l, ac, bh),
        rgb = convertOKLABtoRGB(lab[0], lab[1], lab[2]);

    libs.lchColorLib.set(k, rgb);
    libs.labColorLib.set(labKeyFromLab(lab[0], lab[1], lab[2]), rgb);

    return rgb;
};

// `getRgbValsForOklab` - returns an array of RGB channel values for a given OKLAB color point
// + Argument __libs__ - the object returned by the `getRgbOkCache` function
// + Return an array of RGB color values: `[r, g, b]`
P.getRgbValsForOklab = function (l, ac, bh, libs) {

    if (libs == null) libs = getRgbOkCache();

    const k = labKeyFromLab(l, ac, bh),
        hit = libs.labColorLib.get(k);

    if (hit !== undefined) return hit;

    const rgb = convertOKLABtoRGB(l, ac, bh);
    libs.labColorLib.set(k, rgb);

    const lch = convertOKLABtoOKLCH(l, ac, bh);
    libs.lchColorLib.set(lchKeyFromLch(lch[0], lch[1], lch[2]), rgb);

    return rgb;
};

// The paint engine quantizes OK* color space channels for easy storage and access
// + Using these quantized values it can then store color data in the color point libraries using keys generated from these quantized values
//
// `labKeyFromLab` - quick generation of key based on OKLAB values
const labKeyFromLab = function (l, a, b) {

    const L = getLuminanceIndex(l);

    if (a < MIN_AB) a = MIN_AB;
    else if (a > MAX_AB) a = MAX_AB;

    if (b < MIN_AB) b = MIN_AB;
    else if (b > MAX_AB) b = MAX_AB;

    const A = _floor((a + MAKE_AB_POSITIVE) * AB_GRANULARITY);
    const B = _floor((b + MAKE_AB_POSITIVE) * AB_GRANULARITY);

    return (L * LAB_STRIDE_L) + (A * LAB_STRIDE_A) + B;
};

// `lchKeyFromLch` - quick generation of key based on OKLCH values
const lchKeyFromLch = function (l, c, h) {

    const L = getLuminanceIndex(l);

    if (c < MIN_C) c = MIN_C;
    else if (c > MAX_C) c = MAX_C;

    const C = _floor(c * C_GRANULARITY),
        H = _floor(h * H_GRANULARITY);

    return (L * LCH_STRIDE_L) + (C * LCH_STRIDE_C) + H;
};

// `rgbKey` - quick generation of key based on RGB values
const rgbKey = function (r, g, b) {

    return (r << 16) | (g << 8) | b;
};

// `getLuminanceIndex` - Perceptual luminance quantization: denser in midtones, coarser in highlights/shadows
const getLuminanceIndex = function (l) {

    if (l < MIN_L) l = MIN_L;
    else if (l > MAX_L) l = MAX_L;

    if (l < LOW_L_CEILING) return _floor(l * LOW_GRANULARITY);
    if (l < MED_L_CEILING) return _floor(MED_STEP + ((l - LOW_L_CEILING) * MED_GRANULARITY));
    return _floor(HIGH_STEP + ((l - MED_L_CEILING) * HIGH_GRANULARITY));
};


// #### Color space conversion functions
//
// Color conversion local constants
const E = 216/24389,
    K = 24389/27,
    _cbrt = Math.cbrt,
    cbrt = (_cbrt != null) ? _cbrt : (val) => _pow(val, 1 / 3);

const D50 = [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585];


// Color conversion helper functions
//
// sRGB gamma LUTs
// + 8-bit sRGB -> linear [0..1]
const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0, v; i < 256; i++) {

    v = i / 255;
    SRGB_TO_LINEAR[i] = (v <= 0.04045) ? v / 12.92 : _pow((v + 0.055) / 1.055, 2.4);
}

// Higher-precision encode table: map 12-bit linear to 8-bit sRGB
// + 4097 entries to include 1.0
const LINEAR12_TO_SRGB8 = new Uint8ClampedArray(4097);
for (let i = 0, v, e; i <= 4096; i++) {

    v = i / 4096;

    e = (v <= 0.0031308) ? 12.92 * v : 1.055 * _pow(v, 1 / 2.4) - 0.055;

    LINEAR12_TO_SRGB8[i] = (e * 255 + 0.5) | 0;
}

// `toLinear` - (internal function) Linearize a single 8-bit sRGB channel (0..255) -> linear float [0..1]
const toLinear = (u8) => SRGB_TO_LINEAR[u8 & 255];

// `encodeLinearToSRGB8` - (internal function) Encode linear [0..1] -> 8-bit sRGB via 12-bit table
const encodeLinearToSRGB8 = (lin) => {

    let idx = (lin * 4096 + 0.5) | 0;

    if (idx < 0) idx = 0;
    else if (idx > 4096) idx = 4096;

    return LINEAR12_TO_SRGB8[idx];
};


// The following functionality has been lifted/adapted from [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) (unless mentioned otherwise)
//
// **RGB <-> HSL color conversions**
//
// `convertRGBtoHSL` - internal helper function
const convertRGBtoHSL = function (red, green, blue) {

    red /= 255;
    green /= 255;
    blue /= 255;

    const max = _max(red, green, blue),
        min = _min(red, green, blue),
        light = (min + max)/2,
        d = max - min;

    let hue = 0,
        sat = 0;

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
const convertHSLtoRGB = function (hue, sat, light) {

    hue = correctAngle(hue);
    sat /= 100;
    light /= 100;

    const f = function (n) {

        const k = (n + hue/30) % 12,
            a = sat * _min(light, 1 - light);

        return light - a * _max(-1, _min(k - 3, 9 - k, 1));
    }

    return [
        clamp8(_round(f(0) * 255)),
        clamp8(_round(f(8) * 255)),
        clamp8(_round(f(4) * 255)),
    ];
};


// **RGB <-> HWB color conversions**
//
// `convertRGBtoHWB` - internal helper function
const convertRGBtoHWB = function (red, green, blue) {

    const hsl = convertRGBtoHSL(red, green, blue);

    red /= 255;
    green /= 255;
    blue /= 255;

    const white = _min(red, green, blue),
        black = 1 - _max(red, green, blue);

    return [hsl[0], white * 100, black * 100];
};

// `convertHWBtoRGB` - internal helper function
const convertHWBtoRGB = function (hue, white, black) {

    white /= 100;
    black /= 100;

    if (white + black >= 1) {

        const gray = white / (white + black);
        const u8 = clamp8(_round(gray * 255));

        return [u8, u8, u8];
    }

    const rgb = convertHSLtoRGB(hue, 100, 50);

    for (let i = 0; i < 3; i++) {

        let c = rgb[i] / 255;
        c = c * (1 - white - black) + white;
        rgb[i] = clamp8(_round(c * 255));
    }
    return rgb;
};


// **RGB <-> XYZ color conversions**
//
// `convertRGBtoXYZ` - internal helper function
const convertRGBtoXYZ = function (r, g, b) {

    const R = toLinear(r),
        G = toLinear(g),
        B = toLinear(b);

    const x = 0.4123907992659593 * R + 0.3575843393838780 * G + 0.1804807884018343 * B;
    const y = 0.2126390058715104 * R + 0.7151686787677560 * G + 0.0721923153607337 * B;
    const z = 0.0193308187155919 * R + 0.1191947797946259 * G + 0.9505321522496606 * B;

    return [x, y, z];
};

// `convertXYZtoRGB` - internal helper function
const convertXYZtoRGB = function (x, y, z) {

    const rLin =  3.2409699419045213  * x + -1.5373831775700935  * y + -0.4986107602930033  * z;
    const gLin = -0.9692436362808798  * x +  1.8759675015077206  * y +  0.04155505740717561 * z;
    const bLin =  0.05563007969699361 * x + -0.20397695888897657 * y +  1.0569715142428786  * z;

    const r = encodeLinearToSRGB8(rLin),
        g = encodeLinearToSRGB8(gLin),
        b = encodeLinearToSRGB8(bLin);

    return [r, g, b];
};

const _inverseRadian = 180 / Math.PI;

// **XYZ <-> LAB color conversions**
//
// `convertXYZtoLAB` - internal helper function
const convertXYZtoLAB = function (x, y, z) {

    const x50 =  1.0479298208405488   * x + 0.022946793341019088 * y - 0.05019222954313557 * z;
    const y50 =  0.029627815688159344 * x + 0.990434484573249    * y - 0.01707382502938514 * z;
    const z50 = -0.009243058152591178 * x + 0.015055144896577895 * y + 0.7518742899580008  * z;

    const xr = x50 / D50[0];
    const yr = y50 / D50[1];
    const zr = z50 / D50[2];

    const fx = (xr > E) ? cbrt(xr) : (K * xr + 16) / 116;
    const fy = (yr > E) ? cbrt(yr) : (K * yr + 16) / 116;
    const fz = (zr > E) ? cbrt(zr) : (K * zr + 16) / 116;

    return [
        116 * fy - 16,
        500 * (fx - fy),
        200 * (fy - fz),
    ];
};

// `convertLABtoXYZ` - internal helper function
const convertLABtoXYZ = function (l, a, b) {

    const fy = (l + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;

    const fx3 = fx * fx * fx;
    const fz3 = fz * fz * fz;
    const xr = (fx3 > E) ? fx3 : (116 * fx - 16) / K;
    const yr = (l > K * E) ? ((l + 16) / 116) ** 3 : l / K;
    const zr = (fz3 > E) ? fz3 : (116 * fz - 16) / K;

    const x50 = xr * D50[0];
    const y50 = yr * D50[1];
    const z50 = zr * D50[2];

    const x =  0.9554734527042182   * x50 - 0.023098536874261423 * y50 + 0.0632593086610217   * z50;
    const y = -0.028369706963208136 * x50 + 1.0099954580058226   * y50 + 0.021041398966943008 * z50;
    const z =  0.012314001688319899 * x50 - 0.020507696433477912 * y50 + 1.3303659366080753   * z50;

    return [x, y, z];
};


// **LAB <-> LCH color conversions**
//
// `convertLABtoLCH` - internal helper function
const convertLABtoLCH = function (l, a, b) {

    const hue = _atan2(b, a) * _inverseRadian;

    return [
        l,
        _sqrt(_pow(a, 2) + _pow(b, 2)),
        (hue >= 0) ? hue : hue + 360
    ];
};

// `convertLCHtoLAB` - internal helper function
const convertLCHtoLAB = function (l, c, h) {

    return [
        l,
        c * _cos(h * _radian),
        c * _sin(h * _radian),
    ];
};


// **RGB <-> OKLAB color conversions**
// The following calculations taken from [Björn Ottosson's](https://bottosson.github.io/) blogpost: [A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/)
//
// `convertRGBtoOKLAB` - internal helper function
const convertRGBtoOKLAB = function (r, g, b) {

    const R = toLinear(r),
        G = toLinear(g),
        B = toLinear(b);

    const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
    const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
    const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;

    const l_ = cbrt(l),
        m_ = cbrt(m),
        s_ = cbrt(s);

    return [
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    ];
};

// `convertOKLABtoRGB` - internal helper function
const convertOKLABtoRGB = function (L, A, B) {

    const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
    const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
    const s_ = L - 0.0894841775 * A - 1.2914855480 * B;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    const rLin =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    return [
        encodeLinearToSRGB8(rLin),
        encodeLinearToSRGB8(gLin),
        encodeLinearToSRGB8(bLin),
    ];
};


// **XYZ <-> OKLAB color conversions**
//
// `convertXYZtoOKLAB` - internal helper function
const convertXYZtoOKLAB = function (x, y, z) {

    const l = 0.8190224432164319  * x + 0.3619062562801221  * y - 0.12887378261216414 * z;
    const m = 0.0329836671980271  * x + 0.9292868468965546  * y + 0.03614466816999844 * z;
    const s = 0.048177199566046255* x + 0.26423952494422764 * y + 0.6335478258136937  * z;

    const l_ = cbrt(l);
    const m_ = cbrt(m);
    const s_ = cbrt(s);

    return [
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    ];
};

// `convertOKLABtoXYZ` - internal helper function
const convertOKLABtoXYZ = function (L, A, B) {

    const l_ = 0.9999999984505198 * L + 0.39633779217376786 * A + 0.2158037580607588  * B;
    // eslint-disable-next-line no-loss-of-precision
    const m_ = 1.0000000088817608 * L - 0.10556134232365635 * A - 0.0638541747717059  * B;
    // eslint-disable-next-line no-loss-of-precision
    const s_ = 1.000000054672411  * L - 0.08948418209496576 * A - 1.2914855378640917  * B;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    const x =  1.2268798733741557  * l - 0.5578149965554813  * m + 0.28139105017721583 * s;
    const y = -0.04057576262431372 * l + 1.1122868293970594  * m - 0.07171106666151701 * s;
    const z = -0.07637294974672142 * l - 0.4214933239627914  * m + 1.5869240244272418  * s;

    return [x, y, z];
};


// **OKLAB <-> OKLCH color conversions**
// The following calculations taken from [Björn Ottosson's](https://bottosson.github.io/) blogpost: [A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/)
//
// `convertOKLABtoOKLCH` - internal helper function
const convertOKLABtoOKLCH = function (l, a, b) {

    const hue = _atan2(b, a) * _inverseRadian;

    return [
        l,
        _sqrt(a ** 2 + b ** 2),
        hue >= 0 ? hue : hue + 360,
    ];
};

// `convertOKLCHtoOKLAB` - internal helper function
const convertOKLCHtoOKLAB = function (l, c, h) {

    return [
        l,
        c * _cos(h * _radian),
        c * _sin(h * _radian),
    ];
};

const convertColorData = P.convertColorData = function (input, output) {

    const [space, c1, c2, c3, alpha] = input;

    if (space === output) return input;

    const converted = conversionTree[space][output](c1, c2, c3);

    return [output, converted[0], converted[1], converted[2], alpha];
};

// `conversionTree` - an object of objects, each containing functions to convert from one color space to another.
//
// **RGB <-> HSL color conversions**
// `convertRGBtoHSL` - internal helper function
// `convertHSLtoRGB` - internal helper function

// **RGB <-> HWB color conversions**
// `convertRGBtoHWB` - internal helper function
// `convertRGBHtoHWB` - internal helper function
// `convertHWBtoRGB` - internal helper function

// **RGB <-> XYZ color conversions**
// `convertRGBtoXYZ` - internal helper function
// `convertXYZtoRGB` - internal helper function

// **XYZ <-> LAB color conversions**
// `convertXYZtoLAB` - internal helper function
// `convertLABtoXYZ` - internal helper function

// **LAB <-> LCH color conversions**
// `convertLABtoLCH` - internal helper function
// `convertLCHtoLAB` - internal helper function

// **RGB <-> OKLAB color conversions**
// `convertRGBtoOKLAB` - internal helper function
// `convertOKLABtoRGB` - internal helper function

// **XYZ <-> OKLAB color conversions**
// `convertXYZtoOKLAB` - internal helper function
// `convertOKLABtoXYZ` - internal helper function

// **OKLAB <-> OKLCH color conversions**
// `convertOKLABtoOKLCH` - internal helper function
// `convertOKLCHtoOKLAB` - internal helper function
//
// ```
//                HSL          HWB
//                     \     /
//                       RGB
//                     /     \
//                  /          \
//             XYZ              OKLAB
//           /     \              |
//        LAB      OKLAB        OKLCH
//         |         |
//        LCH      OKLCH
//
// ```
// conversionTree — now includes XYZ as a top-level branch and as a target in all branches
const conversionTree = {

    [RGB]: {
        [RGB]: (a, b, c) => [a, b, c],
        [HSL]: (a, b, c) => convertRGBtoHSL(a, b, c),
        [HWB]: (a, b, c) => convertRGBtoHWB(a, b, c),
        [XYZ]: (a, b, c) => convertRGBtoXYZ(a, b, c),
        [LAB]: (a, b, c) => convertXYZtoLAB(...convertRGBtoXYZ(a, b, c)),
        [LCH]: (a, b, c) => convertLABtoLCH(...convertXYZtoLAB(...convertRGBtoXYZ(a, b, c))),
        [OKLAB]: (a, b, c) => convertRGBtoOKLAB(a, b, c),
        [OKLCH]: (a, b, c) => convertOKLABtoOKLCH(...convertRGBtoOKLAB(a, b, c)),
    },

    [HSL]: {
        [RGB]: (a, b, c) => convertHSLtoRGB(a, b, c),
        [HSL]: (a, b, c) => [a, b, c],
        [HWB]: (a, b, c) => convertRGBtoHWB(...convertHSLtoRGB(a, b, c)),
        [XYZ]: (a, b, c) => convertRGBtoXYZ(...convertHSLtoRGB(a, b, c)),
        [LAB]: (a, b, c) => convertXYZtoLAB(...convertRGBtoXYZ(...convertHSLtoRGB(a, b, c))),
        [LCH]: (a, b, c) => convertLABtoLCH(...convertXYZtoLAB(...convertRGBtoXYZ(...convertHSLtoRGB(a, b, c)))),
        [OKLAB]: (a, b, c) => convertRGBtoOKLAB(...convertHSLtoRGB(a, b, c)),
        [OKLCH]: (a, b, c) => convertOKLABtoOKLCH(...convertRGBtoOKLAB(...convertHSLtoRGB(a, b, c))),
    },

    [HWB]: {
        [RGB]: (a, b, c) => convertHWBtoRGB(a, b, c),
        [HSL]: (a, b, c) => convertRGBtoHSL(...convertHWBtoRGB(a, b, c)),
        [HWB]: (a, b, c) => [a, b, c],
        [XYZ]: (a, b, c) => convertRGBtoXYZ(...convertHWBtoRGB(a, b, c)),
        [LAB]: (a, b, c) => convertXYZtoLAB(...convertRGBtoXYZ(...convertHWBtoRGB(a, b, c))),
        [LCH]: (a, b, c) => convertLABtoLCH(...convertXYZtoLAB(...convertRGBtoXYZ(...convertHWBtoRGB(a, b, c)))),
        [OKLAB]: (a, b, c) => convertRGBtoOKLAB(...convertHWBtoRGB(a, b, c)),
        [OKLCH]: (a, b, c) => convertOKLABtoOKLCH(...convertRGBtoOKLAB(...convertHWBtoRGB(a, b, c))),
    },

    [XYZ]: {
        [RGB]: (a, b, c) => convertXYZtoRGB(a, b, c),
        [HSL]: (a, b, c) => convertRGBtoHSL(...convertXYZtoRGB(a, b, c)),
        [HWB]: (a, b, c) => convertRGBtoHWB(...convertXYZtoRGB(a, b, c)),
        [XYZ]: (a, b, c) => [a, b, c],
        [LAB]: (a, b, c) => convertXYZtoLAB(a, b, c),
        [LCH]: (a, b, c) => convertLABtoLCH(...convertXYZtoLAB(a, b, c)),
        [OKLAB]: (a, b, c) => convertXYZtoOKLAB(a, b, c),
        [OKLCH]: (a, b, c) => convertOKLABtoOKLCH(...convertXYZtoOKLAB(a, b, c)),
    },

    [LAB]: {
        [RGB]: (a, b, c) => convertXYZtoRGB(...convertLABtoXYZ(a, b, c)),
        [HSL]: (a, b, c) => convertRGBtoHSL(...convertXYZtoRGB(...convertLABtoXYZ(a, b, c))),
        [HWB]: (a, b, c) => convertRGBtoHWB(...convertXYZtoRGB(...convertLABtoXYZ(a, b, c))),
        [XYZ]: (a, b, c) => convertLABtoXYZ(a, b, c),
        [LAB]: (a, b, c) => [a, b, c],
        [LCH]: (a, b, c) => convertLABtoLCH(a, b, c),
        [OKLAB]: (a, b, c) => convertXYZtoOKLAB(...convertLABtoXYZ(a, b, c)),
        [OKLCH]: (a, b, c) => convertOKLABtoOKLCH(...convertXYZtoOKLAB(...convertLABtoXYZ(a, b, c))),
    },

    [LCH]: {
        [RGB]: (a, b, c) => convertXYZtoRGB(...convertLABtoXYZ(...convertLCHtoLAB(a, b, c))),
        [HSL]: (a, b, c) => convertRGBtoHSL(...convertXYZtoRGB(...convertLABtoXYZ(...convertLCHtoLAB(a, b, c)))),
        [HWB]: (a, b, c) => convertRGBtoHWB(...convertXYZtoRGB(...convertLABtoXYZ(...convertLCHtoLAB(a, b, c)))),
        [XYZ]: (a, b, c) => convertLABtoXYZ(...convertLCHtoLAB(a, b, c)),
        [LAB]: (a, b, c) => convertLCHtoLAB(a, b, c),
        [LCH]: (a, b, c) => [a, b, c],
        [OKLAB]: (a, b, c) => convertXYZtoOKLAB(...convertLABtoXYZ(...convertLCHtoLAB(a, b, c))),
        [OKLCH]: (a, b, c) => convertOKLABtoOKLCH(...convertXYZtoOKLAB(...convertLABtoXYZ(...convertLCHtoLAB(a, b, c)))),
    },

    [OKLAB]: {
        [RGB]: (a, b, c) => convertOKLABtoRGB(a, b, c),
        [HSL]: (a, b, c) => convertRGBtoHSL(...convertOKLABtoRGB(a, b, c)),
        [HWB]: (a, b, c) => convertRGBtoHWB(...convertOKLABtoRGB(a, b, c)),
        [XYZ]: (a, b, c) => convertOKLABtoXYZ(a, b, c),
        [LAB]: (a, b, c) => convertXYZtoLAB(...convertOKLABtoXYZ(a, b, c)),
        [LCH]: (a, b, c) => convertLABtoLCH(...convertXYZtoLAB(...convertOKLABtoXYZ(a, b, c))),
        [OKLAB]: (a, b, c) => [a, b, c],
        [OKLCH]: (a, b, c) => convertOKLABtoOKLCH(a, b, c),
    },

    [OKLCH]: {
        [RGB]: (a, b, c) => convertOKLABtoRGB(...convertOKLCHtoOKLAB(a, b, c)),
        [HSL]: (a, b, c) => convertRGBtoHSL(...convertOKLABtoRGB(...convertOKLCHtoOKLAB(a, b, c))),
        [HWB]: (a, b, c) => convertRGBtoHWB(...convertOKLABtoRGB(...convertOKLCHtoOKLAB(a, b, c))),
        [XYZ]: (a, b, c) => convertOKLABtoXYZ(...convertOKLCHtoOKLAB(a, b, c)),
        [LAB]: (a, b, c) => convertXYZtoLAB(...convertOKLABtoXYZ(...convertOKLCHtoOKLAB(a, b, c))),
        [LCH]: (a, b, c) => convertLABtoLCH(...convertXYZtoLAB(...convertOKLABtoXYZ(...convertOKLCHtoOKLAB(a, b, c)))),
        [OKLAB]: (a, b, c) => convertOKLCHtoOKLAB(a, b, c),
        [OKLCH]: (a, b, c) => [a, b, c],
    },
};


// #### Factory
constructors.ColorEngine = ColorEngine;

// Create a singleton color engine, for export and use within this code base
export const colorEngine = new ColorEngine();
