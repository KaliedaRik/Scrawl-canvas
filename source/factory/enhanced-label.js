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
import textMix from '../mixin/text.js';
import labelMix from '../mixin/label.js';

import { doCreate, mergeDiscard, mergeOver, pushUnique, removeItem, λnull, λthis, Ωempty } from '../helper/utilities.js';

import { _assign, _atan2, _ceil, _computed, _create, _hypot, _piHalf, _radian, _round, BLACK, CENTER, COLUMN, COLUMN_REVERSE, END, ENTITY, FULL, GOOD_HOST, LEFT, LTR, NONE, NORMAL, PX0, ROUND, ROW, ROW_REVERSE, T_ENHANCED_LABEL, T_GROUP, TEXT_HARD_HYPHEN_REGEX, TEXT_NO_BREAK_REGEX, TEXT_SOFT_HYPHEN_REGEX, TEXT_SPACES_REGEX, TEXT_TYPE_CHARS, TEXT_TYPE_HYPHEN, TEXT_TYPE_SOFT_HYPHEN, TEXT_TYPE_SPACE, TEXT_TYPE_TRUNCATE, TEXT_UNIT_DIRECTION_VALUES, TOP, ZERO_STR } from '../helper/shared-vars.js';

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

    this.currentStampPosition = [0, 0];
    this.currentRotation = 0;

    this.delta = {};

    this.lines = [];
    this.textUnits = [];

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

// __textUnitDirection__ - orientation of text units within the layout engine space. Values follows the CSS flexbox _flex-direction_ attribute's example:
// + `row` - left to right where `direction = 'ltr'`; right to left where `direction = 'rtl'`
// + `row-reverse` - right to left where `direction = 'ltr'`; left to right where `direction = 'rtl'`
// + `column` - top to bottom where `direction = 'ltr'`; bottom to top where `direction = 'rtl'`
// + `column-reverse` - bottom to top where `direction = 'ltr'`; top to bottom where `direction = 'rtl'`
    textUnitDirection: ROW,

// __breakTextOnSpaces__ - boolean.
// + When `true` (default), the textUnits will consist of words which are stamped as a unit (which preserves ligatures and kerning within the word).
// + Set this attribute to `false` if the font's language, when written, (generally) doesn't include spaces (eg: Chinese, Japanese), or when there is a requirement to style individual characters within words
    breakTextOnSpaces: true,

// __breakWordsOnHyphens__ - boolean.
// + When `true`, words that include hard or soft hyphens will be split into separate units for processing. Be aware that in highly ligatured fonts this may cause problems. The attribute defaults to `false`.
// + It is possible to style individual characters in a text that breaks on spaces by adding soft hyphens before and after the characters, but it may (will) lead to unnatural-looking word breaks at the end of the line.
// + Attribute has no effect if `breakTextOnSpaces` is `false`.
    breakWordsOnHyphens: false,

// __justifyLine__ - string enum. Allowed values are 'start', 'end', 'center' (default), 'full'
// + Determines the positioning of text units along the line. Has nothing to do with the `direction` attribute.
    justifyLine: CENTER,

// __allowSubUnitStyling__ - boolean.
// + When `true`, forces space-hyphen-broken text to become single-character text units, with kerning (if required) handled manually. This will break heavily ligatured fonts (such as Arabic and Devangari fonts) in unexpected and unpleasant ways. Default: `false`
    allowSubUnitStyling: false,

// __truncateString__ - string.
    truncateString: '…',

// __hyphenString__ - string.
    hyphenString: '-',

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

S.textUnitDirection = function (item) {

    if (TEXT_UNIT_DIRECTION_VALUES.includes(item)) {

        this.textUnitDirection = item;
        this.dirtyLayout = true;
    }
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

    const tester = this.getTester();
    if (tester) tester.innerHTML = this.rawText;
};

