
// # Filter factory

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality
import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import baseMix from '../mixin/base.js';


// ## Filter constructor
const Filter = function (items = {}) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);
    this.set(items);
    return this;
};


// ## Filter object prototype setup
let P = Filter.prototype = Object.create(Object.prototype);
P.type = 'Filter';
P.lib = 'filter';
P.isArtefact = false;
P.isAsset = false;


// Apply mixins to prototype object
P = baseMix(P);


// ## Define default attributes
let defaultAttributes = {


// All filters need to set out their __method__. For preset methods, a method string (eg 'grayscale', 'sepia') is sufficient. Bespoke methods require a function
    method: '',


// The following methods require no further attributes: 

//     grayscale, sepia, invert
//     red, green, blue
//     notred, notgreen, notblue
//     cyan, magenta, yellow


// The following methods require the __level__ attribute:

//     brightness, saturation, threshold
    level: 0,



// The threshhold filter will default to setting (desaturated) pixels below a given level (0 - 255) to black, and those above the level to white. These colours can be changed by using the __low__ and __high__ channel attributes
    lowRed: 0,
    lowGreen: 0,
    lowBlue: 0,
    highRed: 255,
    highGreen: 255,
    highBlue: 255,


// The channels and channelstep methods make use of the __red__, __green__ and __blue__ attributes
    red: 0,
    green: 0,
    blue: 0,


// The __tint__ method uses nine attributes
    redInRed: 0,
    redInGreen: 0,
    redInBlue: 0,
    greenInRed: 0,
    greenInGreen: 0,
    greenInBlue: 0,
    blueInRed: 0,
    blueInGreen: 0,
    blueInBlue: 0,


// The __pixelate__ method requires tile dimensions and, optionally, offset coordinates which should not exceed the tile dimensions
    offsetX: 0,
    offsetY: 0,
    tileWidth: 1,
    tileHeight: 1,


// The __blur__ method uses the following attributes:

// + the __radius__ of the blur effect, in pixels
// + the __passes__ attribute (1+) determines how many times the blur filter will iterate
// + the __shrinkingRadius__ flag reduces the radius by approx 70% on each successive pass
// + when __includeAlpha__ flag is true, filter will include the alpha channel - note this will make the edges of the entity translucent
    radius: 1,
    passes: 1,
    shrinkingRadius: false,
    includeAlpha: false,


// The __matrix__ method requires a weights attribute - an array of 9 numbers in the following format:

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

// ... where the top row is the row above the home pixel, etc

// The method also makes use of the __includeAlpha__ attribute.

// The __matrix5__ method is the same as the matrix method except that its weights array should contain 25 elements, to cover all the positions (from top-left corner) in a 5x5 grid
    weights: null,


// The __ranges__ attribute - used by the __chroma__ method - needs to be an array of arrays with the following format:

//     [[minRed, minGreen, minBlue, maxRed, maxGreen, maxBlue], etc]

// ... multiple ranges can be defined - for instance to key out the lightest and darkest hues:

//     ranges: [[0, 0, 0, 80, 80, 80], [180, 180, 180, 255, 255, 255]]
    ranges: null,


// The user-defined filter should be set as a a string of the function's contents (the bits between the { curly braces }). The function can take no arguments, and can only use variables defined above (or the udn attributes below). The function can use 'self' variables supplied by the web worker - see the worker/filter.js for more information
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


// ## Filter webworker pool

// TODO - documentation
const filterPool = [];

const requestFilterWorker = function () {

    if (!filterPool.length) filterPool.push(buildFilterWorker());

    return filterPool.shift();
};

const releaseFilterWorker = function (f) {

    filterPool.push(f);
};

const buildFilterWorker = function () {

    let path = import.meta.url.slice(0, -('factory/filter.js'.length))

    let filterUrl = (window.scrawlEnvironmentOffscreenCanvasSupported) ? 
        `${path}worker/filter.js` : 
        `${path}worker/filter.js`;

    // Sept 2019 - chrome does not yet support module
    // return new Worker(filterUrl, {type: 'module'});
    return new Worker(filterUrl);
};


// TODO - documentation
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


// ## Exported factory function
const makeFilter = function (items) {

    return new Filter(items);
};

constructors.Filter = Filter;

export {
    makeFilter,
    requestFilterWorker,
    releaseFilterWorker,
    actionFilterWorker,
};
