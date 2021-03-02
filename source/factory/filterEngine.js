// # Scrawl-canvas filter engine
// All Scrawl-canvas filters-related image manipulation work happens in this engine code. Note that this functionality is entirely separate from the &lt;canvas> element's context engine's native `filter` functionality, which allows us to add CSS/SVG-based filters to the canvas context
// + Note that prior to v8.5.0 most of this code lived in an (asynchronous) web worker. Web worker functionality has now been removed from Scrawl-canvas as it was not adding sufficient efficiency to rendering speed
// + At some point in the future we may implement this code as a WebAssembly module.


import { constructors } from '../core/library.js';
import {requestCell, releaseCell} from './cell.js';


// #### FilterEngine constructor
const FilterEngine = function () {

    // ### Transactional variables

    // __cache__ - an Object consisting of `key:Object` pairs where the key is the named input of a `process-image` action or the output of any action object. This object is cleared and re-initialized each time the `engine.action` function is invoked
    this.cache = null; 

    // __actions__ - the Array of action objects that the engine needs to process - data supplied by the main thread in its message's `packetFiltersArray` attribute.
    this.actions = [];

    this.choke = 3000;

    return this;
};


// #### FilterEngine prototype
let P = FilterEngine.prototype = Object.create(Object.prototype);
P.type = 'FilterEngine';

P.action = function (packet) {

    let { filters, image } = packet;

    let { workstoreLastAccessed, workstore, actions, choke, theBigActionsObject } = this;

    let workstoreKeys = Object.keys(workstore), 
        workstoreChoke = Date.now() - choke;

    workstoreKeys.forEach(k => {

        if (workstoreLastAccessed[k] < workstoreChoke) {

            delete workstore[k];
            delete workstoreLastAccessed[k];
        }
    });

    actions.length = 0;
    filters.forEach(f => actions.push(...f.actions));

    if (actions.length) {

        this.unknit(image);
        actions.forEach(a => theBigActionsObject[a.action] && theBigActionsObject[a.action].call(this, a));
        return this.cache.work;
    }
    return image;
}


// ### Permanent variables

// The filter engine maintains a semi-permanent storage space - the __workstore__ - for some processing objects that are computationally expensive, for instance grids, matrix reference data objects, etc. The engine also maintains a record of when each of these processing objects was last accessed and will remove objects if they have not been accessed in the last three seconds.
P.workstore = {},
P.workstoreLastAccessed = {};


// `unknit` - called at the start of each new message action chain. Creates and populates the __source__ and __work__ objects from the image data supplied in the message
P.unknit = function (image) {

    this.cache = {};

    let cache = this.cache;

    let { width, height, data } = image;

    let len = data.length;

    cache.source = new ImageData(data, width, height)
    cache.work = new ImageData(data, width, height)
};

// `getAlphaData` - extract alpha channel data from (usually the source) ImageData object and populate the color channels of a new ImageData object with that data
P.getAlphaData = function (image) {

    let {width, height, data:iData} = image;

    let len = iData.length;

    let sourceAlpha = new ImageData(width, height),
        aData = sourceAlpha.data;

    for (let i = 0; i < len; i += 4) {

        let a = iData[i + 3];
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

    let { cache, workstore, workstoreLastAccessed } = this;

    if (!image) image = cache.source;

    let { width, height } = image

    if (width && height) {

        let name = `grid-${width}-${height}`;
        if (workstore[name]) {
            workstoreLastAccessed[name] = Date.now();
            return workstore[name];
        }

        let grid = [],
            counter = 0;

        for (let y = 0; y < height; y++) {

            let row = [];

            for (let x = 0; x < width; x++) {
                
                row.push(counter);
                counter++;
            }
            grid.push(row);
        }
        workstore[name] = grid;
        workstoreLastAccessed[name] = Date.now();
        return grid;
    }
    return false;
};

// `buildAlphaTileSets` - creates a record of which pixels belong to which tile - used for manipulating alpha channel values. Resulting object will be cached in the store
P.buildAlphaTileSets = function (tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY, areaAlphaLevels, image) {

    let { cache, workstore, workstoreLastAccessed } = this;

    if (!image) image = cache.source;

    let { width:iWidth, height:iHeight } = image;

    if (iWidth && iHeight) {

        tileWidth = (tileWidth.toFixed && !isNaN(tileWidth)) ? tileWidth : 1;
        tileHeight = (tileHeight.toFixed && !isNaN(tileHeight)) ? tileHeight : 1;
        gutterWidth = (gutterWidth.toFixed && !isNaN(gutterWidth)) ? gutterWidth : 1;
        gutterHeight = (gutterHeight.toFixed && !isNaN(gutterHeight)) ? gutterHeight : 1;
        offsetX = (offsetX.toFixed && !isNaN(offsetX)) ? offsetX : 0;
        offsetY = (offsetY.toFixed && !isNaN(offsetY)) ? offsetY : 0;

        if (tileWidth < 1) tileWidth = 1;
        if (tileHeight < 1) tileHeight = 1;
        if (tileWidth + gutterWidth >= iWidth) tileWidth = iWidth - gutterWidth - 1;
        if (tileHeight + gutterHeight >= iHeight) tileHeight = iHeight - gutterHeight - 1;

        if (tileWidth < 1) tileWidth = 1;
        if (tileHeight < 1) tileHeight = 1;
        if (tileWidth + gutterWidth >= iWidth) gutterWidth = iWidth - tileWidth - 1;
        if (tileHeight + gutterHeight >= iHeight) gutterHeight = iHeight - tileHeight - 1;

        let aWidth = tileWidth + gutterWidth,
            aHeight = tileHeight + gutterHeight;

        if (offsetX < 0) offsetX = 0;
        if (offsetX >= aWidth) offsetX = aWidth - 1;
        if (offsetY < 0) offsetY = 0;
        if (offsetY >= aHeight) offsetY = aHeight - 1;

        let name = `alphatileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${gutterWidth}-${gutterHeight}-${offsetX}-${offsetY}`;
        if (workstore[name]) {
            workstoreLastAccessed[name] = Date.now();
            return workstore[name];
        }

        let tiles = [],
            hold, i, iz, j, jz, x, xz, y, yz;

        for (j = offsetY - aHeight, jz = iHeight; j < jz; j += aHeight) {

            for (i = offsetX - aWidth, iz = iWidth; i < iz; i += aWidth) {

                hold = [];
                for (y = j, yz = j + tileHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i, xz = i + tileWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((((y * iWidth) + x) * 4) + 3);
                        }
                    }
                }
                tiles.push([].concat(hold));

                hold = [];
                for (y =  j + tileHeight, yz = j + tileHeight + gutterHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i, xz = i + tileWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((((y * iWidth) + x) * 4) + 3);
                        }
                    }
                }
                tiles.push([].concat(hold));

                hold = [];
                for (y = j, yz = j + tileHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i + tileWidth, xz = i + tileWidth + gutterWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((((y * iWidth) + x) * 4) + 3);
                        }
                    }
                }
                tiles.push([].concat(hold));

                hold = [];
                for (y =  j + tileHeight, yz = j + tileHeight + gutterHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i + tileWidth, xz = i + tileWidth + gutterWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((((y * iWidth) + x) * 4) + 3);
                        }
                    }
                }
                tiles.push([].concat(hold));
            }
        }
        workstore[name] = tiles;
        workstoreLastAccessed[name] = Date.now();
        return tiles;
    }
    return false;
};

// `buildImageTileSets` - creates a record of which pixels belong to which tile - used for manipulating color channels values. Resulting object will be cached in the store
P.buildImageTileSets = function (tileWidth, tileHeight, offsetX, offsetY, image) {

    let { cache, workstore, workstoreLastAccessed } = this;

    if (!image) image = cache.source;

    let { width:iWidth, height:iHeight } = image;

    if (iWidth && iHeight) {

        tileWidth = (tileWidth.toFixed && !isNaN(tileWidth)) ? tileWidth : 1;
        tileHeight = (tileHeight.toFixed && !isNaN(tileHeight)) ? tileHeight : 1;
        offsetX = (offsetX.toFixed && !isNaN(offsetX)) ? offsetX : 0;
        offsetY = (offsetY.toFixed && !isNaN(offsetY)) ? offsetY : 0;

        if (tileWidth < 1) tileWidth = 1;
        if (tileWidth >= iWidth) tileWidth = iWidth - 1;
        if (tileHeight < 1) tileHeight = 1;
        if (tileHeight >= iHeight) tileHeight = iHeight - 1;
        if (offsetX < 0) offsetX = 0;
        if (offsetX >= tileWidth) offsetX = tileWidth - 1;
        if (offsetY < 0) offsetY = 0;
        if (offsetY >= tileHeight) offsetY = tileHeight - 1;

        let name = `imagetileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${offsetX}-${offsetY}`;
        if (workstore[name]) {
            workstoreLastAccessed[name] = Date.now();
            return workstore[name];
        }

        let tiles = [];

        for (let j = offsetY - tileHeight, jz = iHeight; j < jz; j += tileHeight) {

            for (let i = offsetX - tileWidth, iz = iWidth; i < iz; i += tileWidth) {

                let hold = [];
                
                for (let y = j, yz = j + tileHeight; y < yz; y++) {

                    if (y >= 0 && y < iHeight) {

                        for (let x = i, xz = i + tileWidth; x < xz; x++) {

                            if (x >= 0 && x < iWidth) hold.push(((y * iWidth) + x) * 4);
                        }
                    }
                }
                if (hold.length) tiles.push(hold);
            }
        }
        workstore[name] = tiles;
        workstoreLastAccessed[name] = Date.now();
        return tiles;
    }
    return false;
};

