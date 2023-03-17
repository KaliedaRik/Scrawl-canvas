// # Display shape mixin
// This mixin defines additional attributes and functions for Stack and Canvas artefacts, in particular adding hooks for functions that will be automatically invoked when the artefact's dimensions update.

// #### Demos:
// + [Canvas-034](../../demo/canvas-034.html) - Determine the displayed shape of the visible canvas; react to changes in the displayed shape
// + [DOM-016](../../demo/dom-016.html) - Determine the displayed shape of the visible stack; react to changes in the displayed shape


// #### Imports
import { mergeOver, pushUnique, λnull, isa_obj, isa_number, isa_fn, Ωempty } from '../core/utilities.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

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

// Scrawl-canvas also recognises five areas, again separated by four breakpoints: 
// + `smallest`
// + `smaller`
// + `regular`
// + `larger`
// + `largest`
//
// The values assigned to the breakpoints are Float numbers for the displayed Canvas element's pixel area (`width * height`).
// + Useful for dynamic Cells - for example Canvas base Cells, where the canvas `baseMatchesCanvasDimensions` flag has been set to `true`; in these situations we can use the area breakpoints to adjust entity dimensions and scales, and text font sizes, to better match the changed environment.
// + The other option - to set the base Cell's dimensions to known, static values and set the canvas's `fit` attribute - suffers from image degredation when the canvas and its base cell's dimensions are excessively different. 
        breakToSmallest: 20000,
        breakToSmaller: 80000,
        breakToLarger: 180000,
        breakToLargest: 320000,

        actionSmallestArea: null,
        actionSmallerArea: null,
        actionRegularArea: null,
        actionLargerArea: null,
        actionLargestArea: null,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);
    mergeOver(P, defaultAttributes);


// #### Packet management
    P.packetFunctions = pushUnique(P.packetFunctions, ['actionBannerShape', 'actionLandscapeShape', 'actionRectangleShape', 'actionPortraitShape', 'actionSkyscraperShape', 'actionSmallestArea', 'actionSmallerArea', 'actionRegularArea', 'actionLargerArea', 'actionLargestArea']);

    
// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const G = P.getters,
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
            breakToSmallest: this.breakToSmallest,
            breakToSmaller: this.breakToSmaller,
            breakToLarger: this.breakToLarger,
            breakToLargest: this.breakToLargest,
        };
    };

// Set __displayShapeBreakpoints__ - breakpoints can be set individually, or alternatively they can be supplied in an object keyed to this attribute
    S.displayShapeBreakpoints = function (items = Ωempty) {

        for (const [key, val] of Object.entries(items)) {

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

                    case 'breakToSmallest' :
                        this.breakToSmallest = val;
                        break;

                    case 'breakToSmaller' :
                        this.breakToSmaller = val;
                        break;

                    case 'breakToLarger' :
                        this.breakToLarger = val;
                        break;

                    case 'breakToLargest' :
                        this.breakToLargest = val;
                        break;
                }
            }
        }
        this.dirtyDisplayShape = true;
        this.dirtyDisplayArea = true;
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

// Set __breakToSmallest__ - the breakpoint between `smaller` and `smallest` display shapes
    S.breakToSmallest = function (item) {

        if (isa_number(item)) this.breakToSmallest = item;
        this.dirtyDisplayArea = true;
    };

// Set __breakToSmaller__ - the breakpoint between `regular` and `smaller` display shapes
    S.breakToSmaller = function (item) {

        if (isa_number(item)) this.breakToSmaller = item;
        this.dirtyDisplayArea = true;
    };

// Set __breakToLarger__ - the breakpoint between `regular` and `larger` display shapes
    S.breakToLarger = function (item) {

        if (isa_number(item)) this.breakToLarger = item;
        this.dirtyDisplayArea = true;
    };

