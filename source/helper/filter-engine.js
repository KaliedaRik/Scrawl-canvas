// # Scrawl-canvas filter engine
// All Scrawl-canvas filters-related image manipulation work happens in this engine code. Note that this functionality is entirely separate from the &lt;canvas> element's context engine's native `filter` functionality, which allows us to add CSS/SVG-based filters to the canvas context
// + Note that prior to v8.5.0 most of this code lived in an (asynchronous) web worker. Web worker functionality has now been removed from Scrawl-canvas as it was not adding sufficient efficiency to rendering speed


import { constructors, filter, filternames, styles, stylesnames } from '../core/library.js';

import { seededRandomNumberGenerator } from './random-seed.js';

import { correctAngle, doCreate, easeEngines, isa_fn } from './utilities.js';

import { getOrAddWorkstoreItem, getWorkstoreItem, setAndReturnWorkstoreItem, setWorkstoreItem } from './workstore.js';

import { makeAnimation } from '../factory/animation.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';

import { releaseArray, requestArray } from './array-pool.js';

import { makeColor } from '../factory/color.js';

import { bluenoise } from './filter-engine-bluenoise-data.js';

import { _abs, _ceil, _entries, _exp, _floor, _freeze, _isArray, _isFinite, _max, _min, _round, _sqrt, ALPHA_TO_CHANNELS, AREA_ALPHA, ARG_SPLITTER, AVERAGE_CHANNELS, BLACK_WHITE, BLEND, BLUE, BLUENOISE, BLUR, CHANNELS_TO_ALPHA, CHROMA, CLAMP_CHANNELS, CLEAR, COLOR, COLOR_BURN, COLOR_DODGE, COLORS_TO_ALPHA, COMPOSE, CORRODE, CURRENT, DARKEN, DEFAULT_SEED, DESTINATION_ATOP, DESTINATION_IN, DESTINATION_ONLY, DESTINATION_OUT, DESTINATION_OVER, DIFFERENCE, DISPLACE, DOWN, EMBOSS, EXCLUSION, FLOOD, GAUSSIAN_BLUR, GLITCH, GRAY_PALETTES, GRAYSCALE, GREEN, HARD_LIGHT, HEX_GRID, HUE, INVERT_CHANNELS, LIGHTEN, LIGHTER, LOCK_CHANNELS_TO_LEVELS, LUMINOSITY, MAP_TO_GRADIENT, MATRIX, MEAN, MODULATE_CHANNELS, MONOCHROME_16, MONOCHROME_4, MONOCHROME_8, MULTIPLY, NEWSPRINT, OFFSET, ORDERED, OVERLAY, PIXELATE, POINTS_ARRAY, PROCESS_IMAGE, RANDOM, RANDOM_NOISE, RANDOM_POINTS, RECT_GRID, RED, REDUCE_PALETTE, ROUND, SATURATION, SCREEN, SET_CHANNEL_TO_LEVEL, SOFT_LIGHT, SOURCE, SOURCE_ALPHA, SOURCE_ATOP, SOURCE_IN, SOURCE_ONLY, SOURCE_OUT, STEP_CHANNELS, SWIRL, T_FILTER_ENGINE, THRESHOLD, TILES, TINT_CHANNELS, UNSET, UP, USER_DEFINED_LEGACY, VARY_CHANNELS_BY_WEIGHTS, XOR, ZERO_STR } from './shared-vars.js';


// Local constants
const orderedNoise = new Float32Array([0.00,0.50,0.13,0.63,0.03,0.53,0.16,0.66,0.75,0.25,0.88,0.38,0.78,0.28,0.91,0.41,0.19,0.69,0.06,0.56,0.22,0.72,0.09,0.59,0.94,0.44,0.81,0.31,0.97,0.47,0.84,0.34,0.05,0.55,0.17,0.67,0.02,0.52,0.14,0.64,0.80,0.30,0.92,0.42,0.77,0.27,0.89,0.39,0.23,0.73,0.11,0.61,0.20,0.70,0.08,0.58,0.98,0.48,0.86,0.36,0.95,0.45,0.83,0.33]);

const newspaperPatterns = _freeze([
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
]);

const LOW_ARRAY = new Uint8Array([0,255,0]);
const HIGH_ARRAY = new Uint8Array([0,255,255]);


// The filter Color object - used by various filters
export const colorEngine = makeColor({
    name: 'SC-system-filter-do-not-remove',
});


// #### FilterEngine constructor
const FilterEngine = function () {

    // ### Transactional variables

    // __cache__ - an Object consisting of `key:Object` pairs where the key is the named input of a `process-image` action or the output of any action object. This object is cleared and re-initialized each time the `engine.action` function is invoked
    this.cache = null;

    // __actions__ - the Array of action objects that the engine needs to process - data supplied by the main thread in its message's `packetFiltersArray` attribute.
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

        actions.push(...filters[i].actions)
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
}


// ### Permanent variables

// ColorSpaceIndices are used by the reducePalette filter. Hoping to expand this to other filters to allow a wider use of OKLAB/OKLCH color spaces.
P.colorSpaceIndices = function () {

    if (!this.tfx) {

        this.tfx = 256
        this.tfx2 = this.tfx * 256;
        this.tfx3 = this.tfx2 * 256;

        this.indicesLen = this.tfx3 * 3;

        this.labIndicesMultiplier = 512;

        this.rgbIndices = new Uint8ClampedArray(this.indicesLen);
        this.labIndices = new Float32Array(this.indicesLen);
        this.indicesMemoRecord = new Uint8ClampedArray(this.tfx3);
    }
};

// `unknit` - called at the start of each new message action chain. Creates and populates the __source__ and __work__ objects from the image data supplied in the message
P.unknit = function (image) {

    this.cache = {};

    const cache = this.cache;

    const { width, height, data } = image;

    cache.source = new ImageData(data, width, height);
    cache.work = new ImageData(data, width, height);
};

// `getAlphaData` - extract alpha channel data from (usually the source) ImageData object and populate the color channels of a new ImageData object with that data
P.getAlphaData = function (image) {

    const {width, height, data:iData} = image;

    const len = iData.length;

    const sourceAlpha = new ImageData(width, height),
        aData = sourceAlpha.data;

    let a, i;

    for (i = 0; i < len; i += 4) {

        a = iData[i + 3];
        aData[i] = 0;
        aData[i + 1] = 0;
        aData[i + 2] = 0;
        aData[i + 3] = (a > 0) ? 255 : 0;
    }

    return sourceAlpha;
};


// ### Functions invoked by a range of different action functions
//
// `buildImageGrid` creates an Array of Arrays which contain the indexes of each pixel in the image channel Arrays
P.buildImageGrid = function (image) {

    const { cache } = this;

    if (!image) image = cache.source;

    const { width, height } = image

    if (width && height) {

        const name = `grid-${width}-${height}`,
            itemInWorkstore = getWorkstoreItem(name);

        if (itemInWorkstore) return itemInWorkstore;

        const grid = [];

        let counter = 0,
            row, x, y;

        for (y = 0; y < height; y++) {

            row = [];

            for (x = 0; x < width; x++) {

                row.push(counter);
                counter++;
            }
            grid.push(_freeze(row));
        }

        _freeze(grid);
        setWorkstoreItem(name, grid);
        return grid;
    }
    return false;
};

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

    const vals = requestArray();

    let i, j, k, temp, currentRow;

    if (type == BLUENOISE && imgWidth) {

        const bLen = bluenoise.length,
            blueDims = _sqrt(bLen),
            imgHeight = length / imgWidth,
            bLines = requestArray();

        for (i = 0; i < bLen; i += blueDims) {

            temp = bluenoise.slice(i, i + blueDims);
            bLines.push(temp);
        }

        for (i = imgHeight; i > 0; i -= blueDims) {

            for (j = 0; j < blueDims; j++) {

                currentRow = bLines[j];

                for (k = imgWidth; k > 0; k -= blueDims) {

                    if (k < blueDims) vals.push(...currentRow.slice(0, k));
                    else vals.push(...currentRow);
                }
            }
        }
        releaseArray(bLines);
    }
    else if (type == ORDERED && imgWidth) {

        const oLen = orderedNoise.length,
            oDims = _sqrt(oLen),
            imgHeight = length / imgWidth,
            oLines = requestArray();

        for (i = 0; i < oLen; i += oDims) {

            temp = orderedNoise.slice(i, i + oDims);
            oLines.push(temp);
        }

        for (i = imgHeight; i > 0; i -= oDims) {

            for (j = 0; j < oDims; j++) {

                currentRow = oLines[j];

                for (k = imgWidth; k > 0; k -= oDims) {

                    if (k < oDims) vals.push(...currentRow.slice(0, k));
                    else vals.push(...currentRow);
                }
            }
        }
        releaseArray(oLines);
    }
    else {

        const engine = seededRandomNumberGenerator(seed);

        for (i = 0; i < length; i++) {

            vals.push(engine.random());
        }
    }

    const valsArray = new Float32Array(vals);
    releaseArray(vals);

    setWorkstoreItem(name, valsArray);
    return valsArray;
};

P.buildImageCoordinateLookup = function (image) {

    const { cache } = this;

    if (!image) image = cache.source;

    const { width, height } = image

    if (width && height) {

        const name = `coords-lookup-${width}-${height}`,
            itemInWorkstore = getWorkstoreItem(name);

        if (itemInWorkstore) return itemInWorkstore;

        const lookup = []

        for (let y = 0; y < height; y++) {

            for (let x = 0; x < width; x++) {

                lookup.push(_freeze([x, y]));
            }
        }

        _freeze(lookup);
        setWorkstoreItem(name, lookup);
        return lookup;
    }
    return false;
};

