// # Scrawl-canvas gradient engine
//
// **Important notice:** this engine extends the capability of classic Canvas API gradients, but does not replace them. 
// + Classic (pad) gradients - Gradient, RadialGradient, ConicGradient - are built into the browser and thus efficient and highly performative.
// + The software-extended gradients defined in this engine are significantly more expensive to render (~5-10% the performance of classic gradients in stress tests). Thus they should be used sparingly in performance-sensitive scenes.
//
// Classic gradients use `pad` spreading - the remaining space beyond a gradients borders are filled with the first and last colors of the gradient. These software-extended gradients introduce three new spreading strategies:
// + `repeat` - the gradient will repeat beyond its borders
// + `reflect` - the gradient will apply a reversed version of itself immediately beyond its borders, repeating as necessary across the page
// + `transparent` - the gradient will make all areas beyond its borders transparent
//
// The conic gradient also includes the following changes:
// + Introduces a new `angleRange` attribute. When set to less than 360 (degrees) the area beyond that angle is treated as spreading area to be filled with either pad, repeat, reflect or transparent color
// + Adds new `swirlDistance` and `swirlClockwise` attributes which will deform the gradient into a swirl pattern as it is applied.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, isa_fn } from '../helper/utilities.js';

import { easeEngines } from './utilities.js';

import { checkForWorkstoreItem, setWorkstoreItem } from './workstore.js';

// Shared constants
import { _abs, _atan2, _ceil, _cos, _floor, _isArray, _isFinite, _max, _min, _piHalf, _pow, _radian, _round, _sin, _sqrt, REFLECT, REPEAT, T_GRADIENT, T_RADIAL_GRADIENT, T_CONIC_GRADIENT, TRANSPARENT } from './shared-vars.js';

// Local constants
const T_GRADIENT_ENGINE = 'GradientEngine';


// #### GradientEngine constructor
const GradientEngine = function () { return this };


// #### GradientEngine prototype
const P = GradientEngine.prototype = doCreate();
P.type = T_GRADIENT_ENGINE;


// #### The main entry into the engine
P.action = function (packet) {

    const { imageData, fixedGradientData: gradient } = packet;

    const identifier = packet.identifier;

    if (identifier) {

        const itemInWorkstore = checkForWorkstoreItem(identifier);
        if (itemInWorkstore) return true;

        const { width, height, data } = imageData;

        const workData = new ImageData(new Uint8ClampedArray(data), width, height);

        let result;

        if (gradient.type === T_GRADIENT) result = this.applyLinearGradient(gradient, workData);
        if (gradient.type === T_RADIAL_GRADIENT) result = this.applyRadialGradient(gradient, workData);
        if (gradient.type === T_CONIC_GRADIENT) result = this.applyConicGradient(gradient, workData);

        if (result) {

            setWorkstoreItem(identifier, result);
            return true;
        }
    }
    // We should never reach this return
    return false;
};


// Helper function
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


