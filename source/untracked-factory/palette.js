// # Palette factory
// Scrawl-canvas uses Palette objects to handle color management for its [Gradient](./gradient.html), [RadialGradient](./radialGradient.html) and [ConicGradient](./radialGradient.html) styles.
// + Every gradient-type object gets a Palette object as part of its construction, stored in its `palette` attribute.
// + Developers should never need to interact with Palette objects directly; gradient-type styles include functions for adding and manipulating gradient color stops.
// + Packet, clone and kill functionality is also managed through the gradient-type style objects.
//
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
// **NOTE – Why Scrawl-canvas HSL/HWB gradients don’t match CSS**
//
// Browsers treat hsl() and hwb() as *alternate notations of sRGB*. For gradients, CSS first resolves all stops to sRGB and then interpolates channels in RGB (premultiplied alpha). Result: CSS gradients for RGB/HSL/HWB look the same.
//
// Scrawl-canvas intentionally interpolates *in the declared internal space*. For HSL and HWB the code blends the cylindrical components (with shortest-arc hue wrapping), which produces more saturated, “truer HSL/HWB” midpoints than RGB-space blends. That’s why gradients built in the HSL/HWB color space tend to be more colorful, and differ from equivalent CSS gradients.
//
// **NOTE – Why Scrawl-canvas LCH/OKLCH gradients don’t match CSS**
//
// Most browsers currently render lch() and oklch() gradient stops by converting them to the *Cartesian* forms (Lab / Oklab) and then interpolating linearly in that space (premultiplied-alpha, then mapped to sRGB). Hue is only used to form a/b (or A/B), it is not interpolated as an angle; achromatic stops effectively collapse to Lab/Oklab vectors. In practice this makes CSS LCH ≈ CSS LAB and CSS OKLCH ≈ CSS OKLAB.
//
// Scrawl-canvas intentionally interpolates in the *cylindrical* spaces themselves: L linearly; H with shortest-arc wrapping; C linearly, with chroma gently clipped/fit to the output gamut. That preserves hue continuity and tends to produce more saturated “LCH-like / OKLCH-like” midpoints (e.g. a magenta ridge between red→blue), hence the visual difference from equivalent CSS gradients.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, easeEngines, isa_fn, isa_obj, mergeOver, pushUnique, xt, xta, λnull, Ωempty } from '../helper/utilities.js';

import { getWorkstoreItem, setWorkstoreItem, checkForWorkstoreItem } from '../helper/workstore.js';

import { makeColor } from '../factory/color.js';

import baseMix from '../mixin/base.js';

// Shared constants
import { _entries, _floor, _isArray, _isFinite, _keys, BLACK, BLANK, LINEAR, RGB, T_PALETTE, WHITE } from '../helper/shared-vars.js';

// Local constants
const PALETTE = 'palette',
    EASE_ENGINE_KEYS = _keys(easeEngines);


// #### Palette constructor
const Palette = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.factory = makeColor({ name: `${this.name}-color-factory` });

    this.set(this.defs);

    this.colors = {};
    this.stops = Array(1000).fill(BLANK);

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

// The __easing__ attribute affect represents a transformation that will be applied to a copy of the color stops Array - this allows us to create non-linear gradients
    easing: LINEAR,

// The __precision__ value - higher values lead to fewer stops being added to the gradient; setting the value to `0` forces the palette to skip setting the stops between defined colors in the `colors` Array
    precision: 25,

// ##### Non-retained argument attributes (for factory, clone, set functions) - these attributes get passed on to the Palette's Color object

// __colorSpace__ - String value defining the color space to be used by the Palette's Color object for its internal calculations.
// + Accepted values from: `'rgb', 'hsl', 'hwb', 'xyz', 'lab', 'lch', 'oklab', 'oklch'` with `rgb` as the default
//
// __returnColorAs__ - String value defining the type of color String the Palette's Color object will return.
// + This is a shorter list than the internal colorSpace attribute as we only return values for CSS specified color spaces. Note that some of these color spaces are not widely supported across browsers and will lead to errors in canvases displayed on non-supported browsers
// + Accepted values from: `'rgb', 'hsl', 'hwb', 'lab', 'lch', 'oklab', 'oklch'` with `rgb` as the default

};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
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

        const entries = _entries(this.colors)
            .map(([k, v]) => [parseInt(k, 10), v])
            .filter(([k, v]) => _isFinite(k) && k >= 0 && k <= 999 && v && v.length >= 3)
            .sort((a, b) => a[0] - b[0]);

        for (const [key, value] of entries) {

            res.push([key, f.buildColorStringFromData(value)]);
        }
    }
    else res.push([0, BLACK], [999, WHITE]);

    return res;
};

