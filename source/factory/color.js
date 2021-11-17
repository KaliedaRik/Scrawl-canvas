// # Color factory
// Color objects generate CSS rgb() or rgba() color strings, which can then be used to set an entity's [State](./state.html) object's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
// + Factory can accept any legal CSS color keyword as an attribute, alongside '#nnn' and '#nnnnnn' hexadecimal Strings. It will accept 'rgb()' and 'rgba()' strings under certain conditions.
// + It can also accept __r__, __g__, __b__ and __a__ channel Number attributes (0-255 integers for r, g, b; 0-1 float Number for a), from which a color can be constructed.
// + It can be used to generate random colors, using channel __max__ and __min__ integer Number attributes to limit the range of the random colors.
// + It can be deltaAnimated by setting channel __shift__ float Number attributes and setting the __autoUpdate__ Boolean flag to true. Delta animations can run until values hit their set max/min values, or can bounce between min and max values, depending on the setting of the channel __bounce__ Boolean flags.
// + It can also be animated directly, or using delta animation, or act as the target for __Tween__ animations.
// + Colors can be cloned, and killed.

// TODO: The color object does not yet handle the following color inputs:
// + `hsl[a](H, S, L[, A])` - color will be treated as transparent black
// + `hsl[a](H S L[ / A])` - color will be treated as transparent black
// + for `rgb()` and `rgba()`, if any of the values (including alpha) is given as a %Number, all values will be treated as percentages (in the spec, rgb values all need to be either integer Number 0-255, or %Number 0%-100%, but channels cannot mix the two notations, whereas the alpha value format _can_ differ from rgb value format)

// #### Demos:
// + [Canvas-031](../../demo/canvas-031.html) - Cell generation and processing order - kaleidoscope clock
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets; save and load a range of different entitys
// + [DOM-009](../../demo/dom-009.html) - Stop and restart the main animation loop; add and remove event listener; retrieve all artefacts at a given coordinate
// + [DOM-012](../../demo/dom-012.html) - Add and remove (kill) Scrawl-canvas canvas elements programmatically


// #### Imports
import { constructors, entity } from '../core/library.js';
import { mergeOver, xt, xtGet, isa_obj, easeOutSine, easeInSine, easeOutInSine, easeOutQuad, easeInQuad, easeOutInQuad, easeOutCubic, easeInCubic, easeOutInCubic, easeOutQuart, easeInQuart, easeOutInQuart, easeOutQuint, easeInQuint, easeOutInQuint, easeOutExpo, easeInExpo, easeOutInExpo, easeOutCirc, easeInCirc, easeOutInCirc, easeOutBack, easeInBack, easeOutInBack, easeOutElastic, easeInElastic, easeOutInElastic, easeOutBounce, easeInBounce, easeOutInBounce, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';


// #### Color constructor
const Color = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);
    this.set(items);

    if (xt(items.color)) this.convert(items.color);

    if (items.random) this.generateRandomColor(items);

    this.checkValues();

    return this;
};


