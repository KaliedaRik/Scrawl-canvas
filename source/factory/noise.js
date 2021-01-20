// # Noise factory
// TODO: documentatiomn


// #### Demos:
// + TODO: demos


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver, λnull, λthis, λfirstArg, removeItem, seededRandomNumberGenerator } from '../core/utilities.js';

import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
import patternMix from '../mixin/pattern.js';


// #### Noise constructor
const Noise = function (items = {}) {

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


// #### Noise prototype
let P = Noise.prototype = Object.create(Object.prototype);
P.type = 'Noise';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
// + [base](../mixin/base.html)
// + [entity](../mixin/entity.html)
P = baseMix(P);
P = assetMix(P);
P = patternMix(P);


// #### Noise attributes
let defaultAttributes = {

    width: 300,
    height: 150,

    seed: 'noize',
    noiseFunction: 'perlin_improved',
    smoothing: 'quintic',
    scale: 50,
    size: 256,
    octaves: 1,
    persistence: 0.5,
    lacunarity: 2,
    independent: false,
    octaveFunction: 'none',
    sumFunction: 'none',
    sineFrequencyCoeff: 1,
    modularAmplitude: 5,

    color: 'monochrome',

    monochromeStart: 0,
    monochromeRange: 255,

    hueStart: 0,
    hueRange: 120,
    saturation: 100,
    luminosity: 50,

    gradientStart: '#ff0000',
    gradientEnd: '#00ff00',
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

S.noiseFunction = function (item) {

    this.noiseFunction = this.noiseFunctions[item] || this.noiseFunctions['simplex'];
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

P.supportedColorSchemes = ['monochrome', 'gradient', 'hue'];
S.color = function (item) {

    if (this.supportedColorSchemes.indexOf(item) >= 0) {

        this.color = item;
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

S.independent = function (item) {

    this.independent = !!item;
    this.dirtyNoise = true;
    this.dirtyOutput = true;
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

    if (item.toFixed && item >= 0 && item < 256) {

        this.monochromeStart = Math.floor(item);
        this.dirtyOutput = true;
    }
};

S.monochromeRange = function (item) {

    if (item.toFixed && item >= 0 && item < 256) {

        this.monochromeRange = Math.floor(item);
        this.dirtyOutput = true;
    }
};

S.hueStart = function (item) {

    if (item.toFixed) {

        this.hueStart = Math.floor(item);
        this.dirtyOutput = true;
    }
};

S.hueRange = function (item) {

    if (item.toFixed) {

        this.hueRange = Math.floor(item);
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

S.sineFrequencyCoeff = function (item) {

    if (item.toFixed) {

        this.sineFrequencyCoeff = item;
        this.dirtyNoise = true;
        this.dirtyOutput = true;
    }
};

S.modularAmplitude = function (item) {

    if (item.toFixed) {

        this.modularAmplitude = item;
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
P.presetTo = function (preset) {

    if (preset.substring) {

        this.dirtyNoise = true;
        this.dirtyOutput = true;

        switch (preset) {

            case 'plain' :
                this.octaves = 1;
                this.octaveFunction = λfirstArg;
                this.sumFunction = λfirstArg;
                break;

            case 'clouds' :
                this.octaves = 5;
                this.octaveFunction = λfirstArg;
                this.sumFunction = λfirstArg;
                break;

            case 'turbulence' :
                this.octaves = 5;
                this.octaveFunction = this.octaveFunctions['absolute'];
                this.sumFunction = λfirstArg;
                break;

            case 'marble' :
                this.octaves = 5;
                this.octaveFunction = this.octaveFunctions['absolute'];
                this.sumFunction = this.sumFunctions['sine'];
                break;

            case 'wood' :
                this.octaves = 1;
                this.octaveFunction = λfirstArg;
                this.sumFunction = this.sumFunctions['modular'];
                break;

            default :
                this.octaves = 1;
                this.octaveFunction = λfirstArg;
                this.sumFunction = λfirstArg;
        }
    }
}

// `installElement` - internal function, used by the constructor
P.installElement = function (element) {

    this.element = element;
    this.engine = this.element.getContext('2d');

    return this;
};

P.checkSource = function (width, height) {

    this.notifySubscribers();
};

// `getData`
P.getData = function (entity, cell) {

    this.checkSource(this.width, this.height);

    return this.buildStyle(cell);
};

// `notifySubscribers` - Subscriber notification in the asset factories will happen when something changes with the image. Changes vary across the different types of asset:
// + __imageAsset__ - needs to update its subscribers when an image completes loading - or, for &lt;img> sources with srcset (and sizes) attributes, when the image completes a reload of its source data.
// + __spriteAsset__ - will also update its subscribers each time it moves to a new sprite image frame, if the sprite is being animated
// + __videoAsset__ - will update its subscribers for every RAF tick while the video is playing, or if the video is halted and seeks to a different time in the video play stream.
//
// All notifications are push; the notification is achieved by setting various attributes and flags in each subscriber.
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


// Much of the following code comes from the "canvas-noise" GitHub repository
// - https://github.com/lencinhaus/canvas-noise
// - Written by https://github.com/lencinhaus (who has been inactive on GitHub since 2015)

P.cleanOutput = function () {

    if (this.dirtyNoise) this.cleanNoise();
    if (this.dirtyOutput) this.paintCanvas();
};

P.cleanNoise = function () {

    if (this.dirtyNoise) {

        this.dirtyNoise = false;

        let {noiseFunction, seed, width, height, element, engine, octaves, lacunarity, persistence, scale, octaveFunction, sumFunction} = this;

        if (noiseFunction && noiseFunction.init) {

            // Seed our pseudo-random number generator
            this.rndEngine = seededRandomNumberGenerator(seed);

            // Generate the permutations table(s)
            this.generatePermutationTable();

            // Initialize the appropriate noise function
            noiseFunction.init.call(this);

            let x, y, o, i, iz,
                noiseValues = [],
                scaledX, scaledY,
                noise, amplitude, frequency, octave;

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

                    scaledX = x * relativeScale;
                    scaledY = y * relativeScale;

                    // Amplitude and frequency will update once per octave calculation; noise is the sum of all octave results
                    noise = 0;
                    amplitude = 1; 
                    frequency = 1;


                    for (o = 0; o < octaves; o++) {

                        // call the appropriate noise function
                        let octave = noiseFunction.noise.call(this, scaledX * frequency, scaledY * frequency);

                        // update octave with a post-calculation octaveFunction, if required
                        octave = octaveFunction(octave, scaledX, scaledY, o + 1);

                        octave *= amplitude;

                        noise += octave;

                        frequency *= lacunarity;

                        amplitude *= persistence;
                    }
                    noiseValues[y][x] = noise;

                    min = Math.min(min, noise);
                    max = Math.max(max, noise);
                }
            }

            // Calculate the span of numbers generated - we need to get all the results in the range 0 to 1
            let noiseSpan = max - min;

            for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {

                    scaledX = x * relativeScale;
                    scaledY = y * relativeScale;

                    // Clamp the cell's noise value to between 0 and 1, then update it with the post-calculation sumFunction, if required
                    let v0 = noiseValues[y][x],
                        v1 = (v0 - min) / noiseSpan,
                        v2 = sumFunction.call(this, v1, scaledX, scaledY);

                    noiseValues[y][x] = v2;
                }
            }
            this.noiseValues = noiseValues;
        }
        else this.dirtyNoise = true;
    }
};

P.paintCanvas = function () {

    if (this.dirtyOutput) {

        this.dirtyOutput = false;

        let {noiseValues, element, engine, width, height, color, colorFactory, monochromeStart, monochromeRange, hueStart, hueRange, saturation, luminosity} = this;

        // Noise values will be calculated in the cleanNoise function, but just in case this function gets invoked directly before the 2d array has been created ...
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

                    if (monochromeStart + monochromeRange > 255) monochromeRange = 255 - monochromeStart;

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


P.F = 0.5 * (Math.sqrt(3) - 1);
P.G = (3 - Math.sqrt(3)) / 6;
P.perlinGrad = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];

P.noiseFunctions = {

    'perlin_classic': {

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

        noise: function (x, y) {

            const {size, perm, grad, smoothing, interpolate} = this;

            let a, b, u, v;

            let bx0 = Math.floor(x) % size,
                bx1 = (bx0 + 1) % size,

                rx0 = x - Math.floor(x),
                rx1 = rx0 - 1,

                by0 = Math.floor(y) % size,
                by1 = (by0 + 1) % size,

                ry0 = y - Math.floor(y),
                ry1 = ry0 - 1,

                i = perm[bx0],
                j = perm[bx1],

                b00 = perm[i + by0],
                b10 = perm[j + by0],
                b01 = perm[i + by1],
                b11 = perm[j + by1],

                sx = smoothing(rx0),
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

    'perlin_improved': {

        init: λnull,

        noise: function (x, y) {

            const {size, perm, permMod8, perlinGrad, smoothing, interpolate} = this;

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

    'simplex': {

        init: λnull,

        noise: function (x, y) {

            let n0, n1, n2, s, i, j, t, X0, Y0, x0, y0, i1, j1, x1, x2, y1, y2, ii, jj, gi0, gi1, gi2, t0, t1, t2;

            const {F, G, size, perlinGrad, perm, permMod8} = this;
            
            s = (x + y) * F;
            i = Math.floor(x + s);
            j = Math.floor(y + s);
            t = (i + j) * G;

            X0 = i - t;
            Y0 = j - t;
            x0 = x - X0;
            y0 = y - Y0;
            
            if (x0 > y0) {
                i1 = 1;
                j1 = 0;
            }
            else {
                i1 = 0;
                j1 = 1;
            }
            
            x1 = x0 - i1 + G;
            y1 = y0 - j1 + G;
            x2 = x0 - 1 + 2 * G;
            y2 = y0 - 1 + 2 * G;
            
            ii = i % size;
            jj = j % size;

            gi0 = permMod8[ii + perm[jj]];
            gi1 = permMod8[ii + i1 + perm[jj + j1]];
            gi2 = permMod8[ii + 1 + perm[jj + 1]];
            
            t0 = 0.5 - x0 * x0 - y0 * y0;
            if (t0 < 0) n0 = 0;
            else {
                t0 *= t0;
                n0 = t0 * t0 * (perlinGrad[gi0][0] * x0 + perlinGrad[gi0][1] * y0);
            }
            
            t1 = 0.5 - x1 * x1 - y1 * y1;
            if (t1 < 0) n1 = 0;
            else {
                t1 *= t1;
                n1 = t1 * t1 * (perlinGrad[gi1][0] * x1 + perlinGrad[gi1][1] * y1);
            }
            
            t2 = 0.5 - x2 * x2 - y2 * y2;
            if (t2 < 0) n2 = 0;
            else {
                t2 *= t2;
                n2 = t2 * t2 * (perlinGrad[gi2][0] * x2 + perlinGrad[gi2][1] * y2);
            }
            
            return 0.5 + 35 * (n0 + n1 + n2);
        },
    },

    'value': {

        init: function () {

            const {values, size, rndEngine} = this;

            values.length = 0;

            for(let i = 0; i < size; i++) {

                values[i] = values[i + size] = rndEngine.random();
            }
        },

        noise: function (x, y) {

            const {values, size, perm, smoothing, interpolate} = this;

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
};

P.update = function (data) {

};

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

// color conversion
P.hslToRgb = function (values) {

    const [h, s, l] = values;

    let r, g, b, p, q;

    const hue2rgb = function (u, v, t) {

        if (t < 0) t += 1;
        if (t > 1) t -= 1;

        if (t < 1/6) return u + (v - u) * 6 * t;
        if (t < 1/2) return v;
        if (t < 2/3) return u + (v - u) * (2/3 - t) * 6;
        return u;
    }

    if (s == 0) {
        r = l;
        g = l;
        b = l;
    }
    else {

        q = (l < 0.5) ? l * (1 + s) : l + s - l * s;
        p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
}

P.hsvToRgb = function (values) {

    const [h, s, v] = values;

    let r, g, b;

    let i = Math.floor(h * 6),
        f = h * 6 - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s);

    switch(i % 6){

        case 0: 
            r = v, g = t, b = p; 
            break;

        case 1: 
            r = q, g = v, b = p; 
            break;

        case 2: 
            r = p, g = v, b = t; 
            break;

        case 3: 
            r = p, g = q, b = v; 
            break;

        case 4: 
            r = t, g = p, b = v; 
            break;

        case 5: 
            r = v, g = p, b = q; 
            break;

    }

    return [r, g, b];
};

P.rgbHexToComponents = function (rgb) {

    let r = parseInt(rgb.substr(0, 2), 16),
        g = parseInt(rgb.substr(2, 2), 16),
        b = parseInt(rgb.substr(4, 2), 16);

    return [r, g, b];
};

P.octaveFunctions = {

    absolute: function (octave) {

        return Math.abs((octave * 2) - 1)
    },
};

P.sumFunctions = {

    sine: function (sum, scaledX) {

        return .5 + (Math.sin(scaledX * this.sineFrequencyCoeff + sum) / 2);
    },

    modular: function(sum) {

        let g = sum * this.modularAmplitude;
        return g - Math.floor(g);
    },
};

P.smoothingFunctions = {

    none: λfirstArg,

    cosine: function(t) {

        return .5 * (1 + Math.cos((1 - t) * Math.PI));
    },

    hermite: function(t) {

        return t * t * (-t * 2 + 3);
    },

    quintic: function(t) {

        return t * t * t * (t * (t * 6 - 15) + 10);
    },
};

P.interpolate = function (t, a, b) {

    return a + t * (b - a);
};


// #### Factory
// ```
// TODO
// ```
const makeNoise = function (items) {
    return new Noise(items);
};

constructors.Noise = Noise;


// #### Exports
export {
    makeNoise,
};