// Set __breakToLargest__ - the breakpoint between `larger` and `largest` display shapes
    S.breakToLargest = function (item) {

        if (isa_number(item)) this.breakToLargest = item;
        this.dirtyDisplayArea = true;
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

// Set __actionSmallestArea__ - must be a Function
    S.actionSmallestArea = function (item) {

        if (isa_fn(item)) this.actionSmallestArea = item;
        this.dirtyDisplayArea = true;
    };
// `setActionSmallestArea` - an alternative mechanism to set the __actionSmallestArea__ function, beyond the normal `set` functionality
    P.setActionSmallestArea = S.actionSmallestArea;

// Set __actionSmallerArea__ - must be a Function
    S.actionSmallerArea = function (item) {

        if (isa_fn(item)) this.actionSmallerArea = item;
        this.dirtyDisplayArea = true;
    };
// `setActionSmallerArea` - an alternative mechanism to set the __actionSmallerArea__ function, beyond the normal `set` functionality
    P.setActionSmallerArea = S.actionSmallerArea;

// Set __actionRegularArea__ - must be a Function
    S.actionRegularArea = function (item) {

        if (isa_fn(item)) this.actionRegularArea = item;
        this.dirtyDisplayArea = true;
    };
// `setActionRegularArea` - an alternative mechanism to set the __actionRegularArea__ function, beyond the normal `set` functionality
    P.setActionRegularArea = S.actionRegularArea;

// Set __actionLargerArea__ - must be a Function
    S.actionLargerArea = function (item) {

        if (isa_fn(item)) this.actionLargerArea = item;
        this.dirtyDisplayArea = true;
    };
// `setActionLargerArea` - an alternative mechanism to set the __actionLargerArea__ function, beyond the normal `set` functionality
    P.setActionLargerArea = S.actionLargerArea;

// Set __actionLargestArea__ - must be a Function
    S.actionLargestArea = function (item) {

        if (isa_fn(item)) this.actionLargestArea = item;
        this.dirtyDisplayArea = true;
    };
// `setActionLargestArea` - an alternative mechanism to set the __actionLargestArea__ function, beyond the normal `set` functionality
    P.setActionLargestArea = S.actionLargestArea;


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

        this.actionSmallestArea = λnull;
        this.actionSmallerArea = λnull;
        this.actionRegularArea = λnull;
        this.actionLargerArea = λnull;
        this.actionLargestArea = λnull;

        this.currentDisplayArea = '';
        this.dirtyDisplayArea = true;
    };
 
// `cleanDisplayShape` - internal function; replaces the function defined in the dom.js mixin, invoked when required as part of the DOM artefact `prestamp` functionality
    P.cleanDisplayShape = function () {

        this.dirtyDisplayShape = false;

        const [width, height] = this.currentDimensions;

        if (width > 0 && height > 0) {

            const ratio = width / height,
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

// `cleanDisplayArea` - internal function; replaces the function defined in the dom.js mixin, invoked when required as part of the DOM artefact `prestamp` functionality
// + Note that `cleanDisplayArea` fires before `cleanDisplayShape`!
    P.cleanDisplayArea = function () {

        this.dirtyDisplayArea = false;

        const [width, height] = this.currentDimensions;

        if (width > 0 && height > 0) {

            const area = width * height,
                current = this.currentDisplayArea,
                largest = this.breakToLargest,
                larger = this.breakToLarger,
                smaller = this.breakToSmaller,
                smallest = this.breakToSmallest;

            if (area > largest) {

                if (current !== 'largest') {

                    this.currentDisplayArea = 'largest';
                    this.actionLargestArea();
                    return true;
                }
                return false;
            }
            else if (area > larger) {

                if (current !== 'larger') {

                    this.currentDisplayArea = 'larger';
                    this.actionLargerArea();
                    return true;
                }
                return false;
            }
            else if (area < smallest) {
                
                if (current !== 'smallest') {

                    this.currentDisplayArea = 'smallest';
                    this.actionSmallestArea();
                    return true;
                }
                return false;
            }
            else if (area < smaller) {
                
                if (current !== 'smaller') {

                    this.currentDisplayArea = 'smaller';
                    this.actionSmallerArea();
                    return true;
                }
                return false;
            }
            else {

                if (current !== 'regular') {

                    this.currentDisplayArea = 'regular';
                    this.actionRegularArea();
                    return true;
                }
                return false;
            }
        }
        else {

            this.dirtyDisplayArea = true;
            return false;
        }
    };

// `updateDisplayShape` - use this function to force the Canvas or Stack artefact to re-evaluate its current display shape, and invoke the action hook function associated with that shape.
    P.updateDisplayShape = function () {

        this.currentDisplayShape = '';
        this.dirtyDisplayShape = true;
    };

// `updateDisplayArea` - use this function to force the Canvas or Stack artefact to re-evaluate its current display area, and invoke the action hook function associated with that area.
    P.updateDisplayArea = function () {

        this.currentDisplayArea = '';
        this.dirtyDisplayArea = true;
    };

// `updateDisplay` - perform update for both display shape and area.
    P.updateDisplay = function () {

        this.updateDisplayShape();
        this.updateDisplayArea();
    };


// Return the prototype
    return P;
};