// `buildHorizontalBlur` - creates an Array of Arrays detailing which pixels contribute to the horizontal part of each pixel's blur calculation. Resulting object will be cached in the store
P.buildHorizontalBlur = function (grid, radius) {

    let { workstore, workstoreLastAccessed } = this;

    if (!radius || !radius.toFixed || isNaN(radius)) radius = 0;

    let gridHeight = grid.length,
        gridWidth = grid[0].length;

    let name = `blur-h-${gridWidth}-${gridHeight}-${radius}`;
    if (workstore[name]) {
        workstoreLastAccessed[name] = Date.now();
        return workstore[name];
    }

    let horizontalBlur = [],
        cell;

    for (let y = 0; y < gridHeight; y++) {

        for (let x = 0; x < gridWidth; x++) {

            let cellsToProcess = [];

            for (let c = x - radius, cz = x + radius + 1; c < cz; c++) {

                if (c >= 0 && c < gridWidth) cellsToProcess.push(grid[y][c] * 4);
            }
            horizontalBlur[(y * gridWidth) + x] = cellsToProcess;
        }
    }
    workstore[name] = horizontalBlur;
    workstoreLastAccessed[name] = Date.now();
    return horizontalBlur;
};

// `buildVerticalBlur` - creates an Array of Arrays detailing which pixels contribute to the vertical part of each pixel's blur calculation. Resulting object will be cached in the store
P.buildVerticalBlur = function (grid, radius) {

    let { workstore, workstoreLastAccessed } = this;

    if (!radius || !radius.toFixed || isNaN(radius)) radius = 0;

    let gridHeight = grid.length,
        gridWidth = grid[0].length;

    let name = `blur-v-${gridWidth}-${gridHeight}-${radius}`;
    if (workstore[name]) {
        workstoreLastAccessed[name] = Date.now();
        return workstore[name];
    }

    let verticalBlur = [],
        cell;

    for (let x = 0; x < gridWidth; x++) {

        for (let y = 0; y < gridHeight; y++) {

            let cellsToProcess = [];

            for (let c = y - radius, cz = y + radius + 1; c < cz; c++) {

                if (c >= 0 && c < gridHeight) cellsToProcess.push(grid[c][x] * 4);
            }
            verticalBlur[(y * gridWidth) + x] = cellsToProcess;
        }
    }
    workstore[name] = verticalBlur;
    workstoreLastAccessed[name] = Date.now();
    return verticalBlur;
};

// `buildMatrixGrid` - creates an Array of Arrays detailing which pixels contribute to each pixel's matrix calculation. Resulting object will be cached in the store
// P.buildMatrixGrid = function (mWidth, mHeight, mX, mY, alpha, image) {
P.buildMatrixGrid = function (mWidth, mHeight, mX, mY, image) {

    let { cache, workstore, workstoreLastAccessed } = this;

    if (!image) image = cache.source;

    let { width:iWidth, height:iHeight, data } = image;

    if (mWidth == null || mWidth < 1) mWidth = 1;
    if (mHeight == null || mHeight < 1) mHeight = 1;

    if (mX == null || mX < 0) mX = 0;
    else if (mX >= mWidth) mX = mWidth - 1;

    if (mY == null || mY < 0) mY = 0;
    else if (mY >= mHeight) mY = mHeight - 1;

    let name = `matrix-${iWidth}-${iHeight}-${mWidth}-${mHeight}-${mX}-${mY}`;
    if (workstore[name]) {
        workstoreLastAccessed[name] = Date.now();
        return workstore[name];
    }

    let dataLength = data.length,
        x, xz, y, yz, i, iz,
        cellsTemplate = [],
        grid = [];

    for (y = -mY, yz = mHeight - mY; y < yz; y++) {

        for (x = -mX, xz = mWidth - mX; x < xz; x++) {

            cellsTemplate.push(((y * iWidth) + x) * 4);
        }
    }

    for (y = 0; y < iHeight; y++) {

        for (x = 0; x < iWidth; x++) {
            
            let pos = ((y * iWidth) + x) * 4;
            let cell = [];

            for (i = 0, iz = cellsTemplate.length; i < iz; i++) {

                let val = pos + cellsTemplate[i];

                if (val < 0) val += dataLength;
                else if (val >= dataLength) val -= dataLength;

                cell.push(val);
            }
            grid.push(cell);
        }
    }
    workstore[name] = grid;
    workstoreLastAccessed[name] = Date.now();
    return grid;
};

// `checkChannelLevelsParameters` - divide each channel into discrete sequences of pixels
P.checkChannelLevelsParameters = function (f) {

    const doCheck = function (v, isHigh = false) {

        if (v.toFixed) {
            if (v < 0) return [[0, 255, 0]];
            if (v > 255) return [[0, 255, 255]];
            if (isNaN(v)) return (isHigh) ? [[0, 255, 255]] : [[0, 255, 0]];
            return [[0, 255, v]];
        }

        if (v.substring) {
            v = v.split(',');
        }

        if (Array.isArray(v)) {

            if (!v.length) return v;
            if (Array.isArray(v[0])) return v;

            v = v.map(s => parseInt(s, 10));
            v.sort((a, b) => a - b);

            if (v.length == 1) return [[0, 255, v[0]]];

            let res = [],
                starts, ends;

            for (let i = 0, iz = v.length; i < iz; i++) {

                starts = 0;
                ends = 255;
                if (i != 0) starts = Math.ceil(v[i - 1] + ((v[i] - v[i - 1]) / 2));
                if (i != iz - 1) ends = Math.floor(v[i] + ((v[i + 1] - v[i]) / 2));

                res.push([starts, ends, v[i]]);
            }
            return res;
        }
        return (isHigh) ? [[0, 255, 255]] : [[0, 255, 0]];
    }
    f.red = doCheck(f.red);
    f.green = doCheck(f.green);
    f.blue = doCheck(f.blue);
    f.alpha = doCheck(f.alpha, true);
};

// `cacheOutput` - insert an action function's output into the filter engine's cache
P.cacheOutput = function (name, obj, caller) {

    cache[name] = obj;
};

