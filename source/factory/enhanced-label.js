// # EnhancedLabel factory
// TODO - document purpose and description


// #### Imports
import { constructors } from '../core/library.js';
import { getPixelRatio } from '../core/user-interaction.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from './text-style.js';
import { currentGroup } from './canvas.js';

import { doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';
import textMix from '../mixin/text.js';
import labelMix from '../mixin/label.js';

import { _abs, _ceil, _isFinite, _parse, ALPHABETIC, BLACK, BOTTOM, CENTER, DEFAULT_FONT, DESTINATION_OUT, END, ENTITY, FONT_LENGTH_REGEX, FONT_STRETCH_VALS, FONT_VARIANT_VALS, HANGING, IDEOGRAPHIC, ITALIC, LEFT, LTR, MIDDLE, MOUSE, NORMAL, OBLIQUE, PARTICLE, RIGHT, ROUND, SMALL_CAPS, START, T_ENHANCED_LABEL, TOP, ZERO_STR } from '../helper/shared-vars.js';


// #### EnhancedLabel constructor
const EnhancedLabel = function (items = Ωempty) {

    this.letterSpaceValue = 0;
    this.wordSpaceValue = 0;

    this.defaultTextStyle = makeTextStyle({
        name: `${this.name}_default-textstyle`,
        isDefaultTextStyle: true,
    });

    this.entityInit(items);

    this.dirtyFont = true;
    this.currentFontIsLoaded = false;

    return this;
};


// #### EnhancedLabel prototype
const P = EnhancedLabel.prototype = doCreate();
P.type = T_ENHANCED_LABEL;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
entityMix(P);
textMix(P);
labelMix(P);


// #### EnhancedLabel attributes
const defaultAttributes = {

    text: ZERO_STR,

    fontString: DEFAULT_FONT,

    // includeUnderline: false,
    // underlineStyle: ZERO_STR,
    // underlineWidth: 1,
    // underlineOffset: 0,
    // underlineGap: 3,

/*
`justifyLines` depends on the setting of `isVertical`.
+ When `isVertical =  true`, 'left' becomes 'top', 'right' becomes 'bottom'
+ When `isVertical =  false`, 'top' becomes 'left', 'bottom' becomes 'right'
+ Accepted values are: 'left', 'top'; 'center'; 'right', 'bottom'; 'full'
+ Accepted values are: numbers, measured in px; %strings, relating to the appropriate dimension of the Cell
*/
    justifyLines: 'left',

/*
`keyDimension` depends on the setting of `isVertical`.
+ When `isVertical =  true`, keyDimension is height; width is treated as unlimited
+ When `isVertical =  false`, keyDimension is width; height is treated as unlimited
*/
    keyDimension: '100%',

/*
`lineHeight` depends on the setting of `isVertical`.
+ When `isVertical =  true`, lineHeight is horizontal space between lines
+ When `isVertical =  false`, lineHeight is vertical space between lines
*/
    lineHeight: 1,

/*
When `isVertical` is true, we ignore the values for `canStyleCharacters` as we're going to stamp each character separately 
*/
    isVertical: false,
/*
When `breakLineOnCharacter` is true, we ignore the values for `canStyleCharacters` as we're going to stamp each character separately 
*/
    breakLineOnCharacter: false,

/*
When `canStyleCharacters` is true, we MUST stamp each character separately 
*/
    canStyleCharacters: false,
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
        this.currentFontIsLoaded = false;
        this.updateUsingFontString= true;
    }
};

S.fontSize = function (item) {

    this.fontSize = (item.toFixed) ? `${item}px` : item.toLowerCase();
    this.dirtyFont = true;
    this.updateUsingFontParts = true;
}

S.fontStyle = function (item) {

    if (item?.substring) {

        this.fontStyle = item.toLowerCase();
        this.dirtyFont = true;
        this.updateUsingFontParts = true;
    }
}

G.fontVariant = function () {

    return this.fontVariant;
};
S.fontVariant = function (item) {

    if (item?.substring) {

        this.fontVariant = item.toLowerCase();
        this.dirtyFont = true;
        this.updateUsingFontParts = true;
    }
};
G.fontVariantCaps = G.fontVariant;
S.fontVariantCaps = S.fontVariant;

