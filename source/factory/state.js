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
import { constructors, entity, styles } from '../core/library.js';
import { isa_obj, xt, xtGet, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';


// #### State constructor
const State = function (items = Ωempty) {

    this.set(this.defs);
    this.lineDash = [];
    return this;
};


// #### State prototype
let P = State.prototype = Object.create(Object.prototype);
P.type = 'State';


// #### Mixins
P = baseMix(P);


// #### State attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
P.defs = {

// ##### Fills and Strokes
// __fillStyle__ and __strokeStyle__ - color, gradient or pattern used to outline or fill a entity. Can be:
// + CSS format color String - `#fff`, `#ffffff`, `rgb(255,255,255)`, `rgba(255,255,255,1)`, `white`, etc
// + COLORNAME String
// + GRADIENTNAME String
// + RADIALGRADIENTNAME String
// + PATTERNNAME String
    fillStyle: 'rgba(0,0,0,1)',
    strokeStyle: 'rgba(0,0,0,1)',


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
    globalCompositeOperation: 'source-over',


// ##### Stroke line styling
// __lineWidth__ - in pixels
    lineWidth: 1,


// __lineCap__ - how the ends of lines will display. Permitted values include:
// + 'butt'
// + 'round'
// + 'square'
    lineCap: 'butt',


// __lineJoin__ - how line joints will display. Permitted values include:
// + 'miter'
// + 'round'
// + 'bevel'
    lineJoin: 'miter',


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
// + CSS format color String - `#fff`, `#ffffff`, `rgb(255,255,255)`, `rgba(255,255,255,1)`, `white`, etc
// + COLORNAME String
    shadowColor: 'rgba(0,0,0,0)',


// ##### Font styling
// __font__, __textAlign__, __textBaseline__ - the Canvas API standards for using fonts on a canvas are near-useless, and often lead to a sub-par display of text. The Scrawl-canvas Phrase entity uses the following attributes internally, but has its own set of attributes for defining the font styling used by its text.
    font: '12px sans-serif',
    textAlign: 'left',
    textBaseline: 'top',


// ##### CSS/SVG filters
// __filter__ - the Canvas 2D engine supports the [filter attribute](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) on an experimental basis, thus it is not guaranteed to work in all browsers and devices. The filter attribute takes a String value (default: 'none') defining one or more filter functions to be applied to the entity as it is stamped on the canvas.
// + Be aware that entitys can also take a `filters` Array - this represents an array of Scrawl-canvas filters to be applied to the entity (or group or Cell). The two filter systems are completely separate - combine their effects at your own risk!
    filter: 'none',
};


// #### Packet management
P.processPacketOut = function (key, value, includes) {

    let result = true;

    switch (key) {

        case 'lineDash' : 

            if (!value.length) {

                result = (includes.indexOf('lineDash') >= 0) ? true : false;
            }
            break;

        default : 

            if (includes.indexOf(key) < 0 && value === this.defs[key]) result = false;
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

    let keys = Object.keys(items),
        keysLen = keys.length,
        key, i,
        d = this.defs;

    for (i = 0; i < keysLen; i++) {

        key = keys[i];

        if (key != 'name') {

            if (typeof d[key] != 'undefined') this[key] = items[key];
        }
    }
    return this;
};

P.get = function (item) {

    let undef, d, i;

    d = this.defs[item];

    if (typeof d !== 'undefined') {
    
        i = this[item];
        return (typeof i !== 'undefined') ? i : d;
    }
    else return undef;
};

let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

S.fillStyle = function (item) {

    let temp;

    if (isa_obj(item) && item.lib === 'styles') this.fillStyle = item;
    else{

        temp = styles[item];

        if (temp) this.fillStyle = temp;
        else this.fillStyle = item;
    }
};

S.strokeStyle = function (item) {

    let temp;

    if (isa_obj(item) && item.lib === 'styles') this.strokeStyle = item;
    else{

        temp = styles[item];

        if (temp) this.strokeStyle = temp;
        else this.strokeStyle = item;
    }
};


// #### Prototype functions

// Internal arrays used by a number of Style functions
P.allKeys = Object.keys(P.defs);
P.mainKeys = ['globalAlpha', 'globalCompositeOperation', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'filter'];
P.lineKeys = ['lineWidth', 'lineCap', 'lineJoin', 'lineDash', 'lineDashOffset', 'miterLimit'];
P.styleKeys = ['fillStyle', 'strokeStyle', 'shadowColor'];
P.textKeys = ['font'];

// `getChanges` is the key function performed by State objects. This is where the entity's state is compared to a Cell engine's current state, to identify which engine attributes need to change to bring it into alignment with the entity object's requirements
P.getChanges = function (ent, engineState) {

    let mainKeys = this.mainKeys,
        lineKeys = this.lineKeys,
        styleKeys = this.styleKeys,
        textKeys = this.textKeys,
        k, style, scaled, i, iz, j, jz,
        linedashFlag, desired, current,
        defs = this.defs,
        result = {};

    let getItem = function (source, key) {
        return (typeof source[key] != 'undefined') ? source[key] : defs[key];
    };

    if (ent.substring) ent = entity[ent];

    // 'globalAlpha', 'globalCompositeOperation', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'filter'
    for (i = 0, iz = mainKeys.length; i < iz; i++) {

        k = mainKeys[i];
        desired = getItem(this, k);
        current = getItem(engineState, k);

        if (current !== desired) result[k] = desired;
    }

    // 'lineWidth', 'lineCap', 'lineJoin', 'lineDash', 'lineDashOffset', 'miterLimit'
    if (this.lineWidth || engineState.lineWidth) {

        for (i = 0, iz = lineKeys.length; i < iz; i++) {

            k = lineKeys[i];
            desired = getItem(this, k);
            current = getItem(engineState, k);

            if (k == 'lineDash') {

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

            else if (k == 'lineWidth') {

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

    // 'fillStyle', 'strokeStyle', 'shadowColor'
    for (i = 0, iz = styleKeys.length; i < iz; i++) {

        k = styleKeys[i];
        current = getItem(engineState, k);
        desired = getItem(this, k);

        // string colors - only update if necessary
        if (desired.substring && current !== desired) result[k] = desired;

        // Color object colors need to be extracted before they can be compared and, if necessary, updated
        else if (desired.type === 'Color') {

            desired = desired.getData();

            if (current !== desired) result[k] = desired;
        }

        // gradient and pattern objects - get freshly deployed with each entity stamp
        else result[k] = desired;
    }

    // 'font'
    if (ent.type === 'Phrase') {

        for (i = 0, iz = textKeys.length; i < iz; i++) {

            k = textKeys[i];
            desired = getItem(this, k);
            current = getItem(engineState, k);

            if (current !== desired) result[k] = desired
        }
    }
    return result;
};

// The `setStateFromEngine` function takes a CanvasRenderingContext2D engine object and updates its own attributes to match the engine's current state.
P.setStateFromEngine = function (engine) {

    let keys = this.allKeys,
        key;

    for (let i = 0, iz = keys.length; i < iz; i++) {

        key = keys[i];
        this[key] = engine[key];
    }

    this.lineDash = (xt(engine.lineDash)) ? engine.lineDash : [];
    this.lineDashOffset = xtGet(engine.lineDashOffset, 0);
    engine.textAlign = this.textAlign = 'left';
    engine.textBaseline = this.textBaseline = 'top';

    return this;
};


// #### Factory
// Only used internally by Cell and entity factory functions
const makeState = function (items) {

    if (!items) return false;
    return new State(items);
};

// Note: does NOT include 'font', textAlign or textBaseline because we set them in the fontAttributes object and Phrase entity, not the state object
const stateKeys = ['fillStyle', 'filter', 'globalAlpha', 'globalCompositeOperation', 'lineCap', 'lineDash', 'lineDashOffset', 'lineJoin', 'lineWidth', 'miterLimit', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'strokeStyle'];


constructors.State = State;

// #### Exports
export {
    makeState,
    stateKeys,
};
