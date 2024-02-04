// # Pivot mixin
// This mixin defines the attributes and functionality required by an artefact so that it can position and rotate itself using values set in another artefact.


// #### Imports
import { artefact, asset } from '../core/library.js';

import { isa_boolean, mergeOver, pushUnique, removeItem, Ωempty } from '../helper/utilities.js';

import { CORNER_LABELS, PIVOT, START, T_BEZIER, T_CELL, T_LINE, T_POLYLINE, T_QUADRATIC, ZERO_STR } from '../helper/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __pivot__ - reference artefact object. Can also be set using the artefact's name-String.
        pivot: ZERO_STR,

// __pivotCorner__ - Element artefacts allow other artefacts to use their corner positions as pivots, by setting this attribute to `topLeft`, `topRight`, `bottomRight` or `bottomLeft`; default is `''` to use the Element's start coordinate.
        pivotCorner: ZERO_STR,

// __pivotPin__ - Polyline entitys are composed of a set of pin coordinates with the start being pin[0]; can reference other pins by setting this attribute to the appropriate index value (for example, the second pin will be pin[1]).
        pivotPin: 0,

// __addPivotHandle__, __addPivotOffset__, __addPivotRotation__ - Boolean flags. When set, the artifact will add its own values to the reference artefact's values, rather than use them as replacement values.
        addPivotHandle: false,
        addPivotOffset: true,
        addPivotRotation: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.packetObjects = pushUnique(P.packetObjects, ['pivot']);


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const S = P.setters;


// #### Prototype functions

// __pivot__
    S.pivot = function (item) {

        if (isa_boolean(item) && !item) {

            this.pivot = null;

            if (this.lockTo[0] === PIVOT) this.lockTo[0] = START;
            if (this.lockTo[1] === PIVOT) this.lockTo[1] = START;

            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
        else {

            const oldPivot = this.pivot,
                name = this.name;

            let newPivot = (item.substring) ? artefact[item] : item;

            if (!newPivot) {

                newPivot = asset[item];

                if (newPivot && newPivot.type != T_CELL) newPivot = false;
            }

            if (newPivot && newPivot.name) {

                if (oldPivot && oldPivot.name != newPivot.name) removeItem(oldPivot.pivoted, name);

                pushUnique(newPivot.pivoted, name);

                this.pivot = newPivot;
                this.dirtyStampPositions = true;
                this.dirtyStampHandlePositions = true;
            }
        }
    };

// __pivotCorner__
    S.pivotCorner = function (item) {

        if (CORNER_LABELS.includes(item)) this.pivotCorner = item;
    };


// __addPivotHandle__, __addPivotOffset__, __addPivotRotation__
    S.addPivotHandle = function (item) {

        this.addPivotHandle = item;
        this.dirtyHandle = true;
    };
    S.addPivotOffset = function (item) {

        this.addPivotOffset = item;
        this.dirtyOffset = true;
    };
    S.addPivotRotation = function (item) {

        this.addPivotRotation = item;
        this.dirtyRotation = true;
    };


// #### Prototype functions

// `updatePivotSubscribers`
    P.updatePivotSubscribers = function () {

        let art;

        this.pivoted.forEach(name => {

            art = artefact[name];

            if (!art) {

                art = asset[name];

                if (!art || art.type !== T_CELL) art = false;
            }

            if (art) {

                art.dirtyStart = true;
                if (art.addPivotHandle) art.dirtyHandle = true;
                if (art.addPivotOffset) art.dirtyOffset = true;
                if (art.addPivotRotation) art.dirtyRotation = true;

                if (art.type == T_POLYLINE) art.dirtyPins = true;
                else if (art.type == T_LINE || art.type == T_QUADRATIC || art.type == T_BEZIER) art.dirtyPins.push(this.name);
            }
        }, this);
    };
}
