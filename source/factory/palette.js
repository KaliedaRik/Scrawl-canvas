// # Palette factory
// Scrawl-canvas uses Palette objects to handle color management for its [Gradient](./gradient.html) and [RadialGradient](./radialGradient.html) styles.
// + Every gradient-type object gets a Palette object as part of its construction, stored in its `palette` attribute.
// + While Palette objects have their own section in the scrawl library, we don't actually use that functionality - unlike entity State objects, Palette objects cannot be shared between gradients.
// + Developers should never need to interact with Palette objects directly; gradient-type styles include functions for adding and manipulating gradient color stops.
// + Packet, clone and kill functionality is also managed through the gradient-type style objects.


// ##### Gradients and color stops
// The [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) uses a rather convoluted way to add color data to a [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) interface object: 
// + the object is created first on the &lt;canvas> context engine where it is to be applied, with __start__ and __end__ coordinates, 
// + then color stops are _individually_ added to it afterwards. 
// + This needs to be done for every gradient applied to a context engine before any fill or stroke operation using that gradient. 
// + And only one gradient may be applied to the context engine at any time.
//
// The specificity of the above requirements - in particular relating to position coordinates - and the inability to update the CanvasGradient beyond adding color stops to it, means that storing these objects for future use is not a useful proposition ... especially in a dynamic environment where we want the gradient to move in-step with an entity, or animate its colors in some way.
//
// Scrawl-canvas overcomes this problem through the use of [Palette objects](../factory/palette.html) which separate a gradient-type style's color-stop data from its positioning data. We treat Canvas API `CanvasGradient` objects as use-once-and-dispose objects, generating them in a just-in-time fashion for each entity's `stamp` operation in the Display cycle.
//
// Palette objects store their color data in a `colors` attribute object:
// ```
// {
//     name: "mygradient_palette",
//     colors: {
//         "0 ": [0, 0, 0, 1],
//         "350 ": [255, 0, 0, 1],
//         "650 ": [0, 0, 255, 1],
//         "999 ": [255, 255, 255, 1],
//         "index-label-between-0-and-999 ": [redValue, greenValue, blueValue, alphaValue]
//     },
// }
// ``` 
// To `set` the Palette object's `colors` object, either when creating the gradient-type style or at some point afterwards, we can use CSS color Strings instead of an array of values for each color:
//
// ``` 
// myGradient.set({
//
//     colors: [
//         [0, 'black'],
//         [0, 'red'],
//         [0, 'blue'],
//         [0, 'white'],
//     ]
// });
// ``` 


// #### Demos:
// + [Canvas-003](../../demo/canvas-003.html) - Linear gradients
// + [Canvas-004](../../demo/canvas-004.html) - Radial gradients
// + [Canvas-005](../../demo/canvas-005.html) - Cell-locked, and Entity-locked, gradients; animating gradients by delta, and by tween
// + [Canvas-022](../../demo/canvas-022.html) - Grid entity - basic functionality (color, gradients)


// #### Imports
import { constructors } from '../core/library.js';
import { λnull, λfirstArg, isa_obj, isa_fn, mergeOver, xt, xta, pushUnique, Ωempty, easeEngines } from '../core/utilities.js';

import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';


// #### Palette constructor
const Palette = function (items = Ωempty) {


    this.makeName(items.name);
    this.register();

    this.factory = makeColor({

        name: `${this.name}-color-factory`,
    });

    this.set(this.defs);

    this.colors = items.colors || {'0 ': [0,0,0,1], '999 ': [255,255,255,1]};
    this.stops = Array(1000);
    this.easingFunction = λfirstArg;


    this.set(items);

    this.dirtyPalette = true;
    return this;
};


// #### Palette prototype
let P = Palette.prototype = Object.create(Object.prototype);

P.type = 'Palette';
P.lib = 'palette';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Palette attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

// The __colors__ object is a raw Javascript object which uses stop values `('0 ' - '999 ')` as keys and an Array with four members holding color data as values. 
    colors: null,

// The __stops__ array is a fixed Array of length 1000 containing rgba color strings for each index. 
    stops: null,

// If the __cyclic__ flag is set, then we know to calculate appropriate stop values between the last key color and the first key color, thus allowing for smooth crossing of the 1 -> 0 stops boundary
    cyclic: false,

// The __easing__ and __easingFunction__ attributes affect represents a transformation that will be applied to a copy of the color stops Array - this allows us to create non-linear gradients
    easing: 'linear',
    easingFunction: null,

// The __precision__ value - higher values lead to fewer stops being added to the gradient; setting the value to `0` forces the palette to skip setting the stops between defined colors in the `colors` Array
    precision: 1,

// ##### Non-retained argument attributes (for factory, clone, set functions) - these attributes get passed on to the Palette's Color object

