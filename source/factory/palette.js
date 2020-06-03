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


// #### Demos:
// + [Canvas-003](../../demo/canvas-003.html) - Linear gradients
// + [Canvas-004](../../demo/canvas-004.html) - Radial gradients
// + [Canvas-005](../../demo/canvas-005.html) - Cell-locked, and Entity-locked, gradients; animating gradients by delta, and by tween
// + [Canvas-022](../../demo/canvas-022.html) - Grid entity - basic functionality (color, gradients)


// #### Imports
import { constructors } from '../core/library.js';
import { λnull, isa_obj, mergeOver, xt, xta, pushUnique } from '../core/utilities.js';

import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';


// #### Palette constructor
const Palette = function (items = {}) {


    this.makeName(items.name);
    this.register();
    this.set(this.defs);

    this.colors = items.colors || {'0 ': [0,0,0,1], '999 ': [255,255,255,1]};
    this.stops = Array(1000);

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

// The __colors__ object is a raw Javascript object which uses stop values `('0 ' - '999 ')` as keys and an `[r(0-255), g(0-255), b(0-255), a(0-1)]` array as values. 
    colors: null,

// The __stops__ array is a fixed Array of length 1000 containing rgba color strings for each index. 
    stops: null,

// If the __cyclic__ flag is set, then we know to calculate appropriate stop values between the last key color and the first key color, thus allowing for smooth crossing of the 1 -> 0 stops boundary
    cyclic: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['stops']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters;


// __colors__ - No checking is done prior to assigning the colors object to the colors attribute beyond verifying that the argument value is an object.
S.colors = function (item) {

    if (isa_obj(item)) {

        let f = this.factory;

        Object.entries(item).forEach(([pos, col]) => {

            if (col.substring) {

                f.convert(col);
                item[pos] = [f.r, f.g, f.b, f.a];
            }
        });

        this.colors = item;
        this.dirtyPalette = true;
    }
};


// __stops__ - Do nothing. The stops array needs to be kept private, its values set only via the `recalculate` function, which happens whenever the `dirtyPalette` attribute is set to true.
S.stops = λnull;


// #### Prototype functions

// `recalculateHold` - internal variable
P.recalculateHold = [];

// `recalculate` - populate the stops Array with CSS color Strings, as determined by colors stored in the `colors` object
P.recalculate = function () {

    let keys, i, iz, j, jz, cursor, diff, 
        current, next, nextKey, temp,
        r, g, b, a,
        colors = this.colors,
        stops = this.stops,
        make = this.makeColorString,
        hold = this.recalculateHold;

    keys = Object.keys(colors);
    keys = keys.map(n => parseInt(n, 10))
    keys.sort((a, b) => a - b);

    stops.fill('rgba(0,0,0,0)');

    this.dirtyPalette = false;

    for (i = 0, iz = keys.length - 1; i < iz; i++) {

        cursor = keys[i];
        nextKey = keys[i + 1];
        diff = nextKey - cursor;

        current = colors[cursor + ' '];
        next = colors[nextKey + ' '];

        r = (next[0] - current[0]) / diff;
        g = (next[1] - current[1]) / diff;
        b = (next[2] - current[2]) / diff;
        a = (next[3] - current[3]) / diff;

        for (j = 0, jz = diff; j < jz; j++) {

            hold[0] = current[0] + (r * j);
            hold[1] = current[1] + (g * j);
            hold[2] = current[2] + (b * j);
            hold[3] = current[3] + (a * j);

            stops[cursor] = make(hold);
            cursor++;
        }
    }

    stops[cursor] = make(next);

    if (this.cyclic) {

        cursor = keys[keys.length - 1];
        nextKey = keys[0];
        diff = (nextKey + 1000) - cursor;

        current = colors[cursor + ' '];
        next = colors[nextKey + ' '];

        r = (next[0] - current[0]) / diff;
        g = (next[1] - current[1]) / diff;
        b = (next[2] - current[2]) / diff;
        a = (next[3] - current[3]) / diff;

        for (j = 0, jz = diff; j < jz; j++) {

            hold[0] = current[0] + (r * j);
            hold[1] = current[1] + (g * j);
            hold[2] = current[2] + (b * j);
            hold[3] = current[3] + (a * j);

            stops[cursor] = make(hold);
            cursor++;

            if (cursor > 999) cursor -= 1000;
        }
    }
    else {

        cursor = keys[0];
        
        if (cursor > 0) {

            temp = stops[cursor];
            
            for (i = 0, iz = cursor; i < iz; i++) {

                stops[i] = temp;
            }
        }

        cursor = keys[keys.length - 1];

        if (cursor < 999) {

            temp = stops[cursor];

            for (i = cursor, iz = 1000; i < iz; i++) {

                stops[i] = temp;
            }
        }
    }
};

// `makeColorString` - internal helper function
P.makeColorString = function (item) {

    let f = Math.floor,
        r, g, b, a;

    let constrainer = (n, min, max) => {
        n = (n < min) ? min : n;
        n = (n > max) ? max : n;
        return n;
    };

    r = constrainer(f(item[0]), 0, 255),
    g = constrainer(f(item[1]), 0, 255),
    b = constrainer(f(item[2]), 0, 255),
    a = constrainer(item[3], 0, 1);

    return `rgba(${r},${g},${b},${a})`;
};

// `updateColor` - add or update a gradient-type style's Palette object with a color.
// + __index__ - positive integer Number between 0 and 999 inclusive
// + __color__ - CSS color String
P.updateColor = function (index, color) {

    let f = this.factory;

    if (xta(index, color)) {

        index = (index.substring) ? parseInt(index, 10) : Math.floor(index);

        if (index >= 0 && index <= 999) {

            f.convert(color);
            index += ' ';
            this.colors[index] = [f.r, f.g, f.b, f.a];
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

    let stops = this.stops,
        keys = Object.keys(this.colors),
        spread, offset, i, iz, item, n;

    if (gradient) {

        keys = keys.map(n => parseInt(n, 10))
        keys.sort((a, b) => a - b);

        if (!xta(start, end)) {
            start = 0;
            end = 999;
        }

        // Option 1 start == end, cycle irrelevant
        if (start === end) return stops[start] || 'rgba(0,0,0,0)';

        // Option 2: start < end, cycle irrelevant
        else if (start < end) {

            gradient.addColorStop(0, stops[start]);
            gradient.addColorStop(1, stops[end]);
        
            spread = end - start;

            for (i = 0, iz = keys.length; i < iz; i++) {

                item = keys[i];

                if (item > start && item < end) {

                    offset = (item - start) / spread;

                    if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
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

                for (i = 0, iz = keys.length; i < iz; i++) {

                    item = keys[i];

                    if (item > start) offset = (item - start) / spread;
                    else if (item < end) offset = (item + n) / spread;
                    else continue;

                    if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
                }
            }

            // Option 4: start > end, cycle = false
            else {

                gradient.addColorStop(0, stops[start]);
                gradient.addColorStop(1, stops[end]);
            
                spread = start - end;

                for (i = 0, iz = keys.length; i < iz; i++) {

                    item = keys[i];

                    if (item < start && item > end) {

                        offset = 1 - ((item - end) / spread);

                        if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
                    }
                }
            }
        }
        return gradient;
    }

    // No gradient: no colors
    else return 'rgba(0,0,0,0)';
};

// `factory` - We add a Scrawl-canvas [Color object](./color.html) to the Palette factory prototype - one object is used for all the calculations preformed by all Palette objects
P.factory = makeColor({

    name: 'palette-factory-color-calculator',
    opaque: false,
});


// #### Factory
const makePalette = function (items) {
    return new Palette(items);
};

constructors.Palette = Palette;


// #### Exports
export {
    makePalette,
};
