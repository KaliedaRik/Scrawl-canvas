// # EnhancedLabel factory
// TODO - document purpose and description
//
// To note: EnhancedLabel entitys will, if told to, break words across lines on hard (- U+2010) and soft (&shy U+00AD) hyphens. It makes no effort to guess whether a word _can_ be broken at a given place, regardless of any [CSS settings for the web page/component](https://css-tricks.com/almanac/properties/h/hyphenate/) in which the SC canvas finds itself. For that sort of functionality, use a third party library like [Hyphenopoly](https://github.com/mnater/Hyphenopoly) to pre-process text before feeding it into the entity.


// #### Imports
import { constructors, artefact, group } from '../core/library.js';
import { getPixelRatio } from '../core/user-interaction.js';

import { currentCorePosition } from '../core/user-interaction.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../factory/text-style.js';

import { currentGroup } from './canvas.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';
import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';
// import { releaseArray, requestArray } from '../helper/array-pool.js';

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

import { _atan2, _hypot, _piHalf, _radian, _round, BLACK, ENTITY, GOOD_HOST, LEFT, LTR, PX0, ROUND, SPACE, T_ENHANCED_LABEL, T_GROUP, TEXT_HYPHENS_REGEX, TEXT_SPACES_REGEX, TEXT_TYPE_CHARS, TEXT_TYPE_HYPHEN, TEXT_TYPE_SOFT_HYPHEN, TEXT_TYPE_SPACE, TOP, ZERO_STR } from '../helper/shared-vars.js';

// import { ALPHABETIC, BOTTOM, CENTER, END, HANGING, HYPHEN, IDEOGRAPHIC, MIDDLE, START } from '../helper/shared-vars.js';


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
    this.textUnits = [];
    this.textUnitLengths = [];

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

// __breakTextOnSpaces__ - boolean.
// + When `true` (default), the textUnits will consist of words which are stamped as a unit (which preserves ligatures and kerning within the word).
// + Set this attribute to `false` if the font's language, when written, (generally) doesn't include spaces (eg: Chinese, Japanese), or when there is a requirement to style individual characters within words
    breakTextOnSpaces: true,

// __breakWordsOnHyphens__ - boolean.
// + When `true`, words that include hard or soft hyphens will be split into separate units for processing. Be aware that in highly ligatured fonts this may cause problems. The attribute defaults to `false`.
// + It is possible to style individual characters in a text that breaks on spaces by adding soft hyphens before and after the characters, but it may (will) lead to unnatural-looking word breaks at the end of the line
    breakWordsOnHyphens: false,

// __justifyLine__ - string enum. Allowed values are 'left', 'right', 'center' (default), 'full'
// + Determines the positioning of text units along the line. Has nothing to do with the `direction` attribute.
    justifyLine: 'center',

// __allowSubUnitStyling__ - boolean.
// + When `true`, forces space-hyphen-broken text to become single-character text units, with kerning (if required) handled manually. This will break heavily ligatured fonts such as Arabic and Devangari fonts in unexpected and unpleasant ways. Default: `false`
    allowSubUnitStyling: false,

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

    alignment: 0,

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

// console.log(this.name, 'S.layoutEngine', item)
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

            this.dirtyPathObject = true;
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

D.alignment = function (item) {

    if (item.toFixed) {

        this.alignment += item;
        this.dirtyLayout = true;
    }
};
S.alignment = function (item) {

    if (item.toFixed) {

        this.alignment = item;
        this.dirtyLayout = true;
    }
};

S.breakTextOnSpaces = function (item) {

    this.breakTextOnSpaces = !!item;
    this.dirtyText = true;
};

S.breakWordsOnHyphens = function (item) {

    this.breakWordsOnHyphens = !!item;
    this.dirtyText = true;
};

G.rawText = function () {

    return this.rawText;
};
S.text = function (item) {

    this.rawText = (item.substring) ? item : item.toString();
    this.text = this.convertTextEntityCharacters(this.rawText);

    this.dirtyText = true;
    this.dirtyFont = true;
    this.currentFontIsLoaded = false;
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

// console.log(this.name, 'cleanFont (trigger: dirtyFont', this.dirtyFont);

    if (this.currentFontIsLoaded) {

        this.dirtyFont = false;

        this.temperFont();

        if (!this.dirtyFont) this.measureFont();
    }
    else this.checkFontIsLoaded(this.defaultTextStyle.fontString);
};


