// # Delta mixin
// This mixin defines additional attributes and functions for an artefact that uses delta functionality


// #### Imports
import { 
    mergeDiscard,
    mergeOver,
    xt,
    Ωempty,
} from '../core/utilities.js';

import {
    _isArray,
    _keys,
} from '../core/shared-vars.js'


// Local constants
const ADD = 'add',
    LONGCHECK = ['startX', 'startY', 'handleX', 'handleY', 'offsetX', 'offsetY', 'width', 'height'],
    LOOP = 'loop',
    MULTIPLY = 'multiply',
    NEWNUMBER = 'newNumber',
    NEWSTRING = 'newString',
    PC = '%',
    REMOVE = 'remove',
    REVERSE = 'reverse',
    SEPARATOR = ':',
    SHORTCHECK = ['startY', 'handleY', 'offsetY', 'height'],
    UPDATE = 'update';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __delta__ - a Javascript object containing `{key:value, key:value, etc}` attributes. 
// + As part of the Display cycle, delta values get added to artefact attribute values - this is a very simple form of animation.
// + __deltaConstraints__ - Object mirroring the `delta` object which we use to set bounds on the delta values, and instructions on what to do when those bounds are crossed.
// + __noDeltaUpdates__ - Boolean flag to switch off the automatic application of delta attribute values as part of each iteration of the Display cycle.
// + __checkDeltaConstraints__ - Boolean flag to switch ON automatic constraint checks.
// + Delta updates can be invoked independently from the Display cycle by invoking `artefact.updateByDelta`, `artefact.reverseByDelta`.
// + In addition to using `artefact.set`, we can also update the delta object values using `artefact.setDeltaValues`.
//
// ```
// // This Block artefact will animate itself across the <canvas> element
// // - it will move to the right and upwards until the `delta` values are updated
// // - animation will stop when the `noDeltaUpdates` flag is set
// let myBlock = scrawl.makeBlock({
//     start: ['left', 500],
//     delta: {
//         startX: 0.5,
//         startY: '-0.3',
//     },
//     noDeltaUpdates: false,
// });
// ```
// 
// Note that the `delta` and `deltaConstraints` objects are set up in the mixin/position.js module, not here
        delta: null,
        noDeltaUpdates: false,
        deltaConstraints: null,
        checkDeltaConstraints: false,

// We do not want to perform any delta checks on any uninitalized attributes - in other words: no checks on the first iteration of the Display cycle
        performDeltaChecks: false,

    };
    P.defs = mergeOver(P.defs, defaultAttributes);
    mergeOver(P, defaultAttributes);


// #### Packet management
// No additional packet management functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const S = P.setters,
        D = P.deltaSetters;

// __delta__
    S.delta = function (items = Ωempty) {

        if (items) this.delta = mergeDiscard(this.delta, items);
    };


    S.deltaConstraints = function (items = Ωempty) {

        if (items) this.deltaConstraints = mergeDiscard(this.deltaConstraints, items);
    };


// #### Prototype functions

 // `updateByDelta` - this function gets called as part of every display cycle iteration, meaning that if an attribute is set to a non-zero value in the __delta__ attribute object then those __delta animations__ will start playing immediately.
    P.updateByDelta = function () {

        this.setDelta(this.delta);

        if (this.checkDeltaConstraints) this.performDeltaConstraintsChecks();

        return this;
    };


