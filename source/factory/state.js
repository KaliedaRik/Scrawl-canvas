// # State factory
// Scrawl-canvas uses State objects to keep track of Cell object [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) rendering engine state. 
//
// Every entity object also has a State object. Before an entity is 'stamped' onto a Cell &lt;canvas> their State objects are compared, to draw up a list of changes required by the entity to bring the engine's state into alignment.
// + State objects are not stored in the Scrawl-canvas library; they can only be accessed through their Cell or entity object.
// + State objects __can be shared__ between entity Objects, either by setting one entity object's state attribute to another entity's State object, or by setting a `sharedState` flag in the argument object when cloning a new entity from an existing one.
// + Entitys can skip the engine comparison step during their Display cycle stamp functionality by setting their `noCanvasEngineUpdates` flag to true.
// + State attributes can be updated directly on the Entity or Cell using those object's normal `set` and `deltaSet` functions.
// + State objects will be saved, cloned and killed as part of the Cell or entity save/clone/kill functionality.

// #### Demos:
// + All Canvas demos make use of the State object.


// #### Imports
import { 
    constructors, 
    entity, 
    styles, 
} from '../core/library.js';

import { 
    doCreate,
    isa_obj, 
    xt, 
    xtGet, 
    Ωempty, 
} from '../core/utilities.js';

import baseMix from '../mixin/base.js';

import { 
    _freeze,
    _keys,
    STATE_MAIN_KEYS,
    STATE_LINE_KEYS,
    STATE_STYLE_KEYS,
    STATE_TEXT_KEYS,
    STATE_ALL_KEYS,
} from '../core/shared-vars.js';


// Local constants
const BLACK = 'rgb(0 0 0 / 1)',
    BUTT = 'butt',
    DEFAULT_FONT = '12px sans-serif',
    HASH = '#',
    HIGH = 'high',
    HSL = 'hsl',
    LEFT = 'left',
    LINE_DASH = 'lineDash',
    LINE_WIDTH = 'lineWidth',
    MITER = 'miter',
    NAME = 'name',
    NONE = 'none',
    RGB = 'rgb',
    SOURCE_OVER = 'source-over',
    STYLES = 'styles',
    T_STATE = 'State',
    T_COLOR = 'Color',
    T_PHRASE = 'Phrase',
    TOP = 'top',
    UNDEF = 'undefined';


import { makeColor } from './color.js';
const colorChecker = makeColor({
    name: 'SC-system-state-do-not-remove',
});

// #### State constructor
const State = function (items = Ωempty) {

    this.set(this.defs);
    this.lineDash = [];
    return this;
};


// #### State prototype
const P = State.prototype = doCreate();
P.type = T_STATE;


// #### Mixins
baseMix(P);


