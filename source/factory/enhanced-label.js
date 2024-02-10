// # EnhancedLabel factory
// TODO - document purpose and description


// #### Imports
import { constructors, artefact, group } from '../core/library.js';
import { getPixelRatio } from '../core/user-interaction.js';

import { currentCorePosition } from '../core/user-interaction.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../factory/text-style.js';

import { currentGroup } from './canvas.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';
import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';
import { releaseArray, requestArray } from '../helper/array-pool.js';

import baseMix from '../mixin/base.js';
import deltaMix from '../mixin/delta.js';
// import pathMix from '../mixin/path.js';
// import mimicMix from '../mixin/mimic.js';
// import hiddenElementsMix from '../mixin/hiddenDomElements.js';
// import anchorMix from '../mixin/anchor.js';
// import buttonMix from '../mixin/button.js';
import textMix from '../mixin/text.js';
import labelMix from '../mixin/label.js';

import { doCreate, mergeDiscard, mergeOver, pushUnique, removeItem, xta, λnull, λthis, Ωempty } from '../helper/utilities.js';

import { _floor, _hypot, _radian, _round, ALPHABETIC, BLACK, BOTTOM, CENTER, END, ENTITY, GOOD_HOST, HANGING, IDEOGRAPHIC, LEFT, LTR, MIDDLE, ROUND, START, T_ENHANCED_LABEL, T_GROUP, TOP, ZERO_STR } from '../helper/shared-vars.js';


// #### EnhancedLabel constructor
const EnhancedLabel = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.state = makeState(Ωempty);

    // this.modifyConstructorInputForAnchorButton(items);

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
    this.currentScale = 1;

    this.delta = {};

    this.lines = [];

    this.set(items);

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
deltaMix(P);
// pathMix(P);
// mimicMix(P);
textMix(P);
labelMix(P);


