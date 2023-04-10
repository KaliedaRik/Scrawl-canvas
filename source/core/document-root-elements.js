// # Root elements
//
// `Exported array and function` (to modules). Root elements are the boxes whose dimensions define the dimensions and positioning of all that they contain. All &lt;canvas> elements are root elements. Scrawl-canvas also allows other DOM elements (typically &lt;div> elements) to be defined as root elements called __stacks__, whose child elements can then be positioned and dimensioned just like entity objects in a canvas.
//
// Stacks can be nested within each other, and canvases can also be nested inside a stack. (Nothing can nest inside a canvas element). Only the top level stack will be included in the rootElements array.
//
// The Scrawl-canvas __Display cycle__ can start at the rootElements array, with each member of the array processed in turn.


// #### Imports
import { artefact } from "./library.js";

import { getRootElementsSort, setRootElementsSort } from './system-flags.js';

import { pushUnique, removeItem } from './utilities.js';

import { _floor } from './shared-vars.js';


// Local variables
const rootElements = [];
const rootElements_sorted = [];
    
export const rootElementsAdd = (val) => {
    pushUnique(rootElements, val);
    setRootElementsSort(true);
};

export const rootElementsRemove = (val) => {
    removeItem(rootElements, val);
    setRootElementsSort(true);
};

export const rootElementsIncludes = (val) => rootElements.includes(val);

export const getSortedRootElements = () => {

    if (getRootElementsSort()) sortRootElements();
    return rootElements_sorted;
};

// The __rootElements__ array keeps track of all 'root' stack artefacts, and also includes all canvas artefacts, whether they're part of a stack or not. __setRootElementSort__ forces the root
// export const setRootElementsSort = () => {rootElementsSort = true};
// export const getRootElementsSort = () => rootElementsSort;

// Scrawl-canvas rootElements sorter uses a 'bucket sort' algorithm
const sortRootElements = function () {

    setRootElementsSort(false);

    const buckets = [];
    let art, order, i, iz, item;

    for (i = 0, iz = rootElements.length; i < iz; i++) {

        item = rootElements[i];
        art = artefact[item];

        if (art) {

            order = _floor(art.order) || 0;

            if (!buckets[order]) buckets[order] = [];
            
            buckets[order].push(art.name);
        }
    }
    rootElements_sorted.length = 0;
    rootElements_sorted.push(...buckets.reduce((a, v) => a.concat(v), []));
};