// `buildAlphaTileSets` - creates a record of which pixels belong to which tile - used for manipulating alpha channel values. Resulting object will be cached in the store
P.buildAlphaTileSets = function (tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY, areaAlphaLevels, image) {

    const { cache } = this;

    if (!image) image = cache.source;

    const { width:iWidth, height:iHeight } = image;

    if (iWidth && iHeight) {

        tileWidth = (_isFinite(tileWidth)) ? tileWidth : 1;
        tileHeight = (_isFinite(tileHeight)) ? tileHeight : 1;
        gutterWidth = (_isFinite(gutterWidth)) ? gutterWidth : 1;
        gutterHeight = (_isFinite(gutterHeight)) ? gutterHeight : 1;
        offsetX = (_isFinite(offsetX)) ? offsetX : 0;
        offsetY = (_isFinite(offsetY)) ? offsetY : 0;

        if (tileWidth < 1) tileWidth = 1;
        if (tileHeight < 1) tileHeight = 1;
        if (tileWidth + gutterWidth >= iWidth) tileWidth = iWidth - gutterWidth - 1;
        if (tileHeight + gutterHeight >= iHeight) tileHeight = iHeight - gutterHeight - 1;

        if (tileWidth < 1) tileWidth = 1;
        if (tileHeight < 1) tileHeight = 1;
        if (tileWidth + gutterWidth >= iWidth) gutterWidth = iWidth - tileWidth - 1;
        if (tileHeight + gutterHeight >= iHeight) gutterHeight = iHeight - tileHeight - 1;

        const aWidth = tileWidth + gutterWidth,
            aHeight = tileHeight + gutterHeight;

        if (offsetX < 0) offsetX = 0;
        if (offsetX >= aWidth) offsetX = aWidth - 1;
        if (offsetY < 0) offsetY = 0;
        if (offsetY >= aHeight) offsetY = aHeight - 1;

        const name = `alphatileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${gutterWidth}-${gutterHeight}-${offsetX}-${offsetY}`,
            itemInWorkstore = getWorkstoreItem(name);

        if (itemInWorkstore) return itemInWorkstore;

        const tiles = [];

        let hold, i, iz, j, jz, x, xz, y, yz;

        for (j = offsetY - aHeight, jz = iHeight; j < jz; j += aHeight) {

            for (i = offsetX - aWidth, iz = iWidth; i < iz; i += aWidth) {

                hold = [];
                for (y = j, yz = j + tileHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (x = i, xz = i + tileWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((((y * iWidth) + x) * 4) + 3);
                        }
                    }
                }
                tiles.push(_freeze([].concat(hold)));

                hold = [];
                for (y =  j + tileHeight, yz = j + tileHeight + gutterHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i, xz = i + tileWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((((y * iWidth) + x) * 4) + 3);
                        }
                    }
                }
                tiles.push(_freeze([].concat(hold)));

                hold = [];
                for (y = j, yz = j + tileHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i + tileWidth, xz = i + tileWidth + gutterWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((((y * iWidth) + x) * 4) + 3);
                        }
                    }
                }
                tiles.push(_freeze([].concat(hold)));

                hold = [];
                for (y =  j + tileHeight, yz = j + tileHeight + gutterHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i + tileWidth, xz = i + tileWidth + gutterWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((((y * iWidth) + x) * 4) + 3);
                        }
                    }
                }
                tiles.push(_freeze([].concat(hold)));
            }
        }

        _freeze(tiles);
        setWorkstoreItem(name, tiles);
        return tiles;
    }
    return false;
};

// `buildImageTileSets` - creates a record of which pixels belong to which tile - used for manipulating color channels values. Resulting object will be cached in the store
P.buildImageTileSets = function (tileWidth, tileHeight, offsetX, offsetY, image) {

    const { cache } = this;

    if (!image) image = cache.source;

    const { width:iWidth, height:iHeight } = image;

    if (iWidth && iHeight) {

        tileWidth = (_isFinite(tileWidth)) ? tileWidth : 1;
        tileHeight = (_isFinite(tileHeight)) ? tileHeight : 1;
        offsetX = (_isFinite(offsetX)) ? offsetX : 0;
        offsetY = (_isFinite(offsetY)) ? offsetY : 0;

        if (tileWidth < 1) tileWidth = 1;
        if (tileWidth >= iWidth) tileWidth = iWidth - 1;
        if (tileHeight < 1) tileHeight = 1;
        if (tileHeight >= iHeight) tileHeight = iHeight - 1;
        if (offsetX < 0) offsetX = 0;
        if (offsetX >= tileWidth) offsetX = tileWidth - 1;
        if (offsetY < 0) offsetY = 0;
        if (offsetY >= tileHeight) offsetY = tileHeight - 1;

        const name = `simple-tileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${offsetX}-${offsetY}`,
            itemInWorkstore = getWorkstoreItem(name);

        if (itemInWorkstore) return itemInWorkstore;

        const tiles = [];

        let i, iz, j, jz, x, xz, y, yz, hold;

        for (j = offsetY - tileHeight, jz = iHeight; j < jz; j += tileHeight) {

            for (i = offsetX - tileWidth, iz = iWidth; i < iz; i += tileWidth) {

                hold = [];

                for (y = j, yz = j + tileHeight; y < yz; y++) {

                    if (y >= 0 && y < iHeight) {

                        for (x = i, xz = i + tileWidth; x < xz; x++) {

                            if (x >= 0 && x < iWidth) hold.push(((y * iWidth) + x) * 4);
                        }
                    }
                }
                if (hold.length) tiles.push(_freeze(hold));
            }
        }

        _freeze(tiles);
        setWorkstoreItem(name, tiles);
        return tiles;
    }
    return false;
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

        if (req == UNSET) return [];

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
        if (req == POINTS_ARRAY) name += `-${pointVals.join(ARG_SPLITTER)}`;
        else if (req == RANDOM_POINTS) name += `-${pointVals}-${seed}`;

        const itemInWorkstore = getWorkstoreItem(name);

        if (itemInWorkstore) return itemInWorkstore;

        if (req == RECT_GRID && tileW === 1 && tileH === 1) return getOrAddWorkstoreItem(name);

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
        if (req == HEX_GRID && tileH / tileR < 1.05) tileH = tileR * 1.05;

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

                    _freeze(newPoints);
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

                    _freeze(newPoints);
                    points = getOrAddWorkstoreItem(pointsName, newPoints);
                }
                tileW = doubleR * 2;
                tileH = hexDown * 2;
                break;

            case RANDOM_POINTS :

                pointsName = `random-points-${iWidth}-${iHeight}-${tileR}-${offX}-${offY}-${points}-${seed}`;
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

                    _freeze(newPoints);
                    points = getOrAddWorkstoreItem(pointsName, newPoints);
                }
                tileW = tileR;
                tileH = tileR;
                break;

            case POINTS_ARRAY :

                pointsName = `defined-points-${iWidth}-${iHeight}-${tileR}-${pointVals}`;
                points = getWorkstoreItem(pointsName);

                if (!points) {

                    // User-generated points are not pre-processed. Note that the positioning of these points is relative to the offset coordinate values; users, when generating the point values, need to take this into account otherwise the end result may unexpectedly move towards (or beyond) the bottom-right part of the final image.
                    const newPoints = [...pointVals];

                    _freeze(newPoints);
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

                            if (req == RANDOM_POINTS) {

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

        _freeze(tiles);
        setWorkstoreItem(name, tiles);
        return tiles;
    }
    return [];
};

// `buildHorizontalBlur` - creates an Array of Arrays detailing which pixels contribute to the horizontal part of each pixel's blur calculation. Resulting object will be cached in the store
P.buildHorizontalBlur = function (grid, radius) {

    if (!_isFinite(radius)) radius = 0;

    const gridHeight = grid.length,
        gridWidth = grid[0].length;

    const name = `blur-h-${gridWidth}-${gridHeight}-${radius}`,
        itemInWorkstore = getWorkstoreItem(name);

    if (itemInWorkstore) return itemInWorkstore;

    const horizontalBlur = [];

    let x, y, c, cz, cellsToProcess;

    for (y = 0; y < gridHeight; y++) {

        for (x = 0; x < gridWidth; x++) {

            cellsToProcess = [];

            for (c = x - radius, cz = x + radius + 1; c < cz; c++) {

                if (c >= 0 && c < gridWidth) cellsToProcess.push(grid[y][c] * 4);
            }
            horizontalBlur[(y * gridWidth) + x] = _freeze(cellsToProcess);
        }
    }

    _freeze(horizontalBlur);
    setWorkstoreItem(name, horizontalBlur);
    return horizontalBlur;
};

// `buildVerticalBlur` - creates an Array of Arrays detailing which pixels contribute to the vertical part of each pixel's blur calculation. Resulting object will be cached in the store
P.buildVerticalBlur = function (grid, radius) {

    if (!_isFinite(radius)) radius = 0;

    const gridHeight = grid.length,
        gridWidth = grid[0].length;

    const name = `blur-v-${gridWidth}-${gridHeight}-${radius}`,
        itemInWorkstore = getWorkstoreItem(name);

    if (itemInWorkstore) return itemInWorkstore;

    const verticalBlur = [];

    let x, y, c, cz, cellsToProcess;

    for (x = 0; x < gridWidth; x++) {

        for (y = 0; y < gridHeight; y++) {

            cellsToProcess = [];

            for (c = y - radius, cz = y + radius + 1; c < cz; c++) {

                if (c >= 0 && c < gridHeight) cellsToProcess.push(grid[c][x] * 4);
            }
            verticalBlur[(y * gridWidth) + x] = _freeze(cellsToProcess);
        }
    }

    _freeze(verticalBlur);
    setWorkstoreItem(name, verticalBlur);
    return verticalBlur;
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

                cell.push(_freeze(val));
            }
            grid.push(_freeze(cell));
        }
    }

    _freeze(grid);
    setWorkstoreItem(name, grid);
    return grid;
};

