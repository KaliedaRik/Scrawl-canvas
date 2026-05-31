// # NoiseAsset factory
// The purpose of the NoiseAsset asset is to give us a resource for generating noisy (semi-regular) maps. These can then be used directly as Picture or Pattern images, or uploaded to the filter engine as part of a filter that uses displacement map functionality.


// #### Current functionality
// At the moment the NoiseAsset asset can generate Perlin-type noise, with engines supplied for:
// + Perlin (classic)
// + Perlin (improved)
// + Simplex - the default engine
// + Value
//
// Additional engines include:
// + Worley - both euclidean and manhattan versions
//
// These engines are supported by a number of settable (and thus animatable) attributes, including special functions for smoothing the engine output. Demo [Canvas-052](../../demo/canvas-052.html) has been set up to allow for experimenting with these attributes


// #### Imports
import { constructors } from '../core/library.js';
import { seededRandomNumberGenerator } from '../helper/random-seed.js';
import { getWorkstoreItem, setWorkstoreItem } from '../helper/workstore.js';
import { releaseFloat32Array, requestFloat32Array } from '../helper/array-pool.js';

import { doCreate, easeEngines, interpolate, mergeOver, λfirstArg, λnull, λcloneError, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
import assetAdvancedMix from '../mixin/asset-advanced-functionality.js';
import patternMix from '../mixin/pattern.js';

// Shared constants
import { _abs, _floor, _max, _min, _pow, _random, _sin, _sqrt, ASSET, DEFAULT_SEED, NONE, VALUE } from '../helper/shared-vars.js';

// Local constants
const $X = 'X',
    BESPOKE_NOISE_ENGINES = ['worley-euclidean', 'worley-manhattan', 'worley-chebyshev'],
    CHEBYSHEV_DISTANCE = 'chebyshev-distance',
    EUCLIDEAN_DISTANCE = 'euclidian-distance',
    IMPROVED_PERLIN = 'improved-perlin',
    MANHATTAN_DISTANCE = 'manhattan-distance',
    PERLIN = 'perlin',
    QUINTIC = 'quintic',
    SIMPLEX = 'simplex',
    T_NOISE_ASSET = 'NoiseAsset',
    WORLEY_CHEBYSHEV = 'worley-chebyshev',
    WORLEY_EUCLIDEAN = 'worley-euclidean',
    WORLEY_MANHATTAN = 'worley-manhattan',
    WORLEY_OUTPUTS = ['X', 'Y', 'Z', 'XminusY', 'XminusZ', 'YminusX', 'YminusZ', 'ZminusX', 'ZminusY', 'XaddY', 'XaddZ', 'YaddZ', 'XaddYminusZ', 'XaddZminusY', 'YaddZminusX', 'XmultiplyY', 'XmultiplyZ', 'YmultiplyZ', 'XmultiplyYaddZ', 'XmultiplyZaddY', 'YmultiplyZaddX', 'XmultiplyYminusZ', 'XmultiplyZminusY', 'YmultiplyZminusX', 'sum'];


// #### NoiseAsset constructor
const NoiseAsset = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.installElement(this.name);

    this.perm = [];
    this.permMod8 = [];
    this.values = [];
    this.grad = null;

    this.noiseValues = null;
    this.rawNoiseValues = null;
    this.rawNoiseMin = 0;
    this.rawNoiseMax = 1;
    this.dirtyNoiseOutput = true;

    this.subscribers = [];

    this.currentAttributeValues = { ...this.stateAttributeDefaults };

    this.set(this.defs);
    this.set(items);

    if (items.subscribe) this.subscribers.push(items.subscribe);

    this.dirtyOutput = true;

    return this;
};


// #### NoiseAsset prototype
const P = NoiseAsset.prototype = doCreate();
P.type = T_NOISE_ASSET;
P.lib = ASSET;
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
baseMix(P);
assetMix(P);
assetAdvancedMix(P);
patternMix(P);


