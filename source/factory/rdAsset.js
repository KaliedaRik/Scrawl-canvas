// # RdAsset factory
// ... TODO


// #### Demos:
// + [Canvas-053](../../demo/canvas-053.html) - Create and display output from a Reaction-Diffusion algorithm


// #### Imports
import { constructors, entity } from '../core/library.js';
import { mergeOver, λnull, λthis, λfirstArg, removeItem, seededRandomNumberGenerator, Ωempty } from '../core/utilities.js';

import { makeColor } from './color.js';
import { requestCell, releaseCell } from './cell.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
import assetAdvancedMix from '../mixin/assetAdvancedFunctionality.js';
import patternMix from '../mixin/pattern.js';


// #### RdAsset constructor
const RdAsset = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    let mycanvas = document.createElement('canvas');
    mycanvas.id = this.name;
    this.installElement(mycanvas);

    this.subscribers = [];

    this.colorFactory = makeColor({
        name: `${this.name}-color-factory`,
        minimumColor: items.gradientStart || 'red',
        maximumColor: items.gradientEnd || 'green',
    });

    this.set(this.defs);
    this.set(items);

    if (items.subscribe) this.subscribers.push(items.subscribe);

    this.currentGeneration = 0;
    this.dataArrays = [];

    this.dirtyScene = true;
    this.dirtyOutput = true;

    return this;
};


// #### RdAsset prototype
let P = RdAsset.prototype = Object.create(Object.prototype);
P.type = 'RdAsset';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
// + [base](../mixin/base.html)
// + [asset](../mixin/asset.html)
// + [assetAdvancedFunctionality](../mixin/assetAdvancedFunctionality.html)
// + [pattern](../mixin/pattern.html)
P = baseMix(P);
P = assetMix(P);
P = assetAdvancedMix(P);
P = patternMix(P);


// #### RdAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
// + Attributes defined in the [assetAdvancedFunctionality mixin](../mixin/assetAdvancedFunctionality.html): __color, monochromeStart, monochromeRange, gradientStart, gradientEnd, hueStart, hueRange, saturation, luminosity__.
// + Attributes defined in the [pattern mixin](../mixin/pattern.html): __repeat, patternMatrix, matrixA, matrixB, matrixC, matrixD, matrixE, matrixF__.
let defaultAttributes = {

    // The offscreen canvas dimensions, within which the noise will be generated, is set using the __width__ and __height__ attributes. These take Number values.
    width: 300,
    height: 150,

    initialRandomSeedLevel: 0.0045,

    diffusionRateA: 0.2097,
    diffusionRateB: 0.105,

    feedRate: 0.054,
    killRate: 0.062,

    drawEvery: 10,
    maxGenerations: 4000,

    initialSettingPreference: 'random',
    randomEngineSeed: 'some-random-string-or-other',
    initialSettingEntity: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);

delete P.defs.source;
delete P.defs.sourceLoaded;

// #### Packet management
// This functionality is disabled for Cell objects
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};


// #### Clone management
P.clone = λthis;


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __subscribers__ - we disable the ability to set the subscribers Array directly. Picture entitys and Pattern styles will manage their subscription to the asset using their subscribe() and unsubscribe() functions. Filters will check for updates every time they run
S.subscribers = λnull;

S.width = function (item) {

    if (item.toFixed) {

        this.width = item;
        this.sourceNaturalWidth = item;
        this.dirtyScene = true;
    }
};

S.height = function (item) {

    if (item.toFixed) {

        this.height = item;
        this.sourceNaturalHeight = item;
        this.dirtyScene = true;
    }
};

S.initialRandomSeedLevel = function (item) {

    if (item.toFixed) {

        this.initialRandomSeedLevel = item;
        this.dirtyScene = true;
    }
};

S.diffusionRateA = function (item) {

    if (item.toFixed) {

        this.diffusionRateA = item;
        this.dirtyScene = true;
    }
};

S.diffusionRateB = function (item) {

    if (item.toFixed) {

        this.diffusionRateB = item;
        this.dirtyScene = true;
    }
};

S.feedRate = function (item) {

    if (item.toFixed) {

        this.feedRate = item;
        this.dirtyScene = true;
    }
};

S.killRate = function (item) {

    if (item.toFixed) {

        this.killRate = item;
        this.dirtyScene = true;
    }
};

S.drawEvery = function (item) {

    if (item.toFixed) {

        this.drawEvery = item;
        this.dirtyScene = true;
    }
};

S.maxGenerations = function (item) {

    if (item.toFixed) {

        this.maxGenerations = item;
        this.dirtyScene = true;
    }
};