S.fontStretch = function (item) {

    if (item?.substring) {

        this.fontStretch = item.toLowerCase();
        this.dirtyFont = true;
        this.updateUsingFontParts = true;
    }
};

S.fontWeight = function (item) {

    this.fontWeight = (item.toFixed) ? `${item}` : item;
    this.dirtyFont = true;
    this.updateUsingFontParts = true;
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

// `entityInit` - overwrites the mixin/entity.js function
P.entityInit = function (items = Ωempty) {

    this.modifyConstructorInputForAnchorButton(items);

    this.makeName(items.name);
    this.register();
    this.initializePositions();

    this.state = makeState(Ωempty);

    this.set(this.defs);

    if (!items.group) items.group = currentGroup;

    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    this.updateUsingFontParts = false;
    this.updateUsingFontString = false;

    this.set(items);

    this.midInitActions(items);

    if (this.purge) this.purgeArtefact(this.purge);
};


// `temperFont` - manipulate the user-supplied font string to create a font string the canvas engine can use
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

        if (!fontSizeCalculator) this.dirtyFont = true;
        else {

            let fontSize = this.fontSize;
            const { currentScale, fontStretch, fontStyle, fontWeight, fontVariant, fontString, updateUsingFontParts, updateUsingFontString } = this;

            // We always start with the 'raw' fontString as supplied by the user (or previously calculated by this function if only part of the font definition is changing)
            fontSizeCalculator.style.font = fontString;

            // On initial load `this.fontSize` will be empty or undefined
            if (updateUsingFontString || fontSize == null || !fontSize) {

                this.updateUsingFontString = false;
                const foundSize = fontString.match(FONT_LENGTH_REGEX);

                if (foundSize && foundSize[0]) fontSize = foundSize[0];

                fontSizeCalculator.style.fontSize = fontSize;
                this.fontSize = fontSize
            }

            // We only adjust if a part of the font string has been recently 'set'
            if (updateUsingFontParts) {

                this.updateUsingFontParts = false;
                fontSizeCalculator.style.fontStretch = fontStretch;
                fontSizeCalculator.style.fontStyle = fontStyle;
                fontSizeCalculator.style.fontVariant = fontVariant;
                fontSizeCalculator.style.fontWeight = fontWeight;
                fontSizeCalculator.style.fontSize = fontSize;
            }
            else if (currentScale != 1) fontSizeCalculator.style.fontSize = fontSize;

            // Extract and manipulate data for font weight, variant and style
            let elWeight = fontSizeCalculatorValues.fontWeight,
                elVariant = fontSizeCalculatorValues.fontVariant,
                elStretch = fontSizeCalculatorValues.fontStretch,
                elStyle = fontSizeCalculatorValues.fontStyle;

            // Update elWeight, if required
            if (elWeight == 400) elWeight = NORMAL;

            // Update elVariant, if required
            elVariant = (FONT_VARIANT_VALS.includes(elVariant)) ? elVariant : NORMAL;

            // Update elStyle, if required
            elStyle = (elStyle == ITALIC || elStyle.includes(OBLIQUE)) ? elStyle : NORMAL;

            // elStretch will always be a percent string, which canvas engines refuse to process
            const stretchVal = parseFloat(elStretch);

            if (!_isFinite(stretchVal)) elStretch = NORMAL;
            else {

                if (stretchVal <= 50) elStretch = 'ultra-condensed';
                else if (stretchVal <= 62.5) elStretch = 'extra-condensed';
                else if (stretchVal <= 75) elStretch = 'condensed';
                else if (stretchVal <= 87.5) elStretch = 'semi-condensed';
                else if (stretchVal >= 200) elStretch = 'ultra-expanded';
                else if (stretchVal >= 150) elStretch = 'extra-expanded';
                else if (stretchVal >= 125) elStretch = 'expanded';
                else if (stretchVal >= 112.5) elStretch = 'semi-expanded';
                else elStretch = NORMAL;
            }

            // Extract data for font family and size
            const elSizeString = fontSizeCalculatorValues.fontSize,
                elFamily = fontSizeCalculatorValues.fontFamily,
                elSizeValue = parseFloat(elSizeString);

            // Build the internal `defaultFont` string, and update Label `state` with it
            let f = '';
            if (elStyle == ITALIC || elStyle.includes(OBLIQUE)) f += `${elStyle} `;
            if (elVariant == SMALL_CAPS) f += `${elVariant} `;
            if (elWeight != null && elWeight && elWeight != NORMAL && elWeight != 400) f += `${elWeight} `;
            f += `${elSizeValue * currentScale}px ${elFamily}`

            this.defaultFont = f;
            state.font = f;

            // Rebuild the `fontString` string - attempting to minimise user input error
            f = '';
            if (elStretch != null && elStretch && elStretch != NORMAL) f += `${elStretch} `;
            if (elStyle != null && elStyle && elStyle != NORMAL) f += `${elStyle} `;
            if (elVariant != null && elVariant && elVariant != NORMAL) f += `${elVariant} `;
            if (elWeight != null && elWeight && elWeight != NORMAL && elWeight != 400) f += `${elWeight} `;

            if (fontSize) f += `${fontSize} `;
            else f += `${elSizeValue}px `

            f += `${elFamily}`;
            this.fontString = f;

            // Update `this` attributes
            this.fontStretch = elStretch;
            this.fontStyle = elStyle;
            this.fontVariant = elVariant;
            this.fontWeight = elWeight;

            // Populate state for style, variant, stretch
            state.fontVariantCaps = (FONT_VARIANT_VALS.includes(elVariant)) ? elVariant : NORMAL;
            state.fontStretch = (FONT_STRETCH_VALS.includes(elStretch)) ? elStretch : NORMAL;

            this.measureFont();
        }
    }
};