// #### NoiseAsset attributes
const defaultAttributes = {

    // The offscreen canvas dimensions, within which the noise will be generated, is set using the __width__ and __height__ attributes. These take Number values.
    width: 300,
    height: 150,

    // __noiseEngine__ - String - the currently supported noise engines String values are: `perlin`, `improved-perlin`, `simplex`, `value`, `worley-chebyshev`, `worley-euclidean`, `worley-manhattan`
    noiseEngine: SIMPLEX,

    // When a noise engine initializes it will create several Arrays of pseudo-random values. The __seed__ attribute is a String used to initialize the pseudo-random number generator, while the __size__ attribute is a Number (often a power of 2 value) which determines the lengths of the Arrays
    seed: DEFAULT_SEED,
    size: 256,

    // The __scale__ attribute determines the relative scale of the noise calculation, which affects the noise output. Think of it as a rather idiosyncratic zoom factor
    scale: 50,

    // Attributes used when calculating the noise map include:
    // + __octaves__ - a positive integer Number - the more octives, the more naturalistic the output - values over 6 are rarely productive
    // + __octaveFunction - a String identifying the function to be run at the end of each octave loop. Currently only `none` and `absolute` functions are supported
    // + __persistance__ and __lacunarity__ values change at the conclusion of each octave loop; these attributes set their initial values
    octaves: 1,
    octaveFunction: NONE,
    persistence: 0.5,
    lacunarity: 2,

    // The __smoothing__ attribute - a String value - identifies the smoothing function that will be applied pixel noise values as they are calculated. There are a wide number of functions available; default: `quintic`
    smoothing: QUINTIC,

    // Post-processing the noise map: The __sumFunction__ attribute - a String value - identifies the smoothing function that will be applied to the noise map once the noise calculations complete.
    // + Permitted values include: `none`, `sine-x`, `sine-y`, `sine`, `modular`, `random`
    sumFunction: NONE,

    // __sineFrequencyCoeff__ - a Number - is used by sine-based sum functions
    sineFrequencyCoeff: 1,

    // __sumAmplitude__ - a Number - is used by the modular sum function
    sumAmplitude: 5,

    // Worley functionality found in the [jackunion/tooloud GitHub repository](https://github.com/jackunion/tooloud/blob/master/src/Worley.js).
    // + The noise generated can be one of __worley-euclidean__ or __worley-manhattan__
    // + we can amend the noise via the `worleyOutput` and `worleyDepth` attributes
    //
    // __worleyOutput__ - String value, one from: 'X', 'Y', 'Z', 'XminusY', 'XminusZ', 'YminusX', 'YminusZ', 'ZminusX', 'ZminusY', 'XaddY', 'XaddZ', 'YaddZ', 'XaddYminusZ', 'XaddZminusY', 'YaddZminusX', 'XmultiplyY', 'XmultiplyZ', 'YmultiplyZ', 'XmultiplyYaddZ', 'XmultiplyZaddY', 'YmultiplyZaddX', 'XmultiplyYminusZ', 'XmultiplyZminusY', 'YmultiplyZminusX', 'sum', 'average'
    worleyOutput: $X,

    // worleyDepth - positive integer Number - Scrawl-canvas only uses the x and y dimensions to calculate noise; worley noise also comes with a z dimension which we can amend via this attribute
    worleyDepth: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);

P.stateAttributeDefaults = {
    height: 150,
    lacunarity: 2,
    noiseEngine: SIMPLEX,
    octaveFunction: NONE,
    octaves: 1,
    persistence: 0.5,
    scale: 50,
    seed: DEFAULT_SEED,
    sineFrequencyCoeff: 1,
    size: 256,
    smoothing: QUINTIC,
    sumAmplitude: 5,
    sumFunction: NONE,
    width: 300,
    worleyDepth: 0,
    worleyOutput: $X,
};

delete P.defs.source;
delete P.defs.sourceLoaded;

// #### Packet management
// This functionality is disabled for noiseAsset objects
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};


// #### Clone management
P.clone = λcloneError;


// #### Kill management
P.factoryKill = function () {

    releaseFloat32Array(this.rawNoiseValues, this.noiseValues, this.grad);
};


// #### Get, Set, deltaSet
const S = P.setters;

// __source__
S.source = λnull;

// __subscribers__ - we disable the ability to set the subscribers Array directly. Picture entitys and Pattern styles will manage their subscription to the asset using their subscribe() and unsubscribe() functions. Filters will check for updates every time they run
S.subscribers = λnull;

S.octaveFunction = function (item) {

    this.octaveFunction = (null != this.octaveFunctions[item]) ? this.octaveFunctions[item] : λfirstArg;
    this.dirtyNoise = true;
    this.dirtyOutput = true;

    this.currentAttributeValues.octaveFunction = item;
};

S.sumFunction = function (item) {

    this.sumFunction = (null != this.sumFunctions[item]) ? this.sumFunctions[item] : λfirstArg;
    this.dirtyNoiseOutput = true;
    this.dirtyOutput = true;

    this.currentAttributeValues.sumFunction = item;
};

S.smoothing = function (item) {

    this.smoothing = (null != easeEngines[item]) ? easeEngines[item] : λfirstArg;
    this.dirtyNoise = true;
    this.dirtyOutput = true;

    this.currentAttributeValues.smoothing = item;
};

