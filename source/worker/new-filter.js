// # Filter worker
// A long-running web worker which, when not in use, gets stored in the filter pool defined in the [filter factory](../factory/filter.html)
//
// TODO: documentation


// #### Demos:
// + TODO: list demos with links


// #### Imports
// None used


let packet, packetFiltersArray;

let source, work, cache, actions;

let workstore = {};

const createResultObject = function (len) {

    return {
        r: new Uint8ClampedArray(len),
        g: new Uint8ClampedArray(len),
        b: new Uint8ClampedArray(len),
        a: new Uint8ClampedArray(len),
    };
};

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


// #### Messaging and error handling
onmessage = function (msg) {

/*
msg contains a data attribute, representing the message packet, with the following structure:

{
    image: {
        width: Number
        height: Number
        data: []
    },
    filters: [] - Array
}

We need to amend the msg.img.data Array in line with the requirements set out in the filters Array and return the entire packet.

We need to respect existing filter requests, while converting them to use the new ways

*/

    packet = msg.data;
    packetFiltersArray = packet.filters;

    if (Object.keys(workstore).length > 100) workstore = {};

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

const buildImageGrid = function (data) {

    if (!data) data = cache.source;

    if (data && data.width && data.height) {

        if (workstore[`grid-${data.width}-${data.height}`]) return workstore[`grid-${data.width}-${data.height}`];

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
        workstore[`grid-${data.width}-${data.height}`] = grid;
        return grid;
    }
    return false;
};

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

        if (workstore[`alphatileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${gutterWidth}-${gutterHeight}-${offsetX}-${offsetY}`]) return workstore[`alphatileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${gutterWidth}-${gutterHeight}-${offsetX}-${offsetY}`];

        let tiles = [],
            hold, i, iz, j, jz, x, xz, y, yz;

        for (j = offsetY - aHeight, jz = iHeight; j < jz; j += aHeight) {

            for (i = offsetX - aWidth, iz = iWidth; i < iz; i += aWidth) {

                // from 0, 0: tileWidth x tileHeight
                hold = [];
                for (y = j, yz = j + tileHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i, xz = i + tileWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((y * iWidth) + x);
                        }
                    }
                }
                tiles.push([].concat(hold));

                // from tileWidth, 0: gutterWidth x tileHeight
                hold = [];
                for (y =  j + tileHeight, yz = j + tileHeight + gutterHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i, xz = i + tileWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((y * iWidth) + x);
                        }
                    }
                }
                tiles.push([].concat(hold));

                // from 0, tileheight: tileWidth x gutterHeight
                hold = [];
                for (y = j, yz = j + tileHeight; y < yz; y++) {
                    if (y >= 0 && y < iHeight) {
                        for (let x = i + tileWidth, xz = i + tileWidth + gutterWidth; x < xz; x++) {
                            if (x >= 0 && x < iWidth) hold.push((y * iWidth) + x);
                        }
                    }
                }
                tiles.push([].concat(hold));

                // from tileWidth, tileHeight: gutterWidth x gutterHeight
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
        workstore[`alphatileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${gutterWidth}-${gutterHeight}-${offsetX}-${offsetY}`] = tiles;
        return tiles;
    }
    return false;

};

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

        if (workstore[`imagetileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${offsetX}-${offsetY}`]) return workstore[`imagetileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${offsetX}-${offsetY}`];

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
        workstore[`imagetileset-${iWidth}-${iHeight}-${tileWidth}-${tileHeight}-${offsetX}-${offsetY}`] = tiles;
        return tiles;
    }
    return false;
};

const buildHorizontalBlur = function (grid, radius, alpha) {

    if (!radius || !radius.toFixed || isNaN(radius)) radius = 0;

    let gridHeight = grid.length,
        gridWidth = grid[0].length;

    if (workstore[`blur-h-${gridWidth}-${gridHeight}-${radius}`]) return workstore[`blur-h-${gridWidth}-${gridHeight}-${radius}`];

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
    workstore[`blur-h-${gridWidth}-${gridHeight}-${radius}`] = horizontalBlur;
    return horizontalBlur;
};