// #### EnhancedLabel attributes
const defaultAttributes = {

// __text__ - string.
// + Can include html/css styling data
    text: ZERO_STR,

// __lineSpacing__ - number. The distance between lines of text, as a ratio of the default font height
// + Can be set/deltaSet in the normal way
// + Alternatively, can be set via the fontString attribute.
// + Default value is set to `1.5` for accessibility reasons
    lineSpacing: 1.5,

// __layoutEngine__ - artefact object, or artefact's string name attribute.
    layoutEngine: null,

// __useLayoutEngineAsPath__ - boolean. If layout engine entity is a path-based entity, then we can either fit the text within it, or use its path for positioning.
    useLayoutEngineAsPath: false,

// __layoutEnginePathStart__ - where to start text positioning along the layout engine path.
    layoutEnginePathStart: 0,

// __layoutEngineLineOffset__ - how far away from the origin point the initial line should be.
    layoutEngineLineOffset: 0,

// __layoutEngineVerticalText__ - orientation of lines.
    layoutEngineVerticalText: false,


// The EnhancedLabel entity does not use the [position](./mixin/position.html) or [entity](./mixin/entity.html) mixins (used by most other entitys) as its positioning is entirely dependent on the position, rotation, scale etc of its constituent Shape path entity struts.
//
// It does, however, use these attributes (alongside their setters and getters): __visibility__, __order__, __delta__, __host__, __group__, __anchor__.
    visibility: true,
    calculateOrder: 0,
    stampOrder: 0,
    host: null,
    group: null,
    anchor: null,

    method: 'fill',

    roll: 0,

// __noCanvasEngineUpdates__ - Boolean flag - Canvas engine updates are required for the EnhancedLabel's border - strokeStyle and line styling; if an EnhancedLabel is to be drawn without a border, then setting this flag to `true` may help improve rendering efficiency.
    noCanvasEngineUpdates: false,


// __noDeltaUpdates__ - Boolean flag - EnhancedLabel entitys support delta animation - achieved by updating the `...path` attributes by appropriate (and small!) values. If the EnhancedLabel is not going to be animated by delta values, setting the flag to `true` may help improve rendering efficiency.
    noDeltaUpdates: false,


// __onEnter__, __onLeave__, __onDown__, __onUp__ - EnhancedLabel entitys support ___collision detection___, reporting a hit when a test coordinate falls within the EnhancedLabel's output image. As a result, EnhancedLabels can also accept and act on the four __on__ functions - see [entity event listener functions](../mixin/entity.html#section-11) for more details.
    onEnter: null,
    onLeave: null,
    onDown: null,
    onUp: null,


// __noUserInteraction__ - Boolean flag - To switch off collision detection for a EnhancedLabel entity - which might help improve rendering efficiency - set the flag to `true`.
    noUserInteraction: false,

    useMimicDimensions: true,
    useMimicFlip: true,
    useMimicHandle: true,
    useMimicOffset: true,
    useMimicRotation: true,
    useMimicScale: true,
    useMimicStart: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetObjects = pushUnique(P.packetObjects, ['layoutEngine']);


// #### Clone management
// TODO - this functionality is currently disabled, need to enable it and make it work properly
P.clone = λthis;



// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __host__, __getHost__ - copied over from the position mixin.
S.host = function (item) {

    if (item) {

        const host = artefact[item];

        if (host && host.here) this.host = host.name;
        else this.host = item;
    }
    else this.host = ZERO_STR;
};

// __group__ - copied over from the position mixin.
G.group = function () {

    return (this.group) ? this.group.name : ZERO_STR;
};
S.group = function (item) {

    let g;

    if (item) {

        if (this.group && this.group.type === T_GROUP) this.group.removeArtefacts(this.name);

        if (item.substring) {

            g = group[item];

            if (g) this.group = g;
            else this.group = item;
        }
        else this.group = item;
    }

    if (this.group && this.group.type === T_GROUP) this.group.addArtefacts(this.name);
};

// __getHere__ - returns current core position.
P.getHere = function () {

    return currentCorePosition;
};

// __delta__ - copied over from the position mixin.
S.delta = function (items) {

    if (items) this.delta = mergeDiscard(this.delta, items);
};


// Pseudo-attributes mapping to mimic-related attribute, to provide a clearer understanding of how EnhancedLabel entitys use these attributes
// + __updateOnLayoutDimensionsChange__
// + __updateOnLayoutFlipChange__
// + __updateOnLayoutHandleChange__
// + __updateOnLayoutOffsetChange__
// + __updateOnLayoutRotationChange__
// + __updateOnLayoutScaleChange__
// + __updateOnLayoutStartChange__
G.updateOnLayoutDimensionsChange = function () {
    return this.useMimicDimensions;
};
S.updateOnLayoutDimensionsChange = function (item) {
    this.useMimicDimensions = !!item;
};

G.updateOnLayoutFlipChange = function () {
    return this.useMimicFlip;
};
S.updateOnLayoutFlipChange = function (item) {
    this.useMimicFlip = !!item;
};

G.updateOnLayoutHandleChange = function () {
    return this.useMimicHandle;
};
S.updateOnLayoutHandleChange = function (item) {
    this.useMimicHandle = !!item;
};

G.updateOnLayoutOffsetChange = function () {
    return this.useMimicOffset;
};
S.updateOnLayoutOffsetChange = function (item) {
    this.useMimicOffset = !!item;
};

G.updateOnLayoutRotationChange = function () {
    return this.useMimicRotation;
};
S.updateOnLayoutRotationChange = function (item) {
    this.useMimicRotation = !!item;
};

G.updateOnLayoutScaleChange = function () {
    return this.useMimicScale;
};
S.updateOnLayoutScaleChange = function (item) {
    this.useMimicScale = !!item;
};

G.updateOnLayoutStartChange = function () {
    return this.useMimicStart;
};
S.updateOnLayoutStartChange = function (item) {
    this.useMimicStart = !!item;
};

// __layoutEngine__ - TODO: documentation
S.layoutEngine = function (item) {

    if (item) {

        const oldEngine = this.layoutEngine,
            newEngine = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newEngine && newEngine.name) {

            if (oldEngine && oldEngine.name !== newEngine.name) {

                if (oldEngine.mimicked) removeItem(oldEngine.mimicked, name);
                if (oldEngine.pathed) removeItem(oldEngine.pathed, name);
            }

            if (newEngine.mimicked) pushUnique(newEngine.mimicked, name);
            if (newEngine.pathed) pushUnique(newEngine.pathed, name);

            this.layoutEngine = newEngine;

            this.dirtyLayout = true;
        }
    }
};

S.layoutEngineVerticalText = function (item) {

    this.layoutEngineVerticalText = !!item;
    this.dirtyLayout = true;
};

D.layoutEngineLineOffset = function (item) {

    if (item.toFixed) {

        this.layoutEngineLineOffset += item;
        this.dirtyLayout = true;
    }
};
S.layoutEngineLineOffset = function (item) {

    if (item.toFixed) {

        this.layoutEngineLineOffset = item;
        this.dirtyLayout = true;
    }
};

D.roll = function (item) {

    if (item.toFixed) {

        this.roll += item;
        this.dirtyLayout = true;
    }
};
S.roll = function (item) {

    if (item.toFixed) {

        this.roll = item;
        this.dirtyLayout = true;
    }
};


// #### Prototype functions

