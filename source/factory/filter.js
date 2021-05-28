// # Filter factory
// Filters take in an image representation of an [entity](../mixin/entity.html), [Group](./group.html) of entitys or a [Cell](./cell.html) display and, by manipulating the image's data, return an updated image which replaces those entitys or Cell in the final output display.
//
// Scrawl-canvas defines its filters in __Filter objects__, detailed in this module. The functionality to make use of these objects is coded up in the [filter mixin](../mixin/filter.html), which is used by the Cell, Group and all entity factories.
//
// The Scrawl-canvas filter engine implements a number of common filter algorithms. These algorithms - __called filter actions__ - can be combined in a wide variety of ways, including the use of multiple pathways, to create complex filter results.
// 
// #### Filter engine actions
// `alpha-to-channels` - Copies the alpha channel value over to the selected value or, alternatively, sets that channels value to zero, or leaves the channel's value unchanged. Setting the appropriate "includeChannel" flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate "excludeChannel" flag will set that channel's value to zero. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue`
// 
// `area-alpha` - Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to zero. Can be used to create horizontal or vertical bars, or chequerboard effects. Object attributes: `action, lineIn, lineOut, opacity, tileWidth, tileHeight, offsetX, offsetY, gutterWidth, gutterHeight, areaAlphaLevels`
// 
// `average-channels` - Calculates an average value from each pixel's included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to 0. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue`
// 
// `binary` - Set the channel to either 0 or 255, depending on whether the channel value is below or above a given level. Level values are set using the "red", "green", "blue" and "alpha" arguments. Setting these values to 0 disables the action for that channel. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, alpha`
// 
// `blend` - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using various separable and non-separable blend modes (as defined by the W3C Compositing and Blending Level 1 recommendations. The blending method is determined by the String value supplied in the "blend" argument; permitted values are: 'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', and 'saturation'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments. Object attributes: `action, lineIn, lineOut, lineMix, opacity, blend, offsetX, offsetY`
// 
// `blur` - Performs a multi-loop, two-step 'horizontal-then-vertical averaging sweep' calculation across all pixels to create a blur effect. Note that this filter is expensive, thus much slower to complete compared to other filter effects. Object attributes: `action, lineIn, lineOut, opacity, radius, passes, processVertical, processHorizontal, includeRed, includeGreen, includeBlue, includeAlpha, step`
// 
// `channels-to-alpha` - Calculates an average value from each pixel's included channels and applies that value to the alpha channel. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue`
// 
// `chroma` - Using an array of 'range' arrays, determine whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. Each 'range' array comprises six Numbers representing [minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue] values. Object attributes: `action, lineIn, lineOut, opacity, ranges`
// 
// `clamp-channels` - Clamp each color channel to a range set by lowColor and highColor values. Object attributes: `action, lineIn, lineOut, opacity, lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue`
// 
// `colors-to-alpha` - Determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the "red", "green" and "blue" arguments. The sensitivity of the effect can be manipulated using the "transparentAt" and "opaqueAt" values, both of which lie in the range 0-1. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, opaqueAt, transparentAt`
// 
// `compose` - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using alpha compositing rules (as defined by Porter/Duff). The compositing method is determined by the String value supplied in the "compose" argument; permitted values are: 'destination-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'source-only', 'source-over' (default), 'source-in', 'source-out', 'source-atop', 'clear', 'xor', or 'lighter'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments. Object attributes: `action, lineIn, lineOut, lineMix, opacity, compose, offsetX, offsetY`
// 
// `displace` - Shift pixels around the image, based on the values supplied in a displacement process-image. Object attributes: `action, lineIn, lineOut, lineMix, opacity, channelX, channelY, scaleX, scaleY, transparentEdges, offsetX, offsetY`
// 
// `emboss` - A 3x3 matrix transform; the matrix weights are calculated internally from the values of two arguments: "strength", and "angle" - which is a value measured in degrees, with 0 degrees pointing to the right of the origin (along the positive x axis). Post-processing options include removing unchanged pixels, or setting then to mid-gray. The convenience method includes additional arguments which will add a choice of grayscale, then channel clamping, then blurring actions before passing the results to this emboss action. Object attributes: `action, lineIn, lineOut, opacity, strength, angle, tolerance, keepOnlyChangedAreas, postProcessResults`; pseudo-arguments for the convenience method include `useNaturalGrayscale, clamp, smoothing`
// 
// `flood` - Set all pixels to the channel values supplied in the "red", "green", "blue" and "alpha" arguments. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, alpha`
// 
// `grayscale` - For each pixel, averages the weighted color channels and applies the result across all the color channels. This gives a more realistic monochrome effect. Object attributes: `action, lineIn, lineOut, opacity`
// 
// `invert-channels` - For each pixel, subtracts its current channel values - when included - from 255. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, includeAlpha`
// 
// `lock-channels-to-levels` - Produces a posterize effect. Takes in four arguments - "red", "green", "blue" and "alpha" - each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, alpha`
// 
// `matrix` - Performs a matrix operation on each pixel's channels, calculating the new value using neighbouring pixel weighted values. Also known as a convolution matrix, kernel or mask operation. Note that this filter is expensive, thus much slower to complete compared to other filter effects. The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments. The weights to be applied need to be supplied in the "weights" argument - an Array listing the weights row-by-row starting from the top-left corner of the matrix. By default all color channels are included in the calculations while the alpha channel is excluded. The 'edgeDetect', 'emboss' and 'sharpen' convenience filter methods all use the matrix action, pre-setting the required weights. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, includeAlpha, width, height, offsetX, offsetY, weights`
// 
// `modulate-channels` - Multiplies each channel's value by the supplied argument value. A channel-argument's value of '0' will set that channel's value to zero; a value of '1' will leave the channel value unchanged. If the "saturation" flag is set to 'true' the calculation changes to start at the color range mid point. The 'brightness' and 'saturation' filters are special forms of the 'channels' filter which use a single "levels" argument to set all three color channel arguments to the same value. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, alpha, saturation`; pseudo-argument: `level`
// 
// `offset` - Offset the input image in the output image. Object attributes: `action, lineIn, lineOut, opacity, offsetRedX, offsetRedY, offsetGreenX, offsetGreenY, offsetBlueX, offsetBlueY, offsetAlphaX, offsetAlphaY; pseudo-argument: offsetX, offsetY`
// 
// `pixelate` - Pixelizes the input image by creating a grid of tiles across it and then averaging the color values of each pixel in a tile and setting its value to the average. Tile width and height, and their offset from the top left corner of the image, are set via the "tileWidth", "tileHeight", "offsetX" and "offsetY" arguments. Object attributes: `action, lineIn, lineOut, opacity, tileWidth, tileHeight, offsetX, offsetY, includeRed, includeGreen, includeBlue, includeAlpha`
// 
// `process-image` - Add an asset image to the filter process chain. The asset - the String name of the asset object - must be pre-loaded before it can be included in the filter. The "width" and "height" arguments are measured in integer Number pixels; the "copy" arguments can be either percentage Strings (relative to the asset's natural dimensions) or absolute Number values (in pixels). The "lineOut" argument is required - be aware that the filter action does not check for any pre-existing assets cached under this name and, if they exist, will overwrite them with this asset's data. Object attributes: `action, lineOut, asset, width, height, copyWidth, copyHeight, copyX, copyY`
// 
// `set-channel-to-level` - Sets the value of each pixel's included channel to the value supplied in the "level" argument. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, includeAlpha, level`
// 
// `step-channels` - Takes three divisor values - "red", "green", "blue". For each pixel, its color channel values are divided by the corresponding color divisor, floored to the integer value and then multiplied by the divisor. For example a divisor value of '50' applied to a channel value of '120' will give a result of '100'. The output is a form of posterization. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue`
// 
// `threshold` - Grayscales the input then, for each pixel, checks the color channel values against a "level" argument: pixels with channel values above the level value are assigned to the 'high' color; otherwise they are updated to the 'low' color. The "high" and "low" arguments are [red, green, blue] integer Number Arrays. The convenience function will accept the pseudo-attributes "highRed", "lowRed" etc in place of the "high" and "low" Arrays. Object attributes: `action, lineIn, lineOut, opacity, low, high; pseudo-arguments: lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue`
// 
// `tint-channels` - Has similarities to the SVG <feColorMatrix> filter element, but excludes the alpha channel from calculations. Rather than set a matrix, we set nine arguments to determine how the value of each color channel in a pixel will affect both itself and its fellow color channels. The 'sepia' convenience filter presets these values to create a sepia effect. Object attributes: `action, lineIn, lineOut, opacity, redInRed, redInGreen, redInBlue, greenInRed, greenInGreen, greenInBlue, blueInRed, blueInGreen, blueInBlue`
// 
// `user-defined-legacy` - Previous to Scrawl-canvas version 8.4.0, filters could be defined with an argument which passed a function string to a filter web worker, which the worker would then run against the source input image as-and-when required. This functionality has been removed from the new filter system. All such filters will now return the input image unchanged. Object attributes: action, lineIn, lineOut, opacity
//
// ```
// // Example: the following code creates a filter that applies a thick red border around the entitys 
// // it is applied to; if used on a group then it will outline the outside of the group's entitys, 
// // ignoring overlaps between entitys:
// scrawl.makeFilter({
//     name: 'redBorder',
//     actions: [
//         {
//             action: 'blur',
//             lineIn: 'source-alpha',
//             lineOut: 'shadow',
//             radius: 3,
//             passes: 2, 
//             includeRed: false, 
//             includeGreen: false, 
//             includeBlue: false, 
//             includeAlpha: true, 
//         },
//         {
//             action: 'binary',
//             lineIn: 'shadow',
//             lineOut: 'shadow',
//             alpha: 1, 
//         },
//         {
//             action: 'flood',
//             lineIn: 'shadow',
//             lineOut: 'red-flood',
//             red: 255,
//         },
//         {
//             action: 'compose',
//             lineIn: 'shadow',
//             lineMix: 'red-flood',
//             lineOut: 'colorized',
//             compose: 'destination-in',
//         },
//         {
//             action: 'compose',
//             lineIn: 'source',
//             lineMix: 'colorized',
//         }
//     ],
// });
// ```

