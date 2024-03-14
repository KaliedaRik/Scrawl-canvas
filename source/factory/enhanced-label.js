// # EnhancedLabel factory
// TODO - document purpose and description
//
// To note: EnhancedLabel entitys will, if told to, break words across lines on hard (- U+2010) and soft (&shy U+00AD) hyphens. It makes no effort to guess whether a word _can_ be broken at a given place, regardless of any [CSS settings for the web page/component](https://css-tricks.com/almanac/properties/h/hyphenate/) in which the SC canvas finds itself. For that sort of functionality, use a third party library like [Hyphenopoly](https://github.com/mnater/Hyphenopoly) to pre-process text before feeding it into the entity.


// #### Imports
import { artefact, constructors, cell, cellnames, fontfamilymetadata, fontfamilymetadatanames, group, styles, stylesnames } from '../core/library.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../untracked-factory/text-style.js';
import { makeCoordinate } from '../untracked-factory/coordinate.js';

import { getPixelRatio } from '../core/user-interaction.js';
import { currentGroup } from './canvas.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';
import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';
import { releaseArray, requestArray } from '../helper/array-pool.js';

import baseMix from '../mixin/base.js';
import deltaMix from '../mixin/delta.js';
import textMix from '../mixin/text.js';

import { addStrings, doCreate, mergeOver, pushUnique, removeItem, xta, λthis, Ωempty } from '../helper/utilities.js';

import { _abs, _assign, _ceil, _computed, _cos, _create, _entries, _floor, _freeze, _hypot, _isArray, _isFinite, _keys, _parse, _radian, _round, _setPrototypeOf, _sin, ALPHABETIC, ARIA_LIVE, BLACK, BOTTOM, CENTER, DATA_TAB_ORDER, DESTINATION_OVER, DIV, DRAW, DRAW_AND_FILL, END, ENTITY, FILL, FILL_AND_DRAW, FONT_LENGTH_REGEX, FONT_VARIANT_VALS, FONT_VIEWPORT_LENGTH_REGEX, GOOD_HOST, HANGING, IDEOGRAPHIC, ITALIC, LEFT, LOCKTO, LTR, MIDDLE, NAME, NONE, NORMAL, OBLIQUE, POLITE, PX0, RIGHT, ROUND, ROW, SMALL_CAPS, SOURCE_OUT, SOURCE_OVER, SPACE, SPACE_AROUND, SPACE_BETWEEN, START, STATE_KEYS, T_CANVAS, T_CELL, T_ENHANCED_LABEL, T_ENHANCED_LABEL_LINE, T_ENHANCED_LABEL_UNIT, T_ENHANCED_LABEL_UNITARRAY, T_GROUP, TEXT_HARD_HYPHEN_REGEX, TEXT_LAYOUT_FLOW_COLUMNS, TEXT_LAYOUT_FLOW_REVERSE, TEXT_NO_BREAK_REGEX, TEXT_SOFT_HYPHEN_REGEX, TEXT_SPACES_REGEX, TEXT_TYPE_CHARS, TEXT_TYPE_HYPHEN, TEXT_TYPE_NO_BREAK, TEXT_TYPE_SOFT_HYPHEN, SYSTEM_FONTS, TEXT_TYPE_SPACE, TEXT_TYPE_TRUNCATE, TEXT_TYPE_ZERO_SPACE, TEXT_ZERO_SPACE_REGEX, TOP, UNDEF, ZERO_STR } from '../helper/shared-vars.js';


// #### EnhancedLabel constructor
const EnhancedLabel = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.state = makeState(Ωempty);

    this.defaultTextStyle = makeTextStyle({
        isDefaultTextStyle: true,
    });

    this.cache = null;
    this.set(this.defs);

    if (!items.group) items.group = currentGroup;

    this.currentFontIsLoaded = false;
    this.updateUsingFontParts = false;
    this.updateUsingFontString = false;
    this.usingViewportFontSizing = false;

    this.useMimicDimensions = true;
    this.useMimicFlip = true;
    this.useMimicHandle = true;
    this.useMimicOffset = true;
    this.useMimicRotation = true;
    this.useMimicScale = true;
    this.useMimicStart = true;

    this.delta = {};
    this.deltaConstraints = {};

    this.currentStampPosition = makeCoordinate();

    this.textHandle = makeCoordinate();
    this.textOffset = makeCoordinate();

    this.lines = [];
    this.textUnits = makeTextUnitArray();

    this.underlinePaths = [];
    this.overlinePaths = [];
    this.highlightPaths = [];

    this.guidelineDash = [];

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
textMix(P);


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

// __layoutTemplate__ - artefact object, or artefact's string name attribute.
    layoutTemplate: null,

// __useLayoutTemplateAsPath__ - boolean. If layout engine entity is a path-based entity, then we can either fit the text within it, or use its path for positioning.
    useLayoutTemplateAsPath: false,

// __pathPosition__ - number. Where to start text positioning along the layout engine path.
    pathPosition: 0,

// __alignment__ - number. Rotational positioning of the text units along a path or guideline
    alignment: 0,

// __alignTextUnitsToPath__ - boolean. Forces layout to take into account the path angle. When set to false, all text units will have the same alignment, whose value is set by the `alignment` attribute
    alignTextUnitsToPath: true,

// __lineAdjustment__ - number. Determines the fine-scale positioning of the guidelines within a space
    lineAdjustment: 0,

// __breakTextOnSpaces__ - boolean.
// + When `true` (default), the textUnits will consist of words which are stamped as a unit (which preserves ligatures and kerning within the word).
// + Set this attribute to `false` if the font's language, when written, (generally) doesn't include spaces (eg: Chinese, Japanese), or when there is a requirement to style individual characters within words
    breakTextOnSpaces: true,

// __breakWordsOnHyphens__ - boolean.
// + When `true`, words that include hard or soft hyphens will be split into separate units for processing. Be aware that in highly ligatured fonts this may cause problems. The attribute defaults to `false`.
// + It is possible to style individual characters in a text that breaks on spaces by adding soft hyphens before and after the characters, but it may (will) lead to unnatural-looking word breaks at the end of the line.
// + Attribute has no effect if `breakTextOnSpaces` is `false`.
    breakWordsOnHyphens: false,

// __justifyLine__ - string enum. Allowed values are 'start', 'end', 'center' (default), 'space-between', 'space-around'
// + Determines the positioning of text units along the space layout line. Has nothing to do with the `direction` attribute.
    justifyLine: CENTER,

// __textUnitFlow__ - string enum. Allowed values are 'row' (default), 'row-reverse', 'column' (for vertical text), 'column-reverse'
// + Determines the ordering of text units along the space layout line. Has nothing to do with the `direction` attribute.
    textUnitFlow: ROW,

// __truncateString__ - string.
    truncateString: '…',

// __hyphenString__ - string.
    hyphenString: '-',

// __textHandle__ - Coordinate.
    textHandle: null,
    textOffset: null,

// __showGuidelines__ - boolean.
    showGuidelines: false,
    guidelineStyle: 'rgb(0 0 0 / 0.5)',
    guidelineWidth: 1,
    guidelineDash: null,

// The EnhancedLabel entity does not use the [position](./mixin/position.html) or [entity](./mixin/entity.html) mixins (used by most other entitys) as its positioning is entirely dependent on the position, rotation, scale etc of its constituent Shape path entity struts.
//
// It does, however, use these attributes (alongside their setters and getters): __visibility__, __order__, __delta__, __host__, __group__, __anchor__.
    visibility: true,
    calculateOrder: 0,
    stampOrder: 0,
    host: null,
    group: null,

    method: FILL,

    lockFillStyleToEntity: false,
    lockStrokeStyleToEntity: false,

    cacheOutput: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['pathObject', 'mimicked', 'pivoted', 'state']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, ['^(local|dirty|current)', 'Subscriber$']);
P.packetCoordinates = pushUnique(P.packetCoordinates, ['start', 'handle', 'offset']);
P.packetObjects = pushUnique(P.packetObjects, ['group', 'layoutTemplate']);
P.packetFunctions = pushUnique(P.packetFunctions, ['onEnter', 'onLeave', 'onDown', 'onUp']);

P.processPacketOut = function (key, value, inc) {

    return this.processEntityPacketOut(key, value, inc);
};

// handles both anchor and button objects
P.handlePacketAnchor = function (copy, items) {

    return copy;
}

P.processEntityPacketOut = function (key, value, incs) {

    return this.processFactoryPacketOut(key, value, incs);
};

P.processFactoryPacketOut = function (key, value, incs) {

    let result = true;

    if(!incs.indexOf(key) && value === this.defs[key]) result = false;

    return result;
};

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
        method: defaultTextCopy.method,
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

    return copy;
};


// #### Clone management
P.postCloneAction = function(clone, items) {

    return clone;
};


// #### Kill management
P.kill = function (flag1 = false, flag2 = false) {

    const name = this.name;

    // Remove artefact from all groups
    _values(group).forEach(val => {

        if (val.artefacts.includes(name)) val.removeArtefacts(name);
    });

    // If the artefact has an anchor, it needs to be removed
    if (this.anchor) this.demolishAnchor();

    // If the artefact has a button, it needs to be removed
    if (this.button) this.demolishButton();

    // Remove from other artefacts
    _values(artefact).forEach(val => {

        if (val.name !== name) {

            if (val.pivot && val.pivot.name === name) val.set({ pivot: false});
            if (val.mimic && val.mimic.name === name) val.set({ mimic: false});
            if (val.path && val.path.name === name) val.set({ path: false});
            if (val.generateAlongPath && val.generateAlongPath.name === name) val.set({ generateAlongPath: false});
            if (val.generateInArea && val.generateInArea.name === name) val.set({ generateInArea: false});
            if (val.artefact && val.artefact.name === name) val.set({ artefact: false});

            if (_isArray(val.pins)) {

                val.pins.forEach((item, index) => {

                    if (isa_obj(item) && item.name === name) val.removePinAt(index);
                });
            }
        }
    });

    // Remove from tweens and actions targets arrays
    _values(tween).forEach(val => {

        if (val.checkForTarget(name)) val.removeFromTargets(this);
    });

    // Factory-specific actions required to complete the kill
    this.factoryKill(flag1, flag2);

    // Remove artefact from the Scrawl-canvas library
    this.deregister();

    return this;
};

P.factoryKill = function () {

    this.dirtyCache();

    if (this.accessibleTextHold) this.accessibleTextHold.remove();

    const hold = this.getCanvasTextHold(this.currentHost);
    if (hold) hold.dirtyTextTabOrder = true;
};


// #### Get, Set, deltaSet
// Label-related `get`, `set` and `deltaSet` functions need to take into account the entity State and default TextStyles objects, whose attributes can be retrieved/amended directly on the entity object
const TEMPLATE_PASS_THROUGH_KEYS = _freeze(['width', 'height', 'dimensions', 'startX', 'startY', 'start', 'position', 'handleX', 'handleY', 'handle', 'offsetX', 'offsetY', 'offset', 'roll', 'scale', 'flipReverse', 'flipUpend']);

const TEXTSTYLE_KEYS = _freeze([ 'canvasFont', 'direction','fillStyle', 'fontFamily', 'fontKerning', 'fontSize', 'fontStretch', 'fontString', 'fontStyle', 'fontVariantCaps', 'fontWeight', 'highlightStyle', 'includeHighlight', 'includeUnderline', 'letterSpaceValue', 'letterSpacing', 'lineDash', 'lineDashOffset', 'lineWidth', 'overlineOffset', 'overlineStyle', 'overlineWidth', 'strokeStyle', 'textRendering', 'underlineGap', 'underlineOffset', 'underlineStyle', 'underlineWidth', 'wordSpaceValue', 'wordSpacing', 'method']);

const LABEL_DIRTY_FONT_KEYS = _freeze(['direction', 'fontKerning', 'fontSize', 'fontStretch', 'fontString', 'fontStyle', 'fontVariantCaps', 'fontWeight', 'letterSpaceValue', 'letterSpacing', 'scale', 'textRendering', 'wordSpaceValue', 'wordSpacing']);

const LABEL_UPDATE_PARTS_KEYS = _freeze(['fontFamily', 'fontSize', 'fontStretch', 'fontStyle', 'fontVariantCaps', 'fontWeight']);

const LABEL_UPDATE_FONTSTRING_KEYS = _freeze(['fontString', 'scale']);