// __colorSpace__ - String value defining the color space to be used by the Palette's Color object for its internal calculations.
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH'` with `RGB` as the default
//
// __returnColorAs__ - String value defining the type of color String the Palette's Color object will return.
// + This is a shorter list than the internal colorSpace attribute as we only return values for CSS specified color spaces. Note that some of these color spaces are not widely supported across browsers and will lead to errors in canvases displayed on non-supported browsers
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'LAB', 'LCH'` with `RGB` as the default

};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetFunctions = pushUnique(P.packetFunctions, ['easingFunction']);
P.packetExclusions = pushUnique(P.packetExclusions, ['stops']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.kill = function () {

    if (this.factory && this.factory.kill) this.factory.kill();

    this.deregister();
    
    return this;
};


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters;


// __colors__ - an array of arrays, each sub-array being in the form `[Number, String]` where:
// + Number is a positive integer in the range 0-999
// + String is any legitimate CSS color string value (rgb-key, rgb-hex, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()`, `lch()`, `lab()`). Also accepts xyz color space colors in the format `xyz(x-value y-value z-value)` or `xyz(x-value y-value z-value / alpha-value)`
S.colors = function (item) {

    if (Array.isArray(item)) {

        let f = this.factory,
            newCols = {},
            colorSpace = f.colorSpace.toLowerCase();

        item.forEach(c => {

            let [pos, col] = c; 
            if (pos.toFixed && col.substring) {

                f.convert(col);
                newCols[`${pos} `] = [...f[colorSpace]];
            }
        });
        this.colors = newCols;
        this.dirtyPalette = true;
    }
};

// __easing__, __easingFunction__ - the easing to be applied to the gradient 
// + Can accept a String value identifying an SC pre-defined easing function (default: `linear`)
// + Can also accept a function accepting a single Number argument (a value between 0-1) and returning an eased Number (again, between 0-1)
S.easing = function (item) {

    this.setEasingHelper(item);
};
S.easingFunction = S.easing;
P.setEasing = function (item) {

    this.setEasingHelper(item);
    return this;
};
P.setEasingFunction = P.setEasing;
P.setEasingHelper = function (item) {

    if (isa_fn(item)) {

        this.easing = 'function';
        this.easingFunction = item;
    }
    else if (item.substring && easeEngines[item]) {

        this.easing = item; 
        this.easingFunction = λfirstArg;
    }
    else {

        this.easing = 'linear'; 
        this.easingFunction = λfirstArg;
    }
    this.dirtyPalette = true;
};

// The __colorSpace__ and __returnColorAs__ attributes get passed through to the Palette's Color object
S.colorSpace = function (item) {

    if (item.substring) {

        const ITM = item.toUpperCase();
        const itm = item.toLowerCase();

        if (['RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH'].includes(ITM)) {

            const oldColors = Object.assign({}, this.colors);

            const oldSpace = this.factory.colorSpace;

            this.factory.set({ colorSpace: ITM });

            for (const [key, value] of Object.entries(oldColors)) {

                const color = this.factory.buildColorString(...value, oldSpace);

                this.factory.setColor(color);

                this.colors[key].length = 0
                this.colors[key].push(...this.factory[itm]);
            }
            this.dirtyPalette = true;
        }
    }
}

S.returnColorAs = function (item) {
    
    this.factory.set({

        returnColorAs: item,
    });
    this.dirtyPalette = true;
}

// __precision__ - a positive integer Number value between 0 and 50. If value is `0` (default) no easing will be applied to the gradient; values above 0 apply the easing to the gradient; higher values will give a quicker, but less precise, mapping.
S.precision = function (item) {

    item = parseInt(item, 10);
    if (isNaN(item) || item < 0) item = 0;
    if (item > 50) item = 50;

    this.precision = item;
    this.dirtyPalette = true;
};

// __stops__ - Do nothing. The stops array needs to be kept private, its values set only via the `recalculate` function, which happens whenever the `dirtyPalette` attribute is set to true.
S.stops = λnull;


// #### Prototype functions

// `recalculateHold` - internal variable
P.recalculateHold = [];

// `recalculate` - populate the stops Array with CSS color Strings, as determined by colors stored in the `colors` object
P.recalculate = function () {

    this.dirtyPalette = false;

    const { colors, stops, factory } = this;

    stops.fill('rgba(0 0 0 / 0)');

    const { colorSpace } = factory;

    let colorKeys = Object.keys(colors);
    colorKeys = colorKeys.map(n => parseInt(n, 10))
    colorKeys.sort((a, b) => a - b);

    let currentKey = colorKeys[0], 
        nextKey, currentVals, nextVals, dA, dB, dC, dD, diff;

    let [b, c, d, a] = colors[`${currentKey} `];

    stops[currentKey] = factory.returnColorFromValues(b, c, d, a);

    for (let i = 0, iz = colorKeys.length - 1; i < iz; i++) {

        currentKey = colorKeys[i];
        nextKey = colorKeys[i + 1];
        currentVals = colors[`${currentKey} `];
        nextVals = colors[`${nextKey} `];

        diff = nextKey - currentKey;
        dB = (nextVals[0] - currentVals[0]) / diff;
        dC = (nextVals[1] - currentVals[1]) / diff;
        dD = (nextVals[2] - currentVals[2]) / diff;
        dA = (nextVals[3] - currentVals[3]) / diff;

        factory.setMinimumColor(factory.buildColorString(...currentVals, colorSpace));
        factory.setMaximumColor(factory.buildColorString(...nextVals, colorSpace));

        for (let j = currentKey + 1; j <= nextKey; j++) {

            b += dB;
            c += dC;
            d += dD;
            a += dA;

            stops[j] = factory.returnColorFromValues(b, c, d, a);
        }
    }
};