// ### Gradient actions
P.applyLinearGradient = function (gradient, workData) {

    const stopsData = gradient.stopsData,
        args = gradient.coordinates,
        spread = gradient.spread;

    if (!stopsData || !args) return workData;

    const x0 = args[0],
        y0 = args[1],
        x1 = args[2],
        y1 = args[3];

    const dx = x1 - x0,
        dy = y1 - y0,
        len2 = (dx * dx) + (dy * dy);

    if (!len2) return workData;

    const d = workData.data,
        width = workData.width,
        pixels = new Uint32Array(d.buffer, d.byteOffset, d.byteLength >>> 2),
        pz = pixels.length;

    const easing = gradient.easing,
        engine = isa_fn(easing) ? easing : easeEngines[easing];

    const xStep = dx / len2,
        yStep = dy / len2,
        rowReset = yStep - (width * xStep);

    let p = 0,
        rowEnd = width,
        t = ((-x0 * dx) + (-y0 * dy)) / len2,
        v, rgba, alpha,
        index, color, outAlpha;

    for (; p < pz; p++) {

        rgba = pixels[p];
        alpha = rgba >>> 24;

        if (alpha) {

            v = t;

            if (spread === TRANSPARENT) {

                if (v < 0 || v > 1) {

                    pixels[p] = rgba & 0x00ffffff;
                    t += xStep;

                    if (p + 1 === rowEnd) {

                        t += rowReset;
                        rowEnd += width;
                    }
                    continue;
                }
            }
            else if (spread === REPEAT) {

                v -= _floor(v);
            }
            else if (spread === REFLECT) {

                v %= 2;
                if (v < 0) v += 2;
                if (v > 1) v = 2 - v;
            }

            if (v < 0) v = 0;
            else if (v > 1) v = 1;

            if (engine) v = engine(v);

            if (v < 0) v = 0;
            else if (v > 1) v = 1;

            index = this.getPaletteIndex(gradient, v);
            color = stopsData[index];

            outAlpha = ((alpha * (color >>> 24)) / 255) | 0;

            pixels[p] = ((outAlpha << 24) | (color & 0x00ffffff)) >>> 0;
        }

        t += xStep;

        if (p + 1 === rowEnd) {

            t += rowReset;
            rowEnd += width;
        }
    }
    return workData;
};

P.applyRadialGradient = function (gradient, workData) {

    const stopsData = gradient.stopsData,
        args = gradient.coordinates,
        spread = gradient.spread;

    if (!stopsData || !args) return workData;

    const x0 = args[0],
        y0 = args[1],
        r0 = args[2],
        x1 = args[3],
        y1 = args[4],
        r1 = args[5];

    const cx = x1 - x0,
        cy = y1 - y0,
        cr = r1 - r0,
        qa = (cx * cx) + (cy * cy) - (cr * cr),
        nearZeroQa = _abs(qa) < 0.000001,
        twoQa = 2 * qa;

    const d = workData.data,
        width = workData.width,
        pixels = new Uint32Array(d.buffer, d.byteOffset, d.byteLength >>> 2),
        pz = pixels.length;

    const easing = gradient.easing,
        engine = isa_fn(easing) ? easing : easeEngines[easing];

    let p = 0,
        x = 0,
        y = 0,
        rgba, alpha,
        px, py,
        qb, qc, disc, root,
        t, t1, t2,
        rad1, rad2,
        index, color, outAlpha;

    for (; p < pz; p++) {

        rgba = pixels[p];
        alpha = rgba >>> 24;

        if (alpha) {

            px = x - x0;
            py = y - y0;

            qb = -2 * ((px * cx) + (py * cy) + (r0 * cr));
            qc = (px * px) + (py * py) - (r0 * r0);

            if (nearZeroQa) {

                if (_abs(qb) < 0.000001) {

                    pixels[p] = rgba & 0x00ffffff;
                    x++;
                    if (x === width) { x = 0; y++; }
                    continue;
                }

                t = -qc / qb;

                if ((r0 + (t * cr)) < 0) {

                    pixels[p] = rgba & 0x00ffffff;
                    x++;
                    if (x === width) { x = 0; y++; }
                    continue;
                }
            }
            else {

                disc = (qb * qb) - (4 * qa * qc);

                if (disc < 0) {

                    pixels[p] = rgba & 0x00ffffff;
                    x++;
                    if (x === width) { x = 0; y++; }
                    continue;
                }

                root = _sqrt(disc);

                t1 = (-qb - root) / twoQa;
                t2 = (-qb + root) / twoQa;

                rad1 = r0 + (t1 * cr);
                rad2 = r0 + (t2 * cr);

                if (rad1 >= 0 && rad2 >= 0) t = (t1 < t2) ? t1 : t2;
                else if (rad1 >= 0) t = t1;
                else if (rad2 >= 0) t = t2;
                else {

                    pixels[p] = rgba & 0x00ffffff;
                    x++;
                    if (x === width) { x = 0; y++; }
                    continue;
                }
            }

            if (spread === TRANSPARENT) {

                if (t < 0 || t > 1) {

                    pixels[p] = rgba & 0x00ffffff;
                    x++;
                    if (x === width) { x = 0; y++; }
                    continue;
                }
            }
            else if (spread === REPEAT) t -= _floor(t);
            else if (spread === REFLECT) {

                t %= 2;
                if (t < 0) t += 2;
                if (t > 1) t = 2 - t;
            }

            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            if (engine) t = engine(t);

            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            index = this.getPaletteIndex(gradient, t);
            color = stopsData[index];

            outAlpha = ((alpha * (color >>> 24)) / 255) | 0;

            pixels[p] = ((outAlpha << 24) | (color & 0x00ffffff)) >>> 0;
        }

        x++;
        if (x === width) {

            x = 0;
            y++;
        }
    }
    return workData;
};

