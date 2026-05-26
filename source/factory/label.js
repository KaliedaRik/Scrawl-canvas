// # Label factory
// TODO - document purpose and description


// #### Imports
import { constructors, styles, stylesnames } from '../core/library.js';

import { doCreate, generateIdForArtefact, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../untracked-factory/text-style.js';
import { currentGroup } from '../factory/canvas.js';

import { checkForWorkstoreItem, getWorkstoreItem } from '../helper/workstore.js';
import { gradientEngine } from '../helper/gradient-engine.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';
import textMix from '../mixin/text.js';

// Shared constants
import { _abs, _ceil, _isArray, _isFinite, ALPHABETIC, BLACK, BOTTOM, CENTER, DESTINATION_OUT, END, ENTITY, FILL, GRADIENTS_ARR, HANGING, IDEOGRAPHIC, LEFT, LTR, MIDDLE, MOUSE, PARTICLE, RIGHT, ROUND, SOURCE_OUT, SOURCE_OVER, START, T_COLOR, T_LABEL, TOP, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const METHODS_USING_DRAW_FIRST = ['drawAndFill', 'drawThenFill'],
    METHODS_USING_DRAW_LAST = ['draw', 'fillAndDraw', 'fillThenDraw'],
    DRAW = 'draw';


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

    useTextStyleForUnderline: false,
    useTextStyleForBoundingBox: false,
    useTextStyleForOutline: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet management functionality required


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

S.showBoundingBox = function (item) {

    this.showBoundingBox = !!item;
    this.dirtyFillGradientCache = true;
};

S.boundingBoxStyle = function (item) {

    this.boundingBoxStyle = item;
    this.dirtyFillGradientCache = true;
};

S.boundingBoxLineWidth = function (item) {

    if (_isFinite(item)) {

        this.boundingBoxLineWidth = item;
        this.dirtyFillGradientCache = true;
    }
};

D.boundingBoxLineWidth = function (item) {

    if (_isFinite(item)) {

        this.boundingBoxLineWidth += item;
        this.dirtyFillGradientCache = true;
    }
};

S.boundingBoxLineDash = function (item) {

    if (_isArray(item)) {

        this.boundingBoxLineDash = item;
        this.dirtyFillGradientCache = true;
    }
};

S.boundingBoxLineDashOffset = function (item) {

    if (_isFinite(item)) {

        this.boundingBoxLineDashOffset = item;
        this.dirtyFillGradientCache = true;
    }
};

D.boundingBoxLineDashOffset = function (item) {

    if (_isFinite(item)) {

        this.boundingBoxLineDashOffset += item;
        this.dirtyFillGradientCache = true;
    }
};

S.useTextStyleForUnderline = function (item) {

    this.useTextStyleForUnderline = !!item;
    this.dirtyFillGradientCache = true;
};

S.useTextStyleForBoundingBox = function (item) {

    this.useTextStyleForBoundingBox = !!item;
    this.dirtyFillGradientCache = true;
};

S.useTextStyleForOutline = function (item) {

    this.useTextStyleForOutline = !!item;
    this.dirtyFillGradientCache = true;
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

    this.filters = [];
    this.currentFilters = [];
    this.dirtyFilters = false;
    this.dirtyFiltersCache = false;
    this.dirtyImageSubscribers = false;

    this.accessibleTextHold = null;
    this.accessibleTextHoldAttached = null;

    this.set(this.defs);

    if (!items.group) items.group = currentGroup;

    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    this.currentFontIsLoaded = false;
    this.updateUsingFontParts = false;
    this.updateUsingFontString = false;
    this.usingViewportFontSizing = true;
    this.letterSpaceValue = 0;
    this.wordSpaceValue = 0;

    this.alphabeticBaseline = 0;
    this.hangingBaseline = 0;
    this.ideographicBaseline = 0;
    this.fontVerticalOffset = 0;

    this.delta = {};

    this.set(items);

    this.midInitActions(items);

    this.dirtyFont = true;
    this.currentFontIsLoaded = false;
};


// `measureFont` - gather font metadata (uses `getFontMetadata` from text mixin)
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

    // If spacing is active, compute width manually (fallback)
    let width = _ceil(_abs(actualBoundingBoxLeft) + _abs(actualBoundingBoxRight));

    if ((letterSpaceValue !== 0 || wordSpaceValue !== 0) && this.text) {

        const cell2 = requestCell();
        const ctx = cell2.engine;

        ctx.font = defaultTextStyle.canvasFont;
        ctx.textAlign = LEFT;
        ctx.textBaseline = TOP;

        let total = 0;

        const t = this.text;

        for (let i = 0; i < t.length; i++) {

            const ch = t[i];
            total += ctx.measureText(ch).width;
            if (i < t.length - 1) total += (letterSpaceValue + (ch === ' ' ? wordSpaceValue : 0)) * currentScale;
        }
        width = _ceil(total);
        releaseCell(cell2);
    }

    if (dimensions) {

        dimensions[0] = width;
        dimensions[1] = meta.height * ratio * currentScale;
    }

    const offset = meta.verticalOffset * ratio;

    this.alphabeticBaseline = ((meta.alphabeticBaseline * ratio) + offset) * currentScale;
    this.hangingBaseline = ((meta.hangingBaseline * ratio) + offset) * currentScale;
    this.ideographicBaseline = ((meta.ideographicBaseline * ratio) + offset) * currentScale;
    this.fontVerticalOffset = offset;

    this.dirtyPathObject = true;
    this.dirtyDimensions = true;

    // Tacky fix for making the dimensions update
    this.set({ letterSpacing: defaultTextStyle.letterSpacing });
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

// Overwrites the function in mixin/entity.js
P.setGradientCacheFlags = function () {

    let fillGradient;

    if (this.state) {

        const fillStyle = this.state.fillStyle;

        fillGradient = fillStyle.substring ? styles[fillStyle] : fillStyle;
    }

    this.useFillGradientCache = (fillGradient && GRADIENTS_ARR.includes(fillGradient.type));

    this.useDrawGradientCache = false;
};


// #### Display cycle functions
P.prepareStamp = function() {

    if (this.dirtyHost) this.dirtyHost = false;

    this.setGradientCacheFlags();

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) {

        this.dirtyPathObject = true;

        if (this.useFillGradientCache) this.dirtyFillGradientCache = true;
    }

    if (this.dirtyRotation) {

        if (this.useFillGradientCache) this.dirtyFillGradientCache = true;
    }

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

    if (this.dirtyStampPositions || this.dirtyStampHandlePositions) {

        if (this.useFillGradientCache) this.dirtyFillGradientCache = true;
    }

    if (this.dirtyStampPositions) this.cleanStampPositions();
    if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();
    if (this.dirtyPathObject) this.cleanPathObject();
    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();

    this.prepareStampTabsHelper();
};


// ##### Stamp methods
// `regularStamp` - overwrites mixin/entity.js function.
P.regularStamp = function () {

    const dest = this.currentHost,
        textStyle = this.defaultTextStyle;

    if (dest && textStyle && this.currentFontIsLoaded) {

        const engine = dest.engine;
        const [x, y] = this.currentStampPosition;

        dest.rotateDestination(engine, x, y, this);

        if (!this.noCanvasEngineUpdates) {

            this.state.set(textStyle);
            dest.setEngine(this);
        }

        if (this.useFillGradientCache) this.updateGradientsBeforeStamp(dest);

        this.setImageSmoothing(engine);

        const pos = this.stampPositioningHelper();

        if (this.useFillGradientCache) this.stampLabelGradientFill(dest);
        else this.stampLabelDirect(engine, pos);

        this.postProcessLabelDecorations(dest, pos);
    }
};

P.updateGradientsBeforeStamp = function (refCell) {

    if (!this.useFillGradientCache) return;

    const getFixedGradientData = this.getFixedGradientData.bind(this);

    const state = this.state;

    const grad = (state.fillStyle.substring)
        ? styles[state.fillStyle]
        : state.fillStyle;

    if (!grad || !GRADIENTS_ARR.includes(grad.type)) return;

    let fillId = this.identifierFillGradientCache;

    if (this.dirtyFillGradient || this.dirtyFillGradientCache || fillId === ZERO_STR) fillId = generateIdForArtefact(this);

    if (!fillId) return;

    if (checkForWorkstoreItem(fillId)) return;

    const myCell = requestCell(),
        element = myCell.element,
        engine = myCell.engine;

    const [width, height] = refCell.get('dimensions');
    const [x, y] = this.currentStampPosition;
    const matrix = refCell.engine.getTransform();

    element.width = width;
    element.height = height;

    myCell.rotateDestination(engine, x, y, this);
    myCell.setEngine(this);
    this.setLabelTextEngine(engine);

    // Gradients don't understand the quirks of Label entity scaling
    const tempScale = this.currentScale;
    this.currentScale = 1;
    grad.getData(this, refCell, FILL);
    this.currentScale = tempScale;

    this.setImageSmoothing(engine);

    const pos = this.stampPositioningHelper();

    engine.fillText(...pos);

    if (this.useTextStyleForOutline) engine.strokeText(...pos);

    if (this.defaultTextStyle && this.defaultTextStyle.includeUnderline && this.useTextStyleForUnderline) {

        this.addUnderlineToGradientMask(myCell, pos, matrix);
    }

    if (this.showBoundingBox && this.useTextStyleForBoundingBox && this.pathObject) {

        engine.save();
        engine.lineWidth = this.boundingBoxLineWidth;
        engine.setLineDash(this.boundingBoxLineDash || []);
        engine.lineDashOffset = this.boundingBoxLineDashOffset || 0;
        engine.stroke(this.pathObject);
        engine.restore();
    }

    const data = engine.getImageData(0, 0, width, height);

    // Sadly, the gradient engine doesn't understand the quirks of Label entity scaling either
    this.currentScale = 1;

    const success = gradientEngine.action({
        fixedGradientData: getFixedGradientData(grad, FILL),
        identifier: fillId,
        imageData: data,
        entity: this,
        matrix,
    });
    this.currentScale = tempScale;

    if (success) {

        this.identifierFillGradientCache = fillId;
        this.dirtyFillGradient = false;
        this.dirtyFillGradientCache = false;
        this.dirtyFilterIdentifier = true;
    }
    else this.dirtyFillGradientCache = true;

    releaseCell(myCell);
};

P.setLabelTextEngine = function (engine) {

    const textStyle = this.defaultTextStyle;

    engine.font = textStyle.canvasFont;
    engine.fontKerning = textStyle.fontKerning;
    engine.fontStretch = textStyle.fontStretch;
    engine.fontVariantCaps = textStyle.fontVariantCaps;
    engine.textRendering = textStyle.textRendering;
    engine.letterSpacing = textStyle.letterSpacing;
    engine.wordSpacing = textStyle.wordSpacing;
    engine.direction = textStyle.direction;
    engine.textAlign = LEFT;
    engine.textBaseline = TOP;

    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;
    engine.fillStyle = BLACK;
    engine.strokeStyle = BLACK;
};

P.stampLabelDirect = function (engine, pos) {

    const method = this.defaultTextStyle.method,
        complexFill = this.useFillGradientCache,
        textFillColor = this.getLabelTextFillColor();

    if (
        (!complexFill || !this.useTextStyleForOutline) &&
        this.methodDrawsOutlineBeforeFill(method)
    ) {
        this.drawLabelOutline(
            engine,
            pos,
            this.useTextStyleForOutline ? textFillColor : null
        );
    }

    if (method !== DRAW) {

        engine.fillStyle = textFillColor;
        engine.fillText(...pos);
    }
};

P.stampLabelGradientFill = function (host) {

    const identifier = this.identifierFillGradientCache;

    if (!identifier) return;

    const data = getWorkstoreItem(identifier);

    if (data && data.w && data.h && data.imageData) {

        const { x, y, w, h, imageData } = data;

        const myCell = requestCell();

        const {
            element,
            engine,
        } = myCell;

        element.width = w;
        element.height = h;

        engine.putImageData(imageData, 0, 0);

        const hostEngine = host.engine;

        hostEngine.save();
        hostEngine.resetTransform();
        hostEngine.drawImage(element, x, y);
        hostEngine.restore();

        releaseCell(myCell);
    }
};

P.addUnderlineToGradientMask = function (targetCell, pos) {

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
        underlineWidth,
    } = defaultTextStyle;

    const [, x, y] = pos;
    const [localWidth, localHeight] = currentDimensions;

    const underlineStartY = y + (underlineOffset * localHeight) - fontVerticalOffset * currentScale;
    const underlineDepth = underlineWidth * currentScale;

    const {
        element: targetElement,
        engine: targetEngine,
    } = targetCell;

    const mycell = requestCell(targetElement.width, targetElement.height);

    const {
        element,
        engine,
    } = mycell;

    element.width = targetElement.width;
    element.height = targetElement.height;

    mycell.rotateDestination(engine, ...currentStampPosition, this);

    engine.fillStyle = BLACK;
    engine.strokeStyle = BLACK;
    engine.font = defaultTextStyle.canvasFont;
    engine.fontKerning = defaultTextStyle.fontKerning;
    engine.fontStretch = defaultTextStyle.fontStretch;
    engine.fontVariantCaps = defaultTextStyle.fontVariantCaps;
    engine.textRendering = defaultTextStyle.textRendering;
    engine.letterSpacing = defaultTextStyle.letterSpacing;
    engine.lineCap = ROUND;
    engine.lineJoin = ROUND;
    engine.wordSpacing = defaultTextStyle.wordSpacing;
    engine.direction = defaultTextStyle.direction;
    engine.textAlign = LEFT;
    engine.textBaseline = TOP;
    engine.lineWidth = (underlineGap * 2) * currentScale;

    this.setImageSmoothing(engine);

    engine.strokeText(...pos);
    engine.fillText(...pos);

    engine.globalCompositeOperation = SOURCE_OUT;
    engine.fillRect(x, underlineStartY, localWidth, underlineDepth);

    targetEngine.save();
    targetEngine.resetTransform();
    targetEngine.globalCompositeOperation = SOURCE_OVER;
    targetEngine.drawImage(element, 0, 0);
    targetEngine.restore();

    releaseCell(mycell);
};

