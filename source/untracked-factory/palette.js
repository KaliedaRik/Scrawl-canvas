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


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, easeEngines, isa_fn, isa_obj, mergeOver, pushUnique, xt, xta, λfirstArg, λnull, Ωempty } from '../helper/utilities.js';

import { getWorkstoreItem, setWorkstoreItem, checkForWorkstoreItem } from '../helper/workstore.js';

import { makeColor } from '../factory/color.js';

import baseMix from '../mixin/base.js';

// Shared constants
import { _assign, _entries, _floor, _isArray, _isFinite, _keys, BLACK, BLANK, FUNCTION, INT_COLOR_SPACES_SET, LINEAR, RGB, T_PALETTE, WHITE } from '../helper/shared-vars.js';

// Local constants
const PALETTE = 'palette';


// #### Palette constructor
const Palette = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.factory = makeColor({ name: `${this.name}-color-factory` });

    this.set(this.defs);

    this.colors = {};
    this.stops = Array(1000).fill(BLANK);
    this.easingFunction = λfirstArg;

    if (items.colors == null) items.colors = [[0, BLACK], [999, WHITE]];

    this.set(items);

    this.dirtyPalette = true;
    return this;
};


// #### Palette prototype
const P = Palette.prototype = doCreate();
P.type = T_PALETTE;
P.lib = PALETTE;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Palette attributes
const defaultAttributes = {

// The __colors__ object is a raw Javascript object which uses stop values `('0 ' - '999 ')` as keys and an Array with four members holding color data as values.
    colors: null,

// The __stops__ array is a fixed Array of length 1000 containing color strings for each index.
    stops: null,

// The __easing__ and __easingFunction__ attributes affect represents a transformation that will be applied to a copy of the color stops Array - this allows us to create non-linear gradients
    easing: LINEAR,
    easingFunction: null,

// The __precision__ value - higher values lead to fewer stops being added to the gradient; setting the value to `0` forces the palette to skip setting the stops between defined colors in the `colors` Array
    precision: 25,

// ##### Non-retained argument attributes (for factory, clone, set functions) - these attributes get passed on to the Palette's Color object

// __colorSpace__ - String value defining the color space to be used by the Palette's Color object for its internal calculations.
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH', 'OKLAB', 'OKLCH'` with `RGB` as the default
//
// __returnColorAs__ - String value defining the type of color String the Palette's Color object will return.
// + This is a shorter list than the internal colorSpace attribute as we only return values for CSS specified color spaces. Note that some of these color spaces are not widely supported across browsers and will lead to errors in canvases displayed on non-supported browsers
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'LAB', 'LCH', 'OKLAB', 'OKLCH'` with `RGB` as the default

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
const G = P.getters,
    S = P.setters;


// __colors__ - an array of arrays, each sub-array being in the form `[Number, String]` where:
// + Number is a positive integer in the range 0-999
// + String is any legitimate CSS color string value (rgb-key, rgb-hex, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()`, `lch()`, `lab()`, `oklch()`, `oklab()`). Also accepts xyz color space colors in the format `xyz(x-value y-value z-value)` or `xyz(x-value y-value z-value / alpha-value)`
G.colors = function () {

    const f = this.factory,
        res = [];

    if (f) {

        const colorSpace = f.colorSpace;

        const entries = _entries(this.colors)
            .map(([k, v]) => [parseInt(k, 10), v])
            .filter(([k, v]) => _isFinite(k) && k >= 0 && k <= 999 && v && v.length >= 3)
            .sort((a, b) => a[0] - b[0]);

        for (const [key, value] of entries) {

            res.push([key, f.buildColorString(...value, colorSpace)]);
        }
    }
    else res.push([0, BLACK], [999, WHITE]);

    return res;
};