// `temperFont` - manipulate the user-supplied font string to create a font string the canvas engine can use
P.temperFont = function () {

// console.log(this.name, 'temperFont (trigger: none - called by cleanFont');

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

// console.log(this.name, `cleanPathObject (trigger: dirtyPathObject ${this.dirtyPathObject}, checks: layout.pathObject ${this.layoutEngine?.pathObject}`);

    const layout = this.layoutEngine;

    if (this.dirtyPathObject && layout?.pathObject) {

// console.log(this.name, `cleanPathObject RUNNING!`)
        this.dirtyPathObject = false;

        this.pathObject = new Path2D(layout.pathObject);
    }
};


P.cleanLayout = function () {

// console.log(this.name, `cleanLayout (triggers: dirtyLayout ${this.dirtyLayout}, checks: currentFontIsLoaded ${this.currentFontIsLoaded}`);

    if (this.currentFontIsLoaded) {

        this.dirtyLayout = false;

        const { useLayoutEngineAsPath } = this;

        if (useLayoutEngineAsPath) {

            // TODO: Path-related positioning stuff
        }
        else this.calculateLines();

        this.dirtyTextLayout = true;
    }
};

P.cleanText = function () {

// console.log(this.name, `cleanText (trigger: dirtyText ${this.dirtyText}, checks: currentFontIsLoaded', ${this.currentFontIsLoaded}`);

    const makeUnitObject = (chars, type) => {

        return {
            chars,
            len: 0,
            type,
            style: null,
        };
    };

    if (this.currentFontIsLoaded) {

        this.dirtyText = false;

        const { text, textUnits, breakTextOnSpaces, breakWordsOnHyphens, allowSubUnitStyling } = this;

        const textCharacters = [...text];

        textUnits.length = 0;

        if (!allowSubUnitStyling && breakTextOnSpaces) {

            this.textUnitsHaveMultipleCharacters = true;

            const unit = [];

            if (breakWordsOnHyphens) {

                textCharacters.forEach(c => {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(makeUnitObject(unit.join(''), TEXT_TYPE_CHARS));
                        textUnits.push(makeUnitObject(SPACE, TEXT_TYPE_SPACE));
                        unit.length = 0;
                    }
                    else if (TEXT_HYPHENS_REGEX.test(c)) {

                        textUnits.push(makeUnitObject(unit.join(''), TEXT_TYPE_CHARS));
                        textUnits.push(makeUnitObject(c, TEXT_TYPE_HYPHEN));
                        unit.length = 0;
                    }
                    else unit.push(c);
                });
            }
            else {

                textCharacters.forEach(c => {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(makeUnitObject(unit.join(''), TEXT_TYPE_CHARS));
                        textUnits.push(makeUnitObject(SPACE, TEXT_TYPE_SPACE));
                        unit.length = 0;
                    }
                    else unit.push(c);
                });
            }
        }
        else {

            this.textUnitsHaveMultipleCharacters = false;

            textCharacters.forEach(c => textUnits.push(makeUnitObject(c, TEXT_TYPE_CHARS)));
        }

        this.measureTextUnits();

        this.dirtyTextLayout = true;
    }
};


P.layoutText = function () {

// console.log(this.name, `layoutText (trigger: dirtyTextLayout ${this.dirtyTextLayout}, checks: currentFontIsLoaded' ${this.currentFontIsLoaded}`);

    if (this.currentFontIsLoaded) {

        if (this?.lines.length && this?.textUnits.length) {

            this.dirtyTextLayout = false;

            this.assignTextUnitsToLines();

            this.positionTextUnits();
        }
    }
};


P.positionTextUnits = function () {

console.log(this.name, 'positionTextUnits (trigger: none - called by layoutText');
};