// `stampPositioningHelper` - internal helper function
P.stampPositioningHelper = function () {

    const { currentHandle, currentScale, text, fontVerticalOffset } = this;
    const x = -currentHandle[0],
        y = -currentHandle[1] + fontVerticalOffset * currentScale;

    return [text, x, y];
}

// Overwrite stamp functions from mixin/entity.js
P.draw = function (host) {

    const pos = this.stampPositioningHelper();
    this.postProcessLabelDecorations(host, pos);
};

P.fill = function (host) {

    this.stampLabelDirect(host.engine, this.stampPositioningHelper());
};

P.drawAndFill = P.fill;
P.fillAndDraw = P.fill;
P.drawThenFill = P.fill;
P.fillThenDraw = P.fill;

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
P.none = λnull;

P.postProcessLabelDecorations = function (host, pos) {

    if (!this.currentFontIsLoaded) return;

    const engine = host.engine,
        textStyle = this.defaultTextStyle,
        complexFill = this.useFillGradientCache,
        textFillColor = this.getLabelTextFillColor();

    if (!engine || !textStyle) return;

    if (
        (!complexFill || !this.useTextStyleForOutline) &&
        this.methodDrawsOutlineAfterFill(textStyle.method)
    ) {
        this.drawLabelOutline(
            engine,
            pos,
            this.useTextStyleForOutline ? textFillColor : null
        );
    }

    if (
        textStyle.includeUnderline &&
        (!complexFill || !this.useTextStyleForUnderline)
    ) {
        this.underlineEngine(
            host,
            pos,
            this.useTextStyleForUnderline ? textFillColor : null
        );
    }

    if (
        this.showBoundingBox &&
        (!complexFill || !this.useTextStyleForBoundingBox)
    ) {
        this.drawBoundingBox(
            host,
            this.useTextStyleForBoundingBox ? textFillColor : null
        );
    }
};