S.noiseEngine = function (item) {

    this.noiseEngine = (null != this.noiseEngines[item]) ? this.noiseEngines[item] : this.noiseEngines[SIMPLEX];
    this.dirtyNoise = true;
    this.dirtyOutput = true;

    this.currentAttributeValues.noiseEngine = item;
};

S.octaves = function (item) {

    if (item.toFixed) {

        this.octaves = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.octaves = item;
    }
};

S.seed = function (item) {

    if (item.substring) {

        this.seed = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.seed = item;
    }
};

S.scale = function (item) {

    if (item.toFixed) {

        this.scale = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.scale = item;
    }
};

S.size = function (item) {

    if (item.toFixed) {

        this.size = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.size = item;
    }
};

S.persistence = function (item) {

    if (item.toFixed) {

        this.persistence = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.persistence = item;
    }
};

S.lacunarity = function (item) {

    if (item.toFixed) {

        this.lacunarity = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.lacunarity = item;
    }
};

S.sineFrequencyCoeff = function (item) {

    if (item.toFixed) {

        this.sineFrequencyCoeff = item;
        this.dirtyNoiseOutput = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.sineFrequencyCoeff = item;
    }
};

// `modularAmplitude` - name changed to `sumAmplitude`
S.modularAmplitude = function (item) {

    if (item.toFixed) {

        this.sumAmplitude = item;
        this.dirtyNoiseOutput = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.sumAmplitude = item;
    }
};
S.sumAmplitude = function (item) {

    if (item.toFixed) {

        this.sumAmplitude = item;
        this.dirtyNoiseOutput = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.sumAmplitude = item;
    }
};

S.width = function (item) {

    if (item.toFixed) {

        this.width = item;
        this.sourceNaturalWidth = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.width = item;
    }
};

S.height = function (item) {

    if (item.toFixed) {

        this.height = item;
        this.sourceNaturalHeight = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.height = item;
    }
};

S.worleyDepth = function (item) {

    if (item.toFixed) {

        this.worleyDepth = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.worleyDepth = item;
    }
};

S.worleyOutput = function (item) {

    if (item.substring && WORLEY_OUTPUTS.includes(item)) {

        this.worleyOutput = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;

        this.currentAttributeValues.worleyOutput = item;
    }
};

S.colors = function (item) {

    if (this.gradient) this.gradient.set({ colors: item });
    this.dirtyOutput = true;
};


// #### Prototype functions

// `cleanOutput` - internal function called by the `notifySubscribers` function
// + The `paintCanvas` function is supplied by the _assetAdvancedFunctionality.js_ mixin
P.cleanOutput = function () {

    if (this.dirtyNoise || this.dirtyNoiseOutput) this.cleanNoise();
    if (this.dirtyOutput) this.paintCanvas();
};