S.truncateString = function (item) {

    if (item.substring) {

        this.truncateString = this.convertTextEntityCharacters(item);
        this.dirtyText = true;
    }
};

S.hyphenString = function (item) {

    if (item.substring) {

        this.hyphenString = this.convertTextEntityCharacters(item);
        this.dirtyText = true;
    }
};

S.justifyLine = function (item) {

    if (item.substring) {

        this.justifyLine = item;
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


P.getTester = function () {

    const group = this.group;

    if (group) {

        const host = (group && group.getHost) ? group.getHost() : null;

        if (host) {

            const controller = host.getController();

            if (controller) return controller.labelStylesCalculator;
        }
    }
    return null;
};


P.makeWorkingTextStyle = function (template, name) {

    const workStyle = _create(template);
    _assign(workStyle, template);

    workStyle.name = name;
    workStyle.isDefaultTextStyle = false;

    return workStyle;
};

P.setEngineFromWorkingTextStyle = function (worker, style, state, cell) {

    worker.set(style, true);
    this.updateCanvasFont(worker);
    state.set(worker);
    cell.setEngine(this);
};

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


// `cleanPathObject` - calculate the EnhancedLabel entity's __Path2D object__
P.cleanPathObject = function () {

// console.log(this.name, `cleanPathObject (trigger: dirtyPathObject ${this.dirtyPathObject}, checks: layout.pathObject ${this.layoutEngine?.pathObject}`);

    const layout = this.layoutEngine;

    if (this.dirtyPathObject && layout?.pathObject) {

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
            lineOffset: 0,
            kernOffset: 0,
            stampFlag: true,
        };
    };

    if (this.currentFontIsLoaded) {

        this.dirtyText = false;

        const { text, textUnits, breakTextOnSpaces, breakWordsOnHyphens, allowSubUnitStyling } = this;

        const textCharacters = [...text];

        const unit = [];

        let noBreak = false;

        textUnits.length = 0;

        if (!allowSubUnitStyling && breakTextOnSpaces) {

            if (breakWordsOnHyphens) {

                textCharacters.forEach(c => {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(makeUnitObject(unit.join(ZERO_STR), TEXT_TYPE_CHARS));
                        textUnits.push(makeUnitObject(c, TEXT_TYPE_SPACE));
                        unit.length = 0;
                    }
                    else if (TEXT_HARD_HYPHEN_REGEX.test(c)) {

                        textUnits.push(makeUnitObject(unit.join(ZERO_STR), TEXT_TYPE_CHARS));
                        textUnits.push(makeUnitObject(c, TEXT_TYPE_HYPHEN));
                        unit.length = 0;
                    }
                    else if (TEXT_SOFT_HYPHEN_REGEX.test(c)) {

                        textUnits.push(makeUnitObject(unit.join(ZERO_STR), TEXT_TYPE_CHARS));
                        textUnits.push(makeUnitObject(c, TEXT_TYPE_SOFT_HYPHEN));
                        unit.length = 0;
                    }
                    else unit.push(c);
                });

                // Capturing the last word
                if (unit.length) textUnits.push(makeUnitObject(unit.join(ZERO_STR), TEXT_TYPE_CHARS));
            }
            else {

                textCharacters.forEach(c => {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(makeUnitObject(unit.join(ZERO_STR), TEXT_TYPE_CHARS));
                        textUnits.push(makeUnitObject(c, TEXT_TYPE_SPACE));
                        unit.length = 0;
                    }
                    else unit.push(c);
                });

                // Capturing the last word
                if (unit.length) textUnits.push(makeUnitObject(unit.join(ZERO_STR), TEXT_TYPE_CHARS));
            }
        }
        else {

            textCharacters.forEach((c, index) => {

                unit.push(c);

                // Some Chinese/Japanese characters simply have to stick together!
                noBreak = TEXT_NO_BREAK_REGEX.test(c) || TEXT_NO_BREAK_REGEX.test(textCharacters[index + 1]);

                if (!noBreak) {


                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(makeUnitObject(unit.join(ZERO_STR), TEXT_TYPE_SPACE));
                        unit.length = 0;
                    }
                    else  {

                        textUnits.push(makeUnitObject(unit.join(ZERO_STR), TEXT_TYPE_CHARS));
                        unit.length = 0;
                    }
                }
            });
        }

        this.assessTextForStyle();

        this.measureTextUnits();
        this.dirtyTextLayout = true;
    }
};


