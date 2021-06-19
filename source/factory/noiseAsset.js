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
//
// These engines are supported by a number of settable (and thus animatable) attributes, including special functions for smoothing the engine output. Demo [Filters-019](../../demo/filters-019.html) has been set up to allow for experimenting with these attributes
//
// The noise generated will be output to a dedicated offscreen &lt;canvas> element, which is the asset used by Picture entitys, Pattern styles and filters. The output image can be set to three color schemas:
// + __Monochrome__ (black - gray - white)
// + __Gradient__ - mediated by a Scrawl-canvas Color object
// + __Hue__ - where the engine output for each pixel is interpreted as the hue component of an HSL color
//
// (___NOTE:___ Perlin, Simplex and Value noise generator code based on code found in the [canvas-noise GitHub repository](https://github.com/lencinhaus/canvas-noise) written by [lencinhaus](https://github.com/lencinhaus).


// #### Demos:
// + [Canvas-044](../../demo/canvas-044.html) - Building more complex patterns
// + [Filters-019](../../demo/filters-019.html) - Using a Noise asset with a displace filter


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver, λnull, λthis, λfirstArg, removeItem, seededRandomNumberGenerator, interpolate, easeOutSine, easeInSine, easeOutInSine, easeOutQuad, easeInQuad, easeOutInQuad, easeOutCubic, easeInCubic, easeOutInCubic, easeOutQuart, easeInQuart, easeOutInQuart, easeOutQuint, easeInQuint, easeOutInQuint, easeOutExpo, easeInExpo, easeOutInExpo, easeOutCirc, easeInCirc, easeOutInCirc, easeOutBack, easeInBack, easeOutInBack, easeOutElastic, easeInElastic, easeOutInElastic, easeOutBounce, easeInBounce, easeOutInBounce, Ωempty } from '../core/utilities.js';

import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
import patternMix from '../mixin/pattern.js';


// #### NoiseAsset constructor
const NoiseAsset = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    let mycanvas = document.createElement('canvas');
    mycanvas.id = this.name;
    this.installElement(mycanvas);

    this.perm = [];
    this.permMod8 = [];
    this.values = [];
    this.grad = [];

    this.subscribers = [];

    this.colorFactory = makeColor({
        name: `${this.name}-color-factory`,
        minimumColor: items.gradientStart || 'red',
        maximumColor: items.gradientEnd || 'green',
    });

    this.set(this.defs);
    this.set(items);

    if (items.subscribe) this.subscribers.push(items.subscribe);

    this.dirtyOutput = true;

    return this;
};


// #### NoiseAsset prototype
let P = NoiseAsset.prototype = Object.create(Object.prototype);
P.type = 'NoiseAsset';
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