// #### Color prototype
let P = Color.prototype = Object.create(Object.prototype);
P.type = 'Color';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Color attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {


// The color channel attributes __r__, __g__, __b__ and __a__ are all integer Numbers in the range 0 (no contribution to color from this channel) to 255 (100% contribution)
    r: 0,
    g: 0,
    b: 0,

// The alpha channel attribute __a__ is a float Number between 0 (transparent) and 1 (opaque)
    a: 1,

// We can limit a channel's range - useful, for instance, when asking the Color object to supply us with a restricted-random color, or when animating the color. Channel maximum values __must__ be higher than their minimum values.
    rMax: 255,
    gMax: 255,
    bMax: 255,
    aMax: 1,

    rMin: 0,
    gMin: 0,
    bMin: 0,
    aMin: 0,

// We can ask the Color object to update its channel values when it completes each get() invocation response. Channel __shift__ values can be set separately, and can be float Numbers.
    rShift: 0,
    gShift: 0,
    bShift: 0,
    aShift: 0,

// The __bounce__ boolean flags determine whether the color animation will be sticky (false, default), remaining at the channel's minimum or maximum value when it is reached, or whether that channel will bounce between its minimum and maximum values as the animation progresses.
    rBounce: false,
    gBounce: false,
    bBounce: false,
    aBounce: false,

// The __opaque__ Boolean flag will supply colors in 'rgb()' format; when set to false 'rgba()' format colors are supplied.
    opaque: true,

// The __autoUpdate__ Boolean flag switches on color animation
    autoUpdate: false,

// The __easing__ attribute affects the `getRangeColor` function, applying an easing function to those requests.
    easing: 'linear',

// ##### Non-retained argument attributes (for factory, clone, set functions)

// __random__ - the factory function, and the clone function, can ask the Color object to set its initial channel values randomly by including this attribute in the argument object; if the attribute resolves to true, random color functionality is invoked to set the r, g and b channel attributes to appropriately random values.

// __color__ - a CSS color definition String which the Color object will attempt to convert into appropriate r, g, b and a channel attribute values.

// __minimumColor__, __maximumColor__ - convenience pseudo-attributes to set the max and min rgba attributes

};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// Overwrites ./mixin/base.js
P.kill = function () {

    let myname = this.name;

    // Remove style from all entity state objects
    Object.entries(entity).forEach(([name, ent]) => {

        let state = ent.state;

        if (state) {

            let fill = state.fillStyle,
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

// `get` - overrides function in mixin/base.js
P.get = function (item) {

    if (!xt(item)) {

        let {r, g, b, a} = this;

        if (this.opaque) return `rgb(${r}, ${g}, ${b})`;
        else return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    else if (item === 'random') {

        this.generateRandomColor();
        return this.get();
    }
    else if (item.toFixed) {

        return this.getRangeColor(item);
    }
    else{

        let getter = this.getters[item];

        if (getter) return getter.call(this);

        else {

            let def = this.defs[item];

            if (typeof def != 'undefined') {

                let val = this[item];
                return (typeof val != 'undefined') ? val : def;
            }
            return undef;
        }
    }
};


// `set` - overrides function in mixin/base.js - see above for the additional attributes the set object argument can use.
P.set = function (items = Ωempty) {

    const keys = Object.keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs;
        
        let predefined, i, iz, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key !== 'name' && value != null) {

                predefined = setters[key];

                if (predefined) predefined.call(this, value);
                else if (typeof defs[key] !== 'undefined') this[key] = value;
            }
        }
        if (items.random) this.generateRandomColor(items);
        else this.checkValues();
    }
    return this;
};

// #### Get, Set, deltaSet
let S = P.setters;

S.color = function (item) {

    this.convert(item);
};
P.setColor = function (item) {

    this.convert(item);
    return this;
};

S.minimumColor = function (item) {

    let {r, g, b, a} = this;

    this.convert(item);

    this.rMin = this.r;
    this.gMin = this.g;
    this.bMin = this.b;
    this.aMin = this.a;

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
};
P.setMinimumColor = function (item) {

    let {r, g, b, a} = this;

    this.convert(item);

    this.rMin = this.r;
    this.gMin = this.g;
    this.bMin = this.b;
    this.aMin = this.a;

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;

    return this;
};

S.maximumColor = function (item) {

    let {r, g, b, a} = this;

    this.convert(item);

    this.rMax = this.r;
    this.gMax = this.g;
    this.bMax = this.b;
    this.aMax = this.a;

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
};
P.setMaximumColor = function (item) {

    let {r, g, b, a} = this;

    this.convert(item);

    this.rMax = this.r;
    this.gMax = this.g;
    this.bMax = this.b;
    this.aMax = this.a;

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;

    return this;
};

// #### Prototype functions

// `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
P.getData = function () {

    if (this.autoUpdate) this.update();

    this.checkValues();

    return this.get();
};

// `generateRandomColor` function asks the Color object to supply a random color, as restricted by its channel minimum and maximum attributes
P.generateRandomColor = function (items = Ωempty) {

    let round = Math.round,
        rnd = Math.random;

    let rMax = this.rMax = xtGet(items.rMax, this.rMax, 255),
        gMax = this.gMax = xtGet(items.gMax, this.gMax, 255),
        bMax = this.bMax = xtGet(items.bMax, this.bMax, 255);

    let rMin = this.rMin = xtGet(items.rMin, this.rMin, 0),
        gMin = this.gMin = xtGet(items.gMin, this.gMin, 0),
        bMin = this.bMin = xtGet(items.bMin, this.bMin, 0);

    this.r = items.r || round((rnd() * (rMax - rMin)) + rMin);
    this.g = items.g || round((rnd() * (gMax - gMin)) + gMin);
    this.b = items.b || round((rnd() * (bMax - bMin)) + bMin);

    if (!this.opaque) {

        aMax = this.aMax = xtGet(items.aMax, this.aMax, 1);
        aMin = this.aMin = xtGet(items.aMin, this.aMin, 0);
        this.a = items.a || (rnd() * (aMax - aMin)) + aMin;
    }

    this.checkValues();
    
    return this;
};

// `getRangeColor` - function which generates a color in the range between the minimum and maximum colors. 
// + when the argument is `0` the minimum color is returned; values below 0 are rounded up to 0
// + when the argument is `1` the maximum color is returned; values above 1 are rounded down to 1
// + values between `0` and `1` will return a blended color between the minimum and maximum colors
// + non-Number arguments should return the Color's current color value
P.getRangeColor = function (item) {

    if (xt(item) && item.toFixed) {

        let floor = Math.floor;

        let {rMin, gMin, bMin, aMin, rMax, gMax, bMax, aMax, easing} = this;

        if (easing !== 'linear') {

            switch (easing) {
                case 'easeOutSine' :
                    item = easeOutSine(item);
                    break;
                case 'easeInSine' :
                    item = easeInSine(item);
                    break;
                case 'easeOutInSine' :
                    item = easeOutInSine(item);
                    break;
                case 'easeOutQuad' :
                    item = easeOutQuad(item);
                    break;
                case 'easeInQuad' :
                    item = easeInQuad(item);
                    break;
                case 'easeOutInQuad' :
                    item = easeOutInQuad(item);
                    break;
                case 'easeOutCubic' :
                    item = easeOutCubic(item);
                    break;
                case 'easeInCubic' :
                    item = easeInCubic(item);
                    break;
                case 'easeOutInCubic' :
                    item = easeOutInCubic(item);
                    break;
                case 'easeOutQuart' :
                    item = easeOutQuart(item);
                    break;
                case 'easeInQuart' :
                    item = easeInQuart(item);
                    break;
                case 'easeOutInQuart' :
                    item = easeOutInQuart(item);
                    break;
                case 'easeOutQuint' :
                    item = easeOutQuint(item);
                    break;
                case 'easeInQuint' :
                    item = easeInQuint(item);
                    break;
                case 'easeOutInQuint' :
                    item = easeOutInQuint(item);
                    break;
                case 'easeOutExpo' :
                    item = easeOutExpo(item);
                    break;
                case 'easeInExpo' :
                    item = easeInExpo(item);
                    break;
                case 'easeOutInExpo' :
                    item = easeOutInExpo(item);
                    break;
                case 'easeOutCirc' :
                    item = easeOutCirc(item);
                    break;
                case 'easeInCirc' :
                    item = easeInCirc(item);
                    break;
                case 'easeOutInCirc' :
                    item = easeOutInCirc(item);
                    break;
                case 'easeOutBack' :
                    item = easeOutBack(item);
                    break;
                case 'easeInBack' :
                    item = easeInBack(item);
                    break;
                case 'easeOutInBack' :
                    item = easeOutInBack(item);
                    break;
                case 'easeOutElastic' :
                    item = easeOutElastic(item);
                    break;
                case 'easeInElastic' :
                    item = easeInElastic(item);
                    break;
                case 'easeOutInElastic' :
                    item = easeOutInElastic(item);
                    break;
                case 'easeOutBounce' :
                    item = easeOutBounce(item);
                    break;
                case 'easeInBounce' :
                    item = easeInBounce(item);
                    break;
                case 'easeOutInBounce' :
                    item = easeOutInBounce(item);
                    break;
            }
        }

        if (item > 1) item = 1;
        else if (item < 0) item = 0;

        if (isNaN(item)) item = 1;

        let r = floor(rMin + ((rMax - rMin) * item));
        let g = floor(gMin + ((gMax - gMin) * item));
        let b = floor(bMin + ((bMax - bMin) * item));
        let a = floor(aMin + ((aMax - aMin) * item));

        if (this.opaque) return `rgb(${r}, ${g}, ${b})`;
        else return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    else {

        let {r, g, b, a} = this;

        if (this.opaque) return `rgb(${r}, ${g}, ${b})`;
        else return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
};

// Internal function to make sure channel attribute values are in their correct format and ranges
P.checkValues = function () {

    let f = Math.floor,
        r = f(this.r) || 0,
        g = f(this.g) || 0,
        b = f(this.b) || 0,
        a = this.a;

    this.r = (r > 255) ? 255 : ((r < 0) ? 0 : r);
    this.g = (g > 255) ? 255 : ((g < 0) ? 0 : g);
    this.b = (b > 255) ? 255 : ((b < 0) ? 0 : b);
    this.a = (a > 1) ? 1 : ((a < 0) ? 0 : a);

    return this;
};

// `update` function - adds the channel __shift__ attributes to the r, g, b and a attributes. This functionality can be automated by setting the __autoUpdate__ Boolean flag to true
P.updateArray = ['r', 'g', 'b', 'a'];
P.update = function () {

    if (!xt(this.rCurrent)) this.rCurrent = this.r;
    if (!xt(this.gCurrent)) this.gCurrent = this.g;
    if (!xt(this.bCurrent)) this.bCurrent = this.b;
    if (!xt(this.aCurrent)) this.aCurrent = this.a;

    let list = this.updateArray;

    if (this.rShift || this.gShift || this.bShift || this.aShift) {

        for (let i = 0, item; i < 4; i++) {

            item = list[i];

            let shift = this[item + 'Shift'];
        
            if (shift) {

                this[`${item}Current`] += shift;

                let col = this[item],
                    min = this[`${item}Min`],
                    max = this[`${item}Max`],
                    bounce = this[`${item}Bounce`],
                    current = this[`${item}Current`],

                    temp = Math.floor(current + shift);

                if (temp > max || temp < min) {

                    if (bounce) shift = -shift;
                    else {

                        col = (col > (max + min) / 2) ? max : min;
                        shift = 0;
                    }
                }
                
                this[item] = temp;
                this[`${item}Shift`] = shift;
            }
        }
    }
    return this;
};

// `updateByDelta` - alias for the __update__ function
P.updateByDelta = P.update;

// We can also set a Color object to a new color value by invoking its `convert` function. Any CSS color string can be used as an argument (with exceptions - see above)
P.convert = function (items) {

    let r, g, b, a, temp,
        round = Math.round;

    items = (items.substring) ? items : '';

    if (items.length) {

        items.toLowerCase();
        r = 0;
        g = 0;
        b = 0;
        a = 1;
        
        if (items[0] === '#') {
        
            if (items.length == 4) {
        
                r = parseInt(items[1] + items[1], 16);
                g = parseInt(items[2] + items[2], 16);
                b = parseInt(items[3] + items[3], 16);
            }
            else if (items.length == 5) {
        
                r = parseInt(items[1] + items[1], 16);
                g = parseInt(items[2] + items[2], 16);
                b = parseInt(items[3] + items[3], 16);
                a = parseInt(items[4] + items[4], 16) / 255;
            }
            else if (items.length == 7) {
        
                r = parseInt(items[1] + items[2], 16);
                g = parseInt(items[3] + items[4], 16);
                b = parseInt(items[5] + items[6], 16);
            }
            else if (items.length == 9) {
        
                r = parseInt(items[1] + items[2], 16);
                g = parseInt(items[3] + items[4], 16);
                b = parseInt(items[5] + items[6], 16);
                a = parseInt(items[7] + items[8], 16) / 255;
            }
        }
        else if (/rgb\(/.test(items)) {

            temp = items.match(/([0-9.]+\b)/g);

            if (/%/.test(items)) {
            
                r = round((parseFloat(temp[0]) / 100) * 255);
                g = round((parseFloat(temp[1]) / 100) * 255);
                b = round((parseFloat(temp[2]) / 100) * 255);
            }
            else {
            
                r = round(parseFloat(temp[0]));
                g = round(parseFloat(temp[1]));
                b = round(parseFloat(temp[2]));
            }
        }
        else if (/rgba\(/.test(items)) {

            temp = items.match(/([0-9.]+\b)/g);

            if (/%/.test(items)) {
            
                r = round((parseFloat(temp[0]) / 100) * 255);
                g = round((parseFloat(temp[1]) / 100) * 255);
                b = round((parseFloat(temp[2]) / 100) * 255);
                a = parseFloat(temp[3]) / 100;
            }
            else {
            
                r = round(parseFloat(temp[0]));
                g = round(parseFloat(temp[1]));
                b = round(parseFloat(temp[2]));
                a = temp[3];
            }
        }
        else if (/hsl\(/.test(items) || /hsla\(/.test(items)) {

            temp = items.match(/([0-9.]+\b)/g);

            this.setFromHSL(parseFloat(temp[0]), parseFloat(temp[1]), parseFloat(temp[2]), parseFloat(temp[3]));
        }
        else if (items === 'transparent') {

            r = 0;
            g = 0;
            b = 0;
            a = 0;
        }
        else {

            temp = this.colorLibrary[items];

            if (temp) {
            
                r = parseInt(temp[0] + temp[1], 16);
                g = parseInt(temp[2] + temp[3], 16);
                b = parseInt(temp[4] + temp[5], 16);
                a = 1;
            }
        }

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        
        this.checkValues();
    }

    return this;
};


P.getHSLfromRGB = function (dr, dg, db) {

    let minColor = Math.min(dr, dg, db),
        maxColor = Math.max(dr, dg, db);

    let lum = (minColor + maxColor) / 2;

    let sat = 0;

    if (minColor !== maxColor) {

        if (lum <= 0.5) sat = (maxColor - minColor) / (maxColor + minColor);
        else sat = (maxColor - minColor) / (2 - maxColor - minColor);
    }

    let hue = 0;

    if (maxColor === dr) hue = (dg - db) / (maxColor - minColor);
    else if (maxColor === dg) hue = 2 + ((db - dr) / (maxColor - minColor));
    else hue = 4 + ((dr - dg) / (maxColor - minColor));

    hue *= 60;

    if (hue < 0) hue += 360;

    return [hue, sat, lum];
};

P.getHSL = function () {

    let {r, g, b} = this;

    let minColor = Math.min(r, g, b),
        maxColor = Math.max(r, g, b);

    let lum = (minColor + maxColor) / 2;

    let sat = 0;

    if (minColor !== maxColor) {

        if (lum <= 0.5) sat = (maxColor - minColor) / (maxColor + minColor);
        else sat = (maxColor - minColor) / (2 - maxColor - minColor);
    }

    let hue = 0;

    if (maxColor === r) hue = (g - b) / (maxColor - minColor);
    else if (maxColor === g) hue = 2 + ((b - r) / (maxColor - minColor));
    else hue = 4 + ((r - g) / (maxColor - minColor));

    hue *= 60;

    if (hue < 0) hue += 360;

    return [hue, sat, lum];
};

P.getRGBfromHSL = function (h, s, l, a) {

    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; 
        g = x; 
        b = 0;  
    } else if (60 <= h && h < 120) {
        r = x; 
        g = c; 
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; 
        g = c; 
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0; 
        g = x; 
        b = c;
    } else if (240 <= h && h < 300) {
        r = x; 
        g = 0; 
        b = c;
    } else if (300 <= h && h < 360) {
        r = c; 
        g = 0; 
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b, a];
};

P.setFromHSL = function (h, s, l, a) {

    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; 
        g = x; 
        b = 0;  
    } else if (60 <= h && h < 120) {
        r = x; 
        g = c; 
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; 
        g = c; 
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0; 
        g = x; 
        b = c;
    } else if (240 <= h && h < 300) {
        r = x; 
        g = 0; 
        b = c;
    } else if (300 <= h && h < 360) {
        r = c; 
        g = 0; 
        b = x;
    }

    this.r = Math.round((r + m) * 255);
    this.g = Math.round((g + m) * 255);
    this.b = Math.round((b + m) * 255);

    if (null != a) {

        this.a = a * 255;
    }
};


// Color keywords harvested from https://developer.mozilla.org/en/docs/Web/CSS/color_value
P.colorLibrary = {
    aliceblue: 'f0f8ff',
    antiquewhite: 'faebd7',
    aqua: '00ffff',
    aquamarine: '7fffd4',
    azure: 'f0ffff',
    beige: 'f5f5dc',
    bisque: 'ffe4c4',
    black: '000000',
    blanchedalmond: 'ffe4c4',
    blue: '0000ff',
    blueviolet: '8a2be2',
    brown: 'a52a2a',
    burlywood: 'deb887',
    cadetblue: '5f9ea0',
    chartreuse: '7fff00',
    chocolate: 'd2691e',
    coral: 'ff7f50',
    cornflowerblue: '6495ed',
    cornsilk: 'fff8dc',
    crimson: 'dc143c',
    darkblue: '00008b',
    darkcyan: '008b8b',
    darkgoldenrod: 'b8860b',
    darkgray: 'a9a9a9',
    darkgreen: '006400',
    darkgrey: 'a9a9a9',
    darkkhaki: 'bdb76b',
    darkmagenta: '8b008b',
    darkolivegreen: '556b2f',
    darkorange: 'ff8c00',
    darkorchid: '9932cc',
    darkred: '8b0000',
    darksalmon: 'e9967a',
    darkseagreen: '8fbc8f',
    darkslateblue: '483d8b',
    darkslategray: '2f4f4f',
    darkslategrey: '2f4f4f',
    darkturquoise: '00ced1',
    darkviolet: '9400d3',
    deeppink: 'ff1493',
    deepskyblue: '00bfff',
    dimgray: '696969',
    dimgrey: '696969',
    dodgerblue: '1e90ff',
    firebrick: 'b22222',
    floralwhite: 'fffaf0',
    forestgreen: '228b22',
    fuchsia: 'ff00ff',
    gainsboro: 'dcdcdc',
    ghostwhite: 'f8f8ff',
    gold: 'ffd700',
    goldenrod: 'daa520',
    gray: '808080',
    green: '008000',
    greenyellow: 'adff2f',
    grey: '808080',
    honeydew: 'f0fff0',
    hotpink: 'ff69b4',
    indianred: 'cd5c5c',
    indigo: '4b0082',
    ivory: 'fffff0',
    khaki: 'f0e68c',
    lavender: 'e6e6fa',
    lavenderblush: 'fff0f5',
    lawngreen: '7cfc00',
    lemonchiffon: 'fffacd',
    lightblue: 'add8e6',
    lightcoral: 'f08080',
    lightcyan: 'e0ffff',
    lightgoldenrodyellow: 'fafad2',
    lightgray: 'd3d3d3',
    lightgreen: '90ee90',
    lightgrey: 'd3d3d3',
    lightpink: 'ffb6c1',
    lightsalmon: 'ffa07a',
    lightseagreen: '20b2aa',
    lightskyblue: '87cefa',
    lightslategray: '778899',
    lightslategrey: '778899',
    lightsteelblue: 'b0c4de',
    lightyellow: 'ffffe0',
    lime: '00ff00',
    limegreen: '32cd32',
    linen: 'faf0e6',
    maroon: '800000',
    mediumaquamarine: '66cdaa',
    mediumblue: '0000cd',
    mediumorchid: 'ba55d3',
    mediumpurple: '9370db',
    mediumseagreen: '3cb371',
    mediumslateblue: '7b68ee',
    mediumspringgreen: '00fa9a',
    mediumturquoise: '48d1cc',
    mediumvioletred: 'c71585',
    midnightblue: '191970',
    mintcream: 'f5fffa',
    mistyrose: 'ffe4e1',
    moccasin: 'ffe4b5',
    navajowhite: 'ffdead',
    navy: '000080',
    oldlace: 'fdf5e6',
    olive: '808000',
    olivedrab: '6b8e23',
    orange: 'ffa500',
    orangered: 'ff4500',
    orchid: 'da70d6',
    palegoldenrod: 'eee8aa',
    palegreen: '98fb98',
    paleturquoise: 'afeeee',
    palevioletred: 'db7093',
    papayawhip: 'ffefd5',
    peachpuff: 'ffdab9',
    peru: 'cd853f',
    pink: 'ffc0cb',
    plum: 'dda0dd',
    powderblue: 'b0e0e6',
    purple: '800080',
    rebeccapurple: '663399',
    red: 'ff0000',
    rosybrown: 'bc8f8f',
    royalblue: '4169e1',
    saddlebrown: '8b4513',
    salmon: 'fa8072',
    sandybrown: 'f4a460',
    seagreen: '2e8b57',
    seashell: 'fff5ee',
    sienna: 'a0522d',
    silver: 'c0c0c0',
    skyblue: '87ceeb',
    slateblue: '6a5acd',
    slategray: '708090',
    slategrey: '708090',
    snow: 'fffafa',
    springgreen: '00ff7f',
    steelblue: '4682b4',
    tan: 'd2b48c',
    teal: '008080',
    thistle: 'd8bfd8',
    tomato: 'ff6347',
    turquoise: '40e0d0',
    violet: 'ee82ee',
    wheat: 'f5deb3',
    white: 'ffffff',
    whitesmoke: 'f5f5f5',
    yellow: 'ffff00',
    yellowgreen: '9acd32'
};


// #### Factory
// ```
// scrawl.makeColor({
//
//     name: 'myColorObject',
//
//     r: 100,
//     g: 50,
//     b: 10,
//
//     rShift: 0.1,
//     gShift: 1,
//     bShift: -1.3,
//
//     rBounce: true,
//     gBounce: true,
//     bBounce: true,
//
//     rMax: 160,
//     gMax: 180,
//     bMax: 150,
//
//     autoUpdate: true,
// });
//
// scrawl.makeBlock({
//
//     name: 'block-tester',
//
//     width: 120,
//     height: 40,
//
//     startX: 60,
//     startY: 60,
//
//     fillStyle: 'myColorObject',
//     method: 'fill',
// });
// ```
const makeColor = function (items) {

    if (!items) return false;
    return new Color(items);
};

constructors.Color = Color;

// #### Exports
export {
    makeColor,
};
