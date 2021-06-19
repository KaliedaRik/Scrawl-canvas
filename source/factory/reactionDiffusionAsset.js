// # ReactionDiffusionAsset factory


// #### Demos:


// #### Imports
import { constructors, asset } from '../core/library.js';
import { mergeOver, Ωempty, λnull, λthis, xt, isa_fn, getArrayType, pushUnique } from '../core/utilities.js';

import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
import patternMix from '../mixin/pattern.js';


// #### ReactionDiffusionAsset constructor
const ReactionDiffusionAsset = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.subscribers = [];
    this.matrices = [];
    this.seedArrayA = [];
    this.seedArrayB = [];

    this.colorFactory = makeColor({
        name: `${this.name}-color-factory`,
        minimumColor: items.gradientStart || 'red',
        maximumColor: items.gradientEnd || 'green',
    });

    this.set(this.defs);
    this.set(items);

    let mycanvas = document.createElement('canvas');
    mycanvas.id = this.name;
    this.installElement(mycanvas);

    if (items.subscribe) this.subscribers.push(items.subscribe);

    // The default diffusion matrix
    // + Each matrix must add up to 0, with the center cell having a value of -1
    // + The values of the surrounding cells can represent a directional flow across/around the model
    if (!this.matrices.length) this.matrices.push([0.05, 0.2, 0.05, 0.2, -1, 0.2, 0.05, 0.2, 0.05]);

    this.dirtyModel = true;
    this.dirtyData = true;
    this.dirtyOutput = true;

    return this;
};


// #### ReactionDiffusionAsset prototype
let P = ReactionDiffusionAsset.prototype = Object.create(Object.prototype);

P.type = 'ReactionDiffusionAsset';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
// + [base](../mixin/base.html)
// + [asset](../mixin/asset.html)
// + [pattern](../mixin/pattern.html)
P = baseMix(P);
P = assetMix(P);
P = patternMix(P);


