// # Cell-fragment factory
// Create a highly reduced CellFragment which supplies the cell pool


// #### Imports
import { doCreate, λnull, λthis } from '../core/utilities.js';

import { makeState } from './state.js';

import baseMix from '../mixin/base.js';
import cellMix from '../mixin/cell-key-functions.js';

import { _2D, CANVAS, T_CELLFRAGMENT } from '../core/shared-vars.js';


// #### CellFragment constructor
const CellFragment = function (name) {

    this.name = name;

    const element = this.element = document.createElement(CANVAS);
    const engine = this.engine = element.getContext(_2D, {
        willReadFrequently: true,
    });

    element.width = 1;
    element.height = 1;

    const state = this.state = makeState({ engine });

    state.setStateFromEngine(this.engine);

    return this;
};


// #### CellFragment prototype
const P = CellFragment.prototype = doCreate();
P.type = T_CELLFRAGMENT;


// #### Mixins
baseMix(P);
cellMix(P);


// #### Packet/Clone management
// This functionality is disabled for CellFragments objects
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = λthis;


// #### Kill functionality
// None required


// #### Cell pool
// A number of processes - for instance collision functionality, and applying filters to entitys and groups - require the use of a &lt;canvas> element and its CanvasRenderingContext2D engine. Rather than generate these canvas elements on the fly, we store them in a pool, to help make the code more efficiant.
//
// To use a pool cell, request it using the exposed __requestCell__ function.
//
// IT IS IMPERATIVE that requested cells are released once work with them completes, using the __releaseCell__ function. Failure to do this leads to impaired performance as Javascript creates new canvas elements (often in multiples of 60 per second) which need to be garbage collected by the Javascript engine, thus leading to increasingly shoddy performance the longer the animation runs.
const cellPool = [];

let count = 0;

// `Exported function` - __requestCell__
export const requestCell = function () {

    if (!cellPool.length) cellPool.push(new CellFragment(`pool_${count++}`));

    let c = cellPool.shift();
    c.engine.save();

    // console.log(c.name, c.element.width, c.element.height);
    return c;
};

// `Exported function` - __releaseCell__
export const releaseCell = function (c) {

    if (c && c.type == T_CELLFRAGMENT) {

        c.engine.restore();
        cellPool.push(c);
    }
};
