// # Pivot mixin
// This mixin defines the attributes and functionality required by an artefact so that it can position and rotate itself using values set in another artefact.


// #### Imports
import { artefact, asset } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, isa_boolean, Ωempty } from '../core/utilities.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __pivot__ - reference artefact object. Can also be set using the artefact's name-String.
        pivot: '',

// __pivotCorner__ - Element artefacts allow other artefacts to use their corner positions as pivots, by setting this attribute to `topLeft`, `topRight`, `bottomRight` or `bottomLeft`; default is `''` to use the Element's start coordinate.
        pivotCorner: '',  

// __pivotPin__ - Polyline entitys are composed of a set of pin coordinates with the start being pin[0]; can reference other pins by setting this attribute to the appropriate index value (for example, the second pin will be pin[1]).
        pivotPin: 0,

// __addPivotHandle__, __addPivotOffset__, __addPivotRotation__ - Boolean flags. When set, the artifact will add its own values to the reference artefact's values, rather than use them as replacement values.
        addPivotHandle: false,
        addPivotOffset: true,
        addPivotRotation: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);
    mergeOver(P, defaultAttributes);


// #### Packet management
    P.packetObjects = pushUnique(P.packetObjects, ['pivot']);


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters,
        D = P.deltaSetters;


// #### Prototype functions

// __pivot__
    S.pivot = function (item) {

        if (isa_boolean(item) && !item) {

            this.pivot = null;

            if (this.lockTo[0] === 'pivot') this.lockTo[0] = 'start';
            if (this.lockTo[1] === 'pivot') this.lockTo[1] = 'start';

            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
        else {

            let oldPivot = this.pivot,
                name = this.name;

            let newPivot = (item.substring) ? artefact[item] : item;

            if (!newPivot) {

                newPivot = asset[item];

                if (newPivot && newPivot.type !== 'Cell') newPivot = false;
            }

            if (newPivot && newPivot.name) {

                if (oldPivot && oldPivot.name !== newPivot.name) removeItem(oldPivot.pivoted, name);

                pushUnique(newPivot.pivoted, name);

                this.pivot = newPivot;
                this.dirtyStampPositions = true;
                this.dirtyStampHandlePositions = true;
            }
        }
    };


// __pivotCorner__
    P.pivotCorners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    S.pivotCorner = function (item) {

        if (this.pivotCorners.indexOf(item) >= 0) this.pivotCorner = item;
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

        this.pivoted.forEach(name => {

            let instance = artefact[name];

            if (!instance) {

                instance = asset[name];

                if (!instance || instance.type !== 'Cell') instance = false;
            }

            if (instance) {

                instance.dirtyStart = true;
                if (instance.addPivotHandle) instance.dirtyHandle = true;
                if (instance.addPivotOffset) instance.dirtyOffset = true;
                if (instance.addPivotRotation) instance.dirtyRotation = true;

                if (instance.type === 'Polyline') instance.dirtyPins = true;
                else if (instance.type === 'Line' || instance.type === 'Quadratic' || instance.type === 'Bezier') instance.dirtyPins.push(this.name);
            }
        }, this);
    };
};
