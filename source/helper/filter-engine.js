// # Scrawl-canvas filter engine
// All Scrawl-canvas filters-related image manipulation work happens in this engine code. Note that this functionality is entirely separate from the &lt;canvas> element's context engine's native `filter` functionality, which allows us to add CSS/SVG-based filters to the canvas context
// + Note that prior to v8.5.0 most of this code lived in an (asynchronous) web worker. Web worker functionality has now been removed from Scrawl-canvas as it was not adding sufficient efficiency to rendering speed


import { constructors, filter, filternames, styles, stylesnames } from '../core/library.js';

import { seededRandomNumberGenerator } from './random-seed.js';

import { correctAngle, doCreate, easeEngines, isa_fn } from './utilities.js';

import { checkForWorkstoreItem, getOrAddWorkstoreItem, getWorkstoreItem, setAndReturnWorkstoreItem, setWorkstoreItem } from './workstore.js';

import { colorEngine } from './color-engine.js';

import { makeAnimation } from '../factory/animation.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';

import { makeColor } from '../factory/color.js';

import { bluenoise } from './filter-engine-bluenoise-data.js';

// Shared constants
import { _abs, _ceil, _floor, _isArray, _isFinite, _max, _min, _round, _sqrt, ALPHA_TO_CHANNELS, ALPHA_TO_LUMINANCE, AREA_ALPHA, ARG_SPLITTER, AVERAGE_CHANNELS, BLACK_WHITE, BLEND, BLUENOISE, BLUR, CHANNELS_TO_ALPHA, CHROMA, CLAMP_CHANNELS, CLAMP_VALUES, CLEAR, COLOR, COLORS_TO_ALPHA, COMPOSE, CORRODE, DEFAULT_SEED, DESTINATION_OUT, DESTINATION_OVER, DISPLACE, DOWN, EMBOSS, FLOOD, GAUSSIAN_BLUR, GLITCH, GRAYSCALE, GREEN, INVERT_CHANNELS, LOCK_CHANNELS_TO_LEVELS, LUMINANCE_TO_ALPHA, MAP_TO_GRADIENT, MATRIX, MEAN, MODIFY_OK_CHANNELS, MODULATE_CHANNELS, MODULATE_OK_CHANNELS, MULTIPLY, NEGATIVE, NEWSPRINT, OFFSET, PIXELATE, PROCESS_IMAGE, RANDOM, RANDOM_NOISE, RECT_GRID, RED, REDUCE_PALETTE, ROTATE_HUE, ROUND, SET_CHANNEL_TO_LEVEL, SOURCE, SOURCE_IN, SOURCE_OUT, STEP_CHANNELS, SWIRL, THRESHOLD, TILES, TINT_CHANNELS, UP, USER_DEFINED_LEGACY, VARY_CHANNELS_BY_WEIGHTS, ZERO_STR } from './shared-vars.js';

// Local constants
const _exp = Math.exp,
    _256 = 256,
    _256_SQUARE = 256 * 256,
    BLUE = 'blue',
    COLOR_BURN = 'color-burn',
    COLOR_DODGE = 'color-dodge',
    COLOR_POINT_ARRAYS = 'color-point-arrays',
    CURRENT = 'current',
    DARKEN = 'darken',
    DESTINATION_ATOP = 'destination-atop',
    DESTINATION_IN = 'destination-in',
    DESTINATION_ONLY = 'destination-only',
    DIFFERENCE = 'difference',
    EXCLUSION = 'exclusion',
    GRAY_PALETTES = ['black-white', 'monochrome-4', 'monochrome-8', 'monochrome-16'],
    HARD_LIGHT = 'hard-light',
    HEX_GRID = 'hex-grid',
    HUE = 'hue',
    LIGHTEN = 'lighten',
    LIGHTER = 'lighter',
    LUMINOSITY = 'luminosity',
    MONOCHROME_16 = 'monochrome-16',
    MONOCHROME_4 = 'monochrome-4',
    MONOCHROME_8 = 'monochrome-8',
    NAIVE_GRAY_LUT = 'naive-gray-lut',
    ORDERED = 'ordered',
    OVERLAY = 'overlay',
    POINTS_ARRAY = 'points-array',
    RANDOM_POINTS = 'random-points',
    SATURATION = 'saturation',
    SCREEN = 'screen',
    SOFT_LIGHT = 'soft-light',
    SOURCE_ALPHA = 'source-alpha',
    SOURCE_ATOP = 'source-atop',
    SOURCE_ONLY = 'source-only',
    T_FILTER_ENGINE = 'FilterEngine',
    UNSET = 'unset',
    XOR = 'xor';

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

const LOW_ARRAY = new Uint8Array([0,255,0]),
    HIGH_ARRAY = new Uint8Array([0,255,255]);


// A backdoor to retrieve the last palette used by the `reduce-palette` filter
// + We use this in Demo filters-027 to report the colors used in the commonest colors palette
let lastUsedReducePalette = 'black-white';
const setLastUsedReducePalette = (val) => lastUsedReducePalette = val;
export const getLastUsedReducePalette = () => lastUsedReducePalette;


// #### FilterEngine constructor
const FilterEngine = function () {

    // ### Transactional variables

    // __cache__ - an Object consisting of `key:Object` pairs where the key is the named input of a `process-image` action or the output of any action object. This object is cleared and re-initialized each time the `engine.action` function is invoked
    this.cache = null;

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

        if (identifier) setWorkstoreItem(identifier, this.cache.work);

        return this.cache.work;
    }
    return image;
};


// ### Permanent variables

// `unknit` - called at the start of each new message action chain. Creates and populates the __source__ and __work__ objects from the image data supplied in the message
P.unknit = function (image) {

    this.cache = {};

    const cache = this.cache;

    const { width, height, data } = image;

    cache.source = new ImageData(new Uint8ClampedArray(data), width, height);
    cache.work = new ImageData(new Uint8ClampedArray(data), width, height);
};

// `getAlphaData` - extract alpha channel data from (usually the source) ImageData object and create an alpha coverage mask (alpha channel: 0, or 255 if value is > 0), at the same time setting each pixel's color channels to black
P.getAlphaData = function (image) {

    const { width, height, data:iData } = image,
        aImg = new ImageData(width, height),
        aData = aImg.data;

    for (let i = 3, len = iData.length; i < len; i += 4) {

        aData[i] = (iData[i] > 0) ? 255 : 0;
    }

    return aImg;
};


