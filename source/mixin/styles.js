// # Styles mixin
// The styles mixin contains most of the code required for the [Gradient](../factory/gradient.html), [RadialGradient](../factory/radialGradient.html) an [ConicGradient](../factory/conicGradient.html) styles factories. It is not used by the other styles objects ([Color](../factory/color.html), [Pattern](../factory/pattern.html)).
// + the __start__ and __end__ positioning attributes are defined here rather than in the factories
// + gradient-type styles manage their color stops in [Palette factory](../factory/palette.html) objects; that functionality is entirely defined here
//
// The Canvas API CanvasRenderingContext2D interface defines three types of gradient: the widely supported [linear](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient) and [radial](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient) gradients, and the [conic](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createConicGradient) which, while widely supported as a CSS feature, is very much an experimental technology for CanvasRenderingContext2D engines.
// + the `createLinearGradient` method creates a gradient along the line connecting two given coordinates (__start__ and __end__) which are absolute values (measured in pixels) from the &lt;canvas> elements top-left corner
// + the `createRadialGradient` method creates a radial gradient using the size and coordinates of two circles.
// + the `createConicGradient` method creates a conic gradient as a 360° sweep around the gradient's start coordinate. For browsers which don't support this gradient out of the box, the method will apply no gradient to the entity.
//
// Common to linear and radial types of gradient is the idea of a start coordinate and an end coordinate, supplied in pixels.
// + Scrawl-canvas extends this idea so that the coordinates can be supplied as a percentage value (String%) of the host Cell's dimensions.
// + Furthermore Scrawl-canvas allows each entity that uses a Gradient-type style to indicate whether the reference box should be that of the host Cell, or of the entity itself, through their `lockFillStyleToEntity` and `lockStrokeStyleToEntity` attribute flags.


// #### Imports
import { entity, styles, stylesnames } from '../core/library.js';

import { addStrings, isa_obj, mergeDiscard, mergeOver, xt, λnull, Ωempty } from '../core/utilities.js';

import { makeAnimation } from '../factory/animation.js';
import { makeCoordinate } from '../factory/coordinate.js';

import { makePalette } from '../factory/palette.js';

import { _isArray, _keys, _values, BLACK, BLANK, BOTTOM, CENTER, COLORS, END, LEFT, LINEAR, NAME, PALETTE_KEYS, RGB, RIGHT, START, T_PALETTE, TOP, UNDEF, WHITE } from '../core/shared-vars.js';