P.cleanNoise = function () {

    if (this.dirtyNoise || this.dirtyNoiseOutput) {

        const {noiseEngine, seed, width, height, octaves, lacunarity, persistence, scale, octaveFunction, sumFunction} = this;

        if (noiseEngine && noiseEngine.init) {

            const scaleIdentifier = `noise-scale-${width}-${height}-${scale}`;

            let scaledData = getWorkstoreItem(scaleIdentifier);

            if (!scaledData) {

                const relativeScale = _pow(width, -scale / 100),
                    scaledXs = new Float32Array(width),
                    scaledYs = new Float32Array(height);

                for (let i = 0; i < width; i++) scaledXs[i] = i * relativeScale;
                for (let i = 0; i < height; i++) scaledYs[i] = i * relativeScale;

                scaledData = {
                    scaledXs,
                    scaledYs,
                };

                setWorkstoreItem(scaleIdentifier, scaledData);
            }

            const {scaledXs, scaledYs} = scaledData;

            let x, y, o, index,
                scaledX, scaledY,
                totalNoise, amplitude, frequency;

            if (this.dirtyNoise) {

                this.dirtyNoise = false;
                this.dirtyNoiseOutput = true;

                this.rndEngine = seededRandomNumberGenerator(seed);

                this.generatePermutationTable();

                noiseEngine.init.call(this);

                releaseFloat32Array(this.rawNoiseValues);

                const getNoiseValue = noiseEngine.getNoiseValue.bind(this),
                    rawNoiseValues = requestFloat32Array(width * height);

                let max = -1000,
                    min = 1000;

                const name = noiseEngine.name;

                if (BESPOKE_NOISE_ENGINES.includes(name)) {

                    for (y = 0; y < height; y++) {

                        scaledY = scaledYs[y];

                        for (x = 0; x < width; x++) {

                            index = (y * width) + x;
                            scaledX = scaledXs[x];

                            totalNoise = getNoiseValue(scaledX, scaledY);

                            rawNoiseValues[index] = totalNoise;

                            min = _min(min, totalNoise);
                            max = _max(max, totalNoise);
                        }
                    }
                }
                else {

                    for (y = 0; y < height; y++) {

                        scaledY = scaledYs[y];

                        for (x = 0; x < width; x++) {

                            index = (y * width) + x;
                            scaledX = scaledXs[x];

                            totalNoise = 0;
                            amplitude = 1;
                            frequency = 1;

                            for (o = 0; o < octaves; o++) {

                                let octaveNoise = getNoiseValue(scaledX * frequency, scaledY * frequency);

                                octaveNoise = octaveFunction(octaveNoise, scaledX, scaledY, o + 1);

                                octaveNoise *= amplitude;
                                totalNoise += octaveNoise;

                                frequency *= lacunarity;
                                amplitude *= persistence;
                            }

                            rawNoiseValues[index] = totalNoise;

                            min = _min(min, totalNoise);
                            max = _max(max, totalNoise);
                        }
                    }
                }

                this.rawNoiseValues = rawNoiseValues;
                this.rawNoiseMin = min;
                this.rawNoiseMax = max;
            }

            if (this.dirtyNoiseOutput) {

                this.dirtyNoiseOutput = false;

                releaseFloat32Array(this.noiseValues);

                const rawNoiseValues = this.rawNoiseValues,
                    noiseValues = requestFloat32Array(width * height),
                    min = this.rawNoiseMin,
                    noiseSpan = this.rawNoiseMax - min;

                for (y = 0; y < height; y++) {

                    scaledY = scaledYs[y];

                    for (x = 0; x < width; x++) {

                        index = (y * width) + x;
                        scaledX = scaledXs[x];

                        const clampedVal = (rawNoiseValues[index] - min) / noiseSpan;
                        noiseValues[index] = sumFunction.call(this, clampedVal, scaledX, scaledY);
                    }
                }

                this.noiseValues = noiseValues;
            }
        }
        else this.dirtyNoise = true;
    }
};

// `checkOutputValuesExist` and `getOutputValue` are internal variables that must be defined by any asset that makes use of the _assetAdvancedFunctionality.js_ mixin and its `paintCanvas` function
P.checkOutputValuesExist = function () {

    return (null != this.noiseValues) ? true : false;
};
P.getOutputValue = function (index) {

    return this.noiseValues[index];
};

// #### NoiseAsset generator functionality

// Convenience constants
const simplexConstantF = 0.5 * (_sqrt(3) - 1);
const simplexConstantG = (3 - _sqrt(3)) / 6;
const simplexConstantDoubleG = ((3 - _sqrt(3)) / 6) * 2;

const perlinGrad = new Int8Array([1,  1, -1,  1, 1, -1, -1, -1, 1,  0, -1,  0, 0,  1, 0, -1]);

const getSimplexCornerNoise = function (cx, cy, gridPos) {

    const calc = 0.5 - (cx * cx) - (cy * cy);
    if (calc < 0) return 0;

    const g = gridPos * 2;
    return calc * calc * ((perlinGrad[g] * cx) + (perlinGrad[g + 1] * cy));
};

