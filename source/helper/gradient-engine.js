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

import { doCreate, isa_fn, λfirstArg, λnull } from '../helper/utilities.js';

import { easeEngines } from './utilities.js';

import { checkForWorkstoreItem, getWorkstoreItem, setWorkstoreItem } from './workstore.js';
import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';
import { seededRandomNumberGenerator } from './random-seed.js';
import { bluenoise, orderedNoise } from './filter-engine-bluenoise-data.js';

// Shared constants
import { _abs, _atan2, _ceil, _cos, _floor, _isArray, _isFinite, _max, _min, _piHalf, _pow, _radian, _round, _sin, _sqrt, ADD_EASE, ADD_NOISE, ADD_RIPPLE, ADD_WAVE, AFTER_SPREAD, BEFORE_SPREAD, BLUENOISE, DEFAULT_SEED, ON_COORDINATES, ORDERED, PERMITTED_NOISE, RANDOM, REFLECT, REPEAT, T_GRADIENT, T_RADIAL_GRADIENT, T_CONIC_GRADIENT, TRANSPARENT } from './shared-vars.js';

// Local constants
const T_GRADIENT_ENGINE = 'GradientEngine',
    X = 'x',
    Y = 'y',
    BOTH = 'both';


// #### GradientEngine constructor
const GradientEngine = function () { return this };


// #### GradientEngine prototype
const P = GradientEngine.prototype = doCreate();
P.type = T_GRADIENT_ENGINE;


// #### The main entry into the engine
P.action = function (packet) {

    const { imageData, fixedGradientData: gradient, entity } = packet;

    const identifier = packet.identifier;

    if (identifier) {

        const itemInWorkstore = checkForWorkstoreItem(identifier);
        if (itemInWorkstore) return true;

        const { width, height, data } = imageData;

        const workData = new ImageData(new Uint8ClampedArray(data), width, height);

        updateOperationsCache(gradient.operations);

        let result;

        if (gradient.type === T_GRADIENT) result = applyLinearGradient(gradient, workData, entity);
        if (gradient.type === T_RADIAL_GRADIENT) result = applyRadialGradient(gradient, workData, entity);
        if (gradient.type === T_CONIC_GRADIENT) result = applyConicGradient(gradient, workData, entity);

        if (result) {

            setWorkstoreItem(identifier, result);
            return true;
        }
    }
    // We should never reach this return
    return false;
};