const LABEL_UNLOADED_FONT_KEYS = _freeze(['fontString']);

const LAYOUT_KEYS = _freeze(['lineSpacing', 'textUnitFlow', 'lineAdjustment', 'alignment', 'justifyLine', 'flipReverse', 'flipUpend', 'alignTextUnitsToPath', 'lockFillStyleToEntity', 'lockStrokeStyleToEntity']);

P.get = function (key) {

    const {defs, getters, state, defaultTextStyle, layoutTemplate} = this;

    const defaultTextStyleGetters = (defaultTextStyle) ? defaultTextStyle.getters : Ωempty;
    const defaultTextStyleDefs = (defaultTextStyle) ? defaultTextStyle.defs : Ωempty;

    const stateGetters = (state) ? state.getters : Ωempty;
    const stateDefs = (state) ? state.defs : Ωempty;

    let fn;

    if (layoutTemplate && TEMPLATE_PASS_THROUGH_KEYS.includes(key)) {

        return layoutTemplate.get(key);
    }
    if (TEXTSTYLE_KEYS.includes(key)) {

        fn = defaultTextStyleGetters[key];

        if (fn) return fn.call(defaultTextStyle);
        else if (typeof defaultTextStyleDefs[key] != UNDEF) return defaultTextStyle[key];
    }
    if (STATE_KEYS.includes(key)) {

        fn = stateGetters[key];

        if (fn) return fn.call(state);
        else if (typeof stateDefs[key] != UNDEF) return state[key];
    }

    fn = getters[key];

    if (fn) return fn.call(this);
    else if (typeof defs[key] != UNDEF) return this[key];

    return null;
};