S.colors = function (item) {

    const isArr = _isArray(item);

    const ok = isArr ? this.checkColorsArrayInput(item) : this.checkColorsObjectInput(item);

    const f = this.factory,
        colorSpace = f.colorSpace.toLowerCase();

    let newColors = {};

    // Fallback: black→white
    if (!ok) {

        console.warn(`Palette '${this.name}': invalid colors input; require array of [index,color] or object with indices 0..999 - setting palette to black-white.`);

        newColors = this.generateDefaultPalette();
    }
    else if (isArr) {

        for (const pair of item) {

            const [key, val] = pair;

            if (val && val.substring) {

                f.convert(val);
                newColors[key|0] = [...f[colorSpace]]; // coerce to int
            }
        }
    }
    else {

        for (const [key, val] of _entries(item)) {

            if (val && val.substring) {

                const p = parseInt(key, 10);

                if (_isFinite(p)) {

                    f.convert(val);
                    newColors[p] = [...f[colorSpace]];
                }
            }
        }
    }

    const check = _keys(newColors);
    if (check.length < 2) {

        console.warn(`Palette '${this.name}': at least two distinct color stops are required (got ${check.length}). Setting palette to black-white.`);

        newColors = this.generateDefaultPalette();
    }

    this.colors = newColors;
    this.dirtyPalette = true;
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

        this.easing = FUNCTION;
        this.easingFunction = item;
    }
    else if (item.substring && easeEngines[item]) {

        this.easing = item;
        this.easingFunction = λfirstArg;
    }
    else {

        this.easing = LINEAR;
        this.easingFunction = λfirstArg;
    }
    this.dirtyPaletteData = true;
};

// The __colorSpace__ and __returnColorAs__ attributes get passed through to the Palette's Color object
G.colorSpace = function () {

    return this.getColorSpace();
};
S.colorSpace = function (item) {

    if (item.substring) {

        const ITM = item.toUpperCase();
        const itm = item.toLowerCase();

        if (INT_COLOR_SPACES_SET.has(ITM)) {

            const oldColors = _assign({}, this.colors),
                oldSpace = this.factory.colorSpace,
                newColors = {};

            this.factory.set({ colorSpace: ITM });
            
            for (const [key, val] of _entries(oldColors)) {

                const idx = parseInt(key, 10);

                if (!_isFinite(idx) || idx < 0 || idx > 999) continue;

                const css = this.factory.buildColorString(...val, oldSpace);

                this.factory.setColor(css);
                newColors[idx] = [...this.factory[itm]];
            }
            this.colors = newColors;
            this.dirtyPalette = true;
        }
    }
};

G.returnColorAs = function () {

    return this.getReturnColorAs();
};
S.returnColorAs = function (item) {

    this.factory.set({

        returnColorAs: item,
    });
    this.dirtyPalette = true;
}

// __precision__ - a positive integer Number value between 0 and 50. If value is `0` (default) no easing will be applied to the gradient; values above 0 apply the easing to the gradient; higher values will give a quicker, but less precise, mapping.
S.precision = function (item) {

    item = parseInt(item, 10);
    if (!_isFinite(item) || item < 0) item = 0;
    if (item > 50) item = 50;

    this.precision = item;
    this.dirtyPaletteData = true;
};

// __stops__ - Do nothing. The stops array needs to be kept private, its values set only via the `recalculateStopColors` function, which happens whenever the `dirtyPalette` attribute is set to true.
S.stops = λnull;


// #### Prototype functions
//
// Validate: object input { "0": "rgb(...)", 999: "#fff", ... }
P.checkColorsObjectInput = function (item) {

    if (!item || !isa_obj(item)) return false;

    for (const [k, v] of _entries(item)) {

        const p = parseInt(k, 10);

        if (!_isFinite(p)) return false;
        if (!Number.isInteger(p)) return false;
        if (p < 0 || p > 999) return false;
        if (!(v && v.substring)) return false;
    }
    return true;
};