const buildVerticalBlur = function (grid, radius, alpha) {

    if (!radius || !radius.toFixed || isNaN(radius)) radius = 0;

    let gridHeight = grid.length,
        gridWidth = grid[0].length;

    if (workstore[`blur-v-${gridWidth}-${gridHeight}-${radius}`]) return workstore[`blur-v-${gridWidth}-${gridHeight}-${radius}`];

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
    workstore[`blur-v-${gridWidth}-${gridHeight}-${radius}`] = verticalBlur;
    return verticalBlur;
};

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

    if (workstore[`matrix-${iWidth}-${iHeight}-${mWidth}-${mHeight}-${mX}-${mY}`]) return workstore[`matrix-${iWidth}-${iHeight}-${mWidth}-${mHeight}-${mX}-${mY}`];

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

            // process template
            for (i = 0, iz = cellsTemplate.length; i < iz; i++) {

                let val = pos + cellsTemplate[i];

                if (val < 0) val += dataLength;
                else if (val >= dataLength) val -= dataLength;

                cell.push(val);
            }
            grid.push(cell);
        }
    }
    workstore[`matrix-${iWidth}-${iHeight}-${mWidth}-${mHeight}-${mX}-${mY}`] = grid;
    return grid;
};

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

const cacheOutput = function (name, obj, caller) {

    if (cache[name]) throw new Error('Duplicate name encountered when trying to cache output from', caller);
    cache[name] = obj;
};

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

