// # Mimic mixin
// This mixin defines additional attributes and functions to allow an artefact to use a range of attribute values set in another artefact.


// #### Imports
import { artefact, asset } from '../core/library.js';

import { isa_boolean, mergeOver, pushUnique, removeItem, Ωempty } from '../core/utilities.js';

import { MIMIC, START, T_CELL, ZERO_STR } from '../core/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __mimic__ - reference artefact object. Can also be set using the artefact's name-String.
        mimic: ZERO_STR,

// __useMimic...__ - a set of Boolean flags determining which attributes should be taken from the mimic reference artefact. By default, the artefact will use its own attribute values; setting any of these flags changes the behaviour for that attribute.
        useMimicDimensions: false,
        useMimicScale: false,
        useMimicStart: false,
        useMimicHandle: false,
        useMimicOffset: false,
        useMimicRotation: false,
        useMimicFlip: false,

// __addOwn...ToMimic__ - a set of Boolean flags determining which mimic attributes should be added to this artefact's own attribute values. By default, none are added; setting any of these flags changes the behaviour for that attribute.
        addOwnDimensionsToMimic: false,
        addOwnScaleToMimic: false,
        addOwnStartToMimic: false,
        addOwnHandleToMimic: false,
        addOwnOffsetToMimic: false,
        addOwnRotationToMimic: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);
    mergeOver(P, defaultAttributes);


// #### Packet management
    P.packetObjects = pushUnique(P.packetObjects, [MIMIC]);


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters,
        D = P.deltaSetters;


// #### Prototype functions

// __mimic__
    S.mimic = function (item) {

        if (isa_boolean(item) && !item) {

            this.mimic = null;

            if (this.lockTo[0] === MIMIC) this.lockTo[0] = START;
            if (this.lockTo[1] === MIMIC) this.lockTo[1] = START;

            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
        else {

            let oldMimic = this.mimic,
                name = this.name;

            let newMimic = (item.substring) ? artefact[item] : item;
            
            if (!newMimic) {

                newMimic = asset[item];

                if (newMimic && newMimic.type !== T_CELL) newMimic = false;
            }

            if (newMimic && newMimic.name) {

                if (oldMimic && oldMimic.name !== newMimic.name) removeItem(oldMimic.mimicked, name);

                pushUnique(newMimic.mimicked, name);

                this.mimic = newMimic;

                if (this.useMimicDimensions) this.dirtyDimensions = true;
                if (this.useMimicScale) this.dirtyScale = true;
                if (this.useMimicStart) this.dirtyStart = true;
                if (this.useMimicHandle) this.dirtyHandle = true;
                if (this.useMimicOffset) this.dirtyOffset = true;
                if (this.useMimicRotation) this.dirtyRotation = true;
            }
        }
    };


// __useMimicDimensions__, __useMimicScale__, __useMimicStart__, __useMimicHandle__, __useMimicOffset__, __useMimicRotation__
    S.useMimicDimensions = function (item) {

        this.useMimicDimensions = item;
        this.dirtyDimensions = true;
    };
    S.useMimicScale = function (item) {

        this.useMimicScale = item;
        this.dirtyScale = true;
    };
    S.useMimicStart = function (item) {

        this.useMimicStart = item;
        this.dirtyStart = true;
    };
    S.useMimicHandle = function (item) {

        this.useMimicHandle = item;
        this.dirtyHandle = true;
    };
    S.useMimicOffset = function (item) {

        this.useMimicOffset = item;
        this.dirtyOffset = true;
    };
    S.useMimicRotation = function (item) {

        this.useMimicRotation = item;
        this.dirtyRotation = true;
    };

// __addOwnDimensionsToMimic__, __addOwnScaleToMimic__, __addOwnStartToMimic__, __addOwnHandleToMimic__, __addOwnOffsetToMimic__, __addOwnRotationToMimic__
    S.addOwnDimensionsToMimic = function (item) {

        this.addOwnDimensionsToMimic = item;
        this.dirtyDimensions = true;
    };
    S.addOwnScaleToMimic = function (item) {

        this.addOwnScaleToMimic = item;
        this.dirtyScale = true;
    };
    S.addOwnStartToMimic = function (item) {

        this.addOwnStartToMimic = item;
        this.dirtyStart = true;
    };
    S.addOwnHandleToMimic = function (item) {

        this.addOwnHandleToMimic = item;
        this.dirtyHandle = true;
    };
    S.addOwnOffsetToMimic = function (item) {

        this.addOwnOffsetToMimic = item;
        this.dirtyOffset = true;
    };
    S.addOwnRotationToMimic = function (item) {

        this.addOwnRotationToMimic = item;
        this.dirtyRotation = true;
    };
 

// #### Prototype functions

// `updateMimicSubscribers`
    P.updateMimicSubscribers = function () {

        let DMH = this.dirtyMimicHandle;
        let DMO = this.dirtyMimicOffset;
        let DMR = this.dirtyMimicRotation;
        let DMS = this.dirtyMimicScale;
        let DMD = this.dirtyMimicDimensions;

        this.mimicked.forEach(name => {

            let instance = artefact[name];

            if (!instance) {

                instance = asset[name];

                if (!instance || instance.type !== T_CELL) instance = false;
            }

            if (instance) {

                if (instance.useMimicStart) instance.dirtyStart = true;
                if (DMH && instance.useMimicHandle) instance.dirtyHandle = true;
                if (DMO && instance.useMimicOffset) instance.dirtyOffset = true;
                if (DMR && instance.useMimicRotation) instance.dirtyRotation = true;
                if (DMS && instance.useMimicScale) instance.dirtyScale = true;
                if (DMD && instance.useMimicDimensions) instance.dirtyDimensions = true;
            }
        });

        this.dirtyMimicHandle = false;
        this.dirtyMimicOffset = false;
        this.dirtyMimicRotation = false;
        this.dirtyMimicScale = false;
        this.dirtyMimicDimensions = false;
    };
};