P.applyConicGradient = function (gradient, workData) {

    const stopsData = gradient.stopsData,
        args = gradient.coordinates,
        spread = gradient.spread;

    if (!stopsData || !args) return workData;

    const startAngle = args[0],
        cx = args[1],
        cy = args[2];

    let angleRange = parseFloat(gradient.angleRange);

    if (!_isFinite(angleRange) || angleRange <= 0) angleRange = 360;
    else if (angleRange > 360) angleRange = 360;

    const range = angleRange * _radian,
        fullCircle = angleRange >= 360;

    let swirlDistance = parseFloat(gradient.swirlDistance);

    if (!_isFinite(swirlDistance) || swirlDistance <= 0) swirlDistance = 0;

    const swirlClockwise = gradient.swirlClockwise !== false,
        swirlDirection = swirlClockwise ? 1 : -1;

    const d = workData.data,
        width = workData.width,
        pixels = new Uint32Array(d.buffer, d.byteOffset, d.byteLength >>> 2),
        pz = pixels.length;

    const easing = gradient.easing,
        engine = isa_fn(easing) ? easing : easeEngines[easing];

    const tau = Math.PI * 2,
        spare = tau - range,
        halfSpare = spare / 2,
        swirlFactor = swirlDistance ? (swirlDirection * tau / swirlDistance) : 0;

    let p = 0,
        x = 0,
        y = 0,
        rgba, alpha,
        dx, dy, angle, diff,
        t, index, color, outAlpha;

    for (; p < pz; p++) {

        rgba = pixels[p];
        alpha = rgba >>> 24;

        if (alpha) {

            dx = x - cx;
            dy = y - cy;

            angle = _atan2(dy, dx);

            if (swirlFactor) angle += _sqrt((dx * dx) + (dy * dy)) * swirlFactor;

            diff = (angle - startAngle) % tau;
            if (diff < 0) diff += tau;

            t = diff / range;

            if (spread === TRANSPARENT) {

                if (!fullCircle && (t < 0 || t > 1)) {

                    pixels[p] = rgba & 0x00ffffff;
                    x++;
                    if (x === width) { x = 0; y++; }
                    continue;
                }

                if (fullCircle) t -= _floor(t);
            }
            else if (spread === REPEAT) {

                t -= _floor(t);
            }
            else if (spread === REFLECT) {

                t %= 2;
                if (t < 0) t += 2;
                if (t > 1) t = 2 - t;
            }
            else {

                // PAD
                if (!fullCircle && t > 1) t = ((diff - range) <= halfSpare) ? 1 : 0;
                else {

                    if (t < 0) t = 0;
                    else if (t > 1) t = 1;
                }
            }

            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            if (engine) t = engine(t);

            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            index = this.getPaletteIndex(gradient, t);
            color = stopsData[index];

            outAlpha = ((alpha * (color >>> 24)) / 255) | 0;

            pixels[p] = ((outAlpha << 24) | (color & 0x00ffffff)) >>> 0;
        }

        x++;
        if (x === width) {

            x = 0;
            y++;
        }
    }
    return workData;
};


// #### Factory
constructors.GradientEngine = GradientEngine;

// Create a singleton filter engine, for export and use within this code base
export const gradientEngine = new GradientEngine();