// ### Functions invoked by a range of different action functions
//
P.getRandomNumbers = function (items = {}) {

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

        let p = 0;

        for (let y = 0; y < imgH && p < length; y++) {

            const y0 = (y % dim) * dim;

            for (let x = 0; x < imgWidth && p < length; x++) {

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
P.buildTileRects = function (tileWidth, tileHeight, offsetX, offsetY, image) {

    if (!image) image = this.cache.source;

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

    const rects = [];

    for (let j = offY - tH; j < iHeight; j += tH) {

        const y0 = (j < 0 ? 0 : j),
            y1 = j + tH;

        if (y0 >= iHeight) break;

        const yEnd = (y1 > iHeight ? iHeight : y1);

        for (let i = offX - tW; i < iWidth; i += tW) {

            const x0 = (i < 0 ? 0 : i),
                x1 = i + tW;

            if (x0 >= iWidth) break;

            const xEnd = (x1 > iWidth ? iWidth : x1);

            if (x0 < xEnd && y0 < yEnd) rects.push(x0, y0, xEnd, yEnd);
        }
    }
    const out = new Int32Array(rects);
    setWorkstoreItem(name, out);

    return out;
};

// `buildGeneralTileSets` - separate the available space into a set of groups (tiles) and assign pixels to each group. Each tile centers on a `point` - an x/y coordinate; the calculations assign each pixel in the image to the group whose point it is closest to. Resulting object will be cached in the store
// + Used by the `tile` filter, but separated out as the data it generates may have uses elsewhere
P.buildGeneralTileSets = function (pointVals, tileWidth, tileHeight, tileRadius, offsetX, offsetY, angle, seed, image) {

    const { cache } = this;

    if (!image) image = cache.source;
    const { width:iWidth, height:iHeight } = image;

    if (iWidth && iHeight) {

        let tileW = 1,
            tileH = 1,
            tileR = 1,
            offX = 0,
            offY = 0,
            ang = 0,
            req = UNSET;

        // The `pointVals` data can be supplied in a number of different formats:
        // + As a String: `'rect-grid'` - the function will calculate a set of suitable points based on the source image's dimensions, and the user-defined `tileWidth`, `tileHeight`, `offsetX`, `offsetY` and `angle` arguments. This results in a rectangular grid of tiles (at most dimensions) which can be rotated to the required angle.
        // + As a String: `'hex-grid'` - the function will calculate a set of suitable points based on the source image's dimensions, and the user-defined `tileHeight`, `tileRadius`, `offsetX`, `offsetY` and `angle` arguments. This results in a hexagonal grid of tiles (at most dimensions) which can be rotated to the required angle. The shape of the hexagons in the grid depend on the interplay between the `tileHeight` and `tileRadius` values.
        // + As a positive integer Number - this is a request by the user for the function to semi-randomly generate a set of points to the given value, constrained to an area determined by the `tileRadius`, `offsetX`, `offsetY` and `angle` arguments. Unlike other versions, this version will only include pixels within the bounds of circle of the given radius centered on the supplied offset coordinate values. To vary the randomness of point generation, the user can supply a `seed` argument, used when initializing the pseudo-random number generator.
        // + As an Array of Numbers, which represent user-defined points across the image. Pixel selection for each point is constrained by the supplied `tileRadius`, `offsetX` and `offsetY` arguments.
        if (pointVals.substring) req = pointVals;
        else if (_isArray(pointVals)) req = POINTS_ARRAY;
        else if (_isFinite(pointVals)) req = RANDOM_POINTS;

        if (req === UNSET) return [];

        // The `tileWidth`, `tileHeight`, `tileRadius`, `offsetX` and `offsetY` arguments can be supplied as absolute Number values (in px), or as a String % value relative to the source image dimensions.
        // + `tileRadius` is relative to the source image's width
        if (tileWidth.substring) tileW = _round((parseFloat(tileWidth) / 100) * iWidth);
        else if (_isFinite(tileWidth)) tileW = tileWidth;
        if (tileW < 1) tileW = 1;

        if (tileHeight.substring) tileH = _round((parseFloat(tileHeight) / 100) * iHeight);
        else if (_isFinite(tileHeight)) tileH = tileHeight;
        if (tileH < 1) tileH = 1;

        if (tileRadius.substring) tileR = _round((parseFloat(tileRadius) / 100) * iWidth);
        else if (_isFinite(tileRadius)) tileR = tileRadius;
        if (tileR < 1) tileR = 1;

        if (offsetX.substring) offX = _round((parseFloat(offsetX) / 100) * iWidth);
        else if (_isFinite(offsetX)) offX = offsetX;
        if (offX < 0) offX = 0;
        else if (offX >= iWidth) offX = iWidth - 1;

        if (offsetY.substring) offY = _round((parseFloat(offsetY) / 100) * iHeight);
        else if (_isFinite(offsetY)) offY = offsetY;
        if (offY < 0) offY = 0;
        else if (offY >= iHeight) offY = iHeight - 1;

        // The `angle` argument is the rotation applied to the points (using the offset coordinate as the rotation point), measured in degrees.
        if (_isFinite(angle)) ang = angle;

        let name = `${req}-tileset-${iWidth}-${iHeight}-${tileW}-${tileH}-${tileR}-${offX}-${offY}-${ang}`;
        if (req === POINTS_ARRAY) name += `-${pointVals.join(ARG_SPLITTER)}`;
        else if (req === RANDOM_POINTS) name += `-${pointVals}-${seed}`;

        const itemInWorkstore = getWorkstoreItem(name);

        if (itemInWorkstore) return itemInWorkstore;

        if (req === RECT_GRID && tileW === 1 && tileH === 1) return getOrAddWorkstoreItem(name);

        const coord = requestCoordinate(),
            origin = [offX, offY],
            test = [0, 0];

        let tiles = [],
            points;

        const referencePoints = [],
            neighbourPoints = [];

        let h, hz, w, wz, x, xz, y, yz,
            pointsName = ZERO_STR;

        // Check to stop the hex grid breaking when user supplies an inappropriately low `tileHeight` argument value, compared to the value supplied in the `tileRadius` argument.
        if (req === HEX_GRID && tileH / tileR < 1.05) tileH = tileR * 1.05;

        const halfW = _floor(tileW / 2),
            halfH = _floor(tileH / 2),
            doubleR = tileR * 2,
            hexDown = _round((tileH / tileR) * tileR);

        let i, iz, cursor, ref,
            counter = 0,
            hexOffset = 0;

        switch (req) {

            case RECT_GRID :

                pointsName = `rect-grid-points-${iWidth}-${iHeight}-${tileW}-${tileH}-${offX}-${offY}`;
                points = getWorkstoreItem(pointsName);

                if (!points) {

                    const newPoints = [];

                    // Generates a set of initial points in an overlarge grid (for square tiles)
                    for (y = offY - (iHeight * 2) + halfH, yz = offY + (iHeight * 2) + halfH; y < yz; y += tileH) {

                        for (x = offX - (iWidth * 2) + halfW, xz = offX + (iWidth * 2) + halfW; x < xz; x += tileW) {

                            newPoints.push(x, y);
                        }
                    }

                    points = getOrAddWorkstoreItem(pointsName, newPoints);
                }
                break;

            case HEX_GRID :

                pointsName = `hex-grid-points-${iWidth}-${iHeight}-${tileR}-${offX}-${offY}`;
                points = getWorkstoreItem(pointsName);

                if (!points) {

                    const newPoints = [];

                    // Generates a set of initial points in an overlarge grid (for hexagonal tiles)
                    counter = 0;
                    for (y = offY - (iHeight * 2) + tileR, yz = offY + (iHeight * 2) + tileR; y < yz; y += hexDown) {

                        hexOffset = (counter % 2 === 0) ? tileR : 0;

                        for (x = offX - (iWidth * 2) + tileR + hexOffset, xz = offX + (iWidth * 2) + tileR; x < xz; x += doubleR) {

                            newPoints.push(x, y);
                        }
                        counter++;
                    }

                    points = getOrAddWorkstoreItem(pointsName, newPoints);
                }
                tileW = doubleR * 2;
                tileH = hexDown * 2;
                break;

            case RANDOM_POINTS :

                pointsName = `random-points-${iWidth}-${iHeight}-${tileR}-${offX}-${offY}-${pointVals}-${seed}`;
                points = getWorkstoreItem(pointsName);

                if (!points) {

                    const newPoints = [];

                    // Generates a set of initial random points withing the given constraints
                    const rnd = this.getRandomNumbers({
                        seed,
                        length: pointVals * 3,
                    });
                    let rndCursor = -1;

                    for (i = 0; i < pointVals; i++) {

                        coord.zero().add([rnd[++rndCursor], rnd[++rndCursor]]).rotate(rnd[++rndCursor] * 360).rotate(ang).scalarMultiply(tileR);

                        [x, y] = coord;
                        newPoints.push(_round(x), _round(y));
                    }

                    points = getOrAddWorkstoreItem(pointsName, newPoints);
                }
                tileW = tileR;
                tileH = tileR;
                break;

            case POINTS_ARRAY :

                pointsName = `defined-points-${iWidth}-${iHeight}-${tileR}-${pointVals.join(ARG_SPLITTER)}`;
                points = getWorkstoreItem(pointsName);

                if (!points) {

                    // User-generated points are not pre-processed. Note that the positioning of these points is relative to the offset coordinate values; users, when generating the point values, need to take this into account otherwise the end result may unexpectedly move towards (or beyond) the bottom-right part of the final image.
                    const newPoints = [...pointVals];

                    points = getOrAddWorkstoreItem(pointsName, newPoints);
                }

                tileW = tileR;
                tileH = tileR;
                break;
        }

        // Go through initial set of points
        counter = 0;

        for (i = 0, iz = points.length; i < iz; i += 2) {

            test[0] = points[i];
            test[1] = points[i + 1];

            coord.zero().add(test).rotate(ang).add(origin);

            [x, y] = coord;
            x = _round(x);
            y = _round(y);

            if ((x > -tileW) && (x < iWidth + tileW) && (y > -tileH) && (y < iHeight + tileH)) {

                cursor = ((iWidth * 2) * (iHeight * 2)) + ((y + _floor(iHeight / 2)) * iWidth) + (x + _floor(iWidth / 2));

                referencePoints[counter] = [x, y, cursor];
                tiles[cursor] = [];

                for (h = y - tileH, hz = y + tileH; h < hz; h++) {

                    for (w = x - tileW, wz = x + tileW; w < wz; w++) {

                        if (w >= 0 && w < iWidth && h >= 0 && h < iHeight) {

                            if (req === RANDOM_POINTS) {

                                if (coord.zero().subtract(origin).add([w, h]).getMagnitude() > tileR) continue;
                            }

                            ref = (h * iWidth) + w;
                            if (!neighbourPoints[ref]) neighbourPoints[ref] = [];
                            neighbourPoints[ref].push(counter);
                        }
                    }
                }
                counter++;
            }
        }

        // Sanity check, in case none of the points survived the previous manipulation
        if (!referencePoints.length) return referencePoints;

        // Assign pixels to tile buckets
        let minref, minlen, pixel, pixelRefs, distance;

        for (h = 0; h < iHeight; h++) {

            for (w = 0; w < iWidth; w++) {

                pixel = (h * iWidth) + w;

                test[0] = w;
                test[1] = h;

                pixelRefs = neighbourPoints[pixel];
                minref = -1;
                minlen = 0;

                if (pixelRefs) {

                    pixelRefs.forEach(r => {

                        [x, y, cursor] = referencePoints[r];

                        distance = coord.zero().add(test).subtract([x, y]).getMagnitude();

                        if (minref < 0 || distance < minlen) {

                            minref = cursor;
                            minlen = distance;
                        }
                    });
                }
                if (minref >= 0) tiles[minref].push(pixel);
            }
        }

        releaseCoordinate(coord);

        // Filter the tiles Array to remove undefined indexes, then stash the result in the workstore (for future quick-serve) and return the array.
        tiles = tiles.filter(t => t != null);

        setWorkstoreItem(name, tiles);
        return tiles;
    }
    return [];
};

// `getBlurPrefixBuffers` Prefix buffers for blur filter (inclusive prefix sums).
P.getBlurPrefixBuffers = function (len, axisKey) {

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
P.buildHorizontalBlur = function (gridWidth, gridHeight, radius) {

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
P.buildVerticalBlur = function (gridWidth, gridHeight, radius) {

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

// `buildMatrixGrid` - creates an Array of Arrays detailing which pixels contribute to each pixel's matrix calculation. Resulting object will be cached in the store
P.buildMatrixGrid = function (mWidth, mHeight, mX, mY, image) {

    const { cache } = this;

    if (!image) image = cache.source;

    const { width:iWidth, height:iHeight, data } = image;

    if (mWidth == null || mWidth < 1) mWidth = 1;
    if (mHeight == null || mHeight < 1) mHeight = 1;

    if (mX == null || mX < 0) mX = 0;
    else if (mX >= mWidth) mX = mWidth - 1;

    if (mY == null || mY < 0) mY = 0;
    else if (mY >= mHeight) mY = mHeight - 1;

    const name = `matrix-${iWidth}-${iHeight}-${mWidth}-${mHeight}-${mX}-${mY}`,
        itemInWorkstore = getWorkstoreItem(name);

    if (itemInWorkstore) return itemInWorkstore;

    const dataLength = data.length,
        cellsTemplate = [],
        grid = [];

    let x, xz, y, yz, i, iz, pos, cell, val;

    for (y = -mY, yz = mHeight - mY; y < yz; y++) {

        for (x = -mX, xz = mWidth - mX; x < xz; x++) {

            cellsTemplate.push(((y * iWidth) + x) * 4);
        }
    }

    for (y = 0; y < iHeight; y++) {

        for (x = 0; x < iWidth; x++) {

            pos = ((y * iWidth) + x) * 4;
            cell = [];

            for (i = 0, iz = cellsTemplate.length; i < iz; i++) {

                val = pos + cellsTemplate[i];

                if (val < 0) val += dataLength;
                else if (val >= dataLength) val -= dataLength;

                cell.push(val);
            }
            grid.push(cell);
        }
    }

    setWorkstoreItem(name, grid);
    return grid;
};

P.getMatrixOffsets = function (mWidth, mHeight, mX, mY, image) {

    if (!image) image = this.cache.source;

    const iWidth  = image.width | 0,
        iHeight = image.height | 0;

    mWidth = (_isFinite(mWidth) && mWidth > 0) ? mWidth | 0 : 1;
    mHeight = (_isFinite(mHeight) && mHeight > 0) ? mHeight | 0 : 1;

    mX = (_isFinite(mX) ? mX : 0) | 0;
    if (mX < 0) mX = 0;
    else if (mX >= mWidth) mX = mWidth  - 1;

    mY = (_isFinite(mY) ? mY : 0) | 0;
    if (mY < 0) mY = 0;
    else if (mY >= mHeight) mY = mHeight - 1;

    const name = `matrix-offsets-${iWidth}-${iHeight}-${mWidth}-${mHeight}-${mX}-${mY}`;

    let res = getWorkstoreItem(name);
    if (res) return res;

    res = new Int32Array(mWidth * mHeight);

    let p = 0,
        rowOff;

    for (let y = -mY, yz = mHeight - mY; y < yz; y++) {

        rowOff = (y * iWidth) << 2;

        for (let x = -mX, xz = mWidth - mX; x < xz; x++) {

            res[p++] = rowOff + (x << 2);
        }
    }
    setWorkstoreItem(name, res);
    return res;
};

// `cacheOutput` - insert an action function's output into the filter engine's cache
P.cacheOutput = function (name, obj) {

    this.cache[name] = obj;
};

// `getInputAndOutputLines` - determine, and return, the appropriate results object for the lineIn, lineMix and lineOut values supplied to each action function when it gets invoked
P.getInputAndOutputLines = function (requirements) {

    const { cache } = this;
    const sourceData = cache.source;

    let lineIn = cache.work,
        lineMix = false,
        alphaData = false;

    if (requirements.lineIn === SOURCE_ALPHA || requirements.lineMix === SOURCE_ALPHA) alphaData = this.getAlphaData(sourceData);

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
P.processResults = function (store, incoming, ratio) {

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

// `getGradientData` - create an imageData object containing the 256 values from a gradient that we require for doing filters work
P.getGradientData = function (gradient) {

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

P.transferDataUnchanged = function (oData, iData, len) {

    if (len === iData.length) oData.set(iData);
    else oData.set(iData.subarray(0, len));
};


// ## Filter action functions
// Each function is held in the `theBigActionsObject` object, for convenience
P.theBigActionsObject = {

// __alpha-to-channels__ - Copies the alpha channel value over to the selected value or, alternatively, sets that channel's value to zero, or leaves the channel's value unchanged. Setting the appropriate "includeChannel" flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate "excludeChannel" flag will set that channel's value to zero.
// __alpha-to-channels__ (32-bit view + byte masks)
    [ALPHA_TO_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            includeRed   = true,
            includeGreen = true,
            includeBlue  = true,
            excludeRed   = true,
            excludeGreen = true,
            excludeBlue  = true,
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

            for (let p = 0, pz = src32.length | 0, s, a; p < pz; p++) {

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __alpha-to-luminance__ - Sets the OKLAB luminance channel to the value of the alpha channel, then sets the alpha channel to opaque and the A and B channels to 0 (gray)
    [ALPHA_TO_LUMINANCE]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        const libs = colorEngine.getRgbOkCache();

        let r, g, b, a, i, L, _r, _g, _b, alpha;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            alpha = iData[a];

            if (alpha) {

                L = alpha / 256;
                if (L > 1) L = 1;
                else if (L < 0) L = 0;

                [_r, _g, _b] = colorEngine.getRgbValsForOklab(L, 0, 0, libs);

                oData[r] = _r;
                oData[g] = _g;
                oData[b] = _b;
                oData[a] = 255;
            }
            else {

                oData[r] = iData[r];
                oData[g] = iData[g];
                oData[b] = iData[b];
                oData[a] = 0;
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __area-alpha__ - Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to zero. Can be used to create horizontal or vertical bars, or chequerboard effects.
    [AREA_ALPHA]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len   = iData.length,
            width  = input.width,
            height = input.height;

        const {
            opacity = 1,
            tileWidth = 1,
            tileHeight = 1,
            offsetX = 0,
            offsetY = 0,
            gutterWidth = 1,
            gutterHeight = 1,
            // [core, bottom-strip, right-strip, bottom-right corner]
            areaAlphaLevels = [255, 0, 0, 0],
            lineOut,
        } = requirements;

        this.transferDataUnchanged(oData, iData, len);

        // Clamp/correct like the old builder did
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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __average-channels__ - Calculates an average value from each pixel's included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to 0.
    [AVERAGE_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        // 32-bit pixel views over the SAME buffers (respecting byteOffset/length)
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

            // Unpack channels (little-endian: R,G,B,A in least→most significant bytes)
            r =  rgba & 0xff;
            g = (rgba >>>  8) & 0xff;
            b = (rgba >>> 16) & 0xff;
            a = (rgba >>> 24) & 0xff;

            // If fully transparent, copy pixel exactly
            if (a === 0) {

                out32[p] = rgba;
                continue;
            }

            if (divisor) {

                // Sum only the included channels
                sum = (incR ? r : 0) + (incG ? g : 0) + (incB ? b : 0);

                // Integer average (floor). Using |0 for fast truncation.
                avg = (sum / divisor) | 0;

                // Apply exclude flags: excluded → 0, otherwise the average
                rOut = excR ? 0 : avg;
                gOut = excG ? 0 : avg;
                bOut = excB ? 0 : avg;
            } 
            else {

                // No channels included for averaging:
                // keep original channels unless excluded (then set to 0)
                rOut = excR ? 0 : r;
                gOut = excG ? 0 : g;
                bOut = excB ? 0 : b;
            }

            // Repack to one 32-bit pixel. >>>0 ensures unsigned.
            out32[p] = ((a << 24) | (bOut << 16) | (gOut << 8) | (rOut << 0)) >>> 0;
        }

        // Blend/route like the original
        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __blend__ - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using various separable and non-separable blend modes (as defined by the W3C Compositing and Blending Level 1 recommendations).
// + The blending method is determined by the String value supplied in the "blend" argument; permitted values are: 'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', and 'saturation'.
// + Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments.
    [BLEND]: function (requirements) {

        const copyPixel = function (fr, tr, data) {

            const fg = fr + 1,
                fb = fg + 1,
                fa = fb + 1,
                tg = tr + 1,
                tb = tg + 1,
                ta = tb + 1;

            oData[tr] = data[fr];
            oData[tg] = data[fg];
            oData[tb] = data[fb];
            oData[ta] = data[fa];
        };

        const getLinePositions = function (x, y) {

            const ix = x,
                iy = y,
                mx = x - offsetX,
                my = y - offsetY;

            let mPos = -1;

            const iPos = ((iy * iWidth) + ix) * 4;

            if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mPos = ((my * mWidth) + mx) * 4;

            return [iPos, mPos];
        };

        const getChannelNormals = function (irn, mrn) {

            const ign = irn + 1,
                ibn = ign + 1,
                ian = ibn + 1,
                mgn = mrn + 1,
                mbn = mgn + 1,
                man = mbn + 1;

            return [
                iData[irn] / 255,
                iData[ign] / 255,
                iData[ibn] / 255,
                iData[ian] / 255,
                mData[mrn] / 255,
                mData[mgn] / 255,
                mData[mbn] / 255,
                mData[man] / 255
            ];
        };

        const alphaCalc = (dA, mA) => (dA + (mA * (1 - dA))) * 255;

        const [input, output, mix] = this.getInputAndOutputLines(requirements);

        const {width:iWidth, height:iHeight, data:iData} = input;
        const {data:oData} = output;
        const {width:mWidth, height:mHeight, data:mData} = mix;

        const {
            opacity = 1,
            blend = ZERO_STR,
            offsetX = 0,
            offsetY = 0,
            lineOut,
        } = requirements;

        // Pixel calculations
        const colorburnCalc = (din, dmix) => {
            if (dmix === 1) return 255;
            else if (din === 0) return 0;
            return (1 - _min(1, ((1 - dmix) / din ))) * 255;
        };

        const colordodgeCalc = (din, dmix) => {
            if (dmix === 0) return 0;
            else if (din === 1) return 255;
            return _min(1, (dmix / (1 - din))) * 255;
        };

        const darkenCalc = (din, dmix) => (din < dmix) ? din : dmix;

        const differenceCalc = (din, dmix) => _abs(din - dmix) * 255;

        const exclusionCalc = (din, dmix) => (din + dmix - (2 * dmix * din)) * 255;

        const hardlightCalc = (din, dmix) => (din <= 0.5) ? (din * dmix) * 255 : (dmix + (din - (dmix * din))) * 255;

        const lightenCalc = (din, dmix) => (din > dmix) ? din : dmix;

        const lighterCalc = (din, dmix) => (din + dmix) * 255;

        const multiplyCalc = (din, dmix) => din * dmix * 255;

        const overlayCalc = (din, dmix) => (din >= 0.5) ? (din * dmix) * 255 : (dmix + (din - (dmix * din))) * 255;

        const screenCalc = (din, dmix) => (dmix + (din - (dmix * din))) * 255;

        const softlightCalc = (din, dmix) => {
            const d = (dmix <= 0.25) ?
                ((((16 * dmix) - 12) * dmix) + 4) * dmix :
                _sqrt(dmix);

            if (din <= 0.5) return (dmix - ((1 - (2 * din)) * dmix * (1 - dmix))) * 255;
            return (dmix + (((2 * din) - 1) * (d - dmix))) * 255;
        };


        const normalCalc = (Cs, As, Cb, Ab) => (As * Cs) + (Ab * Cb * (1 - As));

        const libs = colorEngine.getRgbOkCache();

        let x, y, dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA, ir, ig, ib, ia, mr, mg, mb, ma, cr, cg, cb, IL, IC, IH, ML, MC, MH;

        switch (blend) {

            case COLOR_BURN :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;
                        ma = mr + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else if (!mData[ma]) copyPixel(ir, ir, iData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = colorburnCalc(dinR, dmixR);
                                oData[ig] = colorburnCalc(dinG, dmixG);
                                oData[ib] = colorburnCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case COLOR_DODGE :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;
                        ma = mr + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else if (!mData[ma]) copyPixel(ir, ir, iData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = colordodgeCalc(dinR, dmixR);
                                oData[ig] = colordodgeCalc(dinG, dmixG);
                                oData[ib] = colordodgeCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case DARKEN :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;
                        ma = mr + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else if (!mData[ma]) copyPixel(ir, ir, iData);
                            else {

                                ig = ir + 1;
                                ib = ig + 1;
                                mg = mr + 1;
                                mb = mg + 1;

                                oData[ir] = darkenCalc(iData[ir], mData[mr]);
                                oData[ig] = darkenCalc(iData[ig], mData[mg]);
                                oData[ib] = darkenCalc(iData[ib], mData[mb]);
                                oData[ia] = alphaCalc(iData[ia] / 255, mData[ma] / 255);
                            }
                        }
                    }
                }
                break;

            case DIFFERENCE :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = differenceCalc(dinR, dmixR);
                                oData[ig] = differenceCalc(dinG, dmixG);
                                oData[ib] = differenceCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case EXCLUSION :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = exclusionCalc(dinR, dmixR);
                                oData[ig] = exclusionCalc(dinG, dmixG);
                                oData[ib] = exclusionCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case HARD_LIGHT :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = hardlightCalc(dinR, dmixR);
                                oData[ig] = hardlightCalc(dinG, dmixG);
                                oData[ib] = hardlightCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case LIGHTEN :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ir]) copyPixel(mr, ir, mData);
                            else {

                                ig = ir + 1;
                                ib = ig + 1;
                                mg = mr + 1;
                                mb = mg + 1;
                                ma = mb + 1;

                                oData[ir] = lightenCalc(iData[ir], mData[mr]);
                                oData[ig] = lightenCalc(iData[ig], mData[mg]);
                                oData[ib] = lightenCalc(iData[ib], mData[mb]);
                                oData[ia] = alphaCalc(iData[ia] / 255, mData[ma] / 255);
                            }
                        }
                    }
                }
                break;

            case LIGHTER :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = lighterCalc(dinR, dmixR);
                                oData[ig] = lighterCalc(dinG, dmixG);
                                oData[ib] = lighterCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case MULTIPLY :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;
                        ma = mr + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else if (!mData[ma]) copyPixel(ir, ir, iData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = multiplyCalc(dinR, dmixR);
                                oData[ig] = multiplyCalc(dinG, dmixG);
                                oData[ib] = multiplyCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case OVERLAY :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = overlayCalc(dinR, dmixR);
                                oData[ig] = overlayCalc(dinG, dmixG);
                                oData[ib] = overlayCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case SCREEN :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = screenCalc(dinR, dmixR);
                                oData[ig] = screenCalc(dinG, dmixG);
                                oData[ib] = screenCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case SOFT_LIGHT :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;
                        ma = mr + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else if (!mData[ma]) copyPixel(ir, ir, iData);
                            else {

                                [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(ir, mr);

                                ig = ir + 1;
                                ib = ig + 1;

                                oData[ir] = softlightCalc(dinR, dmixR);
                                oData[ig] = softlightCalc(dinG, dmixG);
                                oData[ib] = softlightCalc(dinB, dmixB);
                                oData[ia] = alphaCalc(dinA, dmixA);
                            }
                        }
                    }
                }
                break;

            case COLOR :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ig = ir + 1;
                        ib = ig + 1;
                        ia = ib + 1;
                        mg = mr + 1;
                        mb = mg + 1;
                        ma = mb + 1;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else if (!mData[ma]) copyPixel(ir, ir, iData);
                            else {

                                [IL, , , IC, IH] = colorEngine.getOkValsForRgb(iData[ir], iData[ig], iData[ib], libs);
                                [ML, , , MC, MH] = colorEngine.getOkValsForRgb(mData[mr], mData[mg], mData[mb], libs);

                                // Creates a color with the hue and saturation of the source color and the luminosity of the backdrop color.
                                [cr, cg, cb] = colorEngine.getRgbValsForOklch(ML, IC, IH, libs);

                                oData[ir] = cr;
                                oData[ig] = cg;
                                oData[ib] = cb;
                                oData[ia] = alphaCalc(iData[ia] / 255, mData[ma] / 255);
                            }
                        }
                    }
                }
                break;

            case HUE :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ig = ir + 1;
                        ib = ig + 1;
                        ia = ib + 1;
                        mg = mr + 1;
                        mb = mg + 1;
                        ma = mb + 1;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else if (!mData[ma]) copyPixel(ir, ir, iData);
                            else {

                                [IL, , , IC, IH] = colorEngine.getOkValsForRgb(iData[ir], iData[ig], iData[ib], libs);
                                [ML, , , MC, MH] = colorEngine.getOkValsForRgb(mData[mr], mData[mg], mData[mb], libs);

                                // Creates a color with the hue of the source color and the saturation and luminosity of the backdrop color.
                                [cr, cg, cb] = colorEngine.getRgbValsForOklch(ML, MC, IH, libs);

                                oData[ir] = cr;
                                oData[ig] = cg;
                                oData[ib] = cb;
                                oData[ia] = alphaCalc(iData[ia] / 255, mData[ma] / 255);
                            }
                        }
                    }
                }
                break;

            case LUMINOSITY :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ig = ir + 1;
                        ib = ig + 1;
                        ia = ib + 1;
                        mg = mr + 1;
                        mb = mg + 1;
                        ma = mb + 1;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else if (!mData[ma]) copyPixel(ir, ir, iData);
                            else {

                                [IL, , , IC, IH] = colorEngine.getOkValsForRgb(iData[ir], iData[ig], iData[ib], libs);
                                [ML, , , MC, MH] = colorEngine.getOkValsForRgb(mData[mr], mData[mg], mData[mb], libs);

                                // Creates a color with the luminosity of the source color and the hue and saturation of the backdrop color.
                                [cr, cg, cb] = colorEngine.getRgbValsForOklch(IL, MC, MH, libs);

                                oData[ir] = cr;
                                oData[ig] = cg;
                                oData[ib] = cb;
                                oData[ia] = alphaCalc(iData[ia] / 255, mData[ma] / 255);
                            }
                        }
                    }
                }
                break;

            case SATURATION :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ig = ir + 1;
                        ib = ig + 1;
                        ia = ib + 1;
                        mg = mr + 1;
                        mb = mg + 1;
                        ma = mb + 1;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else if (!mData[ma]) copyPixel(ir, ir, iData);
                            else {

                                [IL, , , IC, IH] = colorEngine.getOkValsForRgb(iData[ir], iData[ig], iData[ib], libs);
                                [ML, , , MC, MH] = colorEngine.getOkValsForRgb(mData[mr], mData[mg], mData[mb], libs);

                                // Creates a color with the saturation of the source color and the hue and luminosity of the backdrop color.
                                [cr, cg, cb] = colorEngine.getRgbValsForOklch(ML, IC, MH, libs);

                                oData[ir] = cr;
                                oData[ig] = cg;
                                oData[ib] = cb;
                                oData[ia] = alphaCalc(iData[ia] / 255, mData[ma] / 255);
                            }
                        }
                    }
                }
                break;

            default:

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        ia = ir + 3;

                        if (iData[ia]) {

                            if (mr < 0) copyPixel(ir, ir, iData);
                            else if (!iData[ia]) copyPixel(mr, ir, mData);
                            else {

                                ig = ir + 1;
                                ib = ig + 1;
                                mg = mr + 1;
                                mb = mg + 1;
                                ma = mb + 1;

                                dinA = iData[ia] / 255;
                                dmixA = mData[ma] / 255;

                                oData[ir] = normalCalc(iData[ir], dinA, mData[mr], dmixA);
                                oData[ig] = normalCalc(iData[ig], dinA, mData[mg], dmixA);
                                oData[ib] = normalCalc(iData[ib], dinA, mData[mb], dmixA);
                                oData[ia] = alphaCalc(dinA, dmixA)
                            }
                        }
                    }
                }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __blur__ - Performs a multi-loop, two-step 'horizontal-then-vertical averaging sweep' calculation across all pixels to create a blur effect.
