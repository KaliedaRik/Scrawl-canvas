// # Filter factory
// Filters take in an image representation of an [entity](../mixin/entity.html), [Group](./group.html) of entitys or a [Cell](./cell.html) display and, by manipulating the image's data, return an updated image which replaces those entitys or Cell in the final output display.
//
// Scrawl-canvas defines its filters in __Filter objects__, detailed in this module. The functionality to make use of these objects is coded up in the [filter mixin](../mixin/filter.html), which is used by the Cell, Group and all entity factories.
//
// The Scrawl-canvas filter engine implements a number of common filter algorithms. These algorithms - __called filter actions__ - can be combined in a wide variety of ways, including the use of multiple pathways, to create complex filter results.
//
// #### Filter engine actions
// `alpha-to-channels` - Copies the alpha channel value over to the selected value or, alternatively, sets that channels value to zero, or leaves the channel's value unchanged. Setting the appropriate "includeChannel" flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate "excludeChannel" flag will set that channel's value to zero. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue`.
//
// `area-alpha` - Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to values set in the `areaAlphaLevels` array. Can be used to create horizontal or vertical bars, or chequerboard effects. Object attributes: `action, lineIn, lineOut, opacity, tileWidth, tileHeight, offsetX, offsetY, gutterWidth, gutterHeight, areaAlphaLevels`.
//
// `average-channels` - Calculates an average value from each pixel's included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to 0. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue`.
//
// `binary` - DEPRECATED - functionality moved over to `threshold`.
//
// `blend` - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using various separable and non-separable blend modes (as defined by the W3C Compositing and Blending Level 1 recommendations). The blending method is determined by the String value supplied in the `blend` argument; permitted values are: 'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', and 'saturation'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments. Object attributes: `action, lineIn, lineOut, lineMix, opacity, blend, offsetX, offsetY`.
//
// `blur` - Performs a multi-loop, two-step 'horizontal-then-vertical averaging sweep' calculation across all pixels to create a blur effect. Note that this filter is expensive, thus much slower to complete compared to other filter effects. Object attributes: `action, lineIn, lineOut, opacity, radius, passes, processVertical, processHorizontal, includeRed, includeGreen, includeBlue, includeAlpha, step`.
//
// `channels-to-alpha` - Calculates an average value from each pixel's included channels and applies that value to the alpha channel. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue`.
//
// `chroma` - A chroma-key effect. Using an array of 'range' color arrays, determine whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. Each 'range' color array comprises six Numbers representing [minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue] values. Object attributes: `action, lineIn, lineOut, opacity, ranges`.
//
// `clamp-channels` - Clamp each color channel to a range set by lowColor and highColor values. Object attributes: `action, lineIn, lineOut, opacity, lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue`.
//
// `colors-to-alpha` - A chroma-key effect. Determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the "red", "green" and "blue" arguments. The sensitivity of the effect can be manipulated using the "transparentAt" and "opaqueAt" values, both of which lie in the range 0-1. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, opaqueAt, transparentAt`; pseudo-arguments for the convenience method include `reference` - any valid CSS color string from which the channel values will be calculated.
//
// `compose` - Using two source images (from the "lineIn" and "lineMix" arguments), combine their color information using alpha compositing rules (as defined by Porter/Duff). The compositing method is determined by the String value supplied in the "compose" argument; permitted values are: 'destination-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'source-only', 'source-over' (default), 'source-in', 'source-out', 'source-atop', 'clear', 'xor', or 'lighter'. Note that the source images may be of different sizes: the output (lineOut) image size will be the same as the source (NOT lineIn) image; the lineMix image can be moved relative to the lineIn image using the "offsetX" and "offsetY" arguments. Object attributes: `action, lineIn, lineOut, lineMix, opacity, compose, offsetX, offsetY`.
//
// `corrode` - Performs a special form of matrix operation on each pixel's color and alpha channels, calculating the new value using neighbouring pixel values. Note that this filter is expensive, thus much slower to complete compared to other filter effects. The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments. The operation will set the pixel's channel value to match either the 'lowest', 'highest' or 'average' (default) values as dictated by its neighbours - this value is set in the "level" attribute. Channels can be selected by setting the "includeRed", "includeGreen", "includeBlue" (all false by default) and "includeAlpha" (default: true) flags. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, includeAlpha, width, height, offsetX, offsetY, operation`.
//
// `displace` - Shift pixels around the image, based on the values supplied in a displacement process-image. Common source images can be generated from the various Noise assets, though any image will create an effect. Object attributes: `action, lineIn, lineOut, lineMix, opacity, channelX, channelY, scaleX, scaleY, transparentEdges, offsetX, offsetY`.
//
// `emboss` - A 3x3 matrix transform; the matrix weights are calculated internally from the values of two arguments: "strength", and "angle" - which is a value measured in degrees, with 0 degrees pointing to the right of the origin (along the positive x axis). Post-processing options include removing unchanged pixels, or setting then to mid-gray. The convenience method includes additional arguments which will add a choice of grayscale, then channel clamping, then blurring actions before passing the results to this emboss action. Object attributes: `action, lineIn, lineOut, opacity, strength, angle, tolerance, keepOnlyChangedAreas, postProcessResults`; pseudo-arguments for the convenience method include `useNaturalGrayscale, clamp, smoothing`.
//
// `flood` - Set all pixels to the channel values supplied in the "red", "green", "blue" and "alpha" arguments. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, alpha`; pseudo-arguments for the convenience method include `reference` - any valid CSS color string from which the channel values will be calculated.
//
// `gaussianblur` - a fast linear gaussian blur algorithm taken from this GitHub repository: https://github.com/nodeca/glur/blob/master/index.js (code accessed 1 June 2021). Object attributes: `action, lineIn, lineOut, opacity, radius`.
//
// `glitch` - CRT television/monitor glitching effect - shifts rows horizontally by a random amount (mediated by limits). Object attributes: `action, lineIn, lineOut, opacity, useMixedChannel, seed, step, offsetMin, offsetMax, offsetRedMin, offsetRedMax, offsetGreenMin, offsetGreenMax, offsetBlueMin, offsetBlueMax, offsetAlphaMin, offsetAlphaMax, transparentEdges, level`.
//
// `grayscale` - For each pixel, averages the weighted color channels and applies the result across all the color channels. This gives a more realistic monochrome effect. Object attributes: `action, lineIn, lineOut, opacity`.
//
// `invert-channels` - For each pixel, subtracts its current channel values - when included - from 255. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, includeAlpha`.
//
// `lock-channels-to-levels` - Produces a posterize effect. Takes in four arguments - "red", "green", "blue" and "alpha" - each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, alpha`.
//
// `map-to-gradient` - maps the colors in the supplied (complex) gradient to a grayscaled input. Object attributes: `action, lineIn, lineOut, opacity, useNaturalGrayscale, gradient`.
//
// `matrix` - Performs a matrix operation on each pixel's channels, calculating the new value using neighbouring pixel weighted values. Also known as a convolution matrix, kernel or mask operation. Note that this filter is expensive, thus much slower to complete compared to other filter effects. The matrix dimensions can be set using the "width" and "height" arguments, while setting the home pixel's position within the matrix can be set using the "offsetX" and "offsetY" arguments. The weights to be applied need to be supplied in the "weights" argument - an Array listing the weights row-by-row starting from the top-left corner of the matrix. By default all color channels are included in the calculations while the alpha channel is excluded. The 'edgeDetect', 'emboss' and 'sharpen' convenience filter methods all use the matrix action, pre-setting the required weights. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, includeAlpha, width, height, offsetX, offsetY, weights`.
//
// `modulate-channels` - Multiplies each channel's value by the supplied argument value. A channel-argument's value of '0' will set that channel's value to zero; a value of '1' will leave the channel value unchanged. If the "saturation" flag is set to 'true' the calculation changes to start at the color range mid point. The 'brightness' and 'saturation' filters are special forms of the 'channels' filter which use a single "levels" argument to set all three color channel arguments to the same value. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, alpha, saturation`; pseudo-argument: `level`
//
// `offset` - Offset the input image in the output image. Object attributes: `action, lineIn, lineOut, opacity, offsetRedX, offsetRedY, offsetGreenX, offsetGreenY, offsetBlueX, offsetBlueY, offsetAlphaX, offsetAlphaY; pseudo-argument: offsetX, offsetY`.
//
// `pixelate` - Pixelizes the input image by creating a grid of tiles across it and then averaging the color values of each pixel in a tile and setting its value to the average. Tile width and height, and their offset from the top left corner of the image, are set via the "tileWidth", "tileHeight", "offsetX" and "offsetY" arguments. Object attributes: `action, lineIn, lineOut, opacity, tileWidth, tileHeight, offsetX, offsetY, includeRed, includeGreen, includeBlue, includeAlpha`.
//
// `process-image` - Add an asset image to the filter process chain. The asset - the String name of the asset object - must be pre-loaded before it can be included in the filter. The "width" and "height" arguments are measured in integer Number pixels; the "copy" arguments can be either percentage Strings (relative to the asset's natural dimensions) or absolute Number values (in pixels). The "lineOut" argument is required - be aware that the filter action does not check for any pre-existing assets cached under this name and, if they exist, will overwrite them with this asset's data. Object attributes: `action, lineOut, asset, width, height, copyWidth, copyHeight, copyX, copyY`.
//
// `reduce-palette` - Reduce the number of colors in an image palette. The palette attribute can be: a Number (for the commonest colors); an Array of CSS color Strings to use as the palette; or the String name of a pre-defined palette - default: 'black-white'. All internal color comparisons to match pixels to the closest palette color happen in the LAB color space. Dithering is applied to select the closest, or second closest, color when setting each pixel's final output color; dithering can be random (default), or blue-noise. When calculating commonest colors, a minimum color distance can be set to get a better representative spread for images which have a predominant color (eg: images containing sky, clouds, vegetation or a plain background); calculating the commonest colors can take place in either the RGB space, or the LAB space. The Object attributes: `action, lineIn, lineOut, lineMix, opacity, palette, useBluenoise, minimumColorDistance, useLabForPaletteDistance`.
//
// `set-channel-to-level` - Sets the value of each pixel's included channel to the value supplied in the "level" argument. Object attributes: `action, lineIn, lineOut, opacity, includeRed, includeGreen, includeBlue, includeAlpha, level`.
//
// `step-channels` - Takes three divisor values - "red", "green", "blue". For each pixel, its color channel values are divided by the corresponding color divisor, rounded down or up to the integer value and then multiplied by the divisor. For example a divisor value of '50' applied to a channel value of '120' will give a result of '100' (if clamp is set to "down" or "round") or '150' (clamp set to "up"). The output is a form of posterization. Object attributes: `action, lineIn, lineOut, opacity, red, green, blue, clamp`.
//
// `swirl` - For each pixel, move the pixel radially according to its distance from a given coordinate and associated angle for that coordinate. Object attributes: `action, lineIn, lineOut, opacity, swirls (array of arrays)`; pseudo-arguments (for one swirl): startX, startY, innerRadius, outerRadius, angle, easing, staticSwirls`. Note that the start paramenters can be absolute (Number) or relative (String) values, with values relative to the host Cell's dimensions; inner and outer radius values can also be Strings relative to the host Cell's width. Supported easing values are included in demo Filters-026.
//
// `threshold` - Grayscales the input then, for each pixel, checks the color channel values against a "level" argument: pixels with channel values above the level value are assigned to the 'high' color; otherwise they are updated to the 'low' color. The "high" and "low" arguments are [red, green, blue] integer Number Arrays. The convenience function will accept the pseudo-attributes "highRed", "lowRed" etc in place of the "high" and "low" Arrays. Object attributes: `action, lineIn, lineOut, opacity, low, high; pseudo-arguments: lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue`; this filter also accepts `lowColor` and `highColor` pseudo-attributes - CSS color Strings in place of the `lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue` values.
//
// `tint-channels` - Has similarities to the SVG <feColorMatrix> filter element, but excludes the alpha channel from calculations. Rather than set a matrix, we set nine arguments to determine how the value of each color channel in a pixel will affect both itself and its fellow color channels. The 'sepia' convenience filter presets these values to create a sepia effect. Object attributes: `action, lineIn, lineOut, opacity, redInRed, redInGreen, redInBlue, greenInRed, greenInGreen, greenInBlue, blueInRed, blueInGreen, blueInBlue`; pseudo-arguments for the convenience method include `reference` - any valid CSS color string from which the channel values will be calculated; pseudo-arguments for the convenience method include `redColor, greenColor, blueColor` - any valid CSS color string from which the rgbIn values will be calculated.
//
// `user-defined-legacy` - Previous to Scrawl-canvas version 8.4.0, filters could be defined with an argument which passed a function string to a filter web worker, which the worker would then run against the source input image as-and-when required. This functionality has been removed from the new filter system. All such filters will now return the input image unchanged. Object attributes: `action, lineIn, lineOut, opacity`.
//
// `vary-channels-by-weights` - curves filter (for image processing tonality). The weights array must by 1024 elements long, with each element defaulting to a value of `1.0`. Object attributes: `action, lineIn, lineOut, opacity, weights, useMixedChannel`.
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
import { cell, constructors, entity, group, styles } from '../core/library.js';