// `measureFont` - force the entity to recalculate its dimensions without having to set anything.
P.measureFont = function () {

    const { state, letterSpaceValue, wordSpaceValue, currentScale } = this;

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

    // Calculate Label dimensions
    const { actualBoundingBoxLeft, actualBoundingBoxRight, actualBoundingBoxAscent, actualBoundingBoxDescent, fontBoundingBoxAscent, fontBoundingBoxDescent, alphabeticBaseline, hangingBaseline, ideographicBaseline} = this.metrics;

    let fontHeight = fontBoundingBoxAscent + fontBoundingBoxDescent;
    if (!_isFinite(fontHeight)) fontHeight = _ceil(_abs(actualBoundingBoxDescent) + _abs(actualBoundingBoxAscent));

    this.dimensions[0] = _ceil(_abs(actualBoundingBoxLeft) + _abs(actualBoundingBoxRight));
    this.dimensions[1] = fontHeight;

    // Setup text-specific handle offsets
    this.alphabeticBaseline = -alphabeticBaseline;
    this.hangingBaseline = -hangingBaseline;
    this.ideographicBaseline = -ideographicBaseline;

    // Setup font vertical offset
    this.fontVerticalOffset = (_isFinite(fontBoundingBoxAscent) ? fontBoundingBoxAscent : actualBoundingBoxAscent) / currentScale;

    // Clean up; set required dirty flags
    releaseCell(mycell);

    this.calculateText();
};


P.calculateText = function () {

    // The `direction` attribute is also important
    const { isVertical, breakLineOnCharacter, canStyleCharacters } = this;

    // This key decision tree doesn't yet include text along a path!
    if (isVertical) {

        if (breakLineOnCharacter) this.calculateVerticalTextThatBreaksOnCharacter();
        else this.calculateVerticalTextThatBreaksOnSpace();
    }
    else {

        if (breakLineOnCharacter) this.calculateHorizontalTextThatBreaksOnCharacter();
        else {

            if (canStyleCharacters) this.calculateHorizontalTextThatBreaksOnSpaceWithStyling();
            else this.calculateHorizontalTextThatBreaksOnSpace();
        }
    }
    this.dirtyPathObject = true;
    this.dirtyDimensions = true;
};

P.calculateVerticalTextThatBreaksOnCharacter = function () {

    // if `direction == 'ltr` first vertical line is leftmost; otherwise it is rightmost
    // 'justifyLines' is done vertically: 'top/left', 'center', 'bottom/right', 'full'
    // + we dont care about kerning/ligatures
};

P.calculateVerticalTextThatBreaksOnSpace = function () {

    // if `direction == 'ltr` first vertical line is leftmost; otherwise it is rightmost
    // 'justifyLines' is done vertically: 'top/left', 'center', 'bottom/right', 'full'
    // + we dont care about kerning/ligatures
};

P.calculateHorizontalTextThatBreaksOnCharacter = function () {

    // if `direction == 'ltr` we stamp individual characters from the left rightwards
    // + we need to care about kerning, but ligatures will break
};

