// # Scrawl-canvas filters web worker
// This eb worker code is called in a just-in-time manner; the code will not be requested from the server until a Scrawl-canvas entity, Group or Cell with a non-zero `filters` attribute is processed during the Display cycle. 
// 
// All Scrawl-canvas filters-related image manipulation work happens in this worker code. Note that this functionality is entirely separate from the &lt;canvas> element's context engine's native `filter` functionality, which allows us to add CSS/SVG-based filters to the canvas context

// ##### Road map
// At some point we shall attempt to convert this code into something that can be run as WebAssembly code, possibly using Rust or AssemblyScript.
//
// ##### Development
// Compress this file using https://javascript-minifier.com/
//
// Copy the results of the compression into the string in worker/filter-string.js
//
// ### Common variables
// __packet__ and `packetFiltersArray` will hold data contained in the message sent to the web worker; the packet object will be returned to the main program when processing completes (or errors) in the worker
let packet, packetFiltersArray;

// __source__ - the original image data supplied in the message
let source; 

// __work__ - a copy of the source image which then gets manipulated by the functions invoked by each action object included in the filter
let work; 

// __cache__ - an Object consisting of `key:Object` pairs where the key is the named input of a `process-image` action or the output of any action object. This object is cleared and re-initialized each time the worker receives a new message
let cache; 

// __actions__ - the Array of action objects that the worker needs to process - data supplied by the main thread in its message's `packetFiltersArray` attribute.
let actions;

// The web worker maintains a semi-permanent storage space - the __workstore__ - for some processing objects that are computationally expensive, for instance grids, matrix reference data objects, etc. The web worker maintains a record of when each of these processing objects was last accessed and will remove objects if they have not been accessed in the last three seconds.
let workstore = {},
    workstoreLastAccessed = {};


// ### Result objects

// `createResultObject` - to make the following code easier to maintain, the web worker will create result objects for all source image data it receives, and for each action object output. These result objects contain four arrays - one for each color channle, and one for the alpha channel.
const createResultObject = function (len) {

    return {
        r: new Uint8ClampedArray(len),
        g: new Uint8ClampedArray(len),
        b: new Uint8ClampedArray(len),
        a: new Uint8ClampedArray(len),
    };
};

// `unknit` - called at the start of each new message action chain. Creates and populates the __source__ and __work__ objects from the image data supplied in the message
const unknit = function (iData) {

    let imageData = iData.data;

    let len = Math.floor(imageData.length / 4);


    source = createResultObject(len);
    iData.channels = source;

    let sourceRed = source.r,
        sourceGreen = source.g,
        sourceBlue = source.b,
        sourceAlpha = source.a;

    work = createResultObject(len);

    let workRed = work.r,
        workGreen = work.g,
        workBlue = work.b,
        workAlpha = work.a;

    let counter = 0;

    for (let i = 0, iz = imageData.length; i < iz; i += 4) {

        sourceRed[counter] = imageData[i];
        sourceGreen[counter] = imageData[i + 1];
        sourceBlue[counter] = imageData[i + 2];
        sourceAlpha[counter] = imageData[i + 3];

        workRed[counter] = imageData[i];
        workGreen[counter] = imageData[i + 1];
        workBlue[counter] = imageData[i + 2];
        workAlpha[counter] = imageData[i + 3];

        counter++;
    }
};

// `knit` - called at the end of each message action chain. Recreates the message image data in the correct format so it can be used by the main thread
const knit = function () {

    let imageData = packet.image.data;

    let workRed = work.r,
        workGreen = work.g,
        workBlue = work.b,
        workAlpha = work.a;

    let counter = 0;

    for (let i = 0, iz = imageData.length; i < iz; i += 4) {

        imageData[i] = workRed[counter];
        imageData[i + 1] = workGreen[counter];
        imageData[i + 2] = workBlue[counter];
        imageData[i + 3] = workAlpha[counter];

        counter++;
    }
};

// ### Messaging functionality
onmessage = function (msg) {

    packet = msg.data;
    packetFiltersArray = packet.filters;

    let workstoreKeys = Object.keys(workstore), 
        workstoreChoke = Date.now() - 3000;

    workstoreKeys.forEach(k => {

        if (workstoreLastAccessed[k] < workstoreChoke) {

            delete workstore[k];
            delete workstoreLastAccessed[k];
        }
    });

    cache = {};
    actions = [];

    cache.source = packet.image;

    packetFiltersArray.forEach(f => actions.push(...f.actions));

    if (actions.length) {

        unknit(cache.source);
        actions.forEach(a => theBigActionsObject[a.action] && theBigActionsObject[a.action](a));
        knit();
    }

    postMessage(packet);
};

onerror = function (e) {

    console.log('error' + e.message);
    postMessage(packet);
};


// ### Functions invoked by a range of different action functions
// 
// `buildImageGrid` creates an Array of Arrays which contain the indexes of each pixel in the data channel Arrays
const buildImageGrid = function (data) {

    if (!data) data = cache.source;

    if (data && data.width && data.height) {

        let name = `grid-${data.width}-${data.height}`;
        if (workstore[name]) {
            workstoreLastAccessed[name] = Date.now();
            return workstore[name];
        }

        let grid = [],
            counter = 0;

        for (let y = 0, yz = data.height; y < yz; y++) {

            let row = [];

            for (let x = 0, xz = data.width; x < xz; x++) {
                
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
const buildAlphaTileSets = function (tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY, areaAlphaLevels, data) {

    if (!data) data = cache.source;

    if (data && data.width && data.height) {

        let iWidth = data.width,
            iHeight = data.height;

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
                            if (x >= 0 && x < iWidth) hold.push((y * iWidth) + x);
                        }
                    }
                }
                tiles.push([].concat(hold));

                hold = [];
                for (y =  j + tileHeight, yz = j + tileHeight + gutterHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i, xz = i + tileWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((y * iWidth) + x);
                        }
                    }
                }
                tiles.push([].concat(hold));

                hold = [];
                for (y = j, yz = j + tileHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i + tileWidth, xz = i + tileWidth + gutterWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((y * iWidth) + x);
                        }
                    }
                }
                tiles.push([].concat(hold));

                hold = [];
                for (y =  j + tileHeight, yz = j + tileHeight + gutterHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i + tileWidth, xz = i + tileWidth + gutterWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((y * iWidth) + x);
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
const buildImageTileSets = function (tileWidth, tileHeight, offsetX, offsetY, data) {

    if (!data) data = cache.source;

    if (data && data.width && data.height) {

        let iWidth = data.width,
            iHeight = data.height;

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
                
                for (y = j, yz = j + tileHeight; y < yz; y++) {

                    if (y >= 0 && y < iHeight) {

                        for (let x = i, xz = i + tileWidth; x < xz; x++) {

                            if (x >= 0 && x < iWidth) hold.push((y * iWidth) + x);
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
const buildHorizontalBlur = function (grid, radius, alpha) {

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

                if (c >= 0 && c < gridWidth) cellsToProcess.push(grid[y][c]);
            }
            horizontalBlur[(y * gridHeight) + x] = cellsToProcess;
        }
    }
    workstore[name] = horizontalBlur;
    workstoreLastAccessed[name] = Date.now();
    return horizontalBlur;
};

// `buildVerticalBlur` - creates an Array of Arrays detailing which pixels contribute to the vertical part of each pixel's blur calculation. Resulting object will be cached in the store
const buildVerticalBlur = function (grid, radius, alpha) {

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

                if (c >= 0 && c < gridHeight) cellsToProcess.push(grid[c][x]);
            }
            verticalBlur[(y * gridHeight) + x] = cellsToProcess;
        }
    }
    workstore[name] = verticalBlur;
    workstoreLastAccessed[name] = Date.now();
    return verticalBlur;
};

