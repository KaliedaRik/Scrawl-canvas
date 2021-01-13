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

    // console.log(packet.image.data[0], packet.image.data[1], packet.image.data[2], packet.image.data[3])

    // if (packetImageObject) {

        cache = {};
        actions = [];

        cache.source = packet.image;

        packetFiltersArray.forEach(f => actions.push(...f.actions));

        if (actions.length) {

            unknit(cache.source);
            actions.forEach(a => theBigActionsObject[a.action] && theBigActionsObject[a.action](a));
            knit();
        }
    // }
    postMessage(packet);
};

onerror = function (e) {

    console.log('error' + e.message);
    postMessage(packet);
};

const buildImageGrid = function (data) {

    if (!data) data = cache.source;

    if (data && data.width && data.height) {

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
        return tiles;
    }
    return false;
};

const buildHorizontalBlur = function (grid, radius, alpha) {

    if (grid && alpha) {

        if (!radius || !radius.toFixed || isNaN(radius)) radius = 0;

        let gridHeight = grid.length,
            gridWidth = grid[0].length;

        let horizontalBlur = [],
            cell;

        for (let y = 0; y < gridHeight; y++) {

            for (let x = 0; x < gridWidth; x++) {

                let cellsToProcess = [];

                for (let c = x - radius, cz = x + radius + 1; c < cz; c++) {

                    if (c >= 0 && c < gridWidth) {

                        cell = grid[y][c];
                        if (alpha[cell]) cellsToProcess.push(cell);
                    }
                }
                horizontalBlur[(y * gridHeight) + x] = cellsToProcess;
            }
        }
        return horizontalBlur;
    }
    return false;
};