P.set = function (items = Ωempty) {

    const keys = _keys(items),
        len = keys.length;

    if (len) {

        this.dirtyCache();

        const {defs, setters, state, defaultTextStyle, layoutTemplate} = this;

        const defaultTextStyleSetters = (defaultTextStyle) ? defaultTextStyle.setters : Ωempty;
        const defaultTextStyleDefs = (defaultTextStyle) ? defaultTextStyle.defs : Ωempty;

        const stateSetters = (state) ? state.setters : Ωempty;
        const stateDefs = (state) ? state.defs : Ωempty;

        let fn, i, key, val;

        for (i = 0; i < len; i++) {

            key = keys[i];
            val = items[key];

            if (key && key != NAME && val != null) {

                if (layoutTemplate && TEMPLATE_PASS_THROUGH_KEYS.includes(key)) {

                    layoutTemplate.set({[key]: val});
                }
                else if (TEXTSTYLE_KEYS.includes(key)) {

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

                if (LAYOUT_KEYS.includes(key) || TEXTSTYLE_KEYS.includes(key)) this.dirtyLayout = true;

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

        this.dirtyCache();

        const {defs, deltaSetters:setters, state, defaultTextStyle, layoutTemplate} = this;

        const defaultTextStyleSetters = (defaultTextStyle) ? defaultTextStyle.deltaSetters : Ωempty;
        const defaultTextStyleDefs = (defaultTextStyle) ? defaultTextStyle.defs : Ωempty;

        const stateSetters = (state) ? state.deltaSetters : Ωempty;
        const stateDefs = (state) ? state.defs : Ωempty;

        let fn, i, key, val;

        for (i = 0; i < len; i++) {

            key = keys[i];
            val = items[key];

            if (key && key != NAME && val != null) {

                if (layoutTemplate && TEMPLATE_PASS_THROUGH_KEYS.includes(key)) {

                    layoutTemplate.setDelta({[key]: val});
                }
                else if (TEXTSTYLE_KEYS.includes(key)) {

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

                if (LAYOUT_KEYS.includes(key) || TEXTSTYLE_KEYS.includes(key)) this.dirtyLayout = true;

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

// __layoutTemplate__ - TODO: documentation
S.layoutTemplate = function (item) {

    if (item) {

        const oldTemplate = this.layoutTemplate,
            newTemplate = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newTemplate && newTemplate.name) {

            if (oldTemplate && oldTemplate.name !== newTemplate.name) {

                if (oldTemplate.mimicked) removeItem(oldTemplate.mimicked, name);
                if (oldTemplate.pathed) removeItem(oldTemplate.pathed, name);
            }

            if (newTemplate.mimicked) pushUnique(newTemplate.mimicked, name);
            if (newTemplate.pathed) pushUnique(newTemplate.pathed, name);

            this.layoutTemplate = newTemplate;

            this.dirtyPathObject = true;
            this.dirtyLayout = true;
        }
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

S.textHandleX = function (item) {

    this.textHandle[0] = item;
    this.dirtyLayout = true;
};
S.textHandleY = function (item) {

    this.textHandle[1] = item;
    this.dirtyLayout = true;
};
S.textHandle = function (item) {

    if (_isArray(item) && item.length > 1) {

        this.textHandle[0] = item[0];
        this.textHandle[1] = item[1];
        this.dirtyLayout = true;
    }
};

S.guidelineDash = function (item) {

    if (_isArray(item)) this.guidelineDash = item;
};

S.guidelineStyle = function (item) {

    if (!item) this.guidelineStyle = this.defs.guidelineStyle;
    else if (item.substring) this.guidelineStyle = item;
};

S.pathPosition = function (item) {

    if (item < 0) item = _abs(item);
    if (item > 1) item = item % 1;

    this.pathPosition = parseFloat(item.toFixed(6));

    this.dirtyTextLayout = true;
};
D.pathPosition = function (item) {

    let pos = this.pathPosition + item

    if (pos < 0) pos += 1;
    if (pos > 1) pos = pos % 1;

    this.pathPosition = parseFloat(pos.toFixed(6));

    this.dirtyTextLayout = true;
};

S.textUnitFlow = function (item) {

    this.textUnitFlow = item;
    this.dirtyText = true;
};



// #### Prototype functions

// `recalculateFont` - force the entity to recalculate its dimensions without having to set anything.
// + Can also be invoked via the entity's Group object's `recalculateFonts` function
// + Can be invoked globally via the `scrawl.recalculateFonts` function
// + When triggered by userInteraction listener (browser dimensions have changed) we only care about it if we have font sizes relative to the viewport
P.recalculateFont = function (fromUserInteractionListener = false) {

    if (fromUserInteractionListener) {

        if (this.usingViewportFontSizing) this.dirtyFont = true;
    }
    else this.dirtyFont = true;
};

// `getTester` - Retrieve the DOM labelStylesCalculator &lt;div> element
P.getTester = function () {

// console.log(this.name, 'getTester (trigger: none. Called by: assessTextForStyle, S.text)');

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

// `getControllerCell` - Retrieve the entity's controller Cell wrapper
P.getControllerCell = function () {

// console.log(this.name, 'getControllerCell (trigger: none. Called by: assessTextForStyle, S.text)');

    const group = this.group;

    if (group) {

        const host = (group && group.getHost) ? group.getHost() : null;

        if (host) return host.getController();
    }
    return null;
};


// `makeWorkingTextStyle` - Clone a TextStyle object
P.makeWorkingTextStyle = function (template) {

// console.log(this.name, 'makeWorkingTextStyle (trigger: various)');

    const workStyle = _create(template);
    _assign(workStyle, template);

    workStyle.isDefaultTextStyle = false;

    return workStyle;
};


// `setEngineFromWorkingTextStyle` - Sets the state object to current working requirements, alongside directly updating the Cell's engine to match
P.setEngineFromWorkingTextStyle = function (worker, style, state, cell) {

// console.log(this.name, 'setEngineFromWorkingTextStyle (trigger: various)');

    this.updateWorkingTextStyle(worker, style);
    state.set(worker);
    cell.setEngine(this);
};


// `updateWorkingTextStyle` - Updates the working TextStyle object with a partial TextStyle object, and regenerates font strings from the updated data
// + Takes into account the layout entity's current scaling factor
P.updateWorkingTextStyle = function (worker, style) {

// console.log(this.name, 'updateWorkingTextStyle (trigger: various)');

    const scale = this.layoutTemplate?.currentScale || 1;
    worker.set(style, true);
    this.updateCanvasFont(worker, scale);
    this.updateFontString(worker);
};

// `updateCanvasFont` - Updates the given TextStyle object's canvasFont string attribute'
P.updateCanvasFont = function (style, scale) {

// console.log(this.name, 'updateCanvasFont (trigger: various)');

    const { fontStyle, fontVariantCaps, fontWeight, fontSize, fontFamily } = style

    let f = '';

    if (fontStyle == ITALIC || fontStyle.includes(OBLIQUE)) f += `${fontStyle} `;
    if (fontVariantCaps == SMALL_CAPS) f += `${fontVariantCaps} `;
    if (fontWeight != null && fontWeight && fontWeight !== NORMAL && fontWeight !== '400') f += `${fontWeight} `;
    f += `${parseFloat(fontSize) * scale}px ${fontFamily}`

    style.canvasFont = f;
};

// `updateFontString` - Updates the given TextStyle object's fontString string attribute'
P.updateFontString = function (style) {

// console.log(this.name, 'updateFontString (trigger: various)');

    const { fontStretch, fontStyle, fontVariantCaps, fontWeight, fontSize, fontFamily } = style

    let f = '';

    if (fontStretch != null && fontStretch && fontStretch !== NORMAL) f += `${fontStretch} `;
    if (fontStyle != null && fontStyle && fontStyle !== NORMAL) f += `${fontStyle} `;
    if (fontVariantCaps != null && fontVariantCaps && fontVariantCaps !== NORMAL) f += `${fontVariantCaps} `;
    if (fontWeight != null && fontWeight && fontWeight !== NORMAL && fontWeight !== '400') f += `${fontWeight} `;

    f += `${fontSize} ${fontFamily}`;

    style.fontString = f;
};

// `getTextHandleX` - Calculate the horizontal offset required for a given TextUnit
P.getTextHandleX = function (val, dim, dir) {

// console.log(this.name, 'getTextHandleX (trigger: various)');

    if (val.toFixed) return val;
    if (val === START) return (dir === LTR) ? 0 : dim;
    if (val === CENTER) return dim / 2;
    if (val === END) return (dir === LTR) ? dim : 0;
    if (val === LEFT) return 0;
    if (val === RIGHT) return dim;
    if (!_isFinite(parseFloat(val))) return 0;

    return (parseFloat(val) / 100) * dim;
};

// `getTextHandleY` - Calculate the vertical offset required for a given TextUnit
P.getTextHandleY = function (val, size, font) {

// console.log(this.name, 'getTextHandleY (trigger: various)', val, size, font);

    const meta = this.getFontMetadata(font);

    const {
        alphabeticRatio,
        hangingRatio,
        height,
        ideographicRatio,
    } = meta;

    const ratio = size / 100;
    const scale = this.layoutTemplate?.currentScale || 1;

    const dim = height * ratio;

    if (val.toFixed) return val * scale;
    if (val === TOP) return 0;
    if (val === BOTTOM) return dim * scale;
    if (val === CENTER) return (dim / 2) * scale;
    if (val === ALPHABETIC) return dim * alphabeticRatio * scale;
    if (val === HANGING) return dim * hangingRatio * scale;
    if (val === IDEOGRAPHIC) return dim * ideographicRatio * scale;
    if (val === MIDDLE) return (dim / 2) * scale;
    if (!_isFinite(parseFloat(val))) return 0;

    return (parseFloat(val) / 100) * dim;
};

// `getTextOffset` - Calculate the horizontal offset required for a given TextUnit
P.getTextOffset = function (val, dim) {

// console.log(this.name, 'getTextOffset (trigger: various)');

    if (val.toFixed) return val;
    if (!_isFinite(parseFloat(val))) return 0;

    return (parseFloat(val) / 100) * dim;
};

P.dirtyCache = function () {

    releaseCell(this.cache);
    this.cache = null;
};


// `temperFont` - manipulate the user-supplied font string to create a font string the canvas engine can use
// + This is the preparation step
P.temperFont = function () {

// console.log(this.name, 'temperFont (trigger: none - called by cleanFont once font has loaded)');

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

            this.calculateTextStyleFontStrings(defaultTextStyle, fontSizeCalculator, fontSizeCalculatorValues);
        }
    }
};

// `checkFontIsLoaded` - chcks the document object to check if the supplied font has been loaded by the browser and is ready to use
P.checkFontIsLoaded = function (font) {

    // console.log('checkFontIsLoaded (trigger: cleanFont)', font);

    if (font == null) {

        this.currentFontIsLoaded = false;
        // console.log('checkFontIsLoaded error: argument is undefined');
    }
    else if (SYSTEM_FONTS.includes(font)) {

        // console.log('checkFontIsLoaded success: system font detected');
        this.currentFontIsLoaded = true;
    }
    else {

        if (this.currentFontIsLoaded != null && !this.currentFontIsLoaded) {

            this.currentFontIsLoaded = null;

            const fonts = document.fonts;

            // console.log('checkFontIsLoaded update: invoking async load check');

            fonts.load(font)
            .then (() => {

                this.currentFontIsLoaded = true;
                // console.log('checkFontIsLoaded load invocation completed successfully:', font);
            })
            .catch (() => {

                this.currentFontIsLoaded = false;
                // console.log('checkFontIsLoaded load invocation error:', font, e);
            });
        }
        else {

            // console.log('checkFontIsLoaded issue: prior check is still progressing');
        }
    }
};

// `calculateTextStyleFontStrings` - manipulate the user-supplied font string to create a font string the canvas engine can use
// + This is the process step. We use it to set the default TextStyle object's font-related attributes
// + Once we have that data, we can clone the default TextStyle object to perform dynamic updates as calculations, and then the stamp process proceed
P.calculateTextStyleFontStrings = function (textStyle, calculator, results) {

// console.log(this.name, 'calculateTextStyleFontStrings (trigger: none - called by temperFont)');

    let fontSize = textStyle.fontSize;
    const { fontStretch, fontStyle, fontWeight, fontVariantCaps, fontString } = textStyle;
    const { updateUsingFontParts, updateUsingFontString, layoutTemplate } = this;

    const scale = layoutTemplate?.currentScale || 1;

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
    else if (scale != 1) calculator.style.fontSize = fontSize;

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

    // User can set lineSpacing attribute via the font string
    if (fontString.includes('/')) {

        const lh = parseFloat(results.lineHeight);
        this.lineSpacing = (_isFinite(lh)) ? lh / elSizeValue : this.defs.lineSpacing;
        this.dirtyLayout = true;
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


// `getFontMetadata` - generate basic font metadata
P.getFontMetadata = function (fontFamily) {

// console.log(this.name, 'getFontMetadata (trigger: none - called by getTextHandleY, calculateTextStyleFontStrings)');

    if (fontFamily) {

        const font = `100px ${fontFamily}`;

        if (fontfamilymetadatanames.includes(font)) return fontfamilymetadata[font];

        const mycell = requestCell(),
            engine = mycell.engine;

        engine.textAlign = LEFT;
        engine.textBaseline = TOP;
        engine.font = font;

        const metrics = engine.measureText(SPACE);

        const { actualBoundingBoxAscent, actualBoundingBoxDescent, fontBoundingBoxAscent, fontBoundingBoxDescent, alphabeticBaseline, hangingBaseline, ideographicBaseline} = metrics;

        let height = fontBoundingBoxAscent + fontBoundingBoxDescent;

        if (!_isFinite(height)) height = _ceil(_abs(actualBoundingBoxDescent) + _abs(actualBoundingBoxAscent));

        const verticalOffset = _isFinite(fontBoundingBoxAscent) ? fontBoundingBoxAscent : actualBoundingBoxAscent

        fontfamilymetadatanames.push(font);
        fontfamilymetadata[font] = {
            height,
            alphabeticRatio: _abs((alphabeticBaseline - verticalOffset) / height),
            hangingRatio: _abs((hangingBaseline - verticalOffset) / height),
            ideographicRatio: _abs((ideographicBaseline - verticalOffset) / height),
            verticalOffset,
        }

        releaseCell(mycell);

        return fontfamilymetadata[font];
    }
};

// `convertTextEntityCharacters`
// + Converts HTMLentity copy - such as changing `&epsilon;` to an &epsilon; letter
// + We also strip the supplied text of all HTML markup
P.convertTextEntityCharacters = function (item) {

// console.log(this.name, 'convertTextEntityCharacters');
    textEntityConverter.innerHTML = item;
    return textEntityConverter.textContent;
};

// `getStyle` - internal helper function to find a gradient, pattern, cell or string style
P.getStyle = function (val, stateAlternative, host) {

    // Always return opaque black if the `host` argument is missing
    if (host == null) return BLACK;

    // When the supplied `val` is an empty string (eg for an underline) we use the default state value for it
    // + Where `stateAlternative` is either 'fillStyle' or 'strokeStyle'
    if (!val) val = this.state[stateAlternative];

    // Always return opaque black if the `val` argument was undefined
    // + Or we can't locate a substitute for a falsy `val` argument.
    if (val == null) return BLACK;

    // The supplied val is either a color string, or the `name` attribute of a gradient/pattern/Cell object
    if (val.substring) {

        let brokenStyle = null;

        // Refers to a gradient or pattern object
        if (stylesnames.includes(val)) brokenStyle = styles[val];

        // Refers to a Cell wrapper being used as a pattern
        else if (cellnames.includes(val)) brokenStyle = cell[val];

        // `val` is not a color string, so we generate the gradient/pattern to be applied to the host
        if (brokenStyle != null) val = brokenStyle.getData(this, host);
    }
    // `val` is a gradient/pattern/Cell object. Do the work required
    else val = val.getData(this, host);

    // Return the results of our work
    // + If `val` was a color string, it gets returned as-is
    return val;
};


// #### Accessibility functions
// `getCanvasTextHold` - get a handle for the &lt;canvas> element's child text hold &lt;div>
P.getCanvasTextHold = function (item) {

    if (item?.type === T_CELL && item?.controller?.type === T_CANVAS && item?.controller?.textHold) return item.controller;

    // For non-based Cells we have to make a recursive call to find the &lt;canvas> host
    if (item && item.type === T_CELL && item.currentHost) return this.getCanvasTextHold(item.currentHost);

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

// `cleanFont` - Performs a check to make sure we have a font to process
P.cleanFont = function () {

// console.log(this.name, 'cleanFont (trigger: dirtyFont)', this.dirtyFont);

    if (this.currentFontIsLoaded) {

        this.dirtyFont = false;
        this.temperFont();
    }
    else this.checkFontIsLoaded(this.defaultTextStyle.fontString);
};


// `cleanPathObject` - calculate the EnhancedLabel entity's __Path2D object__
P.cleanPathObject = function () {

// console.log(this.name, `cleanPathObject (trigger: dirtyPathObject ${this.dirtyPathObject}, checks: layout.pathObject ${this.layoutTemplate?.pathObject})`);

    const layout = this.layoutTemplate;

    if (this.dirtyPathObject && layout?.pathObject) {

        this.dirtyPathObject = false;

        this.pathObject = new Path2D(layout.pathObject);
    }
};


// `cleanLayout` - recalculate the positioning of all TextUnits in the space or along the path
P.cleanLayout = function () {

// console.log(this.name, `cleanLayout (triggers: dirtyLayout ${this.dirtyLayout}, checks: currentFontIsLoaded ${this.currentFontIsLoaded})`);

    if (this.currentFontIsLoaded) {

        this.dirtyLayout = false;

        if (!this.useLayoutTemplateAsPath) this.calculateLines();

        this.dirtyTextLayout = true;
    }
};


// `calculateLines` - calculate the positions and lengths of multiple lines withing a layout entity's enclosed space.
P.calculateLines = function () {

// console.log(this.name, 'calculateLines (trigger: none - called by cleanLayout');

    const {
        alignment,
        defaultTextStyle,
        layoutTemplate,
        lineAdjustment,
        lines,
        lineSpacing,
        textUnitFlow,
    } = this;

    const {
        currentDimensions,
        currentScale,
        currentRotation,
        currentStampPosition,
        pathObject,
        winding,
    } = layoutTemplate;

    const { fontSizeValue } = defaultTextStyle;


    const rotation = (-alignment - currentRotation) * _radian;

    const [layoutStartX, layoutStartY] = currentStampPosition;
    const [layoutWidth, layoutHeight] = currentDimensions;

    const coord = requestCoordinate();

    const mycell = requestCell(),
        engine = mycell.engine;

    // Prepare canvas for work
    mycell.rotateDestination(engine, layoutStartX, layoutStartY, layoutTemplate);
    engine.rotate(rotation);

    const rawLines = requestArray();

    let isInLayout, check, sx, sy, ex, ey;

    const step = _ceil(fontSizeValue * lineSpacing * currentScale);

    const rrpX = _round(layoutStartX),
        xLeft = _round(rrpX - (layoutWidth * currentScale * 2)),
        xRight = _round(rrpX + (layoutWidth * currentScale * 2)),
        rrpY = _round(layoutStartY + (lineAdjustment  * currentScale)),
        yTop = _round(rrpY - (layoutHeight * currentScale * 2)),
        yBase = _round(rrpY + (layoutHeight * currentScale * 2));

    if (step) {

        for (let i = rrpY; i > yTop; i -= step) {

            const rawLineData = requestArray();

            isInLayout = false;
            check = false;

            for (let j = xLeft; j < xRight; j++) {

                check = engine.isPointInPath(pathObject, j, i, winding);

                if (check !== isInLayout) {

                    rawLineData.push([check === false ? j - 1 : j, i]);
                    isInLayout = check;
                }
            }

            rawLines.push([i, [...rawLineData]]);
        }

        for (let i = rrpY + step; i < yBase; i += step) {

            const rawLineData = requestArray();

            isInLayout = false;
            check = false;

            for (let j = xLeft; j < xRight; j++) {

                check = engine.isPointInPath(pathObject, j, i, winding);

                if (check !== isInLayout) {

                    rawLineData.push([check === false ? j - 1 : j, i]);
                    isInLayout = check;
                }
            }

            rawLines.push([i, [...rawLineData]]);
        }
    }

    // Protecting against a zero value step
    else {

        const rawLineData = requestArray();

        isInLayout = false;
        check = false;

        for (let j = xLeft; j < xRight; j++) {

            check = engine.isPointInPath(pathObject, j, rrpY, winding);

            if (check !== isInLayout) {

                rawLineData.push([check === false ? j - 1 : j, rrpY]);
                isInLayout = check;
            }
        }

        rawLines.push([rrpY, [...rawLineData]]);
    }

    const relevantLines = requestArray();
    relevantLines.push(...rawLines.filter(l => l[1].length));

    releaseArray(...rawLines, rawLines);

    relevantLines.sort((a, b) => {

        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;
        return 0;
    });

    const selectedLines = relevantLines.map(l => l[1]);

    if (TEXT_LAYOUT_FLOW_REVERSE.includes(textUnitFlow)) selectedLines.reverse();

    releaseArray(relevantLines);

    selectedLines.forEach(data => {

        data.forEach(d => {

            coord.set(d).subtract(currentStampPosition).rotate(alignment + currentRotation).add(currentStampPosition);

            d[0] = coord[0];
            d[1] = coord[1];
        });
    });

    releaseLine(...lines);
    lines.length = 0;

    selectedLines.forEach(data => {

        for (let i = 0, iz = data.length; i < iz; i += 2) {

            lines.push(requestLine().set({

                startAt: data[i],
                endAt: data[i + 1],
            }));
        }
    });

    let path = '';

    lines.forEach(line => {

        [sx, sy] = line.startAt;
        [ex, ey] = line.endAt;

        line.length = _hypot(sx - ex, sy - ey);

        path += `M ${sx}, ${sy} ${ex}, ${ey} `;
    });

    this.guidelinesPath = new Path2D(path);

    releaseCell(mycell);
    releaseCoordinate(coord);
};

// `cleanText` - Break the entity's text into smaller TextUnit objects which can be positioned within, or along, the layout entity's shape
P.cleanText = function () {

// console.log(this.name, `cleanText (trigger: dirtyText ${this.dirtyText}, checks: currentFontIsLoaded', ${this.currentFontIsLoaded})`);

    if (this.currentFontIsLoaded) {

        this.dirtyText = false;

        const {
            breakTextOnSpaces,
            breakWordsOnHyphens,
            defaultTextStyle,
            text,
            textUnitFlow,
            textUnits,
        } = this;

        const textCharacters = [...text];

        const languageDirectionIsLtr = (defaultTextStyle.direction === LTR);
        const layoutFlowIsColumns = TEXT_LAYOUT_FLOW_COLUMNS.includes(textUnitFlow);

        const unit = [];

        let noBreak = false;

        releaseUnit(...textUnits);
        textUnits.length = 0;

        if (breakTextOnSpaces) {

            // + Soft hyphens and truncation marking is deliberately suppressed for RTL fonts
            if (languageDirectionIsLtr && breakWordsOnHyphens) {

                textCharacters.forEach(c => {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                        }));
                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: c,
                            [UNIT_TYPE]: TEXT_TYPE_SPACE,
                        }));
                        unit.length = 0;
                    }
                    else if (TEXT_HARD_HYPHEN_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                        }));
                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: c,
                            [UNIT_TYPE]: TEXT_TYPE_HYPHEN,
                        }));
                        unit.length = 0;
                    }
                    else if (TEXT_SOFT_HYPHEN_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                        }));
                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: c,
                            [UNIT_TYPE]: TEXT_TYPE_SOFT_HYPHEN,
                        }));
                        unit.length = 0;
                    }
                    else unit.push(c);
                });

                // Capturing the last word
                if (unit.length) textUnits.push(requestUnit({
                    [UNIT_CHARS]: unit.join(ZERO_STR),
                    [UNIT_TYPE]: TEXT_TYPE_CHARS,
                }));
            }
            else {

                textCharacters.forEach(c => {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                        }));
                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: c,
                            [UNIT_TYPE]: TEXT_TYPE_SPACE
                        }));
                        unit.length = 0;
                    }
                    else unit.push(c);
                });

                // Capturing the last word
                if (unit.length) textUnits.push(requestUnit({
                    [UNIT_CHARS]: unit.join(ZERO_STR),
                    [UNIT_TYPE]: TEXT_TYPE_CHARS,
                }));
            }
        }
        else {

            textCharacters.forEach((c, index) => {

                unit.push(c);

                // Some Chinese/Japanese characters simply have to stick together (but not in columns)!
                if (!layoutFlowIsColumns) {

                    noBreak = TEXT_NO_BREAK_REGEX.test(c) || TEXT_NO_BREAK_REGEX.test(textCharacters[index + 1]);

                    if (!noBreak) {

                        if (TEXT_SPACES_REGEX.test(c)) {

                            textUnits.push(requestUnit({
                                [UNIT_CHARS]: unit.join(ZERO_STR),
                                [UNIT_TYPE]: TEXT_TYPE_SPACE,
                            }));
                            unit.length = 0;
                        }
                        else  {

                            textUnits.push(requestUnit({
                                [UNIT_CHARS]: unit.join(ZERO_STR),
                                [UNIT_TYPE]: TEXT_TYPE_CHARS,
                            }));
                            unit.length = 0;
                        }
                    }
                }
                else {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_SPACE,
                        }));
                        unit.length = 0;
                    }
                    else if (TEXT_NO_BREAK_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_NO_BREAK,
                        }));
                        unit.length = 0;
                    }
                    else if (TEXT_ZERO_SPACE_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_ZERO_SPACE,
                        }));
                        unit.length = 0;
                    }
                    else  {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                        }));
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


