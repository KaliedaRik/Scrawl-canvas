
// # Color factory

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality


// ## Imports
import { constructors } from '../core/library.js';
import { mergeOver, xt, xtGet } from '../core/utilities.js';

import baseMix from '../mixin/base.js';


// ## Color constructor
const Color = function (items = {}) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);
    this.set(items);

    if (xt(items.color)) this.convert(items.color);

    if (items.random) this.generateRandomColor(items);

    this.checkValues();

    return this;
};


// ## Color object prototype setup
let P = Color.prototype = Object.create(Object.prototype);
P.type = 'Color';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;


// Apply mixins to prototype object
P = baseMix(P);


// ## Define default attributes
let defaultAttributes = {


// TODO - documentation
    r: 0,
    g: 0,
    b: 0,
    a: 1,

// TODO - documentation
    rShift: 0,
    gShift: 0,
    bShift: 0,
    aShift: 0,

// TODO - documentation
    rMax: 255,
    gMax: 255,
    bMax: 255,
    aMax: 1,

// TODO - documentation
    rMin: 0,
    gMin: 0,
    bMin: 0,
    aMin: 0,

// TODO - documentation
    rBounce: false,
    gBounce: false,
    bBounce: false,
    aBounce: false,

// TODO - documentation
    opaque: true,

// TODO - documentation
    autoUpdate: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// ## Packet management

// TODO



// ## Define prototype functions

// Overrides function in mixin/base.js
P.get = function (item) {

    if (!xt(item)) {

        if (this.opaque) return `rgb(${this.r || 0}, ${this.g || 0}, ${this.b || 0})`;
        else return `rgba(${this.r || 0}, ${this.g || 0}, ${this.b || 0}, {xtGet(this.a, 1)})`;
    }
    else if (item === 'random') {

        this.generateRandomColor();
        return this.get();
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


// Overrides function in mixin/base.js
P.set = function (items = {}) {

    if (items) {

        let setters = this.setters,
            defs = this.defs;

        Object.entries(items).forEach(([key, value]) => {

            if (key !== 'name') {

                let predefined = setters[key];

                if (predefined) predefined.call(this, value);
                else if (typeof defs[key] !== 'undefined') this[key] = value;
            }
        }, this);
    }

    if (items.random) this.generateRandomColor(items);
    else if (items.color) this.convert(items.color);
    else this.checkValues();

    return this;
};

// TODO - documentation
P.getData = function () {

    if (this.autoUpdate) this.update();

    this.checkValues();

    return this.get();
};

// TODO - documentation
P.generateRandomColor = function (items = {}) {

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

// TODO - documentation
P.checkValues = function () {

    let f = Math.floor,
        r = f(this.r) || 0,
        g = f(this.g) || 0,
        b = f(this.b) || 0,
        a = this.a || 1;

    this.r = (r > 255) ? 255 : ((r < 0) ? 0 : r);
    this.g = (g > 255) ? 255 : ((g < 0) ? 0 : g);
    this.b = (b > 255) ? 255 : ((b < 0) ? 0 : b);
    this.a = (a > 1) ? 1 : ((a < 0) ? 0 : a);

    return this;
};

// TODO - documentation
P.updateArray = ['r', 'g', 'b', 'a'];

P.update = function () {

    let list = this.updateArray;

    if (this.rShift || this.gShift || this.bShift || this.aShift) {

        list.forEach(item => {

            let shift = this[item + 'Shift'];
        
            if (shift) {

                let col = this[item],
                    min = this[`${item}Min`],
                    max = this[`${item}Max`],
                    bounce = this[`${item}Bounce`],
                    temp = col + shift;

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
        }, this);
    }
    return this;
};

P.updateByDelta = P.update;

// TODO - documentation
P.convert = function (items) {

    let r, g, b, a, temp,
        dec = this.toDecimal,
        round = Math.round;

    items = (items.substring) ? items : '';

    if (items.length) {

        items.toLowerCase();
        r = 0;
        g = 0;
        b = 0;
        a = 1;
        
        if (items[0] === '#') {
        
            if (items.length < 5) {
        
                r = dec(items[1] + items[1]);
                g = dec(items[2] + items[2]);
                b = dec(items[3] + items[3]);
            }
            else if (items.length < 8) {
        
                r = dec(items[1] + items[2]);
                g = dec(items[3] + items[4]);
                b = dec(items[5] + items[6]);
            }
        }
        else if (/rgb\(/.test(items)) {

            temp = items.match(/([0-9.]+\b)/g);

            if (/%/.test(items)) {
            
                r = round((temp[0] / 100) * 255);
                g = round((temp[1] / 100) * 255);
                b = round((temp[2] / 100) * 255);
            }
            else {
            
                r = round(temp[0]);
                g = round(temp[1]);
                b = round(temp[2]);
            }
        }
        else if (/rgba\(/.test(items)) {

            temp = items.match(/([0-9.]+\b)/g);

            r = temp[0];
            g = temp[1];
            b = temp[2];
            a = temp[3];
        }
        else if (items === 'transparent') r = g = b = a = 0;
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

const colorList = Object.keys(P.colorLibrary);


// ## Exported factory function
const makeColor = function (items) {

    return new Color(items);
};

constructors.Color = Color;

export {
    makeColor,
    colorList,
};