// `checkChannelLevelsParameters` - divide each channel into discrete sequences of pixels
P.checkChannelLevelsParameters = function (f) {

    const doCheck = function (v, isHigh = false) {

        if (v.toFixed) {
            if (v < 0) return [LOW_ARRAY];
            if (v > 255) return [HIGH_ARRAY];
            if (!_isFinite(v)) return (isHigh) ? [HIGH_ARRAY] : [LOW_ARRAY];
            return [[0, 255, v]];
        }

        if (v.substring) {
            v = v.split(ARG_SPLITTER);
        }

        if (_isArray(v)) {

            if (!v.length) return v;
            if (_isArray(v[0])) return v;

            v = v.map(s => parseInt(s, 10));
            v.sort((a, b) => a - b);

            if (v.length == 1) return [[0, 255, v[0]]];

            const res = [];
            let starts, ends, i, iz;

            for (i = 0, iz = v.length; i < iz; i++) {

                starts = 0;
                ends = 255;
                if (i != 0) starts = _ceil(v[i - 1] + ((v[i] - v[i - 1]) / 2));
                if (i != iz - 1) ends = _floor(v[i] + ((v[i + 1] - v[i]) / 2));

                res.push([starts, ends, v[i]]);
            }
            return res;
        }
        return (isHigh) ? [HIGH_ARRAY] : [LOW_ARRAY];
    }
    f.red = doCheck(f.red);
    f.green = doCheck(f.green);
    f.blue = doCheck(f.blue);
    f.alpha = doCheck(f.alpha, true);
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

    if (requirements.lineIn == SOURCE_ALPHA || requirements.lineMix == SOURCE_ALPHA) alphaData = this.getAlphaData(sourceData);

    if (requirements.lineIn) {

        if (requirements.lineIn == SOURCE) lineIn = sourceData;
        else if (requirements.lineIn == SOURCE_ALPHA) lineIn = alphaData;
        else if (cache[requirements.lineIn]) lineIn = cache[requirements.lineIn];
    }

    if (requirements.lineMix) {

        if (requirements.lineMix == SOURCE) lineMix = sourceData;
        else if (requirements.lineMix == SOURCE_ALPHA) lineMix = alphaData;
        else if (requirements.lineMix == CURRENT) lineMix = cache.work;
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

// `getGrayscaleValue` - put here because this calculation is used in several different filters
P.getGrayscaleValue = function (r, g, b) {

    return _floor((0.2126 * r) + (0.7152 * g) + (0.0722 * b));
};

// `processResults` - at the conclusion of each action function, combine the results of the function's manipulations back into the data supplied for manipulation, in line with the value of the action object's `opacity` attribute
P.processResults = function (store, incoming, ratio) {

    const sData = store.data,
        iData = incoming.data;

    let antiRatio, i, iz;

    if (ratio == 1) {

        for (i = 0, iz = sData.length; i < iz; i++) {

            sData[i] = iData[i];
        }
    }
    else if (ratio > 0) {

        antiRatio = 1 - ratio;

        for (i = 0, iz = sData.length; i < iz; i++) {

            sData[i] = (sData[i] * antiRatio) + (iData[i] * ratio);
        }
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

    let r, g, b, a, i;

    for (i = 0; i < len; i += 4) {

        r = i;
        g = r + 1;
        b = g + 1;
        a = b + 1;

        oData[r] = iData[r];
        oData[g] = iData[g];
        oData[b] = iData[b];
        oData[a] = iData[a];
    }
};


// ## Filter action functions
// Each function is held in the `theBigActionsObject` object, for convenience
P.theBigActionsObject = _freeze({

// __alpha-to-channels__ - Copies the alpha channel value over to the selected value or, alternatively, sets that channel's value to zero, or leaves the channel's value unchanged. Setting the appropriate "includeChannel" flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate "excludeChannel" flag will set that channel's value to zero.
    [ALPHA_TO_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

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

        let r, g, b, a, aVal, i;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;
            aVal = iData[a];

            if (aVal) {

                oData[r] = (includeRed) ? aVal : ((excludeRed) ? 0 : iData[r]);
                oData[g] = (includeGreen) ? aVal : ((excludeGreen) ? 0 : iData[g]);
                oData[b] = (includeBlue) ? aVal : ((excludeBlue) ? 0 : iData[b]);
                oData[a] = 255;
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
            len = iData.length;

        const {
            opacity = 1,
            tileWidth = 1,
            tileHeight = 1,
            offsetX = 0,
            offsetY = 0,
            gutterWidth = 1,
            gutterHeight = 1,
            areaAlphaLevels = [255, 0, 0, 0],
            lineOut,
        } = requirements;

        const tiles = this.buildAlphaTileSets(tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY, areaAlphaLevels);

        this.transferDataUnchanged(oData, iData, len);

        let a, j, jz, tVal;

        tiles.forEach((t, index) => {

            a = areaAlphaLevels[index % 4];

            for (j = 0, jz = t.length; j < jz; j++) {

                tVal = t[j];

                if (iData[tVal]) oData[tVal] = a;
            }
        });

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __average-channels__ - Calculates an average value from each pixel's included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to 0.
    [AVERAGE_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

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

        let divisor = 0;
        if (includeRed) divisor++;
        if (includeGreen) divisor++;
        if (includeBlue) divisor++;

        let i, avg, r, g, b, a;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            if (iData[a]) {

                if (divisor) {

                    avg = 0;

                    if (includeRed) avg += iData[r];
                    if (includeGreen) avg += iData[g];
                    if (includeBlue) avg += iData[b];

                    avg = _floor(avg / divisor);

                    oData[r] = (excludeRed) ? 0 : avg;
                    oData[g] = (excludeGreen) ? 0 : avg;
                    oData[b] = (excludeBlue) ? 0 : avg;
                    oData[a] = iData[a];
                }
                else {

                    oData[r] = (excludeRed) ? 0 : iData[r];
                    oData[g] = (excludeGreen) ? 0 : iData[g];
                    oData[b] = (excludeBlue) ? 0 : iData[b];
                    oData[a] = iData[a];
                }
            }
            else {

                oData[r] = iData[r];
                oData[g] = iData[g];
                oData[b] = iData[b];
                oData[a] = iData[a];
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// DEPRECATED! __binary__ - use the updated `threshold` filter instead, which now incorporates binary filter functionality
//
// __blend__ - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using various separable and non-separable blend modes (as defined by the W3C Compositing and Blending Level 1 recommendations.
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
            if (dmix == 1) return 255;
            else if (din == 0) return 0;
            return (1 - _min(1, ((1 - dmix) / din ))) * 255;
        };

        const colordodgeCalc = (din, dmix) => {
            if (dmix == 0) return 0;
            else if (din == 1) return 255;
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

        let x, y, dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA, ir, ig, ib, ia, mr, mg, mb, ma, cr, cg, cb;

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

                                [cr, cg, cb] = colorEngine.calculateColorBlend(iData[ir], iData[ig], iData[ib], mData[mr], mData[mg], mData[mb]);

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

                                [cr, cg, cb] = colorEngine.calculateHueBlend(iData[ir], iData[ig], iData[ib], mData[mr], mData[mg], mData[mb]);

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

                                [cr, cg, cb] = colorEngine.calculateLuminosityBlend(iData[ir], iData[ig], iData[ib], mData[mr], mData[mg], mData[mb]);

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

                                [cr, cg, cb] = colorEngine.calculateSaturationBlend(iData[ir], iData[ig], iData[ib], mData[mr], mData[mg], mData[mb]);

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

        const getUncheckedValue = function (flag, gridStore, pos, data, offset) {

            if (flag) {

                const h = gridStore[pos];

                if (h != null) {

                    const l = h.length;

                    let valCounter = 0,
                        total = 0,
                        index, t;

                    for (t = 0; t < l; t += step) {

                        index = h[t] + offset;

                        total += data[index];
                        valCounter++
                    }
                    return total / valCounter;
                }
            }
            return data[(pos * 4) + offset];
        };

        const getCheckedValue = function (flag, gridStore, pos, data, offset) {

            if (flag) {

                const h = gridStore[pos];

                if (h != null) {

                    const l = h.length;

                    let valCounter = 0,
                        total = 0,
                        index, t, a, hVal;

                    for (t = 0; t < l; t += step) {

                        hVal = h[t];
                        a = hVal + 3;

                        if (data[a]) {

                            index = hVal + offset;

                            total += data[index];
                            valCounter++
                        }
                    }
                    if (valCounter) return total / valCounter;
                }
            }
            return data[(pos * 4) + offset];
        };

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length,
            pixelLen = _floor(len / 4);

        const {
            opacity = 1,
            radius = 0,
            passes = 1,
            processVertical = true,
            processHorizontal = true,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = false,
            excludeTransparentPixels = false,
            step = 1,
            lineOut,
        } = requirements;

        let horizontalBlurGrid, verticalBlurGrid;

        if (processHorizontal || processVertical) {

            const grid = this.buildImageGrid(input);

            if (processHorizontal)  horizontalBlurGrid = this.buildHorizontalBlur(grid, radius);

            if (processVertical) verticalBlurGrid = this.buildVerticalBlur(grid, radius);
        }

        oData.set(iData);

        const hold = new Uint8ClampedArray(iData);

        const selectedMethod = (excludeTransparentPixels) ? getCheckedValue : getUncheckedValue;

        let counter, r, g, b, a, pass;

        for (pass = 0; pass < passes; pass++) {

            if (processHorizontal) {

                for (counter = 0; counter < pixelLen; counter++) {

                    r = counter * 4;
                    g = r + 1;
                    b = g + 1;
                    a = b + 1;

                    if (includeAlpha || hold[a]) {

                        oData[r] = selectedMethod(includeRed, horizontalBlurGrid, counter, hold, 0);
                        oData[g] = selectedMethod(includeGreen, horizontalBlurGrid, counter, hold, 1);
                        oData[b] = selectedMethod(includeBlue, horizontalBlurGrid, counter, hold, 2);
                        oData[a] = getUncheckedValue(includeAlpha, horizontalBlurGrid, counter, hold, 3);
                    }
                }

                if (processVertical || pass < passes - 1) hold.set(oData);
            }

            if (processVertical) {

                for (counter = 0; counter < pixelLen; counter++) {

                    r = counter * 4;
                    g = r + 1;
                    b = g + 1;
                    a = b + 1;

                    if (includeAlpha || hold[a]) {

                        oData[r] = selectedMethod(includeRed, verticalBlurGrid, counter, hold, 0);
                        oData[g] = selectedMethod(includeGreen, verticalBlurGrid, counter, hold, 1);
                        oData[b] = selectedMethod(includeBlue, verticalBlurGrid, counter, hold, 2);
                        oData[a] = getUncheckedValue(includeAlpha, verticalBlurGrid, counter, hold, 3);
                    }
                }
                if (pass < passes - 1) hold.set(oData);
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __channels-to-alpha__ - Calculates an average value from each pixel's included channels and applies that value to the alpha channel.
    [CHANNELS_TO_ALPHA]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            lineOut,
        } = requirements;

        let divisor = 0;
        if (includeRed) divisor++;
        if (includeGreen) divisor++;
        if (includeBlue) divisor++;

        let r, g, b, a, vr, vg, vb, i, sum;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            vr = iData[r];
            vg = iData[g];
            vb = iData[b];

            oData[r] = vr;
            oData[g] = vg;
            oData[b] = vb;

            if (divisor) {

                sum = 0;

                if (includeRed) sum += vr;
                if (includeGreen) sum += vg;
                if (includeBlue) sum += vb;

                oData[a] = _floor(sum / divisor);
            }
            else oData[a] = iData[a];
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __chroma__ - Using an array of 'range' arrays, determine whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. Each 'range' array comprises six Numbers representing [minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue] values.
    [CHROMA]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            ranges = [],
            lineOut,
        } = requirements;

        let r, g, b, a, vr, vg, vb, i, iz, j, flag;

        for (j = 0; j < len; j += 4) {

            flag = false;

            r = j;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            vr = iData[r];
            vg = iData[g];
            vb = iData[b];

            for (i = 0, iz = ranges.length; i < iz; i++) {

                const [minR, minG, minB, maxR, maxG, maxB] = ranges[i];

                if (vr >= minR && vr <= maxR && vg >= minG && vg <= maxG && vb >= minB && vb <= maxB) {
                    flag = true;
                    break;
                }

            }
            oData[r] = vr;
            oData[g] = vg;
            oData[b] = vb;
            oData[a] = (flag) ? 0 : iData[a];
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __clamp-channels__ - Clamp each color channel to a range set by lowColor and highColor values
    [CLAMP_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

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

        const dR = highRed - lowRed,
            dG = highGreen - lowGreen,
            dB = highBlue - lowBlue;

        let r, g, b, a, vr, vg, vb, va, i;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            vr = iData[r];
            vg = iData[g];
            vb = iData[b];
            va = iData[a];

            if (va) {

                vr /= 255;
                vg /= 255;
                vb /= 255;

                oData[r] = lowRed + (vr * dR);
                oData[g] = lowGreen + (vg * dG);
                oData[b] = lowBlue + (vb * dB);
            }
            else {
                oData[r] = vr;
                oData[g] = vg;
                oData[b] = vb;
            }
            oData[a] = va;
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __colors-to-alpha__ - Determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the "red", "green" and "blue" arguments. The sensitivity of the effect can be manipulated using the "transparentAt" and "opaqueAt" values, both of which lie in the range 0-1.
    [COLORS_TO_ALPHA]: function (requirements) {

        const getCTAValue = function (dr, dg, db) {

            const diff = (_abs(red - dr) + _abs(green - dg) + _abs(blue - db)) / 3;

            if (diff < transparent) return 0;
            if (diff > opaque) return 255;
            return ((diff - transparent) / range) * 255;
        };

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            red = 0,
            green = 255,
            blue = 0,
            opaqueAt = 1,
            transparentAt = 0,
            lineOut,
        } = requirements;

        const maxDiff = _max(((red + green + blue) / 3), (((255 - red) + (255 - green) + (255 - blue)) / 3)),
            transparent = transparentAt * maxDiff,
            opaque = opaqueAt * maxDiff,
            range = opaque - transparent;

        let r, g, b, a, vr, vg, vb, i;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            if (iData[a]) {

                vr = iData[r];
                vg = iData[g];
                vb = iData[b];

                oData[r] = vr;
                oData[g] = vg;
                oData[b] = vb;
                oData[a] = getCTAValue(vr, vg, vb);
            }
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
        if (channelX == RED) offsetForChannelX = 0;
        else if (channelX == GREEN) offsetForChannelX = 1;
        else if (channelX == BLUE) offsetForChannelX = 2;

        let offsetForChannelY = 3;
        if (channelY == RED) offsetForChannelY = 0;
        else if (channelY == GREEN) offsetForChannelY = 1;
        else if (channelY == BLUE) offsetForChannelY = 2;

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

// __emboss__ - A 3x3 matrix transform; the matrix weights are calculated internally from the values of two arguments: "strength", and "angle" - which is a value measured in degrees, with 0 degrees pointing to the right of the origin (along the positive x axis). Post-processing options include removing unchanged pixels, or setting then to mid-gray. The convenience method includes additional arguments which will add a choice of grayscale, then channel clamping, then blurring actions before passing the results to this emboss action
    [EMBOSS]: function (requirements) {

        const doCalculations = function (data, matrix, offset) {

            let val = 0;

            for (let m = 0, mz = matrix.length; m < mz; m++) {

                if (weights[m]) val += (data[matrix[m] + offset] * weights[m]);
            }
            return val;
        }

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            tolerance = 0,
            keepOnlyChangedAreas = false,
            postProcessResults = false,
            lineOut,
        } = requirements;

        const strength = _abs(requirements.strength || 1);

        const angle = correctAngle(requirements.angle || 0);

        const slices = _floor(angle / 45),
            remains = ((angle % 45) / 45) * strength,
            weights = new Array(9);

        weights.fill(0, 0, 9);
        weights[4] = 1;

        if (slices == 0) {
            weights[5] = strength - remains;
            weights[8] = remains;
            weights[3] = -weights[5];
            weights[0] = -weights[8];
        }
        else if (slices == 1) {
            weights[8] = strength - remains;
            weights[7] = remains;
            weights[0] = -weights[8];
            weights[1] = -weights[7];
        }
        else if (slices == 2) {
            weights[7] = strength - remains;
            weights[6] = remains;
            weights[1] = -weights[7];
            weights[2] = -weights[6];
        }
        else if (slices == 3) {
            weights[6] = strength - remains;
            weights[3] = remains;
            weights[2] = -weights[6];
            weights[5] = -weights[3];
        }
        else if (slices == 4) {
            weights[3] = strength - remains;
            weights[0] = remains;
            weights[5] = -weights[3];
            weights[8] = -weights[0];
        }
        else if (slices == 5) {
            weights[0] = strength - remains;
            weights[1] = remains;
            weights[8] = -weights[0];
            weights[7] = -weights[1];
        }
        else if (slices == 6) {
            weights[1] = strength - remains;
            weights[2] = remains;
            weights[7] = -weights[1];
            weights[6] = -weights[2];
        }
        else {
            weights[2] = strength - remains;
            weights[5] = remains;
            weights[6] = -weights[2];
            weights[3] = -weights[5];
        }

        const grid = this.buildMatrixGrid(3, 3, 1, 1, input);

        let i, r, g, b, a, iR, iG, iB, iA, oR, oG, oB, m;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            iR = iData[r];
            iG = iData[g];
            iB = iData[b];
            iA = iData[a];

            if (iA) {

                m = _floor(i / 4);

                oData[r] = doCalculations(iData, grid[m], 0);
                oData[g] = doCalculations(iData, grid[m], 1);
                oData[b] = doCalculations(iData, grid[m], 2);
                oData[a] = iData[a];

                if (postProcessResults) {

                    oR = oData[r];
                    oG = oData[g];
                    oB = oData[b];

                    if (oR >= iR - tolerance && oR <= iR + tolerance &&
                        oG >= iG - tolerance && oG <= iG + tolerance &&
                        oB >= iB - tolerance && oB <= iB + tolerance) {

                        if (keepOnlyChangedAreas) oData[a] = 0;
                        else {
                            oData[r] = 127;
                            oData[g] = 127;
                            oData[b] = 127;
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
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            red = 0,
            green = 0,
            blue = 0,
            alpha = 255,
            excludeAlpha = false,
            lineOut,
        } = requirements;

        let i, c, a;

        for (i = 0; i < len; i += 4) {

            a = i + 3;

            if (iData[a]) {

                c = i;
                oData[c] = red;

                c++;
                oData[c] = green;

                c++;
                oData[c] = blue;

                c++;
                oData[c] = (excludeAlpha) ? iData[a] : alpha;
            }
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
            radius = 1,
            lineOut,
        } = requirements;

        const hold = new Uint8ClampedArray(iData);

        const src32 = new Uint32Array(hold.buffer);

        const out = new Uint32Array(src32.length),
            tmp_line = new Float32Array(_max(width, height) * 4);

        const coeff = gaussCoef(radius);

        convolveRGBA(src32, out, tmp_line, coeff, width, height, radius);
        convolveRGBA(out, src32, tmp_line, coeff, height, width, radius);

        oData.set(hold);

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __glitch__ - Swap pixels at random within a given box (width/height) distance of each other, dependent on the level setting - lower levels mean less noise. Uses a pseudo-random numbers generator to ensure consistent results across runs. Takes into account choices to include red, green, blue and alpha channels, and whether to ignore transparent pixels
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
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        const gVal = this.getGrayscaleValue;

        let r, g, b, a, i, gray;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            gray = gVal(iData[r], iData[g], iData[b]);

            oData[r] = gray;
            oData[g] = gray;
            oData[b] = gray;
            oData[a] = iData[a];
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __invert-channels__ - For each pixel, subtracts its current channel values - when included - from 255.
    [INVERT_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = false,
            lineOut,
        } = requirements;

        let r, g, b, a, i;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            oData[r] = (includeRed) ? 255 - iData[r] : iData[r];
            oData[g] = (includeGreen) ? 255 - iData[g] : iData[g];
            oData[b] = (includeBlue) ? 255 - iData[b] : iData[b];
            oData[a] = (includeAlpha) ? 255 - iData[a] : iData[a];
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __lock-channels-to-levels__ - Produces a posterize effect. Takes in four arguments - "red", "green", "blue" and "alpha" - each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value.
    [LOCK_CHANNELS_TO_LEVELS]: function (requirements) {

        const getLCTLValue = function (val, levels) {

            if (!levels.length) return val;

            for (let j = 0, jz = levels.length; j < jz; j++) {

                const [start, end, level] = levels[j];
                if (val >= start && val <= end) return level;
            }
        };

        this.checkChannelLevelsParameters(requirements);

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            red = [0],
            green = [0],
            blue = [0],
            alpha = [255],
            lineOut,
        } = requirements;

        let r, g, b, a, i;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            oData[r] = getLCTLValue(iData[r], red);
            oData[g] = getLCTLValue(iData[g], green);
            oData[b] = getLCTLValue(iData[b], blue);
            oData[a] = getLCTLValue(iData[a], alpha);
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __map-to-gradient__ - maps the colors in the supplied (complex) gradient to a grayscaled input.
    [MAP_TO_GRADIENT]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            useNaturalGrayscale = false,
            gradient = false,
            lineOut,
        } = requirements;

        if (gradient) {

            let i, avg, r, g, b, a, v;

            const rainbowData = this.getGradientData(gradient);

            if (rainbowData.length) {

                const gVal = this.getGrayscaleValue;

                for (i = 0; i < len; i += 4) {

                    r = i;
                    g = r + 1;
                    b = g + 1;
                    a = b + 1;

                    if (iData[a]) {

                        if (useNaturalGrayscale) avg = gVal(iData[r], iData[g], iData[b]);
                        else avg = _floor((0.3333 * iData[r]) + (0.3333 * iData[g]) + (0.3333 * iData[b]));

                        v = avg * 4;

                        oData[r] = rainbowData[v];
                        v++;
                        oData[g] = rainbowData[v];
                        v++;
                        oData[b] = rainbowData[v];
                        v++;
                        oData[a] = rainbowData[v];
                    }
                }
            }
            else this.transferDataUnchanged(oData, iData, len);
        }
        else this.transferDataUnchanged(oData, iData, len);

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __matrix__ - Performs a matrix operation on each pixel's channels, calculating the new value using neighbouring pixel weighted values. Also known as a convolution matrix, kernel or mask operation. Note that this filter is expensive, thus much slower to complete compared to other filter effects. The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments. The weights to be applied need to be supplied in the "weights" argument - an Array listing the weights row-by-row starting from the top-left corner of the matrix. By default all color channels are included in the calculations while the alpha channel is excluded. The 'edgeDetect', 'emboss' and 'sharpen' convenience filter methods all use the matrix action, pre-setting the required weights.
    [MATRIX]: function (requirements) {

        const doCalculations = function (data, matrix, offset) {

            let val = 0,
                c;

            for (let m = 0, mz = matrix.length; m < mz; m++) {


                if (weights[m]) {

                    c = matrix[m] + offset;
                    val += (data[c] * weights[m]);
                }
            }
            return val;
        };

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            includeRed = true,
            includeGreen = true,
            includeBlue = true,
            includeAlpha = false,
            offsetX = 1,
            offsetY = 1,
            lineOut,
        } = requirements;

        let width = requirements.width;
        if (!_isFinite(width) || width < 1) width = 3;
        width = _floor(width);

        let height = requirements.height;
        if (!_isFinite(height) || height < 1) height = 3;
        height = _floor(height);

        let weights = requirements.weights;
        if (!weights || weights.length != (width * height)) {
            weights = [].fill(0, 0, (width * height) - 1);
            weights[_floor(weights.length / 2) + 1] = 1;
        }

        const grid = this.buildMatrixGrid(width, height, offsetX, offsetY, input);

        let r, g, b, a, i;

        const pixels = _floor(len / 4);

        for (i = 0; i < pixels; i++) {

            r = i * 4;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            if (iData[a]) {

                oData[r] = (includeRed) ? doCalculations(iData, grid[i], 0) : iData[r];
                oData[g] = (includeGreen) ? doCalculations(iData, grid[i], 1) : iData[g];
                oData[b] = (includeBlue) ? doCalculations(iData, grid[i], 2) : iData[b];
                oData[a] = (includeAlpha) ? doCalculations(iData, grid[i], 3) : iData[a];
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __modulate-channels__ - Multiplies each channel's value by the supplied argument value. A channel-argument's value of '0' will set that channel's value to zero; a value of '1' will leave the channel value unchanged. If the "saturation" flag is set to 'true' the calculation changes to start at that pixel's grayscale values. The 'brightness' and 'saturation' filters are special forms of the 'channels' filter which use a single "levels" argument to set all three color channel arguments to the same value.
    [MODULATE_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            red = 1,
            green = 1,
            blue = 1,
            alpha = 1,
            saturation = false,
            lineOut,
        } = requirements;

        let r, g, b, a, gray, vr, vg, vb, i;

        if (saturation) {

            const gVal = this.getGrayscaleValue;

            for (i = 0; i < len; i += 4) {

                r = i;
                g = r + 1;
                b = g + 1;
                a = b + 1;

                vr = iData[r];
                vg = iData[g];
                vb = iData[b];

                gray = gVal(vr, vg, vb);

                oData[r] = gray + ((vr - gray) * red);
                oData[g] = gray + ((vg - gray) * green);
                oData[b] = gray + ((vb - gray) * blue);
                oData[a] = iData[a] * alpha;
            }
        }
        else {

            for (i = 0; i < len; i += 4) {

                r = i;
                g = r + 1;
                b = g + 1;
                a = b + 1;

                oData[r] = iData[r] * red;
                oData[g] = iData[g] * green;
                oData[b] = iData[b] * blue;
                oData[a] = iData[a] * alpha;
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __newsprint__ - TODO documentation
    [NEWSPRINT]: function (requirements) {

        const doCalculations = function (inChannel, outChannel, tile) {

            grays.length = 0;
            calcGrays.length = 0;

            let avg = 0,
                i, r, g, b, a, gray;

            const l = tile.length;

            for (i = 0; i < l; i++) {

                r = tile[i];
                g = r + 1;
                b = g + 1;

                gray = gVal(inChannel[r], inChannel[g], inChannel[b]);

                avg += gray;
            }
            avg /= l;

            const pattern = patterns[_floor((avg / 255) * 13)];

            if (width == 1) grays.push(...pattern);
            else {

                gray = pattern[0];
                for (i = 0; i < width; i++) {
                    calcGrays.push(gray);
                }
                gray = pattern[1];
                for (i = 0; i < width; i++) {
                    calcGrays.push(gray);
                }
                for (i = 0; i < width; i++) {
                    grays.push(...calcGrays);
                }
                gray = pattern[2];
                calcGrays.length = 0;
                for (i = 0; i < width; i++) {
                    calcGrays.push(gray);
                }
                gray = pattern[3];
                for (i = 0; i < width; i++) {
                    calcGrays.push(gray);
                }
                for (i = 0; i < width; i++) {
                    grays.push(...calcGrays);
                }
            }

            for (i = 0; i < l; i++) {

                gray = grays[i];

                r = tile[i];
                g = r + 1;
                b = g + 1;
                a = b + 1;

                outChannel[r] = gray;
                outChannel[g] = gray;
                outChannel[b] = gray;
                outChannel[a] = inChannel[a];
            }
        }

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        let width = _floor(requirements.width || 1);
        if (width < 1) width = 1;

        const tileDimensions = width * 2;

        const tiles = this.buildImageTileSets(tileDimensions, tileDimensions, 0, 0);

        const gVal = this.getGrayscaleValue;
        const patterns = newspaperPatterns;
        const grays = [],
            calcGrays = [];

        tiles.forEach(t => doCalculations(iData, oData, t));

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __offset__ - Offset the input image in the output image.
    [OFFSET]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

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

        if (offsetRedX || offsetGreenX || offsetBlueX || offsetAlphaX || offsetRedY || offsetGreenY || offsetBlueY || offsetAlphaY) {

            let simpleoffset = false;

            if (offsetRedX == offsetGreenX && offsetRedX == offsetBlueX && offsetRedX == offsetAlphaX && offsetRedY == offsetGreenY && offsetRedY == offsetBlueY && offsetRedY == offsetAlphaY) simpleoffset = true;

            const grid = this.buildImageGrid(input),
                gWidth = grid[0].length,
                gHeight = grid.length;

            let drx, dry, dgx, dgy, dbx, dby, dax, day, inCell, outCell;

            for (let y = 0; y < gHeight; y++) {
                for (let x = 0; x < gWidth; x++) {

                    inCell = grid[y][x] * 4;

                    if (simpleoffset) {

                        drx = x + offsetRedX;
                        dry = y + offsetRedY;

                        if (drx >= 0 && drx < gWidth && dry >= 0 && dry < gHeight) {

                            outCell = grid[dry][drx] * 4;
                            oData[outCell] = iData[inCell];
                            oData[outCell + 1] = iData[inCell + 1];
                            oData[outCell + 2] = iData[inCell + 2];
                            oData[outCell + 3] = iData[inCell + 3];
                        }
                    }
                    else {

                        drx = x + offsetRedX;
                        dry = y + offsetRedY;
                        dgx = x + offsetGreenX;
                        dgy = y + offsetGreenY;
                        dbx = x + offsetBlueX;
                        dby = y + offsetBlueY;
                        dax = x + offsetAlphaX;
                        day = y + offsetAlphaY;

                        if (drx >= 0 && drx < gWidth && dry >= 0 && dry < gHeight) {

                            outCell = grid[dry][drx] * 4;
                            oData[outCell] = iData[inCell];
                        }

                        if (dgx >= 0 && dgx < gWidth && dgy >= 0 && dgy < gHeight) {

                            outCell = grid[dgy][dgx] * 4;
                            oData[outCell + 1] = iData[inCell + 1];
                        }

                        if (dbx >= 0 && dbx < gWidth && dby >= 0 && dby < gHeight) {

                            outCell = grid[dby][dbx] * 4;
                            oData[outCell + 2] = iData[inCell + 2];
                        }

                        if (dax >= 0 && dax < gWidth && day >= 0 && day < gHeight) {

                            outCell = grid[day][dax] * 4;
                            oData[outCell + 3] = iData[inCell + 3];
                        }
                    }
                }
            }
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __pixelate__ - Pixelizes the input image by creating a grid of tiles across it and then averaging the color values of each pixel in a tile and setting its value to the average. Tile width and height, and their offset from the top left corner of the image, are set via the "tileWidth", "tileHeight", "offsetX" and "offsetY" arguments.
    [PIXELATE]: function (requirements) {

        const doCalculations = function (inChannel, outChannel, tile, offset) {

            let avg = tile.reduce((a, v) => a + inChannel[v + offset], 0);

            avg = _floor(avg / tile.length);

            for (let i = 0, iz = tile.length; i < iz; i++) {

                outChannel[tile[i] + offset] = avg;
            }
        }

        const setOutValueToInValue = function (inChannel, outChannel, tile, offset) {

            let cell;

            for (let i = 0, iz = tile.length; i < iz; i++) {

                cell = tile[i];
                outChannel[cell + offset] = inChannel[cell + offset];
            }
        };

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data;

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

        const tiles = this.buildImageTileSets(tileWidth, tileHeight, offsetX, offsetY);

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

        const {assetData, lineOut} = requirements;

        if (lineOut && lineOut.substring && lineOut.length) {

            let {width, height, data} = assetData;

            if (width && height && data) {

                const {width:sWidth, height:sHeight} = this.cache.source;

                if (sWidth != width || sHeight != height) {

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
            len = iData.length,
            iWidth = input.width;

        const {
            opacity = 1,
            width = 1,
            height = 1,
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

        const rnd = this.getRandomNumbers({
            seed,
            length: _ceil((len / 4) * 3),
            imgWidth: iWidth,
            type: noiseType,
        });

        let rndCursor = -1,
            rndLevel,
            rndWidth,
            rndHeight,
            r, g, b, a, i, dw, dh, source;

        const halfWidth = width / 2,
            halfHeight = height / 2;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            if (noiseType == RANDOM) {

                rndLevel = rnd[++rndCursor];
                rndWidth = rnd[++rndCursor];
                rndHeight = rnd[++rndCursor];
            }
            else {

                const temp = rnd[++rndCursor];
                rndLevel = temp;
                rndWidth = temp;
                rndHeight = temp;
            }

            if (rndLevel < level) {

                dw = _floor((rndWidth * width) - halfWidth);
                dh = _floor((rndHeight * height) - halfHeight);

                source = i + ((dh * iWidth) + dw) * 4;

                if (noWrap && (source < 0 || source >= len)) {

                    oData[r] = iData[r];
                    oData[g] = iData[g];
                    oData[b] = iData[b];
                    oData[a] = iData[a];
                }
                else {

                    if (source < 0) source += len;
                    else if (source >= len) source -= len;

                    if (excludeTransparentPixels && (!iData[a] || !iData[source + 3])) {

                        oData[r] = iData[r];
                        oData[g] = iData[g];
                        oData[b] = iData[b];
                        oData[a] = iData[a];
                    }
                    else {

                        oData[r] = (includeRed) ? iData[source] : iData[r];
                        source++;
                        oData[g] = (includeGreen) ? iData[source] : iData[g];
                        source++;
                        oData[b] = (includeBlue) ? iData[source] : iData[b];
                        source++;
                        oData[a] = (includeAlpha) ? iData[source] : iData[a];
                    }
                }
            }
            else {

                oData[r] = iData[r];
                oData[g] = iData[g];
                oData[b] = iData[b];
                oData[a] = iData[a];
            }
        }
        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __reducePalette__ - Reduce the number of colors in its palette. The `palette` attribute can be: a Number (for the commonest colors);  an Array of CSS color Strings to use as the palette; or  the String name of a pre-defined palette - default: 'black-white'
    [REDUCE_PALETTE]: function (requirements) {

        // Check to see if external objects have been set up by a previous run
        // + If they are missing, create them
        if (!this.predefinedPalette) this.predefinedPalette = {};

        const grayPalettes = GRAY_PALETTES;

        // Check to see if colorSpaceIndices have been created; if not, create them.
        this.colorSpaceIndices();

        // Localize some handles to required functions/objects
        const {rgbIndices, labIndices, indicesMemoRecord:memoRecord, predefinedPalette, getGrayscaleValue, tfx, tfx2, labIndicesMultiplier } = this;

        let lab;

        // Internal function - create and memoize a palette
        const createPalette = (name, colors) => {

            if (!name) name = colors.join(ARG_SPLITTER);

            if (name && predefinedPalette[name]) return predefinedPalette[name];

            const p = [];

            colors.forEach(color => {

                colorEngine.convert(color);

                const [pr, pg, pb] = colorEngine.rgb;
                const pix = (pr * tfx2) + (pg * tfx) + pb
                p.push(pix);

                if (!memoRecord[pix]) {

                    memoRecord[pix] = 1;
                    const [l0, l1, l2] = colorEngine.convertRGBtoOKLAB(pr, pg, pb);

                    let ic = pix * 3;

                    rgbIndices[ic] = pr;
                    labIndices[ic] = l0 * labIndicesMultiplier;
                    ic++;
                    rgbIndices[ic] = pg;
                    labIndices[ic] = l1 * labIndicesMultiplier;
                    ic++;
                    rgbIndices[ic] = pb;
                    labIndices[ic] = l2 * labIndicesMultiplier;
                }
            });

            predefinedPalette[name] = p.sort((a, b) => a - b);

            return p;
        };

        // Setup predefined palettes if not done so by a previous run
        if (!predefinedPalette[BLACK_WHITE]) {

            createPalette(BLACK_WHITE, ['#000', '#fff']);
            createPalette(MONOCHROME_4, ['#222', '#777', '#bbb', '#fff']);
            createPalette(MONOCHROME_8, ['#000', '#333', '#555', '#777', '#999', '#bbb', '#ddd', '#fff']);
            createPalette(MONOCHROME_16, ['#000', '#111', '#222', '#333', '#444', '#555', '#666', '#777', '#888', '#999', '#aaa', '#bbb', '#ccc', '#ddd', '#eee', '#fff']);
        }

        // Perform test to discover pixel's closest palette gray, after dithering
        const getGrayPixel = function (pixel, pal) {

            const pl = pal.length;

            if (!pl) return 0;

            if (pl === 1) return pal[0];

            const pixelRef = rgbIndices[pixel * 3];
            let palRef, pItem, diff;

            const distance = [];

            for (let j = 0; j < pl; j++) {

                pItem = pal[j];
                palRef = rgbIndices[pItem * 3];

                diff = pixelRef - palRef;

                distance.push([pItem, _sqrt(diff * diff * 3)]);
            }

            distance.sort((a, b) => a[1] - b[1]);

            const [candidate0, distance0] = distance[0];
            const [candidate1, distance1] = distance[1];
            const totalscore = distance0 + distance1;
            const propensity0 = totalscore - distance0;

            const test = rnd[rndCursor] * totalscore;

            if (test < propensity0) return candidate0;
            return candidate1;
        }

        // Winnow all colors to recover the commonest, taking into account the minimum color distance between them
        const createCommonestColorsPalette = function (data, distance, limit) {

            const candidates = [],
                final = [];

            let f, fz, fIndex, fr, fg, fb,
                k, kz, kIndex, kr, kg, kb,
                dr, dg, db, dFlag;

            for (const [key, value] of _entries(data)) {

                if (value) candidates.push([key, value]);
            }

            candidates.sort((a, b) => b[1] - a[1]);

            for (k = 0, kz = candidates.length; k < kz; k++) {

                const candidate = candidates[k];

                if (!k) final.push(candidate[0]);
                else {

                    kIndex = candidate[0] * 3;

                    if (useLabForPaletteDistance) {

                        kr = labIndices[kIndex];
                        kIndex++;
                        kg = labIndices[kIndex];
                        kIndex++;
                        kb = labIndices[kIndex];

                        dFlag = true;

                        for (f = 0, fz = final.length; f < fz; f++) {

                            fIndex = final[f] * 3;

                            fr = labIndices[fIndex];
                            fIndex++;
                            fg = labIndices[fIndex];
                            fIndex++;
                            fb = labIndices[fIndex];

                            dr = kr - fr;
                            dg = kg - fg;
                            db = kb - fb;

                            if ((dr * dr) + (dg * dg) + (db * db) < distance) {

                                dFlag = false;
                                break;
                            }
                        }
                        if (dFlag) final.push(candidate[0]);

                        if (final.length >= limit) break;
                    }
                    else {

                        kr = rgbIndices[kIndex];
                        kIndex++;
                        kg = rgbIndices[kIndex];
                        kIndex++;
                        kb = rgbIndices[kIndex];

                        dFlag = true;

                        for (f = 0, fz = final.length; f < fz; f++) {

                            fIndex = final[f] * 3;

                            fr = rgbIndices[fIndex];
                            fIndex++;
                            fg = rgbIndices[fIndex];
                            fIndex++;
                            fb = rgbIndices[fIndex];

                            dr = kr - fr;
                            dg = kg - fg;
                            db = kb - fb;

                            if ((dr * dr) + (dg * dg) + (db * db) < distance) {

                                dFlag = false;
                                break;
                            }
                        }
                        if (dFlag) final.push(candidate[0]);

                        if (final.length >= limit) break;
                    }
                }
            }
            return final;
        };

        // Perform test to discover pixel's closest palette color, after dithering
        const getColorPixel = function (pixel, pal) {

            const pl = pal.length;

            let palIndex, counter,
                pixL, pixA, pixB,
                diff, dL, dA, dB,
                j;

            if (!pl) return 0;

            if (pl === 1) return pal[0];

            counter = pixel * 3;

            const palL = labIndices[counter];
            counter++;
            const palA = labIndices[counter];
            counter++;
            const palB = labIndices[counter];

            const distArray = [];

            for (j = 0; j < pl; j++) {

                palIndex = pal[j];

                counter = palIndex * 3;

                pixL = labIndices[counter];
                counter++;
                pixA = labIndices[counter];
                counter++;
                pixB = labIndices[counter];

                dL = palL - pixL;
                dA = palA - pixA;
                dB = palB - pixB;

                diff = (dL * dL) + (dA * dA) + (dB * dB);

                distArray.push([palIndex, diff]);
            }

            distArray.sort((a, b) => a[1] - b[1]);

            const [candidate0, distance0] = distArray[0];
            const [candidate1, distance1] = distArray[1];

            let test = rnd[rndCursor];

            const totalScore = distance0 + distance1,
                propensity = totalScore - distance0;

            test *= totalScore;

            if (test < propensity) return candidate0;
            return candidate1;
        };

        // Filter generics (as used by all filters)
        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            iWidth = input.width,
            iHeight = input.height,
            oData = output.data,
            len = iData.length,
            quarterLen = len / 4;

        const {
            opacity = 1,
            palette = BLACK_WHITE,
            seed = DEFAULT_SEED,
            useBluenoise = false,
            minimumColorDistance = 1000,
            useLabForPaletteDistance = false,
            lineOut,
        } = requirements;

        const noiseType = (useBluenoise) ? BLUENOISE : requirements.noiseType || RANDOM;

        let i, index,
            r, g, b, a, red, green, blue, alpha, gray,
            rndCursor, indicesCursor, dataCursor,
            selectedPalette;

        // Noise - used for dithering the output
        const rnd = this.getRandomNumbers({
            seed,
            length: quarterLen,
            imgWidth: iWidth,
            type: noiseType,
        });
        rndCursor = -1;

        // Grayscale vs non-grayscale palettes follow different computing paths
        const isGray = grayPalettes.includes(palette);

        // Transfer input data over to a temporary object
        // + if the palette is grayscale, we grayscale the input at this point
        const tempInput = new ImageData(iWidth, iHeight),
            tData = tempInput.data;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            if (isGray) {

                gray = getGrayscaleValue(iData[r], iData[g], iData[b]);

                tData[r] = gray;
                tData[g] = gray;
                tData[b] = gray;
                tData[a] = iData[a];
            }
            else {

                tData[r] = iData[r];
                tData[g] = iData[g];
                tData[b] = iData[b];
                tData[a] = iData[a];
            }
        }

        // Parse the input to determine what colors it contains, etc
        // + If some LAB color data has not yet been memoized, we do it at this point
        const pixelColorIndices = new Int32Array(len / 4);
        const detectedColors = {};

        for (i = 0; i < quarterLen; i++) {

            r = i * 4;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            red = tData[r];
            green = tData[g];
            blue = tData[b];
            alpha = tData[a];

            if (alpha) {

                index = (red * tfx2) + (green * tfx) + blue;

                pixelColorIndices[i] = index;

                if (detectedColors[index] == null) {

                   detectedColors[index] = 0;

                    if (!memoRecord[index]) {

                        memoRecord[index] = 1;
                        lab = colorEngine.convertRGBtoOKLAB(red, green, blue);

                        indicesCursor = index * 3;

                        rgbIndices[indicesCursor] = red;
                        labIndices[indicesCursor] = lab[0] * labIndicesMultiplier;
                        indicesCursor++;
                        rgbIndices[indicesCursor] = green;
                        labIndices[indicesCursor] = lab[1] * labIndicesMultiplier;
                        indicesCursor++;
                        rgbIndices[indicesCursor] = blue;
                        labIndices[indicesCursor] = lab[2] * labIndicesMultiplier;
                    }
                }
                detectedColors[index] = detectedColors[index] + 1;
            }
            else pixelColorIndices[i] = -1;
        }

        // Get the appropriate array of palette colors
        // + For commonest colors, we have to calculate a new best-fit palette for this image
        if (palette.substring) selectedPalette = predefinedPalette[palette] || [];
        else if (_isArray(palette)) selectedPalette = createPalette(ZERO_STR, palette);
        else if (palette.toFixed) selectedPalette = createCommonestColorsPalette(detectedColors, minimumColorDistance, palette);
        else selectedPalette = [];

        if (!selectedPalette.length) selectedPalette = predefinedPalette[BLACK_WHITE];

        // Calculate output
        // + Grayscale palettes and non-grayscale palettes follow different paths
        // + Both variants will skip processing transparent pixels
        for (i = 0; i < quarterLen; i++) {

            rndCursor++;

            index = pixelColorIndices[i];

            dataCursor = i * 4;

            if (index < 0) {

                oData[dataCursor] = tData[dataCursor];
                dataCursor++;
                oData[dataCursor] = tData[dataCursor];
                dataCursor++;
                oData[dataCursor] = tData[dataCursor];
                dataCursor++;
                oData[dataCursor] = tData[dataCursor];
            }
            else {

                if (isGray) indicesCursor = getGrayPixel(index, selectedPalette) * 3;
                else indicesCursor = getColorPixel(index, selectedPalette) * 3;

                oData[dataCursor] = rgbIndices[indicesCursor];
                dataCursor++;
                indicesCursor++;
                oData[dataCursor] = rgbIndices[indicesCursor];
                dataCursor++;
                indicesCursor++;
                oData[dataCursor] = rgbIndices[indicesCursor];
                dataCursor++;
                oData[dataCursor] = tData[dataCursor];
            }
        }

        // Boilerplate filter post-processing
        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __set-channel-to-level__ - Sets the value of each pixel's included channel to the value supplied in the "level" argument.
    [SET_CHANNEL_TO_LEVEL]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            includeRed = false,
            includeGreen = false,
            includeBlue = false,
            includeAlpha = false,
            level = 0,
            lineOut,
        } = requirements;

        let r, g, b, a, i;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            oData[r] = (includeRed) ? level : iData[r];
            oData[g] = (includeGreen) ? level : iData[g];
            oData[b] = (includeBlue) ? level : iData[b];
            oData[a] = (includeAlpha) ? level : iData[a];
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __step-channels__ - Takes three divisor values - "red", "green", "blue". For each pixel, its color channel values are divided by the corresponding color divisor, floored to the integer value and then multiplied by the divisor. For example a divisor value of '50' applied to a channel value of '120' will give a result of '100'. The output is a form of posterization.
//
// A new `clamp` attribute was added in v8.7.0, which can take the following String values:
// + `down` (default) - uses `Math.floor()` for the calculation
// + `up` (default) - uses `Math.ceil()` for the calculation
// + `round` (default) - uses `Math.round()` for the calculation
    [STEP_CHANNELS]: function (requirements) {

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length;

        const {
            opacity = 1,
            red = 1,
            green = 1,
            blue = 1,
            clamp = DOWN,
            lineOut,
        } = requirements;

        let r, g, b, a, i;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            switch (clamp) {

                case UP :
                    oData[r] = _ceil(iData[r] / red) * red;
                    oData[g] = _ceil(iData[g] / green) * green;
                    oData[b] = _ceil(iData[b] / blue) * blue;
                    break;

                case ROUND :
                    oData[r] = _round(iData[r] / red) * red;
                    oData[g] = _round(iData[g] / green) * green;
                    oData[b] = _round(iData[b] / blue) * blue;
                    break;

                default :
                    oData[r] = _floor(iData[r] / red) * red;
                    oData[g] = _floor(iData[g] / green) * green;
                    oData[b] = _floor(iData[b] / blue) * blue;
                    break;
            }
            oData[a] = iData[a];
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __swirl__ - For each pixel, move the pixel radially according to its distance from a given coordinate and associated angle for that coordinate.
// + This filter can handle multiple swirls in a single pass
    [SWIRL]: function (requirements) {

        const getValue = function (val, dim) {

            return (val.substring) ? _floor((parseFloat(val) / 100) * dim) : val;
        };

        const [input, output] = this.getInputAndOutputLines(requirements);

        const iData = input.data,
            oData = output.data,
            len = iData.length,
            iWidth = input.width,
            iHeight = input.height;

        const tempInput = new ImageData(iWidth, iHeight),
            tData = tempInput.data,
            tWidth = tempInput.width,
            tHeight = tempInput.height;

        const {
            opacity = 1,
            swirls = [],
            lineOut,
        } = requirements;

        let r, g, b, a, s, sz, pos, x, y, xz, yz, i, j,
            distance, dr, dg, db, da, dx, dy, dLen;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            tData[r] = iData[r];
            tData[g] = iData[g];
            tData[b] = iData[b];
            tData[a] = iData[a];

            oData[r] = iData[r];
            oData[g] = iData[g];
            oData[b] = iData[b];
            oData[a] = iData[a];
        }

        if (_isArray(swirls) && swirls.length) {

            const grid = this.buildImageGrid(input);

            for (s = 0, sz = swirls.length; s < sz; s++) {

                const [startX, startY, innerRadius, outerRadius, angle, easing] = swirls[s];

                const sx = getValue(startX, iWidth),
                    sy = getValue(startY, iHeight);

                let outer = getValue(outerRadius, iWidth),
                    inner = getValue(innerRadius, iWidth);

                if (inner > outer) {

                    const temp = inner;
                    inner = outer;
                    outer = temp;
                }

                const complexLen = outer - inner;

                x = sx - outer;
                if (x < 0) x = 0;
                xz = sx + outer
                if (xz > tWidth) xz = tWidth;
                y = sy - outer;
                if (y < 0) y = 0;
                yz = sy + outer
                if (yz >= tHeight) yz = tHeight;

                if (x < xz && y < yz && x < tWidth && xz > 0 && y < tHeight && yz > 0) {

                    let e = easing;
                    let ename = easing;

                    if (isa_fn(e)) ename = `ude-${e(0)}-${e(0.1)}-${e(0.2)}-${e(0.3)}-${e(0.4)}-${e(0.5)}-${e(0.6)}-${e(0.7)}-${e(0.8)}-${e(0.9)}-${e(1)}`;
                    else {
                        e = (null != easeEngines[e]) ? easeEngines[e] : easeEngines['linear'];
                    }

                    const swirlName = `swirl-${startX}-${startY}-${innerRadius}-${outerRadius}-${angle}-${ename}-${iWidth}-${iHeight}`;

                    const swirlCoords = getOrAddWorkstoreItem(swirlName);

                    if (!swirlCoords.length) {

                        const start = requestCoordinate();
                        const coord = requestCoordinate();

                        start.setFromArray([sx, sy]);

                        for (i = y; i < yz; i++) {

                            for (j = x; j < xz; j++) {

                                pos = [j, i];

                                r = grid[i][j] * 4;

                                distance = coord.set(pos).subtract(start).getMagnitude();

                                if (distance > outer) dr = r;
                                else if (distance < inner) {

                                    coord.rotate(angle).add(start);

                                    dx = _floor(coord[0]);
                                    dy = _floor(coord[1]);

                                    if (dx < 0) dx += iWidth;
                                    else if (dx >= iWidth) dx -= iWidth;

                                    if (dy < 0) dy += iHeight;
                                    else if (dy >= iHeight) dy -= iHeight;

                                    dr = grid[dy][dx] * 4;
                                }
                                else {

                                    dLen = 1 - ((distance - inner) / complexLen);

                                    dLen = e(dLen);

                                    coord.rotate(angle * dLen).add(start);

                                    dx = _floor(coord[0]);
                                    dy = _floor(coord[1]);

                                    if (dx < 0) dx += iWidth;
                                    else if (dx >= iWidth) dx -= iWidth;

                                    if (dy < 0) dy += iHeight;
                                    else if (dy >= iHeight) dy -= iHeight;

                                    dr = grid[dy][dx] * 4;
                                }
                                swirlCoords.push(dr);
                            }
                        }
                        releaseCoordinate(coord);
                        releaseCoordinate(start);
                    }

                    let swirlCursor = -1;
                    for (i = y; i < yz; i++) {

                        for (j = x; j < xz; j++) {

                            r = grid[i][j] * 4;
                            g = r + 1;
                            b = g + 1;
                            a = b + 1;

                            dr = swirlCoords[++swirlCursor];
                            dg = dr + 1;
                            db = dg + 1;
                            da = db + 1;

                            oData[r] = tData[dr];
                            oData[g] = tData[dg];
                            oData[b] = tData[db];
                            oData[a] = tData[da];
                        }
                    }

                    for (i = y; i < yz; i++) {

                        for (j = x; j < xz; j++) {

                            r = grid[i][j] * 4;
                            g = r + 1;
                            b = g + 1;
                            a = b + 1;

                            tData[r] = oData[r];
                            tData[g] = oData[g];
                            tData[b] = oData[b];
                            tData[a] = oData[a];
                        }
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
            oData = output.data,
            len = iData.length;

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

        const gVal = this.getGrayscaleValue;

        let r, g, b, a, i, pr, pg, pb, pa, gray;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            pr = iData[r];
            pg = iData[g];
            pb = iData[b];
            pa = iData[a];

            if (useMixedChannel) {

                gray = gVal(pr, pg, pb);

                if (gray < level) {

                    oData[r] = (includeRed) ? lowR : pr;
                    oData[g] = (includeGreen) ? lowG : pg;
                    oData[b] = (includeBlue) ? lowB : pb;
                    oData[a] = (includeAlpha) ? lowA : pa;
                }
                else {

                    oData[r] = (includeRed) ? highR : pr;
                    oData[g] = (includeGreen) ? highG : pg;
                    oData[b] = (includeBlue) ? highB : pb;
                    oData[a] = (includeAlpha) ? highA : pa;
                }
            }
            else {

                if (includeRed) {
                    oData[r] = (pr < red) ? lowR : highR;
                }
                else oData[r] = pr;

                if (includeGreen) {
                    oData[g] = (pg < green) ? lowG : highG;
                }
                else oData[g] = pg;

                if (includeBlue) {
                    oData[b] = (pb < blue) ? lowB : highB;
                }
                else oData[b] = pb;

                if (includeAlpha) {
                    oData[a] = (pa < alpha) ? lowA : highA;
                }
                else oData[a] = pa;
            }
        }

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
            oData = output.data,
            len = iData.length;

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

        let r, g, b, a, i, vr, vg, vb;

        for (i = 0; i < len; i += 4) {

            r = i;
            g = r + 1;
            b = g + 1;
            a = b + 1;

            vr = iData[r];
            vg = iData[g];
            vb = iData[b];

            oData[r] = _floor((vr * redInRed) + (vg * greenInRed) + (vb * blueInRed));
            oData[g] = _floor((vr * redInGreen) + (vg * greenInGreen) + (vb * blueInGreen));
            oData[b] = _floor((vr * redInBlue) + (vg * greenInBlue) + (vb * blueInBlue));
            oData[a] = iData[a];
        }

        if (lineOut) this.processResults(output, input, 1 - opacity);
        else this.processResults(this.cache.work, output, opacity);
    },

// __user-defined-legacy__ - Previous to version 8.4, filters could be defined with an argument which passed a function string to the filter engine, which the engine would then run against the source input image as-and-when required. This functionality has been removed from the new filter functionality. All such filters will now return the input image unchanged.

    [USER_DEFINED_LEGACY]: function (requirements) {

        const [input, output] = this.getInputAndOutputChannels(requirements);

        const {
            opacity = 1,
            lineOut,
        } = requirements;

        this.transferDataUnchanged(input, output);

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

        if (weights.length != 1024) {

            weights.length = 1024;
            weights.fill(0);
        }

        const gVal = this.getGrayscaleValue;

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

});

// We need an animation object to go through all the filters at the very end of the Display cycle RAF (request animation frame) and reset their `dirtyFilterIdentifier` flag to false.
makeAnimation({

    name: 'filters-cleanup-action',
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