// `getInputAndOutputLines` - determine, and return, the appropriate results object for the lineIn, lineMix and lineOut values supplied to each action function when it gets invoked
P.getInputAndOutputLines = function (requirements) {

    let { cache } = this;

    let lineIn = cache.work,
        lineMix = false,
        sourceData = cache.source,
        alphaData = false;

    if (requirements.lineIn === 'source-alpha' || requirements.lineMix === 'source-alpha') alphaData = this.getAlphaData(sourceData);

    if (requirements.lineIn) {

        if (requirements.lineIn == 'source') lineIn = sourceData;
        else if (requirements.lineIn == 'source-alpha') lineIn = alphaData;
        else if (cache[requirements.lineIn]) lineIn = cache[requirements.lineIn];
    }

    if (requirements.lineMix) {

        if (requirements.lineMix == 'source') lineMix = sourceData;
        else if (requirements.lineMix == 'source-alpha') lineMix = alphaData;
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

    let sData = store.data,
        iData = incoming.data;

    if (ratio === 1) {
        for (let i = 0, iz = sData.length; i < iz; i++) {

            sData[i] = iData[i];
        }
    }
    else if (ratio > 0) {

        let antiRatio = 1 - ratio;

        for (let i = 0, iz = sData.length; i < iz; i++) {

            sData[i] = Math.floor((sData[i] * antiRatio) + (iData[i] * ratio));
        }
    }
};

// `getHSLfromRGB` - convert an RGB format color into an HSL format color
P.getHSLfromRGB = function (dr, dg, db) {

    let minColor = Math.min(dr, dg, db),
        maxColor = Math.max(dr, dg, db);

    let lum = (minColor + maxColor) / 2;

    let sat = 0;

    if (minColor !== maxColor) {

        if (lum <= 0.5) sat = (maxColor - minColor) / (maxColor + minColor);
        else sat = (maxColor - minColor) / (2 - maxColor - minColor);
    }

    let hue = 0;

    if (maxColor === dr) hue = (dg - db) / (maxColor - minColor);
    else if (maxColor === dg) hue = 2 + ((db - dr) / (maxColor - minColor));
    else hue = 4 + ((dr - dg) / (maxColor - minColor));

    hue *= 60;

    if (hue < 0) hue += 360;

    return [hue, sat, lum];
};

// `getRGBfromHSL` - convert an HSL format color into an RGB format color
P.getRGBfromHSL = function (h, s, l) {

    if (!s) {

        let gray = Math.floor(l * 255);
        return [gray, gray, gray];
    }

    let tempLum1 = (l < 0.5) ? l * (s + 1) : l + s - (l * s),
        tempLum2 = (2 * l) - tempLum1;

    const calculator = function (t, l1, l2) {

        if (t * 6 < 1) return l2 + ((l1 - l2) * 6 * t);
        if (t * 2 < 1) return l1;
        if (t * 2 < 2) return l2 + ((l1 - l2) * 6 * (t * 0.666));
        return l2;
    };

    h /= 360;

    let tr = h + 0.333,
        tg = h,
        tb = h - 0.333;

    if (tr < 0) tr += 1;
    if (tr > 1) tr -= 1;
    if (tg < 0) tg += 1;
    if (tg > 1) tg -= 1;
    if (tb < 0) tb += 1;
    if (tb > 1) tb -= 1;

    let r = calculator(tr, tempLum1, tempLum2) * 255,
        g = calculator(tg, tempLum1, tempLum2) * 255,
        b = calculator(tb, tempLum1, tempLum2) * 255;

    return [r, g, b];
};


// ## Filter action functions
// Each function is held in the `theBigActionsObject` object, for convenience
P.theBigActionsObject = {

// __alpha-to-channels__ - Copies the alpha channel value over to the selected value or, alternatively, sets that channel's value to zero, or leaves the channel's value unchanged. Setting the appropriate "includeChannel" flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate "excludeChannel" flag will set that channel's value to zero.
    'alpha-to-channels': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = true;
        if (null == includeGreen) includeGreen = true;
        if (null == includeBlue) includeBlue = true;
        if (null == excludeRed) excludeRed = true;
        if (null == excludeGreen) excludeGreen = true;
        if (null == excludeBlue) excludeBlue = true;

        for (let i = 0; i < len; i += 4) {

            let a = iData[i + 3];

            oData[i] = (includeRed) ? a : ((excludeRed) ? 0 : iData[i]);
            oData[i + 1] = (includeGreen) ? a : ((excludeGreen) ? 0 : iData[i + 1]);
            oData[i + 2] = (includeBlue) ? a : ((excludeBlue) ? 0 : iData[i + 2]);
            oData[i + 3] = 255;
        }
        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __area-alpha__ - Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to zero. Can be used to create horizontal or vertical bars, or chequerboard effects.
    'area-alpha': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, tileWidth, tileHeight, offsetX, offsetY, gutterWidth, gutterHeight, areaAlphaLevels, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == tileWidth) tileWidth = 1;
        if (null == tileHeight) tileHeight = 1;
        if (null == offsetX) offsetX = 0;
        if (null == offsetY) offsetY = 0;
        if (null == gutterWidth) gutterWidth = 1;
        if (null == gutterHeight) gutterHeight = 1;
        if (null == areaAlphaLevels) areaAlphaLevels = [255,0,0,0];

        let tiles = this.buildAlphaTileSets(tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY, areaAlphaLevels);

        for (let i = 0; i < len; i += 4) {

            let c = i;
            oData[c] = iData[c];

            c++;
            oData[c] = iData[c];

            c++;
            oData[c] = iData[c];
        }
        tiles.forEach((t, index) => {

            for (let j = 0, jz = t.length; j < jz; j++) {

                if (iData[t[j]]) oData[t[j]] = areaAlphaLevels[index % 4];
            }
        });

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __average-channels__ - Calculates an average value from each pixel's included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to 0.
    'average-channels': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = true;
        if (null == includeGreen) includeGreen = true;
        if (null == includeBlue) includeBlue = true;
        if (null == excludeRed) excludeRed = false;
        if (null == excludeGreen) excludeGreen = false;
        if (null == excludeBlue) excludeBlue = false;

        let divisor = 0;
        if (includeRed) divisor++;
        if (includeGreen) divisor++;
        if (includeBlue) divisor++;

        for (let i = 0; i < len; i += 4) {

            let a = iData[i + 3];

            if (a) {

                if (divisor) {

                    let avg = 0;

                    if (includeRed) avg += iData[i];
                    if (includeGreen) avg += iData[i + 1];
                    if (includeBlue) avg += iData[i + 2];

                    avg = Math.floor(avg / divisor);

                    oData[i] = (excludeRed) ? 0 : avg;
                    oData[i + 1] = (excludeGreen) ? 0 : avg;
                    oData[i + 2] = (excludeBlue) ? 0 : avg;
                    oData[i + 3] = iData[i + 3];
                }
                else {
    
                    oData[i] = (excludeRed) ? 0 : iData[i];
                    oData[i + 1] = (excludeGreen) ? 0 : iData[i + 1];
                    oData[i + 2] = (excludeBlue) ? 0 : iData[i + 2];
                    oData[i + 3] = iData[i + 3];
                }
            }
            else {

                oData[i] = iData[i];
                oData[i + 1] = iData[i + 1];
                oData[i + 2] = iData[i + 2];
                oData[i + 3] = iData[i + 3];
            }
        }
        
        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __binary__ - Set the channel to either 0 or 255, depending on whether the channel value is below or above a given level. Level values are set using the "red", "green", "blue" and "alpha" arguments. Setting these values to 0 disables the action for that channel.
    'binary': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, red, green, blue, alpha, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = 0;
        if (null == green) green = 0;
        if (null == blue) blue = 0;
        if (null == alpha) alpha = 0;

        for (let i = 0; i < len; i += 4) {

            let c = i;

            if (red) oData[c] = (iData[c] > red) ? 255 : 0;
            else oData[c] = iData[c];

            c++;
            if (green) oData[c] = (iData[c] > green) ? 255 : 0;
            else oData[c] = iData[c];

            c++;
            if (blue) oData[c] = (iData[c] > blue) ? 255 : 0;
            else oData[c] = iData[c];

            c++;
            if (alpha) oData[c] = (iData[c] > alpha) ? 255 : 0;
            else oData[c] = iData[c];
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __blend__ - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using various separable and non-separable blend modes (as defined by the W3C Compositing and Blending Level 1 recommendations. The blending method is determined by the String value supplied in the "blend" argument; permitted values are: 'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', and 'saturation'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments.
    'blend': function (requirements) {

        const copyPixel = function (fromPos, toPos, data) {

            oData[toPos] = data[fromPos];
            oData[toPos + 1] = data[fromPos + 1];
            oData[toPos + 2] = data[fromPos + 2];
            oData[toPos + 3] = data[fromPos + 3];
        };

        const getLinePositions = function (x, y) {

            let ix = x,
                iy = y,
                mx = x - offsetX,
                my = y - offsetY;

            let mPos = -1,
                iPos = ((iy * iWidth) + ix) * 4;

            if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mPos = ((my * mWidth) + mx) * 4;

            return [iPos, mPos];
        };

        const getChannelNormals = function (i, m) {

            return [
                iData[i] / 255,
                iData[i + 1] / 255,
                iData[i + 2] / 255,
                iData[i + 3] / 255,
                mData[m] / 255,
                mData[m + 1] / 255,
                mData[m + 2] / 255,
                mData[m + 3] / 255
            ];
        };

        const alphaCalc = (dinA, dmixA) => (dinA + (dmixA * (1 - dinA))) * 255;

        let [input, output, mix] = this.getInputAndOutputLines(requirements);

        let {width:iWidth, height:iHeight, data:iData} = input;
        let {width:oWidth, height:oHeight, data:oData} = output;
        let {width:mWidth, height:mHeight, data:mData} = mix;
        let len = iData.length;

        let {opacity, blend, offsetX, offsetY, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == blend) blend = '';
        if (null == offsetX) offsetX = 0;
        if (null == offsetY) offsetY = 0;

        switch (blend) {

            case 'color-burn' :

                const colorburnCalc = (din, dmix) => {
                    if (dmix == 1) return 255;
                    else if (din == 0) return 0;
                    return (1 - Math.min(1, ((1 - dmix) / din ))) * 255;
                };

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else if (!mData[mPos + 3]) copyPixel(iPos, iPos, iData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = colorburnCalc(dinR, dmixR);
                            oData[iPos + 1] = colorburnCalc(dinG, dmixG);
                            oData[iPos + 2] = colorburnCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'color-dodge' :

                const colordodgeCalc = (din, dmix) => {
                    if (dmix == 0) return 0;
                    else if (din == 1) return 255;
                    return Math.min(1, (dmix / (1 - din))) * 255;
                };

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else if (!mData[mPos + 3]) copyPixel(iPos, iPos, iData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = colordodgeCalc(dinR, dmixR);
                            oData[iPos + 1] = colordodgeCalc(dinG, dmixG);
                            oData[iPos + 2] = colordodgeCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'darken' :

                const darkenCalc = (din, dmix) => (din < dmix) ? din : dmix;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else if (!mData[mPos + 3]) copyPixel(iPos, iPos, iData);
                        else {

                            oData[iPos] = darkenCalc(iData[iPos], mData[mPos]);
                            oData[iPos + 1] = darkenCalc(iData[iPos + 1], mData[mPos + 1]);
                            oData[iPos + 2] = darkenCalc(iData[iPos + 2], mData[mPos + 2]);
                            oData[iPos + 3] = alphaCalc(iData[iPos + 3] / 255, mData[mPos + 3] / 255);
                        }
                    }
                }
                break;

            case 'difference' :

                const differenceCalc = (din, dmix) => Math.abs(din - dmix) * 255;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = differenceCalc(dinR, dmixR);
                            oData[iPos + 1] = differenceCalc(dinG, dmixG);
                            oData[iPos + 2] = differenceCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'exclusion' :

                const exclusionCalc = (din, dmix) => (din + dmix - (2 * dmix * din)) * 255;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = exclusionCalc(dinR, dmixR);
                            oData[iPos + 1] = exclusionCalc(dinG, dmixG);
                            oData[iPos + 2] = exclusionCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'hard-light' :

                const hardlightCalc = (din, dmix) => (din <= 0.5) ? (din * dmix) * 255 : (dmix + (din - (dmix * din))) * 255;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = hardlightCalc(dinR, dmixR);
                            oData[iPos + 1] = hardlightCalc(dinG, dmixG);
                            oData[iPos + 2] = hardlightCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'lighten' :

                const lightenCalc = (din, dmix) => (din > dmix) ? din : dmix;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else {

                            oData[iPos] = lightenCalc(iData[iPos], mData[mPos]);
                            oData[iPos + 1] = lightenCalc(iData[iPos + 1], mData[mPos + 1]);
                            oData[iPos + 2] = lightenCalc(iData[iPos + 2], mData[mPos + 2]);
                            oData[iPos + 3] = alphaCalc(iData[iPos + 3] / 255, mData[mPos + 3] / 255);
                        }
                    }
                }
                break;

            case 'lighter' :

                const lighterCalc = (din, dmix) => (din + dmix) * 255;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = lighterCalc(dinR, dmixR);
                            oData[iPos + 1] = lighterCalc(dinG, dmixG);
                            oData[iPos + 2] = lighterCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'multiply' :

                const multiplyCalc = (din, dmix) => din * dmix * 255;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else if (!mData[mPos + 3]) copyPixel(iPos, iPos, iData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = multiplyCalc(dinR, dmixR);
                            oData[iPos + 1] = multiplyCalc(dinG, dmixG);
                            oData[iPos + 2] = multiplyCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'overlay' :

                const overlayCalc = (din, dmix) => (din >= 0.5) ? (din * dmix) * 255 : (dmix + (din - (dmix * din))) * 255;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = overlayCalc(dinR, dmixR);
                            oData[iPos + 1] = overlayCalc(dinG, dmixG);
                            oData[iPos + 2] = overlayCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'screen' :

                const screenCalc = (din, dmix) => (dmix + (din - (dmix * din))) * 255;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = screenCalc(dinR, dmixR);
                            oData[iPos + 1] = screenCalc(dinG, dmixG);
                            oData[iPos + 2] = screenCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'soft-light' :

                const softlightCalc = (din, dmix) => {

                    let d = (dmix <= 0.25) ?
                        ((((16 * dmix) - 12) * dmix) + 4) * dmix :
                        Math.sqrt(dmix);

                    if (din <= 0.5) return (dmix - ((1 - (2 * din)) * dmix * (1 - dmix))) * 255;
                    return (dmix + (((2 * din) - 1) * (d - dmix))) * 255;
                };

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else if (!mData[mPos + 3]) copyPixel(iPos, iPos, iData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            oData[iPos] = softlightCalc(dinR, dmixR);
                            oData[iPos + 1] = softlightCalc(dinG, dmixG);
                            oData[iPos + 2] = softlightCalc(dinB, dmixB);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'color' :

                const colorCalc = (iR, iG, iB, mR, mG, mB) => {

                    let [iH, iS, iL] = this.getHSLfromRGB(iR, iG, iB);
                    let [mH, mS, mL] = this.getHSLfromRGB(mR, mG, mB);

                    return this.getRGBfromHSL(iH, iS, mL);
                };

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else if (!mData[mPos + 3]) copyPixel(iPos, iPos, iData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            let [cr, cg, cb] = colorCalc(dinR, dinG, dinB, dmixR, dmixG, dmixB);
                            oData[iPos] = cr;
                            oData[iPos + 1] = cg;
                            oData[iPos + 2] = cb;
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'hue' :

                const hueCalc = (iR, iG, iB, mR, mG, mB) => {

                    let [iH, iS, iL] = this.getHSLfromRGB(iR, iG, iB);
                    let [mH, mS, mL] = this.getHSLfromRGB(mR, mG, mB);

                    return this.getRGBfromHSL(iH, mS, mL);
                };

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else if (!mData[mPos + 3]) copyPixel(iPos, iPos, iData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            let [cr, cg, cb] = hueCalc(dinR, dinG, dinB, dmixR, dmixG, dmixB);
                            oData[iPos] = cr;
                            oData[iPos + 1] = cg;
                            oData[iPos + 2] = cb;
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'luminosity' :

                const luminosityCalc = (iR, iG, iB, mR, mG, mB) => {

                    let [iH, iS, iL] = this.getHSLfromRGB(iR, iG, iB);
                    let [mH, mS, mL] = this.getHSLfromRGB(mR, mG, mB);

                    return this.getRGBfromHSL(mH, mS, iL);
                };

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else if (!mData[mPos + 3]) copyPixel(iPos, iPos, iData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            let [cr, cg, cb] = luminosityCalc(dinR, dinG, dinB, dmixR, dmixG, dmixB);
                            oData[iPos] = cr;
                            oData[iPos + 1] = cg;
                            oData[iPos + 2] = cb;
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'saturation' :

                const saturationCalc = (iR, iG, iB, mR, mG, mB) => {

                    let [iH, iS, iL] = this.getHSLfromRGB(iR, iG, iB);
                    let [mH, mS, mL] = this.getHSLfromRGB(mR, mG, mB);

                    return this.getRGBfromHSL(mH, iS, mL);
                };

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else if (!mData[mPos + 3]) copyPixel(iPos, iPos, iData);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            let [cr, cg, cb] = saturationCalc(dinR, dinG, dinB, dmixR, dmixG, dmixB);
                            oData[iPos] = cr;
                            oData[iPos + 1] = cg;
                            oData[iPos + 2] = cb;
                            oData[iPos + 3] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            default:
                const normalCalc = (Cs, As, Cb, Ab) => (As * Cs) + (Ab * Cb * (1 - As));

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else if (!iData[iPos + 3]) copyPixel(mPos, iPos, mData);
                        else {

                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = normalCalc(iData[iPos], dinA, mData[mPos], dmixA);
                            oData[iPos + 1] = normalCalc(iData[iPos + 1], dinA, mData[mPos + 1], dmixA);
                            oData[iPos + 2] = normalCalc(iData[iPos + 2], dinA, mData[mPos + 2], dmixA);
                            oData[iPos + 3] = alphaCalc(dinA, dmixA)
                        }
                    }
                }
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __blur__ - Performs a multi-loop, two-step 'horizontal-then-vertical averaging sweep' calculation across all pixels to create a blur effect. Note that this filter is expensive, thus much slower to complete compared to other filter effects.
    'blur': function (requirements) {

        const getValue = function (flag, gridStore, pos, data, offset) {

            if (flag) {

                let h = gridStore[pos];

                if (h != null) {

                    let l = h.length,
                        counter = 0,
                        total = 0;

                    for (let t = 0; t < l; t += step) {

                        total += data[h[t] + offset];
                        counter++
                    }
                    return total / counter;
                }
            }
            return data[(pos * 4) + offset];
        }

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length,
            pixelLen = Math.floor(len / 4);

        let {width, height} = input;

        let {opacity, radius, passes, processVertical, processHorizontal, includeRed, includeGreen, includeBlue, includeAlpha, step, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == radius) radius = 0;
        if (null == passes) passes = 1;
        if (null == processVertical) processVertical = true;
        if (null == processHorizontal) processHorizontal = true;
        if (null == includeRed) includeRed = true;
        if (null == includeGreen) includeGreen = true;
        if (null == includeBlue) includeBlue = true;
        if (null == includeAlpha) includeAlpha = false;
        if (null == step) step = 1;

        let horizontalBlurGrid, verticalBlurGrid;

        if (processHorizontal || processVertical) {

            let grid = this.buildImageGrid(input);

            if (processHorizontal)  horizontalBlurGrid = this.buildHorizontalBlur(grid, radius);

            if (processVertical) verticalBlurGrid = this.buildVerticalBlur(grid, radius);
        }

        oData.set(iData);

        const hold = new Uint8ClampedArray(iData);

        for (let pass = 0; pass < passes; pass++) {

            if (processHorizontal) {

                for (let k = 0; k < pixelLen; k++) {

                    let c = k * 4;

                    if (includeAlpha || hold[c + 3]) {

                        oData[c] = getValue(includeRed, horizontalBlurGrid, k, hold, 0);
                        oData[c + 1] = getValue(includeGreen, horizontalBlurGrid, k, hold, 1);
                        oData[c + 2] = getValue(includeBlue, horizontalBlurGrid, k, hold, 2);
                        oData[c + 3] = getValue(includeAlpha, horizontalBlurGrid, k, hold, 3);
                    }
                }
                if (processVertical || pass < passes - 1) hold.set(oData);
            }

            if (processVertical) {

                for (let k = 0; k < pixelLen; k++) {

                    let c = k * 4;

                    if (includeAlpha || hold[c + 3]) {

                        oData[c] = getValue(includeRed, verticalBlurGrid, k, hold, 0);
                        oData[c + 1] = getValue(includeGreen, verticalBlurGrid, k, hold, 1);
                        oData[c + 2] = getValue(includeBlue, verticalBlurGrid, k, hold, 2);
                        oData[c + 3] = getValue(includeAlpha, verticalBlurGrid, k, hold, 3);
                    }
                }
                if (pass < passes - 1) hold.set(oData);
            }
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __channels-to-alpha__ - Calculates an average value from each pixel's included channels and applies that value to the alpha channel.
    'channels-to-alpha': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, includeRed, includeGreen, includeBlue, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = true;
        if (null == includeGreen) includeGreen = true;
        if (null == includeBlue) includeBlue = true;

        let divisor = 0;
        if (includeRed) divisor++;
        if (includeGreen) divisor++;
        if (includeBlue) divisor++;

        for (let i = 0; i < len; i += 4) {

            oData[i] = iData[i];
            oData[i + 1] = iData[i + 1];
            oData[i + 2] = iData[i + 2];

            if (divisor) {

                let sum = 0;

                if (includeRed) sum += iData[i];
                if (includeGreen) sum += iData[i + 1];
                if (includeBlue) sum += iData[i + 2];

                oData[i + 3] = Math.floor(sum / divisor);
            }
            else oData[i + 3] = iData[i + 3];
        }
        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __chroma__ - Using an array of 'range' arrays, determine whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. Each 'range' array comprises six Numbers representing [minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue] values.
    'chroma': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, ranges, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == ranges) ranges = [];

        for (let j = 0; j < len; j += 4) {

            let flag = false;

            let r = iData[j],
                g = iData[j + 1],
                b = iData[j + 2];

            for (let i = 0, iz = ranges.length; i < iz; i++) {

                let [minR, minG, minB, maxR, maxG, maxB] = ranges[i];

                if (r >= minR && r <= maxR && g >= minG && g <= maxG && b >= minB && b <= maxB) {
                    flag = true;
                    break;
                }

            }
            oData[j] = r;
            oData[j + 1] = g;
            oData[j + 2] = b;
            oData[j + 3] = (flag) ? 0 : iData[j + 3];
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __clamp-channels__ - Clamp each color channel to a range set by lowColor and highColor values
    'clamp-channels': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length,
            floor = Math.floor;

        let {opacity, lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == lowRed) lowRed = 0;
        if (null == lowGreen) lowGreen = 0;
        if (null == lowBlue) lowBlue = 0;
        if (null == highRed) highRed = 255;
        if (null == highGreen) highGreen = 255;
        if (null == highBlue) highBlue = 255;

        const dR = highRed - lowRed,
            dG = highGreen - lowGreen,
            dB = highBlue - lowBlue;

        for (let i = 0; i < len; i += 4) {

            let r = iData[i],
                g = iData[i + 1],
                b = iData[i + 2],
                a = iData[i + 3];

            if (a) {

                r /= 255;
                g /= 255;
                b /= 255;

                oData[i] = lowRed + (r * dR);
                oData[i + 1] = lowGreen + (g * dG);
                oData[i + 2] = lowBlue + (b * dB);
            }
            else {
                oData[i] = r;
                oData[i + 1] = g;
                oData[i + 2] = b;
            }
            oData[i + 3] = a;
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __colors-to-alpha__ - Determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the "red", "green" and "blue" arguments. The sensitivity of the effect can be manipulated using the "transparentAt" and "opaqueAt" values, both of which lie in the range 0-1.
    'colors-to-alpha': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, red, green, blue, opaqueAt, transparentAt, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = 0;
        if (null == green) green = 255;
        if (null == blue) blue = 0;
        if (null == opaqueAt) opaqueAt = 1;
        if (null == transparentAt) transparentAt = 0;

        const maxDiff = Math.max(((red + green + blue) / 3), (((255 - red) + (255 - green) + (255 - blue)) / 3)),
            transparent = transparentAt * maxDiff,
            opaque = opaqueAt * maxDiff,
            range = opaque - transparent;

        const getValue = function (r, g, b) {

            let diff = (Math.abs(red - r) + Math.abs(green - g) + Math.abs(blue - b)) / 3;

            if (diff < transparent) return 0;
            if (diff > opaque) return 255;
            return ((diff - transparent) / range) * 255;
        };

        for (let i = 0; i < len; i += 4) {

            let r = iData[i],
                g = iData[i + 1],
                b = iData[i + 2];

            oData[i] = r;
            oData[i + 1] = g;
            oData[i + 2] = b;
            oData[i + 3] = getValue(r, g, b);
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __compose__ - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using alpha compositing rules (as defined by Porter/Duff). The compositing method is determined by the String value supplied in the "compose" argument; permitted values are: 'destination-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'source-only', 'source-over' (default), 'source-in', 'source-out', 'source-atop', 'clear', 'xor', or 'lighter'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments.
    'compose': function (requirements) {

        const copyPixel = function (fromPos, toPos, data) {

            oData[toPos] = data[fromPos];
            oData[toPos + 1] = data[fromPos + 1];
            oData[toPos + 2] = data[fromPos + 2];
            oData[toPos + 3] = data[fromPos + 3];
        };

        const getLinePositions = function (x, y) {

            let ix = x,
                iy = y,
                mx = x - offsetX,
                my = y - offsetY;

            let mPos = -1,
                iPos = ((iy * iWidth) + ix) * 4;

            if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mPos = ((my * mWidth) + mx) * 4;

            return [iPos, mPos];
        };

        let [input, output, mix] = this.getInputAndOutputLines(requirements);

        let {width:iWidth, height:iHeight, data:iData} = input;
        let {width:oWidth, height:oHeight, data:oData} = output;
        let {width:mWidth, height:mHeight, data:mData} = mix;
        let len = iData.length;

        let {opacity, compose, offsetX, offsetY, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == compose) compose = '';
        if (null == offsetX) offsetX = 0;
        if (null == offsetY) offsetY = 0;

        switch (compose) {

            case 'source-only' :
                output.data.set(iData);
                break;

            case 'source-atop' :
                const sAtopCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * mAlpha) + (mAlpha * mColor * (1 - iAlpha));

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos >= 0) {

                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = sAtopCalc(iData[iPos], dinA, mData[mPos], dmixA);
                            oData[iPos + 1] = sAtopCalc(iData[iPos + 1], dinA, mData[mPos + 1], dmixA);
                            oData[iPos + 2] = sAtopCalc(iData[iPos + 2], dinA, mData[mPos + 2], dmixA);
                            oData[iPos + 3] = ((dinA * dmixA) + (dmixA * (1 - dinA))) * 255;
                        }
                    }
                }
                break;

            case 'source-in' :
                const sInCalc = (iColor, iAlpha, mAlpha) => iAlpha * iColor * mAlpha;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos >= 0) {


                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = sInCalc(iData[iPos], dinA, dmixA);
                            oData[iPos + 1] = sInCalc(iData[iPos + 1], dinA, dmixA);
                            oData[iPos + 2] = sInCalc(iData[iPos + 2], dinA, dmixA);
                            oData[iPos + 3] = dinA * dmixA * 255;
                        }
                    }
                }
                break;

            case 'source-out' :
                const sOutCalc = (iColor, iAlpha, mAlpha) => iAlpha * iColor * (1 - mAlpha);

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else {

                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = sOutCalc(iData[iPos], dinA, dmixA);
                            oData[iPos + 1] = sOutCalc(iData[iPos + 1], dinA, dmixA);
                            oData[iPos + 2] = sOutCalc(iData[iPos + 2], dinA, dmixA);
                            oData[iPos + 3] = dinA * (1 - dmixA) * 255;
                        }
                    }
                }
                break;

            case 'destination-only' :
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos >= 0) copyPixel(mPos, iPos, mData);
                    }
                }
                break;

            case 'destination-atop' :
                const dAtopCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * (1 - mAlpha)) + (mAlpha * mColor * iAlpha);

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else {

                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = dAtopCalc(iData[iPos], dinA, mData[mPos], dmixA);
                            oData[iPos + 1] = dAtopCalc(iData[iPos + 1], dinA, mData[mPos + 1], dmixA);
                            oData[iPos + 2] = dAtopCalc(iData[iPos + 2], dinA, mData[mPos + 2], dmixA);
                            oData[iPos + 3] = ((dinA * (1 - dmixA)) + (dmixA * dinA)) * 255;
                        }
                    }
                }
                break;

            case 'destination-over' :
                const dOverCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * (1 - mAlpha)) + (mAlpha * mColor);

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else {

                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = dOverCalc(iData[iPos], dinA, mData[mPos], dmixA);
                            oData[iPos + 1] = dOverCalc(iData[iPos + 1], dinA, mData[mPos + 1], dmixA);
                            oData[iPos + 2] = dOverCalc(iData[iPos + 2], dinA, mData[mPos + 2], dmixA);
                            oData[iPos + 3] = ((dinA * (1 - dmixA)) + dmixA) * 255;
                        }
                    }
                }
                break;

            case 'destination-in' :
                const dInCalc = (iColor, iAlpha, mAlpha) => iAlpha * iColor * mAlpha;

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos >= 0) {

                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = dInCalc(mData[mPos], dinA, dmixA);
                            oData[iPos + 1] = dInCalc(mData[mPos + 1], dinA, dmixA);
                            oData[iPos + 2] = dInCalc(mData[mPos + 2], dinA, dmixA);
                            oData[iPos + 3] = dinA * dmixA * 255;
                        }
                    }
                }
                break;

            case 'destination-out' :
                const dOutCalc = (mColor, iAlpha, mAlpha) => mAlpha * mColor * (1 - iAlpha);

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos >= 0) {
        
                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = dOutCalc(mData[mPos], dinA, dmixA);
                            oData[iPos + 1] = dOutCalc(mData[mPos + 1], dinA, dmixA);
                            oData[iPos + 2] = dOutCalc(mData[mPos + 2], dinA, dmixA);
                            oData[iPos + 3] = dmixA * (1 - dinA) * 255;
                        }
                    }
                }
                break;

            case 'clear' :
                break;

            case 'xor' :
                const xorCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * (1 - mAlpha)) + (mAlpha * mColor * (1 - iAlpha));

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else {

                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = xorCalc(iData[iPos], dinA, mData[mPos], dmixA);
                            oData[iPos + 1] = xorCalc(iData[iPos + 1], dinA, mData[mPos + 1], dmixA);
                            oData[iPos + 2] = xorCalc(iData[iPos + 2], dinA, mData[mPos + 2], dmixA);
                            oData[iPos + 3] = ((dinA * (1 - dmixA)) + (dmixA * (1 - dinA))) * 255;
                        }
                    }
                }
                break;

            default:
                const sOverCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor) + (mAlpha * mColor * (1 - iAlpha));

                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, iData);
                        else {

                            let dinA = iData[iPos + 3] / 255,
                                dmixA = mData[mPos + 3] / 255;

                            oData[iPos] = sOverCalc(iData[iPos], dinA, mData[mPos], dmixA);
                            oData[iPos + 1] = sOverCalc(iData[iPos + 1], dinA, mData[mPos + 1], dmixA);
                            oData[iPos + 2] = sOverCalc(iData[iPos + 2], dinA, mData[mPos + 2], dmixA);
                            oData[iPos + 3] = (dinA + (dmixA * (1 - dinA))) * 255;
                        }
                    }
                }
        }


        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __corrode__ - Performs a special form of matrix operation on each pixel's color and alpha channels, calculating the new value using neighbouring pixel values. Note that this filter is expensive, thus much slower to complete compared to other filter effects. The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments. The operation will set the pixel's channel value to match either the lowest, highest, mean or median values as dictated by its neighbours - this value is set in the "level" attribute. Channels can be selected by setting the "includeRed", "includeGreen", "includeBlue" (all false by default) and "includeAlpha" (default: true) flags.
    'corrode': function (requirements) {

        const doCalculations = function (data, matrix, offset) {

            let vals = [];

            for (let m = 0, mz = matrix.length; m < mz; m++) {

                vals.push(data[matrix[m] + offset]);

                // need to remove the pixel's own value?
            }

            if (!vals.length) return 0;

            switch (operation) {

                case 'lowest' :

                    return Math.min(...vals);
                
                case 'highest' :

                    return Math.max(...vals);
                
                case 'median' :

                    let max = Math.max(...vals),
                        min = Math.min(...vals);

                    return Math.floor(min + ((max - min) / 2));

                default :

                    let total = vals.reduce((a, v) => a + v, 0);
                    return Math.floor(total / vals.length);
            }
        };

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, includeRed, includeGreen, includeBlue, includeAlpha, width, height, offsetX, offsetY, operation, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = false;
        if (null == includeGreen) includeGreen = false;
        if (null == includeBlue) includeBlue = false;
        if (null == includeAlpha) includeAlpha = true;
        if (null == width || width < 1) width = 3;
        if (null == height || height < 1) height = 3;
        if (null == offsetX) offsetX = 1;
        if (null == offsetY) offsetY = 1;
        if (null == operation) operation = 'mean';

        let grid = this.buildMatrixGrid(width, height, offsetX, offsetY, input);

        let m = Math.floor(len / 4);

        for (let i = 0; i < m; i++) {

            let c = i * 4;
            oData[c] = (includeRed) ? doCalculations(iData, grid[i], 0) : iData[c];

            c++;
            oData[c] = (includeGreen) ? doCalculations(iData, grid[i], 1) : iData[c];

            c++;
            oData[c] = (includeBlue) ? doCalculations(iData, grid[i], 2) : iData[c];

            c++;
            oData[c] = (includeAlpha) ? doCalculations(iData, grid[i], 3) : iData[c];
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __displace__ - Shift pixels around the image, based on the values supplied in a displacement image
    'displace': function (requirements) {

        const copyPixel = function (fromPos, toPos, data) {

            if (fromPos < 0) oData[toPos + 3] = 0;
            else {

                oData[toPos] = data[fromPos];
                oData[toPos + 1] = data[fromPos + 1];
                oData[toPos + 2] = data[fromPos + 2];
                oData[toPos + 3] = data[fromPos + 3];
            }
        };

        const getLinePositions = function (x, y) {

            let ix = x,
                iy = y,
                mx = x + offsetX,
                my = y + offsetY;

            let mPos = -1,
                iPos = ((iy * iWidth) + ix) * 4;

            if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mPos = ((my * mWidth) + mx) * 4;

            return [iPos, mPos];
        };

        let [input, output, mix] = this.getInputAndOutputLines(requirements);

        let {width:iWidth, height:iHeight, data:iData} = input;
        let {width:oWidth, height:oHeight, data:oData} = output;
        let {width:mWidth, height:mHeight, data:mData} = mix;

        let {opacity, channelX, channelY, scaleX, scaleY, offsetX, offsetY, transparentEdges, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == channelX) channelX = 'red';
        if (null == channelY) channelY = 'green';
        if (null == scaleX) scaleX = 1;
        if (null == scaleY) scaleY = 1;
        if (null == offsetX) offsetX = 0;
        if (null == offsetY) offsetY = 0;
        if (null == transparentEdges) transparentEdges = false;

        let offsetForChannelX = 3;
        if (channelX == 'red') offsetForChannelX = 0;
        else if (channelX == 'green') offsetForChannelX = 1;
        else if (channelX == 'blue') offsetForChannelX = 2;

        let offsetForChannelY = 3;
        if (channelY == 'red') offsetForChannelY = 0;
        else if (channelY == 'green') offsetForChannelY = 1;
        else if (channelY == 'blue') offsetForChannelY = 2;

        for (let y = 0; y < iHeight; y++) {
            for (let x = 0; x < iWidth; x++) {

                let [iPos, mPos] = getLinePositions(x, y);

                if (mPos >= 0) {

                    let dx = Math.floor(x + ((127 - mData[mPos + offsetForChannelX]) / 127) * scaleX);
                    let dy = Math.floor(y + ((127 - mData[mPos + offsetForChannelY]) / 127) * scaleY);
                    let dPos;

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
                else copyPixel(iPos, iPos, iData);
            }
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __emboss__ - A 3x3 matrix transform; the matrix weights are calculated internally from the values of two arguments: "strength", and "angle" - which is a value measured in degrees, with 0 degrees pointing to the right of the origin (along the positive x axis). Post-processing options include removing unchanged pixels, or setting then to mid-gray. The convenience method includes additional arguments which will add a choice of grayscale, then channel clamping, then blurring actions before passing the results to this emboss action
    'emboss': function (requirements) {

        const doCalculations = function (data, matrix, offset) {

            let val = 0;

            for (let m = 0, mz = matrix.length; m < mz; m++) {

                if (weights[m]) val += (data[matrix[m] + offset] * weights[m]);
            }
            return val;
        }

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, strength, angle, tolerance, keepOnlyChangedAreas, postProcessResults, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == strength) strength = 1;
        if (null == angle) angle = 0;
        if (null == tolerance) tolerance = 0;
        if (null == keepOnlyChangedAreas) keepOnlyChangedAreas = false;
        if (null == postProcessResults) postProcessResults = false;

        strength = Math.abs(strength);

        while (angle < 0) {
            angle += 360;
        }

        angle = angle % 360;

        let slices = Math.floor(angle / 45),
            remains = ((angle % 45) / 45) * strength,
            weights = new Array(9);

        weights = weights.fill(0, 0, 9); 
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

        for (let i = 0; i < len; i += 4) {

            let iR = iData[i],
                iG = iData[i + 1],
                iB = iData[i + 2],
                iA = iData[i + 3];

            if (iA) {

                let m = Math.floor(i / 4);

                oData[i] = doCalculations(iData, grid[m], 0);
                oData[i + 1] = doCalculations(iData, grid[m], 1);
                oData[i + 2] = doCalculations(iData, grid[m], 2);
                oData[i + 3] = iData[i + 3];

                if (postProcessResults) {

                    let oR = oData[i],
                        oG = oData[i + 1],
                        oB = oData[i + 2],
                        oA = oData[i + 3];

                    if (oR >= iR - tolerance && oR <= iR + tolerance && 
                        oG >= iG - tolerance && oG <= iG + tolerance && 
                        oB >= iB - tolerance && oB <= iB + tolerance) {

                        if (keepOnlyChangedAreas) oData[i + 3] = 0;
                        else {
                            oData[i] = 127;
                            oData[i + 1] = 127;
                            oData[i + 2] = 127;
                        }
                    }
                }
            }
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __flood__ - Set all pixels to the channel values supplied in the "red", "green", "blue" and "alpha" arguments
    'flood': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, red, green, blue, alpha, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = 0;
        if (null == green) green = 0;
        if (null == blue) blue = 0;
        if (null == alpha) alpha = 255;

        for (let i = 0; i < len; i += 4) {

            oData[i] = red;
            oData[i + 1] = green;
            oData[i + 2] = blue;
            oData[i + 3] = alpha;
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __grayscale__ - For each pixel, averages the weighted color channels and applies the result across all the color channels. This gives a more realistic monochrome effect.
    'grayscale': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, lineOut} = requirements;

        if (null == opacity) opacity = 1;

        for (let i = 0; i < len; i += 4) {

            let gray = Math.floor((0.2126 * iData[i]) + (0.7152 * iData[i + 1]) + (0.0722 * iData[i + 2]));

            oData[i] = gray;
            oData[i + 1] = gray;
            oData[i + 2] = gray;
            oData[i + 3] = iData[i + 3];
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __invert-channels__ - For each pixel, subtracts its current channel values - when included - from 255.
    'invert-channels': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, includeRed, includeGreen, includeBlue, includeAlpha, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = false;
        if (null == includeGreen) includeGreen = false;
        if (null == includeBlue) includeBlue = false;
        if (null == includeAlpha) includeAlpha = false;

        for (let i = 0; i < len; i += 4) {

            oData[i] = (includeRed) ? 255 - iData[i] : iData[i];
            oData[i + 1] = (includeGreen) ? 255 - iData[i + 1] : iData[i + 1];
            oData[i + 2] = (includeBlue) ? 255 - iData[i + 2] : iData[i + 2];
            oData[i + 3] = (includeAlpha) ? 255 - iData[i + 3] : iData[i + 3];
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __lock-channels-to-levels__ - Produces a posterize effect. Takes in four arguments - "red", "green", "blue" and "alpha" - each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value.
    'lock-channels-to-levels': function (requirements) {

        const getValue = function (val, levels) {

            if (!levels.length) return val;

            for (let i = 0, iz = levels.length; i < iz; i++) {

                let [start, end, level] = levels[i];
                if (val >= start && val <= end) return level;
            }
        };

        this.checkChannelLevelsParameters(requirements);

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, red, green, blue, alpha, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = [0];
        if (null == green) green = [0];
        if (null == blue) blue = [0];
        if (null == alpha) alpha = [255];

        for (let i = 0; i < len; i += 4) {

            oData[i] = getValue(iData[i], red);
            oData[i + 1] = getValue(iData[i + 1], green);
            oData[i + 2] = getValue(iData[i + 2], blue);
            oData[i + 3] = getValue(iData[i + 3], alpha);
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __matrix__ - Performs a matrix operation on each pixel's channels, calculating the new value using neighbouring pixel weighted values. Also known as a convolution matrix, kernel or mask operation. Note that this filter is expensive, thus much slower to complete compared to other filter effects. The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments. The weights to be applied need to be supplied in the "weights" argument - an Array listing the weights row-by-row starting from the top-left corner of the matrix. By default all color channels are included in the calculations while the alpha channel is excluded. The 'edgeDetect', 'emboss' and 'sharpen' convenience filter methods all use the matrix action, pre-setting the required weights.
    'matrix': function (requirements) {

        const doCalculations = function (data, matrix, offset) {

            let val = 0;

            for (let m = 0, mz = matrix.length; m < mz; m++) {

                if (weights[m]) val += (data[matrix[m] + offset] * weights[m]);
            }
            return val;
        }

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, includeRed, includeGreen, includeBlue, includeAlpha, width, height, offsetX, offsetY, weights, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = true;
        if (null == includeGreen) includeGreen = true;
        if (null == includeBlue) includeBlue = true;
        if (null == includeAlpha) includeAlpha = false;
        if (null == width || width < 1) width = 3;
        if (null == height || height < 1) height = 3;
        if (null == offsetX) offsetX = 1;
        if (null == offsetY) offsetY = 1;
        if (null == weights) {
            weights = [].fill(0, 0, (width * height) - 1);
            weights[Math.floor(weights.length / 2) + 1] = 1;
        }

        let grid = this.buildMatrixGrid(width, height, offsetX, offsetY, input);

        for (let i = 0; i < len; i += 4) {

            if (iData[i + 3]) {

                let m = Math.floor(i / 4);

                let c = i;
                if (includeRed) oData[c] = doCalculations(iData, grid[m], 0);
                else oData[c] = iData[c];

                c++;
                if (includeGreen) oData[c] = doCalculations(iData, grid[m], 1);
                else oData[c] = iData[c];

                c++;
                if (includeBlue) oData[c] = doCalculations(iData, grid[m], 2);
                else oData[c] = iData[c];

                c++;
                if (includeAlpha) oData[c] = doCalculations(iData, grid[m], 3);
                else oData[c] = iData[c];
            }
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __modulate-channels__ - Multiplies each channel's value by the supplied argument value. A channel-argument's value of '0' will set that channel's value to zero; a value of '1' will leave the channel value unchanged. If the "saturation" flag is set to 'true' the calculation changes to start at the color range mid point. The 'brightness' and 'saturation' filters are special forms of the 'channels' filter which use a single "levels" argument to set all three color channel arguments to the same value.
    'modulate-channels': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, red, green, blue, alpha, saturation, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = 1;
        if (null == green) green = 1;
        if (null == blue) blue = 1;
        if (null == alpha) alpha = 1;
        if (null == saturation) saturation = false;

        if (saturation) {

            for (let i = 0; i < len; i += 4) {

                oData[i] = 127 + ((iData[i] - 127) * red);
                oData[i + 1] = 127 + ((iData[i + 1] - 127) * green);
                oData[i + 2] = 127 + ((iData[i + 2] - 127) * blue);
                oData[i + 3] = 127 + ((iData[i + 3] - 127) * alpha);
            }
        }
        else {

            for (let i = 0; i < len; i += 4) {

                oData[i] = iData[i] * red;
                oData[i + 1] = iData[i + 1] * green;
                oData[i + 2] = iData[i + 2] * blue;
                oData[i + 3] = iData[i + 3] * alpha;
            }
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __offset__ - Offset the input image in the output image.
    'offset': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, offsetRedX, offsetRedY, offsetGreenX, offsetGreenY, offsetBlueX, offsetBlueY, offsetAlphaX, offsetAlphaY, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == offsetRedX) offsetRedX = 0;
        if (null == offsetRedY) offsetRedY = 0;
        if (null == offsetGreenX) offsetGreenX = 0;
        if (null == offsetGreenY) offsetGreenY = 0;
        if (null == offsetBlueX) offsetBlueX = 0;
        if (null == offsetBlueY) offsetBlueY = 0;
        if (null == offsetAlphaX) offsetAlphaX = 0;
        if (null == offsetAlphaY) offsetAlphaY = 0;

        if (offsetRedX || offsetGreenX || offsetBlueX || offsetAlphaX || offsetRedY || offsetGreenY || offsetBlueY || offsetAlphaY) {

            let simpleoffset = false;

            if (offsetRedX == offsetGreenX && offsetRedX == offsetBlueX && offsetRedX == offsetAlphaX && offsetRedY == offsetGreenY && offsetRedY == offsetBlueY && offsetRedY == offsetAlphaY) simpleoffset = true;

            let grid = this.buildImageGrid(input),
                gWidth = grid[0].length,
                gHeight = grid.length,
                drx, dry, dgx, dgy, dbx, dby, dax, day, inCell, outCell;

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

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __pixelate__ - Pixelizes the input image by creating a grid of tiles across it and then averaging the color values of each pixel in a tile and setting its value to the average. Tile width and height, and their offset from the top left corner of the image, are set via the "tileWidth", "tileHeight", "offsetX" and "offsetY" arguments.
    'pixelate': function (requirements) {

        const doCalculations = function (inChannel, outChannel, tile, offset) {

            let avg = tile.reduce((a, v) => a + inChannel[v + offset], 0);

            avg = Math.floor(avg / tile.length);

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

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, tileWidth, tileHeight, offsetX, offsetY, includeRed, includeGreen, includeBlue, includeAlpha, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = true;
        if (null == includeGreen) includeGreen = true;
        if (null == includeBlue) includeBlue = true;
        if (null == includeAlpha) includeAlpha = false;
        if (null == tileWidth) tileWidth = 1;
        if (null == tileHeight) tileHeight = 1;
        if (null == offsetX) offsetX = 0;
        if (null == offsetY) offsetY = 0;

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
        })

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __Add an asset image to the filter process chain. The asset - the String name of the asset object - must be pre-loaded before it can be included in the filter. The "width" and "height" arguments are measured in integer Number pixels; the "copy" arguments can be either percentage Strings (relative to the asset's natural dimensions) or absolute Number values (in pixels). The "lineOut" argument is required - be aware that the filter action does not check for any pre-existing assets cached under this name and, if they exist, will overwrite them with this asset's data.__ - 
    'process-image': function (requirements) {

        const {assetData, lineOut} = requirements;

        if (lineOut && lineOut.substring && lineOut.length) {

            const {width, height, data} = assetData;

            if (width && height && data) {

                this.cache[lineOut] = new ImageData(data, width, height);
            }
        }
    },

// __set-channel-to-level__ - Sets the value of each pixel's included channel to the value supplied in the "level" argument.
    'set-channel-to-level': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, includeRed, includeGreen, includeBlue, includeAlpha, level, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = false;
        if (null == includeGreen) includeGreen = false;
        if (null == includeBlue) includeBlue = false;
        if (null == includeAlpha) includeAlpha = false;
        if (null == level) level = 0;

        for (let i = 0; i < len; i += 4) {

            oData[i] = (includeRed) ? level : iData[i];
            oData[i + 1] = (includeGreen) ? level : iData[i + 1];
            oData[i + 2] = (includeBlue) ? level : iData[i + 2];
            oData[i + 3] = (includeAlpha) ? level : iData[i + 3];
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __step-channels__ - Takes three divisor values - "red", "green", "blue". For each pixel, its color channel values are divided by the corresponding color divisor, floored to the integer value and then multiplied by the divisor. For example a divisor value of '50' applied to a channel value of '120' will give a result of '100'. The output is a form of posterization.
    'step-channels': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length,
            floor = Math.floor;

        let {opacity, red, green, blue, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = 1;
        if (null == green) green = 1;
        if (null == blue) blue = 1;

        for (let i = 0; i < len; i += 4) {

            oData[i] = floor(iData[i] / red) * red;
            oData[i + 1] = floor(iData[i + 1] / green) * green;
            oData[i + 2] = floor(iData[i + 2] / blue) * blue;
            oData[i + 3] = iData[i + 3];
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __threshold__ - Grayscales the input then, for each pixel, checks the color channel values against a "level" argument: pixels with channel values above the level value are assigned to the 'high' color; otherwise they are updated to the 'low' color. The "high" and "low" arguments are [red, green, blue] integer Number Arrays. The convenience function will accept the pseudo-attributes "highRed", "lowRed" etc in place of the "high" and "low" Arrays.
    'threshold': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, low, high, level, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == low) low = [0,0,0];
        if (null == high) high = [255,255,255];
        if (null == level) level = 128;

        let [lowR, lowG, lowB] = low;
        let [highR, highG, highB] = high;

        for (let i = 0; i < len; i += 4) {

            let gray = Math.floor((0.2126 * iData[i]) + (0.7152 * iData[i + 1]) + (0.0722 * iData[i + 2]));

            if (gray < level) {

                oData[i] = lowR;
                oData[i + 1] = lowG;
                oData[i + 2] = lowB;
            }
            else {

                oData[i] = highR;
                oData[i + 1] = highG;
                oData[i + 2] = highB;
            }
            oData[i + 3] = iData[i + 3];
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __tint-channels__ - Has similarities to the SVG &lt;feColorMatrix> filter element, but excludes the alpha channel from calculations. Rather than set a matrix, we set nine arguments to determine how the value of each color channel in a pixel will affect both itself and its fellow color channels. The 'sepia' convenience filter presets these values to create a sepia effect.
    'tint-channels': function (requirements) {

        let [input, output] = this.getInputAndOutputLines(requirements);

        let iData = input.data,
            oData = output.data,
            len = iData.length;

        let {opacity, redInRed, redInGreen, redInBlue, greenInRed, greenInGreen, greenInBlue, blueInRed, blueInGreen, blueInBlue, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == redInRed) redInRed = 1;
        if (null == redInGreen) redInGreen = 0;
        if (null == redInBlue) redInBlue = 0;
        if (null == greenInRed) greenInRed = 0;
        if (null == greenInGreen) greenInGreen = 1;
        if (null == greenInBlue) greenInBlue = 0;
        if (null == blueInRed) blueInRed = 0;
        if (null == blueInGreen) blueInGreen = 0;
        if (null == blueInBlue) blueInBlue = 1;

        for (let i = 0; i < len; i += 4) {

            let r = iData[i],
                g = iData[i + 1],
                b = iData[i + 2];

            oData[i] = Math.floor((r * redInRed) + (g * greenInRed) + (b * blueInRed));
            oData[i + 1] = Math.floor((r * redInGreen) + (g * greenInGreen) + (b * blueInGreen));
            oData[i + 2] = Math.floor((r * redInBlue) + (g * greenInBlue) + (b * blueInBlue));
            oData[i + 3] = iData[i + 3];
        }

        let work = this.cache.work;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },

// __user-defined-legacy__ - Previous to version 8.4, filters could be defined with an argument which passed a function string to the filter engine, which the engine would then run against the source input image as-and-when required. This functionality has been removed from the new filter functionality. All such filters will now return the input image unchanged.

    'user-defined-legacy': function (requirements) {

        let [input, output] = this.getInputAndOutputChannels(requirements);

        let {opacity, lineOut} = requirements;

        if (null == opacity) opacity = 1;

        this.copyOver(input, output);

        let work = this.cache.work.channels;
        if (lineOut) this.processResults(output, work, 1 - opacity);
        else this.processResults(work, output, opacity);
    },
};


// #### Factory
const makeFilterEngine = function (items = {}) {

    return new FilterEngine(items);
};

constructors.FilterEngine = FilterEngine;


// #### Exports
export {
    makeFilterEngine,
};
