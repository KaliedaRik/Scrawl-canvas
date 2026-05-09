// # Scrawl-canvas gradient engine
import { constructors, styles, stylesnames } from '../core/library.js';

import { seededRandomNumberGenerator } from './random-seed.js';

import { doCreate, isa_fn } from '../helper/utilities.js';

import { easeEngines } from './utilities.js';

import { checkForWorkstoreItem, setWorkstoreItem } from './workstore.js';

import { colorEngine } from './color-engine.js';

import { releaseArray, requestArray } from './array-pool.js';

import { bluenoise } from './filter-engine-bluenoise-data.js';

// Shared constants
import { _abs, _atan2, _ceil, _cos, _floor, _isArray, _isFinite, _max, _min, _piHalf, _pow, _radian, _round, _sin, _sqrt, DRAW, FILL, REFLECT, REPEAT, T_GRADIENT, T_RADIAL_GRADIENT, T_CONIC_GRADIENT, TRANSPARENT } from './shared-vars.js';

// Local constants
const T_GRADIENT_ENGINE = 'GradientEngine';

let cache = null;


// #### GradientEngine constructor
const GradientEngine = function () {

    return this;
};


// #### GradientEngine prototype
const P = GradientEngine.prototype = doCreate();
P.type = T_GRADIENT_ENGINE;

P.action = function (packet) {

    const { imageData, gradient, entity, styleType } = packet;

    // Conic gradients are classic-only and should never be pushed to the gradient engine
    if (gradient.type === T_CONIC_GRADIENT) return false;

    const identifier = packet.identifier;

    if (identifier) {

        const itemInWorkstore = checkForWorkstoreItem(identifier);
        if (itemInWorkstore) return true;

        const { width, height, data } = imageData;

        const workData = new ImageData(new Uint8ClampedArray(data), width, height);

        let result;

        if (gradient.type === T_GRADIENT) {

            if (gradient.spread === REFLECT) result = this.applyLinearGradient(gradient, workData, REFLECT, entity, styleType);
            if (gradient.spread === REPEAT) result = this.applyLinearGradient(gradient, workData, REPEAT, entity, styleType);
            if (gradient.spread === TRANSPARENT) result = this.applyLinearGradient(gradient, workData, TRANSPARENT, entity, styleType);
        }

        if (gradient.type === T_RADIAL_GRADIENT) {

            if (gradient.spread === REFLECT) result = this.reflectRadialGradient(gradient, workData);
            if (gradient.spread === REPEAT) result = this.repeatRadialGradient(gradient, workData);
            if (gradient.spread === TRANSPARENT) result = this.transparentRadialGradient(gradient, workData);
        }

        if (result) {

            setWorkstoreItem(identifier, result);
            return true;
        }
    }
    
    // We should never reach this return
    return false;
};

P.getPaletteIndex = function (gradient, t) {

    const start = gradient.paletteStart,
        end = gradient.paletteEnd,
        cycle = gradient.cyclePalette;

    let index, span;

    if (start === end) return start;

    if (start < end) {

        span = end - start;
        index = start + (t * span);
    }
    else if (cycle) {

        span = (1000 - start) + end;
        index = start + (t * span);

        if (index > 999) index -= 1000;
    }
    else {

        span = start - end;
        index = start - (t * span);
    }

    index = _floor(index);

    if (index < 0) index = 0;
    else if (index > 999) index = 999;

    return index;
};


// ### Actions
P.applyLinearGradient = function (gradient, workData, spread, entity, styleType) {

    const palette = gradient.palette;
    if (!palette) return workData;

    const stopsData = palette.getStopsData(),
        args = gradient.gradientArgs;

    let x0 = args[0],
        y0 = args[1],
        x1 = args[2],
        y1 = args[3];

    const lockToEntity = entity && (
        (styleType === FILL && entity.lockFillStyleToEntity) ||
        (styleType === DRAW && entity.lockStrokeStyleToEntity)
    );

    if (lockToEntity) {

        const [x, y] = entity.currentStampPosition;

        x0 += x;
        y0 += y;
        x1 += x;
        y1 += y;
    }

    const dx = x1 - x0,
        dy = y1 - y0,
        len2 = (dx * dx) + (dy * dy);

    if (!len2) return workData;

    const d = workData.data,
        width = workData.width,
        height = workData.height;

    const easing = palette.easing,
        engine = isa_fn(easing) ? easing : easeEngines[easing];

    let x, y, i, a, t, index, stop;

    for (y = 0; y < height; y++) {

        for (x = 0; x < width; x++) {

            i = ((y * width) + x) * 4;
            a = d[i + 3];

            if (!a) continue;

            t = (((x - x0) * dx) + ((y - y0) * dy)) / len2;

            if (spread === TRANSPARENT) {

                if (t < 0 || t > 1) {

                    d[i + 3] = 0;
                    continue;
                }
            }
            else if (spread === REPEAT) {

                t = t - _floor(t);
            }
            else if (spread === REFLECT) {

                t = t % 2;
                if (t < 0) t += 2;
                if (t > 1) t = 2 - t;
            }

            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            if (engine) t = engine(t);

            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            index = this.getPaletteIndex(gradient, t);
            stop = index * 4;

            d[i] = stopsData[stop];
            d[i + 1] = stopsData[stop + 1];
            d[i + 2] = stopsData[stop + 2];
            d[i + 3] = _floor((a * stopsData[stop + 3]) / 255);
        }
    }

    return workData;
};

P.reflectRadialGradient = function (gradient, workData) {

    // Temporary manipulation for development - turn alpha cyan
    const d = workData.data,
        src32 = new Uint32Array(d.buffer, d.byteOffset, d.byteLength >>> 2);

    const r = 0,
        g = 255,
        b = 255;

    let rgba, a;

    for (let p = 0, pz = src32.length | 0; p < pz; p++) {

        rgba = src32[p];

        a = (rgba >>> 24) & 0xff;

        if (a) src32[p] = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
    }

    return workData;
};

P.repeatRadialGradient = function (gradient, workData) {

    // Temporary manipulation for development - turn alpha magenta
    const d = workData.data,
        src32 = new Uint32Array(d.buffer, d.byteOffset, d.byteLength >>> 2);

    const r = 255,
        g = 0,
        b = 255;

    let rgba, a;

    for (let p = 0, pz = src32.length | 0; p < pz; p++) {

        rgba = src32[p];

        a = (rgba >>> 24) & 0xff;

        if (a) src32[p] = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
    }

    return workData;
};

P.transparentRadialGradient = function (gradient, workData) {

    // Temporary manipulation for development - turn alpha yellow
    const d = workData.data,
        src32 = new Uint32Array(d.buffer, d.byteOffset, d.byteLength >>> 2);

    const r = 255,
        g = 255,
        b = 0;

    let rgba, a;

    for (let p = 0, pz = src32.length | 0; p < pz; p++) {

        rgba = src32[p];

        a = (rgba >>> 24) & 0xff;

        if (a) src32[p] = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
    }

    return workData;
};


// #### Factory
constructors.GradientEngine = GradientEngine;

// Create a singleton filter engine, for export and use within this code base
export const gradientEngine = new GradientEngine();
