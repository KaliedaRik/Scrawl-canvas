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
// + Stripes
// + Smoothed stripes
// + Worley - both euclidean and manhattan versions
//
// These engines are supported by a number of settable (and thus animatable) attributes, including special functions for smoothing the engine output. Demo [Canvas-060](../../demo/canvas-060.html) has been set up to allow for experimenting with these attributes
//
// #### Demos:
// + [Canvas-044](../../demo/canvas-044.html) - Building more complex patterns
// + [Canvas-060](../../demo/canvas-060.html) - Noise asset functionality


// #### Imports
import { constructors } from '../core/library.js';
import { seededRandomNumberGenerator } from '../core/random-seed.js';

import { doCreate, easeEngines, interpolate, mergeOver, removeItem, λfirstArg, λnull, λthis, Ωempty } from '../core/utilities.js';

import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
import assetAdvancedMix from '../mixin/assetAdvancedFunctionality.js';
import patternMix from '../mixin/pattern.js';

import { $X, _abs, _floor, _max, _min, _pow, _random, _sin, _sqrt, ASSET, BESPOKE_NOISE_ENGINES, DEFAULT_SEED, EUCLIDEAN_DISTANCE, IMPROVED_PERLIN, MANHATTAN_DISTANCE, NONE, PERLIN, QUINTIC, SIMPLEX, SMOOTHED_STRIPES, STRIPES, T_NOISE_ASSET, VALUE, WORLEY_EUCLIDEAN, WORLEY_MANHATTAN, WORLEY_OUTPUTS } from '../core/shared-vars.js';


// #### NoiseAsset constructor
const NoiseAsset = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.installElement(this.name);

    this.perm = [];
    this.permMod8 = [];
    this.values = [];
    this.grad = [];

    this.subscribers = [];

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
// + [base](../mixin/base.html)
// + [asset](../mixin/asset.html)
// + [assetAdvancedFunctionality](../mixin/assetAdvancedFunctionality.html)
// + [pattern](../mixin/pattern.html)
baseMix(P);
assetMix(P);
assetAdvancedMix(P);
patternMix(P);