P.assignTextUnitsToLines = function () {

// console.log(this.name, 'assignTextUnitsToLines (trigger: none - called by layoutText');

    const {
        lines,
        textUnits,
    } = this;

    const unitArrayLength = textUnits.length;

    let unitCursor = 0,
        // lengthTaken, lengthRemaining,
        lengthRemaining,
        i, unit, len, type;

    lines.forEach(line => {

        const {
            length: lineLength,
            unitData,
        } = line;

        // lengthTaken = 0;
        lengthRemaining = lineLength;

        for (i = unitCursor; i < unitArrayLength; i++) {

            unit = textUnits[i];

            ({ len, type } = unit);

            if (len < lengthRemaining) {

                if (lengthRemaining === lineLength) {

                    if (type !== TEXT_TYPE_SPACE) {

                        // lengthTaken += len;
                        lengthRemaining -= len;
                        unitData.push(unitCursor);
                    }
                }
                else {

                    // lengthTaken += len;
                    lengthRemaining -= len;
                    unitData.push(unitCursor);
                }
                ++unitCursor;
            }
            else {

                if (type === TEXT_TYPE_SPACE) ++unitCursor;
                break;
            }
        }
    })
    // console.log(lines);
};


P.measureTextUnits = function () {

// console.log(this.name, 'measureTextUnits (trigger: none - called by cleanText');

    const { textUnits, defaultTextStyle } = this;

    const { letterSpacing, letterSpaceValue } = defaultTextStyle;

    const mycell = requestCell(),
        engine = mycell.engine;

    let res;

    engine.fillStyle = BLACK;
    engine.strokeStyle = BLACK;
    engine.font = defaultTextStyle.canvasFont;
    engine.fontKerning = defaultTextStyle.fontKerning;
    engine.fontStretch = defaultTextStyle.fontStretch;
    engine.fontVariantCaps = defaultTextStyle.fontVariant;
    engine.textRendering = defaultTextStyle.textRendering;
    engine.lineCap = ROUND;
    engine.lineJoin = ROUND;
    engine.direction = defaultTextStyle.direction;
    engine.textAlign = LEFT;
    engine.textBaseline = TOP;
    engine.wordSpacing = PX0;

    textUnits.forEach(t => {

        const {chars, type} = t;

        if (type === TEXT_TYPE_SPACE) engine.letterSpacing = PX0;
        else engine.letterSpacing = letterSpacing;

        if (type !== TEXT_TYPE_SOFT_HYPHEN) {

            res = engine.measureText(chars);
            t.len = res.width - letterSpaceValue;
        }
    });

    releaseCell(mycell);
};