P.assessTextForStyle = function () {

// console.log(this.name, `assessTextForStyle (trigger: none - called directly by cleanText`);

    const tester = this.getTester();

    // No calculator! Reset dirty flag and return
    if (!tester) {

        this.dirtyText = true;
        return null;
    }

    // Local helper function `processNode`
    // + recursively step through the text's HTML nodes
    const processNode = (node) => {

        if (node.nodeType !== 3) {

            for (const item of node.childNodes) {

                processNode(item);
            }
        }
        else {

            const unit = textUnits[getCharacterUnit(cursor)];
            if (unit != null && unit.style == null) unit.style = makeTextStyle({});

            cursor += node.textContent.length;

            diffStyles(node, unit);
        }

    };

    // Local helper function `getCharacterUnit`
    // + called by `processNode`, maps char position to textUnit item
    const getCharacterUnit = (pos) => {

        let len = 0;

        for (let i = 0, iz = textUnits.length; i < iz; i++) {

            len += textUnits[i].chars.length;

            if (pos < len) return i;
        }
        return null;
    };

    // Local helper function `diffStyles`
    // + called by `processNode`, diffs required styles against existing ones
    const diffStyles = (node, unit) => {

        const nodeVals = _computed(node.parentNode);

        const unitSet = {};
        let oldVal, newVal;

        oldVal = currentTextStyle.direction;
        newVal = nodeVals.getPropertyValue('direction');
// if (oldVal !== newVal) console.log(`direction | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal)  unitSet.direction = newVal;

        oldVal = currentTextStyle.fontFamily;
        newVal = nodeVals.getPropertyValue('font-family');
// if (oldVal !== newVal) console.log(`fontFamily | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.fontFamily = newVal;

        oldVal = currentTextStyle.fontKerning;
        newVal = nodeVals.getPropertyValue('font-kerning');
// if (oldVal !== newVal) console.log(`fontKerning | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.fontKerning = newVal;

        oldVal = currentTextStyle.fontSize;
        newVal = nodeVals.getPropertyValue('font-size');
// if (oldVal !== newVal) console.log(`fontSize | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.fontSize = newVal;

        oldVal = currentTextStyle.fontStretch;
        newVal = nodeVals.getPropertyValue('font-stretch');
        if (newVal === '100%') newVal = NORMAL;
// if (oldVal !== newVal) console.log(`fontStretch | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.fontStretch = newVal;

        oldVal = currentTextStyle.fontStyle;
        newVal = nodeVals.getPropertyValue('font-style');
// if (oldVal !== newVal) console.log(`fontStyle | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.fontStyle = newVal;

        oldVal = currentTextStyle.fontVariantCaps;
        newVal = nodeVals.getPropertyValue('font-variant-caps');
// if (oldVal !== newVal) console.log(`fontVariantCaps | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.fontVariantCaps = newVal;

        oldVal = currentTextStyle.fontWeight;
        newVal = nodeVals.getPropertyValue('font-weight');
// if (oldVal !== newVal) console.log(`fontWeight | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.fontWeight = newVal;

        oldVal = currentTextStyle.get('letterSpacing');
        newVal = nodeVals.getPropertyValue('letter-spacing');
        if (newVal === NORMAL) newVal = PX0;
// if (oldVal !== newVal) console.log(`letterSpacing | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.letterSpacing = newVal;

        oldVal = currentTextStyle.textRendering;
        newVal = nodeVals.getPropertyValue('text-rendering');
// if (oldVal !== newVal) console.log(`textRendering | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.textRendering = newVal;

        oldVal = currentTextStyle.get('wordSpacing');
        newVal = nodeVals.getPropertyValue('word-spacing');
// if (oldVal !== newVal) console.log(`wordSpacing | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.wordSpacing = newVal;

        oldVal = currentTextStyle.fillStyle;
        newVal = nodeVals.getPropertyValue('--SC-fill-style');
// if (oldVal !== newVal) console.log(`fillStyle | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.fillStyle = newVal;

        oldVal = currentTextStyle.includeHighlight;
        newVal = !!nodeVals.getPropertyValue('--SC-include-highlight');
// if (oldVal !== newVal) console.log(`includeHighlight | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.includeHighlight = newVal;

        oldVal = currentTextStyle.highlightStyle;
        newVal = nodeVals.getPropertyValue('--SC-highlight-style');
// if (oldVal !== newVal) console.log(`highlightStyle | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.highlightStyle = newVal;

        oldVal = currentTextStyle.lineWidth;
        newVal = parseFloat(nodeVals.getPropertyValue('--SC-stroke-width'));
// if (oldVal !== newVal) console.log(`lineWidth | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.lineWidth = newVal;

        oldVal = currentTextStyle.includeOverline;
        newVal = !!nodeVals.getPropertyValue('--SC-include-overline');
// if (oldVal !== newVal) console.log(`includeOverline | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.includeOverline = newVal;

        oldVal = currentTextStyle.overlineOffset;
        newVal = parseFloat(nodeVals.getPropertyValue('--SC-overline-offset'));
// if (oldVal !== newVal) console.log(`overlineOffset | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.overlineOffset = newVal;

        oldVal = currentTextStyle.overlineStyle;
        newVal = nodeVals.getPropertyValue('--SC-overline-style');
// if (oldVal !== newVal) console.log(`overlineStyle | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.overlineStyle = newVal;

        oldVal = currentTextStyle.overlineWidth;
        newVal = parseFloat(nodeVals.getPropertyValue('--SC-overline-width'));
// if (oldVal !== newVal) console.log(`overlineWidth | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.overlineWidth = newVal;

        oldVal = currentTextStyle.includeUnderline;
        newVal = !!nodeVals.getPropertyValue('--SC-include-underline');
// if (oldVal !== newVal) console.log(`includeUnderline | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.includeUnderline = newVal;

        oldVal = currentTextStyle.underlineGap;
        newVal = parseFloat(nodeVals.getPropertyValue('--SC-underline-gap'));
// if (oldVal !== newVal) console.log(`underlineGap | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.underlineGap = newVal;

        oldVal = currentTextStyle.underlineOffset;
        newVal = parseFloat(nodeVals.getPropertyValue('--SC-underline-offset'));
// if (oldVal !== newVal) console.log(`underlineOffset | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.underlineOffset = newVal;

        oldVal = currentTextStyle.underlineStyle;
        newVal = nodeVals.getPropertyValue('--SC-underline-style');
// if (oldVal !== newVal) console.log(`underlineStyle | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.underlineStyle = newVal;

        oldVal = currentTextStyle.underlineWidth;
        newVal = parseFloat(nodeVals.getPropertyValue('--SC-underline-width'));
// if (oldVal !== newVal) console.log(`underlineWidth | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.underlineWidth = newVal;

        unit.style.set(unitSet, true);
        currentTextStyle.set(unitSet, true);
    };

    // Local helper function `setupTester`
    // + called by main function, assigns default text styles to the tester div
    const setupTester = () => {

        tester.style.setProperty('direction', defaultTextStyle.direction);
        tester.style.setProperty('font-family', defaultTextStyle.fontFamily);
        tester.style.setProperty('font-kerning', defaultTextStyle.fontKerning);
        tester.style.setProperty('font-size', defaultTextStyle.fontSize);
        tester.style.setProperty('font-stretch', defaultTextStyle.fontStretch);
        tester.style.setProperty('font-style', defaultTextStyle.fontStyle);
        tester.style.setProperty('font-variant-caps', defaultTextStyle.fontVariantCaps);
        tester.style.setProperty('font-weight', defaultTextStyle.fontWeight);
        tester.style.setProperty('letter-spacing', defaultTextStyle.get('letterSpacing'));
        tester.style.setProperty('text-rendering', defaultTextStyle.textRendering);
        tester.style.setProperty('word-spacing', defaultTextStyle.get('wordSpacing'));

        tester.style.setProperty('--SC-fill-style', defaultTextStyle.fillStyle);
        tester.style.setProperty('--SC-highlight-style', defaultTextStyle.highlightStyle);
        tester.style.setProperty('--SC-overline-offset', defaultTextStyle.overlineOffset);
        tester.style.setProperty('--SC-overline-style', defaultTextStyle.overlineStyle);
        tester.style.setProperty('--SC-overline-width', defaultTextStyle.overlineWidth);
        tester.style.setProperty('--SC-stroke-width', defaultTextStyle.lineWidth);
        tester.style.setProperty('--SC-stroke-style', defaultTextStyle.strokeStyle);
        tester.style.setProperty('--SC-underline-gap', defaultTextStyle.underlineGap);
        tester.style.setProperty('--SC-underline-offset', defaultTextStyle.underlineOffset);
        tester.style.setProperty('--SC-underline-style', defaultTextStyle.underlineStyle);
        tester.style.setProperty('--SC-underline-width', defaultTextStyle.underlineWidth);

        tester.className = this.name;
        tester.innerHTML = rawText;
    };


    // Start processing data here
    const { rawText, defaultTextStyle, textUnits } = this;

    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle, 'style-worker');

    let cursor = 0;

    setupTester();
    processNode(tester);
};