// `assessTextForStyle` - Add styling details to each TextUnit
// + Note that styling on a per-TextUnit basis requires CSS code; there is no way to directly style a TextUnit in SC except by manually replacing its `style` attribute object in code (which is dangerous and definitely not guaranteed to work!)
P.assessTextForStyle = function () {

// console.log(this.name, `assessTextForStyle (trigger: none - called directly by cleanText)`);

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

    const localState = {

        localHandleX: '',
        localHandleY: '',

        localOffsetX: 0,
        localOffsetY: 0,

        localAlignment: 0,
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
        if (oldVal !== newVal) {

            unitSet.fontSize = newVal;
            if (FONT_VIEWPORT_LENGTH_REGEX.test(newVal)) this.usingViewportFontSizing = true;
        }

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

        oldVal = currentTextStyle.method;
        newVal = nodeVals.getPropertyValue('--SC-method');
// if (oldVal !== newVal) console.log(`method | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.method = newVal;

        oldVal = localState.localHandleX;
        newVal = nodeVals.getPropertyValue('--SC-local-handle-x');
// if (oldVal !== newVal) console.log(`--SC-local-handle-x | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.localHandleX = newVal;

        oldVal = localState.localHandleY;
        newVal = nodeVals.getPropertyValue('--SC-local-handle-y');
// if (oldVal !== newVal) console.log(`--SC-local-handle-y | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.localHandleY = newVal;

        oldVal = localState.localOffsetX;
        newVal = parseFloat(nodeVals.getPropertyValue('--SC-local-offset-x'));
// if (oldVal !== newVal) console.log(`--SC-local-offset-x | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.localOffsetX = newVal;

        oldVal = localState.localOffsetY;
        newVal = parseFloat(nodeVals.getPropertyValue('--SC-local-offset-y'));
// if (oldVal !== newVal) console.log(`--SC-local-offset-y | [${oldVal}] -> [${newVal}]`);
        if (oldVal !== newVal) unitSet.localOffsetY = newVal;

        oldVal = localState.localAlignment;
        newVal = parseFloat(nodeVals.getPropertyValue('--SC-local-alignment'));
// if (oldVal !== newVal) console.log(`--SC-local-alignment | ${typeof oldVal} [${oldVal}] -> ${typeof newVal} [${newVal}]`);
        if (oldVal !== newVal) unitSet.localAlignment = newVal;

        unit.set(unitSet);
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

        tester.style.setProperty('--SC-local-handle-x', localState.localHandleX);
        tester.style.setProperty('--SC-local-handle-y', localState.localHandleY);
        tester.style.setProperty('--SC-local-offset-x', localState.localOffsetX);
        tester.style.setProperty('--SC-local-offset-y', localState.localOffsetY);
        tester.style.setProperty('--SC-local-alignment', localState.localAlignment);

        tester.style.setProperty('--SC-method', defaultTextStyle.method);

        tester.className = this.name;
        tester.innerHTML = rawText;
    };


    // Start processing data here
    const { rawText, defaultTextStyle, textUnits } = this;

    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle);

    let cursor = 0;

    this.usingViewportFontSizing = FONT_VIEWPORT_LENGTH_REGEX.test(currentTextStyle.fontSize);
    setupTester();
    processNode(tester);
};