P.calculateLines = function () {

// console.log(this.name, 'calculateLines (trigger: none - called by cleanLayout');

    // Local functions to find the points where a given line crosses the layout engine's shape border
    const getEndPoints = (x, y) => {

        const results = [];

        let edgePoints;

        if (vertical) edgePoints = (directionIsLtr) ? goTopToBottom(x, y, height) : goBottomToTop(x, y, height);
        else edgePoints = (directionIsLtr) ? goLeftToRight(x, y, width) : goRightToLeft(x, y, width);

        const len = edgePoints.length;

        if (len && len % 2 === 0) {

            for (let i = 0; i < len; i++) {

                coord.set(edgePoints[i]);
                coord.subtract(currentStampPosition);
                coord.rotate(rotationFix);
                results.push(...coord);
            }
        }
        // We sanitize the results (to integer values) after they have been rotated
        return results.map(r => _round(r));
    };

    const goLeftToRight = (x, y, dim) => {

        const startAt = x + (-dim * 3),
            endAt = x + (dim * 3),
            res = [];

        let isInLayout = false,
            check = false;

        for (let i = startAt; i < endAt; i++) {

            check = engine.isPointInPath(pathObject, i, y, winding);

            if (check !== isInLayout) {

                res.push([check === false ? i - 1 : i, y]);
                isInLayout = check;
            }
        }
        return res;
    };

    const goRightToLeft = (x, y, dim) => {

        const startAt = x + (dim * 3),
            endAt = x + (-dim * 3),
            res = [];

        let isInLayout = false,
            check = false;

        for (let i = startAt; i > endAt; i--) {

            check = engine.isPointInPath(pathObject, i, y, winding);

            if (check !== isInLayout) {

                res.push([check === false ? i + 1 : i, y]);
                isInLayout = check;
            }
        }
        return res;
    };

    const goTopToBottom = (x, y, dim) => {

        const startAt = y + (-dim * 3),
            endAt = y + (dim * 3),
            res = [];

        let isInLayout = false,
            check = false;

        for (let i = startAt; i < endAt; i++) {

            check = engine.isPointInPath(pathObject, x, i, winding);

            if (check !== isInLayout) {

                res.push([x, check === false ? i - 1 : i]);
                isInLayout = check;
            }
        }
        return res;
    };

    const goBottomToTop = (x, y, dim) => {

        const startAt = y + (dim * 3),
            endAt = y + (-dim * 3),
            res = [];

        let isInLayout = false,
            check = false;

        for (let i = startAt; i > endAt; i--) {

            check = engine.isPointInPath(pathObject, x, i, winding);

            if (check !== isInLayout) {

                res.push([x, check === false ? i + 1 : i]);
                isInLayout = check;
            }
        }
        return res;
    };


    // MAIN FUNCTION STARTS HERE
    const mycell = requestCell();
    const coord = requestCoordinate();

    const engine = mycell.engine;

    const {
        alignment,
        defaultTextStyle,
        layoutEngine,
        layoutEngineLineOffset,
        layoutEngineVerticalText: vertical,
        lines,
        lineSpacing,
    } = this;

    const {
        currentDimensions,
        currentRotation,
        currentStampPosition,
        pathObject,
        winding,
    } = layoutEngine;

    const {
        direction,
        fontSizeValue,
    } = defaultTextStyle;

    const rotation = -alignment * _radian;
    const rotationFix = alignment - currentRotation;

    const step = fontSizeValue * lineSpacing;

    const [constX, constY] = currentStampPosition;
    const [width, height] = currentDimensions;

    const directionIsLtr = direction === LTR;

    const rawData = [],
        lineProcessing = [];

    let flag = false,
        path = '',
        beginX, beginY,
        lineResults, lineData, lineLength, lineVal,
        sx, sy, ex, ey, i, iz,
        counter;


    // Prepare canvas for work
    mycell.rotateDestination(engine, constX, constY, layoutEngine);
    engine.rotate(rotation);


    // Main calculations
    // + TODO: one bug remains - functionality currently doesn't take into account handle offsets at the first level, which means lines don't generate if the handle pushes the layout entity too far away from the stamp position. This is due to the while/flag interaction. Probably won't fix as it's a bit of an edge case...
    if (vertical) {

        // The first line is close to currentStampPosition
        beginX = constX + layoutEngineLineOffset;
        rawData.push([beginX, getEndPoints(beginX, constY)]);

        // Find lines to the left of the first line
        flag = true;
        while (flag) {

            beginX -= step;
            lineResults = getEndPoints(beginX, constY);

            if (!lineResults.length) flag = false;
            else rawData.push([beginX, lineResults]);
        }

        // Find lines to the right of the first line
        beginX = constX + layoutEngineLineOffset;
        flag = true;
        while (flag) {

            beginX += step;
            lineResults = getEndPoints(beginX, constY);

            if (!lineResults.length) flag = false;
            else rawData.push([beginX, lineResults]);
        }
    }
    else {

        // The first line is close to currentStampPosition
        beginY = constY + layoutEngineLineOffset;
        rawData.push([beginY, getEndPoints(constX, beginY)]);

        // Find lines above the first line
        flag = true;
        while (flag) {

            beginY -= step;
            lineResults = getEndPoints(constX, beginY);

            if (!lineResults.length) flag = false;
            else rawData.push([beginY, lineResults]);
        }

        // Find lines below the first line
        beginY = constY + layoutEngineLineOffset;
        flag = true;
        while (flag) {

            beginY += step;
            lineResults = getEndPoints(constX, beginY);

            if (!lineResults.length) flag = false;
            else rawData.push([beginY, lineResults]);
        }
    }


    // Sort the raw data top-bottom etc
    if (directionIsLtr) rawData.sort((a, b) => a[0] - b[0]);
    else rawData.sort((a, b) => b[0] - a[0]);


    // Push line data into the this.lines array
    lines.length = 0;
    lineLength = 0;
    lineProcessing.length = 0;

    rawData.forEach(d => {

        lineData = d[1];
        [sx, sy, ex, ey] = lineData;

        lineVal = _hypot(sx - ex, sy - ey);

        lineProcessing.push(lineVal);
        lineLength += lineVal;
    });

    lineVal = 0;

    lineProcessing.forEach((d, i) => {

        [sx, sy, ex, ey] = rawData[i][1];

        // Currently storing as an object. Need to turn it into an array for more efficient processing
        lines.push({
            length: d,
            lengthRatio: d / lineLength,
            startPositionInPath: lineVal / lineLength,
            startAt: [...coord.set([sx, sy]).add(currentStampPosition)],
            endAt: [...coord.set([ex, ey]).add(currentStampPosition)],
            slope: this.getLinearAngle(sx, sy, ex, ey),
            unitData: [],
        });

        lineVal += d;
    });


    // Generate the path string
    beginX = 0;
    beginY = 0;

    rawData.forEach(data => {

        lineData = data[1];
        counter = 0;

        for (i = 0, iz = lineData.length; i < iz; i += 4) {

            sx = lineData[counter++];
            sy = lineData[counter++];
            ex = lineData[counter++];
            ey = lineData[counter++];

            path += `m${sx - beginX},${sy - beginY}l${ex - sx},${ey - sy}`;

            beginX = ex;
            beginY = ey;
        }
    });

    // We can do 2 things here:
    // 1. Do all the calculations required for layout along the line locally
    // 2. Stuff the path into a hidden shape entity and let that do all the calculations for us
    // + These are all line paths, so calculations shouldn't be too onerous?
    this.localPath = new Path2D(`${path}z`);


    // Clean up
    releaseCoordinate(coord);
    releaseCell(mycell);
};