// `getHost` - copied over from the position mixin.
P.getHost = function () {

    if (this.currentHost) return this.currentHost;
    else if (this.host) {

        const host = artefact[this.host];

        if (host) {

            this.currentHost = host;
            this.dirtyHost = true;
            return this.currentHost;
        }
    }
    return currentCorePosition;
};

// Invalidate mid-init functionality
P.midInitActions = λnull;


// #### Clean functions

P.cleanFont = function () {

    if (this.currentFontIsLoaded) {

        this.dirtyFont = false;

        this.temperFont();

        if (!this.dirtyFont) this.measureFont();
    }
    else this.checkFontIsLoaded(this.defaultTextStyle.fontString);
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
        else this.updateTextStyle(defaultTextStyle, fontSizeCalculator, fontSizeCalculatorValues);
    }
};


// `cleanPathObject` - calculate the EnhancedLabel entity's __Path2D object__
P.cleanPathObject = function () {

    const layout = this.layoutEngine;

    if (layout?.pathObject) {

        this.dirtyPathObject = false;

        this.pathObject = new Path2D(layout.pathObject);
    }
};

P.cleanLayout = function () {

    this.dirtyLayout = false;
    this.dirtyScale = false;
    this.dirtyDimensions = false;
    this.dirtyStart = false;
    this.dirtyOffset = false;
    this.dirtyHandle = false;
    this.dirtyRotation = false;

    const { useLayoutEngineAsPath } = this;

    this.cleanPathObject();

    if (useLayoutEngineAsPath) {

        // Path-related positioning stuff
    }
    else {

        this.calculateLines();
    }
};

P.calculateLines = function () {

    const getLeft = (x, y) => {

        if (!engine.isPointInPath(pathObject, x, y, winding)) return null;

        while (engine.isPointInPath(pathObject, x, y, winding)) x--;
        return ++x - constX;
    };

    const getRight = (x, y) => {

        if (!engine.isPointInPath(pathObject, x, y, winding)) return null;

        while (engine.isPointInPath(pathObject, x, y, winding)) x++;
        return --x - constX;
    };

    const getTop = (x, y) => {

        if (!engine.isPointInPath(pathObject, x, y, winding)) return null;

        while (engine.isPointInPath(pathObject, x, y, winding)) y--;
        return ++y - constY;
    };

    const getBottom = (x, y) => {

        if (!engine.isPointInPath(pathObject, x, y, winding)) return null;

        while (engine.isPointInPath(pathObject, x, y, winding)) y++;
        return --y - constY;
    };

    const getEndPoints = (x, y) => {

        const pts = requestArray()
        const results = [];

        if (vertical) {

            const startY = (direction === LTR) ? getTop(x, y) : getBottom(x, y);
            const endY = (direction === LTR) ? getBottom(x, y) : getTop(x, y);

            if (startY && endY) {

                pts.push(...coord.set(x - constX, startY).rotate(overRotation));
                pts.push(...coord.set(x - constX, endY).rotate(overRotation));
            }
        }
        else {

            const startX = (direction === LTR) ? getLeft(x, y) : getRight(x, y);
            const endX = (direction === LTR) ? getRight(x, y) : getLeft(x, y);

            if (startX && endX) {

                pts.push(...coord.set(startX, y - constY).rotate(overRotation));
                pts.push(...coord.set(endX, y - constY).rotate(overRotation));
            }
        }

        results.push(...pts.map(p => _round(p)));

        releaseArray(pts);

        return results;
    }

    const mycell = requestCell();
    const coord = requestCoordinate();

    const engine = mycell.engine;
    const { layoutEngine:layout, roll, defaultTextStyle:defs, lineSpacing, layoutEngineLineOffset:offset, layoutEngineVerticalText:vertical, lines } = this;
    const { currentStampPosition, pathObject, winding, currentRotation } = layout;
    const { fontSizeValue, direction } = defs;

    const [constX, constY] = currentStampPosition;
    const rotation = -roll * _radian;
    const overRotation = -(-roll + currentRotation);
    const step = fontSizeValue * lineSpacing;

    mycell.rotateDestination(engine, ...currentStampPosition, layout);
    engine.rotate(rotation);

    if (engine.isPointInPath(pathObject, ...currentStampPosition, winding)) {

        const rawData = [];

        let beginX = constX + offset,
            beginY = constY + offset;

        if (vertical) {

            rawData.push([beginX, getEndPoints(beginX, constY)]);

            let flag = true;

            while (flag) {

                beginX -= step;
                const res = getEndPoints(beginX, constY);

                if (!res.length) flag = false;
                else rawData.push([beginX, res]);
            }

            beginX = constX + offset;
            flag = true;

            while (flag) {

                beginX += step;
                const res = getEndPoints(beginX, constY);

                if (!res.length) flag = false;
                else rawData.push([beginX, res]);
            }
        }
        else {

            rawData.push([beginY, getEndPoints(constX, beginY)]);

            let flag = true;

            while (flag) {

                beginY -= step;
                const res = getEndPoints(constX, beginY);

                if (!res.length) flag = false;
                else rawData.push([beginY, res]);
            }

            beginY = constY + offset;
            flag = true;

            while (flag) {

                beginY += step;
                const res = getEndPoints(constX, beginY);

                if (!res.length) flag = false;
                else rawData.push([beginY, res]);
            }
        }

        if (direction === LTR) rawData.sort((a, b) => a[0] - b[0]);
        else rawData.sort((a, b) => b[0] - a[0]);

        lines.length = 0;
        rawData.forEach(d => {

            const pts = d[1];
            const [sx, sy, ex, ey] = pts;

            lines.push(_floor(_hypot(sx - ex, sy - ey)));
        });

console.log(lines);

        let path = '';

        beginX = 0;
        beginY = 0;

        rawData.forEach(d => {

            const pts = d[1];

            path += `m${pts[0] - beginX},${pts[1] - beginY}l${pts[2] - pts[0]},${pts[3] - pts[1]}`;

            beginX = pts[2];
            beginY = pts[3];
        });

        this.localPath = new Path2D(path);
    }
    else {

        this.localPath = null;
        console.log(this.name, 'calculateLines ERROR: start point is outside layoutEngine artefact');
    }

    releaseCoordinate(coord);
    releaseCell(mycell);
};


