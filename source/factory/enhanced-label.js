// # EnhancedLabel factory
// TODO - document purpose and description
//
// To note: EnhancedLabel entitys will, if told to, break words across lines on hard (- U+2010) and soft (&shy U+00AD) hyphens. It makes no effort to guess whether a word _can_ be broken at a given place, regardless of any [CSS settings for the web page/component](https://css-tricks.com/almanac/properties/h/hyphenate/) in which the SC canvas finds itself. For that sort of functionality, use a third party library like [Hyphenopoly](https://github.com/mnater/Hyphenopoly) to pre-process text before feeding it into the entity.


// #### Imports
import { artefact, constructors, cell, cellnames, fontfamilymetadata, fontfamilymetadatanames, group, styles, stylesnames } from '../core/library.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../untracked-factory/text-style.js';
import { makeCoordinate } from '../untracked-factory/coordinate.js';

import { currentGroup } from './canvas.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';
import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';
// import { releaseArray, requestArray } from '../helper/array-pool.js';

import baseMix from '../mixin/base.js';
import deltaMix from '../mixin/delta.js';

import { addStrings, doCreate, mergeDiscard, mergeOver, pushUnique, removeItem, xta, λthis, Ωempty } from '../helper/utilities.js';

import { _abs, _assign, _ceil, _computed, _create, _freeze, _hypot, _isArray, _isFinite, _keys, _parse, _radian, _round, ALPHABETIC, ARIA_LIVE, BLACK, BOTTOM, CENTER, DATA_TAB_ORDER, DEF_SECTION_PLACEHOLDER, DIV, DRAW, DRAW_AND_FILL, END, ENTITY, FILL, FILL_AND_DRAW, FONT_LENGTH_REGEX, FONT_VARIANT_VALS, FONT_VIEWPORT_LENGTH_REGEX, GOOD_HOST, HANGING, IDEOGRAPHIC, ITALIC, LEFT, LTR, MIDDLE, NAME, NONE, NORMAL, OBLIQUE, POLITE, PX0, RIGHT, ROUND, SMALL_CAPS, SPACE, SPACE_BETWEEN, START, STATE_KEYS, T_CANVAS, T_CELL, T_ENHANCED_LABEL, T_GROUP, TEXT_HARD_HYPHEN_REGEX, TEXT_NO_BREAK_REGEX, TEXT_SOFT_HYPHEN_REGEX, TEXT_SPACES_REGEX, TEXT_TYPE_CHARS, TEXT_TYPE_HYPHEN, TEXT_TYPE_SOFT_HYPHEN, SYSTEM_FONTS, TEXT_TYPE_SPACE, TEXT_TYPE_TRUNCATE, TOP, UNDEF, ZERO_STR } from '../helper/shared-vars.js';


// #### Local variables
const textEntityConverter = document.createElement(DIV);


// #### EnhancedLabel constructor
const EnhancedLabel = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.state = makeState(Ωempty);

    this.defaultTextStyle = makeTextStyle({
        name: `${this.name}_default-textstyle`,
        isDefaultTextStyle: true,
    });

    this.set(this.defs);

    if (!items.group) items.group = currentGroup;

    this.currentFontIsLoaded = false;
    this.updateUsingFontParts = false;
    this.updateUsingFontString = false;
    this.usingViewportFontSizing = false;

    this.currentStampPosition = makeCoordinate();
    this.textHandle = makeCoordinate();

    this.delta = {};

    this.lines = [];
    this.textUnits = [];

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

// __layoutTemplatePathStart__ - where to start text positioning along the layout engine path.
    layoutTemplatePathStart: 0,

// __layoutTemplateLineOffset__ - how far away from the origin point the initial line should be.
    layoutTemplateLineOffset: 0,

// __breakTextOnSpaces__ - boolean.
// + When `true` (default), the textUnits will consist of words which are stamped as a unit (which preserves ligatures and kerning within the word).
// + Set this attribute to `false` if the font's language, when written, (generally) doesn't include spaces (eg: Chinese, Japanese), or when there is a requirement to style individual characters within words
    breakTextOnSpaces: true,

// __breakWordsOnHyphens__ - boolean.
// + When `true`, words that include hard or soft hyphens will be split into separate units for processing. Be aware that in highly ligatured fonts this may cause problems. The attribute defaults to `false`.
// + It is possible to style individual characters in a text that breaks on spaces by adding soft hyphens before and after the characters, but it may (will) lead to unnatural-looking word breaks at the end of the line.
// + Attribute has no effect if `breakTextOnSpaces` is `false`.
    breakWordsOnHyphens: false,

// __justifyLine__ - string enum. Allowed values are 'start', 'end', 'center' (default), 'space-between'
// + Determines the positioning of text units along the line. Has nothing to do with the `direction` attribute.
    justifyLine: CENTER,

// __allowSubUnitStyling__ - boolean.
// + When `true`, forces space-hyphen-broken text to become single-character text units, with kerning (if required) handled manually. This will break heavily ligatured fonts (such as Arabic and Devangari fonts) in unexpected and unpleasant ways. Default: `false`
    allowSubUnitStyling: false,

// __truncateString__ - string.
    truncateString: '…',

// __hyphenString__ - string.
    hyphenString: '-',

// __textHandle__ - Coordinate.
    textHandle: null,

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
    anchor: null,

    method: FILL,

    alignment: 0,

// __noDeltaUpdates__ - Boolean flag - EnhancedLabel entitys support delta animation - achieved by updating the `...path` attributes by appropriate (and small!) values. If the EnhancedLabel is not going to be animated by delta values, setting the flag to `true` may help improve rendering efficiency.
    noDeltaUpdates: false,

    useMimicDimensions: true,
    useMimicFlip: true,
    useMimicHandle: true,
    useMimicOffset: true,
    useMimicRotation: true,
    useMimicScale: true,
    useMimicStart: true,

    textIsAccessible: true,
    accessibleText: DEF_SECTION_PLACEHOLDER,
    accessibleTextPlaceholder: DEF_SECTION_PLACEHOLDER,
    accessibleTextOrder: 0,

};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetObjects = pushUnique(P.packetObjects, ['layoutTemplate']);

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

    copy = this.handlePacketAnchor(copy, items);

    return copy;
};


// #### Clone management
// TODO - this functionality is currently disabled, need to enable it and make it work properly
P.clone = λthis;


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

    return this?.layoutTemplate.get('width');
};
S.width = function (item) {

    this?.layoutTemplate.set({width: item});
};
D.width = function (item) {

    this?.layoutTemplate.deltaSet({width: item});
};