// `getLinearAngle`
P.getLinearAngle = function (sx, sy, ex, ey) {

    const dx = ex - sx,
        dy = ey - sy;

    return (-_atan2(dx, dy) + _piHalf) / _radian;
};

// #### Display cycle functions

P.prepareStamp = function() {

console.log(`

${this.name} prepareStamp`);

    if (this.dirtyHost) this.dirtyHost = false;

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle || this.dirtyRotation) {

// console.log('Trigger cleanPathObject because', `dirtyScale ${this.dirtyScale} dirtyDimensions ${this.dirtyDimensions} dirtyStart ${this.dirtyStart} dirtyOffset ${this.dirtyOffset} dirtyHandle ${this.dirtyHandle} dirtyRotation ${this.dirtyRotation} dirtyPathObject ${this.dirtyPathObject}`)

        this.dirtyScale = false;
        this.dirtyDimensions = false;
        this.dirtyStart = false;
        this.dirtyOffset = false;
        this.dirtyHandle = false;
        this.dirtyRotation = false;

        this.dirtyPathObject = true;
        this.dirtyLayout = true;
    }

    if (this.dirtyPathObject) this.cleanPathObject();

    if (this.dirtyFont) {

        this.cleanFont();
        this.dirtyText = true;
    }

    if (!this.dirtyPathObject) {

        if (this.dirtyText) {

            this.updateAccessibleTextHold();
            this.cleanText();
        }

        if (this.dirtyLayout) this.cleanLayout();

        if (this.dirtyTextLayout) this.layoutText();
    }

    // this.prepareStampTabsHelper();
};

// `stamp` - All EnhancedLabel entity stamping, except for simple stamps, goes through this function.
P.stamp = function (force = false, host, changes) {

    if (!this.dirtyFont && !this.dirtyText && !this.dirtyLayout) {

        if (force) {

            if (host && GOOD_HOST.includes(host.type)) this.currentHost = host;

            if (changes) {

                this.set(changes);
                this.prepareStamp();
            }

            this.regularStamp();
        }
        else if (this.visibility) this.regularStamp();
    }
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