// #### ReactionDiffusionAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
// + The __element__ and __engine__ attributes are excluded from the defaults object
// + Attributes defined in the [pattern mixin](../mixin/pattern.html): __repeat, patternMatrix, matrixA, matrixB, matrixC, matrixD, matrixE, matrixF__.
let defaultAttributes = {

    width: 200,
    height: 200,

    initialDataImage: null,
    initialData: false,

    staticFeedRate: 0.054,
    staticKillRate: 0.062,
    useStaticRates: true,

    seedArrayA: null,
    seedArrayB: null,
    randomSeedMaximum: 20,
    generateRandomSeedPositions: true,

    matrices: null,

    diffusionRateA: 0.2095,
    diffusionRateB: 0.105,

    timestep: 1,
    generations: 50,

    displayA: false,

    // SHARED BETWEEN noiseAsset, reactionDiffusionAsset
    // __color__ - String value determining how the generated noise will be output on the canvas. Currently recognised values are: `monochrome` (default), `gradient` and `hue`
    color: 'monochrome',

    // When the `color` choice has been set to `monochrome` we can clamp the pixel values using the __monochromeStart__ and __monochromeRange__ attributes, both of which take integer Numbers. 
    // + Accepted monochromeStart values are 0 to 255
    // + Accepted monochromeRange values are -255 to 255
    // + Be aware that the monochromeRange value will be recalculated to make sure calculated pixel values remain in the 0-255 color channel range
    monochromeStart: 0,
    monochromeRange: 255,

    // When the `color` choice has been set to `gradient` we can control the start and end colors of the gradient using the __gradientStart__ and __gradientEnd__ attributes
    gradientStart: '#ff0000',
    gradientEnd: '#00ff00',

    // When the `color` choice has been set to `hue` we can control the pixel colors (in terms of their HSL components) using the __hueStart__, __hueRange__, __saturation__ and __luminosity__ attributes:
    // + `hueStart` - float Number value in degrees, will be clamped to between 0 and 360
    // + `hueRange` - float Number value in degrees, can be negative as well as positive
    // + `saturation` - float Number value, between 0 and 100
    // + `luminosity` - float Number value, between 0 and 100
    hueStart: 0,
    hueRange: 120,
    saturation: 100,
    luminosity: 50,
    // END SHARED BETWEEN noiseAsset, reactionDiffusionAsset
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// Assets do not take part in the packet or clone systems; they can, however, be used for importing and actioning packets as they retain those base functions
P.saveAsPacket = function () {
    return [this.name, this.type, this.lib, {}];
};

P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;


// #### Clone management
P.clone = λthis;


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __element, engine__
S.element = λnull;
S.engine = λnull;

// __source__
S.source = λnull;

// __subscribers__ - we disable the ability to set the subscribers Array directly. Picture entitys and Pattern styles will manage their subscription to the asset using their subscribe() and unsubscribe() functions. Filters will check for updates every time they run
S.subscribers = λnull;

S.width = function (item) {

    if (item.toFixed) {

        this.width = item;
        this.sourceNaturalWidth = item;
        this.dirtyData = true;
        this.dirtyModel = true;
        this.dirtyOutput = true;
    }
};

S.height = function (item) {

    if (item.toFixed) {

        this.height = item;
        this.sourceNaturalHeight = item;
        this.dirtyData = true;
        this.dirtyModel = true;
        this.dirtyOutput = true;
    }
};

S.staticFeedRate = function (item) {

    if (item.toFixed && item >= 0 && item <= 1) {

        this.staticFeedRate = item;
        this.dirtyData = true;
        this.dirtyModel = true;
        this.dirtyOutput = true;
    }
};

S.staticKillRate = function (item) {

    if (item.toFixed && item >= 0 && item <= 1) {

        this.staticKillRate = item;
        this.dirtyData = true;
        this.dirtyModel = true;
        this.dirtyOutput = true;
    }
};

S.diffusionRateA = function (item) {

    if (item.toFixed && item >= 0 && item <= 1) {

        this.diffusionRateA = item;
        this.dirtyData = true;
        this.dirtyModel = true;
        this.dirtyOutput = true;
    }
};

S.diffusionRateB = function (item) {

    if (item.toFixed && item >= 0 && item <= 1) {

        this.diffusionRateB = item;
        this.dirtyData = true;
        this.dirtyModel = true;
        this.dirtyOutput = true;
    }
};

// __initialDataImage__ needs to be a SC asset wrapper - imageAsset, videoAsset, spriteAsset, noiseAsset
S.initialDataImage = function (item) {

    let oldIDI = this.asset,
        newIDI = (item && item.name) ? item.name : item;

    if (oldIDI && !oldIDI.substring) oldIDI.unsubscribe(this);

    this.initialDataImage = newIDI;
    this.dirtyData = true;
    this.dirtyModel = true;
    this.dirtyOutput = true;
};

// The initialData is stored in a Float64Array
// 
// + if no initialDataImage wrapper is supplied, we generate a default, randomized dataset
// ```
// We store RD data in the Float64Array, for each cell, as follows:
// 
// [
//   0.0     // A chemical value (from initialDataImage R channel), unit clamped (0-1)
//   0.0     // B chemical value (from initialDataImage G channel), unit clamped (0-1)
//   0.0     // f (feed) rate for this cell (from initialDataImage B channel), unit clamped (0-1)
//   0.0     // k (kill) rate for this cell (from initialDataImage A channel), unit clamped (0-1)
//   0       // A diffusion matrix index (defaults to 0)
//   0       // B diffusion matrix index (defaults to 0)
//   ...
// ]
// ```
S.initialData = function (item) {

    if ('Float64Array' === getArrayType(item)) {

        this.initialData = item;
        this.dirtyData = false;
    }
    else {

        this.initialData = false;
        this.dirtyData = true;
    }
    this.dirtyModel = true;
    this.dirtyOutput = true;
};

S.seedArrayA = function (item) {

    if (Array.isArray(item)) {

        let s = this.seedArrayA;

        s.length = 0;
        s.concat(item);
    }
};

S.seedArrayB = function (item) {

    if (Array.isArray(item)) {

        let s = this.seedArrayB;

        s.length = 0;
        s.concat(item);
    }
};

S.timestep = function (item) {

    this.timestep = item;
    this.dirtyData = true;
    this.dirtyModel = true;
    this.dirtyOutput = true;
};

S.generations = function (item) {

    this.generations = item;
    this.dirtyData = true;
    this.dirtyModel = true;
    this.dirtyOutput = true;
};

// SHARED BETWEEN noiseAsset, reactionDiffusionAsset
P.supportedColorSchemes = ['monochrome', 'gradient', 'hue'];
S.color = function (item) {

    if (this.supportedColorSchemes.indexOf(item) >= 0) {

        this.color = item;
        this.dirtyOutput = true;
    }
};

S.gradientStart = function (item) {

    if (item.substring) {

        this.colorFactory.setMinimumColor(item);
        this.dirtyOutput = true;
    }
};

S.gradientEnd = function (item) {

    if (item.substring) {

        this.colorFactory.setMaximumColor(item);
        this.dirtyOutput = true;
    }
};

S.monochromeStart = function (item) {

    if (item.toFixed && item >= 0) {

        this.monochromeStart = item % 360;
        this.dirtyOutput = true;
    }
};

S.monochromeRange = function (item) {

    if (item.toFixed && item >= -255 && item < 256) {

        this.monochromeRange = Math.floor(item);
        this.dirtyOutput = true;
    }
};

S.hueStart = function (item) {

    if (item.toFixed) {

        this.hueStart = item;
        this.dirtyOutput = true;
    }
};

S.hueRange = function (item) {

    if (item.toFixed) {

        this.hueRange = item;
        this.dirtyOutput = true;
    }
};

S.saturation = function (item) {

    if (item.toFixed && item >= 0 && item <= 100) {

        this.saturation = Math.floor(item);
        this.dirtyOutput = true;
    }
};

S.luminosity = function (item) {

    if (item.toFixed && item >= 0 && item <= 100) {

        this.luminosity = Math.floor(item);
        this.dirtyOutput = true;
    }
};
// END SHARED BETWEEN noiseAsset, reactionDiffusionAsset


// #### Prototype functions

// `installElement` - internal function, used by the constructor
P.installElement = function (element) {

    this.element = element;
    this.engine = this.element.getContext('2d');

    return this;
};

// `checkSource`
// + Gets invoked by subscribers (who have a handle to the asset instance object) as part of the display cycle.
// + RD assets will automatically pass this call onto `notifySubscribers`, where dirty flags get checked and rectified
P.checkSource = function () {

    this.notifySubscribers();
};

// `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
// + This is the point when we clean Scrawl-canvas assets which have told their subscribers that asset data/attributes have updated
P.getData = function (entity, cell) {

    this.notifySubscribers();

    return this.buildStyle(cell);
};

// `notifySubscribers`, `notifySubscriber` - overwrites the functions defined in mixin/asset.js
P.notifySubscribers = function () {

    if (this.dirtyOutput || this.dirtyModel || this.dirtyData) this.cleanOutput();

    this.subscribers.forEach(sub => this.notifySubscriber(sub), this);
};

P.notifySubscriber = function (sub) {

    sub.sourceNaturalWidth = this.width;
    sub.sourceNaturalHeight = this.height;
    sub.sourceLoaded = true;
    sub.source = this.element;
    sub.dirtyImage = true;
    sub.dirtyCopyStart = true;
    sub.dirtyCopyDimensions = true;
    sub.dirtyImageSubscribers = true;
};

// `cleanOutput` - internal function called by the `notifySubscribers` function
P.cleanOutput = function () {

    if (this.dirtyData) this.cleanData();
    if (this.dirtyModel) this.cleanModel();
    if (this.dirtyOutput) this.paintCanvas();
};

// `cleanData` - internal function called by the `cleanOutput` function
P.cleanData = function () {

    if (this.dirtyData) {

        this.dirtyData = false;

        let { initialDataImage } = this;

        if (!initialDataImage) this.createDefaultInitialData();
        else this.createInitialDataFromImage();

        delete this.workingData;
    }
};

P.createDefaultInitialData = function () {

    let { width, height, initialData, staticFeedRate, staticKillRate, seedArrayA, seedArrayB, generateRandomSeedPositions } = this;

    let len = width * height * 6,
        i, iz;

    if (!initialData || 'Float64Array' !== getArrayType(initialData)) {

        this.initialData = new Float64Array(len);
        initialData = this.initialData;
    }

    const defaultCell = [0.5, 0.5, staticFeedRate, staticKillRate, 0, 0];

    for (i = 0; i < len; i+= 6) {

        initialData.set(defaultCell, i);
    }

    if (!seedArrayA || !seedArrayB || generateRandomSeedPositions) this.seedInitialData();

    for (i = 0, iz = seedArrayA.length; i < iz; i++) {

        let index = seedArrayA[i] * 6;

        initialData[index] = 1;
    }

    for (i = 0, iz = seedArrayB.length; i < iz; i++) {

        let index = (seedArrayB[i] * 6) + 1;

        initialData[index] = 1;
    }
};

P.seedInitialData = function () {

    let { width, height, initialData, seedArrayA, seedArrayB, randomSeedMaximum, generateRandomSeedPositions } = this;

    let len = width * height;

    if (generateRandomSeedPositions) {

        seedArrayA.length = 0;
        seedArrayB.length = 0;

        while (seedArrayA.length < randomSeedMaximum) {

            pushUnique(seedArrayA, Math.floor(Math.random() * len));
        }

        while (seedArrayB.length < randomSeedMaximum) {

            pushUnique(seedArrayB, Math.floor(Math.random() * len));
        }
    }
};

P.createInitialDataFromImage = function () {

    // let { element, engine, width, height, initialData, initialDataImage, staticFeedRate, staticKillRate, useStaticRates } = this;

    let { element, engine, width, height, initialDataImage, staticFeedRate, staticKillRate, useStaticRates } = this;

    if (initialDataImage.substring) initialDataImage = asset[initialDataImage];

    if (!initialDataImage) this.createDefaultInitialData();
    else {

        let assetCanvas = initialDataImage.element;

        let {width:aw, height:ah} = assetCanvas;

        element.width = width;
        element.height = height;

        engine.drawImage(initialDataImage.element, 0, 0, aw, ah, 0, 0, width, height);

        let iData = engine.getImageData(0, 0, width, height),
            data = iData.data;

        let dimsLen = width * height;

        this.initialData = new Float64Array(dimsLen * 6);
        let initialData = this.initialData;

        for (let index = 0; index < dimsLen; index++) {

            let i = index * 4;
            let j = index * 6;

            let ir = data[i],
                ig = data[++i],
                ib = data[++i],
                ia = data[++i];

            let ma = ir / 255,
                mb = ig / 255,
                mf = (useStaticRates) ? staticFeedRate : ib / 255,
                mk = (useStaticRates) ? staticKillRate : ia / 255;

            initialData.set([ma, mb, mf, mk, 0, 0], j);
        }
    }
};

// `cleanModel` - internal function called by the `cleanOutput` function
P.cleanModel = function () {

    let { workingData, initialData, matrices, diffusionRateA, diffusionRateB, timestep, width, height, generations } = this;

    if (this.dirtyModel) {

        this.dirtyModel = false;

        if (!workingData || 'Float64Array' !== getArrayType(workingData)) {

            this.workingData = new Float64Array(initialData.length);
            workingData = this.workingData;

            workingData.set(initialData, 0);
        }

        const w6 = width * 6;

        const grid = [
            w6 * height,
            -w6 - 6,
            -w6, 
            -w6 + 6, 
            -6, 
            0, 
            6, 
            w6 - 6, 
            w6, 
            w6 + 6
        ];

        for (let g = 0; g < generations; g++) {

            initialData.set(workingData, 0);

            for (let i = 0, iz = initialData.length; i < iz; i += 6) {

                let index = i,
                    oldA = initialData[index],
                    oldB = initialData[++index],
                    feed = initialData[++index],
                    kill = initialData[++index],
                    matrixA = matrices[initialData[++index]],
                    matrixB = matrices[initialData[++index]],
                    newA, newB;

                if (!matrixA || !matrixB) {

                    newA = oldA;
                    newB = oldB;
                }
                else {

                    newA = this.calculateNewA(grid, i, oldA, oldB, diffusionRateA, matrixA, initialData, feed, timestep);
                    newB = this.calculateNewB(grid, i + 1, oldA, oldB, diffusionRateB, matrixB, initialData, feed, kill, timestep);
                }

                workingData[i] = newA;
                workingData[i + 1] = newB;
            }
        }
        this.dirtyOutput = true;
    }
};

P.calculateNewA = function (grid, index, A, B, diffusion, weights, data, feed, step) {

    let difference = this.getAdjacentCellDifference(grid, index, weights, data);

    return A + (((diffusion * difference) - (A * (B * B)) + (feed * (1 - A))) * step);
};

P.calculateNewB = function (grid, index, A, B, diffusion, weights, data, feed, kill, step) {
    
    let difference = this.getAdjacentCellDifference(grid, index, weights, data);

    return B + (((diffusion * difference) + (A * (B * B)) - ((kill + feed) * B)) * step);
};

P.getAdjacentCellDifference = function (grid, index, weights, data) {

    let [len, tl, tc, tr, cl, cc, cr, bl, bc, br] = grid;
    let [tlw, tcw, trw, clw, ccw, crw, blw, bcw, brw] = weights;

    tl += index;
    tc += index;
    tr += index;
    cl += index;
    cc += index;
    cr += index;
    bl += index;
    bc += index;
    br += index;

    if (tl < 0 || tl >= len) {
        tl = (tl < 0) ? tl + len : tl - len;
    }
    if (tc < 0 || tc >= len) {
        tc = (tc < 0) ? tc + len : tc - len;
    }
    if (tr < 0 || tr >= len) {
        tr = (tr < 0) ? tr + len : tr - len;
    }
    if (cl < 0 || cl >= len) {
        cl = (cl < 0) ? cl + len : cl - len;
    }
    if (cr < 0 || cr >= len) {
        cr = (cr < 0) ? cr + len : cr - len;
    }
    if (bl < 0 || bl >= len) {
        bl = (bl < 0) ? bl + len : bl - len;
    }
    if (bc < 0 || bc >= len) {
        bc = (bc < 0) ? bc + len : bc - len;
    }
    if (br < 0 || br >= len) {
        br = (br < 0) ? br + len : br - len;
    }

    let diff = 0;

    diff += (data[tl] * tlw);
    diff += (data[tc] * tcw);
    diff += (data[tr] * trw);
    diff += (data[cl] * clw);
    diff += (data[cc] * ccw);
    diff += (data[cr] * crw);
    diff += (data[bl] * blw);
    diff += (data[bc] * bcw);
    diff += (data[br] * brw);

    return diff;
}

// `paintCanvas` - internal function called by the `cleanOutput` function
P.paintCanvas = function () {

    if (this.dirtyOutput) {

        this.dirtyOutput = false;

        let {workingData, element, engine, width, height, color, colorFactory, monochromeStart, monochromeRange, hueStart, hueRange, saturation, luminosity, displayA} = this;

        // workingData values will be calculated in the cleanModel function, but just in case this function gets invoked directly before that array has been created ...
        if (null != workingData) {

            // Update the Canvas element's dimensions - this will also clear the canvas display
            element.width = width;
            element.height = height;

            let res = [];

            // Rebuild the display, pixel-by-pixel
            switch (color) {

                case 'hue' :

                    for (let i = 0, iz = workingData.length; i < iz; i += 6) {

                        let a = workingData[i],
                            b = workingData[i + 1];

                        let ab = a + b;

                        let d = (displayA) ? a : b;

                        if (ab) res.push(`hsl(${(hueStart + (d * hueRange)) % 360}, ${saturation}%, ${luminosity}%)`);
                        else res.push('rgba(0,0,0,0)');
                    }
                    break;

                case 'gradient' :

                    for (let i = 0, iz = workingData.length; i < iz; i += 6) {

                        let a = workingData[i],
                            b = workingData[i + 1];

                        let ab = a + b;

                        let d = (displayA) ? a : b;

                        if (ab) res.push(colorFactory.getRangeColor(d / ab));
                        else res.push('rgba(0,0,0,0)');
                    }
                    break;

                // The default color preference is monochrome
                default :

                    for (let i = 0, iz = workingData.length; i < iz; i += 6) {

                        let a = workingData[i],
                            b = workingData[i + 1];

                        let ab = a + b,
                            gray;

                        let d = (displayA) ? a : b;

                        if (ab) {
                            gray = Math.floor(monochromeStart + ((d / ab) * monochromeRange));
                            res.push(`rgb(${gray}, ${gray}, ${gray})`);
                        }
                        else res.push('rgba(0,0,0,0)');
                    }
            }

            let index = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {

                    engine.fillStyle = res[index];
                    engine.fillRect(x, y, 1, 1);
                    index++;
                }
            }
        }
        else this.dirtyOutput = true;
    }
};



// #### Factory
// ```
// ```
const makeReactionDiffusionAsset = function (items) {

    if (!items) return false;
    return new ReactionDiffusionAsset(items);
};

constructors.ReactionDiffusionAsset = ReactionDiffusionAsset;


// #### Exports
export {
    makeReactionDiffusionAsset,
};