import { addStrings, doCreate, mergeOver, removeItem, Ωempty } from '../core/utilities.js';

import { makeGradient } from './gradient.js';
import { colorEngine } from './filter-engine.js';

import baseMix from '../mixin/base.js';

import { _freeze, _keys, _round, _values, ALPHA_TO_CHANNELS, AREA_ALPHA, ARG_SPLITTER, AVERAGE_CHANNELS, BLACK, BLACK_WHITE, BLEND, BLUENOISE, BLUR, CHANNELS_TO_ALPHA, CHROMA, CLAMP_CHANNELS, CLAMP_VALUES, COLORS_TO_ALPHA, COMPOSE, CORRODE, DEFAULT_SEED, DISPLACE, DOWN, EMBOSS, EMBOSS_WORK, FILTER, FLOOD, GAUSSIAN_BLUR, GLITCH, GRAYSCALE, GREEN, INVERT_CHANNELS, LINEAR, LOCK_CHANNELS_TO_LEVELS, MAP_TO_GRADIENT, MATRIX, MEAN, MODULATE_CHANNELS, NAME, NEWSPRINT, NOISE_VALUES, NORMAL, OFFSET, PC30, PC50, PIXELATE, PROCESS_IMAGE, RANDOM, RANDOM_NOISE, RECT_GRID, RED, REDUCE_PALETTE, SET_CHANNEL_TO_LEVEL, SOURCE_OVER, STEP_CHANNELS, SWIRL, T_FILTER, THRESHOLD, TILES, TINT_CHANNELS, UNDEF, USER_DEFINED_LEGACY, VARY_CHANNELS_BY_WEIGHTS, WHITE, ZERO_STR } from '../core/shared-vars.js';