// `makeColorString` - internal helper function
P.makeColorString = function (a, b, c, d) {

    if (this && this.factory) return this.factory.buildColorString(a, b, c, d);
    return 'rgba(0 0 0 / 0)';
};

// `updateColor` - add or update a gradient-type style's Palette object with a color.
// + __index__ - positive integer Number between 0 and 999 inclusive
// + __color__ - CSS color String
P.updateColor = function (index, color) {

    const f = this.factory,
        colorSpace = f.colorSpace.toLowerCase();

    if (xta(index, color)) {

        index = (index.substring) ? parseInt(index, 10) : Math.floor(index);

        if (index >= 0 && index <= 999) {

            f.convert(color);
            index += ' ';
            this.colors[index] = [...f[colorSpace]];
            this.dirtyPalette = true;
        }
    }
};

// `removeColor` - remove a gradient-type style's Palette object color from a specified index
// + __index__ - positive integer number between 0 and 999 inclusive
P.removeColor = function (index) {
    
    if (xt(index)) {

        index = (index.substring) ? parseInt(index, 10) : Math.floor(index);
        
        if (index >= 0 && index <= 999) {

            index += ' ';
            delete this.colors[index];
            this.dirtyPalette = true;
        }
    }
};

// `addStopsToGradient` - complete the construction of the Canvas API CanvasGradient object
P.addStopsToGradient = function (gradient, start, end, cycle) {

    // It's at this point that we apply the easing function

    let { stops, easing, easingFunction, precision } = this;

    let keys = Object.keys(this.colors),
        spread, offset, i, iz, item, n;

    if (gradient) {

        keys = keys.map(n => parseInt(n, 10))
        keys.sort((a, b) => a - b);

        if (!xta(start, end)) {
            start = 0;
            end = 999;
        }

        let engine = easingFunction;
        if (easing !== 'function' && easeEngines[easing]) engine = easeEngines[easing];

        // Option 1 start == end, cycle irrelevant
        if (start === end) return stops[start] || 'rgba(0,0,0,0)';

        // Option 2: start < end, cycle irrelevant
        else if (start < end) {

            gradient.addColorStop(0, stops[start]);
            gradient.addColorStop(1, stops[end]);
        
            spread = end - start;

            if (precision) {

                for (i = start + 1; i < end; i += precision) {

                    offset = (i - start) / spread;

                    if (cycle) {

                        if (offset > 1) offset -= 1;
                        else if (offset < 0) offset += 1;
                    }

                    offset = engine(offset);

                    if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[i]);
                }
            }
            else {

                for (i = 0, iz = keys.length; i < iz; i++) {

                    item = keys[i];

                    if (item > start && item < end) {

                        offset = (item - start) / spread;

                        if (cycle) {

                            if (offset > 1) offset -= 1;
                            else if (offset < 0) offset += 1;
                        }

                        if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
                    }
                }
            }
        }

        else {
            // Option 3: start > end, cycle = true

            if (cycle) {

                gradient.addColorStop(0, stops[start]);
                gradient.addColorStop(1, stops[end]);

                n = 999 - start;
                spread = n + end;

                if (precision) {

                    for (i = 0; i < spread; i += precision) {

                        item = i + start;

                        if (item > 999) item -= 999;

                        offset = engine(i / spread);

                        if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
                    }
                }
                else {

                    for (i = 0, iz = keys.length; i < iz; i++) {

                        item = keys[i];

                        if (item === 999) offset = (item - start - 0.01) / spread;
                        else if (item > start) offset = (item - start) / spread;
                        else if (item === 0) offset = (item + n + 0.01) / spread;
                        else if (item < end) offset = (item + n) / spread;
                        else continue;

                        if (offset > 1) offset -= 1;
                        else if (offset < 0) offset += 1;

                        if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
                    }
                }
            }

            // Option 4: start > end, cycle = false
            else {

                gradient.addColorStop(0, stops[start]);
                gradient.addColorStop(1, stops[end]);
            
                spread = start - end;

                if (precision) {

                    for (i = end + 1; i < start; i += precision) {

                        if (i < start && i > end) {

                            offset = engine(1 - ((i - end) / spread));

                            if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[i]);
                        }
                    }
                }
                else {

                    for (i = 0, iz = keys.length; i < iz; i++) {

                        item = keys[i];

                        if (item < start && item > end) {

                            offset = 1 - ((item - end) / spread);

                            if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
                        }
                    }
                }
            }
        }
        return gradient;
    }

    // No gradient: no colors
    else return 'rgba(0,0,0,0)';
};


// #### Factory
const makePalette = function (items) {

    if (!items) return false;
    return new Palette(items);
};

constructors.Palette = Palette;

const paletteKeys = ['colors', 'cyclic', 'stops'];


// #### Exports
export {
    makePalette,
    paletteKeys,
};