// #### Demos:
// + [Canvas-007](../../demo/canvas-007.html) - Apply filters at the entity, group and cell level
// + [Canvas-020](../../demo/canvas-020.html) - Testing createImageFromXXX functionality
// + [Canvas-027](../../demo/canvas-027.html) - Video control and manipulation; chroma-based hit zone
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets; save and load a range of different entitys
// + [Filters-019](../../demo/filters-019.html) - Using a Noise asset with a displace filter


// #### Imports
import { constructors, cell, group, entity, asset } from '../core/library.js';
import { mergeOver, removeItem, λnull, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';


// #### Filter constructor
const Filter = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.actions = [];

    this.set(items);
    return this;
};


// #### Filter prototype
let P = Filter.prototype = Object.create(Object.prototype);
P.type = 'Filter';
P.lib = 'filter';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Filter attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + ___Note:__ unlike other Scrawl-canvas factory functions, the Filter factory does not set all its default attributes as part of its constructors. The reason for this is that these attributes are often specific to just one or a few filter actions or methods; not setting these defaults help save some object memory.
let defaultAttributes = {

    // ##### How the filter factory builds filters
    // Filter actions are defined in action objects - which are vanilla Javascript Objects which are collected together in the __actions__ array. Each action object is processed sequentially by the filter engine to produce the final output for that filter.
    actions: null,

    // The __method__ attribute is a String which, in legacy filters, determines the actions which that filter will take on the image. An entity, Group or Cell can include more than one filter object in its `filters` Array. 
    // + Filter factory invocations which include the method attribute in their argument object do not need to include an actions attribute; the factory will build the action objects for us.
    // + When using the method attribute, other attributes can be included alongside it. The filter factory will automatically transpose these attributes to the action object.
    // + The following Strings are valid methods: 'areaAlpha', 'binary', 'blend', 'blue', 'blur', 'brightness', 'channelLevels', 'channels', 'channelstep', 'channelsToAlpha', 'chroma', 'chromakey', 'clampChannels', 'compose', 'cyan', 'displace', 'edgeDetect',  'emboss', 'flood', 'gray', 'grayscale', 'green', 'image', 'invert', 'magenta', 'matrix', 'matrix5', 'notblue', 'notgreen', 'notred', 'offset', 'offsetChannels', 'pixelate', 'red', 'saturation', 'sepia', 'sharpen', 'threshold', 'tint', 'userDefined', 'yellow',
    method: '',

    // ##### How filters process data
    // The Scrawl-canvas filter engine can use ___multiple pathways___ to process a filter's Array of action objects. In essence, a filter action can store the results of its work in a named cache, which can then be used by other filter actions further down the line.
    // + When Scrawl-canvas applies filters to an entity, Group or Cell it will go through the entity's `filters` Array looking for any `process-image` actions; when it finds one it will add a snapshot of the associated asset's current image state to the filter object (thus Cell and Noise assets are naturally dynamic).
    // + Then the system sends all of the filter's action objects over to the filter engine, alongside a snapshot of the entity, Group or Cell to be processed.
    // + If the entity, Group or Cell is acting as a stencil (its `isStencil` flag has been set to true) then a snapshot of the background behind the entity/Group/Cell is sent instead of the entitys themselves.
    // + When the filter engine recieves the data packet, it stores the snapshot in its `source` cache, and replicates it into the `work` object.
    // + All filter actions require a __lineIn__ string which references a cached image or snapshot. If this is not supplied, then the action will process the data stored in the `work` object.
    // + Additional sources for the lineIn (or lineMix) data are `source`, which copies the original source image data and delivers it to the action; and `source-alpha` which copies the original source's alpha channel data to each of the color channels and delivers it to the action.
    // + Similarly all filter actions require a __lineOut__ which identifies the name of a cache in which the processed data can be stored. If this is not supplied, then the action will copy the processed data back into the `work` object
    // + Some filter actions - specifically `blend`, `compose` and `displace` - use two inputs, combining the data referenced by the __lineIn__ and __lineMix__ attribute into __lineOut__ cache or work object.
    // + When processing completes, the updated data held in the work object is returned by the filter engine, which Scrawl-canvas then uses to stamp the entity/Group/Cell into the display canvas.
    lineIn: '',
    lineMix: '',
    lineOut: '',

    // Every action includes an __opacity__ attribute which defines how much of the incoming image data (`lineIn`) and how much of the processed results gets included in the output data (`lineOut`)
    // + When set to `0`, the output consists entirely of input data
    // + When set to `1` (the default), the output consists entirely of processed data
    // + Values between these limits instruct the action to combine input and processed data proportionately in a linear fashion: a value of `0.7` leads to a result consisting of 30% input data and 70% processed data
    opacity: 1,


// ##### Other attributes used by various filters
// The attributes below are used by specific filter actions and/or methods, and the values they take may change according to the filter's requirements. Check out the following demos to see these attributes in action with each filter method:
// + [Filters-001](../../demo/filters-001.html) - Parameters for: blur filter
// + [Filters-002](../../demo/filters-002.html) - Parameters for: red, green, blue, cyan, magenta, yellow, notred, notgreen, notblue, grayscale, sepia, invert filters
// + [Filters-003](../../demo/filters-003.html) - Parameters for: brightness, saturation filters
// + [Filters-004](../../demo/filters-004.html) - Parameters for: threshold filter
// + [Filters-005](../../demo/filters-005.html) - Parameters for: channelstep filter
// + [Filters-006](../../demo/filters-006.html) - Parameters for: channelLevels filter
// + [Filters-007](../../demo/filters-007.html) - Parameters for: channels filter
// + [Filters-008](../../demo/filters-008.html) - Parameters for: tint filter
// + [Filters-009](../../demo/filters-009.html) - Parameters for: pixelate filter
// + [Filters-010](../../demo/filters-010.html) - Parameters for: chroma filter
// + [Filters-011](../../demo/filters-011.html) - Parameters for: chromakey filter
// + [Filters-012](../../demo/filters-012.html) - Parameters for: matrix, matrix5 filters
// + [Filters-013](../../demo/filters-013.html) - Parameters for: flood filter
// + [Filters-014](../../demo/filters-014.html) - Parameters for: areaAlpha filter
// + [Filters-015](../../demo/filters-015.html) - Using assets in the filter stream; filter compositing
// + [Filters-016](../../demo/filters-016.html) - Filter blend operation
// + [Filters-017](../../demo/filters-017.html) - Parameters for: displace filter
// + [Filters-018](../../demo/filters-018.html) - Parameters for: emboss filter
// + [Filters-020](../../demo/filters-020.html) - Parameters for: clampChannels filter
    alpha: 255,
    angle: 0,
    areaAlphaLevels: null,
    asset: '',
    blend: 'normal',
    blue: 0,
    blueInBlue: 0,
    blueInGreen: 0,
    blueInRed: 0,
    channelX: 'red',
    channelY: 'green',
    clamp: 0,
    compose: 'source-over',
    copyHeight: 1,
    copyWidth: 1,
    copyX: 0,
    copyY: 0,
    excludeAlpha: true, 
    excludeBlue: false,
    excludeGreen: false,
    excludeRed: false,
    excludeTransparentPixels: true,
    green: 0,
    greenInBlue: 0,
    greenInGreen: 0,
    greenInRed: 0,
    gutterHeight: 1,
    gutterWidth: 1,
    height: 1,
    highBlue: 255,
    highGreen: 255,
    highRed: 255,
    includeAlpha: false, 
    includeBlue: true,
    includeGreen: true,
    includeRed: true,
    keepOnlyChangedAreas: false,
    level: 0,
    lowBlue: 0,
    lowGreen: 0,
    lowRed: 0,
    offsetAlphaX: 0,
    offsetAlphaY: 0,
    offsetBlueX: 0,
    offsetBlueY: 0,
    offsetGreenX: 0,
    offsetGreenY: 0,
    offsetRedX: 0,
    offsetRedY: 0,
    offsetX: 0,
    offsetY: 0,
    opaqueAt: 1,
    operation: 'mean',
    passes: 1,
    postProcessResults: true,
    processHorizontal: true,
    processVertical: true,
    radius: 1,
    ranges: null,
    red: 0,
    redInBlue: 0,
    redInGreen: 0,
    redInRed: 0,
    scaleX: 1,
    scaleY: 1,
    smoothing: 0,
    step: 1,
    strength: 1,
    tileHeight: 1,
    tileWidth: 1,
    tolerance: 0,
    transparentAt: 0,
    transparentEdges: false,
    useNaturalGrayscale: false,
    weights: null,
    width: 1,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// Overwrites ./mixin/base.js
P.kill = function () {

    let myname = this.name;

    // Remove filter from all entity filters attribute
    Object.entries(entity).forEach(([name, ent]) => {

        let f = ent.filters;
        if (f && f.indexOf(myname) >= 0) removeItem(f, myname);
    });
    
    // Remove filter from all group filters attribute
    Object.entries(group).forEach(([name, grp]) => {

        let f = grp.filters;
        if (f && f.indexOf(myname) >= 0) removeItem(f, myname);
    });
    
    // Remove filter from all cell filters attribute
    Object.entries(cell).forEach(([name, c]) => {

        let f = c.filters;
        if (f && f.indexOf(myname) >= 0) removeItem(f, myname);
    });
    
    // Remove filter from the Scrawl-canvas library
    this.deregister();
    
    return this;
};


// #### Get, Set, deltaSet
let S = P.setters, 
    D = P.deltaSetters;


P.set = function (items = Ωempty) {

    const keys = Object.keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs;
        
        let predefined, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key !== 'name' && value != null) {

                predefined = setters[key];

                if (predefined) predefined.call(this, value);
                else if (typeof defs[key] !== 'undefined') this[key] = value;
            }
        }
    }
    if (this.method && setActionsArray[this.method]) setActionsArray[this.method](this);

    this.dirtyFiltersCache = true;

    return this;
};


