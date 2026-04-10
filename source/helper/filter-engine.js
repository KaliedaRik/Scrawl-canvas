// # Scrawl-canvas filter engine
// All Scrawl-canvas filters-related image manipulation work happens in this engine code. Note that this functionality is entirely separate from the &lt;canvas> element's context engine's native `filter` functionality, which allows us to add CSS/SVG-based filters to the canvas context
// + Note that prior to v8.5.0 most of this code lived in an (asynchronous) web worker. Web worker functionality has now been removed from Scrawl-canvas as it was not adding sufficient efficiency to rendering speed


import { constructors, filter, filternames, styles, stylesnames } from '../core/library.js';

import { seededRandomNumberGenerator } from './random-seed.js';

import { correctAngle, doCreate, easeEngines, isa_fn } from './utilities.js';

import { getOrAddWorkstoreItem, getWorkstoreItem, setAndReturnWorkstoreItem, setWorkstoreItem } from './workstore.js';

import { colorEngine } from './color-engine.js';

import { releaseArray, requestArray } from './array-pool.js';

import { makeAnimation } from '../factory/animation.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';

import { bluenoise } from './filter-engine-bluenoise-data.js';

// Shared constants
import { _abs, _atan2, _ceil, _cos, _floor, _isArray, _isFinite, _max, _min, _piHalf, _pow, _radian, _round, _sin, _sqrt, ALPHA_TO_CHANNELS, ALPHA_TO_LUMINANCE, AREA_ALPHA, ARG_SPLITTER, AVERAGE_CHANNELS, BLACK_WHITE, BLEND, BLUENOISE, BLUR, CHANNELS_TO_ALPHA, CHROMA, CLAMP_CHANNELS, CLAMP_VALUES, CLEAR, COLOR, COLORS_TO_ALPHA, COMPOSE, CORRODE, DECONVOLUTE, DEFAULT_SEED, DESTINATION_OUT, DESTINATION_OVER, DISPLACE, DOWN, EMBOSS, FLOOD, GAUSSIAN_BLUR, GLITCH, GRAYSCALE, GREEN, INVERT_CHANNELS, LOCK_CHANNELS_TO_LEVELS, LUMINANCE_TO_ALPHA, MAP_TO_GRADIENT, MATRIX, MEAN, MODIFY_OK_CHANNELS, MODULATE_CHANNELS, MODULATE_OK_CHANNELS, MULTIPLY, NEGATIVE, NEWSPRINT, OFFSET, OK_PERCEPTUAL_CURVES, PIXELATE, PROCESS_IMAGE, RANDOM, RANDOM_NOISE, RED, REDUCE_PALETTE, ROTATE_HUE, ROUND, SET_CHANNEL_TO_LEVEL, SOURCE, SOURCE_IN, SOURCE_OUT, SOURCE_OVER, STEP_CHANNELS, SWIRL, THRESHOLD, TILES, TINT_CHANNELS, UP, UNSHARP, USER_DEFINED_LEGACY, VARY_CHANNELS_BY_WEIGHTS, ZERO_STR, ZOOM_BLUR } from './shared-vars.js';

// Local constants
const _256 = 256,
    _256_SQUARE = 256 * 256,
    _exp = Math.exp,
    BLUE = 'blue',
    CHROMA_MATCH = 'chroma-match',
    COLOR_BURN = 'color-burn',
    COLOR_DODGE = 'color-dodge',
    CURRENT = 'current',
    DARKEN = 'darken',
    DESTINATION_ATOP = 'destination-atop',
    DESTINATION_IN = 'destination-in',
    DESTINATION_ONLY = 'destination-only',
    DIFFERENCE = 'difference',
    EXCLUSION = 'exclusion',
    GRAY_PALETTES = ['black-white', 'monochrome-4', 'monochrome-8', 'monochrome-16'],
    HARD_LIGHT = 'hard-light',
    HEX = 'hex',
    HUE = 'hue',
    HUE_MATCH = 'hue-match',
    LIGHTEN = 'lighten',
    LIGHTER = 'lighter',
    LUMINOSITY = 'luminosity',
    MONOCHROME_16 = 'monochrome-16',
    MONOCHROME_4 = 'monochrome-4',
    MONOCHROME_8 = 'monochrome-8',
    NAIVE_GRAY_LUT = 'naive-gray-lut',
    ORDERED = 'ordered',
    OVERLAY = 'overlay',
    POINTS = 'points',
    RECT = 'rect',
    SATURATION = 'saturation',
    SCREEN = 'screen',
    SOFT_LIGHT = 'soft-light',
    SOURCE_ALPHA = 'source-alpha',
    SOURCE_ATOP = 'source-atop',
    SOURCE_ONLY = 'source-only',
    T_FILTER_ENGINE = 'FilterEngine',
    XOR = 'xor';

const OK_BLENDS = [HUE, SATURATION, LUMINOSITY, COLOR, HUE_MATCH, CHROMA_MATCH];

const orderedNoise = new Float32Array([0.00,0.50,0.13,0.63,0.03,0.53,0.16,0.66,0.75,0.25,0.88,0.38,0.78,0.28,0.91,0.41,0.19,0.69,0.06,0.56,0.22,0.72,0.09,0.59,0.94,0.44,0.81,0.31,0.97,0.47,0.84,0.34,0.05,0.55,0.17,0.67,0.02,0.52,0.14,0.64,0.80,0.30,0.92,0.42,0.77,0.27,0.89,0.39,0.23,0.73,0.11,0.61,0.20,0.70,0.08,0.58,0.98,0.48,0.86,0.36,0.95,0.45,0.83,0.33]);

const newspaperPatterns = [
    new Uint8Array([0,0,0,0]),
    new Uint8Array([0,0,0,180]),
    new Uint8Array([180,0,0,0]),
    new Uint8Array([180,0,0,180]),
    new Uint8Array([0,180,180,180]),
    new Uint8Array([180,180,180,0]),
    new Uint8Array([180,180,180,180]),
    new Uint8Array([180,180,180,255]),
    new Uint8Array([255,180,180,180]),
    new Uint8Array([255,180,180,255]),
    new Uint8Array([180,255,255,255]),
    new Uint8Array([255,255,255,180]),
    new Uint8Array([255,255,255,255])
];

const predefinedPalette = {
    [BLACK_WHITE]: [255, 0],
    [MONOCHROME_4]: [255, 187, 102, 0],
    [MONOCHROME_8]: [255, 221, 187, 153, 119, 85, 51, 0],
    [MONOCHROME_16]: [255, 238, 221, 204, 187, 170, 153, 136, 119, 102, 85, 68, 51, 34, 17, 0],
}


// A backdoor to retrieve the last palette used by the `reduce-palette` filter
// + We use this in Demo filters-027 to report the colors used in the commonest colors palette
let lastUsedReducePalette = 'black-white';
const setLastUsedReducePalette = (val) => lastUsedReducePalette = val;
export const getLastUsedReducePalette = () => lastUsedReducePalette;


// __cache__ - an Object consisting of `key:Object` pairs where the key is the named input of a `process-image` action or the output of any action object. This object is cleared and re-initialized each time the `engine.action` function is invoked
let cache = null;

// #### FilterEngine constructor
const FilterEngine = function () {

    // __actions__ - the Array of action objects that the engine needs to process.
    this.actions = [];

    return this;
};


// #### FilterEngine prototype
const P = FilterEngine.prototype = doCreate();
P.type = T_FILTER_ENGINE;

P.action = function (packet) {

    const { identifier, filters, image } = packet;
    const { actions, theBigActionsObject } = this;

    let i, iz, actData, a;

    const itemInWorkstore = getWorkstoreItem(identifier);
    if (itemInWorkstore) return itemInWorkstore;

    actions.length = 0;

    for (i = 0, iz = filters.length; i < iz; i++) {

        actions.push(...filters[i].actions);
    }

    const actionsLen = actions.length;

    if (actionsLen) {

        this.unknit(image);

        for (i = 0; i < actionsLen; i++) {

            actData = actions[i];
            a = theBigActionsObject[actData.action];

            if (a) a.call(this, actData);
        }

        if (identifier) setWorkstoreItem(identifier, cache.work);

        return cache.work;
    }
    return image;
};


// ### Permanent variables

// `unknit` - called at the start of each new message action chain. Creates and populates the __source__ and __work__ objects from the image data supplied in the message
P.unknit = function (image) {

    cache = {};

    const { width, height, data } = image;

    cache.source = new ImageData(new Uint8ClampedArray(data), width, height);
    cache.work = new ImageData(new Uint8ClampedArray(data), width, height);
};


// ### Functions invoked by a range of different action functions
//
const getRandomNumbers = function (items = {}) {

    const {
        seed = DEFAULT_SEED,
        length = 0,
        imgWidth = 0,
        type = RANDOM,
    } = items;

    const name = `random-${seed}-${length}-${type}`,
        itemInWorkstore = getWorkstoreItem(name);

    if (itemInWorkstore) return itemInWorkstore;

    if ((type === BLUENOISE || type === ORDERED) && imgWidth) {

        const base = (type === BLUENOISE) ? bluenoise : orderedNoise,
            dim = (_sqrt(base.length) | 0),
            imgH = ((length / imgWidth) | 0),
            out = new Float32Array(length);

        let p = 0,
            y, y0, x;

        for (y = 0; y < imgH && p < length; y++) {

            y0 = (y % dim) * dim;

            for (x = 0; x < imgWidth && p < length; x++) {

                out[p++] = base[y0 + (x % dim)];
            }
        }
        setWorkstoreItem(name, out);

        return out;
    }
    else {

        const engine = seededRandomNumberGenerator(seed),
            out = new Float32Array(length);

        for (let i = 0; i < length; i++) {

            out[i] = engine.random();
        }
        setWorkstoreItem(name, out);

        return out;
    }
};

// Build compact tile rectangles (no per-pixel arrays).
// + Returns an Int32Array laid out as [x0, y0, x1, y1, x0, y0, x1, y1, ...]
const buildTileRects = function (tileWidth, tileHeight, offsetX, offsetY, image) {

    if (!image) image = cache.source;

    const iWidth  = image.width | 0,
        iHeight = image.height | 0;

    if (!iWidth || !iHeight) return new Int32Array(0);

    let tW = (_isFinite(tileWidth) ? tileWidth : 1) | 0,
        tH = (_isFinite(tileHeight) ? tileHeight : 1) | 0,
        offX = (_isFinite(offsetX) ? offsetX : 0) | 0,
        offY = (_isFinite(offsetY) ? offsetY : 0) | 0;

    if (tW < 1) tW = 1;
    if (tW >= iWidth)  tW = iWidth - 1;
    if (tH < 1) tH = 1;
    if (tH >= iHeight) tH = iHeight - 1;

    if (offX < 0) offX = 0;
    else if (offX >= tW) offX = tW - 1;

    if (offY < 0) offY = 0;
    else if (offY >= tH) offY = tH - 1;

    const name = `simple-tileset-rects-${iWidth}-${iHeight}-${tW}-${tH}-${offX}-${offY}`;

    const cached = getWorkstoreItem(name);
    if (cached) return cached;

    const rects = requestArray();

    let j, y0, y1, yEnd, i, x0, x1, xEnd;

    for (j = offY - tH; j < iHeight; j += tH) {

        y0 = (j < 0 ? 0 : j);
        y1 = j + tH;

        if (y0 >= iHeight) break;

        yEnd = (y1 > iHeight ? iHeight : y1);

        for (i = offX - tW; i < iWidth; i += tW) {

            x0 = (i < 0 ? 0 : i);
            x1 = i + tW;

            if (x0 >= iWidth) break;

            xEnd = (x1 > iWidth ? iWidth : x1);

            if (x0 < xEnd && y0 < yEnd) rects.push(x0, y0, xEnd, yEnd);
        }
    }
    const out = new Int32Array(rects);

    setWorkstoreItem(name, out);

    releaseArray(rects);

    return out;
};

// `getInputAndOutputLines` - determine, and return, the appropriate results object for the lineIn, lineMix and lineOut values supplied to each action function when it gets invoked
const getInputAndOutputLines = function (requirements) {

    const getAlphaData = function (image) {

        const { width, height, data:iData } = image,
            aImg = new ImageData(width, height),
            aData = aImg.data;

        for (let i = 3, len = iData.length; i < len; i += 4) {

            aData[i] = (iData[i] > 0) ? 255 : 0;
        }

        return aImg;
    };

    const sourceData = cache.source;

    let lineIn = cache.work,
        lineMix = false,
        alphaData = false;

    if (requirements.lineIn === SOURCE_ALPHA || requirements.lineMix === SOURCE_ALPHA) alphaData = getAlphaData(sourceData);

    if (requirements.lineIn) {

        if (requirements.lineIn === SOURCE) lineIn = sourceData;
        else if (requirements.lineIn === SOURCE_ALPHA) lineIn = alphaData;
        else if (cache[requirements.lineIn]) lineIn = cache[requirements.lineIn];
    }

    if (requirements.lineMix) {

        if (requirements.lineMix === SOURCE) lineMix = sourceData;
        else if (requirements.lineMix === SOURCE_ALPHA) lineMix = alphaData;
        else if (requirements.lineMix === CURRENT) lineMix = cache.work;
        else if (cache[requirements.lineMix]) lineMix = cache[requirements.lineMix];
    }

    let lineOut;

    if (!requirements.lineOut || !cache[requirements.lineOut]) {

        lineOut = new ImageData(lineIn.width, lineIn.height);

        if (requirements.lineOut) cache[requirements.lineOut] = lineOut;
    }
    else lineOut = cache[requirements.lineOut];

    return [lineIn, lineOut, lineMix];
};

// `processResults` - at the conclusion of each action function, combine the results of the function's manipulations back into the data supplied for manipulation, in line with the value of the action object's `opacity` attribute
const processResults = function (store, incoming, ratio) {

    const sData = store.data,
        iData = incoming.data;

    // Clamp ratio defensively
    if (ratio <= 0) return;

    if (ratio >= 1) {

        sData.set(iData);
        return;
    }

    // If source and destination are literally the same bytes, nothing to do.
    if (sData.buffer === iData.buffer && sData.byteOffset === iData.byteOffset && sData.byteLength === iData.byteLength) return;

    // Convert to fixed-point [0..255]
    const k  = (ratio * 255 + 0.5) | 0,
        ak = 255 - k;

    // Blend 4 channels at a time via 32-bit views
    const nPixels = sData.byteLength >>> 2,
        s32 = new Uint32Array(sData.buffer, sData.byteOffset, nPixels),
        i32 = new Uint32Array(iData.buffer, iData.byteOffset, nPixels);

    // Lane mask: operate on (R,B) in low 16s and (G,A) in high 16s separately
    // + M selects bytes 0 and 2 in each 32-bit word
    // + ROUND is per-lane rounding before >> 8
    const M = 0x00FF00FF,
        ROUND = 0x00800080;

    let sv, iv, s_lo, s_hi, i_lo, i_hi, o_lo, o_hi;

    for (let p = 0, pz = s32.length | 0; p < pz; p++) {

        sv = s32[p];
        iv = i32[p];

        // Split into two 16-bit lanes: low bytes (R,B), high bytes (G,A)
        s_lo = sv & M;
        s_hi = (sv >>> 8) & M;
        i_lo = iv & M;
        i_hi = (iv >>> 8) & M;

        // Per-lane blend with fixed-point 8.8
        o_lo = (((s_lo * ak) + (i_lo * k) + ROUND) >>> 8) & M;
        o_hi = (((s_hi * ak) + (i_hi * k) + ROUND) >>> 8) & M;

        // Repack lanes back to RGBA
        s32[p] = ((o_hi << 8) & 0xFF00FF00) | o_lo;
    }
};

const transferDataUnchanged = function (oData, iData, len) {

    if (len === iData.length) oData.set(iData);
    else oData.set(iData.subarray(0, len));
};

const getGaussianCoeffCache = () => {

    const COEFFS_KEY = 'gaussian-blur::coeffs';

    let m = getWorkstoreItem(COEFFS_KEY);

    if (!m) {
        m = new Map();
        setWorkstoreItem(COEFFS_KEY, m);
    }
    return m;
};

const gaussCoefRawFloat = (sigmaIn) => {

    let sigma = sigmaIn;
    if (sigma < 0.5) sigma = 0.5;

    const a  = _exp(0.726 * 0.726) / sigma,
        g1 = _exp(-a),
        g2 = _exp(-2 * a);

    const a0 = (1 - g1) * (1 - g1) / (1 + 2 * a * g1 - g2),
        a1 = a0 * (a - 1) * g1,
        a2 = a0 * (a + 1) * g1,
        a3 = -a0 * g2,
        b1 = 2 * g1,
        b2 = -g2;

    const left_corner  = (a0 + a1) / (1 - b1 - b2),
        right_corner = (a2 + a3) / (1 - b1 - b2);

    return new Float32Array([a0, a1, a2, a3, b1, b2, left_corner, right_corner]);
};

const getGaussianCoeffsFloat = (sigma) => {

    const s = (sigma > 0 ? sigma : 0) || 0,
        key = s < 0.5 ? 0.5 : Math.round(s * 1024) / 1024,
        cache = getGaussianCoeffCache();

    let c = cache.get(key);

    if (!c) {

        c = gaussCoefRawFloat(key);
        cache.set(key, c);
    }
    return c;
};


