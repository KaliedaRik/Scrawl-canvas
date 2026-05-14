// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, easeEngines, generateIdForArtefact, isa_fn, λfirstArg } from './utilities.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';
import { checkForWorkstoreItem, getWorkstoreItem, setWorkstoreItem } from './workstore.js';
import { seededRandomNumberGenerator } from './random-seed.js';
import { bluenoise, orderedNoise } from './filter-engine-bluenoise-data.js';
import { makeNoiseAsset } from '../asset-management/noise-asset.js';

// Shared constants
import { _abs, _atan2, _ceil, _cos, _floor, _isArray, _isFinite, _max, _min, _piHalf, _pow, _radian, _round, _sin, _sqrt, ADD_EASE, ADD_MAP_DISPLACE, ADD_NOISE, ADD_RIPPLE, ADD_WAVE, AFTER_SPREAD, BEFORE_SPREAD, BLUENOISE, BOTTOM, CENTER, DEFAULT_SEED, LEFT, ON_COORDINATES, ORDERED, PERMITTED_NOISE, RANDOM, REFLECT, REPEAT, RIGHT, T_GRADIENT, T_RADIAL_GRADIENT, T_CONIC_GRADIENT, TOP, TRANSPARENT } from './shared-vars.js';

// Local constants
const T_GRADIENT_ENGINE = 'GradientEngine',
    X = 'x',
    Y = 'y',
    BOTH = 'both';

// Build out the local noise asset
const noiseAsset = makeNoiseAsset({
    name: 'SC-gradient-engine-noise-asset',
});

console.log(noiseAsset);

const {
    element: noiseElement,
    engine: noiseEngine,
    stateAttributeDefaults: noiseDefs,  
    currentAttributeValues: noiseVals,
} = noiseAsset;


// #### GradientEngine constructor
const GradientEngine = function () { return this };


// #### GradientEngine prototype
const P = GradientEngine.prototype = doCreate();
P.type = T_GRADIENT_ENGINE;


// #### The main entry into the engine
P.action = function (packet) {

    const { entity, fixedGradientData: gradient, identifier, imageData, matrix } = packet;

    if (identifier) {

        // Entity has a cached imageData object in the workstore?
        const itemInWorkstore = checkForWorkstoreItem(identifier);
        if (itemInWorkstore) return true;

        // See if we have a stashed gradient
        if (!gradient.identifier) return false;

        const { width, height, data } = imageData;

        const gradientId = `${gradient.identifier}-${width}-${height}`;

        let gradientData = getWorkstoreItem(gradientId);

        // Build the gradient ImageData object, if required
        if (!gradientData) {

            updateOperationsCache(gradient.operations);

            const coords = getGradientCoordinates(gradient, width, height);

            if (!coords.length) return false;

            if (gradient.type === T_GRADIENT) gradientData = applyLinearGradient(gradient, coords, width, height);
            if (gradient.type === T_RADIAL_GRADIENT) gradientData = applyRadialGradient(gradient, coords, width, height);
            if (gradient.type === T_CONIC_GRADIENT) gradientData = applyConicGradient(gradient, coords, width, height);

            if (gradientData) setWorkstoreItem(gradientId, gradientData);
            else return false;
        }

        // Apply the gradient to the entity
        const workData = new ImageData(new Uint8ClampedArray(data.length), width, height);

        const result = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            imageData: null,
        };

        if (gradient.lockedToEntity) applyEntityLockedGradient(result, imageData, workData, gradientData, gradientId, width, height, entity, matrix);
        else  applyCellLockedGradient(result, imageData, workData, gradientData, width, height);

        // Store the entity's gradient-applied image
        if (result.w && result.h && result.imageData) {

            setWorkstoreItem(identifier, result);
            return true;
        }
    }

    // If we failed to generate an image for the gradient, return false
    // + Any false return means the entity will be stamped elsewhere as if no gradient had been applied to it (usulally it will be stamped using opaque black fill and stroke values)
    return false;
};