P.layoutText = function () {

// console.log(this.name, `layoutText (trigger: dirtyTextLayout ${this.dirtyTextLayout}, checks: currentFontIsLoaded' ${this.currentFontIsLoaded}`);

    if (this.currentFontIsLoaded) {

        if (this?.lines.length && this?.textUnits.length) {

            this.dirtyTextLayout = false;

            this.textUnits.forEach(unit => {

                unit.stampFlag = true;
                unit.lineOffset = 0;
            });

            this.assignTextUnitsToLines();
            this.positionTextUnits();
        }
    }
};


P.assignTextUnitsToLines = function () {

// console.log(this.name, 'assignTextUnitsToLines (trigger: none - called by layoutText');

    const {
        lines,
        textUnits,
    } = this;

    const unitArrayLength = textUnits.length;

    let unitCursor = 0,
        lengthRemaining,
        i, unit, len, type;

    // TODO - this currently works for rows; will work for columns if each textUnit `len` is set to the font height, with spaces having 0 or minimal values?
    // + Setting `len` happens elsewhere. This function just processes the data
    lines.forEach(line => {

        const {
            length: lineLength,
            unitData,
        } = line;

        lengthRemaining = lineLength;

        for (i = unitCursor; i < unitArrayLength; i++) {

            unit = textUnits[i];

            ({ len, type } = unit);

            if (len < lengthRemaining) {

                lengthRemaining -= len;
                unitData.push(unitCursor);
                ++unitCursor;
            }
            else {

                // Check to see if the last successful character added to the line was a soft hyphen
                unit = textUnits[unitCursor - 1];

                if (unit?.type === TEXT_TYPE_SOFT_HYPHEN) {

                    unitData.pop();
                    unitData.push(TEXT_TYPE_SOFT_HYPHEN);
                }
                break;
            }
        }
    });

    // Truncation
   if (unitArrayLength !== unitCursor) {

        const unitData = lines[lines.length - 1].unitData,
            mutableUnitData = [...unitData];

        for (i = unitData.length - 1; i >= 0; i--) {

            type = textUnits[unitData[i]]?.type;

            if (type !== TEXT_TYPE_CHARS) mutableUnitData.pop();
            else {

                mutableUnitData.pop();
                mutableUnitData.push(TEXT_TYPE_TRUNCATE);
                unitData.length = 0;
                unitData.push(...mutableUnitData);
                break;
            }
        }
    }
};


