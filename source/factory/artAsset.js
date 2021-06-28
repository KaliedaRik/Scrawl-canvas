// # ArtAsset factory
// The purpose of the ArtAsset asset is to ...


// #### Current functionality
// ... TODO


// #### Demos:
// + [Canvas-044](../../demo/canvas-044.html) - Building more complex patterns
// + [Filters-019](../../demo/filters-019.html) - Using a Noise asset with a displace filter


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver, λnull, λthis, λfirstArg, removeItem, seededRandomNumberGenerator, interpolate, Ωempty } from '../core/utilities.js';

import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
import assetAdvancedMix from '../mixin/assetAdvancedFunctionality.js';
import patternMix from '../mixin/pattern.js';


// #### ArtAsset constructor
const ArtAsset = function (items = Ωempty) {

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


// #### ArtAsset prototype
let P = ArtAsset.prototype = Object.create(Object.prototype);
P.type = 'ArtAsset';
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


// #### ArtAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
// + Attributes defined in the [assetAdvancedFunctionality mixin](../mixin/assetAdvancedFunctionality.html): __color, monochromeStart, monochromeRange, gradientStart, gradientEnd, hueStart, hueRange, saturation, luminosity__.
// + Attributes defined in the [pattern mixin](../mixin/pattern.html): __repeat, patternMatrix, matrixA, matrixB, matrixC, matrixD, matrixE, matrixF__.
let defaultAttributes = {

    // The offscreen canvas dimensions, within which the noise will be generated, is set using the __width__ and __height__ attributes. These take Number values.
    width: 300,
    height: 150,

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
// // `installElement` - internal function, used by the constructor
// P.installElement = function (element) {

//     this.element = element;
//     this.engine = this.element.getContext('2d');

//     return this;
// };

// // `checkSource`
// // + Gets invoked by subscribers (who have a handle to the asset instance object) as part of the display cycle.
// // + ArtAsset assets will automatically pass this call onto `notifySubscribers`, where dirty flags get checked and rectified
// P.checkSource = function (width, height) {

//     this.notifySubscribers();
// };

// // `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
// // + This is the point when we clean Scrawl-canvas assets which have told their subscribers that asset data/attributes have updated
// P.getData = function (entity, cell) {

//     this.notifySubscribers();

//     return this.buildStyle(cell);
// };

// // `notifySubscribers`, `notifySubscriber` - overwrites the functions defined in mixin/asset.js
// P.notifySubscribers = function () {

//     if (this.dirtyOutput || this.dirtyNoise) this.cleanOutput();

//     this.subscribers.forEach(sub => this.notifySubscriber(sub), this);
// };

// P.notifySubscriber = function (sub) {

//     sub.sourceNaturalWidth = this.width;
//     sub.sourceNaturalHeight = this.height;
//     sub.sourceLoaded = true;
//     sub.source = this.element;
//     sub.dirtyImage = true;
//     sub.dirtyCopyStart = true;
//     sub.dirtyCopyDimensions = true;
//     sub.dirtyImageSubscribers = true;
// };

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

        // ArtAsset values will be calculated in the cleanNoise function, but just in case this function gets invoked directly before the 2d array has been created ...
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


// #### Factory
// ```
// scrawl.makeArtAsset({
//     name: 'my-art-generator',
//     width: 50,
//     height: 50,
//     octaves: 5,
//     scale: 2,
//     noiseEngine: 'simplex',
// });
// ```
const makeArtAsset = function (items) {

    if (!items) return false;
    return new ArtAsset(items);
};

constructors.ArtAsset = ArtAsset;


// #### Exports
export {
    makeArtAsset,
};
