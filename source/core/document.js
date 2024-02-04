// # DOM management
// Core DOM element discovery and management functionality
//
// The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value


// #### Imports
import { artefact, entitynames, entity } from "./library.js";

import { pushUnique, Ωempty } from "../helper/utilities.js";

import { getPixelRatio, getIgnorePixelRatio } from "./user-interaction.js";

import { releaseArray, requestArray } from '../helper/array-pool.js';

import { _css, _keys, _xcss, AUTO, BLOCK, GRAYSCALE, FONT_USERS, MOZOSX_FONT_SMOOTHING, NEVER, NONE, SMOOTH_FONT, T_CANVAS, WEBKIT_FONT_SMOOTHING, ZERO_STR } from '../helper/shared-vars.js';


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
let domShowRequired = false;

// `Exported function` (to modules).
export const setDomShowRequired = (val = true) => domShowRequired = val;

// `Exported function` (to modules).
export const addDomShowElement = function (item = ZERO_STR) {

    if (item && item.substring) {

        pushUnique(domShowElements, item);
    }
};

// `Exported function` (to modules). This is the __main DOM manipulation function__ which will be triggered once during each Display cycle.
export const domShow = function (singleArtefact = ZERO_STR) {

    if (domShowRequired || singleArtefact) {

        const myartefacts = requestArray();

        if (singleArtefact && singleArtefact.substring) myartefacts.push(singleArtefact);
        else {

            domShowRequired = false;
            myartefacts.push(...domShowElements);
            domShowElements.length = 0;
        }

        let i, iz, art, el, style,
            p, dims, w, h,
            j, jz, items, keys, key, keyName, value;

        const ignoreDpr = getIgnorePixelRatio();
        const dpr = getPixelRatio();

        for (i = 0, iz = myartefacts.length; i < iz; i++) {

            art = artefact[myartefacts[i]];

            if (art) {

                el = art.domElement;

                if (el) {

                    style = el.style;

                    if (style) {

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

                            if (art.type == T_CANVAS) {

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
                                style.height = (h) ? `${h}px` : AUTO;
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
                            style.display = (art.visibility) ? BLOCK : NONE;
                        }

                        // update visibility
                        if (art.dirtySmoothFont) {

                            art.dirtySmoothFont = false;

                            if (art.smoothFont) {
                                style[WEBKIT_FONT_SMOOTHING] = AUTO;
                                style[MOZOSX_FONT_SMOOTHING] = AUTO;
                                style[SMOOTH_FONT] = AUTO;
                            }
                            else {
                                style[WEBKIT_FONT_SMOOTHING] = NONE;
                                style[MOZOSX_FONT_SMOOTHING] = GRAYSCALE;
                                style[SMOOTH_FONT] = NEVER;
                            }
                        }

                        // update other CSS changes
                        if (art.dirtyCss) {

                            art.dirtyCss = false;

                            items = art.css || Ωempty;
                            keys = _keys(items);

                            for (j = 0, jz = keys.length; j < jz; j++) {

                                key = keys[j];
                                value = items[key];

                                if (_xcss.includes(key)) {

                                    keyName = `${key[0].toUpperCase}${key.substr(1)}`;

                                    style[`webkit${keyName}`] = value;
                                    style[`moz${keyName}`] = value;
                                    style[`ms${keyName}`] = value;
                                    style[`o${keyName}`] = value;
                                    style[key] = value;
                                }
                                else if (_css.includes(key)) style[key] = value;
                            }
                        }

                        // update element classes
                        if (art.dirtyClasses) {

                            art.dirtyClasses = false;
                            if (el.className.substring) el.className = art.classes;
                        }
                    }
                }
            }
        }
        releaseArray(myartefacts);
    }
};

export const recalculateFonts = (delay = 100) => {

    setTimeout(() => {

        entitynames.forEach(name => {

            const ent = entity[name];

            if (FONT_USERS.includes(ent.type)) ent.recalculateFont();
        });
    }, delay);
};