// `noiseEngines` - a {key:object} object. Each named object contains two functions:
// + __init__ - invoked to prepare the engine for a bout of calculations - called by the `cleanNoise` function
// + __getNoiseValue__ - a function called on a per-pixel basis, which calculates the noise value for that pixel
P.noiseEngines = {

    // The classic Perlin noise generator
    [PERLIN]: {

        name: PERLIN,

        init: function () {

            const { size, rndEngine } = this;

            releaseFloat32Array(this.grad);

            const grad = requestFloat32Array(size * 2);

            let x, y, dist, index;

             for (let i = 0; i < size; i++) {

                index = i * 2;

                x = (rndEngine.random() * 2) - 1;
                y = (rndEngine.random() * 2) - 1;

                dist = _sqrt((x * x) + (y * y));

                grad[index] = x / dist;
                grad[index + 1] = y / dist;
            }

            this.grad = grad;
        },

        getNoiseValue: function (x, y) {

            const {size, perm, grad, smoothing} = this;

            let u, v, g;

            const floorX = _floor(x),
                floorY = _floor(y),
                bx0 = floorX % size,
                bx1 = (bx0 + 1) % size,
                rx0 = x - floorX,
                rx1 = rx0 - 1,
                by0 = floorY % size,
                by1 = (by0 + 1) % size,
                ry0 = y - floorY,
                ry1 = ry0 - 1;

            const i = perm[bx0],
                j = perm[bx1];

            const b00 = perm[i + by0],
                b10 = perm[j + by0],
                b01 = perm[i + by1],
                b11 = perm[j + by1];

            const sx = smoothing(rx0),
                sy = smoothing(ry0);

            g = b00 * 2;
            u = (rx0 * grad[g]) + (ry0 * grad[g + 1]);

            g = b10 * 2;
            v = (rx1 * grad[g]) + (ry0 * grad[g + 1]);

            const a = interpolate(sx, u, v);

            g = b01 * 2;
            u = (rx0 * grad[g]) + (ry1 * grad[g + 1]);

            g = b11 * 2;
            v = (rx1 * grad[g]) + (ry1 * grad[g + 1]);

            const b = interpolate(sx, u, v);

            return 0.5 * (1 + interpolate(sy, a, b));
        },
    },

    // An improved Perlin noise generator
    [IMPROVED_PERLIN]: {

        name: IMPROVED_PERLIN,

        init: λnull,

        getNoiseValue: function (x, y) {

            const {size, perm, permMod8, smoothing} = this;

            let u, v, g;

            const floorX = _floor(x),
                floorY = _floor(y),
                bx0 = floorX % size,
                bx1 = (bx0 + 1) % size,
                rx0 = x - floorX,
                rx1 = rx0 - 1,
                by0 = floorY % size,
                by1 = (by0 + 1) % size,
                ry0 = y - floorY,
                ry1 = ry0 - 1;

            const i = perm[bx0],
                j = perm[bx1];

            const b00 = permMod8[i + by0],
                b10 = permMod8[j + by0],
                b01 = permMod8[i + by1],
                b11 = permMod8[j + by1];

            const sx = smoothing(rx0),
                sy = smoothing(ry0);

            g = b00 * 2;
            u = rx0 * perlinGrad[g] + ry0 * perlinGrad[g + 1];

            g = b10 * 2;
            v = rx1 * perlinGrad[g] + ry0 * perlinGrad[g + 1];

            const a = interpolate(sx, u, v);

            g = b01 * 2;
            u = rx0 * perlinGrad[g] + ry1 * perlinGrad[g + 1];

            g = b11 * 2;
            v = rx1 * perlinGrad[g] + ry1 * perlinGrad[g + 1];

            const b = interpolate(sx, u, v);

            return 0.5 * (1 + interpolate(sy, a, b));
        }
    },

    // A successor to Perlin noise generation, by the person who invented it
    [SIMPLEX]: {

        name: SIMPLEX,

        init: λnull,

        getNoiseValue: function (x, y) {

            const { size, perm, permMod8 } = this;

            const summedCoordinates = (x + y) * simplexConstantF,
                summedX = _floor(x + summedCoordinates),
                summedY = _floor(y + summedCoordinates),
                modifiedSummedCoordinates = (summedX + summedY) * simplexConstantG;

            const cornerX = x - (summedX - modifiedSummedCoordinates),
                cornerY = y - (summedY - modifiedSummedCoordinates);

            const remainderX = summedX % size,
                remainderY = summedY % size;

            let pos = permMod8[remainderX + perm[remainderY]],
                noise = getSimplexCornerNoise(cornerX, cornerY, pos);

            pos = permMod8[remainderX + 1 + perm[remainderY + 1]];
            noise += getSimplexCornerNoise(
                cornerX - 1 + simplexConstantDoubleG,
                cornerY - 1 + simplexConstantDoubleG,
                pos
            );

            let unitA = 0,
                unitB = 1;

            if (cornerX > cornerY) {
                unitA = 1;
                unitB = 0;
            }

            pos = permMod8[remainderX + unitA + perm[remainderY + unitB]];
            noise += getSimplexCornerNoise(
                cornerX - unitA + simplexConstantG,
                cornerY - unitB + simplexConstantG,
                pos
            );

            return 0.5 + (35 * noise);
        },
    },

    // A simplified form of Perlin noise
    [VALUE]: {

        name: VALUE,

        init: function () {

            const {values, size, rndEngine} = this;

            values.length = 0;

            for(let i = 0; i < size; i++) {

                values[i] = values[i + size] = rndEngine.random();
            }
        },

        getNoiseValue: function (x, y) {

            const {values, size, perm, smoothing} = this;

            const floorX = _floor(x),
                floorY = _floor(y),
                x0 = floorX % size,
                y0 = floorY % size,
                x1 = (x0 + 1) % size,
                y1 = (y0 + 1) % size,
                vx = x - floorX,
                vy = y - floorY,
                sx = smoothing(vx),
                sy = smoothing(vy),
                i = perm[x0],
                j = perm[x1],
                p00 = perm[i + y0],
                p10 = perm[j + y0],
                p01 = perm[i + y1],
                p11 = perm[j + y1],
                i1 = interpolate(sx, values[p00], values[p10]),
                i2 = interpolate(sx, values[p01], values[p11]);

            return interpolate(sy, i1, i2);
        },
    },

    // Worley functionality found in the [jackunion/tooloud GitHub repository](https://github.com/jackunion/tooloud/blob/master/src/Worley.js)
    [WORLEY_EUCLIDEAN]: {

        name: WORLEY_EUCLIDEAN,

        init: function () {

            this.worleySeed = _floor(this.rndEngine.random() * 1000000);
        },

        getNoiseValue: function (x, y) {

            const {worleyDepth, worleyOutputFunctions, worleyOutput} = this,
                outputFunc = worleyOutputFunctions[worleyOutput];

            return this.worleyNoise(x, y, worleyDepth, EUCLIDEAN_DISTANCE, outputFunc);
        }
    },

    [WORLEY_MANHATTAN]: {

        name: WORLEY_MANHATTAN,

        init: function () {

            this.worleySeed = _floor(this.rndEngine.random() * 1000000);
        },

        getNoiseValue: function (x, y) {

            const {worleyDepth, worleyOutputFunctions, worleyOutput} = this,
                outputFunc = worleyOutputFunctions[worleyOutput];

            return this.worleyNoise(x, y, worleyDepth, MANHATTAN_DISTANCE, outputFunc);
        }
    },

    [WORLEY_CHEBYSHEV]: {

        name: WORLEY_CHEBYSHEV,

        init: function () {

            this.worleySeed = _floor(this.rndEngine.random() * 1000000);
        },

        getNoiseValue: function (x, y) {

            const {worleyDepth, worleyOutputFunctions, worleyOutput} = this,
                outputFunc = worleyOutputFunctions[worleyOutput];

            return this.worleyNoise(x, y, worleyDepth, CHEBYSHEV_DISTANCE, outputFunc);
        }
    },
};

