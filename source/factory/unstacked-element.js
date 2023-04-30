// # UnstackedElement factory

// ___To be aware - this artefact factory is HIGHLY EXPERIMENTAL; its API will be subject to short-notice breaking changes as we amend and inprove the artefact's functionality___

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality


// ## Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, xt, Ωempty } from '../core/utilities.js';

import { makeCanvas } from './canvas.js';

import baseMix from '../mixin/base.js';

import { _computed, _entries, _floor, _max, ABSOLUTE, AUTO, CANVAS, DATA_SCRAWL_NAME, HEIGHT, RELATIVE, STATIC, T_UNSTACKED_ELEMENT, UE_INCLUDED_STYLES, UE_MIMICKED_STYLES, UNSTACKEDELEMENT, WIDTH, Z_INDEX } from '../core/shared-vars.js';


// ## UnstackedElement constructor
const UnstackedElement = function (el) {

    const name = el.id || el.name;

    this.makeName(name);
    this.register();

    el.setAttribute(DATA_SCRAWL_NAME, this.name);
    this.domElement = el;

    this.elementComputedStyles = _computed(el);
    this.hostStyles = {};

    this.canvasStartX = 0;
    this.canvasStartY = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.canvasZIndex = 0;

    return this;
};


// ## UnstackedElement object prototype setup
const P = UnstackedElement.prototype = doCreate();
P.type = T_UNSTACKED_ELEMENT;
P.lib = UNSTACKEDELEMENT;
P.isArtefact = false;
P.isAsset = false;


// Apply mixins to prototype object
baseMix(P);


// ## Define default attributes
const defaultAttributes = {


// TODO - documentation
    canvasOnTop: false,

};
P.defs = mergeOver(P.defs, defaultAttributes);


// ## Packet management
// TODO


// ## Define getter, setter and deltaSetter functions
// TODO


// ## Define prototype functions
// TODO - documentation

// This is going to be rewritten as part of the "kill" review/recode work
P.demolish = function () {

    return true;
};


// Adds a canvas element to sit behind the element, or in front of it, depending on the setting of the __canvasOnTop__ attribute
P.addCanvas = function (items = Ωempty) {

    if (!this.canvas) {

        const canvas = document.createElement(CANVAS),
            el = this.domElement,
            style = el.style;

        if (style.position == STATIC) style.position = RELATIVE;

        canvas.id = `${this.name}-canvas`;

        el.prepend(canvas);

        const art = makeCanvas({
            name: `${this.name}-canvas`,
            domElement: canvas,

            position: ABSOLUTE,
        });

        this.canvas = art;

        art.set(items);

        this.updateCanvas();

        return art;
    }
};

// Observer function - runs on every RAF loop (when the DOM element is viewable); aim is to:
// + keep canvas dimensions exactly matched with its DOM element's dimensions (including border/padding)
// + position the canvas correctly over/under the DOM element (taking into account border/padding)
// + maintain parity between other DOM element CSS values and those values on the canvas (eg border radius)
P.checkElementStyleValues = function () {

    const results = {};

    const el = this.domElement,
        wrapper = this.canvas;

    if (el && wrapper && wrapper.domElement) {

        const host = this.hostStyles,
            style = this.elementComputedStyles,
            canvas = wrapper.domElement;

        let {x: elX, y: elY, width: elW, height: elH} = el.getBoundingClientRect();
        let {x: canvasX, y: canvasY} = canvas.getBoundingClientRect();
        let {zIndex: styleZ, width: styleW, height: styleH} = style;

        elX = _floor(elX);
        elY = _floor(elY);
        canvasX = _floor(canvasX);
        canvasY = _floor(canvasY);
        elW = _floor(elW);
        elH = _floor(elH);
        styleW = _floor(parseFloat(styleW));
        styleH = _floor(parseFloat(styleH));

        let w, h, z, hi, si;

        UE_INCLUDED_STYLES.forEach(item => {

            switch (item) {

                case WIDTH :

                    w = _max(styleW, elW);
                    if (this.canvasWidth != w) {

                        this.canvasWidth = w;
                        this.dirtyDimensions = true;
                    }
                    break;

                case HEIGHT :

                    h = _max(styleH, elH);
                    if (this.canvasHeight != h) {

                        this.canvasHeight = h;
                        this.dirtyDimensions = true;
                    }
                    break;

                case Z_INDEX :

                    z = (styleZ == AUTO) ? 0 : parseInt(styleZ, 10);
                    z = (this.canvasOnTop) ? z + 1 : z - 1;

                    if (this.canvasZIndex != z) {

                        this.canvasZIndex = z;
                        this.dirtyZIndex = true;
                    }
                    break;

                default :


                    hi = host[item];
                    si = style[item];

                    if(!xt(hi) || hi != si) {

                        host[item] = si;
                        results[item] = si;
                    }
            }
        });

        const dx = elX - canvasX,
            dy = elY - canvasY;

        if (dx || dy) {

            this.canvasStartX += dx;
            this.canvasStartY += dy;

            this.dirtyStart = true;
        }
    }
    return results;
};


// Perform any updates reported by the observer function

// UnstackedElement canvases keep their display and base canvases in dimensional sync - which means that __relatively positioned and dimensioned__ entitys in the canvas (those set with appropriate 'val%' string values) will update in line with changes in the DOM element's width, height, padding and margin values
P.updateCanvas = function () {

    if (this.canvas && this.canvas.domElement) {

        const canvas = this.canvas,
            style = canvas.domElement.style,
            updates = this.checkElementStyleValues();

        for (const [key, value] of _entries(updates)) {

            if (UE_MIMICKED_STYLES.includes(key)) {

                style[key] = value;
            }
        }

        if (this.dirtyStart) {

            this.dirtyStart = false;

            canvas.set({
                startX: this.canvasStartX,
                startY: this.canvasStartY,
            });
        }

        if (this.dirtyDimensions) {

            this.dirtyDimensions = false;

            const w = this.canvasWidth,
                h = this.canvasHeight;

            canvas.set({
                width: w,
                height: h,
            });
            canvas.dirtyDimensions = true;

            canvas.base.set({
                width: w,
                height: h,
            });
            canvas.base.dirtyDimensions = true;

            canvas.cleanDimensions();
            canvas.base.cleanDimensions();
        }

        if (this.dirtyZIndex) {

            this.dirtyZIndex = false;
            style.zIndex = this.canvasZIndex;
        }
    }
};


// ## Exported factory function
export const makeUnstackedElement = function (items) {

    if (!items) return false;
    return new UnstackedElement(items);
};

constructors.UnstackedElement = UnstackedElement;