P.positionTextUnits = function () {

// console.log(this.name, 'positionTextUnits (trigger: none - called by layoutText');

    if (this.useLayoutEngineAsPath) this.positionTextUnitsAlongPath();
    else this.positionTextUnitsInSpace();
};


P.positionTextUnitsAlongPath = function () {

// console.log(this.name, 'positionTextUnitsAlongPath (trigger: none - called by positionTextUnits');

};


P.positionTextUnitsInSpace = function () {

// console.log(this.name, 'positionTextUnitsInSpace (trigger: none - called by positionTextUnits');

    const {
        lines,
        textUnits,
        justifyLine,
        defaultTextStyle,
    } = this;

    // We're justifying text, thus we need to know what direction the language/font considers to be its natural starting side (left/right) which we can then use when determining what justifying to start/end means
    const languageDirectionIsLtr = (defaultTextStyle.direction === LTR);

    let unit, length, unitData, unitLengths, unitIndices, noOfSpaces, spaceStep, spaceRemaining;

    const initialDistances = [],
        adjustedDistances = [];

    lines.forEach(line => {

        ({ length, unitData } = line);

        // only process lines that have textUnits
        if (unitData.length) {

            unitIndices = unitData.length - 1;

            unitLengths = 0;
            noOfSpaces = 0;
            spaceStep = 0;
            initialDistances.length = 0;
            adjustedDistances.length = 0;

            // Get distances that need to be processed
            unitData.forEach((unitIndex, dataIndex) => {

                if (unitIndex.toFixed) {

                    unit = textUnits[unitIndex];

                    // We ignore spaces at the start/end of the line
                    if ((dataIndex === 0 || dataIndex === unitIndices) && unit.type === TEXT_TYPE_SPACE) unit.stampFlag = false;

                    // Populate the initialDistances array, and keep a running total of the current length used
                    if (unit.stampFlag) {

                        initialDistances.push(unitLengths)
                        unitLengths += unit.len - unit.kernOffset;

                        // keep a count of the number of spaces within the line
                        if (justifyLine === FULL && unit.type === TEXT_TYPE_SPACE) noOfSpaces++;
                    }
                }
            });

            // Unused space
            spaceRemaining = length - unitLengths;

            // Add unused space to distances as we push data into adjustedDistances
            switch (justifyLine) {

                // If justify is 'end', we add unused space to all distances
                case END :

                    adjustedDistances.push(...initialDistances.map(d => d + spaceRemaining));
                    break;

                // If justify is 'center', we add half the unused space to all distances
                case CENTER :

                    spaceRemaining /= 2;
                    adjustedDistances.push(...initialDistances.map(d => d + spaceRemaining));
                    break;

                // If justify is 'full' ... we handle this case below
                case FULL :

                    if (noOfSpaces) spaceStep = spaceRemaining / noOfSpaces;

                    adjustedDistances.push(...initialDistances);
                    break;

                // If justify is 'start' ... no distance adjustments required
                default :

                    adjustedDistances.push(...initialDistances);
            }

            // Full justify text needs special processing as we only want to add portions of remaining space to each of the relevant 'space' text units
            if (justifyLine === FULL) {

                unitIndices = 0;

                unitData.forEach(unitIndex => {

                    unit = textUnits[unitIndex];

                    if (unit?.stampFlag) {

                        unitIndices++

                        if (unit.type === TEXT_TYPE_SPACE) {

                            for (let i = unitIndices, iz = adjustedDistances.length; i < iz; i++) {

                                adjustedDistances[i] += spaceStep;
                            }
                        }
                    }
                });
            }

            // Now we can update the relevant textUnit objects. This is where we take into account the language/font preference for what they consider to be their natural start/end sides
            unitData.forEach(u => {

                if (u.toFixed) {

                    unit = textUnits[u];

                    if (unit.stampFlag) {

                        if (languageDirectionIsLtr) unit.lineOffset = adjustedDistances.shift();
                        else unit.lineOffset = length - unit.len - adjustedDistances.shift();
                    }
                }
            });
        }
    });
};