// #### NoiseAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
// + Attributes defined in the [assetAdvancedFunctionality mixin](../mixin/assetAdvancedFunctionality.html): __color, monochromeStart, monochromeRange, gradientStart, gradientEnd, hueStart, hueRange, saturation, luminosity__.
// + Attributes defined in the [pattern mixin](../mixin/pattern.html): __repeat, patternMatrix, matrixA, matrixB, matrixC, matrixD, matrixE, matrixF__.
const defaultAttributes = {

    // The offscreen canvas dimensions, within which the noise will be generated, is set using the __width__ and __height__ attributes. These take Number values.
    width: 300,
    height: 150,

    // __noiseEngine__ - String - the currently supported noise engines String values are: `perlin`, `improved-perlin`, `simplex`, `value`, `stripes`, `smoothed-stripes`, `worley-euclidean`, `worley-manhattan`
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
P.clone = λthis;


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __source__
S.source = λnull;

// __subscribers__ - we disable the ability to set the subscribers Array directly. Picture entitys and Pattern styles will manage their subscription to the asset using their subscribe() and unsubscribe() functions. Filters will check for updates every time they run
S.subscribers = λnull;

S.octaveFunction = function (item) {

    this.octaveFunction = (null != this.octaveFunctions[item]) ? this.octaveFunctions[item] : λfirstArg;
    this.dirtyNoise = true;
    this.dirtyOutput = true;
};

S.sumFunction = function (item) {

    this.sumFunction = (null != this.sumFunctions[item]) ? this.sumFunctions[item] : λfirstArg;
    this.dirtyNoise = true;
    this.dirtyOutput = true;
};

S.smoothing = function (item) {

    this.smoothing = (null != easeEngines[item]) ? easeEngines[item] : λfirstArg;
    this.dirtyNoise = true;
    this.dirtyOutput = true;
};

S.noiseEngine = function (item) {

    this.noiseEngine = (null != this.noiseEngines[item]) ? this.noiseEngines[item] : this.noiseEngines[SIMPLEX];
    this.dirtyNoise = true;
    this.dirtyOutput = true;
};

S.octaves = function (item) {

    if (item.toFixed) {

        this.octaves = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.seed = function (item) {

    if (item.substring) {

        this.seed = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.scale = function (item) {

    if (item.toFixed) {

        this.scale = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.size = function (item) {

    if (item.toFixed) {

        this.size = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.persistence = function (item) {

    if (item.toFixed) {

        this.persistence = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.lacunarity = function (item) {

    if (item.toFixed) {

        this.lacunarity = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.sineFrequencyCoeff = function (item) {

    if (item.toFixed) {

        this.sineFrequencyCoeff = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

// `modularAmplitude` - name changed to `sumAmplitude`
S.modularAmplitude = function (item) {

    if (item.toFixed) {

        this.sumAmplitude = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.sumAmplitude = function (item) {

    if (item.toFixed) {

        this.sumAmplitude = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.width = function (item) {

    if (item.toFixed) {

        this.width = item;
        this.sourceNaturalWidth = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.height = function (item) {

    if (item.toFixed) {

        this.height = item;
        this.sourceNaturalHeight = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.worleyDepth = function (item) {

    if (item.toFixed) {

        this.worleyDepth = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.worleyOutput = function (item) {

    if (item.substring && WORLEY_OUTPUTS.includes(item)) {

        this.worleyOutput = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};


// #### Prototype functions

// `cleanOutput` - internal function called by the `notifySubscribers` function
// + The `paintCanvas` function is supplied by the _assetAdvancedFunctionality.js_ mixin
P.cleanOutput = function () {

    if (this.dirtyNoise) this.cleanNoise();
    if (this.dirtyOutput) this.paintCanvas();
};

// `cleanNoise` - internal function called by the `cleanOutput` function
P.cleanNoise = function () {

    if (this.dirtyNoise) {

        this.dirtyNoise = false;

        const {noiseEngine, seed, width, height, element, engine, octaves, lacunarity, persistence, scale, octaveFunction, sumFunction} = this;

        if (noiseEngine && noiseEngine.init) {

            // Seed our pseudo-random number generator
            this.rndEngine = seededRandomNumberGenerator(seed);

            // Generate the permutations table(s)
            this.generatePermutationTable();

            // Initialize the appropriate noise function
            noiseEngine.init.call(this);

           const noiseValues = [];

            let x, y, o, i, iz,
                scaledX, scaledY,
                totalNoise, amplitude, frequency;

            // Prepare the noiseValues 2d array
            for (y = 0; y < height; y++) {

                noiseValues[y] = [];

                for (x = 0; x < width; x++) {
                    noiseValues[y][x] = [];
                }
            }

            // Calculate a relative scale, and setup min/max variables
            const relativeScale = _pow(width, -scale / 100);

            let max = -1000, 
                min = 1000;

            // This is the core of the calculation, performed for each cell in the noiseValues 2d array
            const name = noiseEngine.name;
            if (BESPOKE_NOISE_ENGINES.includes(name)) {

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {

                        scaledX = x * relativeScale;
                        scaledY = y * relativeScale;

                        totalNoise = noiseEngine.getNoiseValue.call(this, scaledX, scaledY);

                        noiseValues[y][x] = totalNoise;

                        min = _min(min, totalNoise);
                        max = _max(max, totalNoise);
                    }
                }
            }
            else {

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {

                        // We can modify the output by scaling it
                        // + Note that modifying the canvas dimensions (width, height) can also have a scaling effect
                        scaledX = x * relativeScale;
                        scaledY = y * relativeScale;

                        // Amplitude and frequency will update once per octave calculation; totalNoise is the sum of all octave results
                        totalNoise = 0;
                        amplitude = 1; 
                        frequency = 1;

                        // The calculation will be performed at least once
                        // - For some reason the literature insists on calling these loops "octaves"
                        for (o = 0; o < octaves; o++) {

                            // Call the appropriate getNoiseValue function
                            // + The result needs to be stored in a variable scoped locally to this loop iteration
                            let octaveNoise = noiseEngine.getNoiseValue.call(this, scaledX * frequency, scaledY * frequency);

                            // Update octave with a post-calculation octaveFunction, if required
                            octaveNoise = octaveFunction(octaveNoise, scaledX, scaledY, o + 1);

                            // Modify result by the current amplitude, and add to the running total
                            octaveNoise *= amplitude;
                            totalNoise += octaveNoise;

                            // Update the variables that change over multiple octave loops
                            frequency *= lacunarity;
                            amplitude *= persistence;
                        }
                        // Update the noise value in its array
                        noiseValues[y][x] = totalNoise;

                        // ... and check for max/min spread of the generated values
                        min = _min(min, totalNoise);
                        max = _max(max, totalNoise);
                    }
                }
            }

            // Calculate the span of numbers generated - we need to get all the results in the range 0 to 1
            const noiseSpan = max - min;

            for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {

                    scaledX = x * relativeScale;
                    scaledY = y * relativeScale;

                    // Clamp the cell's noise value to between 0 and 1, then update it with the post-calculation sumFunction, if required
                    const clampedVal = (noiseValues[y][x] - min) / noiseSpan;
                    noiseValues[y][x] = sumFunction.call(this, clampedVal, x * relativeScale, y * relativeScale);
                }
            }
            // Update the cached noise values arrays
            this.noiseValues = noiseValues;
        }
        else this.dirtyNoise = true;
    }
};

// `checkOutputValuesExist` and `getOutputValue` are internal variables that must be defined by any asset that makes use of the _assetAdvancedFunctionality.js_ mixin and its `paintCanvas` function
P.checkOutputValuesExist = function () {

    return (null != this.noiseValues) ? true : false;
};
P.getOutputValue = function (index, width) {

    let row = _floor(index / width),
        col = index - (row * width);

    return this.noiseValues[row][col];
};


// #### NoiseAsset generator functionality

// Convenience constants
// P.F = 0.5 * (Math.sqrt(3) - 1);
// P.G = (3 - Math.sqrt(3)) / 6;
P.simplexConstantF = 0.5 * (_sqrt(3) - 1);
P.simplexConstantG = (3 - _sqrt(3)) / 6;
P.simplexConstantDoubleG = ((3 - _sqrt(3)) / 6) * 2;
P.perlinGrad = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];

// `noiseEngines` - a {key:object} object. Each named object contains two functions:
// + __init__ - invoked to prepare the engine for a bout of calculations - called by the `cleanNoise` function
// + __getNoiseValue__ - a function called on a per-pixel basis, which calculates the noise value for that pixel
P.noiseEngines = {

    // The classic Perlin noise generator
    [PERLIN]: {

        name: PERLIN,

        init: function () {

            const {grad, size, rndEngine} = this;

            let dist;
            
            grad.length = 0;

            for(let i = 0; i < size; i++) {

                grad[i] = [(rndEngine.random() * 2) - 1, (rndEngine.random() * 2) - 1];
                dist = _sqrt(grad[i][0] *  grad[i][0] + grad[i][1] * grad[i][1]);
                grad[i][0] /= dist;
                grad[i][1] /= dist;
            }
        },

        getNoiseValue: function (x, y) {

            const {size, perm, grad, smoothing} = this;

            let a, b, u, v;

            let bx0 = _floor(x) % size,
                bx1 = (bx0 + 1) % size;

            let rx0 = x - _floor(x),
                rx1 = rx0 - 1;

            let by0 = _floor(y) % size,
                by1 = (by0 + 1) % size;

            let ry0 = y - _floor(y),
                ry1 = ry0 - 1;

            let i = perm[bx0],
                j = perm[bx1];

            let b00 = perm[i + by0],
                b10 = perm[j + by0],
                b01 = perm[i + by1],
                b11 = perm[j + by1];

            let sx = smoothing(rx0),
                sy = smoothing(ry0);
            
            u = rx0 * grad[b00][0] + ry0 * grad[b00][1];
            v = rx1 * grad[b10][0] + ry0 * grad[b10][1];
            a = interpolate(sx, u, v);
            
            u = rx0 * grad[b01][0] + ry1 * grad[b01][1];
            v = rx1 * grad[b11][0] + ry1 * grad[b11][1];
            b = interpolate(sx, u, v);
            
            return 0.5 * (1 + interpolate(sy, a, b));
        },
    },

    // An improved Perlin noise generator
    [IMPROVED_PERLIN]: {

        name: IMPROVED_PERLIN,

        init: λnull,

        getNoiseValue: function (x, y) {

            const {size, perm, permMod8, perlinGrad, smoothing} = this;

            let a, b, u, v;

            let bx0 = _floor(x) % size, 
                bx1 = (bx0 + 1) % size;

            let rx0 = x - _floor(x), 
                rx1 = rx0 - 1;

            let by0 = _floor(y) % size, 
                by1 = (by0 + 1) % size;

            let ry0 = y - _floor(y), 
                ry1 = ry0 - 1;

            let i = perm[bx0], 
                j = perm[bx1]; 

            let b00 = permMod8[i + by0], 
                b10 = permMod8[j + by0], 
                b01 = permMod8[i + by1], 
                b11 = permMod8[j + by1];
            
            let sx = smoothing(rx0),
                sy = smoothing(ry0);
            
            u = rx0 * perlinGrad[b00][0] + ry0 * perlinGrad[b00][1];
            v = rx1 * perlinGrad[b10][0] + ry0 * perlinGrad[b10][1];
            a = interpolate(sx, u, v);
            
            u = rx0 * perlinGrad[b01][0] + ry1 * perlinGrad[b01][1];
            v = rx1 * perlinGrad[b11][0] + ry1 * perlinGrad[b11][1];
            b = interpolate(sx, u, v);

            return 0.5 * (1 + interpolate(sy, a, b));
        }
    },

    // A successor to Perlin noise generation, by the person who invented it
    [SIMPLEX]: {

        name: SIMPLEX,

        init: λnull,

        getNoiseValue: function (x, y) {

            const getCornerNoise = function (cx, cy, gridPos) {

                let calc = 0.5 - (cx * cx) - (cy * cy);
                if (calc < 0) return 0;

                let [gx, gy] = perlinGrad[gridPos];
                return calc * calc * ((gx * cx) + (gy * cy));
            };
            
            const {simplexConstantF, simplexConstantG, simplexConstantDoubleG, size, perlinGrad, perm, permMod8} = this;
            
            let summedCoordinates = (x + y) * simplexConstantF,
                summedX = _floor(x + summedCoordinates),
                summedY = _floor(y + summedCoordinates),
                modifiedSummedCoordinates = (summedX + summedY) * simplexConstantG;

            let cornerX = x - (summedX - modifiedSummedCoordinates),
                cornerY = y - (summedY - modifiedSummedCoordinates);
            
            let remainderX = summedX % size,
                remainderY = summedY % size;

            let pos = permMod8[remainderX + perm[remainderY]],
                noise = getCornerNoise(cornerX, cornerY, pos);

            pos = permMod8[remainderX + 1 + perm[remainderY + 1]]
            noise += getCornerNoise((cornerX - 1 + simplexConstantDoubleG), (cornerY - 1 + simplexConstantDoubleG), pos);

            let unitA = 0,
                unitB = 1;

            if (cornerX > cornerY) {
                unitA = 1;
                unitB = 0;
            }

            pos = permMod8[remainderX + unitA + perm[remainderY + unitB]];
            noise += getCornerNoise((cornerX - unitA + simplexConstantG), (cornerY - unitB + simplexConstantG), pos);

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

            let x0 = _floor(x) % size,
                y0 = _floor(y) % size,
                x1 = (x0 + 1) % size,
                y1 = (y0 + 1) % size,
                vx = x - _floor(x),
                vy = y - _floor(y),
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

    // For generating repeated stripe gradients, set the sum function to `modular` and vary the canvas width/height attributes to set the stripe direction; stripe spacing can be varied using the modular amplitude value. Other sum function values can also produce interesting effects
    [STRIPES]: {

        name: STRIPES,

        init: λnull,

        getNoiseValue: function (x, y) {

            return (x / 5) + (y / 5);
        }
    },

    // As for stripes, but can apply smoothing function to the output
    // + interesting things start to happen when scale is set to on/around 100 and canvas dimensions are roughly equal, alongside a higher value for sumAmplitude. Best viewed with a modular sum function
    [SMOOTHED_STRIPES]: {

        name: SMOOTHED_STRIPES,

        init: λnull,

        getNoiseValue: function (x, y) {

            const {smoothing} = this;

            let sx = smoothing(x),
                sy = smoothing(y);

            return (sx / 5) + (sy / 5);
        }
    },

    // Worley functionality found in the [jackunion/tooloud GitHub repository](https://github.com/jackunion/tooloud/blob/master/src/Worley.js)
    [WORLEY_EUCLIDEAN]: {

        name: WORLEY_EUCLIDEAN,

        init: function () {

            this.worleySeed = _floor(this.rndEngine.random() * 1000000);
        },

        getNoiseValue: function (x, y) {

            const {width, height, worleyDepth, worleyDistanceFunctions, worleyOutputFunctions, worleyOutput} = this;

            const f = worleyDistanceFunctions[EUCLIDEAN_DISTANCE];
            const o = worleyOutputFunctions[worleyOutput];

            return this.worleyNoise.call(this, {x:x, y:y, z:worleyDepth}, f, o);
        }
    },

    // For generating repeated stripe gradients, set the sum function to `modular` and vary the canvas width/height attributes to set the stripe direction; stripe spacing can be varied using the modular amplitude value. Other sum function values can also produce interesting effects
    [WORLEY_MANHATTAN]: {

        name: WORLEY_MANHATTAN,

        init: function () {

            this.worleySeed = _floor(this.rndEngine.random() * 1000000);
        },

        getNoiseValue: function (x, y) {

            const {width, height, worleyDepth, worleyDistanceFunctions, worleyOutputFunctions, worleyOutput} = this;

            const f = worleyDistanceFunctions[MANHATTAN_DISTANCE];
            const o = worleyOutputFunctions[worleyOutput];

            return this.worleyNoise.call(this, {x:x, y:y, z:worleyDepth}, f, o);
        }
    },
};

// `generatePermutationTable` - internal function called by the `cleanNoise` function
// + The permutation tables get recalculated each time the noise data gets cleaned
// + `rndEngine` is a seedable pseudo-random number generator
P.generatePermutationTable = function () {

    const {perm, permMod8, rndEngine, size} = this;

    perm.length = 0;
    permMod8.length = 0;

    let i, j, k;

    for(i = 0; i < size; i++) {

        perm[i] = i;
    }
    
    while (--i) {

        j = _floor(rndEngine.random() * size);
        k = perm[i];
        perm[i] = perm[j];
        perm[j] = k;
    }
    
    for(i = 0; i < size; i++) {

        perm[i + size] = perm[i];
        permMod8[i] = permMod8[i + size] = perm[i] % 8;
    }
};

// `octaveFunctions` - a {key:functions} object holding functions used to modify octave loop results
// + calling signature: `octaveFunction(octave, scaledX, scaledY, o + 1)`
P.octaveFunctions = {

    none: λfirstArg,
    absolute: function (octave) { return _abs((octave * 2) - 1) },
};

// `sumFunctions` - a {key:functions} object holding functions used to modify noise values after their calculation has completed (post-processing)
// + calling signature: `sumFunction.call(this, clampedVal, x * relativeScale, y * relativeScale)`
P.sumFunctions = {

    none: λfirstArg,

    // These functions modify the final output using a sine frequency calculation based on the pixel position within the canvas
    'sine-x': function (v, sx, sy) { return 0.5 + (_sin((sx * this.sineFrequencyCoeff) + v) / 2) },
    'sine-y': function (v, sx, sy) { return 0.5 + (_sin((sy * this.sineFrequencyCoeff) + v) / 2) },
    sine: function (v, sx, sy) { return 0.5 + (_sin((sx * this.sineFrequencyCoeff) + v) / 4) + (_sin((sy * this.sineFrequencyCoeff) + v) / 4) },

    // This function creates repeating bands, the frequency of which depends on the sumAmplitude attribute
    modular: function(v) {
        let g = v * this.sumAmplitude;
        return g - _floor(g);
    },

    // This function adds random interference to the final output, the strength of which depends on the sumAmplitude attribute (lower values create a stronger effect)
    random: function(v) {
        let a = this.sumAmplitude;
        let r = (Math.random() / a) - (0.5 / a);
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

P.worleyDistanceFunctions = {

    [EUCLIDEAN_DISTANCE]: function (p1, p2) {

        const d = function (p1, p2) {
            return [p1.x - p2.x, p1.y - p2.y, p1.z - p2.z];
        };

        return d(p1, p2).reduce((sum, x) => sum + (x * x), 0);
    },

    [MANHATTAN_DISTANCE]: function (p1, p2) {

        const d = function (p1, p2) {
            return [p1.x - p2.x, p1.y - p2.y, p1.z - p2.z];
        };

        return d(p1, p2).reduce((sum, x) => sum + _abs(x), 0);
    },
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

P.worleyNoise = function (input, distanceFunc, outputFunc) {

    let lastRandom,
        numberFeaturePoints,
        randomDiff = { x: 0, y: 0, z: 0 },
        featurePoint = { x: 0, y: 0, z: 0 };

    let cubeX, cubeY, cubeZ;

    let distanceArray = [9999999, 9999999, 9999999];

    let {x:inputX, y:inputY, z:inputZ} = input;
    inputX = _floor(inputX);
    inputY = _floor(inputY);
    inputZ = _floor(inputZ);

    for (let i = -1; i < 2; ++i) {

        for (let j = -1; j < 2; ++j) {

            for (let k = -1; k < 2; ++k) {

                cubeX = inputX + i;
                cubeY = inputY + j;
                cubeZ = inputZ + k;

                lastRandom = this.wXorshift(
                    this.wHash(
                        (cubeX + this.worleySeed) & 0xffffffff,
                        (cubeY) & 0xffffffff,
                        (cubeZ) & 0xffffffff
                    )
                );

                numberFeaturePoints = this.wProbLookup(lastRandom);

                for (let l = 0; l < numberFeaturePoints; ++l) {

                    lastRandom = this.wXorshift(lastRandom);
                    randomDiff.X = lastRandom / 0x100000000;

                    lastRandom = this.wXorshift(lastRandom);
                    randomDiff.Y = lastRandom / 0x100000000;

                    lastRandom = this.wXorshift(lastRandom);
                    randomDiff.Z = lastRandom / 0x100000000;

                    featurePoint = {
                        x: randomDiff.X + cubeX,
                        y: randomDiff.Y + cubeY,
                        z: randomDiff.Z + cubeZ
                    };

                    this.wInsert(distanceArray, distanceFunc(input, featurePoint));
                }
            }
        }
    }
    const preFinal = distanceArray.map(x => x < 0 ? 0 : x > 1 ? 1 : x );
    const final = outputFunc(preFinal);

    return final;
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
export const makeNoise = makeNoiseAsset;

constructors.NoiseAsset = NoiseAsset;
