// # Label factory
// TODO - document purpose and description

// #### Fonts and browsers
// Font rendering in the &lt;canvas> element, consistently across browsers, can be ... problematic. Of the major browsers, Safari is the one that seems to cause the most problems. In particular:
// + While Safari can read fontString values like `italic 24px Garamond` to output italicised text, all attempts to use a value like `bold 24px Garamond` to output bold text will fail. Safari refuses to process fonts into a bold representation - except if the directly referenced font file itself is a bold font.
// + Safari struggles with font sizes given in lengths other than 'px' - `24px Garamond` will generate text at 24px; `1.5rem Garamond` (where the CSS root font-size value has been set to 16px) generates text somewhere in the vicinity of 16px ... give or take.
// + Safari will often place text lower down than expected - even outside the canvas! The browser's font-reading functionality will use different font file tables to determine where the text should be stamped on the screen.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';
import textMix from '../mixin/text.js';

import { _abs, _ceil, _floor, _parse, ALPHABETIC, BLACK, BOTTOM, CENTER, DEFAULT_FONT, DESTINATION_OUT, END, ENTITY, HANGING, IDEOGRAPHIC, LEFT, LTR, MIDDLE, MOUSE, PARTICLE, RIGHT, START, SYSTEM_FONTS, T_LABEL, TOP, ZERO_STR } from '../helper/shared-vars.js';


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
textMix(P);


// #### Label attributes
const defaultAttributes = {

    text: ZERO_STR,

    fontString: DEFAULT_FONT,
    fontVerticalOffset: 0,

    calculateFontOffsets: true,

    includeUnderline: false,
    underlineStyle: ZERO_STR,
    underlineWidth: 1,
    underlineOffset: 0,
    underlineGap: 3,
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
// No additional kill functionality defined here


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

    if (SYSTEM_FONTS.includes(this.temperedFont?.groups?.family)) {

        this.currentFontIsLoaded = true;
        return true;
    }

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

    const { group, state } = this;

    if (group && state) {

        this.dirtyFont = false;

        const host = (group && group.getHost) ? group.getHost() : false;

        let fontSizeCalculator = null,
            fontSizeCalculatorValues = null;

        if (host) {

            const controller = host.getController();

            if (controller) {

                fontSizeCalculator = controller.fontSizeCalculator;
                fontSizeCalculatorValues = controller.fontSizeCalculatorValues;
            }
        }

        if (!fontSizeCalculator) {

            this.dirtyFont = true;
            return false;
        }
        else {

            const { currentScale, letterSpaceValue, wordSpaceValue } = this;

            fontSizeCalculator.style.font = this.fontString;

            let fontWeight = fontSizeCalculatorValues.fontWeight,
                fontVariant = fontSizeCalculatorValues.fontVariant,
                fontStyle = fontSizeCalculatorValues.fontStyle;

            const fontStringSize = fontSizeCalculatorValues.fontSize,
                fontFamily = fontSizeCalculatorValues.fontFamily,
                fontSize = parseFloat(fontStringSize);

            if (fontVariant != 'small-caps') fontVariant = '';
            if (fontStyle != 'italic') fontStyle = '';
            if (fontWeight == 400) fontWeight = '';

            let f = '';
            if (fontStyle) f += `${fontStyle} `;
            if (fontVariant) f += `${fontVariant} `;
            if (fontWeight) f += `${fontWeight} `;
            f += `${fontSize * currentScale}px ${fontFamily}`

            this.defaultFont = f;
            state.font = f;

            const mycell = requestCell();
            const engine = mycell.engine;

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

            const { actualBoundingBoxLeft, actualBoundingBoxRight, actualBoundingBoxAscent, actualBoundingBoxDescent} = this.metrics;

            this.dimensions[0] = _ceil(_abs(actualBoundingBoxLeft) + _abs(actualBoundingBoxRight));
            this.dimensions[1] = _ceil(_abs(actualBoundingBoxDescent) + _abs(actualBoundingBoxAscent));

            this.dirtyPathObject = true;
            this.dirtyDimensions = true;

            releaseCell(mycell);

            return true;
        }
    }
    return false;
};