// ### Gradient actions
const applyLinearGradient = function (gradient, workData, entity) {

    const stopsData = gradient.stopsData,
        args = gradient.coordinates,
        spread = gradient.spread,
        lock = gradient.lockedToEntity;

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

    const beforeSpreadEngine = getBeforeSpreadOperation(workData),
        afterSpreadEngine = getAfterSpreadOperation(workData),
        onCoordinatesEngine = getOnCoordinatesOperation(workData, entity, lock);

    const easing = gradient.easing,
        engine = isa_fn(easing) ? easing : easeEngines[easing];

    const xStep = dx / len2,
        yStep = dy / len2,
        rowReset = yStep - (width * xStep);

    if (onCoordinatesEngine === λfirstArg) {

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

                v = beforeSpreadEngine(v);

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

                v = afterSpreadEngine(v);

                if (engine) v = engine(v);

                if (v < 0) v = 0;
                else if (v > 1) v = 1;

                index = getPaletteIndex(gradient, v);
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
    }
    else {

        const coord = [0, 0];

        let p = 0,
            x = 0,
            y = 0,
            sampleX, sampleY,
            v, rgba, alpha,
            index, color, outAlpha;

        for (; p < pz; p++) {

            rgba = pixels[p];
            alpha = rgba >>> 24;

            if (alpha) {

                coord[0] = x;
                coord[1] = y;

                onCoordinatesEngine(coord, p, width, workData.height);

                sampleX = coord[0];
                sampleY = coord[1];

                v = (((sampleX - x0) * dx) + ((sampleY - y0) * dy)) / len2;

                v = beforeSpreadEngine(v);

                if (spread === TRANSPARENT) {

                    if (v < 0 || v > 1) {

                        pixels[p] = rgba & 0x00ffffff;
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

                v = afterSpreadEngine(v);

                if (engine) v = engine(v);

                if (v < 0) v = 0;
                else if (v > 1) v = 1;

                index = getPaletteIndex(gradient, v);
                color = stopsData[index];

                outAlpha = ((alpha * (color >>> 24)) / 255) | 0;

                pixels[p] = ((outAlpha << 24) | (color & 0x00ffffff)) >>> 0;
            }

            x++;
            if (x >= width) {

                x = 0;
                y++;
            }
        }
    }
    return workData;
};

const applyRadialGradient = function (gradient, workData, entity) {

    const stopsData = gradient.stopsData,
        args = gradient.coordinates,
        spread = gradient.spread,
        lock = gradient.lockedToEntity;

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
        height = workData.height,
        pixels = new Uint32Array(d.buffer, d.byteOffset, d.byteLength >>> 2),
        pz = pixels.length;

    const beforeSpreadEngine = getBeforeSpreadOperation(workData),
        afterSpreadEngine = getAfterSpreadOperation(workData),
        onCoordinatesEngine = getOnCoordinatesOperation(workData, entity, lock);

    const easing = gradient.easing,
        engine = isa_fn(easing) ? easing : easeEngines[easing];

    const coord = [0, 0];

    let p = 0,
        x = 0,
        y = 0,
        rgba, alpha,
        sampleX, sampleY,
        px, py,
        qb, qc, disc, root,
        t, t1, t2,
        rad1, rad2,
        index, color, outAlpha;

    for (; p < pz; p++) {

        rgba = pixels[p];
        alpha = rgba >>> 24;

        if (alpha) {

            if (onCoordinatesEngine === λfirstArg) {

                sampleX = x;
                sampleY = y;
            }
            else {

                coord[0] = x;
                coord[1] = y;

                onCoordinatesEngine(coord, p, width, height);

                sampleX = coord[0];
                sampleY = coord[1];
            }

            px = sampleX - x0;
            py = sampleY - y0;

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

            t = beforeSpreadEngine(t);

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

            t = afterSpreadEngine(t);

            if (engine) t = engine(t);

            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            index = getPaletteIndex(gradient, t);
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

const applyConicGradient = function (gradient, workData, entity) {

    const stopsData = gradient.stopsData,
        args = gradient.coordinates,
        spread = gradient.spread,
        lock = gradient.lockedToEntity;

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
        height = workData.height,
        pixels = new Uint32Array(d.buffer, d.byteOffset, d.byteLength >>> 2),
        pz = pixels.length;

    const beforeSpreadEngine = getBeforeSpreadOperation(workData),
        afterSpreadEngine = getAfterSpreadOperation(workData),
        onCoordinatesEngine = getOnCoordinatesOperation(workData, entity, lock);

    const easing = gradient.easing,
        engine = isa_fn(easing) ? easing : easeEngines[easing];

    const tau = Math.PI * 2,
        spare = tau - range,
        halfSpare = spare / 2,
        swirlFactor = swirlDistance ? (swirlDirection * tau / swirlDistance) : 0;

    const coord = [0, 0];

    let p = 0,
        x = 0,
        y = 0,
        rgba, alpha,
        sampleX, sampleY,
        dx, dy, angle, diff,
        t, index, color, outAlpha;

    for (; p < pz; p++) {

        rgba = pixels[p];
        alpha = rgba >>> 24;

        if (alpha) {

            if (onCoordinatesEngine === λfirstArg) {

                sampleX = x;
                sampleY = y;
            }
            else {

                coord[0] = x;
                coord[1] = y;

                onCoordinatesEngine(coord, p, width, height);

                sampleX = coord[0];
                sampleY = coord[1];
            }

            dx = sampleX - cx;
            dy = sampleY - cy;

            angle = _atan2(dy, dx);

            if (swirlFactor) angle += _sqrt((dx * dx) + (dy * dy)) * swirlFactor;

            diff = (angle - startAngle) % tau;
            if (diff < 0) diff += tau;

            t = diff / range;

            t = beforeSpreadEngine(t);

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

            t = afterSpreadEngine(t);

            if (engine) t = engine(t);

            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            index = getPaletteIndex(gradient, t);
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

// Helper function
const getPaletteIndex = function (gradient, t) {

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


// ### Gradient operation functionality
// Currently we only allow one operation at each stage
const operationsCache = {
    [BEFORE_SPREAD]: [],
    [AFTER_SPREAD]: [],
    [ON_COORDINATES]: [],
};

const cleanOperationsCache = () => {

    operationsCache[BEFORE_SPREAD].length = 0;
    operationsCache[AFTER_SPREAD].length = 0;
    operationsCache[ON_COORDINATES].length = 0;
}

const updateOperationsCache = (operations = []) => {

    cleanOperationsCache();

    if (operations.length) {

        operationsCache[BEFORE_SPREAD].push(...operations.filter(op => op.stage === BEFORE_SPREAD));
        operationsCache[AFTER_SPREAD].push(...operations.filter(op => op.stage === AFTER_SPREAD));
        operationsCache[ON_COORDINATES].push(...operations.filter(op => op.stage === ON_COORDINATES));
    }
};

const buildOperationChain = function (engines) {

    if (!engines.length) return λfirstArg;

    if (engines.length === 1) return engines[0];

    return function (val, p, width, height) {

        for (let i = 0, iz = engines.length; i < iz; i++) {

            val = engines[i](val, p, width, height);
        }
        return val;
    };
};

const buildCoordinateOperationChain = function (engines) {

    if (!engines.length) return λfirstArg;

    if (engines.length === 1) return engines[0];

    return function (coord, p, width, height) {

        for (let i = 0, iz = engines.length; i < iz; i++) {

            engines[i](coord, p, width, height);
        }
        return coord;
    };
};

const compileOperation = function (op, workData, entity, lock) {

    switch (op.operation) {

        case ADD_NOISE :
            return getNoiseOperation(op, workData);

        case ADD_EASE :
            return getEasingOperation(op);

        case ADD_RIPPLE :
            return getRippleOperation(op, workData, entity, lock);

        case ADD_WAVE :
            return getWaveOperation(op);

        default :
            return λfirstArg;
    }
};

// Determine which operation, if any, should be applied at each stage
const getBeforeSpreadOperation = function (workData) {

    const ops = operationsCache[BEFORE_SPREAD],
        engines = [];

    ops.forEach(op => {

        const engine = compileOperation(op, workData);

        if (engine !== λfirstArg) engines.push(engine);
    });

    return buildOperationChain(engines);
};

const getAfterSpreadOperation = function (workData) {

    const ops = operationsCache[AFTER_SPREAD],
        engines = [];

    ops.forEach(op => {

        const engine = compileOperation(op, workData);

        if (engine !== λfirstArg) engines.push(engine);
    });

    return buildOperationChain(engines);
};

const getOnCoordinatesOperation = function (workData, entity, lock) {

    const ops = operationsCache[ON_COORDINATES],
        engines = [];

    ops.forEach(op => {

        const engine = compileOperation(op, workData, entity, lock);

        if (engine !== λfirstArg) engines.push(engine);
    });

    return buildCoordinateOperationChain(engines);
};

// Noise operations
const getNoiseOperation = function (op, workData) {

    const params = op.parameters || {},
        noise = params.noise;

    if (!PERMITTED_NOISE.includes(noise)) return λfirstArg;

    const strength = _isFinite(params.strength) ? params.strength : 0.05;

    const rnd = getRandomNumbers({
        seed: params.seed,
        length: workData.data.length >>> 2,
        imgWidth: workData.width,
        type: noise,
    });

    let rndCursor = -1;

    return function (val) {

        return val + ((rnd[++rndCursor] - 0.5) * strength);
    };
};

const getRandomNumbers = function (items = {}) {

    const {
        seed = DEFAULT_SEED,
        length = 0,
        imgWidth = 0,
        type = RANDOM,
    } = items;

    const name = `random-${seed}-${length}-${imgWidth}-${type}`,
        itemInWorkstore = getWorkstoreItem(name);

    if (itemInWorkstore) return itemInWorkstore;

    if ((type === BLUENOISE || type === ORDERED) && imgWidth) {

        const base = (type === BLUENOISE) ? bluenoise : orderedNoise,
            dim = (_sqrt(base.length) | 0),
            imgH = _ceil(length / imgWidth),
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


// Easing operations
const getEasingOperation = function (op) {

    const params = op.parameters || {},
        easing = params.easing,
        engine = isa_fn(easing) ? easing : easeEngines[easing];

    if (isa_fn(engine)) return engine;

    return λfirstArg;
};


// Coordinate operations
// + These operations have a known issue with entity-locked gradients, particularly when filipped or rotated. This is due to the discrepency between "global" cell coordinate space and "local" entity coordinate space. This also affects flipped cell-locked gradients.
const getCoordinateValue = function (coord, dimension) {

    if (coord.substring) {

        const val = parseFloat(coord);

        if (_isFinite(val)) return (val / 100) * dimension;

        return 0.5 * dimension;
    }

    return _isFinite(coord) ? coord : 0.5 * dimension;
};

const getWaveOperation = function (op) {

    const params = op.parameters || {};

    const axis = (params.axis === Y || params.axis === BOTH) ? params.axis : X,
        amplitude = _isFinite(params.amplitude) ? params.amplitude : 10,
        frequency = _isFinite(params.frequency) ? params.frequency : 0.05,
        phase = _isFinite(params.phase) ? params.phase : 0;

    return function (coord) {

        const x = coord[0],
            y = coord[1];

        if (axis === X) coord[0] = x + (_sin((y * frequency) + phase) * amplitude);

        else if (axis === Y) coord[1] = y + (_sin((x * frequency) + phase) * amplitude);

        else {

            coord[0] = x + (_sin((y * frequency) + phase) * amplitude);
            coord[1] = y + (_sin((x * frequency) + phase) * amplitude);
        }

        return coord;
    };
};

const getRippleOperation = function (op, workData, entity, lock) {

    const params = op.parameters || {};

    let width = workData.width,
        height = workData.height;

    if (lock && entity) {

        const [w, h] = entity.get('dimensions');

        width = w,
        height = h;
    }

    const amplitude = _isFinite(params.amplitude) ? params.amplitude : 10,
        frequency = _isFinite(params.frequency) ? params.frequency : 0.05,
        phase = _isFinite(params.phase) ? params.phase : 0;
    
    let originX = getCoordinateValue(params.originX, width),
        originY = getCoordinateValue(params.originY, height);

    return function (coord) {

        const x = coord[0],
            y = coord[1],

            dx = x - originX,
            dy = y - originY,

            dist = _sqrt((dx * dx) + (dy * dy));

        if (dist) {

            const offset = _sin((dist * frequency) + phase) * amplitude,
                ratio = offset / dist;

            coord[0] = x + (dx * ratio);
            coord[1] = y + (dy * ratio);
        }

        return coord;
    };
};


// #### Factory
constructors.GradientEngine = GradientEngine;

// Create a singleton filter engine, for export and use within this code base
export const gradientEngine = new GradientEngine();
