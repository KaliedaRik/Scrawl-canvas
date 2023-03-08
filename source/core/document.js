// # DOM management
// Core DOM element discovery and management functionality
//
// The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value


// #### Imports
import { pushUnique, css, xcss } from "./utilities.js";
import { artefact } from "./library.js";

import { rootElements } from "./document-rootElements.js";
import { getPixelRatio, getIgnorePixelRatio } from "./events.js";

// #### DOM element updates
// Scrawl-canvas will batch process all DOM element updates, to minimize disruptive impacts on web page performance. We don't maintain a full/comprehensive 'shadow' or 'virtual' DOM, but Scrawl-canvas does maintain a record of element (absolute) position and dimension data, alongside details of scaling, perspective and any other CSS related data (including CSS classes) which we tell it about, on a per-element basis.
//
// The decision on whether to update a DOM element is mediated through a suite of 'dirty' flags assigned on the Scrawl-canvas artefact object which wraps each DOM element. As part of the compile component of the Scrawl-canvas Display cycle, the code will take a decision on whether the DOM element needs to be updated and insert the artefact's name in the __domShowElements__ array, and set the __domShowRequired__ flag to true, which will then trigger the __domShow()__ function to run at the end of each Display cycle.
//
// The domShow() function is exported, and can be triggered for any DOM-related artefact at any time by invoking it with the artefact's name as the function's argument.
//
// The order in which DOM elements get updated is determined by the __order__ attributes set on the Stack artefact, on Group objects, and (least important) on the element artefact.

// Local variable
const domShowElements = [];

// `Exported function` (to modules). 
export const addDomShowElement = function (item = '') {

    if (!item) throw new Error(`core/document addDomShowElement() error - false argument supplied: ${item}`);
    if (!item.substring) throw new Error(`core/document addDomShowElement() error - argument not a string: ${item}`);

    pushUnique(domShowElements, item);
};

export let domShowRequired = false;

// `Exported function` (to modules). 
export const setDomShowRequired = function (val = true) {

    domShowRequired = val;
};

// `Exported function` (to modules). This is the __main DOM manipulation function__ which will be triggered once during each Display cycle.
export const domShow = function (singleArtefact = '') {

    if (domShowRequired || singleArtefact) {

        let myartefacts;

        if (singleArtefact) myartefacts = [singleArtefact];
        else {

            domShowRequired = false;
            myartefacts = [].concat(domShowElements);
            domShowElements.length = 0;
        }

        let i, iz, name, art, el, style,
            p, dims, w, h,
            j, jz, items, keys, key, keyName, value;

        let ignoreDpr = getIgnorePixelRatio();
        let dpr = getPixelRatio();

        for (i = 0, iz = myartefacts.length; i < iz; i++) {

            name = myartefacts[i];

            art = artefact[name];
            if (!art) throw new Error(`core/document domShow() error - artefact missing: ${name}`);

            el = art.domElement;
            if (!el) throw new Error(`core/document domShow() error - DOM element missing: ${name}`);

            style = el.style;

            // update perspective
            if (art.dirtyPerspective) {

                art.dirtyPerspective = false;

                p = art.perspective;

                style.perspectiveOrigin = `${p.x} ${p.y}`;
                style.perspective = `${p.z}px`;
            }

            // update position
            if (art.dirtyPosition) {

                art.dirtyPosition = false;
                style.position = art.position;
            }

            // update dimensions
            if (art.dirtyDomDimensions) {

                art.dirtyDomDimensions = false;

                dims = art.currentDimensions;
                w = dims[0];
                h = dims[1];

                if (art.type === 'Canvas') {

                    if (ignoreDpr) {

                        el.width = w;
                        el.height = h;
                    }
                    else {

                        if (!art.ignoreCanvasCssDimensions) {

                            style.width = `${w}px`;
                            style.height = `${h}px`;
                        }

                        el.width = w * dpr;
                        el.height = h * dpr;
                    }
                    if (art.renderOnResize) art.render();
                }
                else {

                    style.width = `${w}px`;
                    style.height = (h) ? `${h}px` : 'auto';
                }
            }

            // update handle/transformOrigin
            if (art.dirtyTransformOrigin) {

                art.dirtyTransformOrigin = false;
                style.transformOrigin = art.currentTransformOriginString;
            }

            // update transform
            if (art.dirtyTransform) {

                art.dirtyTransform = false;
                style.transform = art.currentTransformString;
            }

            // update visibility
            if (art.dirtyVisibility) {

                art.dirtyVisibility = false;
                style.display = (art.visibility) ? 'block' : 'none';
            }

            // update visibility
            if (art.dirtySmoothFont) {

                art.dirtySmoothFont = false;

                if (art.smoothFont) {
                    style['webkitFontSmoothing'] = 'auto';
                    style['mozOsxFontSmoothing'] = 'auto';
                    style['smoothFont'] = 'auto';
                }
                else {
                    style['webkitFontSmoothing'] = 'none';
                    style['mozOsxFontSmoothing'] = 'grayscale';
                    style['smoothFont'] = 'never';
                }
            }

            // update other CSS changes
            if (art.dirtyCss) {

                art.dirtyCss = false;

                items = art.css || {};
                keys = Object.keys(items);

                for (j = 0, jz = keys.length; j < jz; j++) {

                    key = keys[j];
                    value = items[key];

                    if (xcss.has(key)) {

                        keyName = `${key[0].toUpperCase}${key.substr(1)}`;

                        style[`webkit${keyName}`] = value;
                        style[`moz${keyName}`] = value;
                        style[`ms${keyName}`] = value;
                        style[`o${keyName}`] = value;
                        style[key] = value;
                    }
                    else if (css.has(key)) style[key] = value;
                }
            }

            // update element classes
            if (art.dirtyClasses) {

                art.dirtyClasses = false;
                if (el.className.substring) el.className = art.classes;
            }
        }
    }
};

// #### DOM Holding areas
// `Exported handles` (to modules). During its initialization phase, Scrawl-canvas will add two hidden 'hold' elements at the top and bottom of the document body where it can add additional elements as-and-when required. 

// Mainly for ARIA content. ARIA labels and descriptions are used by Scrawl-canvas &lt;canvas> elements to inform non-visual website visitors about content in the canvas.
export const scrawlCanvasHold = document.createElement('div');
scrawlCanvasHold.style.padding = 0;
scrawlCanvasHold.style.border = 0;
scrawlCanvasHold.style.margin = 0;
scrawlCanvasHold.style.width = '4500px';
scrawlCanvasHold.style.boxSizing = 'border-box';
scrawlCanvasHold.style.position = 'absolute';
scrawlCanvasHold.style.top = '-5000px';
scrawlCanvasHold.style.left = '-5000px';
scrawlCanvasHold.id = 'Scrawl-ARIA-default-hold';
document.body.appendChild(scrawlCanvasHold);

// Navigation area - canvas anchor links. Canvases create their own (hidden) &lt;nav> elements that directly follow them in the DOM. These are used to store &lt;a> links for clickable entitys in the canvas display, making them accessible to non-visual users (for example: screen readers)
export const scrawlNavigationHold = document.createElement('nav');
scrawlNavigationHold.style.position = 'absolute';
scrawlNavigationHold.style.top = '-5000px';
scrawlNavigationHold.style.left = '-5000px';
scrawlNavigationHold.id = 'Scrawl-navigation-default-hold';
document.body.prepend(scrawlNavigationHold);
