// # Label factory
// TODO - documentation

// #### To be aware: fonts are loaded asynchronously!
// Browsers tend to delay loading fonts until they are needed - hence FOUC. This means that Label entitys may not pick their correct dimensions when instantiated.
// + While Labels will eventually display using the correct font once it has loaded, their measurements will not update.
// + If this is important for a scene, we need to correct Label dimensions manually - `setTimeout` is one approach:
// + `setTimeout(() => canvas.get('baseGroup').recalculateFonts(), 0);`
// + Another approach is to load fonts dynamically - see the [Font Loading API documentation](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API) on MDN for details.
// + A third approach is to trigger the recalculation in the `makeRender` object using the `afterCreated` hook:
// + `afterCreated: () => canvas.get('baseGroup').recalculateFonts(),`


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

import { _abs, _ceil, ARIA_LIVE, BLACK, BOTTOM, CENTER, DATA_TAB_ORDER, DEF_SECTION_PLACEHOLDER, DEFAULT_FONT, DESTINATION_OUT, DIV, ENTITY, LEFT, MOUSE, PARTICLE, POLITE, RIGHT, SOURCE_OVER, T_CANVAS, T_CELL, T_LABEL, TOP, TEXTAREA, ZERO_STR } from '../helper/shared-vars.js';


// #### Label constructor
const Label = function (items = Ωempty) {

    this.letterSpaceValue = 0;
    this.wordSpaceValue = 0;

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
    textIsAccessible: true,
    accessibleText: DEF_SECTION_PLACEHOLDER,
    accessibleTextPlaceholder: DEF_SECTION_PLACEHOLDER,
    accessibleTextOrder: 0,

    fontString: DEFAULT_FONT,
    fontVerticalOffset: 0,

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
P.factoryKill = function () {

    if (this.accessibleTextHold) this.accessibleTextHold.remove();

    const hold = this.getCanvasTextHold(this.currentHost);
    if (hold) hold.dirtyTextTabOrder = true;
};


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

S.scale = function (item) {

    this.scale = item;
    this.dirtyScale = true;
    this.dirtyFont = true;
};
D.scale = function (item) {

    this.scale += item;
    this.dirtyScale = true;
    this.dirtyFont = true;
};

G.rawFont = function () {

    return this.fontString;
};
G.defaultFont = function () {

    return this.defaultFont;
};
S.fontString = function (item) {

    if (item?.substring) {

        this.fontString = item;
        this.dirtyFont = true;
    }
};

G.rawText = function () {

    return this.rawText;
};
S.text = function (item) {

    this.rawText = (item.substring) ? item : item.toString;
    this.text = this.convertTextEntityCharacters(this.rawText);

    this.dirtyText = true;
    this.dirtyFont = true;
};

G.accessibleText = function () {

    return this.getAccessibleText();
};
S.accessibleText = function (item) {

    if (item?.substring) {

        this.accessibleText = item;
        this.dirtyText = true;
    }
};

S.accessibleTextPlaceholder = function (item) {

    if (item?.substring) {

        this.accessibleTextPlaceholder = item;
        this.dirtyText = true;
    }
};

S.accessibleTextOrder = function (item) {

    if (item?.toFixed) {

        this.accessibleTextOrder = item;
        this.dirtyText = true;
    }
};

S.textIsAccessible = function (item) {

    this.textIsAccessible = !!item;
    this.dirtyText = true;
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
S.fontStretch = λnull;

G.fontVariantCaps = function () {

    return this.state.fontVariantCaps;
};
S.fontVariantCaps = λnull;

G.letterSpacing = function () {

    return this.state.letterSpacing;
};
D.letterSpacing = function (item) {

    if (!item?.toFixed)  item = parseFloat(item) || 0;
    this.letterSpaceValue += item;
    this.dirtyFont = true;
};
S.letterSpacing = function (item) {

    if (!item?.toFixed)  item = parseFloat(item) || 0;
    this.letterSpaceValue = item;
    this.dirtyFont = true;
};

G.wordSpacing = function () {

    return this.state.wordSpacing;
};
D.wordSpacing = function (item) {

    if (!item?.toFixed)  item = parseFloat(item) || 0;
    this.wordSpaceValue += item;
    this.dirtyFont = true;
};
S.wordSpacing = function (item) {

    if (!item?.toFixed)  item = parseFloat(item) || 0;
    this.wordSpaceValue = item;
    this.dirtyFont = true;
};

G.textAlign = function () {

    return this.state.textAlign;
};
S.textAlign = λnull;

G.textBaseline = function () {

    return this.state.textBaseline;
};
S.textBaseline = λnull;

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
// `temperFont` - manipulate the user-supplied font string to create a font string the canvas engine can use
// + We also get basic text metrics at this point in time
P.temperFont = function () {

    this.dirtyFont = false;

    const scale = this.currentScale;

    const mycell = requestCell();
    const { engine } = mycell;

    engine.font = this.fontString;

    this.temperedFont = engine.font.match(/(?<attributes>.*?)(?<size>[0-9.]+)px (?<family>.*)/);

    if (this.temperedFont && this.state) {

        const {attributes, size, family} = this.temperedFont.groups;
        this.defaultFont = `${attributes} ${size * scale}px ${family}`;
        this.state.font = this.defaultFont;
    }
    else {

        this.dirtyFont = true;
        return false;
    }

    this.state.letterSpacing = `${this.letterSpaceValue * scale}px`;
    this.state.wordSpacing = `${this.wordSpaceValue * scale}px`;

    engine.font = this.state.font;
    engine.fontKerning = this.state.fontKerning;
    engine.fontStretch = this.state.fontStretch;
    engine.fontVariantCaps = this.state.fontVariantCaps;
    engine.textRendering = this.state.textRendering;
    engine.letterSpacing = this.state.letterSpacing;
    engine.wordSpacing = this.state.wordSpacing;
    engine.direction = 'ltr';
    engine.textAlign = 'left';
    engine.textBaseline = 'top';

    this.metrics = engine.measureText(this.text);

    releaseCell(mycell);

    const { actualBoundingBoxLeft, actualBoundingBoxRight, actualBoundingBoxAscent, actualBoundingBoxDescent} = this.metrics;

    this.dimensions[0] = _ceil(_abs(actualBoundingBoxLeft) + _abs(actualBoundingBoxRight));
    this.dimensions[1] = _ceil(_abs(actualBoundingBoxDescent) + _abs(actualBoundingBoxAscent));

    this.dirtyPathObject = true;
    this.dirtyDimensions = true;

    return true;
};

// `convertTextEntityCharacters`, `textEntityConverter` - (not part of the Label prototype!) - a &lt;textarea> element not attached to the DOM which we can use to temper user-supplied text
// + Tempering includes converting HTMLentity copy - such as changing `&epsilon;` to an &epsilon; letter
const textEntityConverter = document.createElement(TEXTAREA);
P.convertTextEntityCharacters = function (item) {

    textEntityConverter.innerHTML = item;
    return textEntityConverter.value;
};

// `recalculateFont` - force the entity to recalculate its dimensions without having to set anything.
// + Can also be invoked via the entity's Group object's `recalculateFonts` function
P.recalculateFont = function () {

    this.dirtyFont = true;
};


// #### Accessibility functions
// `getCanvasTextHold` - get a handle for the &lt;canvas> element's child text hold &lt;div>
P.getCanvasTextHold = function (item) {

    if (item?.type == T_CELL && item?.controller?.type == T_CANVAS && item?.controller?.textHold) return item.controller;

    // For non-based Cells we have to make a recursive call to find the &lt;canvas> host
    if (item && item.type == T_CELL && item.currentHost) return this.getCanvasTextHold(item.currentHost);

    return false;
};

P.updateAccessibleTextHold = function () {

    this.dirtyText = false;

    if (this.textIsAccessible) {

        if (!this.accessibleTextHold) {

            const myhold = document.createElement(DIV);
            myhold.id = `${this.name}-text-hold`;
            myhold.setAttribute(ARIA_LIVE, POLITE);
            myhold.setAttribute(DATA_TAB_ORDER, this.accessibleTextOrder);
            this.accessibleTextHold = myhold;
            this.accessibleTextHoldAttached = false;
        }

        this.accessibleTextHold.textContent = this.getAccessibleText();

        if (this.currentHost) {

            const hold = this.getCanvasTextHold(this.currentHost);

            if (hold && hold.textHold) {

                if (!this.accessibleTextHoldAttached) {

                    hold.textHold.appendChild(this.accessibleTextHold);
                    this.accessibleTextHoldAttached = true;
                }
                hold.dirtyTextTabOrder = true;
            }
        }
    }
    else {

        if (this.accessibleTextHold) {

            this.accessibleTextHold.remove();
            this.accessibleTextHold = null;
            this.accessibleTextHoldAttached = false;

            const hold = this.getCanvasTextHold(this.currentHost);
            if (hold) hold.dirtyTextTabOrder = true;
        }
    }
};

P.getAccessibleText = function () {

    const {accessibleText, accessibleTextPlaceholder, text} = this;
    return accessibleText.replace(accessibleTextPlaceholder, text);
};


// #### Clean functions
// `cleanPathObject` - calculate the Label entity's __Path2D object__
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    const p = this.pathObject = new Path2D();

    const handle = this.currentHandle,
        dims = this.currentDimensions,
        scale = this.currentScale;

    const [x, y] = handle;
    const [w, h] = dims;

    p.rect(-x, -y, w, h);
};

// `cleanDimensions` - calculate the entity's __currentDimensions__ Array
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

    if (oldW != curDims[0] || oldH != curDims[1]) this.dirtyPositionSubscribers = true;

    if (this.mimicked && this.mimicked.length) this.dirtyMimicDimensions = true;

    this.dirtyFilterIdentifier = true;
};