// `recalculateFont` - force the entity to recalculate its dimensions without having to set anything.
// + Can also be invoked via the entity's Group object's `recalculateFonts` function
// + Can be invoked globally via the `scrawl.recalculateFonts` function
P.recalculateFont = function () {

    this.dirtyFont = true;
    if (this.calculateFontOffsets) this.dirtyFontOffsets = true;
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
    else if (hy == IDEOGRAPHIC) {

        const {ideographicBaseline} = metrics;

        if (ideographicBaseline != null) {

                const ratio = _abs(ideographicBaseline) / dy;
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

    if (this.currentFontIsLoaded) {

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
    if (!this.currentFontIsLoaded) this.checkFontIsLoaded();
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
// `regularStamp` - overwrites mixin/entity.js function.
// + If decide to pass host instead of host.engine to method functions for all entitys, then this may be a temporary fix
P.regularStamp = function () {

    const dest = this.currentHost;

    if (dest) {

        const engine = dest.engine;
        const [x, y] = this.currentStampPosition;

        // Get the Cell wrapper to perform required transformations on its &lt;canvas> element's 2D engine
        dest.rotateDestination(engine, x, y, this);

        // Get the Cell wrapper to update its 2D engine's attributes to match the entity's requirements
        if (!this.noCanvasEngineUpdates) dest.setEngine(this);

        // Invoke the appropriate __stamping method__ (below)
        this[this.method](dest);
    }
};

// `stampPositioningHelper` - internal helper function
P.stampPositioningHelper = function () {

    const { currentHandle, currentScale, text, fontVerticalOffset } = this;
    const x = -currentHandle[0],
        y = -currentHandle[1] + fontVerticalOffset * currentScale;

    return [text, x, y];
}

// `stampPositioningHelper` - internal helper function
P.underlineEngine = function (host, pos) {

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

    // Setup the cell parts
    const mycell = requestCell();
    const { element: canvasEl, engine      } = host;
    const { element: el,       engine: ctx } = mycell;

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
    const uStyle = this.getStyle(underlineStyle, 'fillStyle', mycell);

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

// `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
P.draw = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(host, pos);

        engine.strokeText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(host);
    }
};

// `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
P.fill = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(host, pos);

        engine.fillText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(host);
    }
};

// `drawAndFill` - stamp the entity stroke, then fill, then remove shadow and repeat
P.drawAndFill = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(host, pos);

        engine.strokeText(...pos);
        engine.fillText(...pos);
        this.currentHost.clearShadow();
        engine.strokeText(...pos);
        engine.fillText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(host);
    }
};

// `drawAndFill` - stamp the entity fill, then stroke, then remove shadow and repeat
P.fillAndDraw = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(host, pos);

        engine.fillText(...pos);
        engine.strokeText(...pos);
        this.currentHost.clearShadow();
        engine.fillText(...pos);
        engine.strokeText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(host);
    }
};

// `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
P.drawThenFill = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(host, pos);

        engine.strokeText(...pos);
        engine.fillText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(host);
    }
};

// `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
P.fillThenDraw = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        if (this.includeUnderline) this.underlineEngine(host, pos);

        engine.fillText(...pos);
        engine.strokeText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(host);
    }
};

// `clip` - restrict drawing activities to the entity's enclosed area
P.clip = function (host) {

    const engine = host.engine;
    engine.clip(this.pathObject, this.winding);
 };

// `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
P.clear = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const gco = engine.globalCompositeOperation;
        const pos = this.stampPositioningHelper();

        engine.globalCompositeOperation = DESTINATION_OUT;
        engine.fillText(...pos);
        engine.globalCompositeOperation = gco;

        if (this.showBoundingBox) this.drawBoundingBox(host);
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