P.measureTextUnits = function () {

// console.log(this.name, 'MEASURE_TEXT_UNITS (trigger: none - called by cleanText');

    const { textUnits, defaultTextStyle, state } = this;

    const mycell = requestCell(),
        engine = mycell.engine;

    let res, chars, type, style, len, nextUnit, nextStyle, nextChars, nextType, nextLen, unkernedLen;

    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle, 'measure-worker');

    this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, mycell);

    textUnits.forEach(t => {

        ({chars, type, style} = t);

        if (style) this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, mycell);

        res = engine.measureText(chars);

        if (type === TEXT_TYPE_SPACE) t.len = res.width + currentTextStyle.wordSpaceValue;
        else t.len = res.width;
    });

    // Gather kerning data (if required)
    if (this.useLayoutEngineAsPath || !this.breakTextOnSpaces || this.allowSubUnitStyling) {

        textUnits.forEach((unit, index) => {

            ({chars, type, style, len} = unit);

            if (style) this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, mycell);

            // Do we need to perform this work?
            if (currentTextStyle.fontKerning !== NONE) {

                nextUnit = textUnits[index + 1];

                // No need to kern the last textUnit
                if (nextUnit) {

                    ({ style: nextStyle, chars: nextChars, type: nextType, len: nextLen} = nextUnit);

                    // We don't need to kern anything next to a space, or the space itself
                    if (type !== TEXT_TYPE_SPACE && nextType !== TEXT_TYPE_SPACE) {

                        // We won't kern anything that's changing style in significant ways
                        if (!nextStyle || !(nextStyle.fontFamily || nextStyle.fontSize || nextStyle.fontVariantCaps)) {

                            unkernedLen = len + nextLen;

                            res = engine.measureText(`${chars}${nextChars}`);

                            // the kerning applies the the next textUnit, not the current one
                            nextUnit.kernOffset = unkernedLen - res.width;
                        }
                    }
                }
            }
        });
    }
