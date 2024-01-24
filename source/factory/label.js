// # Label factory
// TODO - documentation

// #### Demos:
// + TODO - demos


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

import { _abs, _ceil, BLACK, DEFAULT_FONT, DESTINATION_OUT, ENTITY, MOUSE, PARTICLE, SOURCE_OVER, T_CANVAS, T_CELL, T_LABEL, TEXTAREA, ZERO_STR } from '../helper/shared-vars.js';


// #### Label constructor
const Label = function (items = Ωempty) {

    this.entityInit(items);

    this.dirtyFont = true;

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

    fontString: DEFAULT_FONT,

    includeUnderline: false,
    underlineStyle: BLACK,
    underlineWidth: 1,
    underlineOffset: 0,

    showBoundingBox: false,
    boundingBoxStyle: BLACK,
    boundingBoxLineWidth: 1,
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

    return this.currentDimensions[0];
};
S.width = λnull;
D.width = λnull;

G.height = function () {

    return this.currentDimensions[1];
};
S.height = λnull;
D.height = λnull;

G.dimensions = function () {

    return [...this.currentDimensions];
};
S.dimensions = λnull;
D.dimensions = λnull;

G.fontString = function () {

    return this.fontString;
};
S.fontString = function (item) {

    if (item?.substring) {

        this.fontString = item;
        this.dirtyFont = true;
    }
};

// Local helper element
const textEntityConverter = document.createElement(TEXTAREA);

G.rawText = function () {

    return this.rawText;
};
S.text = function (item) {

    this.rawText = (item.substring) ? item : item.toString;
    textEntityConverter.innerHTML = this.rawText;
    this.text = textEntityConverter.value;

    this.dirtyFont = true;
};

G.direction = function () {

    return this.state.direction;
};
S.direction = function (item) {

    if (item?.substring) {

        this.state.direction = item;
        this.dirtyFont = true;
    }
};

G.fontKerning = function () {

    return this.state.fontKerning;
};
S.fontKerning = function (item) {

    if (item?.substring) {

        this.state.fontKerning = item;
        this.dirtyFont = true;
    }
};

G.fontStretch = function () {

    return this.state.fontStretch;
};
S.fontStretch = function (item) {

    if (item?.substring) {

        this.state.fontStretch = item;
        this.dirtyFont = true;
    }
};

G.fontVariantCaps = function () {

    return this.state.fontVariantCaps;
};
S.fontVariantCaps = function (item) {

    if (item?.substring) {

        this.state.fontVariantCaps = item;
        this.dirtyFont = true;
    }
};

G.letterSpacing = function () {

    return this.state.letterSpacing;
};
D.letterSpacing = function (item) {

    if (item?.toFixed)  item = `${item}px`;

    if (item?.substring) {

        this.state.letterSpacing = item;
        this.dirtyFont = true;
    }
};
S.letterSpacing = function (item) {

    if (item?.toFixed)  item = `${item}px`;

    if (item?.substring) {

        this.state.letterSpacing = item;
        this.dirtyFont = true;
    }
};

G.wordSpacing = function () {

    return this.state.wordSpacing;
};
D.wordSpacing = function (item) {

    if (item?.toFixed)  item = `${item}px`;

    if (item?.substring) {

        this.state.wordSpacing = item;
        this.dirtyFont = true;
    }
};
S.wordSpacing = function (item) {

    if (item?.toFixed)  item = `${item}px`;

    if (item?.substring) {

        this.state.wordSpacing = item;
        this.dirtyFont = true;
    }
};

G.textAlign = function () {

    return this.state.textAlign;
};
S.textAlign = function (item) {

    if (item?.substring) {

        this.state.textAlign = item;
        this.dirtyFont = true;
    }
};

G.textBaseline = function () {

    return this.state.textBaseline;
};
S.textBaseline = function (item) {

    if (item?.substring) {

        this.state.textBaseline = item;
        this.dirtyFont = true;
    }
};

G.textRendering = function () {

    return this.state.textRendering;
};
S.textRendering = function (item) {

    if (item?.substring) {

        this.state.textRendering = item;
        this.dirtyFont = true;
    }
};



// #### Prototype functions

P.temperFont = function () {

    this.dirtyFont = false;

    const mycell = requestCell();

    const { engine } = mycell;

    engine.font = this.fontString;
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

    releaseCell(mycell);

    const { actualBoundingBoxLeft, actualBoundingBoxRight, actualBoundingBoxAscent, actualBoundingBoxDescent} = this.metrics;

    this.dimensions[0] = _ceil(_abs(actualBoundingBoxLeft) + _abs(actualBoundingBoxRight));
    this.dimensions[1] = _ceil(_abs(actualBoundingBoxDescent) + _abs(actualBoundingBoxAscent));

    this.dirtyPathObject = true;
};

// Calculate the Label entity's __Path2D object__
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    const p = this.pathObject = new Path2D();

    const handle = this.currentHandle,
        dims = this.currentDimensions,
        scale = this.currentScale;

    const x = -handle[0] * scale,
        y = -handle[1] * scale,
        w = dims[0] * scale,
        h = dims[1] * scale;

    p.rect(x, y, w, h);

    if (this.temperedFont) {

        const {attributes, size, family} = this.temperedFont.groups;
        this.currentFont = `${attributes} ${size * scale}px ${family}`;
    }
    else this.dirtyFont = true;
};