// `generatePermutationTable` - internal function called by the `cleanNoise` function
// + The permutation tables get recalculated each time the noise data gets cleaned
// + `rndEngine` is a seedable pseudo-random number generator
P.generatePermutationTable = function () {

    const {perm, permMod8, rndEngine, size, seed} = this,
        identifier = `noise-permutation-${seed}-${size}`;

    const cached = getWorkstoreItem(identifier);

    if (cached) {

        perm.length = 0;
        permMod8.length = 0;

        perm.push(...cached.perm);
        permMod8.push(...cached.permMod8);

        return;
    }

    perm.length = 0;
    permMod8.length = 0;

    let i, j, k;

    for (i = 0; i < size; i++) perm[i] = i;

    while (--i) {

        j = _floor(rndEngine.random() * size);
        k = perm[i];
        perm[i] = perm[j];
        perm[j] = k;
    }

    for (i = 0; i < size; i++) {

        perm[i + size] = perm[i];
        permMod8[i] = permMod8[i + size] = perm[i] % 8;
    }

    setWorkstoreItem(identifier, {
        perm: [...perm],
        permMod8: [...permMod8],
    });
};

// `octaveFunctions` - a {key:functions} object holding functions used to modify octave loop results
// + calling signature: `octaveFunction(octave, scaledX, scaledY, octaveLevel)`
P.octaveFunctions = {

    none: λfirstArg,

    absolute: function (octave) {
        return _abs((octave * 2) - 1);
    },

    ridged: function (octave) {
        octave = 1 - _abs((octave * 2) - 1);
        return octave * octave;
    },

    billow: function (octave) {
        octave = _abs((octave * 2) - 1);
        return 1 - (octave * octave);
    },

    signed: function (octave) {
        return ((octave * 2) - 1) * _abs((octave * 2) - 1);
    },

    square: function (octave) {
        return octave * octave;
    },

    sqrt: function (octave) {
        return _sqrt(octave);
    },

    'terrace-light': function (octave) {
        return _floor(octave * 4) / 4;
    },

    'terrace-heavy': function (octave) {
        return _floor(octave * 8) / 8;
    },
};