P.getLabelTextFillColor = function () {

    return this.getLabelColorOnlyStyle(this.state.fillStyle);
};

P.methodDrawsOutlineBeforeFill = function (method) {

    return METHODS_USING_DRAW_FIRST.includes(method);
};

P.methodDrawsOutlineAfterFill = function (method) {

    return METHODS_USING_DRAW_LAST.includes(method);
};

P.drawLabelOutline = function (engine, pos, style = null) {

    if (this.state) {

        engine.save();

        engine.strokeStyle = style || this.getLabelColorOnlyStyle(this.state.strokeStyle);
        engine.fillStyle = this.getLabelTextFillColor();

        engine.shadowOffsetX = 0;
        engine.shadowOffsetY = 0;
        engine.shadowBlur = 0;

        this.setImageSmoothing(engine);

        engine.strokeText(...pos);
        engine.restore();
    }
};

P.getLabelColorOnlyStyle = function (item, fallback = BLACK) {

    if (!item) return fallback;

    if (item.substring) {

        if (stylesnames.includes(item)) {

            const obj = styles[item];

            if (obj && obj.type === T_COLOR) return obj.get('color');

            return fallback;
        }
        return item;
    }

    if (item.name && item.type && item.type === T_COLOR) return item.get();

    return fallback;
};

