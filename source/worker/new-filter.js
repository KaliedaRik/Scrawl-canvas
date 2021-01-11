// # Filter worker
// A long-running web worker which, when not in use, gets stored in the filter pool defined in the [filter factory](../factory/filter.html)
//
// TODO: documentation


// #### Demos:
// + TODO: list demos with links


// #### Imports
// None used


let packet, packetImageObject, imageData, packetFiltersArray;

let source,
    work,
    interim,
    actions,
    grid,
    blurGrid;

const createResultObject = function (len) {

    return {
        r: new Uint8ClampedArray(len),
        g: new Uint8ClampedArray(len),
        b: new Uint8ClampedArray(len),
        a: new Uint8ClampedArray(len),
    };
};

const unknit = function() {

    imageData = packetImageObject.data;

    let len = Math.floor(imageData.length / 4);


    source = createResultObject(len);

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
    packetImageObject = packet.image;
    packetFiltersArray = packet.filters;

    // console.log(packet.image.data[0], packet.image.data[1], packet.image.data[2], packet.image.data[3])

    if (packetImageObject) {

        interim = {};
        actions = [];

        packetFiltersArray.forEach(f => {

            if (!f.actions.length && thePreprocessObject[f.method]) thePreprocessObject[f.method](f);
            actions.push(...f.actions);
        });

        if (actions.length) {

            unknit();

            actions.forEach(a => {

                if (theBigActionsObject[a.action]) theBigActionsObject[a.action](a);
            });

            knit();
        }
    }

    postMessage(packet);
};

onerror = function (e) {

    console.log('error' + e.message);
    postMessage(packet);
};

const buildImageGrid = function () {

    if (packetImageObject) {

        let grid = [],
            counter = 0;

        for (let y = 0, yz = packetImageObject.height; y < yz; y++) {

            let row = [];

            for (let x = 0, xz = packetImageObject.width; x < xz; x++) {
                
                row.push(counter);
                counter++;
            }
            grid.push(row);
        }
        return grid;
    }
    return false;
};

// let tiles = buildAlphaTileSets(tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY, areaAlphaLevels);


