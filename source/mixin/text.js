// # Text mixin
// Adds accessibility and bounding box functionality to Phrase, Label and EnhancedLabel entitys. Also includes the functionality to see whether a font has been loaded.



// #### Imports
import { cell, cellnames, fontfamilymetadata, fontfamilymetadatanames, styles, stylesnames } from '../core/library.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import { addStrings, mergeOver, xta, λnull, Ωempty } from '../helper/utilities.js';

import { _abs, _ceil, _isFinite, _keys, _parse, ARIA_LIVE, BLACK, DATA_TAB_ORDER, DEF_SECTION_PLACEHOLDER, DIV, FONT_LENGTH_REGEX, FONT_VARIANT_VALS, ITALIC, LABEL_DIRTY_FONT_KEYS, LABEL_UPDATE_FONTSTRING_KEYS, LABEL_UNLOADED_FONT_KEYS, LABEL_UPDATE_PARTS_KEYS, LAYOUT_KEYS, LEFT, NAME, NORMAL, OBLIQUE, POLITE, ROUND, SMALL_CAPS, SPACE, STATE_KEYS, SYSTEM_FONTS, TEMPLATE_PASS_THROUGH_KEYS, TEXTSTYLE_KEYS, TOP, T_CANVAS, T_CELL, T_LABEL, UNDEF } from '../helper/shared-vars.js';


// #### Local variables
const textEntityConverter = document.createElement(DIV);


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

        textIsAccessible: true,
        accessibleText: DEF_SECTION_PLACEHOLDER,
        accessibleTextPlaceholder: DEF_SECTION_PLACEHOLDER,
        accessibleTextOrder: 0,
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

        if (this.type === T_LABEL) copy = this.handlePacketAnchor(copy, items);

        return copy;
    };


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
    P.factoryKill = function () {

        this.dirtyCache();

        if (this.accessibleTextHold) this.accessibleTextHold.remove();

        const hold = this.getCanvasTextHold(this.currentHost);
        if (hold) hold.dirtyTextTabOrder = true;
    };