// `measureTextUnits` - TextUnit lengths represent the amount of space they will need to take along the line they will (eventually) be assigned to.
// + Takes into account the styling for each TextUnit, which can have a significant impact on the amount of space it requires on a line.
P.measureTextUnits = function () {

// console.log(this.name, 'measureTextUnits (trigger: none - called by cleanText)');

    const {
        defaultTextStyle,
        hyphenString,
        state,
        textUnitFlow,
        textUnits,
        truncateString,
        breakTextOnSpaces,
    } = this;

    const mycell = requestCell(),
        engine = mycell.engine;

    let res, chars, charType, style, len, nextUnit, nextStyle, nextChars, nextType, nextLen, unkernedLen;

    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle);
    this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, mycell);

    const layoutFlowIsColumns = TEXT_LAYOUT_FLOW_COLUMNS.includes(textUnitFlow);

    textUnits.forEach(t => {

        ({chars, charType, style} = t);

        if (style)  this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, mycell);

        res = engine.measureText(chars);

        t.len = res.width;

        // Add word spacing to space chars
        if (charType === TEXT_TYPE_SPACE) {

            t.len += currentTextStyle.wordSpaceValue;
        }

        // Prep soft hyphens
        else if (charType === TEXT_TYPE_SOFT_HYPHEN) {

            res = engine.measureText(hyphenString);
            t.replaceLen = res.width;
        }

        // Prep truncation
        else {

            res = engine.measureText(truncateString);
            t.replaceLen = res.width;
        }

        // No gaps between CJK chars and punctuation when textUnitFlow is columnar
        if (layoutFlowIsColumns && !breakTextOnSpaces) {

            if (charType === TEXT_TYPE_ZERO_SPACE || charType === TEXT_TYPE_NO_BREAK) t.height = 0;
            else t.height = parseFloat(currentTextStyle.fontSize);
        }
        else t.height = parseFloat(currentTextStyle.fontSize);
    });

    // Gather kerning data (if required) - only applies to rows
    if (this.useLayoutTemplateAsPath || !this.breakTextOnSpaces) {

        // Reset things back to initial before starting the second walk-through
        this.setEngineFromWorkingTextStyle(currentTextStyle, defaultTextStyle, state, mycell);

        textUnits.forEach((unit, index) => {

            ({chars, charType, style, len} = unit);

            if (style) this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, mycell);

            // Do we need to perform this work?
            if (currentTextStyle.fontKerning !== NONE) {

                nextUnit = textUnits[index + 1];

                // No need to kern the last textUnit
                if (nextUnit) {

                    ({ style: nextStyle, chars: nextChars, charType: nextType, len: nextLen} = nextUnit);

                    // We don't need to kern anything next to a space, or the space itself
                    if (charType !== TEXT_TYPE_SPACE && nextType !== TEXT_TYPE_SPACE) {

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
    releaseCell(mycell);
};

// `layoutText` - initiate the process of laying out text into a space, or along a line
// + TODO: The assumption here is that if we are laying text along a path, there will only be one line with a length equal to the layout engine's path length. In such cases we won't need to care about soft hyphens, but will need to care about truncation (regardless of whether we allow the text to wrap itself along the line)
P.layoutText = function () {

// console.log(this.name, `layoutText (trigger: dirtyTextLayout ${this.dirtyTextLayout}, checks: currentFontIsLoaded' ${this.currentFontIsLoaded})`, this.lines.length, this.textUnits.length);

    if (this.currentFontIsLoaded) {

        const { useLayoutTemplateAsPath, lines, textUnits, layoutTemplate } = this;

        if (useLayoutTemplateAsPath) {

            if (layoutTemplate && layoutTemplate.useAsPath) {

                this.dirtyTextLayout = false;

                releaseLine(...lines);
                lines.length = 0;

                lines.push(requestLine({
                    length: layoutTemplate.length,
                    isPathEntity: true,
                }));
            }
        }
        else {

            if (lines.length && textUnits.length) {

                this.dirtyTextLayout = false;

                lines.forEach(line => {

                    line.unitData.length = 0;
                });

                textUnits.forEach(unit => {

                    unit.stampFlag = true;
                    unit.lineOffset = 0;
                });
            }
        }
        this.assignTextUnitsToLines();
        this.positionTextUnits();
    }
};


// `assignTextUnitsToLines` - Assign sufficient text units to each line to fill the line's length
P.assignTextUnitsToLines = function () {

// console.log(this.name, 'assignTextUnitsToLines (trigger: none - called by layoutText)');

    const {
        breakWordsOnHyphens,
        defaultTextStyle,
        layoutTemplate,
        lines,
        textUnitFlow,
        textUnits,
    } = this;

    const languageDirectionIsLtr = (defaultTextStyle.direction === LTR);
    const layoutFlowIsColumns = TEXT_LAYOUT_FLOW_COLUMNS.includes(textUnitFlow);

    const unitArrayLength = textUnits.length;

    let unitCursor = 0,
        lengthRemaining,
        i, unit, unitData, unitAfter, len, height, lineLength, charType, check;

    const addUnit = function (val) {

        lengthRemaining -= val;
        unitData.push(unitCursor);
        ++unitCursor;
    };

    lines.forEach(line => {

        ({
            length: lineLength,
            unitData,
        } = line);

        lengthRemaining = _ceil(lineLength);

        for (i = unitCursor; i < unitArrayLength; i++) {

            unit = textUnits[i];

            ({ len, height, charType } = unit);

            // Check: is there room for the text unit
            // + TODO: find out the algorithms used by various browsers to assign words to a given length of line.
            // + At the moment, the SC layout doesn't exactly match the DOM layout - the occasional word will fall over into the next line - this becomes very noticable when scaling
            // + Ideally, the words-per-line in SC vs DOM should match, but if push comes to shove, would much prefer to keep lines stable when scaling
            // + The current solution fixes the worst of the movement, but is not good enough
            check = (layoutFlowIsColumns) ?
                height * layoutTemplate.currentScale :
                _floor(len * 100) / 100;

            if (check <= lengthRemaining + 1) {

                // Hyphens capture
                // + Soft hyphens and truncation marking is deliberately suppressed for RTL fonts
                // + We don't care about hyphens or truncation in columnar layouts
                if (languageDirectionIsLtr && !layoutFlowIsColumns && breakWordsOnHyphens) {

                    // We need to do a look-forward for soft hyphens
                    unit = textUnits[i + 1];

                    // Next text unit is a soft hyphen
                    if (unit && unit?.charType === TEXT_TYPE_SOFT_HYPHEN) {

                        unitAfter = textUnits[i + 2];

                        // Check: this text unit and the next significant one will fit on line
                        if (unitAfter && len + unitAfter.len < lengthRemaining) addUnit(len);

                        // Check: this text unit and the visible hyphen will fit on line
                        else if (len + unit.replaceLen < lengthRemaining) {

                            addUnit(check);
                            addUnit(unit.replaceLen);
                            unitData.push(TEXT_TYPE_SOFT_HYPHEN);
                            break;
                        }

                        // Check: there's no room for this text unit and its soft hyphen
                        else break;
                    }

                    // Next text unit is not a soft hyphen; add this text unit to the array
                    else addUnit(check);
                }
                else addUnit(check);
            }

            // There's no room left on this line for the TextUnit
            // + There is a dilemma here, concerning lines where the first TextUnit available to add to the line is too long to fit.
            // + Currently, we just leave the line empty and move onto the next line (which might be able to fit the long TextUnit)
            // + If the offending TextUnit is too long for all subsequent lines then neither it nor any of the following TextUnits will appear.
            // + An alternative approach could be to allow the overlong TextUnit to appear on a line if it's the only TextUnit on that line, thus removing the display block for subsequent TextUnits
            // + For the moment, we will not implement this alternative approach. It's up to developers and designers to use words that can fit into the available line space. Overlong words can be hyphenated with soft (&amp;shy;) hyphens, or zero-width spaces, if required.
            else break;
        }
    });

    // Truncation check
    // + Soft hyphens and truncation marking is deliberately suppressed for RTL fonts
    // + We still don't care about hyphens or truncation in columnar layouts
    if (languageDirectionIsLtr && !layoutFlowIsColumns && unitArrayLength !== unitCursor) {

        let currentLine, replaceLen,
            acc, mutableUnitData;

        for (currentLine = lines.length - 1; currentLine >= 0; currentLine--) {

            ({
                length: lineLength,
                unitData,
            } = lines[currentLine]);

            acc = unitData.reduce((a, v) => {

                if (textUnits[v] && textUnits[v].charType === TEXT_TYPE_CHARS) a++
                return a;

            }, 0);

            if (acc) {

                mutableUnitData = [...unitData];
                break;
            }
            else unitData.length = 0;
        }

        if (mutableUnitData?.length) {

            ({
                length: lineLength,
                unitData,
            } = lines[currentLine]);

            acc = unitData.reduce((a, v) => {

                if (textUnits[v]?.len) a += textUnits[v].len;
                return a;

            }, 0);

            for (i = unitData.length - 1; i >= 0; i--) {

                unit = textUnits[unitData[i]];

                if (unit) {

                    ({ len, replaceLen, charType } = unit);

                    if (charType !== TEXT_TYPE_CHARS && charType !== TEXT_TYPE_SOFT_HYPHEN) {

                        acc -= len;
                        mutableUnitData.pop();
                    }
                    else {

                        if (acc + replaceLen < lineLength) {

                            mutableUnitData.push(TEXT_TYPE_TRUNCATE);
                            break;
                        }
                        else {

                            acc -= len;
                            mutableUnitData.pop();
                        }
                    }
                }
            }
            unitData.length = 0;
            unitData.push(...mutableUnitData);
        }
    }
};


// `positionTextUnits` - Initiate the process of generating positional coordinates for each TextUnit. This function breaks the work into two options:
// + Position each TextUnit along a single-line path of the layout entity (if possible)
// + Position each TextUnit within the space contained by the layout entity, along multiple lines
P.positionTextUnits = function () {

// console.log(this.name, 'positionTextUnits (trigger: none - called by layoutText)');

    if (this.useLayoutTemplateAsPath) this.positionTextUnitsAlongPath();
    else this.positionTextUnitsInSpace();

    this.positionTextDecoration();
};


// `positionTextUnitsAlongPath` - Position each TextUnit along a single-line path of the layout entity (if possible)
P.positionTextUnitsAlongPath = function () {

// console.log(this.name, 'positionTextUnitsAlongPath (trigger: none - called by positionTextUnits)');

    const {
        alignment,
        alignTextUnitsToPath,
        defaultTextStyle,
        layoutTemplate,
        lines,
        pathPosition,
        textHandle,
        textOffset,
        textUnitFlow,
        textUnits,
    } = this;

    const { length, unitData } = lines[0];
    const direction = defaultTextStyle.direction;
    const languageDirectionIsLtr = (direction === LTR);
    const layoutFlowIsColumns = TEXT_LAYOUT_FLOW_COLUMNS.includes(textUnitFlow);
    const currentScale = layoutTemplate.currentScale || 1;

    const data = requestArray();

    const coord = requestCoordinate(),
        boxCoord = requestCoordinate();

    data.push(...unitData);

    // TODO: this is an ugly fix for making RTL words appear correctly along the line
    // + Does mean that the entire text's `pathPosition` is at the end of the text, not the start of it.
    if (!languageDirectionIsLtr) data.reverse();

    let currentPos = pathPosition,
        currentLen = length * currentPos,
        u, unit,
        len, height, kernOffset, localHandle, localOffset, scaledHeight,
        startData, startCorrection, boxData, localAlignment,
        temp, tempX, tempY, localAngle, style,
        x, y, angle,
        handleX, handleY,
        offsetX, offsetY,
        meta, fontFamily, fontDepth, verticalOffset;

    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle);
    this.updateWorkingTextStyle(currentTextStyle, Ωempty);

    fontFamily = currentTextStyle.fontFamily;
    meta = this.getFontMetadata(fontFamily);
    verticalOffset = meta.verticalOffset * (currentTextStyle.fontSizeValue / 100) * currentScale;
    fontDepth = meta.height * (currentTextStyle.fontSizeValue / 100) * currentScale;

    for (let i = 0, iz = data.length; i < iz; i++) {

        u = data[i];

        if (u.toFixed) {

            unit = textUnits[data[i]];

            ({ len, height, kernOffset, localHandle, localOffset, startData, startCorrection, boxData, localAlignment, style } = unit);

            if (style) {

                this.updateWorkingTextStyle(currentTextStyle, style);

                fontFamily = currentTextStyle.fontFamily;
                meta = this.getFontMetadata(fontFamily);
                verticalOffset = meta.verticalOffset * (height / 100) * currentScale;
                fontDepth = meta.height * (height / 100) * currentScale;
            }

            scaledHeight = height * currentScale;

            if (layoutFlowIsColumns) {

                temp = localHandle[0] || textHandle[0] || 0;
                handleX = this.getTextHandleX(temp, len, direction);

                temp = localHandle[1] || textHandle[1] || 0;
                handleY = this.getTextHandleY(temp, height, fontFamily);

                temp = localOffset[0] || textOffset[0] || 0;
                offsetX = this.getTextOffset(temp, len);

                temp = localOffset[1] || textOffset[1] || 0;
                offsetY = this.getTextOffset(temp, height);

                currentLen += handleY;
                if (currentLen >= length) currentLen -= length;
                currentPos = currentLen / length;

                unit.pathData = layoutTemplate.getPathPositionData(currentPos, true);
                ({x, y, angle} = unit.pathData);

                tempX = offsetX - handleX;
                tempY = offsetY - handleY;

                startData[0] = x;
                startData[1] = y;

                startCorrection[0] = tempX;
                startCorrection[1] = tempY + verticalOffset;

                if (alignTextUnitsToPath) localAngle = alignment + angle - 90;
                else localAngle = alignment - 90;

                unit.startAlignment = localAngle;
                unit.startRotation = localAngle * _radian;
                unit.localRotation = localAlignment * _radian;

                currentLen += scaledHeight - handleY;
            }
            else {

                temp = localHandle[0] || textHandle[0] || 0;
                handleX = this.getTextHandleX(temp, len, direction);

                temp = localHandle[1] || textHandle[1] || 0;
                handleY = this.getTextHandleY(temp, height, fontFamily);

                temp = localOffset[0] || textOffset[0] || 0;
                offsetX = this.getTextOffset(temp, len);

                temp = localOffset[1] || textOffset[1] || 0;
                offsetY = this.getTextOffset(temp, height);

                currentLen += handleX;
                if (currentLen >= length) currentLen -= length;
                currentPos = currentLen / length;

                unit.pathData = layoutTemplate.getPathPositionData(currentPos, true);
                ({x, y, angle} = unit.pathData);

                tempX = offsetX - handleX;
                tempY = offsetY - handleY;

                startData[0] = x;
                startData[1] = y;

                startCorrection[0] = tempX;
                startCorrection[1] = tempY + verticalOffset;

                if (alignTextUnitsToPath) localAngle = alignment + localAlignment + angle;
                else localAngle = alignment + localAlignment;

                unit.startAlignment = localAngle;
                unit.startRotation = localAngle * _radian;

                unit.localRotation = localAlignment * _radian;

                currentLen += len - kernOffset - handleX;
            }

            unit.set({ boxData: null });

            boxCoord[0] = x + tempX;
            boxCoord[1] = y + tempY - verticalOffset

            coord.setFromArray(boxCoord).subtract(startData).rotate(localAngle).add(startData);
            boxData.tl.push(...coord);

            boxCoord[0] += len;

            coord.setFromArray(boxCoord).subtract(startData).rotate(localAngle).add(startData);
            boxData.tr.push(...coord);

            boxCoord[1] = y + tempY + fontDepth;

            coord.setFromArray(boxCoord).subtract(startData).rotate(localAngle).add(startData);
            boxData.br.push(...coord);

            boxCoord[0] -= len;

            coord.setFromArray(boxCoord).subtract(startData).rotate(localAngle).add(startData);
            boxData.bl.push(...coord);
        }
    }

    releaseCoordinate(coord, boxCoord);
    releaseArray(data);
};


// `positionTextUnitsInSpace` - Position each TextUnit along the line it has been assigned to. This work takes into account:
// + Language direction
// + Line justification requirements
P.positionTextUnitsInSpace = function () {

// console.log(this.name, 'positionTextUnitsInSpace (trigger: none - called by positionTextUnits)');

    const {
        alignment,
        defaultTextStyle,
        getTextHandleX,
        getTextHandleY,
        getTextOffset,
        justifyLine,
        layoutTemplate,
        lines,
        textHandle,
        textOffset,
        textUnitFlow,
        textUnits,
    } = this;

    const direction = defaultTextStyle.direction;
    const languageDirectionIsLtr = (direction === LTR);
    const layoutFlowIsColumns = TEXT_LAYOUT_FLOW_COLUMNS.includes(textUnitFlow);

    const {currentRotation, currentScale} = layoutTemplate;

    let unit, length, unitData, unitLengths, unitIndices,
        noOfSpaces, spaceStep, spaceRemaining,
        len, height, style, startData, startCorrection, boxData,
        localHandle, localOffset, localAlignment, lineOffset,
        temp, tempX, tempY, handleX, handleY, offsetX, offsetY,
        startAtX, startAtY, startAt, localX, localY, localAngle;

    let fontFamily, meta, verticalOffset, fontDepth;

    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle);
    this.updateWorkingTextStyle(currentTextStyle, Ωempty);

    fontFamily = currentTextStyle.fontFamily;
    meta = this.getFontMetadata(fontFamily);
    verticalOffset = meta.verticalOffset * (currentTextStyle.fontSizeValue / 100) * currentScale;
    fontDepth = meta.height * (currentTextStyle.fontSizeValue / 100) * currentScale;

    lines.forEach(line => {

        ({ length, unitData, startAt } = line);

        // only process lines that have textUnits
        if (unitData.length) {

            const initialDistances = requestArray(),
                adjustedDistances = requestArray();

            const coord = requestCoordinate(),
                boxCoord = requestCoordinate();

            unitIndices = unitData.length - 1;

            unitLengths = 0;
            noOfSpaces = 0;
            spaceStep = 0;
            initialDistances.length = 0;
            adjustedDistances.length = 0;

            [startAtX, startAtY] = startAt;

            // Get distances that need to be processed
            unitData.forEach((unitIndex, dataIndex) => {

                if (unitIndex.toFixed) {

                    unit = textUnits[unitIndex];

                    // We ignore spaces at the start/end of the line
                    if ((dataIndex === 0 || dataIndex === unitIndices) && unit.charType === TEXT_TYPE_SPACE) unit.stampFlag = false;

                    // Populate the initialDistances array, and keep a running total of the current length used
                    if (unit.stampFlag) {

                        initialDistances.push(unitLengths);

                        if (layoutFlowIsColumns) unitLengths += unit.height * currentScale;
                        else unitLengths += unit.len - unit.kernOffset;

                        // keep a count of the number of spaces within the line
                        if ((justifyLine === SPACE_BETWEEN || justifyLine === SPACE_AROUND) && unit.charType === TEXT_TYPE_SPACE) noOfSpaces++;
                    }
                }
            });

            // Unused space
            spaceRemaining = length - unitLengths;

            // Adjustment for dynamic inputs (soft hyphen, truncation chars)
            // + Soft hyphens and truncation marking is deliberately suppressed for RTL fonts
            if (languageDirectionIsLtr && (unitData.includes(TEXT_TYPE_SOFT_HYPHEN) || unitData.includes(TEXT_TYPE_TRUNCATE))) {

                unit = textUnits[unitData[unitData.length - 2]];
                spaceRemaining -= unit?.replaceLen || 0;
            }

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

                // If justify is 'space-between' or 'space-around' ... we handle this case below
                case SPACE_BETWEEN :

                    if (noOfSpaces) spaceStep = spaceRemaining / noOfSpaces;

                    adjustedDistances.push(...initialDistances);
                    break;

                case SPACE_AROUND :

                    spaceStep = spaceRemaining / (noOfSpaces + 2);

                    adjustedDistances.push(...initialDistances);
                    break;

                // If justify is 'start' ... no distance adjustments required
                default :

                    adjustedDistances.push(...initialDistances);
            }

            // space-between justify text needs special processing as we only want to add portions of remaining space to each of the relevant 'space' text units
            if (justifyLine === SPACE_BETWEEN) {

                unitIndices = 0;

                unitData.forEach(unitIndex => {

                    unit = textUnits[unitIndex];

                    if (unit?.stampFlag) {

                        unitIndices++

                        if (unit.charType === TEXT_TYPE_SPACE) {

                            for (let i = unitIndices, iz = adjustedDistances.length; i < iz; i++) {

                                adjustedDistances[i] += spaceStep;
                            }
                        }
                    }
                });
            }

            else if (justifyLine === SPACE_AROUND) {

                unitIndices = 0;

                unitData.forEach(unitIndex => {

                    unit = textUnits[unitIndex];

                    if (unit?.stampFlag) {

                        unitIndices++

                        if (unit.charType === TEXT_TYPE_SPACE) {

                            for (let i = unitIndices, iz = adjustedDistances.length; i < iz; i++) {

                                adjustedDistances[i] += spaceStep;
                            }
                        }
                    }
                });

                const temp = [...adjustedDistances];
                adjustedDistances.length = 0;
                adjustedDistances.push(...temp.map(d => d + spaceStep));
            }

            // Now we can update the relevant textUnit objects. This is where we take into account the language/font preference for what they consider to be their natural start/end sides
            unitData.forEach(u => {

                if (u.toFixed) {

                    unit = textUnits[u];

                    ({
                        boxData,
                        height,
                        len,
                        localAlignment,
                        localHandle,
                        localOffset,
                        startCorrection,
                        startData,
                        style,
                    } = unit);

                    if (style) {

                        this.updateWorkingTextStyle(currentTextStyle, style);
                        fontFamily = currentTextStyle.fontFamily;
                        meta = this.getFontMetadata(fontFamily);
                        verticalOffset = meta.verticalOffset * (height / 100) * currentScale;
                        fontDepth = meta.height * (height / 100) * currentScale;
                    }

                    if (unit.stampFlag) {

                        if (layoutFlowIsColumns) {

                            lineOffset = adjustedDistances.shift();

                            temp = localHandle[0] || textHandle[0] || 0;
                            handleX = getTextHandleX.call(this, temp, len, direction);

                            temp = localHandle[1] || textHandle[1] || 0;
                            handleY = getTextHandleY.call(this, temp, height, fontFamily);

                            temp = localOffset[0] || textOffset[0] || 0;
                            offsetX = this.getTextOffset(temp, len);

                            temp = localOffset[1] || textOffset[1] || 0;
                            offsetY = getTextOffset.call(this, temp, height);

                            localAngle = alignment + currentRotation;
                            coord.set(lineOffset + handleY, 0).rotate(localAngle);

                            localX = startAtX + coord[0];
                            localY = startAtY + coord[1];

                            tempX = localX + offsetX;
                            tempY = localY + offsetY - handleY + verticalOffset;

                            startData[0] = localX;
                            startData[1] = localY;

                            startCorrection[0] = tempX - localX - handleX;
                            startCorrection[1] = tempY - localY;

                            unit.startAlignment = (localAngle - 90);
                            unit.startRotation = (localAngle - 90) * _radian;

                            unit.localRotation = localAlignment * _radian;
                        }
                        else {

                            if (languageDirectionIsLtr) lineOffset = adjustedDistances.shift();
                            else lineOffset = length - len - adjustedDistances.shift();

                            temp = localHandle[0] || textHandle[0] || 0;
                            handleX = getTextHandleX.call(this, temp, len, direction);

                            temp = localHandle[1] || textHandle[1] || 0;
                            handleY = getTextHandleY.call(this, temp, height, fontFamily);

                            temp = localOffset[0] || textOffset[0] || 0;
                            offsetX = this.getTextOffset(temp, len);

                            temp = localOffset[1] || textOffset[1] || 0;
                            offsetY = getTextOffset.call(this, temp, height);

                            localAngle = alignment + currentRotation;
                            coord.set(lineOffset + handleX, 0).rotate(localAngle);

                            localX = startAtX + coord[0];
                            localY = startAtY + coord[1];

                            tempX = localX + offsetX;
                            tempY = localY + offsetY - handleY + verticalOffset;

                            startData[0] = localX;
                            startData[1] = localY;

                            startCorrection[0] = tempX - localX - handleX;
                            startCorrection[1] = tempY - localY;

                            unit.startAlignment = localAngle;
                            unit.startRotation = localAngle * _radian;

                            unit.localRotation = localAlignment * _radian;
                        }

                        unit.set({ boxData: null });

                        boxCoord[0] = tempX - handleX;
                        boxCoord[1] = tempY - verticalOffset;

                        localAngle += localAlignment
                        if (layoutFlowIsColumns) localAngle -= 90;

                        coord.setFromArray(boxCoord).subtract(startData).rotate(localAngle).add(startData);
                        boxData.tl.push(...coord);

                        boxCoord[0] += len;

                        coord.setFromArray(boxCoord).subtract(startData).rotate(localAngle).add(startData);
                        boxData.tr.push(...coord);

                        boxCoord[1] = tempY + fontDepth - verticalOffset;

                        coord.setFromArray(boxCoord).subtract(startData).rotate(localAngle).add(startData);
                        boxData.br.push(...coord);

                        boxCoord[0] -= len;

                        coord.setFromArray(boxCoord).subtract(startData).rotate(localAngle).add(startData);
                        boxData.bl.push(...coord);
                    }
                }
            });

            releaseArray(initialDistances, adjustedDistances);
            releaseCoordinate(coord, boxCoord);
        }
    });
};


// `positionTextDecoration` - Recovers data which can be used for building underline, overline and highlight Path2D objects
P.positionTextDecoration = function () {

// console.log(this.name, 'positionTextDecoration (trigger: none - called by positionTextUnits)');

    const correctCoordinates = function (out, back, start, width) {

        if (out.length && out.length === back.length && width) {

            const workOut = requestArray(),
                workBack = requestArray(),
                workHold = requestArray();

            let i, iz, itemOut, itemBack,
                fullLen, topLen, baseRatio;

            workOut.push(...out);
            workBack.push(...back);

            for (i = 0, iz = workOut.length; i < iz; i++) {

                itemOut = workOut[i];
                itemBack = workBack[i];

                workHold.length = 0;

                fullLen = coord.setFromArray(itemBack).subtract(itemOut).getMagnitude();
                topLen = coord.scalarMultiply(start).getMagnitude();

                workHold.push(...coord.add(itemOut));

                baseRatio = (topLen + (width * currentScale)) / fullLen;

                coord.setFromArray(itemBack).subtract(itemOut).scalarMultiply(baseRatio).add(itemOut);

                itemOut[0] = workHold[0];
                itemOut[1] = workHold[1];

                itemBack[0] = coord[0];
                itemBack[1] = coord[1];
            }

            out.length = 0;
            out.push(...workOut);

            back.length = 0;
            back.push(...workBack);

            releaseArray(workOut, workBack, workHold);
        }
    };

    const buildPath = function (out, back, style, paths) {

        const iOut = out.length,
            iBack = back.length;

        let i, dx, dy;

        if (iOut && iBack) {

            dx = out[0][0] - currentStampPosition[0];
            dy = out[0][1] - currentStampPosition[1];

            path = `m ${dx}, ${dy} `;

            for (i = 1; i < iOut; i++) {

                dx = out[i][0] - out[i - 1][0];
                dy = out[i][1] - out[i - 1][1];

                path += `${dx}, ${dy} `;
            }

            dx = back[back.length - 1][0] - out[out.length - 1][0];
            dy = back[back.length - 1][1] - out[out.length - 1][1];

            path += `${dx}, ${dy} `;

            for (i = iBack - 2; i >= 0; i--) {

                dx = back[i][0] - back[i + 1][0];
                dy = back[i][1] - back[i + 1][1];

                path += `${dx}, ${dy} `;
            }

            path += 'z';

            paths.push([style, new Path2D(path), [...currentStampPosition]]);
        }
    };

    const buildUnderline = function () {

        if (underlineOut.length) {

            correctCoordinates(underlineOut, underlineBack, underlineOffset, underlineWidth);
            buildPath(underlineOut, underlineBack, underlineStyle, underlinePaths);

            underlineOut.length = 0;
            underlineBack.length = 0;
        }
    };

    const buildOverline = function () {

        if (overlineOut.length) {

            correctCoordinates(overlineOut, overlineBack, overlineOffset, overlineWidth);
            buildPath(overlineOut, overlineBack, overlineStyle, overlinePaths);

            overlineOut.length = 0;
            overlineBack.length = 0;
        }
    };

    const buildHighlight = function () {

        if (highlightOut.length) {

            buildPath(highlightOut, highlightBack, highlightStyle, highlightPaths);

            highlightOut.length = 0;
            highlightBack.length = 0;
        }
    };

    const {
        breakTextOnSpaces,
        defaultTextStyle,
        highlightPaths,
        layoutTemplate,
        lines,
        overlinePaths,
        textUnitFlow,
        textUnits,
        underlinePaths,
        useLayoutTemplateAsPath,
    } = this;

    let unitData, unit, style, boxData, tl, tr, br, bl, path, charType,
        includeUnderline, underlineStyle, underlineOffset, underlineWidth,
        includeOverline, overlineStyle, overlineOffset, overlineWidth,
        includeHighlight, highlightStyle;

    const underlineOut = requestArray();
    const underlineBack = requestArray();
    const overlineOut = requestArray();
    const overlineBack = requestArray();
    const highlightOut = requestArray();
    const highlightBack = requestArray();

    const coord = requestCoordinate();

    const {currentScale, currentStampPosition} = layoutTemplate;

    underlinePaths.length = 0;
    overlinePaths.length = 0;
    highlightPaths.length = 0;

    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle);
    this.updateWorkingTextStyle(currentTextStyle, Ωempty);

    ({
        includeUnderline, underlineStyle, underlineOffset, underlineWidth,
        includeOverline, overlineStyle, overlineOffset, overlineWidth,
        includeHighlight, highlightStyle,

    } = currentTextStyle);

    // Process each line separately
    // + Decorations that break across lines will have separate Path2D objects for each line
    lines.forEach(l => {

        unitData = l.unitData;

        underlineOut.length = 0;
        underlineBack.length = 0;
        overlineOut.length = 0;
        overlineBack.length = 0;
        highlightOut.length = 0;
        highlightBack.length = 0;

        unitData.forEach(u => {

            if (u.toFixed) {

                unit = textUnits[u];

                ({ style, boxData, charType } = unit);

                // Update styling data as required by each TextUnit
                if (style) {

                    this.updateWorkingTextStyle(currentTextStyle, style);

                    ({includeUnderline, includeOverline, includeHighlight} = currentTextStyle);

                    // We're only interested in updating additional attributes if the relevant style is active
                    if (includeUnderline) ({underlineStyle, underlineOffset, underlineWidth} = currentTextStyle);

                    if (includeOverline) ({overlineStyle, overlineOffset, overlineWidth} = currentTextStyle);

                    if (includeHighlight) ({highlightStyle} = currentTextStyle);
                }

                // Only process visible TextUnits
                if (unit.stampFlag) {

                    ({tl, tr, br, bl} = boxData);

                    // TextUnits along a column never style spaces
                    if (TEXT_LAYOUT_FLOW_COLUMNS.includes(textUnitFlow)) {

                        if (charType !== TEXT_TYPE_SPACE && includeUnderline) {

                            underlineOut.push(tl, tr);
                            underlineBack.push(bl, br);
                            buildUnderline();
                        }

                        if (charType !== TEXT_TYPE_SPACE && includeOverline) {

                            overlineOut.push(tl, tr);
                            overlineBack.push(bl, br);
                            buildOverline();
                        }

                        if (charType !== TEXT_TYPE_SPACE && includeHighlight) {

                            highlightOut.push(tl, tr);
                            highlightBack.push(bl, br);
                            buildHighlight();
                        }
                    }
                    else {

                        if (useLayoutTemplateAsPath) {

                            // TextUnits that are all single chars will style spaces
                            if (!breakTextOnSpaces) {

                                if (includeUnderline) {

                                    underlineOut.push(tl, tr);
                                    underlineBack.push(bl, br);
                                }
                                else buildUnderline();

                                if (includeOverline) {

                                    overlineOut.push(tl, tr);
                                    overlineBack.push(bl, br);
                                }
                                else buildOverline();

                                if (includeHighlight) {

                                    highlightOut.push(tl, tr);
                                    highlightBack.push(bl, br);
                                }
                                else buildHighlight();
                            }
                            // TextUnits that are blocks of chars chars will not style spaces
                            else {

                                if (charType !== TEXT_TYPE_SPACE && includeUnderline) {

                                    underlineOut.push(tl, tr);
                                    underlineBack.push(bl, br);
                                    buildUnderline();
                                }

                                if (charType !== TEXT_TYPE_SPACE && includeOverline) {

                                    overlineOut.push(tl, tr);
                                    overlineBack.push(bl, br);
                                    buildOverline();
                                }

                                if (charType !== TEXT_TYPE_SPACE && includeHighlight) {

                                    highlightOut.push(tl, tr);
                                    highlightBack.push(bl, br);
                                    buildHighlight();
                                }
                            }
                        }
                        // Non-pathed TextUnits along a row will style spaces
                        else {

                            if (includeUnderline) {

                                underlineOut.push(tl, tr);
                                underlineBack.push(bl, br);
                            }
                            else buildUnderline();

                            if (includeOverline) {

                                overlineOut.push(tl, tr);
                                overlineBack.push(bl, br);
                            }
                            else buildOverline();

                            if (includeHighlight) {

                                highlightOut.push(tl, tr);
                                highlightBack.push(bl, br);
                            }
                            else buildHighlight();
                        }
                    }
                }
            }
        });

        if (underlineOut.length) buildUnderline();
        if (overlineOut.length) buildOverline();
        if (highlightOut.length) buildHighlight();
    });

    releaseCoordinate(coord);
    releaseArray(underlineOut, underlineBack, overlineOut, overlineBack, highlightOut, highlightBack);
};