P.initialSettingPreferenceValues = ['random', 'entity'];
S.initialSettingPreference = function (item) {

    if (item.substring && this.initialSettingPreferenceValues.indexOf(item) >= 0) {

        this.initialSettingPreference = item;
        this.dirtyScene = true;
    }
};

S.randomEngineSeed = function (item) {

    if (item.substring) {

        this.randomEngineSeed = item;
        this.dirtyScene = true;
    }
};

S.initialSettingEntity = function (item) {

    if (item) {

        if (!item.substring) item = item.name || '';

        if (item) {

            this.initialSettingEntity = item;
            this.dirtyScene = true;
        }
    }
};

S.preset = function (item) {

    if (item.substring) {

        switch (item) {

            case 'negativeBubbles':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.098;
                this.killRate = 0.0555;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.05;
                break;

            case 'positiveBubbles':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.098;
                this.killRate = 0.057;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.1;
                break;

            case 'precriticalBubbles':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.082;
                this.killRate = 0.059;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.08;
                break;

            case 'wormsAndLoops':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.082;
                this.killRate = 0.06;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.08;
                break;

            case 'stableSolitons':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.074;
                this.killRate = 0.064;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.15;
                break;

            case 'uSkateWorld':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.062;
                this.killRate = 0.0609;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'worms':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.058;
                this.killRate = 0.065;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.1;
                break;

            case 'wormsJoinIntoMazes':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.046;
                this.killRate = 0.063;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'negatons':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.046;
                this.killRate = 0.0594;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'turingPatterns':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.042;
                this.killRate = 0.059;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'chaosToTuringNegatons':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.039;
                this.killRate = 0.058;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'fingerprints':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.037;
                this.killRate = 0.06;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'chaosWithNegatons':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.0353;
                this.killRate = 0.0566;
                this.maxGenerations = 0;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'spotsAndWorms':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.034;
                this.killRate = 0.0618;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'selfReplicatingSpots':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.03;
                this.killRate = 0.063;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'superResonantMazes':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.03;
                this.killRate = 0.0565;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'mazes':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.029;
                this.killRate = 0.057;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'mazesWithSomeChaos':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.026;
                this.killRate = 0.055;
                this.maxGenerations = 0;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'chaos':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.026;
                this.killRate = 0.051;
                this.maxGenerations = 0;
                this.initialRandomSeedLevel = 0.009;
                break;

            case 'warringMicrobes':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.022;
                this.killRate = 0.059;
                this.maxGenerations = 0;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'spotsAndLoops':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.018;
                this.killRate = 0.051;
                this.maxGenerations = 0;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'movingSpots':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.014;
                this.killRate = 0.054;
                this.maxGenerations = 0;
                this.initialRandomSeedLevel = 0.0045;
                break;

            case 'waves':
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.014;
                this.killRate = 0.045;
                this.maxGenerations = 0;
                this.initialRandomSeedLevel = 0.0045;
                break;

            default: 
                this.diffusionRateA = 0.2097;
                this.diffusionRateB = 0.105;
                this.feedRate = 0.054;
                this.killRate = 0.062;
                this.maxGenerations = 4000;
                this.initialRandomSeedLevel = 0.0045;
        }
        this.dirtyScene = true;
    }
};


// #### Prototype functions
// `cleanOutput` - internal function called by the `notifySubscribers` function
P.cleanOutput = function (iterations = 0) {

    if (this.dirtyScene) this.cleanScene();

    if (!this.dirtyScene) {

        const { element, engine, dataArrays, diffusionRateA, diffusionRateB, feedRate, killRate, currentSource, drawEvery, maxGenerations, currentGeneration } = this;

        let sourceA, destA, sourceB, destB, a, b, c, cz, da, db;

        if (!maxGenerations || currentGeneration < maxGenerations) {

            if (currentSource) {

                [destA, sourceA, destB, sourceB] = dataArrays;
            }
            else {

                [sourceA, destA, sourceB, destB] = dataArrays;
            }


            if (iterations < drawEvery) {

                for (c = 0, cz = sourceA.length; c < cz; c++) {

                    a = sourceA[c];
                    b = sourceB[c];

                    da = a + diffusionRateA * this.calculateLaplacian(c, sourceA) - a * b * b + feedRate * (1 - a);
                    db = b + diffusionRateB * this.calculateLaplacian(c, sourceB) + a * b * b - (killRate + feedRate) * b;

                    destA[c] = this.constrain(da, 0, 1);
                    destB[c] = this.constrain(db, 0, 1);
                }

                this.currentSource = (currentSource) ? 0 : 1;
                this.currentGeneration = currentGeneration + 1;
                this.cleanOutput(iterations + 1);
            }
            else this.paintCanvas();
        }
        else if (this.dirtyOutput) this.paintCanvas();
    }
};