// `sumFunctions` - a {key:functions} object holding functions used to modify noise values after their calculation has completed (post-processing)
// + calling signature: `sumFunction.call(this, clampedVal, x * relativeScale, y * relativeScale)`
P.sumFunctions = {

    none: λfirstArg,

    invert: function (v) {
        return 1 - v;
    },

    threshold: function (v) {
        return (v >= 0.5) ? 1 : 0;
    },

    posterize: function (v) {

        const a = _max(2, _floor(this.sumAmplitude));
        return _floor(v * a) / (a - 1);
    },

    terrace: function (v) {

        const a = _max(2, _floor(this.sumAmplitude)),
            g = _floor(v * a) / a,
            r = (v * a) - _floor(v * a);

        return g + ((r * r) / a);
    },

    contrast: function (v) {

        const a = this.sumAmplitude;

        v = (v - 0.5) * a + 0.5;

        if (v > 1) v = 1;
        else if (v < 0) v = 0;

        return v;
    },

    bias: function (v) {

        const a = this.sumAmplitude;

        if (a <= 0) return v;

        v = v / ((((1 / a) - 2) * (1 - v)) + 1);

        if (v > 1) v = 1;
        else if (v < 0) v = 0;

        return v;
    },

    gain: function (v) {

        const a = this.sumAmplitude;

        if (a <= 0) return v;

        if (v < 0.5) v = (v / ((((1 / a) - 2) * (1 - (2 * v))) + 1)) / 2;
        else v = 1 - (((1 - v) / ((((1 / a) - 2) * (1 - (2 * (1 - v)))) + 1)) / 2);

        if (v > 1) v = 1;
        else if (v < 0) v = 0;

        return v;
    },

    // These functions modify the final output using a sine frequency calculation based on the pixel position within the canvas
    'sine-x': function (v, sx) {
        return 0.5 + (_sin((sx * this.sineFrequencyCoeff) + v) / 2);
    },

    'sine-y': function (v, sx, sy) {
        return 0.5 + (_sin((sy * this.sineFrequencyCoeff) + v) / 2);
    },

    sine: function (v, sx, sy) {
        return 0.5 + (_sin((sx * this.sineFrequencyCoeff) + v) / 4) + (_sin((sy * this.sineFrequencyCoeff) + v) / 4);
    },

    // This function creates repeating bands, the frequency of which depends on the sumAmplitude attribute
    modular: function(v) {

        const g = v * this.sumAmplitude;
        return g - _floor(g);
    },

    // This function adds random interference to the final output, the strength of which depends on the sumAmplitude attribute (lower values create a stronger effect)
    random: function(v) {

        const a = this.sumAmplitude;
        const r = (_random() / a) - (0.5 / a);

        let g = v + r;

        if (g > 1) g = 1;
        else if (g < 0) g = 0;

        return g;
    },
};

// Worley functionality found in the [jackunion/tooloud GitHub repository](https://github.com/jackunion/tooloud/blob/master/src/Worley.js)
P.wXorshift = function (value) {

    let x = value ^ (value >> 12);
    x = x ^ (x << 25);
    x = x ^ (x >> 27);
    return x * 2;
};

P.wHash = function (i, j, k) {

    return (((((2166136261 ^ i) * 16777619) ^ j) * 16777619) ^ k) * 16777619 & 0xffffffff;
};

P.wProbLookup = function (value) {

    value = value & 0xffffffff;
    if (value < 393325350) return 1;
    if (value < 1022645910) return 2;
    if (value < 1861739990) return 3;
    if (value < 2700834071) return 4;
    if (value < 3372109335) return 5;
    if (value < 3819626178) return 6;
    if (value < 4075350088) return 7;
    if (value < 4203212043) return 8;
    return 9;
};

P.wInsert = function (arr, value) {

    let temp;

    for (let i = arr.length - 1; i >= 0; i--) {

        if (value > arr[i]) break;

        temp = arr[i];
        arr[i] = value;
        if (i + 1 < arr.length) arr[i + 1] = temp;
    }
};