// #### Display cycle functions

P.prepareStamp = function() {

    if (this.dirtyHost) this.dirtyHost = false;

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;

    if (this.dirtyScale) this.cleanScale();
    if (this.dirtyText) this.updateAccessibleTextHold();
    if (this.dirtyFont) this.temperFont();
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
// `stampPositioningHelper` - internal helper function
P.stampPositioningHelper = function () {

    const handle = this.currentHandle,
        scale = this.currentScale,
        text = this.text,
        x = -handle[0],
        y = -handle[1] + (this.fontVerticalOffset * scale);

    return [text, x, y];
}

// `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
P.draw = function (engine) {

    const pos = this.stampPositioningHelper();

    engine.strokeText(...pos);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
P.fill = function (engine) {

    const pos = this.stampPositioningHelper();

    engine.fillText(...pos);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `drawAndFill` - stamp the entity stroke, then fill, then remove shadow and repeat
P.drawAndFill = function (engine) {

    const pos = this.stampPositioningHelper();

    engine.strokeText(...pos);
    engine.fillText(...pos);
    this.currentHost.clearShadow();
    engine.strokeText(...pos);
    engine.fillText(...pos);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `drawAndFill` - stamp the entity fill, then stroke, then remove shadow and repeat
P.fillAndDraw = function (engine) {

    const pos = this.stampPositioningHelper();

    engine.fillText(...pos);
    engine.strokeText(...pos);
    this.currentHost.clearShadow();
    engine.fillText(...pos);
    engine.strokeText(...pos);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
P.drawThenFill = function (engine) {

    const pos = this.stampPositioningHelper();

    engine.strokeText(...pos);
    engine.fillText(...pos);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};

// `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
P.fillThenDraw = function (engine) {

    const pos = this.stampPositioningHelper();

    engine.fillText(...pos);
    engine.strokeText(...pos);

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

    engine.globalCompositeOperation = DESTINATION_OUT;
    engine.fillText(...pos);
    engine.globalCompositeOperation = gco;

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