const getInputAndOutputChannels = function (requirements) {

    let lineIn = work;
    let len = lineIn.r.length;
    let data = cache.source;

    if (requirements.lineIn) {

        if (requirements.lineIn == 'source') {

            // data = cache.source;
            lineIn = data.channels;
        }

        else if (requirements.lineIn == 'source-alpha') {

            // data = cache.source;
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

const theBigActionsObject = {

    'alpha-to-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue, lineOut} = requirements;

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

    'area-alpha': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, tileWidth, tileHeight, offsetX, offsetY, gutterWidth, gutterHeight, areaAlphaLevels, lineOut} = requirements;

        let tiles = buildAlphaTileSets(tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY, areaAlphaLevels);

        if (!Array.isArray(areaAlphaLevels)) areaAlphaLevels = [255,0,0,0];

        // Do filter work
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

    'average-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue, lineOut} = requirements;

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

    'blend': function (requirements) {

        let [input, output, mix] = getInputAndOutputChannels(requirements);

        let len = output.r.length;

        const {opacity, blend, offsetX, offsetY, lineOut} = requirements;

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

/*        // Lum(C) = 0.3 x Cred + 0.59 x Cgreen + 0.11 x Cblue
        const getLuminosity = (r, g, b) => (0.3 * r) + (0.59 * g) + (0.11 * b);

        // SetLum(C, l)
        //     d = l - Lum(C)
        //     Cred = Cred + d
        //     Cgreen = Cgreen + d
        //     Cblue = Cblue + d
        //     return ClipColor(C)
        const setLuminosity = (r, g, b, l) => {

            let d = l - getLuminosity(r, g, b);

            r += d;
            g += d;
            b += d;

            return clipColor(r, g, b);
        };

        // ClipColor(C)
        //     L = Lum(C)
        //     n = min(Cred, Cgreen, Cblue)
        //     x = max(Cred, Cgreen, Cblue)
        //     if(n < 0)
        //         C = L + (((C - L) * L) / (L - n))
                          
        //     if(x > 1)
        //         C = L + (((C - L) * (1 - L)) / (x - L))
            
        //     return C
        const clipColor = (r, g, b) => {

            let l = getLuminosity(r, g, b);

            let n = Math.min(r, g, b),
                x = Math.max(r, g, b);

            if (n < 0) {
                r = l + (((r - l) * l) / (l - n));
                g = l + (((g - l) * l) / (l - n));
                b = l + (((b - l) * l) / (l - n));
            }

            if (x > 1) {
                r = l + (((r - l) * (1 - l)) / (x - l));
                g = l + (((g - l) * (1 - l)) / (x - l));
                b = l + (((b - l) * (1 - l)) / (x - l));
            }

            return [r, g, b];
        }

        // Sat(C) = max(Cred, Cgreen, Cblue) - min(Cred, Cgreen, Cblue)
        const getSaturation = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b);
*/

        const getHSLfromRGB = function (dr, dg, db) {

            // let dr = r / 255,
            //     dg = g / 255,
            //     db = b / 255;

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

    'blur': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, radius, passes, processVertical, processHorizontal, includeRed, includeGreen, includeBlue, includeAlpha, step, lineOut} = requirements;

        let horizontalBlurGrid, verticalBlurGrid;

        // Any required precalculations
        if (processHorizontal || processVertical) {

            let grid = buildImageGrid();

            if (processHorizontal)  horizontalBlurGrid = buildHorizontalBlur(grid, radius, input.a);

            if (processVertical) verticalBlurGrid = buildVerticalBlur(grid, radius, input.a);
        }

        // Perform blur action
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

                        if (holdA[k]) {

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

                        if (holdA[k]) {

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

    'channels-to-alpha': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, lineOut} = requirements;

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

    'chroma': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, ranges, lineOut} = requirements;

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

    'colors-to-alpha': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, red, green, blue, opaqueAt, transparentAt, lineOut} = requirements;

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

    'compose': function (requirements) {

        let [input, output, mix] = getInputAndOutputChannels(requirements);

        let len = output.r.length;

        const {opacity, compose, offsetX, offsetY, lineOut} = requirements;

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

    'flood': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length,
            floor = Math.floor;

        const {opacity, red, green, blue, alpha, lineOut} = requirements;

        if (red == null) red = 0;
        if (green == null) green = 0;
        if (blue == null) blue = 0;
        if (alpha == null) alpha = 255;

        const {r:outR, g:outG, b:outB, a:outA} = output;

        outR.fill(red, 0, len - 1);
        outG.fill(green, 0, len - 1);
        outB.fill(blue, 0, len - 1);
        outA.fill(alpha, 0, len - 1);

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'grayscale': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, lineOut} = requirements;

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

    'invert-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, includeAlpha, lineOut} = requirements;

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

        const {opacity, red, green, blue, alpha, lineOut} = requirements;

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

    'matrix': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, includeRed, includeGreen, includeBlue, includeAlpha, width, height, offsetX, offsetY, weights, lineOut} = requirements;

        // if (grid == null) {

            if (width == null || width < 1) width = 3;
            if (height == null || height < 1) height = 3;
            if (offsetX == null || offsetX < 0) offsetX = 1;
            if (offsetY == null || offsetY < 0) offsetY = 1;

            grid = buildMatrixGrid(width, height, offsetX, offsetY, input.a);
        // }

        if (weights == null) {

            weights = [].fill(0, 0, (width * height) - 1);
            weights[Math.floor(weights.length / 2) + 1] = 1;
        }

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

    'modulate-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, red, green, blue, alpha, saturation, lineOut} = requirements;

        if (red == null) red = 1;
        if (green == null) green = 1;
        if (blue == null) blue = 1;
        if (alpha == null) alpha = 1;

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

    'offset': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        const {opacity, offsetX, offsetY, lineOut} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        let grid = buildImageGrid(),
            gWidth = grid[0].length,
            gHeight = grid.length,
            dx, dy, inCell, outCell;

        for (let y = 0; y < gHeight; y++) {
            for (let x = 0; x < gWidth; x++) {

                inCell = grid[y][x];

                if (inA[inCell]) {

                    dx = x + offsetX;
                    dy = y + offsetY;

                    if (dx >= 0 && dx < gWidth && dy >= 0 && dy < gHeight) {

                        outCell = grid[dy][dx];

                        outR[outCell] = inR[inCell];
                        outG[outCell] = inG[inCell];
                        outB[outCell] = inB[inCell];
                        outA[outCell] = inA[inCell];
                    }
                }
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

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

        const tiles = buildImageTileSets(tileWidth, tileHeight, offsetX, offsetY);

        // Do filter work
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

    'set-channel-to-level': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, includeAlpha, level, lineOut} = requirements;

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

    'step-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length,
            floor = Math.floor;

        const {opacity, red, green, blue, lineOut} = requirements;

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

    'threshold': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, low, high, level, lineOut} = requirements;

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

    'tint-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, redInRed, redInGreen, redInBlue, greenInRed, greenInGreen, greenInBlue, blueInRed, blueInGreen, blueInBlue, lineOut} = requirements;

        if (redInRed == null) redInRed = 1;
        if (redInGreen == null) redInGreen = 0;
        if (redInBlue == null) redInBlue = 0;
        if (greenInRed == null) greenInRed = 0;
        if (greenInGreen == null) greenInGreen = 1;
        if (greenInBlue == null) greenInBlue = 0;
        if (blueInRed == null) blueInRed = 0;
        if (blueInGreen == null) blueInGreen = 0;
        if (blueInBlue == null) blueInBlue = 1;

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

    'user-defined-legacy': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        const {opacity, lineOut} = requirements;

        copyOver(input, output);

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },
};