// `reverseByDelta` - The opposite action to 'updateByDelta'; values in the __delta__ attribute object will be subtracted from the current value for that Scrawl-canvas object.
    P.reverseByDelta = function () {

        const temp = {},
            delta = this.delta,
            deltaKeys = _keys(delta),
            deltaLen = deltaKeys.length;

        let i, key, val;

        for (i = 0; i < deltaLen; i++) {

            key = deltaKeys[i];
            val = delta[key];

            if (val.substring) val = -(parseFloat(val)) + PC;
            else val = -val;

            temp[key] = val;
        }
        this.setDelta(temp);

        if (this.checkDeltaConstraints) this.performDeltaConstraintsChecks();

        return this;
    };

    P.performDeltaConstraintsChecks = function () {

        const {delta, deltaConstraints} = this;

        if (this.performDeltaChecks) {

            const keys = _keys(deltaConstraints),
                keysLen = keys.length;

            let key, keyIndex, item, min, max, action, act, loopAct, arr, valIndex, val, i, fMin, fMax, fVal;

            for (i = 0; i < keysLen; i++) {

                key = keys[i];
                item = deltaConstraints[key];

                if (_isArray(item) && item.length == 3) {

                    [min, max, action] = deltaConstraints[key];

                    if (min.substring) {

                        keyIndex = LONGCHECK.indexOf(key);
                        arr = false;
                        valIndex = 0;

                        if (keyIndex >= 0) {

                            if (keyIndex < 2) arr = this.start;
                            else if (keyIndex < 4) arr = this.handle;
                            else if (keyIndex < 6) arr = this.offset;
                            else if (keyIndex < 8) arr = this.dimensions;

                            if (SHORTCHECK.includes(key)) valIndex = 1;

                            val = arr[valIndex];
                        }
                        else val = this.get(key);

                        fMin = parseFloat(min);
                        fMax = parseFloat(max);
                        fVal = parseFloat(val);
                        act = '';

                        if (fVal < fMin) {

                            act = action;
                            loopAct = 0;
                        }
                        else if (fVal > fMax) {

                            act = action;
                            loopAct = 1;
                        }

                        if (act) {

                            switch (act) {

                                case REVERSE :

                                    delta[key] = -parseFloat(delta[key]) + PC;

                                    this.set({
                                        [key]: fVal + parseFloat(delta[key]) + PC,
                                    });
                                    break; 

                                case LOOP :

                                    if (loopAct) {

                                        this.set({
                                            [key]: fVal - (fMax - fMin) + PC,
                                        });
                                    }
                                    else {

                                        this.set({
                                            [key]: fVal + (fMax - fMin) + PC,
                                        });
                                    }
                                    break; 
                            }
                        }
                    }
                    else {

                        val = this.get(key);

                        act = '';

                        if (val < min) {

                            act = action;
                            loopAct = 0;
                        }
                        else if (val > max) {

                            act = action;
                            loopAct = 1;
                        }

                        if (act) {

                            switch (act) {

                                case REVERSE :

                                    delta[key] = -delta[key];

                                    this.set({
                                        [key]: val + delta[key],
                                    });
                                    break; 

                                case LOOP :

                                    if (loopAct) {

                                        this.set({
                                            [key]: val - (max - min),
                                        });
                                    }
                                    else {

                                        this.set({
                                            [key]: val + (max - min),
                                        });
                                    }
                                    break; 
                            }
                        }
                    }
                }
            }
        }
        else this.performDeltaChecks = true;
    };

// `setDeltaValues`
// Update the artefact's `delta` object in a more intelligent way. The function accepts an object argument containing a set of instructions which will be interpreted and applied to the delat object.
// ```
// // Original delta object:
// artefact.delta: {
//     width: 50,
//     height: '20%',
//     scale: 2,
// }
//
// // Function argument object to be applied to the delta object:
// {
//     width: 'add:20',
//     height: 'multiply:0.8',
//     scale: 'remove',
//     roll: 'newNumber:45',
// }
//
// // Result of applying the argument to the delta object:
// artefact.delta: {
//     width: 70,
//     height: '16%',
//     roll: 45,
// }
// ```
    P.setDeltaValues = function (items = Ωempty) {

        const delta = this.delta,
            keys = _keys(items),
            keysLen = keys.length;

        let i, key, item, action, val, old

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            item = items[key];
            old = delta[key];

            if (!item.includes(SEPARATOR)) {
                action = item;
                val = false;
            }
            else {
                [action, val] = item.split(SEPARATOR);
            }

            switch (action) {

                case NEWSTRING :
                    if (val != null) delta[key] = val;
                    break;

                case NEWNUMBER :
                    if (val != null) delta[key] = parseFloat(val);
                    break;

                case REMOVE :
                    delete delta[key];
                    break;

                case UPDATE :
                    if (val != null) delta[key] = (old.substring) ? val : parseFloat(val);
                    break;

                case REVERSE :
                    if (old.substring) val = -(parseFloat(old)) + PC;
                    else val = -old;
                    delta[key] = val;
                    break;

                case ADD :
                    if (old.substring) val = (parseFloat(old) + parseFloat(val)) + PC;
                    else val += old;
                    delta[key] = val;
                    break;

                case MULTIPLY :
                    if (old.substring) val = (parseFloat(old) * parseFloat(val)) + PC;
                    else val *= old;
                    delta[key] = val;
                    break;
            }
        }
        return this;
    };
};
