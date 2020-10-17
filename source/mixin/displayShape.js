// # Display shape mixin
// This mixin defines additional attributes and functions for Stack and Canvas artefacts, in particular adding hooks for functions that will be automatically invoked when the artefact's dimensions update.

// #### Demos:
// + [Canvas-034](../../demo/canvas-034.html) - Determine the displayed shape of the visible canvas; react to changes in the displayed shape
// + [DOM-016](../../demo/dom-016.html) - Determine the displayed shape of the visible stack; react to changes in the displayed shape


// #### Imports
import { mergeOver, pushUnique, λnull, isa_obj, isa_number, isa_fn } from '../core/utilities.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

// Scrawl-canvas recognises five shapes, separated by four breakpoints: 
// + `banner`
// + `landscape`
// + `rectangle`
// + `portrait`
// + `skyscraper`
//
// The values assigned to the breakpoints are Float numbers for the displayed Canvas element's width/height ratio - the value `3` represents the case where the width value is three times __more__ than the height value, while `0.35` represents a width (roughly) 3 times __less__ than the height.
// 
// We can set a Canvas artefact's breakpoints in one go using the dedicated `setDisplayShapeBreakpoints()` function, as below. Alternatively we can use the regular `set()` function, supplying the attributes `breakToBanner`, `breakToLandscape`, `breakToPortrait` and `breakToSkyscraper` as required. The values given here are the default values for Canvas artefacts.
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

// Get __displayShape__ - returns the current display shape for the Canvas or Stack artefact. Returns a string whose value can be one of `banner`, `landscape`, `rectangle`, `portrait`, or `skyscraper`.
    G.displayShape = function () {

        return this.currentDisplayShape;
    };

// Get __displayShapeBreakpoints__ - returns an object with the current Number values for each of the breakpoint attributes.
    G.displayShapeBreakpoints = function () {

        return {
            breakToBanner: this.breakToBanner,
            breakToLandscape: this.breakToLandscape,
            breakToPortrait: this.breakToPortrait,
            breakToSkyscraper: this.breakToSkyscraper,
        };
    };

// Set __displayShapeBreakpoints__ - breakpoints can be set individually, or alternatively they can be supplied in an object keyed to this attribute
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
// `setDisplayShapeBreakpoints` - an alternative mechanism to set breakpoints beyond the normal `set` function
    P.setDisplayShapeBreakpoints = S.displayShapeBreakpoints;

// Set __breakToBanner__ - the breakpoint between `landscape` and `banner` display shapes; value will generally be a number greater than `1`
    S.breakToBanner = function (item) {

        if (isa_number(item)) this.breakToBanner = item;
        this.dirtyDisplayShape = true;
    };

// Set __breakToLandscape__ - the breakpoint between `landscape` and `rectangle` display shapes; value will generally be a number greater than `1`
    S.breakToLandscape = function (item) {

        if (isa_number(item)) this.breakToLandscape = item;
        this.dirtyDisplayShape = true;
    };

// Set __breakToPortrait__ - the breakpoint between `portrait` and `rectangle` display shapes; value will generally be a number greater than `0` and less than `1`
    S.breakToPortrait = function (item) {

        if (isa_number(item)) this.breakToPortrait = item;
        this.dirtyDisplayShape = true;
    };

// Set __breakToSkyscraper__ - the breakpoint between `portrait` and `skyscraper` display shapes; value will generally be a number greater than `0` and less than `1`
    S.breakToSkyscraper = function (item) {

        if (isa_number(item)) this.breakToSkyscraper = item;
        this.dirtyDisplayShape = true;
    };

// Each display shape has an associated hook function (by default a function that does nothing) which Scrawl-canvas will run each time it detects that the Canvas display shape has changed to that shape. We can replace these null-functions with our own; this allows us to configure the scene/animation to accommodate different display shapes, thus making the code reusable in a range of different web page environments.
//
// We can set/update these functions at any time using the normal `set()` function. We can also set/update the functions using dedicated `setAction???Shape()` functions:

// Set __actionBannerShape__ - must be a Function
    S.actionBannerShape = function (item) {

        if (isa_fn(item)) this.actionBannerShape = item;
        this.dirtyDisplayShape = true;
    };
// `setActionBannerShape` - an alternative mechanism to set the __actionBannerShape__ function, beyond the normal `set` functionality
    P.setActionBannerShape = S.actionBannerShape;

// Set __actionLandscapeShape__ - must be a Function
    S.actionLandscapeShape = function (item) {

        if (isa_fn(item)) this.actionLandscapeShape = item;
        this.dirtyDisplayShape = true;
    };
// `setActionLandscapeShape` - an alternative mechanism to set the __actionLandscapeShape__ function, beyond the normal `set` functionality
    P.setActionLandscapeShape = S.actionLandscapeShape;

// Set __actionRectangleShape__ - must be a Function
    S.actionRectangleShape = function (item) {

        if (isa_fn(item)) this.actionRectangleShape = item;
        this.dirtyDisplayShape = true;
    };
// `setActionRectangleShape` - an alternative mechanism to set the __actionRectangleShape__ function, beyond the normal `set` functionality
    P.setActionRectangleShape = S.actionRectangleShape;

// Set __actionPortraitShape__ - must be a Function
    S.actionPortraitShape = function (item) {

        if (isa_fn(item)) this.actionPortraitShape = item;
        this.dirtyDisplayShape = true;
    };
// `setActionPortraitShape` - an alternative mechanism to set the __actionPortraitShape__ function, beyond the normal `set` functionality
    P.setActionPortraitShape = S.actionPortraitShape;

// Set __actionSkyscraperShape__ - must be a Function
    S.actionSkyscraperShape = function (item) {

        if (isa_fn(item)) this.actionSkyscraperShape = item;
        this.dirtyDisplayShape = true;
    };
// `setActionSkyscraperShape` - an alternative mechanism to set the __actionSkyscraperShape__ function, beyond the normal `set` functionality
    P.setActionSkyscraperShape = S.actionSkyscraperShape;


// #### Prototype functions

// `initializeDisplayShapeActions` - internal function; called by the Canvas and Stack artefact constructors
    P.initializeDisplayShapeActions = function () {

        this.actionBannerShape = λnull;
        this.actionLandscapeShape = λnull;
        this.actionRectangleShape = λnull;
        this.actionPortraitShape = λnull;
        this.actionSkyscraperShape = λnull;

        this.currentDisplayShape = '';
        this.dirtyDisplayShape = true;
    };
 
// `cleanDisplayShape` - internal function; replaces the function defined in the dom.js mixin, invoked when required as part of the DOM artefact `prestamp` functionality
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

// `updateDisplayShape` - use this function to force the Canvas or Stack artefact to re-evaluate its current display shape, and invoke the action hook function associated with that shape.
    P.updateDisplayShape = function () {

        this.currentDisplayShape = '';
        this.dirtyDisplayShape = true;
    };


// Return the prototype
    return P;
};