P.calculateHorizontalTextThatBreaksOnSpace = function () {

    // stamp by word, not character - this is the only solution which will capture ligatures
};

P.calculateHorizontalTextThatBreaksOnSpaceWithStyling = function () {

    // if `direction == 'ltr` we stamp individual characters from the left rightwards
    // + we need to care about kerning, but ligatures will break
};


// `recalculateFont` - force the entity to recalculate its dimensions without having to set anything.
// + Can also be invoked via the entity's Group object's `recalculateFonts` function
// + Can be invoked globally via the `scrawl.recalculateFonts` function
P.recalculateFont = function () {

    this.dirtyFont = true;
};


// #### Clean functions
// `cleanPathObject` - calculate the EnhancedLabel entity's __Path2D object__
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

    const { handle, currentHandle, currentDimensions, mimicked, state, fontVerticalOffset, alphabeticBaseline, hangingBaseline, ideographicBaseline } = this;

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
    else if (!_isFinite(parseFloat(hx))) currentHandle[0] = 0;
    else currentHandle[0] = (parseFloat(hx) / 100) * dx;

    // vertical
    if (hy.toFixed) currentHandle[1] = hy;
    else if (hy == TOP) currentHandle[1] = 0;
    else if (hy == BOTTOM) currentHandle[1] = dy;
    else if (hy == CENTER) currentHandle[1] = dy / 2;
    else if (hy == MIDDLE) currentHandle[1] = dy / 2;
    else if (hy == HANGING) {

        if (_isFinite(hangingBaseline)) currentHandle[1] = hangingBaseline + fontVerticalOffset;
        else currentHandle[1] = 0;
    }
    else if (hy == ALPHABETIC) {

        if (_isFinite(alphabeticBaseline)) currentHandle[1] = alphabeticBaseline + fontVerticalOffset;
        else currentHandle[1] = 0;
    }
    else if (hy == IDEOGRAPHIC) {

        if (_isFinite(ideographicBaseline)) currentHandle[1] = ideographicBaseline + fontVerticalOffset;
        else currentHandle[1] = 0;
    }
    else if (!_isFinite(parseFloat(hy))) currentHandle[1] = 0;
    else currentHandle[1] = (parseFloat(hy) / 100) * dy;

    this.dirtyFilterIdentifier = true;
    this.dirtyStampHandlePositions = true;

    if (mimicked && mimicked.length) this.dirtyMimicHandle = true;
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
        fontVerticalOffset,
    } = this;

    const [, x, y] = pos;
    const [localWidth, localHeight] = currentDimensions;

    const underlineStartY = y + (underlineOffset * localHeight) - fontVerticalOffset;
    const underlineDepth = underlineWidth * currentScale;

    // Setup the cell parts
    const mycell = requestCell();
    const { element: canvasEl, engine      } = host;
    const { element: el,       engine: ctx } = mycell;

    const ratio = getPixelRatio();

    mycell.w = el.width = canvasEl.width / ratio;
    mycell.h = el.height = canvasEl.height / ratio;

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
    ctx.lineCap = ROUND;
    ctx.lineJoin = ROUND;
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

    // if (this.currentFontIsLoaded) {

    //     const engine = host.engine;
    //     const pos = this.stampPositioningHelper();

    //     if (this.includeUnderline) this.underlineEngine(host, pos);

    //     engine.fillText(...pos);

    //     if (this.showBoundingBox) this.drawBoundingBox(host);
    // }

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        const t = pos[0];

        const pouredT = [...pos[0]];
        // const pouredForPrint = [];
        // let pouredPrint = '';

        let x = -280;
        let y = -140;

        for (let i = 0, iz = pouredT.length; i < iz; i++) {

            engine.fillText(pouredT[i], x, y);

            x += 20;
            if (x >= 280) {
                x = -280;
                y += 20;
            }
        }
        // console.log(pos[0].length, t.length, T.length, t, T);
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
// scrawl.makeEnhancedLabel({
//
//     name: 'mylabel-fill',
//
// }).clone({
//
//     name: 'mylabel-draw',
// });
// ```
export const makeEnhancedLabel = function (items) {

    if (!items) return false;
    return new EnhancedLabel(items);
};

constructors.EnhancedLabel = EnhancedLabel;
