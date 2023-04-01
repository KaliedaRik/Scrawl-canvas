
// # UnstackedElement factory

// ___To be aware - this artefact factory is HIGHLY EXPERIMENTAL; its API will be subject to short-notice breaking changes as we amend and inprove the artefact's functionality___

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality


// ## Imports
import { unstackedelement, constructors } from '../core/library.js';
import { xt, mergeOver, Ωempty } from '../core/utilities.js';

import { makeCanvas } from './canvas.js';

import baseMix from '../mixin/base.js';


// ## UnstackedElement constructor
const UnstackedElement = function (el) {
    
    let name = el.id || el.name;

    this.makeName(name);
    this.register();

    el.setAttribute('data-scrawl-name', this.name);
    this.domElement = el;

    this.elementComputedStyles = window.getComputedStyle(el);
    this.hostStyles = Ωempty;

    this.canvasStartX = 0;
    this.canvasStartY = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.canvasZIndex = 0;

    return this;
};


// ## UnstackedElement object prototype setup
const P = UnstackedElement.prototype = Object.create(Object.prototype);
P.type = 'UnstackedElement';
P.lib = 'unstackedelement';
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
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;



// ## Define prototype functions


// TODO - documentation

// This is going to be rewritten as part of the "kill" review/recode work
P.demolish = function (removeFromDom = false) {

    return true;
};


// Adds a canvas element to sit behind the element, or in front of it, depending on the setting of the __canvasOnTop__ attribute
P.addCanvas = function (items = Ωempty) {

    if (!this.canvas) {

        let canvas = document.createElement('canvas'),
            el = this.domElement,
            style = el.style;

        if (style.position === 'static') style.position = 'relative';

        canvas.id = `${this.name}-canvas`;
        
        el.prepend(canvas);

        let art = makeCanvas({
            name: `${this.name}-canvas`,
            domElement: canvas,

            position: 'absolute',
        });

        this.canvas = art;

        art.set(items);

        this.updateCanvas();

        return art;
    }
};


// DOM element styles that we need to observe for changes, to keep the canvas in step with its element
P.includedStyles = ['width', 'height', 'zIndex', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius'];


// Included styles that we can transfer directly from DOM element to canvas with no further processing
P.mimickedStyles = ['borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius'];


// Observer function - runs on every RAF loop (when the DOM element is viewable); aim is to:

// + keep canvas dimensions exactly matched with its DOM element's dimensions (including border/padding)
// + position the canvas correctly over/under the DOM element (taking into account border/padding)
// + maintain parity between other DOM element CSS values and those values on the canvas (eg border radius)
P.checkElementStyleValues = function () {

    let results = {};

    let el = this.domElement,
        wrapper = this.canvas;

    if (el && wrapper && wrapper.domElement) {

        let host = this.hostStyles,
            style = this.elementComputedStyles,
            canvas = wrapper.domElement,
            includedStyles = this.includedStyles;

        let {x: elX, y: elY, width: elW, height: elH} = el.getBoundingClientRect();
        let {x: canvasX, y: canvasY} = canvas.getBoundingClientRect();
        let {zIndex: styleZ, width: styleW, height: styleH} = style;

        elX = Math.floor(elX);
        elY = Math.floor(elY);
        canvasX = Math.floor(canvasX);
        canvasY = Math.floor(canvasY);
        elW = Math.floor(elW);
        elH = Math.floor(elH);
        styleW = Math.floor(parseFloat(styleW));
        styleH = Math.floor(parseFloat(styleH));

        includedStyles.forEach(item => {

            switch (item) {

                case 'width' :

                    let w = Math.max(styleW, elW);
                    if (this.canvasWidth !== w) {

                        this.canvasWidth = w;
                        this.dirtyDimensions = true;
                    }
                    break;

                case 'height' :

                    let h = Math.max(styleH, elH);
                    if (this.canvasHeight !== h) {

                        this.canvasHeight = h;
                        this.dirtyDimensions = true;
                    }
                    break;

                case 'zIndex' :

                    let z = (styleZ === 'auto') ? 0 : parseInt(styleZ, 10);
                    z = (this.canvasOnTop) ? z + 1 : z - 1;

                    if (this.canvasZIndex !== z) {

                        this.canvasZIndex = z;
                        this.dirtyZIndex = true;
                    }
                    break;

                default :

                    let hi = host[item],
                        si = style[item];

                    if(!xt(hi) || hi !== si) {
                
                        host[item] = si;
                        results[item] = si;
                    }
            }
        });

        let dx = elX - canvasX,
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

        let canvas = this.canvas,
            style = canvas.domElement.style,
            mimics = this.mimickedStyles,
            updates = this.checkElementStyleValues();

        for (let [key, value] of Object.entries(updates)) {

            if (mimics.includes(key)) {

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

            let w = this.canvasWidth,
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