/*
Taken from the [MDN CSS length data type](https://developer.mozilla.org/en-US/docs/Web/CSS/length) page (1 Feb 2024)

Note: Although <percentage> values are usable in some of the same properties that accept <length> values, they are not themselves <length> values. 

Note: Some properties allow negative <length> values, while others do not.

Note: Child elements do not inherit the relative values as specified for their parent; they inherit the computed values.


Relative length units based on font
--------------------------------------------------------
Note: These units, especially em and rem, are often used to create scalable layouts, which maintain the vertical rhythm of the page even when the user changes the font size.

cap
Represents the "cap height" (nominal height of capital letters) of the element's font.

ch
Represents the width or more precisely the advance measure of the glyph 0 (zero, the Unicode character U+0030) in the element's font. In cases where it is impossible or impractical to determine the measure of the 0 glyph, it must be assumed to be 0.5em wide by 1em tall.

em
Represents the calculated font-size of the element. If used on the font-size property itself, it represents the inherited font-size of the element.

ex
Represents the x-height of the element's font. In fonts with the x letter, this is generally the height of lowercase letters in the font; 1ex ≈ 0.5em in many fonts.

ic
Equal to the used advance measure of the "水" glyph (CJK water ideograph, U+6C34), found in the font used to render it.

lh
Equal to the computed value of the line-height property of the element on which it is used, converted to an absolute length. This unit enables length calculations based on the theoretical size of an ideal empty line. However, the size of actual line boxes may differ based on their content.


Relative length units based on root element's font
--------------------------------------------------------

rcap
Equal to the "cap height" (nominal height of capital letters) of the root element's font.

rch
Equal to the width or the advance measure of the glyph 0 (zero, the Unicode character U+0030) in the root element's font.

rem
Represents the font-size of the root element (typically <html>). When used within the root element font-size, it represents its initial value. A common browser default is 16px, but user-defined preferences may modify this.

rex
Represents the x-height of the root element's font.

ric
Equal to the value of ic unit on the root element's font.

rlh
Equal to the value of lh unit on the root element's font. This unit enables length calculations based on the theoretical size of an ideal empty line. However, the size of actual line boxes may differ based on their content.


Relative length units based on root element's font
--------------------------------------------------------
The viewport-percentage length units are based on four different viewport sizes: small, large, dynamic, and default. The allowance for the different viewport sizes is in response to browser interfaces expanding and retracting dynamically and hiding and showing the content underneath.

Small
When you want the smallest possible viewport in response to browser interfaces expanding dynamically, you should use the small viewport size. The small viewport size allows the content you design to fill the entire viewport when browser interfaces are expanded. Choosing this size might also possibly leave empty spaces when browser interfaces retract.

For example, an element that is sized using viewport-percentage units based on the small viewport size, the element will fill the screen perfectly without any of its content being obscured when all the dynamic browser interfaces are shown. When those browser interfaces are hidden, however, there might be extra space visible around the element. Therefore, the small viewport-percentage units are "safer" to use in general, but might not produce the most attractive layout after a user starts interacting with the page.

The small viewport size is represented by the sv prefix and results in the sv* viewport-percentage length units. The sizes of the small viewport-percentage units are fixed, and therefore stable, unless the viewport itself is resized.

Large
When you want the largest possible viewport in response to browser interfaces retracting dynamically, you should use the large viewport size. The large viewport size allows the content you design to fill the entire viewport when browser interfaces are retracting. You need to be aware though that the content might get hidden when browser interfaces expand.

For example, on mobile phones where the screen real-estate is at a premium, browsers often hide part or all of the title and address bar after a user starts scrolling the page. When an element is sized using a viewport-percentage unit based on the large viewport size, the content of the element will fill the entire visible page when these browser interfaces are hidden. However, when these retractable browser interfaces are shown, they can hide the content that is sized or positioned using the large viewport-percentage units.

The large viewport unit is represented by the lv prefix and results in the lv* viewport-percentage units. The sizes of the large viewport-percentage units are fixed, and therefore stable, unless the viewport itself is resized.

Dynamic
When you want the viewport to be automatically sized in response to browser interfaces dynamically expanding or retracting, you can use the dynamic viewport size. The dynamic viewport size allows the content you design to fit exactly within the viewport, irrespective of the presence of dynamic browser interfaces.

The dynamic viewport unit is represented by the dv prefix and results in the dv* viewport-percentage units. The sizes of the dynamic viewport-percentage units are not stable, even when the viewport itself is unchanged.

Note: While the dynamic viewport size can give you more control and flexibility, using viewport-percentage units based on the dynamic viewport size can cause the content to resize while a user is scrolling a page. This can lead to degradation of the user interface and cause a performance hit.

Default
The default viewport size is defined by the browser. The behavior of the resulting viewport-percentage unit could be equivalent to the viewport-percentage unit based on the small viewport size, the large viewport size, an intermediate size between the two, or the dynamic viewport size.

Note: For example, a browser might implement the default viewport-percentage unit for height (vh) that is equivalent to the large viewport-percentage height unit (lvh). If so, this could obscure content on a full-page display while the browser interface is expanded.

Viewport-percentage lengths define <length> values in percentage relative to the size of the initial containing block, which in turn is based on either the size of the viewport or the page area, i.e., the visible portion of the document. When the height or width of the initial containing block is changed, the elements that are sized based on them are scaled accordingly. There is a viewport-percentage length unit variant corresponding to each of the viewport sizes, as described below.

Note: Viewport lengths are invalid in @page declaration blocks.

vh
Represents a percentage of the height of the viewport's initial containing block. 1vh is 1% of the viewport height. For example, if the viewport height is 300px, then a value of 70vh on a property will be 210px.

For small, large, and dynamic viewport sizes, the respective viewport-percentage units are svh, lvh, and dvh. vh represents the viewport-percentage length unit based on the browser default viewport size.

vw
Represents a percentage of the width of the viewport's initial containing block. 1vw is 1% of the viewport width. For example, if the viewport width is 800px, then a value of 50vw on a property will be 400px.

For small, large, and dynamic viewport sizes, the respective viewport-percentage units are svw, lvw, and dvw. vw represents the viewport-percentage length unit based on the browser default viewport size.

vmax
Represents in percentage the largest of vw and vh.

For small, large, and dynamic viewport sizes, the respective viewport-percentage units are svmax, lvmax, and dvmax. vmax represents the viewport-percentage length unit based on the browser default viewport size.

vmin
Represents in percentage the smallest of vw and vh.

For small, large, and dynamic viewport sizes, the respective viewport-percentage units are svmin, lvmin, and dvmin. vmin represents the viewport-percentage length unit based on the browser default viewport size.

vb
Represents percentage of the size of the initial containing block, in the direction of the root element's block axis.

For small, large, and dynamic viewport sizes, the respective viewport-percentage units are svb, lvb, and dvb, respectively. vb represents the viewport-percentage length unit based on the browser default viewport size.

vi
Represents a percentage of the size of the initial containing block, in the direction of the root element's inline axis.

For small, large, and dynamic viewport sizes, the respective viewport-percentage units are svi, lvi, and dvi. vi represents the viewport-percentage length unit based on the browser default viewport size.


Container query length units
--------------------------------------------------------
When applying styles to a container using container queries, you can use container query length units. These units specify a length relative to the dimensions of a query container. Components that use units of length relative to their container are more flexible to use in different containers without having to recalculate concrete length values.

cqw
Represents a percentage of the width of the query container. 1cqw is 1% of the query container's width. For example, if the query container's width is 800px, then a value of 50cqw on a property will be 400px.

cqh
Represents a percentage of the height of the query container. 1cqh is 1% of the query container's height. For example, if the query container's height is 300px, then a value of 10cqh on a property will be 30px.

cqi
Represents a percentage of the inline size of the query container. 1cqi is 1% of the query container's inline size. For example, if the query container's inline size is 800px, then a value of 50cqi on a property will be 400px.

cqb
Represents a percentage of the block size of the query container. 1cqb is 1% of the query container's block size. For example, if the query container's block size is 300px, then a value of 10cqb on a property will be 30px.

cqmin
Represents a percentage of the smaller value of either the query container's inline size or block size. 1cqmin is 1% of the smaller value of either the query container's inline size or block size. For example, if the query container's inline size is 800px and its block size is 300px, then a value of 50cqmin on a property will be 150px.

cqmax
Represents a percentage of the larger value of either the query container's inline size or block size. 1cqmax is 1% of the larger value of either the query container's inline size or block size. For example, if the query container's inline size is 800px and its block size is 300px, then a value of 50cqmax on a property will be 400px.


Absolute length units
--------------------------------------------------------
Absolute length units represent a physical measurement when the physical properties of the output medium are known, such as for print layout. This is done by anchoring one of the units to a physical unit and then defining the others relative to it. The anchoring is done differently for low-resolution devices, such as screens, versus high-resolution devices, such as printers.

For low-dpi devices, the unit px represents the physical reference pixel; other units are defined relative to it. Thus, 1in is defined as 96px, which equals 72pt. The consequence of this definition is that on such devices, dimensions described in inches (in), centimeters (cm), or millimeters (mm) don't necessarily match the size of the physical unit with the same name.

For high-dpi devices, inches (in), centimeters (cm), and millimeters (mm) are the same as their physical counterparts. Therefore, the px unit is defined relative to them (1/96 of 1in).

Note: Many users increase their user agent's default font size to make text more legible. Absolute lengths can cause accessibility problems because they are fixed and do not scale according to user settings. For this reason, prefer relative lengths (such as em or rem) when setting font-size.

px
One pixel. For screen displays, it traditionally represents one device pixel (dot). However, for printers and high-resolution screens, one CSS pixel implies multiple device pixels. 1px = 1in / 96.

cm
One centimeter. 1cm = 96px / 2.54.

mm
One millimeter. 1mm = 1cm / 10.

Q
One quarter of a millimeter. 1Q = 1cm / 40.

in
One inch. 1in = 2.54cm = 96px.

pc
One pica. 1pc = 12pt = 1in / 6.

pt
One point. 1pt = 1in / 72.

*/