P.setDelta = function (items = Ωempty) {

    const keys = Object.keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.deltaSetters,
            defs = this.defs;
        
        let predefined, i, iz, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key !== 'name' && value != null) {

                predefined = setters[key];

                if (predefined) predefined.call(this, value);
                else if (typeof defs[key] !== 'undefined') this[key] = addStrings(this[key], value);
            }
        }
    }
    if (this.method && setActionsArray[this.method]) setActionsArray[this.method](this);

    this.dirtyFiltersCache = true;
    
    return this;
};

// #### Compatibility with Scrawl-canvas legacy filters functionality
// The Scrawl-canvas filters code was rewritten from scratch for version 8.4.0. The new functionality introduced the concept of "line processing" - ___lineIn, lineMix, lineOut___ (analagous to SVG in, in2 and result attributes) - alongside the addition of more sophisticated image processing tools such as blend modes, compositing, more adaptable matrices, image loading, displacement mapping, etc.
//
// The legacy system - defining filters using __method__ String attributes - has been adapted to use the new system behind the scenes. As a result all legacy filters will continue to work as expected - with one exception: user-defined filters, which allowed the user to coder a function string to pass on to the filter engine, will no longer function in Scrawl-canvas v8.4.0.
// 
// Note that there are no plans to deprecate the legacy method of defining/creating Filters. The following code will continue to work:
// ```
// // __Brightness__ filter
// scrawl.makeFilter({
//     name: 'my-bright-filter',
//     method: 'brightness',
//     level: 0.5,

