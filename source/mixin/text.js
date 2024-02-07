// # Text mixin
// Adds accessibility and bounding box functionality to Phrase, Label and EnhancedLabel entitys. Also includes the functionality to see whether a font has been loaded.



// #### Imports
import { cell, cellnames, styles, stylesnames } from '../core/library.js';

import { mergeOver, Ωempty } from '../helper/utilities.js';

import { ARIA_LIVE, BLACK, DATA_TAB_ORDER, DEF_SECTION_PLACEHOLDER, DIV, POLITE, SOURCE_OVER, SYSTEM_FONTS, T_CANVAS, T_CELL, TEXTAREA } from '../helper/shared-vars.js';


// #### Local variables
const textEntityConverter = document.createElement(TEXTAREA);


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

        textIsAccessible: true,
        accessibleText: DEF_SECTION_PLACEHOLDER,
        accessibleTextPlaceholder: DEF_SECTION_PLACEHOLDER,
        accessibleTextOrder: 0,

        showBoundingBox: false,
        boundingBoxStyle: BLACK,
        boundingBoxLineWidth: 1,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
    P.factoryKill = function () {

        if (this.accessibleTextHold) this.accessibleTextHold.remove();

        const hold = this.getCanvasTextHold(this.currentHost);
        if (hold) hold.dirtyTextTabOrder = true;
    };


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters;

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

// `convertTextEntityCharacters`, `textEntityConverter` - (not part of the Label prototype!) - a &lt;textarea> element not attached to the DOM which we can use to temper user-supplied text
// + Tempering includes converting HTMLentity copy - such as changing `&epsilon;` to an &epsilon; letter
    P.convertTextEntityCharacters = function (item) {

        textEntityConverter.innerHTML = item;
        return textEntityConverter.value;
    };


// `drawBoundingBox` - internal helper function called by `method` functions
    P.drawBoundingBox = function (host) {

        const uStroke = this.getStyle(this.boundingBoxStyle, 'fillStyle', host);
        const engine = host.engine;

        engine.save();
        engine.strokeStyle = uStroke;
        engine.lineWidth = this.boundingBoxLineWidth;
        engine.globalCompositeOperation = SOURCE_OVER;
        engine.globalAlpha = 1;
        engine.shadowOffsetX = 0;
        engine.shadowOffsetY = 0;
        engine.shadowBlur = 0;
        engine.stroke(this.pathObject);
        engine.restore();
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

        if (item?.type == T_CELL && item?.controller?.type == T_CANVAS && item?.controller?.textHold) return item.controller;

        // For non-based Cells we have to make a recursive call to find the &lt;canvas> host
        if (item && item.type == T_CELL && item.currentHost) return this.getCanvasTextHold(item.currentHost);

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
}