// ### Gradient actions
const getGradientCoordinates = function (gradient, width, height) {

    const cleanPosition = (val, dim)  => {

        let res = 0;

        if (val.toFixed) res = val;
        else if (val === LEFT || val === TOP) res = 0;
        else if (val === RIGHT || val === BOTTOM) res = dim;
        else if (val === CENTER) res = dim / 2;
        else if (!_isFinite(parseFloat(val))) res = 0;
        else res = (parseFloat(val) / 100) * dim;

        return res;
    };

    const cleanRadius = function (val, dim) {

        if (_isFinite(val)) return val;

        else {

            val = parseFloat(val);

            if (!_isFinite(val)) return 0;

            return ( val / 100) * dim;
        }
    };

    switch (gradient.type) {

        case T_GRADIENT : {

            let [sx, sy] = gradient.start;
            let [ex, ey] = gradient.end;

            sx = cleanPosition(sx, width);
            sy = cleanPosition(sy, height);
            ex = cleanPosition(ex, width);
            ey = cleanPosition(ey, height);

            return [sx, sy, ex, ey];
        }

        case T_RADIAL_GRADIENT : {

            let [sx, sy] = gradient.start;
            let [ex, ey] = gradient.end;

            let sr = gradient.startRadius,
                er = gradient.endRadius;

            sx = cleanPosition(sx, width);
            sy = cleanPosition(sy, height);
            sr = cleanRadius(sr, width);

            ex = cleanPosition(ex, width);
            ey = cleanPosition(ey, height);
            er = cleanRadius(er, width);

            return [sx, sy, sr, ex, ey, er];
        }

        case T_CONIC_GRADIENT : {

            let [sx, sy] = gradient.start;

            sx = cleanPosition(sx, width);
            sy = cleanPosition(sy, height);

            const a = gradient.angle * _radian;

            return [a, sx, sy];
        }

        default :
            return [];
    }
};