// #### Display cycle functions

P.prepareStamp = function() {

// console.log(`
// ${this.name} prepareStamp`);

    if (this.dirtyHost) this.dirtyHost = false;

    const layoutTemplate = this.layoutTemplate;

    this.currentDimensions = layoutTemplate.currentDimensions;
    this.currentScale = layoutTemplate.currentScale;
    this.currentStampHandlePosition = layoutTemplate.currentStampHandlePosition;
    this.currentStampPosition = layoutTemplate.currentStampPosition;

    if (this.dirtyScale) {

        this.dirtyCache();

        this.dirtyScale = false;

        this.dirtyFont = true;
        this.dirtyPathObject = true;
        this.dirtyLayout = true;
    }

    if (this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle || this.dirtyRotation) {

        this.dirtyCache();

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

        // Cleaning the font fails if font isn't loaded. Only need to proceed to clean the text after font loads.
        if (!this.dirtyFont) this.dirtyText = true;
    }

    if (!this.dirtyPathObject && this.currentFontIsLoaded) {

        // `cleanText`, `cleanLayout` and `layoutText` functions will also check to see if font has uploaded before performing their work
        if (this.dirtyText) {

            this.updateAccessibleTextHold();
            this.cleanText();
        }

        if (this.dirtyLayout) this.cleanLayout();

        if (this.dirtyTextLayout) this.layoutText();
    }
};