// `underlineEngine` - internal helper function
P.underlineEngine = function (host, pos, style = null) {

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

    const { element, engine } = host;

    const mycell = requestCell(element.width, element.height);

    const {
        element: underlineElement,
        engine: underlineEngine,
    } = mycell;

    mycell.rotateDestination(underlineEngine, ...currentStampPosition, this);

    underlineEngine.fillStyle = BLACK;
    underlineEngine.strokeStyle = BLACK;
    underlineEngine.font = defaultTextStyle.canvasFont;
    underlineEngine.fontKerning = defaultTextStyle.fontKerning;
    underlineEngine.fontStretch = defaultTextStyle.fontStretch;
    underlineEngine.fontVariantCaps = defaultTextStyle.fontVariantCaps;
    underlineEngine.textRendering = defaultTextStyle.textRendering;
    underlineEngine.letterSpacing = defaultTextStyle.letterSpacing;
    underlineEngine.lineCap = ROUND;
    underlineEngine.lineJoin = ROUND;
    underlineEngine.wordSpacing = defaultTextStyle.wordSpacing;
    underlineEngine.direction = defaultTextStyle.direction;
    underlineEngine.textAlign = LEFT;
    underlineEngine.textBaseline = TOP;
    underlineEngine.lineWidth = (underlineGap * 2) * currentScale;

    this.setImageSmoothing(underlineEngine);

    const uStyle = style || this.getLabelColorOnlyStyle(underlineStyle);

    underlineEngine.strokeText(...pos);
    underlineEngine.fillText(...pos);

    underlineEngine.globalCompositeOperation = 'source-out';
    underlineEngine.fillStyle = uStyle;

    underlineEngine.fillRect(x, underlineStartY, localWidth, underlineDepth);

    engine.save();
    engine.resetTransform();

    this.setImageSmoothing(engine);

    engine.drawImage(underlineElement, 0, 0);
    engine.restore();

    releaseCell(mycell);
};

// `drawBoundingBox` - internal helper function called by `method` functions
P.drawBoundingBox = function (host, style = null) {

    if (this.pathObject) {

        const uStroke = style || this.getLabelColorOnlyStyle(this.boundingBoxStyle);
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

        this.setImageSmoothing(engine);

        engine.stroke(this.pathObject);
        engine.restore();
    }
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