// Validate: array input [ [0,'#000'], [999,'#fff'] ]
P.checkColorsArrayInput = function (item) {

    if (!item || !_isArray(item)) return false;

    for (const pair of item) {

        if (!_isArray(pair) || pair.length < 2) return false;

        const [p, v] = pair;

        if (!Number.isInteger(p)) return false;
        if (p < 0 || p > 999) return false;
        if (!(v && v.substring)) return false;
    }
    return true;
};

P.generateDefaultPalette = function () {

    const newColors = {},
        f = this.factory,
        colorSpace = f.colorSpace.toLowerCase();

    f.convert(BLACK);
    newColors[0] = [...f[colorSpace]];
    
    f.convert(WHITE);
    newColors[999] = [...f[colorSpace]];

    return newColors;
};

// `getColorSpace` - returns the color factory's current colorSpace value
P.getColorSpace = function () {

    if (this.factory) return this.factory.colorSpace;
    return RGB;
};

P.getReturnColorAs = function () {

    if (this.factory) return this.factory.returnColorAs;
    return RGB;
};

// `recalculateStopColors` - populate the stops Array with CSS color Strings, as determined by colors stored in the `colors` object
// + Be aware that if color stops have not been set at index 0, or index 999, the indices between 0 to start, and between end to 999, will remain transparent black.
P.recalculateStopColors = function () {

    if (this.dirtyPalette) {

        this.dirtyPalette = false;
        this.dirtyPaletteData = true;

        const { colors, stops, factory } = this;

        stops.fill(BLANK);

        const { colorSpace } = factory;

        const colorKeys = _keys(colors)
            .map(n => parseInt(n, 10))
            .filter(n => _isFinite(n) && n >= 0 && n <= 999 && colors[n])
            .sort((a, b) => a - b);

        if (colorKeys.length < 2) {

            console.warn(`Palette '${this.name}': needs at least 2 stops to build gradient (found ${colorKeys.length})`);

            this.dirtyPalette = false;

        }
        else {

            let currentKey = colorKeys[0],
                nextKey, currentVals, nextVals, diff, i, iz, j;

            const [b, c, d, a] = colors[currentKey];

            stops[currentKey] = factory.returnColorFromValues(b, c, d, a);

            for (i = 0, iz = colorKeys.length - 1; i < iz; i++) {

                currentKey = colorKeys[i];
                nextKey = colorKeys[i + 1];
                currentVals = colors[currentKey];
                nextVals = colors[nextKey];

                factory.setMinimumColor(factory.buildColorString(...currentVals, colorSpace));
                factory.setMaximumColor(factory.buildColorString(...nextVals, colorSpace));

                diff = nextKey - currentKey;

                for (j = currentKey + 1; j <= nextKey; j++) {

                    stops[j] = factory.getRangeColor((j - currentKey) / diff, true);
                }
            }
        }
    }
};

// `updateColor` - add or update a gradient-type style's Palette object with a color.
// + __index__ - positive integer Number between 0 and 999 inclusive
// + __color__ - CSS color String
P.updateColor = function (index, color) {

    const f = this.factory,
        colorSpace = f.colorSpace.toLowerCase();

    if (xta(index, color)) {

        index = (index.substring) ? parseInt(index, 10) : _floor(index);

        if (_isFinite(index) && index >= 0 && index < 1000 && color && color.substring) {

            f.convert(color);
            this.colors[index] = [...f[colorSpace]];
            this.dirtyPalette = true;
        }
    }
};

// `removeColor` - remove a gradient-type style's Palette object color from a specified index
// + __index__ - positive integer number between 0 and 999 inclusive
P.removeColor = function (index) {

    if (xt(index)) {

        index = (index.substring) ? parseInt(index, 10) : _floor(index);

        if (_isFinite(index) && index >= 0 && index < 1000) {

            const count = _keys(this.colors).length;

            if (this.colors[index] != null && count <= 2) console.warn(`Palette '${this.name}': cannot remove stop ${index}; a palette must keep at least two stops.`);
            else {

                delete this.colors[index];
                this.dirtyPalette = true;
            }
        }
    }
};