// #### State attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
P.defs = {

// ##### Fills and Strokes
// __fillStyle__ and __strokeStyle__ - color, gradient or pattern used to outline or fill a entity. Can be:
// + CSS format color String - `#fff`, `#ffffff`, `rgb(255 255 255)`, `rgb(255,255,255)`, `rgba(255,255,255,1)`, `white`, etc
// + COLORNAME String
// + GRADIENTNAME String
// + RADIALGRADIENTNAME String
// + PATTERNNAME String
    fillStyle: BLACK,
    strokeStyle: BLACK,


// ##### Miscellaneous engine settings
// __globalAlpha__ - entity transparency - a value between 0 and 1, where 0 is completely transparent and 1 is completely opaque
    globalAlpha: 1,


// __globalCompositeOperation__ - compositing method for applying the entity to an existing Cell (&lt;canvas&gt;) display. Permitted values include
// + 'source-over'
// + 'source-atop'
// + 'source-in'
// + 'source-out'
// + 'destination-over'
// + 'destination-atop'
// + 'destination-in'
// + 'destination-out'
// + 'lighter'
// + 'darker'
// + 'copy'
// + 'xor'
// + any other permitted value - be aware that different browsers may render these operations in different ways, and some options are not supported by all browsers.
    globalCompositeOperation: SOURCE_OVER,


// ##### Stroke line styling
// __lineWidth__ - in pixels
    lineWidth: 1,


// __lineCap__ - how the ends of lines will display. Permitted values include:
// + 'butt'
// + 'round'
// + 'square'
    lineCap: BUTT,


// __lineJoin__ - how line joints will display. Permitted values include:
// + 'miter'
// + 'round'
// + 'bevel'
    lineJoin: MITER,


// __lineDash__ - an array of integer Numbers representing line and gap values (in pixels), for example [5,2,2,2] for a long-short dash pattern
    lineDash: null,


// __lineDashOffset__ - distance along the entity's outline at which to start the line dash. Changing this value can be used to create a 'marching ants effect
    lineDashOffset: 0,


// __miterLimit__ - affecting the 'pointiness' of the line join where two lines join at an acute angle
    miterLimit: 10,


// ##### Shadow styling
// If these attributes are set to values different from their defaults, then the shadowing effect will have consequences on how the entity displays. Scrawl-canvas uses a 2-step procedure to displaying both an entity's fill and stroke, applying one before the other - `method` __fillThenDraw__, __drawThenFill__. The shadow will be applied for both operations, which leads to the second operation applying a shadow over the first operation.
//
// If this is not the desired effect - we want the stroke and fill to display as a unified whole, with the shadow underneath them both - we can use `method` __fillAndDraw__, __drawAndFill__.
//
// The __clear__ `method` will also include any shadow effect.

// __shadowOffsetX__, __shadowOffsetY__ - horizontal and vertical offsets for a entity's shadow, in Number pixels
    shadowOffsetX: 0,
    shadowOffsetY: 0,


// __shadowBlur__ - the blur width for a entity's shadow, in Number pixels
    shadowBlur: 0,


// __shadowColor__ - the color used for an entity's shadow effect. Can be:
// + CSS format color String - `#fff`, `#ffffff`, `rgb(255 255 255)`, `rgb(255,255,255)`, `rgba(255,255,255,1)`, `white`, etc
// + COLORNAME String
    shadowColor: BLACK,


// ##### Font styling
// __font__, __textAlign__, __textBaseline__ - the Canvas API standards for using fonts on a canvas are near-useless, and often lead to a sub-par display of text. The Scrawl-canvas Phrase entity uses the following attributes internally, but has its own set of attributes for defining the font styling used by its text.
    font: DEFAULT_FONT,
    textAlign: LEFT,
    textBaseline: TOP,


// ##### CSS/SVG filters
// __filter__ - the Canvas 2D engine supports the [filter attribute](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) on an experimental basis, thus it is not guaranteed to work in all browsers and devices. The filter attribute takes a String value (default: 'none') defining one or more filter functions to be applied to the entity as it is stamped on the canvas.
// + Be aware that entitys can also take a `filters` Array - this represents an array of Scrawl-canvas filters to be applied to the entity (or group or Cell). The two filter systems are completely separate - combine their effects at your own risk!
    filter: NONE,

// ##### Image smoothing
// __imageSmoothingEnabled__ - switch image smoothing on or off, on a per-entity basis
    imageSmoothingEnabled: true,

// __imageSmoothingQuality__ - when image smoothing is enabled, determine the quality of image smoothing to apply to the entity.
    imageSmoothingQuality: HIGH,
};


// #### Packet management
P.processPacketOut = function (key, value, incs) {

    let result = true;

    switch (key) {

        case LINE_DASH : 

            if (!value.length) {

                result = (incs.includes(LINE_DASH)) ? true : false;
            }
            break;

        default : 

            if (!incs.includes(key) && value === this.defs[key]) result = false;
    }
    return result;
};

P.finalizePacketOut = function (copy, items) {

    let fill = copy.fillStyle,
        stroke = copy.strokeStyle;

    if (fill && !fill.substring) copy.fillStyle = fill.name;
    if (stroke && !stroke.substring) copy.strokeStyle = stroke.name;

    return copy;
};


// #### Clone management
// Handled by Cell and entity objects, not by the State object


// #### Kill management
// Handled by Cell and entity objects, not by the State object


// #### Get, Set, deltaSet
P.set = function (items = Ωempty) {

    const keys = _keys(items),
        keysLen = keys.length;
    
    let key, i,
        d = this.defs;

    for (i = 0; i < keysLen; i++) {

        key = keys[i];

        if (key != NAME) {

            if (typeof d[key] != UNDEF) {

                this[key] = items[key];
                this.dirtyFilterIdentifier = true;
            }
        }
    }
    return this;
};

P.get = function (item) {

    let undef, d, i;

    d = this.defs[item];

    if (d != null) {
    
        i = this[item];
        return (i != null) ? i : d;
    }
    else return undef;
};

const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// The following setters use the `window.scrawlEnvironmentColorChecker` Color factory. This factory gets created and attached to the window object during Scrawl-canvas initialization. Code for creating the factory can be found in the `core/init.js` module
S.fillStyle = function (item) {

    let temp;

    if (isa_obj(item) && item.lib == STYLES) this.fillStyle = item;
    else{

        temp = styles[item];

        if (temp) this.fillStyle = temp;
        else if (item.includes(RGB) || item.includes(HSL) || item.includes(HASH)) this.fillStyle = item;
        else this.fillStyle = colorChecker.checkColor(item);
    }
};