// #### NoiseAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
// + Attributes defined in the [pattern mixin](../mixin/pattern.html): __repeat, patternMatrix, matrixA, matrixB, matrixC, matrixD, matrixE, matrixF__.
let defaultAttributes = {

    // The offscreen canvas dimensions, within which the noise will be generated, is set using the __width__ and __height__ attributes. These take Number values.
    width: 300,
    height: 150,

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

    // __noiseEngine__ - String - the currently supported noise engines String values are: `perlin`, `improved-perlin`, `simplex`, `value`
    noiseEngine: 'simplex',

    // When a noise engine initializes it will create several Arrays of pseudo-random values. The __seed__ attribute is a String used to initialize the pseudo-random number generator, while the __size__ attribute is a Number (often a power of 2 value) which determines the lengths of the Arrays
    seed: 'any_random_string_will_do',
    size: 256,

    // The __scale__ attribute determines the relative scale of the noise calculation, which affects the noise output. Think of it as a rather idiosyncratic zoom factor 
    scale: 50,

    // Attributes used when calculating the noise map include:
    // + __octaves__ - a positive integer Number - the more octives, the more naturalistic the output - values over 6 are rarely productive
    // + __octaveFunction - a String identifying the function to be run at the end of each octave loop. Currently only `none` and `absolute` functions are supported
    // + __persistance__ and __lacunarity__ values change at the conclusion of each octave loop; these attributes set their initial values
    octaves: 1,
    octaveFunction: 'none',
    persistence: 0.5,
    lacunarity: 2,

    // The __smoothing__ attribute - a String value - identifies the smoothing function that will be applied pixel noise values as they are calculated. There are a wide number of functions available, including: easeOutSine, easeInSine, easeOutInSine, easeOutQuad, easeInQuad, easeOutInQuad, easeOutCubic, easeInCubic, easeOutInCubic, easeOutQuart, easeInQuart, easeOutInQuart, easeOutQuint, easeInQuint, easeOutInQuint, easeOutExpo, easeInExpo, easeOutInExpo, easeOutCirc, easeInCirc, easeOutInCirc, easeOutBack, easeInBack, easeOutInBack, easeOutElastic, easeInElastic, easeOutInElastic, easeOutBounce, easeInBounce, easeOutInBounce, cosine, hermite, quintic (default)
    smoothing: 'quintic',

    // Post-processing the noise map: The __sumFunction__ attribute - a String value - identifies the smoothing function that will be applied to the noise map once the noise calculations complete. 
    // + Permitted values include: `none`, `sine-x`, `sine-y`, `sine`, `modular`
    // + __sineFrequencyCoeff__ - a Number - is used by sine-based sum functions
    // + __modularAmplitude__ - a Number - is used by the modular sum function
    sumFunction: 'none',
    sineFrequencyCoeff: 1,
    sumAmplitude: 5,


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

// __source__
S.source = λnull;

// __subscribers__ - we disable the ability to set the subscribers Array directly. Picture entitys and Pattern styles will manage their subscription to the asset using their subscribe() and unsubscribe() functions. Filters will check for updates every time they run
S.subscribers = λnull;

S.octaveFunction = function (item) {

    this.octaveFunction = this.octaveFunctions[item] || λfirstArg;
    this.dirtyNoise = true;
    this.dirtyOutput = true;
};

S.sumFunction = function (item) {

    this.sumFunction = this.sumFunctions[item] || λfirstArg;
    this.dirtyNoise = true;
    this.dirtyOutput = true;
};

S.smoothing = function (item) {

    this.smoothing = this.smoothingFunctions[item] || λfirstArg;
    this.dirtyNoise = true;
    this.dirtyOutput = true;
};

S.noiseEngine = function (item) {

    this.noiseEngine = this.noiseEngines[item] || this.noiseEngines['simplex'];
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


// #### Prototype functions
// `installElement` - internal function, used by the constructor
P.installElement = function (element) {

    this.element = element;
    this.engine = this.element.getContext('2d');

    return this;
};

// `checkSource`
// + Gets invoked by subscribers (who have a handle to the asset instance object) as part of the display cycle.
// + NoiseAsset assets will automatically pass this call onto `notifySubscribers`, where dirty flags get checked and rectified
P.checkSource = function (width, height) {

    this.notifySubscribers();
};

// `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
// + This is the point when we clean Scrawl-canvas assets which have told their subscribers that asset data/attributes have updated
P.getData = function (entity, cell) {

    // this.checkSource(this.width, this.height);
    this.notifySubscribers();

    return this.buildStyle(cell);
};

// `notifySubscribers`, `notifySubscriber` - overwrites the functions defined in mixin/asset.js
P.notifySubscribers = function () {

    if (this.dirtyOutput || this.dirtyNoise) this.cleanOutput();

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

    if (this.dirtyNoise) this.cleanNoise();
    if (this.dirtyOutput) this.paintCanvas();
};

// `cleanNoise` - internal function called by the `cleanOutput` function
P.cleanNoise = function () {

    if (this.dirtyNoise) {

        this.dirtyNoise = false;

        let {noiseEngine, seed, width, height, element, engine, octaves, lacunarity, persistence, scale, octaveFunction, sumFunction} = this;

        if (noiseEngine && noiseEngine.init) {

            // Seed our pseudo-random number generator
            this.rndEngine = seededRandomNumberGenerator(seed);

            // Generate the permutations table(s)
            this.generatePermutationTable();

            // Initialize the appropriate noise function
            noiseEngine.init.call(this);

            let x, y, o, i, iz,
                noiseValues = [],
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
            let relativeScale = Math.pow(width, -scale / 100);

            let max = -1000, 
                min = 1000;

            // This is the core of the calculation, performed for each cell in the noiseValues 2d array
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
                    min = Math.min(min, totalNoise);
                    max = Math.max(max, totalNoise);
                }
            }

            // Calculate the span of numbers generated - we need to get all the results in the range 0 to 1
            let noiseSpan = max - min;

            for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {

                    scaledX = x * relativeScale;
                    scaledY = y * relativeScale;

                    // Clamp the cell's noise value to between 0 and 1, then update it with the post-calculation sumFunction, if required
                    let clampedVal = (noiseValues[y][x] - min) / noiseSpan;
                    noiseValues[y][x] = sumFunction.call(this, clampedVal, x * relativeScale, y * relativeScale);
                }
            }
            // Update the cached noise values arrays
            this.noiseValues = noiseValues;
        }
        else this.dirtyNoise = true;
    }
};

