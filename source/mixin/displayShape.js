// # Display shape mixin
// This mixin defines additional attributes and functions for Stack and Canvas artefacts, in particular adding hooks for functions that will be automatically invoked when the artefact's dimensions update.


// #### Imports
import { mergeOver, pushUnique, λnull, isa_obj, isa_number, isa_fn } from '../core/utilities.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

        breakToBanner: 3,
        breakToLandscape: 1.5,
        breakToPortrait: 0.65,
        breakToSkyscraper: 0.35,

        actionBannerShape: null,
        actionLandscapeShape: null,
        actionRectangleShape: null,
        actionPortraitShape: null,
        actionSkyscraperShape: null,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);
    mergeOver(P, defaultAttributes);


// #### Packet management
    P.packetFunctions = pushUnique(P.packetFunctions, ['actionBannerShape', 'actionLandscapeShape', 'actionRectangleShape', 'actionPortraitShape', 'actionSkyscraperShape']);


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    let G = P.getters,
        S = P.setters;

    G.displayShape = function () {

        return this.currentDisplayShape;
    };

    G.displayShapeBreakpoints = function () {

        return {
            breakToBanner: this.breakToBanner,
            breakToLandscape: this.breakToLandscape,
            breakToPortrait: this.breakToPortrait,
            breakToSkyscraper: this.breakToSkyscraper,
        };
    };

    S.displayShapeBreakpoints = function (items = {}) {

        for (let [key, val] of Object.entries(items)) {

            if (isa_number(val)) {

                switch (key) {

                    case 'breakToBanner' :
                        this.breakToBanner = val;
                        break;

                    case 'breakToLandscape' :
                        this.breakToLandscape = val;
                        break;

                    case 'breakToPortrait' :
                        this.breakToPortrait = val;
                        break;

                    case 'breakToSkyscraper' :
                        this.breakToSkyscraper = val;
                        break;
                }
            }
        }
        this.dirtyDisplayShape = true;
    };
    P.setDisplayShapeBreakpoints = S.displayShapeBreakpoints;

    S.breakToBanner = function (item) {

        if (isa_number(item)) this.breakToBanner = item;
        this.dirtyDisplayShape = true;
    };

    S.breakToLandscape = function (item) {

        if (isa_number(item)) this.breakToLandscape = item;
        this.dirtyDisplayShape = true;
    };

    S.breakToPortrait = function (item) {

        if (isa_number(item)) this.breakToPortrait = item;
        this.dirtyDisplayShape = true;
    };

    S.breakToSkyscraper = function (item) {

        if (isa_number(item)) this.breakToSkyscraper = item;
        this.dirtyDisplayShape = true;
    };

    S.actionBannerShape = function (item) {

        if (isa_fn(item)) this.actionBannerShape = item;
        this.dirtyDisplayShape = true;
    };
    P.setActionBannerShape = S.actionBannerShape;

    S.actionLandscapeShape = function (item) {

        if (isa_fn(item)) this.actionLandscapeShape = item;
        this.dirtyDisplayShape = true;
    };
    P.setActionLandscapeShape = S.actionLandscapeShape;

    S.actionRectangleShape = function (item) {

        if (isa_fn(item)) this.actionRectangleShape = item;
        this.dirtyDisplayShape = true;
    };
    P.setActionRectangleShape = S.actionRectangleShape;

    S.actionPortraitShape = function (item) {

        if (isa_fn(item)) this.actionPortraitShape = item;
        this.dirtyDisplayShape = true;
    };
    P.setActionPortraitShape = S.actionPortraitShape;

    S.actionSkyscraperShape = function (item) {

        if (isa_fn(item)) this.actionSkyscraperShape = item;
        this.dirtyDisplayShape = true;
    };
    P.setActionSkyscraperShape = S.actionSkyscraperShape;


// #### Prototype functions


    P.initializeDisplayShapeActions = function () {

        this.actionBannerShape = λnull;
        this.actionLandscapeShape = λnull;
        this.actionRectangleShape = λnull;
        this.actionPortraitShape = λnull;
        this.actionSkyscraperShape = λnull;

        this.currentDisplayShape = '';
        this.dirtyDisplayShape = true;
    };
 

// #### Prototype functions


    P.cleanDisplayShape = function () {

        this.dirtyDisplayShape = false;

        let [width, height] = this.currentDimensions;

        if (width > 0 && height > 0) {

            let ratio = width / height,
                current = this.currentDisplayShape,
                banner = this.breakToBanner,
                landscape = this.breakToLandscape,
                portrait = this.breakToPortrait,
                skyscraper = this.breakToSkyscraper;

            if (ratio > banner) {

                if (current !== 'banner') {

                    this.currentDisplayShape = 'banner';
                    this.actionBannerShape();
                    return true;
                }
                return false;
            }
            else if (ratio > landscape) {

                if (current !== 'landscape') {

                    this.currentDisplayShape = 'landscape';
                    this.actionLandscapeShape();
                    return true;
                }
                return false;
            }
            else if (ratio < skyscraper) {
                
                if (current !== 'skyscraper') {

                    this.currentDisplayShape = 'skyscraper';
                    this.actionSkyscraperShape();
                    return true;
                }
                return false;
            }
            else if (ratio < portrait) {
                
                if (current !== 'portrait') {

                    this.currentDisplayShape = 'portrait';
                    this.actionPortraitShape();
                    return true;
                }
                return false;
            }
            else {

                if (current !== 'rectangle') {

                    this.currentDisplayShape = 'rectangle';
                    this.actionRectangleShape();
                    return true;
                }
                return false;
            }
        }
        else {

            this.dirtyDisplayShape = true;
            return false;
        }
    };

    P.updateDisplayShape = function () {

        this.currentDisplayShape = '';
        this.dirtyDisplayShape = true;
    };


// Return the prototype
    return P;
};