// #### Filter constructor
const Filter = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.actions = [];

    this.set(items);
    return this;
};


// #### Filter prototype
const P = Filter.prototype = doCreate();
P.type = T_FILTER;
P.lib = FILTER;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Filter attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + ___Note:__ unlike other Scrawl-canvas factory functions, the Filter factory does not set all its default attributes as part of its constructors. The reason for this is that these attributes are often specific to just one or a few filter actions or methods; not setting these defaults help save some object memory.
const defaultAttributes = {

    // ##### How the filter factory builds filters
    // Filter actions are defined in action objects - which are vanilla Javascript Objects collected together in the __actions__ array. Each action object is processed sequentially by the filter engine to produce the final output for that filter.
    actions: null,

    // The __method__ attribute is a String which, in legacy filters, determines the actions which that filter will take on the image. An entity, Group or Cell can include more than one filter object in its `filters` Array.
    // + Filter factory invocations which include the `method` attribute in their argument object do not need to include an `actions` attribute; the factory will build the action objects for us.
    // + When using the `method` attribute, other attributes can be included alongside it. The filter factory will automatically transpose these attributes to the action object.
    // + The following Strings are valid methods: `'alphaToChannels', 'areaAlpha', 'binary', 'blend', 'blue', 'blur', 'brightness', 'channelLevels', 'channels', 'channelstep', 'channelsToAlpha', 'chroma', 'chromakey', 'clampChannels', 'compose', 'corrode', 'curveWeights', 'cyan', 'displace', 'edgeDetect',  'emboss', 'flood', 'gaussianBlur', 'gray', 'grayscale', 'green', 'image', 'invert', 'magenta', 'mapToGradient', 'matrix', 'matrix5', 'notblue', 'notgreen', 'notred', 'offset', 'offsetChannels', 'pixelate', 'randomNoise', 'red', 'reducePalette', 'saturation', 'sepia', 'sharpen', 'swirl', 'threshold', 'tint', 'userDefined', 'yellow'`.
    method: ZERO_STR,

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
    // + If the entity, Group or Cell has requested that the filters applied to it be memoized, the final result will be stored in a key:value cache; the next time the entity/Group/Cell requests the filters, and it supplies a key matching one in the cache, the cached result is returned instantly
    // + memoized results are time limited and expire, by default, after 1 second.
    lineIn: ZERO_STR,
    lineMix: ZERO_STR,
    lineOut: ZERO_STR,

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
// + [Filters-019](../../demo/filters-019.html) - Parameters for: edgeDetect, sharpen filters
// + [Filters-020](../../demo/filters-020.html) - Parameters for: clampChannels filter
// + [Filters-021](../../demo/filters-021.html) - Parameters for: corrode filter
// + [Filters-022](../../demo/filters-022.html) - Parameters for: mapToGradient filter
// + [Filters-023](../../demo/filters-023.html) - Parameters for: randomNoise filter
// + [Filters-024](../../demo/filters-024.html) - Parameters for: curveNoise filter
// + [Filters-025](../../demo/filters-025.html) - Parameters for: glitch filter
// + [Filters-026](../../demo/filters-026.html) - Parameters for: swirl filter
// + [Filters-027](../../demo/filters-027.html) - Parameters for: reducePalette filter
    alpha: 255,
    angle: 0,
    areaAlphaLevels: null,
    asset: ZERO_STR,
    blend: NORMAL,
    blue: 0,
    blueInBlue: 0,
    blueColor: BLACK,
    blueInGreen: 0,
    blueInRed: 0,
    channelX: RED,
    channelY: GREEN,
    clamp: 0,
    compose: SOURCE_OVER,
    copyHeight: 1,
    copyWidth: 1,
    copyX: 0,
    copyY: 0,
    concurrent: false,
    easing: LINEAR,
    excludeAlpha: true,
    excludeBlue: false,
    excludeGreen: false,
    excludeRed: false,
    excludeTransparentPixels: true,
    gradient: null,
    green: 0,
    greenInBlue: 0,
    greenColor: BLACK,
    greenInGreen: 0,
    greenInRed: 0,
    gutterHeight: 1,
    gutterWidth: 1,
    height: 1,
    highAlpha: 255,
    highBlue: 255,
    highColor: WHITE,
    highGreen: 255,
    highRed: 255,
    includeAlpha: false,
    includeBlue: true,
    includeGreen: true,
    includeRed: true,
    innerRadius: 0,
    keepOnlyChangedAreas: false,
    level: 0,
    lowAlpha: 0,
    lowBlue: 0,
    lowColor: BLACK,
    lowGreen: 0,
    lowRed: 0,
    minimumColorDistance: 1000,
    noiseType: RANDOM,
    noWrap: false,
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
    offsetAlphaMin: 0,
    offsetAlphaMax: 0,
    offsetBlueMin: 0,
    offsetBlueMax: 0,
    offsetGreenMin: 0,
    offsetGreenMax: 0,
    offsetRedMin: 0,
    offsetRedMax: 0,
    offsetMin: 0,
    offsetMax: 0,
    opaqueAt: 1,
    operation: MEAN,
    outerRadius: PC30,
    palette: BLACK_WHITE,
    passes: 1,
    points: null,
    postProcessResults: true,
    processHorizontal: true,
    processVertical: true,
    radius: 1,
    ranges: null,
    red: 0,
    redInBlue: 0,
    redColor: BLACK,
    redInGreen: 0,
    redInRed: 0,
    reference: BLACK,
    scaleX: 1,
    scaleY: 1,
    seed: DEFAULT_SEED,
    smoothing: 0,
    startX: PC50,
    startY: PC50,
    step: 1,
    strength: 1,
    staticSwirls: null,
    tileHeight: 1,
    tileWidth: 1,
    tileRadius: 1,
    tolerance: 0,
    transparentAt: 0,
    transparentEdges: false,
    useBluenoise: false,
    useLabForPaletteDistance: false,
    useMixedChannel: true,
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

    const myname = this.name;
    let f;

    // Remove filter from all entity filters attribute
    _values(entity).forEach(ent => {

        f = ent.filters;
        if (f && f.includes(myname)) removeItem(f, myname);
    });

    // Remove filter from all group filters attribute
    _values(group).forEach(grp => {

        f = grp.filters;
        if (f && f.includes(myname)) removeItem(f, myname);
    });

    // Remove filter from all cell filters attribute
    _values(cell).forEach(c => {

        f = c.filters;
        if (f && f.includes(myname)) removeItem(f, myname);
    });

    // Remove filter from the Scrawl-canvas library
    this.deregister();

    return this;
};


