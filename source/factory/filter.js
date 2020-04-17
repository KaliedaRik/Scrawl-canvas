// # Filter factory
// Filters take in an image representation of an [entity](../mixin/entity.html), [Group](./group.html) of entitys or a [Cell](./cell.html) display and, by manipulating the image's data, return an updated image which replaces those entitys or cell in the final output display.
//
// Scrawl-canvas defines its filters in __Filter objects__, detailed in this module. The functionality to make use of these objects is coded up in the [filter mixin](../mixin/filter.html), which is used by the Cell, Group and all entity factories.
//
// Scrawl-canvas uses a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) to generate filter outputs - defined in the [filter web worker](../worker/filter.html). It supports a number of common filter algorithms:
// + `grayscale` - desaturates the image
// + `sepia` - desaturates the image, then 'antiques' it by adding back some yellow tone
// + `invert` - turns white into black, and similar across the spectrum
// + `red` - suppresses the image's green and blue channels
// + `green` - suppresses the image's red and blue channels
// + `blue` - suppresses the image's red and green channels
// + `notred` - suppresses the image's red channel
// + `notgreen` - suppresses the image's green channel
// + `notblue` - suppresses the image's blue channel
// + `cyan` - averages the image's blue and green channels, and suppresses the red channel
// + `magenta` - averages the image's red and blue channels, and suppresses the green channel
// + `yellow` - averages the image's red and green channels, and suppresses the blue channel
// + `brightness` - multiplies the red, green and blue channel values by a value supplied in the `filter.level` attribute
// + `saturation` - multiplies the red, green and blue channel values by a value supplied in the `filter.level` attribute, then normalizes the result
// + `threshold` - desaturates each pixel then tests it against `filter.level` value; those pixels below the level are set to the `filter.lowRGB` values while the rest are set to the `filter.highRGB` values
// + `channels` - multiply each pixel's channel values by the values set in the `filter.RGB` attributes
// + `channelstep` - divide, floor, and then multiply each pixel's channel values by the values set in the `filter.RGB` attributes
// + `tint` - a more fine-grained form of the channels filter
// + `chroma` - (the green-screen effect) - will evaluate each pixel against a range array; pixels that fall within the range are set to transparent
// + `pixelate` - create tiles - whose dimensions and positions are determined by values set in the filter `tileWidth`, `tileHeight`, `offsetX` and `offsetY` attributes - across the image and then average the pixels in each tile to a single color
// + `blur` - creates a blurred image. Note: can be slow across larger images! The degree of the blur - which does not follow conventional algorithms such as gaussian - is determined by the filter attribute values for `radius` (number), `passes` (number) and `shrink` (boolean)
// + `matrix` - apply a 3x3 matrix transform to each of the image's pixels
// + `matrix5` - apply a 5x5 matrix transform to each of the image's pixels
// 
// Scrawl-canvas can also use __user-defined filters__.
//
// Filters use the __base__ mixin, thus they come equipped with packet functionality, alongside clone and kill functions.
//
// Note that [CSS-mediated filters](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) - `url()`, `blur()`, `brightness()`, `contrast()`, `drop-shadow()`, `grayscale()`, `hue-rotate()`, `invert()`, `opacity()`, `saturate()`, `sepia()` - can also be applied to DOM elements wrapped into Scrawl-canvas objects (Stack, Element, Canvas) in the normal way. Browsers will apply CSS filters as the final operation in their paint routines.
//
// TODO: we've had to include all the code from the [filter mixin](../mixin/filter.html) into this file (without comments) because tools like [CreateReactApp](https://reactjs.org/docs/create-a-new-react-app.html#create-react-app) - which uses [Webpack](https://webpack.js.org/) as its bundler of choice - breaks when we `yarn add scrawl-canvas` to a project.
// + The root of the issue is that [Babel](https://babeljs.io/) currently breaks when it encounters the `import.meta` attribute.
// + Babel do supply a plugin which is supposed to address this issue: [babel-plugin-syntax-import-meta](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-import-meta). But trying to add this to a Webpack configuration - particularly as implemented by create-react-app - is, at best, a nightmare.


// #### Demos:
// + [Canvas-007](../../demo/canvas-007.html) - Apply filters at the entity, group and cell level
// + [Component-004](../../demo/component-004.html) - Scrawl-canvas packets; save and load a range of different entitys


