// # Label mixin
// Adds functionality to Label and EnhancedLabel entitys.



// #### Imports
import { fontfamilymetadata, fontfamilymetadatanames, textstyle, textstylenames } from '../core/library.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../factory/text-style.js';
import { currentGroup } from '../factory/canvas.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import { addStrings, mergeOver, removeItem, λnull, Ωempty } from '../helper/utilities.js';

import { _abs, _ceil, _freeze, _isFinite, _keys, _parse, FONT_LENGTH_REGEX, FONT_VARIANT_VALS, ITALIC, LEFT, NAME, NORMAL, OBLIQUE, ROUND, SMALL_CAPS, STATE_KEYS, TOP, UNDEF, ZERO_STR } from '../helper/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {};
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
// No additional clone functionality defined here


// #### Kill management
    P.factoryKill = function () {

        delete textstyle[`${this.name}_default-textstyle`];
        removeItem(textstylenames, `${this.name}_default-textstyle`);

        if (this.accessibleTextHold) this.accessibleTextHold.remove();

        const hold = this.getCanvasTextHold(this.currentHost);
        if (hold) hold.dirtyTextTabOrder = true;
    };


// #### Get, Set, deltaSet
    // Label-related `get`, `set` and `deltaSet` functions need to take into account the entity State and default TextStyles objects, whose attributes can be retrieved/amended directly on the entity object
    const TEXTSTYLE_KEYS = _freeze([ 'canvasFont', 'direction','fillStyle', 'fontKerning', 'fontSize', 'fontStretch', 'fontString', 'fontStyle', 'fontVariantCaps', 'fontWeight', 'highlightStyle', 'includeHighlight', 'includeUnderline', 'letterSpaceValue', 'letterSpacing', 'lineDash', 'lineDashOffset', 'lineWidth', 'strokeStyle', 'textRendering', 'underlineGap', 'underlineOffset', 'underlineStyle', 'underlineWidth', 'wordSpaceValue', 'wordSpacing']);

    const LABEL_DIRTY_FONT_KEYS = _freeze(['direction', 'fontKerning', 'fontSize', 'fontStretch', 'fontString', 'fontStyle', 'fontVariantCaps', 'fontWeight', 'letterSpaceValue', 'letterSpacing', 'scale', 'textRendering', 'wordSpaceValue', 'wordSpacing']);

    const LABEL_UPDATE_PARTS_KEYS = _freeze(['fontSize', 'fontStretch', 'fontStyle', 'fontVariantCaps', 'fontWeight']);

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

    D.lineHeight = function (item) {

        if (item.toFixed) this.lineHeight += item;

        this.dirtyFont = true;
    };
    S.lineHeight = function (item) {

        if (item.toFixed) this.lineHeight = item;

        this.dirtyFont = true;
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


    // `measureFont` - generate basic font metadata
    P.measureFont = function () {

        const { defaultTextStyle, currentScale } = this;
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

        this.dimensions[0] = _ceil(_abs(actualBoundingBoxLeft) + _abs(actualBoundingBoxRight));
        this.dimensions[1] = meta.height * ratio * currentScale;

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

            const metrics = engine.measureText(' ');

            releaseCell(mycell);

            const { actualBoundingBoxAscent, actualBoundingBoxDescent, fontBoundingBoxAscent, fontBoundingBoxDescent, alphabeticBaseline, hangingBaseline, ideographicBaseline} = metrics;

            let height = fontBoundingBoxAscent + fontBoundingBoxDescent;
            if (!_isFinite(height)) height = _ceil(_abs(actualBoundingBoxDescent) + _abs(actualBoundingBoxAscent));

            fontfamilymetadatanames.push(font);
            fontfamilymetadata[font] = {
                height,
                space: metrics.width,
                alphabeticBaseline: -alphabeticBaseline,
                hangingBaseline: -hangingBaseline,
                ideographicBaseline: -ideographicBaseline,
                verticalOffset: _isFinite(fontBoundingBoxAscent) ? fontBoundingBoxAscent : actualBoundingBoxAscent,
            }

            return fontfamilymetadata[font];
        }
    };


    // `updateTextStyle` - manipulate the user-supplied font string to create a font string the canvas engine can use
    P.updateTextStyle = function (textStyle, calculator, results) {

        let fontSize = textStyle.fontSize;
        const { fontStretch, fontStyle, fontWeight, fontVariantCaps, fontString } = textStyle;
        const { currentScale, lineHeight, updateUsingFontParts, updateUsingFontString } = this;

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
        let elWeight = results.fontWeight,
            elVariant = results.fontVariantCaps,
            elStretch = results.fontStretch,
            elStyle = results.fontStyle;

        // Update elWeight, if required
        if (elWeight == 400) elWeight = NORMAL;

        // Update elVariant, if required
        elVariant = (FONT_VARIANT_VALS.includes(elVariant)) ? elVariant : NORMAL;

        // Update elStyle, if required
        elStyle = (elStyle == ITALIC || elStyle.includes(OBLIQUE)) ? elStyle : NORMAL;

        // elStretch will always be a percent string, which canvas engines refuse to process
        // + The "magic numbers" are as defined in the relevant specification
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

        // Extract data for font size
        const elSizeString = results.fontSize,
            elSizeValue = parseFloat(elSizeString);

        textStyle.fontSizeValue = elSizeValue;

        // Work specifically for EnhancedLabel entitys, but performed here for efficiency
        if (lineHeight != null && fontString.includes('/')) {

            const lh = parseFloat(results.lineHeight);
            this.lineHeight = (_isFinite(lh)) ? lh / elSizeValue : this.defs.lineHeight;
        }

        // Build the internal `canvasFont` string
        let f = '';
        if (elStyle == ITALIC || elStyle.includes(OBLIQUE)) f += `${elStyle} `;
        if (elVariant == SMALL_CAPS) f += `${elVariant} `;
        if (elWeight != null && elWeight && elWeight != NORMAL && elWeight != 400) f += `${elWeight} `;
        f += `${elSizeValue * currentScale}px ${elFamily}`
        textStyle.canvasFont = f;

        // Rebuild the `fontString` string - attempting to minimise user input error
        f = '';
        if (elStretch != null && elStretch && elStretch != NORMAL) f += `${elStretch} `;
        if (elStyle != null && elStyle && elStyle != NORMAL) f += `${elStyle} `;
        if (elVariant != null && elVariant && elVariant != NORMAL) f += `${elVariant} `;
        if (elWeight != null && elWeight && elWeight != NORMAL && elWeight != 400) f += `${elWeight} `;

        if (fontSize) f += `${fontSize} `;
        else f += `${elSizeValue}px `

        f += `${elFamily}`;
        textStyle.fontString = f;

        // Update `textStyle` attributes
        textStyle.fontStretch = elStretch;
        textStyle.fontStyle = elStyle;
        textStyle.fontVariantCaps = elVariant;
        textStyle.fontWeight = elWeight;
        textStyle.fontFamily = elFamily;
    };
}