// #### Get, Set, deltaSet
const S = P.setters;


P.set = function (items = Ωempty) {

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs;

        let fn, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key != NAME && value != null) {

                fn = setters[key];

                if (fn) fn.call(this, value);
                else if (typeof defs[key] != UNDEF) this[key] = value;
            }
        }
    }
    if (this.method && setActionsArray[this.method]) setActionsArray[this.method](this);

    this.dirtyFilterIdentifier = true;

    return this;
};


P.setDelta = function (items = Ωempty) {

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.deltaSetters,
            defs = this.defs;

        let fn, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if (key && key != NAME && value != null) {

                fn = setters[key];

                if (fn) fn.call(this, value);
                else if (typeof defs[key] != UNDEF) this[key] = addStrings(this[key], value);
            }
        }
    }
    if (this.method && setActionsArray[this.method]) setActionsArray[this.method](this);

    this.dirtyFilterIdentifier = true;

    return this;
};

S.actions = function (item) {

    if (item != null) this.actions = item;
};

// #### Compatibility with Scrawl-canvas legacy filters functionality
// The Scrawl-canvas filters code was rewritten from scratch for version 8.4.0. The new functionality introduced the concept of "line processing" - `lineIn`, `lineMix`, `lineOut` (analagous to SVG `in`, `in2` and `result` attributes) - alongside the addition of more sophisticated image processing tools such as blend modes, compositing, more adaptable matrices, image loading, displacement mapping, etc.
//
// The legacy system - defining filters using `method` String attributes - has been adapted to use the new system behind the scenes. As a result all legacy filters will continue to work as expected - with one exception: user-defined filters, which allowed the user to code a function string to pass on to the filter engine, will no longer function in Scrawl-canvas v8.4.0+.
//
// Note that there are no plans to deprecate the legacy method of defining/creating Filters. The following code will continue to work:
// ```
// // __Brightness__ filter
// scrawl.makeFilter({
//     name: 'my-bright-filter',
//     method: 'brightness',
//     level: 0.5,
//
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