// #### Clean functions

// `cleanDimensions` - calculate the artefact's __currentDimensions__ Array
P.cleanDimensions = function () {

    this.dirtyDimensions = false;

    const dims = this.dimensions,
        curDims = this.currentDimensions;

    const [oldW, oldH] = curDims;

    curDims[0] = dims[0];
    curDims[1] = dims[1];

    this.dirtyStart = true;
    this.dirtyHandle = true;
    this.dirtyOffset = true;

    if (oldW !== curDims[0] || oldH !== curDims[1]) this.dirtyPositionSubscribers = true;

    if (this.mimicked && this.mimicked.length) this.dirtyMimicDimensions = true;

    this.dirtyFilterIdentifier = true;
};

// `cleanHandle` - calculate the artefact's __currentHandle__ Array
P.cleanHandle = function () {

    this.dirtyHandle = false;

    this.cleanPosition(this.currentHandle, this.handle, this.currentDimensions);
    this.dirtyStampHandlePositions = true;

    if (this.mimicked && this.mimicked.length) this.dirtyMimicHandle = true;
};


// #### Display cycle functions

P.prepareStamp = function() {

    if (this.dirtyHost) this.dirtyHost = false;
    if (this.dirtyFont) this.temperFont();

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;

    if (this.dirtyScale) this.cleanScale();
    if (this.dirtyDimensions) this.cleanDimensions();
    if (this.dirtyLock) this.cleanLock();
    if (this.dirtyStart) this.cleanStart();
    if (this.dirtyOffset) this.cleanOffset();
    if (this.dirtyHandle) this.cleanHandle();
    if (this.dirtyRotation) this.cleanRotation();

    if (this.isBeingDragged || this.lockTo.includes(MOUSE) || this.lockTo.includes(PARTICLE)) {

        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    }

    if (this.dirtyStampPositions) this.cleanStampPositions();
    if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();
    if (this.dirtyPathObject) this.cleanPathObject();
    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();

    this.prepareStampTabsHelper();
};


// ##### Stamp methods

P.stampPositioningHelper = function () {

    const handle = this.currentHandle,
        scale = this.currentScale,
        text = this.text,
        x = -handle[0] * scale,
        y = -handle[1] * scale;

    return [text, x, y];
}

// `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
P.draw = function (engine) {

    const pos = this.stampPositioningHelper();

    const oldFont = engine.font;
    engine.font = this.currentFont;

    engine.strokeText(...pos);

    engine.font = oldFont;

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
P.fill = function (engine) {

    const pos = this.stampPositioningHelper();

    const oldFont = engine.font;
    engine.font = this.currentFont;

    engine.fillText(...pos);

    engine.font = oldFont;

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `drawAndFill` - stamp the entity stroke, then fill, then remove shadow and repeat
P.drawAndFill = function (engine) {

    const pos = this.stampPositioningHelper();

    const oldFont = engine.font;
    engine.font = this.currentFont;

    engine.strokeText(...pos);
    engine.fillText(...pos);
    this.currentHost.clearShadow();
    engine.strokeText(...pos);
    engine.fillText(...pos);

    engine.font = oldFont;

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `drawAndFill` - stamp the entity fill, then stroke, then remove shadow and repeat
P.fillAndDraw = function (engine) {

    const pos = this.stampPositioningHelper();

    const oldFont = engine.font;
    engine.font = this.currentFont;

    engine.fillText(...pos);
    engine.strokeText(...pos);
    this.currentHost.clearShadow();
    engine.fillText(...pos);
    engine.strokeText(...pos);

    engine.font = oldFont;

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
P.drawThenFill = function (engine) {

    const pos = this.stampPositioningHelper();

    const oldFont = engine.font;
    engine.font = this.currentFont;

    engine.strokeText(...pos);
    engine.fillText(...pos);

    engine.font = oldFont;

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
P.fillThenDraw = function (engine) {

    const pos = this.stampPositioningHelper();

    const oldFont = engine.font;
    engine.font = this.currentFont;

    engine.fillText(...pos);
    engine.strokeText(...pos);

    engine.font = oldFont;

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `clip` - restrict drawing activities to the entity's enclosed area
P.clip = function (engine) {

    engine.clip(this.pathObject, this.winding);
 };

// `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
P.clear = function (engine) {

    const gco = engine.globalCompositeOperation;
    const pos = this.stampPositioningHelper();

    const oldFont = engine.font;
    engine.font = this.currentFont;

    engine.globalCompositeOperation = DESTINATION_OUT;
    engine.fillText(...pos);

    engine.globalCompositeOperation = gco;
    engine.font = oldFont;

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `none` - perform all the calculations required, but don't perform the final stamping
P.none = function () {}


// `drawBoundingBox` - internal helper function called by `regularStamp`
P.drawBoundingBox = function (engine) {

    engine.save();
    engine.strokeStyle = this.boundingBoxStyle;
    engine.lineWidth = this.boundingBoxLineWidth;
    engine.globalCompositeOperation = SOURCE_OVER;
    engine.globalAlpha = 1;
    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;
    engine.stroke(this.pathObject);
    engine.restore();
};

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