// `stamp` - Invoked by the entity's Group
// + Nothing gets displayed until all the moving parts are present and settled
// + EnhancedLabel entitys don't have a `simpleStamp` function, by design.
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


P.removeShadowAndAlpha = function (engine) {

    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;
    engine.shadowColor = 'rgb(0 0 0 / 0)';

    engine.globalAlpha = 1;
    engine.globalCompositeOperation = SOURCE_OVER;

    engine.lineJoin = ROUND;
    engine.lineCap = ROUND;
};


// `regularStamp` - A small, internal function to direct stamping towards the correct functionality
// + regularStampInSpace for text inside the layoutTemplate artefact's enclosed space
// + regularStampAlongPath for text positioned along a path-based entity's perimeter
P.regularStamp = function () {

    const {
        cache,
        cacheOutput,
        currentHost,
        layoutTemplate,
        state,
    } = this;

    if (currentHost && layoutTemplate) {

        const { element, engine } = currentHost;

        if (cacheOutput && cache) {
            
            engine.save();

            engine.shadowOffsetX = state.shadowOffsetX;
            engine.shadowOffsetY = state.shadowOffsetY;
            engine.shadowBlur = state.shadowBlur;
            engine.shadowColor = state.shadowColor;

            engine.globalAlpha = state.globalAlpha;
            engine.globalCompositeOperation = state.globalCompositeOperation;

            engine.resetTransform();
            engine.drawImage(cache.element, 0, 0);

            engine.restore();
        }
        else {

            const {
                guidelinesPath,
                showGuidelines,
                useLayoutTemplateAsPath,
            } = this;

            const workingCells = (useLayoutTemplateAsPath) ?
                this.createTextCellsForPath(currentHost) :
                this.createTextCellsForSpace(currentHost);

            if (workingCells) {

                const { copyCell, mainCell } = workingCells;

                const ratio = getPixelRatio();

                const finalCell = requestCell(element.width / ratio, element.height / ratio);

                const finalElement = finalCell.element;
                const finalEngine = finalCell.engine;

                this.removeShadowAndAlpha(finalEngine);

                const copyCellHasUnderlines = this.addUnderlinesToCopyCell(currentHost, copyCell);

                const overlineCell = this.createOverlineCell(currentHost);
                const highlightCell = this.createHighlightCell(currentHost);

                if (!useLayoutTemplateAsPath && showGuidelines && guidelinesPath) this.stampGuidelinesOnCell(finalCell);

                if (copyCellHasUnderlines) finalEngine.drawImage(copyCell.element, 0, 0);

                finalEngine.drawImage(mainCell.element, 0, 0);

                if (overlineCell) finalEngine.drawImage(overlineCell.element, 0, 0);

                if (highlightCell) {

                    finalEngine.save();
                    finalEngine.globalCompositeOperation = DESTINATION_OVER;
                    finalEngine.drawImage(highlightCell.element, 0, 0);
                    finalEngine.restore();
                }

                engine.save();

                engine.resetTransform();

                engine.shadowOffsetX = state.shadowOffsetX;
                engine.shadowOffsetY = state.shadowOffsetY;
                engine.shadowBlur = state.shadowBlur;
                engine.shadowColor = state.shadowColor;

                engine.globalAlpha = state.globalAlpha;
                engine.globalCompositeOperation = state.globalCompositeOperation;

                engine.drawImage(finalElement, 0, 0);

                engine.restore();

                if (cacheOutput) this.cache = finalCell;
                else releaseCell(finalCell);

                releaseCell(copyCell, mainCell, overlineCell, highlightCell);
            }
        }
    }
};

P.createTextCellsForPath = function (host) {

    const ratio = getPixelRatio(),
        el = host.element,
        w = el.width / ratio,
        h = el.height / ratio;

    const uCell = requestCell(w, h);
    const mCell = requestCell(w, h);

    if (uCell && mCell) {

        const uEngine = uCell.engine;
        const mEngine = mCell.engine;

        const {
            state,
            lines,
            textUnits,
            defaultTextStyle,
        } = this;

        const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle);

        this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, uCell);
        this.removeShadowAndAlpha(uEngine);

        this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, mCell);
        this.removeShadowAndAlpha(mEngine);


        const line = lines[0];

        if (line) {

            const { unitData } = line;

            let unit, startData, startCorrection, localRotation,
                chars, charType, style, x, y, dx, dy, startRotation, cos, sin;

            unitData.forEach(u => {

                unit = textUnits[u];

                if (unit) {

                    ({
                        chars,
                        charType,
                        localRotation,
                        startCorrection,
                        startData,
                        startRotation,
                        style,
                    } = unit);

                    if (style) {

                        this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, uCell);
                        this.removeShadowAndAlpha(uEngine);
                        uEngine.lineWidth = currentTextStyle.underlineGap;

                        this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, mCell);
                        this.removeShadowAndAlpha(mEngine);
                    }

                    if (charType !== TEXT_TYPE_SPACE) {

                        [x, y] = startData;
                        [dx, dy] = startCorrection;

                        cos = _cos(startRotation);
                        sin = _sin(startRotation);

                        uEngine.setTransform(cos, sin, -sin, cos, x, y);
                        mEngine.setTransform(cos, sin, -sin, cos, x, y);

                        uEngine.rotate(localRotation);
                        mEngine.rotate(localRotation);

                        uEngine.strokeText(chars, dx, dy);
                        uEngine.fillText(chars, dx, dy);

                        switch (currentTextStyle.method) {

                            case DRAW :
                                mEngine.strokeText(chars, dx, dy);
                                break;

                            case FILL_AND_DRAW :
                                mEngine.fillText(chars, dx, dy);
                                mEngine.strokeText(chars, dx, dy);
                                break;

                            case DRAW_AND_FILL :
                                mEngine.strokeText(chars, dx, dy);
                                mEngine.fillText(chars, dx, dy);
                                break;

                            default:
                                mEngine.fillText(chars, dx, dy);
                        }
                    }
                }
            });
        }

        return {
            copyCell: uCell,
            mainCell: mCell,
        };
    }
    return null;
};

