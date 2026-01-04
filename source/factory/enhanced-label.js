// # EnhancedLabel factory
// TODO - document purpose and description
//
// To note: EnhancedLabel entitys will, if told to, break words across lines on hard (- U+2010) and soft (&shy U+00AD) hyphens. It makes no effort to guess whether a word _can_ be broken at a given place, regardless of any [CSS settings for the web page/component](https://css-tricks.com/almanac/properties/h/hyphenate/) in which the SC canvas finds itself. For that sort of functionality, use a third party library like [Hyphenopoly](https://github.com/mnater/Hyphenopoly) to pre-process text before feeding it into the entity.


// #### Imports
import { artefact, asset, constructors, group, tween } from '../core/library.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../untracked-factory/text-style.js';
import { makeCoordinate } from '../untracked-factory/coordinate.js';

import { currentGroup } from './canvas.js';
import { filterEngine } from '../helper/filter-engine.js';
import { importDomImage } from '../asset-management/image-asset.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';
import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';
import { releaseArray, requestArray } from '../helper/array-pool.js';

import baseMix from '../mixin/base.js';
import deltaMix from '../mixin/delta.js';
import filterMix from '../mixin/filter.js';
import textMix from '../mixin/text.js';

import { doCreate, isa_fn, isa_obj, mergeOver, pushUnique, removeItem, xta, λnull, Ωempty } from '../helper/utilities.js';

