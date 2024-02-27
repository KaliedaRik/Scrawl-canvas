// # Label factory
// TODO - document purpose and description


// #### Imports
import { constructors } from '../core/library.js';
import { getPixelRatio } from '../core/user-interaction.js';

import { doCreate, mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../untracked-factory/text-style.js';
import { currentGroup } from '../factory/canvas.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';
import textMix from '../mixin/text.js';
import labelMix from '../mixin/label.js';

import { _isFinite, ALPHABETIC, BLACK, BOTTOM, CENTER, DESTINATION_OUT, END, ENTITY, HANGING, IDEOGRAPHIC, LEFT, LTR, MIDDLE, MOUSE, PARTICLE, RIGHT, ROUND, START, T_LABEL, TOP, ZERO_STR } from '../helper/shared-vars.js';


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
labelMix(P);


// #### Label attributes
const defaultAttributes = {

// __text__ - string.
    text: ZERO_STR,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters;

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