P.createTextCellsForSpace = function (host) {

    const ratio = getPixelRatio(),
        el = host.element,
        w = el.width / ratio,
        h = el.height / ratio;

    const uCell = requestCell(w, h);
    const mCell = requestCell(w, h);

    if (uCell && mCell) {

        const uEngine = uCell.engine;
        const mEngine = mCell.engine;

        const {
            state,
            lines,
            textUnits,
            defaultTextStyle,
            hyphenString,
            truncateString,
        } = this;

        const directionIsLtr = defaultTextStyle.direction === LTR;
        const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle);

        this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, uCell);
        this.removeShadowAndAlpha(uEngine);

        this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, mCell);
        this.removeShadowAndAlpha(mEngine);

        lines.forEach(line => {

            const { unitData } = line;

            let unit, startData, startCorrection, chars, style,
                x, y, dx, dy, startRotation, localRotation, cos, sin,
                lookAhead, text;

            unitData.forEach((u, index) => {

                unit = textUnits[u];

                if (unit) {

                    ({ startData, startCorrection, startRotation, localRotation, chars, style } = unit);

                    if (style) {

                        this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, uCell);
                        this.removeShadowAndAlpha(uEngine);
                        uEngine.lineWidth = currentTextStyle.underlineGap;

                        this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, mCell);
                        this.removeShadowAndAlpha(mEngine);
                    }

                    // + Soft hyphens and truncation marking is deliberately suppressed for RTL fonts
                    if (directionIsLtr) {

                        lookAhead = unitData[index + 1];

                        if (lookAhead?.substring) {

                            if (lookAhead === TEXT_TYPE_SOFT_HYPHEN) text = `${chars}${hyphenString}`;
                            else text = `${chars}${truncateString}`;
                        }
                        else text = chars;
                    }
                    else text = chars;

                    if (text !== SPACE) {

                        [x, y] = startData;
                        [dx, dy] = startCorrection;

                        cos = _cos(startRotation);
                        sin = _sin(startRotation);

                        uEngine.setTransform(cos, sin, -sin, cos, x, y);
                        mEngine.setTransform(cos, sin, -sin, cos, x, y);

                        uEngine.rotate(localRotation);
                        mEngine.rotate(localRotation);

                        uEngine.strokeText(text, dx, dy);
                        uEngine.fillText(text, dx, dy);

                        switch (currentTextStyle.method) {

                            case DRAW :
                                mEngine.strokeText(text, dx, dy);
                                break;

                            case FILL_AND_DRAW :
                                mEngine.fillText(text, dx, dy);
                                mEngine.strokeText(text, dx, dy);
                                break;

                            case DRAW_AND_FILL :
                                mEngine.strokeText(text, dx, dy);
                                mEngine.fillText(text, dx, dy);
                                break;

                            default:
                                mEngine.fillText(text, dx, dy);
                        }
                    }
                }
            });
        });

        return {
            copyCell: uCell,
            mainCell: mCell,
        };
    }
    return null;
};

P.addUnderlinesToCopyCell = function (host, copy) {

    const { lockFillStyleToEntity, underlinePaths } = this;

    if (underlinePaths.length) {

        const ratio = getPixelRatio(),
            el = host.element;

        const mycell = requestCell(el.width / ratio, el.height / ratio);

        if (mycell) {

            const engine = mycell.engine;
            this.removeShadowAndAlpha(engine);

            const copyEngine = copy.engine;

            underlinePaths.forEach(data => {

                engine.resetTransform();
                engine.translate(...data[2]);
                engine.fillStyle = this.getStyle(data[0], 'fillStyle', mycell);
                engine.fill(data[1]);
            });

            copyEngine.save();
            this.removeShadowAndAlpha(copyEngine);
            copyEngine.globalCompositeOperation = SOURCE_OUT;
            copyEngine.resetTransform();
            copyEngine.drawImage(mycell.element, 0, 0);
            copyEngine.restore();

            releaseCell(mycell);

            return true;
        }
    }
    return false;
};

P.createOverlineCell = function (host) {

    const overlinePaths = this.overlinePaths;

    if (overlinePaths.length) {

        const ratio = getPixelRatio();
        const el = host.element;

        const mycell = requestCell(el.width / ratio, el.height / ratio);

        if (mycell) {

            const engine = mycell.engine;
            this.removeShadowAndAlpha(engine);

            overlinePaths.forEach(data => {

                engine.resetTransform();
                engine.translate(...data[2]);
                engine.fillStyle = this.getStyle(data[0], 'fillStyle', mycell);
                engine.fill(data[1]);
            });

            return mycell;
        }
    }
    return null;
};

P.createHighlightCell = function (host) {

    const highlightPaths = this.highlightPaths;

    if (highlightPaths.length) {

        const ratio = getPixelRatio();
        const el = host.element;

        const mycell = requestCell(el.width / ratio, el.height / ratio);

        if (mycell) {

            const engine = mycell.engine;
            this.removeShadowAndAlpha(engine);

            highlightPaths.forEach(data => {

                engine.resetTransform();
                engine.translate(...data[2]);
                engine.fillStyle = this.getStyle(data[0], 'fillStyle', mycell);
                engine.fill(data[1]);
            });

            return mycell;
        }
    }
    return null;
};

P.stampGuidelinesOnCell = function (cell) {

    if (cell?.engine) {

        const {
            guidelinesPath,
            guidelineStyle,
            guidelineWidth,
            guidelineDash,
        } = this;

        const engine = cell.engine;

        engine.save();

        engine.setLineDash(guidelineDash);
        engine.strokeStyle = guidelineStyle;
        engine.lineWidth = guidelineWidth;

        engine.stroke(guidelinesPath);

        engine.restore();
    }
};


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


// ### Module variables and functions
const textEntityConverter = document.createElement(DIV);

// #### TextUnit objects
const UNIT_CHARS = 'chars',
    UNIT_TYPE = 'charType',
    UNIT_SETTABLE_KEYS = _freeze(['localHandleX', 'localHandleY', 'localOffsetX', 'localOffsetY', 'localAlignment']);

const UnitObject = function () {

    this.startData = makeCoordinate();
    this.startCorrection = makeCoordinate();

    this.boxData = {
        tl: [],
        tr: [],
        br: [],
        bl: [],
    };

    this.localHandle = [];
    this.localOffset = [];

    this.set(this.defs);

    return this;
};

const U = UnitObject.prototype = doCreate();
U.type = T_ENHANCED_LABEL_UNIT;

U.defs = {
    chars: ZERO_STR,
    charType: ZERO_STR,

    style: null,

    pathData: null,
    pathPos: 0,

    stampFlag: true,
    startData: null,
    startCorrection: null,

    localHandle: null,
    localOffset: null,

    boxData: null,

    localAlignment: 0,
    localRotation: 0,
    startRotation: 0,

    len: 0,
    height: 0,
    kernOffset: 0,
    replaceLen: 0,
};
U.defKeys = _keys(U.defs);

U.set = function (items = Ωempty) {

    let box, tl, tr, br, bl;

    for (const [key, value] of _entries(items)) {

        if (this.defKeys.includes(key) || UNIT_SETTABLE_KEYS.includes(key)) {

            switch (key) {

                case 'startData' :
                case 'startCorrection' :

                    if (value != null) this[key].set(value);
                    else this[key].zero();
                    break;

                case 'localHandleX' :

                    if (value != null) this.localHandle[0] = value;
                    else this.localHandle[0] = null;
                    break;

                case 'localHandleY' :

                    if (value != null) this.localHandle[1] = value;
                    else this.localHandle[1] = null;
                    break;

                case 'localHandle' :

                    if (value != null) {

                        this.localHandle[0] = value[0];
                        this.localHandle[1] = value[1];
                    }
                    else {

                        this.localHandle[0] = null;
                        this.localHandle[1] = null;
                    }
                    break;

                case 'localOffsetX' :

                    if (value != null) this.localOffset[0] = value;
                    else this.localOffset[0] = null;
                    break;

                case 'localOffsetY' :

                    if (value != null) this.localOffset[1] = value;
                    else this.localOffset[1] = null;
                    break;

                case 'localOffset' :

                    if (value != null) {

                        this.localOffset[0] = value[0];
                        this.localOffset[1] = value[1];
                    }
                    else {

                        this.localOffset[0] = null;
                        this.localOffset[1] = null;
                    }
                    break;

                case 'boxData' :

                    box = this.boxData;

                    if (value != null) {

                        ({ tl, tr, br, bl } = value);

                        if (tl != null && _isArray(tl)) {

                            box.tl.length = 0;
                            box.tl.push(...tl);
                        }
                        if (tr != null && _isArray(tr)) {

                            box.tr.length = 0;
                            box.tr.push(...tr);
                        }
                        if (br != null && _isArray(br)) {

                            box.br.length = 0;
                            box.br.push(...br);
                        }
                        if (bl != null && _isArray(bl)) {

                            box.bl.length = 0;
                            box.bl.push(...bl);
                        }
                    }
                    else {
                        box.tl.length = 0;
                        box.tr.length = 0;
                        box.br.length = 0;
                        box.bl.length = 0;
                    }
                    break;

                case 'chars' :
                case 'charType' :
                case 'height' :
                case 'kernOffset' :
                case 'len' :
                case 'localAlignment' :
                case 'localRotation' :
                case 'pathData' :
                case 'pathPos' :
                case 'replaceLen' :
                case 'stampFlag' :
                case 'startRotation' :
                case 'style' :

                    if (value != null) this[key] = value;
                    else this[key] = this.defs[key];
            }
        }
    }
    return this;
};

U.reset = function () {

    this.set(this.defs);
    return this;
};

P.setTextUnit = function (index, items) {

    const unit = this.textUnits[index];

    if (unit !== null) {

        for (const [key, val] of _entries(items)) {

            if (UNIT_SETTABLE_KEYS.includes(key)) {

                unit.set({ [key]: val});
            }
        }
    }
    this.dirtyLayout = true;
    this.dirtyCache();
};

P.setAllTextUnits = function (items) {

    this.textUnits.forEach(unit => {

        if (unit !== null) {

            for (const [key, val] of _entries(items)) {

                if (UNIT_SETTABLE_KEYS.includes(key)) unit.set({ [key]: val});
            }
        }
    });
    this.dirtyLayout = true;
    this.dirtyCache();
};


P.checkHit = function (items = [], mycell) {

    return false;
};


// #### TextUnit pool
const unitPool = [];

const requestUnit = function (items = Ωempty) {

    if (!unitPool.length) unitPool.push(new UnitObject());

    const u = unitPool.shift();
    u.set(items);

    return u
};

// `exported function` - return a Coordinate to the coordinate pool. Failing to return Coordinates to the pool may lead to more inefficient code and possible memory leaks.
const releaseUnit = function (...args) {

    args.forEach(u => {

        if (u && u.type === T_ENHANCED_LABEL_UNIT) unitPool.push(u.reset());
    });
};


// #### Line objects
const LineObject = function () {

    this.startAt = makeCoordinate();
    this.endAt = makeCoordinate();

    this.unitData = [];

    this.set(this.defs);

    return this;
};
const L = LineObject.prototype = doCreate();
L.type = T_ENHANCED_LABEL_LINE;

L.defs = {
    length: 0,
    isPathEntity: false,
    startAt: null,
    endAt: null,
    unitData: null,
};
L.defKeys = _keys(L.defs);

L.set = function (items = Ωempty) {

    for (const [key, value] of _entries(items)) {

        if (this.defKeys.includes(key)) {

            switch (key) {

                case 'startAt' :
                case 'endAt' :

                    if (value != null) this[key].set(value);
                    else this[key].zero();
                    break;

                case 'unitData' :

                    this[key].length = 0;
                    if (value != null) this[key].push(...value);
                    break;

                default :
                    if (value != null) this[key] = value;
                    else this[key] = this.defs[key];
            }
        }
    }
    return this;
};

L.reset = function () {

    this.set(this.defs);
    return this;
};

// #### LineObject pool
const linePool = [];

const requestLine = function (items = Ωempty) {

    if (!linePool.length) linePool.push(new LineObject());

    const l = linePool.shift();
    l.set(items);

    return l;
};

const releaseLine = function (...args) {

    args.forEach(l => {

        if (l && l.type === T_ENHANCED_LABEL_LINE) linePool.push(l.reset());
    });
};


// Line object pool
const TextUnitArray = function () {

    const arr = [];

    _setPrototypeOf(arr, TextUnitArray.prototype);

    return arr;
};


// #### TextUnit array
const A = TextUnitArray.prototype = _create(Array.prototype);
A.constructor = TextUnitArray;
A.type = T_ENHANCED_LABEL_UNITARRAY;

const makeTextUnitArray = () => new TextUnitArray();

A.findByIndex = function (index) {

    let item;

    for (let i = 0, iz = this.length; i < iz; i++) {

        item = this[i];

        if (item.index === index) return item;
    }
    return null;
};

A.findFirstByChars = function (chars) {

    let item;

    for (let i = 0, iz = this.length; i < iz; i++) {

        item = this[i];

        if (item.chars.includes(chars)) return item;
    }
    return null;
};

A.findAllByChars = function (chars) {

    let item;

    const res = [];

    for (let i = 0, iz = this.length; i < iz; i++) {

        item = this[i];

        if (item.chars.includes(chars)) res.push(item);
    }
    return res;
};