const allLengths = ['%', 'cap', 'ch', 'cm', 'cqb', 'cqh', 'cqi', 'cqmax', 'cqmin', 'cqw', 'dvb', 'dvh', 'dvi', 'dvmax', 'dvmin', 'dvw', 'em', 'ex', 'ic', 'in', 'lh', 'lvb', 'lvh', 'lvi', 'lvmax', 'lvmin', 'lvw', 'mm', 'pc', 'pt', 'px', 'Q', 'rcap', 'rch', 'rem', 'rex', 'ric', 'rlh', 'svb', 'svh', 'svi', 'svmax', 'svmin', 'svw', 'vb', 'vh', 'vi', 'vmax', 'vmin', 'vw'];

const checkLengthSupport = () => {

    const container = document.createElement('div');
    container.style.width = '1000px';
    container.style.height = '500px';
    container.style.position = 'absolute';
    container.style.top = '-1000px';
    container.style.left = '-2000px';
    container.style.fontSize = '10px';
    container.style.fontFamily = 'monospace';
    container.style.boxSizing = 'border-box';

    const canvas = document.createElement('canvas');
    canvas.width = '200';
    canvas.height = '200';
    canvas.style.fontSize = '10px';
    canvas.style.fontFamily = 'monospace';
    canvas.style.boxSizing = 'border-box';

    const ctx = canvas.getContext('2d');

    container.appendChild(canvas);
    document.body.appendChild(container);

    const containerStyles = getComputedStyle(container);
    const canvasStyles = getComputedStyle(canvas);
    const bodyStyles = getComputedStyle(document.body);

    const results = {};
    const affordance = 10;

    allLengths.forEach(l => {

        const font = `10.1${l} monospace`;
        container.style.font = font;
        canvas.style.font = font;
        ctx.font = font;

        const containerSize = parseFloat(containerStyles['font-size']) * 10000;
        const canvasSize = parseFloat(canvasStyles['font-size']) * 10000;
        const ctxSize = parseFloat(ctx.font) * 10000;

        results[l] = {
            container: containerStyles['font-size'],
            canvas: canvasStyles['font-size'],
            ctx: ctx.font,
            matchesContainer: ctxSize > containerSize - affordance && ctxSize < containerSize + affordance,
            matchesCanvas: ctxSize > canvasSize - affordance && ctxSize < canvasSize + affordance,
        };
    });

    console.log('element-canvas comparison', results);

    container.remove();
}

checkLengthSupport();