// #### Imports
import { constructors, cell, group, entity } from '../core/library.js';
import { mergeOver, removeItem } from '../core/utilities.js';

import baseMix from '../mixin/base.js';


// #### Filter constructor
const Filter = function (items = {}) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);
    this.set(items);
    return this;
};


// #### Filter prototype
let P = Filter.prototype = Object.create(Object.prototype);
P.type = 'Filter';
P.lib = 'filter';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Filter attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {


// All filters need to set out their __method__. For preset methods, a method string (eg 'grayscale', 'sepia') is sufficient. Bespoke methods require a function
    method: '',


// The following methods require no further attributes: 
//
//     `grayscale`, `sepia`, `invert`
//     `red`, `green`, `blue`
//     `notred`, `notgreen`, `notblue`
//     `cyan`, `magenta`, `yellow`


// The following methods require the __level__ attribute:
//
//     `brightness`, `saturation`, `threshold`
    level: 0,



// The `threshhold` filter will default to setting (desaturated) pixels below a given level (0 - 255) to black, and those above the level to white. These colours can be changed by using the __low__ and __high__ channel attributes
    lowRed: 0,
    lowGreen: 0,
    lowBlue: 0,
    highRed: 255,
    highGreen: 255,
    highBlue: 255,


// The `channels` and `channelstep` methods make use of the __red__, __green__ and __blue__ attributes
    red: 0,
    green: 0,
    blue: 0,


// The `tint` method uses nine attributes
    redInRed: 0,
    redInGreen: 0,
    redInBlue: 0,
    greenInRed: 0,
    greenInGreen: 0,
    greenInBlue: 0,
    blueInRed: 0,
    blueInGreen: 0,
    blueInBlue: 0,


// The `pixelate` method requires tile dimensions and, optionally, offset coordinates which should not exceed the tile dimensions
    offsetX: 0,
    offsetY: 0,
    tileWidth: 1,
    tileHeight: 1,


// The `blur` method uses the following attributes:
// + the __radius__ of the blur effect, in pixels
// + the __passes__ attribute (1+) determines how many times the blur filter will iterate
// + the __shrinkingRadius__ flag reduces the radius by approx 70% on each successive pass
// + when __includeAlpha__ flag is true, filter will include the alpha channel - note this will make the edges of the entity translucent
    radius: 1,
    passes: 1,
    shrinkingRadius: false,
    includeAlpha: false,


// The `matrix` method requires a weights attribute - an array of 9 numbers in the following format:
//
//     weights: [
//         topLeftWeight,
//         topCenterWeight,
//         topRightWeight,
//         middleLeftWeight,
//         homePixelWeight,
//         middleRightWeight,
//         bottomLeftWeight,
//         bottomCenterWeight,
//         bottomRightWeight,
//     ]
//
// ... where the top row is the row above the home pixel, etc
//
// The method also makes use of the __includeAlpha__ attribute.

// The `matrix5` method is the same as the matrix method except that its weights array should contain 25 elements, to cover all the positions (from top-left corner) in a 5x5 grid
    weights: null,


// The __ranges__ attribute - used by the `chroma` method - needs to be an array of arrays with the following format:
//
//     [[minRed, minGreen, minBlue, maxRed, maxGreen, maxBlue], etc]
//
// ... multiple ranges can be defined - for instance to key out the lightest and darkest hues:
//
//     ranges: [[0, 0, 0, 80, 80, 80], [180, 180, 180, 255, 255, 255]]
    ranges: null,


// The `user-defined` filter should be set as a String value of the function's contents (the bits between the { curly braces }) on the __userDefined__ attribute. The function can take no arguments, and can only use variables defined above (or the __udVariableN__ attributes below). The function can also use __self__ variables supplied by the web worker - see the worker/filter.js for more information
    userDefined: '',
    udVariable0: '',
    udVariable1: '',
    udVariable2: '',
    udVariable3: '',
    udVariable4: '',
    udVariable5: '',
    udVariable6: '',
    udVariable7: '',
    udVariable8: '',
    udVariable9: '',
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// Overwrites ./mixin/base.js
P.kill = function () {

    let myname = this.name;

    // Remove filter from all entity filters attribute
    Object.entries(entity).forEach(([name, ent]) => {

        let f = ent.filters;
        if (f && f.indexOf(myname) >= 0) removeItem(f, myname);
    });
    
    // Remove filter from all group filters attribute
    Object.entries(group).forEach(([name, grp]) => {

        let f = grp.filters;
        if (f && f.indexOf(myname) >= 0) removeItem(f, myname);
    });
    
    // Remove filter from all cell filters attribute
    Object.entries(cell).forEach(([name, c]) => {

        let f = c.filters;
        if (f && f.indexOf(myname) >= 0) removeItem(f, myname);
    });
    
    // Remove filter from the Scrawl-canvas library
    this.deregister();
    
    return this;
};


// #### Get, Set, deltaSet
// No additional functionality required


// #### Prototype functions
// No additional prototype functions defined


// #### Filter webworker pool
// Because starting a web worker is an expensive operation, and a number of different filters may be required to render displays across a number of different &lt;canvas> elements in a web page, Scrawl-canvas operates a pool of web workers to perform work as-and-when required.
const filterPool = [];

// `Exported function` __requestFilterWorker__
const requestFilterWorker = function () {

    if (!filterPool.length) filterPool.push(buildFilterWorker());

    return filterPool.shift();
};

// `Exported function` __releaseFilterWorker__ - to avoid memory leaks, ___all requested filter workers MUST be released back to the filter pool as soon as their work has completed___.
const releaseFilterWorker = function (f) {

    filterPool.push(f);
};

// __buildFilterWorker__ - create a new filter web worker
const buildFilterWorker = function () {

    // #### The correct code
    // This code has been commented out because of the Babel issue
    // + To use the worker file (as is right and proper!), uncomment the following 4 code lines and comment out all the `filterCode` and `filterUrl` code at the end of this file.

    // let path = import.meta.url.slice(0, -('factory/filter.js'.length))

    // let filterUrl = (window.scrawlEnvironmentOffscreenCanvasSupported) ? 
    //     `${path}worker/filter.js` : 
    //     `${path}worker/filter.js`;

    // Sept 2019 - chrome does not yet support module workers
    // ```
    // return new Worker(filterUrl, {type: 'module'});
    // ```
    return new Worker(filterUrl);
};


// `Exported function` __actionFilterWorker__ - send a task to the filter web worker, and retrieve the resulting image. This function returns a Promise.
const actionFilterWorker = function (worker, items) {

    return new Promise((resolve, reject) => {

        worker.onmessage = (e) => {

            if (e && e.data && e.data.image) resolve(e.data.image);
            else resolve(false);
        };

        worker.onerror = (e) => {

            console.log('error', e.lineno, e.message);
            resolve(false);
        };

        worker.postMessage(items);
    });
};


// #### Factory
// ```
// scrawl.makeFilter({
//
//     name: 'my-grayscale-filter',
//     method: 'grayscale',
//
// }).clone({
//
//     name: 'my-sepia-filter',
//     method: 'sepia',
// });
//
// scrawl.makeFilter({
//
//     name: 'my-chroma-filter',
//     method: 'chroma',
//     ranges: [[0, 0, 0, 80, 80, 80], [180, 180, 180, 255, 255, 255]],
// });
//
// scrawl.makeFilter({
//
//     name: 'venetian-blinds-filter',
//     method: 'userDefined',
//
//     level: 9,
//
//     userDefined: `
//         let i, iz, j, jz,
//             level = filter.level || 6,
//             halfLevel = level / 2,
//             yw, transparent, pos;
//
//         for (i = localY, iz = localY + localHeight; i < iz; i++) {
//
//             transparent = (i % level > halfLevel) ? true : false;
//
//             if (transparent) {
//
//                 yw = (i * iWidth) + 3;
//              
//                 for (j = localX, jz = localX + localWidth; j < jz; j ++) {
//
//                     pos = yw + (j * 4);
//                     data[pos] = 0;
//                 }
//             }
//         }`,
// });
// ```
const makeFilter = function (items) {

    return new Filter(items);
};

constructors.Filter = Filter;


// #### Temporary fix for Babel's current inability to support 
// To temporarily fix the Babel issue, we've copied all the code from the [filter mixin](../mixin/filter.html) into this file, which we return from this function as a String.
// + The String then gets used in the `filterUrl` const declaration (below) to create an object URL
// + We only want to perform this operation once because object urls are intense and ugly operations.
//
// __NOTE: any changes to filter code need to be replicated both in the mixin file, and in the String code here!__
const filterCode = function () {

    return `
if (!Uint8Array.prototype.slice) {
    Object.defineProperty(Uint8Array.prototype, 'slice', {
        value: function (begin, end) {
            return new Uint8Array(Array.prototype.slice.call(this, begin, end));
        }
    });
}

let packet;
let image;
let iWidth;
let data;
let cache;
let tiles;
let localX;
let localY;
let localWidth;
let localHeight;
let filters;
let filter;
let action;

onmessage = function (e) {

    let i, iz;

    packet = e.data;
    image = packet.image;
    iWidth = image.width * 4;
    data = image.data;
    filters = packet.filters;

    getCache();
    getLocal();

    for (i = 0, iz = filters.length; i < iz; i++) {

        filter = filters[i];

        if (filter.method === 'userDefined' && filter.userDefined) actions.userDefined = new Function(filter.userDefined);

        action = actions[filter.method];

        if (action) action();
    }

    postMessage(packet);
};

onerror = function (e) {

    console.log('error' + e.message);
    postMessage(packet);
};

const getCache = function () {

    let i, iz;

    if (Array.isArray(cache)) cache.length = 0;
    else cache = [];

    for (i = 0, iz = data.length; i < iz; i += 4) {

        if (data[i + 3]) cache.push(i);
    }
};

const getLocal = function () {

    let i, iz, w, h, minX, minY, maxX, maxY, x, y, val,
        floor = Math.floor;

    w = image.width;
    h = image.height;
    minX = w;
    minY = h;
    maxX = 0;
    maxY = 0;

    for (i = 0, iz = cache.length; i < iz; i++) {

        val = cache[i] / 4;
        y = floor(val / w);
        x = val % w;
        minX = (x < minX) ? x : minX;
        minY = (y < minY) ? y : minY;
        maxX = (x > maxX) ? x : maxX;
        maxY = (y > maxY) ? y : maxY;
    }

    localX = minX;
    localY = minY;
    localWidth = maxX - minX;
    localHeight = maxY - minY;
};

const getTiles = function () {

    let i, iz, j, jz, x, xz, y, yz, startX, startY, pos, 
        hold = [],
        tileWidth = filter.tileWidth || 1,
        tileHeight = filter.tileHeight || 1,
        offsetX = filter.offsetX,
        offsetY = filter.offsetY,
        w = image.width,
        h = image.height;

    if (Array.isArray(tiles)) tiles.length = 0;
    else tiles = [];

    offsetX = (offsetX >= tileWidth) ? tileWidth - 1 : offsetX;
    offsetY = (offsetY >= tileHeight) ? tileHeight - 1 : offsetY;

    startX = (offsetX) ? offsetX - tileWidth : 0;
    startY = (offsetY) ? offsetY - tileHeight : 0;

    for (j = startY, jz = h + tileHeight; j < jz; j += tileHeight) {

        for (i = startX, iz = w + tileWidth; i < iz; i += tileWidth) {

            hold.length = 0;
            
            for (y = j, yz = j + tileHeight; y < yz; y++) {

                if (y >= 0 && y < h) {

                    for (x = i, xz = i + tileWidth; x < xz; x++) {

                        if (x >= 0 && x < w) {

                            pos = (y * iWidth) + (x * 4);

                            if (data[pos + 3]) hold.push(pos);
                        }
                    }
                }
            }
            if (hold.length) tiles.push([].concat(hold));
        }
    }
};

const average = function (c) {

    let a = 0,
        k, kz,
        l = c.length;

    if (l) {

        for (k = 0, kz = l; k < kz; k++) {

            a +=c[k];
        }
        return a / l;
    }
    return 0;
};

const checkBounds = function (p) {

    let len = data.length;

    if (p < 0) p += len;
    if (p >= len) p -= len;
    return p;
};

const actions = {


    userDefined: function () {},

    grayscale: function () {

        let i, iz, pos, gray;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            gray = (0.2126 * data[pos]) + (0.7152 * data[pos + 1]) + (0.0722 * data[pos + 2]);
            data[pos] = data[pos + 1] = data[pos + 2] = gray;
        }
    },

    sepia: function () {

        let i, iz, pos, r, g, b;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            
            r = data[pos];
            g = data[pos + 1];
            b = data[pos + 2];
            
            data[pos] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            data[pos + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            data[pos + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
        }
    },

    invert: function () {

        let i, iz, pos;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos] = 255 - data[pos];
            
            pos++;
            data[pos] = 255 - data[pos];
            
            pos++;
            data[pos] = 255 - data[pos];
        }
    },

    red: function () {

        let i, iz, pos;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos + 1] = 0;
            data[pos + 2] = 0;
        }
    },

    green: function () {

        let i, iz, pos;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos] = 0;
            data[pos + 2] = 0;
        }
    },

    blue: function () {

        let i, iz, pos;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos] = 0;
            data[pos + 1] = 0;
        }
    },

    notred: function() {

        let i, iz, pos;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos] = 0;
        }
    },

    notgreen: function () {

        let i, iz, pos;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos + 1] = 0;
        }
    },

    notblue: function () {

        let i, iz, pos;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos + 2] = 0;
        }
    },

    cyan: function () {

        let i, iz, pos, gray;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            
            gray = (data[pos + 1] + data[pos + 2]) / 2;
            
            data[pos] = 0;
            data[pos + 1] = gray;
            data[pos + 2] = gray;
        }
    },

    magenta: function () {

        let i, iz, pos, gray;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];

            gray = (data[pos] + data[pos + 2]) / 2;

            data[pos] = gray;
            data[pos + 1] = 0;
            data[pos + 2] = gray;
        }
    },

    yellow: function () {

        let i, iz, pos, gray;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            
            gray = (data[pos] + data[pos + 1]) / 2;
            
            data[pos] = gray;
            data[pos + 1] = gray;
            data[pos + 2] = 0;
        }
    },

    brightness: function () {

        let i, iz, pos, 
            level = filter.level || 0;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos] *= level;
            
            pos++;
            data[pos] *= level;
            
            pos++;
            data[pos] *= level;
        }
    },

    saturation: function () {

        let i, iz, pos, 
            level = filter.level || 0;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos] = 127 + ((data[pos] - 127) * level);
            
            pos++;
            data[pos] = 127 + ((data[pos] - 127) * level);
            
            pos++;
            data[pos] = 127 + ((data[pos] - 127) * level);
        }
    },

    threshold: function () {

        let i, iz, pos, gray, test,
            level = filter.level || 0,
            lowRed = filter.lowRed,
            lowGreen = filter.lowGreen,
            lowBlue = filter.lowBlue,
            highRed = filter.highRed,
            highGreen = filter.highGreen,
            highBlue = filter.highBlue;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            
            gray = (0.2126 * data[pos]) + (0.7152 * data[pos + 1]) + (0.0722 * data[pos + 2]);
            test = (gray > level) ? true : false;
            
            if (test) {

                data[pos] = highRed;
                data[pos + 1] = highGreen;
                data[pos + 2] = highBlue;
            }
            else {

                data[pos] = lowRed;
                data[pos + 1] = lowGreen;
                data[pos + 2] = lowBlue;
            }
            
        }
    },

    channels: function () {

        let i, iz, pos,
            red = filter.red || 0,
            green = filter.green || 0,
            blue = filter.blue || 0;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            
            data[pos] *= red;
            data[pos + 1] *= green;
            data[pos + 2] *= blue;
        }
    },

    channelstep: function () {

        let i, iz, pos,
            red = filter.red || 1,
            green = filter.green || 1,
            blue = filter.blue || 1,
            floor = Math.floor;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            data[pos] = floor(data[pos] / red) * red;
            
            pos++;
            data[pos] = floor(data[pos] / green) * green;
            
            pos++;
            data[pos] = floor(data[pos] / blue) * blue;
        }
    },

    tint: function () {

        let i, iz, pos, r, g, b,
            redInRed = filter.redInRed || 0,
            redInGreen = filter.redInGreen || 0,
            redInBlue = filter.redInBlue || 0,
            greenInRed = filter.greenInRed || 0,
            greenInGreen = filter.greenInGreen || 0,
            greenInBlue = filter.greenInBlue || 0,
            blueInRed = filter.blueInRed || 0,
            blueInGreen = filter.blueInGreen || 0,
            blueInBlue = filter.blueInBlue || 0;

        for (i = 0, iz = cache.length; i < iz; i++) {

            pos = cache[i];
            
            r = data[pos];
            g = data[pos + 1];
            b = data[pos + 2];
            
            data[pos] = (r * redInRed) + (g * greenInRed) + (b * blueInRed);
            data[pos + 1] = (r * redInGreen) + (g * greenInGreen) + (b * blueInGreen);
            data[pos + 2] = (r * redInBlue) + (g * greenInBlue) + (b * blueInBlue);
        }
    },

    chroma: function () {

        let pos, posA,
            ranges = filter.ranges,
            range, min, max, val,
            i, iz, j, jz, flag;

        for (j = 0, jz = cache.length; j < jz; j++) {

            flag = false;

            for (i = 0, iz = ranges.length; i < iz; i++) {

                posA = cache[j] + 3;
                range = ranges[i];
                min = range[2];
                pos = posA - 1;
                val = data[pos];

                if (val >= min) {

                    max = range[5];

                    if (val <= max) {

                        min = range[1];
                        pos--;
                        val = data[pos];

                        if (val >= min) {

                            max = range[4];

                            if (val <= max) {

                                min = range[0];
                                pos--;
                                val = data[pos];

                                if (val >= min) {

                                    max = range[3];

                                    if (val <= max) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (flag) data[posA] = 0;
        }
    },

    pixelate: function () {

        let i, iz, j, jz, pos, r, g, b, a, tile, len;

        getTiles();

        for (i = 0, iz = tiles.length; i < iz; i++) {

            tile = tiles[i];
            r = g = b = a = 0;
            len = tile.length;

            if (len) {

                for (j = 0, jz = len; j < jz; j++) {

                    pos = tile[j];

                    r += data[pos];
                    g += data[pos + 1];
                    b += data[pos + 2];
                    a += data[pos + 3];
                }

                r /= len;
                g /= len;
                b /= len;
                a /= len;

                for (j = 0, jz = len; j < jz; j++) {

                    pos = tile[j];

                    data[pos] = r;
                    data[pos + 1] = g;
                    data[pos + 2] = b;
                    data[pos + 3] = a;
                }
            }
        }
    },

    blur: function () {

        if (data.slice) {

            let radius = filter.radius || 1,
                alpha = filter.includeAlpha || false,
                shrink = filter.shrinkingRadius || false,
                passes = filter.passes || 1,
                len = data.length,
                imageWidth = image.width,
                imageHeight = image.height,
                tempDataTo, tempDataFrom,
                i, iz, index;

            let processPass = function () {

                let j, jz;

                tempDataFrom = tempDataTo.slice(); 

                for (j = localX * 4, jz = (localX + localWidth) * 4; j < jz; j++) {

                    if (alpha) processColumn(j);
                    else {

                        if (j % 4 !== 3) processColumn(j);
                    }
                }

                tempDataFrom = tempDataTo.slice(); 

                for (j = localY, jz = localY + localHeight; j < jz; j++) {

                    if (alpha) processRowWithAlpha(j);
                    else processRowNoAlpha(j);
                }
            };

            let processColumn = function (col) {

                let pos, avg, val, cagePointer, y, yz, q, dataPointer,
                    vLead = radius * iWidth, 
                    cage = [],
                    cageLen;

                for (y = -radius, yz = radius; y < yz; y++) {

                    pos = col + (y * iWidth);
                    pos = checkBounds(pos, len);
                    cage.push(tempDataFrom[pos]);
                }

                tempDataTo[col] = avg = average(cage);

                cageLen = cage.length;

                for (q = 0; q < cageLen; q++) {

                    cage[q] /= cageLen;
                }

                cagePointer = 0;

                for (y = 1; y < imageHeight; y++) {

                    avg -= cage[cagePointer];

                    dataPointer = col + (y * iWidth);
                    pos = dataPointer + vLead;
                    pos = checkBounds(pos, len);
                    val = tempDataFrom[pos] / cageLen;

                    avg += val;
                    cage[cagePointer] = val;
                    tempDataTo[dataPointer] = avg;

                    cagePointer++;

                    if (cagePointer === cageLen) cagePointer = 0;
                }
            };

            let processRowWithAlpha = function (row) {

                let pos, val, x, xz, q, avgQ, cageQ, rowPosX,
                    avg = [],
                    cage = [[], [], [], []],
                    rowPos = row * iWidth, 
                    hLead = radius * 4,
                    dataPointer, cagePointer, cageLen;

                q = 0;

                for (x = -radius * 4, xz = radius * 4; x < xz; x++) {

                    pos = rowPos + x;
                    pos = checkBounds(pos, len);
                    
                    cage[q].push(tempDataFrom[pos]);
                    
                    q++;
                    if (q === 4) q = 0;
                }

                tempDataTo[rowPos] = avg[0] = average(cage[0]);
                tempDataTo[rowPos + 1] = avg[1] = average(cage[1]);
                tempDataTo[rowPos + 2] = avg[2] = average(cage[2]);
                tempDataTo[rowPos + 3] = avg[3] = average(cage[3]);

                cageLen = cage[0].length;

                for (q = 0; q < 4; q++) {

                    for (x = 0; x < cageLen; x++) {

                        cage[q][x] /= cageLen;
                    }
                }
                cagePointer = 0;

                for (x = 1; x < imageHeight; x++) {

                    rowPosX = rowPos + (x * 4);

                    for (q = 0; q < 4; q++) {

                        avgQ = avg[q];
                        cageQ = cage[q];
                        avgQ -= cageQ[cagePointer];

                        dataPointer = rowPosX + q;
                        pos = dataPointer + hLead;
                        pos = checkBounds(pos, len);
                        val = tempDataFrom[pos] / cageLen;

                        avgQ += val;
                        tempDataTo[dataPointer] = avgQ;
                        avg[q] = avgQ;
                        cageQ[cagePointer] = val;
                    }

                    cagePointer++;

                    if (cagePointer === cageLen) cagePointer = 0;
                }
            };

            let processRowNoAlpha = function (row) {

                let pos, val, x, xz, q, avgQ, cageQ, rowPosX,
                    avg = [],
                    hLead = radius * 4,
                    cage = [[], [], []],
                    rowPos = row * iWidth, 
                    dataPointer, cagePointer, cageLen;

                q = 0;

                for (x = -radius * 4, xz = radius * 4; x < xz; x++) {

                    if (q < 3) {

                        pos = rowPos + x;
                        pos = checkBounds(pos, len);
                        cage[q].push(tempDataFrom[pos]);
                        q++;
                    }
                    else q = 0;
                }

                tempDataTo[rowPos] = avg[0] = average(cage[0]);
                tempDataTo[rowPos + 1] = avg[1] = average(cage[1]);
                tempDataTo[rowPos + 2] = avg[2] = average(cage[2]);

                cageLen = cage[0].length;

                for (q = 0; q < 3; q++) {

                    cageQ = cage[q];
                    
                    for (x = 0; x < cageLen; x++) {

                        cageQ[x] /= cageLen;
                    }
                }
                cagePointer = 0;

                for (x = 1; x < imageHeight; x++) {

                    rowPosX = rowPos + (x * 4);

                    for (q = 0; q < 3; q++) {

                        avgQ = avg[q];
                        cageQ = cage[q];
                        avgQ -= cageQ[cagePointer];

                        dataPointer = rowPosX + q;
                        pos = dataPointer + hLead;
                        pos = checkBounds(pos, len);
                        val = tempDataFrom[pos] / cageLen;

                        avgQ += val;
                        tempDataTo[dataPointer] = avgQ;
                        avg[q] = avgQ;
                        cageQ[cagePointer] = val;
                    }

                    cagePointer++;
                    if (cagePointer === cageLen) cagePointer = 0;
                }
            };

            tempDataTo = data.slice();

            for (i = 0; i < passes; i++) {

                processPass();
                
                if (shrink) {

                    radius = Math.ceil(radius * 0.3);
                    radius = (radius < 1) ? 1 : radius;
                }
            }

            for (i = 0, iz = cache.length; i < iz; i++) {

                index = cache[i];
                data[index] = tempDataTo[index];
                
                index++;
                data[index] = tempDataTo[index];
                
                index++;
                data[index] = tempDataTo[index];
                
                if (alpha) {

                    index++;
                    data[index] = tempDataTo[index];
                }
            }
        }
    },

    matrix: function () {

        let i, iz, j, jz, pos, weight, sumR, sumG, sumB, sumA, homePos,
            len = data.length,
            alpha = filter.includeAlpha || false,
            offset = [],
            weights = filter.weights || [0, 0, 0, 0, 1, 0, 0, 0, 0],
            tempCache = [],
            cursor = 0;

        offset[0] = -iWidth - 4;
        offset[1] = -iWidth;
        offset[2] = -iWidth + 4;
        offset[3] = -4;
        offset[4] = 0;
        offset[5] = 4;
        offset[6] = iWidth - 4;
        offset[7] = iWidth;
        offset[8] = iWidth + 4;

        for (i = 0, iz = cache.length; i < iz; i++) {

            homePos = cache[i];
            sumR = sumG = sumB = sumA = 0;
            
            for (j = 0, jz = offset.length; j < jz; j++) {

                pos = homePos + offset[j];
                
                if (pos >= 0 && pos < len) {

                    weight = weights[j];
                    sumR += data[pos] * weight;
                    
                    pos++;
                    sumG += data[pos] * weight;
                    
                    pos++;
                    sumB += data[pos] * weight;
                    
                    if (alpha) {

                        pos++;
                        sumA += data[pos] * weight;
                    }
                }
            }

            tempCache[cursor] = sumR;
            cursor++;

            tempCache[cursor] = sumG;
            cursor++;

            tempCache[cursor] = sumB;
            cursor++;

            if (alpha) {

                tempCache[cursor] = sumA;
                cursor++;
            }
        }

        cursor = 0;

        for (i = 0, iz = cache.length; i < iz; i++) {

            homePos = cache[i];
            data[homePos] = tempCache[cursor];
            cursor++;

            homePos++;
            data[homePos] = tempCache[cursor];
            cursor++;

            homePos++;
            data[homePos] = tempCache[cursor];
            cursor++;

            if (alpha) {

                homePos++;
                data[homePos] = tempCache[cursor];
                cursor++;
            }
        }
    },

    matrix5: function () {

        let i, iz, j, jz, pos, weight, sumR, sumG, sumB, sumA, homePos,
            len = data.length,
            alpha = filter.includeAlpha || false,
            offset = [],
            weights = filter.weights || [0, 0, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 1, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0],
            tempCache = [],
            iWidth2 = iWidth * 2,
            cursor = 0;

        offset[0] = -iWidth2 - 8;
        offset[1] = -iWidth2 - 4;
        offset[2] = -iWidth2;
        offset[3] = -iWidth2 + 4;
        offset[4] = -iWidth2 + 8;
        offset[5] = -iWidth - 8;
        offset[6] = -iWidth - 4;
        offset[7] = -iWidth;
        offset[8] = -iWidth + 4;
        offset[9] = -iWidth + 8;
        offset[10] = -8;
        offset[11] = -4;
        offset[12] = 0;
        offset[13] = 4;
        offset[14] = 8;
        offset[15] = iWidth - 8;
        offset[16] = iWidth - 4;
        offset[17] = iWidth;
        offset[18] = iWidth + 4;
        offset[19] = iWidth + 8;
        offset[20] = iWidth2 - 8;
        offset[21] = iWidth2 - 4;
        offset[22] = iWidth2;
        offset[23] = iWidth2 + 4;
        offset[24] = iWidth2 + 8;

        for (i = 0, iz = cache.length; i < iz; i++) {

            homePos = cache[i];
            sumR = sumG = sumB = sumA = 0;
            
            for (j = 0, jz = offset.length; j < jz; j++) {

                pos = homePos + offset[j];
                
                if (pos >= 0 && pos < len) {

                    weight = weights[j];
                    sumR += data[pos] * weight;

                    pos++;
                    sumG += data[pos] * weight;

                    pos++;
                    sumB += data[pos] * weight;

                    if (alpha) {

                        pos++;
                        sumA += data[pos] * weight;
                    }
                }
            }

            tempCache[cursor] = sumR;
            cursor++;

            tempCache[cursor] = sumG;
            cursor++;

            tempCache[cursor] = sumB;
            cursor++;

            if (alpha) {

                tempCache[cursor] = sumA;
                cursor++;
            }
        }

        cursor = 0;

        for (i = 0, iz = cache.length; i < iz; i++) {

            homePos = cache[i];
            data[homePos] = tempCache[cursor];
            cursor++;

            homePos++;
            data[homePos] = tempCache[cursor];
            cursor++;

            homePos++;
            data[homePos] = tempCache[cursor];
            cursor++;

            if (alpha) {
                
                homePos++;
                data[homePos] = tempCache[cursor];
                cursor++;
            }
        }
    },
};`
};


const filterUrl = URL.createObjectURL(

    new Blob([ filterCode() ], { type: 'text/javascript' })
);


// #### Exports
export {
    makeFilter,
    requestFilterWorker,
    releaseFilterWorker,
    actionFilterWorker,
};