// console.log(textUnits);

    releaseCell(mycell);
};

P.calculateLines = function () {

// console.log(this.name, 'calculateLines (trigger: none - called by cleanLayout');

    // Local functions to find the points where a given line crosses the layout engine's shape border
    const getEndPoints = (x, y) => {

        const results = [];

        const edgePoints = walkTheLine(x, y, width);

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

    const walkTheLine = (x, y, dim) => {

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
    }


    // Main functionality
    const mycell = requestCell();
    const coord = requestCoordinate();

    const engine = mycell.engine;

    const {
        alignment,
        defaultTextStyle,
        layoutEngine,
        layoutEngineLineOffset,
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
        fontSizeValue,
    } = defaultTextStyle;

    const rotation = -alignment * _radian;
    const rotationFix = alignment - currentRotation;

    const step = fontSizeValue * lineSpacing;

    const [constX, constY] = currentStampPosition;
    const [width,] = currentDimensions;

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

    // Main calculations: start with the line closest to the layout engine's `currentStampPosition` attribute
    // + TODO: one bug remains - functionality currently doesn't take into account handle offsets at the first level, which means lines don't generate if the handle pushes the layout entity too far away from the stamp position. This is due to the while/flag interaction. Probably won't fix as it's a bit of an edge case...
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

    // Sort the raw line data
    rawData.sort((a, b) => a[0] - b[0]);

    // Push line data into the `this.lines` array
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
            length: _ceil(d),
            lengthRatio: d / lineLength,
            startPositionInPath: lineVal / lineLength,
            startAt: [...coord.set([sx, sy]).add(currentStampPosition)],
            endAt: [...coord.set([ex, ey]).add(currentStampPosition)],
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

// console.log(`
// ${this.name} prepareStamp`);

    if (this.dirtyHost) this.dirtyHost = false;

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle || this.dirtyRotation) {

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

    if (this.currentHost && this.layoutEngine) {

        if (this.useLayoutEngineAsPath) this.regularStampAlongPath();
        else this.regularStampInSpace();
    }
};

P.regularStampInSpace = function () {

    const dest = this.currentHost;

    if (dest) {

        const layout = this.layoutEngine;

        if (layout) {

            const engine = dest.engine;

            const {
                state,
                lines,
                localPath,
                textUnits,
                defaultTextStyle,
            } = this;

            let sx, sy, unit, style, lineOffset, chars, type, len, offset;

            engine.save();

            const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle, 'stamp-worker');

            this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, dest);

            // TODO: The following code is good only for `textUnitDirection: ROW` situations. We also need code for:
            // + `COLUMN` - where we will 'stack' the text units along the length of the line, rather than laying them out end-to-end.
            // + `ROW_REVERSE` - reverse the layout order (but not the contents) of the text units along the line.
            // + `COLUMN_REVERSE` - reverse the stack order of the text units along the line.
            lines.forEach(line => {

                [sx, sy] = line.startAt;

                line.unitData.forEach((u, uIndex) => {

                    if (u.substring) {

                        // We're at the end of the line but need to add something additional
                        // + For the last line, this will be the default truncation copy (eg: `...`)
                        // + For other lines, this will be displaying a hyphen (eg: `-`) where the word - which included the soft hyphen - has broken across lines.
                        unit = textUnits[line.unitData[uIndex - 1]];

                        ({ type, lineOffset, len } = unit);

                        offset = sx + lineOffset;

                        if (type === TEXT_TYPE_SPACE) dest.rotateDestination(engine, offset, sy, layout);
                        else dest.rotateDestination(engine, offset + len, sy, layout);

                        // TODO - this currently has a minor bug, where the truncation and soft hyphens appear "beyond the border" - for instance when text is end aligned. We need to correct this at the point when we determine the line will have a hyphen/truncation (when we stick the string letter into the line's unitData array). Reducing the spaces equally by small amounts should be a good fix?
                        if (u === TEXT_TYPE_TRUNCATE) engine.fillText(this.truncateString, 0, 0);
                        else if (u === TEXT_TYPE_SOFT_HYPHEN) engine.fillText(this.hyphenString, 0, 0);
                    }
                    else {

                        // Stamp as usual
                        //
                        // TODO: currently only implementing the `fill` method. Need to include `draw`, and possibly `fillAndDraw` and `drawAndFill`
                        unit = textUnits[u];

                        ({style, lineOffset, chars} = unit);

                        if (style) this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, dest);

                        if (unit.stampFlag) {

                            dest.rotateDestination(engine, sx + lineOffset, sy, layout);

                            engine.fillText(chars, 0, 0);
                        }
                    }
                });
            });

            if (localPath) {

                dest.rotateDestination(engine, ...layout.currentStampPosition, layout);

                engine.globalAlpha = 0.3;
                engine.stroke(localPath);
            }

            engine.restore();
        }
    }
};

P.regularStampAlongPath = function () {

    const dest = this.currentHost;

    if (dest) {

        const layout = this.layoutEngine;

        if (layout) {

            // const engine = dest.engine;

            // const { lines, textUnits } = this;
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