S.colors = function (item) {

    const isArr = _isArray(item);

    const ok = isArr ? this.checkColorsArrayInput(item) : this.checkColorsObjectInput(item);

    const factory = this.factory;

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

                factory.setMainColor(val);
                newColors[key] = [...factory.currentColorInternalData];
            }
        }
    }
    else {

        for (const [key, val] of _entries(item)) {

            if (val && val.substring) {

                const p = parseInt(key, 10);

                if (_isFinite(p)) {

                    factory.setMainColor(val);
                    newColors[p] = [...factory.currentColorInternalData];
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

// __easing__ - the easing to be applied to the gradient
// + Can accept a String value identifying an SC pre-defined easing function (default: `linear`)
// + Can also accept a function accepting a single Number argument (a value between 0-1) and returning an eased Number (again, between 0-1)
S.easing = function (item) {

    this.setEasingHelper(item);
};

// The __colorSpace__ and __returnColorAs__ attributes get passed through to the Palette's Color object
G.colorSpace = function () {

    return this.factory.colorSpace;
};
S.colorSpace = function (item) {

    if (item.toLowerCase) {

        item = item.toLowerCase();

        const factory = this.factory;

        const oldInt = factory.colorSpace;

        if (oldInt !== item) {

            factory.set({ colorSpace: item });

            if (oldInt !== factory.colorSpace) this.dirtyPalette = true;
        }
    }
};

// Note: deprecating - palette is only interested in factory internal colors.
G.returnColorAs = function () {

    return this.factory.returnColorAs;
};
S.returnColorAs = function (item) {

    if (item.toLowerCase) {

        item = item.toLowerCase();

        const factory = this.factory;

        const oldRet = factory.returnColorAs;

        if (oldRet !== item) {

            factory.set({ returnColorAs: item });

            if (oldRet !== factory.returnColorAs) this.dirtyPalette = true;
        }
    }
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
        factory = this.factory;

    factory.setMainColor(BLACK);
    newColors[0] = [...factory.currentColorInternalData];

    factory.setMainColor(WHITE);
    newColors[999] = [...factory.currentColorInternalData];

    return newColors;
};

// `getColorSpace` - returns the color factory's current colorSpace value
P.getColorSpace = function () {

    return this.factory.colorSpace;
};

P.getReturnColorAs = function () {

    return this.factory.returnColorAs;
};

P.setEasing = function (item) {

    this.setEasingHelper(item);
    return this;
};

P.setEasingHelper = function (item) {

    if (isa_fn(item) || (EASE_ENGINE_KEYS.includes(item))) {

        this.easing = item;
        this.easingFunction = item;

        this.dirtyPaletteData = true;
    }
};

// `recalculateStopColors` - populate the stops Array with CSS color Strings, as determined by colors stored in the `colors` object
// + Be aware that if color stops have not been set at index 0, or index 999, the indices between 0 to start, and between end to 999, will remain transparent black.
P.recalculateStopColors = function () {

    if (!this.dirtyPalette) return;

    this.dirtyPalette = false;
    this.dirtyPaletteData = true;

    const { colors, stops, factory } = this;

    stops.fill(BLANK);

    const keys = _keys(colors)
        .map(n => parseInt(n, 10))
        .filter(n => _isFinite(n) && n >= 0 && n <= 999 && colors[n])
        .sort((a, b) => a - b);

    if (keys.length < 2) {

        console.warn(`Palette '${this.name}': needs at least 2 stops to build gradient (found ${keys.length})`);
        this.dirtyPalette = true;
        return;
    }

    let a, b, span;

    for (let i = 0; i < keys.length - 1; i++) {

        a = keys[i];
        b = keys[i + 1];
        span = b - a;

        factory.set({
            minimumColor: factory.buildColorStringFromData(colors[a]),
            maximumColor: factory.buildColorStringFromData(colors[b]),
        });

        if (i === 0) stops[a] = factory.getRangeColor(0);

        for (let j = a + 1; j < b; j++) {

            stops[j] = factory.getRangeColor((j - a) / span);
        }

        stops[b] = factory.getRangeColor(1);
    }
};

// `updateColor` - add or update a gradient-type style's Palette object with a color.
// + __index__ - positive integer Number between 0 and 999 inclusive
// + __color__ - CSS color String
P.updateColor = function (index, color) {

    const factory = this.factory;

    if (xta(index, color)) {

        index = (index.substring) ? parseInt(index, 10) : _floor(index);

        if (_isFinite(index) && index >= 0 && index < 1000 && color && color.substring) {

            factory.setMainColor(color);
            this.colors[index] = [...factory.currentColorInternalData];
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

    const { easing, precision } = this,
        colorSpace = this.factory.colorSpace,
        { stops } = this;

    if (!xta(start, end)) {
        start = 0;
        end = 999;
    }

    const workstoreName = `${this.name}-data-${start}-${end}-${cycle ? 1 : 0}`;

    if (this.dirtyPaletteData || !checkForWorkstoreItem(workstoreName)) {

        this.dirtyPaletteData = false;

        const keys = _keys(this.colors)
            .map(n => parseInt(n, 10))
            .filter(n => _isFinite(n))
            .sort((a, b) => a - b);

        const engine = isa_fn(easing) ? easing : easeEngines[easing],
            precisionTest = (!precision || (easing === LINEAR && colorSpace === RGB)) ? false : true,
            data = [],
            intermediate = [];

        let spread = 0;

        // Option 1: start == end, cycle irrelevant. Returns solid color at start of gradient
        if (start === end) return stops[start] || BLANK;

        // Calculate span
        if (start < end) spread = end - start;
        else if (cycle) spread = (1000 - start) + end;
        else spread = start - end;

        const sampleColor = function (t) {

            let u = engine(t),
                sample;

            if (cycle) {

                if (u > 1) u -= _floor(u);
                else if (u < 0) u -= _floor(u);
            }
            else {

                if (u < 0) u = 0;
                else if (u > 1) u = 1;
            }

            // start < end
            if (start < end) {

                sample = start + (u * spread);
            }

            // start > end, cycle = true
            else if (cycle) {

                sample = start + (u * spread);

                while (sample > 999) sample -= 1000;
                while (sample < 0) sample += 1000;
            }

            // start > end, cycle = false
            else {

                sample = start - (u * spread);
            }

            sample = _floor(sample + 0.5);

            if (cycle) {

                if (sample > 999) sample -= 1000;
                if (sample < 0) sample += 1000;
            }
            else {

                if (sample < 0) sample = 0;
                else if (sample > 999) sample = 999;
            }

            return stops[sample] || BLANK;
        };

        const pushIntermediateStop = function (t) {

            if (t > 0 && t < 1) intermediate.push([t, sampleColor(t)]);
        };

        // Option 2: start < end, cycle irrelevant
        if (start < end) {

            if (precisionTest) {

                for (let d = precision; d < spread; d += precision) {

                    pushIntermediateStop(d / spread);
                }
            }
            else {

                let item, t;

                for (let i = 0, iz = keys.length; i < iz; i++) {

                    item = keys[i];

                    if (item > start && item < end) {

                        t = (item - start) / spread;
                        pushIntermediateStop(t);
                    }
                }
            }
        }

        // Option 3: start > end, cycle = true
        else if (cycle) {

            if (precisionTest) {

                for (let d = precision; d < spread; d += precision) {

                    pushIntermediateStop(d / spread);
                }
            }
            else {

                let item, t;

                for (let i = 0, iz = keys.length; i < iz; i++) {

                    item = keys[i];

                    if (item > start) {

                        t = (item - start) / spread;
                        pushIntermediateStop(t);
                    }
                    else if (item < end) {

                        t = ((1000 - start) + item) / spread;
                        pushIntermediateStop(t);
                    }
                }
            }
        }

        // Option 4: start > end, cycle = false
        else {

            if (precisionTest) {

                for (let d = precision; d < spread; d += precision) {

                    pushIntermediateStop(d / spread);
                }
            }
            else {

                let item, t;

                for (let i = 0, iz = keys.length; i < iz; i++) {

                    item = keys[i];

                    if (item < start && item > end) {

                        t = (start - item) / spread;
                        pushIntermediateStop(t);
                    }
                }
            }
        }

        intermediate.sort((a, b) => a[0] - b[0]);

        data.push(0, sampleColor(0));

        for (let i = 0, iz = intermediate.length; i < iz; i++) {

            data.push(intermediate[i][0], intermediate[i][1]);
        }

        data.push(1, sampleColor(1));

        setWorkstoreItem(workstoreName, data);
    }

    return getWorkstoreItem(workstoreName) || BLANK;
};

// `getColorAtPosition` - a convenience function to retrieve the color at a specified position within the current gradient
P.getColorAtPosition = function (val) {

    if (
        Number.isSafeInteger(val) && 
        val >= 0 && 
        val <= 999 && 
        this.stops
    ) return this.stops[val];

    return null;
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