// `getStopData` - retrieve memoised gradient data, or generate it
P.getStopData = function (gradient, start, end, cycle) {

    // Option 0: in case of errors, return transparent black
    if (!gradient) return BLANK;

    const workstoreName = `${this.name}-data`;

    const { stops } = this;

    if (this.dirtyPaletteData || !checkForWorkstoreItem(workstoreName)) {

        this.dirtyPaletteData = false;

        if (!xta(start, end)) {
            start = 0;
            end = 999;
        }

        const { easing, easingFunction, precision } = this;

        const keys = _keys(this.colors).map(n => parseInt(n, 10)).sort((a, b) => a - b);

        let spread, offset, i, iz, item, n;

        let engine = easingFunction;
        if (easing !== FUNCTION && easeEngines[easing]) engine = easeEngines[easing];

        const colorSpace = this.getColorSpace();

        const precisionTest = (!precision || (easing === LINEAR && colorSpace === RGB)) ? false : true;

        const data = [];

        // Option 2: start < end, cycle irrelevant
        if (start < end) {

            data.push(0, stops[start]);

            spread = end - start;

            if (precisionTest) {

                for (i = start + 1; i < end; i += precision) {

                    offset = (i - start) / spread;

                    if (cycle) {

                        if (offset > 1) offset -= 1;
                        else if (offset < 0) offset += 1;
                    }

                    offset = engine(offset);

                    if (offset > 0 && offset < 1) data.push(offset, stops[i]);
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

                        if (offset > 0 && offset < 1) data.push(offset, stops[item]);
                    }
                }
            }
            data.push(1, stops[end]);
        }

        else {

            // Option 3: start > end, cycle = true
            if (cycle) {

                data.push(0, stops[start]);

                n = 999 - start;
                spread = n + end;

                if (precisionTest) {

                    for (i = 0; i < spread; i += precision) {

                        item = i + start;

                        if (item > 999) item -= 1000;

                        offset = engine(i / spread);

                        if (offset > 0 && offset < 1) data.push(offset, stops[item]);
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

                        if (offset > 0 && offset < 1) data.push(offset, stops[item]);
                    }
                }
                data.push(1, stops[end]);
            }

            // Option 4: start > end, cycle = false
            else {

                data.push(0, stops[start]);

                spread = start - end;

                if (precisionTest) {

                    for (i = end + 1; i < start; i += precision) {

                        if (i < start && i > end) {

                            offset = engine(1 - ((i - end) / spread));

                            if (offset > 0 && offset < 1) data.push(offset, stops[i]);
                        }
                    }
                }
                else {

                    for (i = 0, iz = keys.length; i < iz; i++) {

                        item = keys[i];

                        if (item < start && item > end) {

                            offset = 1 - ((item - end) / spread);

                            if (offset > 0 && offset < 1) data.push(offset, stops[item]);
                        }
                    }
                }
                data.push(1, stops[end]);
            }
        }
        setWorkstoreItem(workstoreName, data);
    }

    // Option 1 start == end, cycle irrelevant. Returns solid color at start of gradient
    if (start === end) return stops[start] || BLANK;

    // check to see if data has already been memoized and is suitable for return
    return getWorkstoreItem(workstoreName) || BLANK;
};

// `addStopsToGradient` - complete the construction of the Canvas API CanvasGradient object
P.addStopsToGradient = function (gradient, start, end, cycle) {

    this.recalculateStopColors();

    const data = this.getStopData(gradient, start, end, cycle);

    if (data.substring) return data;

    for (let i = 0, iz = data.length; i < iz; i += 2) {

        gradient.addColorStop(data[i], data[i + 1]);
    }

    return gradient;
};

// `updateData` - used by code elsewhere to tell the palette to update its stop data
P.updateData = function () {

    this.dirtyPaletteData = true;
};


// #### Factory
export const makePalette = function (items) {

    if (!items) return false;
    return new Palette(items);
};

constructors.Palette = Palette;