// `buildMatrixGrid` - creates an Array of Arrays detailing which pixels contribute to each pixel's matrix calculation. Resulting object will be cached in the store
const buildMatrixGrid = function (mWidth, mHeight, mX, mY, alpha, data) {

    if (!data) data = cache.source;

    if (mWidth == null || mWidth < 1) mWidth = 1;
    if (mHeight == null || mHeight < 1) mHeight = 1;

    if (mX == null || mX < 0) mX = 0;
    else if (mX >= mWidth) mX = mWidth - 1;

    if (mY == null || mY < 0) mY = 0;
    else if (mY >= mHeight) mY = mHeight - 1;

    let iWidth = data.width,
        iHeight = data.height;

    let name = `matrix-${iWidth}-${iHeight}-${mWidth}-${mHeight}-${mX}-${mY}`;
    if (workstore[name]) {
        workstoreLastAccessed[name] = Date.now();
        return workstore[name];
    }

    let dataLength = data.data.length,
        x, xz, y, yz, i, iz,
        cellsTemplate = [],
        grid = [];

    for (y = -mY, yz = mHeight - mY; y < yz; y++) {

        for (x = -mX, xz = mWidth - mX; x < xz; x++) {

            cellsTemplate.push((y * iWidth) + x);
        }
    }

    for (y = 0; y < iHeight; y++) {

        for (x = 0; x < iWidth; x++) {
            
            let pos = (y * iWidth) + x;
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
const checkChannelLevelsParameters = function (f) {

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

// `cacheOutput` - insert an action function's output into the worker's cache
const cacheOutput = function (name, obj, caller) {

    cache[name] = obj;
};

// `copyOver` - copy the values from one results object to another
const copyOver = function (f, t) {

    let {r:fromR, g:fromG, b:fromB, a:fromA } = f;
    let {r:toR, g:toG, b:toB, a:toA } = t;

    for (let i = 0; i < fromR.length; i++) {

        toR[i] = fromR[i];
        toG[i] = fromG[i];
        toB[i] = fromB[i];
        toA[i] = fromA[i];
    }
};

// `getInputAndOutputDimensions` - determine, and return, the dimensions (width, height) for the appropriate results object for the lineIn, lineMix and lineOut values supplied to each action function when it gets invoked
const getInputAndOutputDimensions = function (requirements) {

    let data = cache.source,
        results = [];

    if (requirements.lineIn && requirements.lineIn != 'source' && requirements.lineIn != 'source-alpha' && cache[requirements.lineIn]) {

        data = cache[requirements.lineIn];
    }
    results.push(data.width, data.height);

    if (requirements.lineOut && cache[requirements.lineOut]) {

        data = cache[requirements.lineOut];
    }
    results.push(data.width, data.height);

    data = cache.source;

    if (requirements.lineMix && requirements.lineMix != 'source' && requirements.lineMix != 'source-alpha' && cache[requirements.lineMix]) {

        data = cache[requirements.lineMix];
    }
    results.push(data.width, data.height);

    return results;
};

// `getInputAndOutputChannels` - determine, and return, the appropriate results object for the lineIn, lineMix and lineOut values supplied to each action function when it gets invoked
const getInputAndOutputChannels = function (requirements) {

    let lineIn = work;
    let len = lineIn.r.length;
    let data = cache.source;

    if (requirements.lineIn) {

        if (requirements.lineIn == 'source') lineIn = data.channels;
        else if (requirements.lineIn == 'source-alpha') {

            lineIn = createResultObject(len);

            let destAlpha = lineIn.a,
                sourceAlpha = data.channels.a;

            for (let i = 0; i < len; i++) {

                destAlpha[i] = sourceAlpha[i];
            }
        }
        else if (cache[requirements.lineIn]) {

            data = cache[requirements.lineIn];
            lineIn = data.channels;
        }
    }

    let lineMix = false;

    if (requirements.lineMix) {

        if (requirements.lineMix == 'source') lineMix = cache.source.channels;
        else if (requirements.lineMix == 'source-alpha') {

            lineMix = createResultObject(len);

            let destAlpha = lineMix.a,
                sourceAlpha = cache.source.channels.a;

            for (let i = 0; i < len; i++) {

                destAlpha[i] = sourceAlpha[i];
            }
        }
        else if (cache[requirements.lineMix]) lineMix = cache[requirements.lineMix].channels;
    }

    let lineOut;

    if (requirements.lineOut) {

        if (cache[requirements.lineOut]) lineOut = cache[requirements.lineOut].channels;
        else {

            lineOut = createResultObject(len);
            cache[requirements.lineOut] = {
                width: data.width,
                height: data.height,
                channels: lineOut,
            };
        }
    }
    else lineOut = createResultObject(len);

    return [lineIn, lineOut, lineMix];
};

// `processResults` - at the conclusion of each action function, combine the results of the function's manipulations back into the data supplied for manipulation, in line with the value of the action object's `opacity` attribute
const processResults = function (store, incoming, ratio) {

    let sR = store.r,
        sG = store.g,
        sB = store.b,
        sA = store.a;

    let iR = incoming.r,
        iG = incoming.g,
        iB = incoming.b,
        iA = incoming.a;

    if (ratio === 1) copyOver(incoming, store);
    else if (ratio > 0) {

        antiRatio = 1 - ratio;

        for (let i = 0, iz = sR.length; i < iz; i++) {

            sR[i] = Math.floor((sR[i] * antiRatio) + (iR[i] * ratio));
            sG[i] = Math.floor((sG[i] * antiRatio) + (iG[i] * ratio));
            sB[i] = Math.floor((sB[i] * antiRatio) + (iB[i] * ratio));
            sA[i] = Math.floor((sA[i] * antiRatio) + (iA[i] * ratio));
        }
    }
};

// `getHSLfromRGB` - convert an RGB format color into an HSL format color
const getHSLfromRGB = function (dr, dg, db) {

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
const getRGBfromHSL = function (h, s, l) {

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
const theBigActionsObject = {

// __alpha-to-channels__ - Copies the alpha channel value over to the selected value or, alternatively, sets that channels value to zero, or leaves the channel's value unchanged. Setting the appropriate "includeChannel" flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate "excludeChannel" flag will set that channel's value to zero.
    'alpha-to-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = true;
        if (null == includeGreen) includeGreen = true;
        if (null == includeBlue) includeBlue = true;
        if (null == excludeRed) excludeRed = true;
        if (null == excludeGreen) excludeGreen = true;
        if (null == excludeBlue) excludeBlue = true;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? inA[i] : ((excludeRed) ? 0 : inR[i]);
            outG[i] = (includeGreen) ? inA[i] : ((excludeGreen) ? 0 : inG[i]);
            outB[i] = (includeBlue) ? inA[i] : ((excludeBlue) ? 0 : inB[i]);
        }
        outA.fill(255, 0, outA.length - 1);

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __area-alpha__ - Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to zero. Can be used to create horizontal or vertical bars, or chequerboard effects.
    'area-alpha': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, tileWidth, tileHeight, offsetX, offsetY, gutterWidth, gutterHeight, areaAlphaLevels, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == tileWidth) tileWidth = 1;
        if (null == tileHeight) tileHeight = 1;
        if (null == offsetX) offsetX = 0;
        if (null == offsetY) offsetY = 0;
        if (null == gutterWidth) gutterWidth = 1;
        if (null == gutterHeight) gutterHeight = 1;
        if (null == areaAlphaLevels) areaAlphaLevels = [255,0,0,0];

        let tiles = buildAlphaTileSets(tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY, areaAlphaLevels);

        if (!Array.isArray(areaAlphaLevels)) areaAlphaLevels = [255,0,0,0];

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {
            outR[i] = inR[i];
            outG[i] = inG[i];
            outB[i] = inB[i];
        }
        tiles.forEach((t, index) => {

            for (let j = 0, jz = t.length; j < jz; j++) {

                if (inA[t[j]]) outA[t[j]] = areaAlphaLevels[index % 4];
            }
        });

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __average-channels__ - Calculates an average value from each pixel's included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to 0.
    'average-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

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

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            if (inA[i]) {

                if (divisor) {

                    let avg = 0;

                    if (includeRed) avg += inR[i];
                    if (includeGreen) avg += inG[i];
                    if (includeBlue) avg += inB[i];

                    avg = Math.floor(avg / divisor);

                    outR[i] = (excludeRed) ? 0 : avg;
                    outG[i] = (excludeGreen) ? 0 : avg;
                    outB[i] = (excludeBlue) ? 0 : avg;
                    outA[i] = inA[i];
                }
                else {
    
                    outR[i] = (excludeRed) ? 0 : inR[i];
                    outG[i] = (excludeGreen) ? 0 : inG[i];
                    outB[i] = (excludeBlue) ? 0 : inB[i];
                    outA[i] = inA[i];
                }
            }
            else {

                outR[i] = inR[i];
                outG[i] = inG[i];
                outB[i] = inB[i];
                outA[i] = inA[i];
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __binary__ - Set the channel to either 0 or 255, depending on whether the channel value is below or above a given level. Level values are set using the "red", "green", "blue" and "alpha" arguments. Setting these values to 0 disables the action for that channel.
    'binary': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, red, green, blue, alpha, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = 0;
        if (null == green) green = 0;
        if (null == blue) blue = 0;
        if (null == alpha) alpha = 0;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            if (red) outR[i] = (inR[i] > red) ? 255 : 0;
            else outR[i] = inR[i];

            if (green) outG[i] = (inG[i] > green) ? 255 : 0;
            else outG[i] = inG[i];

            if (blue) outB[i] = (inB[i] > blue) ? 255 : 0;
            else outB[i] = inB[i];

            if (alpha) outA[i] = (inA[i] > alpha) ? 255 : 0;
            else outA[i] = inA[i];
        }

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __blend__ - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using various separable and non-separable blend modes (as defined by the W3C Compositing and Blending Level 1 recommendations. The blending method is determined by the String value supplied in the "blend" argument; permitted values are: 'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', and 'saturation'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments.
    'blend': function (requirements) {

        let [input, output, mix] = getInputAndOutputChannels(requirements);

        let len = output.r.length;

        let {opacity, blend, offsetX, offsetY, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == blend) blend = '';
        if (null == offsetX) offsetX = 0;
        if (null == offsetY) offsetY = 0;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;
        const {r:mixR, g:mixG, b:mixB, a:mixA} = mix;

        let [iWidth, iHeight, oWidth, oHeight, mWidth, mHeight] = getInputAndOutputDimensions(requirements);

        const copyPixel = function (fromPos, toPos, channel) {

            outR[toPos] = channel.r[fromPos];
            outG[toPos] = channel.g[fromPos];
            outB[toPos] = channel.b[fromPos];
            outA[toPos] = channel.a[fromPos];
        };

        const getLinePositions = function (x, y) {

            let ix = x,
                iy = y,
                mx = x - offsetX,
                my = y - offsetY;

            let mPos = -1,
                iPos = (iy * iWidth) + ix;

            if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mPos = (my * mWidth) + mx;

            return [iPos, mPos];
        };

        const getChannelNormals = function (i, m) {

            return [
                input.r[i] / 255,
                input.g[i] / 255,
                input.b[i] / 255,
                input.a[i] / 255,
                mix.r[m] / 255,
                mix.g[m] / 255,
                mix.b[m] / 255,
                mix.a[m] / 255
            ];
        };

        const alphaCalc = (dinA, dmixA) => (dinA + (dmixA * (1 - dinA))) * 255;

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

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else if (!mixA[mPos]) copyPixel(iPos, iPos, input);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = colorburnCalc(dinR, dmixR);
                            outG[iPos] = colorburnCalc(dinG, dmixG);
                            outB[iPos] = colorburnCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
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

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else if (!mixA[mPos]) copyPixel(iPos, iPos, input);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = colordodgeCalc(dinR, dmixR);
                            outG[iPos] = colordodgeCalc(dinG, dmixG);
                            outB[iPos] = colordodgeCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'darken' :
                const darkenCalc = (din, dmix) => (din < dmix) ? din : dmix;
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else if (!mixA[mPos]) copyPixel(iPos, iPos, input);
                        else {

                            outR[iPos] = darkenCalc(inR[iPos], mixR[mPos]);
                            outG[iPos] = darkenCalc(inG[iPos], mixG[mPos]);
                            outB[iPos] = darkenCalc(inB[iPos], mixB[mPos]);
                            outA[iPos] = alphaCalc(inA[iPos] / 255, mixA[mPos] / 255);
                        }
                    }
                }
                break;

            case 'difference' :
                const differenceCalc = (din, dmix) => Math.abs(din - dmix) * 255;
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = differenceCalc(dinR, dmixR);
                            outG[iPos] = differenceCalc(dinG, dmixG);
                            outB[iPos] = differenceCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'exclusion' :
                const exclusionCalc = (din, dmix) => (din + dmix - (2 * dmix * din)) * 255;
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = exclusionCalc(dinR, dmixR);
                            outG[iPos] = exclusionCalc(dinG, dmixG);
                            outB[iPos] = exclusionCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'hard-light' :
                const hardlightCalc = (din, dmix) => (din <= 0.5) ? (din * dmix) * 255 : (dmix + (din - (dmix * din))) * 255;
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = hardlightCalc(dinR, dmixR);
                            outG[iPos] = hardlightCalc(dinG, dmixG);
                            outB[iPos] = hardlightCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'lighten' :
                const lightenCalc = (din, dmix) => (din > dmix) ? din : dmix;
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else {

                            outR[iPos] = lightenCalc(inR[iPos], mixR[mPos]);
                            outG[iPos] = lightenCalc(inG[iPos], mixG[mPos]);
                            outB[iPos] = lightenCalc(inB[iPos], mixB[mPos]);
                            outA[iPos] = alphaCalc(inA[iPos] / 255, mixA[mPos] / 255);
                        }
                    }
                }
                break;

            case 'lighter' :
                const lighterCalc = (din, dmix) => (din + dmix) * 255;
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = lighterCalc(dinR, dmixR);
                            outG[iPos] = lighterCalc(dinG, dmixG);
                            outB[iPos] = lighterCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'multiply' :
                const multiplyCalc = (din, dmix) => din * dmix * 255;
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else if (!mixA[mPos]) copyPixel(iPos, iPos, input);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = multiplyCalc(dinR, dmixR);
                            outG[iPos] = multiplyCalc(dinG, dmixG);
                            outB[iPos] = multiplyCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'overlay' :
                const overlayCalc = (din, dmix) => (din >= 0.5) ? (din * dmix) * 255 : (dmix + (din - (dmix * din))) * 255;
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = overlayCalc(dinR, dmixR);
                            outG[iPos] = overlayCalc(dinG, dmixG);
                            outB[iPos] = overlayCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'screen' :
                const screenCalc = (din, dmix) => (dmix + (din - (dmix * din))) * 255;
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = screenCalc(dinR, dmixR);
                            outG[iPos] = screenCalc(dinG, dmixG);
                            outB[iPos] = screenCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
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

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else if (!mixA[mPos]) copyPixel(iPos, iPos, input);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            outR[iPos] = softlightCalc(dinR, dmixR);
                            outG[iPos] = softlightCalc(dinG, dmixG);
                            outB[iPos] = softlightCalc(dinB, dmixB);
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'color' :
                const colorCalc = (iR, iG, iB, mR, mG, mB) => {

                    let [iH, iS, iL] = getHSLfromRGB(iR, iG, iB);
                    let [mH, mS, mL] = getHSLfromRGB(mR, mG, mB);

                    return getRGBfromHSL(iH, iS, mL);
                }
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else if (!mixA[mPos]) copyPixel(iPos, iPos, input);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            let [cr, cg, cb] = colorCalc(dinR, dinG, dinB, dmixR, dmixG, dmixB);
                            outR[iPos] = cr;
                            outG[iPos] = cg;
                            outB[iPos] = cb;
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'hue' :
                const hueCalc = (iR, iG, iB, mR, mG, mB) => {

                    let [iH, iS, iL] = getHSLfromRGB(iR, iG, iB);
                    let [mH, mS, mL] = getHSLfromRGB(mR, mG, mB);

                    return getRGBfromHSL(iH, mS, mL);
                }
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else if (!mixA[mPos]) copyPixel(iPos, iPos, input);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            let [cr, cg, cb] = hueCalc(dinR, dinG, dinB, dmixR, dmixG, dmixB);
                            outR[iPos] = cr;
                            outG[iPos] = cg;
                            outB[iPos] = cb;
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'luminosity' :
                const luminosityCalc = (iR, iG, iB, mR, mG, mB) => {

                    let [iH, iS, iL] = getHSLfromRGB(iR, iG, iB);
                    let [mH, mS, mL] = getHSLfromRGB(mR, mG, mB);

                    return getRGBfromHSL(mH, mS, iL);
                }
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else if (!mixA[mPos]) copyPixel(iPos, iPos, input);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            let [cr, cg, cb] = luminosityCalc(dinR, dinG, dinB, dmixR, dmixG, dmixB);
                            outR[iPos] = cr;
                            outG[iPos] = cg;
                            outB[iPos] = cb;
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            case 'saturation' :
                const saturationCalc = (iR, iG, iB, mR, mG, mB) => {

                    let [iH, iS, iL] = getHSLfromRGB(iR, iG, iB);
                    let [mH, mS, mL] = getHSLfromRGB(mR, mG, mB);

                    return getRGBfromHSL(mH, iS, mL);
                }
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else if (!mixA[mPos]) copyPixel(iPos, iPos, input);
                        else {

                            let [dinR, dinG, dinB, dinA, dmixR, dmixG, dmixB, dmixA] = getChannelNormals(iPos, mPos);

                            let [cr, cg, cb] = saturationCalc(dinR, dinG, dinB, dmixR, dmixG, dmixB);
                            outR[iPos] = cr;
                            outG[iPos] = cg;
                            outB[iPos] = cb;
                            outA[iPos] = alphaCalc(dinA, dmixA);
                        }
                    }
                }
                break;

            default:
                const normalCalc = (Cs, As, Cb, Ab) => (As * Cs) + (Ab * Cb * (1 - As));
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else if (!inA[iPos]) copyPixel(mPos, iPos, mix);
                        else {

                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = normalCalc(inR[iPos], dinA, mixR[mPos], dmixA);
                            outG[iPos] = normalCalc(inG[iPos], dinA, mixG[mPos], dmixA);
                            outB[iPos] = normalCalc(inB[iPos], dinA, mixB[mPos], dmixA);
                            outA[iPos] = alphaCalc(dinA, dmixA)
                        }
                    }
                }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __blur__ - Performs a multi-loop, two-step 'horizontal-then-vertical averaging sweep' calculation across all pixels to create a blur effect. Note that this filter is expensive, thus much slower to complete compared to other filter effects.
    'blur': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

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

            let grid = buildImageGrid();

            if (processHorizontal)  horizontalBlurGrid = buildHorizontalBlur(grid, radius, input.a);

            if (processVertical) verticalBlurGrid = buildVerticalBlur(grid, radius, input.a);
        }

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        const getValue = function (flag, gridStore, pos, holdChannel, alpha) {

            if (flag) {

                let h = gridStore[pos],
                    l = h.length,
                    counter = 0,
                    total = 0;

                if (alpha) {

                    for (let t = 0; t < l; t += step) {

                        if (alpha[h[t]]) {

                            total += holdChannel[h[t]];
                            counter++;
                        }
                    }
                    return total / counter;
                }
                for (let t = 0; t < l; t++) {
                    total += holdChannel[h[t]];
                }
                return total / l;
            }
            return holdChannel[pos];
        }

        if (!passes || (!processHorizontal && !processVertical)) copyOver(input, output);
        else {

            const hold = createResultObject(len);
            const {r:holdR, g:holdG, b:holdB, a:holdA} = hold;

            copyOver(input, hold);

            for (let pass = 0; pass < passes; pass++) {

                if (processHorizontal) {

                    for (let k = 0; k < len; k++) {

                        if (includeAlpha || holdA[k]) {

                            outR[k] = getValue(includeRed, horizontalBlurGrid, k, holdR, holdA);
                            outG[k] = getValue(includeGreen, horizontalBlurGrid, k, holdG, holdA);
                            outB[k] = getValue(includeBlue, horizontalBlurGrid, k, holdB, holdA);
                            outA[k] = getValue(includeAlpha, horizontalBlurGrid, k, holdA, false);
                        }
                    }
                    if (processVertical || pass < passes - 1) copyOver(output, hold);
                }

                if (processVertical) {

                    for (let k = 0; k < len; k++) {

                        if (includeAlpha || holdA[k]) {

                            outR[k] = getValue(includeRed, verticalBlurGrid, k, holdR, holdA);
                            outG[k] = getValue(includeGreen, verticalBlurGrid, k, holdG, holdA);
                            outB[k] = getValue(includeBlue, verticalBlurGrid, k, holdB, holdA);
                            outA[k] = getValue(includeAlpha, verticalBlurGrid, k, holdA, false);
                        }
                    }
                    if (pass < passes - 1) copyOver(output, hold);
                }
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __channels-to-alpha__ - Calculates an average value from each pixel's included channels and applies that value to the alpha channel.
    'channels-to-alpha': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, includeRed, includeGreen, includeBlue, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = true;
        if (null == includeGreen) includeGreen = true;
        if (null == includeBlue) includeBlue = true;

        let divisor = 0;
        if (includeRed) divisor++;
        if (includeGreen) divisor++;
        if (includeBlue) divisor++;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            outR[i] = inR[i];
            outG[i] = inG[i];
            outB[i] = inB[i];

            if (divisor) {

                let avg = 0;

                if (includeRed) avg += inR[i];
                if (includeGreen) avg += inG[i];
                if (includeBlue) avg += inB[i];

                avg = Math.floor(avg / divisor);

                outA[i] = avg;
            }
            else outA[i] = inA[i];
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __chroma__ - Using an array of 'range' arrays, determine whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. Each 'range' array comprises six Numbers representing [minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue] values.
    'chroma': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, ranges, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == ranges) ranges = [];

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let j = 0; j < len; j++) {

            let flag = false;

            let r = inR[j],
                g = inG[j],
                b = inB[j];

            for (i = 0, iz = ranges.length; i < iz; i++) {

                let range = ranges[i];

                let [minR, minG, minB, maxR, maxG, maxB] = ranges[i];

                if (r >= minR && r <= maxR && g >= minG && g <= maxG && b >= minB && b <= maxB) {
                    flag = true;
                    break;
                }

            }
            outR[j] = inR[j];
            outG[j] = inG[j];
            outB[j] = inB[j];
            outA[j] = (flag) ? 0 : inA[j];
        }

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __clamp-channels__ - Clamp each color channel to a range set by lowColor and highColor values
    'clamp-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

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

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            if (inA[i]) {

                let r = inR[i] / 255,
                    g = inG[i] / 255,
                    b = inB[i] / 255;

                outR[i] = lowRed + (r * dR);
                outG[i] = lowGreen + (g * dG);
                outB[i] = lowBlue + (b * dB);
                outA[i] = inA[i];
            }
            else {
                outR[i] = inR[i];
                outG[i] = inG[i];
                outB[i] = inB[i];
                outA[i] = inA[i];
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __colors-to-alpha__ - Determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the "red", "green" and "blue" arguments. The sensitivity of the effect can be manipulated using the "transparentAt" and "opaqueAt" values, both of which lie in the range 0-1.
    'colors-to-alpha': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

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

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {
            outR[i] = inR[i];
            outG[i] = inG[i];
            outB[i] = inB[i];
            outA[i] = getValue(inR[i], inG[i], inB[i]);
        }

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __compose__ - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using alpha compositing rules (as defined by Porter/Duff). The compositing method is determined by the String value supplied in the "compose" argument; permitted values are: 'destination-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'source-only', 'source-over' (default), 'source-in', 'source-out', 'source-atop', 'clear', 'xor', or 'lighter'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments.
    'compose': function (requirements) {

        let [input, output, mix] = getInputAndOutputChannels(requirements);

        let len = output.r.length;

        let {opacity, compose, offsetX, offsetY, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == compose) compose = '';
        if (null == offsetX) offsetX = 0;
        if (null == offsetY) offsetY = 0;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;
        const {r:mixR, g:mixG, b:mixB, a:mixA} = mix;

        let [iWidth, iHeight, oWidth, oHeight, mWidth, mHeight] = getInputAndOutputDimensions(requirements);

        const copyPixel = function (fromPos, toPos, channel) {

            outR[toPos] = channel.r[fromPos];
            outG[toPos] = channel.g[fromPos];
            outB[toPos] = channel.b[fromPos];
            outA[toPos] = channel.a[fromPos];
        };

        const getLinePositions = function (x, y) {

            let ix = x,
                iy = y,
                mx = x - offsetX,
                my = y - offsetY;

            let mPos = -1,
                iPos = (iy * iWidth) + ix;

            if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mPos = (my * mWidth) + mx;

            return [iPos, mPos];
        };

        switch (compose) {

            case 'source-only' :
                copyOver(input, output);
                break;

            case 'source-atop' :
                const sAtopCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * mAlpha) + (mAlpha * mColor * (1 - iAlpha));
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos >= 0) {

                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = sAtopCalc(inR[iPos], dinA, mixR[mPos], dmixA);
                            outG[iPos] = sAtopCalc(inG[iPos], dinA, mixG[mPos], dmixA);
                            outB[iPos] = sAtopCalc(inB[iPos], dinA, mixB[mPos], dmixA);
                            outA[iPos] = ((dinA * dmixA) + (dmixA * (1 - dinA))) * 255;
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

                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = sInCalc(inR[iPos], dinA, dmixA);
                            outG[iPos] = sInCalc(inG[iPos], dinA, dmixA);
                            outB[iPos] = sInCalc(inB[iPos], dinA, dmixA);
                            outA[iPos] = dinA * dmixA * 255;
                        }
                    }
                }
                break;

            case 'source-out' :
                const sOutCalc = (iColor, iAlpha, mAlpha) => iAlpha * iColor * (1 - mAlpha);
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else {

                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = sOutCalc(inR[iPos], dinA, dmixA);
                            outG[iPos] = sOutCalc(inG[iPos], dinA, dmixA);
                            outB[iPos] = sOutCalc(inB[iPos], dinA, dmixA);
                            outA[iPos] = dinA * (1 - dmixA) * 255;
                        }
                    }
                }
                break;

            case 'destination-only' :
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos >= 0) copyPixel(mPos, iPos, mix);
                    }
                }
                break;

            case 'destination-atop' :
                const dAtopCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * (1 - mAlpha)) + (mAlpha * mColor * iAlpha);
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else {

                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = dAtopCalc(inR[iPos], dinA, mixR[mPos], dmixA);
                            outG[iPos] = dAtopCalc(inG[iPos], dinA, mixG[mPos], dmixA);
                            outB[iPos] = dAtopCalc(inB[iPos], dinA, mixB[mPos], dmixA);
                            outA[iPos] = ((dinA * (1 - dmixA)) + (dmixA * dinA)) * 255;
                        }
                    }
                }
                break;

            case 'destination-over' :
                const dOverCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor * (1 - mAlpha)) + (mAlpha * mColor);
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else {

                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = dOverCalc(inR[iPos], dinA, mixR[mPos], dmixA);
                            outG[iPos] = dOverCalc(inG[iPos], dinA, mixG[mPos], dmixA);
                            outB[iPos] = dOverCalc(inB[iPos], dinA, mixB[mPos], dmixA);
                            outA[iPos] = ((dinA * (1 - dmixA)) + dmixA) * 255;
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

                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = dInCalc(mixR[mPos], dmixA, dinA);
                            outG[iPos] = dInCalc(mixG[mPos], dmixA, dinA);
                            outB[iPos] = dInCalc(mixB[mPos], dmixA, dinA);
                            outA[iPos] = dinA * dmixA * 255;
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
        
                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = dOutCalc(mixR[mPos], dinA, dmixA);
                            outG[iPos] = dOutCalc(mixG[mPos], dinA, dmixA);
                            outB[iPos] = dOutCalc(mixB[mPos], dinA, dmixA);
                            outA[iPos] = dmixA * (1 - dinA) * 255;
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

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else {

                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = xorCalc(inR[iPos], dinA, mixR[mPos], dmixA);
                            outG[iPos] = xorCalc(inG[iPos], dinA, mixG[mPos], dmixA);
                            outB[iPos] = xorCalc(inB[iPos], dinA, mixB[mPos], dmixA);
                            outA[iPos] = ((dinA * (1 - dmixA)) + (dmixA * (1 - dinA))) * 255;
                        }
                    }
                }
                break;

            default:
                const sOverCalc = (iColor, iAlpha, mColor, mAlpha) => (iAlpha * iColor) + (mAlpha * mColor * (1 - iAlpha));
                for (let y = 0; y < iHeight; y++) {
                    for (let x = 0; x < iWidth; x++) {

                        let [iPos, mPos] = getLinePositions(x, y);

                        if (mPos < 0) copyPixel(iPos, iPos, input);
                        else {

                            let dinA = inA[iPos] / 255,
                                dmixA = mixA[mPos] / 255;

                            outR[iPos] = sOverCalc(inR[iPos], dinA, mixR[mPos], dmixA);
                            outG[iPos] = sOverCalc(inG[iPos], dinA, mixG[mPos], dmixA);
                            outB[iPos] = sOverCalc(inB[iPos], dinA, mixB[mPos], dmixA);
                            outA[iPos] = (dinA + (dmixA * (1 - dinA))) * 255;
                        }
                    }
                }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __displace__ - Shift pixels around the image, based on the values supplied in a displacement image
    'displace': function (requirements) {

        let [input, output, mix] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, channelX, channelY, scaleX, scaleY, offsetX, offsetY, transparentEdges, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == channelX) channelX = 'red';
        if (null == channelY) channelY = 'green';
        if (null == scaleX) scaleX = 1;
        if (null == scaleY) scaleY = 1;
        if (null == offsetX) offsetX = 0;
        if (null == offsetY) offsetY = 0;
        if (null == transparentEdges) transparentEdges = false;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;
        const {r:mixR, g:mixG, b:mixB, a:mixA} = mix;

        if (channelX == 'red') channelX = mixR;
        else if (channelX == 'green') channelX = mixG;
        else if (channelX == 'blue') channelX = mixB;
        else channelX = mixA;

        if (channelY == 'red') channelY = mixR;
        else if (channelY == 'green') channelY = mixG;
        else if (channelY == 'blue') channelY = mixB;
        else channelY = mixA;

        let [iWidth, iHeight, oWidth, oHeight, mWidth, mHeight] = getInputAndOutputDimensions(requirements);

        const copyPixel = function (fromPos, toPos, channel) {

            if (fromPos < 0) outA[toPos] = 0;
            else {

                outR[toPos] = channel.r[fromPos];
                outG[toPos] = channel.g[fromPos];
                outB[toPos] = channel.b[fromPos];
                outA[toPos] = channel.a[fromPos];
            }
        };

        const getLinePositions = function (x, y) {

            let ix = x,
                iy = y,
                mx = x + offsetX,
                my = y + offsetY;

            let mPos = -1,
                iPos = (iy * iWidth) + ix;

            if (mx >= 0 && mx < mWidth && my >= 0 && my < mHeight) mPos = (my * mWidth) + mx;

            return [iPos, mPos];
        };

        for (let y = 0; y < iHeight; y++) {
            for (let x = 0; x < iWidth; x++) {

                let [iPos, mPos] = getLinePositions(x, y);

                if (mPos >= 0) {

                    let dx = Math.floor(x + ((127 - channelX[mPos]) / 127) * scaleX);
                    let dy = Math.floor(y + ((127 - channelY[mPos]) / 127) * scaleY);
                    let dPos;

                    if (!transparentEdges) {

                        if (dx < 0) dx = 0;
                        if (dx >= iWidth) dx = iWidth - 1;
                        if (dy < 0) dy = 0;
                        if (dy >= iHeight) dy = iHeight - 1;

                        dPos = (dy * iWidth) + dx;
                    }
                    else {

                        if (dx < 0 || dx >= iWidth || dy < 0 || dy >= iHeight) dPos = -1;
                        else dPos = (dy * iWidth) + dx;
                    }

                    copyPixel(dPos, iPos, input);
                }
                else copyPixel(iPos, iPos, input);
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __emboss__ - A 3x3 matrix transform; the matrix weights are calculated internally from the values of two arguments: "strength", and "angle" - which is a value measured in degrees, with 0 degrees pointing to the right of the origin (along the positive x axis). Post-processing options include removing unchanged pixels, or setting then to mid-gray. The convenience method includes additional arguments which will add a choice of grayscale, then channel clamping, then blurring actions before passing the results to this emboss action
    'emboss': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

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

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        grid = buildMatrixGrid(3, 3, 1, 1, inA);

        const doCalculations = function (inChannel, matrix) {

            let val = 0;

            for (let m = 0, mz = matrix.length; m < mz; m++) {

                if (weights[m]) val += (inChannel[matrix[m]] * weights[m]);
            }
            return val;
        }

        for (let i = 0; i < len; i++) {

            if (inA[i]) {

                outR[i] = doCalculations(inR, grid[i]);
                outG[i] = doCalculations(inG, grid[i]);
                outB[i] = doCalculations(inB, grid[i]);
                outA[i] = inA[i];

                if (postProcessResults) {

                    if (outR[i] >= inR[i] - tolerance && outR[i] <= inR[i] + tolerance && 
                        outG[i] >= inG[i] - tolerance && outG[i] <= inG[i] + tolerance && 
                        outB[i] >= inB[i] - tolerance && outB[i] <= inB[i] + tolerance) {

                        if (keepOnlyChangedAreas) outA[i] = 0;
                        else {
                            outR[i] = 127;
                            outG[i] = 127;
                            outB[i] = 127;
                        }
                    }
                }
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __flood__ - Set all pixels to the channel values supplied in the "red", "green", "blue" and "alpha" arguments
    'flood': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length,
            floor = Math.floor;

        let {opacity, red, green, blue, alpha, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = 0;
        if (null == green) green = 0;
        if (null == blue) blue = 0;
        if (null == alpha) alpha = 255;

        const {r:outR, g:outG, b:outB, a:outA} = output;

        outR.fill(red, 0, len - 1);
        outG.fill(green, 0, len - 1);
        outB.fill(blue, 0, len - 1);
        outA.fill(alpha, 0, len - 1);

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __grayscale__ - For each pixel, averages the weighted color channels and applies the result across all the color channels. This gives a more realistic monochrome effect.
    'grayscale': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, lineOut} = requirements;

        if (null == opacity) opacity = 1;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            let gray = Math.floor((0.2126 * inR[i]) + (0.7152 * inG[i]) + (0.0722 * inB[i]));

            outR[i] = gray;
            outG[i] = gray;
            outB[i] = gray;
            outA[i] = inA[i];
        }

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __invert-channels__ - For each pixel, subtracts its current channel values - when included - from 255.
    'invert-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, includeRed, includeGreen, includeBlue, includeAlpha, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = true;
        if (null == includeGreen) includeGreen = true;
        if (null == includeBlue) includeBlue = true;
        if (null == includeAlpha) includeAlpha = false;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? 255 - inR[i] : inR[i];
            outG[i] = (includeGreen) ? 255 - inG[i] : inG[i];
            outB[i] = (includeBlue) ? 255 - inB[i] : inB[i];
            outA[i] = (includeAlpha) ? 255 - inA[i] : inA[i];
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __lock-channels-to-levels__ - Produces a posterize effect. Takes in four arguments - "red", "green", "blue" and "alpha" - each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value.
    'lock-channels-to-levels': function (requirements) {

        checkChannelLevelsParameters(requirements)

        const getValue = function (val, levels) {

            if (!levels.length) return val;

            for (let i = 0, iz = levels.length; i < iz; i++) {

                let [start, end, level] = levels[i];
                if (val >= start && val <= end) return level;
            }
        };

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, red, green, blue, alpha, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = [0];
        if (null == green) green = [0];
        if (null == blue) blue = [0];
        if (null == alpha) alpha = [255];

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {
            outR[i] = getValue(inR[i], red);
            outG[i] = getValue(inG[i], green);
            outB[i] = getValue(inB[i], blue);
            outA[i] = getValue(inA[i], alpha);
        }

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __matrix__ - Performs a matrix operation on each pixel's channels, calculating the new value using neighbouring pixel weighted values. Also known as a convolution matrix, kernel or mask operation. Note that this filter is expensive, thus much slower to complete compared to other filter effects. The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments. The weights to be applied need to be supplied in the "weights" argument - an Array listing the weights row-by-row starting from the top-left corner of the matrix. By default all color channels are included in the calculations while the alpha channel is excluded. The 'edgeDetect', 'emboss' and 'sharpen' convenience filter methods all use the matrix action, pre-setting the required weights.
    'matrix': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

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

        grid = buildMatrixGrid(width, height, offsetX, offsetY, input.a);

        const doCalculations = function (inChannel, matrix) {

            let val = 0;

            for (let m = 0, mz = matrix.length; m < mz; m++) {

                if (weights[m]) val += (inChannel[matrix[m]] * weights[m]);
            }
            return val;
        }

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            if (inA[i]) {

                if (includeRed) outR[i] = doCalculations(inR, grid[i]);
                else outR[i] = inR[i];

                if (includeGreen) outG[i] = doCalculations(inG, grid[i]);
                else outG[i] = inG[i];

                if (includeBlue) outB[i] = doCalculations(inB, grid[i]);
                else outB[i] = inB[i];

                if (includeAlpha) outA[i] = doCalculations(inA, grid[i]);
                else outA[i] = inA[i];
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __modulate-channels__ - Multiplies each channel's value by the supplied argument value. A channel-argument's value of '0' will set that channel's value to zero; a value of '1' will leave the channel value unchanged. If the "saturation" flag is set to 'true' the calculation changes to start at the color range mid point. The 'brightness' and 'saturation' filters are special forms of the 'channels' filter which use a single "levels" argument to set all three color channel arguments to the same value.
    'modulate-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, red, green, blue, alpha, saturation, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = 1;
        if (null == green) green = 1;
        if (null == blue) blue = 1;
        if (null == alpha) alpha = 1;
        if (null == saturation) saturation = false;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        if (saturation) {

            for (let i = 0; i < len; i++) {
                outR[i] = 127 + ((inR[i] - 127) * red);
                outG[i] = 127 + ((inG[i] - 127) * green);
                outB[i] = 127 + ((inB[i] - 127) * blue);
                outA[i] = 127 + ((inA[i] - 127) * alpha);
            }
        }
        else {

            for (let i = 0; i < len; i++) {
                outR[i] = inR[i] * red;
                outG[i] = inG[i] * green;
                outB[i] = inB[i] * blue;
                outA[i] = inA[i] * alpha;
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __offset__ - Offset the input image in the output image.
    'offset': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

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

        let simpleoffset = false;

        if (offsetRedX == offsetGreenX && offsetRedX == offsetBlueX && offsetRedX == offsetAlphaX && offsetRedY == offsetGreenY && offsetRedY == offsetBlueY && offsetRedY == offsetAlphaY) simpleoffset = true;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        let grid = buildImageGrid(),
            gWidth = grid[0].length,
            gHeight = grid.length,
            drx, dry, dgx, dgy, dbx, dby, dax, day, inCell, outCell;

        for (let y = 0; y < gHeight; y++) {
            for (let x = 0; x < gWidth; x++) {

                inCell = grid[y][x];

                if (inA[inCell]) {

                    if (simpleoffset) {

                        drx = x + offsetRedX;
                        dry = y + offsetRedY;

                        if (drx >= 0 && drx < gWidth && dry >= 0 && dry < gHeight) {

                            outCell = grid[dry][drx];
                            outR[outCell] = inR[inCell];
                            outG[outCell] = inG[inCell];
                            outB[outCell] = inB[inCell];
                            outA[outCell] = inA[inCell];
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

                            outCell = grid[dry][drx];
                            outR[outCell] = inR[inCell];
                        }

                        if (dgx >= 0 && dgx < gWidth && dgy >= 0 && dgy < gHeight) {

                            outCell = grid[dgy][dgx];
                            outG[outCell] = inG[inCell];
                        }

                        if (dbx >= 0 && dbx < gWidth && dby >= 0 && dby < gHeight) {

                            outCell = grid[dby][dbx];
                            outB[outCell] = inB[inCell];
                        }

                        if (dax >= 0 && dax < gWidth && day >= 0 && day < gHeight) {

                            outCell = grid[day][dax];
                            outA[outCell] = inA[inCell];
                        }
                    }
                }
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __pixelate__ - Pixelizes the input image by creating a grid of tiles across it and then averaging the color values of each pixel in a tile and setting its value to the average. Tile width and height, and their offset from the top left corner of the image, are set via the "tileWidth", "tileHeight", "offsetX" and "offsetY" arguments.
    'pixelate': function (requirements) {

        const doCalculations = function (inChannel, outChannel, tile) {

            let avg = tile.reduce((a, v) => a + inChannel[v], 0);

            avg = Math.floor(avg / tile.length);

            for (let i = 0, iz = tile.length; i < iz; i++) {

                outChannel[tile[i]] = avg;
            }
        }

        const setOutValueToInValue = function (inChannel, outChannel, tile) {

            let cell;

            for (let i = 0, iz = tile.length; i < iz; i++) {

                cell = tile[i];
                outChannel[cell] = inChannel[cell];
            }
        };

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

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

        const tiles = buildImageTileSets(tileWidth, tileHeight, offsetX, offsetY);

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        tiles.forEach(t => {
            if (includeRed) doCalculations(inR, outR, t);
            else setOutValueToInValue(inR, outR, t);

            if (includeGreen) doCalculations(inG, outG, t);
            else setOutValueToInValue(inG, outG, t);

            if (includeBlue) doCalculations(inB, outB, t);
            else setOutValueToInValue(inB, outB, t);

            if (includeAlpha) doCalculations(inA, outA, t);
            else setOutValueToInValue(inA, outA, t);
        })

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __Add an asset image to the filter process chain. The asset - the String name of the asset object - must be pre-loaded before it can be included in the filter. The "width" and "height" arguments are measured in integer Number pixels; the "copy" arguments can be either percentage Strings (relative to the asset's natural dimensions) or absolute Number values (in pixels). The "lineOut" argument is required - be aware that the filter action does not check for any pre-existing assets cached under this name and, if they exist, will overwrite them with this asset's data.__ - 
    'process-image': function (requirements) {

        const {assetData, lineOut} = requirements;

        if (lineOut && lineOut.substring && lineOut.length && assetData && assetData.width && assetData.height && assetData.data) {

            let d = assetData.data;
            let len = d.length;

            let res = createResultObject(len / 4);

            let r = res.r,
                g = res.g,
                b = res.b,
                a = res.a;

            let counter = 0;

            for (let i = 0; i < len; i += 4) {

                r[counter] = d[i];
                g[counter] = d[i + 1];
                b[counter] = d[i + 2];
                a[counter] = d[i + 3];

                counter++;
            }
            assetData.channels = res;

            cache[lineOut] = assetData;
        }
    },

// __set-channel-to-level__ - Sets the value of each pixel's included channel to the value supplied in the "level" argument.
    'set-channel-to-level': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, includeRed, includeGreen, includeBlue, includeAlpha, level, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == includeRed) includeRed = false;
        if (null == includeGreen) includeGreen = false;
        if (null == includeBlue) includeBlue = false;
        if (null == includeAlpha) includeAlpha = false;
        if (null == level) level = 0;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? level : inR[i];
            outG[i] = (includeGreen) ? level : inG[i];
            outB[i] = (includeBlue) ? level : inB[i];
            outA[i] = (includeAlpha) ? level : inA[i];
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __step-channels__ - Takes three divisor values - "red", "green", "blue". For each pixel, its color channel values are divided by the corresponding color divisor, floored to the integer value and then multiplied by the divisor. For example a divisor value of '50' applied to a channel value of '120' will give a result of '100'. The output is a form of posterization.
    'step-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length,
            floor = Math.floor;

        let {opacity, red, green, blue, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == red) red = 1;
        if (null == green) green = 1;
        if (null == blue) blue = 1;

        if (red == null) red = 1;
        if (green == null) green = 1;
        if (blue == null) blue = 1;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {
            outR[i] = floor(inR[i] / red) * red;
            outG[i] = floor(inG[i] / green) * green;
            outB[i] = floor(inB[i] / blue) * blue;
            outA[i] = inA[i];
        }

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __threshold__ - Grayscales the input then, for each pixel, checks the color channel values against a "level" argument: pixels with channel values above the level value are assigned to the 'high' color; otherwise they are updated to the 'low' color. The "high" and "low" arguments are [red, green, blue] integer Number Arrays. The convenience function will accept the pseudo-attributes "highRed", "lowRed" etc in place of the "high" and "low" Arrays.
    'threshold': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, low, high, level, lineOut} = requirements;

        if (null == opacity) opacity = 1;
        if (null == low) low = [0,0,0];
        if (null == high) high = [255,255,255];
        if (null == level) level = 128;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        let [lowR, lowG, lowB] = low;
        let [highR, highG, highB] = high;

        for (let i = 0; i < len; i++) {

            let gray = Math.floor((0.2126 * inR[i]) + (0.7152 * inG[i]) + (0.0722 * inB[i]));

            if (gray < level) {

                outR[i] = lowR;
                outG[i] = lowG;
                outB[i] = lowB;
            }
            else {

                outR[i] = highR;
                outG[i] = highG;
                outB[i] = highB;
            }
            outA[i] = inA[i];
        }

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __tint-channels__ - Has similarities to the SVG &lt;feColorMatrix> filter element, but excludes the alpha channel from calculations. Rather than set a matrix, we set nine arguments to determine how the value of each color channel in a pixel will affect both itself and its fellow color channels. The 'sepia' convenience filter presets these values to create a sepia effect.
    'tint-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

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

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            let r = inR[i],
                g = inG[i],
                b = inB[i];

            outR[i] = Math.floor((r * redInRed) + (g * greenInRed) + (b * blueInRed));
            outG[i] = Math.floor((r * redInGreen) + (g * greenInGreen) + (b * blueInGreen));
            outB[i] = Math.floor((r * redInBlue) + (g * greenInBlue) + (b * blueInBlue));
            outA[i] = inA[i];
        }

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

// __user-defined-legacy__ - Previous to version 8.4, filters could be defined with an argument which passed a function string to the filter worker, which the worker would then run against the source input image as-and-when required. This functionality has been removed from the new filter system. All such filters will now return the input image unchanged.

    'user-defined-legacy': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let {opacity, lineOut} = requirements;

        if (null == opacity) opacity = 1;

        copyOver(input, output);

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },
};