const buildAlphaTileSets = function (tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY, areaAlphaLevels) {

    if (packetImageObject) {

        let iWidth = packetImageObject.width,
            iHeight = packetImageObject.height;

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

const buildImageTileSets = function (tileWidth, tileHeight, offsetX, offsetY) {

    if (packetImageObject) {

        let iWidth = packetImageObject.width,
            iHeight = packetImageObject.height;

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

                    if (x >= 0 && x < iWidth) {

                                hold.push((y * iWidth) + x);
                            }
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

const buildMatrixGrid = function (mWidth, mHeight, mX, mY, alpha) {

    if (mWidth == null || mWidth < 1) mWidth = 1;
    if (mHeight == null || mHeight < 1) mHeight = 1;

    if (mX == null || mX < 0) mX = 0;
    else if (mX >= mWidth) mX = mWidth - 1;

    if (mY == null || mY < 0) mY = 0;
    else if (mY >= mHeight) mY = mHeight - 1;

    let iWidth = packetImageObject.width,
        iHeight = packetImageObject.height,
        dataLength = imageData.length,
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

    if (interim[name]) throw new Error('Duplicate name encountered when trying to cache output from', caller);
    interim[name] = obj;
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

const getInputAndOutputObjects = function (requirements) {

    let input = work;

    if (requirements.in) {

        if (requirements.in == 'source') input = source;
        else if (interim[requirements.in]) input = interim[requirements.in];
    }
    let output = createResultObject(input.r.length);

    return [input, output];
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

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue, out} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? inA[i] : ((excludeRed) ? 0 : inR[i]);
            outR[i] = (includeGreen) ? inA[i] : ((excludeGreen) ? 0 : inG[i]);
            outR[i] = (includeBlue) ? inA[i] : ((excludeBlue) ? 0 : inB[i]);
        }
        outA.fill(255, 0, outA.length - 1);

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'area-alpha': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        let {opacity, tileWidth, tileHeight, offsetX, offsetY, gutterWidth, gutterHeight, areaAlphaLevels, out} = requirements;

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

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'average-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue, out} = requirements;

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
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'blur': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        let {opacity, radius, passes, processVertical, processHorizontal, includeRed, includeGreen, includeBlue, includeAlpha, out} = requirements;

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

        const hold = createResultObject(len);
        const {r:holdR, g:holdG, b:holdB, a:holdA} = hold;

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

            copyOver(input, hold);

            for (let pass = 0; pass < passes; pass++) {

                if (processHorizontal) {

                    for (let k = 0; k < len; k++) {
                        outA[k] = getValue(includeAlpha, horizontalBlurGrid, k, holdA);

                        if (outA[k]) {
                            outR[k] = getValue(includeRed, horizontalBlurGrid, k, holdR);
                            outG[k] = getValue(includeGreen, horizontalBlurGrid, k, holdG);
                            outB[k] = getValue(includeBlue, horizontalBlurGrid, k, holdB);
                        }
                    }
                    copyOver(output, hold);
                }

                if (processVertical) {

                    for (let k = 0; k < len; k++) {
                        outA[k] = getValue(includeAlpha, verticalBlurGrid, k, holdA);

                        if (outA[k]) {
                            outR[k] = getValue(includeRed, verticalBlurGrid, k, holdR);
                            outG[k] = getValue(includeGreen, verticalBlurGrid, k, holdG);
                            outB[k] = getValue(includeBlue, verticalBlurGrid, k, holdB);
                        }
                    }
                    copyOver(output, hold);
                }
            }
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'brightness': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, level, out} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? inR[i] * level : inR[i];
            outG[i] = (includeGreen) ? inG[i] * level : inG[i];
            outB[i] = (includeBlue) ? inB[i] * level : inB[i];
            outA[i] = inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'channels-to-alpha': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, out} = requirements;

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
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'chroma': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, ranges, out} = requirements;

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

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'colors-to-alpha': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, red, green, blue, opaqueAt, transparentAt, out} = requirements;

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

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'flood': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length,
            floor = Math.floor;

        const {opacity, red, green, blue, alpha, out} = requirements;

        if (red == null) red = 0;
        if (green == null) green = 0;
        if (blue == null) blue = 0;
        if (alpha == null) alpha = 255;

        const {r:outR, g:outG, b:outB, a:outA} = output;

        outR.fill(red, 0, len - 1);
        outG.fill(green, 0, len - 1);
        outB.fill(blue, 0, len - 1);
        outA.fill(alpha, 0, len - 1);

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'grayscale': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, out} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            let gray = Math.floor((0.2126 * inR[i]) + (0.7152 * inG[i]) + (0.0722 * inB[i]));

            outR[i] = gray;
            outG[i] = gray;
            outB[i] = gray;
            outA[i] = inA[i];
        }

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'invert-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, includeAlpha, out} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? 255 - inR[i] : inR[i];
            outG[i] = (includeGreen) ? 255 - inG[i] : inG[i];
            outB[i] = (includeBlue) ? 255 - inB[i] : inB[i];
            outA[i] = (includeAlpha) ? 255 - inA[i] : inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
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

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, red, green, blue, alpha, out} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {
            outR[i] = getValue(inR[i], red);
            outG[i] = getValue(inG[i], green);
            outB[i] = getValue(inB[i], blue);
            outA[i] = getValue(inA[i], alpha);
        }

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'matrix': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        let {opacity, includeRed, includeGreen, includeBlue, includeAlpha, mWidth, mHeight, mX, mY, weights, grid, out} = requirements;

        if (grid == null) {

            if (mWidth == null) requirements.mWidth = 3;
            if (mHeight == null) requirements.mHeight = 3;
            if (mX == null) requirements.mX = 1;
            if (mY == null) requirements.mY = 1;

            mWidth = requirements.mWidth;
            mHeight = requirements.mHeight;
            mX = requirements.mX;
            mY = requirements.mY;

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
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'modulate-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, red, green, blue, alpha, level, out} = requirements;

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
        if (out) processResults(output, work, 1 - opacity);
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

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        let {opacity, tileWidth, tileHeight, offsetX, offsetY, tiles, includeRed, includeGreen, includeBlue, includeAlpha, out} = requirements;

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

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'saturation': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, level, out} = requirements;

        const {r:inR, g:inG, b:inB, a:inA} = input;
        const {r:outR, g:outG, b:outB, a:outA} = output;

        for (let i = 0; i < len; i++) {
            outR[i] = (includeRed) ? 127 + ((inR[i] - 127) * level) : inR[i];
            outG[i] = (includeGreen) ? 127 + ((inG[i] - 127) * level) : inG[i];
            outB[i] = (includeBlue) ? 127 + ((inB[i] - 127) * level) : inB[i];
            outA[i] = inA[i];
        }

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'set-channel-to-value': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length,
            isRed = false,
            isGreen = false,
            isBlue = false,
            isAlpha = false;

        const {opacity, channel, value, out} = requirements;

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
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'step-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length,
            floor = Math.floor;

        const {opacity, red, green, blue, level, out} = requirements;

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

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'threshold': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, low, high, level, out} = requirements;

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

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'tint-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, redInRed, redInGreen, redInBlue, greenInRed, greenInGreen, greenInBlue, blueInRed, blueInGreen, blueInBlue, out} = requirements;

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

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'user-defined-legacy': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        const {opacity, out} = requirements;

        copyOver(input, output);

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },
};