// #### Get, Set, deltaSet
// Label-related `get`, `set` and `deltaSet` functions need to take into account the entity State and default TextStyles objects, whose attributes can be retrieved/amended directly on the entity object
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

                if (key && key !== NAME && val != null) {

                    if (layoutTemplate && TEMPLATE_PASS_THROUGH_KEYS.includes(key)) {

                        layoutTemplate.set({[key]: val});
                    }
                    else if (TEXTSTYLE_KEYS.includes(key)) {

                        fn = defaultTextStyleSetters[key];

                        if (fn) fn.call(defaultTextStyle, val);
                        else if (typeof defaultTextStyleDefs[key] !== UNDEF) defaultTextStyle[key] = val;
                    }
                    else if (STATE_KEYS.includes(key)) {

                        fn = stateSetters[key];

                        if (fn) fn.call(state, val);
                        else if (typeof stateDefs[key] !== UNDEF) state[key] = val;
                    }
                    else {

                        fn = setters[key];

                        if (fn) fn.call(this, val);
                        else if (typeof defs[key] !== UNDEF) this[key] = val;
                    }

                    if (layoutTemplate && (LAYOUT_KEYS.includes(key) || TEXTSTYLE_KEYS.includes(key))) this.dirtyLayout = true;

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

                    if (layoutTemplate && (LAYOUT_KEYS.includes(key) || TEXTSTYLE_KEYS.includes(key))) this.dirtyLayout = true;

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
        S = P.setters;

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


// #### Prototype functions

// EnhancedLabel function not relevant to Labels, but an integral part of the set functionality
// + Overwritten by the Enhancedlabel code
    P.dirtyCache = λnull;

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

// `convertTextEntityCharacters`, `textEntityConverter` - (not part of the Label prototype!) - a &lt;textarea> element not attached to the DOM which we can use to temper user-supplied text
// + Tempering includes converting HTMLentity copy - such as changing `&epsilon;` to an &epsilon; letter
// + We also strip the supplied text of all HTML markup
    P.convertTextEntityCharacters = function (item) {

        textEntityConverter.innerHTML = item;
        return textEntityConverter.textContent;
    };

// `updateCanvasFont` - Updates the given TextStyle object's canvasFont string attribute'
    P.updateCanvasFont = function (style, scale) {

        const { fontStyle, fontVariantCaps, fontWeight, fontSize, fontSizeValue, fontFamily } = style;

        let f = '';

        if (fontStyle == ITALIC || fontStyle.includes(OBLIQUE)) f += `${fontStyle} `;
        if (fontVariantCaps == SMALL_CAPS) f += `${fontVariantCaps} `;
        if (fontWeight != null && fontWeight && fontWeight !== NORMAL && fontWeight !== '400') f += `${fontWeight} `;
        if (this.type === T_LABEL) f += `${fontSizeValue * scale}px ${fontFamily}`;
        else f += `${parseFloat(fontSize) * scale}px ${fontFamily}`;

        style.canvasFont = f;
    };

// `updateFontString` - Updates the given TextStyle object's fontString string attribute'
    P.updateFontString = function (style) {

        const { fontStretch, fontStyle, fontVariantCaps, fontWeight, fontSize, fontFamily } = style

        let f = '';

        if (fontStretch != null && fontStretch && fontStretch !== NORMAL) f += `${fontStretch} `;
        if (fontStyle != null && fontStyle && fontStyle !== NORMAL) f += `${fontStyle} `;
        if (fontVariantCaps != null && fontVariantCaps && fontVariantCaps !== NORMAL) f += `${fontVariantCaps} `;
        if (fontWeight != null && fontWeight && fontWeight !== NORMAL && fontWeight !== '400') f += `${fontWeight} `;

        f += `${fontSize} ${fontFamily}`;

        style.fontString = f;
    };

// `getControllerCell` - Retrieve the entity's controller Cell wrapper
    P.getControllerCell = function () {

        const group = this.group;

        if (group) {

            const host = (group && group.getHost) ? group.getHost() : null;

            if (host) return host.getController();
        }
        return null;
    };

// `temperFont` - manipulate the user-supplied font string to create a font string the canvas engine can use
// + This is the preparation step
    P.temperFont = function () {

        const { group, defaultTextStyle } = this;

        if (xta(group, defaultTextStyle)) {

            let fontSizeCalculator = null,
                fontSizeCalculatorValues = null;

            const controller = this.getControllerCell();

            if (controller) {

                fontSizeCalculator = controller.fontSizeCalculator;
                fontSizeCalculatorValues = controller.fontSizeCalculatorValues;
            }

            if (!fontSizeCalculator) this.dirtyFont = true;
            else this.calculateTextStyleFontStrings(defaultTextStyle, fontSizeCalculator, fontSizeCalculatorValues);
        }
    };

    P.cleanFont = function () {

        if (this.currentFontIsLoaded) {

            this.dirtyFont = false;

            this.temperFont();

            if (this.type === T_LABEL && !this.dirtyFont) this.measureFont();
        }
        else this.checkFontIsLoaded(this.defaultTextStyle.fontString);
    };


// `calculateTextStyleFontStrings` - manipulate the user-supplied font string to create a font string the canvas engine can use
// + This is the process step. We use it to set the default TextStyle object's font-related attributes
// + Once we have that data, we can clone the default TextStyle object to perform dynamic updates as calculations, and then the stamp process proceed
    P.calculateTextStyleFontStrings = function (textStyle, calculator, results) {

        let fontSize = textStyle.fontSize;
        const { fontStretch, fontStyle, fontWeight, fontVariantCaps, fontString } = textStyle;
        const { lineSpacing, updateUsingFontParts, updateUsingFontString } = this;

        const scale = this.getScale();

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
        else if (scale !== 1) calculator.style.fontSize = fontSize;

        // Extract and manipulate data for font weight, variant and style
        const elWeight = results.fontWeight,
            elStretch = textStyle.fontStretchHelper(results.fontStretch);

        let elVariant = results.fontVariantCaps,
            elStyle = results.fontStyle;

        // Update elVariant, if required
        elVariant = (FONT_VARIANT_VALS.includes(elVariant)) ? elVariant : NORMAL;

        // Update elStyle, if required
        elStyle = (elStyle === ITALIC || elStyle.includes(OBLIQUE)) ? elStyle : NORMAL;

        // Extract data for font size
        const elSizeString = results.fontSize,
            elSizeValue = parseFloat(elSizeString);

        textStyle.fontSizeValue = elSizeValue;

        // Work specifically for EnhancedLabel entitys, but performed here for efficiency
        // + User can set lineSpacing attribute via the font string
        if (lineSpacing != null && fontString.includes('/')) {

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
        this.updateCanvasFont(textStyle, scale);
        this.updateFontString(textStyle);
    };

    P.getScale = function () {

        const layoutTemplate = this.layoutTemplate;

        // Only EnhancedLabels have a layoutTemplate attribute
        if (layoutTemplate) return layoutTemplate?.currentScale ?? 1;

        // Labels, on the other hand, track their own scale
        return this.currentScale ?? 1;
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

    // `getFontMetadata` - generate basic font metadata
    P.getFontMetadata = function (fontFamily) {

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

                // Currently used by Label and EnhancedLabel
                height,
                verticalOffset,

                // currently used by EnhancedLabel
                alphabeticRatio: _abs((alphabeticBaseline - verticalOffset) / height),
                hangingRatio: _abs((hangingBaseline - verticalOffset) / height),
                ideographicRatio: _abs((ideographicBaseline - verticalOffset) / height),

                // Currently used by Label
                alphabeticBaseline: -alphabeticBaseline,
                hangingBaseline: -hangingBaseline,
                ideographicBaseline: -ideographicBaseline,
            }

            releaseCell(mycell);

            return fontfamilymetadata[font];
        }
    };

    P.checkFontIsLoaded = function (font) {

        if (font == null) this.currentFontIsLoaded = false;
        else if (SYSTEM_FONTS.includes(font)) this.currentFontIsLoaded = true;
        else {

            if (this.currentFontIsLoaded != null && !this.currentFontIsLoaded) {

                this.currentFontIsLoaded = null;

                const fonts = document.fonts;

                fonts.load(font)
                .then (() => this.currentFontIsLoaded = true)
                .catch ((e) => {
                    this.currentFontIsLoaded = false;
                    console.log('checkFontIsLoaded error:', font, e);
                });
            }
        }
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
}
