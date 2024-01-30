// # Label factory
// TODO - documentation


// #### Imports
import { constructors, cell, cellnames, styles, stylesnames } from '../core/library.js';

import { doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

import { _abs, _ceil, _floor, _parse, ALPHABETIC, ARIA_LIVE, BLACK, BOTTOM, CENTER, DATA_TAB_ORDER, DEF_SECTION_PLACEHOLDER, DEFAULT_FONT, DESTINATION_OUT, DIV, END, ENTITY, HANGING, IDEOGRAPHIC, LEFT, LTR, MIDDLE, MOUSE, PARTICLE, POLITE, RIGHT, SOURCE_OVER, START, SYSTEM_FONTS, T_CANVAS, T_CELL, T_LABEL, TOP, TEXTAREA, ZERO_STR } from '../helper/shared-vars.js';


// #### Label constructor
const Label = function (items = Ωempty) {

    this.letterSpaceValue = 0;
    this.wordSpaceValue = 0;

    this.entityInit(items);

    this.dirtyFont = true;
    this.currentFontIsLoaded = false;
    if (this.calculateFontOffsets) this.dirtyFontOffsets = true;

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

    calculateFontOffsets: true,

    includeUnderline: false,
    underlineStyle: ZERO_STR,
    underlineWidth: 1,
    underlineOffset: 0,
    underlineGap: 3,

    showBoundingBox: false,
    boundingBoxStyle: BLACK,
    boundingBoxLineWidth: 1,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.finalizePacketOut = function (copy, items) {

    const stateCopy = _parse(this.state.saveAsPacket(items))[3];
    stateCopy.letterSpacing = this.letterSpaceValue;
    stateCopy.wordSpacing = this.wordSpaceValue;
    copy = mergeOver(copy, stateCopy);

    copy = this.handlePacketAnchor(copy, items);

    return copy;
};


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
    this.currentFontIsLoaded = false;
};
D.scale = function (item) {

    this.scale += item;
    this.dirtyScale = true;
    this.dirtyFont = true;
    this.currentFontIsLoaded = false;
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
        if (this.calculateFontOffsets) this.dirtyFontOffsets = true;
        this.currentFontIsLoaded = false;
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
    this.currentFontIsLoaded = false;
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
P.checkFontIsLoaded = function () {

    const fonts = document.fonts;

    const check = fonts.check(this.state.font);

    if (check) {

        this.currentFontIsLoaded = true;
        return true;
    }
    this.dirtyFont = true;
    return false;
}


// `temperFont` - manipulate the user-supplied font string to create a font string the canvas engine can use
// + We also get basic text metrics at this point in time
P.temperFont = function () {

    this.dirtyFont = false;

    const {state, currentScale, letterSpaceValue, wordSpaceValue} = this;

    const mycell = requestCell();
    const { engine } = mycell;

    engine.font = this.fontString;

    this.temperedFont = engine.font.match(/(?<attributes>.*?)(?<size>[0-9.]+)px (?<family>.*)/);

    if (this.temperedFont && state) {

        const groups = this.temperedFont.groups;
        const {attributes, size, family} = groups;

        const familyArray = family.split(','),
            firstFamily = familyArray[0].trim();

        groups.family = firstFamily;
        groups.attributes = attributes.trim();

        this.defaultFont = `${attributes} ${size * currentScale}px ${firstFamily}`;
        state.font = this.defaultFont;
    }
    else {

        this.dirtyFont = true;
        return false;
    }

    state.letterSpacing = `${letterSpaceValue * currentScale}px`;
    state.wordSpacing = `${wordSpaceValue * currentScale}px`;

    engine.font = state.font;
    engine.fontKerning = state.fontKerning;
    engine.fontStretch = state.fontStretch;
    engine.fontVariantCaps = state.fontVariantCaps;
    engine.textRendering = state.textRendering;
    engine.letterSpacing = state.letterSpacing;
    engine.wordSpacing = state.wordSpacing;
    engine.direction = state.direction;
    engine.textAlign = LEFT;
    engine.textBaseline = TOP;

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
// + Can be invoked globally via the `scrawl.recalculateFonts` function
P.recalculateFont = function () {

    this.dirtyFont = true;
    if (this.calculateFontOffsets) this.dirtyFontOffsets = true;
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
        dims = this.currentDimensions;

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

P.cleanHandle = function () {

    this.dirtyHandle = false;

    const { handle, currentHandle, currentDimensions, mimicked, state, metrics, fontVerticalOffset } = this;

    const [hx, hy] = handle;
    const [dx, dy] = currentDimensions;
    const direction = state.direction || LTR;

    // horizontal
    if (hx.toFixed) currentHandle[0] = hx;
    else if (hx == LEFT) currentHandle[0] = 0;
    else if (hx == RIGHT) currentHandle[0] = dx;
    else if (hx == CENTER) currentHandle[0] = dx / 2;
    else if (hx == START) currentHandle[0] = (direction == LTR) ? 0 : dx;
    else if (hx == END) currentHandle[0] = (direction == LTR) ? dx : 0;
    else if (isNaN(parseFloat(hx))) currentHandle[0] = 0;
    else currentHandle[0] = (parseFloat(hx) / 100) * dx;

    // vertical
    if (hy.toFixed) currentHandle[1] = hy;
    else if (hy == TOP) currentHandle[1] = 0;
    else if (hy == BOTTOM) currentHandle[1] = dy;
    else if (hy == CENTER) currentHandle[1] = dy / 2;
    else if (hy == MIDDLE) currentHandle[1] = dy / 2;
    else if (hy == IDEOGRAPHIC) currentHandle[1] = dy;
    else if (hy == HANGING) {

        const {hangingBaseline} = metrics;

        if (hangingBaseline != null) {

                const ratio = _abs(hangingBaseline) / dy;
                currentHandle[1] = (ratio * dy) + fontVerticalOffset;
        }
        else currentHandle[1] = 0;
    }
    else if (hy == ALPHABETIC) {

        const {alphabeticBaseline} = metrics;

        if (alphabeticBaseline != null) {

                const ratio = _abs(alphabeticBaseline) / dy;
                currentHandle[1] = (ratio * dy) + fontVerticalOffset;
        }
        else currentHandle[1] = 0;
    }
    else if (isNaN(parseFloat(hy))) currentHandle[1] = 0;
    else currentHandle[1] = (parseFloat(hy) / 100) * dy;

    this.dirtyFilterIdentifier = true;
    this.dirtyStampHandlePositions = true;

    if (mimicked && mimicked.length) this.dirtyMimicHandle = true;
};


P.cleanFontOffsets = function () {

    this.dirtyFontOffsets = false;
    this.fontVerticalOffset = 0;

    if (this.checkFontIsLoaded()) {

        const mycell = requestCell();
        const { engine, element } = mycell;
        const { currentDimensions, state, text } = this;
        const [width, height] = currentDimensions;
        const padding = 100;

        const testWidth = width,
            testHeight = height + (padding * 2);

        mycell.w = element.width = testWidth;
        mycell.h = element.height = testHeight;

        engine.fillStyle = BLACK;
        engine.strokeStyle = BLACK;
        engine.font = state.font;
        engine.fontKerning = state.fontKerning;
        engine.fontStretch = state.fontStretch;
        engine.fontVariantCaps = state.fontVariantCaps;
        engine.textRendering = state.textRendering;
        engine.letterSpacing = state.letterSpacing;
        engine.wordSpacing = state.wordSpacing;
        engine.direction = state.direction;
        engine.textAlign = LEFT;
        engine.textBaseline = TOP;

        engine.fillText(text, 0, padding);

        const image = engine.getImageData(0, 0, testWidth, testHeight);
        const { width:iWidth, data } = image;

        let markTop = data.length;

        for (let i = 3, iz = data.length; i < iz; i += 3) {

            if (data[i]) {

                const mark = _floor(((i - 3) / 4) / iWidth);

                if (mark < markTop) markTop = mark;
            }
        }

        const offset = padding - markTop;

        if (offset > 0) this.fontVerticalOffset = offset;
        
        releaseCell(mycell);

        this.dirtyPathObject = true;
    }
    else this.dirtyFontOffsets = true;
};


// #### Display cycle functions

P.prepareStamp = function() {

    if (this.dirtyHost) this.dirtyHost = false;

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;

    if (this.dirtyScale) this.cleanScale();
    if (this.dirtyText) this.updateAccessibleTextHold();
    if (this.dirtyFont) this.temperFont();
    if (this.dirtyDimensions) this.cleanDimensions();
    if (this.dirtyFontOffsets) this.cleanFontOffsets();
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

    const { currentHandle, currentScale, text, fontVerticalOffset } = this;
    const x = -currentHandle[0],
        y = -currentHandle[1] + fontVerticalOffset * currentScale;

    return [text, x, y];
}

// `stampPositioningHelper` - internal helper function
P.underlineEngine = function (engine, pos) {

    // Setup constants
    const {
        currentDimensions,
        currentScale,
        currentStampPosition,
        state,
        underlineGap,
        underlineOffset,
        underlineStyle,
        underlineWidth,
    } = this;

    const [, x, y] = pos;
    const [localWidth, localHeight] = currentDimensions;

    const underlineStartY = y + (underlineOffset * localHeight);
    const underlineDepth = underlineWidth * currentScale;

    // Setup the temporary cell
    const mycell = requestCell(),
        canvasEl = engine.canvas;

    const { engine:ctx, element:el } = mycell;

    mycell.w = el.width = canvasEl.width;
    mycell.h = el.height = canvasEl.height;

    mycell.rotateDestination(ctx, ...currentStampPosition, this);

    // Setup the underline context
    ctx.fillStyle = BLACK;
    ctx.strokeStyle = BLACK;
    ctx.font = state.font;
    ctx.fontKerning = state.fontKerning;
    ctx.fontStretch = state.fontStretch;
    ctx.fontVariantCaps = state.fontVariantCaps;
    ctx.textRendering = state.textRendering;
    ctx.letterSpacing = state.letterSpacing;
    ctx.wordSpacing = state.wordSpacing;
    ctx.direction = state.direction;
    ctx.textAlign = LEFT;
    ctx.textBaseline = TOP;
    ctx.lineWidth = (underlineGap * 2) * currentScale;

    // Underlines can take their own styling, or use the fillStyle set on the Label entity
    let uStyle = underlineStyle;
    if (!uStyle) uStyle = this.state.fillStyle;
    if (uStyle.substring) {

        let brokenStyle = null;

        if (stylesnames.includes(uStyle)) brokenStyle = styles[uStyle];
        else if (cellnames.includes(uStyle)) brokenStyle = cell[uStyle];

        if (brokenStyle != null) uStyle = brokenStyle.getData(this, mycell);
    }
    else uStyle = uStyle.getData(this, mycell);

    // Generate the underline
    ctx.strokeText(...pos);
    ctx.fillText(...pos);

    ctx.globalCompositeOperation = 'source-out';
    ctx.fillStyle = uStyle;

    ctx.fillRect(x, underlineStartY, localWidth, underlineDepth);

    // Copy the underline over to the real cell
    engine.save();
    engine.setTransform(1, 0, 0, 1, 0, 0);
    engine.drawImage(el, 0, 0);
    engine.restore();

    // Release the temporary cell
    releaseCell(mycell);
};

// `drawBoundingBox` - internal helper function called by `method` functions
// + Unlike the underline, the bounding box only supports color values. It's mainly used during development as a reference to get the font to fit inside its box
// + No checks are made to exclude non-color-string styles!
// + To add fancy borders and backgrounds to a Label entity, use a second entity (eg: Block, Rectangle) and set it to mimic the Label entity. Remember the second entity will need to calculate its positioning/dimensions after the Label, but stamp itself before the label. Use the `calculateOrder` and `stampOrder` attributes of the two entitys to make this happen.
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

// `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
P.draw = function (engine) {

    if (this.currentFontIsLoaded) {

        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(engine, pos);

        engine.strokeText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    }
};

// `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
P.fill = function (engine) {

    if (this.currentFontIsLoaded) {

        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(engine, pos);

        engine.fillText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    }
};

// `drawAndFill` - stamp the entity stroke, then fill, then remove shadow and repeat
P.drawAndFill = function (engine) {

    if (this.currentFontIsLoaded) {

        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(engine, pos);

        engine.strokeText(...pos);
        engine.fillText(...pos);
        this.currentHost.clearShadow();
        engine.strokeText(...pos);
        engine.fillText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    }
};

// `drawAndFill` - stamp the entity fill, then stroke, then remove shadow and repeat
P.fillAndDraw = function (engine) {

    if (this.currentFontIsLoaded) {

        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(engine, pos);

        engine.fillText(...pos);
        engine.strokeText(...pos);
        this.currentHost.clearShadow();
        engine.fillText(...pos);
        engine.strokeText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    }
};

// `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
P.drawThenFill = function (engine) {

    if (this.currentFontIsLoaded) {

        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(engine, pos);

        engine.strokeText(...pos);
        engine.fillText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    }
};

// `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
P.fillThenDraw = function (engine) {

    if (this.currentFontIsLoaded) {

        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(engine, pos);

        engine.fillText(...pos);
        engine.strokeText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    }
};

// `clip` - restrict drawing activities to the entity's enclosed area
P.clip = function (engine) {

    engine.clip(this.pathObject, this.winding);
 };

// `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
P.clear = function (engine) {

    if (this.currentFontIsLoaded) {

        const gco = engine.globalCompositeOperation;
        const pos = this.stampPositioningHelper();

        engine.globalCompositeOperation = DESTINATION_OUT;
        engine.fillText(...pos);
        engine.globalCompositeOperation = gco;

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    }
};

// `none` - perform all the calculations required, but don't perform the final stamping
P.none = function () {}


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