P.checkRow = function (val) {

    const h = this.height;

    if (val < 0) return h - 1;
    if (val >= h) return 0;
    return val;
} 

P.checkCol = function (val) {

    const w = this.width;

    if (val < 0) return w - 1;
    if (val >= w) return 0;
    return val;
} 

P.constrain = function (val, min, max) {

    if (val < min) return min;
    if (val > max) return max;
    return val;
};

P.update = function () {

    this.dirtyOutput = true;
};

P.calculateLaplacian = function (index, src) {

    const w = this.width;

    let res = 0,
        row = Math.floor(index / w), 
        rowAbove = this.checkRow(row - 1) * w,
        rowBelow = this.checkRow(row + 1) * w,
        rowHere = row * w,
        col = index - rowHere,
        colLeft = this.checkCol(col - 1),
        colRight = this.checkCol(col + 1),
        cursor;

    // center
    res += src[index] * -1;

    // topleft
    cursor = rowAbove + colLeft;
    res += src[cursor] * 0.05;

    // topright
    cursor = rowAbove + colRight;
    res += src[cursor] * 0.05;

    // bottomleft
    cursor = rowBelow + colLeft;
    res += src[cursor] * 0.05;

    // bottomright
    cursor = rowBelow + colRight;
    res += src[cursor] * 0.05;

    // top
    cursor = rowAbove + col;
    res += src[cursor] * 0.2;

    // right
    cursor = rowHere + colRight;
    res += src[cursor] * 0.2;

    // left
    cursor = rowHere + colLeft;
    res += src[cursor] * 0.2;

    // bottom
    cursor = rowBelow + col;
    res += src[cursor] * 0.2;

    return res;
};

// `cleanScene` - internal function called by the `cleanOutput` function
P.cleanScene = function () {

    const { element, width, height, dataArrays, initialRandomSeedLevel, initialSettingPreference, randomEngineSeed, initialSettingEntity } = this;

    if (width && height) {

        if (this.dirtyScene) {

            this.dirtyScene = false;

            element.width = width;
            element.height = height;

            const len = width * height;

            dataArrays.length = 0;

            for (let i = 0; i < 4; i++) {

                dataArrays.push(new Float64Array(len))
            }
            this.currentSource = 0;

            let [sourceA, destA, sourceB, destB] = dataArrays;

            sourceA.fill(1);
            destA.fill(1);
            sourceB.fill(0);
            destB.fill(0);


            if ('entity' === initialSettingPreference && entity[initialSettingEntity]) {

                const ent = entity[initialSettingEntity],
                    cell = requestCell();
                
                const {engine:cellEngine, element:cellElement} = cell;

                cellElement.width = width;
                cellElement.height = height;

                ent.simpleStamp(cell, {
                    fillStyle: 'white',
                    strokeStyle: 'white',
                });

                const initImg = cellEngine.getImageData(0, 0, width, height),
                    initData = initImg.data;

                let counter = 0;   

                // get data from alpha channel
                for (let i = 3, iz = initData.length; i < iz; i += 4) {

                    sourceB[counter] = initData[i] / 255;
                    counter++;
                }
                releaseCell(cell);
            }
            else {

                const rndEngine = seededRandomNumberGenerator(randomEngineSeed);

                for (let index = 0; index < len; index++) {

                    sourceB[index] = (rndEngine.random() < initialRandomSeedLevel) ? 1 : 0;
                }
            }

            this.currentGeneration = 0;
        }
    }
};

// `checkOutputValuesExist` and `getOutputValue` are internal variables that must be defined by any asset that makes use of the _assetAdvancedFunctionality.js_ mixin and its `paintCanvas` function
P.checkOutputValuesExist = function () {

    return (this.dataArrays.length) ? true : false;
};
P.getOutputValue = function (index, width) {

    let destA, sourceA, destB, sourceB;

    const { dataArrays, currentSource } = this;

    if (currentSource) {

        [destA, sourceA, destB, sourceB] = dataArrays;
    }
    else {

        [sourceA, destA, sourceB, destB] = dataArrays;
    }

    return destA[index] - destB[index];
};


// #### Factory
// ```
// scrawl.makeReactionDiffusionAsset({
//     name: 'my-noise-generator',
//     width: 50,
//     height: 50,
//     octaves: 5,
//     scale: 2,
//     noiseEngine: 'simplex',
// });
// ```
const makeReactionDiffusionAsset = function (items) {

    if (!items) return false;
    return new RdAsset(items);
};

constructors.RdAsset = RdAsset;


// #### Exports
export {
    makeReactionDiffusionAsset,
};