// Create an animation to handle automated delta gradient animation
makeAnimation({

    name: 'SC-system-gradient-delta-animation',
    fn: () => {

        stylesnames.forEach(name => {

            const style = styles[name];

            if (style && style.animateByDelta) style.updateByDelta();
        });
    },
});


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {


// __start__, __end__ - Gradient-type styles use Coordinate factory Arrays to hold details of their start and end coordinates. The following _pseudo-attributes_ can also be used to reference these values:
// + for the start coordinate, __startX__ and __startY__
// + for the end coordinate, __endX__ and __endY__
//
// In all cases, the attribute values can be Numbers, which indicate absolute pixel coordinates, or String% values for coordinates calculated relative to either Cell or entity current dimensions
// + for the `x` coordinate, the Strings __left__, __center__ and __right__ are also supported
// + for the `y` coordinate, the Strings __top__, __center__ and __bottom__ are also supported
        start: null,
        end: null,


// __palette__ - Every gradient requires a Palette object containing color stop instructions. Generation of the object is automated and should ot be tampered with. Add and remove colors to the gradient using the `updateColor` and `removeColor` functions.
        palette: null,


// __paletteStart__, __paletteEnd__ - We don't need to use the entire palette when building a gradient; we can restrict the palette using these start and end attributes.
        paletteStart: 0,
        paletteEnd: 999,


// The __cyclePalette__ attribute tells the Palette object how to handle situations where the paletteStart value is greater than the paletteEnd value:
// + when false, we reverse the color stops
// + when true, we keep the normal order of color stops and pass through the 1/0 border
        cyclePalette: false,

// The __animateByDelta__ attribute, when true, will delta animate the gradient at the start of each Display cycle. When the gradient is used in the `mapToGradient`` filter, setting this attribute to `false` (default) should speed up the filter
        animateByDelta: false,

// The __delta__ object is not stored in the defs object; it acts in a similar way to the artefact delta object - though it is restricted to adding delta values to Number and 'String%' attributes.
// + Unlike artefacts, where delta animation will be applied to artefacts by default as part of each Display cycle, gradient delta animations need to be explicitly invoked: `my_gradient.updateByDelta();`
//
// The __colors__ _pseudo-attribute_ can be used to pass through an array of palette color objects to the Palette object. The data is not retained by the gradient object.
// + A better approach to managing gradient colors is to use the `updateColor` and `removeColor` functions

// The __easing__ _pseudo-attribute_ represents a transformation that will be applied to a copy of the color stops Array - this allows us to create non-linear gradients. Value is passed through to the Palette object

// The __precision__ _pseudo-attribute_ - value is passed through to the Palette object

// The __colorSpace__ - String _pseudo-attribute_ defines the color space to be used by the Palette's Color object for its internal calculations - value is passed through to the Palette object
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH', 'OKLAB', 'OKLCH'` with `RGB` as the default
//
// The __returnColorAs__ - String _pseudo-attribute_ defines the type of color String the Palette's Color object will return - value is passed through to the Palette object
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'LAB', 'LCH', 'OKLAB', 'OKLCH'` with `RGB` as the default

    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.finalizePacketOut = function (copy, items) {

        if (items.colors) copy.colors = items.colors;
        else if (this.palette) copy.colors = this.palette.get(COLORS);
        else copy.colors = [[0, BLACK], [999, WHITE]];

        // TODO: don't think this will return bespoke easing functions - need to think further on how to accomplish this
        if (items.easing) copy.easing = items.easing;
        else if (this.palette && this.palette.easing) copy.easing = this.palette.easing;
        else copy.easing = LINEAR;

        if (xt(items.precision)) copy.precision = items.precision;
        else if (this.palette && xt(this.palette.precision)) copy.precision = this.palette.precision;
        else copy.precision = 0;

        if (items.colorSpace) copy.colorSpace = items.colorSpace;
        else if (this.palette) copy.colorSpace = this.palette.getColorSpace();
        else copy.colorSpace = RGB;

        if (items.returnColorAs) copy.returnColorAs = items.returnColorAs;
        else if (this.palette) copy.returnColorAs = this.palette.getReturnColorAs();
        else copy.returnColorAs = RGB;

        return copy;
    };


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
    P.kill = function () {

        const myname = this.name;

        if (this.palette && this.palette.kill) this.palette.kill();

        // Remove style from all entity state objects
        _values(entity).forEach(ent => {

            const state = ent.state;

            if (state) {

                const fill = state.fillStyle,
                    stroke = state.strokeStyle;

                if (isa_obj(fill) && fill.name === myname) state.fillStyle = state.defs.fillStyle;
                if (isa_obj(stroke) && stroke.name === myname) state.strokeStyle = state.defs.strokeStyle;
            }
        });

        // Remove style from the Scrawl-canvas library
        this.deregister();

        return this;
    };


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters,
        D = P.deltaSetters;

// `start`, `startX`, `startY`
    G.startX = function () {

        return this.currentStart[0];
    };
    G.startY = function () {

        return this.currentStart[1];
    };
    S.startX = function (coord) {

        if (coord != null) {

            this.start[0] = coord;
            this.dirtyStart = true;
        }
    };
    S.startY = function (coord) {

        if (coord != null) {

            this.start[1] = coord;
            this.dirtyStart = true;
        }
    };
    S.start = function (x, y) {

        this.setCoordinateHelper(START, x, y);
        this.dirtyStart = true;
    };
    D.startX = function (coord) {

        const c = this.start;
        c[0] = addStrings(c[0], coord);
        this.dirtyStart = true;
    };
    D.startY = function (coord) {

        const c = this.start;
        c[1] = addStrings(c[1], coord);
        this.dirtyStart = true;
    };
    D.start = function (x, y) {

        this.setDeltaCoordinateHelper(START, x, y);
        this.dirtyStart = true;
    };

// `end`, `endX`, `endY`
    G.endX = function () {

        return this.currentEnd[0];
    };
    G.endY = function () {

        return this.currentEnd[1];
    };
    S.endX = function (coord) {

        if (coord != null) {

            this.end[0] = coord;
            this.dirtyEnd = true;
        }
    };
    S.endY = function (coord) {

        if (coord != null) {

            this.end[1] = coord;
            this.dirtyEnd = true;
        }
    };
    S.end = function (x, y) {

        this.setCoordinateHelper(END, x, y);
        this.dirtyEnd = true;
    };
    D.endX = function (coord) {

        const c = this.end;
        c[0] = addStrings(c[0], coord);
        this.dirtyEnd = true;
    };
    D.endY = function (coord) {

        const c = this.end;
        c[1] = addStrings(c[1], coord);
        this.dirtyEnd = true;
    };
    D.end = function (x, y) {

        this.setDeltaCoordinateHelper(END, x, y);
        this.dirtyEnd = true;
    };

// `palette` - argument has to be a Palette object
    S.palette = function (item = Ωempty) {

        if(item.type == T_PALETTE) {

            item.dirtyPalette = true;
            this.palette = item;
        }
    };

// `paletteStart` - argument must be a positive integer Number in the range 0 - 999
    S.paletteStart = function (item) {

        if (item.toFixed && this.palette) {

            this.paletteStart = item;

            if(item < 0 || item > 999) {

                this.paletteStart = (item > 500) ? 999 : 0;
            }
            this.palette.updateData();
        }
    };
    D.paletteStart = function (item) {

        let p;

        if (item.toFixed && this.palette) {

            p = this.paletteStart + item;

            if (p < 0 || p > 999) {

                if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
                else p = (item > 500) ? 999 : 0;
            }

            this.paletteStart = p;
            this.palette.updateData();
        }
    };


// `paletteEnd` - argument must be a positive integer Number in the range 0 - 999
    S.paletteEnd = function (item) {

        if (item.toFixed && this.palette) {

            this.paletteEnd = item;

            if (item < 0 || item > 999) this.paletteEnd = (item > 500) ? 999 : 0;
            this.palette.updateData();
        }
    };

    D.paletteEnd = function (item) {

        let p;

        if (item.toFixed && this.palette) {

            p = this.paletteEnd + item;

            if (p < 0 || p > 999) {

                if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
                else p = (item > 500) ? 999 : 0;
            }

            this.paletteEnd = p;
            this.palette.updateData();
        }
    };

    S.cyclePalette = function (item) {

        if (this.palette) {

            this.cyclePalette = !!item;
            this.palette.updateData();
        }
    };

// `colors` - We can pass through an array of palette color arrays to the Palette object by setting it on the gradient-type styles object. Each palette array is in the form `[Number, String]` where:
// + Number is a positive integer in the range 0-999
// + String is any legitimate CSS color string value
    S.colors = function (item) {

        if (_isArray(item) && this.palette) this.palette.set({ colors: item });
    };

// `easing`, `easingFunction` - the easing to be applied to the gradient
// + Can accept a String value identifying an SC pre-defined easing function (default: `linear`)
// + Can also accept a function accepting a single Number argument (a value between 0-1) and returning an eased Number (again, between 0-1)
    S.easing = function (item) {

        if (this.palette) {

            this.palette.set({ easing: item });
        }
    };
    S.easingFunction = S.easing;

// `colorSpace`, `returnColorAs` - Pass through a color space String to the Palette object
    S.colorSpace = function (item) {

        if (this.palette) this.palette.set({ colorSpace: item });
    };
    S.returnColorAs = function (item) {

        if (this.palette) this.palette.set({ returnColorAs: item });
    };

// `precision` - Pass through a positive integer Number value between 0 and 50 to the Palette object. If value is `0` (default) no easing will be applied to the gradient; values above 0 apply the easing to the gradient; higher values will give a quicker, but less precise, mapping.
    S.precision = function (item) {

        if (this.palette) this.palette.set({ precision: item });
    };

// `delta` - Gradient-type styles objects support the delta attribute, and can be delta-animated using its attributes
    S.delta = function (items = Ωempty) {

        if (items) this.delta = mergeDiscard(this.delta, items);
    };


// #### Prototype functions

// `get` - Overwrites function defined in mixin/base.js - takes into account Palette object attributes
    P.get = function (item) {

        const getter = this.getters[item],
            palette = this.palette;

        if (getter) return getter.call(this);
        else {

            let def = this.defs[item],
                val;

            if (typeof def != UNDEF) {

                val = this[item];
                return (typeof val != UNDEF) ? val : def;
            }

            def = palette.defs[item];

            if (typeof def != UNDEF) {

                val = palette[item];
                return (typeof val != UNDEF) ? val : def;
            }
            else return undefined;
        }
    };


// `set` - Overwrites function defined in mixin/base.js - takes into account Palette object attributes
    P.set = function (items = Ωempty) {

        const keys = _keys(items),
            keysLen = keys.length;

        if (keysLen) {

            const setters = this.setters,
                defs = this.defs,
                palette = this.palette;

            let paletteSetters, paletteDefs, predefined, i, key, value;

            if (palette) {

                paletteSetters = palette.setters || Ωempty;
                paletteDefs = palette.defs || Ωempty;
            }

            for (i = 0; i < keysLen; i++) {

                key = keys[i];
                value = items[key];

                if (key && key != NAME && value != null) {

                    if (!PALETTE_KEYS.includes(key)) {

                        predefined = setters[key];

                        if (predefined) predefined.call(this, value);
                        else if (typeof defs[key] != UNDEF) this[key] = value;
                    }
                    else {

                        predefined = paletteSetters[key];

                        if (predefined) predefined.call(palette, value);
                        else if (typeof paletteDefs[key] != UNDEF) palette[key] = value;
                    }
                }
            }
            this.dirtyFilterIdentifier = true;
        }
        return this;
    };

// `setDelta` - Overwrites function defined in mixin/base.js - takes into account Palette object attributes
    P.setDelta = function (items = Ωempty) {

        const keys = _keys(items),
            keysLen = keys.length;

        if (keysLen) {

            const setters = this.deltaSetters,
                defs = this.defs,
                palette = this.palette;

            let paletteSetters, paletteDefs, predefined, i, key, value;

            if (palette) {

                paletteSetters = palette.deltaSetters || Ωempty;
                paletteDefs = palette.defs || Ωempty;
            }

            for (i = 0; i < keysLen; i++) {

                key = keys[i];
                value = items[key];

                if (key && key != NAME && value != null) {

                    if (!PALETTE_KEYS.includes(key)) {

                        predefined = setters[key];

                        if (predefined) predefined.call(this, value);
                        else if (typeof defs[key] != UNDEF) this[key] = addStrings(this[key], value);
                    }
                    else {

                        predefined = paletteSetters[key];

                        if (predefined) predefined.call(palette, value);
                        else if (typeof paletteDefs[key] != UNDEF) palette[key] = addStrings(this[key], value);
                    }
                }
            }
            this.dirtyFilterIdentifier = true;
        }
        return this;
    };

// `setCoordinateHelper` - internal helper function
    P.setCoordinateHelper = function (label, x, y) {

        const c = this[label];

        if (_isArray(x)) {

            c[0] = x[0];
            c[1] = x[1];
        }
        else {

            c[0] = x;
            c[1] = y;
        }
    };

// `setDeltaCoordinateHelper` - internal helper function
    P.setDeltaCoordinateHelper = function (label, x, y) {

        const c = this[label],
            myX = c[0],
            myY = c[1];

        if (_isArray(x)) {

            c[0] = addStrings(myX, x[0]);
            c[1] = addStrings(myY, x[1]);
        }
        else {

            c[0] = addStrings(myX, x);
            c[1] = addStrings(myY, y);
        }
    };

// `updateByDelta` - manually force the gradient-type styles object to update its attributes by the values supplied in its delta attribute
    P.updateByDelta = function () {

        this.setDelta(this.delta);

        return this;
    };

// `stylesInit` - common functionality invoked by gradient-type factory constructors
    P.stylesInit = function (items = Ωempty) {

        this.makeName(items.name);
        this.register();

        this.gradientArgs = [];

        this.start = makeCoordinate();
        this.end = makeCoordinate();

        this.currentStart = makeCoordinate();
        this.currentEnd = makeCoordinate();

        this.palette = makePalette({
            name: `${this.name}_palette`,
        });

        this.delta = {};

        this.set(this.defs);

        this.set(items);
    };


// `getData` - Every styles object (Gradient, RadialGradient, Pattern, Color, Cell) needs to include a __getData__ function. This is invoked by Cell objects during the Display cycle `compile` step, when it takes an entity State object and updates its &lt;canvas> element's context engine to bring it into alignment with requirements.
    P.getData = function (entity, cell) {

        // Step 1: recalculate current start and end points
        this.cleanStyle(entity, cell);

        // Step 2: finalize the coordinates to use for creating the gradient in relation to the current entity's position and requirements on the canvas
        this.finalizeCoordinates(entity);

        // Step 3: create, populate and return gradient/pattern object
        return this.buildStyle(cell);
    };

// `cleanStyle` - internal function invoked as part of the gradient-type object's `getData` function. The style has to be cleaned every time it is applied to a Cell's engine because it can never know which Cell is invoking it, or for which entity it is to be used.
    P.cleanStyle = function (entity = Ωempty, cell = Ωempty) {

        let dims, w, h, scale;

        if (entity.lockFillStyleToEntity || entity.lockStrokeStyleToEntity) {

            dims = entity.currentDimensions;
            scale = entity.currentScale;

            w = dims[0] * scale;
            h = dims[1] * scale;
        }
        else {

            dims = cell.currentDimensions;
            w = dims[0];
            h = dims[1];
        }

        this.cleanPosition(this.currentStart, this.start, [w, h]);
        this.cleanPosition(this.currentEnd, this.end, [w, h]);
        this.cleanRadius(w);
    };

// `cleanPosition` - internal function invoked as part of the gradient-type object's `cleanStyle` function.
    P.cleanPosition = function (current, source, dimensions) {

        let val, dim;

        for (let i = 0; i < 2; i++) {

            val = source[i];
            dim = dimensions[i];

            if (val.toFixed) current[i] = val;
            else if (val == LEFT || val == TOP) current[i] = 0;
            else if (val == RIGHT || val == BOTTOM) current[i] = dim;
            else if (val == CENTER) current[i] = dim / 2;
            else current[i] = (parseFloat(val) / 100) * dim;
        }
    };

// `finalizeCoordinates` - internal function invoked as part of the gradient-type object's `getData` function.
    P.finalizeCoordinates = function (entity = Ωempty) {

        const entityStampPosition = entity.currentStampPosition,
            entityStampHandlePosition = entity.currentStampHandlePosition,
            entityScale = entity.currentScale;

        let correctX, correctY;

        if (entity.lockFillStyleToEntity || entity.lockStrokeStyleToEntity) {

            correctX = -(entityStampHandlePosition[0] * entityScale) || 0;
            correctY = -(entityStampHandlePosition[1] * entityScale) || 0;
        }
        else {

            correctX = -entityStampPosition[0] || 0;
            correctY = -entityStampPosition[1] || 0;
        }
        this.updateGradientArgs(correctX, correctY);
    };


// `cleanRadius` - overwritten by the RadialGradient factory
    P.cleanRadius = λnull;


// `buildStyle` - Just in case something went wrong with loading other styles Factory modules, which must overwrite this function, we can return transparent color here
    P.buildStyle = function () {

        return BLANK;
    };

// `addStopsToGradient` - internal function, called by the `buildStyle` function (which is overwritten by the various gradient factories)
    P.addStopsToGradient = function (gradient, start, stop, cycle) {

        if (this.palette) return this.palette.addStopsToGradient(gradient, start, stop, cycle);
        return gradient;
    };

// #### Gradients and color stops
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
// To `set` the Palette object's `colors` object, either when creating the gradient-type style or at some point afterwards, we can use CSS color Strings instead of an array of values for each color. Note that:
// + the color object attribute labels MUST include a space after the String number; and
// + the number itself must be a positive integer in the range 0-999:
//
// ```
// myGradient.set({
//
//     colors: {
//
//         '0 ': 'black',
//         '350 ': 'red',
//         '650 ': 'blue',
//         '999 ': 'white'
//     },
// });
// ```
//
// The following __convenience functions__ are supplied to make adding, deleting and managing Palette object color stop data easier than the above:

// `updateColor` - add or update a gradient-type style's Palette object with a color.
// + __index__ - positive integer Number between 0 and 999 inclusive
// + __color__ - CSS color String
    P.updateColor = function (index, color) {

        if (this.palette) {

            this.dirtyFilterIdentifier = true;
            this.palette.updateColor(index, color);
        }

        return this;
    };

// `removeColor` - remove a gradient-type style's Palette object color from a specified index
// + __index__ - positive integer number between 0 and 999 inclusive
    P.removeColor = function (index) {

        if (this.palette) {

            this.dirtyFilterIdentifier = true;
            this.palette.removeColor(index);
        }

        return this;
    };
}