// #### Display cycle functions

P.prepareStamp = function() {

    if (this.dirtyHost) this.dirtyHost = false;

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle || this.dirtyRotation) this.dirtyLayout = true;

    if (this.dirtyText) {

        this.updateAccessibleTextHold();
        this.dirtyLayout = true;
    }

    if (this.dirtyFont) {

        this.cleanFont();
        this.dirtyLayout = true;
    }

    if (this.dirtyLayout) this.cleanLayout();

    // this.prepareStampTabsHelper();
};

// `stamp` - All EnhancedLabel entity stamping, except for simple stamps, goes through this function.
P.stamp = function (force = false, host, changes) {

    if (force) {

        if (host && GOOD_HOST.includes(host.type)) this.currentHost = host;

        if (changes) {

            this.set(changes);
            this.prepareStamp();
        }

        this.regularStamp();
    }

    if (this.visibility) this.regularStamp();
};


// `simpleStamp` - bypassing the stamp functionality
// + (probably not needed?)
P.simpleStamp = function (host, changes) {

    if (host && GOOD_HOST.includes(host.type)) {

        this.currentHost = host;

        if (changes) {

            this.set(changes);
            this.prepareStamp();
        }
        this.regularStamp();
    }
};


// `regularStamp` - overwrites mixin/entity.js function.
// + If decide to pass host instead of host.engine to method functions for all entitys, then this may be a temporary fix
P.regularStamp = function () {

    const dest = this.currentHost;

    if (dest) {

        const layout = this.layoutEngine;

        if (layout) {

            const engine = dest.engine;
            const [x, y] = layout.currentStampPosition;

            const { state, noCanvasEngineUpdates, localPath, defaultTextStyle, showBoundingBox } = this;

            // Get the Cell wrapper to perform required transformations on its &lt;canvas> element's 2D engine
            dest.rotateDestination(engine, x, y, layout);

            // Get the Cell wrapper to update its 2D engine's attributes to match the entity's requirements
            if (!noCanvasEngineUpdates) {

                state.set(defaultTextStyle);
                dest.setEngine(this);
            }

            if (localPath) engine.stroke(localPath);

            // Invoke the appropriate __stamping method__ (below)
            // this[this.method](dest.engine, 0, 0, this.text);

            if (showBoundingBox) this.drawBoundingBox(dest);
        }
    }
};


// ##### Stamp methods

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
P.draw = function (engine, x, y, text) {

    engine.strokeText(text, x, y);
};

// `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
P.fill = function (engine, x, y, text) {

    engine.fillText(text, x, y);
};

// `drawAndFill` - stamp the entity stroke, then fill, then remove shadow and repeat
P.drawAndFill = P.fill;

// `drawAndFill` - stamp the entity fill, then stroke, then remove shadow and repeat
P.fillAndDraw = P.draw;

// `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
P.drawThenFill = P.fill;

// `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
P.fillThenDraw = P.draw;

// `clip` - restrict drawing activities to the entity's enclosed area
P.clip = λnull;

// `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
P.clear = λnull;

// `none` - perform all the calculations required, but don't perform the final stamping
P.none = λnull;


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