// `setActionsArray` - an object containing a large number of functions which will convert legacy factory function invocations (using `method` strings) into modern Filter objects (using `actions` arrays):
const setActionsArray = _freeze({

// __alphaToChannels__ (new in v8.4.0) - copies the alpha channel value over to the selected value or, alternatively, sets that channels value to zero, or leaves the channel's value unchanged. Setting the appropriate `includeChannel` flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate `excludeChannel` flag will set that channel's value to zero.
    alphaToChannels: function (f) {
        f.actions = [{
            action: ALPHA_TO_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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
            action: AREA_ALPHA,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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

// DEPRECATED! __binary__ - use the updated threshold filter instead, as this functionality has been added to it.
    binary: function (f) {
        const lowRed = (f.lowRed != null) ? f.lowRed : 0,
            lowGreen = (f.lowGreen != null) ? f.lowGreen : 0,
            lowBlue = (f.lowBlue != null) ? f.lowBlue : 0,
            lowAlpha = (f.lowAlpha != null) ? f.lowAlpha : 255,
            highRed = (f.highRed != null) ? f.highRed : 255,
            highGreen = (f.highGreen != null) ? f.highGreen : 255,
            highBlue = (f.highBlue != null) ? f.highBlue : 255,
            highAlpha = (f.highAlpha != null) ? f.highAlpha : 255;


        const low = (f.low != null) ? f.low : [lowRed, lowGreen, lowBlue, lowAlpha],
            high = (f.high != null) ? f.high : [highRed, highGreen, highBlue, highAlpha];

        f.actions = [{
            action: THRESHOLD,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 128,
            red: (f.red != null) ? f.red : 128,
            green: (f.green != null) ? f.green : 128,
            blue: (f.blue != null) ? f.blue : 128,
            alpha: (f.alpha != null) ? f.alpha : 128,
            low,
            high,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            useMixedChannel: (f.useMixedChannel != null) ? f.useMixedChannel : false,
        }];
    },

// __blend__ (new in v8.4.0) - perform a blend operation on two images; available blend options include: `'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', and 'saturation'` - see [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#blending)
    blend: function (f) {
        f.actions = [{
            action: BLEND,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            lineMix: (f.lineMix != null) ? f.lineMix : ZERO_STR,
            blend: (f.blend != null) ? f.blend : NORMAL,
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __blue__ - removes red and green channel color from the image
    blue: function (f) {
        f.actions = [{
            action: AVERAGE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeRed: true,
            excludeGreen: true,
        }];
    },

// __blur__ - blurs the image
// A bespoke blur function. Creates visual artefacts with various settings that might be useful. Strongly advise to memoize the results from this filter as it is resource-intensive.
// + Use the gaussian blur filter for a smoother result.
    blur: function (f) {
        f.actions = [{
            action: BLUR,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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
        const level = (f.level != null) ? f.level : 1;

        f.actions = [{
            action: MODULATE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: level,
            green: level,
            blue: level,
        }];
    },

// __channelLevels__ (new in v8.4.0) - produces a posterize effect. Takes in four arguments - `red`, `green`, `blue` and `alpha` - each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value
// + TODO - add in a `reference` attribute, which will be a valid CSS color string. Use these colors to generate the red, green and blue Arrays.
    channelLevels: function (f) {
        f.actions = [{
            action: LOCK_CHANNELS_TO_LEVELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : [0],
            green: (f.green != null) ? f.green : [0],
            blue: (f.blue != null) ? f.blue : [0],
            alpha: (f.alpha != null) ? f.alpha : [255],
        }];
    },

// __channels__ - adjust the value of each channel by a specified multiplier
    channels: function (f) {
        f.actions = [{
            action: MODULATE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 1,
            green: (f.green != null) ? f.green : 1,
            blue: (f.blue != null) ? f.blue : 1,
            alpha: (f.alpha != null) ? f.alpha : 1,
        }];
    },

// __channelstep__ - restrict the number of color values that each channel can set by imposing regular bands on each channel
    channelstep: function (f) {

        let clamp = (f.clamp != null) ? f.clamp : DOWN

        if (!CLAMP_VALUES.includes(clamp)) clamp = DOWN;

        f.actions = [{
            action: STEP_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            clamp,
            red: (f.red != null) ? f.red : 1,
            green: (f.green != null) ? f.green : 1,
            blue: (f.blue != null) ? f.blue : 1,
        }];
    },

// __channelsToAlpha__ (new in v8.4.0) - calculates an average value from each pixel's included channels and applies that value to the alpha channel.
    channelsToAlpha: function (f) {
        f.actions = [{
            action: CHANNELS_TO_ALPHA,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
        }];
    },

// __chroma__ - using an array of `range` arrays, determine whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. Each range array comprises six Numbers representing `[minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue]` values.
// + Since v8.7.0 we can also define range Arrays as `[CSS-color-string, CSS-color-string]`
    chroma: function (f) {

        const processedRanges = [],
            res = [];

        if ((f.ranges != null)) {

            f.ranges.forEach(range => {

                if (range.length == 6) processedRanges.push(range);
                else if (range.length == 2) {

                    if (range[0].substring && range[1].substring) {

                        res.length = 0;

                        range.forEach(col => {

                            const [r, g, b] = colorEngine.extractRGBfromColor(col);
                            res.push(r, g, b);
                        });
                    }
                    processedRanges.push(res);
                }
            })
        }

        f.actions = [{
            action: CHROMA,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            ranges: processedRanges,
        }];
    },

// __chromakey__ (new in v8.4.0) - determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the `red`, `green` and `blue` arguments. The sensitivity of the effect can be manipulated using the `transparentAt` and `opaqueAt` values, both of which lie in the range 0-1.
// + Since v8.7.0, this filter also accepts a `reference` color string in place of the `red, green, blue` values
    chromakey: function (f) {

        let red = (f.red != null) ? f.red : 0,
            green = (f.green != null) ? f.green : 255,
            blue = (f.blue != null) ? f.blue : 0;

        if (f.reference != null) {

            [red, green, blue] = colorEngine.extractRGBfromColor(f.reference);

            f.red = red;
            f.green = green;
            f.blue = blue;

            delete f.reference;
        }

        f.actions = [{
            action: COLORS_TO_ALPHA,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            red,
            green,
            blue,
            transparentAt: (f.transparentAt != null) ? f.transparentAt : 0,
            opaqueAt: (f.opaqueAt != null) ? f.opaqueAt : 1,
        }];
    },

// __clampChannels__ (new in v8.4.0) - clamp each color channel to a range set by `lowColor` and `highColor` values
// + Since v8.7.0, this filter also accepts `lowColor` and `highColor` CSS color Strings in place of the `lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue` values
    clampChannels: function (f) {

        let lowRed = (f.lowRed != null) ? f.lowRed : 0,
            lowGreen = (f.lowGreen != null) ? f.lowGreen : 0,
            lowBlue = (f.lowBlue != null) ? f.lowBlue : 0,
            highRed = (f.highRed != null) ? f.highRed : 255,
            highGreen = (f.highGreen != null) ? f.highGreen : 255,
            highBlue = (f.highBlue != null) ? f.highBlue : 255;

        if (f.lowColor != null) {

            [lowRed, lowGreen, lowBlue] = colorEngine.extractRGBfromColor(f.lowColor);

            f.lowRed = lowRed;
            f.lowGreen = lowGreen;
            f.lowBlue = lowBlue;

            delete f.lowColor;
        }

        if (f.highColor != null) {

            [highRed, highGreen, highBlue] = colorEngine.extractRGBfromColor(f.highColor);

            f.highRed = highRed;
            f.highGreen = highGreen;
            f.highBlue = highBlue;

            delete f.highColor;
        }

        f.actions = [{
            action: CLAMP_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            lowRed,
            lowGreen,
            lowBlue,
            highRed,
            highGreen,
            highBlue,
        }];
    },

// __compose__ (new in v8.4.0) - perform a composite operation on two images; available `compose` options include: `'destination-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'source-only', 'source-over' (default), 'source-in', 'source-out', 'source-atop', 'clear', and 'xor'` - see [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators)
    compose: function (f) {
        f.actions = [{
            action: COMPOSE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            lineMix: (f.lineMix != null) ? f.lineMix : ZERO_STR,
            compose: (f.compose != null) ? f.compose : SOURCE_OVER,
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __corrode__ (new in v8.5.2) - performs a special form of matrix operation on each pixel's color and alpha channels, calculating the new value using neighbouring pixel values.
// + Note that this filter is expensive, thus much slower to complete compared to other filter effects. Memoization is strongly advised!
// + The matrix dimensions can be set using the `width` and `height` arguments, while setting the home pixel's position within the matrix can be set using the `offsetX` and `offsetY` arguments.
// + The operation will set the pixel's channel value to match either the lowest, highest, mean or median values as dictated by its neighbours - this value is set in the `level` attribute.
// + Channels can be selected by setting the `includeRed`, `includeGreen`, `includeBlue` (all false by default) and `includeAlpha` (default: true) flags.
    corrode: function (f) {
        f.actions = [{
            action: CORRODE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            width: (f.width != null) ? f.width : 3,
            height: (f.height != null) ? f.height : 3,
            offsetX: (f.offsetX != null) ? f.offsetX : 1,
            offsetY: (f.offsetY != null) ? f.offsetY : 1,
            includeRed: (f.includeRed != null) ? f.includeRed : false,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : false,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : false,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : true,
            operation: (f.operation != null) ? f.operation : MEAN,
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __curveWeights__ (new in v8.6.1) - curves filter (for image processing tonality). The weights array must by 1024 elements long, with each element defaulting to a value of 1.0
    curveWeights: function (f) {
        f.actions = [{
            action: VARY_CHANNELS_BY_WEIGHTS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            weights: (f.weights != null) ? f.weights : false,
            useMixedChannel: (f.useMixedChannel != null) ? f.useMixedChannel : true,
        }];
    },

// __cyan__ - removes red channel color from the image, and averages the remaining channel colors
    cyan: function (f) {
        f.actions = [{
            action: AVERAGE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeGreen: true,
            includeBlue: true,
            excludeRed: true,
        }];
    },

// __displace__ (new in v8.4.0) - moves pixels around the image, based on the color channel values supplied by a displacement map image
    displace: function (f) {
        f.actions = [{
            action: DISPLACE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            lineMix: (f.lineMix != null) ? f.lineMix : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            channelX: (f.channelX != null) ? f.channelX : RED,
            channelY: (f.channelY != null) ? f.channelY : GREEN,
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
            action: MATRIX,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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
                action: GRAYSCALE,
                lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
                lineOut: EMBOSS_WORK,
            });
        }
        else {
            actions.push({
                action: AVERAGE_CHANNELS,
                lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
                lineOut: EMBOSS_WORK,
                includeRed: true,
                includeGreen: true,
                includeBlue: true,
            });
        }
        if (f.clamp) {
            actions.push({
                action: CLAMP_CHANNELS,
                lineIn: EMBOSS_WORK,
                lineOut: EMBOSS_WORK,
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
                action: GAUSSIAN_BLUR,
                lineIn: EMBOSS_WORK,
                lineOut: EMBOSS_WORK,
                radius: f.smoothing,
            });
        }
        actions.push({
            action: EMBOSS,
            lineIn: EMBOSS_WORK,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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
// + Note that the `alpha` value is given in the range `0-255` (like the color channels), not `0-1` or `0%-100%` (as is expected in various CSS color String definitions)
// + Since v8.7.0, this filter also accepts a `reference` color string in place of the `red, green, blue, alpha` values
    flood: function (f) {

        let red = (f.red != null) ? f.red : 0,
            green = (f.green != null) ? f.green : 0,
            blue = (f.blue != null) ? f.blue : 0,
            alpha = (f.alpha != null) ? f.alpha : 255;

        const excludeAlpha = (f.excludeAlpha != null) ? f.excludeAlpha : false;

        if (f.reference != null) {

            [red, green, blue, alpha] = colorEngine.extractRGBfromColor(f.reference);

            alpha = _round(alpha * 255);

            f.red = red;
            f.green = green;
            f.blue = blue;
            f.alpha = alpha;

            delete f.reference;
        }

        f.actions = [{
            action: FLOOD,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            red,
            green,
            blue,
            alpha,
            excludeAlpha,
        }];
    },

// __gaussianBlur__ - from this GitHub repository: https://github.com/nodeca/glur/blob/master/index.js (code accessed 1 June 2021)
    gaussianBlur: function (f) {
        f.actions = [{
            action: GAUSSIAN_BLUR,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            radius: (f.radius != null) ? f.radius : 1,
        }];
    },

// __glitch__ - semi-randomly shift rows left/right
    glitch: function (f) {
        f.actions = [{
            action: GLITCH,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            useMixedChannel: (f.useMixedChannel != null) ? f.useMixedChannel : true,
            seed: (f.seed != null) ? f.seed : DEFAULT_SEED,
            step: (f.step != null) ? f.step : 1,
            offsetMin: (f.offsetMin != null) ? f.offsetMin : 0,
            offsetMax: (f.offsetMax != null) ? f.offsetMax : 0,
            offsetRedMin: (f.offsetRedMin != null) ? f.offsetRedMin : 0,
            offsetRedMax: (f.offsetRedMax != null) ? f.offsetRedMax : 0,
            offsetGreenMin: (f.offsetGreenMin != null) ? f.offsetGreenMin : 0,
            offsetGreenMax: (f.offsetGreenMax != null) ? f.offsetGreenMax : 0,
            offsetBlueMin: (f.offsetBlueMin != null) ? f.offsetBlueMin : 0,
            offsetBlueMax: (f.offsetBlueMax != null) ? f.offsetBlueMax : 0,
            offsetAlphaMin: (f.offsetAlphaMin != null) ? f.offsetAlphaMin : 0,
            offsetAlphaMax: (f.offsetAlphaMax != null) ? f.offsetAlphaMax : 0,
            transparentEdges: (f.transparentEdges != null) ? f.transparentEdges : false,
            level: (f.level != null) ? f.level : 0,
        }];
    },

// __gray__ (new in v8.4.0) - averages the three color channel colors
    gray: function (f) {
        f.actions = [{
            action: AVERAGE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

// __grayscale__ - produces a more realistic black-and-white photograph effect
    grayscale: function (f) {
        f.actions = [{
            action: GRAYSCALE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __green__ - removes red and blue channel color from the image
    green: function (f) {
        f.actions = [{
            action: AVERAGE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeRed: true,
            excludeBlue: true,
        }];
    },

// __image__ (new in v8.4.0) - load an image into the filter engine, where it can then be used by other filter actions - useful for effects such as watermarking an image
    image: function (f) {

        f.actions = [{
            action: PROCESS_IMAGE,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            asset: (f.asset != null) ? f.asset : ZERO_STR,
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
            action: INVERT_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

// __magenta__ - removes green channel color from the image, and averages the remaining channel colors
    magenta: function (f) {
        f.actions = [{
            action: AVERAGE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeBlue: true,
            excludeGreen: true,
        }];
    },

// __mapToGradient__ - produces a more realistic black-and-white photograph effect
    mapToGradient: function (f) {

        if (f.gradient && f.gradient.substring) f.gradient = styles[f.gradient];

        f.actions = [{
            action: MAP_TO_GRADIENT,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            useNaturalGrayscale: (f.useNaturalGrayscale != null) ? f.useNaturalGrayscale : false,
            gradient: f.gradient || makeGradient(),
        }];
    },

// __matrix__ - applies a 3x3 convolution matrix, kernel or mask operation to the image
    matrix: function (f) {
        f.actions = [{
            action: MATRIX,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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
            action: MATRIX,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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

// __newsprint__ - removes red and green channel color from the image
    newsprint: function (f) {
        f.actions = [{
            action: NEWSPRINT,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: (f.width != null) ? f.width : 1,
        }];
    },

// __notblue__ - zeroes the blue channel values (not the same effect as the yellow filter)
    notblue: function (f) {
        f.actions = [{
            action: SET_CHANNEL_TO_LEVEL,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeBlue: true,
            level: 0,
        }];
    },

// __notgreen__ - zeroes the green channel values (not the same effect as the magenta filter)
    notgreen: function (f) {
        f.actions = [{
            action: SET_CHANNEL_TO_LEVEL,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeGreen: true,
            level: 0,
        }];
    },

// __notred__ - zeroes the red channel values (not the same effect as the cyan filter)
    notred: function (f) {
        f.actions = [{
            action: SET_CHANNEL_TO_LEVEL,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            level: 0,
        }];
    },

// __offset__ (new in v8.4.0) - moves the image in its entirety by the given offset
    offset: function (f) {
        f.actions = [{
            action: OFFSET,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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
            action: OFFSET,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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

// __pixelate__ - averages the colors in a block to produce a series of obscuring tiles. This is a simplified version of the `tiles` filter
    pixelate: function (f) {
        f.actions = [{
            action: PIXELATE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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

// __randomNoise__ (new in v8.6.0) - creates a stippling effect across the image
    randomNoise: function (f) {

        const noiseType = (NOISE_VALUES.includes(f.noiseType)) ? f.noiseType : RANDOM;

        f.actions = [{
            action: RANDOM_NOISE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: (f.width != null) ? f.width : 1,
            height: (f.height != null) ? f.height : 1,
            seed: (f.seed != null) ? f.seed : DEFAULT_SEED,
            noiseType,
            level: (f.level != null) ? f.level : 0,
            noWrap: (f.noWrap != null) ? f.noWrap : false,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : true,
            excludeTransparentPixels: (f.excludeTransparentPixels != null) ? f.excludeTransparentPixels : true,
        }];
    },

// __red__ - removes blue and green channel color from the image
    red: function (f) {
        f.actions = [{
            action: AVERAGE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeGreen: true,
            excludeBlue: true,
        }];
    },

// __reducePalette__ - reduce the number of colors in its palette
    reducePalette: function (f) {

        let palette = (f.palette != null) ? f.palette : BLACK_WHITE;

        f.actions = [];

        if (palette.substring) {

            if (palette.includes(ARG_SPLITTER)) {

                palette = palette.split(ARG_SPLITTER);
                palette.forEach(p => p.trim());
            }
        }

        // `useBluenoise` is deprecated
        // + use `noiseType: 'bluenoise'` instead
        let noiseType = (f.useBluenoise) ? BLUENOISE : f.noiseType || RANDOM;
        if (!NOISE_VALUES.includes(noiseType)) noiseType = RANDOM;

        f.actions.push({
            action: REDUCE_PALETTE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            seed: (f.seed != null) ? f.seed : DEFAULT_SEED,
            minimumColorDistance: (f.minimumColorDistance != null) ? f.minimumColorDistance : 1000,
            useLabForPaletteDistance: (f.useLabForPaletteDistance != null) ? f.useLabForPaletteDistance : false,
            palette,
            noiseType,
            opacity: (f.opacity != null) ? f.opacity : 1,
        });
    },

// __saturation__ - alters the saturation level of the image
    saturation: function (f) {
        const level = (f.level != null) ? f.level : 1;

        f.actions = [{
            action: MODULATE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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
            action: TINT_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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
            action: MATRIX,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
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

// __swirl__ - for each pixel, move the pixel radially according to its distance from a given coordinate and associated angle for that coordinate.
// + This filter can handle multiple swirls in a single pass
    swirl: function (f) {
        const startX = (f.startX != null) ? f.startX : PC50,
            startY = (f.startY != null) ? f.startY : PC50,
            innerRadius = (f.innerRadius != null) ? f.innerRadius : 0,
            outerRadius = (f.outerRadius != null) ? f.outerRadius : PC30,
            angle = (f.angle != null) ? f.angle : 0,
            easing = (f.easing != null) ? f.easing : LINEAR,
            staticSwirls = (f.staticSwirls != null) ? f.staticSwirls : [];

        const swirls = [...staticSwirls];
        swirls.push([startX, startY, innerRadius, outerRadius, angle, easing]);

        f.actions = [{
            action: SWIRL,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            swirls,
        }];
    },

// __threshold__ - creates a duotone effect - grayscales the input then, for each pixel, checks the color channel values against a "level" argument: pixels with channel values above the level value are assigned to the 'high' color; otherwise they are updated to the 'low' color.
// + Since v8.7.0, this filter also accepts `lowColor` and `highColor` CSS color Strings in place of the `lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue` values
    threshold: function (f) {
        let lowRed = (f.lowRed != null) ? f.lowRed : 0,
            lowGreen = (f.lowGreen != null) ? f.lowGreen : 0,
            lowBlue = (f.lowBlue != null) ? f.lowBlue : 0,
            lowAlpha = (f.lowAlpha != null) ? f.lowAlpha : 255,
            highRed = (f.highRed != null) ? f.highRed : 255,
            highGreen = (f.highGreen != null) ? f.highGreen : 255,
            highBlue = (f.highBlue != null) ? f.highBlue : 255,
            highAlpha = (f.highAlpha != null) ? f.highAlpha : 255;

        if (f.lowColor != null) {

            [lowRed, lowGreen, lowBlue, lowAlpha] = colorEngine.extractRGBfromColor(f.lowColor);

            lowAlpha = _round(lowAlpha * 255);

            f.lowRed = lowRed;
            f.lowGreen = lowGreen;
            f.lowBlue = lowBlue;
            f.lowAlpha = lowAlpha;

            f.low = [lowRed, lowGreen, lowBlue, lowAlpha];

            delete f.lowColor;
        }

        if (f.highColor != null) {

            [highRed, highGreen, highBlue, highAlpha] = colorEngine.extractRGBfromColor(f.highColor);

            highAlpha = _round(highAlpha * 255);

            f.highRed = highRed;
            f.highGreen = highGreen;
            f.highBlue = highBlue;
            f.highAlpha = highAlpha;

            f.high = [highRed, highGreen, highBlue, highAlpha];

            delete f.highColor;
        }

        const low = (f.low != null) ? f.low : [lowRed, lowGreen, lowBlue, lowAlpha],
            high = (f.high != null) ? f.high : [highRed, highGreen, highBlue, highAlpha];

        f.actions = [{
            action: THRESHOLD,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 128,
            red: (f.red != null) ? f.red : 128,
            green: (f.green != null) ? f.green : 128,
            blue: (f.blue != null) ? f.blue : 128,
            alpha: (f.alpha != null) ? f.alpha : 128,
            low,
            high,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            useMixedChannel: (f.useMixedChannel != null) ? f.useMixedChannel : true,
        }];
    },

// __tiles__ - averages the colors in a group of pixels to produce a series of obscuring tiles. This is a more complex version of the `pixelate` filter
    tiles: function (f) {
        f.actions = [{
            action: TILES,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            tileWidth: (f.tileWidth != null) ? f.tileWidth : 1,
            tileHeight: (f.tileHeight != null) ? f.tileHeight : 1,
            tileRadius: (f.tileRadius != null) ? f.tileRadius : 1,
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            angle: (f.angle != null) ? f.angle : 0,
            points: (f.points != null) ? f.points : RECT_GRID,
            seed: (f.seed != null) ? f.seed : DEFAULT_SEED,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
        }];
    },

// __tint__ - has similarities to the SVG &lt;feColorMatrix> filter element, but excludes the alpha channel from calculations. Rather than set a matrix, we set nine arguments to determine how the value of each color channel in a pixel will affect both itself and its fellow color channels.
    tint: function (f) {

        let redInRed = (f.redInRed != null) ? f.redInRed : 1,
            redInGreen = (f.redInGreen != null) ? f.redInGreen : 0,
            redInBlue = (f.redInBlue != null) ? f.redInBlue : 0,
            greenInRed = (f.greenInRed != null) ? f.greenInRed : 0,
            greenInGreen = (f.greenInGreen != null) ? f.greenInGreen : 1,
            greenInBlue = (f.greenInBlue != null) ? f.greenInBlue : 0,
            blueInRed = (f.blueInRed != null) ? f.blueInRed : 0,
            blueInGreen = (f.blueInGreen != null) ? f.blueInGreen : 0,
            blueInBlue = (f.blueInBlue != null) ? f.blueInBlue : 1;

        if (f.redColor != null) {

            [redInRed, greenInRed, blueInRed] = colorEngine.extractRGBfromColor(f.redColor);

            redInRed /= 255;
            greenInRed /= 255;
            blueInRed /= 255;

            f.redInRed = redInRed;
            f.greenInRed = greenInRed;
            f.blueInRed = blueInRed;

            delete f.redColor;
        }

        if (f.greenColor != null) {

            [redInGreen, greenInGreen, blueInGreen] = colorEngine.extractRGBfromColor(f.greenColor);

            redInGreen /= 255;
            greenInGreen /= 255;
            blueInGreen /= 255;

            f.redInGreen = redInGreen;
            f.greenInGreen = greenInGreen;
            f.blueInGreen = blueInGreen;

            delete f.greenColor;
        }

        if (f.blueColor != null) {

            [redInBlue, greenInBlue, blueInBlue] = colorEngine.extractRGBfromColor(f.blueColor);

            redInBlue /= 255;
            greenInBlue /= 255;
            blueInBlue /= 255;

            f.redInBlue = redInBlue;
            f.greenInBlue = greenInBlue;
            f.blueInBlue = blueInBlue;

            delete f.blueColor;
        }

        f.actions = [{
            action: TINT_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            redInRed,
            redInGreen,
            redInBlue,
            greenInRed,
            greenInGreen,
            greenInBlue,
            blueInRed,
            blueInGreen,
            blueInBlue,
        }];
    },

// __userDefined__ - DEPRECATED - this filter method no longer has any effect, returning an unchanged image
    userDefined: function (f) {
        f.actions = [{
            action: USER_DEFINED_LEGACY,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __yellow__ - removes blue channel color from the image, and averages the remaining channel colors
    yellow: function (f) {
        f.actions = [{
            action: AVERAGE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            excludeBlue: true,
        }];
    },
});


// #### Prototype functions
// No additional prototype functions defined


// #### Factory
export const makeFilter = function (items) {

    if (!items) return false;
    return new Filter(items);
};

constructors.Filter = Filter;
