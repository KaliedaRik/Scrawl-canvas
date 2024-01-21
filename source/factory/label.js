// # Label factory
// TODO - documentation

// #### Demos:
// + TODO - demos


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import { releaseCell, requestCell } from '../helper/cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

import { _ceil, BLACK, DEFAULT_FONT, ENTITY, T_LABEL, WHITE, ZERO_STR } from '../helper/shared-vars.js';


// #### Label constructor
const Label = function (items = Ωempty) {

    this.entityInit(items);

    this.dirtyPathObject = true;

    return this;
};


// #### Label prototype
const P = Label.prototype = doCreate();
P.type = T_LABEL;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
entityMix(P);


// #### Label attributes
const defaultAttributes = {

    text: ZERO_STR,

    includeUnderline: false,
    underlineStyle: BLACK,
    underlineWidth: 1,
    underlineOffset: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __Note that__ dimensions (width, height) cannot be set on labels as the entity's dimensional values will depend entirely on the `font`, `text` and `scale` attributes
G.width = function () {

    return 0;
};
S.width = λnull;
D.width = λnull;

G.height = function () {

    return 0;
};
S.height = λnull;
D.height = λnull;

G.dimensions = function () {

    return [0, 0];
};
S.dimensions = λnull;
D.dimensions = λnull;

G.font = function () {

    return this.state.font;
};
S.font = function (item) {

    if (item?.substring) {

        this.state.font = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

S.text = function (item) {

    if (item?.substring) {

        this.text = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

D.scale = function (item) {

    console.log('D.scale', typeof item, item)

    if (item?.toFixed) {

        this.scale += item;
        this.dirtyPathObject = true;
        this.dirtyScale = true;
    }
};
S.scale = function (item) {

    if (item?.toFixed) {

        this.scale = item;
        this.dirtyPathObject = true;
        this.dirtyScale = true;
    }
};

G.direction = function () {

    return this.state.direction;
};
S.direction = function (item) {

    if (item?.substring) {

        this.state.direction = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

G.fontKerning = function () {

    return this.state.fontKerning;
};
S.fontKerning = function (item) {

    if (item?.substring) {

        this.state.fontKerning = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

G.fontStretch = function () {

    return this.state.fontStretch;
};
S.fontStretch = function (item) {

    if (item?.substring) {

        this.state.fontStretch = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

G.fontVariantCaps = function () {

    return this.state.fontVariantCaps;
};
S.fontVariantCaps = function (item) {

    if (item?.substring) {

        this.state.fontVariantCaps = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

G.letterSpacing = function () {

    return this.state.letterSpacing;
};
D.letterSpacing = function (item) {

    if (item?.toFixed)  item = `${item}px`;

    if (item?.substring) {

        this.state.letterSpacing = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};
S.letterSpacing = function (item) {

    if (item?.toFixed)  item = `${item}px`;

    if (item?.substring) {

        this.state.letterSpacing = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

G.wordSpacing = function () {

    return this.state.wordSpacing;
};
D.wordSpacing = function (item) {

    if (item?.toFixed)  item = `${item}px`;

    if (item?.substring) {

        this.state.wordSpacing = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};
S.wordSpacing = function (item) {

    if (item?.toFixed)  item = `${item}px`;

    if (item?.substring) {

        this.state.wordSpacing = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

G.textAlign = function () {

    return this.state.textAlign;
};
S.textAlign = function (item) {

    if (item?.substring) {

        this.state.textAlign = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

G.textBaseline = function () {

    return this.state.textBaseline;
};
S.textBaseline = function (item) {

    if (item?.substring) {

        this.state.textBaseline = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};

G.textRendering = function () {

    return this.state.textRendering;
};
S.textRendering = function (item) {

    if (item?.substring) {

        this.state.textRendering = item;
        this.dirtyPathObject = true;
        this.dirtyLabel = true;
    }
};



// #### Prototype functions

// Calculate the Label entity's __Path2D object__
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (this.dirtyScale) this.cleanScale();

    if (this.dirtyLabel) {

        this.temperFont();
        this.dirtyMimicDimensions = true;
        this.dirtyPositionSubscribers = true;
    }

    if (this.dirtyHandle) this.cleanHandle();

    const p = this.pathObject = new Path2D();

    const handle = this.currentHandle,
        dims = this.currentDimensions,
        scale = this.currentScale;

    const x = -handle[0] * scale,
        y = -handle[1] * scale,
        w = dims[0] * scale,
        h = dims[1] * scale;

    p.rect(x, y, w, h);
};


P.temperFont = function () {

    this.dirtyLabel = false;
    this.dirtyDimensions = false;

    const mycell = requestCell();

    const { engine } = mycell;

    engine.font = this.state.font;
    engine.fontKerning = this.state.fontKerning;
    engine.fontStretch = this.state.fontStretch;
    engine.fontVariantCaps = this.state.fontVariantCaps;
    engine.letterSpacing = this.state.letterSpacing;
    engine.textRendering = this.state.textRendering;
    engine.wordSpacing = this.state.wordSpacing;
    engine.direction = 'ltr';
    engine.textAlign = 'left';
    engine.textBaseline = 'top';

    this.metrics = engine.measureText(this.text);

    this.temperedFont = engine.font.match(/(?<attributes>.*?)(?<size>[0-9.]+)px (?<family>.*)/);

    const { width, actualBoundingBoxAscent, actualBoundingBoxDescent} = this.metrics;

    this.currentDimensions[0] = _ceil(width);
    this.currentDimensions[1] = _ceil(actualBoundingBoxAscent + actualBoundingBoxDescent);

    releaseCell(mycell);
};


// `cleanDimensions` - overrides mixin.position.js function
// + Dimensions DO scale - but scaling happens elsewhere
P.cleanDimensions = function () {

    this.dirtyDimensions = false;

    this.dirtyStart = true;
    this.dirtyHandle = true;
    this.dirtyOffset = true;

    this.dirtyPositionSubscribers = true;

    if (this.mimicked && this.mimicked.length) this.dirtyMimicDimensions = true;

    this.dirtyFilterIdentifier = true;
};


// ##### Stamp methods
// All actual drawing is achieved using the entity's pre-calculated [Path2D object](https://developer.mozilla.org/en-US/docs/Web/API/Path2D).

P.setFontOnEngine = function (engine, temperedFont, scale) {

    const oldFont = engine.font;
    const {attributes, size, family} = temperedFont;

    engine.font = `${attributes} ${size * scale}px ${family}`;
    return oldFont;
};

// `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
P.draw = function (engine) {

    const handle = this.currentHandle,
        scale = this.currentScale,
        x = -handle[0] * scale,
        y = -handle[1] * scale;

    const oldFont = this.setFontOnEngine(engine, this.temperedFont.groups, scale);

    engine.strokeText(this.text, x, y);

    engine.font = oldFont;
};

// `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
P.fill = function (engine) {

    const handle = this.currentHandle,
        scale = this.currentScale,
        x = -handle[0] * scale,
        y = -handle[1] * scale;

    const oldFont = this.setFontOnEngine(engine, this.temperedFont.groups, scale);

    engine.fillText(this.text, x, y);

    engine.font = oldFont;
};

// `drawAndFill` - stamp the entity stroke, then fill, then remove shadow and repeat
P.drawAndFill = function (engine) {

    const handle = this.currentHandle,
        scale = this.currentScale,
        text = this.text,
        x = -handle[0] * scale,
        y = -handle[1] * scale;

    const oldFont = this.setFontOnEngine(engine, this.temperedFont.groups, scale);

    engine.strokeText(text, x, y);
    engine.fillText(text, x, y);
    this.currentHost.clearShadow();
    engine.strokeText(text, x, y);
    engine.fillText(text, x, y);

    engine.font = oldFont;
};

// `drawAndFill` - stamp the entity fill, then stroke, then remove shadow and repeat
P.fillAndDraw = function (engine) {

    const handle = this.currentHandle,
        scale = this.currentScale,
        text = this.text,
        x = -handle[0] * scale,
        y = -handle[1] * scale;

    const oldFont = this.setFontOnEngine(engine, this.temperedFont.groups, scale);

    engine.fillText(text, x, y);
    engine.strokeText(text, x, y);
    this.currentHost.clearShadow();
    engine.fillText(text, x, y);
    engine.strokeText(text, x, y);

    engine.font = oldFont;
};

// `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
P.drawThenFill = function (engine) {

    const handle = this.currentHandle,
        scale = this.currentScale,
        text = this.text,
        x = -handle[0] * scale,
        y = -handle[1] * scale;

    const oldFont = this.setFontOnEngine(engine, this.temperedFont.groups, scale);

    engine.strokeText(text, x, y);
    engine.fillText(text, x, y);

    engine.font = oldFont;
};

// `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
P.fillThenDraw = function (engine) {

    const handle = this.currentHandle,
        scale = this.currentScale,
        text = this.text,
        x = -handle[0] * scale,
        y = -handle[1] * scale;

    const oldFont = this.setFontOnEngine(engine, this.temperedFont.groups, scale);

    engine.fillText(text, x, y);
    engine.strokeText(text, x, y);

    engine.font = oldFont;
};

// `clip` - restrict drawing activities to the entity's enclosed area
P.clip = function (engine) {

    engine.clip(this.pathObject, this.winding);
 };

// `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
P.clear = function (engine) {

    const handle = this.currentHandle,
        scale = this.currentScale,
        gco = engine.globalCompositeOperation,
        x = -handle[0] * scale,
        y = -handle[1] * scale;

    const oldFont = this.setFontOnEngine(engine, this.temperedFont.groups, scale);

    engine.globalCompositeOperation = DESTINATION_OUT;
    engine.fillText(this.text, x, y);

    engine.globalCompositeOperation = gco;
    engine.font = oldFont;
};

// `none` - perform all the calculations required, but don't perform the final stamping
P.none = function () {}


P.getCanvasTextHold = function (item) {

    if (item?.type == T_CELL && item?.controller?.type == T_CANVAS && item?.controller?.textHold) return item.controller;

    if (item && item.type == T_CELL && item.currentHost) return this.getCanvasTextHold(item.currentHost);

    return false;
};


// #### Factory
// ```
// scrawl.makeLabel({
//
//     name: 'mylabel-fill',
//
// }).clone({
//
//     name: 'mylabel-draw',
// });
// ```
export const makeLabel = function (items) {

    if (!items) return false;
    return new Label(items);
};

constructors.Label = Label;