S.strokeStyle = function (item) {

    let temp;

    if (isa_obj(item) && item.lib == STYLES) this.strokeStyle = item;
    else{

        temp = styles[item];

        if (temp) this.strokeStyle = temp;
        else if (item.includes(RGB) || item.includes(HSL) || item.includes(HASH)) this.strokeStyle = item;
        else this.strokeStyle = colorChecker.checkColor(item);
    }
};

S.shadowColor = function (item) {

    if (item.includes(RGB) || item.includes(HSL) || item.includes(HASH)) this.shadowColor = item;
    else this.shadowColor = colorChecker.checkColor(item);
};


// #### Prototype functions

// `getChanges` is the key function performed by State objects. This is where the entity's state is compared to a Cell engine's current state, to identify which engine attributes need to change to bring it into alignment with the entity object's requirements
P.getChanges = function (ent, engineState) {

    let k, style, scaled, i, iz, j, jz,
        linedashFlag, desired, current,
        defs = this.defs,
        result = {};

    let getItem = function (source, key) {
        return (typeof source[key] != UNDEF) ? source[key] : defs[key];
    };

    if (ent.substring) ent = entity[ent];

    // 'filter', 'globalAlpha', 'globalCompositeOperation', 'imageSmoothingEnabled', 'imageSmoothingQuality', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'
    for (i = 0, iz = STATE_MAIN_KEYS.length; i < iz; i++) {

        k = STATE_MAIN_KEYS[i];
        desired = getItem(this, k);
        current = getItem(engineState, k);

        if (current !== desired) result[k] = desired;
    }

    // 'lineCap', 'lineDash', 'lineDashOffset', 'lineJoin', 'lineWidth', 'miterLimit'
    if (this.lineWidth || engineState.lineWidth) {

        for (i = 0, iz = STATE_LINE_KEYS.length; i < iz; i++) {

            k = STATE_LINE_KEYS[i];
            desired = getItem(this, k);
            current = getItem(engineState, k);

            if (k == LINE_DASH) {

                if (desired.length || current.length) {

                    if (desired.length != current.length) result.lineDash = desired;
                    else {

                        linedashFlag = false;

                        for (j = 0, jz = desired.length; j < jz; j++) {

                            if (desired[j] != current[j]) {
                                linedashFlag = true;
                                break;
                            }
                        }

                        if (linedashFlag) result.lineDash = desired;
                    }
                }
            }

            else if (k == LINE_WIDTH) {

                if (ent.scaleOutline) {

                    scaled = (desired || 1) * (ent.scale || 1);

                    if (scaled !== current) result.lineWidth = scaled;
                }
                else {

                    if (desired !== current) result.lineWidth = desired;
                }
            }

            else if (current !== desired) result[k] = desired
        }
    }

    // 'fillStyle', 'shadowColor', 'strokeStyle'
    for (i = 0, iz = STATE_STYLE_KEYS.length; i < iz; i++) {

        k = STATE_STYLE_KEYS[i];
        current = getItem(engineState, k);
        desired = getItem(this, k);

        // string colors - only update if necessary
        if (desired.substring && current !== desired) result[k] = desired;

        // Color object colors need to be extracted before they can be compared and, if necessary, updated
        else if (desired.type == T_COLOR) {

            desired = desired.getData();

            if (current !== desired) result[k] = desired;
        }

        // gradient and pattern objects - get freshly deployed with each entity stamp
        else result[k] = desired;
    }

    // 'font'
    if (ent.type == T_PHRASE) {

        for (i = 0, iz = STATE_TEXT_KEYS.length; i < iz; i++) {

            k = STATE_TEXT_KEYS[i];
            desired = getItem(this, k);
            current = getItem(engineState, k);

            if (current !== desired) result[k] = desired
        }
    }
    return result;
};

// The `setStateFromEngine` function takes a CanvasRenderingContext2D engine object and updates its own attributes to match the engine's current state.
P.setStateFromEngine = function (engine) {

    let key;

    for (let i = 0, iz = STATE_ALL_KEYS.length; i < iz; i++) {

        key = STATE_ALL_KEYS[i];
        this[key] = engine[key];
    }

    this.lineDash = (xt(engine.lineDash)) ? engine.lineDash : [];
    this.lineDashOffset = xtGet(engine.lineDashOffset, 0);
    engine.textAlign = this.textAlign = LEFT;
    engine.textBaseline = this.textBaseline = TOP;

    return this;
};


// #### Factory
// Only used internally by Cell and entity factory functions
export const makeState = function (items) {

    if (!items) return false;
    return new State(items);
};

constructors.State = State;