P.worleyOutputFunctions = {

    X: function (arr) {
        return arr[0];
    },

    Y: function (arr) {
        return arr[1];
    },

    Z: function (arr) {
        return arr[2];
    },

    XminusY: function (arr) {
        return arr[0] - arr[1];
    },

    XminusZ: function (arr) {
        return arr[0] - arr[2];
    },

    YminusX: function (arr) {
        return arr[1] - arr[0];
    },

    YminusZ: function (arr) {
        return arr[1] - arr[2];
    },

    ZminusX: function (arr) {
        return arr[2] - arr[0];
    },

    ZminusY: function (arr) {
        return arr[2] - arr[1];
    },

    XaddY: function (arr) {
        return arr[0] + arr[1];
    },

    XaddZ: function (arr) {
        return arr[0] + arr[2];
    },

    YaddZ: function (arr) {
        return arr[1] + arr[2];
    },

    XaddYminusZ: function (arr) {
        return arr[0] + arr[1] - arr[2];
    },

    XaddZminusY: function (arr) {
        return arr[0] + arr[2] - arr[1];
    },

    YaddZminusX: function (arr) {
        return arr[1] + arr[2] - arr[0];
    },

    XmultiplyY: function (arr) {
        return arr[0] * arr[1];
    },

    XmultiplyZ: function (arr) {
        return arr[0] * arr[2];
    },

    YmultiplyZ: function (arr) {
        return arr[1] * arr[2];
    },

    XmultiplyYaddZ: function (arr) {
        return (arr[0] * arr[1]) + arr[2];
    },

    XmultiplyZaddY: function (arr) {
        return (arr[0] * arr[2]) + arr[1];
    },

    YmultiplyZaddX: function (arr) {
        return (arr[1] * arr[2]) + arr[0];
    },

    XmultiplyYminusZ: function (arr) {
        return (arr[0] * arr[1]) - arr[2];
    },

    XmultiplyZminusY: function (arr) {
        return (arr[0] * arr[2]) - arr[1];
    },

    YmultiplyZminusX: function (arr) {
        return (arr[1] * arr[2]) - arr[0];
    },

    sum: function (arr) {
        return arr[0] + arr[1] + arr[2];
    },
}

P.worleyNoise = function (inputX, inputY, inputZ, distanceType, outputFunc) {

    let lastRandom,
        numberFeaturePoints,
        cubeX, cubeY, cubeZ,
        randomX, randomY, randomZ,
        featureX, featureY, featureZ,
        distance;

    const distanceArray = [9999999, 9999999, 9999999];

    const baseX = _floor(inputX),
        baseY = _floor(inputY),
        baseZ = _floor(inputZ);

    for (let i = -1; i < 2; ++i) {

        for (let j = -1; j < 2; ++j) {

            for (let k = -1; k < 2; ++k) {

                cubeX = baseX + i;
                cubeY = baseY + j;
                cubeZ = baseZ + k;

                lastRandom = this.wXorshift(
                    this.wHash(
                        (cubeX + this.worleySeed) & 0xffffffff,
                        cubeY & 0xffffffff,
                        cubeZ & 0xffffffff
                    )
                );

                numberFeaturePoints = this.wProbLookup(lastRandom);

                for (let l = 0; l < numberFeaturePoints; ++l) {

                    lastRandom = this.wXorshift(lastRandom);
                    randomX = lastRandom / 0x100000000;

                    lastRandom = this.wXorshift(lastRandom);
                    randomY = lastRandom / 0x100000000;

                    lastRandom = this.wXorshift(lastRandom);
                    randomZ = lastRandom / 0x100000000;

                    featureX = randomX + cubeX;
                    featureY = randomY + cubeY;
                    featureZ = randomZ + cubeZ;

                    if (distanceType === EUCLIDEAN_DISTANCE) {

                        const dx = inputX - featureX,
                            dy = inputY - featureY,
                            dz = inputZ - featureZ;

                        distance = (dx * dx) + (dy * dy) + (dz * dz);
                    }
                    else if (distanceType === CHEBYSHEV_DISTANCE) {

                        distance = _max(
                            _abs(inputX - featureX),
                            _max(_abs(inputY - featureY), _abs(inputZ - featureZ))
                        );
                    }
                    else {

                        distance = _abs(inputX - featureX) + _abs(inputY - featureY) + _abs(inputZ - featureZ);
                    }

                    this.wInsert(distanceArray, distance);
                }
            }
        }
    }

    distanceArray[0] = distanceArray[0] < 0 ? 0 : distanceArray[0] > 1 ? 1 : distanceArray[0];
    distanceArray[1] = distanceArray[1] < 0 ? 0 : distanceArray[1] > 1 ? 1 : distanceArray[1];
    distanceArray[2] = distanceArray[2] < 0 ? 0 : distanceArray[2] > 1 ? 1 : distanceArray[2];

    return outputFunc(distanceArray);
};


// #### Factory
// ```
// scrawl.makeNoiseAsset({
//     name: 'my-noise-generator',
//     width: 50,
//     height: 50,
//     octaves: 5,
//     scale: 2,
//     noiseEngine: 'simplex',
// });
// ```
export const makeNoiseAsset = function (items) {

    if (!items) return false;
    return new NoiseAsset(items);
};

// Deprecated - old name
export const makeNoise = function (items) {

    if (!items) return false;
    return new NoiseAsset(items);
};

constructors.NoiseAsset = NoiseAsset;