// Note that this filter is expensive, thus much slower to complete compared to other filter effects. Where possible, memoize the results this filter produces.
    [BLUR]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        if ((!processVertical && !processHorizontal) || (!includeRed && !includeGreen && !includeBlue && !includeAlpha)) this.transferDataUnchanged(oData, iData, len);
        else {

            const gridWidth = input.width,
                gridHeight = input.height;

            let horizontalBlurGrid, verticalBlurGrid;

            if (processHorizontal || processVertical) {

                if (processHorizontal) horizontalBlurGrid = this.buildHorizontalBlur(gridWidth, gridHeight, radiusHorizontal);

                if (processVertical) verticalBlurGrid = this.buildVerticalBlur(gridWidth, gridHeight, radiusVertical);
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
                        ({ r: pr, g: pg, b: pb, a: pa } = this.getBlurPrefixBuffers(width, 'h'));

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

                                        if (includeRed)   sumR += hold[idx];
                                        if (includeGreen) sumG += hold[idx + 1];
                                        if (includeBlue)  sumB += hold[idx + 2];
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
                        ({ r: pr, g: pg, b: pb, a: pa } = this.getBlurPrefixBuffers(height, 'v'));

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __channels-to-alpha__ - Calculates an average value from each pixel's included channels and applies that value to the alpha channel.
    [CHANNELS_TO_ALPHA]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            includeRed   = true,
            includeGreen = true,
            includeBlue  = true,
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

            for (let p = 0, pz = src32.length | 0; p < pz; p++) {

                s = src32[p];

                r = s & 0xFF;
                g = (s >>> 8) & 0xFF;
                b = (s >>> 16) & 0xFF;

                if (div === 1) aNew = incR ? r : (incG ? g : b);
                else if (div === 2) {

                    const sum = (incR ? r : 0) + (incG ? g : 0) + (incB ? b : 0);
                    aNew = sum >>> 1;
                }
                else aNew = sumDiv3LUT[r + g + b];

                out32[p] = (s & 0x00FFFFFF) | (aNew << 24);
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __chroma__ - Using an array of 'range' arrays, determine whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. Each 'range' array comprises six Numbers representing [minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue] values.
    [CHROMA]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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
                        
                        for (let v = minR; v <= maxR; v++) {

                            rMasks[w][v] |= bit;
                        }
                        for (let v = minG; v <= maxG; v++) {

                            gMasks[w][v] |= bit;
                        }
                        for (let v = minB; v <= maxB; v++) {

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

                    for (let w = 0; w < words; w++) {

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

                    const na = ((a * (255 - wMax) + 128) >> 8) & 0xFF;

                    out32[p] = ((na << 24) | (b << 16) | (g << 8) | r) >>> 0;
                }
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __clamp-channels__ - Clamp each color channel to a range set by lowColor and highColor values
    [CLAMP_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __colors-to-alpha__ - Determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the "red", "green" and "blue" arguments. The sensitivity of the effect can be manipulated using the "transparentAt" and "opaqueAt" values, both of which lie in the range 0-1.
    [COLORS_TO_ALPHA]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        // Try workstore
        let pack = getWorkstoreItem(key);

        if (!pack) {

            const diffR = new Uint16Array(256),
                diffG = new Uint16Array(256),
                diffB = new Uint16Array(256);

            for (let v = 0; v < 256; v++) {

                diffR[v] = Math.abs(v - R);
                diffG[v] = Math.abs(v - G);
                diffB[v] = Math.abs(v - B);
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

        // Copy frame once; we’ll overwrite alpha only for the pixels we touch.
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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __compose__ - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using alpha compositing rules (as defined by Porter/Duff). The compositing method is determined by the String value supplied in the "compose" argument; permitted values are: 'destination-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'source-only', 'source-over' (default), 'source-in', 'source-out', 'source-atop', 'clear', 'xor', or 'lighter'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments.
    [COMPOSE]: function (requirements) {

        const copyPixel = function (fr, tr, data) {

            const fg = fr + 1,
                fb = fg + 1,
                fa = fb + 1,
                tg = tr + 1,
                tb = tg + 1,
                ta = tb + 1;

            oData[tr] = data[fr];
            oData[tg] = data[fg];
            oData[tb] = data[fb];
            oData[ta] = data[fa];
        };

        const getLinePositions = function (x, y) {

            const ix = x,
                iy = y,
                mx = x - offsetX,
                my = y - offsetY;

            let mp = -1;

            const ip = ((iy * iWidth) + ix) * 4;

            if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mp = ((my * mWidth) + mx) * 4;

            return [ip, mp];
        };

        const [input, output, mix] = this.getInputAndOutputLines(requirements);

        const {width:iWidth, height:iHeight, data:iData} = input;
        const {data:oData} = output;
        const {width:mWidth, height:mHeight, data:mData} = mix;

        const {
            opacity = 1,
            compose = ZERO_STR,
            offsetX = 0,
            offsetY = 0,
            lineOut,
        } = requirements;

        // Pixel calculations
        const sAtopCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * mAlpha) + (mAlpha * mColor * (1 - iAlpha));

        const sInCalc = (iColor, iAlpha, mAlpha) => iAlpha * iColor * mAlpha;

        const sOutCalc = (iColor, iAlpha, mAlpha) => iAlpha * iColor * (1 - mAlpha);

        const dAtopCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * (1 - mAlpha)) + (mAlpha * mColor * iAlpha);

        const dOverCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * (1 - mAlpha)) + (mAlpha * mColor);

        const dInCalc = (iColor, iAlpha, mAlpha) => iAlpha * iColor * mAlpha;

        const dOutCalc = (mColor, iAlpha, mAlpha) => mAlpha * mColor * (1 - iAlpha);

        const xorCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * (1 - mAlpha)) + (mAlpha * mColor * (1 - iAlpha));

        const sOverCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor) + (mAlpha * mColor * (1 - iAlpha));

        let ir, ig, ib, ia, mr, mg, mb, ma, x, y, dinA, dmixA;

        switch (compose) {

            case SOURCE_ONLY :
                output.data.set(iData);
                break;

            case SOURCE_ATOP :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr >= 0) {

                            ig = ir + 1;
                            ib = ig + 1;
                            ia = ib + 1;
                            mg = mr + 1;
                            mb = mg + 1;
                            ma = mb + 1;

                            dinA = iData[ia] / 255;
                            dmixA = mData[ma] / 255;

                            oData[ir] = sAtopCalc(iData[ir], dinA, mData[mr], dmixA);
                            oData[ig] = sAtopCalc(iData[ig], dinA, mData[mg], dmixA);
                            oData[ib] = sAtopCalc(iData[ib], dinA, mData[mb], dmixA);
                            oData[ia] = ((dinA * dmixA) + (dmixA * (1 - dinA))) * 255;
                        }
                    }
                }
                break;

            case SOURCE_IN :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr >= 0) {

                            ig = ir + 1;
                            ib = ig + 1;
                            ia = ib + 1;
                            ma = mr + 3;

                            dinA = iData[ia] / 255;
                            dmixA = mData[ma] / 255;

                            oData[ir] = sInCalc(iData[ir], dinA, dmixA);
                            oData[ig] = sInCalc(iData[ig], dinA, dmixA);
                            oData[ib] = sInCalc(iData[ib], dinA, dmixA);
                            oData[ia] = dinA * dmixA * 255;
                        }
                    }
                }
                break;

            case SOURCE_OUT :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr < 0) copyPixel(ir, ir, iData);
                        else {

                            ig = ir + 1;
                            ib = ig + 1;
                            ia = ib + 1;
                            ma = mr + 3;

                            dinA = iData[ia] / 255;
                            dmixA = mData[ma] / 255;

                            oData[ir] = sOutCalc(iData[ir], dinA, dmixA);
                            oData[ig] = sOutCalc(iData[ig], dinA, dmixA);
                            oData[ib] = sOutCalc(iData[ib], dinA, dmixA);
                            oData[ia] = dinA * (1 - dmixA) * 255;
                        }
                    }
                }
                break;

            case DESTINATION_ONLY :
                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr >= 0) copyPixel(mr, ir, mData);
                    }
                }
                break;

            case DESTINATION_ATOP :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr < 0) copyPixel(ir, ir, iData);
                        else {

                            ig = ir + 1;
                            ib = ig + 1;
                            ia = ib + 1;
                            mg = mr + 1;
                            mb = mg + 1;
                            ma = mb + 1;

                            dinA = iData[ia] / 255;
                            dmixA = mData[ma] / 255;

                            oData[ir] = dAtopCalc(iData[ir], dinA, mData[mr], dmixA);
                            oData[ig] = dAtopCalc(iData[ig], dinA, mData[mg], dmixA);
                            oData[ib] = dAtopCalc(iData[ib], dinA, mData[mb], dmixA);
                            oData[ia] = ((dinA * (1 - dmixA)) + (dmixA * dinA)) * 255;
                        }
                    }
                }
                break;

            case DESTINATION_OVER :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr < 0) copyPixel(ir, ir, iData);
                        else {

                            ig = ir + 1;
                            ib = ig + 1;
                            ia = ib + 1;
                            mg = mr + 1;
                            mb = mg + 1;
                            ma = mb + 1;

                            dinA = iData[ia] / 255;
                            dmixA = mData[ma] / 255;

                            oData[ir] = dOverCalc(iData[ir], dinA, mData[mr], dmixA);
                            oData[ig] = dOverCalc(iData[ig], dinA, mData[mg], dmixA);
                            oData[ib] = dOverCalc(iData[ib], dinA, mData[mb], dmixA);
                            oData[ia] = ((dinA * (1 - dmixA)) + dmixA) * 255;
                        }
                    }
                }
                break;

            case DESTINATION_IN :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr >= 0) {

                            ig = ir + 1;
                            ib = ig + 1;
                            ia = ib + 1;
                            mg = mr + 1;
                            mb = mg + 1;
                            ma = mb + 1;

                            dinA = iData[ia] / 255;
                            dmixA = mData[ma] / 255;

                            oData[ir] = dInCalc(mData[mr], dinA, dmixA);
                            oData[ig] = dInCalc(mData[mg], dinA, dmixA);
                            oData[ib] = dInCalc(mData[mb], dinA, dmixA);
                            oData[ia] = dinA * dmixA * 255;
                        }
                    }
                }
                break;

            case DESTINATION_OUT :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr >= 0) {

                            ig = ir + 1;
                            ib = ig + 1;
                            ia = ib + 1;
                            mg = mr + 1;
                            mb = mg + 1;
                            ma = mb + 1;

                            dinA = iData[ia] / 255;
                            dmixA = mData[ma] / 255;

                            oData[ir] = dOutCalc(mData[mr], dinA, dmixA);
                            oData[ig] = dOutCalc(mData[mg], dinA, dmixA);
                            oData[ib] = dOutCalc(mData[mb], dinA, dmixA);
                            oData[ia] = dmixA * (1 - dinA) * 255;
                        }
                    }
                }
                break;

            case CLEAR :
                break;

            case XOR :

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr < 0) copyPixel(ir, ir, iData);
                        else {

                            ig = ir + 1;
                            ib = ig + 1;
                            ia = ib + 1;
                            mg = mr + 1;
                            mb = mg + 1;
                            ma = mb + 1;

                            dinA = iData[ia] / 255;
                            dmixA = mData[ma] / 255;

                            oData[ir] = xorCalc(iData[ir], dinA, mData[mr], dmixA);
                            oData[ig] = xorCalc(iData[ig], dinA, mData[mg], dmixA);
                            oData[ib] = xorCalc(iData[ib], dinA, mData[mb], dmixA);
                            oData[ia] = ((dinA * (1 - dmixA)) + (dmixA * (1 - dinA))) * 255;
                        }
                    }
                }
                break;

            default:

                for (y = 0; y < iHeight; y++) {
                    for (x = 0; x < iWidth; x++) {

                        [ir, mr] = getLinePositions(x, y);

                        if (mr < 0) copyPixel(ir, ir, iData);
                        else {

                            ig = ir + 1;
                            ib = ig + 1;
                            ia = ib + 1;
                            mg = mr + 1;
                            mb = mg + 1;
                            ma = mb + 1;

                            dinA = iData[ia] / 255;
                            dmixA = mData[ma] / 255;

                            oData[ir] = sOverCalc(iData[ir], dinA, mData[mr], dmixA);
                            oData[ig] = sOverCalc(iData[ig], dinA, mData[mg], dmixA);
                            oData[ib] = sOverCalc(iData[ib], dinA, mData[mb], dmixA);
                            oData[ia] = (dinA + (dmixA * (1 - dinA))) * 255;
                        }
                    }
                }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __corrode__ - Performs a special form of matrix operation on each pixel's color and alpha channels, calculating the new value using neighbouring pixel values. Note that this filter is expensive, thus much slower to complete compared to other filter effects. The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments. The operation will set the pixel's channel value to match either the lowest, highest, mean or median values as dictated by its neighbours - this value is set in the "level" attribute. Channels can be selected by setting the "includeRed", "includeGreen", "includeBlue" (all false by default) and "includeAlpha" (default: true) flags.
    [CORRODE]: function (requirements) {

        const doCalculations = function (data, matrix, offset) {

            let max = 0,
                min = 255,
                v, c;

            const matlen = matrix.length;

            for (c = 0; c < matlen; c++) {

                v = data[matrix[c] + offset];

                if (v < min) min = v;
                else if (v > max) max = v;
            }

            switch (operation) {

                case 'lowest' :
                    return min;

                case 'highest' :
                    return max;

                default :
                    return _floor(min + ((max - min) / 2));
            }
        };

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            includeRed = false,
            includeGreen = false,
            includeBlue = false,
            includeAlpha = true,
            operation = MEAN,
            lineOut,
        } = requirements;

        let width = requirements.width;
        if (!_isFinite(width) || width < 1) width = 3;
        width = _floor(width);

        let height = requirements.height;
        if (!_isFinite(height) || height < 1) height = 3;
        height = _floor(height);

        let offsetX = requirements.offsetX;
        if (!_isFinite(offsetX) || offsetX < 1) offsetX = 1;
        offsetX = _floor(offsetX);

        let offsetY = requirements.offsetY;
        if (!_isFinite(offsetY) || offsetY < 1) offsetY = 1;
        offsetY = _floor(offsetY);

        const grid = this.buildMatrixGrid(width, height, offsetX, offsetY, input);

        const m = _floor(len / 4);

        let r, g, b, a, i;

        for (i = 0; i < m; i++) {

            r = i * 4;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            oData[r] = (includeRed) ? doCalculations(iData, grid[i], 0) : iData[r];
            oData[g] = (includeGreen) ? doCalculations(iData, grid[i], 1) : iData[g];
            oData[b] = (includeBlue) ? doCalculations(iData, grid[i], 2) : iData[b];
            oData[a] = (includeAlpha) ? doCalculations(iData, grid[i], 3) : iData[a];
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __displace__ - Shift pixels around the image, based on the values supplied in a displacement image
    [DISPLACE]: function (requirements) {

        const copyPixel = function (fromPos, toPos, data) {

            if (fromPos < 0) oData[toPos + 3] = 0;
            else {

                oData[toPos] = data[fromPos];

                fromPos++;
                toPos++;
                oData[toPos] = data[fromPos];

                fromPos++;
                toPos++;
                oData[toPos] = data[fromPos];

                fromPos++;
                toPos++;
                oData[toPos] = data[fromPos];
            }
        };

        const getLinePositions = function (x, y) {

            const ix = x,
                iy = y,
                mx = x + offsetX,
                my = y + offsetY;

            let mPos = -1;

            const iPos = ((iy * iWidth) + ix) * 4;

            if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mPos = ((my * mWidth) + mx) * 4;

            return [iPos, mPos];
        };

        const [input, output, mix] = this.getInputAndOutputLines(requirements);

        const {width:iWidth, height:iHeight, data:iData} = input;
        const {data:oData} = output;
        const {width:mWidth, height:mHeight, data:mData} = mix;

        const {
            opacity = 1,
            channelX = RED,
            channelY = GREEN,
            scaleX = 1,
            scaleY = 1,
            offsetX = 0,
            offsetY = 0,
            transparentEdges = false,
            lineOut,
        } = requirements;

        let offsetForChannelX = 3;
        if (channelX === RED) offsetForChannelX = 0;
        else if (channelX === GREEN) offsetForChannelX = 1;
        else if (channelX === BLUE) offsetForChannelX = 2;

        let offsetForChannelY = 3;
        if (channelY === RED) offsetForChannelY = 0;
        else if (channelY === GREEN) offsetForChannelY = 1;
        else if (channelY === BLUE) offsetForChannelY = 2;

        let x, y, dx, dy, dPos, iPos, mPos;

        for (y = 0; y < iHeight; y++) {
            for (x = 0; x < iWidth; x++) {

                [iPos, mPos] = getLinePositions(x, y);
                if (mPos >= 0) {

                    dx = _floor(x + ((127 - mData[mPos + offsetForChannelX]) / 127) * scaleX);
                    dy = _floor(y + ((127 - mData[mPos + offsetForChannelY]) / 127) * scaleY);

                    if (!transparentEdges) {

                        if (dx < 0) dx = 0;
                        if (dx >= iWidth) dx = iWidth - 1;
                        if (dy < 0) dy = 0;
                        if (dy >= iHeight) dy = iHeight - 1;

                        dPos = ((dy * iWidth) + dx) * 4;
                    }
                    else {

                        if (dx < 0 || dx >= iWidth || dy < 0 || dy >= iHeight) dPos = -1;
                        else dPos = ((dy * iWidth) + dx) * 4;
                    }
                    copyPixel(dPos, iPos, iData);
                }
                else {
                    copyPixel(iPos, iPos, iData);
                }
            }
        }
        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

    [EMBOSS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        // --- Build 3x3 weights from strength + angle
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

        // Copy input → output as a base (alpha passthrough needed anyway)
        // oData.set(iData);

        let x, y, yU, yD, rowU, rowM, rowD, xL, xC, xR,
            p00, p01, p02, p10, p11, p12, p20, p21, p22,
            r, g, b, iR, iG, iB, unchanged;

        // Main pass (toroidal wrap)
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

                // Indices for 3x3 neighborhood, row-major
                p00 = rowU + xL;
                p01 = rowU + xC;
                p02 = rowU + xR;
                p10 = rowM + xL;
                p11 = rowM + xC;
                p12 = rowM + xR;
                p20 = rowD + xL;
                p21 = rowD + xC;
                p22 = rowD + xR;

                // Center alpha gate matches old behavior (skip fully transparent)
                if (!iData[p11 + 3]) continue;

                // Convolve per channel (RGB). Alpha = passthrough center.
                // Unrolled for speed; Uint8ClampedArray will clamp on assignment.
                r =
                    iData[p00] * w[0] + iData[p01] * w[1] + iData[p02] * w[2] +
                    iData[p10] * w[3] + iData[p11] * w[4] + iData[p12] * w[5] +
                    iData[p20] * w[6] + iData[p21] * w[7] + iData[p22] * w[8];

                g =
                    iData[p00 + 1] * w[0] + iData[p01 + 1] * w[1] + iData[p02 + 1] * w[2] +
                    iData[p10 + 1] * w[3] + iData[p11 + 1] * w[4] + iData[p12 + 1] * w[5] +
                    iData[p20 + 1] * w[6] + iData[p21 + 1] * w[7] + iData[p22 + 1] * w[8];

                b =
                    iData[p00 + 2] * w[0] + iData[p01 + 2] * w[1] + iData[p02 + 2] * w[2] +
                    iData[p10 + 2] * w[3] + iData[p11 + 2] * w[4] + iData[p12 + 2] * w[5] +
                    iData[p20 + 2] * w[6] + iData[p21 + 2] * w[7] + iData[p22 + 2] * w[8];

                // Write RGB, keep alpha
                oData[p11] = r;
                oData[p11 + 1] = g;
                oData[p11 + 2] = b;
                oData[p11 + 3] = iData[p11 + 3];

                // Optional post-process (unchanged → midgray or transparent)
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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __flood__ - Set all pixels to the channel values supplied in the "red", "green", "blue" and "alpha" arguments
    [FLOOD]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        for (let p = 0, pz = src32.length | 0, s, a; p < pz; p++) {
        
            s = src32[p];
            a = (s >>> 24) & 0xFF;

            if (a === 0) out32[p] = s;
            else out32[p] = excludeAlpha ? (((a << 24) | baseRGB) >>> 0) : packedWithA;
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __gaussian-blur__ - from this GitHub repository: https://github.com/nodeca/glur/blob/master/index.js (code accessed 1 June 2021)
    [GAUSSIAN_BLUR]: function (requirements) {

        let a0, a1, a2, a3, b1, b2, left_corner, right_corner;

        const gaussCoef = function (sigma) {

            if (sigma < 0.5) sigma = 0.5;

            const a = _exp(0.726 * 0.726) / sigma,
                g1 = _exp(-a),
                g2 = _exp(-2 * a),
                k = (1 - g1) * (1 - g1) / (1 + 2 * a * g1 - g2);

            a0 = k;
            a1 = k * (a - 1) * g1;
            a2 = k * (a + 1) * g1;
            a3 = -k * g2;
            b1 = 2 * g1;
            b2 = -g2;
            left_corner = (a0 + a1) / (1 - b1 - b2);
            right_corner = (a2 + a3) / (1 - b1 - b2);

            // Attempt to force type to FP32.
            return new Float32Array([ a0, a1, a2, a3, b1, b2, left_corner, right_corner ]);
        }

        const convolveRGBA = function (src, out, line, coeff, width, height) {
            // takes src image and writes the blurred and transposed result into out

            let rgba;
            let prev_src_r, prev_src_g, prev_src_b, prev_src_a;
            let curr_src_r, curr_src_g, curr_src_b, curr_src_a;
            let curr_out_r, curr_out_g, curr_out_b, curr_out_a;
            let prev_out_r, prev_out_g, prev_out_b, prev_out_a;
            let prev_prev_out_r, prev_prev_out_g, prev_prev_out_b, prev_prev_out_a;

            let src_index, out_index, line_index;
            let i, j;
            let coeff_a0, coeff_a1, coeff_b1, coeff_b2;

            for (i = 0; i < height; i++) {

                src_index = i * width;
                out_index = i;
                line_index = 0;

                // left to right
                rgba = src[src_index];

                prev_src_r = rgba & 0xff;
                prev_src_g = (rgba >> 8) & 0xff;
                prev_src_b = (rgba >> 16) & 0xff;
                prev_src_a = (rgba >> 24) & 0xff;

                prev_prev_out_r = prev_src_r * coeff[6];
                prev_prev_out_g = prev_src_g * coeff[6];
                prev_prev_out_b = prev_src_b * coeff[6];
                prev_prev_out_a = prev_src_a * coeff[6];

                prev_out_r = prev_prev_out_r;
                prev_out_g = prev_prev_out_g;
                prev_out_b = prev_prev_out_b;
                prev_out_a = prev_prev_out_a;

                coeff_a0 = coeff[0];
                coeff_a1 = coeff[1];
                coeff_b1 = coeff[4];
                coeff_b2 = coeff[5];

                for (j = 0; j < width; j++) {

                    rgba = src[src_index];
                    curr_src_r = rgba & 0xff;
                    curr_src_g = (rgba >> 8) & 0xff;
                    curr_src_b = (rgba >> 16) & 0xff;
                    curr_src_a = (rgba >> 24) & 0xff;

                    curr_out_r = curr_src_r * coeff_a0 + prev_src_r * coeff_a1 + prev_out_r * coeff_b1 + prev_prev_out_r * coeff_b2;
                    curr_out_g = curr_src_g * coeff_a0 + prev_src_g * coeff_a1 + prev_out_g * coeff_b1 + prev_prev_out_g * coeff_b2;
                    curr_out_b = curr_src_b * coeff_a0 + prev_src_b * coeff_a1 + prev_out_b * coeff_b1 + prev_prev_out_b * coeff_b2;
                    curr_out_a = curr_src_a * coeff_a0 + prev_src_a * coeff_a1 + prev_out_a * coeff_b1 + prev_prev_out_a * coeff_b2;

                    prev_prev_out_r = prev_out_r;
                    prev_prev_out_g = prev_out_g;
                    prev_prev_out_b = prev_out_b;
                    prev_prev_out_a = prev_out_a;

                    prev_out_r = curr_out_r;
                    prev_out_g = curr_out_g;
                    prev_out_b = curr_out_b;
                    prev_out_a = curr_out_a;

                    prev_src_r = curr_src_r;
                    prev_src_g = curr_src_g;
                    prev_src_b = curr_src_b;
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

                // right to left
                rgba = src[src_index];

                prev_src_r = rgba & 0xff;
                prev_src_g = (rgba >> 8) & 0xff;
                prev_src_b = (rgba >> 16) & 0xff;
                prev_src_a = (rgba >> 24) & 0xff;

                prev_prev_out_r = prev_src_r * coeff[7];
                prev_prev_out_g = prev_src_g * coeff[7];
                prev_prev_out_b = prev_src_b * coeff[7];
                prev_prev_out_a = prev_src_a * coeff[7];

                prev_out_r = prev_prev_out_r;
                prev_out_g = prev_prev_out_g;
                prev_out_b = prev_prev_out_b;
                prev_out_a = prev_prev_out_a;

                curr_src_r = prev_src_r;
                curr_src_g = prev_src_g;
                curr_src_b = prev_src_b;
                curr_src_a = prev_src_a;

                coeff_a0 = coeff[2];
                coeff_a1 = coeff[3];

                for (j = width - 1; j >= 0; j--) {

                    curr_out_r = curr_src_r * coeff_a0 + prev_src_r * coeff_a1 + prev_out_r * coeff_b1 + prev_prev_out_r * coeff_b2;
                    curr_out_g = curr_src_g * coeff_a0 + prev_src_g * coeff_a1 + prev_out_g * coeff_b1 + prev_prev_out_g * coeff_b2;
                    curr_out_b = curr_src_b * coeff_a0 + prev_src_b * coeff_a1 + prev_out_b * coeff_b1 + prev_prev_out_b * coeff_b2;
                    curr_out_a = curr_src_a * coeff_a0 + prev_src_a * coeff_a1 + prev_out_a * coeff_b1 + prev_prev_out_a * coeff_b2;

                    prev_prev_out_r = prev_out_r;
                    prev_prev_out_g = prev_out_g;
                    prev_prev_out_b = prev_out_b;
                    prev_prev_out_a = prev_out_a;

                    prev_out_r = curr_out_r;
                    prev_out_g = curr_out_g;
                    prev_out_b = curr_out_b;
                    prev_out_a = curr_out_a;

                    prev_src_r = curr_src_r;
                    prev_src_g = curr_src_g;
                    prev_src_b = curr_src_b;
                    prev_src_a = curr_src_a;

                    rgba = src[src_index];
                    curr_src_r = rgba & 0xff;
                    curr_src_g = (rgba >> 8) & 0xff;
                    curr_src_b = (rgba >> 16) & 0xff;
                    curr_src_a = (rgba >> 24) & 0xff;

                    rgba = ((line[line_index] + prev_out_r) << 0) +
                    ((line[line_index + 1] + prev_out_g) << 8) +
                    ((line[line_index + 2] + prev_out_b) << 16) +
                    ((line[line_index + 3] + prev_out_a) << 24);

                    out[out_index] = rgba;

                    src_index--;
                    line_index -= 4;
                    out_index -= height;
                }
            }
        }

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const {width, height} = input;

        const {
            opacity = 1,
            radiusHorizontal = 1,
            radiusVertical = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = true,
            excludeTransparentPixels = false,
            lineOut,
        } = requirements;

        const hold = new Uint8ClampedArray(iData);

        const src32 = new Uint32Array(hold.buffer);

        const out = new Uint32Array(src32.length),
            tmp_line = new Float32Array(_max(width, height) * 4);

        const horizontalCoeff = gaussCoef(radiusHorizontal),
            verticalCoeff = gaussCoef(radiusVertical);

        convolveRGBA(src32, out, tmp_line, horizontalCoeff, width, height, radiusHorizontal);
        convolveRGBA(out, src32, tmp_line, verticalCoeff, height, width, radiusVertical);

        let r, g, b, a, i, iz;

        if (!excludeTransparentPixels) {

            for (i = 0, iz = iData.length; i < iz; i += 4) {

                r = i;
                g = r + 1;
                b = g + 1;
                a = b + 1;

                oData[r] = (includeRed) ? hold[r] : iData[r];
                oData[g] = (includeGreen) ? hold[g] : iData[g];
                oData[b] = (includeBlue) ? hold[b] : iData[b];
                oData[a] = (includeAlpha) ? hold[a] : iData[a];
            }
        }
        else {

            for (i = 0, iz = iData.length; i < iz; i += 4) {

                r = i;
                g = r + 1;
                b = g + 1;
                a = b + 1;

                if (iData[a]) {

                    oData[r] = (includeRed) ? hold[r] : iData[r];
                    oData[g] = (includeGreen) ? hold[g] : iData[g];
                    oData[b] = (includeBlue) ? hold[b] : iData[b];
                    oData[a] = (includeAlpha) ? hold[a] : iData[a];
                }
                else {

                    oData[r] = iData[r];
                    oData[g] = iData[g];
                    oData[b] = iData[b];
                    oData[a] = iData[a];
                }
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __glitch__ - Swap pixels at random within a given box (width/height) distance of each other, dependent on the level setting - lower levels mean less noise. Uses a pseudo-random numbers generator to ensure consistent results across runs. Takes into account choices to include red, green, blue and alpha channels, and whether to ignore transparent pixels
//
// NOTE: this filter is deprecated. No further work is planned to maintain or improve it. INstead, the plan is to replace this filter with a set of loosely linked glitch effect filters covering:
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

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length,
            iWidth = input.width,
            iHeight = input.height;

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
            lineOut,
        } = requirements;

        let step = _floor(requirements.step);
        if (step < 1) step = 1;

        const rnd = this.getRandomNumbers({
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

        let i, j, affectedRow, shift, shiftR, shiftG, shiftB, shiftA,
            r, g, b, a, w, currentRow, currentRowStart, currentRowEnd, cursor,
            dr, dg, db, da, ur, ug, ub, ua;

        for (i = 0; i < iHeight; i += step) {

            affectedRow = (rnd[++rndCursor] < level) ? true : false;

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
                    shiftB= (offsetBlueMin + _floor(rnd[++rndCursor] * blueRange)) * 4;
                    shiftA= (offsetAlphaMin + _floor(rnd[++rndCursor] * alphaRange)) * 4;

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

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            w = iWidth * 4;
            currentRow = _floor(i / w);
            cursor = currentRow * 4;

            dr = rows[cursor];
            dg = rows[++cursor];
            db = rows[++cursor];
            da = rows[++cursor];

            ur = r + dr;
            ug = g + dg;
            ub = b + db;
            ua = a + da;

            oData[r] = iData[ur];
            oData[g] = iData[ug];
            oData[b] = iData[ub];

            if (transparentEdges) {

                currentRowStart = currentRow * w;
                currentRowEnd = currentRowStart + w;

                if (ur < currentRowStart || ur > currentRowEnd || ug < currentRowStart || ug > currentRowEnd || ub < currentRowStart || ub > currentRowEnd || ua < currentRowStart || ua > currentRowEnd) oData[a] = 0;
                else oData[a] = iData[ua];
            }
            else oData[a] = iData[ua];
        }
        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __grayscale__ - For each pixel, averages the weighted color channels and applies the result across all the color channels. This gives a more realistic monochrome effect.
    [GRAYSCALE]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        // 32-bit views over the same buffers (respecting byteOffset/length)
        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

        const {
            opacity = 1,
            lineOut
        } = requirements;

        let rgba, r, g, b, a, gray;

        for (let p = 0, pz = src32.length | 0; p < pz; p++) {

            rgba = src32[p];

            r = rgba & 0xff;
            g = (rgba >>> 8) & 0xff;
            b = (rgba >>> 16) & 0xff;
            a = (rgba >>> 24) & 0xff;

            gray = (r * 54 + g * 183 + b * 19) >> 8;

            out32[p] = ((a << 24) | (gray << 16) | (gray << 8) | gray) >>> 0;
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// // __invert-channels__ - For each pixel, subtracts its current channel values - when included - from 255.
    [INVERT_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __lock-channels-to-levels__ - Produces a posterize effect. Takes in four arguments - "red", "green", "blue" and "alpha" - each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value.
    [LOCK_CHANNELS_TO_LEVELS]: function (requirements) {

        // -- helpers --
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

            for (let i = 0, iz = arr.length, v; i < iz; i++) {

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

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer, oData.byteOffset, oData.byteLength >>> 2);

        const {
            opacity = 1,
            red   = [0],
            green = [0],
            blue  = [0],
            alpha = [255],
            lineOut,
        } = requirements;

        // Normalize and build LUTs
        const rLevels = normalizeLevels(red),
            gLevels = normalizeLevels(green),
            bLevels = normalizeLevels(blue),
            aLevels = normalizeLevels(alpha);

        const lutR = buildLUT(rLevels),
            lutG = (green === red)  ? lutR : buildLUT(gLevels),
            lutB = (blue  === red)  ? lutR : (blue === green ? lutG : buildLUT(bLevels)),
            lutA = buildLUT(aLevels);

        let p, pz, rgba, r, g, b, a, nr, ng, nb, na;

        for (let p = 0, pz = src32.length | 0; p < pz; p++) {

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __luminance-to-alpha__ - sets the OKLAB alpha channel to the value of the luminance channel, then sets the luminance, A and B channels to 0 (black).
    [LUMINANCE_TO_ALPHA]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        const libs = colorEngine.getRgbOkCache();

        let r, g, b, a, i, L;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            [L] = colorEngine.getOkValsForRgb(iData[r], iData[g], iData[b], libs);

            oData[r] = 0;
            oData[g] = 0;
            oData[b] = 0;
            oData[a] = _floor(L * 256);
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __map-to-gradient__ - maps the colors in the supplied (complex) gradient to a grayscaled input.
    [MAP_TO_GRADIENT]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const {
            opacity = 1,
            useNaturalGrayscale = false,
            gradient = false,
            lineOut,
        } = requirements;

        if (!gradient) out32.set(src32);
        else {

            const gradBytes = this.getGradientData(gradient);

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __matrix__ - Performs a matrix operation on each pixel's channels, calculating the new value using neighbouring pixel weighted values. Also known as a convolution matrix, kernel or mask operation. Note that this filter is expensive, thus much slower to complete compared to other filter effects. The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments. The weights to be applied need to be supplied in the "weights" argument - an Array listing the weights row-by-row starting from the top-left corner of the matrix. By default all color channels are included in the calculations while the alpha channel is excluded. The 'edgeDetect', 'emboss' and 'sharpen' convenience filter methods all use the matrix action, pre-setting the required weights.
    [MATRIX]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements),
            iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            includeRed   = true,
            includeGreen = true,
            includeBlue  = true,
            includeAlpha = false,
            offsetX = 1,
            offsetY = 1,
            lineOut,
        } = requirements;

        // Matrix dims
        let mW = requirements.width;
        if (!_isFinite(mW) || mW < 1) mW = 3;
        mW |= 0;

        let mH = requirements.height;
        if (!_isFinite(mH) || mH < 1) mH = 3;
        mH |= 0;

        // Clamp anchor to matrix bounds (so default identity lines up with offsets)
        let aX = (_isFinite(offsetX) ? offsetX : 0) | 0;
        if (aX < 0) aX = 0;
        else if (aX >= mW) aX = mW - 1;

        let aY = (_isFinite(offsetY) ? offsetY : 0) | 0;
        if (aY < 0) aY = 0;
        else if (aY >= mH) aY = mH - 1;

        // Weights
        let weights = requirements.weights;

        if (!weights || weights.length !== (mW * mH)) {

            weights = new Float32Array(mW * mH);
            weights[(aY * mW) + aX] = 1;
        }
        else if (!(weights instanceof Float32Array)) {
            weights = Float32Array.from(weights);
        }

        // Kernel offsets (cached)
        const nzIdx = [],
            nzW = [];

        for (let i = 0; i < weights.length; i++) {

            const w = weights[i];

            if (w !== 0) {

                nzIdx.push(i);
                nzW.push(w);
            }
        }
        const nzCount = nzIdx.length;

        if (nzCount === 0) this.transferDataUnchanged(oData, iData, len);
        else {

            const offs = this.getMatrixOffsets(mW, mH, aX, aY, input);

            const pixels = (len >> 2);

            let base, acc, k, p;

            for (let i = 0; i < pixels; i++) {

                base = i << 2;

                if (!iData[base + 3]) continue;

                if (includeRed) {

                    acc = 0;

                    for (k = 0; k < nzCount; k++) {

                        p = base + offs[nzIdx[k]];
                        if (p < 0) p += len;
                        else if (p >= len) p -= len;

                        acc += iData[p] * nzW[k];
                    }
                    oData[base] = acc;
                }
                else oData[base] = iData[base];

                if (includeGreen) {

                    acc = 0;

                    for (k = 0; k < nzCount; k++) {

                        p = base + offs[nzIdx[k]];
                        if (p < 0) p += len;
                        else if (p >= len) p -= len;

                        acc += iData[p + 1] * nzW[k];
                    }
                    oData[base + 1] = acc;
                }
                else oData[base + 1] = iData[base + 1];

                if (includeBlue) {

                    acc = 0;

                    for (k = 0; k < nzCount; k++) {

                        p = base + offs[nzIdx[k]];
                        if (p < 0) p += len;
                        else if (p >= len) p -= len;

                        acc += iData[p + 2] * nzW[k];
                    }
                    oData[base + 2] = acc;
                }
                else oData[base + 2] = iData[base + 2];

                if (includeAlpha) {

                    acc = 0;
                    for (k = 0; k < nzCount; k++) {

                        p = base + offs[nzIdx[k]];
                        if (p < 0) p += len;
                        else if (p >= len) p -= len;

                        acc += iData[p + 3] * nzW[k];
                    }
                    oData[base + 3] = acc;
                }
                else oData[base + 3] = iData[base + 3];
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// modify-ok-channels__ - Adds a value to each of the OKLAB channels. Note that: the `L` (luminance) channel controls brightness, and will be a value between `0.0` (black) and `1.0` (white); the `A` (red-green) channel controls red-green hues - values range from `-0.4` (full green) to `+0.4` (full red); the `B` (yellow-blue) channel controls yellow-blue hues - values range from `-0.4` (full blue) to `+0.4` (full yellow).
    [MODIFY_OK_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

            const libs  = colorEngine.getRgbOkCache(),
                getOk = colorEngine.getOkValsForRgb,
                toRgb = colorEngine.getRgbValsForOklab;

            const clamp01 = (v) => (v < 0 ? 0 : (v > 1 ? 1 : v));
            const clampAB = (v) => (v < -0.4 ? -0.4 : (v > 0.4 ? 0.4 : v));

            let s, a, r0, g0, b0, ok, L, A, B, rgb;

            for (let p = 0, pz = src32.length | 0; p < pz; p++) {

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __modulate-channels__ - Multiplies each channel's value by the supplied argument value. A channel-argument's value of '0' will set that channel's value to zero; a value of '1' will leave the channel value unchanged. If the "saturation" flag is set to 'true' the calculation changes to start at that pixel's grayscale values. The 'brightness' and 'saturation' filters are special forms of the 'channels' filter which use a single "levels" argument to set all three color channel arguments to the same value.
    [MODULATE_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        // Fast identity: nothing changes (and no saturation)
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
            for (let p = 0, pz = src32.length | 0; p < pz; p++) {

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

                // Clamp
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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __modulate-ok-channels__ - Multiplies each of the OKLAB channels by a given amount. Note that: the `L` (luminance) channel controls brightness, and will be a value between `0.0` (black) and `1.0` (white); the `A` (red-green) channel controls red-green hues - values range from `-0.4` (full green) to `+0.4` (full red); the `B` (yellow-blue) channel controls yellow-blue hues - values range from `-0.4` (full blue) to `+0.4` (full yellow).
    [MODULATE_OK_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

            let s, a, r0, g0, b0, ok, L, A, B, rgb;

            for (let p = 0, pz = src32.length | 0; p < pz; p++) {

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __negative__ - for each pixel: convert to OKLAB; negate A and B; invert L; convert back to RGB
    [NEGATIVE]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

        const { 
            opacity = 1,
            lineOut
        } = requirements;

        const libs = colorEngine.getRgbOkCache(),
            getOk  = colorEngine.getOkValsForRgb,
            toRgb  = colorEngine.getRgbValsForOklab;

        let rgba, r, g, b, a, ok, L, A, B, rgb;

        for (let p = 0, pz = src32.length | 0; p < pz; p++) {

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __newsprint__ - Attempts to simulate a black-white dither effect similar to newsprint
    [NEWSPRINT]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        const rects = this.buildTileRects(tDim, tDim, 0, 0, input);

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __offset__ - Offset the input image in the output image.
    [OFFSET]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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
            offsetAlphaX = 0,
            offsetAlphaY = 0,
            lineOut,
        } = requirements;

        if (!(offsetRedX || offsetGreenX || offsetBlueX || offsetAlphaX || offsetRedY || offsetGreenY || offsetBlueY || offsetAlphaY)) out32.set(src32);
        else {

            const rowStridePx = width | 0;

            const simple = offsetRedX === offsetGreenX && offsetRedX === offsetBlueX && offsetRedX === offsetAlphaX && offsetRedY === offsetGreenY && offsetRedY === offsetBlueY && offsetRedY === offsetAlphaY;

            if (simple) {

                const dx = offsetRedX | 0,
                    dy = offsetRedY | 0;

                let y, ty, xStart, xEnd, n, srcRowBase, destRowBase;

                for (y = 0; y < height; y++) {

                    ty = y + dy;
                    if (ty < 0 || ty >= height) continue;

                    xStart = dx < 0 ? -dx : 0;
                    xEnd = dx > 0 ? width - dx : width;
                    n = (xEnd - xStart) | 0;

                    if (n <= 0) continue;

                    srcRowBase = (y  * rowStridePx + xStart) | 0;
                    destRowBase = (ty * rowStridePx + xStart + dx) | 0;

                    // copy whole run of pixels
                    out32.set(src32.subarray(srcRowBase, srcRowBase + n), destRowBase);
                }
            }
            else {

                out32.fill(0);

                const copyChannel = (dx, dy, shift) => {

                    dx |= 0; dy |= 0;

                    if (dx === 0 && dy === 0) {

                        const cm = (0xFF << shift) >>> 0,
                            ncm = (~cm) >>> 0;
                        
                        let p, pz, s, v;

                        for (p = 0, pz = src32.length | 0; p < pz; p++) {

                            s = src32[p];
                            v = out32[p];
                            out32[p] = (v & ncm) | (s & cm);
                        }
                        return;
                    }

                    const cm = (0xFF << shift) >>> 0,
                        ncm = (~cm) >>> 0;

                    let y, ty, xStart, xEnd, n, src, dst, v, s, k;

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
                            out32[dst] = (v & ncm) | (s & cm);
                        }
                    }
                };

                copyChannel(offsetRedX, offsetRedY, 0);
                copyChannel(offsetGreenX, offsetGreenY, 8);
                copyChannel(offsetBlueX, offsetBlueY, 16);
                copyChannel(offsetAlphaX, offsetAlphaY, 24);
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __pixelate__ - Pixelizes the input image by creating a grid of tiles across it and then averaging the color values of each pixel in a tile and setting its value to the average. Tile width and height, and their offset from the top left corner of the image, are set via the "tileWidth", "tileHeight", "offsetX" and "offsetY" arguments.
    [PIXELATE]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        if (!includeRed && !includeGreen && !includeBlue && !includeAlpha) this.transferDataUnchanged(oData, iData, len);
        else {

            const rects = this.buildTileRects(tileWidth, tileHeight, offsetX, offsetY, input);

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __process-image__ - Add an asset to the filter, which can then be used by other filters as either their `lineIn` or `lineMix` inputs.
// + `asset` - the String name of the asset object. The asset must be pre-loaded before it can be included in the filter; where things go wrong, the system will attempt to load a 1x1 transparent pixel in place of the asset.
// + `width` and `height` - arguments are measured in integer Number pixels, or % strings (relative to the source entity/Group/Cell dimensions).
// + `copyX`, `copyY`, `copyWidth`, `copyHeight` - the start and dimensions of the area of the image to be used in the filter; values are integer Number pixels, or % strings relative to the image's natural dimensions.
// + If the image's dimensions differ from the source entity/Group/Cell dimensions then, where a given dimension is smaller than source, that dimension will be centered; where the image dimension is larger then that dimension will be pinned to the top, or left.
// + Filters will run faster when the asset's dimensions match the dimensions of the entity/Group/Cell to which the filter is being applied.
// + `lineOut` - required. The image will be stored in the filter engine's cache using this name. Be aware that the filter action does not check for any pre-existing assets cached under this name and, if they exist, will overwrite them with this asset's data.
// + Assets are loaded into the filter engine each time the filter runs and are not persisted when the filter completes.
// + Adding assets to a filter chain will very often disable filter memoization functionality!
    [PROCESS_IMAGE]: function (requirements) {

        const {identifier, lineOut} = requirements;

        if (lineOut && lineOut.substring && lineOut.length) {

            const assetData = getWorkstoreItem(identifier);

            let width = assetData ? assetData.width : 1,
                height = assetData ? assetData.height : 1,
                data = assetData ? assetData.data : new Uint8ClampedArray(4);

            if (width && height && data) {

                const {width:sWidth, height:sHeight} = this.cache.source;

                if (sWidth !== width || sHeight !== height) {

                    const temp = new ImageData(sWidth, sHeight),
                        tempData = temp.data;

                    let tx, ty, tempCursor, inputCursor,
                        dx = (sWidth - width) / 2,
                        dy = (sHeight - height) / 2;

                    if (dx < 0) dx = 0;
                    if (dy < 0) dy = 0;

                    for (ty = 0; ty < sHeight; ty++) {
                        for (tx = 0; tx < sWidth; tx++) {

                            if (tx < width && ty < height) {

                                tempCursor = (((ty + dy) * sWidth) + (tx + dx)) * 4;
                                inputCursor = ((ty * width) + tx) * 4;

                                tempData[tempCursor] = data[inputCursor];
                                tempCursor++;
                                inputCursor++;
                                tempData[tempCursor] = data[inputCursor];
                                tempCursor++;
                                inputCursor++;
                                tempData[tempCursor] = data[inputCursor];
                                tempCursor++;
                                inputCursor++;
                                tempData[tempCursor] = data[inputCursor];
                            }
                        }
                    }
                    data = tempData;
                    width = sWidth;
                    height = sHeight;
                }
                this.cache[lineOut] = new ImageData(data, width, height);
            }
        }
    },

// __random-noise__ - Swap pixels at random within a given box (width/height) distance of each other, dependent on the level setting - lower levels mean less noise. Uses a pseudo-random numbers generator to ensure consistent results across runs. Takes into account choices to include red, green, blue and alpha channels, and whether to ignore transparent pixels
    [RANDOM_NOISE]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            width  = input.width | 0,
            height = input.height | 0;

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

        const rnd = this.getRandomNumbers({
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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __reducePalette__ - Reduce the number of colors in its palette. The `palette` attribute can be: a Number (for the commonest colors);  an Array of CSS color Strings to use as the palette; or  the String name of a pre-defined palette - default: 'black-white'
    [REDUCE_PALETTE]: function (requirements) {

        const getRGBIndex = (r, g, b) => (r * _256_SQUARE) + (g * _256) + b;

        // Filter generics
        const [input, output] = this.getInputAndOutputLines(requirements),
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

        const noiseType = useBluenoise ? BLUENOISE : (requirements.noiseType || RANDOM);

        const libs = colorEngine.getRgbOkCache();

        // Dither noise (one per pixel)
        const rnd = this.getRandomNumbers({
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

        // Helper: pick two nearest palette entries using scaled-int OKLAB
        // + Palette entries must be [r,g,b, PLi, PAi, PBi] where
        // + PLi = L * 100 | 0
        // + PAi = (a + 0.4) * 125 | 0
        // + PBi = (b + 0.4) * 125 | 0
        function bestTwoPaletteIndices(ILi, IAi, IBi, pal) {

            let i0 = -1,
                i1 = -1,
                d0 = Infinity,
                d1 = Infinity;

            for (let p = 0, pz = pal.length; p < pz; p++) {

                const e = pal[p],
                    dL = ILi - e[3],
                    dA = IAi - e[4],
                    dB = IBi - e[5],
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
            // sqrt only the two winners, to preserve your weighting behavior
            return [i0, i1, _sqrt(d0), _sqrt(d1)];
        }

        // Helper: Map legacy UI min-distance (typically 0..1000) to OKLAB-int units.
        // + If caller already passes a small value (<=200), treat it as OKLAB-int and skip rescale.
        function toOkIntDist2(uiValue) {

            if (uiValue < 100) uiValue = 100;

            const mapped = uiValue * 0.01;

            return mapped * mapped;
        }

        // == Grayscale palettes ==
        if (isGray) {

            const selectedPalette = predefinedPalette[palette],
                P = selectedPalette.length,
                getGray = colorEngine.getBestGray;

            for (let i = 0; i < len; i += 4) {

                const a = i + 3;
                const alpha = iData[a];

                if (alpha) {

                    const r = i,
                        g = i + 1,
                        b = i + 2,
                        gray = getGray(iData[r], iData[g], iData[b]);

                    // track best two without building arrays/sorting
                    let idx0 = -1,
                        idx1 = -1,
                        d0 = Infinity,
                        d1 = Infinity;

                    for (let pi = 0; pi < P; pi++) {

                        const pv = selectedPalette[pi],
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

                    const total = d0 + d1,
                        propensity = total - d0,
                        test = rnd[++rndCursor] * total,
                        chosen = (test < propensity) ? selectedPalette[idx0] : selectedPalette[idx1];

                    oData[r] = chosen;
                    oData[g] = chosen;
                    oData[b] = chosen;
                    oData[a] = alpha;
                }
                else {

                    ++rndCursor;
                    oData[i] = iData[i];
                    oData[i + 1] = iData[i + 1];
                    oData[i + 2] = iData[i + 2];
                    oData[a] = 0;
                }
            }

            setLastUsedReducePalette(palette);

            if (lineOut) this.processResults(output, input, 1 - opacity);
            else this.processResults(this.cache.work, output, opacity);

            return;
        }

        // == Array-of-colors palette ==
        if (isArrayPalette) {

            const name = palette.join(ARG_SPLITTER);

            let selectedPalette = predefinedPalette[name];

            if (!selectedPalette) {

                selectedPalette = [];

                for (let i = 0, iz = palette.length; i < iz; i++) {

                    const [eR, eG, eB] = colorEngine.extractRGBfromColorString(palette[i]);

                    const ok = colorEngine.getOkValsForRgb(eR, eG, eB, libs),
                        PLi = (ok[0] * 100) | 0,
                        PAi = ((ok[1] + 0.4) * 125) | 0,
                        PBi = ((ok[2] + 0.4) * 125) | 0;

                    selectedPalette.push([eR, eG, eB, PLi, PAi, PBi]);
                }
                predefinedPalette[name] = selectedPalette;
            }

            for (let i = 0; i < len; i += 4) {

                const a = i + 3,
                    alpha = iData[a];

                if (alpha) {

                    const r = i,
                        g = i + 1,
                        b = i + 2;

                    const ok = colorEngine.getOkValsForRgb(iData[r], iData[g], iData[b], libs);

                    const ILi = (ok[0] * 100) | 0,
                        IAi = ((ok[1] + 0.4) * 125) | 0,
                        IBi = ((ok[2] + 0.4) * 125) | 0;

                    const [i0, i1, d0, d1] = bestTwoPaletteIndices(ILi, IAi, IBi, selectedPalette);

                    const total = d0 + d1,
                        propensity = total - d0,
                        test = rnd[++rndCursor] * total;

                    const chosen = (test < propensity) ? selectedPalette[i0] : selectedPalette[i1];

                    oData[r] = chosen[0];
                    oData[g] = chosen[1];
                    oData[b] = chosen[2];
                    oData[a] = alpha;

                } else {
                    ++rndCursor;
                    oData[i] = iData[i];
                    oData[i + 1] = iData[i + 1];
                    oData[i + 2] = iData[i + 2];
                    oData[a] = 0;
                }
            }
            setLastUsedReducePalette(palette);

            if (lineOut) this.processResults(output, input, 1 - opacity);
            else this.processResults(this.cache.work, output, opacity);

            return;
        }

        // == Commonest colors palette ==
        //
        // Use a Map keyed by rgbIndex so we only store colors that actually appear.
        // + rgbIndex -> [count, r, g, b, ILi, IAi, IBi]
        const metadata = new Map(),
            seen = [];

        // 1) collect metadata for observed colors
        for (let i = 0; i < len; i += 4) {

            const a = i + 3;

            if (!iData[a]) continue;

            const r = iData[i],
                g = iData[i + 1],
                b = iData[i + 2],
                rgbIndex = getRGBIndex(r, g, b);

            const row = metadata.get(rgbIndex);

            if (row) {

                row[0] += 1;

            } else {

                const ok = colorEngine.getOkValsForRgb(r, g, b, libs),
                    ILi = (ok[0] * 100) | 0,
                    IAi = ((ok[1] + 0.4) * 125) | 0,
                    IBi = ((ok[2] + 0.4) * 125) | 0;

                metadata.set(rgbIndex, [1, r, g, b, ILi, IAi, IBi]);

                seen.push(rgbIndex);
            }
        }

        // 2) commonest first (sort only the seen colors)
        seen.sort((i1, i2) => metadata.get(i2)[0] - metadata.get(i1)[0]);

        // 3) generate palette, winnowing by minimumColorDistance
        const minDist2 = toOkIntDist2(minimumColorDistance),
            firstRow = metadata.get(seen[0]),
            selectedPalette = [ firstRow.slice() ];

        for (let s = 1, sz = seen.length; s < sz; s++) {

            if (selectedPalette.length >= palette) break;

            const row = metadata.get(seen[s]),
                IL = row[4],
                IA = row[5],
                IB = row[6];

            // find nearest in current palette (distance squared)
            let best2 = Infinity;

            for (let j = 0, P = selectedPalette.length; j < P; j++) {

                const p = selectedPalette[j],
                    dL = IL - p[4],
                    dA = IA - p[5],
                    dB = IB - p[6],
                    dsq = (dL * dL) + (dA * dA) + (dB * dB);

                if (dsq < best2) best2 = dsq;
            }
            if (best2 > minDist2) selectedPalette.push(row.slice());
        }

        if (selectedPalette.length === 1 && seen.length > 1) {

            // push the 2nd most common color unconditionally
            selectedPalette.push(metadata.get(seen[1]).slice());
        }

        const selectedPaletteLength = selectedPalette.length;

        setLastUsedReducePalette(selectedPalette.map(item => `rgb(${item[1]} ${item[2]} ${item[3]})`));

        // 4) for each seen color, precompute its two best palette candidates (store totals/propensity)
        for (let s = 0, sz = seen.length; s < sz; s++) {

            const idx = seen[s],
                row = metadata.get(idx),
                IL = row[4],
                IA = row[5],
                IB = row[6];

            // find best two (squared), then sqrt winners to preserve weighting
            let i0 = -1,
                i1 = -1,
                d0 = Infinity,
                d1 = Infinity;

            for (let j = 0; j < selectedPaletteLength; j++) {

                const p = selectedPalette[j],
                    dL = IL - p[4],
                    dA = IA - p[5],
                    dB = IB - p[6],
                    dsq = dL * dL + dA * dA + dB * dB;

                if (dsq < d0) {

                    d1 = d0;
                    i1 = i0;
                    d0 = dsq;
                    i0 = j;
                }
                else if (dsq < d1) {

                    d1 = dsq;
                    i1 = j;
                }
            }

            // Robust fallback when there's only one palette entry (or ties)
            if (i0 === -1) {
                i0 = 0;
                d0 = 0;
            }

            if (i1 === -1) {
                i1 = i0;
                d1 = d0;
            }

            const sd0 = _sqrt(d0),
                sd1 = _sqrt(d1),
                total = sd0 + sd1,
                propensity = total - sd0;

            // overwrite with compact decision record:
            // [total, propensity, candidate0Row, candidate1Row]
            metadata.set(idx, [
                total,
                propensity,
                selectedPalette[i0],
                selectedPalette[i1],
            ]);
        }

        // 5) apply
        for (let i = 0; i < len; i += 4) {

            const a = i + 3,
                alpha = iData[a];

            if (alpha) {

                const r = iData[i],
                    g = iData[i + 1],
                    b = iData[i + 2],
                    rgbIndex = getRGBIndex(r, g, b),

                    rec = metadata.get(rgbIndex),
                    total = rec[0],

                    propensity = rec[1],
                    test = rnd[++rndCursor] * total,
                    chosen = (test < propensity) ? rec[2] : rec[3];

                oData[i] = chosen[1];
                oData[i + 1] = chosen[2];
                oData[i + 2] = chosen[3];
                oData[a] = alpha;

            } else {

                ++rndCursor;
                oData[i] = iData[i];
                oData[i + 1] = iData[i + 1];
                oData[i + 2] = iData[i + 2];
                oData[a] = 0;
            }
        }

        // Boilerplate post-processing
        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __rotate-hue__ - for each pixel, converts the pixel to OKLCH, rotates the hue value by the given amount and converts back to RGB
    [ROTATE_HUE]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

                rgb = colorEngine.getRgbValsForOklch(L, C, H, libs);

                out32[p] = ((a << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __set-channel-to-level__ - Sets the value of each pixel's included channel to the value supplied in the "level" argument.
    [SET_CHANNEL_TO_LEVEL]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        // 32-bit pixel views that respect byteOffset/length
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

        // Clamp level to [0, 255] and make it an int
        const L = level < 0 ? 0 : level > 255 ? 255 : (level | 0);

        const Rm = includeRed   ? 0x000000FF : 0,
            Gm = includeGreen ? 0x0000FF00 : 0,
            Bm = includeBlue  ? 0x00FF0000 : 0,
            Am = includeAlpha ? 0xFF000000 : 0;

        // Mask that zeroes the included channels; keeps others intact
        const clearMask = (~(Rm | Gm | Bm | Am)) >>> 0;

        // Mask that sets included channels to 'level'
        const setMask = (includeRed ? (L <<  0) : 0) | (includeGreen ? (L <<  8) : 0) | (includeBlue  ? (L << 16) : 0) | (includeAlpha ? ((L & 255) << 24) : 0);

        // Fast fill cases:
        // + If no channels included: just copy
        // + If all channels included: build one constant pixel and fill
        if ((Rm | Gm | Bm | Am) === 0) {

            // nothing to change
            for (let p = 0; p < src32.length; p++) {

                out32[p] = src32[p];
            }
        } 
        else if ((Rm | Gm | Bm | Am) === 0xFFFFFFFF >>> 0) {

            // all channels forced to level
            const constantPixel = setMask >>> 0;

            for (let p = 0; p < out32.length; p++) {

                out32[p] = constantPixel;
            }
        } 
        else {

            // General case: clear included bits, then OR in the level
            for (let p = 0; p < src32.length; p++) {

                const src = src32[p];
                out32[p] = (src & clearMask) | setMask;
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __step-channels__ - Takes three divisor values - "red", "green", "blue". For each pixel, its color channel values are divided by the corresponding color divisor, floored to the integer value and then multiplied by the divisor. For example a divisor value of '50' applied to a channel value of '120' will give a result of '100'. The output is a form of posterization.
//
// A new `clamp` attribute was added in v8.7.0, which can take the following String values:
// + `down` (default) - uses `Math.floor()` for the calculation
// + `up` - uses `Math.ceil()` for the calculation
// + `round` - uses `Math.round()` for the calculation
    [STEP_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

        // Fast identity path: divisors == 1 => no change for any mode
        if (red === 1 && green === 1 && blue === 1) out32.set(src32);

        else {

            const makeLUT = (d) => {

                const div = d > 0 ? d : 1;

                // Power-of-two fast path for DOWN
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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __swirl__ - For each pixel, move the pixel radially according to its distance from a given coordinate and associated angle for that coordinate.
// + This filter can handle multiple swirls in a single pass
    [SWIRL]: function (requirements) {

        const getValue = (val, dim) => (val && val.substring) ? _floor((parseFloat(val) / 100) * dim) : val;

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len   = iData.length,
            iWidth  = input.width,
            iHeight = input.height;

        const tData = new Uint8ClampedArray(iData);

        const {
            opacity = 1,
            swirls = [],
            lineOut,
        } = requirements;

        if (_isArray(swirls) && !swirls.length) this.transferDataUnchanged(oData, iData, len);
        else {

            tData.set(iData);
            oData.set(iData);

            let s, sz, startX, startY, innerRadius, outerRadius, angle, easing, sx, sy, outer, inner, complexLen, x, xz, y, yz, e, ename, swirlName, swirlCoords, start, coord, iy, ix, destIdx, distance, srcIdx, factor, dx, dy, cursor, rowBase, bytesPerPx, spanPx, spanBytes, off;

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
                    if (isa_fn(e)) {

                        ename = `ude-${e(0)}-${e(0.1)}-${e(0.2)}-${e(0.3)}-${e(0.4)}-${e(0.5)}-${e(0.6)}-${e(0.7)}-${e(0.8)}-${e(0.9)}-${e(1)}`;
                    }
                    else {
                        e = (null != easeEngines[e]) ? easeEngines[e] : easeEngines['linear'];
                    }

                    swirlName = `swirl-${startX}-${startY}-${innerRadius}-${outerRadius}-${angle}-${ename}-${iWidth}-${iHeight}`;

                    swirlCoords = getOrAddWorkstoreItem(swirlName);

                    if (!swirlCoords.length) {

                        start = requestCoordinate();
                        coord = requestCoordinate();

                        start.setFromArray([sx, sy]);

                        for (iy = y; iy < yz; iy++) {

                            for (ix = x; ix < xz; ix++) {

                                destIdx = (((iy * iWidth) + ix) << 2);

                                distance = coord.set([ix, iy]).subtract(start).getMagnitude();

                                if (distance > outer) srcIdx = destIdx;
                                else {

                                    factor = 1;
                                    if (distance >= inner) {

                                        factor = 1 - ((distance - inner) / complexLen);
                                        factor = e(factor);
                                    }

                                    coord.rotate(angle * factor).add(start);

                                    dx = _floor(coord[0]);
                                    dy = _floor(coord[1]);

                                    if (dx < 0) dx += iWidth;
                                    else if (dx >= iWidth) dx -= iWidth;

                                    if (dy < 0) dy += iHeight;
                                    else if (dy >= iHeight) dy -= iHeight;

                                    srcIdx = (((dy * iWidth) + dx) << 2);
                                }

                                swirlCoords.push(srcIdx);
                            }
                        }
                        releaseCoordinate(coord, start);
                    }

                    cursor = 0;

                    for (let iy = y; iy < yz; iy++) {

                        rowBase = (iy * iWidth) << 2;

                        for (ix = x; ix < xz; ix++) {

                            destIdx = rowBase + (ix << 2);
                            srcIdx  = swirlCoords[cursor++];

                            oData[destIdx] = tData[srcIdx];
                            oData[destIdx + 1] = tData[srcIdx + 1];
                            oData[destIdx + 2] = tData[srcIdx + 2];
                            oData[destIdx + 3] = tData[srcIdx + 3];
                        }
                    }

                    bytesPerPx = 4;
                    spanPx = (xz - x);
                    spanBytes = spanPx * bytesPerPx;

                    for (iy = y; iy < yz; iy++) {

                        off = (((iy * iWidth) + x) << 2);

                        tData.set(oData.subarray(off, off + spanBytes), off);
                    }
                }
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __threshold__ - performs a binary check on each pixel and, according to the result, assigns the pixel to a defined high or low color
// + By default this filter will grayscale the input then, for each pixel, check the color channel values against a `level` argument: pixels with grayscale values above the level value are assigned to the `high` color; otherwise they are updated to the `low` color. The "high" and "low" arguments are `[red, green, blue, alpha]` integer Number Arrays.
// + The convenience function will accept the pseudo-attributes `highRed`, `lowRed` etc in place of the "high" and "low" Arrays.
// + When the `useMixedChannel` flag is set to `false` then the filter will perform the threshold check on each channel in turn; the threshold levels for these per-channel checks are set in the `red`, `green`, `blue` and `alpha` arguments
// + Channels can be excluded from the filter action by setting the `includeRed` etc flags to false
    [THRESHOLD]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const src32 = new Uint32Array(iData.buffer, iData.byteOffset, iData.byteLength >>> 2),
            out32 = new Uint32Array(oData.buffer,  oData.byteOffset,  oData.byteLength >>> 2);

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

        const [lowR, lowG, lowB, lowA] = low;
        const [highR, highG, highB, highA] = high;

        let lvl = level | 0;
        if (lvl < 0) lvl = 0; else if (lvl > 255) lvl = 255;

        const gray709 = (r, g, b) => (r * 54 + g * 183 + b * 19) >> 8;

        const packLowRGB = ((lowB  & 0xFF) << 16) | ((lowG  & 0xFF) << 8) | (lowR  & 0xFF);
        const packHighRGB = ((highB & 0xFF) << 16) | ((highG & 0xFF) << 8) | (highR & 0xFF);
        const packLowRGBA = ((lowA  & 0xFF) << 24) | packLowRGB;
        const packHighRGBA = ((highA & 0xFF) << 24) | packHighRGB;

        if (useMixedChannel) {

            if (includeRed && includeGreen && includeBlue) {

                let rgba, r, g, b, a, gray, rgbPacked;

                if (includeAlpha) {

                    for (let p = 0, pz = src32.length | 0; p < pz; p++) {

                        rgba = src32[p];

                        r = rgba & 0xFF;
                        g = (rgba >>> 8) & 0xFF;
                        b = (rgba >>> 16) & 0xFF;

                        gray = gray709(r, g, b);

                        out32[p] = (gray < lvl) ? packLowRGBA : packHighRGBA;
                    }
                }
                else {

                    for (let p = 0, pz = src32.length | 0; p < pz; p++) {

                        rgba = src32[p];

                        r = rgba & 0xFF;
                        g = (rgba >>> 8) & 0xFF;
                        b = (rgba >>> 16) & 0xFF;
                        a =  rgba >>> 24;

                        gray = gray709(r, g, b);
                        rgbPacked = (gray < lvl) ? packLowRGB : packHighRGB;

                        out32[p] = ((a & 0xFF) << 24) | rgbPacked;
                    }
                }

            }
            else {

                let pr, pg, pb, pa, cg, cb, ca, gray;

                for (let i = 0, iz = iData.length | 0; i < iz; i += 4) {

                    cg = i + 1;
                    cb = i + 2;
                    ca = i + 3;

                    pr = iData[i];
                    pg = iData[cg];
                    pb = iData[cb];
                    pa = iData[ca];

                    gray = gray709(pr, pg, pb);

                    if (gray < lvl) {

                        oData[i] = includeRed ? lowR : pr;
                        oData[cg] = includeGreen ? lowG : pg;
                        oData[cb] = includeBlue ? lowB : pb;
                        oData[ca] = includeAlpha ? lowA : pa;
                    }
                    else {

                        oData[i] = includeRed ? highR : pr;
                        oData[cg] = includeGreen ? highG : pg;
                        oData[cb] = includeBlue ? highB : pb;
                        oData[ca] = includeAlpha ? highA : pa;
                    }
                }
            }

        }
        else {

            if (includeRed && includeGreen && includeBlue && includeAlpha) {

                let pr, pg, pb, pa, rOut, gOut, bOut, aOut, cg, cb, ca;

                for (let p = 0, pz = src32.length | 0, i = 0; p < pz; p++, i += 4) {

                    cg = i + 1;
                    cb = i + 2;
                    ca = i + 3;

                    pr = iData[i];
                    pg = iData[cg];
                    pb = iData[cb];
                    pa = iData[ca];

                    rOut = (pr < red) ? lowR : highR;
                    gOut = (pg < green) ? lowG : highG;
                    bOut = (pb < blue) ? lowB : highB;
                    aOut = (pa < alpha) ? lowA : highA;

                    out32[p] = ((aOut & 0xFF) << 24) | ((bOut & 0xFF) << 16) | ((gOut & 0xFF) << 8) | (rOut & 0xFF);
                }
            }
            else {

                let pr, pg, pb, pa, cg, cb, ca;

                for (let i = 0, len = iData.length | 0; i < len; i += 4) {

                    cg = i + 1;
                    cb = i + 2;
                    ca = i + 3;

                    pr = iData[i];
                    pg = iData[cg];
                    pb = iData[cb];
                    pa = iData[ca];

                    oData[i]   = includeRed   ? ((pr < red)   ? lowR  : highR) : pr;
                    oData[cg] = includeGreen ? ((pg < green) ? lowG  : highG) : pg;
                    oData[cb] = includeBlue  ? ((pb < blue)  ? lowB  : highB) : pb;
                    oData[ca] = includeAlpha ? ((pa < alpha) ? lowA  : highA) : pa;
                }
            }
        }

        // Single processing call at the end
        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __tiles__ - Cover the image with tiles whose color matches the average channel values for the pixels included in each tile. Has a similarity to the `pixelate` filter, but uses a set of coordinate points to generate the tiles which results in a Delauney-like output
// + `points='rect-grid'` - generate a regular grid of tiles, where: `offsetX`, `offsetY` represent the origin coordinate from which the grid will be calculated; `tileWidth`, `tileHeight` supply the dimensions of the rectangular tiles; `angle` is the amount of tile rotation.
// + `points='hex-grid'` - generate a hexagonal grid of tiles, where: `offsetX`, `offsetY` represent the origin coordinate from which the grid will be calculated; `tileRadius` supplies the radius for each hexagonal tile; `angle` is the amount of tile rotation.
// + `points=50` - generate a pseudo-random set of points based on `offsetX`, `offsetY` and `tileRadius` arguments
// + `points=[100, 100, 100, 300, 300, 100, 300, 300]` - action the points as described in the array
// + More documentation can be found with the `buildGeneralTileSets` code, near the top of this file.
    [TILES]: function (requirements) {

        const doCalculations = function (inChannel, outChannel, tile, offset) {

            let avg = tile.reduce((a, v) => a + inChannel[(v * 4) + offset], 0);

            avg = _floor(avg / tile.length);

            for (let i = 0, iz = tile.length; i < iz; i++) {

                outChannel[(tile[i] * 4) + offset] = avg;
            }
        }

        const setOutValueToInValue = function (inChannel, outChannel, tile, offset) {

            let cell;

            for (let i = 0, iz = tile.length; i < iz; i++) {

                cell = (tile[i] * 4) + offset;
                outChannel[cell] = inChannel[cell];
            }
        };

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            tileWidth = 1,
            tileHeight = 1,
            tileRadius = 1,
            offsetX = 0,
            offsetY = 0,
            angle = 0,
            points = RECT_GRID,
            seed = DEFAULT_SEED,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = false,
            lineOut,
        } = requirements;

        const tiles = this.buildGeneralTileSets(points, tileWidth, tileHeight, tileRadius, offsetX, offsetY, angle, seed);

        if (!tiles.length) this.transferDataUnchanged(oData, iData, len);
        else {

            tiles.forEach(t => {

                if (includeRed) doCalculations(iData, oData, t, 0);
                else setOutValueToInValue(iData, oData, t, 0);

                if (includeGreen) doCalculations(iData, oData, t, 1);
                else setOutValueToInValue(iData, oData, t, 1);

                if (includeBlue) doCalculations(iData, oData, t, 2);
                else setOutValueToInValue(iData, oData, t, 2);

                if (includeAlpha) doCalculations(iData, oData, t, 3);
                else setOutValueToInValue(iData, oData, t, 3);
            });
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __tint-channels__ - Has similarities to the SVG &lt;feColorMatrix> filter element, but excludes the alpha channel from calculations. Rather than set a matrix, we set nine arguments to determine how the value of each color channel in a pixel will affect both itself and its fellow color channels. The 'sepia' convenience filter presets these values to create a sepia effect.
    [TINT_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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

            let rgba, r, g, b, a, nr, ng, nb;

            for (let p = 0, pz = src32.length | 0; p < pz; p++) {

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

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __user-defined-legacy__ - Previous to version 8.4, filters could be defined with an argument which passed a function string to the filter engine, which the engine would then run against the source input image as-and-when required. This functionality has been removed from the new filter functionality. All such filters will now return the input image unchanged.

    [USER_DEFINED_LEGACY]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        this.transferDataUnchanged(oData, iData, len);

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __vary-channels-by-weights__ - manipulate colors using a set of channel curve arrays.
// + The weights Array is (256 * 4) elements long. For each color level, we supply four weights: `redweight, greenweight, blueweight, allweight`
// + The default weighting for all elements is `0`. Weights are added to a pixel channel's value, thus weighting values need to be integer Numbers, either positive or negative
// + The `useMixedChannel` flag uses a different calculation, where a pixel's channel values are combined to give their grayscale value, then that weighting (stored as the `allweight` weighting value) is added to each channel value, pro-rata in line with the grayscale channel weightings. (Note: this produces a different result compared to tools supplied in various other graphic manipulation software)
// + Using this method, we can perform a __curve__ (image tonality) filter
    [VARY_CHANNELS_BY_WEIGHTS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

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
        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
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