// `paintCanvas` - internal function called by the `cleanOutput` function
P.paintCanvas = function () {

    if (this.dirtyOutput) {

        this.dirtyOutput = false;

        let {noiseValues, element, engine, width, height, color, colorFactory, monochromeStart, monochromeRange, hueStart, hueRange, saturation, luminosity} = this;

        // NoiseAsset values will be calculated in the cleanNoise function, but just in case this function gets invoked directly before the 2d array has been created ...
        if (null != noiseValues) {

            // Update the Canvas element's dimensions - this will also clear the canvas display
            element.width = width;
            element.height = height;

            // Rebuild the display, pixel-by-pixel
            switch (color) {

                case 'hue' :

                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {

                            engine.fillStyle = `hsl(${(hueStart + (noiseValues[y][x] * hueRange)) % 360}, ${saturation}%, ${luminosity}%)`;
                            engine.fillRect(x, y, 1, 1);
                        }
                    }
                    break;

                case 'gradient' :

                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {

                            engine.fillStyle = colorFactory.getRangeColor(noiseValues[y][x]);
                            engine.fillRect(x, y, 1, 1);
                        }
                    }
                    break;

                // The default color preference is monochrome
                default :

                    if (monochromeRange > 0) {

                        if (monochromeStart + monochromeRange > 255) monochromeRange = 255 - monochromeStart;
                    }
                    else if (monochromeRange < 0) {

                        if (monochromeStart - monochromeRange < 0) monochromeRange = monochromeStart;
                    }

                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {

                            let gray = Math.floor(monochromeStart + (noiseValues[y][x] * monochromeRange));

                            engine.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;

                            engine.fillRect(x, y, 1, 1);
                        }
                    }
            }
        }
        else this.dirtyOutput = true;
    }
};

// #### NoiseAsset generator functionality

// Convenience constants
// P.F = 0.5 * (Math.sqrt(3) - 1);
// P.G = (3 - Math.sqrt(3)) / 6;
P.simplexConstantF = 0.5 * (Math.sqrt(3) - 1);
P.simplexConstantG = (3 - Math.sqrt(3)) / 6;
P.simplexConstantDoubleG = ((3 - Math.sqrt(3)) / 6) * 2;
P.perlinGrad = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];