// Shared constants
import { _abs, _assign, _ceil, _computed, _cos, _create, _entries, _floor, _hypot, _isArray, _isFinite, _keys, _radian, _round, _setPrototypeOf, _sin, _values, ALPHABETIC, AUTO, BOTTOM, CENTER, DESTINATION_OVER, END, ENTITY, FILL, GOOD_HOST, HANGING, IDEOGRAPHIC, IMG, LEFT, LTR, MIDDLE, NONE, NORMAL, PX0, RIGHT, ROUND, SOURCE_IN, SOURCE_OUT, SOURCE_OVER, SPACE, START, T_CELL, T_ENHANCED_LABEL, T_GROUP, TOP, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const DRAW = 'draw',
    DRAW_AND_FILL = 'drawAndFill',
    FILL_AND_DRAW = 'fillAndDraw',
    FONT_VIEWPORT_LENGTH_REGEX = /[0-9.,]+(svh|lvh|dvh|vh|svw|lvw|dvw|vw|svmax|lvmax|dvmax|vmax|svmin|lvmin|dvmin|vmin|svb|lvb|dvb|vb|svi|lvi|dvi|vi)/i,
    FORCE = 'force',
    OFF = 'off',
    ROW = 'row',
    SOFT = 'soft',
    SPACE_AROUND = 'space-around',
    SPACE_BETWEEN = 'space-between',
    T_ENHANCED_LABEL_LINE = 'EnhancedLabelLine',
    T_ENHANCED_LABEL_UNIT = 'EnhancedLabelUnit',
    T_ENHANCED_LABEL_UNITARRAY = 'EnhancedLabelUnitArray',
    TEXT_HARD_HYPHEN_REGEX = /[-]/,
    TEXT_LAYOUT_FLOW_COLUMNS = ['column', 'column-reverse'],
    TEXT_LAYOUT_FLOW_REVERSE = ['row-reverse', 'column-reverse'],
    TEXT_NO_BREAK_REGEX = /[\u2060]/,
    TEXT_SOFT_HYPHEN_REGEX = /[\u00ad]/,
    WORD = 'word',
    ZWSP = 'zwsp';

// Excludes \u00A0 (no-break-space) and includes \u200b
const TEXT_SPACES_REGEX = /[ \f\n\r\t\v\u2028\u2029\u200b]/,
    TEXT_TYPE_CHARS = 'C',
    TEXT_TYPE_HYPHEN = 'H',
    TEXT_TYPE_NO_BREAK = 'B',
    TEXT_TYPE_SOFT_HYPHEN = 'h',
    TEXT_TYPE_SPACE = 'S',
    TEXT_TYPE_ZERO_SPACE = 'Z',
    TEXT_TYPE_TRUNCATE = 'T',
    TEXT_ZERO_SPACE_REGEX = /[\u200b]/,
    THAI_REGEX = /[\u0E00-\u0E7F]/,
    LAO_REGEX     = /[\u0E80-\u0EFF]/,
    KHMER_REGEX   = /[\u1780-\u17FF\u19E0-\u19FF]/,
    MYANMAR_REGEX = /[\u1000-\u109F\uAA60-\uAA7F\uA9E0-\uA9FF]/,
    CJK_CLOSE_RE = /[、。．，：；！？〕〉》」』】］）]/,
    CJK_OPEN_RE  = /[〔〈《「『【［（]/,
    WORD_JOINER = '\u2060',
    LOOKS_CJK_RE = /[\u3000-\u303F\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF]/,
    TEXT_LOOKS_CJK_REGEX = /[\u3000-\u303F\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF\u2E80-\u2EFF]/;

// Decide if a short string looks "word-like" when Segmenter doesn't provide isWordLike
const IS_WORDLIKE = (s) => /[\p{L}\p{N}]/u.test(s),
    ISWORDLIKE = 'isWordLike';

// Basic BCP-47-ish sanity check (lightweight; avoids obviously bad tags)
const LANG_TAG_REGEX = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/i;

// Horizontal → vertical presentation form map (most common marks)
const VERTICAL_PUNCT_MAP = new Map([
    ['，', '\uFE10'],
    ['、', '\uFE11'],
    ['。', '\uFE12'],
    ['：', '\uFE13'],
    ['；', '\uFE14'],
    ['！', '\uFE15'],
    ['？', '\uFE16'],
    ['…', '\uFE19'],
    ['—', '\uFE31'],
    ['（', '\uFE35'],
    ['）', '\uFE36'],
    ['｛', '\uFE37'],
    ['｝', '\uFE38'],
    ['〔', '\uFE39'],
    ['〕', '\uFE3A'],
    ['【', '\uFE3B'],
    ['】', '\uFE3C'],
    ['《', '\uFE3D'],
    ['》', '\uFE3E'],
    ['〈', '\uFE3F'],
    ['〉', '\uFE40'],
    ['「', '\uFE41'],
    ['」', '\uFE42'],
    ['『', '\uFE43'],
    ['』', '\uFE44'],
    ['［', '\uFE47'],
    ['］', '\uFE48'],
]);

const toVerticalCjkForms = (s) => {

    let out = '',
        i, iz, ch;

    for (i = 0, iz = s.length; i < iz; i++) {

        ch = s[i];
        out += VERTICAL_PUNCT_MAP.get(ch) || ch;
    }
    return out;
};

const autoBindCjkPunctuation = (text) => {

    const len = text.length;

    let out = '',
        i, ch, next;

    for (i = 0; i < len; i++) {

        ch = text[i];
        next = i + 1 < len ? text[i + 1] : '';
        out += ch;

        // 1) Prevent break AFTER openers: insert joiner after the opener
        if (CJK_OPEN_RE.test(ch) && next && next !== WORD_JOINER) {

            out += WORD_JOINER;
            continue;
        }

        // 2) Prevent break BEFORE closers: insert joiner before the closer
        if (next && CJK_CLOSE_RE.test(next) && ch !== WORD_JOINER) {

            out += WORD_JOINER;
        }
    }
    return out;
};

// #### EnhancedLabel constructor
const EnhancedLabel = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.state = makeState(Ωempty);

    this.defaultTextStyle = makeTextStyle({
        isDefaultTextStyle: true,
    });

    this.cache = null;
    this.textUnitHitZones = [];

    this.pivoted = [];

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

    this.dirtyStart = true;
    this.dirtyHandle = true;
    this.dirtyOffset = true;
    this.dirtyRotation = true;
    this.dirtyScale = true;
    this.dirtyDimensions = true;

    this.currentHost = null;
    this.dirtyHost = true;
    this.currentDimensions = [];
    this.currentScale = 1;
    this.currentStampHandlePosition = null;
    this.pathObject = null;
    this.accessibleTextHold = null;
    this.accessibleTextHoldAttached = null;
    this.guidelinesPath = null;
    this.currentPathData = null;

    this.filters = [];
    this.currentFilters = [];
    this.dirtyFilters = true;
    this.dirtyFiltersCache = true;
    this.dirtyImageSubscribers = true;
    this.stashOutput = false;
    this.stashOutputAsAsset = false;
    this.stashedImageData = null;
    this.stashedImage = null;

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
filterMix(P);
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
    constantSpeedAlongPath: true,

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

// __startTextOnLine__ - positive integer number. Default: `0`
// + Determines on which line the text layout will start.
    startTextOnLine: 0,

// __autoHyphenate__ – boolean flag to opt in to language-aware word breaking and auto-hyphenation. When true, the text is pre-processed before layout using either the user-defined `lineBreakHook` or the browser’s built-in [Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter).
// + Inserts either `\u200B` (zero-width space) or `\u00AD` (soft hyphen) between word-like segments, depending on the value of `lineBreakInsert`.
    autoHyphenate: false,

// __language__ – indicates the language of the text displayed by the EnhancedLabel entity. Used to choose appropriate word-break and soft-hyphen behavior.
// + Accepts a BCP-47 language tag such as `'th'`, `'en'`, `'ja'`, etc.
// + When set to `'auto'` (default), Scrawl-canvas attempts a simple heuristic detection (for example, Thai script detection via Unicode range).
    language: AUTO,

// __lineBreakInsert__ – specifies which invisible marker to insert at potential break points. Options are `'zwsp'` (zero-width space) or `'soft'` (soft hyphen). Default: `'zwsp'`.
    lineBreakInsert: ZWSP,

// __lineBreakHook__ – optional callback function providing custom word-breaking or hyphenation logic. The function signature is `(text, lang) => string | string[]`.
// + If a string is returned, it is used directly as the processed text.
// + If an array is returned, its elements are joined with the appropriate break character.
// + This allows integration with external, professional hyphenation or language analysis tools.
    lineBreakHook: null,

// __cjkPunctuationBinding__ - keep CJK punctuation tied to the preceding or following character (as appropriate) rather than fall onto the next line (or end the previous line).
// + `'off'`, `'auto'` (default, detect CJK in text), `'force'` (always)
    cjkPunctuationBinding: AUTO,

// __verticalCjkPunctuation__ - Use vertical presentation forms for CJK punctuation when text flows in columns.
// + `'off'`, `'auto'` (default, detect CJK in text), `'force'` (always, in column flow)
    verticalCjkPunctuation: AUTO,

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

    checkHitUseTemplate: true,
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
P.handlePacketAnchor = function (copy) {

    return copy;
}

P.processEntityPacketOut = function (key, value, incs) {

    return this.processFactoryPacketOut(key, value, incs);
};

P.processFactoryPacketOut = function (key, value, incs) {

    let result = true;

    if(!incs.includes(key) && value === this.defs[key]) result = false;

    return result;
};


// #### Clone management
P.postCloneAction = function(clone) {

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


// #### Get, Set, deltaSet
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

S.autoHyphenate = function (item) {

    this.autoHyphenate = !!item;
    this.dirtyText = true;
};

S.language = function (item) {

    // Accept BCP-47 tag or AUTO constant
    this.language = (item && item.substring) ? item : AUTO;
    this.dirtyText = true;
};

S.lineBreakInsert = function (item) {

    // only 'zwsp' or 'soft'
    this.lineBreakInsert = (item === SOFT) ? SOFT : ZWSP;
    this.dirtyText = true;
};

S.lineBreakHook = function (fn) {

    this.lineBreakHook = (isa_fn(fn)) ? fn : null;
    this.dirtyText = true;
};

// For the CJK punctuation option if you expose it in UI
S.verticalCjkPunctuation = function (item) {

    const v = (item === FORCE || item === OFF) ? item : AUTO;
    this.verticalCjkPunctuation = v;
    this.dirtyText = true;
};

S.cjkPunctuationBinding = function (item) {

    const v = (item === FORCE || item === OFF) ? item : AUTO;
    this.cjkPunctuationBinding = v;
    this.dirtyText = true;
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

G.textUnits = function () {

    return this.textUnits;
};

G.textLines = function () {

    return this.lines;
};



// #### Prototype functions
// `getTester` - Retrieve the DOM labelStylesCalculator &lt;div> element
P.getTester = function () {

    const controller = this.getControllerCell();

    if (controller) return controller.labelStylesCalculator;

    return null;
};

// `makeWorkingTextStyle` - Clone a TextStyle object
P.makeWorkingTextStyle = function (template) {

    const workStyle = _create(template);
    _assign(workStyle, template);

    workStyle.isDefaultTextStyle = false;

    return workStyle;
};

// `setEngineFromWorkingTextStyle` - Sets the state object to current working requirements, alongside directly updating the Cell's engine to match
P.setEngineFromWorkingTextStyle = function (worker, style, state, cell) {

    this.updateWorkingTextStyle(worker, style);
    state.set(worker);
    cell.setEngine(this);
};

// `updateWorkingTextStyle` - Updates the working TextStyle object with a partial TextStyle object, and regenerates font strings from the updated data
// + Takes into account the layout entity's current scaling factor
P.updateWorkingTextStyle = function (worker, style) {

        let scale = 1;
        if (this.layoutTemplate) scale = this.layoutTemplate.currentScale;

        worker.set(style, true);
        this.updateCanvasFont(worker, scale);
        this.updateFontString(worker);
};


// `getTextHandleX` - Calculate the horizontal offset required for a given TextUnit
P.getTextHandleX = function (val, dim, dir) {

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

    const meta = this.getFontMetadata(font);

    const {
        alphabeticRatio,
        hangingRatio,
        height,
        ideographicRatio,
    } = meta;

    const ratio = size / 100;

    let scale = 1;
    if (this.layoutTemplate) scale = this.layoutTemplate.currentScale;

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

    return (parseFloat(val) / 100) * dim * scale;
};

// `getTextOffset` - Calculate the horizontal offset required for a given TextUnit
P.getTextOffset = function (val, dim) {

    if (val.toFixed) return val;
    if (!_isFinite(parseFloat(val))) return 0;

    return (parseFloat(val) / 100) * dim;
};

P.dirtyCache = function () {

    releaseCell(this.cache);
    this.cache = null;

    this.textUnitHitZones.length = 0;

    if (this.pivoted.length) this.updatePivotSubscribers();
};


// #### Clean functions
// `cleanPathObject` - calculate the EnhancedLabel entity's __Path2D object__
P.cleanPathObject = function () {

    const layout = this.layoutTemplate;

    if (layout && this.dirtyPathObject && layout.pathObject) {

        this.dirtyPathObject = false;

        this.pathObject = new Path2D(layout.pathObject);
    }
};


// `cleanLayout` - recalculate the positioning of all TextUnits in the space or along the path
P.cleanLayout = function () {

    if (this.currentFontIsLoaded) {

        this.dirtyCache();
        this.dirtyLayout = false;

        if (!this.useLayoutTemplateAsPath) this.calculateLines();

        this.dirtyTextLayout = true;
    }
};


// `calculateLines` - calculate the positions and lengths of multiple lines withing a layout entity's enclosed space.
P.calculateLines = function () {

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

    const step = _round(fontSizeValue * lineSpacing * currentScale);

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

            releaseArray(rawLineData);
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

            releaseArray(rawLineData);
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

        releaseArray(rawLineData);
    }

    const relevantLines = requestArray();
    relevantLines.push(...rawLines.filter(l => l[1].length));

    releaseArray(rawLines);

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

P.preprocessTextForLineBreaks = function (src) {

    const { autoHyphenate, language, lineBreakHook, lineBreakInsert, cjkPunctuationBinding } = this;

    if (!src || !src.substring) return src;

    // Always start with the source so later passes (CJK binding) can run
    let out = src;

    if (autoHyphenate) {

        const insertChar = (lineBreakInsert === SOFT) ? '\u00AD' : '\u200B';

        // 1) Developer hook
        if (isa_fn(lineBreakHook)) {

            const hookRes = lineBreakHook(src, language);

            if (Array.isArray(hookRes)) out = hookRes.join(insertChar);
            else if (hookRes && hookRes.substring) out = hookRes;
        }

        // 2) Built-in Intl.Segmenter fallback
        else {

            let lang = language || AUTO;

            if (lang === AUTO) {

                if (THAI_REGEX.test(src)) lang = 'th';
                else if (LAO_REGEX.test(src)) lang = 'lo';
                else if (KHMER_REGEX.test(src)) lang = 'km';
                else if (MYANMAR_REGEX.test(src))lang = 'my';
                else lang = null;
            }

            const hasSeg = lang && typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function' &&
                           LANG_TAG_REGEX.test(lang);

            if (hasSeg) {

                const seg = new Intl.Segmenter(lang, { granularity: WORD }),
                    parts = seg.segment(src);

                let assembled = '',
                    prevWord = false;

                for (const part of parts) {

                    const segmentText = (part && part.segment && part.segment.substring)
                        ? part.segment
                        : ZERO_STR;

                    if (!segmentText) continue;

                    const wordlike = (part && ISWORDLIKE in part)
                        ? !!part.isWordLike
                        : IS_WORDLIKE(segmentText);

                    if (assembled && prevWord && wordlike) assembled += insertChar;

                    assembled += segmentText;
                    prevWord = wordlike;
                }
                if (assembled) out = assembled;
            }
        }
    }

    // 3) CJK punctuation binding can (and should) run even when autoHyphenate is false
    const wantCjkBind = cjkPunctuationBinding === 'force' || (cjkPunctuationBinding !== 'off' && LOOKS_CJK_RE.test(out));

    if (wantCjkBind) out = autoBindCjkPunctuation(out);

    return out;
};

// `cleanText` - Break the entity's text into smaller TextUnit objects which can be positioned within, or along, the layout entity's shape
P.cleanText = function () {

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

        // Language-aware preprocessing (opt-in)
        const processed = this.preprocessTextForLineBreaks(text);

        const textCharacters = [...processed];

        const languageDirectionIsLtr = (defaultTextStyle.direction === LTR);
        const layoutFlowIsColumns = TEXT_LAYOUT_FLOW_COLUMNS.includes(textUnitFlow);

        // Decide whether to use vertical CJK forms for this run
        const useVerticalCjk = layoutFlowIsColumns && (this.verticalCjkPunctuation === FORCE || (this.verticalCjkPunctuation === AUTO && TEXT_LOOKS_CJK_REGEX.test(text)));

        const unit = [];

        let noBreak = false;

        releaseUnit(...textUnits);
        textUnits.length = 0;

        let index = 0;

        if (breakTextOnSpaces) {

            // + Soft hyphens and truncation marking is deliberately suppressed for RTL fonts
            if (languageDirectionIsLtr && breakWordsOnHyphens) {

                textCharacters.forEach(c => {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                            index,
                        }));
                        index++;
                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: c,
                            [UNIT_TYPE]: TEXT_TYPE_SPACE,
                            index,
                        }));
                        unit.length = 0;
                        index++;
                    }
                    else if (TEXT_HARD_HYPHEN_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                            index,
                        }));
                        index++;
                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: c,
                            [UNIT_TYPE]: TEXT_TYPE_HYPHEN,
                            index,
                        }));
                        unit.length = 0;
                        index++;
                    }
                    else if (TEXT_SOFT_HYPHEN_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                            index,
                        }));
                        index++;
                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: c,
                            [UNIT_TYPE]: TEXT_TYPE_SOFT_HYPHEN,
                            index,
                        }));
                        unit.length = 0;
                        index++;
                    }
                    else unit.push(c);
                });

                // Capturing the last word
                if (unit.length) textUnits.push(requestUnit({
                    [UNIT_CHARS]: useVerticalCjk
                        ? toVerticalCjkForms(unit.join(ZERO_STR))
                        : unit.join(ZERO_STR),
                    [UNIT_TYPE]: TEXT_TYPE_CHARS,
                    index,
                }));
            }
            else {

                textCharacters.forEach(c => {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                            index,
                        }));
                        index++;
                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: c,
                            [UNIT_TYPE]: TEXT_TYPE_SPACE
                        }));
                        unit.length = 0;
                        index++;
                    }
                    else unit.push(c);
                });

                // Capturing the last word
                if (unit.length) textUnits.push(requestUnit({
                    [UNIT_CHARS]: useVerticalCjk
                        ? toVerticalCjkForms(unit.join(ZERO_STR))
                        : unit.join(ZERO_STR),
                    [UNIT_TYPE]: TEXT_TYPE_CHARS,
                    index,
                }));
            }
        }
        else {

            textCharacters.forEach((c, i) => {

                unit.push(useVerticalCjk ? (VERTICAL_PUNCT_MAP.get(c) || c) : c);

                // Some Chinese/Japanese characters simply have to stick together (but not in columns)!
                if (!layoutFlowIsColumns) {

                    noBreak = TEXT_NO_BREAK_REGEX.test(c) || TEXT_NO_BREAK_REGEX.test(textCharacters[i + 1]);

                    if (!noBreak) {

                        if (TEXT_SPACES_REGEX.test(c)) {

                            textUnits.push(requestUnit({
                                [UNIT_CHARS]: unit.join(ZERO_STR),
                                [UNIT_TYPE]: TEXT_TYPE_SPACE,
                                index,
                            }));
                            unit.length = 0;
                            index++;
                        }
                        else  {

                            textUnits.push(requestUnit({
                                [UNIT_CHARS]: unit.join(ZERO_STR),
                                [UNIT_TYPE]: TEXT_TYPE_CHARS,
                                index,
                            }));
                            unit.length = 0;
                            index++;
                        }
                    }
                }
                else {

                    if (TEXT_SPACES_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_SPACE,
                            index,
                        }));
                        unit.length = 0;
                        index++;
                    }
                    else if (TEXT_NO_BREAK_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_NO_BREAK,
                            index,
                        }));
                        unit.length = 0;
                        index++;
                    }
                    else if (TEXT_ZERO_SPACE_REGEX.test(c)) {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_ZERO_SPACE,
                            index,
                        }));
                        unit.length = 0;
                        index++;
                    }
                    else  {

                        textUnits.push(requestUnit({
                            [UNIT_CHARS]: unit.join(ZERO_STR),
                            [UNIT_TYPE]: TEXT_TYPE_CHARS,
                            index,
                        }));
                        unit.length = 0;
                        index++;
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
        let oldVal, newVal, raw;

        oldVal = currentTextStyle.direction;
        newVal = nodeVals.getPropertyValue('direction');
        if (oldVal !== newVal)  unitSet.direction = newVal;

        oldVal = currentTextStyle.fontFamily;
        newVal = nodeVals.getPropertyValue('font-family');
        if (oldVal !== newVal) unitSet.fontFamily = newVal;

        oldVal = currentTextStyle.fontKerning;
        newVal = nodeVals.getPropertyValue('font-kerning');
        if (oldVal !== newVal) unitSet.fontKerning = newVal;

        oldVal = currentTextStyle.fontSize;
        newVal = nodeVals.getPropertyValue('font-size');
        if (oldVal !== newVal) {

            unitSet.fontSize = newVal;
            if (FONT_VIEWPORT_LENGTH_REGEX.test(newVal)) this.usingViewportFontSizing = true;
        }

        oldVal = currentTextStyle.fontStretch;
        newVal = nodeVals.getPropertyValue('font-stretch');
        if (newVal === '100%') newVal = NORMAL;
        if (oldVal !== newVal) unitSet.fontStretch = newVal;

        oldVal = currentTextStyle.fontStyle;
        newVal = nodeVals.getPropertyValue('font-style');
        if (oldVal !== newVal) unitSet.fontStyle = newVal;

        oldVal = currentTextStyle.fontVariantCaps;
        newVal = nodeVals.getPropertyValue('font-variant-caps');
        if (oldVal !== newVal) unitSet.fontVariantCaps = newVal;

        oldVal = currentTextStyle.fontWeight;
        newVal = nodeVals.getPropertyValue('font-weight');
        if (oldVal !== newVal) unitSet.fontWeight = newVal;

        oldVal = currentTextStyle.get('letterSpacing');
        newVal = nodeVals.getPropertyValue('letter-spacing');
        if (newVal === NORMAL) newVal = PX0;
        if (oldVal !== newVal) unitSet.letterSpacing = newVal;

        oldVal = currentTextStyle.textRendering;
        newVal = nodeVals.getPropertyValue('text-rendering');
        if (oldVal !== newVal) unitSet.textRendering = newVal;

        oldVal = currentTextStyle.get('wordSpacing');
        newVal = nodeVals.getPropertyValue('word-spacing');
        if (oldVal !== newVal) unitSet.wordSpacing = newVal;

        oldVal = currentTextStyle.fillStyle;
        newVal = nodeVals.getPropertyValue('--SC-fill-style');
        if (oldVal !== newVal) unitSet.fillStyle = newVal;

        oldVal = currentTextStyle.includeHighlight;
        raw = nodeVals.getPropertyValue('--SC-include-highlight').trim().toLowerCase();
        newVal = (raw === 'true' || raw === '1');
        if (oldVal !== newVal) unitSet.includeHighlight = newVal;

        oldVal = currentTextStyle.highlightStyle;
        newVal = nodeVals.getPropertyValue('--SC-highlight-style');
        if (oldVal !== newVal) unitSet.highlightStyle = newVal;

        oldVal = currentTextStyle.lineWidth;
        raw = parseFloat(nodeVals.getPropertyValue('--SC-stroke-width'));
        if (_isFinite(raw) && oldVal !== raw) unitSet.lineWidth = raw;

        oldVal = currentTextStyle.includeOverline;
        raw = nodeVals.getPropertyValue('--SC-include-overline').trim().toLowerCase();
        newVal = (raw === 'true' || raw === '1');
        if (oldVal !== newVal) unitSet.includeOverline = newVal;

        oldVal = currentTextStyle.overlineOffset;
        raw = parseFloat(nodeVals.getPropertyValue('--SC-overline-offset'));
        if (_isFinite(raw) && oldVal !== raw) unitSet.overlineOffset = raw;

        oldVal = currentTextStyle.overlineStyle;
        newVal = nodeVals.getPropertyValue('--SC-overline-style');
        if (oldVal !== newVal) unitSet.overlineStyle = newVal;

        oldVal = currentTextStyle.overlineWidth;
        raw = parseFloat(nodeVals.getPropertyValue('--SC-overline-width'));
        if (_isFinite(raw) && oldVal !== raw) unitSet.overlineWidth = raw;

        oldVal = currentTextStyle.includeUnderline;
        raw = nodeVals.getPropertyValue('--SC-include-underline').trim().toLowerCase();
        newVal = (raw === 'true' || raw === '1');
        if (oldVal !== newVal) unitSet.includeUnderline = newVal;

        oldVal = currentTextStyle.underlineGap;
        raw = parseFloat(nodeVals.getPropertyValue('--SC-underline-gap'));
        if (_isFinite(raw) && oldVal !== raw) unitSet.underlineGap = raw;

        oldVal = currentTextStyle.underlineOffset;
        raw = parseFloat(nodeVals.getPropertyValue('--SC-underline-offset'));
        if (_isFinite(raw) && oldVal !== raw) unitSet.underlineOffset = raw;

        oldVal = currentTextStyle.underlineStyle;
        newVal = nodeVals.getPropertyValue('--SC-underline-style');
        if (oldVal !== newVal) unitSet.underlineStyle = newVal;

        oldVal = currentTextStyle.underlineWidth;
        raw = parseFloat(nodeVals.getPropertyValue('--SC-underline-width'));
        if (_isFinite(raw) && oldVal !== raw) unitSet.underlineWidth = raw;

        oldVal = currentTextStyle.method;
        newVal = nodeVals.getPropertyValue('--SC-method');
        if (oldVal !== newVal) unitSet.method = newVal;

        oldVal = localState.localHandleX;
        newVal = nodeVals.getPropertyValue('--SC-local-handle-x');
        if (oldVal !== newVal) unitSet.localHandleX = newVal;

        oldVal = localState.localHandleY;
        newVal = nodeVals.getPropertyValue('--SC-local-handle-y');
        if (oldVal !== newVal) unitSet.localHandleY = newVal;

        oldVal = localState.localOffsetX;
        raw = parseFloat(nodeVals.getPropertyValue('--SC-local-offset-x'));
        if (_isFinite(raw) && oldVal !== raw) unitSet.localOffsetX = raw;

        oldVal = localState.localOffsetY;
        raw = parseFloat(nodeVals.getPropertyValue('--SC-local-offset-y'));
        if (_isFinite(raw) && oldVal !== raw) unitSet.localOffsetY = raw;

        oldVal = localState.localAlignment;
        raw = parseFloat(nodeVals.getPropertyValue('--SC-local-alignment'));
        if (_isFinite(raw) && oldVal !== raw) unitSet.localAlignment = raw;

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

    const {
        defaultTextStyle,
        hyphenString,
        state,
        textUnitFlow,
        textUnits,
        truncateString,
        breakTextOnSpaces,
        layoutTemplate,
    } = this;

    const mycell = requestCell(),
        engine = mycell.engine;

    let res, chars, charType, style, len,
        nextUnit, nextStyle, nextChars, nextType, nextLen,
        unkernedLen, scale;

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

            scale = layoutTemplate ? layoutTemplate.currentScale || 1 : 1;
            t.len += currentTextStyle.wordSpaceValue * scale;
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

    const {
        breakWordsOnHyphens,
        defaultTextStyle,
        layoutTemplate,
        lines,
        textUnitFlow,
        textUnits,
        startTextOnLine,
    } = this;

    const languageDirectionIsLtr = (defaultTextStyle.direction === LTR);
    const layoutFlowIsColumns = TEXT_LAYOUT_FLOW_COLUMNS.includes(textUnitFlow);
    const currentScale = layoutTemplate.currentScale;

    const unitArrayLength = textUnits.length;

    let unitCursor = 0,
        lengthRemaining,
        i, unit, unitData, unitAfter, len, height, lineLength, charType, check, firstOnLineCheck;

    const addUnit = function (val) {

        lengthRemaining -= val;
        unitData.push(unitCursor);
        ++unitCursor;
    };

    for (let j = startTextOnLine, jz = lines.length; j < jz; j++) {

        ({
            length: lineLength,
            unitData,
        } = lines[j]);

        lengthRemaining = _ceil(lineLength);

        firstOnLineCheck = true;

        for (i = unitCursor; i < unitArrayLength; i++) {

            unit = textUnits[i];

            ({ len, height, charType } = unit);

            // Check: is there room for the text unit
            check = (layoutFlowIsColumns) ? height * currentScale : len;

            // We need to discount the length of spaces that end up at the beginning of the line
            if (firstOnLineCheck && !layoutFlowIsColumns && unit.charType === TEXT_TYPE_SPACE) check = 0;

            if (check <= lengthRemaining) {

                // Hyphens capture
                // + Soft hyphens and truncation marking is deliberately suppressed for RTL fonts
                // + We don't care about hyphens or truncation in columnar layouts
                if (languageDirectionIsLtr && !layoutFlowIsColumns && breakWordsOnHyphens) {

                    // We need to do a look-forward for soft hyphens
                    unit = textUnits[i + 1];

                    // Next text unit is a soft hyphen
                    if (unit && unit.charType === TEXT_TYPE_SOFT_HYPHEN) {

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

                // Everything else, including all TextUnits with an `rtl` direction, and all along a column
                else addUnit(check);

                firstOnLineCheck = false;
            }

            // There's no room left on this line for the TextUnit
            // + There is a dilemma here, concerning lines where the first TextUnit available to add to the line is too long to fit.
            // + Currently, we just leave the line empty and move onto the next line (which might be able to fit the long TextUnit)
            // + If the offending TextUnit is too long for all subsequent lines then neither it nor any of the following TextUnits will appear.
            // + An alternative approach could be to allow the overlong TextUnit to appear on a line if it's the only TextUnit on that line, thus removing the display block for subsequent TextUnits
            // + For the moment, we will not implement this alternative approach. It's up to developers and designers to use words that can fit into the available line space. Overlong words can be hyphenated with soft (&amp;shy;) hyphens, or zero-width spaces, if required.
            else break;
        }
    };

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

        if (mutableUnitData && mutableUnitData.length) {

            ({
                length: lineLength,
                unitData,
            } = lines[currentLine]);

            acc = unitData.reduce((a, v) => {

                if (textUnits[v] && textUnits[v].len) a += textUnits[v].len;
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

    if (this.useLayoutTemplateAsPath) this.positionTextUnitsAlongPath();
    else this.positionTextUnitsInSpace();

    this.positionTextDecoration();
};


// `positionTextUnitsAlongPath` - Position each TextUnit along a single-line path of the layout entity (if possible)
P.positionTextUnitsAlongPath = function () {

    const {
        alignment,
        alignTextUnitsToPath,
        defaultTextStyle,
        layoutTemplate,
        lines,
        pathPosition,
        constantSpeedAlongPath,
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
                if (currentLen >= length) {

                    currentLen -= length;
                    unit.lineStart = true;
                }
                else unit.lineStart = false;

                currentPos = currentLen / length;

                unit.pathData = layoutTemplate.getPathPositionData(currentPos, constantSpeedAlongPath);
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
                if (currentLen >= length) {

                    currentLen -= length;
                    unit.lineStart = true;
                }
                else unit.lineStart = false;

                currentPos = currentLen / length;

                unit.pathData = layoutTemplate.getPathPositionData(currentPos, constantSpeedAlongPath);
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

                currentLen -= handleX;
                currentLen += (len - kernOffset);
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
                spaceRemaining -= (unit && unit.replaceLen != null) ? unit.replaceLen : 0;
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

                    if (unit && unit.stampFlag) {

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

                    if (unit && unit.stampFlag) {

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
                            offsetX = getTextOffset.call(this, temp, len);

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
                            offsetX = getTextOffset.call(this, temp, len);

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

            path = `m ${(dx.toFixed(2))}, ${(dy.toFixed(2))} `;

            for (i = 1; i < iOut; i++) {

                dx = out[i][0] - out[i - 1][0];
                dy = out[i][1] - out[i - 1][1];

                path += `${(dx.toFixed(2))}, ${(dy.toFixed(2))} `;
            }

            dx = back[back.length - 1][0] - out[out.length - 1][0];
            dy = back[back.length - 1][1] - out[out.length - 1][1];

            path += `${(dx.toFixed(2))}, ${(dy.toFixed(2))} `;

            for (i = iBack - 2; i >= 0; i--) {

                dx = back[i][0] - back[i + 1][0];
                dy = back[i][1] - back[i + 1][1];

                path += `${(dx.toFixed(2))}, ${(dy.toFixed(2))} `;
            }

            path += 'z';

            paths.push([style, new Path2D(path), [...currentStampPosition]]);
        }
    };

    const buildUnderline = function (skipLocal = false) {

        if (underlineOut.length) {

            realisedStyle = underlineStyle;
            realisedOffset = underlineOffset;
            realisedWidth = underlineWidth;

            if (!skipLocal) {

                if (localStyle.underlineStyle) realisedStyle = localStyle.underlineStyle;
                if (localStyle.underlineOffset) realisedOffset = localStyle.underlineOffset;
                if (localStyle.underlineWidth) realisedWidth = localStyle.underlineWidth;
            }

            correctCoordinates(underlineOut, underlineBack, realisedOffset, realisedWidth);
            buildPath(underlineOut, underlineBack, realisedStyle, underlinePaths);

            underlineOut.length = 0;
            underlineBack.length = 0;
        }
    };

    const buildOverline = function (skipLocal = false) {

        if (overlineOut.length) {

            realisedStyle = overlineStyle;
            realisedOffset = overlineOffset;
            realisedWidth = overlineWidth;

            if (!skipLocal) {

                if (localStyle.overlineStyle) realisedStyle = localStyle.overlineStyle;
                if (localStyle.overlineOffset) realisedOffset = localStyle.overlineOffset;
                if (localStyle.overlineWidth) realisedWidth = localStyle.overlineWidth;
            }

            correctCoordinates(overlineOut, overlineBack, realisedOffset, realisedWidth);
            buildPath(overlineOut, overlineBack, realisedStyle, overlinePaths);

            overlineOut.length = 0;
            overlineBack.length = 0;
        }
    };

    const buildHighlight = function (skipLocal = false) {

        if (highlightOut.length) {

            realisedStyle = highlightStyle;

            if (!skipLocal) {

                if (localStyle.highlightStyle) realisedStyle = localStyle.highlightStyle;
            }

            buildPath(highlightOut, highlightBack, realisedStyle, highlightPaths);

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
        includeHighlight, highlightStyle,
        lineStart, localStyle, realisedStyle, realisedOffset, realisedWidth;

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

                ({
                    boxData,
                    charType,
                    lineStart,
                    localStyle,
                    style,
                } = unit);

                if (!localStyle) localStyle = Ωempty;

                // Update styling data as required by each TextUnit
                if (style) {

                    this.updateWorkingTextStyle(currentTextStyle, style);

                    ({includeUnderline, includeOverline, includeHighlight} = currentTextStyle);

                    if (includeUnderline) ({underlineStyle, underlineOffset, underlineWidth} = currentTextStyle);

                    if (includeOverline) ({overlineStyle, overlineOffset, overlineWidth} = currentTextStyle);

                    if (includeHighlight) ({highlightStyle} = currentTextStyle);
                }

                // Only process visible TextUnits
                if (unit.stampFlag) {

                    ({tl, tr, br, bl} = boxData);

                    // TextUnits along a column never style spaces
                    if (TEXT_LAYOUT_FLOW_COLUMNS.includes(textUnitFlow)) {

                        if (charType !== TEXT_TYPE_SPACE) {

                            if (localStyle.includeUnderline || includeUnderline) {

                                underlineOut.push([...tl], [...tr]);
                                underlineBack.push([...bl], [...br]);
                                buildUnderline();
                            }

                            if (localStyle.includeOverline || includeOverline) {

                                overlineOut.push([...tl], [...tr]);
                                overlineBack.push([...bl], [...br]);
                                buildOverline();
                            }

                            if (localStyle.includeHighlight || includeHighlight) {

                                highlightOut.push([...tl], [...tr]);
                                highlightBack.push([...bl], [...br]);
                                buildHighlight();
                            }
                        }
                    }
                    else {

                        if (useLayoutTemplateAsPath) {

                            // TextUnits that are all single chars will style spaces
                            if (!breakTextOnSpaces) {

                                if (lineStart) {

                                    buildUnderline();
                                    buildOverline();
                                    buildHighlight();
                                }

                                if (localStyle.includeUnderline) {

                                    buildUnderline(true);
                                    underlineOut.push([...tl], [...tr]);
                                    underlineBack.push([...bl], [...br]);
                                    buildUnderline();
                                }
                                else if (includeUnderline) {

                                    underlineOut.push([...tl], [...tr]);
                                    underlineBack.push([...bl], [...br]);
                                }
                                else buildUnderline();

                                if (localStyle.includeOverline) {

                                    buildOverline(true);
                                    overlineOut.push([...tl], [...tr]);
                                    overlineBack.push([...bl], [...br]);
                                    buildOverline();
                                }
                                else if (includeOverline) {

                                    overlineOut.push([...tl], [...tr]);
                                    overlineBack.push([...bl], [...br]);
                                }
                                else buildOverline();

                                if (localStyle.includeHighlight) {

                                    buildHighlight(true);
                                    highlightOut.push([...tl], [...tr]);
                                    highlightBack.push([...bl], [...br]);
                                    buildHighlight();
                                }
                                else if (includeHighlight) {

                                    highlightOut.push([...tl], [...tr]);
                                    highlightBack.push([...bl], [...br]);
                                }
                                else buildHighlight();
                            }
                            // TextUnits that are blocks of chars chars will not style spaces
                            else {

                                if (charType !== TEXT_TYPE_SPACE) {

                                    if (localStyle.includeUnderline || includeUnderline) {

                                        underlineOut.push([...tl], [...tr]);
                                        underlineBack.push([...bl], [...br]);
                                        buildUnderline();
                                    }

                                    if (localStyle.includeOverline || includeOverline) {

                                        overlineOut.push([...tl], [...tr]);
                                        overlineBack.push([...bl], [...br]);
                                        buildOverline();
                                    }

                                    if (localStyle.includeHighlight || includeHighlight) {

                                        highlightOut.push([...tl], [...tr]);
                                        highlightBack.push([...bl], [...br]);
                                        buildHighlight();
                                    }
                                }
                            }
                        }
                        // Non-pathed TextUnits along a row will style spaces
                        else {

                            if (localStyle.includeUnderline) {

                                buildUnderline(true);
                                underlineOut.push([...tl], [...tr]);
                                underlineBack.push([...bl], [...br]);
                                buildUnderline();
                            }
                            else if (includeUnderline) {

                                underlineOut.push([...tl], [...tr]);
                                underlineBack.push([...bl], [...br]);
                            }
                            else buildUnderline();

                            if (localStyle.includeOverline) {

                                buildOverline(true);
                                overlineOut.push([...tl], [...tr]);
                                overlineBack.push([...bl], [...br]);
                                buildOverline();
                            }
                            else if (includeOverline) {

                                overlineOut.push([...tl], [...tr]);
                                overlineBack.push([...bl], [...br]);
                            }
                            else buildOverline();

                            if (localStyle.includeHighlight) {

                                buildHighlight(true);
                                highlightOut.push([...tl], [...tr]);
                                highlightBack.push([...bl], [...br]);
                                buildHighlight();
                            }
                            else if (includeHighlight) {

                                highlightOut.push([...tl], [...tr]);
                                highlightBack.push([...bl], [...br]);
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

    if (this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle || this.dirtyRotation || this.dirtyFilters) {

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

P.simpleStamp = λnull;


P.removeShadowAndAlpha = function (engine) {

    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;
    engine.shadowColor = 'rgb(0 0 0 / 0)';

    engine.globalAlpha = 1;
    engine.globalCompositeOperation = SOURCE_OVER;

    engine.lineJoin = ROUND;
    engine.lineCap = ROUND;

    this.setImageSmoothing(engine);
};

P.getCellCoverage = function (img) {

    const { width, height, data } = img;

    let maxX = 0,
        maxY = 0,
        minX = width,
        minY = height,
        counter = 3,
        x, y, i, iz;

    for (i = 0, iz = width * height; i < iz; i++) {

        if (data[counter]) {

            y = _floor(i / width);
            x = i - (y * width);

            if (minX > x) minX = x;
            if (maxX < x) maxX = x;
            if (minY > y) minY = y;
            if (maxY < y) maxY = y;
        }
        counter += 4;
    }
    if (minX < maxX && minY < maxY) return [minX, minY, maxX - minX, maxY - minY];
    else return [0, 0, width, height];
};


// `regularStamp` - A small, internal function to direct stamping towards the correct functionality
// + regularStampInSpace for text inside the layoutTemplate artefact's enclosed space
// + regularStampAlongPath for text positioned along a path-based entity's perimeter
P.regularStamp = function (host) {

    const {
        cache,
        cacheOutput,
        currentHost,
        layoutTemplate,
        state,
    } = this;

    const myHost = host || currentHost;

    if (myHost && layoutTemplate) {

        const { element, engine } = myHost;

        if (cacheOutput && cache) {

            engine.save();

            engine.shadowOffsetX = state.shadowOffsetX;
            engine.shadowOffsetY = state.shadowOffsetY;
            engine.shadowBlur = state.shadowBlur;
            engine.shadowColor = state.shadowColor;

            this.setImageSmoothing(engine);

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
                this.createTextCellsForPath(myHost) :
                this.createTextCellsForSpace(myHost);

            if (workingCells) {

                const { copyCell, mainCell } = workingCells;

                const w = element.width,
                    h = element.height;

                const finalCell = requestCell(w, h);

                const finalElement = finalCell.element;
                const finalEngine = finalCell.engine;

                this.removeShadowAndAlpha(finalEngine);

                const copyCellHasUnderlines = this.addUnderlinesToCopyCell(myHost, copyCell);

                const overlineCell = this.createOverlineCell(myHost);
                const highlightCell = this.createHighlightCell(myHost);

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

                const filterTest = (!this.noFilters && this.filters && this.filters.length) ? true : false;

                if (filterTest) {

                    if (this.dirtyFilters || !this.currentFilters) this.cleanFilters();

                    const filters = this.currentFilters;

                    if (this.isStencil) {

                        finalEngine.save();
                        finalEngine.globalCompositeOperation = SOURCE_IN;
                        finalEngine.globalAlpha = 1;
                        finalEngine.resetTransform();
                        finalEngine.drawImage(element, 0, 0);
                        finalEngine.restore();

                        this.dirtyFilterIdentifier = true;
                    }

                    finalEngine.resetTransform();

                    const myimage = finalEngine.getImageData(0, 0, w, h);

                    this.preprocessFilters(filters, element.width, element.height);

                    const img = filterEngine.action({
                        identifier: this.filterIdentifier,
                        image: myimage,
                        filters,
                    });

                    if (img) {

                        finalEngine.globalCompositeOperation = SOURCE_OVER;
                        finalEngine.globalAlpha = 1;
                        finalEngine.resetTransform();
                        finalEngine.putImageData(img, 0, 0);
                    }
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

                if (this.stashOutput) {

                    this.stashOutput = false;

                    const [stashX, stashY, stashWidth, stashHeight] = this.getCellCoverage(finalEngine.getImageData(0, 0, w, h));

                    this.stashedImageData = finalEngine.getImageData(stashX, stashY, stashWidth, stashHeight);

                    if (this.stashOutputAsAsset) {

                        const stashId = this.stashOutputAsAsset.substring ? this.stashOutputAsAsset : `${this.name}-image`;

                        this.stashOutputAsAsset = false;

                        const stashCell = requestCell(stashWidth, stashHeight);

                        this.setImageSmoothing(stashCell.engine);

                        stashCell.engine.putImageData(this.stashedImageData, 0, 0);

                        if (!this.stashedImage) {

                            const control = this.getControllerCell();

                            if (control) {

                                const that = this;

                                const newimg = document.createElement(IMG);
                                newimg.id = stashId;
                                newimg.alt = `A cached image of the ${this.name} ${this.type} entity`;

                                newimg.onload = function () {

                                    control.canvasHold.appendChild(newimg);
                                    that.stashedImage = newimg;
                                    importDomImage(`#${stashId}`);
                                };

                                newimg.src = stashCell.element.toDataURL();
                            }
                        }
                        else this.stashedImage.src = stashCell.element.toDataURL();

                        releaseCell(stashCell);
                    }
                }

                if (cacheOutput) this.cache = finalCell;
                else releaseCell(finalCell);

                releaseCell(copyCell, mainCell, overlineCell, highlightCell);
            }
        }
    }
};

P.createTextCellsForPath = function (host) {

    const el = host.element,
        w = el.width,
        h = el.height;

    // These pool cells _should_ be returned to / released by the calling function
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
                chars, charType, style, x, y, dx, dy, startRotation, cos, sin,
                localStyle, method;

            unitData.forEach(u => {

                unit = textUnits[u];

                if (unit) {

                    ({
                        chars,
                        charType,
                        localRotation,
                        localStyle,
                        startCorrection,
                        startData,
                        startRotation,
                        style,
                    } = unit);

                    if (!localStyle) localStyle = Ωempty;

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

                        mEngine.save();

                        method = localStyle.method || currentTextStyle.method;

                        if (localStyle.fillStyle) mEngine.fillStyle = localStyle.fillStyle;
                        if (localStyle.strokeStyle) mEngine.strokeStyle = localStyle.strokeStyle;

                        switch (method) {

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
                        mEngine.restore();
                    }
                }
            });
        }

        return {
            copyCell: uCell,
            mainCell: mCell,
        };
    }
    // If we're returning null, we need to release the pool cells
    releaseCell(uCell, mCell);

    return null;
};

P.createTextCellsForSpace = function (host) {

    const el = host.element,
        w = el.width,
        h = el.height;

    // These pool cells _should_ be returned to / released by the calling function
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
                lookAhead, text,
                localStyle, method;

            unitData.forEach((u, index) => {

                unit = textUnits[u];

                if (unit) {

                    ({
                        startData,
                        startCorrection,
                        startRotation,
                        localRotation,
                        chars,
                        style,
                        localStyle,

                    } = unit);

                    if (!localStyle) localStyle = Ωempty;

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

                        if (lookAhead && lookAhead.substring) {

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

                        mEngine.save();

                        method = localStyle.method || currentTextStyle.method;

                        if (localStyle.fillStyle) mEngine.fillStyle = localStyle.fillStyle;
                        if (localStyle.strokeStyle) mEngine.strokeStyle = localStyle.strokeStyle;

                        switch (method) {

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

                        mEngine.restore();
                    }
                }
            });
        });

        return {
            copyCell: uCell,
            mainCell: mCell,
        };
    }
    // If we're returning null, we need to release the pool cells
    releaseCell(uCell, mCell);

    return null;
};

P.addUnderlinesToCopyCell = function (host, copy) {

    const underlinePaths = this.underlinePaths;

    if (underlinePaths.length) {

        const el = host.element,
            w = el.width,
            h = el.height;

        // This pool cell is local to the function and not returned to calling function
        const mycell = requestCell(w, h);

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
        // Releasing, just in case ...
        releaseCell(mycell);
    }
    return false;
};

P.createOverlineCell = function (host) {

    const overlinePaths = this.overlinePaths;

    if (overlinePaths.length) {

        const el = host.element,
            w = el.width,
            h = el.height;

        // Pool cell _should_ be returned to / released by the calling function
        const mycell = requestCell(w, h);

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
        // Releasing, just in case ...
        releaseCell(mycell);
    }
    return null;
};

P.createHighlightCell = function (host) {

    const highlightPaths = this.highlightPaths;

    if (highlightPaths.length) {

        const el = host.element,
            w = el.width,
            h = el.height;

        // Pool cell _should_ be returned to / released by the calling function
        const mycell = requestCell(w, h);

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
        // Releasing, just in case ...
        releaseCell(mycell);
    }
    return null;
};

P.stampGuidelinesOnCell = function (cell) {

    if (cell && cell.engine) {

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

        this.setImageSmoothing(engine);

        engine.stroke(guidelinesPath);

        engine.restore();
    }
};


P.checkHit = function (items = []) {

    const getCoords = (coords) => {

        let x, y;

        if (_isArray(coords)) {

            x = coords[0];
            y = coords[1];
        }
        else if (xta(coords, coords.x, coords.y)) {

            x = coords.x;
            y = coords.y;
        }
        else return [false];

        if (!_isFinite(x) || !_isFinite(y)) return [false];

        return [true, x, y];
    }

    const { checkHitUseTemplate, layoutTemplate, textUnits, textUnitHitZones } = this;

    if (checkHitUseTemplate && layoutTemplate) return layoutTemplate.checkHit(items);

    else {

        if (!textUnitHitZones.length && textUnits.length) {

            let tl, tr, br, bl;

            textUnits.forEach(unit => {

                ({ tl, tr, br, bl } = unit.boxData);

                textUnitHitZones.push(new Path2D(`M ${tl[0]},${tl[1]} ${tr[0]},${tr[1]} ${br[0]},${br[1]} ${bl[0]},${bl[1]}Z`));
            });
        }

        if (textUnitHitZones.length) {

            const tests = (!_isArray(items)) ?  [items] : items;
            const len = textUnitHitZones.length;

            let res, isGood, tx, ty, index, i, iz;

            const mycell = requestCell(),
                engine = mycell.engine;

            for (i = 0, iz = tests.length; i < iz; i++) {

                [isGood, tx, ty] = getCoords(tests[i]);

                if (isGood) {

                    for (index = 0; index < len; index++) {

                        if (engine.isPointInPath(textUnitHitZones[index], tx, ty)) {

                            res = {
                                x: tx,
                                y: ty,
                                index,
                                artefact: this,
                            }
                            break;
                        }
                    }

                    if (res) {

                        releaseCell(mycell);
                        return res;
                    }
                }
            }
            releaseCell(mycell);
        }
        return false;
    }
};

// `updatePivotSubscribers`
P.updatePivotSubscribers = function () {

    let art;

    this.pivoted.forEach(name => {

        art = artefact[name];

        if (!art) {

            art = asset[name];

            if (!art || art.type !== T_CELL) art = false;
        }

        if (art) art.dirtyStart = true;
        if (art.addPivotRotation) art.dirtyRotation = true;

    }, this);
};

P.getUnitStartAt = function (index) {

    const textUnits = this.textUnits;

    if (index >= 0 && index < textUnits.length) return [...textUnits[index].startData];
    return null;
};

P.getUnitAlignment = function (index) {

    const {textUnits, alignment} = this;

    if (index >= 0 && index < textUnits.length) return alignment + textUnits[index].localAlignment;
    else return alignment;
};


// #### Factory
// ```
// TODO...
// ```
export const makeEnhancedLabel = function (items) {

    if (!items) return false;

    return new EnhancedLabel(items);
};

constructors.EnhancedLabel = EnhancedLabel;


// #### TextUnit objects
const UNIT_CHARS = 'chars',
    UNIT_TYPE = 'charType',
    UNIT_SETTABLE_KEYS = ['localStyle', 'localHandleX', 'localHandleY', 'localOffsetX', 'localOffsetY', 'localAlignment'];

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
    localStyle: null,

    lineStart: false,

    len: 0,
    height: 0,
    kernOffset: 0,
    replaceLen: 0,

    index: 0,
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
                case 'index' :
                case 'kernOffset' :
                case 'len' :
                case 'lineStart' :
                case 'localAlignment' :
                case 'localStyle' :
                case 'pathData' :
                case 'pathPos' :
                case 'replaceLen' :
                case 'stampFlag' :
                case 'startRotation' :
                case 'style' :

                    if (value != null) this[key] = value;
                    else this[key] = this.defs[key];
                    break;
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

            if (UNIT_SETTABLE_KEYS.includes(key)) unit.set({ [key]: val });
        }
    }
    this.dirtyLayout = true;
    this.dirtyCache();
};

P.setAllTextUnits = function (items) {

    this.textUnits.forEach(unit => {

        if (unit !== null) {

            for (const [key, val] of _entries(items)) {

                if (UNIT_SETTABLE_KEYS.includes(key)) unit.set({ [key]: val });
            }
        }
    });
    this.dirtyLayout = true;
    this.dirtyCache();
};

P.applyTextUnitUpdates = function () {

    this.dirtyLayout = true;
    this.dirtyCache();
};


// #### TextUnit pool
const unitPool = [];

const requestUnit = function (items = Ωempty) {

    if (!unitPool.length) unitPool.push(new UnitObject());

    const u = unitPool.shift();
    u.set(items);

    return u;
};

// `exported function` - return a TextUnit to the text unit pool. Failing to return text units to the pool may lead to more inefficient code and possible memory leaks.
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

// Note: this could be more sophisticated if we allowed regexes ...
A.findFirstWithChar = function (chars) {

    let item;

    for (let i = 0, iz = this.length; i < iz; i++) {

        item = this[i];

        if (item.chars.includes(chars)) return item;
    }
    return null;
};

// Note: this could be more sophisticated if we allowed regexes ...
A.findAllWithChar = function (chars) {

    let item;

    const res = [];

    for (let i = 0, iz = this.length; i < iz; i++) {

        item = this[i];

        if (item.chars.includes(chars)) res.push(item);
    }
    return res;
};

A.findAllDisplayedChars = function () {

    let item;

    const res = [];

    for (let i = 0, iz = this.length; i < iz; i++) {

        item = this[i];

        if (item.stampFlag && item.charType !== TEXT_TYPE_SPACE) res.push(item);
    }
    return res;
};