const applyLinearGradient = function (gradient, coords, width, height) {

    if (!gradient.stopsData || !coords.length) return false;

    const [x0, y0, x1, y1] = coords,
        dx = x1 - x0,
        dy = y1 - y0,
        len2 = (dx * dx) + (dy * dy);

    if (!len2) return false;

    const { gData, pixels, pz, engines } = getGradientRenderData(gradient, width, height),
        { onCoordinatesEngine } = engines;

    const xStep = dx / len2,
        yStep = dy / len2,
        rowReset = yStep - (width * xStep);

    if (onCoordinatesEngine === λfirstArg) {

        let p = 0,
            rowEnd = width,
            t = ((-x0 * dx) + (-y0 * dy)) / len2,
            color;

        for (; p < pz; p++) {

            color = getGradientColor(gradient, t, engines);
            if (color) pixels[p] = color;

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
            color, sampleX, sampleY, t;

        for (; p < pz; p++) {

            coord[0] = x;
            coord[1] = y;

            onCoordinatesEngine(coord, p, width, height);

            sampleX = coord[0];
            sampleY = coord[1];

            t = (((sampleX - x0) * dx) + ((sampleY - y0) * dy)) / len2;

            color = getGradientColor(gradient, t, engines);
            if (color) pixels[p] = color;

            x++;
            if (x >= width) {

                x = 0;
                y++;
            }
        }
    }

    return gData;
};

const applyRadialGradient = function (gradient, coords, width, height) {

    if (!gradient.stopsData || !coords.length) return false;

    const [x0, y0, r0, x1, y1, r1] = coords,
        cx = x1 - x0,
        cy = y1 - y0,
        cr = r1 - r0,
        qa = (cx * cx) + (cy * cy) - (cr * cr),
        nearZeroQa = _abs(qa) < 0.000001,
        twoQa = 2 * qa;

    const { gData, pixels, pz, engines } = getGradientRenderData(gradient, width, height),
        { onCoordinatesEngine } = engines;

    const coord = [0, 0];

    let p = 0,
        x = 0,
        y = 0,
        sampleX, sampleY,
        px, py,
        qb, qc, disc, root,
        t, t1, t2,
        rad1, rad2,
        color;

    for (; p < pz; p++) {

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

        t = null;

        if (nearZeroQa) {

            if (_abs(qb) >= 0.000001) {

                t = -qc / qb;

                if ((r0 + (t * cr)) < 0) t = null;
            }
        }
        else {

            disc = (qb * qb) - (4 * qa * qc);

            if (disc >= 0) {

                root = _sqrt(disc);

                t1 = (-qb - root) / twoQa;
                t2 = (-qb + root) / twoQa;

                rad1 = r0 + (t1 * cr);
                rad2 = r0 + (t2 * cr);

                if (rad1 >= 0 && rad2 >= 0) t = (t1 < t2) ? t1 : t2;
                else if (rad1 >= 0) t = t1;
                else if (rad2 >= 0) t = t2;
            }
        }

        if (t != null) {

            color = getGradientColor(gradient, t, engines);
            if (color) pixels[p] = color;
        }

        x++;
        if (x === width) {

            x = 0;
            y++;
        }
    }
    return gData;
};

const applyConicGradient = function (gradient, coords, width, height) {

    if (!gradient.stopsData || !coords.length) return false;

    const startAngle = coords[0],
        cx = coords[1],
        cy = coords[2];

    let angleRange = parseFloat(gradient.angleRange);

    if (!_isFinite(angleRange) || angleRange <= 0) angleRange = 360;
    else if (angleRange > 360) angleRange = 360;

    const range = angleRange * _radian,
        fullCircle = angleRange >= 360;

    let swirlDistance = parseFloat(gradient.swirlDistance);

    if (!_isFinite(swirlDistance) || swirlDistance <= 0) swirlDistance = 0;

    const swirlClockwise = gradient.swirlClockwise !== false,
        swirlDirection = swirlClockwise ? 1 : -1;

    const { gData, pixels, pz, engines } = getGradientRenderData(gradient, width, height),
        { onCoordinatesEngine } = engines;

    const tau = Math.PI * 2,
        spare = tau - range,
        halfSpare = spare / 2,
        swirlFactor = swirlDistance ? (swirlDirection * tau / swirlDistance) : 0,
        coord = [0, 0];

    let p = 0,
        x = 0,
        y = 0,
        sampleX, sampleY,
        dx, dy, angle, diff,
        t, color;

    for (; p < pz; p++) {

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

        color = getGradientColor(gradient, t, engines, {
            fullCircle,
            diff,
            range,
            halfSpare,
        });

        if (color) pixels[p] = color;

        x++;
        if (x === width) {

            x = 0;
            y++;
        }
    }
    return gData;
};

// Helper function
const clampUnit = function (v) {

    if (v < 0) return 0;
    if (v > 1) return 1;
    return v;
};

const getGradientColor = function (gradient, t, engines, conicData = null) {

    const {
        beforeSpreadEngine,
        afterSpreadEngine,
        easingEngine,
    } = engines;

    const spread = gradient.spread,
        stopsData = gradient.stopsData;

    t = beforeSpreadEngine(t);

    if (spread === TRANSPARENT) {

        if (conicData && conicData.fullCircle) t -= _floor(t);
        else if (t < 0 || t > 1) return 0;
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

        if (
            conicData &&
            !conicData.fullCircle &&
            t > 1
        ) {

            t = ((conicData.diff - conicData.range) <= conicData.halfSpare) ? 1 : 0;
        }
        else t = clampUnit(t);
    }

    t = clampUnit(t);

    t = afterSpreadEngine(t);

    if (easingEngine) t = easingEngine(t);

    t = clampUnit(t);

    return stopsData[getPaletteIndex(gradient, t)];
};

const getGradientRenderData = function (gradient, width, height) {

    const gData = new ImageData(width, height),
        d = gData.data,
        pixels = new Uint32Array(d.buffer, d.byteOffset, d.byteLength >>> 2),
        easing = gradient.easing;

    return {
        gData,
        pixels,
        pz: pixels.length,
        engines: {
            beforeSpreadEngine: getBeforeSpreadOperation(gData),
            afterSpreadEngine: getAfterSpreadOperation(gData),
            onCoordinatesEngine: getOnCoordinatesOperation(gData),
            easingEngine: isa_fn(easing) ? easing : easeEngines[easing],
        },
    };
};


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


// ### Apply gradient data to entitys
const applyEntityLockedGradient = function (result, imageData, workData, gradientData, gradientId, width, height, entity, matrix) {

    const entityScale = entity.currentScale || 1,
        entityScalesLine = entity.scaleOutline,

        [entityWidth, entityHeight] = entity.get('dimensions'),
        [handleX, handleY] = entity.get('handle'),

        entityLineWidth = entity.get('lineWidth') || 0,
        entityScaledLine = entityScalesLine ? entityLineWidth * entityScale : entityLineWidth,

        lineOffset = entityScaledLine / 2,

        localHandleX = getCoordinateValue(handleX, entityWidth) * entityScale,
        localHandleY = getCoordinateValue(handleY, entityHeight) * entityScale,

        localWidth = _ceil((entityWidth * entityScale) + entityScaledLine),
        localHeight = _ceil((entityHeight * entityScale) + entityScaledLine);

    const localGradientId = `${gradientId}-for-${localWidth}-${localHeight}`;

    let localGradientData = getWorkstoreItem(localGradientId);

    if (!localGradientData) {

        const tmpSrc = requestCell(),
            tmpDest = requestCell();

        const { element: tmpSrcEl, engine: tmpSrcEng } = tmpSrc,
            { element: tmpDestEl, engine: tmpDestEng } = tmpDest;

        tmpSrcEl.width = width;
        tmpSrcEl.height = height;
        tmpSrcEng.putImageData(gradientData, 0, 0);

        tmpDestEl.width = localWidth;
        tmpDestEl.height = localHeight;
        tmpDestEng.drawImage(tmpSrcEl, 0, 0, width, height, 0, 0, localWidth, localHeight);

        localGradientData = tmpDestEng.getImageData(0, 0, localWidth, localHeight);

        releaseCell(tmpSrc, tmpDest);

        setWorkstoreItem(localGradientId, localGradientData);
    }

    const inverseMatrix = matrix.inverse();

    const iData = imageData.data,
        iPix = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
        iLen = iPix.length,

        gData = localGradientData.data,
        gPix = new Uint32Array(gData.buffer, gData.byteOffset, gData.byteLength >>> 2),

        wData = workData.data,
        wPix = new Uint32Array(wData.buffer, wData.byteOffset, wData.byteLength >>> 2);

    let minX = width,
        minY = height,
        maxX = 0,
        maxY = 0,
        x = 0,
        y = 0,
        cursor = 0,
        iChannels, alpha,
        localPoint, localX, localY, localCursor,
        gChannels, gAlpha, outAlpha;

    for (; cursor < iLen; cursor++) {

        iChannels = iPix[cursor];
        alpha = (iChannels >>> 24) & 0xFF;

        if (alpha) {

            localPoint = inverseMatrix.transformPoint(new DOMPoint(x, y));

            localX = _floor(localPoint.x + localHandleX + lineOffset);
            localY = _floor(localPoint.y + localHandleY + lineOffset);

            if (localX >= 0 && localX < localWidth && localY >= 0 && localY < localHeight) {

                localCursor = (localY * localWidth) + localX;

                gChannels = gPix[localCursor];
                gAlpha = gChannels >>> 24;
                outAlpha = ((alpha * gAlpha) / 255) | 0;

                if (outAlpha) {

                    wPix[cursor] = ((outAlpha << 24) | (gChannels & 0x00ffffff)) >>> 0;
                }
            }

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        x++;

        if (x === width) {

            x = 0;
            y++;
        }
    }

    if (maxX < minX || maxY < minY) return false;

    const resWidth = maxX - minX + 1,
        resHeight = maxY - minY + 1,
        trimmedImage = new ImageData(new Uint8ClampedArray(resWidth * resHeight * 4), resWidth, resHeight),
        tData = trimmedImage.data,
        tPix = new Uint32Array(tData.buffer, tData.byteOffset, tData.byteLength >>> 2);

    let rows = 0,
        index, slice;

    for (; rows < resHeight; rows++) {

        index = ((minY + rows) * width) + minX;
        slice = wPix.slice(index, index + resWidth);
        tPix.set(slice, rows * resWidth);
    }

    result.x = minX;
    result.y = minY;
    result.w = resWidth;
    result.h = resHeight;
    result.imageData = trimmedImage;

    return true;
};

const applyCellLockedGradient = function (result, imageData, workData, gradientData, width, height) {

    const iData = imageData.data,
        iPix = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
        iLen = iPix.length,
        gData = gradientData.data,
        gPix = new Uint32Array(gData.buffer, gData.byteOffset, gData.byteLength >>> 2),
        wData = workData.data,
        wPix = new Uint32Array(wData.buffer, wData.byteOffset, wData.byteLength >>> 2);

    let minX = width,
        minY = height,
        maxX = 0,
        maxY = 0,
        x = 0,
        y = 0,
        cursor = 0,
        iChannels, alpha, gChannels, gAlpha, outAlpha;

    for (; cursor < iLen; cursor++) {

        iChannels = iPix[cursor];
        alpha = (iChannels >>> 24) & 0xFF;

        if (alpha) {

            gChannels = gPix[cursor];
            gAlpha = gChannels >>> 24;
            outAlpha = ((alpha * gAlpha) / 255) | 0;

            if (outAlpha) wPix[cursor] = ((outAlpha << 24) | (gChannels & 0x00ffffff)) >>> 0;

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        x++;

        if (x === width) {

            x = 0;
            y++;
        }
    }

    if (maxX < minX || maxY < minY) return false;

    const resWidth = maxX - minX + 1,
        resHeight = maxY - minY + 1,
        trimmedImage = new ImageData(new Uint8ClampedArray(resWidth * resHeight * 4), resWidth, resHeight),
        tData = trimmedImage.data,
        tPix = new Uint32Array(tData.buffer, tData.byteOffset, tData.byteLength >>> 2);

    let rows = 0,
        index, slice;

    for (; rows < resHeight; rows++) {

        index = ((minY + rows) * width) + minX;
        slice = wPix.slice(index, index + resWidth);
        tPix.set(slice, rows * resWidth);
    }

    result.x = minX;
    result.y = minY;
    result.w = resWidth;
    result.h = resHeight;
    result.imageData = trimmedImage;

    return true;
};


// ### Gradient operation functionality
// Operations are grouped by stage and compiled into per-stage operation chains
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

        case ADD_MAP_DISPLACE :
            return getMapDisplaceOperation(op, workData);

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

const getMapDisplaceOperation = function (op, workData) {

    const params = op.parameters || {},
        mapParams = params.noise || {},

        width = workData.width,
        height = workData.height,

        axis = (params.axis === Y || params.axis === BOTH) ? params.axis : X,

        strength = _isFinite(params.strength) ? params.strength : 20,
        offset = _isFinite(params.offset) ? params.offset : 0.5,
        linked = params.linked === true;

    if (!strength) return λfirstArg;

    if (axis === X) {

        const map = getNoiseMap(mapParams, width, height);

        return function (coord, p) {

            coord[0] += (map[p] - offset) * strength;
            return coord;
        };
    }

    if (axis === Y) {

        const map = getNoiseMap(mapParams, width, height);

        return function (coord, p) {

            coord[1] += (map[p] - offset) * strength;
            return coord;
        };
    }

    const xMap = getNoiseMap(linked ? mapParams : {
            ...mapParams,
            seed: `${mapParams.seed || DEFAULT_SEED}-x`,
        }, width, height),

        yMap = getNoiseMap(linked ? mapParams : {
            ...mapParams,
            seed: `${mapParams.seed || DEFAULT_SEED}-y`,
        }, width, height);

    return function (coord, p) {

        coord[0] += (xMap[p] - offset) * strength;
        coord[1] += (yMap[p] - offset) * strength;

        return coord;
    };
};

const getNoiseMap = function (noiseParams, width, height) {

    const params = {
        ...noiseDefs,
        width,
        height,
        ...noiseParams,
    };

    const name = buildNoiseMapId(params),
        cached = getWorkstoreItem(name);

    if (cached) return cached;

    noiseAsset.set(noiseDefs);
    noiseAsset.set({
        width,
        height,
    });
    noiseAsset.set(noiseParams);

    noiseAsset.cleanOutput();

    const rows = noiseAsset.noiseValues,
        out = new Float32Array(width * height);

    let p = 0;

    for (let y = 0; y < height; y++) {

        const row = rows[y];

        for (let x = 0; x < width; x++) {

            out[p++] = row[x];
        }
    }

    setWorkstoreItem(name, out);
    return out;
};

const buildNoiseMapId = function (p) {

    return [
        'gradient-engine-noise-map',
        p.width,
        p.height,
        p.seed,
        p.noiseEngine,
        p.size,
        p.scale,
        p.octaves,
        p.octaveFunction,
        p.persistence,
        p.lacunarity,
        p.smoothing,
        p.sumFunction,
        p.sineFrequencyCoeff,
        p.sumAmplitude,
        p.worleyOutput,
        p.worleyDepth,
    ].join('-');
};


// #### Factory
constructors.GradientEngine = GradientEngine;

// Create a singleton filter engine, for export and use within this code base
export const gradientEngine = new GradientEngine();
