// # Label mixin
// Adds functionality to Label and EnhancedLabel entitys.



// #### Imports
import { textstyle, textstylenames } from '../core/library.js';

import { makeState } from '../untracked-factory/state.js';
import { makeTextStyle } from '../factory/text-style.js';
import { currentGroup } from '../factory/canvas.js';

import { addStrings, mergeOver, removeItem, λnull, Ωempty } from '../helper/utilities.js';

import { _freeze, _keys, _parse, NAME, STATE_KEYS, UNDEF, ZERO_STR } from '../helper/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

        text: ZERO_STR,

        includeUnderline: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.finalizePacketOut = function (copy, items) {

        const defaultTextCopy = _parse(this.defaultTextStyle.saveAsPacket(items))[3];
        const stateCopy = _parse(this.state.saveAsPacket(items))[3];

        copy = mergeOver(copy, {
            fontString: defaultTextCopy.fontString,
            underlineStyle: defaultTextCopy.underlineStyle,
            underlineWidth: defaultTextCopy.underlineWidth,
            underlineOffset: defaultTextCopy.underlineOffset,
            underlineGap: defaultTextCopy.underlineGap,
            includeHighlight: defaultTextCopy.includeHighlight,
            highlightStyle: defaultTextCopy.highlightStyle,
            fillStyle: defaultTextCopy.fillStyle,
            strokeStyle: defaultTextCopy.strokeStyle,
            direction: defaultTextCopy.direction,
            fontKerning: defaultTextCopy.fontKerning,
            textRendering: defaultTextCopy.textRendering,
            fontStretch: defaultTextCopy.fontStretch,
            fontVariantCaps: defaultTextCopy.fontVariantCaps,
            letterSpacing: defaultTextCopy.letterSpaceValue,
            wordSpacing: defaultTextCopy.wordSpaceValue,
            lineWidth: defaultTextCopy.lineWidth,
            lineDash: defaultTextCopy.lineDash,
            lineDashOffset: defaultTextCopy.lineDashOffset,
            globalAlpha: stateCopy.globalAlpha,
            globalCompositeOperation: stateCopy.globalCompositeOperation,
            font: stateCopy.font,
            textAlign: stateCopy.textAlign,
            textBaseline: stateCopy.textBaseline,
            lineCap: stateCopy.lineCap,
            lineJoin: stateCopy.lineJoin,
            miterLimit: stateCopy.miterLimit,
            shadowOffsetX: stateCopy.shadowOffsetX,
            shadowOffsetY: stateCopy.shadowOffsetY,
            shadowBlur: stateCopy.shadowBlur,
            shadowColor: stateCopy.shadowColor,
            filter: stateCopy.filter,
            imageSmoothingEnabled: stateCopy.imageSmoothingEnabled,
            imageSmoothingQuality: stateCopy.imageSmoothingQuality,
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
    const TEXTSTYLE_KEYS = _freeze(['fontString', 'fontSize', 'underlineStyle', 'underlineWidth', 'underlineOffset', 'underlineGap', 'includeHighlight', 'highlightStyle', 'fillStyle', 'strokeStyle', 'direction', 'fontKerning', 'textRendering', 'letterSpaceValue', 'wordSpaceValue', 'letterSpacing', 'wordSpacing', 'fontStretch', 'fontVariantCaps', 'fontWeight', 'fontStyle', 'lineWidth', 'lineDash', 'lineDashOffset']);

    const LABEL_DIRTY_FONT_KEYS = _freeze(['fontString', 'fontSize', 'direction', 'fontKerning', 'textRendering', 'letterSpacing', 'wordSpacing', 'fontStretch', 'fontVariantCaps', 'fontWeight', 'fontStyle', 'scale']);

    const LABEL_UPDATE_PARTS_KEYS = _freeze(['fontSize', 'fontStyle', 'fontVariantCaps', 'fontStretch', 'fontWeight', 'fontStyle']);

    const LABEL_UPDATE_FONTSTRING_KEYS = _freeze(['fontString', 'scale']);

    const LABEL_UNLOADED_FONT_KEYS = _freeze(['fontString', 'fontSize', 'scale']);

    P.get = function (item) {

        const getter = this.getters[item];

        if (getter) return getter.call(this);

        else {

            const {state, defaultTextStyle} = this;

            let def = this.defs[item];
            let val;

            if (def != null) {

                val = this[item];
                return (typeof val != UNDEF) ? val : def;
            }

            def = defaultTextStyle.defs[item];

            if (def != null) {

                val = defaultTextStyle[item];
                return (typeof val != UNDEF) ? val : def;
            }

            def = state.defs[item];

            if (def != null) {

                val = state[item];
                return (typeof val != UNDEF) ? val : def;
            }
            return null;
        }
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

        this.rawText = (item.substring) ? item : item.toString;
        this.text = this.convertTextEntityCharacters(this.rawText);

        this.dirtyText = true;
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

        this.set(this.defs);

        if (!items.group) items.group = currentGroup;

        this.onEnter = λnull;
        this.onLeave = λnull;
        this.onDown = λnull;
        this.onUp = λnull;

        this.updateUsingFontParts = false;
        this.updateUsingFontString = false;
        this.letterSpaceValue = 0;
        this.wordSpaceValue = 0;

        this.defaultTextStyle = makeTextStyle({
            name: `${this.name}_default-textstyle`,
            isDefaultTextStyle: true,
        });

        this.set(items);

        this.midInitActions(items);

        if (this.purge) this.purgeArtefact(this.purge);

        this.dirtyFont = true;
        this.currentFontIsLoaded = false;
    };

}