G.height = function () {

    return this?.layoutTemplate.get('height');
};
S.height = function (item) {

    this?.layoutTemplate.set({height: item});
};
D.height = function (item) {

    this?.layoutTemplate.deltaSet({height: item});
};

G.dimensions = function () {

    return this?.layoutTemplate.get('dimensions');
};
S.dimensions = function (item) {

    this?.layoutTemplate.set({dimensions: item});
};
D.dimensions = function (item) {

    this?.layoutTemplate.deltaSet({dimensions: item});
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

// __layoutTemplate__ - TODO: documentation
S.layoutTemplate = function (item) {

// console.log(this.name, 'S.layoutTemplate', item)
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

D.lineSpacing = function (item) {

    if (item.toFixed) this.lineSpacing += item;

    if (this.lineSpacing <= 0) this.lineSpacing = 0.1;

    this.dirtyLayout = true;
};
S.lineSpacing = function (item) {

    if (item.toFixed) this.lineSpacing = item;

    if (this.lineSpacing <= 0) this.lineSpacing = 0.1;

    this.dirtyLayout = true;
};

D.layoutTemplateLineOffset = function (item) {

    if (item.toFixed) {

        this.layoutTemplateLineOffset += item;
        this.dirtyLayout = true;
    }
};
S.layoutTemplateLineOffset = function (item) {

    if (item.toFixed) {

        this.layoutTemplateLineOffset = item;
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

console.log(this.name, 'S.text')
    this.rawText = (item.substring) ? item : item.toString();
    this.text = this.convertTextEntityCharacters(this.rawText);

    this.dirtyText = true;
    this.dirtyFont = true;
    this.currentFontIsLoaded = false;
};

S.truncateString = function (item) {

console.log(this.name, 'S.truncateString')
    if (item.substring) {

        this.truncateString = this.convertTextEntityCharacters(item);
        this.dirtyText = true;
    }
};

S.hyphenString = function (item) {

console.log(this.name, 'S.hyphenString')
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

S.guidelineDash = function (item) {

    if (_isArray(item)) this.guidelineDash = item;
}

S.guidelineStyle = function (item) {

    if (!item) this.guidelineStyle = this.defs.guidelineStyle;
    else if (item.substring) this.guidelineStyle = item;
}


// #### Prototype functions

// `recalculateFont` - force the entity to recalculate its dimensions without having to set anything.
// + Can also be invoked via the entity's Group object's `recalculateFonts` function
// + Can be invoked globally via the `scrawl.recalculateFonts` function
// + When triggered by userInteraction listener (browser dimensions have changed) we only care about it if we have font sizes relative to the viewport
P.recalculateFont = function (fromUserInteractionListener = false) {

    if (fromUserInteractionListener) {

console.log(this.name, 'recalculateFont (trigger: userInteractionListener)');
        if (this.usingViewportFontSizing) this.dirtyFont = true;
    }
    else {

console.log(this.name, 'recalculateFont (trigger: external code)');
        this.dirtyFont = true;
    }
};

// `getTester` - Retrieve the DOM labelStylesCalculator &lt;div> element
P.getTester = function () {

console.log(this.name, 'getTester (trigger: none. Called by: assessTextForStyle, S.text)');

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

console.log(this.name, 'getControllerCell (trigger: none. Called by: assessTextForStyle, S.text)');

    const group = this.group;

    if (group) {

        const host = (group && group.getHost) ? group.getHost() : null;

        if (host) return host.getController();
    }
    return null;
};


// `makeWorkingTextStyle` - Clone a TextStyle object
P.makeWorkingTextStyle = function (template, name) {

// console.log(this.name, 'makeWorkingTextStyle (trigger: various)');

    const workStyle = _create(template);
    _assign(workStyle, template);

    workStyle.name = name;
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

    const scale = this.layoutTemplate?.currentScale || 1;

    if (val.toFixed) return val * scale;

    if (val === START) return (dir === LTR) ? 0 : dim * scale;

    if (val === CENTER) return (dim / 2) * scale;

    if (val === END) return (dir === LTR) ? dim * scale : 0;

    if (val === LEFT) return 0;

    if (val === RIGHT) return dim * scale;

    if (!_isFinite(parseFloat(val))) return 0;

    return ((parseFloat(val) / 100) * dim) * scale;
};

// `getTextHandleY` - Calculate the vertical offset required for a given TextUnit
P.getTextHandleY = function (val, size, font) {

// console.log(this.name, 'getTextHandleY (trigger: various)');

    const { height, hangingBaseline, alphabeticBaseline, ideographicBaseline, verticalOffset } = this.getFontMetadata(font);

    const ratio = size / 100;
    const scale = this.layoutTemplate?.currentScale || 1;

    const dim = (height - verticalOffset) * ratio;

    if (val.toFixed) return val * scale;

    if (val === TOP) return 0;

    if (val === BOTTOM) return dim * scale;

    if (val === CENTER) return (dim / 2) * scale;

    if (val === ALPHABETIC) return (_isFinite(alphabeticBaseline)) ?
        (alphabeticBaseline * ratio) * scale :
        0;

    if (val === HANGING) return (_isFinite(hangingBaseline)) ?
        (hangingBaseline * ratio) * scale :
        0;

    if (val === IDEOGRAPHIC) return (_isFinite(ideographicBaseline)) ?
        (ideographicBaseline * ratio) * scale :
        0;

    if (val === MIDDLE) return (dim / 2) * scale;

    if (!_isFinite(parseFloat(val))) return 0;

    return (parseFloat(val) / 100) * dim;
};


// `temperFont` - manipulate the user-supplied font string to create a font string the canvas engine can use
// + This is the preparation step
P.temperFont = function () {

console.log(this.name, 'temperFont (trigger: none - called by cleanFont once font has loaded)');

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

    console.log('checkFontIsLoaded (trigger: cleanFont)', font);

    if (font == null) {

        this.currentFontIsLoaded = false;
        console.log('checkFontIsLoaded error: argument is undefined');
    }
    else if (SYSTEM_FONTS.includes(font)) {

        console.log('checkFontIsLoaded success: system font detected');
        this.currentFontIsLoaded = true;
    }
    else {

        if (this.currentFontIsLoaded != null && !this.currentFontIsLoaded) {

            this.currentFontIsLoaded = null;

            const fonts = document.fonts;

            console.log('checkFontIsLoaded update: invoking async load check');

            fonts.load(font)
            .then (() => {

                this.currentFontIsLoaded = true;
                console.log('checkFontIsLoaded load invocation completed successfully:', font);
            })
            .catch ((e) => {

                this.currentFontIsLoaded = false;
                console.log('checkFontIsLoaded load invocation error:', font, e);
            });
        }
        else {

            console.log('checkFontIsLoaded issue: prior check is still progressing');
        }
    }
};

// `calculateTextStyleFontStrings` - manipulate the user-supplied font string to create a font string the canvas engine can use
// + This is the process step. We use it to set the default TextStyle object's font-related attributes
// + Once we have that data, we can clone the default TextStyle object to perform dynamic updates as calculations, and then the stamp process proceed
P.calculateTextStyleFontStrings = function (textStyle, calculator, results) {

console.log(this.name, 'calculateTextStyleFontStrings (trigger: none - called by temperFont)');

    let fontSize = textStyle.fontSize;
    const { fontStretch, fontStyle, fontWeight, fontVariantCaps, fontString } = textStyle;
    const { lineSpacing, updateUsingFontParts, updateUsingFontString, layoutTemplate } = this;

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

        engine.font = font;

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

// `convertTextEntityCharacters`, `textEntityConverter` - (not part of the Label prototype!) - a &lt;textarea> element not attached to the DOM which we can use to temper user-supplied text
// + Tempering includes converting HTMLentity copy - such as changing `&epsilon;` to an &epsilon; letter
// + We also strip the supplied text of all HTML markup
P.convertTextEntityCharacters = function (item) {

console.log(this.name, 'convertTextEntityCharacters');
    textEntityConverter.innerHTML = item;
    return textEntityConverter.textContent;
};

// `getStyle` - internal helper function to find a gradient, pattern, cell or string style
P.getStyle = function (val, stateAlternative, host) {

    if (host == null) return BLACK;

    if (!val) val = this.state[stateAlternative];

    if (val == null) return BLACK;

    if (val.substring) {

        let brokenStyle = null;

        if (stylesnames.includes(val)) brokenStyle = styles[val];
        else if (cellnames.includes(val)) brokenStyle = cell[val];

        if (brokenStyle != null) val = brokenStyle.getData(this, host);
    }
    else val = val.getData(this, host);

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

console.log(this.name, 'cleanFont (trigger: dirtyFont)', this.dirtyFont);

    if (this.currentFontIsLoaded) {

        this.dirtyFont = false;
        this.temperFont();
    }
    else {

console.log(this.name, `cleanFont - looking to see if ${this.defaultTextStyle.fontString} has been loaded`);
        this.checkFontIsLoaded(this.defaultTextStyle.fontString);
    }
};


// `cleanPathObject` - calculate the EnhancedLabel entity's __Path2D object__
P.cleanPathObject = function () {

console.log(this.name, `cleanPathObject (trigger: dirtyPathObject ${this.dirtyPathObject}, checks: layout.pathObject ${this.layoutTemplate?.pathObject})`);

    const layout = this.layoutTemplate;

    if (this.dirtyPathObject && layout?.pathObject) {

        this.dirtyPathObject = false;

        this.pathObject = new Path2D(layout.pathObject);
    }
};


// `cleanLayout` - recalculate the positioning of all TextUnits in the space or along the path
P.cleanLayout = function () {

console.log(this.name, `cleanLayout (triggers: dirtyLayout ${this.dirtyLayout}, checks: currentFontIsLoaded ${this.currentFontIsLoaded})`);

    if (this.currentFontIsLoaded) {

        this.dirtyLayout = false;

        const { useLayoutTemplateAsPath } = this;

        if (useLayoutTemplateAsPath) {

            // TODO: Path-related positioning stuff
        }
        else this.calculateLines();

        this.dirtyTextLayout = true;
    }
};


// `calculateLines` - calculate the positions and lengths of multiple lines withing a layout entity's enclosed space.
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
                coord.rotate(alignment);
                results.push(...coord);
            }
        }
        return results;
    };

    const walkTheLine = (x, y, dim) => {

        // We always walk the line from left to right
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

        // In RTL script situations, the line partials need to be in RTL order
        if (directionIsLtr) return res;
        else {

            const rtlRes = [];

            for (i = res.length - 1; i >= 0; i -= 2) {

                rtlRes.push(res[i - 1], res[i]);
            }
            return rtlRes;
        }
    }


    // Main functionality
    const coord = requestCoordinate();

    const mycell = requestCell(),
        engine = mycell.engine;

    const {
        alignment,
        defaultTextStyle,
        layoutTemplate,
        layoutTemplateLineOffset,
        lines,
        lineSpacing,
    } = this;

    const {
        currentDimensions,
        currentScale,
        currentRotation,
        currentStampPosition,
        pathObject,
        winding,
    } = layoutTemplate;

    const {
        fontSizeValue,
        direction,
    } = defaultTextStyle;

    const rotation = (-alignment - currentRotation) * _radian;

    const directionIsLtr = direction === LTR;

    const step = (fontSizeValue * lineSpacing) * currentScale;

    const [constX, constY] = currentStampPosition;
    const [width,] = currentDimensions;

    const rawData = [],
        lineProcessing = [];

    let flag = false,
        path = '',
        beginX, beginY,
        lineResults, lineData, lineVal,
        sx, sy, ex, ey, i, iz,
        counter;

    // Prepare canvas for work
    mycell.rotateDestination(engine, constX, constY, layoutTemplate);
    engine.rotate(rotation);

    // Main calculations: start with the line closest to the layout engine's `currentStampPosition` attribute
    beginY = constY + layoutTemplateLineOffset;
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
    beginY = constY + layoutTemplateLineOffset;
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
    lineProcessing.length = 0;

    rawData.forEach(d => {

        lineData = d[1];
        counter = 0;

        // There can be 1 or more "partial" lines along a line (eg: crescent shape horns)
        for (i = 0, iz = lineData.length; i < iz; i += 4) {

            sx = lineData[counter++];
            sy = lineData[counter++];
            ex = lineData[counter++];
            ey = lineData[counter++];

            lineVal = _hypot(sx - ex, sy - ey);

            lineProcessing.push(lineVal);
        }
    });

    lineVal = 0;

    rawData.forEach(d => {

        lineData = d[1];
        counter = 0;

        // There can be 1 or more "partial" lines along a line (eg: crescent shape horns)
        for (i = 0, iz = lineData.length; i < iz; i += 4) {

            sx = lineData[counter++];
            sy = lineData[counter++];
            ex = lineData[counter++];
            ey = lineData[counter++];

            lineResults = lineProcessing.shift();

            // Currently storing as an object. Need to turn it into an array for more efficient processing
            lines.push({
                length: _ceil(lineResults),
                startAt: [...coord.set([sx, sy]).add(currentStampPosition)],
                unitData: [],
                maxHeight: 0,
            });

            lineVal += lineResults;
        }
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

// `cleanText` - Break the entity's text into smaller TextUnit objects which can be positioned within, or along, the layout entity's shape
P.cleanText = function () {

console.log(this.name, `cleanText (trigger: dirtyText ${this.dirtyText}, checks: currentFontIsLoaded', ${this.currentFontIsLoaded})`);

    const makeUnitObject = (chars, type) => {

        return {
            chars,
            highlightBack: [],
            highlightOut: [],
            highlightStyle: '',
            kernOffset: 0,
            len: 0,
            height: 0,
            lineOffset: 0,
            localOffsetX: 0,
            localOffsetY: 0,
            overlineBack: [],
            overlineOut: [],
            overlineStyle: '',
            replaceLen: 0,
            rotation: 0,
            stampFlag: true,
            stampPos: [0, 0],
            style: null,
            type,
            underlineBack: [],
            underlineOut: [],
            underlineStyle: '',
            underlineGap: 0,
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


// `assessTextForStyle` - Add styling details to each TextUnit
// + Note that styling on a per-TextUnit basis requires CSS code; there is no way to directly style a TextUnit in SC except by manually replacing its `style` attribute object in code (which is dangerous and definitely not guaranteed to work!)
P.assessTextForStyle = function () {

console.log(this.name, `assessTextForStyle (trigger: none - called directly by cleanText)`);

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
        tester.style.setProperty('--SC-method', defaultTextStyle.method);

        tester.className = this.name;
        tester.innerHTML = rawText;
    };


    // Start processing data here
    const { rawText, defaultTextStyle, textUnits } = this;

    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle, 'style-worker');

    let cursor = 0;

    this.usingViewportFontSizing = FONT_VIEWPORT_LENGTH_REGEX.test(currentTextStyle.fontSize);
    setupTester();
    processNode(tester);
};


// `measureTextUnits` - TextUnit lengths represent the amount of space they will need to take along the line they will (eventually) be assigned to.
// + Takes into account the styling for each TextUnit, which can have a significant impact on the amount of space it requires on a line.
P.measureTextUnits = function () {

console.log(this.name, 'measureTextUnits (trigger: none - called by cleanText)');

    const { textUnits, defaultTextStyle, state, hyphenString, truncateString } = this;

    const mycell = requestCell(),
        engine = mycell.engine;

    let res, chars, type, style, len, nextUnit, nextStyle, nextChars, nextType, nextLen, unkernedLen;

    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle, 'measure-worker');
    this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, mycell);

    textUnits.forEach(t => {

        ({chars, type, style} = t);

        if (style)  this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, mycell);

        res = engine.measureText(chars);

        t.len = res.width;

        if (type === TEXT_TYPE_SPACE) {

            t.len += currentTextStyle.wordSpaceValue;
            t.height = 0;
        }
        else if (type === TEXT_TYPE_SOFT_HYPHEN) {

            res = engine.measureText(hyphenString);
            t.replaceLen = res.width;
            t.height = 0;
        }
        else {

            res = engine.measureText(truncateString);
            t.replaceLen = res.width;
            t.height = parseFloat(currentTextStyle.fontSize);
        }
    });

    // Gather kerning data (if required) - only applies to rows
    if (this.useLayoutTemplateAsPath || !this.breakTextOnSpaces || this.allowSubUnitStyling) {

        // Reset things back to initial before starting the second walk-through
        this.setEngineFromWorkingTextStyle(currentTextStyle, defaultTextStyle, state, mycell);

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
    releaseCell(mycell);
};

// `layoutText` - initiate the process of laying out text into a space, or along a line
// + TODO: The assumption here is that if we are laying text along a path, there will only be one line with a length equal to the layout engine's path length. In such cases we won't need to care about soft hyphens, but will need to care about truncation (regardless of whether we allow the text to wrap itself along the line)
P.layoutText = function () {

console.log(this.name, `layoutText (trigger: dirtyTextLayout ${this.dirtyTextLayout}, checks: currentFontIsLoaded' ${this.currentFontIsLoaded})`);

    if (this.currentFontIsLoaded) {

        if (this?.lines.length && this?.textUnits.length) {

            this.dirtyTextLayout = false;

            this.lines.forEach(line => {

                line.unitData.length = 0;
            });

            this.textUnits.forEach(unit => {

                unit.stampFlag = true;
                unit.lineOffset = 0;
            });

            this.assignTextUnitsToLines();
            this.positionTextUnits();
        }
    }
};


// `assignTextUnitsToLines` - Assign sufficient text units to each line to fill the line's length
// + TODO: The assumption here is that if we are laying text along a path, there will only be one line with a length equal to the layout engine's path length. In such cases we won't need to care about soft hyphens, but will need to care about truncation (regardless of whether we allow the text to wrap itself along the line)
P.assignTextUnitsToLines = function () {

console.log(this.name, 'assignTextUnitsToLines (trigger: none - called by layoutText)');

    const {
        lines,
        textUnits,
        breakWordsOnHyphens,
    } = this;

    const unitArrayLength = textUnits.length;

    let unitCursor = 0,
        lengthRemaining,
        i, unit, unitData, unitAfter, len, lineLength, type;

    const addUnit = function (len) {

        lengthRemaining -= len;
        unitData.push(unitCursor);
        ++unitCursor;
    };

    lines.forEach(line => {

        ({
            length: lineLength,
            unitData,
        } = line);

        lengthRemaining = lineLength;

        for (i = unitCursor; i < unitArrayLength; i++) {

            unit = textUnits[i];

            ({ len, type } = unit);

            // Check: is there room for the text unit
            if (len < lengthRemaining) {

                if (breakWordsOnHyphens) {

                    // We need to do a look-forward for soft hyphens
                    unit = textUnits[i + 1];

                    // Next text unit is a soft hyphen
                    if (unit && unit?.type === TEXT_TYPE_SOFT_HYPHEN) {

                        unitAfter = textUnits[i + 2];

                        // Check: this text unit and the next significant one will fit on line
                        if (unitAfter && len + unitAfter.len < lengthRemaining) addUnit(len);

                        // Check: this text unit and the visible hyphen will fit on line
                        else if (len + unit.replaceLen < lengthRemaining) {

                            addUnit(len);
                            addUnit(unit.replaceLen);
                            unitData.push(TEXT_TYPE_SOFT_HYPHEN);
                            break;
                        }

                        // Check: there's no room for this text unit and its soft hyphen
                        else break;
                    }

                    // Next text unit is not a soft hyphen; add this text unit to the array
                    else addUnit(len);
                }
                else addUnit(len);
            }

            // There's no room left on this line for the TextUnit
            // + There is a dilemma here, concerning lines where the first TextUnit available to add to the line is too long to fit.
            // + Currently, we just leave the line empty and move onto the next line (which might be able to fit the long TextUnit)
            // + If the offending TextUnit is too long for all subsequent lines then neither it nor any of the following TextUnits will appear.
            // + An alternative approach could be to allow the overlong TextUnit to appear on a line if it's the only TextUnit on that line, thus removing the display block for subsequent TextUnits
            // + For the moment, we will not implement this alternative approach. It's up to developers and designers to use words that can fit into the available line space. Overlong words can be hyphenated with soft (&amp;shy;) hyphens if required.
            else break;
        }
    });

    // Truncation check
    if (unitArrayLength !== unitCursor) {

        let currentLine, replaceLen,
            acc, mutableUnitData;

        for (currentLine = lines.length - 1; currentLine >= 0; currentLine--) {

            ({
                length: lineLength,
                unitData,
            } = lines[currentLine]);

            acc = unitData.reduce((a, v) => {

                if (textUnits[v] && textUnits[v].type === TEXT_TYPE_CHARS) a++
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

                    ({ len, replaceLen, type } = unit);

                    if (type !== TEXT_TYPE_CHARS && type !== TEXT_TYPE_SOFT_HYPHEN) {

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

console.log(this.name, 'positionTextUnits (trigger: none - called by layoutText)');

    if (this.useLayoutTemplateAsPath) this.positionTextUnitsAlongPath();
    else this.positionTextUnitsInSpace();
};


// `positionTextUnitsAlongPath` - Position each TextUnit along a single-line path of the layout entity (if possible)
P.positionTextUnitsAlongPath = function () {

console.log(this.name, 'positionTextUnitsAlongPath (trigger: none - called by positionTextUnits)');

};


// `positionTextUnitsInSpace` - Position each TextUnit along the line it has been assigned to. This work takes into account:
// + Language direction
// + Line justification requirements
P.positionTextUnitsInSpace = function () {

console.log(this.name, 'positionTextUnitsInSpace (trigger: none - called by positionTextUnits)');

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
                        if (justifyLine === SPACE_BETWEEN && unit.type === TEXT_TYPE_SPACE) noOfSpaces++;
                    }
                }
            });

            // Unused space
            spaceRemaining = length - unitLengths;

            // Adjustment for dynamic inputs (soft hyphen, truncation chars)
            if (unitData.includes(TEXT_TYPE_SOFT_HYPHEN) || unitData.includes(TEXT_TYPE_TRUNCATE)) {

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

                // If justify is 'space-between' ... we handle this case below
                case SPACE_BETWEEN :

                    if (noOfSpaces) spaceStep = spaceRemaining / noOfSpaces;

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

    // Code to identify and generate paths for underlines, overlines and highlights is in separate functions, for clarity
    this.positionTextDecoration();
    this.buildHighlightPaths();
    this.buildOverlinePaths();
    this.buildUnderlinePaths();
};


// `positionTextDecoration` - Recovers data which can be used for building underline, overline and highlight Path2D objects
P.positionTextDecoration = function () {

console.log(this.name, 'positionTextDecoration (trigger: none - called by positionTextUnitsInSpace)');

    const {
        lines,
        textUnits,
        defaultTextStyle,
        textHandle,
        getTextHandleX: getX,
        getTextHandleY: getY,
        layoutTemplate,
    } = this;

    const direction = defaultTextStyle.direction;
    const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle, 'stamp-worker');
    const currentScale = layoutTemplate.currentScale;

    const [hx, hy] = textHandle;

    this.updateWorkingTextStyle(currentTextStyle, Ωempty);

    let {
        fontFamily,
        fontSize,
        includeUnderline, underlineStyle, underlineOffset, underlineWidth, underlineGap,
        includeOverline, overlineStyle, overlineOffset, overlineWidth,
        includeHighlight, highlightStyle,
    } = currentTextStyle;

    let unit, unitData, style, lineOffset, len,
        highlightOut, highlightBack,
        underlineOut, underlineBack,
        overlineOut, overlineBack,
        localOffset, localDepth,
        fontSizeValue = parseFloat(fontSize),
        ox = 0,
        oy = getY.call(this, hy, fontSizeValue, fontFamily);

    let metadata = this.getFontMetadata(fontFamily),
        ratio = fontSizeValue / 100,
        verticalOffset = (metadata != null) ? metadata.verticalOffset * ratio * currentScale : 0;

    // Process each line separately
    // + Decorations that break across lines will have separate Path2D objects for each line
    lines.forEach(line => {

        unitData = line.unitData;

        line.maxHeight = fontSizeValue;

        unitData.forEach(u => {

            if (u.toFixed) {

                unit = textUnits[u];

                ({
                    style, lineOffset, len,
                    underlineOut, underlineBack,
                    overlineOut, overlineBack,
                    highlightOut, highlightBack,

                } = unit);

                // Update styling data as required by each TextUnit
                if (style) {

                    this.updateWorkingTextStyle(currentTextStyle, style);

                    ({
                        fontFamily, fontSize,
                        includeUnderline, underlineStyle, underlineOffset, underlineWidth, underlineGap,
                        includeOverline, overlineStyle, overlineOffset, overlineWidth,
                        includeHighlight, highlightStyle,

                    } = currentTextStyle);

                    fontSizeValue = parseFloat(fontSize);
                    oy = getY.call(this, hy, fontSizeValue, fontFamily);

                    metadata = this.getFontMetadata(fontFamily);

                    ratio = fontSizeValue / 100;
                    verticalOffset = (metadata != null) ? metadata.verticalOffset * ratio * currentScale : 0;
                }

                // Only process visible TextUnits
                if (unit.stampFlag) {

                    ox = getX.call(this, hx, len, direction);

                    unit.stampPos[0] = lineOffset - ox;
                    unit.stampPos[1] = -oy;

                    // Calculate coordinates for underlined TextUnits
                    if (includeUnderline) {

                        unit.underlineStyle = underlineStyle;
                        unit.underlineGap = underlineGap;

                        underlineOut.length = 0;

                        localOffset = underlineOffset * fontSizeValue * currentScale;
                        localDepth = underlineWidth * currentScale;

                        underlineOut.push(
                            [
                                lineOffset - ox,
                                -oy - verticalOffset + localOffset
                            ], [
                                lineOffset - ox + len,
                                -oy - verticalOffset + localOffset
                            ]
                        );

                        underlineBack.length = 0;

                        underlineBack.push(
                            [
                                lineOffset - ox,
                                -oy - verticalOffset + localOffset + localDepth
                            ], [
                                lineOffset - ox + len,
                                -oy - verticalOffset + localOffset + localDepth
                            ]
                        );
                    }

                    // Calculate coordinates for overlined TextUnits
                    if (includeOverline) {

                        unit.overlineStyle = overlineStyle;

                        overlineOut.length = 0;

                        localOffset = overlineOffset * fontSizeValue * currentScale;
                        localDepth = overlineWidth * currentScale;

                        overlineOut.push(
                            [
                                lineOffset - ox,
                                -oy - verticalOffset + localOffset
                            ], [
                                lineOffset - ox + len,
                                -oy - verticalOffset + localOffset
                            ]
                        );

                        overlineBack.length = 0;

                        overlineBack.push(
                            [
                                lineOffset - ox,
                                -oy - verticalOffset + localOffset + localDepth
                            ], [
                                lineOffset - ox + len,
                                -oy - verticalOffset + localOffset + localDepth
                            ]
                        );
                    }

                    // Calculate coordinates for highlighted TextUnits
                    if (includeHighlight) {

                        unit.highlightStyle = highlightStyle;

                        highlightOut.length = 0;

                        // Magic number warning! Multiplying `fontSizeValue` by `1.1` seems to give the "most pleasing" highlight effect, leaving just enough space between the lowest character and the bottom of the highlight (in problematic fonts like "Mountains of Christmas").
                        // + TODO: consider making this inflation factor - `1.1` - a settable TextStyle attribute.
                        localDepth = fontSizeValue * currentScale * 1.1;

                        highlightOut.push(
                            [
                                lineOffset - ox,
                                -oy - verticalOffset
                            ], [
                                lineOffset - ox + len,
                                -oy - verticalOffset
                            ]
                        );

                        highlightBack.length = 0;

                        highlightBack.push(
                            [
                                lineOffset - ox,
                                -oy + localDepth
                            ], [
                                lineOffset - ox + len,
                                -oy + localDepth
                            ]
                        );
                    }
                }
            }
        });
    });
};

// `generatePath` - an internal, local function to create Path2D objects from a given set of data
// + Used by `buildUnderlinePaths`, `buildOverlinePaths` and `buildHighlightPaths`
const generatePath = (coord, out, back, style, pos, start, rot, paths) => {

    let previousLineX, previousLineY,
        unitPreviousX, unitPreviousY,
        unitNextX, unitNextY,
        i, iz;

    let path = '';

    [previousLineX, previousLineY] = pos;

    const [lineX, lineY] = coord.set(start).subtract(pos).rotate(-rot).add(pos);

    path += `m ${_round(lineX - previousLineX)}, ${_round(lineY - previousLineY)} `;

    previousLineX = lineX;
    previousLineY = lineY;

    const [unitStartX, unitStartY] = out.shift();

    path += `m ${_round(unitStartX)}, ${_round(unitStartY)} `;

    unitPreviousX = unitStartX;
    unitPreviousY = unitStartY;

    for (i = 0, iz = out.length; i < iz; i++) {

        [unitNextX, unitNextY] = out.shift();

        path += `l ${_round(unitNextX - unitPreviousX)}, ${_round(unitNextY - unitPreviousY)} `;

        unitPreviousX = unitNextX;
        unitPreviousY = unitNextY;
    }

    for (i = 0, iz = back.length; i < iz; i++) {

        [unitNextX, unitNextY] = back.pop();

        path += `l ${_round(unitNextX - unitPreviousX)}, ${_round(unitNextY - unitPreviousY)} `;

        unitPreviousX = unitNextX;
        unitPreviousY = unitNextY;
    }
    path += 'z ';

    paths.push([style, new Path2D(path)]);
};


// `buildHighlightPaths` - internal function. Calculates a set of coordinates for contiguous blocks of highlight areas on a line
P.buildHighlightPaths = function () {

console.log(this.name, 'buildHighlightPaths (trigger: none - called by positionTextUnitsInSpace)');

    const { lines, textUnits, layoutTemplate, highlightPaths, alignment } = this;
    const { currentStampPosition } = layoutTemplate;

    const coord = requestCoordinate();

    let startAt, unitData, unit,
        highlightOut, highlightBack, highlightStyle,
        processFlag;

    const currentOut = [],
        currentBack = [];

    highlightPaths.length = 0;

    lines.forEach(line => {

        ({ startAt, unitData } = line);

        currentOut.length = 0;
        currentBack.length = 0;

        unitData.forEach((u, unitIndex) => {

            processFlag = unitIndex + 1 === unitData.length;

            if (u.toFixed) {

                unit = textUnits[u];

                if (unit.highlightStyle) highlightStyle = unit.highlightStyle;

                if (unit.stampFlag) {

                    ({ highlightOut, highlightBack } = unit);

                    if (highlightOut.length) {

                        currentOut.push(...highlightOut);
                        currentBack.push(...highlightBack);
                    }
                    else processFlag = true;

                    if (processFlag && currentOut.length) generatePath(coord, currentOut, currentBack, highlightStyle, currentStampPosition, startAt, alignment, highlightPaths);
                }
            }
        });

        // Capturing anything at the end of the line
        if (processFlag && currentOut.length) generatePath(coord, currentOut, currentBack, highlightStyle, currentStampPosition, startAt, alignment, highlightPaths);
    });

    releaseCoordinate(coord);
};

// `buildOverlinePaths` - internal function. Calculates a set of coordinates for contiguous blocks of overline areas on a line
P.buildOverlinePaths = function () {

console.log(this.name, 'buildOverlinePaths (trigger: none - called by positionTextUnitsInSpace)');

    const { lines, textUnits, layoutTemplate, overlinePaths, alignment } = this;
    const { currentStampPosition } = layoutTemplate;

    const coord = requestCoordinate();

    let startAt, unitData, unit,
        overlineOut, overlineBack, overlineStyle,
        processFlag;

    const currentOut = [],
        currentBack = [];

    overlinePaths.length = 0;

    lines.forEach(line => {

        ({ startAt, unitData } = line);

        currentOut.length = 0;
        currentBack.length = 0;

        unitData.forEach((u, unitIndex) => {

            processFlag = unitIndex + 1 === unitData.length;

            if (u.toFixed) {

                unit = textUnits[u];

                if (unit.overlineStyle) overlineStyle = unit.overlineStyle;

                if (unit.stampFlag) {

                    ({ overlineOut, overlineBack } = unit);

                    if (overlineOut.length) {

                        currentOut.push(...overlineOut);
                        currentBack.push(...overlineBack);
                    }
                    else processFlag = true;

                    if (processFlag && currentOut.length) generatePath(coord, currentOut, currentBack, overlineStyle, currentStampPosition, startAt, alignment, overlinePaths);
                }
            }
        });

        // Capturing anything at the end of the line
        if (processFlag && currentOut.length) generatePath(coord, currentOut, currentBack, overlineStyle, currentStampPosition, startAt, alignment, overlinePaths);
    });

    releaseCoordinate(coord);
};

// `buildUnderlinePaths` - internal function. Calculates a set of coordinates for contiguous blocks of underline areas on a line
P.buildUnderlinePaths = function () {

console.log(this.name, 'buildUnderlinePaths (trigger: none - called by positionTextUnitsInSpace)');

    const { lines, textUnits, layoutTemplate, underlinePaths, alignment } = this;
    const { currentStampPosition } = layoutTemplate;

    const coord = requestCoordinate();

    let startAt, unitData, unit,
        underlineOut, underlineBack, underlineStyle,
        processFlag;

    const currentOut = [],
        currentBack = [];

    underlinePaths.length = 0;

    lines.forEach(line => {

        ({ startAt, unitData } = line);

        currentOut.length = 0;
        currentBack.length = 0;

        unitData.forEach((u, unitIndex) => {

            processFlag = unitIndex + 1 === unitData.length;

            if (u.toFixed) {

                unit = textUnits[u];

                if (unit.underlineStyle) underlineStyle = unit.underlineStyle;

                if (unit.stampFlag) {

                    ({ underlineOut, underlineBack } = unit);

                    if (underlineOut.length) {

                        currentOut.push(...underlineOut);
                        currentBack.push(...underlineBack);
                    }
                    else processFlag = true;

                    if (processFlag && currentOut.length) generatePath(coord, currentOut, currentBack, underlineStyle, currentStampPosition, startAt, alignment, underlinePaths);
                }
            }
        });

        // Capturing anything at the end of the line
        if (processFlag && currentOut.length) generatePath(coord, currentOut, currentBack, underlineStyle, currentStampPosition, startAt, alignment, underlinePaths);
    });

    releaseCoordinate(coord);
};


// #### Display cycle functions

P.prepareStamp = function() {

// console.log(`
// ${this.name} prepareStamp`);

    if (this.dirtyHost) this.dirtyHost = false;

    if (this.dirtyScale) {

        this.dirtyScale = false;

        this.dirtyFont = true;
        this.dirtyPathObject = true;
        this.dirtyLayout = true;
    }

    if (this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle || this.dirtyRotation) {

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


// `regularStamp` - A small, internal function to direct stamping towards the correct functionality
// + regularStampInSpace for text inside the layoutTemplate artefact's enclosed space
// + regularStampAlongPath for text positioned along a path-based entity's perimeter
P.regularStamp = function () {

    if (this.currentHost && this.layoutTemplate) {

        if (this.useLayoutTemplateAsPath) this.regularStampAlongPath();
        else this.regularStampInSpace();
    }
};


P.regularStampInSpace = function () {

    const currentHost = this.currentHost;

    if (currentHost) {

        const rotation = this.alignment * _radian;

        const workingCells = this.createTextCells(currentHost, rotation);

        if (workingCells) {

            const { element, engine } = currentHost;
            const { copyCell, mainCell } = workingCells;

            const finalCell = requestCell(element.width, element.height);

            const finalElement = finalCell.element;
            const finalEngine = finalCell.engine;

            const underlineCell = this.createUnderlineCell(currentHost, copyCell, rotation);
            const overlineCell = this.createOverlineCell(currentHost, rotation);
            const highlightCell = this.createHighlightCell(currentHost, rotation);

            if (this.showGuidelines && this.localPath) this.stampGuidelinesOnCell(finalCell);

            if (underlineCell) finalEngine.drawImage(underlineCell.element, 0, 0);

            finalEngine.drawImage(mainCell.element, 0, 0);

            if (overlineCell) finalEngine.drawImage(overlineCell.element, 0, 0);

            if (highlightCell) {

                finalEngine.globalCompositeOperation = 'destination-over';
                finalEngine.drawImage(highlightCell.element, 0, 0);
            }

            engine.setTransform(1, 0, 0, 1, 0, 0);
            engine.drawImage(finalElement, 0, 0);

            releaseCell(copyCell, mainCell, overlineCell, highlightCell, finalCell);
        }
    }
};

P.stampGuidelinesOnCell = function (cell) {

    if (cell?.engine) {

        const {
            layoutTemplate,
            localPath,
            guidelineStyle,
            guidelineWidth,
            guidelineDash,
        } = this;

        const engine = cell.engine;

        engine.save();

        cell.rotateDestination(engine, ...layoutTemplate.currentStampPosition, layoutTemplate);

        engine.setLineDash(guidelineDash);

        engine.strokeStyle = guidelineStyle;
        engine.lineWidth = guidelineWidth;

        engine.stroke(localPath);

        engine.restore();
    }
};

P.createTextCells = function (host, rotation) {

    const el = host.element;
    const uCell = requestCell(el.width, el.height);
    const mCell = requestCell(el.width, el.height);

    if (uCell && mCell) {

        const uEngine = uCell.engine;
        const mEngine = mCell.engine;

        const {
            state,
            layoutTemplate,
            lines,
            textUnits,
            defaultTextStyle,
            truncateString,
            hyphenString,
        } = this;

        const currentRotation = layoutTemplate.currentRotation;
        const currentStampPosition = layoutTemplate.currentStampPosition;
        const direction = defaultTextStyle.direction;
        const directionIsLtr = direction === LTR;

        const coord = requestCoordinate();

        let sx, sy, unitData, unit, style, chars, stampFlag, type, stampPos, len, replaceLen, ox, oy, fx, fy;

        const currentTextStyle = this.makeWorkingTextStyle(defaultTextStyle, 'stamp-worker');

        this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, uCell);
        this.setEngineFromWorkingTextStyle(currentTextStyle, Ωempty, state, mCell);

        lines.forEach(line => {

            [sx, sy] = coord.set(line.startAt).subtract(currentStampPosition).rotate(currentRotation).add(currentStampPosition);

            unitData = line.unitData;

            uCell.rotateDestination(uEngine, sx, sy, layoutTemplate);
            uEngine.rotate(rotation);

            mCell.rotateDestination(mEngine, sx, sy, layoutTemplate);
            mEngine.rotate(rotation);

            unitData.forEach((u, uIndex) => {

                if (u.substring) {

                    // Truncations and hyphens have to hang off of something. They can't appear on their own line
                    if (unitData.length > 1) {

                        // We're at the end of the line but need to add something additional:
                        // + For the last line, this will be the default truncation copy (eg: `...`)
                        // + For other lines, this will be displaying a hyphen (eg: `-`) where the word - which included the soft hyphen - has broken across lines.
                        // + For the edge case where the last line is a word which has broken on a soft hyphen, we show the hyphen, not the truncation.
                        unit = textUnits[unitData[uIndex - 1]];

                        if (unit) {

                            ({ len, replaceLen, stampPos } = unit);

                            [ox, oy] = stampPos;

                            fy = oy;

                            if (u === TEXT_TYPE_TRUNCATE) {

                                if (directionIsLtr) {

                                    fx = ox + len;

                                    uEngine.strokeText(truncateString, fx, fy);
                                    uEngine.fillText(truncateString, fx, fy);

                                    mEngine.fillText(truncateString, fx, fy);
                                }
                                else {

                                    fx = ox - replaceLen;

                                    uEngine.strokeText(truncateString, fx, fy);
                                    uEngine.fillText(truncateString, fx, fy);

                                    mEngine.fillText(truncateString, fx, fy);
                                }
                            }
                            else if (u === TEXT_TYPE_SOFT_HYPHEN) {

                                if (directionIsLtr) {

                                    fx = ox;

                                    uEngine.strokeText(hyphenString, fx, fy);
                                    uEngine.fillText(hyphenString, fx, fy);

                                    mEngine.fillText(hyphenString, fx, fy);
                                }
                                else {

                                    fx = ox - replaceLen;

                                    uEngine.strokeText(hyphenString, fx, fy);
                                    uEngine.fillText(hyphenString, fx, fy);

                                    mEngine.fillText(hyphenString, fx, fy);
                                }
                            }
                        }
                    }
                }
                else {

                    unit = textUnits[u];

                    ({style, chars, stampPos, stampFlag, type} = unit);

                    if (style) {

                        this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, uCell);
                        uEngine.lineWidth = currentTextStyle.underlineGap;

                        this.setEngineFromWorkingTextStyle(currentTextStyle, style, state, mCell);
                    }

                    if (stampFlag && type !== TEXT_TYPE_SPACE) {

                        [ox, oy] = unit.stampPos;

                        uEngine.strokeText(chars, ox, oy);
                        uEngine.fillText(chars, ox, oy);

                        switch (currentTextStyle.method) {

                        case DRAW :
                            mEngine.strokeText(chars, ox, oy);
                            break;

                        case FILL_AND_DRAW :
                            mEngine.fillText(chars, ox, oy);
                            mEngine.strokeText(chars, ox, oy);
                            break;

                        case DRAW_AND_FILL :
                            mEngine.strokeText(chars, ox, oy);
                            mEngine.fillText(chars, ox, oy);
                            break;

                        default:
                            mEngine.fillText(chars, ox, oy);
                        }
                    }
                }
            });
        });

        releaseCoordinate(coord);

        return {
            copyCell: uCell,
            mainCell: mCell,
        };
    }
    return null;
};

P.createUnderlineCell = function (host, textCell, rotation) {

    const { layoutTemplate, underlinePaths } = this;

    if (underlinePaths.length) {

        const el = host.element;
        const mycell = requestCell(el.width, el.height);

        if (mycell) {

            const engine = mycell.engine;
            const textEngine = textCell.engine;

            mycell.rotateDestination(engine, ...layoutTemplate.currentStampPosition, layoutTemplate);
            engine.rotate(rotation);

            underlinePaths.forEach(data => {

                engine.fillStyle = this.getStyle(data[0], 'fillStyle', mycell);
                engine.fill(data[1]);
            });

            textEngine.globalCompositeOperation = 'source-out';
            textEngine.setTransform(1, 0, 0, 1, 0, 0);
            textEngine.drawImage(mycell.element, 0, 0);

            releaseCell(mycell);

            return textCell;
        }
    }
    return null;
};

P.createOverlineCell = function (host, rotation) {

    const { layoutTemplate, overlinePaths } = this;

    if (overlinePaths.length) {

        const el = host.element;
        const mycell = requestCell(el.width, el.height);

        if (mycell) {

            const engine = mycell.engine;

            mycell.rotateDestination(engine, ...layoutTemplate.currentStampPosition, layoutTemplate);
            engine.rotate(rotation);

            overlinePaths.forEach(data => {

                engine.fillStyle = this.getStyle(data[0], 'fillStyle', mycell);
                engine.fill(data[1]);
            });

            return mycell;
        }
    }
    return null;
};

P.createHighlightCell = function (host, rotation) {

    const { layoutTemplate, highlightPaths } = this;

    if (highlightPaths.length) {

        const el = host.element;
        const mycell = requestCell(el.width, el.height);

        if (mycell) {

            const engine = mycell.engine;

            mycell.rotateDestination(engine, ...layoutTemplate.currentStampPosition, layoutTemplate);
            engine.rotate(rotation);

            this.highlightPaths.forEach(data => {

                engine.fillStyle = this.getStyle(data[0], 'fillStyle', mycell);
                engine.fill(data[1]);
            });

            return mycell;
        }
    }
    return null;
};


// `regularStampAlongPath` - For text positioned along a path-based entity's perimeter
P.regularStampAlongPath = function () {

    const dest = this.currentHost;

    if (dest) {

        const layout = this.layoutTemplate;

        if (layout) {

            // const engine = dest.engine;

            // const { lines, textUnits } = this;
        }
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