// `noiseEngines` - a {key:object} object. Each named object contains two functions:
// + __init__ - invoked to prepare the engine for a bout of calculations - called by the `cleanNoise` function
// + __getNoiseValue__ - a function called on a per-pixel basis, which calculates the noise value for that pixel
P.noiseEngines = {

    // The classic Perlin noise generator
    'perlin': {

        init: function () {

            const {grad, size, rndEngine} = this;

            let dist;
            
            grad.length = 0;

            for(let i = 0; i < size; i++) {

                grad[i] = [(rndEngine.random() * 2) - 1, (rndEngine.random() * 2) - 1];
                dist = Math.sqrt(grad[i][0] *  grad[i][0] + grad[i][1] * grad[i][1]);
                grad[i][0] /= dist;
                grad[i][1] /= dist;
            }
        },

        getNoiseValue: function (x, y) {

            const {size, perm, grad, smoothing} = this;

            let a, b, u, v;

            let bx0 = Math.floor(x) % size,
                bx1 = (bx0 + 1) % size;

            let rx0 = x - Math.floor(x),
                rx1 = rx0 - 1;

            let by0 = Math.floor(y) % size,
                by1 = (by0 + 1) % size;

            let ry0 = y - Math.floor(y),
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
    'improved-perlin': {

        init: λnull,

        getNoiseValue: function (x, y) {

            const {size, perm, permMod8, perlinGrad, smoothing} = this;

            let a, b, u, v;

            let bx0 = Math.floor(x) % size, 
                bx1 = (bx0 + 1) % size;

            let rx0 = x - Math.floor(x), 
                rx1 = rx0 - 1;

            let by0 = Math.floor(y) % size, 
                by1 = (by0 + 1) % size;

            let ry0 = y - Math.floor(y), 
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
    'simplex': {

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
                summedX = Math.floor(x + summedCoordinates),
                summedY = Math.floor(y + summedCoordinates),
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
    'value': {

        init: function () {

            const {values, size, rndEngine} = this;

            values.length = 0;

            for(let i = 0; i < size; i++) {

                values[i] = values[i + size] = rndEngine.random();
            }
        },

        getNoiseValue: function (x, y) {

            const {values, size, perm, smoothing} = this;

            let x0 = Math.floor(x) % size,
                y0 = Math.floor(y) % size,
                x1 = (x0 + 1) % size,
                y1 = (y0 + 1) % size,
                vx = x - Math.floor(x),
                vy = y - Math.floor(y),
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
    'stripes': {

        init: λnull,

        getNoiseValue: function (x, y) {

            return (x / 5) + (y / 5);
        }
    },

    // As for stripes, but can apply smoothing function to the output
    // + interesting things start to happen when scale is set to on/around 100 and canvas dimensions are roughly equal, alongside a higher value for sumAmplitude. Best viewed with a modular sum function
    'smoothed-stripes': {

        init: λnull,

        getNoiseValue: function (x, y) {

            const {smoothing} = this;

            let sx = smoothing(x),
                sy = smoothing(y);

            return (sx / 5) + (sy / 5);
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

        j = Math.floor(rndEngine.random() * size);
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
    absolute: function (octave) { return Math.abs((octave * 2) - 1) },
};

// `sumFunctions` - a {key:functions} object holding functions used to modify noise values after their calculation has completed (post-processing)
// + calling signature: `sumFunction.call(this, clampedVal, x * relativeScale, y * relativeScale)`
P.sumFunctions = {

    none: λfirstArg,

    // These functions modify the final output using a sine frequency calculation based on the pixel position within the canvas
    'sine-x': function (v, sx, sy) { return 0.5 + (Math.sin((sx * this.sineFrequencyCoeff) + v) / 2) },
    'sine-y': function (v, sx, sy) { return 0.5 + (Math.sin((sy * this.sineFrequencyCoeff) + v) / 2) },
    sine: function (v, sx, sy) { return 0.5 + (Math.sin((sx * this.sineFrequencyCoeff) + v) / 4) + (Math.sin((sy * this.sineFrequencyCoeff) + v) / 4) },

    // This function creates repeating bands, the frequency of which depends on the sumAmplitude attribute
    modular: function(v) {
        let g = v * this.sumAmplitude;
        return g - Math.floor(g);
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

// `smoothingFunctions` - a {key:function} object containing various ___fade functions___ which can be used to smooth calculated coordinate values so that they will ease towards integral values.
// + Used by the "perlin_classic", "perlin_improved" and "value" getNoiseValue functions; the "simplex" getNoiseValue function does away with the need for a smoothing operation.
// + Also used by the "smoothed-stripes" getNoiseValue function.
// + calling signature: `smoothing(value)`
P.smoothingFunctions = {

    // __none__ - effectively linear - no smoothing gets performed
    none: λfirstArg,

    easeOutSine,
    easeInSine,
    easeOutInSine,
    easeOutQuad,
    easeInQuad,
    easeOutInQuad,
    easeOutCubic,
    easeInCubic,
    easeOutInCubic,
    easeOutQuart,
    easeInQuart,
    easeOutInQuart,
    easeOutQuint,
    easeInQuint,
    easeOutInQuint,
    easeOutExpo,
    easeInExpo,
    easeOutInExpo,
    easeOutCirc,
    easeInCirc,
    easeOutInCirc,
    easeOutBack,
    easeInBack,
    easeOutInBack,
    easeOutElastic,
    easeInElastic,
    easeOutInElastic,
    easeOutBounce,
    easeInBounce,
    easeOutInBounce,

    // __cosine__ - a cosine-based interpolator
    cosine: function(t) { return .5 * (1 + Math.cos((1 - t) * Math.PI)) },

    // __hermite__ - a cubic Hermite interpolator
    hermite: function(t) { return t * t * (-t * 2 + 3) },

    // __quintic__ - the original ease function used by Perlin
    quintic: function(t) { return t * t * t * (t * (t * 6 - 15) + 10) },
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
const makeNoiseAsset = function (items) {

    if (!items) return false;
    return new NoiseAsset(items);
};

// Deprecated - old name
const makeNoise = makeNoiseAsset;

constructors.NoiseAsset = NoiseAsset;


// #### Exports
export {
    makeNoiseAsset,
    makeNoise,
};