// ## Filter action functions
// Each function is held in the `theBigActionsObject` object, for convenience
P.theBigActionsObject = {

// __alpha-to-channels__ - Copies the alpha channel value over to the selected value or, alternatively, sets that channel's value to zero, or leaves the channel's value unchanged. Setting the appropriate "includeChannel" flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate "excludeChannel" flag will set that channel's value to zero.
// __alpha-to-channels__ (32-bit view + byte masks)
    [ALPHA_TO_CHANNELS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

        const {
            opacity = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            excludeRed = true,
            excludeGreen = true,
            excludeBlue = true,
            lineOut,
        } = requirements;

        const Rb = 0x000000FF,
            Gb = 0x0000FF00,
            Bb = 0x00FF0000;

        // Channels to receive alpha
        const incMask = (includeRed ? Rb : 0) | (includeGreen ? Gb : 0) | (includeBlue ? Bb : 0);

        // Channels to zero (only when NOT included)
        const zeroMask = (!includeRed && excludeRed   ? Rb : 0) | (!includeGreen && excludeGreen ? Gb : 0) | (!includeBlue && excludeBlue  ? Bb : 0);

        // Fast path: if we’re not changing RGB at all, only set A=255 for nonzero A
        const onlyAlphaTo255 = (incMask | zeroMask) === 0;

        if (onlyAlphaTo255) {

            let p, pz, s, a;

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                s = src32[p];
                a = (s >>> 24) & 0xFF;

                if (a === 0) continue;

                out32[p] = (s & 0x00FFFFFF) | 0xFF000000;
            }
        }
        else {

            const rgbMask = 0x00FFFFFF;

            let p, pz, s, a, rgb, aRGB;

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                s = src32[p];
                a = (s >>> 24) & 0xFF;

                if (a === 0) continue;

                rgb = s & rgbMask;

                if (zeroMask) rgb &= ~zeroMask;

                if (incMask) {

                    aRGB = (a * 0x00010101) & rgbMask;
                    rgb = (rgb & ~incMask) | (aRGB & incMask);
                }
                out32[p] = 0xFF000000 | rgb;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __alpha-to-luminance__ - Sets the OKLAB luminance channel to the value of the alpha channel, then sets the alpha channel to opaque and the A and B channels to 0 (gray)
    [ALPHA_TO_LUMINANCE]: function (requirements) {

        // A small LUT for oklab gray
        const LUMINANCE_OKLAB_GRAY_LUT = 'alpha-to-luminance-oklab-gray-lut-256';
        const getOklabGrayLut = () => {

            let lut = getWorkstoreItem(LUMINANCE_OKLAB_GRAY_LUT);

            if (lut != null) return lut;

            else {

                lut = new Uint32Array(256);

                const libs = colorEngine.getRgbOkCache();

                let a, L, r, g, b;

                for (a = 0; a < 256; a++) {

                    L = a / 256;
                    if (L > 1) L = 1;
                    else if (L < 0) L = 0;

                    [r, g, b] = colorEngine.getRgbValsForOklab(L, 0, 0, libs);

                    lut[a] = (255 << 24) | (b << 16) | (g << 8) | r;
                }
                setWorkstoreItem(LUMINANCE_OKLAB_GRAY_LUT, lut);

                return lut;
            }
        };

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        const lut = getOklabGrayLut();

        const RGB_MASK = 0x00FFFFFF;

        let p, pz, s, a;

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            s = src32[p];
            a = (s >>> 24) & 0xFF;

            if (a === 0) out32[p] = s & RGB_MASK;
            else out32[p] = lut[a];
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __area-alpha__ - Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to zero. Can be used to create horizontal or vertical bars, or chequerboard effects.
    [AREA_ALPHA]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length,
            width = input.width,
            height = input.height;

        const {
            opacity = 1,
            tileWidth = 1,
            tileHeight = 1,
            offsetX = 0,
            offsetY = 0,
            gutterWidth = 1,
            gutterHeight = 1,
            // [top-left, bottom-left, top-right, bottom-right]
            areaAlphaLevels = [255, 0, 0, 0],
            lineOut,
        } = requirements;

        transferDataUnchanged(oData, iData, len);

        let tW = (_isFinite(tileWidth) ? tileWidth : 1) | 0,
            tH = (_isFinite(tileHeight) ? tileHeight : 1) | 0,
            gW = (_isFinite(gutterWidth) ? gutterWidth : 1) | 0,
            gH = (_isFinite(gutterHeight) ? gutterHeight : 1) | 0;

        if (tW < 1) tW = 1;
        if (tH < 1) tH = 1;

        if (tW + gW >= width)  {

            tW = _max(1, width  - gW - 1);
            gW = _max(1, width  - tW - 1);
        }

        if (tH + gH >= height) {

            tH = _max(1, height - gH - 1);
            gH = _max(1, height - tH - 1);
        }

        const aW = tW + gW,
            aH = tH + gH;

        let offX = (_isFinite(offsetX) ? offsetX : 0) | 0,
            offY = (_isFinite(offsetY) ? offsetY : 0) | 0;

        if (offX < 0) offX = 0;
        else if (offX >= aW) offX = aW - 1;

        if (offY < 0) offY = 0;
        else if (offY >= aH) offY = aH - 1;

        const mod = (a, m) => {
            const r = a % m;
            return r < 0 ? r + m : r;
        };

        let y, localY, inCoreY, localX, x, inCoreX, idx, a, segmentSpan, runLen, remain, p, k;

        for (y = 0; y < height; y++) {

            localY = mod(y - offY, aH);
            inCoreY = (localY < tH);

            localX = mod(0 - offX, aW);
            x = 0;

            while (x < width) {

                inCoreX = (localX < tW);

                idx = inCoreY ? (inCoreX ? 0 : 2) : (inCoreX ? 1 : 3);

                a = areaAlphaLevels[idx] | 0;

                segmentSpan = inCoreX ? (tW - localX) : (aW - localX);
                runLen = segmentSpan;
                remain = width - x;

                if (runLen > remain) runLen = remain;

                p = ((y * width) + x) * 4 + 3;

                for (k = 0; k < runLen; k++) {

                    if (iData[p]) oData[p] = a;
                    p += 4;
                }

                x += runLen;

                localX = (localX + runLen) % aW;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __average-channels__ - Calculates an average value from each pixel's included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to 0.
    [AVERAGE_CHANNELS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

        const {
            opacity = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            excludeRed = false,
            excludeGreen = false,
            excludeBlue = false,
            lineOut,
        } = requirements;

        // Precompute divisor (how many channels contribute to the average)
        const divisor = (includeRed ? 1 : 0) + (includeGreen ? 1 : 0) + (includeBlue ? 1 : 0);

        // Fast path flags (turned into ints to help JIT)
        const incR = includeRed  | 0,
            incG = includeGreen | 0,
            incB = includeBlue | 0,
            excR = excludeRed | 0,
            excG = excludeGreen | 0,
            excB = excludeBlue | 0;

        // Walk one pixel per iteration
        let p, rgba, r, g, b, a, rOut, gOut, bOut, sum, avg;

        for (p = 0; p < src32.length; p++) {

            rgba = src32[p];

            r =  rgba & 0xff;
            g = (rgba >>> 8) & 0xff;
            b = (rgba >>> 16) & 0xff;
            a = (rgba >>> 24) & 0xff;

            if (a === 0) {

                out32[p] = rgba;
                continue;
            }

            if (divisor) {

                sum = (incR ? r : 0) + (incG ? g : 0) + (incB ? b : 0);

                avg = (sum / divisor) | 0;

                rOut = excR ? 0 : avg;
                gOut = excG ? 0 : avg;
                bOut = excB ? 0 : avg;
            }
            else {

                rOut = excR ? 0 : r;
                gOut = excG ? 0 : g;
                bOut = excB ? 0 : b;
            }

            out32[p] = ((a << 24) | (bOut << 16) | (gOut << 8) | (rOut << 0)) >>> 0;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __blend__ - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using various separable and non-separable blend modes (as defined by the W3C Compositing and Blending Level 1 recommendations).
// + The blending method is determined by the String value supplied in the "blend" argument; permitted values are: 'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', and 'saturation'.
// + Scrawl-canvas uses the OKLCH color space to calculate color, hue, luminosity and saturation blends, which may lead to unexpecgted results for users coming from other products. SC also includes the "missing" combinations: 'hue-match', and 'chroma-match'.
// + Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments.
    [BLEND]: function (requirements) {

        const [input, output, mix] = getInputAndOutputLines(requirements);

        const iWidth  = input.width | 0,
            iHeight = input.height | 0,
            iData = input.data,
            mWidth = mix.width | 0,
            mHeight = mix.height | 0,
            mData = mix.data,
            oData = output.data;

        const {
            opacity = 1,
            blend = ZERO_STR,
            offsetX = 0,
            offsetY = 0,
            lineOut,
        } = requirements || {};

        if (!iWidth || !iHeight) {

            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);
            return;
        }

        oData.set(iData);

        const nPixInput = (iWidth * iHeight) | 0,
            nPixMix = (mWidth * mHeight) | 0;

        const i32 = new Uint32Array(iData.buffer, iData.byteOffset, nPixInput),
            m32 = new Uint32Array(mData.buffer, mData.byteOffset, nPixMix),
            o32 = new Uint32Array(oData.buffer, oData.byteOffset, nPixInput);

        const x0 = (offsetX > 0 ? offsetX : 0) | 0,
            y0 = (offsetY > 0 ? offsetY : 0) | 0,
            x1 = _min(iWidth,  offsetX + mWidth)  | 0,
            y1 = _min(iHeight, offsetY + mHeight) | 0;

        const hasOverlap = (x1 > x0) && (y1 > y0);
        if (!hasOverlap) {

            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);
            return;
        }

        const inv255 = 1 / 255;

        const libs = colorEngine.getRgbOkCache();

        const isOkBlend = OK_BLENDS.includes(blend);

        const mx0 = (x0 - offsetX) | 0,
            my0 = (y0 - offsetY) | 0;

        let y, my, x, mx,
            iPix, mPix,
            ip, mp,
            ia8, ma8,
            ir, ig, ib, mr, mg, mb,
            As, Ab,
            br, bg, bb,
            Fr, Fg, Fb, Sr, Sg, Sb, Br, Bg, Bb,
            k, oneMinusAs, oneMinusAb, R, G, B, A,
            outR, outG, outB, outA,
            IL, IC, IH, ML, MC, MH,
            okSrc, okMix,
            tmp;

        for (y = y0, my = my0; y < y1; y++, my++) {

            for (x = x0, mx = mx0; x < x1; x++, mx++) {

                iPix = (y * iWidth + x) | 0;
                mPix = (my * mWidth + mx) | 0;

                ip = i32[iPix];
                mp = m32[mPix];

                ia8 = ip >>> 24;
                ma8 = mp >>> 24;

                if (ia8 === 0 || ma8 === 0) continue;

                ir = ip & 0xFF;
                ig = (ip >>> 8) & 0xFF;
                ib = (ip >>> 16) & 0xFF;

                mr = mp & 0xFF;
                mg = (mp >>> 8) & 0xFF;
                mb = (mp >>> 16) & 0xFF;

                As = ia8 * inv255;
                Ab = ma8 * inv255;

                if (isOkBlend) {

                    okSrc = colorEngine.getOkValsForRgb(ir, ig, ib, libs);
                    okMix = colorEngine.getOkValsForRgb(mr, mg, mb, libs);

                    IL = okSrc[0];
                    IC = okSrc[3];
                    IH = okSrc[4];

                    ML = okMix[0];
                    MC = okMix[3];
                    MH = okMix[4];

                    switch (blend) {

                        case COLOR:
                            [br, bg, bb] = colorEngine.getRgbValsForOklch(ML, IC, IH, libs);
                            break;

                        case HUE_MATCH:
                            [br, bg, bb] = colorEngine.getRgbValsForOklch(IL, MC, IH, libs);
                            break;

                        case CHROMA_MATCH:
                            [br, bg, bb] = colorEngine.getRgbValsForOklch(IL, IC, MH, libs);
                            break;

                        case HUE:
                            [br, bg, bb] = colorEngine.getRgbValsForOklch(ML, MC, IH, libs);
                            break;

                        case SATURATION:
                            [br, bg, bb] = colorEngine.getRgbValsForOklch(ML, IC, MH, libs);
                            break;

                        case LUMINOSITY:
                            [br, bg, bb] = colorEngine.getRgbValsForOklch(IL, MC, MH, libs);
                            break;
                    }

                    Fr = br * inv255;
                    Fg = bg * inv255;
                    Fb = bb * inv255;

                    Sr = ir * inv255;
                    Sg = ig * inv255;
                    Sb = ib * inv255;

                    Br = mr * inv255;
                    Bg = mg * inv255;
                    Bb = mb * inv255;

                    k = As * Ab;
                    oneMinusAs = 1 - As;
                    oneMinusAb = 1 - Ab;

                    R = Sr * oneMinusAb + Br * oneMinusAs + Fr * k;
                    G = Sg * oneMinusAb + Bg * oneMinusAs + Fg * k;
                    B = Sb * oneMinusAb + Bb * oneMinusAs + Fb * k;
                    A = As + Ab - As * Ab;
                }
                else {

                    Sr = ir * inv255;
                    Sg = ig * inv255;
                    Sb = ib * inv255;

                    Br = mr * inv255;
                    Bg = mg * inv255;
                    Bb = mb * inv255;

                    switch (blend) {

                        case COLOR_BURN:
                            if (Sr === 0) Fr = 0;
                            else if (Br === 1) Fr = 1;
                            else {
                                tmp = (1 - Br) / Sr;
                                if (tmp > 1) tmp = 1;
                                Fr = 1 - tmp;
                            }

                            if (Sg === 0) Fg = 0;
                            else if (Bg === 1) Fg = 1;
                            else {
                                tmp = (1 - Bg) / Sg;
                                if (tmp > 1) tmp = 1;
                                Fg = 1 - tmp;
                            }

                            if (Sb === 0) Fb = 0;
                            else if (Bb === 1) Fb = 1;
                            else {
                                tmp = (1 - Bb) / Sb;
                                if (tmp > 1) tmp = 1;
                                Fb = 1 - tmp;
                            }
                            break;

                        case COLOR_DODGE:
                            if (Sr === 1) Fr = 1;
                            else if (Br === 0) Fr = 0;
                            else {
                                tmp = Br / (1 - Sr);
                                Fr = tmp > 1 ? 1 : tmp;
                            }

                            if (Sg === 1) Fg = 1;
                            else if (Bg === 0) Fg = 0;
                            else {
                                tmp = Bg / (1 - Sg);
                                Fg = tmp > 1 ? 1 : tmp;
                            }

                            if (Sb === 1) Fb = 1;
                            else if (Bb === 0) Fb = 0;
                            else {
                                tmp = Bb / (1 - Sb);
                                Fb = tmp > 1 ? 1 : tmp;
                            }
                            break;

                        case DARKEN:
                            Fr = _min(Sr, Br);
                            Fg = _min(Sg, Bg);
                            Fb = _min(Sb, Bb);
                            break;

                        case LIGHTEN:
                            Fr = _max(Sr, Br);
                            Fg = _max(Sg, Bg);
                            Fb = _max(Sb, Bb);
                            break;

                        case LIGHTER:
                            Fr = _min(1, Sr + Br);
                            Fg = _min(1, Sg + Bg);
                            Fb = _min(1, Sb + Bb);
                            break;

                        case MULTIPLY:
                            Fr = Sr * Br;
                            Fg = Sg * Bg;
                            Fb = Sb * Bb;
                            break;

                        case SCREEN:
                            Fr = Br + Sr - Br * Sr;
                            Fg = Bg + Sg - Bg * Sg;
                            Fb = Bb + Sb - Bb * Sb;
                            break;

                        case DIFFERENCE:
                            Fr = _abs(Sr - Br);
                            Fg = _abs(Sg - Bg);
                            Fb = _abs(Sb - Bb);
                            break;

                        case EXCLUSION:
                            Fr = Sr + Br - 2 * Sr * Br;
                            Fg = Sg + Bg - 2 * Sg * Bg;
                            Fb = Sb + Bb - 2 * Sb * Bb;
                            break;

                        case OVERLAY:
                            Fr = (Br <= 0.5 ? 2 * Sr * Br : 1 - 2 * (1 - Sr) * (1 - Br));
                            Fg = (Bg <= 0.5 ? 2 * Sg * Bg : 1 - 2 * (1 - Sg) * (1 - Bg));
                            Fb = (Bb <= 0.5 ? 2 * Sb * Bb : 1 - 2 * (1 - Sb) * (1 - Bb));
                            break;

                        case HARD_LIGHT:
                            Fr = (Sr <= 0.5 ? 2 * Sr * Br : 1 - 2 * (1 - Sr) * (1 - Br));
                            Fg = (Sg <= 0.5 ? 2 * Sg * Bg : 1 - 2 * (1 - Sg) * (1 - Bg));
                            Fb = (Sb <= 0.5 ? 2 * Sb * Bb : 1 - 2 * (1 - Sb) * (1 - Bb));
                            break;

                        case SOFT_LIGHT: {

                            const DBr = (Br <= 0.25)
                                ? (((16 * Br - 12) * Br) + 4) * Br
                                : _sqrt(Br);

                            const DBg = (Bg <= 0.25)
                                ? (((16 * Bg - 12) * Bg) + 4) * Bg
                                : _sqrt(Bg);

                            const DBb = (Bb <= 0.25)
                                ? (((16 * Bb - 12) * Bb) + 4) * Bb
                                : _sqrt(Bb);

                            Fr = (Sr <= 0.5)
                                ? (Br - (1 - 2 * Sr) * Br * (1 - Br))
                                : (Br + (2 * Sr - 1) * (DBr - Br));

                            Fg = (Sg <= 0.5)
                                ? (Bg - (1 - 2 * Sg) * Bg * (1 - Bg))
                                : (Bg + (2 * Sg - 1) * (DBg - Bg));

                            Fb = (Sb <= 0.5)
                                ? (Bb - (1 - 2 * Sb) * Bb * (1 - Bb))
                                : (Bb + (2 * Sb - 1) * (DBb - Bb));

                            break;
                        }

                        default:
                            Fr = Sr;
                            Fg = Sg;
                            Fb = Sb;
                    }

                    k = As * Ab;
                    oneMinusAs = 1 - As;
                    oneMinusAb = 1 - Ab;

                    R = Sr * oneMinusAb + Br * oneMinusAs + Fr * k;
                    G = Sg * oneMinusAb + Bg * oneMinusAs + Fg * k;
                    B = Sb * oneMinusAb + Bb * oneMinusAs + Fb * k;
                    A = As + Ab - As * Ab;
                }

                outR = (R * 255) | 0;
                outG = (G * 255) | 0;
                outB = (B * 255) | 0;
                outA = (A * 255) | 0;

                o32[iPix] = (outA << 24) | (outB << 16) | (outG << 8) | outR;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __blur__ - Performs a multi-loop, two-step 'horizontal-then-vertical averaging sweep' calculation across all pixels to create a blur effect.
    [BLUR]: function (requirements) {

        // `getBlurPrefixBuffers` Prefix buffers for blur filter (inclusive prefix sums).
        const getBlurPrefixBuffers = function (len, axisKey) {

            const name = `blur-prefix-${axisKey}-${len}`;

            let obj = getWorkstoreItem(name);
            if (obj) return obj;

            const n = (len + 1),
                bytes = n * 4 * 4,
                buf = new ArrayBuffer(bytes);

            const r = new Uint32Array(buf, 0, n),
                g = new Uint32Array(buf, n * 4, n),
                b = new Uint32Array(buf, n * 8, n),
                a = new Uint32Array(buf, n * 12, n);

            obj = { r, g, b, a };

            setWorkstoreItem(name, obj);

            return obj;
        };

        // `buildHorizontalBlur` - creates an Array of Arrays detailing which pixels contribute to the horizontal part of each pixel's blur calculation. Resulting object will be cached in the store
        const buildHorizontalBlur = function (gridWidth, gridHeight, radius) {

            if (!_isFinite(radius)) radius = 0;

            const name = `blur-h-${gridWidth}-${gridHeight}-${radius}`,
                itemInWorkstore = getWorkstoreItem(name);

            if (itemInWorkstore) return itemInWorkstore;

            const startX = new Uint16Array(gridWidth * gridHeight);
            const endX = new Uint16Array(gridWidth * gridHeight);

            let x, y, p, sx, ex;

            for (y = 0; y < gridHeight; y++) {

                for (x = 0; x < gridWidth; x++) {

                    p = (y * gridWidth) + x;
                    sx = x - radius;
                    ex = x + radius;

                    if (sx < 0) sx = 0;
                    if (ex >= gridWidth) ex = gridWidth - 1;

                    startX[p] = sx;
                    endX[p] = ex;
                }
            }

            const horizontalRanges = { startX, endX, width: gridWidth, height: gridHeight, kind: 'range-h' };

            setWorkstoreItem(name, horizontalRanges);
            return horizontalRanges;
        };

        // `buildVerticalBlur` - creates an Array of Arrays detailing which pixels contribute to the vertical part of each pixel's blur calculation. Resulting object will be cached in the store
        const buildVerticalBlur = function (gridWidth, gridHeight, radius) {

            if (!_isFinite(radius)) radius = 0;

            const name = `blur-v-${gridWidth}-${gridHeight}-${radius}`,
                itemInWorkstore = getWorkstoreItem(name);

            if (itemInWorkstore) return itemInWorkstore;

            const startY = new Uint16Array(gridWidth * gridHeight);
            const endY = new Uint16Array(gridWidth * gridHeight);

            let x, y, p, sy, ey;

            for (y = 0; y < gridHeight; y++) {

                for (x = 0; x < gridWidth; x++) {

                    p = (y * gridWidth) + x;
                    sy = y - radius;
                    ey = y + radius;

                    if (sy < 0) sy = 0;
                    if (ey >= gridHeight) ey = gridHeight - 1;

                    startY[p] = sy;
                    endY[p] = ey;
                }
            }

            const verticalRanges = { startY, endY, width: gridWidth, height: gridHeight, kind: 'range-v' };

            setWorkstoreItem(name, verticalRanges);
            return verticalRanges;
        };

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length,
            pixelLen = _floor(len / 4);

        const {
            opacity = 1,
            processVertical = true,
            radiusVertical = 0,
            passesVertical = 1,
            stepVertical = 1,
            processHorizontal = true,
            radiusHorizontal = 0,
            passesHorizontal = 1,
            stepHorizontal = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = false,
            excludeTransparentPixels = false,
            lineOut,
        } = requirements;

        if ((!processVertical && !processHorizontal) || (!includeRed && !includeGreen && !includeBlue && !includeAlpha)) transferDataUnchanged(oData, iData, len);
        else {

            const gridWidth = input.width,
                gridHeight = input.height;

            let horizontalBlurGrid, verticalBlurGrid;

            if (processHorizontal || processVertical) {

                if (processHorizontal) horizontalBlurGrid = buildHorizontalBlur(gridWidth, gridHeight, radiusHorizontal);

                if (processVertical) verticalBlurGrid = buildVerticalBlur(gridWidth, gridHeight, radiusVertical);
            }

            oData.set(iData);

            const hold = new Uint8ClampedArray(iData);

            let pass, counter, rIdx, gIdx, bIdx, aIdx, startX, endX, width, height, sx, ex, y, rowBase, step4, sumR, sumG, sumB, sumA, countRGB, totalCount, idx, c, aVal, startY, endY, sy, ey, x, stepRow4, pr, pg, pb, pa, base, pos, count;

            const canFastH = (stepHorizontal === 1) && !excludeTransparentPixels,
                canFastV = (stepVertical === 1) && !excludeTransparentPixels;

            if (processHorizontal) {

                for (pass = 0; pass < passesHorizontal; pass++) {

                    if (canFastH) {

                        ({ startX, endX, width, height } = horizontalBlurGrid);
                        ({ r: pr, g: pg, b: pb, a: pa } = getBlurPrefixBuffers(width, 'h'));

                        for (y = 0; y < height; y++) {

                            base = (y * width) << 2;

                            if (includeRed) pr[0] = 0;
                            if (includeGreen) pg[0] = 0;
                            if (includeBlue) pb[0] = 0;
                            if (includeAlpha) pa[0] = 0;

                            for (let x = 0; x < width; x++) {

                                idx = base + (x << 2);

                                if (includeRed) pr[x + 1] = pr[x] + hold[idx];
                                if (includeGreen) pg[x + 1] = pg[x] + hold[idx + 1];
                                if (includeBlue) pb[x + 1] = pb[x] + hold[idx + 2];
                                if (includeAlpha) pa[x + 1] = pa[x] + hold[idx + 3];
                            }

                            for (let x = 0; x < width; x++) {

                                pos = (y * width) + x;
                                sx = startX[pos];
                                ex = endX[pos];
                                count = (ex - sx + 1);
                                idx = base + (x << 2);

                                if (includeRed) oData[idx] = (pr[ex + 1] - pr[sx]) / count;
                                else oData[idx] = hold[idx];

                                if (includeGreen) oData[idx + 1] = (pg[ex + 1] - pg[sx]) / count;
                                else oData[idx + 1] = hold[idx + 1];

                                if (includeBlue) oData[idx + 2] = (pb[ex + 1] - pb[sx]) / count;
                                else oData[idx + 2] = hold[idx + 2];

                                if (includeAlpha) oData[idx + 3] = (pa[ex + 1] - pa[sx]) / count;
                                else oData[idx + 3] = hold[idx + 3];
                            }
                        }
                    }
                    else {

                        for (counter = 0; counter < pixelLen; counter++) {

                            rIdx = counter * 4;
                            gIdx = rIdx + 1;
                            bIdx = gIdx + 1;
                            aIdx = bIdx + 1;

                            if (includeAlpha || hold[aIdx]) {

                                ({ startX, endX, width } = horizontalBlurGrid);

                                sx = startX[counter];
                                ex = endX[counter];
                                y  = (counter / width) | 0;
                                rowBase = (y * width) * 4;

                                step4 = stepHorizontal << 2;

                                sumR = 0;
                                sumG = 0;
                                sumB = 0;
                                sumA = 0;
                                countRGB = 0;

                                totalCount = ((ex - sx) / stepHorizontal | 0) + 1;

                                idx = rowBase + (sx << 2);

                                if (!excludeTransparentPixels) {

                                    for (c = sx; c <= ex; c += stepHorizontal) {

                                        if (includeRed) sumR += hold[idx];
                                        if (includeGreen) sumG += hold[idx + 1];
                                        if (includeBlue) sumB += hold[idx + 2];
                                        if (includeAlpha) sumA += hold[idx + 3];
                                        idx += step4;
                                    }

                                    if (includeRed) oData[rIdx] = sumR / totalCount;
                                    else oData[rIdx] = hold[rIdx];

                                    if (includeGreen) oData[gIdx] = sumG / totalCount;
                                    else oData[gIdx] = hold[gIdx];

                                    if (includeBlue) oData[bIdx] = sumB / totalCount;
                                    else oData[bIdx] = hold[bIdx];

                                    if (includeAlpha) oData[aIdx] = sumA / totalCount;
                                    else oData[aIdx] = hold[aIdx];
                                }
                                else {

                                    for (c = sx; c <= ex; c += stepHorizontal) {

                                        aVal = hold[idx + 3];

                                        if (aVal) {

                                            if (includeRed) sumR += hold[idx];
                                            if (includeGreen) sumG += hold[idx + 1];
                                            if (includeBlue) sumB += hold[idx + 2];
                                            countRGB++;
                                        }

                                        if (includeAlpha) sumA += aVal;

                                        idx += step4;
                                    }

                                    if (includeRed) oData[rIdx] = countRGB ? (sumR / countRGB) : hold[rIdx];
                                    else oData[rIdx] = hold[rIdx];

                                    if (includeGreen) oData[gIdx] = countRGB ? (sumG / countRGB) : hold[gIdx];
                                    else oData[gIdx] = hold[gIdx];

                                    if (includeBlue)  oData[bIdx] = countRGB ? (sumB / countRGB) : hold[bIdx];
                                    else oData[bIdx] = hold[bIdx];

                                    if (includeAlpha) oData[aIdx] = sumA / totalCount;
                                    else oData[aIdx] = hold[aIdx];
                                }
                            }
                        }
                    }
                    if (processVertical || pass < passesHorizontal - 1) hold.set(oData);
                }
            }

            if (processVertical) {

                for (pass = 0; pass < passesVertical; pass++) {

                    if (canFastV) {

                        ({ startY, endY, width, height } = verticalBlurGrid);
                        ({ r: pr, g: pg, b: pb, a: pa } = getBlurPrefixBuffers(height, 'v'));

                        for (x = 0; x < width; x++) {

                            if (includeRed) pr[0] = 0;
                            if (includeGreen) pg[0] = 0;
                            if (includeBlue) pb[0] = 0;
                            if (includeAlpha) pa[0] = 0;

                            for (y = 0; y < height; y++) {

                                idx = (((y * width) + x) << 2);

                                if (includeRed) pr[y + 1] = pr[y] + hold[idx];
                                if (includeGreen) pg[y + 1] = pg[y] + hold[idx + 1];
                                if (includeBlue) pb[y + 1] = pb[y] + hold[idx + 2];
                                if (includeAlpha) pa[y + 1] = pa[y] + hold[idx + 3];
                            }

                            for (y = 0; y < height; y++) {

                                pos = (y * width) + x;
                                sy = startY[pos];
                                ey = endY[pos];
                                count = (ey - sy + 1);
                                idx = (((y * width) + x) << 2);

                                if (includeRed) oData[idx] = (pr[ey + 1] - pr[sy]) / count;
                                else oData[idx] = hold[idx];

                                if (includeGreen) oData[idx + 1] = (pg[ey + 1] - pg[sy]) / count;
                                else oData[idx + 1] = hold[idx + 1];

                                if (includeBlue) oData[idx + 2] = (pb[ey + 1] - pb[sy]) / count;
                                else oData[idx + 2] = hold[idx + 2];

                                if (includeAlpha) oData[idx + 3] = (pa[ey + 1] - pa[sy]) / count;
                                else oData[idx + 3] = hold[idx + 3];
                            }
                        }
                    }
                    else {

                        for (counter = 0; counter < pixelLen; counter++) {

                            rIdx = counter * 4;
                            gIdx = rIdx + 1;
                            bIdx = gIdx + 1;
                            aIdx = bIdx + 1;

                            if (includeAlpha || hold[aIdx]) {

                                ({ startY, endY, width } = verticalBlurGrid);
                                sy = startY[counter];
                                ey = endY[counter];
                                x  = counter % width;

                                stepRow4 = (width * 4 * stepVertical);

                                sumR = 0;
                                sumG = 0;
                                sumB = 0;
                                sumA = 0;
                                countRGB = 0;

                                totalCount = ((ey - sy) / stepVertical | 0) + 1;

                                idx = (sy * width * 4) + (x << 2);

                                if (!excludeTransparentPixels) {

                                    for (let r = sy; r <= ey; r += stepVertical) {

                                        if (includeRed) sumR += hold[idx];
                                        if (includeGreen) sumG += hold[idx + 1];
                                        if (includeBlue) sumB += hold[idx + 2];
                                        if (includeAlpha) sumA += hold[idx + 3];

                                        idx += stepRow4;
                                    }
                                    if (includeRed) oData[rIdx] = sumR / totalCount;
                                    else oData[rIdx] = hold[rIdx];

                                    if (includeGreen) oData[gIdx] = sumG / totalCount;
                                    else oData[gIdx] = hold[gIdx];

                                    if (includeBlue) oData[bIdx] = sumB / totalCount;
                                    else oData[bIdx] = hold[bIdx];

                                    if (includeAlpha) oData[aIdx] = sumA / totalCount;
                                    else oData[aIdx] = hold[aIdx];
                                }
                                else {

                                    for (let r = sy; r <= ey; r += stepVertical) {

                                        aVal = hold[idx + 3];

                                        if (aVal) {

                                            if (includeRed) sumR += hold[idx];
                                            if (includeGreen) sumG += hold[idx + 1];
                                            if (includeBlue) sumB += hold[idx + 2];
                                            countRGB++;
                                        }

                                        if (includeAlpha) sumA += aVal;

                                        idx += stepRow4;
                                    }

                                    if (includeRed) oData[rIdx] = countRGB ? (sumR / countRGB) : hold[rIdx];
                                    else oData[rIdx] = hold[rIdx];

                                    if (includeGreen) oData[gIdx] = countRGB ? (sumG / countRGB) : hold[gIdx];
                                    else oData[gIdx] = hold[gIdx];

                                    if (includeBlue) oData[bIdx] = countRGB ? (sumB / countRGB) : hold[bIdx];
                                    else oData[bIdx] = hold[bIdx];

                                    if (includeAlpha) oData[aIdx] = sumA / totalCount;
                                    else oData[aIdx] = hold[aIdx];
                                }
                            }
                        }
                    }
                    if (pass < passesVertical - 1) hold.set(oData);
                }
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __channels-to-alpha__ - Calculates an average value from each pixel's included channels and applies that value to the alpha channel.
    [CHANNELS_TO_ALPHA]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            lineOut,
        } = requirements;

        const incR = includeRed ? 1 : 0,
            incG = includeGreen ? 1 : 0,
            incB = includeBlue ? 1 : 0,
            div  = incR + incG + incB;

        if (div === 0) out32.set(src32);
        else {

            let sumDiv3LUT = null;

            if (div === 3) {

                sumDiv3LUT = getWorkstoreItem('cta::sumDiv3');

                if (!sumDiv3LUT) {

                    sumDiv3LUT = new Uint8Array(766);

                    for (let s = 0; s <= 765; s++) {

                        sumDiv3LUT[s] = Math.floor(s / 3) & 0xFF;
                    }
                    setWorkstoreItem('cta::sumDiv3', sumDiv3LUT);
                }
            }

            let p, pz, s, r, g, b, aNew, sum;

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                s = src32[p];

                r = s & 0xFF;
                g = (s >>> 8) & 0xFF;
                b = (s >>> 16) & 0xFF;

                if (div === 1) aNew = incR ? r : (incG ? g : b);
                else if (div === 2) {

                    sum = (incR ? r : 0) + (incG ? g : 0) + (incB ? b : 0);
                    aNew = sum >>> 1;
                }
                else aNew = sumDiv3LUT[r + g + b];

                out32[p] = (s & 0x00FFFFFF) | (aNew << 24);
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __chroma__ - Using an array of 'range' arrays, determine whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. Each 'range' array comprises six Numbers representing [minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue] values.
    [CHROMA]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            ranges = [],
            featherRed = 0,
            featherGreen = 0,
            featherBlue  = 0,
            lineOut,
        } = requirements;

        // Helper functions
        const clamp8 = v => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

        const posNumOr0 = v => {

            const n = +v;
            return (_isFinite(n) && n >= 0) ? n : 0;
        };

        const normRanges = (() => {

            const res = [];

            let i, iz, r, minR, minG, minB, maxR, maxG, maxB, t;

            for (i = 0, iz = ranges.length; i < iz; i++) {

                r = ranges[i];
                if (!r || r.length < 6) continue;

                [minR, minG, minB, maxR, maxG, maxB] = r;

                if (!(_isFinite(minR) && _isFinite(minG) && _isFinite(minB) && _isFinite(maxR) && _isFinite(maxG) && _isFinite(maxB))) continue;

                minR |= 0;
                minG |= 0;
                minB |= 0;
                maxR |= 0;
                maxG |= 0;
                maxB |= 0;

                if (minR > maxR) {

                    t = minR;
                    minR = maxR;
                    maxR = t;
                }

                if (minG > maxG) {

                    t = minG;
                    minG = maxG;
                    maxG = t;
                }

                if (minB > maxB) {

                    t = minB;
                    minB = maxB;
                    maxB = t;
                }


                res.push([clamp8(minR), clamp8(minG), clamp8(minB), clamp8(maxR), clamp8(maxG), clamp8(maxB)]);
            }
            return res;
        })();

        // If no ranges, just copy
        if (normRanges.length === 0) out32.set(src32);
        else {

            // Feather widths (validated: must be numbers >= 0; clamp to 0..255 and int)
            const fR = clamp8(posNumOr0(featherRed)),
                fG = clamp8(posNumOr0(featherGreen)),
                fB = clamp8(posNumOr0(featherBlue));

            // Cache keys
            const keyBase = JSON.stringify(normRanges),
                bitKey = `chroma-bitset::${keyBase}`,
                fKey = `chroma-feather::${fR}_${fG}_${fB}::${keyBase}`;

            // Hard-key path (all feathers zero)
            if ((fR | fG | fB) === 0) {

                let pack = getWorkstoreItem(bitKey);

                if (!pack) {

                    const n = normRanges.length | 0,
                        words = (n + 31) >>> 5;

                    const rMasks = Array.from({ length: words }, () => new Uint32Array(256)),
                        gMasks = Array.from({ length: words }, () => new Uint32Array(256)),
                        bMasks = Array.from({ length: words }, () => new Uint32Array(256));

                    let k, w, bit, minR, minG, minB, maxR, maxG, maxB, v;

                    for (k = 0; k < n; k++) {

                        w = k >>> 5;
                        bit = 1 << (k & 31);

                        [minR, minG, minB, maxR, maxG, maxB] = normRanges[k];

                        for (v = minR; v <= maxR; v++) {

                            rMasks[w][v] |= bit;
                        }
                        for (v = minG; v <= maxG; v++) {

                            gMasks[w][v] |= bit;
                        }
                        for (v = minB; v <= maxB; v++) {

                            bMasks[w][v] |= bit;
                        }
                    }

                    pack = { words, rMasks, gMasks, bMasks };
                    setWorkstoreItem(bitKey, pack);
                }

                const { words, rMasks, gMasks, bMasks } = pack;

                let p, pz, rgba, r, g, b, a, hit, w;

                for (p = 0, pz = src32.length | 0; p < pz; p++) {

                    rgba = src32[p];
                    r = rgba & 0xFF;
                    g = (rgba >>> 8) & 0xFF;
                    b = (rgba >>> 16) & 0xFF;
                    a = (rgba >>> 24) & 0xFF;

                    hit = 0;

                    for (w = 0; w < words; w++) {

                        if ((rMasks[w][r] & gMasks[w][g] & bMasks[w][b]) !== 0) {

                            hit = 1; break;
                        }
                    }
                    if (hit) a = 0;

                    out32[p] = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
                }
            }

            // feathered path (any feather > 0)
            else {

                let fpack = getWorkstoreItem(fKey);

                if (!fpack) {

                    const n = normRanges.length | 0;

                    const makeLUT = (min, max, F) => {

                        const lut = new Uint8Array(256);

                        if (F <= 0) {

                            for (let v = 0; v < 256; v++) {

                                lut[v] = (v < min || v > max) ? 0 : 255;
                            }
                            return lut;
                        }

                        const lo = _max(0, min - F),
                            hi = _min(255, max + F);

                        let v, w;

                        for (v = 0; v < 256; v++) {

                            if (v < lo || v > hi) w = 0;
                            else if (v < min) w = ((v - (min - F)) * 255 / F) | 0;
                            else if (v > max) w = (((max + F) - v) * 255 / F) | 0;
                            else w = 255;

                            lut[v] = w < 0 ? 0 : (w > 255 ? 255 : w);
                        }
                        return lut;
                    };

                    const rLUTs = new Array(n),
                        gLUTs = new Array(n),
                        bLUTs = new Array(n);

                    let k, minR, minG, minB, maxR, maxG, maxB;

                    for (k = 0; k < n; k++) {

                        [minR, minG, minB, maxR, maxG, maxB] = normRanges[k];

                        rLUTs[k] = makeLUT(minR, maxR, fR);
                        gLUTs[k] = makeLUT(minG, maxG, fG);
                        bLUTs[k] = makeLUT(minB, maxB, fB);
                    }
                    fpack = { rLUTs, gLUTs, bLUTs };
                    setWorkstoreItem(fKey, fpack);
                }

                const { rLUTs, gLUTs, bLUTs } = fpack,
                    nRanges = rLUTs.length | 0;

                let p, pz, rgba, r, g, b, a, wMax, k, w, na;

                for (p = 0, pz = src32.length | 0; p < pz; p++) {

                    rgba = src32[p];

                    r = rgba & 0xFF;
                    g = (rgba >>> 8) & 0xFF;
                    b = (rgba >>> 16) & 0xFF;
                    a = (rgba >>> 24) & 0xFF;

                    wMax = 0;

                    for (k = 0; k < nRanges; k++) {

                        w = _min(rLUTs[k][r], gLUTs[k][g], bLUTs[k][b]);

                        if (w > wMax) {

                            wMax = w;
                            if (wMax === 255) break;
                        }
                    }

                    na = ((a * (255 - wMax) + 128) >> 8) & 0xFF;

                    out32[p] = ((na << 24) | (b << 16) | (g << 8) | r) >>> 0;
                }
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __clamp-channels__ - Clamp each color channel to a range set by lowColor and highColor values
    [CLAMP_CHANNELS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        // 32-bit pixel views
        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            lowRed = 0,
            lowGreen = 0,
            lowBlue = 0,
            highRed = 255,
            highGreen = 255,
            highBlue = 255,
            lineOut,
        } = requirements;

        const c8 = v => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

        const lr = c8(lowRed),
            lg = c8(lowGreen),
            lb = c8(lowBlue),
            hr = c8(highRed),
            hg = c8(highGreen),
            hb = c8(highBlue);

        const idR = (lr === 0 && hr === 255),
            idG = (lg === 0 && hg === 255),
            idB = (lb === 0 && hb === 255);

        if (idR && idG && idB)  out32.set(src32);
        else {

            const keyR = `clampch::R:${lr},${hr}`,
                keyG = `clampch::G:${lg},${hg}`,
                keyB = `clampch::B:${lb},${hb}`;

            let lutR = idR ? null : getWorkstoreItem(keyR),
                lutG = idG ? null : getWorkstoreItem(keyG),
                lutB = idB ? null : getWorkstoreItem(keyB);

            const buildLUT = (lo, hi) => {

                const d = hi - lo,
                    lut = new Uint8ClampedArray(256);

                for (let v = 0; v < 256; v++) {

                    lut[v] = lo + (v * d) / 255;
                }
                return lut;
            };

            if (!idR && !lutR) {

                lutR = buildLUT(lr, hr);
                setWorkstoreItem(keyR, lutR);
            }
            if (!idG && !lutG) {

                lutG = buildLUT(lg, hg);
                setWorkstoreItem(keyG, lutG);
            }
            if (!idB && !lutB) {

                lutB = buildLUT(lb, hb);
                setWorkstoreItem(keyB, lutB);
            }

            let p, pz, s, a, r, g, b, nr, ng, nb;

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                s = src32[p];

                r = s & 0xFF;
                g = (s >>> 8) & 0xFF;
                b = (s >>> 16) & 0xFF;
                a = (s >>> 24) & 0xFF;

                if (a === 0) {

                    out32[p] = s;
                    continue;
                }

                nr = idR ? r : lutR[r];
                ng = idG ? g : lutG[g];
                nb = idB ? b : lutB[b];

                out32[p] = ((a << 24) | (nb << 16) | (ng << 8) | nr) >>> 0;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __colors-to-alpha__ - Determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the "red", "green" and "blue" arguments. The sensitivity of the effect can be manipulated using the "transparentAt" and "opaqueAt" values, both of which lie in the range 0-1.
    [COLORS_TO_ALPHA]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            red = 0,
            green = 255,
            blue = 0,
            opaqueAt = 1,
            transparentAt = 0,
            lineOut,
        } = requirements;

        // Helper functions
        const clamp8 = v => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

        const clamp01 = v => {

            const n = +v;
            return _isFinite(n) ? (n < 0 ? 0 : n > 1 ? 1 : n) : 0;
        };

        const R = clamp8(red),
            G = clamp8(green),
            B = clamp8(blue);

        const tAt = clamp01(transparentAt),
            oAt = clamp01(opaqueAt);

        const key = `cta::${R},${G},${B}::${tAt},${oAt}`;

        let pack = getWorkstoreItem(key);

        if (!pack) {

            const diffR = new Uint16Array(256),
                diffG = new Uint16Array(256),
                diffB = new Uint16Array(256);

            for (let v = 0; v < 256; v++) {

                diffR[v] = _abs(v - R);
                diffG[v] = _abs(v - G);
                diffB[v] = _abs(v - B);
            }

            const sumRef = R + G + B,
                maxDiff3 = _max(sumRef, 765 - sumRef);

            const tScaled = (tAt * maxDiff3) | 0,
                oScaled = (oAt * maxDiff3) | 0;

            let rangeScaled = oScaled - tScaled;

            const binaryStep = (rangeScaled <= 0);

            if (binaryStep) rangeScaled = 1;

            pack = { diffR, diffG, diffB, tScaled, oScaled, rangeScaled, binaryStep };

            setWorkstoreItem(key, pack);
        }

        const { diffR, diffG, diffB, tScaled, oScaled, rangeScaled, binaryStep } = pack;

        out32.set(src32);

        let p, pz, rgba, a, r, g, b, sumDiff, na;

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];
            a = (rgba >>> 24) & 0xFF;

            if (a === 0) continue;

            r = rgba & 0xFF;
            g = (rgba >>> 8) & 0xFF;
            b = (rgba >>> 16) & 0xFF;

            sumDiff = diffR[r] + diffG[g] + diffB[b];

            if (sumDiff < tScaled) na = 0;
            else if (sumDiff > oScaled) na = 255;
            else if (binaryStep) na = (sumDiff > tScaled) ? 255 : 0;
            else na = (((sumDiff - tScaled) * 255 + (rangeScaled >> 1)) / rangeScaled) | 0;

            if (na < 0) na = 0;
            else if (na > 255) na = 255;

            out32[p] = (out32[p] & 0x00FFFFFF) | (na << 24);
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __compose__ - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using alpha compositing rules (as defined by Porter/Duff). The compositing method is determined by the String value supplied in the "compose" argument; permitted values are: 'destination-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'source-only', 'source-over' (default), 'source-in', 'source-out', 'source-atop', 'clear', 'xor', or 'lighter'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments.
    [COMPOSE]: function (requirements) {

        const [input, output, mix] = getInputAndOutputLines(requirements);

        const iWidth  = input.width | 0,
            iHeight = input.height | 0,
            mWidth  = mix.width | 0,
            mHeight = mix.height | 0;

        const iData = input.data,
            mData = mix.data,
            oData = output.data;

        const {
            opacity = 1,
            compose = SOURCE_OVER,
            offsetX = 0,
            offsetY = 0,
            lineOut,
        } = requirements || {};

        if (!iWidth || !iHeight) {

            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);
            return;
        }

        const nPixIn = (iWidth * iHeight) | 0,
            nPixMix = (mWidth * mHeight) | 0;

        const i32 = new Uint32Array(iData.buffer, iData.byteOffset, nPixIn),
            o32 = new Uint32Array(oData.buffer, oData.byteOffset, nPixIn),
            m32 = new Uint32Array(mData.buffer, mData.byteOffset, nPixMix);

        const x0 = (offsetX > 0 ? offsetX : 0) | 0,
            y0 = (offsetY > 0 ? offsetY : 0) | 0,
            x1 = _min(iWidth,  offsetX + mWidth)  | 0,
            y1 = _min(iHeight, offsetY + mHeight) | 0;

        const hasOverlap = (x1 > x0) && (y1 > y0);

        switch (compose) {

            case SOURCE_ONLY:

                o32.set(i32);

                if (lineOut) processResults(output, input, 1 - opacity);
                else processResults(cache.work, output, opacity);

                return;

            case SOURCE_OVER:
            case SOURCE_OUT:
            case DESTINATION_OVER:
            case DESTINATION_ATOP:
            case XOR:

                o32.set(i32);
                break;

            default:
                break;
        }

        if (!hasOverlap || compose === CLEAR) {

            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);
            return;
        }

        const inv255 = 1 / 255;

        // Mix starting coords
        const mx0 = (x0 - offsetX) | 0,
            my0 = (y0 - offsetY) | 0;

        const rowIn  = iWidth,
            rowMix = mWidth;

        let y, my, baseIn, baseMix, x, mx,
            srcIndex, dstIndex, srcPacked, dstPacked,
            Sr8, Sg8, Sb8, Sa8, Dr8, Dg8, Db8, Da8,
            As, Ad, Sr, Sg, Sb, Dr, Dg, Db,
            outR, outG, outB, outA, t, t1, t2,
            r8, g8, b8, a8;

        for (y = y0, my = my0; y < y1; y++, my++) {

            baseIn  = y  * rowIn;
            baseMix = my * rowMix;

            for (x = x0, mx = mx0; x < x1; x++, mx++) {

                srcIndex = baseIn + x;
                dstIndex = baseMix + mx;

                srcPacked = i32[srcIndex];
                dstPacked = m32[dstIndex];

                // Inline unpack(srcPacked)
                Sr8 = srcPacked & 0xFF;
                Sg8 = (srcPacked >>> 8) & 0xFF;
                Sb8 = (srcPacked >>> 16) & 0xFF;
                Sa8 = (srcPacked >>> 24) & 0xFF;

                Dr8 = dstPacked & 0xFF;
                Dg8 = (dstPacked >>> 8) & 0xFF;
                Db8 = (dstPacked >>> 16) & 0xFF;
                Da8 = (dstPacked >>> 24) & 0xFF;

                As = Sa8 * inv255;
                Ad = Da8 * inv255;

                Sr = Sr8 * inv255;
                Sg = Sg8 * inv255;
                Sb = Sb8 * inv255;

                Dr = Dr8 * inv255;
                Dg = Dg8 * inv255;
                Db = Db8 * inv255;

                switch (compose) {

                    case SOURCE_ATOP: {
                        t1 = As * Ad;
                        outR = Sr * t1 + Dr * Ad * (1 - As);
                        outG = Sg * t1 + Dg * Ad * (1 - As);
                        outB = Sb * t1 + Db * Ad * (1 - As);
                        outA = Ad;
                        break;
                    }

                    case SOURCE_IN: {
                        t = As * Ad;
                        outR = Sr * t;
                        outG = Sg * t;
                        outB = Sb * t;
                        outA = t;
                        break;
                    }

                    case SOURCE_OUT: {
                        t = As * (1 - Ad);
                        outR = Sr * t;
                        outG = Sg * t;
                        outB = Sb * t;
                        outA = t;
                        break;
                    }

                    case DESTINATION_ONLY: {
                        o32[srcIndex] = dstPacked;
                        continue;
                    }

                    case DESTINATION_ATOP: {
                        t1 = As * (1 - Ad);
                        t2 = Ad * As;
                        outR = Sr * t1 + Dr * t2;
                        outG = Sg * t1 + Dg * t2;
                        outB = Sb * t1 + Db * t2;
                        outA = As;
                        break;
                    }

                    case DESTINATION_OVER: {
                        t = As * (1 - Ad);
                        outR = Sr * t + Dr * Ad;
                        outG = Sg * t + Dg * Ad;
                        outB = Sb * t + Db * Ad;
                        outA = Ad + As * (1 - Ad);
                        break;
                    }

                    case DESTINATION_IN: {
                        t = Ad * As;
                        outR = Dr * t;
                        outG = Dg * t;
                        outB = Db * t;
                        outA = t;
                        break;
                    }

                    case DESTINATION_OUT: {
                        t = Ad * (1 - As);
                        outR = Dr * t;
                        outG = Dg * t;
                        outB = Db * t;
                        outA = t;
                        break;
                    }

                    case XOR: {
                        t1 = As * (1 - Ad);
                        t2 = Ad * (1 - As);
                        outR = Sr * t1 + Dr * t2;
                        outG = Sg * t1 + Dg * t2;
                        outB = Sb * t1 + Db * t2;
                        outA = As * (1 - Ad) + Ad * (1 - As);
                        break;
                    }

                    case SOURCE_OVER:
                    default: {
                        t = Ad * (1 - As);
                        outR = Sr * As + Dr * t;
                        outG = Sg * As + Dg * t;
                        outB = Sb * As + Db * t;
                        outA = As + Ad * (1 - As);
                        break;
                    }
                }

                r8 = (outR * 255 + 0.5) | 0;
                g8 = (outG * 255 + 0.5) | 0;
                b8 = (outB * 255 + 0.5) | 0;
                a8 = (outA * 255 + 0.5) | 0;

                o32[srcIndex] = ((a8 & 255) << 24) | ((b8 & 255) << 16) | ((g8 & 255) <<  8) | ( r8 & 255);
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __corrode__ - Performs a special form of matrix operation on each pixel's color and alpha channels, calculating the new value using neighbouring pixel values.
// + The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments.
// + The operation will set the pixel's channel value to match either the lowest, highest or mean values as dictated by its neighbours - this value is set in the "operation" attribute.
// + Channels can be selected by setting the "includeRed", "includeGreen", "includeBlue" (all false by default) and "includeAlpha" (default: true) flags.
    [CORRODE]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len   = iData.length;

        const width  = input.width  | 0,
            height = input.height | 0;

        const {
            opacity = 1,
            includeRed = false,
            includeGreen = false,
            includeBlue = false,
            includeAlpha = true,
            operation = MEAN,
            lineOut,
        } = requirements;

        let kW = requirements.width;
        if (!_isFinite(kW) || kW < 1) kW = 3;
        kW = _floor(kW);

        let kH = requirements.height;
        if (!_isFinite(kH) || kH < 1) kH = 3;
        kH = _floor(kH);

        let offX = requirements.offsetX;
        if (!_isFinite(offX) || offX < 0) offX = (kW >> 1);
        offX = _floor(offX);

        let offY = requirements.offsetY;
        if (!_isFinite(offY) || offY < 0) offY = (kH >> 1);
        offY = _floor(offY);

        if (kW === 1 && kH === 1 && offX === 0 && offY === 0) transferDataUnchanged(oData, iData, len);
        else {

            const left = offX | 0,
                right = (kW - offX - 1) | 0,
                top = offY | 0,
                bottom = (kH - offY - 1) | 0;

            const x0 = left,
                x1 = (width - right) | 0,
                y0 = top,
                y1 = (height - bottom) | 0;

            const nameQx = `corrode-deque-x-${width}`;
            let Qx = getWorkstoreItem(nameQx);
            if (!Qx) {

                Qx = new Int32Array(width);
                setWorkstoreItem(nameQx, Qx);
            }

            const nameQy = `corrode-deque-y-${height}`;
            let Qy = getWorkstoreItem(nameQy);

            if (!Qy) {

                Qy = new Int32Array(height);
                setWorkstoreItem(nameQy, Qy);
            }

            const midMin = new Uint8ClampedArray(len),
                midMax = (operation === 'lowest') ? null : new Uint8ClampedArray(len);

            const rowScan = (src, rowBase, xs, xe, ch, wantMin) => {

                let m = wantMin ? 255 : 0,
                    v, x;

                const base = rowBase + ch;

                for (x = xs; x <= xe; x++) {

                    v = src[base + (x << 2)];
                    if (wantMin ? (v < m) : (v > m)) m = v;
                }
                return m;
            };

            const colScan = (src, xs, ys, ye, ch, wantMin) => {

                let m = wantMin ? 255 : 0,
                    v, y;

                const base = (xs << 2) + ch,
                    stride = width << 2;

                let idx = (ys * stride) + base;

                for (y = ys; y <= ye; y++) {

                    v = src[idx];
                    if (wantMin ? (v < m) : (v > m)) m = v;
                    idx += stride;
                }
                return m;
            };

            const horizontalPass = (src, dst, ch, wantMin) => {

                const w = width,
                    h = height,
                    fullW = left + right + 1;

                let y, rowBase, x, xs, xe, head, tail, v, qx, qv, leftEdge, center;

                for (y = 0; y < h; y++) {

                    rowBase = (y * w) << 2;

                    for (x = 0; x < x0; x++) {

                        xs = 0;
                        xe = Math.min(w - 1, x + right);
                        dst[rowBase + (x << 2) + ch] = rowScan(src, rowBase, xs, xe, ch, wantMin);
                    }

                    if (x1 > x0) {

                        head = 0;
                        tail = -1;

                        for (x = 0; x < w; x++) {

                            v = src[rowBase + (x << 2) + ch];

                            while (tail >= head) {

                                qx = Qx[tail];
                                qv = src[rowBase + (qx << 2) + ch];

                                if (wantMin ? (v <= qv) : (v >= qv)) tail--;
                                else break;
                            }

                            Qx[++tail] = x;

                            leftEdge = x - fullW + 1;

                            while (head <= tail && Qx[head] < leftEdge) head++;

                            if (x >= fullW - 1) {

                                center = x - right;

                                if (center >= x0 && center < x1) {

                                    qx = Qx[head];
                                    dst[rowBase + (center << 2) + ch] = src[rowBase + (qx << 2) + ch];
                                }
                            }
                        }
                    }

                    for (x = x1; x < w; x++) {

                        xs = _max(0, x - left);
                        xe = w - 1;
                        dst[rowBase + (x << 2) + ch] = rowScan(src, rowBase, xs, xe, ch, wantMin);
                    }
                }
            };

            const verticalPass = (src, dst, ch, wantMin) => {

                const w = width,
                    h = height,
                    fullH = top + bottom + 1,
                    stride = w << 2;

                let x, ys, ye, head, tail, y, idx, v, qv, topEdge, center, qy;

                for (x = 0; x < w; x++) {

                    for (y = 0; y < y0; y++) {

                        ys = 0;
                        ye = _min(h - 1, y + bottom);
                        dst[(y * stride) + (x << 2) + ch] = colScan(src, x, ys, ye, ch, wantMin);
                    }

                    if (y1 > y0) {

                        head = 0;
                        tail = -1;

                        for (y = 0; y < h; y++) {

                            idx = (y * stride) + (x << 2) + ch;
                            v = src[idx];

                            while (tail >= head) {

                                qy = Qy[tail];
                                qv = src[(qy * stride) + (x << 2) + ch];

                                if (wantMin ? (v <= qv) : (v >= qv)) tail--;
                                else break;
                            }

                            Qy[++tail] = y;

                            topEdge = y - fullH + 1;

                            while (head <= tail && Qy[head] < topEdge) head++;

                            if (y >= fullH - 1) {

                                center = y - bottom;

                                if (center >= y0 && center < y1) {

                                    qy = Qy[head];

                                    dst[(center * stride) + (x << 2) + ch] = src[(qy * stride) + (x << 2) + ch];
                                }
                            }
                        }
                    }

                    for (y = y1; y < h; y++) {

                        ys = _max(0, y - top);
                        ye = h - 1;
                        dst[(y * stride) + (x << 2) + ch] = colScan(src, x, ys, ye, ch, wantMin);
                    }
                }
            };

            const doR = !!includeRed,
                doG = !!includeGreen,
                doB = !!includeBlue,
                doA = !!includeAlpha;

            if (doA && !doR && !doG && !doB) {

                oData.set(iData);

                if (operation === 'lowest' || operation === 'mean') horizontalPass(iData, midMin, 3, true);
                if (operation === 'highest' || operation === 'mean') horizontalPass(iData, midMax || midMin, 3, false);

                if (operation === 'lowest') verticalPass(midMin, oData, 3, true);
                else if (operation === 'highest') verticalPass(midMax, oData, 3, false);
                else {

                    const tmpMin = new Uint8ClampedArray(len),
                        tmpMax = new Uint8ClampedArray(len);

                    verticalPass(midMin, tmpMin, 3, true);
                    verticalPass(midMax, tmpMax, 3, false);

                    for (let i = 3; i < len; i += 4) {

                        oData[i] = (tmpMin[i] + tmpMax[i]) >> 1;
                    }
                }
            }
            else {

                oData.set(iData);

                const runForChannel = (ch) => {

                    if (operation === 'lowest') {

                        horizontalPass(iData,  midMin, ch, true);
                        verticalPass(midMin, oData,  ch, true);
                    }
                    else if (operation === 'highest') {

                        horizontalPass(iData,  midMin, ch, false);
                        verticalPass(midMin, oData,  ch, false);
                    }
                    else {

                        const tmpVMin = new Uint8ClampedArray(len),
                            tmpVMax = new Uint8ClampedArray(len);

                        horizontalPass(iData, midMin, ch, true);
                        horizontalPass(iData, midMax, ch, false);
                        verticalPass(midMin, tmpVMin, ch, true);
                        verticalPass(midMax, tmpVMax, ch, false);

                        for (let i = ch; i < len; i += 4) {

                            oData[i] = (tmpVMin[i] + tmpVMax[i]) >> 1;
                        }
                    }
                };

                if (doR) runForChannel(0);
                if (doG) runForChannel(1);
                if (doB) runForChannel(2);
                if (doA) runForChannel(3);
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __deconvolute__ - OKLab L-only Richardson_Lucy deconvolution with optional edge mask + multiscale
    [DECONVOLUTE]: function (requirements) {

        const getRlWorkspace = (width, height) => {

            const key = `ea-rl::ws::${width}x${height}`,
                N = width * height;

            const ws = getWorkstoreItem(key) || {};

            if (!ws.L || ws.L.length !== N) ws.L = new Float32Array(N);
            if (!ws.A || ws.A.length !== N) ws.A = new Float32Array(N);
            if (!ws.B || ws.B.length !== N) ws.B = new Float32Array(N);
            if (!ws.Gs || ws.Gs.length !== N) ws.Gs = new Float32Array(N);
            if (!ws.Gb || ws.Gb.length !== N) ws.Gb = new Float32Array(N);
            if (!ws.R || ws.R.length !== N) ws.R = new Float32Array(N);
            if (!ws.M || ws.M.length !== N) ws.M = new Float32Array(N);
            if (!ws.Am || ws.Am.length !== N) ws.Am = new Float32Array(N);
            if (!ws.tmpLine || ws.tmpLine.length < _max(width, height)) ws.tmpLine = new Float32Array(_max(width, height));
            if (!ws.tmpImg || ws.tmpImg.length !== N) ws.tmpImg = new Float32Array(N);
            if (!ws.hist || ws.hist.length !== 256) ws.hist = new Uint32Array(256);

            setWorkstoreItem(key, ws);
            return ws;
        };

        const ensureAlphaRecipBuffers = (wsLocal, size) => {

            if (!wsLocal.Ab   || wsLocal.Ab.length !== size) wsLocal.Ab = new Float32Array(size);
            if (!wsLocal.invAb || wsLocal.invAb.length !== size) wsLocal.invAb = new Float32Array(size);
        };

        const convolve1D_Float = (lineIn, dstLine, length, coeff) => {

            const a0L = coeff[0],
                a1L = coeff[1],
                a0R = coeff[2],
                a1R = coeff[3],
                b1 = coeff[4],
                b2 = coeff[5],
                lc = coeff[6],
                rc = coeff[7];

            let prev_src = lineIn[0],
                prev_out = prev_src * lc,
                prev_prev_out = prev_out,
                i, x, y;

            dstLine[0] = prev_out;

            for(i = 1; i < length; i++) {

                x = lineIn[i];
                y = x * a0L + prev_src * a1L + prev_out * b1 + prev_prev_out * b2;

                dstLine[i] = y;

                prev_prev_out = prev_out;
                prev_out = y;
                prev_src = x;
            }

            prev_src = lineIn[length-1];
            prev_out = prev_src * rc;
            prev_prev_out = prev_out;
            dstLine[length - 1] += prev_out;

            for(i = length - 2; i >= 0; i--){

                x = lineIn[i];
                y = x * a0R + prev_src * a1R + prev_out * b1 + prev_prev_out * b2;

                dstLine[i] += y;

                prev_prev_out = prev_out;
                prev_out = y;
                prev_src = x;
            }
        };

        const gaussianBlurL_Float = (src, dst, width, height, sigmaH, sigmaV, tmpLine, tmpImgShared, coeffHOpt, coeffVOpt) => {

            const doH = sigmaH > 0,
                doV = sigmaV > 0;

            if (!doH && !doV) {

                if (dst !== src) dst.set(src);
                return;
            }

            const tmpImg = (doH && doV) ? tmpImgShared : dst;

            if (doH) {

                const coeffH = coeffHOpt || getGaussianCoeffsFloat(sigmaH);

                for (let y = 0; y < height; y++) {
                const off = y*width;

                    for (let x = 0; x < width; x++) {

                        tmpLine[x] = src[off+x];
                    }

                    convolve1D_Float(tmpLine, tmpLine, width, coeffH);

                    for (let x = 0; x < width; x++) {

                        tmpImg[off+x] = tmpLine[x];
                    }
                }
            }
            else if (tmpImg !== src) {

                tmpImg.set(src);
            }

            if (doV) {

                const coeffV = coeffVOpt || getGaussianCoeffsFloat(sigmaV);

                for (let x = 0; x < width; x++) {

                    for (let y = 0; y < height; y++) {

                        tmpLine[y] = tmpImg[y * width + x];
                    }

                    convolve1D_Float(tmpLine, tmpLine, height, coeffV);

                    for (let y = 0; y < height; y++) {

                        dst[y * width + x] = tmpLine[y];
                    }
                }
            }
        };

        const sobelMagFloat = (src, dst, width, height) => {

            const clampXY = (x, y) => {

                if (x < 0) x = 0;
                else if ( x >= width) x = width - 1;

                if (y < 0) y = 0;
                else if (y >= height) y = height - 1;

                return (y * width + x) | 0;
            };

            let y, ym1, y0, yp1, x, xm1, x0, xp1,
                p00, p01, p02, p10, p12, p20, p21, p22,
                gx, gy;

            for (y = 0; y < height; y++) {

                ym1 = y - 1;
                y0 = y;
                yp1 = y + 1;

                for (x = 0; x < width; x++) {

                    xm1 = x - 1;
                    x0 = x;
                    xp1 = x + 1;

                    p00 = src[clampXY(xm1, ym1)];
                    p10 = src[clampXY(x0, ym1)];
                    p20 = src[clampXY(xp1, ym1)];
                    p01 = src[clampXY(xm1, y0)];
                    p21 = src[clampXY(xp1, y0)];
                    p02 = src[clampXY(xm1, yp1)];
                    p12 = src[clampXY(x0, yp1)];
                    p22 = src[clampXY(xp1,yp1)];

                    gx = (-p00 + p20) + (-2 * p01 + 2 * p21) + (-p02 + p22);
                    gy = (-p00 - 2 * p10 - p20) + (p02 + 2 * p12 + p22);

                    dst[y * width + x] = _abs(gx) + _abs(gy);
                }
            }
        };

        const smoothstepInto = (grad, outMask, t0, t1) => {

            const inv = 1.0 / _max(1e-6, (t1 - t0));

            let j, jz, x;

            for (j = 0, jz = grad.length | 0; j < jz; j++){

                x = (grad[j] - t0) * inv;
                outMask[j] = x <= 0 ? 0 : (x >= 1 ? 1 : (x * x * (3 - 2 * x)));
            }
        };

        const buildHist01Float = (arr, hist) => {

            hist.fill(0);

            let j, jz, v;

            for (j = 0, jz = arr.length | 0; j < jz; j++) {

                v = arr[j];
                if (v < 0) v = 0;
                else if (v > 1) v = 1;

                hist[(v * 255) | 0]++;
            }
            return jz;
        };

        const makeAlphaMask01 = (src32, Am) => {

            let j, jz, a;

            for (j = 0, jz = Am.length | 0; j < jz; j++) {

                a = (src32[j] >>> 24) & 0xFF;
                Am[j] = (a > 0) ? 1.0 : 0.0;
            }
        };

        const buildMaskedHist01Float = (arr, Am, hist) => {

            hist.fill(0);

            let total = 0,
                j, jz, v;

            for (j = 0, jz = arr.length | 0; j < jz; j++) {

                if (Am[j] <= 0) continue;

                v = arr[j];
                if (v < 0) v = 0;
                else if (v > 1) v = 1;

                hist[(v * 255) | 0]++;
                total++;
            }
            return total;
        };

        const percentileFromHist = (hist, totalCount, pct) => {

            const target = (pct / 100) * totalCount;

            let acc = 0;

            for (let b = 0; b < 256; b++) {

                acc += hist[b];

                if (acc >= target) return b / 255;
            }
            return 1.0;
        };

        const alphaIsSolid = (Am) => {

            let j, acc = 0;

            const jz = Am.length|0;

            for (j = 0; j < jz; j++) {

                acc += (Am[j] > 0) ? 1 : 0;
            }
            return acc === jz;
        };

        // Precompute Ab = blur(Am) and invAb = 1/(Ab + eps)
        const precomputeAlphaReciprocal = (Am, Ab, invAb, width, height, sigma, tmpLine, tmpImg, coeffH, coeffV) => {

            const epsA = 1e-6;

            Ab.set(Am);

            gaussianBlurL_Float(Ab, Ab, width, height, sigma, sigma, tmpLine, tmpImg, coeffH, coeffV);

            for (let j = 0, jz = Ab.length | 0; j < jz; j++) {

                invAb[j] = 1.0 / (Ab[j] + epsA);
            }
        };

        // Fast alpha-aware blur using precomputed invAb:
        const alphaAwareBlurFast = (src, dst, Am, invAb, width, height, sigma, tmpLine, tmpImg, coeffH, coeffV) => {

            let j, jz;

            for (j = 0, jz = src.length | 0; j < jz; j++) {

                dst[j] = src[j] * Am[j];
            }
            gaussianBlurL_Float(dst, dst, width, height, sigma, sigma, tmpLine, tmpImg, coeffH, coeffV);

            for (j = 0, jz = dst.length | 0; j < jz; j++) {

                dst[j] *= invAb[j];
            }
        };

        const downsample2xFloat = (src, dst, w, h) => {

            const w2 = w >> 1,
                h2 = h >> 1;

            let y2, y, y1, r0, r1, o, x2, x, x1, p00, p01, p10, p11;

            for (y2 = 0; y2 < h2; y2++) {

                y = y2 << 1;
                y1 = _min(y + 1, h - 1);
                r0 = y * w;
                r1 = y1 * w;
                o = y2 * w2;

                for (x2 = 0; x2 < w2; x2++) {

                    x = x2 << 1
                    x1 = _min(x + 1, w - 1);

                    p00 = src[r0 + x];
                    p01 = src[r0 + x1];
                    p10 = src[r1 + x];
                    p11 = src[r1 + x1];

                    dst[o + x2] = 0.25 * (p00 + p01 + p10 + p11);
                }
            }
        };

        const upsample2xBilinear = (src, dst, w2, h2, w, h) => {

            let y, y0, y1, fy, row0, row1, x, x0, x1, fx, a, b, c, d, ab, cd;

            for (y = 0; y < h; y++) {

                y0 = y >> 1;
                y1 = _min(y0 + 1, h2 - 1);
                fy = (y & 1) * 0.5;

                row0 = y0 * w2;
                row1 = y1 * w2;

                for (x = 0; x < w; x++) {

                    x0 = x >> 1;
                    x1 = _min(x0 + 1, w2 - 1);
                    fx = (x & 1) * 0.5;

                    a = src[row0 + x0];
                    b = src[row0 + x1];
                    c = src[row1 + x0];
                    d = src[row1 + x1];

                    ab = a + (b - a) * fx;
                    cd = c + (d - c) * fx;

                    dst[y * w + x] = ab + (cd - ab) * fy;
                }
            }
        };

        const [input, output] = getInputAndOutputLines(requirements),
            width = input.width,
            height = input.height,
            iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.length >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.length >>> 2);

        const {
            opacity = 1,
            radius = 1.25,
            passes = 8,
            strength = 0.85,
            clamp = 0.08,
            deriveMaskFromImage = true,
            level = 0.015,
            smoothing = 0.015,
            lineOut,
            multiscale = true,
            multiscaleFinalPasses = 2,
        } = requirements;

        const libs = colorEngine.getRgbOkCache(),
            toOK  = colorEngine.getOkValsForRgb,
            toRGB = colorEngine.getRgbValsForOklab;

        const ws = getRlWorkspace(width, height);
        const { L, A, B, Gs, Gb, R, M, Am, tmpLine, tmpImg, hist } = ws;

        const _coeffH = (radius > 0) ? getGaussianCoeffsFloat(radius) : null,
            _coeffV = _coeffH;

        let i, iz, p, pz, rgba, rgb, a, r, g, b, ok;

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];

            a = (rgba >>> 24) & 0xFF;

            if (a === 0) {

                L[p] = 0;
                A[p] = 0;
                B[p] = 0;
                continue;
            }

            r = rgba & 0xFF;
            g = (rgba >>> 8) & 0xFF;
            b = (rgba >>> 16) & 0xFF;

            ok = toOK(r, g, b, libs);

            L[p] = ok[0];
            A[p] = ok[1];
            B[p] = ok[2];
        }

        makeAlphaMask01(src32, Am);

        const SOLID_ALPHA = alphaIsSolid(Am);

        if (!(radius > 0) || !(passes > 0)) {

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                out32[p] = src32[p];
            }

            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);
            return;
        }

        const runRL = (W, H, _L, _Am, _Ab, _invAb, _Gs, _Gb, _R, _M, _tmpLine, _tmpImg, _hist, _passes, _coeffH, _coeffV) => {

            _Gs.set(_L);

            if (!SOLID_ALPHA) precomputeAlphaReciprocal(_Am, _Ab, _invAb, W, H, radius, _tmpLine, _tmpImg, _coeffH, _coeffV);

            if (SOLID_ALPHA) gaussianBlurL_Float(_Gs, _Gb, W, H, radius, radius, _tmpLine, _tmpImg, _coeffH, _coeffV);
            else alphaAwareBlurFast(_Gs, _Gb, _Am, _invAb, W, H, radius, _tmpLine, _tmpImg, _coeffH, _coeffV);

            if (deriveMaskFromImage) {

                sobelMagFloat(_Gb, _M, W, H);
                smoothstepInto(_M, _M, level, level + _max(1e-6, smoothing));
                gaussianBlurL_Float(_M, _M, W, H, 0.7, 0.7, _tmpLine, _tmpImg, null, null);
            }
            else {

                for (i = 0, iz = _L.length | 0; i < iz; i++) {

                    _M[i] = 1.0;
                }
            }

            for (i = 0, iz = _M.length | 0; i < iz; i++) {

                _M[i] = _M[i] * strength * _Am[i];
            }

            const total = SOLID_ALPHA
                ? buildHist01Float(_Gb, _hist)
                : buildMaskedHist01Float(_Gb, _Am, _hist);

            const p1  = percentileFromHist(_hist, total, 1),
                med = percentileFromHist(_hist, total, 50),
                epsilon_abs = _max(5e-4, 0.25 * p1),
                epsilon_rel = (med > 0.2) ? 0.01 : 0.015;

            const onePlus = 1 + epsilon_rel,
                up = 1 + clamp,
                dn = 1 - clamp,
                hard = (radius > 2 || _passes > 8),
                rLo = hard ? 0.5 : 0.25,
                rHi = hard ? 2.0 : 4.0;

            const Npix = _L.length | 0;

            let it, den, v, accDelta, d, u;

            for (it = 0; it < _passes; it++) {

                if (it > 0) {

                    if (SOLID_ALPHA) gaussianBlurL_Float(_Gs, _Gb, W, H, radius, radius, _tmpLine, _tmpImg, _coeffH, _coeffV);
                    else alphaAwareBlurFast(_Gs, _Gb, _Am, _invAb, W, H, radius, _tmpLine, _tmpImg, _coeffH, _coeffV);
                }

                for (i = 0; i < Npix; i++) {

                    den = _Gb[i] * onePlus + epsilon_abs;

                    v = _L[i] / den;
                    v = _min(_max(v, rLo), rHi);

                    _R[i] = v;
                }

                if (SOLID_ALPHA) gaussianBlurL_Float(_R, _R, W, H, radius, radius, _tmpLine, _tmpImg, _coeffH, _coeffV);
                else alphaAwareBlurFast(_R, _R, _Am, _invAb, W, H, radius, _tmpLine, _tmpImg, _coeffH, _coeffV);

                accDelta = 0;

                for (i = 0; i < Npix; i++) {

                    d = _R[i] - 1;
                    accDelta += (d >= 0 ? d : -d);

                    u = 1 + _M[i] * d;
                    u = _min(_max(u, dn), up);

                    _Gs[i] *= u;
                }
                if ((accDelta / Npix) < 0.003) break;
            }
        };

        const canHalf = (width >= 2 && height >= 2),
            doMS = multiscale && canHalf && passes > multiscaleFinalPasses;

        if (doMS) {

            const w2 = width >> 1,
                h2 = height >> 1,
                wsH = getRlWorkspace(w2, h2);

            const { L: Lh, Gs: Gsh, Gb: Gbh, R: Rh, M: Mh, Am: Amh, tmpLine: tmpLineH, tmpImg: tmpImgH, hist: histH } = wsH;

            downsample2xFloat(L, Lh, width, height);
            downsample2xFloat(Am, Amh, width, height);

            // run most passes at half-res
            const halfPasses = passes - multiscaleFinalPasses;

            if (!SOLID_ALPHA) ensureAlphaRecipBuffers(wsH, w2 * h2);

            runRL(w2, h2, Lh, Amh, wsH.Ab, wsH.invAb, Gsh, Gbh, Rh, Mh, tmpLineH, tmpImgH, histH, halfPasses, _coeffH, _coeffV);

            upsample2xBilinear(Gsh, Gs, w2, h2, width, height);
        }
        else {

            Gs.set(L);
        }

        const finalPasses = doMS ? _max(1, multiscaleFinalPasses | 0) : passes | 0;

        if (!SOLID_ALPHA) {

            ensureAlphaRecipBuffers(ws, width * height);
            precomputeAlphaReciprocal(Am, ws.Ab, ws.invAb, width, height, radius, tmpLine, tmpImg, _coeffH, _coeffV);
        }

        if (SOLID_ALPHA) gaussianBlurL_Float(Gs, Gb, width, height, radius, radius, tmpLine, tmpImg, _coeffH, _coeffV);
        else alphaAwareBlurFast(Gs, Gb, Am, ws.invAb, width, height, radius, tmpLine, tmpImg, _coeffH, _coeffV);

        if (deriveMaskFromImage) {

            sobelMagFloat(Gb, M, width, height);
            smoothstepInto(M, M, level, level + _max(1e-6, smoothing));
            gaussianBlurL_Float(M, M, width, height, 0.7, 0.7, tmpLine, tmpImg, null, null);
        }
        else M.fill(1.0);

        for (i = 0, iz = L.length | 0; i < iz; i++) {

            M[i] = M[i] * strength * Am[i];
        }

        const totalF = SOLID_ALPHA
            ? buildHist01Float(Gb, hist)
            : buildMaskedHist01Float(Gb, Am, hist);

        const p1F  = percentileFromHist(hist, totalF, 1),
            medF = percentileFromHist(hist, totalF, 50),
            epsilon_absF = _max(5e-4, 0.25 * p1F),
            epsilon_relF = (medF > 0.2) ? 0.01 : 0.015;

        const onePlusF = 1 + epsilon_relF,
            upF = 1 + clamp,
            dnF = 1 - clamp,
            hardF = (radius > 2 || finalPasses > 8),
            rLoF = hardF ? 0.5 : 0.25,
            rHiF = hardF ? 2.0 : 4.0;

        for (i = 0, iz = M.length | 0; i < iz; i++) {

            M[i] *= strength;
        }

        const Npix = L.length | 0;

        let iters, DEN, V, ACCDELTA, D, U;

        for (iters = 0; iters < finalPasses; iters++) {

            if (iters > 0) {
                if (SOLID_ALPHA) gaussianBlurL_Float(Gs, Gb, width, height, radius, radius, tmpLine, tmpImg, _coeffH, _coeffV);
                else alphaAwareBlurFast(Gs, Gb, Am, ws.invAb, width, height, radius, tmpLine, tmpImg, _coeffH, _coeffV);
            }

            for (i = 0; i < Npix; i++) {

                DEN = Gb[i] * onePlusF + epsilon_absF;

                V = L[i] / DEN;
                V = _min(_max(V, rLoF), rHiF);

                R[i] = V;
            }

            if (SOLID_ALPHA) gaussianBlurL_Float(R, R, width, height, radius, radius, tmpLine, tmpImg, _coeffH, _coeffV);
            else alphaAwareBlurFast(R, R, Am, ws.invAb, width, height, radius, tmpLine, tmpImg, _coeffH, _coeffV);

            ACCDELTA = 0;

            for (i = 0; i < Npix; i++) {

                D = R[i] - 1;
                ACCDELTA += (D >= 0 ? D : -D);

                U = 1 + M[i] * D;
                U = _min(_max(U, dnF), upF);

                Gs[i] *= U;
            }
            if ((ACCDELTA / Npix) < 0.003) break;
        }

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];

            a = (rgba >>> 24) & 0xFF;
            if (a === 0) {

                out32[p] = rgba;
                continue;
            }

            rgb = toRGB(Gs[p], A[p], B[p], libs);

            out32[p] = ((a << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __displace__ - Shift pixels around the image, based on the values supplied in a displacement image
    [DISPLACE]: function (requirements) {

        const [input, output, mix] = getInputAndOutputLines(requirements);

        const { width: iWidth, height: iHeight, data: iData } = input;
        const { data: oData } = output;
        const { width: mWidth, height: mHeight, data: mData } = mix;

        const nPix = (iWidth * iHeight) | 0;

        const i32 = new Uint32Array(iData.buffer, iData.byteOffset, nPix),
            o32 = new Uint32Array(oData.buffer, oData.byteOffset, nPix);

        const {
            opacity = 1,
            channelX = RED,
            channelY = GREEN,
            scaleX = 1,
            scaleY = 1,
            offsetX = 0,
            offsetY = 0,
            transparentEdges = false,
            useInputAsMask = false,
            lineOut,
        } = requirements || {};

        let offsetForChannelX = 3;
        if (channelX === RED) offsetForChannelX = 0;
        else if (channelX === GREEN) offsetForChannelX = 1;
        else if (channelX === BLUE) offsetForChannelX = 2;

        let offsetForChannelY = 3;
        if (channelY === RED) offsetForChannelY = 0;
        else if (channelY === GREEN) offsetForChannelY = 1;
        else if (channelY === BLUE) offsetForChannelY = 2;

        let p = 0,
            y, iy, my, mRowBase, x, ix, mx,
            destPx, destA, mPos, dispX, dispY, dx, dy,
            srcPx, srcA, dIndex, movedZero, destZero, outPx;

        for (y = 0; y < iHeight; y++) {

            iy = y;
            my = y + offsetY;
            mRowBase = my * mWidth;

            for (x = 0; x < iWidth; x++, p++) {

                ix = x;
                mx = x + offsetX;

                destPx = i32[p];
                destA  = (destPx >>> 24) & 0xFF;

                mPos = -1;

                if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mPos = ((mRowBase + mx) * 4) | 0;

                if (mPos < 0) {

                    o32[p] = destPx;
                    continue;
                }

                dispX = mData[mPos + offsetForChannelX];
                dispY = mData[mPos + offsetForChannelY];

                dx = _floor(ix + ((127 - dispX) / 127) * scaleX);
                dy = _floor(iy + ((127 - dispY) / 127) * scaleY);

                dIndex = -1;

                if (!transparentEdges) {

                    if (dx < 0) dx = 0;
                    else if (dx >= iWidth) dx = iWidth - 1;

                    if (dy < 0) dy = 0;
                    else if (dy >= iHeight) dy = iHeight - 1;

                    dIndex = (dy * iWidth + dx) | 0;
                    srcPx  = i32[dIndex];
                    srcA   = (srcPx >>> 24) & 0xFF;
                }
                else {

                    if (dx >= 0 && dx < iWidth && dy >= 0 && dy < iHeight) {

                        dIndex = (dy * iWidth + dx) | 0;
                        srcPx  = i32[dIndex];
                        srcA   = (srcPx >>> 24) & 0xFF;
                    }
                    else {

                        srcPx = 0;
                        srcA  = 0;
                        dIndex = -1;
                    }
                }

                if (!useInputAsMask) {

                    if (transparentEdges && dIndex < 0) o32[p] = 0;
                    else o32[p] = srcPx;
                    continue;
                }

                movedZero = (srcA === 0);
                destZero = (destA === 0);

                outPx = destPx;

                if (!movedZero && !destZero) outPx = srcPx;
                else if (movedZero && !destZero && transparentEdges) outPx = 0;

                o32[p] = outPx;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __emboss__ - applies a directional 3×3 convolution to turn local color differences into a raised or recessed relief effect, with optional post-processing to keep or highlight only the changed areas.
    [EMBOSS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
              oData = output.data,
              W = input.width  | 0,
              H = input.height | 0,
              rowStride = W << 2;

        const {
            opacity = 1,
            tolerance = 0,
            keepOnlyChangedAreas = false,
            postProcessResults = false,
            lineOut,
        } = requirements;

        const strength = _abs(requirements.strength || 1),
            angle = correctAngle(requirements.angle || 0),
            slices  = (angle / 45) | 0,
            remains = ((angle % 45) / 45) * strength;

        const w = new Float32Array(9);

        w[4] = 1;

        if (slices === 0) {

            w[5] = strength - remains;
            w[8] = remains;
            w[3] = -w[5];
            w[0] = -w[8];
        }
        else if (slices === 1) {

            w[8] = strength - remains;
            w[7] = remains;
            w[0] = -w[8];
            w[1] = -w[7];
        }
        else if (slices === 2) {

            w[7] = strength - remains;
            w[6] = remains;
            w[1] = -w[7];
            w[2] = -w[6];
        }
        else if (slices === 3) {
            w[6] = strength - remains;
            w[3] = remains;
            w[2] = -w[6];
            w[5] = -w[3];
        }
        else if (slices === 4) {
            w[3] = strength - remains;
            w[0] = remains;
            w[5] = -w[3];
            w[8] = -w[0];
        }
        else if (slices === 5) {
            w[0] = strength - remains;
            w[1] = remains;
            w[8] = -w[0];
            w[7] = -w[1];
        }
        else if (slices === 6) {
            w[1] = strength - remains;
            w[2] = remains;
            w[7] = -w[1];
            w[6] = -w[2];
        }
        else {
            w[2] = strength - remains;
            w[5] = remains;
            w[6] = -w[2];
            w[3] = -w[5];
        }

        let x, y, yU, yD, rowU, rowM, rowD, xL, xC, xR,
            p00, p01, p02, p10, p11, p12, p20, p21, p22,
            r, g, b, iR, iG, iB, unchanged;

        for (y = 0; y < H; y++) {

            yU = (y === 0 ? H - 1 : y - 1);
            yD = (y === H - 1 ? 0 : y + 1);

            rowU = (yU * rowStride) | 0;
            rowM = (y * rowStride) | 0;
            rowD = (yD * rowStride) | 0;

            for (x = 0; x < W; x++) {

                xL = (x === 0 ? W - 1 : x - 1) << 2;
                xC = (x << 2);
                xR = (x === W - 1 ? 0 : x + 1) << 2;

                p00 = rowU + xL;
                p01 = rowU + xC;
                p02 = rowU + xR;
                p10 = rowM + xL;
                p11 = rowM + xC;
                p12 = rowM + xR;
                p20 = rowD + xL;
                p21 = rowD + xC;
                p22 = rowD + xR;

                if (!iData[p11 + 3]) continue;

                r = iData[p00] * w[0] + iData[p01] * w[1] + iData[p02] * w[2] +
                    iData[p10] * w[3] + iData[p11] * w[4] + iData[p12] * w[5] +
                    iData[p20] * w[6] + iData[p21] * w[7] + iData[p22] * w[8];

                g = iData[p00 + 1] * w[0] + iData[p01 + 1] * w[1] + iData[p02 + 1] * w[2] +
                    iData[p10 + 1] * w[3] + iData[p11 + 1] * w[4] + iData[p12 + 1] * w[5] +
                    iData[p20 + 1] * w[6] + iData[p21 + 1] * w[7] + iData[p22 + 1] * w[8];

                b = iData[p00 + 2] * w[0] + iData[p01 + 2] * w[1] + iData[p02 + 2] * w[2] +
                    iData[p10 + 2] * w[3] + iData[p11 + 2] * w[4] + iData[p12 + 2] * w[5] +
                    iData[p20 + 2] * w[6] + iData[p21 + 2] * w[7] + iData[p22 + 2] * w[8];

                oData[p11] = r;
                oData[p11 + 1] = g;
                oData[p11 + 2] = b;
                oData[p11 + 3] = iData[p11 + 3];

                if (postProcessResults) {

                    iR = iData[p11];
                    iG = iData[p11 + 1];
                    iB = iData[p11 + 2];

                    unchanged =
                        (r >= iR - tolerance && r <= iR + tolerance) &&
                        (g >= iG - tolerance && g <= iG + tolerance) &&
                        (b >= iB - tolerance && b <= iB + tolerance);

                    if (unchanged) {

                        if (keepOnlyChangedAreas) oData[p11 + 3] = 0;
                        else {

                            oData[p11] = 127;
                            oData[p11 + 1] = 127;
                            oData[p11 + 2] = 127;
                        }
                    }
                }
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __flood__ - Set all pixels to the channel values supplied in the "red", "green", "blue" and "alpha" arguments
    [FLOOD]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            red = 0,
            green = 0,
            blue = 0,
            alpha = 255,
            excludeAlpha = false,
            lineOut,
        } = requirements;

        const clamp8 = v => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

        const R = clamp8(red),
            G = clamp8(green),
            B = clamp8(blue),
            A = clamp8(alpha);

        // Precompute packed color
        const baseRGB = (B << 16) | (G << 8) | R,
            packedWithA = ((A << 24) | baseRGB) >>> 0;

        let p, pz, s, a;

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            s = src32[p];
            a = (s >>> 24) & 0xFF;

            if (a === 0) out32[p] = s;
            else out32[p] = excludeAlpha ? (((a << 24) | baseRGB) >>> 0) : packedWithA;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __gaussian-blur__ - adapted and evolved from code in this GitHub repository: https://github.com/nodeca/glur/blob/master/index.js (code accessed 1 June 2021)
    [GAUSSIAN_BLUR]: function (requirements) {

        const WS_KEY = 'gaussian-blur::workspace';
        const getWorkspace = (pixelCount, maxSide4) => {

            let ws = getWorkstoreItem(WS_KEY);
            if (!ws) ws = {};

            if (!ws.bufA32 || ws.bufA32.length !== pixelCount) ws.bufA32 = new Uint32Array(pixelCount);
            if (!ws.bufB32 || ws.bufB32.length !== pixelCount) ws.bufB32 = new Uint32Array(pixelCount);

            if (!ws.tmpLineF32 || ws.tmpLineF32.length < maxSide4) ws.tmpLineF32 = new Float32Array(maxSide4);

            setWorkstoreItem(WS_KEY, ws);
            return ws;
        }

        const COEFFS_KEY = 'gaussian-blur::coeffs';
        const getCoeffCache = () => {

            let m = getWorkstoreItem(COEFFS_KEY);
            if (!m) {

                m = new Map();
                setWorkstoreItem(COEFFS_KEY, m);
            }
            return m;
        };

        const gaussCoefRaw = (sigmaIn) => {

            let sigma = sigmaIn;
            if (sigma < 0.5) sigma = 0.5;

            const a = _exp(0.726 * 0.726) / sigma,
                g1 = _exp(-a),
                g2 = _exp(-2 * a),
                a0 = (1 - g1) * (1 - g1) / (1 + 2 * a * g1 - g2),
                a1 = a0 * (a - 1) * g1,
                a2 = a0 * (a + 1) * g1,
                a3 = -a0 * g2,
                b1 = 2 * g1,
                b2 = -g2,
                left_corner  = (a0 + a1) / (1 - b1 - b2),
                right_corner = (a2 + a3) / (1 - b1 - b2);

            return new Float32Array([a0, a1, a2, a3, b1, b2, left_corner, right_corner]);
        };

        const getCoeffs = (sigma) => {

            const s = (sigma > 0 ? sigma : 0) || 0,
                key = s < 0.5 ? 0.5 : Math.round(s * 1024) / 1024;

            const cache = getCoeffCache();

            let c = cache.get(key);

            if (!c) {

                c = gaussCoefRaw(key);
                cache.set(key, c);
            }
            return c;
        };

        const premultiply_u32 = (buf32, count) => {

            let i, px, r, g, b, a, f;

            for (i = 0; i < count; i++) {

                px = buf32[i];

                a  = (px >>> 24) & 0xFF;

                if (a === 0 || a === 255) continue;

                f = a / 255;

                r = ((px) & 0xFF);
                g = ((px >>> 8) & 0xFF);
                b = ((px >>> 16) & 0xFF);

                r = (r * f + 0.5) | 0;
                g = (g * f + 0.5) | 0;
                b = (b * f + 0.5) | 0;

                buf32[i] = (px & 0xFF000000) | (b << 16) | (g << 8) | r;
            }
        };

        const unpremultiply_u32 = (buf32, count) => {

            let i, px, r, g, b, a, f;

            for (i = 0; i < count; i++) {

                px = buf32[i];

                a  = (px >>> 24) & 0xFF;

                if (a === 0 || a === 255) continue;

                f = 255 / a;

                r = ((px) & 0xFF);
                g = ((px >>> 8) & 0xFF);
                b = ((px >>> 16) & 0xFF);

                r = _min(255, (r * f + 0.5) | 0);
                g = _min(255, (g * f + 0.5) | 0);
                b = _min(255, (b * f + 0.5) | 0);

                buf32[i] = (px & 0xFF000000) | (b << 16) | (g << 8) | r;
            }
        };

        // Bilinear sample from a packed Uint32 RGBA buffer at (xf, yf).
        // - Clamps edges. Returns {r,g,b,a} as numbers 0..255.
        const bilinearResult = [0, 0, 0, 0];
        const sampleRGBA_bilinear_u32 = (src32, width, height, xf, yf) => {

            if (xf < 0) xf = 0;
            else if (xf > width  - 1) xf = width  - 1;

            if (yf < 0) yf = 0;
            else if (yf > height - 1) yf = height - 1;

            const x0 = xf | 0,
                y0 = yf | 0,
                x1 = x0 + 1 < width ? x0 + 1 : x0,
                y1 = y0 + 1 < height ? y0 + 1 : y0;

            const fx = xf - x0,
                fy = yf - y0;

            const w00 = (1 - fx) * (1 - fy),
                w10 = (fx) * (1 - fy),
                w01 = (1 - fx) * (fy),
                w11 = (fx) * (fy);

            const i00 = y0 * width + x0,
                i10 = y0 * width + x1,
                i01 = y1 * width + x0,
                i11 = y1 * width + x1;

            const p00 = src32[i00],
                p10 = src32[i10],
                p01 = src32[i01],
                p11 = src32[i11];

            // Extract channels
            const r00 = p00 & 0xFF,
                g00 = (p00 >>> 8) & 0xFF,
                b00 = (p00 >>> 16) & 0xFF,
                a00 = (p00 >>> 24) & 0xFF;

            const r10 = p10 & 0xFF,
                g10 = (p10 >>> 8) & 0xFF,
                b10 = (p10 >>> 16) & 0xFF,
                a10 = (p10 >>> 24) & 0xFF;

            const r01 = p01 & 0xFF,
                g01 = (p01 >>> 8) & 0xFF,
                b01 = (p01 >>> 16) & 0xFF,
                a01 = (p01 >>> 24) & 0xFF;

            const r11 = p11 & 0xFF,
                g11 = (p11 >>> 8) & 0xFF,
                b11 = (p11 >>> 16) & 0xFF,
                a11 = (p11 >>> 24) & 0xFF;

            bilinearResult[0] = r00 * w00 + r10 * w10 + r01 * w01 + r11 * w11;
            bilinearResult[1] = g00 * w00 + g10 * w10 + g01 * w01 + g11 * w11;
            bilinearResult[2] = b00 * w00 + b10 * w10 + b01 * w01 + b11 * w11;
            bilinearResult[3] = a00 * w00 + a10 * w10 + a01 * w01 + a11 * w11;

            return bilinearResult;
        };

        const pack4 = (r, g, b, a) => {

            r = r < 0 ? 0 : r > 255 ? 255 : r | 0;
            g = g < 0 ? 0 : g > 255 ? 255 : g | 0;
            b = b < 0 ? 0 : b > 255 ? 255 : b | 0;
            a = a < 0 ? 0 : a > 255 ? 255 : a | 0;

            return (a << 24) | (b << 16) | (g << 8) | r;
        };

        const rotateIntoAngleFrame = (src32, dst32, width, height, theta) => {

            const c = _cos(theta),
                s = _sin(theta),
                cx = (width - 1) * 0.5,
                cy = (height - 1) * 0.5;

            let v, dv, u, du, x, y, r, g, b, a;

            for (v = 0; v < height; v++) {

                dv = v - cy;

                for (u = 0; u < width; u++) {

                    du = u - cx;

                    x =  du * c - dv * s + cx;
                    y =  du * s + dv * c + cy;

                    [r,g,b,a] = sampleRGBA_bilinear_u32(src32, width, height, x, y);

                    dst32[v * width + u] = pack4(r, g, b, a);
                }
            }
        };

        const rotateBackToImageFrame = (src32, dst32, width, height, theta) => {

            const c = _cos(theta),
                s = _sin(theta),
                cx = (width - 1) * 0.5,
                cy = (height - 1) * 0.5;

            let y, dy, x, dx, u, v, r, g, b, a;

            for (y = 0; y < height; y++) {

                dy = y - cy;

                for (x = 0; x < width; x++) {

                    dx = x - cx;

                    u =  dx * c + dy * s + cx;
                    v = -dx * s + dy * c + cy;

                    [r,g,b,a] = sampleRGBA_bilinear_u32(src32, width, height, u, v);

                    dst32[y * width + x] = pack4(r, g, b, a);
                }
            }
        };

        const transpose_u32 = (src32, dst32, width, height) => {

            let y, baseY, x;

            for (y = 0; y < height; y++) {

                baseY = y * width;
                for (x = 0; x < width; x++) {

                    dst32[baseY + x] = src32[x * height + y];
                }
            }
        };

        const runRotatedPath = (angleR) => {

            rotateIntoAngleFrame(src32, bufA32, width, height, angleR);

            if (doH && doV) {

                convolveRGBA(bufA32, bufB32, tmpLineF32, hCoeff, width, height);
                convolveRGBA(bufB32, bufA32, tmpLineF32, vCoeff, height, width);
            }
            else if (doH && !doV) {

                convolveRGBA(bufA32, bufB32, tmpLineF32, hCoeff, width, height);
                transpose_u32(bufB32, bufA32, width, height);
            }
            else if (!doH && doV) {

                transpose_u32(bufA32, bufB32, width, height);
                convolveRGBA(bufB32, bufA32, tmpLineF32, vCoeff, height, width);
            }
            else bufA32.set(bufA32);

            rotateBackToImageFrame(bufA32, bufB32, width, height, angleR);
            return bufB32;
        };

        const convolveRGBA = (src, out, line, coeff, width, height) => {

            const sat8 = (x) => x < 0 ? 0 : (x > 255 ? 255 : x);

            const c_a0L = coeff[0],
                c_a1L = coeff[1],
                c_a0R = coeff[2],
                c_a1R = coeff[3],
                c_b1  = coeff[4],
                c_b2  = coeff[5],
                c_lc  = coeff[6],
                c_rc  = coeff[7];

            let i, j,
                src_index, out_index, line_index, rgba,
                prev_src_r, prev_src_g, prev_src_b, prev_src_a,
                prev_prev_out_r, prev_prev_out_g, prev_prev_out_b, prev_prev_out_a,
                prev_out_r, prev_out_g, prev_out_b, prev_out_a,
                curr_src_r, curr_src_g, curr_src_b, curr_src_a,
                curr_out_r, curr_out_g, curr_out_b, curr_out_a,
                pr, pg, pb, pa;

            for (i = 0; i < height; i++) {

                src_index = i * width;
                out_index = i;
                line_index = 0;

                rgba = src[src_index];

                prev_src_r = rgba & 0xff;
                prev_src_g = (rgba >>> 8) & 0xff;
                prev_src_b = (rgba >>> 16) & 0xff;
                prev_src_a = (rgba >>> 24) & 0xff;

                prev_prev_out_r = prev_src_r * c_lc;
                prev_prev_out_g = prev_src_g * c_lc;
                prev_prev_out_b = prev_src_b * c_lc;
                prev_prev_out_a = prev_src_a * c_lc;

                prev_out_r = prev_prev_out_r;
                prev_out_g = prev_prev_out_g;
                prev_out_b = prev_prev_out_b;
                prev_out_a = prev_prev_out_a;

                for (j = 0; j < width; j++) {

                    rgba = src[src_index];

                    curr_src_r = rgba & 0xff;
                    curr_src_g = (rgba >>> 8) & 0xff;
                    curr_src_b = (rgba >>> 16) & 0xff;
                    curr_src_a = (rgba >>> 24) & 0xff;

                    curr_out_r = curr_src_r * c_a0L + prev_src_r * c_a1L + prev_out_r * c_b1 + prev_prev_out_r * c_b2;
                    curr_out_g = curr_src_g * c_a0L + prev_src_g * c_a1L + prev_out_g * c_b1 + prev_prev_out_g * c_b2;
                    curr_out_b = curr_src_b * c_a0L + prev_src_b * c_a1L + prev_out_b * c_b1 + prev_prev_out_b * c_b2;
                    curr_out_a = curr_src_a * c_a0L + prev_src_a * c_a1L + prev_out_a * c_b1 + prev_prev_out_a * c_b2;

                    prev_prev_out_r = prev_out_r;
                    prev_out_r = curr_out_r;
                    prev_src_r = curr_src_r;

                    prev_prev_out_g = prev_out_g;
                    prev_out_g = curr_out_g;
                    prev_src_g = curr_src_g;

                    prev_prev_out_b = prev_out_b;
                    prev_out_b = curr_out_b;
                    prev_src_b = curr_src_b;

                    prev_prev_out_a = prev_out_a;
                    prev_out_a = curr_out_a;
                    prev_src_a = curr_src_a;

                    line[line_index] = prev_out_r;
                    line[line_index + 1] = prev_out_g;
                    line[line_index + 2] = prev_out_b;
                    line[line_index + 3] = prev_out_a;

                    line_index += 4;
                    src_index++;
                }

                src_index--;
                line_index -= 4;
                out_index += height * (width - 1);

                rgba = src[src_index];

                prev_src_r = rgba & 0xff;
                prev_src_g = (rgba >>> 8) & 0xff;
                prev_src_b = (rgba >>> 16) & 0xff;
                prev_src_a = (rgba >>> 24) & 0xff;

                prev_prev_out_r = prev_src_r * c_rc;
                prev_prev_out_g = prev_src_g * c_rc;
                prev_prev_out_b = prev_src_b * c_rc;
                prev_prev_out_a = prev_src_a * c_rc;

                prev_out_r = prev_prev_out_r;
                prev_out_g = prev_prev_out_g;
                prev_out_b = prev_prev_out_b;
                prev_out_a = prev_prev_out_a;

                curr_src_r = prev_src_r;
                curr_src_g = prev_src_g;
                curr_src_b = prev_src_b;
                curr_src_a = prev_src_a;

                for (j = width - 1; j >= 0; j--) {

                    curr_out_r = curr_src_r * c_a0R + prev_src_r * c_a1R + prev_out_r * c_b1 + prev_prev_out_r * c_b2;
                    curr_out_g = curr_src_g * c_a0R + prev_src_g * c_a1R + prev_out_g * c_b1 + prev_prev_out_g * c_b2;
                    curr_out_b = curr_src_b * c_a0R + prev_src_b * c_a1R + prev_out_b * c_b1 + prev_prev_out_b * c_b2;
                    curr_out_a = curr_src_a * c_a0R + prev_src_a * c_a1R + prev_out_a * c_b1 + prev_prev_out_a * c_b2;

                    prev_prev_out_r = prev_out_r;
                    prev_out_r = curr_out_r;
                    prev_src_r = curr_src_r;

                    prev_prev_out_g = prev_out_g;
                    prev_out_g = curr_out_g;
                    prev_src_g = curr_src_g;

                    prev_prev_out_b = prev_out_b;
                    prev_out_b = curr_out_b;
                    prev_src_b = curr_src_b;

                    prev_prev_out_a = prev_out_a;
                    prev_out_a = curr_out_a;
                    prev_src_a = curr_src_a;

                    rgba = src[src_index];

                    curr_src_r = rgba & 0xff;
                    curr_src_g = (rgba >>> 8) & 0xff;
                    curr_src_b = (rgba >>> 16) & 0xff;
                    curr_src_a = (rgba >>> 24) & 0xff;

                    pr = sat8((line[line_index] + prev_out_r) | 0);
                    pg = sat8((line[line_index + 1] + prev_out_g) | 0);
                    pb = sat8((line[line_index + 2] + prev_out_b) | 0);
                    pa = sat8((line[line_index + 3] + prev_out_a) | 0);

                    out[out_index] = pr | (pg << 8) | (pb << 16) | (pa << 24);

                    src_index--;
                    line_index -= 4;
                    out_index -= height;
                }
            }
        };

        const near = (t) => _abs(_sin(t)) < 1e-6 || _abs(_cos(t)) < 1e-6;

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const { width, height } = input;

        const {
            opacity = 1,
            radiusHorizontal = 1,
            radiusVertical = 1,
            angle = 0,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = true,
            excludeTransparentPixels = false,
            premultiply = false,
            lineOut,
        } = requirements;

        const angleRad = angle * _radian;

        const pixels = (iData.length >>> 2),
            maxSide4 = _max(width, height) * 4;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, pixels),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  pixels);

        const RM = includeRed   ? 0x000000FF : 0,
            GM = includeGreen ? 0x0000FF00 : 0,
            BM = includeBlue  ? 0x00FF0000 : 0,
            AM = includeAlpha ? 0xFF000000 : 0;

        const CHMASK = (RM | GM | BM | AM) >>> 0;

        if ((radiusHorizontal <= 0) && (radiusVertical <= 0)) {

            if (CHMASK === 0xFFFFFFFF && !excludeTransparentPixels) out32.set(src32);
            else if (!excludeTransparentPixels) {

                let s, p;

                for (p = 0; p < pixels; p++) {

                    s = src32[p];
                    out32[p] = (s & CHMASK) | (s & ~CHMASK);
                }
            }
            else {

                let s, p;

                for (p = 0; p < pixels; p++) {

                    s = src32[p];

                    if ((s >>> 24) === 0) out32[p] = s;
                    else out32[p] = (s & CHMASK) | (s & ~CHMASK);
                }
            }
            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);

            return;
        }

        const { bufA32, bufB32, tmpLineF32 } = getWorkspace(pixels, maxSide4);

        const doH = radiusHorizontal > 0,
            doV = radiusVertical > 0;

        const hCoeff = doH ? getCoeffs(radiusHorizontal) : null,
            vCoeff = doV ? getCoeffs(radiusVertical) : null;

        if (premultiply) premultiply_u32(src32, pixels);

        let blurred32;

        const k = _round(angleRad / _piHalf),
            snapped = k * _piHalf;

        if (near(angleRad)) blurred32 = runRotatedPath(snapped);
        else blurred32 = runRotatedPath(angleRad);

        if (premultiply) unpremultiply_u32(blurred32, pixels);

        if (CHMASK === 0xFFFFFFFF && !excludeTransparentPixels) out32.set(blurred32);
        else if (!excludeTransparentPixels) {

            let p, s, b;

            for (p = 0; p < pixels; p++) {

                s = src32[p];
                b = blurred32[p];

                out32[p] = (b & CHMASK) | (s & ~CHMASK);
            }
        }
        else {

            let p, s, b;

            for (p = 0; p < pixels; p++) {

                s = src32[p];

                if ((s >>> 24) === 0) {

                    out32[p] = s;
                    continue;
                }

                b = blurred32[p];
                out32[p] = (b & CHMASK) | (s & ~CHMASK);
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __glitch__ - Swap pixels at random within a given box (width/height) distance of each other, dependent on the level setting - lower levels mean less noise. Uses a pseudo-random numbers generator to ensure consistent results across runs. Takes into account choices to include red, green, blue and alpha channels, and whether to ignore transparent pixels
//
// NOTE: this filter is deprecated. No further work is planned to maintain or improve it. Instead, the plan is to replace this filter with a set of loosely linked glitch effect filters covering:
// + **Row/Column Displace** - band-based shifts with seed/seedDelta and edgeMode (transparent / wrap / clamp).
// + **Channel Split/Drift** - per-channel offsets (optional blur for chroma bleed).
// + **Slice Repeat / Dropout** - duplicate or zero spans for tear/gap artifacts.
// + **Block Corrupt** - copy/permute fixed-size tiles (macroblock vibe).
// + **Quantize/Posterize** - use the existing STEP_CHANNELS filter.
// + **Banding** - deliberate bit-depth reduction (optional dithering).
// + **Noise overlays** - grain, RF snow, line hum - see the RANDOM_NOISE filter, which already implements (some of) this functionality.
// + **Scanline mod** - per-row brightness modulation (e.g., sinusoidal).
// + **Color-space glitch** - wrong YCbCr matrix or 4:2:0 bleed/smear.
    [GLITCH]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData  = input.data,
            oData  = output.data,
            iWidth = input.width,
            iHeight = input.height;

        const nPix = (iWidth * iHeight) | 0;

        const i32 = new Uint32Array(iData.buffer, iData.byteOffset, nPix),
            o32 = new Uint32Array(oData.buffer, oData.byteOffset, nPix);

        const {
            opacity = 1,
            useMixedChannel = true,
            seed = DEFAULT_SEED,
            level = 0,
            offsetMin = 0,
            offsetMax = 0,
            offsetRedMin = 0,
            offsetRedMax = 0,
            offsetGreenMin = 0,
            offsetGreenMax = 0,
            offsetBlueMin = 0,
            offsetBlueMax = 0,
            offsetAlphaMin = 0,
            offsetAlphaMax = 0,
            transparentEdges = false,
            useInputAsMask = false,
            lineOut,
        } = requirements || {};

        let step = _floor(requirements.step);
        if (step < 1) step = 1;

        const rnd = getRandomNumbers({
            seed,
            length: iHeight * 5,
        });

        const range = offsetMax - offsetMin,
            redRange = offsetRedMax - offsetRedMin,
            greenRange = offsetGreenMax - offsetGreenMin,
            blueRange = offsetBlueMax - offsetBlueMin,
            alphaRange = offsetAlphaMax - offsetAlphaMin;

        let rndCursor = -1;

        const rows = [];

        let i, j, affectedRow, shift, shiftR, shiftG, shiftB, shiftA;

        for (i = 0; i < iHeight; i += step) {

            affectedRow = (rnd[++rndCursor] < level);

            if (affectedRow) {

                if (useMixedChannel) {

                    shift = (offsetMin + _floor(rnd[++rndCursor] * range)) * 4;

                    for (j = 0; j < step; j++) {

                        rows.push(shift, shift, shift, shift);
                    }
                }
                else {

                    shiftR = (offsetRedMin + _floor(rnd[++rndCursor] * redRange)) * 4;
                    shiftG = (offsetGreenMin + _floor(rnd[++rndCursor] * greenRange)) * 4;
                    shiftB = (offsetBlueMin + _floor(rnd[++rndCursor] * blueRange)) * 4;
                    shiftA = (offsetAlphaMin + _floor(rnd[++rndCursor] * alphaRange)) * 4;

                    for (j = 0; j < step; j++) {

                        rows.push(shiftR, shiftG, shiftB, shiftA);
                    }
                }
            }
            else {

                for (j = 0; j < step; j++) {

                    rows.push(0, 0, 0, 0);
                }
            }
        }

        const rowStrideBytes = (iWidth << 2);
        let p = 0;

        let y, x, rowStart, rowEnd, baseByte, cursor,
            dr, dg, db, da,
            ur, ug, ub, ua,
            srcR, srcG, srcB, srcA,
            destPx, destR, destG, destB, destA,
            movedZero, destZero,
            outR, outG, outB, outA,
            outOfRow;

        for (y = 0; y < iHeight; y++) {

            rowStart = y * rowStrideBytes;
            rowEnd   = rowStart + rowStrideBytes;

            // offsets for this row
            cursor = (y << 2);
            dr = rows[cursor];
            dg = rows[cursor + 1];
            db = rows[cursor + 2];
            da = rows[cursor + 3];

            for (x = 0; x < iWidth; x++, p++) {

                baseByte = rowStart + (x << 2);

                destPx = i32[p];
                destR =  destPx & 0xFF;
                destG = (destPx >>> 8) & 0xFF;
                destB = (destPx >>> 16) & 0xFF;
                destA = (destPx >>> 24) & 0xFF;

                ur = baseByte + dr;
                ug = baseByte + 1 + dg;
                ub = baseByte + 2 + db;
                ua = baseByte + 3 + da;

                srcR = iData[ur];
                srcG = iData[ug];
                srcB = iData[ub];

                if (transparentEdges) {

                    outOfRow =
                        (ur < rowStart || ur > rowEnd) ||
                        (ug < rowStart || ug > rowEnd) ||
                        (ub < rowStart || ub > rowEnd) ||
                        (ua < rowStart || ua > rowEnd);

                    srcA = outOfRow ? 0 : iData[ua];
                }
                else srcA = iData[ua];

                if (!useInputAsMask) {

                    outR = srcR;
                    outG = srcG;
                    outB = srcB;
                    outA = srcA;

                    o32[p] = (outA << 24) | (outB << 16) | (outG << 8) | outR;
                    continue;
                }

                movedZero = (srcA === 0);
                destZero  = (destA === 0);

                outR = destR;
                outG = destG;
                outB = destB;
                outA = destA;

                if (!movedZero && !destZero) {

                    outR = srcR;
                    outG = srcG;
                    outB = srcB;
                    outA = srcA;
                }
                else if (movedZero && !destZero && transparentEdges) {

                    outR = 0;
                    outG = 0;
                    outB = 0;
                    outA = 0;
                }
                o32[p] = (outA << 24) | (outB << 16) | (outG << 8) | outR;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __grayscale__ - For each pixel, averages the weighted color channels and applies the result across all the color channels. This gives a more realistic monochrome effect.
    [GRAYSCALE]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        // 32-bit views over the same buffers (respecting byteOffset/length)
        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

        const {
            opacity = 1,
            lineOut
        } = requirements;

        let rgba, r, g, b, a, gray, p, pz;

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];

            r = rgba & 0xff;
            g = (rgba >>> 8) & 0xff;
            b = (rgba >>> 16) & 0xff;
            a = (rgba >>> 24) & 0xff;

            gray = (r * 54 + g * 183 + b * 19) >> 8;

            out32[p] = ((a << 24) | (gray << 16) | (gray << 8) | gray) >>> 0;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __invert-channels__ - For each pixel, subtracts its current channel values - when included - from 255.
    [INVERT_CHANNELS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        // 32-bit views over the same buffers (respect byteOffset/length)
        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = false,
            lineOut,
        } = requirements;

        const mask = (includeRed ? 0x000000FF : 0) | (includeGreen ? 0x0000FF00 : 0) | (includeBlue ? 0x00FF0000 : 0) | (includeAlpha ? 0xFF000000 : 0);

        if (mask === 0) out32.set(src32);
        else {

            for (let p = 0, pz = src32.length | 0; p < pz; p++) {

                out32[p] = src32[p] ^ mask;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __lock-channels-to-levels__ - Produces a posterize effect. Takes in four arguments - "red", "green", "blue" and "alpha" - each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value.
    [LOCK_CHANNELS_TO_LEVELS]: function (requirements) {

        const normalizeLevels = (spec) => {

            let arr;

            if (spec == null) arr = [];
            else if (spec.toFixed) arr = [spec];
            else if (spec.substring) {

                arr = (spec.match(/-?\d+/g) || []).map(n => +n);
            }
            else if (_isArray(spec)) arr = spec.map(n => +n);
            else arr = [];

            const seen = new Uint8Array(256),
                out = [];

            let i, iz, v;

            for (i = 0, iz = arr.length; i < iz; i++) {

                v = arr[i];

                if (!_isFinite(v)) continue;

                v = v < 0 ? 0 : v > 255 ? 255 : v | 0;

                if (!seen[v]) {

                    seen[v] = 1;
                    out.push(v);
                }
            }

            out.sort((a, b) => a - b);

            return out;
        };

        const buildLUT = (levels) => {

            const lut = new Uint8ClampedArray(256);

            if (!levels || levels.length === 0) {

                for (let v = 0; v < 256; v++) {

                    lut[v] = v;
                }
                return lut;
            }

            if (levels.length === 1) {

                const L = levels[0] | 0;

                for (let v = 0; v < 256; v++) {

                    lut[v] = L;
                }
                return lut;
            }

            for (let i = 0, iz = levels.length; i < iz; i++) {

                const cur = levels[i],
                    start = (i === 0) ? 0 : _ceil((levels[i - 1] + cur) * 0.5),
                    end = (i === iz - 1) ? 255 : _floor((cur + levels[i + 1]) * 0.5);

                for (let v = start; v <= end; v++) {

                    lut[v] = cur;
                }
            }
            return lut;
        };

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

        const {
            opacity = 1,
            red = [0],
            green = [0],
            blue = [0],
            alpha = [255],
            lineOut,
        } = requirements;

        // Normalize and build LUTs
        const rLevels = normalizeLevels(red),
            gLevels = normalizeLevels(green),
            bLevels = normalizeLevels(blue),
            aLevels = normalizeLevels(alpha);

        const lutR = buildLUT(rLevels),
            lutG = (green === red) ? lutR : buildLUT(gLevels),
            lutB = (blue  === red) ? lutR : (blue === green ? lutG : buildLUT(bLevels)),
            lutA = buildLUT(aLevels);

        let p, pz, rgba, r, g, b, a, nr, ng, nb, na;

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];

            r = rgba & 0xFF;
            g = (rgba >>> 8) & 0xFF;
            b = (rgba >>> 16) & 0xFF;
            a = (rgba >>> 24) & 0xFF;

            nr = lutR[r];
            ng = lutG[g];
            nb = lutB[b];
            na = lutA[a];

            out32[p] = ((na << 24) | (nb << 16) | (ng << 8) | nr) >>> 0;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __luminance-to-alpha__ - sets the OKLAB alpha channel to the value of the luminance channel, then sets the luminance, A and B channels to 0 (black).
    [LUMINANCE_TO_ALPHA]: function (requirements) {

        // Precomputed per-channel contributions to l,m,s (OKLab forward matrices)
        // + l = Lr[r] + Lg[g] + Lb[b]; etc (Nine 256-entry tables; ~9 KB total)
        const SRGB_TO_LINEAR_LUT = 'srgb-linear-lut-256';
        const OKLAB_L_FROM_SRGB_TABLES = 'oklab-L-from-srgb-9tables';
        const getOklabLTables = () => {

            // sRGB -> linear LUT (256)
            const getLinearSrgbLut = () => {

                let lut = getWorkstoreItem(SRGB_TO_LINEAR_LUT);

                if (lut) return lut;

                lut = new Float32Array(256);

                let i, cs;

                for (i = 0; i < 256; i++) {

                    cs = i / 255;
                    lut[i] = (cs <= 0.04045) ? (cs / 12.92) : _pow((cs + 0.055) / 1.055, 2.4);
                }
                setWorkstoreItem(SRGB_TO_LINEAR_LUT, lut);

                return lut;
            };

            let lut = getWorkstoreItem(OKLAB_L_FROM_SRGB_TABLES);
            if (lut) return lut;

            const s2l = getLinearSrgbLut();

            const Lr = new Float32Array(256),
                Lg = new Float32Array(256),
                Lb = new Float32Array(256),
                Mr = new Float32Array(256),
                Mg = new Float32Array(256),
                Mb = new Float32Array(256),
                Sr = new Float32Array(256),
                Sg = new Float32Array(256),
                Sb = new Float32Array(256);

            for (let i = 0, v; i < 256; i++) {

                v = s2l[i];

                Lr[i] = 0.4122214708 * v;
                Lg[i] = 0.5363325363 * v;
                Lb[i] = 0.0514459929 * v;

                Mr[i] = 0.2119034982 * v;
                Mg[i] = 0.6806995451 * v;
                Mb[i] = 0.1073969566 * v;

                Sr[i] = 0.0883024619 * v;
                Sg[i] = 0.2817188376 * v;
                Sb[i] = 0.6299787005 * v;
            }

            lut = { Lr, Lg, Lb, Mr, Mg, Mb, Sr, Sg, Sb };

            setWorkstoreItem(OKLAB_L_FROM_SRGB_TABLES, lut);

            return lut;
        };

        // Build (once) and cache a 1-D cbrt LUT
        const getCbrtLut = function (size = 4096, maxX = 1.0) {

            const key = `oklab::cbrt::${size}::${maxX}`;
            let lut = getWorkstoreItem(key);

            if (!lut) {

                lut = new Float32Array(size + 1);

                const step = maxX / size;

                let i, x;

                for (i = 0; i <= size; i++) {

                    x = i * step;
                    lut[i] = Math.cbrt(x);
                }
                setWorkstoreItem(key, lut);
            }
            return { lut, size, maxX, scale: size / maxX };
        };

        // Fast cbrt via LUT + lerp
        const cbrtLUT = function (x, lutPack) {

            const v = x;

            if (v <= 0) return 0;

            if (v >= lutPack.maxX) return lutPack.lut[lutPack.size];

            const f = v * lutPack.scale,
                i = f | 0,
                t = f - i,
                a = lutPack.lut[i],
                b = lutPack.lut[i + 1];

            return a + t * (b - a);
        };

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        const { Lr, Lg, Lb, Mr, Mg, Mb, Sr, Sg, Sb } = getOklabLTables();

        const lutPack = getCbrtLut(4096, 1.0);

        let p, pz, s, r8, g8, b8, l, m, s3, l_, m_, s_, L, A;

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            s = src32[p];

            r8 = s & 0xFF;
            g8 = (s >>> 8) & 0xFF;
            b8 = (s >>> 16) & 0xFF;

            l = Lr[r8] + Lg[g8] + Lb[b8];
            m = Mr[r8] + Mg[g8] + Mb[b8];
            s3 = Sr[r8] + Sg[g8] + Sb[b8];

            l_ = cbrtLUT(l, lutPack);
            m_ = cbrtLUT(m, lutPack);
            s_ = cbrtLUT(s3, lutPack);

            L = (0.2104542553 * l_) + (0.7936177850 * m_) - (0.0040720468 * s_);

            if (L < 0) L = 0;
            else if (L > 1) L = 1;

            A = (L * 256) | 0;
            if (A > 255) A = 255;

            out32[p] = (A << 24) >>> 0;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __map-to-gradient__ - maps the colors in the supplied (complex) gradient to a grayscaled input.
    [MAP_TO_GRADIENT]: function (requirements) {

        // `getGradientData` - create an imageData object containing the 256 values from a gradient that we require for doing filters work
        const getGradientData = function (gradient) {

            const name = `gradient-data-${gradient.name}`;

            const itemInWorkstore = getWorkstoreItem(name);

            if (!itemInWorkstore || gradient.dirtyFilterIdentifier || gradient.animateByDelta) {

                const mycell = requestCell();

                const {engine, element} = mycell;

                element.width = 256;
                element.height = 1;

                const G = engine.createLinearGradient(0, 0, 255, 0);

                gradient.addStopsToGradient(G, gradient.paletteStart, gradient.paletteEnd, gradient.cyclePalette);

                engine.fillStyle = G;
                engine.fillRect(0, 0, 256, 1);

                const data = engine.getImageData(0, 0, 256, 1).data;

                releaseCell(mycell);

                return setAndReturnWorkstoreItem(name, data);
            }

            return itemInWorkstore || [];
        };

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            useNaturalGrayscale = false,
            lineOut,
        } = requirements;

        let gradient = requirements.gradient || false;
        if (gradient.substring) gradient = styles[gradient];

        if (!gradient) out32.set(src32);
        else {

            const gradBytes = getGradientData(gradient);

            if (!gradBytes || gradBytes.length < 1024) out32.set(src32);
            else {

                const grad32 = new Uint32Array(gradBytes.buffer, gradBytes.byteOffset, 256);

                let sumLUT;
                if (!useNaturalGrayscale) {

                    sumLUT = getWorkstoreItem(NAIVE_GRAY_LUT);

                    if (!sumLUT) {

                        sumLUT = new Uint8Array(766);

                        for (let s = 0; s <= 765; s++) {

                            sumLUT[s] = Math.floor(0.3333 * s) & 0xFF;
                        }
                        setWorkstoreItem(NAIVE_GRAY_LUT, sumLUT);
                    }
                }

                let p, pz, s, a, r, g, b, gray, sum;

                for (p = 0, pz = src32.length | 0; p < pz; p++) {

                    s = src32[p];
                    a = (s >>> 24) & 0xFF;

                    if (a === 0) {

                        out32[p] = s;
                        continue;
                    }

                    r = s & 0xFF;
                    g = (s >>> 8) & 0xFF;
                    b = (s >>> 16) & 0xFF;

                    if (useNaturalGrayscale) gray = (r * 54 + g * 183 + b * 19) >> 8;
                    else {

                        sum = r + g + b;
                        gray = sumLUT[sum];
                    }
                    out32[p] = grad32[gray];
                }
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __matrix__ - Performs a matrix operation on each pixel's channels, calculating the new value using neighbouring pixel weighted values. Also known as a convolution matrix, kernel or mask operation.
// + The matrix dimensions can be set using the `width` and `height` arguments
// + Defining the home pixel's position within the matrix can be set using the `offsetX` and `offsetY` arguments.
// + The weights to be applied need to be supplied in the `weights` argument - an Array listing the weights row-by-row starting from the top-left corner of the matrix.
// + By default all color channels are included in the calculations while the alpha channel is excluded.
//
// Note: When using the `premultiply` option, the filter operates in premultiplied-alpha space and normalizes color values by the total alpha contribution of the kernel.
// + This works best for smoothing or blur kernels (where all weights are positive and sum to 1).
// + For edge-detection or high-pass kernels (where weights sum near zero or include negatives), `premultiply` can produce unpredictable results and should generally be left false.
//
// The 'edgeDetect', 'emboss' and 'sharpen' convenience filter methods all use the matrix action, pre-setting the required weights.
    [MATRIX]: function (requirements) {

        const getMatrixOffsetsPx = function (mWidth, mHeight, mX, mY, image) {

            if (!image) image = cache.source;

            const iWidth  = image.width  | 0,
                iHeight = image.height | 0;

            mWidth = (_isFinite(mWidth) && mWidth  > 0) ? (mWidth | 0) : 1;
            mHeight = (_isFinite(mHeight) && mHeight > 0) ? (mHeight | 0) : 1;

            mX = (_isFinite(mX) ? mX : 0) | 0;
            if (mX < 0) mX = 0;
            else if (mX >= mWidth)  mX = mWidth  - 1;

            mY = (_isFinite(mY) ? mY : 0) | 0;
            if (mY < 0) mY = 0;
            else if (mY >= mHeight) mY = mHeight - 1;

            const name = `matrix-offsets-px-${iWidth}-${iHeight}-${mWidth}-${mHeight}-${mX}-${mY}`;

            let res = getWorkstoreItem(name);
            if (res) return res;

            res = new Int32Array(mWidth * mHeight);

            let p = 0, y, x, yz, xz, rowOff;

            for (y = -mY, yz = mHeight - mY; y < yz; y++) {

                rowOff = y * iWidth;

                for (x = -mX, xz = mWidth - mX; x < xz; x++) {

                    res[p++] = rowOff + x;
                }
            }
            setWorkstoreItem(name, res);
            return res;
        };

        const [input, output] = getInputAndOutputLines(requirements),
            iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

        const pixels = src32.length;

        const {
            opacity = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = false,
            premultiply = false,
            useInputAsMask = false,
            offsetX = 1,
            offsetY = 1,
            lineOut,
        } = requirements;

        let mW = requirements.width;
        if (!_isFinite(mW) || mW < 1) {

            mW = 3; mW |= 0;
        }

        let mH = requirements.height;
        if (!_isFinite(mH) || mH < 1) {

            mH = 3;
            mH |= 0;
        }

        let aX = (_isFinite(offsetX) ? offsetX : 0) | 0;
        if (aX < 0) aX = 0;
        else if (aX >= mW) aX = mW - 1;

        let aY = (_isFinite(offsetY) ? offsetY : 0) | 0;
        if (aY < 0) aY = 0;
        else if (aY >= mH) aY = mH - 1;

        let weights = requirements.weights;
        if (!weights || weights.length !== (mW * mH)) {

            weights = new Float32Array(mW * mH);
            weights[(aY * mW) + aX] = 1;
        }
        else if (!(weights instanceof Float32Array)) {

            weights = Float32Array.from(weights);
        }

        const nzIdx = requestArray(),
              nzW   = requestArray();

        for (let i = 0, iz = weights.length, w; i < iz; i++) {

            w = weights[i];

            if (w !== 0) {

                nzIdx.push(i);
                nzW.push(w);
            }
        }

        const nzCount = nzIdx.length;

        if (nzCount === 0) {

            out32.set(src32);

            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);

            releaseArray(nzIdx, nzW);

            return;
        }

        const offsPx = getMatrixOffsetsPx(mW, mH, aX, aY, input);

        if (premultiply) {

            const eps = 1e-6;

            let sumW = 0,
                center, aCenter,
                accR, accG, accB, accA,
                t, i, k, w, di, idx, px, r, g, b, a,
                oR, oG, oB, oA, invA;

            for (t = 0; t < nzCount; t++) {

                sumW += nzW[t];
            }

            if (sumW === 0) sumW = 1;

            for (i = 0; i < pixels; i++) {

                center = src32[i];
                aCenter = (center >>> 24) & 0xFF;

                accR = 0;
                accG = 0;
                accB = 0;
                accA = 0;

                // Sum neighbors
                for (k = 0; k < nzCount; k++) {

                    w  = nzW[k];
                    di = offsPx[nzIdx[k]];

                    // Wrap like original code
                    idx = i + di;
                    if (idx < 0) idx += pixels;
                    else if (idx >= pixels) idx -= pixels;

                    px = src32[idx];

                    a = (px >>> 24) & 0xFF;
                    if (a === 0) continue;

                    r = px & 0xFF;
                    g = (px >>> 8) & 0xFF;
                    b = (px >>> 16) & 0xFF;

                    if (includeRed) accR += (r * a) * w;
                    if (includeGreen) accG += (g * a) * w;
                    if (includeBlue) accB += (b * a) * w;

                    accA += a * w;
                }

                if (accA <= eps) {

                    oR = 0;
                    oG = 0;
                    oB = 0;
                    oA = useInputAsMask ? aCenter : 0;
                }
                else {

                    invA = 1 / accA;
                    oR = includeRed ? (accR * invA) : (center & 0xFF);
                    oG = includeGreen ? (accG * invA) : ((center >>> 8) & 0xFF);
                    oB = includeBlue ? (accB * invA) : ((center >>> 16) & 0xFF);
                    oA = useInputAsMask ? aCenter : (accA / sumW);
                }

                out32[i] = ((oA & 0xFF) << 24) | ((oB & 0xFF) << 16) | ((oG & 0xFF) <<  8) | (oR & 0xFF);
            }
        }
        else {

            let i, center, aCenter,
                oR, oG, oB, oA,
                k, w, di, idx, px;

            for (i = 0; i < pixels; i++) {

                center = src32[i];
                aCenter = (center >>> 24) & 0xFF;

                if (aCenter === 0) {

                    out32[i] = center;
                    continue;
                }

                oR = includeRed ? 0 : (center & 0xFF);
                oG = includeGreen ? 0 : ((center >>> 8) & 0xFF);
                oB = includeBlue ? 0 : ((center >>> 16) & 0xFF);
                oA = includeAlpha ? 0 : aCenter;

                for (k = 0; k < nzCount; k++) {

                    w  = nzW[k];
                    di = offsPx[nzIdx[k]];

                    idx = i + di;
                    if (idx < 0) idx += pixels;
                    else if (idx >= pixels) idx -= pixels;

                    px = src32[idx];

                    if (includeRed) oR += (px & 0xFF) * w;
                    if (includeGreen) oG += ((px >>> 8) & 0xFF) * w;
                    if (includeBlue) oB += ((px >>> 16) & 0xFF) * w;
                    if (includeAlpha) oA += ((px >>> 24) & 0xFF) * w;
                }

                oR = oR < 0 ? 0 : oR > 255 ? 255 : oR;
                oG = oG < 0 ? 0 : oG > 255 ? 255 : oG;
                oB = oB < 0 ? 0 : oB > 255 ? 255 : oB;
                oA = oA < 0 ? 0 : oA > 255 ? 255 : oA;

                out32[i] = ((oA & 0xFF) << 24) | ((oB & 0xFF) << 16) | ((oG & 0xFF) <<  8) | (oR & 0xFF);
            }
        }

        releaseArray(nzIdx, nzW);

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// modify-ok-channels__ - Adds a value to each of the OKLAB channels. Note that: the `L` (luminance) channel controls brightness, and will be a value between `0.0` (black) and `1.0` (white); the `A` (red-green) channel controls red-green hues - values range from `-0.4` (full green) to `+0.4` (full red); the `B` (yellow-blue) channel controls yellow-blue hues - values range from `-0.4` (full blue) to `+0.4` (full yellow).
    [MODIFY_OK_CHANNELS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            channelA = 0,
            channelB = 0,
            channelL = 0,
            lineOut,
        } = requirements;

        if (channelL === 0 && channelA === 0 && channelB === 0) out32.set(src32);
        else {

            const libs = colorEngine.getRgbOkCache(),
                getOk = colorEngine.getOkValsForRgb,
                toRgb = colorEngine.getRgbValsForOklab;

            const clamp01 = (v) => (v < 0 ? 0 : (v > 1 ? 1 : v));
            const clampAB = (v) => (v < -0.4 ? -0.4 : (v > 0.4 ? 0.4 : v));

            let p, pz, s, a, r0, g0, b0, ok, L, A, B, rgb;

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                s = src32[p];

                a = (s >>> 24) & 0xff;
                if (a === 0) {

                    out32[p] = s;
                    continue;
                }

                r0 = s & 0xff;
                g0 = (s >>> 8) & 0xff;
                b0 = (s >>> 16) & 0xff;

                ok = getOk(r0, g0, b0, libs);

                L = clamp01(ok[0] + channelL);
                A = clampAB(ok[1] + channelA);
                B = clampAB(ok[2] + channelB);

                rgb = toRgb(L, A, B, libs);

                out32[p] = ((a << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __modulate-channels__ - Multiplies each channel's value by the supplied argument value. A channel-argument's value of '0' will set that channel's value to zero; a value of '1' will leave the channel value unchanged. If the "saturation" flag is set to 'true' the calculation changes to start at that pixel's grayscale values. The 'brightness' and 'saturation' filters are special forms of the 'channels' filter which use a single "levels" argument to set all three color channel arguments to the same value.
    [MODULATE_CHANNELS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            red = 1,
            green = 1,
            blue = 1,
            alpha = 1,
            saturation = false,
            lineOut,
        } = requirements;

        // Convert scales to 8.8 fixed-point (round to nearest)
        const rK = (red * 256 + 0.5) | 0,
            gK = (green * 256 + 0.5) | 0,
            bK = (blue * 256 + 0.5) | 0,
            aK = (alpha * 256 + 0.5) | 0;

        let p, pz, rgba, r, g, b, a;

        if (!saturation && rK === 256 && gK === 256 && bK === 256 && aK === 256) out32.set(src32);

        else if (!saturation) {

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                rgba = src32[p];

                r = rgba & 0xff;
                g = (rgba >>> 8) & 0xff;
                b = (rgba >>> 16) & 0xff;
                a = (rgba >>> 24) & 0xff;

                r = (r * rK + 128) >> 8;
                if (r < 0) r = 0;
                else if (r > 255) r = 255;

                g = (g * gK + 128) >> 8;
                if (g < 0) g = 0;
                else if (g > 255) g = 255;

                b = (b * bK + 128) >> 8;
                if (b < 0) b = 0;
                else if (b > 255) b = 255;

                a = (a * aK + 128) >> 8;
                if (a < 0) a = 0;
                else if (a > 255) a = 255;

                out32[p] = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
            }
        }
        else {

            let r0, g0, b0, gray;

            // Saturation mode: start from gray, then lerp toward original per channel
            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                rgba = src32[p];

                r0 = rgba & 0xff;
                g0 = (rgba >>> 8) & 0xff;
                b0 = (rgba >>> 16) & 0xff;
                a  = (rgba >>> 24) & 0xff;

                gray = (r0 * 54 + g0 * 183 + b0 * 19) >> 8;

                r = gray + (((r0 - gray) * rK + 128) >> 8);
                g = gray + (((g0 - gray) * gK + 128) >> 8);
                b = gray + (((b0 - gray) * bK + 128) >> 8);
                a = (a * aK + 128) >> 8;

                if (r < 0) r = 0;
                else if (r > 255) r = 255;

                if (g < 0) g = 0;
                else if (g > 255) g = 255;

                if (b < 0) b = 0;
                else if (b > 255) b = 255;

                if (a < 0) a = 0;
                else if (a > 255) a = 255;

                out32[p] = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __modulate-ok-channels__ - Multiplies each of the OKLAB channels by a given amount. Note that: the `L` (luminance) channel controls brightness, and will be a value between `0.0` (black) and `1.0` (white); the `A` (red-green) channel controls red-green hues - values range from `-0.4` (full green) to `+0.4` (full red); the `B` (yellow-blue) channel controls yellow-blue hues - values range from `-0.4` (full blue) to `+0.4` (full yellow).
    [MODULATE_OK_CHANNELS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            channelA = 1,
            channelB = 1,
            channelL = 1,
            lineOut,
        } = requirements;

        // Fast identity
        if (channelL === 1 && channelA === 1 && channelB === 1) out32.set(src32);
        else {

            const libs = colorEngine.getRgbOkCache(),
                getOk  = colorEngine.getOkValsForRgb,
                toRgb  = colorEngine.getRgbValsForOklab;

            const clamp01 = (v) => (v < 0 ? 0 : (v > 1 ? 1 : v)),
                clampAB = (v) => (v < -0.4 ? -0.4 : (v > 0.4 ? 0.4 : v));

            let p, pz, s, a, r0, g0, b0, ok, L, A, B, rgb;

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                s = src32[p];

                a = (s >>> 24) & 0xff;

                if (a === 0) {

                    out32[p] = s;
                    continue;
                }

                r0 = s & 0xff;
                g0 = (s >>> 8) & 0xff;
                b0 = (s >>> 16) & 0xff;

                ok = getOk(r0, g0, b0, libs);

                L = clamp01(ok[0] * channelL);
                A = clampAB(ok[1] * channelA);
                B = clampAB(ok[2] * channelB);

                rgb = toRgb(L, A, B, libs);

                out32[p] = ((a << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __negative__ - for each pixel: convert to OKLAB; negate A and B; invert L; convert back to RGB
    [NEGATIVE]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        const libs = colorEngine.getRgbOkCache(),
            getOk  = colorEngine.getOkValsForRgb,
            toRgb  = colorEngine.getRgbValsForOklab;

        let p, pz, rgba, r, g, b, a, ok, L, A, B, rgb;

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];

            r = rgba & 0xFF;
            g = (rgba >>> 8) & 0xFF;
            b = (rgba >>> 16) & 0xFF;
            a = (rgba >>> 24) & 0xFF;

            if (a === 0) {

                out32[p] = rgba;
                continue;
            }

            ok = getOk(r, g, b, libs);

            L = 1 - ok[0];
            A = -ok[1];
            B = -ok[2];

            rgb = toRgb(L, A, B, libs);

            out32[p] = ((a << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __newsprint__ - Attempts to simulate a black-white dither effect similar to newsprint
    [NEWSPRINT]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
              oData = output.data;

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        let w = _floor(requirements.width || 1);
        if (w < 1) w = 1;

        const tDim = w << 1,
            width  = input.width | 0,
            rowStride = width << 2;

        const rects = buildTileRects(tDim, tDim, 0, 0, input);

        const gVal = colorEngine.getBestGray,
            patterns = newspaperPatterns;

        let t, x0, x1, y0, y1, tw, th, count, sum, y, idx, end, avg, p, p0, p1, p2, p3, ox, oy, topBand, rowBase, x, leftBand, gray;

        for (t = 0; t < rects.length; t += 4) {

            x0 = rects[t];
            y0 = rects[t + 1];
            x1 = rects[t + 2];
            y1 = rects[t + 3];

            tw = x1 - x0;
            th = y1 - y0;
            count = tw * th;

            sum = 0;

            for (y = y0; y < y1; y++) {

                idx = (y * rowStride) + (x0 << 2);
                end = idx + (tw << 2);

                for (; idx < end; idx += 4) {

                    sum += gVal(iData[idx], iData[idx + 1], iData[idx + 2]);
                }
            }
            avg = sum / count;

            p = patterns[_min(12, _floor((avg / 255) * 13))];

            p0 = p[0];
            p1 = p[1];
            p2 = p[2];
            p3 = p[3];

            ox = _floor(x0 / tDim) * tDim;
            oy = _floor(y0 / tDim) * tDim;

            for (y = y0; y < y1; y++) {

                topBand = ((y - oy) < w);
                rowBase = (y * rowStride);

                for (x = x0; x < x1; x++) {

                    leftBand = ((x - ox) < w);
                    gray = topBand ? (leftBand ? p0 : p1) : (leftBand ? p2 : p3);

                    idx = rowBase + (x << 2);

                    oData[idx] = gray;
                    oData[idx + 1] = gray;
                    oData[idx + 2] = gray;
                    oData[idx + 3] = iData[idx + 3];
                }
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __offset__ - Offset the input image in the output image.
    [OFFSET]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            width  = input.width  | 0,
            height = input.height | 0;


        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            offsetRedX = 0,
            offsetRedY = 0,
            offsetGreenX = 0,
            offsetGreenY = 0,
            offsetBlueX = 0,
            offsetBlueY = 0,
            useInputAsMask = false,
            lineOut,
        } = requirements;

        if (!(offsetRedX || offsetGreenX || offsetBlueX || offsetRedY || offsetGreenY || offsetBlueY)) out32.set(src32);

        else {

            const rowStridePx = width | 0;

            const simple = offsetRedX === offsetGreenX && offsetRedX === offsetBlueX && offsetRedY === offsetGreenY && offsetRedY === offsetBlueY;

            // Simple sub-branch - user requires all pixels (including alpha) to be shifted across the canvas by given x/y values (very fast)
            if (simple) {

                const dx = offsetRedX | 0,
                    dy = offsetRedY | 0,
                    xStart = dx < 0 ? -dx : 0,
                    xEnd = dx > 0 ? width - dx : width,
                    n = (xEnd - xStart) | 0;

                if (n > 0) {

                    let y, ty, srcRowBase, destRowBase;

                    for (y = 0; y < height; y++) {

                        ty = y + dy;
                        if (ty < 0 || ty >= height) continue;

                        if (n <= 0) continue;

                        srcRowBase = (y  * rowStridePx + xStart) | 0;
                        destRowBase = (ty * rowStridePx + xStart + dx) | 0;

                        // copy whole run of pixels
                        out32.set(src32.subarray(srcRowBase, srcRowBase + n), destRowBase);
                    }
                }
            }

            // Default sub-branch. Need to move pixels values on a per-channel basis
            else {

                out32.fill(0);

                const copyChannel = (dx, dy, shift) => {

                    dx |= 0; dy |= 0;

                    if (dx === 0 && dy === 0) {

                        const cm  = (0xFF << shift) >>> 0,
                            ncm = (~cm) >>> 0;

                        let p, pz, s, v, merged, inA, outA, a;

                        for (p = 0, pz = src32.length | 0; p < pz; p++) {

                            s = src32[p];
                            v = out32[p];

                            merged = (v & ncm) | (s & cm);

                            inA  = (s >>> 24) & 0xFF;
                            outA = (v >>> 24) & 0xFF;
                            a    = inA > outA ? inA : outA;

                            out32[p] = (merged & 0x00FFFFFF) | (a << 24);
                        }
                        return;
                    }

                    const cm = (0xFF << shift) >>> 0,
                        ncm = (~cm) >>> 0;

                    let y, ty, xStart, xEnd, n, src, dst, v, s, merged, k, inA, outA, a;

                    for (y = 0; y < height; y++) {

                        ty = y + dy;
                        if (ty < 0 || ty >= height) continue;

                        xStart = dx < 0 ? -dx : 0;
                        xEnd = dx > 0 ? width - dx : width;
                        n = (xEnd - xStart) | 0;

                        if (n <= 0) continue;

                        src = (y * rowStridePx + xStart) | 0;
                        dst = (ty * rowStridePx + xStart + dx) | 0;

                        for (k = 0; k < n; k++, src++, dst++) {

                            v = out32[dst];
                            s = src32[src];

                            merged = (v & ncm) | (s & cm);

                            inA  = (s >>> 24) & 0xFF;
                            outA = (v >>> 24) & 0xFF;
                            a = inA > outA ? inA : outA;

                            out32[dst] = (merged & 0x00FFFFFF) | (a << 24);
                        }
                    }
                };

                copyChannel(offsetRedX, offsetRedY, 0);
                copyChannel(offsetGreenX, offsetGreenY, 8);
                copyChannel(offsetBlueX, offsetBlueY, 16);
            }

            if (useInputAsMask) {

                const pixelCount = src32.length;
                let p, s;

                for (p = 0; p < pixelCount; p++) {

                    s = src32[p];
                    if ((s >>> 24) === 0) out32[p] = 0;
                }
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __pixelate__ - Pixelizes the input image by creating a grid of tiles across it and then averaging the color values of each pixel in a tile and setting its value to the average. Tile width and height, and their offset from the top left corner of the image, are set via the "tileWidth", "tileHeight", "offsetX" and "offsetY" arguments.
    [PIXELATE]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            tileWidth = 1,
            tileHeight = 1,
            offsetX = 0,
            offsetY = 0,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = false,
            lineOut,
        } = requirements;

        const width  = input.width | 0,
            rowStride = width << 2;

        if (!includeRed && !includeGreen && !includeBlue && !includeAlpha) transferDataUnchanged(oData, iData, len);
        else {

            const rects = buildTileRects(tileWidth, tileHeight, offsetX, offsetY, input);

            let t, x0, x1, y0, y1, w, h, count, sumR, sumG, sumB, sumA, idx, end, avgR, avgG, avgB, avgA, y, start, p;

            // Process each tile
            for (t = 0; t < rects.length; t += 4) {

                x0 = rects[t];
                y0 = rects[t + 1];
                x1 = rects[t+2];
                y1 = rects[t + 3];

                w = x1 - x0;
                h = y1 - y0;
                count = w * h;

                sumR = 0;
                sumG = 0;
                sumB = 0;
                sumA = 0;

                if (includeRed || includeGreen || includeBlue || includeAlpha) {

                    for (y = y0; y < y1; y++) {

                        idx = (y * rowStride) + (x0 << 2);
                        end = idx + (w << 2);

                        if (includeRed && includeGreen && includeBlue && includeAlpha) {

                            // Fast path: accumulate all 4 channels
                            for (; idx < end; idx += 4) {

                                sumR += iData[idx];
                                sumG += iData[idx + 1];
                                sumB += iData[idx + 2];
                                sumA += iData[idx + 3];
                            }
                        } else {

                            // Selective accumulation
                            for (; idx < end; idx += 4) {

                                if (includeRed) sumR += iData[idx];
                                if (includeGreen) sumG += iData[idx + 1];
                                if (includeBlue) sumB += iData[idx + 2];
                                if (includeAlpha) sumA += iData[idx + 3];
                            }
                        }
                    }
                }

                avgR = includeRed ? _floor(sumR / count) : 0;
                avgG = includeGreen ? _floor(sumG / count) : 0;
                avgB = includeBlue ? _floor(sumB / count) : 0;
                avgA = includeAlpha ? _floor(sumA / count) : 0;

                for (y = y0; y < y1; y++) {

                    start = (y * rowStride) + (x0 << 2);
                    end = start + (w << 2);

                    oData.set(iData.subarray(start, end), start);

                    if (includeRed || includeGreen || includeBlue || includeAlpha) {

                        p = start;

                        if (includeRed && includeGreen && includeBlue && includeAlpha) {

                            for (; p < end; p += 4) {

                                oData[p] = avgR;
                                oData[p + 1] = avgG;
                                oData[p + 2] = avgB;
                                oData[p + 3] = avgA;
                            }
                        }
                        else {

                            for (; p < end; p += 4) {

                                if (includeRed) oData[p] = avgR;
                                if (includeGreen) oData[p + 1] = avgG;
                                if (includeBlue) oData[p + 2] = avgB;
                                if (includeAlpha) oData[p + 3] = avgA;
                            }
                        }
                    }
                }
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __process-image__ - expects preprocessor to have stored an ImageData in the workstore under `identifier`.
    [PROCESS_IMAGE]: function (requirements) {

        const { identifier, lineOut } = requirements;
        if (!(lineOut && lineOut.substring && lineOut.length)) return;

        const item = getWorkstoreItem(identifier);

        // Fall back to host-sized transparent if missing
        const {
            width: hostW,
            height: hostH,
        } = cache.source;

        if (item && item.width === hostW && item.height === hostH) {

            // Use as-is (no clone): downstream filters treat this as read-only input
            cache[lineOut] = item;
        }
        else {

            // Make an empty host-sized image and, if we have something, place what we can
            const out = new ImageData(hostW, hostH);

            if (item && item.data && item.width && item.height) {

                // Clamp the copy in case sizes differ (shouldn’t happen with the new preprocessor)
                const w = _min(hostW, item.width) | 0,
                    h = _min(hostH, item.height) | 0,
                    src = item.data,
                    dst = out.data,
                    srcStride = item.width << 2,
                    dstStride = hostW << 2,
                    rowBytes  = w << 2;

                let s0, d0;

                for (let y = 0; y < h; y++) {

                    s0 = (y * srcStride);
                    d0 = (y * dstStride);

                    dst.set(src.subarray(s0, s0 + rowBytes), d0);
                }
            }
            cache[lineOut] = out;
        }
    },

// __random-noise__ - Swap pixels at random within a given box (width/height) distance of each other, dependent on the level setting - lower levels mean less noise. Uses a pseudo-random numbers generator to ensure consistent results across runs. Takes into account choices to include red, green, blue and alpha channels, and whether to ignore transparent pixels
    [RANDOM_NOISE]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            width  = input.width | 0;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            width: boxW = 1,
            height: boxH = 1,
            level = 0.5,
            seed = DEFAULT_SEED,
            noiseType = RANDOM,
            noWrap = false,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = true,
            excludeTransparentPixels = true,
            lineOut,
        } = requirements;

        const totalPx = src32.length | 0;

        const rnd = getRandomNumbers({
            seed,
            length: Math.ceil(totalPx * 3),
            imgWidth: width,
            type: noiseType,
        });

        let rp = 0;

        const halfW = boxW * 0.5,
            halfH = boxH * 0.5;

        const incMask = (includeRed ? 0x000000FF : 0) | (includeGreen ? 0x0000FF00 : 0) | (includeBlue ? 0x00FF0000 : 0) | (includeAlpha ? 0xFF000000 : 0);

        if (incMask === 0xFFFFFFFF >>> 0) {

            let p, pz, rLevel, rWx, rHy, t, sPix, dw, dh, q, aP, aQ;

            for (p = 0, pz = totalPx; p < pz; p++) {

                if (noiseType === RANDOM) {

                    rLevel = rnd[rp++];
                    rWx = rnd[rp++];
                    rHy = rnd[rp++];
                }
                else {

                    t = rnd[rp++];
                    rLevel = t;
                    rWx = t;
                    rHy = t;
                }

                sPix = src32[p];

                if (rLevel >= level) {

                    out32[p] = sPix;
                    continue;
                }

                dw = _floor(rWx * boxW - halfW) | 0;
                dh = _floor(rHy * boxH - halfH) | 0;

                q = p + dh * width + dw;

                if (noWrap) {

                    if (q < 0 || q >= totalPx) {

                        out32[p] = sPix;
                        continue;
                    }
                }
                else {

                    if (q < 0) q += totalPx;
                    else if (q >= totalPx) q -= totalPx;
                }

                if (excludeTransparentPixels) {

                    aP = (sPix >>> 24) & 0xFF;
                    aQ = (src32[q] >>> 24) & 0xFF;

                    if (aP === 0 || aQ === 0) {

                        out32[p] = sPix;
                        continue;
                    }
                }
                out32[p] = src32[q];
            }
        }

        // General path: merge selected bytes from sampled pixel into original
        else {

            const notIncMask = (~incMask) >>> 0;

            let p, pz, rLevel, rWx, rHy, t, orig, dw, dh, q, aP, aQ, sampled;

            for (p = 0, pz = totalPx; p < pz; p++) {

                if (noiseType === RANDOM) {

                    rLevel = rnd[rp++];
                    rWx = rnd[rp++];
                    rHy = rnd[rp++];
                }
                else {

                    t = rnd[rp++];
                    rLevel = t;
                    rWx = t;
                    rHy = t;
                }

                orig = src32[p];

                if (rLevel >= level) {

                    out32[p] = orig;
                    continue;
                }

                dw = _floor(rWx * boxW - halfW) | 0;
                dh = _floor(rHy * boxH - halfH) | 0;

                q = p + dh * width + dw;

                if (noWrap) {

                    if (q < 0 || q >= totalPx) {

                        out32[p] = orig;
                        continue;
                    }
                }
                else {

                    if (q < 0) q += totalPx;
                    else if (q >= totalPx) q -= totalPx;
                }

                if (excludeTransparentPixels) {

                    aP = (orig >>> 24) & 0xFF;
                    aQ = (src32[q] >>> 24) & 0xFF;

                    if (aP === 0 || aQ === 0) {

                        out32[p] = orig;
                        continue;
                    }
                }

                sampled = src32[q];

                out32[p] = (orig & notIncMask) | (sampled & incMask);
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __reducePalette__ - Reduce the number of colors in its palette. The `palette` attribute can be: a Number (for the commonest colors);  an Array of CSS color Strings to use as the palette; or  the String name of a pre-defined palette - default: 'black-white'
    [REDUCE_PALETTE]: function (requirements) {

        const getRGBIndex = (r, g, b) => (r * _256_SQUARE) + (g * _256) + b;

        // Filter generics
        const [input, output] = getInputAndOutputLines(requirements),
            iData = input.data,
            iWidth = input.width,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            seed = DEFAULT_SEED,
            useBluenoise = false,
            minimumColorDistance = 500,
            lineOut,
        } = requirements;

        let { palette = BLACK_WHITE } = requirements;

        // Legacy
        const noiseType = useBluenoise ? BLUENOISE : (requirements.noiseType || RANDOM);

        const libs = colorEngine.getRgbOkCache();

        // Dither noise (one per pixel)
        const rnd = getRandomNumbers({
            seed,
            length: len / 4,
            imgWidth: iWidth,
            type: noiseType,
        });

        let rndCursor = -1;

        // Validate palette
        if (palette == null) palette = BLACK_WHITE;
        else if (palette.substring && !predefinedPalette[palette]) palette = BLACK_WHITE;
        else if (_isArray(palette) && palette.length < 2) palette = BLACK_WHITE;
        else if (palette.toFixed && (palette < 2 || palette > 256)) palette = BLACK_WHITE;

        const isGray = GRAY_PALETTES.includes(palette);
        const isArrayPalette = _isArray(palette);

        const BTPRes = [0, 0, 0, 0];
        const bestTwoPaletteIndices = (ILi, IAi, IBi, pal) => {

            let i0 = -1,
                i1 = -1,
                d0 = Infinity,
                d1 = Infinity,
                p, pz, e, dL, dA, dB, dsq;

            for (p = 0, pz = pal.length; p < pz; p++) {

                e = pal[p];
                dL = ILi - e[4];
                dA = IAi - e[5];
                dB = IBi - e[6];
                dsq = (dL * dL) + (dA * dA) + (dB * dB);

                if (dsq < d0) {

                    d1 = d0;
                    i1 = i0;
                    d0 = dsq;
                    i0 = p;
                }
                else if (dsq < d1) {

                    d1 = dsq;
                    i1 = p;
                }
            }

            BTPRes[0] = i0;
            BTPRes[1] = i1;
            BTPRes[2] = d0;
            BTPRes[3] = d1;

            return BTPRes;
        }

        // Grayscale palettes
        if (isGray) {

            const selectedPalette = predefinedPalette[palette],
                P = selectedPalette.length,
                getGray = colorEngine.getBestGray;

            let i, a, alpha, r, g, b, gray, idx0, idx1,
                d0, d1, pi, pv, d, total, propensity, test, chosen;

            for (i = 0; i < len; i += 4) {

                r = i;
                g = r + 1;
                b = g + 1;
                a = b + 1;

                alpha = iData[a];

                if (alpha) {

                    gray = getGray(iData[r], iData[g], iData[b]);

                    // track best two without building arrays/sorting
                    idx0 = -1;
                    idx1 = -1;
                    d0 = Infinity;
                    d1 = Infinity;

                    for (pi = 0; pi < P; pi++) {

                        pv = selectedPalette[pi];
                        d = _abs(pv - gray);

                        if (d < d0) {

                            d1 = d0;
                            idx1 = idx0;
                            d0 = d;
                            idx0 = pi;
                        }
                        else if (d < d1) {

                            d1 = d;
                            idx1 = pi;
                        }

                        // short-circuit for ordered palettes (G8/G16): if distances increase, we can break
                        if (pi && d >= d1) break;
                    }

                    total = d0 + d1;
                    propensity = total - d0;
                    test = rnd[++rndCursor] * total;
                    chosen = (test < propensity) ? selectedPalette[idx0] : selectedPalette[idx1];

                    oData[r] = chosen;
                    oData[g] = chosen;
                    oData[b] = chosen;
                    oData[a] = alpha;
                }
                else {

                    ++rndCursor;
                    oData[r] = iData[r];
                    oData[g] = iData[g];
                    oData[b] = iData[b];
                    oData[a] = 0;
                }
            }

            setLastUsedReducePalette(palette);

            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);

            return;
        }

        // Array-of-colors palette
        if (isArrayPalette) {

            const name = palette.join(ARG_SPLITTER);

            let selectedPalette = predefinedPalette[name];

            let i, iz, a, alpha, r, g, b, ok,
                ILi, IAi, IBi, idx0, idx1, d0, d1,
                total, propensity, test, chosen;

            if (!selectedPalette) {

                selectedPalette = [];

                let eR, eG, eB, PLi, PAi, PBi;

                for (i = 0, iz = palette.length; i < iz; i++) {

                    [eR, eG, eB] = colorEngine.extractRGBfromColorString(palette[i]);

                    ok = colorEngine.getOkValsForRgb(eR, eG, eB, libs);
                    PLi = (ok[0] * 100) | 0;
                    PAi = ((ok[1] + 0.4) * 125) | 0;
                    PBi = ((ok[2] + 0.4) * 125) | 0;

                    selectedPalette.push([0, eR, eG, eB, PLi, PAi, PBi]);
                }
                predefinedPalette[name] = selectedPalette;
            }

            for (i = 0; i < len; i += 4) {

                r = i;
                g = r + 1;
                b = g + 1;
                a = b + 1;

                alpha = iData[a];

                if (alpha) {

                    ok = colorEngine.getOkValsForRgb(iData[r], iData[g], iData[b], libs);

                    ILi = (ok[0] * 100) | 0;
                    IAi = ((ok[1] + 0.4) * 125) | 0;
                    IBi = ((ok[2] + 0.4) * 125) | 0;

                    [idx0, idx1, d0, d1] = bestTwoPaletteIndices(ILi, IAi, IBi, selectedPalette);

                    total = d0 + d1;
                    propensity = total - d0;
                    test = rnd[++rndCursor] * total;

                    chosen = (test < propensity) ? selectedPalette[idx0] : selectedPalette[idx1];

                    oData[r] = chosen[1];
                    oData[g] = chosen[2];
                    oData[b] = chosen[3];
                    oData[a] = alpha;

                }
                else {

                    ++rndCursor;
                    oData[r] = iData[r];
                    oData[g] = iData[g];
                    oData[b] = iData[b];
                    oData[a] = 0;
                }
            }

            setLastUsedReducePalette(palette);

            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);

            return;
        }

        // Commonest colors palette
        const metadata = new Map(),
            seen = [],
            selectedPalette = [];

        let i, iz, a, r, g, b, rgbIndex, row, ok, ILi, IAi, IBi, red, green, blue, alpha,
            best2, j, jz, p, dL, dA, dB, dsq, idx, idx0, idx1,
            d0, d1, total, propensity, rec, test, chosen;

        // 1) collect metadata for observed colors
        for (i = 0; i < len; i += 4) {

            a = i + 3;

            if (!iData[a]) continue;

            red = iData[i];
            green = iData[i + 1];
            blue = iData[i + 2];
            rgbIndex = getRGBIndex(red, green, blue);

            row = metadata.get(rgbIndex);

            if (row) row[0] += 1;
            else {

                ok = colorEngine.getOkValsForRgb(red, green, blue, libs);
                ILi = (ok[0] * 100) | 0;
                IAi = ((ok[1] + 0.4) * 125) | 0;
                IBi = ((ok[2] + 0.4) * 125) | 0;

                metadata.set(rgbIndex, [1, red, green, blue, ILi, IAi, IBi]);

                seen.push(rgbIndex);
            }
        }

        if (seen.length) {
            // 2) commonest first (sort only the seen colors with a minimum count of 2)
            const filteredSeen = seen.filter(item => metadata.get(item)[0] > 1);
            filteredSeen.sort((item1, item2) => metadata.get(item2)[0] - metadata.get(item1)[0]);

            // 3) generate palette, winnowing by minimumColorDistance
            const mapped = minimumColorDistance * 0.01,
                minDist2 = mapped * mapped;

            selectedPalette.push(requestArray(...metadata.get(filteredSeen[0])));

            for (i = 1, iz = filteredSeen.length; i < iz; i++) {

                if (selectedPalette.length >= palette) break;

                row = metadata.get(filteredSeen[i]);

                best2 = Infinity;

                for (j = 0, jz = selectedPalette.length; j < jz; j++) {

                    p = selectedPalette[j];
                    dL = row[4] - p[4];
                    dA = row[5] - p[5];
                    dB = row[6] - p[6];
                    dsq = (dL * dL) + (dA * dA) + (dB * dB);

                    if (dsq < best2) best2 = dsq;
                }

                if (best2 > minDist2) selectedPalette.push(requestArray(...row));
            }

            if (selectedPalette.length === 1 && filteredSeen.length > 2) selectedPalette.push(requestArray(...metadata.get(filteredSeen[1])));

            setLastUsedReducePalette(selectedPalette.map(item => `rgb(${item[1]} ${item[2]} ${item[3]})`));

            // 4) for each seen color, precompute its two best palette candidates (store totals/propensity)
            for (i = 0, iz = seen.length; i < iz; i++) {

                idx = seen[i];
                row = metadata.get(idx);

                [idx0, idx1, d0, d1] = bestTwoPaletteIndices(row[4], row[5], row[6], selectedPalette);

                total = d0 + d1;
                propensity = total - d0;

                // Mutate the row with malice aforethought
                row[0] = total;
                row[1] = propensity;
                row[2] = selectedPalette[idx0];
                row[3] = selectedPalette[idx1];
            }

            // 5) apply
            for (i = 0; i < len; i += 4) {

                r = i;
                g = r + 1;
                b = g + 1;
                a = b + 1;

                alpha = iData[a];

                if (alpha) {

                    rgbIndex = getRGBIndex(iData[r], iData[g], iData[b]);

                    rec = metadata.get(rgbIndex);
                    total = rec[0];

                    propensity = rec[1];
                    test = rnd[++rndCursor] * total;
                    chosen = (test < propensity) ? rec[2] : rec[3];

                    oData[r] = chosen[1];
                    oData[g] = chosen[2];
                    oData[b] = chosen[3];
                    oData[a] = alpha;

                } else {

                    ++rndCursor;
                    oData[r] = iData[r];
                    oData[g] = iData[g];
                    oData[b] = iData[b];
                    oData[a] = 0;
                }
            }

            releaseArray(...selectedPalette);
        }

        // Boilerplate post-processing
        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __rotate-hue__ - for each pixel, converts the pixel to OKLCH, rotates the hue value by the given amount and converts back to RGB
    [ROTATE_HUE]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        let { angle = 0 } = requirements;

        angle = ((angle % 360) + 360) % 360;

        if (angle === 0) out32.set(src32);
        else {

            const libs = colorEngine.getRgbOkCache(),
                getOk = colorEngine.getOkValsForRgb,
                toRgb = colorEngine.getRgbValsForOklch;

            const CHROMA_EPS = 1e-4;

            let rgba, r, g, b, a, ok, L, C, H, rgb;

            for (let p = 0, pz = src32.length | 0; p < pz; p++) {

                rgba = src32[p];

                a = rgba >>> 24;

                if (a === 0) {

                    out32[p] = rgba;
                    continue;
                }

                r = rgba & 0xFF;
                g = (rgba >>> 8) & 0xFF;
                b = (rgba >>> 16) & 0xFF;

                ok = getOk(r, g, b, libs);

                L = ok[0];
                C = ok[3];

                if (C < CHROMA_EPS) {

                    out32[p] = rgba;
                    continue;
                }

                H = ok[4] + angle;
                if (H >= 360) H -= 360;

                rgb = toRgb(L, C, H, libs);

                out32[p] = ((a << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __set-channel-to-level__ - Sets the value of each pixel's included channel to the value supplied in the "level" argument.
    [SET_CHANNEL_TO_LEVEL]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

        const {
            opacity = 1,
            includeRed = false,
            includeGreen = false,
            includeBlue = false,
            includeAlpha = false,
            level = 0,
            lineOut,
        } = requirements;

        const L = level < 0 ? 0 : level > 255 ? 255 : (level | 0);

        const Rm = includeRed   ? 0x000000FF : 0,
            Gm = includeGreen ? 0x0000FF00 : 0,
            Bm = includeBlue  ? 0x00FF0000 : 0,
            Am = includeAlpha ? 0xFF000000 : 0;

        const clearMask = (~(Rm | Gm | Bm | Am)) >>> 0;

        const setMask = (includeRed ? (L <<  0) : 0) | (includeGreen ? (L <<  8) : 0) | (includeBlue  ? (L << 16) : 0) | (includeAlpha ? ((L & 255) << 24) : 0);

        if ((Rm | Gm | Bm | Am) === 0) {

            for (let p = 0; p < src32.length; p++) {

                out32[p] = src32[p];
            }
        }
        else if ((Rm | Gm | Bm | Am) === 0xFFFFFFFF >>> 0) {

            const constantPixel = setMask >>> 0;

            for (let p = 0; p < out32.length; p++) {

                out32[p] = constantPixel;
            }
        }
        else {

            for (let p = 0, src; p < src32.length; p++) {

                src = src32[p];
                out32[p] = (src & clearMask) | setMask;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __step-channels__ - Takes three divisor values - "red", "green", "blue". For each pixel, its color channel values are divided by the corresponding color divisor, floored to the integer value and then multiplied by the divisor. For example a divisor value of '50' applied to a channel value of '120' will give a result of '100'. The output is a form of posterization.
//
// A new `clamp` attribute was added in v8.7.0, which can take the following String values:
// + `down` (default) - uses `Math.floor()` for the calculation
// + `up` - uses `Math.ceil()` for the calculation
// + `round` - uses `Math.round()` for the calculation
    [STEP_CHANNELS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            red = 1,
            green = 1,
            blue = 1,
            lineOut,
        } = requirements;

        let clamp = requirements.clamp;
        if (!CLAMP_VALUES.includes(clamp)) clamp = DOWN;

        if (red === 1 && green === 1 && blue === 1) out32.set(src32);

        else {

            const makeLUT = (d) => {

                const div = d > 0 ? d : 1;

                if (clamp === DOWN && (div & (div - 1)) === 0) {

                    const mask = ~(div - 1) & 0xFF,
                        lut = new Uint8Array(256);

                    for (let v = 0; v < 256; v++) {

                        lut[v] = v & mask;
                    }
                    return lut;
                }

                const lut = new Uint8ClampedArray(256);

                if (div === 1) {

                    for (let v = 0; v < 256; v++) lut[v] = v;
                    return lut;
                }

                if (clamp === UP) {

                    for (let v = 0; v < 256; v++) {

                        lut[v] = _ceil(v / div) * div;
                    }
                }
                else if (clamp === ROUND) {

                    for (let v = 0; v < 256; v++) {

                        lut[v] = _round(v / div) * div;
                    }
                }
                else {

                    for (let v = 0; v < 256; v++) {

                        lut[v] = _floor(v / div) * div;
                    }
                }
                return lut;
            };

            const lutR = makeLUT(red),
                lutG = (green === red) ? lutR : makeLUT(green),
                lutB = (blue  === red) ? lutR : (blue === green ? lutG : makeLUT(blue));

            let p, pz, rgba, r, g, b, a, nr, ng, nb;

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                rgba = src32[p];

                r = rgba & 0xff;
                g = (rgba >>> 8) & 0xff;
                b = (rgba >>> 16) & 0xff;
                a = (rgba >>> 24) & 0xff;

                nr = lutR[r];
                ng = lutG[g];
                nb = lutB[b];

                out32[p] = ((a << 24) | (nb << 16) | (ng << 8) | nr) >>> 0;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __swirl__ - For each pixel, move the pixel radially according to its distance from a given coordinate and associated angle for that coordinate.
// + This filter can handle multiple swirls in a single pass
    [SWIRL]: function (requirements) {

        const getValue = (val, dim) => (val && val.substring) ? _floor((parseFloat(val) / 100) * dim) : val;

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length,
            iWidth = input.width,
            iHeight = input.height;

        const nPix = (len >>> 2);

        const tData = new Uint8ClampedArray(iData),
            t32 = new Uint32Array(tData.buffer, tData.byteOffset, nPix),
            o32 = new Uint32Array(oData.buffer, oData.byteOffset, nPix);

        const {
            opacity = 1,
            swirls = [],
            transparentEdges = false,
            useInputAsMask   = false,
            lineOut,
        } = requirements || {};

        if (_isArray(swirls) && !swirls.length) transferDataUnchanged(oData, iData, len);
        else {

            // Initial output = original image
            oData.set(iData);

            let s, sz, startX, startY, innerRadius, outerRadius, angle, easing,
                sx, sy, outer, inner, complexLen, x, xz, y, yz,
                e, ename, swirlName, swirlCoords, start, coord,
                iy, ix, distance, srcPixIndex, factor, dx, dy,
                cursor, rowBase, spanPx, offPix,
                destPixIndex, destPx, destA,
                srcPx, srcA,
                movedZero, destZero,
                outPx;

            for (s = 0, sz = swirls.length; s < sz; s++) {

                [startX, startY, innerRadius, outerRadius, angle, easing] = swirls[s];

                sx = getValue(startX,  iWidth);
                sy = getValue(startY,  iHeight);

                outer = getValue(outerRadius, iWidth);
                inner = getValue(innerRadius, iWidth);

                if (inner > outer) {

                    const tmp = inner;
                    inner = outer;
                    outer = tmp;
                }

                complexLen = outer - inner;
                if (complexLen === 0) complexLen = 0.1;

                // Bounding box clamp
                x  = sx - outer;
                if (x < 0) x = 0;

                xz = sx + outer;
                if (xz > iWidth) xz = iWidth;

                y = sy - outer;
                if (y < 0) y = 0;

                yz = sy + outer;
                if (yz > iHeight) yz = iHeight;

                if (x < xz && y < yz && x < iWidth && xz > 0 && y < iHeight && yz > 0) {

                    // Resolve easing
                    e = easing;
                    ename = easing;

                    if (isa_fn(e)) ename = `ude-${e(0)}-${e(0.1)}-${e(0.2)}-${e(0.3)}-${e(0.4)}-${e(0.5)}-${e(0.6)}-${e(0.7)}-${e(0.8)}-${e(0.9)}-${e(1)}`;
                    else e = (null != easeEngines[e]) ? easeEngines[e] : easeEngines['linear'];

                    // transparentEdges affects geometry (wrap vs transparent)
                    swirlName = `swirl-${startX}-${startY}-${innerRadius}-${outerRadius}-${angle}-${ename}-${iWidth}-${iHeight}-${transparentEdges ? 1 : 0}`;

                    swirlCoords = getOrAddWorkstoreItem(swirlName);

                    if (!swirlCoords.length) {

                        start = requestCoordinate();
                        coord = requestCoordinate();

                        start.setFromArray([sx, sy]);

                        for (iy = y; iy < yz; iy++) {

                            for (ix = x; ix < xz; ix++) {

                                const destIndex = (iy * iWidth + ix);

                                distance = coord.set([ix, iy]).subtract(start).getMagnitude();

                                if (distance > outer) srcPixIndex = destIndex;
                                else {

                                    factor = 1;

                                    if (distance >= inner) {

                                        factor = 1 - ((distance - inner) / complexLen);
                                        factor = e(factor);
                                    }

                                    coord.rotate(angle * factor).add(start);

                                    dx = _floor(coord[0]);
                                    dy = _floor(coord[1]);

                                    if (!transparentEdges) {

                                        if (dx < 0) dx += iWidth;
                                        else if (dx >= iWidth) dx -= iWidth;

                                        if (dy < 0) dy += iHeight;
                                        else if (dy >= iHeight) dy -= iHeight;

                                        srcPixIndex = (dy * iWidth + dx) | 0;
                                    }
                                    else {

                                        if (dx < 0 || dx >= iWidth || dy < 0 || dy >= iHeight) srcPixIndex = -1;
                                        else srcPixIndex = (dy * iWidth + dx) | 0;
                                    }
                                }
                                swirlCoords.push(srcPixIndex);
                            }
                        }
                        releaseCoordinate(coord, start);
                    }

                    cursor = 0;

                    for (iy = y; iy < yz; iy++) {

                        rowBase = iy * iWidth;

                        for (ix = x; ix < xz; ix++) {

                            destPixIndex = rowBase + ix;
                            destPx = t32[destPixIndex];
                            destA = (destPx >>> 24) & 0xFF;

                            srcPixIndex = swirlCoords[cursor++];

                            if (!transparentEdges) {

                                srcPx = t32[srcPixIndex];
                                srcA = (srcPx >>> 24) & 0xFF;

                            }
                            else {

                                if (srcPixIndex < 0) {

                                    srcPx = 0;
                                    srcA  = 0;
                                }
                                else {

                                    srcPx = t32[srcPixIndex];
                                    srcA  = (srcPx >>> 24) & 0xFF;
                                }
                            }

                            if (!useInputAsMask) {

                                if (transparentEdges && srcPixIndex < 0) outPx = 0;
                                else outPx = srcPx;

                                o32[destPixIndex] = outPx;
                                continue;
                            }

                            movedZero = (srcA  === 0);
                            destZero = (destA === 0);

                            outPx = destPx;

                            if (!movedZero && !destZero) outPx = srcPx;
                            else if (movedZero && !destZero && transparentEdges) outPx = 0;

                            o32[destPixIndex] = outPx;
                        }
                    }

                    spanPx = (xz - x);

                    for (iy = y; iy < yz; iy++) {

                        offPix = iy * iWidth + x;

                        t32.set(o32.subarray(offPix, offPix + spanPx), offPix);
                    }
                }
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __threshold__ - performs a binary check on each pixel and, according to the result, assigns the pixel to a defined high or low color
// + By default this filter will grayscale the input then, for each pixel, check the color channel values against a `level` argument: pixels with grayscale values above the level value are assigned to the `high` color; otherwise they are updated to the `low` color. The "high" and "low" arguments are `[red, green, blue, alpha]` integer Number Arrays.
// + The convenience function will accept the pseudo-attributes `highRed`, `lowRed` etc in place of the "high" and "low" Arrays.
// + When the `useMixedChannel` flag is set to `false` then the filter will perform the threshold check on each channel in turn; the threshold levels for these per-channel checks are set in the `red`, `green`, `blue` and `alpha` arguments
// + Channels can be excluded from the filter action by setting the `includeRed` etc flags to false
    [THRESHOLD]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

        const {
            opacity = 1,
            low = [0, 0, 0, 0],
            high = [255, 255, 255, 255],
            level = 128,
            red = 128,
            green = 128,
            blue = 128,
            alpha = 128,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = false,
            useMixedChannel = true,
            lineOut,
        } = requirements;

        // Clamp once
        const clamp8 = v => (v < 0 ? 0 : (v > 255 ? 255 : v | 0));

        const lvl = clamp8(level),
            rT = clamp8(red),
            gT = clamp8(green),
            bT = clamp8(blue),
            aT = clamp8(alpha);

        const lowR = clamp8(low[0]),
            lowG = clamp8(low[1]),
            lowB = clamp8(low[2]),
            lowA = clamp8(low[3]),
            highR = clamp8(high[0]),
            highG = clamp8(high[1]),
            highB = clamp8(high[2]),
            highA = clamp8(high[3]);

        let p, pz, rgba, r, g, b, a, ro, go, bo, ao, gray;

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];

            r = rgba & 0xFF;
            g = (rgba >>> 8) & 0xFF;
            b = (rgba >>> 16) & 0xFF;
            a = (rgba >>> 24) & 0xFF;

            if (useMixedChannel) {

                gray = (r * 54 + g * 183 + b * 19) >> 8;

                if (gray < lvl) {

                    ro = includeRed ? lowR  : r;
                    go = includeGreen ? lowG  : g;
                    bo = includeBlue ? lowB  : b;
                    ao = includeAlpha ? lowA  : a;
                }
                else {

                    ro = includeRed ? highR : r;
                    go = includeGreen ? highG : g;
                    bo = includeBlue ? highB : b;
                    ao = includeAlpha ? highA : a;
                }
            }
            else {

                ro = includeRed ? (r < rT ? lowR : highR) : r;
                go = includeGreen ? (g < gT ? lowG : highG) : g;
                bo = includeBlue ? (b < bT ? lowB : highB) : b;
                ao = includeAlpha ? (a < aT ? lowA : highA) : a;
            }
            out32[p] = ((ao << 24) | (bo << 16) | (go << 8) | ro) >>> 0;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __tiles__ - Cover the image with tiles whose color matches the average channel values for the pixels included in each tile. Has a similarity to the `pixelate` filter, but uses a set of coordinate points to generate the tiles which results in a Delauney-like output
// + Four `modes` are supported: 'rect', 'hex', 'random', 'points'
    [TILES]: function (requirements) {

        // Build a compact label map
        const buildGeneralTileLabels = function (requirements, image) {

            if (!image) image = cache.source;

            const iWidth = image.width | 0,
                iHeight = image.height | 0,
                nPix = (iWidth * iHeight) | 0;

            if (!iWidth || !iHeight) return { labels: new Int32Array(0), nTiles: 0, mode: 'rect' };

            const {
                mode = RECT,
                originX = 0,
                originY = 0,
                angle = 0,
                rectWidth = 10,
                rectHeight = 10,
                hexRadius = 5,
                randomCount = 20,
                seed = DEFAULT_SEED,
                pointsData = [],
            } = requirements || {};

            const ox = (_isFinite(originX) ? originX : 0) | 0,
                oy = (_isFinite(originY) ? originY : 0) | 0;

            // Cache key - a small stable key; for "points" we avoid dumping the full array into the key
            let key = `tiles-v2-${mode}-${iWidth}-${iHeight}-${ox}-${oy}-${_round(angle*1000)}-${_round(spiralStrength*10000)}`;
            let w, h, r, c, sd, arr, len;

            if (mode === RECT) {

                w = _max(1, _isFinite(rectWidth) ? rectWidth  | 0 : 1);
                h = _max(1, _isFinite(rectHeight) ? rectHeight | 0 : 1);
                key += `-rect-${w}-${h}`;
            }
            else if (mode === HEX) {

                r = _max(1, _isFinite(hexRadius) ? hexRadius | 0 : 1);
                key += `-hex-${r}`;
            }
            else if (mode === RANDOM) {

                c = _max(10, _isFinite(randomCount) ? randomCount | 0 : 1);
                sd = seed || DEFAULT_SEED;
                key += `-rnd-${c}-${sd}`;
            }
            else if (mode === POINTS) {

                arr = _isArray(pointsData) ? pointsData : [];
                len = (arr && arr.length) | 0;

                // rolling checksum to detect changes cheaply
                let hash = 2166136261 | 0;

                for (let i = 0; i < len; i += _max(1, (len / 64) | 0)) {

                    hash ^= (arr[i] | 0);
                    hash = (hash * 16777619) | 0;
                }
                key += `-pts-${len}-${hash >>> 0}`;
            }

            const cached = getWorkstoreItem(key);
            if (cached) return cached;

            // Utility: inverse rotation (for lattice modes)
            const toRad = angle * _radian,
                cosNeg = _cos(-toRad), sinNeg = _sin(-toRad);

            let warpX, warpY, warpR, warpTheta;

            const applyAngularWarp = (pHold) => {

                if (spiralStrength) {

                    [warpX, warpY] = pHold;

                    warpR = _sqrt(warpX * warpX + warpY * warpY);

                    if (warpR) {

                        warpTheta = _atan2(warpY, warpX);
                        warpTheta += spiralStrength * warpR;

                        pHold[0] = _cos(warpTheta) * warpR;
                        pHold[1] = _sin(warpTheta) * warpR;
                    }
                }
            };

            // Output labels
            const labels = new Int32Array(nPix);

            let nTiles = 0;

            if (mode === RECT) {

                if (w < 1) w = 1;
                if (h < 1) h = 1;

                // Project four corners to grid space to get stable index ranges
                const corners = [[0,0],[iWidth-1,0],[0,iHeight-1],[iWidth-1,iHeight-1]],
                    pHold = [];

                let iMin =  1e9,
                    iMax = -1e9,
                    jMin =  1e9,
                    jMax = -1e9,
                    dx, dy, iIdx, jIdx, ii, jj, p, y, x;

                for (let c = 0; c < 4; c++) {

                    dx = corners[c][0] - ox;
                    dy = corners[c][1] - oy;
                    pHold[0] = cosNeg * dx - sinNeg * dy;
                    pHold[1] = sinNeg * dx + cosNeg * dy;

                    applyAngularWarp(pHold);

                    iIdx = _round(pHold[0] / w - 0.5);
                    jIdx = _round(pHold[1] / h - 0.5);

                    if (iIdx < iMin) iMin = iIdx; if (iIdx > iMax) iMax = iIdx;
                    if (jIdx < jMin) jMin = jIdx; if (jIdx > jMax) jMax = jIdx;
                }

                const nI = (iMax - iMin + 1) | 0,
                    nJ = (jMax - jMin + 1) | 0;

                nTiles = (nI * nJ) | 0;

                p = 0;

                for (y = 0; y < iHeight; y++) {

                    dy = y - oy;

                    for (x = 0; x < iWidth; x++, p++) {

                        dx = x - ox;
                        pHold[0] = cosNeg * dx - sinNeg * dy;
                        pHold[1] = sinNeg * dx + cosNeg * dy;

                        applyAngularWarp(pHold);

                        iIdx = _round(pHold[0] / w - 0.5);
                        jIdx = _round(pHold[1] / h - 0.5);
                        ii = (iIdx - iMin) | 0;
                        jj = (jIdx - jMin) | 0;
                        labels[p] = (jj * nI + ii) | 0;
                    }
                }

                const res = { labels, nTiles, mode: RECT };
                setWorkstoreItem(key, res);

                return res;
            }

            if (mode === HEX) {

                let s = _isFinite(hexRadius) ? hexRadius | 0 : 1;
                if (s < 1) s = 1;

                const invA = _sqrt(3) / 3,
                    invB = 1 / 3,
                    invC = 2 / 3;

                // Compute bounds by projecting corners into lattice space and rounding
                const corners = [
                    [0, 0],
                    [iWidth-1, 0],
                    [0, iHeight-1],
                    [iWidth-1, iHeight-1]
                ];

                let qMin = 1e9,
                    qMax = -1e9,
                    rMin = 1e9,
                    rMax = -1e9;

                const roundCubeReturn = [0, 0],
                    pHold = [];
                const roundCube = (x, y, z) => {

                    let rx = _round(x),
                        ry = _round(y),
                        rz = _round(z);

                    const dx = _abs(rx - x),
                        dy = _abs(ry - y),
                        dz = _abs(rz - z);

                    if (dx > dy && dx > dz) rx = -ry - rz;
                    else if (dy > dz) ry = -rx - rz;
                    else rz = -rx - ry;

                    roundCubeReturn[0] = rx;
                    roundCubeReturn[1] = ry;

                    return roundCubeReturn;
                };

                let dx, dy, qf, rf, xf, zf, yf, qi, ri, qq, rr, p, y, x;

                for (let c = 0; c < 4; c++) {

                    dx = corners[c][0] - ox;
                    dy = corners[c][1] - oy;

                    pHold[0] = cosNeg * dx - sinNeg * dy;
                    pHold[1] = sinNeg * dx + cosNeg * dy;

                    applyAngularWarp(pHold);

                    qf = (invA * pHold[0] - invB * pHold[1]) / s;
                    rf = (invC * pHold[1]) / s;

                    xf = qf;
                    zf = rf;
                    yf = -xf - zf;

                    [qi, ri] = roundCube(xf, yf, zf);

                    if (qi < qMin) qMin = qi;
                    if (qi > qMax) qMax = qi;
                    if (ri < rMin) rMin = ri;
                    if (ri > rMax) rMax = ri;
                }

                // Add a small guard to ensure full coverage
                qMin -= 1;
                rMin -= 1;
                qMax += 1;
                rMax += 1;

                const nQ = (qMax - qMin + 1) | 0,
                    nR = (rMax - rMin + 1) | 0;

                nTiles = (nQ * nR) | 0;

                p = 0;

                for (y = 0; y < iHeight; y++) {

                    dy = y - oy;

                    for (x = 0; x < iWidth; x++, p++) {

                        dx = x - ox;
                        pHold[0] = cosNeg * dx - sinNeg * dy;
                        pHold[1] = sinNeg * dx + cosNeg * dy;

                        applyAngularWarp(pHold);

                        qf = (invA * pHold[0] - invB * pHold[1]) / s;
                        rf = (invC * pHold[1]) / s;

                        xf = qf;
                        zf = rf;
                        yf = -xf - zf;

                        [qi, ri] = roundCube(xf, yf, zf);

                        qq = (qi - qMin) | 0;
                        rr = (ri - rMin) | 0;

                        labels[p] = (rr * nQ + qq) | 0;
                    }
                }

                const res = { labels, nTiles, mode: HEX };
                setWorkstoreItem(key, res);

                return res;
            }

            const seeds = [];

            if (mode === RANDOM) {

                let count = _max(10, _isFinite(randomCount) ? randomCount | 0 : 1);
                if (count < 10) count = 10;

                const rng = seededRandomNumberGenerator(seed);

                let x, y;

                for (let i = 0; i < count; i++) {

                    x = (rng.random() * iWidth)  | 0;
                    y = (rng.random() * iHeight) | 0;

                    seeds.push(x, y);
                }
            }
            else if (mode === POINTS) {

                const arr = _isArray(pointsData) ? pointsData : [];

                let x, y;

                for (let i = 0, iz = arr.length; i < iz; i += 2) {

                    x = arr[i] | 0;
                    y = arr[i + 1] | 0;

                    if (x >= 0 && x < iWidth && y >= 0 && y < iHeight) seeds.push(x, y);
                }
            }

            const nSeeds = (seeds.length / 2) | 0;

            if (!nSeeds) {

                const res = { labels: new Int32Array(nPix), nTiles: 0, mode };
                setWorkstoreItem(key, res);

                return res;
            }

            // Spatial hash parameters: choose cell so ~1 seed per cell
            let cell = _floor(_sqrt((iWidth * iHeight) / nSeeds));
            if (cell < 4) cell = 4;

            const gridCols = ((iWidth + cell - 1) / cell) | 0,
                gridRows = ((iHeight + cell - 1) / cell) | 0;

            const head = new Int32Array(gridCols * gridRows);
            head.fill(-1);

            const next = new Int32Array(nSeeds);
            next.fill(-1);

            // Insert seeds (clamp to grid)
            let sx, sy, gx, gy, g;

            for (let s = 0; s < nSeeds; s++) {

                sx = seeds[(s << 1)];
                sy = seeds[(s << 1) + 1];

                gx = (sx / cell) | 0;
                if (gx < 0) gx = 0;
                else if (gx >= gridCols) gx = gridCols - 1;

                gy = (sy / cell) | 0;
                if (gy < 0) gy = 0;
                else if (gy >= gridRows) gy = gridRows - 1;

                g = gy * gridCols + gx;

                next[s] = head[g];

                head[g] = s;
            }

            // Nearest seed per pixel (search 3×3 neighborhood with clamp)
            let p = 0;

            let best, bestD, y, x, gy2, gx2, dx, dy, d2, s, radius;

            for (y = 0; y < iHeight; y++) {

                for (x = 0; x < iWidth; x++, p++) {

                    gx = (x / cell) | 0;
                    if (gx < 0) gx = 0;
                    else if (gx >= gridCols) gx = gridCols - 1;

                    gy = (y / cell) | 0;
                    if (gy < 0) gy = 0;
                    else if (gy >= gridRows) gy = gridRows - 1;

                    best = -1;
                    bestD = Infinity;

                    radius = 1;

                    while (best === -1) {

                        for (dy = -radius; dy <= radius; dy++) {

                            gy2 = gy + dy;

                            if (gy2 < 0 || gy2 >= gridRows) continue;

                            for (dx = -radius; dx <= radius; dx++) {

                                gx2 = gx + dx;

                                if (gx2 < 0 || gx2 >= gridCols) continue;

                                s = head[gy2 * gridCols + gx2];

                                while (s !== -1) {

                                    sx = seeds[(s << 1)]
                                    sy = seeds[(s << 1) + 1];

                                    d2 = (x - sx) * (x - sx) + (y - sy) * (y - sy);

                                    if (d2 < bestD) {

                                        bestD = d2;
                                        best = s;
                                    }
                                    s = next[s];
                                }
                            }
                        }
                        radius++;
                    }
                    labels[p] = best;
                }
            }

            nTiles = nSeeds;

            const res = { labels, nTiles, mode };
            setWorkstoreItem(key, res);

            return res;
        };

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
              oData = output.data,
              len = iData.length,
              nPix = (len >>> 2);

        const i32 = new Uint32Array(iData.buffer, iData.byteOffset, nPix),
            o32 = new Uint32Array(oData.buffer, oData.byteOffset, nPix);

        const {
            opacity = 1,
            includeRed   = true,
            includeGreen = true,
            includeBlue  = true,
            includeAlpha = false,
            premultiply = false,
            useInputAsMask = false,
            spiralStrength = 0,
            lineOut,
        } = requirements || {};

        const { labels, nTiles } = buildGeneralTileLabels(requirements, input);

        if (!nTiles) {

            transferDataUnchanged(oData, iData, len);
            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);
            return;
        }

        const accKey = `tiles-acc-v2-${nTiles}`;

        let acc = getWorkstoreItem(accKey);

        if (!acc) {

            acc = {
                r: new Uint32Array(nTiles),
                g: new Uint32Array(nTiles),
                b: new Uint32Array(nTiles),
                a: new Uint32Array(nTiles),
                c: new Uint32Array(nTiles),
            };

            setWorkstoreItem(accKey, acc);
        }
        else {

            acc.r.fill(0);
            acc.g.fill(0);
            acc.b.fill(0);
            acc.a.fill(0);
            acc.c.fill(0);
        }

        const rAcc = acc.r,
            gAcc = acc.g,
            bAcc = acc.b,
            aAcc = acc.a,
            cnt  = acc.c;

        let t, c, p, r, g, b, a, af, px, srcPx, srcA;

        // Pass 1: accumulate per tile
        for (p = 0; p < nPix; p++) {

            t = labels[p];

            if (t < 0) continue;

            px = i32[p];

            r = px & 0xFF;
            g = (px >>> 8) & 0xFF;
            b = (px >>> 16) & 0xFF;
            a = (px >>> 24) & 0xFF;

            if (useInputAsMask && a === 0) continue;

            cnt[t]++;

            if (premultiply && a > 0 && a < 255) {

                af = a / 255;
                r = (r * af + 0.5) | 0;
                g = (g * af + 0.5) | 0;
                b = (b * af + 0.5) | 0;
            }

            if (includeRed) rAcc[t] += r;
            if (includeGreen) gAcc[t] += g;
            if (includeBlue) bAcc[t] += b;

            aAcc[t] += a;
        }

        const rAvg = includeRed ? new Uint8Array(nTiles) : null,
            gAvg = includeGreen ? new Uint8Array(nTiles) : null,
            bAvg = includeBlue ? new Uint8Array(nTiles) : null,
            aAvg = new Uint8Array(nTiles);

        for (t = 0; t < nTiles; t++) {

            c = cnt[t] || 1;

            if (includeRed) rAvg[t] = (rAcc[t] / c) | 0;
            if (includeGreen) gAvg[t] = (gAcc[t] / c) | 0;
            if (includeBlue) bAvg[t] = (bAcc[t] / c) | 0;

            aAvg[t] = (aAcc[t] / c) | 0;
        }

        if (premultiply) {

            let a, invA, r, g, b;

            for (t = 0; t < nTiles; t++) {

                a = aAvg[t];

                if (a === 0 || a === 255) continue;

                invA = 255 / a;

                if (includeRed) {
                    r = (rAvg[t] * invA + 0.5) | 0;
                    if (r > 255) r = 255;
                    rAvg[t] = r;
                }
                if (includeGreen) {
                    g = (gAvg[t] * invA + 0.5) | 0;
                    if (g > 255) g = 255;
                    gAvg[t] = g;
                }
                if (includeBlue) {
                    b = (bAvg[t] * invA + 0.5) | 0;
                    if (b > 255) b = 255;
                    bAvg[t] = b;
                }
            }
        }

        // Pass 2: write out using packed 32-bit writes
        for (p = 0; p < nPix; p++) {

            t = labels[p];

            srcPx = i32[p];

            if (t < 0) {

                o32[p] = srcPx;
                continue;
            }

            srcA = (srcPx >>> 24) & 0xFF;
            if (useInputAsMask && srcA === 0) {

                o32[p] = srcPx;
                continue;
            }

            r = srcPx & 0xFF;
            g = (srcPx >>> 8) & 0xFF;
            b = (srcPx >>> 16)& 0xFF;
            a = srcA;

            if (includeRed) r = rAvg[t];
            if (includeGreen) g = gAvg[t];
            if (includeBlue) b = bAvg[t];
            if (includeAlpha) a = aAvg[t];

            o32[p] = (a << 24) | (b << 16) | (g << 8) | r;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __tint-channels__ - Has similarities to the SVG &lt;feColorMatrix> filter element, but excludes the alpha channel from calculations. Rather than set a matrix, we set nine arguments to determine how the value of each color channel in a pixel will affect both itself and its fellow color channels. The 'sepia' convenience filter presets these values to create a sepia effect.
    [TINT_CHANNELS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            redInRed = 1,
            redInGreen = 0,
            redInBlue = 0,
            greenInRed = 0,
            greenInGreen = 1,
            greenInBlue = 0,
            blueInRed = 0,
            blueInGreen = 0,
            blueInBlue = 1,
            lineOut,
        } = requirements;

        const c00 = +redInRed,
            c01 = +greenInRed,
            c02 = +blueInRed,
            c10 = +redInGreen,
            c11 = +greenInGreen,
            c12 = +blueInGreen,
            c20 = +redInBlue,
            c21 = +greenInBlue,
            c22 = +blueInBlue;

        const isIdentity = (c00 === 1 && c11 === 1 && c22 === 1 && c01 === 0 && c02 === 0 && c10 === 0 && c12 === 0 && c20 === 0 && c21 === 0);

        if (isIdentity) out32.set(src32);
        else {

            let p, pz, rgba, r, g, b, a, nr, ng, nb;

            for (p = 0, pz = src32.length | 0; p < pz; p++) {

                rgba = src32[p];

                r =  rgba & 0xff;
                g = (rgba >>> 8) & 0xff;
                b = (rgba >>> 16) & 0xff;
                a = (rgba >>> 24) & 0xff;

                nr = _floor(r * c00 + g * c01 + b * c02);
                ng = _floor(r * c10 + g * c11 + b * c12);
                nb = _floor(r * c20 + g * c21 + b * c22);

                nr = nr < 0 ? 0 : nr > 255 ? 255 : nr;
                ng = ng < 0 ? 0 : ng > 255 ? 255 : ng;
                nb = nb < 0 ? 0 : nb > 255 ? 255 : nb;

                out32[p] = ((a << 24) | (nb << 16) | (ng << 8) | nr) >>> 0;
            }
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __unsharp__ - OKLab L-only sharpen with Sobel edge mask
    [UNSHARP]: function (requirements) {

        const getEausmWorkspace = (width, height) => {

            const key = `ea-usm::ws::${width}x${height}`,
                  N   = width * height;

            let ws = getWorkstoreItem(key);
            if (!ws) ws = {};

            if (!ws.L || ws.L.length !== N) ws.L = new Float32Array(N);
            if (!ws.A || ws.A.length !== N) ws.A = new Float32Array(N);
            if (!ws.B || ws.B.length !== N) ws.B = new Float32Array(N);

            if (!ws.Lb || ws.Lb.length !== N) ws.Lb = new Float32Array(N);
            if (!ws.D || ws.D.length !== N) ws.D = new Float32Array(N);
            if (!ws.G || ws.G.length !== N) ws.G = new Float32Array(N);
            if (!ws.M || ws.M.length !== N) ws.M = new Float32Array(N);

            if (!ws.Am || ws.Am.length !== N) ws.Am = new Float32Array(N);

            if (!ws.tmpImg || ws.tmpImg.length !== N) ws.tmpImg = new Float32Array(N);

            const maxWH = _max(width, height);
            if (!ws.tmpLine || ws.tmpLine.length < maxWH) ws.tmpLine = new Float32Array(maxWH);

            setWorkstoreItem(key, ws);
            return ws;
        };

        const getGaussianCoeffsCached = (sigma) => {

            if (!(sigma > 0)) return null;

            const key = `gauss-f32::${(sigma * 1000) | 0}`;
            let coeff = getWorkstoreItem(key);

            if (!coeff) {

                coeff = getGaussianCoeffsFloat(sigma);
                setWorkstoreItem(key, coeff);
            }
            return coeff;
        };

        const convolve1D_Float = (lineIn, dstLine, length, coeff) => {

            const a0L = coeff[0],
                a1L = coeff[1],
                a0R = coeff[2],
                a1R = coeff[3],
                b1 = coeff[4],
                b2 = coeff[5],
                lc = coeff[6],
                rc = coeff[7];

            let prev_src = lineIn[0],
                prev_out = prev_src * lc,
                prev_prev_out = prev_out,
                i, x, y;

            dstLine[0] = prev_out;

            for (i = 1; i < length; i++) {

                x = lineIn[i];
                y = x * a0L + prev_src * a1L + prev_out * b1 + prev_prev_out * b2;

                dstLine[i] = y;

                prev_prev_out = prev_out;
                prev_out = y;
                prev_src = x;
            }

            prev_src = lineIn[length - 1];
            prev_out = prev_src * rc;
            prev_prev_out = prev_out;

            dstLine[length - 1] += prev_out;

            for (i = length - 2; i >= 0; i--) {

                x = lineIn[i];
                y = x * a0R + prev_src * a1R + prev_out * b1 + prev_prev_out * b2;

                dstLine[i] += y;

                prev_prev_out = prev_out;
                prev_out = y;
                prev_src = x;
            }
        };

        const gaussianBlurL_Float = (src, dst, width, height, sigmaH, sigmaV, tmpLine, tmpImg, coeffHOpt, coeffVOpt) => {

            const doH = sigmaH > 0;
            const doV = sigmaV > 0;

            if (!doH && !doV) {

                if (dst !== src) dst.set(src);
                return;
            }

            const tmp = (doH && doV) ? tmpImg : dst;

            let y, x, off;

            if (doH) {

                const coeffH = coeffHOpt || getGaussianCoeffsCached(sigmaH);

                for (y = 0; y < height; y++) {

                    off = y * width;

                    for (x = 0; x < width; x++) {

                        tmpLine[x] = src[off + x];
                    }

                    convolve1D_Float(tmpLine, tmpLine, width, coeffH);

                    for (let x = 0; x < width; x++) {

                        tmp[off + x] = tmpLine[x];
                    }
                }
            }
            else if (tmp !== src) tmp.set(src);

            if (doV) {

                const coeffV = coeffVOpt || getGaussianCoeffsCached(sigmaV);

                for (x = 0; x < width; x++) {

                    for (y = 0; y < height; y++) {

                        tmpLine[y] = tmp[y * width + x];
                    }

                    convolve1D_Float(tmpLine, tmpLine, height, coeffV);

                    for (y = 0; y < height; y++) {

                        dst[y * width + x] = tmpLine[y];
                    }
                }
            }
        };

        const sobelMagFloat = (src, dst, width, height) => {

            const clampXY = (x, y) => {

                if (x < 0) x = 0;
                else if (x >= width) x = width - 1;

                if (y < 0) y = 0;
                else if (y >= height) y = height - 1;

                return (y * width + x) | 0;
            };

            let x, y, ym1, y0, yp1, xm1, x0, xp1, gx, gy,
                p00, p10, p20, p01, p21, p02, p12, p22;

            for (y = 0; y < height; y++) {

                ym1 = y - 1;
                y0 = y;
                yp1 = y + 1;

                for (x = 0; x < width; x++) {

                    xm1 = x - 1;
                    x0 = x;
                    xp1 = x + 1;

                    p00 = src[clampXY(xm1, ym1)];
                    p10 = src[clampXY(x0,  ym1)];
                    p20 = src[clampXY(xp1, ym1)];

                    p01 = src[clampXY(xm1, y0 )];
                    p21 = src[clampXY(xp1, y0 )];

                    p02 = src[clampXY(xm1, yp1)];
                    p12 = src[clampXY(x0,  yp1)];
                    p22 = src[clampXY(xp1, yp1)];

                    gx = (-p00 + p20) + (-2 * p01 + 2 * p21) + (-p02 + p22);
                    gy = (-p00 - 2 * p10 - p20) + (p02 + 2 * p12 + p22);

                    dst[y * width + x] = _abs(gx) + _abs(gy);
                }
            }
        };

        const smoothstepInto = (grad, outMask, t0, t1) => {

            const inv = 1.0 / _max(1e-6, (t1 - t0));

            let i, iz, x;

            for (i = 0, iz = grad.length | 0; i < iz; i++) {

                x = (grad[i] - t0) * inv;

                outMask[i] =
                    x <= 0 ? 0 :
                    x >= 1 ? 1 :
                    x * x * (3 - 2 * x);
            }
        };

        const [input, output] = getInputAndOutputLines(requirements),
            width = input.width,
            height = input.height,
            iData = input.data,
            oData = output.data,
            len = iData.length;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, len >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset, len >>> 2);

        const {
            opacity = 1,
            strength = 0.8,
            radius = 2.0,
            level = 0.015,
            smoothing = 0.015,
            clamp = 0.08,
            useEdgeMask = true,
            lineOut,
        } = requirements || {};

        if (strength === 0 || radius <= 0) {

            transferDataUnchanged(oData, iData, len);
            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);
            return;
        }

        const libs = colorEngine.getRgbOkCache(),
            toOK  = colorEngine.getOkValsForRgb,
            toRGB = colorEngine.getRgbValsForOklab;

        const ws = getEausmWorkspace(width, height);
        const { L, A, B, Lb, D, G, M, Am, tmpLine, tmpImg } = ws;

        let p, pz, rgba, a, r, g, b, ok, d, Lp, rgb;

        // 1) RGB -> OKLab + alpha mask
        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];
            a = (rgba >>> 24) & 0xFF;

            Am[p] = a > 0 ? 1.0 : 0.0;

            if (a === 0) {

                L[p] = 0;
                A[p] = 0;
                B[p] = 0;
                continue;
            }

            r = rgba & 0xFF;
            g = (rgba >>> 8) & 0xFF;
            b = (rgba >>> 16) & 0xFF;

            ok = toOK(r, g, b, libs);

            L[p] = ok[0];
            A[p] = ok[1];
            B[p] = ok[2];
        }

        // 2) Blur L (main radius). Reuse tmpImg buffer.
        const coeffMain = getGaussianCoeffsCached(radius);

        gaussianBlurL_Float(L, Lb, width, height, radius, radius, tmpLine, tmpImg, coeffMain, coeffMain);

        // 3) Detail layer D = L - Lb
        for (p = 0, pz = L.length | 0; p < pz; p++) {

            D[p] = L[p] - Lb[p];
        }

        // 4) Edge mask (optional)
        if (useEdgeMask && (level > 0 || smoothing > 0)) {

            sobelMagFloat(Lb, G, width, height);

            // Soft threshold using user level/smoothing
            smoothstepInto(G, M, level, level + _max(1e-6, smoothing));

            // Optional extra smoothing on mask; only if smoothing > 0
            if (smoothing > 0) {

                const maskSigma = 0.7;
                const coeffMask = getGaussianCoeffsCached(maskSigma);

                gaussianBlurL_Float(M, M, width, height, maskSigma, maskSigma, tmpLine, tmpImg, coeffMask, coeffMask);
            }

            // Respect alpha mask
            for (p = 0, pz = M.length | 0; p < pz; p++) {

                M[p] *= Am[p];
            }
        }
        else {
            // No edge-limiting requested: mask is just alpha
            for (p = 0, pz = M.length | 0; p < pz; p++) {

                M[p] = Am[p];
            }
        }

        // 5) Apply sharpening on L with halo clamp
        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];
            a = (rgba >>> 24) & 0xFF;

            if (a === 0) {

                out32[p] = rgba;
                continue;
            }

            d = D[p];

            if (d > clamp) d = clamp;
            else if (d < -clamp) d = -clamp;

            Lp = L[p] + strength * M[p] * d;

            rgb = toRGB(Lp, A[p], B[p], libs);

            out32[p] = ((a << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
        }

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },


// __user-defined-legacy__ - Previous to version 8.4, filters could be defined with an argument which passed a function string to the filter engine, which the engine would then run against the source input image as-and-when required. This functionality has been removed from the new filter functionality. All such filters will now return the input image unchanged.

    [USER_DEFINED_LEGACY]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        transferDataUnchanged(oData, iData, len);

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __vary-channels-by-weights__ - manipulate colors using a set of channel curve arrays.
// + The weights Array is (256 * 4) elements long. For each color level, we supply four weights: `redweight, greenweight, blueweight, allweight`
// + The default weighting for all elements is `0`. Weights are added to a pixel channel's value, thus weighting values need to be integer Numbers, either positive or negative
// + The `useMixedChannel` flag uses a different calculation, where a pixel's channel values are combined to give their grayscale value, then that weighting (stored as the `allweight` weighting value) is added to each channel value, pro-rata in line with the grayscale channel weightings. (Note: this produces a different result compared to tools supplied in various other graphic manipulation software)
// + Using this method, we can perform a __curve__ (image tonality) filter
    [VARY_CHANNELS_BY_WEIGHTS]: function (requirements) {

        const [input, output] = getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            weights = [],
            useMixedChannel = true,
            lineOut,
        } = requirements;

        if (weights.length !== 1024) {

            weights.length = 1024;
            weights.fill(0);
        }

        const gVal = colorEngine.getBestGray;

        let i, r, g, b, a, red, green, blue, alpha, gray, all, allR, allG, allB;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            red = iData[r];
            green = iData[g];
            blue = iData[b];
            alpha = iData[a];

            if (useMixedChannel) {

                gray = gVal(red, green, blue);

                all = weights[(gray * 4) + 3];

                allR = all * 0.2126;
                allG = all * 0.7152;
                allB = all * 0.0722;

                oData[r] = red + allR;
                oData[g] = green + allG;
                oData[b] = blue + allB;
                oData[a] = iData[a];
            }
            else {

                oData[r] = red + weights[red * 4];
                oData[g] = green + weights[(green * 4) + 1];
                oData[b] = blue + weights[(blue * 4) + 2];
                oData[a] = alpha + weights[(alpha * 4) + 3];
            }
        }
        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },

// __ok-perceptual-curves__ - manipulate OK* channels using per-bucket offsets. Curves are supplied as delta arrays:
// + luminance: length 501, values added directly to L   (0..1)
// + chroma: length 201, values added to normalised C (0..1) then scaled
// + aChannel: length 501, values added to normalised A (0..1) then re-mapped
// + bChannel: length 501, values added to normalised B (0..1) then re-mapped
// + If an array is empty or all-zero (within EPS), that channel is left unchanged.
[OK_PERCEPTUAL_CURVES]: function (requirements) {

    const [input, output] = getInputAndOutputLines(requirements);

    const iData = input.data,
        oData = output.data,
        len = iData.length;

    const {
        opacity = 1,
        curves = null,
        lineOut,
    } = requirements;

    let lumWeights = [],
        chrWeights = [],
        aWeights = [],
        bWeights = [];

    if (curves) {

        if (_isArray(curves.luminance)) lumWeights = curves.luminance;
        if (_isArray(curves.chroma)) chrWeights = curves.chroma;
        if (_isArray(curves.aChannel)) aWeights = curves.aChannel;
        if (_isArray(curves.bChannel)) bWeights = curves.bChannel;
    }

    const L_SIZE  = 501,
        AB_SIZE = 501,
        C_SIZE  = 201,
        MAX_A_B = 0.4,
        RANGE_A_B = MAX_A_B * 2,
        INV_RANGE_A_B = 1 / RANGE_A_B,
        MAX_CHROMA = 0.4,
        EPS = 1e-7;

    const hasNonZero = (arr, expectedLen) => {

        if (!_isArray(arr) || arr.length !== expectedLen) return false;

        for (let i = 0, iz = arr.length, v; i < iz; i++) {

            v = arr[i];
            if (_isFinite(v) && _abs(v) > EPS) return true;
        }
        return false;
    };

    const useLum = hasNonZero(lumWeights, L_SIZE),
        useChr = hasNonZero(chrWeights, C_SIZE),
        useA = hasNonZero(aWeights, AB_SIZE),
        useB = hasNonZero(bWeights, AB_SIZE);

    if (!useLum && !useChr && !useA && !useB) {

        transferDataUnchanged(oData, iData, len);

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);

        return;
    }

    const libs  = colorEngine.getRgbOkCache(),
        getOk = colorEngine.getOkValsForRgb,
        toRgbL = colorEngine.getRgbValsForOklab,
        toRgbC = colorEngine.getRgbValsForOklch;

    const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
        out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

    let p, pz, rgba, r, g, b, a, ok, L, A, B, C, H, rgb,
        idxL, dL, Cnorm, idxC, dCnorm,
        aNorm, idxA, dANorm,
        bNorm, idxB, dBNorm;

    if (useChr) {

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];

            r = rgba & 0xFF;
            g = (rgba >>> 8) & 0xFF;
            b = (rgba >>> 16) & 0xFF;
            a = (rgba >>> 24) & 0xFF;

            if (a === 0) {

                out32[p] = rgba;
                continue;
            }

            ok = getOk(r, g, b, libs);
            L = ok[0];
            C = ok[3];
            H = ok[4];

            if (useLum) {

                idxL = (L * (L_SIZE - 1) + 0.5) | 0;
                idxL = _min(_max(idxL, 0), L_SIZE - 1);

                dL = lumWeights[idxL];
                if (!_isFinite(dL)) dL = 0;

                L += dL;
                L = _min(_max(L, 0), 1);
            }

            Cnorm = C / MAX_CHROMA;
            if (Cnorm < 0) Cnorm = 0;
            else if (Cnorm > 1) Cnorm = 1;

            idxC = (Cnorm * (C_SIZE - 1) + 0.5) | 0;
            idxC = _min(_max(idxC, 0), C_SIZE - 1);

            dCnorm = chrWeights[idxC];
            if (!_isFinite(dCnorm)) dCnorm = 0;

            Cnorm += dCnorm;
            Cnorm = _min(_max(Cnorm, 0), 1);

            C = Cnorm * MAX_CHROMA;

            rgb = toRgbC(L, C, H, libs);

            out32[p] = ((a << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
        }
    }
    else {

        for (p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];

            r = rgba & 0xFF;
            g = (rgba >>> 8) & 0xFF;
            b = (rgba >>> 16) & 0xFF;
            a = (rgba >>> 24) & 0xFF;

            if (a === 0) {

                out32[p] = rgba;
                continue;
            }

            ok = getOk(r, g, b, libs);
            L = ok[0];
            A = ok[1];
            B = ok[2];

            if (useLum) {

                idxL = (L * (L_SIZE - 1) + 0.5) | 0;
                idxL = _min(_max(idxL, 0), L_SIZE - 1);

                dL = lumWeights[idxL];
                if (!_isFinite(dL)) dL = 0;

                L += dL;
                L = _min(_max(L, 0), 1);
            }

            if (useA) {

                aNorm = (A + MAX_A_B) * INV_RANGE_A_B;
                aNorm = _min(_max(aNorm, 0), 1);

                idxA = (aNorm * (AB_SIZE - 1) + 0.5) | 0;
                idxA = _min(_max(idxA, 0), AB_SIZE - 1);

                dANorm = aWeights[idxA];
                if (!_isFinite(dANorm)) dANorm = 0;

                aNorm += dANorm;
                aNorm = _min(_max(aNorm, 0), 1);

                A = (aNorm * RANGE_A_B) - MAX_A_B;
            }

            if (useB) {

                bNorm = (B + MAX_A_B) * INV_RANGE_A_B;
                bNorm = _min(_max(bNorm, 0), 1);

                idxB = (bNorm * (AB_SIZE - 1) + 0.5) | 0;
                idxB = _min(_max(idxB, 0), AB_SIZE - 1);

                dBNorm = bWeights[idxB];
                if (!_isFinite(dBNorm)) dBNorm = 0;

                bNorm += dBNorm;
                bNorm = _min(_max(bNorm, 0), 1);

                B = (bNorm * RANGE_A_B) - MAX_A_B;
            }

            rgb = toRgbL(L, A, B, libs);

            out32[p] = ((a << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
        }
    }

    if (lineOut) processResults(output, input, 1 - opacity);
    else processResults(cache.work, output, opacity);
},

// __zoom-blur__ - blur with radial easing & inner/outer radius
    [ZOOM_BLUR]: function (requirements) {

        const premultiply_u32 = (buf32, count) => {

            let i, px, r, g, b, a, f;

            for (i = 0; i < count; i++) {

                px = buf32[i];
                a = (px >>> 24) & 0xFF;

            if (a === 0 || a === 255) continue;

            f = a / 255;
            r = (px & 0xFF);
            g = ((px >>> 8) & 0xFF);
            b = ((px >>>16) & 0xFF);

            r = (r * f + 0.5) | 0;
            g = (g * f + 0.5) | 0;
            b = (b * f + 0.5) | 0;

            buf32[i] = (px & 0xFF000000) | (b << 16) | (g << 8) | r; }
        };

        const unpremultiply_u32 = (buf32, count) => {

            let i, px, r, g, b, a, f;

            for (i = 0; i < count; i++) {

                px = buf32[i];
                a = (px >>> 24) & 0xFF;

                if (a === 0 || a === 255) continue;

                f = 255 / a;
                r = (px & 0xFF);
                g = ((px >>> 8) & 0xFF);
                b = ((px >>>16) & 0xFF);

                r = _min(255, (r * f + 0.5) | 0);
                g = _min(255, (g * f + 0.5) | 0);
                b = _min(255, (b * f + 0.5) | 0);

                buf32[i] = (px & 0xFF000000) | (b << 16) | (g << 8) | r;
            }
        };

        const getValuePx = (val, dim) => (val && val.substring)
            ? _floor((parseFloat(val) / 100) * dim)
            : (val | 0);

        const getEaseOutWeights = (samples) => {

            const KEY = `zoom-blur::weightsEaseOut::${samples}`;
            let pack = getWorkstoreItem(KEY);
            if (pack) return pack;

            const w = new Float32Array(samples);

            let sum = 0,
                i, t, v;

            for (i = 0; i < samples; i++) {

                t = (samples > 1) ? (i / (samples - 1)) : 0;
                v = 1 - t * t;

                w[i] = v;
                sum += v;
            }

            const inv = sum ? 1 / sum : 1;

            for (i = 0; i < samples; i++) {

                w[i] *= inv;
            }

            const ps = new Float32Array(samples);

            let acc = 0;

            for (i = 0; i < samples; i++) {

                acc += w[i]; ps[i] = acc;
            }

            pack = { w, ps };
            setWorkstoreItem(KEY, pack);

            return pack;
        };

        const getWs = (w, h) => {

            const key = `zoom-blur::ws::${w}x${h}`;
            const ws = getWorkstoreItem(key) || {};

            const N = (w * h) | 0;

            if (!ws.dirX || ws.dirX.length !== N) ws.dirX = new Float32Array(N);
            if (!ws.dirY || ws.dirY.length !== N) ws.dirY = new Float32Array(N);
            if (!ws.baseT || ws.baseT.length !== samples) ws.baseT = new Float32Array(samples);
            if (!ws.invBase || ws.invBase.length !== samples) ws.invBase = new Float32Array(samples);

            setWorkstoreItem(key, ws);

            return ws;
        };

        const getRand = (w, h, seed) => {

            const key = `zoom-blur::rand::${w}x${h}::${seed}`;
            const r = getWorkstoreItem(key);
            if (r) return r;

            const N = (w * h) | 0;

            const rnd = getRandomNumbers({ seed, length: N, imgWidth: w, type: RANDOM });

            const arr = new Float32Array(N);

            for (let i = 0; i < N; i++) {

                arr[i] = rnd[i];
            }

            setWorkstoreItem(key, arr);

            return arr;
        };

        const [input, output] = getInputAndOutputLines(requirements),
            iData = input.data,
            oData = output.data,
            width = input.width | 0,
            height = input.height|0,
            pixels = (iData.length >>> 2) | 0;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, pixels),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, pixels);

        const {
            opacity = 1,
            startX = '50%',
            startY = '50%',
            strength = 0.35,
            samples = 14,
            variation = 0,
            angle = 0,
            seed = DEFAULT_SEED,
            innerRadius = 0,
            outerRadius = 0,
            easing = 'linear',
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = true,
            excludeTransparentPixels = true,
            multiscale = true,
            premultiply = false,
            lineOut,
        } = requirements;

        const cx = getValuePx(startX, width),
            cy = getValuePx(startY, height);

        let rIn = getValuePx(innerRadius, _min(width, height)),
            rOut = getValuePx(outerRadius, _min(width, height));

        const userSetInner = (requirements.innerRadius !== undefined);
        const userSetOuter = (requirements.outerRadius !== undefined);

        if (userSetInner && !userSetOuter) rOut = rIn;
        if (!userSetInner && userSetOuter) rIn = rOut;
        if (rIn > rOut) [rIn, rOut] = [rOut, rIn];

        if (!(strength > 0) || !(samples > 0)) {

            out32.set(src32);

            if (lineOut) processResults(output, input, 1 - opacity);
            else processResults(cache.work, output, opacity);
            return;
        }

        const RM = includeRed ? 0x000000FF : 0,
            GM = includeGreen ? 0x0000FF00 : 0,
            BM = includeBlue  ? 0x00FF0000 : 0,
            AM = includeAlpha ? 0xFF000000 : 0;

        const INC_MASK = (RM | GM | BM | AM) >>> 0,
            NOT_INC = (~INC_MASK) >>> 0;

        let ease = easing;

        if (ease && ease.substring) ease = easeEngines[ease] || easeEngines['linear'];
        if (!isa_fn(ease)) ease = easeEngines['linear'];
        const easeIsLinear = (ease === easeEngines['linear']);

        const ws = getWs(width, height);
        const { dirX, dirY, baseT, invBase } = ws;

        const Sminus = _max(1, samples - 1),
            NO_RADIAL = (rIn === 0 && rOut === 0),
            variationZero = !(variation > 0);

        const angleRad  = angle * _radian,
            angleZero = _abs(angleRad) < 1e-12;

        if (!ws.angleT || ws.angleT.length < 64) ws.angleT = new Float32Array(64);

        const angleT = ws.angleT;

        if (ws._cx !== cx || ws._cy !== cy) {

            let p = 0;

            for (let y = 0; y < height; y++) {

                for (let x = 0; x < width; x++, p++) {

                    dirX[p] = (x - cx);
                    dirY[p] = (y - cy);
                }
            }
            ws._cx = cx; ws._cy = cy;
        }

        if (ws._samples !== samples) {

            for (let s = 0; s < samples; s++) {

                baseT[s] = s / Sminus;
            }
            ws._samples = samples;
        }

        if (ws._angleSamples !== samples || ws._angleRad !== angleRad) {

            for (let s = 0; s < samples; s++) {

                angleT[s] = angleRad * baseT[s];
            }

            ws._angleSamples = samples;
            ws._angleRad = angleRad;
        }

        const { w: weights, ps: wPrefix } = getEaseOutWeights(samples);

        if (NO_RADIAL && (ws._invBaseSamples !== samples || ws._invBaseStrength !== strength)) {

            for (let s = 0; s < samples; s++) {

                invBase[s] = 1.0 / (1.0 + strength * baseT[s]);
            }
            ws._invBaseSamples = samples;
            ws._invBaseStrength = strength;
        }

        const rand = variationZero ? null : getRand(width, height, seed);

        const radiiEqual = (rIn === rOut),
            rIn2  = (rIn|0)  * (rIn|0),
            rOut2 = (rOut|0) * (rOut|0),
            invSpan2 = (!radiiEqual && (rOut > rIn)) ? (1.0 / _max(1e-6, (rOut2 - rIn2))) : 0;

        if (premultiply) premultiply_u32(src32, pixels);

        const runAtSize = (W, H, _cx, _cy, writePacked, outPacked32) => {

            const wM1 = width - 1,
            hM1 = height - 1;

            let dX = dirX,
                dY = dirY,
                RND = rand;

            if (W !== width || H !== height || _cx !== cx || _cy !== cy) {

                const key = `zoom-blur::ws-dir::${W}x${H}:${_cx},${_cy}`;
                let wr = getWorkstoreItem(key);
                if (!wr) wr = {};

                const N = (W * H) | 0;

                if (!wr.dirX || wr.dirX.length !== N) wr.dirX = new Float32Array(N);
                if (!wr.dirY || wr.dirY.length !== N) wr.dirY = new Float32Array(N);

                const sx = width  / W,
                    sy = height / H;

                let p = 0;

                for (let y = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {

                    wr.dirX[p] = (x - _cx) * sx;
                    wr.dirY[p] = (y - _cy) * sy;
                }

                setWorkstoreItem(key, wr);

                dX = wr.dirX;
                dY = wr.dirY;

                if (!variationZero) {

                    const rk = `zoom-blur::rand::${W}x${H}::${seed}`;
                    let rr = getWorkstoreItem(rk);

                    if (!rr) {

                        const rnd = getRandomNumbers({ seed, length: N, imgWidth: W, type: RANDOM });

                        rr = new Float32Array(N);

                        for (let i = 0; i < N; i++) {

                            rr[i]=rnd[i];
                        }

                        setWorkstoreItem(rk, rr);
                    }
                    RND = rr;
                }
            }

            const allChannels = (INC_MASK === 0xFFFFFFFF >>> 0);

            let p = 0,
                xf = 0,
                yf = 0,
                x0 = 0,
                y0 = 0,
                x1 = 0,
                y1 = 0,
                fx = 0,
                fy = 0,
                w00 = 0,
                w10 = 0,
                w01 = 0,
                w11 = 0,
                sp00 = 0,
                sp10 = 0,
                sp01 = 0,
                sp11 = 0;

            let outR, outG, outB, outA;

            if (!writePacked) {

                const key = `zoom-blur::planes::${W}x${H}`,
                    planes = getWorkstoreItem(key) || {};

                const N = (W*H)|0;

                if (!planes.R || planes.R.length !== N) planes.R = new Float32Array(N);
                if (!planes.G || planes.G.length !== N) planes.G = new Float32Array(N);
                if (!planes.B || planes.B.length !== N) planes.B = new Float32Array(N);
                if (!planes.A || planes.A.length !== N) planes.A = new Float32Array(N);

                setWorkstoreItem(key, planes);

                outR = planes.R;
                outG = planes.G;
                outB = planes.B;
                outA = planes.A;
            }

            const invBaseLocal = invBase;

            let y, x, mapX, mapY, srcPix, aSrc,
                dx, dy, m, r2, packed,
                effStrength, S_eff, sumW, norm,
                accR, accG, accB, accA,
                s, t, inv, sx, sy, row0, row1, wt, jt0, rnd,
                A_keep, R, G, B, Aout, eps, Ri, Gi, Bi, Ai, scale,
                theta, ct, st, rx, ry, u;

            for (y = 0; y < H; y++) {

                for (x = 0; x < W; x++, p++) {

                    mapX = _min(width - 1, _max(0, (x * width / W) | 0));
                    mapY = _min(height - 1, _max(0, (y * height / H) | 0));
                    srcPix = src32[mapY * width + mapX];
                    aSrc = (srcPix >>> 24) & 0xFF;

                    if (excludeTransparentPixels && aSrc === 0) {

                        if (writePacked) out32[mapY * width + mapX] = srcPix;
                        else {

                            outR[p] = srcPix & 255;
                            outG[p] = (srcPix >>> 8) & 255;
                            outB[p] = (srcPix >>> 16) & 255;
                            outA[p] = (srcPix >>> 24) & 255;
                        }
                        continue;
                    }

                    dx = dX[p];
                    dy = dY[p];

                    m = 1;

                    if (!NO_RADIAL) {

                        r2 = dx * dx + dy * dy;

                        if (radiiEqual) m = (r2 <= rIn2) ? 0 : 1;
                        else {

                            if (r2 <= rIn2) m = 0;
                            else {

                                u = (r2 - rIn2) * invSpan2;

                                m = (u >= 1) ? 1 : (u <= 0 ? 0 : (easeIsLinear ? u : ease(u)));
                            }
                        }

                        if (m === 0) {

                            if (writePacked) {

                                packed = srcPix;
                                outPacked32[p] = allChannels ? packed : ((srcPix & NOT_INC) | (packed & INC_MASK));
                            }
                            else {

                                outR[p] = srcPix & 255;
                                outG[p] = (srcPix >>> 8) & 255;
                                outB[p] = (srcPix >>> 16) & 255;
                                outA[p] = (srcPix >>> 24) & 255;
                            }
                            continue;
                        }
                    }

                    effStrength = NO_RADIAL ? strength : (strength * m);

                    S_eff = NO_RADIAL ? samples : (1 + (((samples - 1) * (m*m)) | 0));
                    if (S_eff < 4) S_eff = 4;
                    if (S_eff > samples) S_eff = samples;

                    sumW = wPrefix[S_eff - 1];
                    norm = 1.0 / sumW;

                    accR = 0;
                    accG = 0;
                    accB = 0;
                    accA = 0;

                    if (variationZero) {

                        for (s = 0; s < S_eff; s++) {

                            t = baseT[s];
                            inv = NO_RADIAL ? invBaseLocal[s] : (1.0 / (1.0 + effStrength * t));

                            if (angleZero) {

                                sx = cx + dx * inv;
                                sy = cy + dy * inv;
                            }
                            else {

                                theta = (NO_RADIAL ? angleT[s] : angleT[s] * m);
                                ct = _cos(theta);
                                st = _sin(theta);
                                rx = dx * ct - dy * st;
                                ry = dx * st + dy * ct;

                                sx = cx + rx * inv;
                                sy = cy + ry * inv;
                            }

                            xf = sx;
                            yf = sy;

                            if (xf < 0) xf = 0;
                            else if (xf > wM1) xf = wM1;

                            if (yf < 0) yf = 0;
                            else if (yf > hM1) yf = hM1;

                            x0 = xf | 0;
                            y0 = yf | 0;

                            x1 = x0 + 1 < width ? x0 + 1 : x0;
                            y1 = y0 + 1 < height ? y0 + 1 : y0;

                            fx = xf - x0;
                            fy = yf - y0;

                            w00 = (1 - fx) * (1 - fy);
                            w10 = fx * (1 - fy);
                            w01 = (1 - fx) * fy;
                            w11 = fx * fy;

                            row0 = y0 * width;
                            row1 = y1 * width;

                            sp00 = src32[row0 + x0];
                            sp10 = src32[row0 + x1];
                            sp01 = src32[row1 + x0];
                            sp11 = src32[row1 + x1];

                            wt = weights[s] * norm;

                            accR += (
                                (sp00 & 255) * w00
                                + (sp10 & 255) * w10
                                + (sp01 & 255) * w01
                                + (sp11 & 255) * w11
                                ) * wt;

                            accG += (
                                ((sp00 >>> 8) & 255) * w00
                                + ((sp10 >>> 8) & 255) * w10
                                + ((sp01 >>> 8) & 255) * w01
                                + ((sp11 >>> 8) & 255) * w11
                                ) * wt;

                            accB += (
                                ((sp00 >>> 16) & 255) * w00
                                + ((sp10 >>> 16) & 255)* w10
                                + ((sp01 >>> 16) & 255)* w01
                                + ((sp11 >>> 16) & 255)* w11
                                ) * wt;

                            accA += (
                                ((sp00 >>> 24) & 255) * w00
                                + ((sp10 >>> 24) & 255) * w10
                                + ((sp01 >>> 24) & 255) * w01
                                + ((sp11 >>> 24) & 255)* w11
                                ) * wt;
                        }
                    }
                    else {

                        rnd = RND[p];
                        jt0 = (variation * (rnd - 0.5)) / _max(1, (samples - 1));

                        for (s = 0; s < S_eff; s++) {

                            t = baseT[s] + jt0;
                            if (t < 0) t = 0;
                            else if (t > 1) t = 1;

                            inv = NO_RADIAL ? invBaseLocal[s] : (1.0 / (1.0 + effStrength * t));

                            if (angleZero) {

                                sx = cx + dx * inv;
                                sy = cy + dy * inv;
                            }
                            else {

                                theta = (NO_RADIAL ? (angleRad * t) : (angleRad * t * m));
                                ct = _cos(theta);
                                st = _sin(theta);
                                rx = dx * ct - dy * st;
                                ry = dx * st + dy * ct;

                                sx = cx + rx * inv;
                                sy = cy + ry * inv;
                            }

                            xf = sx;
                            yf = sy;

                            if (xf < 0) xf = 0;
                            else if (xf > wM1) xf = wM1;

                            if (yf < 0) yf = 0;
                            else if (yf > hM1) yf = hM1;

                            x0 = xf | 0;
                            y0 = yf | 0;

                            x1 = x0 + 1 < width ? x0 + 1 : x0;
                            y1 = y0 + 1 < height ? y0 + 1 : y0;

                            fx = xf - x0;
                            fy = yf - y0;

                            w00 = (1 - fx) * (1 - fy);
                            w10 = fx * (1 - fy);
                            w01 = (1 - fx) * fy;
                            w11 = fx * fy;

                            row0 = y0 * width;
                            row1 = y1 * width;

                            sp00 = src32[row0 + x0];
                            sp10 = src32[row0 + x1];
                            sp01 = src32[row1 + x0];
                            sp11 = src32[row1 + x1];

                            wt = weights ? (weights[s] * norm) : (1.0 / S_eff);

                            accR += (
                                (sp00 & 255) * w00
                                + (sp10 & 255) * w10
                                + (sp01 & 255) * w01
                                + (sp11 & 255) * w11
                                ) * wt;

                            accG += (
                                ((sp00 >>> 8) & 255) * w00
                                + ((sp10 >>> 8) & 255) * w10
                                + ((sp01 >>> 8) & 255) * w01
                                + ((sp11 >>> 8) & 255) * w11
                                ) * wt;

                            accB += (
                                ((sp00 >>> 16) & 255) * w00
                                + ((sp10 >>> 16) & 255) * w10
                                + ((sp01 >>> 16) & 255) * w01
                                + ((sp11 >>> 16) & 255) * w11
                                ) * wt;

                            accA += (
                                ((sp00 >>> 24) & 255) * w00
                                + ((sp10 >>> 24) & 255) * w10
                                + ((sp01 >>> 24) & 255) * w01
                                + ((sp11 >>> 24) & 255) * w11
                                ) * wt;
                        }
                    }

                    A_keep = aSrc;

                    R = accR;
                    G = accG;
                    B = accB;

                    if (includeAlpha) Aout = accA;
                    else {

                        eps = 1e-6;
                        scale = (accA > eps) ? (A_keep / accA) : 0.0;

                        R *= scale;
                        G *= scale;
                        B *= scale;
                        Aout = A_keep;
                    }

                    Ri = _min(_max(R | 0, 0), 255);
                    Gi = _min(_max(G | 0, 0), 255);
                    Bi = _min(_max(B | 0, 0), 255);
                    Ai = _min(_max(Aout | 0, 0), 255);

                    if (writePacked) {

                        packed = (Ai << 24) | (Bi << 16) | (Gi << 8) | Ri;

                        outPacked32[p] = allChannels ? packed : ((srcPix & NOT_INC) | (packed & INC_MASK));
                    }
                    else {

                        outR[p] = Ri;
                        outG[p] = Gi;
                        outB[p] = Bi;
                        outA[p] = Ai;
                    }
                }
            }
            return writePacked ? null : { outR, outG, outB, outA };
        };

        if (!multiscale) runAtSize(width, height, cx, cy, true, out32);
        else {

            const W2  = (width  >> 1) || 1,
                H2  = (height >> 1) || 1,
                cx2 = cx * W2 / width,
                cy2 = cy * H2 / height,
                planes = runAtSize(W2, H2, cx2|0, cy2|0, false, null);

            const { outR, outG, outB, outA } = planes;

            const keyUp = `zoom-blur::upsampled::${width}x${height}`;
            const up = getWorkstoreItem(keyUp) || {};

            if (!up.R || up.R.length !== pixels) {

                up.R = new Float32Array(pixels);
                up.G = new Float32Array(pixels);
                up.B = new Float32Array(pixels);
                up.A = new Float32Array(pixels);
            }

            setWorkstoreItem(keyUp, up);

            const up2 = (src,dst) => {

                let y, y0, y1, fy, row0, row1,
                    x, x0, x1, fx, a, b, c, d, ab, cd;

                for (y = 0; y < height; y++) {

                    y0 = y >> 1;
                    y1 = _min(y0 + 1, H2 - 1);
                    fy = (y & 1) * 0.5;
                    row0 = y0 * W2;
                    row1 = y1 * W2;

                    for (x = 0; x < width; x++) {

                        x0 = x >> 1;
                        x1 =_min(x0 + 1, W2 - 1);
                        fx = (x & 1) * 0.5;

                        a = src[row0 + x0];
                        b = src[row0 + x1];
                        c = src[row1 + x0];
                        d = src[row1 + x1];

                        ab = a + (b - a) * fx;
                        cd = c + (d - c) * fx;

                        dst[y * width + x] = ab + (cd - ab) * fy;
                    }
                }
            };

            up2(outR, up.R);
            up2(outG, up.G);
            up2(outB, up.B);
            up2(outA, up.A);

            const allCh = (INC_MASK === 0xFFFFFFFF >>> 0);

            let p, srcPix, A_keep,
                R, G, B, Aout,
                Ri, Gi, Bi, Ai, packed,
                eps, scale;

            for (p = 0; p < pixels; p++){

                srcPix = src32[p];

                A_keep = (srcPix >>> 24) & 255;

                R = up.R[p];
                G = up.G[p];
                B = up.B[p];

                if (includeAlpha) Aout = up.A[p];
                else {

                    eps = 1e-6;
                    scale = (up.A[p] > eps)
                        ? (A_keep / up.A[p])
                        : 0.0;

                    R *= scale;
                    G *= scale;
                    B *= scale;
                    Aout = A_keep;
                }

                Ri = _min(_max(R | 0, 0), 255);
                Gi = _min(_max(G | 0, 0), 255);
                Bi = _min(_max(B | 0, 0), 255);
                Ai = _min(_max(Aout | 0, 0), 255);

                if (excludeTransparentPixels && ((srcPix >>> 24) & 255) === 0) {

                    out32[p] = srcPix;
                    continue;
                }

                packed = (Ai << 24) | (Bi << 16) | (Gi << 8) | Ri;

                out32[p] = allCh
                    ? packed
                    : ((srcPix & NOT_INC) | (packed & INC_MASK));
            }
        }

        if (premultiply) unpremultiply_u32(out32, pixels);

        if (lineOut) processResults(output, input, 1 - opacity);
        else processResults(cache.work, output, opacity);
    },
};

// We need an animation object to go through all the filters at the very end of the Display cycle RAF (request animation frame) and reset their `dirtyFilterIdentifier` flag to false.
makeAnimation({

    name: 'SC-core-filters-cleanup-action',
    order: 999,
    fn: function () {

        filternames.forEach(name => {

            const f = filter[name];

            if (f) f.dirtyFilterIdentifier = false;
        });

        stylesnames.forEach(name => {

            const s = styles[name];

            if (s) s.dirtyFilterIdentifier = false;
        });
    },
});


// #### Factory
constructors.FilterEngine = FilterEngine;

// Create a singleton filter engine, for export and use within this code base
export const filterEngine = new FilterEngine();
