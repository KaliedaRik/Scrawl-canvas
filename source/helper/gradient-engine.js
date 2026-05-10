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

    const { imageData, fixedGradientData: gradient, entity, styleType } = packet;

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

            if (gradient.spread === REFLECT) result = this.applyRadialGradient(gradient, workData, REFLECT, entity, styleType);
            if (gradient.spread === REPEAT) result = this.applyRadialGradient(gradient, workData, REPEAT, entity, styleType);
            if (gradient.spread === TRANSPARENT) result = this.applyRadialGradient(gradient, workData, TRANSPARENT, entity, styleType);
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
P.applyLinearGradient = function (gradient, workData, spread) {

    const stopsData = gradient.stopsData,
        args = gradient.coordinates;

    if (!stopsData || !args) return workData;

    let x0 = args[0],
        y0 = args[1],
        x1 = args[2],
        y1 = args[3];

    const dx = x1 - x0,
        dy = y1 - y0,
        len2 = (dx * dx) + (dy * dy);

    if (!len2) return workData;

    const d = workData.data,
        width = workData.width,
        height = workData.height;

    const easing = gradient.easing,
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


P.applyRadialGradient = function (gradient, workData, spread) {

    const stopsData = gradient.stopsData,
        args = gradient.coordinates;

    if (!stopsData || !args) return workData;

    let x0 = args[0],
        y0 = args[1],
        r0 = args[2],
        x1 = args[3],
        y1 = args[4],
        r1 = args[5];

    const cx = x1 - x0,
        cy = y1 - y0,
        cr = r1 - r0,
        qa = (cx * cx) + (cy * cy) - (cr * cr);

    const d = workData.data,
        width = workData.width,
        height = workData.height;

    const easing = gradient.easing,
        engine = isa_fn(easing) ? easing : easeEngines[easing];

    let x, y, i, alpha,
        px, py,
        qb, qc, disc, root,
        t, t1, t2,
        rad1, rad2,
        index, stop;

    for (y = 0; y < height; y++) {

        for (x = 0; x < width; x++) {

            i = ((y * width) + x) * 4;
            alpha = d[i + 3];

            if (!alpha) continue;

            px = x - x0;
            py = y - y0;

            qb = -2 * ((px * cx) + (py * cy) + (r0 * cr));
            qc = (px * px) + (py * py) - (r0 * r0);

            if (_abs(qa) < 0.000001) {

                if (_abs(qb) < 0.000001) {

                    d[i + 3] = 0;
                    continue;
                }

                t = -qc / qb;

                if ((r0 + (t * cr)) < 0) {

                    d[i + 3] = 0;
                    continue;
                }
            }
            else {

                disc = (qb * qb) - (4 * qa * qc);

                if (disc < 0) {

                    d[i + 3] = 0;
                    continue;
                }

                root = _sqrt(disc);

                t1 = (-qb - root) / (2 * qa);
                t2 = (-qb + root) / (2 * qa);

                rad1 = r0 + (t1 * cr);
                rad2 = r0 + (t2 * cr);

                if (rad1 >= 0 && rad2 >= 0) t = (t1 < t2) ? t1 : t2;
                else if (rad1 >= 0) t = t1;
                else if (rad2 >= 0) t = t2;
                else {

                    d[i + 3] = 0;
                    continue;
                }
            }

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
            d[i + 3] = _floor((alpha * stopsData[stop + 3]) / 255);
        }
    }

    return workData;
};

// #### Factory
constructors.GradientEngine = GradientEngine;

// Create a singleton filter engine, for export and use within this code base
export const gradientEngine = new GradientEngine();
