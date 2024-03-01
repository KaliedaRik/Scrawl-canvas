// # Label factory
// TODO - document purpose and description


// #### Imports
import { constructors, fontfamilymetadata, fontfamilymetadatanames } from '../core/library.js';
import { getPixelRatio } from '../core/user-interaction.js';

import { addStrings, doCreate, mergeOver, xta, λnull, Ωempty } from '../helper/utilities.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../untracked-factory/text-style.js';
import { currentGroup } from '../factory/canvas.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';
import textMix from '../mixin/text.js';

import { _abs, _ceil, _freeze, _isFinite, _keys, _parse, ALPHABETIC, BLACK, BOTTOM, CENTER, DESTINATION_OUT, END, ENTITY, FONT_LENGTH_REGEX, FONT_VARIANT_VALS, HANGING, IDEOGRAPHIC, ITALIC, LEFT, LTR, MIDDLE, MOUSE, NAME, NORMAL, OBLIQUE, PARTICLE, RIGHT, ROUND, SOURCE_OVER, SMALL_CAPS, SPACE, START, STATE_KEYS, T_LABEL, TOP, UNDEF, ZERO_STR } from '../helper/shared-vars.js';


// #### Label constructor
const Label = function (items = Ωempty) {

    this.entityInit(items);
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

// __text__ - string.
    text: ZERO_STR,

    showBoundingBox: false,
    boundingBoxStyle: BLACK,
    boundingBoxLineWidth: 1,
    boundingBoxLineDash: null,
    boundingBoxLineDashOffset: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.finalizePacketOut = function (copy, items) {

    const defaultTextCopy = _parse(this.defaultTextStyle.saveAsPacket(items))[3];
    const stateCopy = _parse(this.state.saveAsPacket(items))[3];

    copy = mergeOver(copy, {
        direction: defaultTextCopy.direction,
        fillStyle: defaultTextCopy.fillStyle,
        fontKerning: defaultTextCopy.fontKerning,
        fontStretch: defaultTextCopy.fontStretch,
        fontString: defaultTextCopy.fontString,
        fontVariantCaps: defaultTextCopy.fontVariantCaps,
        highlightStyle: defaultTextCopy.highlightStyle,
        includeHighlight: defaultTextCopy.includeHighlight,
        includeUnderline: defaultTextCopy.includeUnderline,
        letterSpacing: defaultTextCopy.letterSpaceValue,
        lineDash: defaultTextCopy.lineDash,
        lineDashOffset: defaultTextCopy.lineDashOffset,
        lineWidth: defaultTextCopy.lineWidth,
        overlineOffset: defaultTextCopy.overlineOffset,
        overlineStyle: defaultTextCopy.overlineStyle,
        overlineWidth: defaultTextCopy.overlineWidth,
        strokeStyle: defaultTextCopy.strokeStyle,
        textRendering: defaultTextCopy.textRendering,
        underlineGap: defaultTextCopy.underlineGap,
        underlineOffset: defaultTextCopy.underlineOffset,
        underlineStyle: defaultTextCopy.underlineStyle,
        underlineWidth: defaultTextCopy.underlineWidth,
        wordSpacing: defaultTextCopy.wordSpaceValue,

        filter: stateCopy.filter,
        font: null,
        globalAlpha: stateCopy.globalAlpha,
        globalCompositeOperation: stateCopy.globalCompositeOperation,
        imageSmoothingEnabled: stateCopy.imageSmoothingEnabled,
        imageSmoothingQuality: stateCopy.imageSmoothingQuality,
        lineCap: ROUND,
        lineJoin: ROUND,
        miterLimit: 10,
        shadowBlur: stateCopy.shadowBlur,
        shadowColor: stateCopy.shadowColor,
        shadowOffsetX: stateCopy.shadowOffsetX,
        shadowOffsetY: stateCopy.shadowOffsetY,
        textAlign: LEFT,
        textBaseline: TOP,
    });

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

// Label-related `get`, `set` and `deltaSet` functions need to take into account the entity State and default TextStyles objects, whose attributes can be retrieved/amended directly on the entity object
const TEXTSTYLE_KEYS = _freeze([ 'canvasFont', 'direction','fillStyle', 'fontFamily', 'fontKerning', 'fontSize', 'fontStretch', 'fontString', 'fontStyle', 'fontVariantCaps', 'fontWeight', 'highlightStyle', 'includeHighlight', 'includeUnderline', 'letterSpaceValue', 'letterSpacing', 'lineDash', 'lineDashOffset', 'lineWidth', 'overlineOffset', 'overlineStyle', 'overlineWidth', 'strokeStyle', 'textRendering', 'underlineGap', 'underlineOffset', 'underlineStyle', 'underlineWidth', 'wordSpaceValue', 'wordSpacing']);

const LABEL_DIRTY_FONT_KEYS = _freeze(['direction', 'fontKerning', 'fontSize', 'fontStretch', 'fontString', 'fontStyle', 'fontVariantCaps', 'fontWeight', 'letterSpaceValue', 'letterSpacing', 'scale', 'textRendering', 'wordSpaceValue', 'wordSpacing']);

const LABEL_UPDATE_PARTS_KEYS = _freeze(['fontFamily', 'fontSize', 'fontStretch', 'fontStyle', 'fontVariantCaps', 'fontWeight']);

const LABEL_UPDATE_FONTSTRING_KEYS = _freeze(['fontString', 'scale']);

const LABEL_UNLOADED_FONT_KEYS = _freeze(['fontString']);

P.get = function (key) {

    const {defs, getters, state, defaultTextStyle} = this;

    const defaultTextStyleGetters = (defaultTextStyle) ? defaultTextStyle.getters : Ωempty;
    const defaultTextStyleDefs = (defaultTextStyle) ? defaultTextStyle.defs : Ωempty;

    const stateGetters = (state) ? state.getters : Ωempty;
    const stateDefs = (state) ? state.defs : Ωempty;

    let fn;

    if (TEXTSTYLE_KEYS.includes(key)) {

        fn = defaultTextStyleGetters[key];

        if (fn) return fn.call(defaultTextStyle);
        else if (typeof defaultTextStyleDefs[key] != UNDEF) return defaultTextStyle[key];
    }
    else if (STATE_KEYS.includes(key)) {

        fn = stateGetters[key];

        if (fn) return fn.call(state);
        else if (typeof stateDefs[key] != UNDEF) return state[key];
    }
    else {

        fn = getters[key];

        if (fn) return fn.call(this);
        else if (typeof defs[key] != UNDEF) return this[key];
    }
    return null;
};

P.set = function (items = Ωempty) {

    const keys = _keys(items),
        len = keys.length;

    if (len) {

        const {defs, setters, state, defaultTextStyle} = this;

        const defaultTextStyleSetters = (defaultTextStyle) ? defaultTextStyle.setters : Ωempty;
        const defaultTextStyleDefs = (defaultTextStyle) ? defaultTextStyle.defs : Ωempty;

        const stateSetters = (state) ? state.setters : Ωempty;
        const stateDefs = (state) ? state.defs : Ωempty;

        let fn, i, key, val;

        for (i = 0; i < len; i++) {

            key = keys[i];
            val = items[key];

            if (key && key != NAME && val != null) {

                if (TEXTSTYLE_KEYS.includes(key)) {

                    fn = defaultTextStyleSetters[key];

                    if (fn) fn.call(defaultTextStyle, val);
                    else if (typeof defaultTextStyleDefs[key] != UNDEF) defaultTextStyle[key] = val;
                }
                else if (STATE_KEYS.includes(key)) {

                    fn = stateSetters[key];

                    if (fn) fn.call(state, val);
                    else if (typeof stateDefs[key] != UNDEF) state[key] = val;
                }
                else {

                    fn = setters[key];

                    if (fn) fn.call(this, val);
                    else if (typeof defs[key] != UNDEF) this[key] = val;
                }

                if (LABEL_DIRTY_FONT_KEYS.includes(key)) this.dirtyFont = true;
                if (LABEL_UPDATE_PARTS_KEYS.includes(key)) this.updateUsingFontParts = true;
                if (LABEL_UPDATE_FONTSTRING_KEYS.includes(key)) this.updateUsingFontString = true;
                if (LABEL_UNLOADED_FONT_KEYS.includes(key)) this.currentFontIsLoaded = false;
            }
        }
    }
    return this;
};

P.setDelta = function (items = Ωempty) {

    const keys = _keys(items),
        len = keys.length;

    if (len) {

        const {defs, deltaSetters:setters, state, defaultTextStyle} = this;

        const defaultTextStyleSetters = (defaultTextStyle) ? defaultTextStyle.deltaSetters : Ωempty;
        const defaultTextStyleDefs = (defaultTextStyle) ? defaultTextStyle.defs : Ωempty;

        const stateSetters = (state) ? state.deltaSetters : Ωempty;
        const stateDefs = (state) ? state.defs : Ωempty;

        let fn, i, key, val;

        for (i = 0; i < len; i++) {

            key = keys[i];
            val = items[key];

            if (key && key != NAME && val != null) {

                if (TEXTSTYLE_KEYS.includes(key)) {

                    fn = defaultTextStyleSetters[key];

                    if (fn) fn.call(state, val);
                    else if (typeof defaultTextStyleDefs[key] != UNDEF) defaultTextStyle[key] = addStrings(defaultTextStyle[key], val);
                }
                else if (STATE_KEYS.includes(key)) {

                    fn = stateSetters[key];

                    if (fn) fn.call(state, val);
                    else if (typeof stateDefs[key] != UNDEF) state[key] = addStrings(state[key], val);
                }
                else {

                    fn = setters[key];

                    if (fn) fn.call(this, val);
                    else if (typeof defs[key] != UNDEF) this[key] = addStrings(this[key], val);
                }

                if (LABEL_DIRTY_FONT_KEYS.includes(key)) this.dirtyFont = true;
                if (LABEL_UPDATE_PARTS_KEYS.includes(key)) this.updateUsingFontParts = true;
                if (LABEL_UPDATE_FONTSTRING_KEYS.includes(key)) this.updateUsingFontString = true;
                if (LABEL_UNLOADED_FONT_KEYS.includes(key)) this.currentFontIsLoaded = false;
            }
        }
    }
    return this;
};

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

G.rawText = function () {

    return this.rawText;
};
S.text = function (item) {

    this.rawText = (item.substring) ? item : item.toString();
    this.text = this.convertTextEntityCharacters(this.rawText);

    this.dirtyFont = true;
    this.currentFontIsLoaded = false;
};



// #### Prototype functions

// `entityInit` - overwrites the mixin/entity.js function
P.entityInit = function (items = Ωempty) {

    this.modifyConstructorInputForAnchorButton(items);

    this.makeName(items.name);
    this.register();
    this.initializePositions();

    this.state = makeState(Ωempty);

    this.defaultTextStyle = makeTextStyle({
        name: `${this.name}_default-textstyle`,
        isDefaultTextStyle: true,
    });

    this.set(this.defs);

    if (!items.group) items.group = currentGroup;

    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    this.currentFontIsLoaded = false;
    this.updateUsingFontParts = false;
    this.updateUsingFontString = false;
    this.letterSpaceValue = 0;
    this.wordSpaceValue = 0;

    this.delta = {};

    this.set(items);

    this.midInitActions(items);

    if (this.purge) this.purgeArtefact(this.purge);

    this.dirtyFont = true;
    this.currentFontIsLoaded = false;
};


// `recalculateFont` - force the entity to recalculate its dimensions without having to set anything.
// + Can also be invoked via the entity's Group object's `recalculateFonts` function
// + Can be invoked globally via the `scrawl.recalculateFonts` function
P.recalculateFont = function () {

    this.dirtyFont = true;
};


// `temperFont` - manipulate the user-supplied font string to create a font string the canvas engine can use
P.temperFont = function () {

    const { group, defaultTextStyle } = this;

    if (xta(group, defaultTextStyle)) {

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

            this.updateTextStyle(defaultTextStyle, fontSizeCalculator, fontSizeCalculatorValues);
        }
    }
};


// `measureFont` - generate basic font metadata
P.measureFont = function () {

    const { defaultTextStyle, currentScale, dimensions } = this;
    const { fontFamily, fontSizeValue, letterSpaceValue, wordSpaceValue } = defaultTextStyle;

    defaultTextStyle.letterSpacing = `${letterSpaceValue * currentScale}px`;
    defaultTextStyle.wordSpacing = `${wordSpaceValue * currentScale}px`;

    const mycell = requestCell();
    const engine = mycell.engine;

    engine.font = defaultTextStyle.canvasFont;
    engine.fontKerning = defaultTextStyle.fontKerning;
    engine.fontStretch = defaultTextStyle.fontStretch;
    engine.fontVariantCaps = defaultTextStyle.fontVariantCaps;
    engine.textRendering = defaultTextStyle.textRendering;
    engine.letterSpacing = defaultTextStyle.letterSpacing;
    engine.wordSpacing = defaultTextStyle.wordSpacing;
    engine.direction = defaultTextStyle.direction;
    engine.textAlign = LEFT;
    engine.textBaseline = TOP;

    const metrics = engine.measureText(this.text);

    releaseCell(mycell);

    const { actualBoundingBoxLeft, actualBoundingBoxRight } = metrics;

    const meta = this.getFontMetadata(fontFamily);

    const ratio = fontSizeValue / 100;

    if (dimensions) {

        dimensions[0] = _ceil(_abs(actualBoundingBoxLeft) + _abs(actualBoundingBoxRight));
        dimensions[1] = meta.height * ratio * currentScale;
    }

    const offset = meta.verticalOffset * ratio;

    this.alphabeticBaseline = ((meta.alphabeticBaseline * ratio) + offset) * currentScale;
    this.hangingBaseline = ((meta.hangingBaseline * ratio) + offset) * currentScale;
    this.ideographicBaseline = ((meta.ideographicBaseline * ratio) + offset) * currentScale;
    this.fontVerticalOffset = offset;

    this.dirtyPathObject = true;
    this.dirtyDimensions = true;
};


// `getFontMetadata` - generate basic font metadata
P.getFontMetadata = function (fontFamily) {

    if (fontFamily) {

        const font = `100px ${fontFamily}`;

        if (fontfamilymetadatanames.includes(font)) return fontfamilymetadata[font];

        const mycell = requestCell();
        const engine = mycell.engine;

        engine.font = font;
        engine.textBaseline = TOP;


        const metrics = engine.measureText(SPACE);

        const { actualBoundingBoxAscent, actualBoundingBoxDescent, fontBoundingBoxAscent, fontBoundingBoxDescent, alphabeticBaseline, hangingBaseline, ideographicBaseline} = metrics;

        let height = fontBoundingBoxAscent + fontBoundingBoxDescent;
        if (!_isFinite(height)) height = _ceil(_abs(actualBoundingBoxDescent) + _abs(actualBoundingBoxAscent));

        fontfamilymetadatanames.push(font);
        fontfamilymetadata[font] = {
            height,
            alphabeticBaseline: -alphabeticBaseline,
            hangingBaseline: -hangingBaseline,
            ideographicBaseline: -ideographicBaseline,
            verticalOffset: _isFinite(fontBoundingBoxAscent) ? fontBoundingBoxAscent : actualBoundingBoxAscent,
        }

        releaseCell(mycell);

        return fontfamilymetadata[font];
    }
};


// `updateTextStyle` - manipulate the user-supplied font string to create a font string the canvas engine can use
P.updateTextStyle = function (textStyle, calculator, results) {

// console.log(this.name, 'P.updateTextStyle (in label mixin)')

    let fontSize = textStyle.fontSize;
    const { fontStretch, fontStyle, fontWeight, fontVariantCaps, fontString } = textStyle;
    const { currentScale, lineSpacing, updateUsingFontParts, updateUsingFontString } = this;

    // We always start with the 'raw' fontString as supplied by the user (or previously calculated by this function if only part of the font definition is changing)
    calculator.style.font = fontString;

    const elFamily = results.fontFamily;
    this.getFontMetadata(elFamily);

    // On initial load `this.fontSize` will be empty or undefined
    if (updateUsingFontString || fontSize == null || !fontSize) {

        this.updateUsingFontString = false;
        const foundSize = fontString.match(FONT_LENGTH_REGEX);

        if (foundSize && foundSize[0]) fontSize = foundSize[0];

        calculator.style.fontSize = fontSize;
        textStyle.fontSize = results.fontSize;
    }

    // We only adjust if a part of the font string has been recently 'set'
    if (updateUsingFontParts) {

        this.updateUsingFontParts = false;
        calculator.style.fontStretch = fontStretch;
        calculator.style.fontStyle = fontStyle;
        calculator.style.fontVariantCaps = fontVariantCaps;
        calculator.style.fontWeight = fontWeight;
        calculator.style.fontSize = fontSize;
    }
    else if (currentScale != 1) calculator.style.fontSize = fontSize;

    // Extract and manipulate data for font weight, variant and style
    const elWeight = results.fontWeight,
        elStretch = textStyle.fontStretchHelper(results.fontStretch);

    let elVariant = results.fontVariantCaps,
        elStyle = results.fontStyle;

    // Update elVariant, if required
    elVariant = (FONT_VARIANT_VALS.includes(elVariant)) ? elVariant : NORMAL;

    // Update elStyle, if required
    elStyle = (elStyle == ITALIC || elStyle.includes(OBLIQUE)) ? elStyle : NORMAL;

    // Extract data for font size
    const elSizeString = results.fontSize,
        elSizeValue = parseFloat(elSizeString);

    textStyle.fontSizeValue = elSizeValue;

    // Work specifically for EnhancedLabel entitys, but performed here for efficiency
    if (lineSpacing != null && fontString.includes('/')) {

        const lh = parseFloat(results.lineHeight);
        this.lineSpacing = (_isFinite(lh)) ? lh / elSizeValue : this.defs.lineSpacing;
    }

    // Update `textStyle` attributes
    textStyle.fontStretch = elStretch;
    textStyle.fontStyle = elStyle;
    textStyle.fontVariantCaps = elVariant;
    textStyle.fontWeight = elWeight;
    textStyle.fontFamily = elFamily;

    // Rebuild font strings
    this.updateCanvasFont(textStyle);
    this.updateFontString(textStyle);
};

P.updateCanvasFont = function (style) {

    const scale = this.currentScale

    const { fontStyle, fontVariantCaps, fontWeight, fontSizeValue, fontFamily } = style

    let f = '';

    if (fontStyle == ITALIC || fontStyle.includes(OBLIQUE)) f += `${fontStyle} `;
    if (fontVariantCaps == SMALL_CAPS) f += `${fontVariantCaps} `;
    if (fontWeight != null && fontWeight && fontWeight !== NORMAL && fontWeight !== '400') f += `${fontWeight} `;
    f += `${fontSizeValue * scale}px ${fontFamily}`

    style.canvasFont = f;
};

P.updateFontString = function (style) {

    const { fontStretch, fontStyle, fontVariantCaps, fontWeight, fontSize, fontSizeValue, fontFamily } = style

    let f = '';

    if (fontStretch != null && fontStretch && fontStretch !== NORMAL) f += `${fontStretch} `;
    if (fontStyle != null && fontStyle && fontStyle !== NORMAL) f += `${fontStyle} `;
    if (fontVariantCaps != null && fontVariantCaps && fontVariantCaps !== NORMAL) f += `${fontVariantCaps} `;
    if (fontWeight != null && fontWeight && fontWeight !== NORMAL && fontWeight !== '400') f += `${fontWeight} `;

    if (fontSize) f += `${fontSize} `;
    else f += `${fontSizeValue}px `

    f += `${fontFamily}`;

    style.fontString = f;
};

P.cleanFont = function () {

    if (this.currentFontIsLoaded) {

        this.dirtyFont = false;

        this.temperFont();

        if (!this.dirtyFont) this.measureFont();
    }
    else this.checkFontIsLoaded(this.defaultTextStyle.fontString);
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

    if (oldW !== curDims[0] || oldH !== curDims[1]) this.dirtyPositionSubscribers = true;

    if (this.mimicked && this.mimicked.length) this.dirtyMimicDimensions = true;

    this.dirtyFilterIdentifier = true;
};

P.cleanHandle = function () {

    this.dirtyHandle = false;

    const { handle, currentHandle, currentDimensions, mimicked, defaultTextStyle, alphabeticBaseline, hangingBaseline, ideographicBaseline } = this;
    // const { handle, currentHandle, currentDimensions, mimicked, defaultTextStyle } = this;

    const [hx, hy] = handle;
    const [dx, dy] = currentDimensions;
    const direction = defaultTextStyle.direction || LTR;

    // horizontal
    if (hx.toFixed) currentHandle[0] = hx;
    else if (hx === LEFT) currentHandle[0] = 0;
    else if (hx === RIGHT) currentHandle[0] = dx;
    else if (hx === CENTER) currentHandle[0] = dx / 2;
    else if (hx === START) currentHandle[0] = (direction === LTR) ? 0 : dx;
    else if (hx === END) currentHandle[0] = (direction === LTR) ? dx : 0;
    else if (!_isFinite(parseFloat(hx))) currentHandle[0] = 0;
    else currentHandle[0] = (parseFloat(hx) / 100) * dx;

    // vertical
    if (hy.toFixed) currentHandle[1] = hy;
    else if (hy === TOP) currentHandle[1] = 0;
    else if (hy === BOTTOM) currentHandle[1] = dy;
    else if (hy === CENTER) currentHandle[1] = dy / 2;
    else if (hy === MIDDLE) currentHandle[1] = dy / 2;
    else if (hy === HANGING) currentHandle[1] = (_isFinite(hangingBaseline)) ? hangingBaseline : 0;
    else if (hy === ALPHABETIC) currentHandle[1] = (_isFinite(alphabeticBaseline)) ? alphabeticBaseline : 0;
    else if (hy === IDEOGRAPHIC) currentHandle[1] = (_isFinite(ideographicBaseline)) ? ideographicBaseline : 0;
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
    if (this.dirtyFont) this.cleanFont();
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
        if (!this.noCanvasEngineUpdates) {

            this.state.set(this.defaultTextStyle);
            dest.setEngine(this);
        }

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

// `underlineEngine` - internal helper function
P.underlineEngine = function (host, pos) {

    // Setup constants
    const {
        currentDimensions,
        currentScale,
        currentStampPosition,
        defaultTextStyle,
        fontVerticalOffset,
    } = this;

    const {
        underlineGap,
        underlineOffset,
        underlineStyle,
        underlineWidth,
    } = defaultTextStyle;

    const [, x, y] = pos;
    const [localWidth, localHeight] = currentDimensions;

    const underlineStartY = y + (underlineOffset * localHeight) - fontVerticalOffset * currentScale;
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
    ctx.font = defaultTextStyle.canvasFont;
    ctx.fontKerning = defaultTextStyle.fontKerning;
    ctx.fontStretch = defaultTextStyle.fontStretch;
    ctx.fontVariantCaps = defaultTextStyle.fontVariant;
    ctx.textRendering = defaultTextStyle.textRendering;
    ctx.letterSpacing = defaultTextStyle.letterSpacing;
    ctx.lineCap = ROUND;
    ctx.lineJoin = ROUND;
    ctx.wordSpacing = defaultTextStyle.wordSpacing;
    ctx.direction = defaultTextStyle.direction;
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

// `drawBoundingBox` - internal helper function called by `method` functions
P.drawBoundingBox = function (host) {

    if (this.pathObject) {

        const uStroke = this.getStyle(this.boundingBoxStyle, 'fillStyle', host);
        const engine = host.engine;

        engine.save();
        engine.strokeStyle = uStroke;
        engine.lineWidth = this.boundingBoxLineWidth;
        engine.setLineDash(this.boundingBoxLineDash || []);
        engine.lineDashOffset = this.boundingBoxLineDashOffset || 0;
        engine.globalCompositeOperation = SOURCE_OVER;
        engine.globalAlpha = 1;
        engine.shadowOffsetX = 0;
        engine.shadowOffsetY = 0;
        engine.shadowBlur = 0;
        engine.stroke(this.pathObject);
        engine.restore();
    }
};


// `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
P.draw = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        if (this?.defaultTextStyle.includeUnderline) this.underlineEngine(host, pos);

        engine.strokeText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(host);
    }
};

// `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
P.fill = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        if (this?.defaultTextStyle.includeUnderline) this.underlineEngine(host, pos);

        engine.fillText(...pos);

        if (this.showBoundingBox) this.drawBoundingBox(host);
    }
};

// `drawAndFill` - stamp the entity stroke, then fill, then remove shadow and repeat
P.drawAndFill = function (host) {

    if (this.currentFontIsLoaded) {

        const engine = host.engine;
        const pos = this.stampPositioningHelper();

        if (this?.defaultTextStyle.includeUnderline) this.underlineEngine(host, pos);

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

        if (this?.defaultTextStyle.includeUnderline) this.underlineEngine(host, pos);

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

        if (this?.defaultTextStyle.includeUnderline) this.underlineEngine(host, pos);

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

        if (this?.defaultTextStyle.includeUnderline) this.underlineEngine(host, pos);

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