const thePreprocessObject = {

    areaAlpha: function (f) {
        f.actions = [{
            action: 'area-alpha',
            opacity: (f.opacity != null) ? f.opacity : 1,
            tileWidth: (f.tileWidth != null) ? f.tileWidth : 1,
            tileHeight: (f.tileHeight != null) ? f.tileHeight : 1,
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            gutterWidth: (f.gutterWidth != null) ? f.gutterWidth : 1,
            gutterHeight: (f.gutterHeight != null) ? f.gutterHeight : 1,
            areaAlphaLevels: (f.areaAlphaLevels != null) ? f.areaAlphaLevels : [255,0,0,0],
        }];
    },

    blue: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeRed: true,
            excludeGreen: true,
        }];
    },

    blur: function (f) {

        f.actions = [{
            action: 'blur',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            processHorizontal: (f.processHorizontal != null) ? f.processHorizontal : true,
            processVertical: (f.processVertical != null) ? f.processVertical : true,
            radius: (f.radius != null) ? f.radius : 1,
            passes: (f.passes != null) ? f.passes : 1,
        }];
    },

    brightness: function (f) {
        f.actions = [{
            action: 'brightness',
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
        }];
    },

    channelLevels: function (f) {
        f.actions = [{
            action: 'lock-channels-to-levels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : [0],
            green: (f.green != null) ? f.green : [0],
            blue: (f.blue != null) ? f.blue : [0],
            alpha: (f.alpha != null) ? f.alpha : [255],
        }];
    },

    channels: function (f) {
        f.actions = [{
            action: 'modulate-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 1,
            green: (f.green != null) ? f.green : 1,
            blue: (f.blue != null) ? f.blue : 1,
            alpha: (f.alpha != null) ? f.alpha : 1,
        }];
    },

    channelstep: function (f) {
        f.actions = [{
            action: 'step-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 1,
            green: (f.green != null) ? f.green : 1,
            blue: (f.blue != null) ? f.blue : 1,
        }];
    },

    chroma: function (f) {
        f.actions = [{
            action: 'chroma',
            opacity: (f.opacity != null) ? f.opacity : 1,
            ranges: (f.ranges != null) ? f.ranges : [],
        }];
    },

    chromakey: function (f) {
        f.actions = [{
            action: 'colors-to-alpha',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 0,
            green: (f.green != null) ? f.green : 255,
            blue: (f.blue != null) ? f.blue : 0,
            transparentAt: (f.transparentAt != null) ? f.transparentAt : 0,
            opaqueAt: (f.opaqueAt != null) ? f.opaqueAt : 1,
        }];
    },

    cyan: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeGreen: true,
            includeBlue: true,
            excludeRed: true,
        }];
    },

    flood: function (f) {
        f.actions = [{
            action: 'flood',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 0,
            green: (f.green != null) ? f.green : 0,
            blue: (f.blue != null) ? f.blue : 0,
            alpha: (f.alpha != null) ? f.alpha : 255,
        }];
    },

    gray: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

    grayscale: function (f) {
        f.actions = [{
            action: 'grayscale',
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

    green: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeRed: true,
            excludeBlue: true,
        }];
    },

    invert: function (f) {
        f.actions = [{
            action: 'invert-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

    magenta: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeBlue: true,
            excludeGreen: true,
        }];
    },

    matrix: function (f) {
        f.actions = [{
            action: 'matrix',
            mWidth: 3,
            mHeight: 3,
            mX: 1,
            mY: 1,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            weights: (f.weights != null) ? f.weights : [0,0,0,0,1,0,0,0,0],
        }];
    },

    matrix5: function (f) {
        f.actions = [{
            action: 'matrix',
            mWidth: 5,
            mHeight: 5,
            mX: 2,
            mY: 2,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            weights: (f.weights != null) ? f.weights : [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
        }];
    },

    notblue: function (f) {
        f.actions = [{
            action: 'set-channel-to-value',
            opacity: (f.opacity != null) ? f.opacity : 1,
            channel: 'blue',
            value: 0,
        }];
    },

    notgreen: function (f) {
        f.actions = [{
            action: 'set-channel-to-value',
            opacity: (f.opacity != null) ? f.opacity : 1,
            channel: 'green',
            value: 0,
        }];
    },

    notred: function (f) {
        f.actions = [{
            action: 'set-channel-to-value',
            opacity: (f.opacity != null) ? f.opacity : 1,
            channel: 'red',
            value: 0,
        }];
    },

    pixelate: function (f) {
        f.actions = [{
            action: 'pixelate',
            opacity: (f.opacity != null) ? f.opacity : 1,
            tileWidth: (f.tileWidth != null) ? f.tileWidth : 1,
            tileHeight: (f.tileHeight != null) ? f.tileHeight : 1,
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
        }];
    },

    red: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeGreen: true,
            excludeBlue: true,
        }];
    },

    saturation: function (f) {
        f.actions = [{
            action: 'saturation',
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
        }];
    },

    sepia: function (f) {
        f.actions = [{
            action: 'tint-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            redInRed: 0.393,
            redInGreen: 0.349,
            redInBlue: 0.272,
            greenInRed: 0.769,
            greenInGreen: 0.686,
            greenInBlue: 0.534,
            blueInRed: 0.189,
            blueInGreen: 0.168,
            blueInBlue: 0.131,
        }];
    },

    threshold: function (f) {

        let lowRed = (f.lowRed != null) ? f.lowRed : 0,
            lowGreen = (f.lowGreen != null) ? f.lowGreen : 0,
            lowBlue = (f.lowBlue != null) ? f.lowBlue : 0,
            highRed = (f.highRed != null) ? f.highRed : 255,
            highGreen = (f.highGreen != null) ? f.highGreen : 255,
            highBlue = (f.highBlue != null) ? f.highBlue : 255;

        f.actions = [{
            action: 'threshold',
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 128,
            low: [lowRed, lowGreen, lowBlue],
            high: [highRed, highGreen, highBlue],
        }];
    },

    tint: function (f) {
        f.actions = [{
            action: 'tint-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            redInRed: (f.redInRed != null) ? f.redInRed : 1,
            redInGreen: (f.redInGreen != null) ? f.redInGreen : 0,
            redInBlue: (f.redInBlue != null) ? f.redInBlue : 0,
            greenInRed: (f.greenInRed != null) ? f.greenInRed : 0,
            greenInGreen: (f.greenInGreen != null) ? f.greenInGreen : 1,
            greenInBlue: (f.greenInBlue != null) ? f.greenInBlue : 0,
            blueInRed: (f.blueInRed != null) ? f.blueInRed : 0,
            blueInGreen: (f.blueInGreen != null) ? f.blueInGreen : 0,
            blueInBlue: (f.blueInBlue != null) ? f.blueInBlue : 1,
        }];
    },

    userDefined: function (f) {
        f.actions = [{
            action: 'user-defined-legacy',
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

    yellow: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            excludeBlue: true,
        }];
    },
}