const buildVerticalBlur = function (grid, radius, alpha) {

    if (grid && alpha) {

        if (!radius || !radius.toFixed || isNaN(radius)) radius = 0;

        let gridHeight = grid.length,
            gridWidth = grid[0].length;

        let verticalBlur = [],
            cell;

        for (let x = 0; x < gridWidth; x++) {

            for (let y = 0; y < gridHeight; y++) {

                let cellsToProcess = [];

                for (let c = y - radius, cz = y + radius + 1; c < cz; c++) {

                    if (c >= 0 && c < gridHeight) {

                        cell = grid[c][x];
                        if (alpha[cell]) cellsToProcess.push(cell);
                    }
                }
                verticalBlur[(y * gridHeight) + x] = cellsToProcess;
            }
        }
        return verticalBlur;
    }
    return false;
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
        iHeight = data.height,
        dataLength = data.data.length,
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

            if (alpha[pos]) {

                // process template
                for (i = 0, iz = cellsTemplate.length; i < iz; i++) {

                    let val = pos + cellsTemplate[i];

                    if (val < 0) val += dataLength;
                    else if (val >= dataLength) val -= dataLength;

                    cell.push(val);
                }
            }
            grid.push(cell);
        }
    }
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
            outR[i] = (includeGreen) ? inA[i] : ((excludeGreen) ? 0 : inG[i]);
            outR[i] = (includeBlue) ? inA[i] : ((excludeBlue) ? 0 : inB[i]);
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

    'blur': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        let {opacity, radius, passes, processVertical, processHorizontal, includeRed, includeGreen, includeBlue, includeAlpha, lineOut} = requirements;

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

        const getValue = function (flag, gridStore, step, holdChannel) {

            if (flag) {

                let h = gridStore[step],
                    l = h.length,
                    total = 0;

                for (let t = 0; t < l; t++) {
                    total += holdChannel[h[t]];
                }
                return total / l;
            }
            return holdChannel[step];
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

                            outR[k] = getValue(includeRed, horizontalBlurGrid, k, holdR);
                            outG[k] = getValue(includeGreen, horizontalBlurGrid, k, holdG);
                            outB[k] = getValue(includeBlue, horizontalBlurGrid, k, holdB);
                            outA[k] = getValue(includeAlpha, horizontalBlurGrid, k, holdA);
                        }
                    }
                    if (processVertical || pass < passes - 1) copyOver(output, hold);
                }

                if (processVertical) {

                    for (let k = 0; k < len; k++) {

                        if (holdA[k]) {

                            outR[k] = getValue(includeRed, verticalBlurGrid, k, holdR);
                            outG[k] = getValue(includeGreen, verticalBlurGrid, k, holdG);
                            outB[k] = getValue(includeBlue, verticalBlurGrid, k, holdB);
                            outA[k] = getValue(includeAlpha, verticalBlurGrid, k, holdA);
                        }
                    }
                    if (pass < passes - 1) copyOver(output, hold);
                }
            }
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'brightness': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, level, lineOut} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? inR[i] * level : inR[i];
            outG[i] = (includeGreen) ? inG[i] * level : inG[i];
            outB[i] = (includeBlue) ? inB[i] * level : inB[i];
            outA[i] = inA[i];
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

        let len = input.r.length,
            i;

        const {opacity, compose, offsetX, offsetY, lineOut} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;
        const {r:mixR, g:mixG, b:mixB, a:mixA} = mix;

        // let iWidth = inR.length,
        //     iHeight = input.length,
        //     mWidth = mixR.length,
        //     mHeight = mix.length;
        let [iWidth, iHeight, oWidth, oHeight, mWidth, mHeight] = getInputAndOutputDimensions(requirements);

        const copyPixelToOutput = function (iX, iY, mX, mY, oX, oY) {};

        switch (compose) {

            case 'source-only' :
                copyOver(input, output);
                break;

            case 'source-atop' :
                break;

            case 'source-in' :
                break;

            case 'source-out' :
                break;

            case 'destination-only' :
                copyOver(mix, output);
                break;

            case 'destination-atop' :
                break;

            case 'destination-over' :
                break;

            case 'destination-in' :
                break;

            case 'destination-out' :
                break;

            case 'clear' :
                break;

            case 'xor' :
                break;

            case 'source-over' :
                break;

            case 'source-over' :
                break;

            case 'source-over' :
                break;

            case 'source-over' :
            default:
                break;
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

        let {opacity, includeRed, includeGreen, includeBlue, includeAlpha, mWidth, mHeight, mX, mY, weights, grid, lineOut} = requirements;

        if (grid == null) {

            if (mWidth == null || mWidth < 1) mWidth = 3;
            if (mHeight == null || mHeight < 1) mHeight = 3;
            if (mX == null || mX < 0) mX = 1;
            if (mY == null || mY < 0) mY = 1;

            requirements.grid = buildMatrixGrid(mWidth, mHeight, mX, mY, input.a);
            grid = requirements.grid;
        }

        if (weights == null) {

            requirements.weights = [].fill(0, 0, (mWidth * mHeight) - 1);
            weights = requirements.weights;
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

        const {opacity, red, green, blue, alpha, level, lineOut} = requirements;

        if (red == null) red = 1;
        if (green == null) green = 1;
        if (blue == null) blue = 1;
        if (alpha == null) alpha = 1;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {
            outR[i] = inR[i] * red;
            outG[i] = inG[i] * green;
            outB[i] = inB[i] * blue;
            outA[i] = inA[i] * alpha;
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

        let {opacity, tileWidth, tileHeight, offsetX, offsetY, tiles, includeRed, includeGreen, includeBlue, includeAlpha, lineOut} = requirements;

        if (!tiles) {

            requirements.tiles = buildImageTileSets(tileWidth, tileHeight, offsetX, offsetY);
            tiles = requirements.tiles;
        }

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

    'saturation': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, level, lineOut} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {
            outR[i] = (includeRed) ? 127 + ((inR[i] - 127) * level) : inR[i];
            outG[i] = (includeGreen) ? 127 + ((inG[i] - 127) * level) : inG[i];
            outB[i] = (includeBlue) ? 127 + ((inB[i] - 127) * level) : inB[i];
            outA[i] = inA[i];
        }

        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'set-channel-to-value': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length,
            isRed = false,
            isGreen = false,
            isBlue = false,
            isAlpha = false;

        const {opacity, channel, value, lineOut} = requirements;

        switch (channel) {

            case 'red' :
                isRed = true;
                break;

            case 'green' :
                isGreen = true;
                break;

            case 'blue' :
                isBlue = true;
                break;

            default :
                isAlpha = true;
        }

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            outR[i] = (isRed) ? value : inR[i];
            outG[i] = (isGreen) ? value : inG[i];
            outB[i] = (isBlue) ? value : inB[i];
            outA[i] = (isAlpha) ? value : inA[i];
        }
        if (lineOut) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'step-channels': function (requirements) {

        let [input, output] = getInputAndOutputChannels(requirements);

        let len = input.r.length,
            floor = Math.floor;

        const {opacity, red, green, blue, level, lineOut} = requirements;

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