// // __Threshhold__ filter
// }).clone({
//     name: 'my-duotone-filter',
//     method: 'threshold',
//     level: 127,
//     lowRed: 100,
//     lowGreen: 0,
//     lowBlue: 0,
//     highRed: 220,
//     highGreen: 60,
//     highBlue: 60,
// });
// ```

// `setActionsArray` - an object containing a large number of functions which will convert legacy factory function invocations (using __method__ strings) into modern Filter objects (using __actions__ arrays):
const setActionsArray = {

// __alphaToChannels__ (new in v8.4.0) - copies the alpha channel value over to the selected value or, alternatively, sets that channels value to zero, or leaves the channel's value unchanged. Setting the appropriate "includeChannel" flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate "excludeChannel" flag will set that channel's value to zero.
    alphaToChannels: function (f) {
        f.actions = [{
            action: 'alpha-to-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            excludeRed: (f.excludeRed != null) ? f.excludeRed : true,
            excludeGreen: (f.excludeGreen != null) ? f.excludeGreen : true,
            excludeBlue: (f.excludeBlue != null) ? f.excludeBlue : true,
        }];
    },

// __areaAlpha__ (new in v8.4.0) - places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to zero. Can be used to create horizontal or vertical bars, or chequerboard effects.
    areaAlpha: function (f) {
        f.actions = [{
            action: 'area-alpha',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            tileWidth: (f.tileWidth != null) ? f.tileWidth : 1,
            tileHeight: (f.tileHeight != null) ? f.tileHeight : 1,
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            gutterWidth: (f.gutterWidth != null) ? f.gutterWidth : 1,
            gutterHeight: (f.gutterHeight != null) ? f.gutterHeight : 1,
            areaAlphaLevels: (f.areaAlphaLevels != null) ? f.areaAlphaLevels : [255,0,0,0],
        }];
    },

// __binary__ (new in v8.4.0) - set the channel to either 0 or 255, depending on whether the channel value is below or above a given level. Level values are set using the "red", "green", "blue" and "alpha" arguments. Setting these values to 0 disables the action for that channel
    binary: function (f) {
        f.actions = [{
            action: 'binary',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 0,
            green: (f.green != null) ? f.green : 0,
            blue: (f.blue != null) ? f.blue : 0,
            alpha: (f.alpha != null) ? f.alpha : 0,
        }];
    },

// __blend__ (new in v8.4.0) - perform a blend operation on two images; available blend options include: 'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', and 'saturation' - see [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#blending)
    blend: function (f) {
        f.actions = [{
            action: 'blend',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            lineMix: (f.lineMix != null) ? f.lineMix : '',
            blend: (f.blend != null) ? f.blend : 'normal',
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __blue__ - removes red and green channel color from the image
    blue: function (f) {
        f.actions = [{
            action: 'average-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeRed: true,
            excludeGreen: true,
        }];
    },

// __blur__ - blurs the image
    blur: function (f) {
        f.actions = [{
            action: 'blur',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            excludeTransparentPixels: (f.excludeTransparentPixels != null) ? f.excludeTransparentPixels : false,
            processHorizontal: (f.processHorizontal != null) ? f.processHorizontal : true,
            processVertical: (f.processVertical != null) ? f.processVertical : true,
            radius: (f.radius != null) ? f.radius : 1,
            passes: (f.passes != null) ? f.passes : 1,
            step: (f.step != null) ? f.step : 1,
        }];
    },

// __brightness__ - adjusts the brightness of the image
    brightness: function (f) {
        let level = (f.level != null) ? f.level : 1;

        f.actions = [{
            action: 'modulate-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: level,
            green: level,
            blue: level,
        }];
    },

// __channelLevels__ (new in v8.4.0) - produces a posterize effect. Takes in four arguments - "red", "green", "blue" and "alpha" - each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value
    channelLevels: function (f) {
        f.actions = [{
            action: 'lock-channels-to-levels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : [0],
            green: (f.green != null) ? f.green : [0],
            blue: (f.blue != null) ? f.blue : [0],
            alpha: (f.alpha != null) ? f.alpha : [255],
        }];
    },

// __thiskey__ - 
    channels: function (f) {
        f.actions = [{
            action: 'modulate-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 1,
            green: (f.green != null) ? f.green : 1,
            blue: (f.blue != null) ? f.blue : 1,
            alpha: (f.alpha != null) ? f.alpha : 1,
        }];
    },

// __thiskey__ - 
    channelstep: function (f) {
        f.actions = [{
            action: 'step-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 1,
            green: (f.green != null) ? f.green : 1,
            blue: (f.blue != null) ? f.blue : 1,
        }];
    },

// __thiskey__ (new in v8.4.0) - 
    channelsToAlpha: function (f) {
        f.actions = [{
            action: 'channels-to-alpha',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
        }];
    },

// __thiskey__ - 
    chroma: function (f) {
        f.actions = [{
            action: 'chroma',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            ranges: (f.ranges != null) ? f.ranges : [],
        }];
    },

// __thiskey__ (new in v8.4.0) - 
    chromakey: function (f) {
        f.actions = [{
            action: 'colors-to-alpha',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 0,
            green: (f.green != null) ? f.green : 255,
            blue: (f.blue != null) ? f.blue : 0,
            transparentAt: (f.transparentAt != null) ? f.transparentAt : 0,
            opaqueAt: (f.opaqueAt != null) ? f.opaqueAt : 1,
        }];
    },

// __thiskey__ (new in v8.4.0) - 
    clampChannels: function (f) {
        f.actions = [{
            action: 'clamp-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            lowRed: (f.lowRed != null) ? f.lowRed : 0,
            lowGreen: (f.lowGreen != null) ? f.lowGreen : 0,
            lowBlue: (f.lowBlue != null) ? f.lowBlue : 0,
            highRed: (f.highRed != null) ? f.highRed : 255,
            highGreen: (f.highGreen != null) ? f.highGreen : 255,
            highBlue: (f.highBlue != null) ? f.highBlue : 255,
        }];
    },

// __compose__ (new in v8.4.0) - perform a composite operation on two images; available compose options include: 'destination-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'source-only', 'source-over' (default), 'source-in', 'source-out', 'source-atop', 'clear', and 'xor' - see [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators)
    compose: function (f) {
        f.actions = [{
            action: 'compose',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            lineMix: (f.lineMix != null) ? f.lineMix : '',
            compose: (f.compose != null) ? f.compose : 'source-over',
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __corrode__ (new in v8.5.2) - Performs a special form of matrix operation on each pixel's color and alpha channels, calculating the new value using neighbouring pixel values
    corrode: function (f) {
        f.actions = [{
            action: 'corrode',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            width: (f.width != null) ? f.width : 3,
            height: (f.height != null) ? f.height : 3,
            offsetX: (f.offsetX != null) ? f.offsetX : 1,
            offsetY: (f.offsetY != null) ? f.offsetY : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : false,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : false,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : false,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : true,
            operation: (f.operation != null) ? f.operation : 'mean',
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __cyan__ - removes red channel color from the image, and averages the remaining channel colors
    cyan: function (f) {
        f.actions = [{
            action: 'average-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeGreen: true,
            includeBlue: true,
            excludeRed: true,
        }];
    },

// __displace__ (new in v8.4.0) - moves pixels around the image, based on the color channel values supplied by a displacement map image
    displace: function (f) {
        f.actions = [{
            action: 'displace',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            lineMix: (f.lineMix != null) ? f.lineMix : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            channelX: (f.channelX != null) ? f.channelX : 'red',
            channelY: (f.channelY != null) ? f.channelY : 'green',
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            scaleX: (f.scaleX != null) ? f.scaleX : 1,
            scaleY: (f.scaleY != null) ? f.scaleY : 1,
            transparentEdges: (f.transparentEdges != null) ? f.transparentEdges : false,
        }];
    },

// __edgeDetect__ (new in v8.4.0) - applies a preset 3x3 edge-detect matrix to the image
    edgeDetect: function (f) {
        f.actions = [{
            action: 'matrix',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: 3,
            height: 3,
            offsetX: 1,
            offsetY: 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
            includeAlpha: false,
            weights: [0,1,0,1,-4,1,0,1,0],
        }];
    },

// __emboss__ (new in v8.4.0) - outputs a black-gray-red emboss effect
    emboss: function (f) {
        const actions = [];
        if (f.useNaturalGrayscale) {
            actions.push({
                action: 'grayscale',
                lineIn: (f.lineIn != null) ? f.lineIn : '',
                lineOut: 'emboss-work',
            });
        }
        else {
            actions.push({
                action: 'average-channels',
                lineIn: (f.lineIn != null) ? f.lineIn : '',
                lineOut: 'emboss-work',
                includeRed: true,
                includeGreen: true,
                includeBlue: true,
            });
        }
        if (f.clamp) {
            actions.push({
                action: 'clamp-channels',
                lineIn: 'emboss-work',
                lineOut: 'emboss-work',
                lowRed: 0 + f.clamp, 
                lowGreen: 0 + f.clamp, 
                lowBlue: 0 + f.clamp, 
                highRed: 255 - f.clamp, 
                highGreen: 255 - f.clamp, 
                highBlue: 255 - f.clamp,
            });
        }
        if (f.smoothing) {
            actions.push({
                action: 'blur',
                lineIn: 'emboss-work',
                lineOut: 'emboss-work',
                radius: f.smoothing,
                passes: 2,
            });
        }
        actions.push({
            action: 'emboss',
            lineIn: 'emboss-work',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            angle: (f.angle != null) ? f.angle : 0,
            strength: (f.strength != null) ? f.strength : 1,
            tolerance: (f.tolerance != null) ? f.tolerance : 0,
            keepOnlyChangedAreas: (f.keepOnlyChangedAreas != null) ? f.keepOnlyChangedAreas : false,
            postProcessResults: (f.postProcessResults != null) ? f.postProcessResults : true,
        });
        f.actions = actions;
    },

// __flood__ (new in v8.4.0) - creates a uniform sheet of the required color, which can then be used by other filter actions
    flood: function (f) {
        f.actions = [{
            action: 'flood',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 0,
            green: (f.green != null) ? f.green : 0,
            blue: (f.blue != null) ? f.blue : 0,
            alpha: (f.alpha != null) ? f.alpha : 255,
        }];
    },

// __gray__ (new in v8.4.0) - averages the three color channel colors
    gray: function (f) {
        f.actions = [{
            action: 'average-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

// __grayscale__ - produces a more realistic black-and-white photograph effect
    grayscale: function (f) {
        f.actions = [{
            action: 'grayscale',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __green__ - removes red and blue channel color from the image
    green: function (f) {
        f.actions = [{
            action: 'average-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeRed: true,
            excludeBlue: true,
        }];
    },

// __image__ (new in v8.4.0) - load an image into the filter engine, where it can then be used by other filter actions - useful for effects such as watermarking an image
    image: function (f) {

        f.actions = [{
            action: 'process-image',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            asset: (f.asset != null) ? f.asset : '',
            width: (f.width != null) ? f.width : 1,
            height: (f.height != null) ? f.height : 1,
            copyWidth: (f.copyWidth != null) ? f.copyWidth : 1,
            copyHeight: (f.copyHeight != null) ? f.copyHeight : 1,
            copyX: (f.copyX != null) ? f.copyX : 0,
            copyY: (f.copyY != null) ? f.copyY : 0,
        }];
    },

// __invert__ - inverts the colors in the image, producing an effect similar to a photograph negative
    invert: function (f) {
        f.actions = [{
            action: 'invert-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

// __magenta__ - removes green channel color from the image, and averages the remaining channel colors
    magenta: function (f) {
        f.actions = [{
            action: 'average-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeBlue: true,
            excludeGreen: true,
        }];
    },

// __matrix__ - applies a 3x3 convolution matrix, kernel or mask operation to the image
    matrix: function (f) {
        f.actions = [{
            action: 'matrix',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: 3,
            height: 3,
            offsetX: 1,
            offsetY: 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            weights: (f.weights != null) ? f.weights : [0,0,0,0,1,0,0,0,0],
        }];
    },

// __matrix5__ - applies a 5x5 convolution matrix, kernel or mask operation to the image
    matrix5: function (f) {
        f.actions = [{
            action: 'matrix',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: 5,
            height: 5,
            offsetX: 2,
            offsetY: 2,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            weights: (f.weights != null) ? f.weights : [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
        }];
    },

// __notblue__ - zeroes the blue channel values (not the same effect as the yellow filter)
    notblue: function (f) {
        f.actions = [{
            action: 'set-channel-to-level',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeBlue: true,
            level: 0,
        }];
    },

// __notgreen__ - zeroes the green channel values (not the same effect as the magenta filter)
    notgreen: function (f) {
        f.actions = [{
            action: 'set-channel-to-level',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeGreen: true,
            level: 0,
        }];
    },

// __notred__ - zeroes the red channel values (not the same effect as the cyan filter)
    notred: function (f) {
        f.actions = [{
            action: 'set-channel-to-level',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            level: 0,
        }];
    },

// __offset__ (new in v8.4.0) - moves the image in its entirety by the given offset
    offset: function (f) {
        f.actions = [{
            action: 'offset',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            offsetRedX: (f.offsetX != null) ? f.offsetX : 0,
            offsetRedY: (f.offsetY != null) ? f.offsetY : 0,
            offsetGreenX: (f.offsetX != null) ? f.offsetX : 0,
            offsetGreenY: (f.offsetY != null) ? f.offsetY : 0,
            offsetBlueX: (f.offsetX != null) ? f.offsetX : 0,
            offsetBlueY: (f.offsetY != null) ? f.offsetY : 0,
            offsetAlphaX: (f.offsetX != null) ? f.offsetX : 0,
            offsetAlphaY: (f.offsetY != null) ? f.offsetY : 0,
        }];
    },

// __offsetChannels__ (new in v8.4.0) - moves each channel  by an offset set for that channel. Can create a crude stereoscopic output
    offsetChannels: function (f) {
        f.actions = [{
            action: 'offset',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            offsetRedX: (f.offsetRedX != null) ? f.offsetRedX : 0,
            offsetRedY: (f.offsetRedY != null) ? f.offsetRedY : 0,
            offsetGreenX: (f.offsetGreenX != null) ? f.offsetGreenX : 0,
            offsetGreenY: (f.offsetGreenY != null) ? f.offsetGreenY : 0,
            offsetBlueX: (f.offsetBlueX != null) ? f.offsetBlueX : 0,
            offsetBlueY: (f.offsetBlueY != null) ? f.offsetBlueY : 0,
            offsetAlphaX: (f.offsetAlphaX != null) ? f.offsetAlphaX : 0,
            offsetAlphaY: (f.offsetAlphaY != null) ? f.offsetAlphaY : 0,
        }];
    },

// __pixelate__ - averages the colors in a block to produce a series of obscuring tiles
    pixelate: function (f) {
        f.actions = [{
            action: 'pixelate',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            tileWidth: (f.tileWidth != null) ? f.tileWidth : 1,
            tileHeight: (f.tileHeight != null) ? f.tileHeight : 1,
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
        }];
    },

// __red__ - removes blue and green channel color from the image
    red: function (f) {
        f.actions = [{
            action: 'average-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeGreen: true,
            excludeBlue: true,
        }];
    },

// __saturation__ - alters the saturation level of the image
    saturation: function (f) {
        let level = (f.level != null) ? f.level : 1;

        f.actions = [{
            action: 'modulate-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: level,
            green: level,
            blue: level,
            saturation: true,
        }];
    },

// __sepia__ - recalculates the values of each color channel (a tint action) to create a more 'antique' version of the image
    sepia: function (f) {
        f.actions = [{
            action: 'tint-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            redInRed: 0.393,
            redInGreen: 0.349,
            redInBlue: 0.272,
            greenInRed: 0.769,
            greenInGreen: 0.686,
            greenInBlue: 0.534,
            blueInRed: 0.189,
            blueInGreen: 0.168,
            blueInBlue: 0.131,
        }];
    },

// __sharpen__ (new in v8.4.0) - applies a preset 3x3 sharpen matrix to the image
    sharpen: function (f) {
        f.actions = [{
            action: 'matrix',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: 3,
            height: 3,
            offsetX: 1,
            offsetY: 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
            includeAlpha: false,
            weights: [0,-1,0,-1,5,-1,0,-1,0],
        }];
    },

// __threshold__ - creates a duotone effect - grayscales the input then, for each pixel, checks the color channel values against a "level" argument: pixels with channel values above the level value are assigned to the 'high' color; otherwise they are updated to the 'low' color.
    threshold: function (f) {
        let lowRed = (f.lowRed != null) ? f.lowRed : 0,
            lowGreen = (f.lowGreen != null) ? f.lowGreen : 0,
            lowBlue = (f.lowBlue != null) ? f.lowBlue : 0,
            lowAlpha = (f.lowAlpha != null) ? f.lowAlpha : 255,
            highRed = (f.highRed != null) ? f.highRed : 255,
            highGreen = (f.highGreen != null) ? f.highGreen : 255,
            highBlue = (f.highBlue != null) ? f.highBlue : 255,
            highAlpha = (f.highAlpha != null) ? f.highAlpha : 255;
            

        let low = (f.low != null) ? f.low : [lowRed, lowGreen, lowBlue, lowAlpha],
            high = (f.high != null) ? f.high : [highRed, highGreen, highBlue, highAlpha];

        f.actions = [{
            action: 'threshold',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 128,
            low,
            high,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
        }];
    },

// __tint__ - has similarities to the SVG &lt;feColorMatrix> filter element, but excludes the alpha channel from calculations. Rather than set a matrix, we set nine arguments to determine how the value of each color channel in a pixel will affect both itself and its fellow color channels.
    tint: function (f) {
        f.actions = [{
            action: 'tint-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            redInRed: (f.redInRed != null) ? f.redInRed : 1,
            redInGreen: (f.redInGreen != null) ? f.redInGreen : 0,
            redInBlue: (f.redInBlue != null) ? f.redInBlue : 0,
            greenInRed: (f.greenInRed != null) ? f.greenInRed : 0,
            greenInGreen: (f.greenInGreen != null) ? f.greenInGreen : 1,
            greenInBlue: (f.greenInBlue != null) ? f.greenInBlue : 0,
            blueInRed: (f.blueInRed != null) ? f.blueInRed : 0,
            blueInGreen: (f.blueInGreen != null) ? f.blueInGreen : 0,
            blueInBlue: (f.blueInBlue != null) ? f.blueInBlue : 1,
        }];
    },

// __userDefined__ - DEPRECATED - this filter method no longer has any effect, returning an unchanged image
    userDefined: function (f) {
        f.actions = [{
            action: 'user-defined-legacy',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __yellow__ - removes blue channel color from the image, and averages the remaining channel colors
    yellow: function (f) {
        f.actions = [{
            action: 'average-channels',
            lineIn: (f.lineIn != null) ? f.lineIn : '',
            lineOut: (f.lineOut != null) ? f.lineOut : '',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            excludeBlue: true,
        }];
    },
};


// #### Prototype functions
// No additional prototype functions defined


// #### Factory
const makeFilter = function (items) {

    if (!items) return false;
    return new Filter(items);
};

constructors.Filter = Filter;


// #### Exports
export {
    makeFilter,
};
