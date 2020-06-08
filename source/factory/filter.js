// # Filter factory
// Filters take in an image representation of an [entity](../mixin/entity.html), [Group](./group.html) of entitys or a [Cell](./cell.html) display and, by manipulating the image's data, return an updated image which replaces those entitys or cell in the final output display.
//
// Scrawl-canvas defines its filters in __Filter objects__, detailed in this module. The functionality to make use of these objects is coded up in the [filter mixin](../mixin/filter.html), which is used by the Cell, Group and all entity factories.
//
// Scrawl-canvas uses a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) to generate filter outputs - defined in the [filter web worker](../worker/filter.html). It supports a number of common filter algorithms:
// + `grayscale` - desaturates the image
// + `sepia` - desaturates the image, then 'antiques' it by adding back some yellow tone
// + `invert` - turns white into black, and similar across the spectrum
// + `red` - suppresses the image's green and blue channels
// + `green` - suppresses the image's red and blue channels
// + `blue` - suppresses the image's red and green channels
// + `notred` - suppresses the image's red channel
// + `notgreen` - suppresses the image's green channel
// + `notblue` - suppresses the image's blue channel
// + `cyan` - averages the image's blue and green channels, and suppresses the red channel
// + `magenta` - averages the image's red and blue channels, and suppresses the green channel
// + `yellow` - averages the image's red and green channels, and suppresses the blue channel
// + `brightness` - multiplies the red, green and blue channel values by a value supplied in the `filter.level` attribute
// + `saturation` - multiplies the red, green and blue channel values by a value supplied in the `filter.level` attribute, then normalizes the result
// + `threshold` - desaturates each pixel then tests it against `filter.level` value; those pixels below the level are set to the `filter.lowRGB` values while the rest are set to the `filter.highRGB` values
// + `channels` - multiply each pixel's channel values by the values set in the `filter.RGB` attributes
// + `channelstep` - divide, floor, and then multiply each pixel's channel values by the values set in the `filter.RGB` attributes
// + `tint` - a more fine-grained form of the channels filter
// + `chroma` - (the green-screen effect) - will evaluate each pixel against a range array; pixels that fall within the range are set to transparent
// + `pixelate` - create tiles - whose dimensions and positions are determined by values set in the filter `tileWidth`, `tileHeight`, `offsetX` and `offsetY` attributes - across the image and then average the pixels in each tile to a single color
// + `blur` - creates a blurred image. Note: can be slow across larger images! The degree of the blur - which does not follow conventional algorithms such as gaussian - is determined by the filter attribute values for `radius` (number), `passes` (number) and `shrink` (boolean)
// + `matrix` - apply a 3x3 matrix transform to each of the image's pixels
// + `matrix5` - apply a 5x5 matrix transform to each of the image's pixels
// 
// Scrawl-canvas can also use __user-defined filters__.
//
// Filters use the __base__ mixin, thus they come equipped with packet functionality, alongside clone and kill functions.
//
// Note that [CSS-mediated filters](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) - `url()`, `blur()`, `brightness()`, `contrast()`, `drop-shadow()`, `grayscale()`, `hue-rotate()`, `invert()`, `opacity()`, `saturate()`, `sepia()` - can also be applied to DOM elements wrapped into Scrawl-canvas objects (Stack, Element, Canvas) in the normal way. Browsers will apply CSS filters as the final operation in their paint routines.
//
// TODO: we've had to move all the code from the [filter web worker](../worker/filter.html) into a new, [comment-free module](../worker/filter-stringed.html) file because tools like [CreateReactApp](https://reactjs.org/docs/create-a-new-react-app.html#create-react-app) - which uses [Webpack](https://webpack.js.org/) as its bundler of choice - breaks when we `yarn add scrawl-canvas` to a project.
// + The root of the issue is that [Babel](https://babeljs.io/) currently breaks when it encounters the `import.meta` attribute.
// + Babel do supply a plugin which is supposed to address this issue: [babel-plugin-syntax-import-meta](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-import-meta). But trying to add this to a Webpack configuration - particularly as implemented by create-react-app - is, at best, a nightmare.


// #### Demos:
// + [Canvas-007](../../demo/canvas-007.html) - Apply filters at the entity, group and cell level
// + [Canvas-020](../../demo/canvas-020.html) - Testing createImageFromXXX functionality
// + [Canvas-027](../../demo/canvas-027.html) - Video control and manipulation; chroma-based hit zone
// + [Component-004](../../demo/component-004.html) - Scrawl-canvas packets; save and load a range of different entitys


// #### Imports
import { constructors, cell, group, entity } from '../core/library.js';
import { mergeOver, removeItem } from '../core/utilities.js';

import baseMix from '../mixin/base.js';


// #### Filter constructor
const Filter = function (items = {}) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);
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
let defaultAttributes = {


// All filters need to set out their __method__. For preset methods, a method string (eg 'grayscale', 'sepia') is sufficient. Bespoke methods require a function
    method: '',


// The following methods require no further attributes: 
//
//     `grayscale`, `sepia`, `invert`
//     `red`, `green`, `blue`
//     `notred`, `notgreen`, `notblue`
//     `cyan`, `magenta`, `yellow`


// The following methods require the __level__ attribute:
//
//     `brightness`, `saturation`, `threshold`
    level: 0,



// The `threshhold` filter will default to setting (desaturated) pixels below a given level (0 - 255) to black, and those above the level to white. These colours can be changed by using the __low__ and __high__ channel attributes
    lowRed: 0,
    lowGreen: 0,
    lowBlue: 0,
    highRed: 255,
    highGreen: 255,
    highBlue: 255,


// The `channels` and `channelstep` methods make use of the __red__, __green__ and __blue__ attributes
    red: 0,
    green: 0,
    blue: 0,


// The `tint` method uses nine attributes
    redInRed: 0,
    redInGreen: 0,
    redInBlue: 0,
    greenInRed: 0,
    greenInGreen: 0,
    greenInBlue: 0,
    blueInRed: 0,
    blueInGreen: 0,
    blueInBlue: 0,


// The `pixelate` method requires tile dimensions and, optionally, offset coordinates which should not exceed the tile dimensions
    offsetX: 0,
    offsetY: 0,
    tileWidth: 1,
    tileHeight: 1,


// The `blur` method uses the following attributes:
// + the __radius__ of the blur effect, in pixels
// + the __passes__ attribute (1+) determines how many times the blur filter will iterate
// + the __shrinkingRadius__ flag reduces the radius by approx 70% on each successive pass
// + when __includeAlpha__ flag is true, filter will include the alpha channel - note this will make the edges of the entity translucent
    radius: 1,
    passes: 1,
    shrinkingRadius: false,
    includeAlpha: false,


// The `matrix` method requires a weights attribute - an array of 9 numbers in the following format:
//
//     weights: [
//         topLeftWeight,
//         topCenterWeight,
//         topRightWeight,
//         middleLeftWeight,
//         homePixelWeight,
//         middleRightWeight,
//         bottomLeftWeight,
//         bottomCenterWeight,
//         bottomRightWeight,
//     ]
//
// ... where the top row is the row above the home pixel, etc
//
// The method also makes use of the __includeAlpha__ attribute.

// The `matrix5` method is the same as the matrix method except that its weights array should contain 25 elements, to cover all the positions (from top-left corner) in a 5x5 grid
    weights: null,


// The __ranges__ attribute - used by the `chroma` method - needs to be an array of arrays with the following format:
//
//     [[minRed, minGreen, minBlue, maxRed, maxGreen, maxBlue], etc]
//
// ... multiple ranges can be defined - for instance to key out the lightest and darkest hues:
//
//     ranges: [[0, 0, 0, 80, 80, 80], [180, 180, 180, 255, 255, 255]]
    ranges: null,


// The `user-defined` filter should be set as a String value of the function's contents (the bits between the { curly braces }) on the __userDefined__ attribute. The function can take no arguments, and can only use variables defined above (or the __udVariableN__ attributes below). The function can also use __self__ variables supplied by the web worker - see the worker/filter.js for more information
    userDefined: '',
    udVariable0: '',
    udVariable1: '',
    udVariable2: '',
    udVariable3: '',
    udVariable4: '',
    udVariable5: '',
    udVariable6: '',
    udVariable7: '',
    udVariable8: '',
    udVariable9: '',
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
// No additional functionality required


// #### Prototype functions
// No additional prototype functions defined


// #### Filter webworker pool
// Because starting a web worker is an expensive operation, and a number of different filters may be required to render displays across a number of different &lt;canvas> elements in a web page, Scrawl-canvas operates a pool of web workers to perform work as-and-when required.
const filterPool = [];

// `Exported function` __requestFilterWorker__
const requestFilterWorker = function () {

    if (!filterPool.length) filterPool.push(buildFilterWorker());

    return filterPool.shift();
};

// `Exported function` __releaseFilterWorker__ - to avoid memory leaks, ___all requested filter workers MUST be released back to the filter pool as soon as their work has completed___.
const releaseFilterWorker = function (f) {

    filterPool.push(f);
};

// #### IMPORTANT!
// + Almost all modern browsers support import.meta.url
// + Toolchain bundlers generally DO NOT SUPPORT import.meta.url
// + The workaround is to gather all web worker code into a single file, string it, and build an url from that string. Yes, it is ugly. No, there is no viable production-ready alternative to the following.
//
// For use in a website that does not use webpack, rollup, parcel, etc in their toolchain
// + Comment out all the lines marked 'BUNDLED SITE'
// + Uncomment the lines marked 'MODERN SITE'
// 
// By default, Scrawl-canvas is distributed in a bundler-safe form

// BUNDLED SITE
import { filterUrl } from '../worker/filter-stringed.js';                       

// __buildFilterWorker__ - create a new filter web worker
const buildFilterWorker = function () {

    // MODERN SITE
    // let path = import.meta.url.slice(0, -('factory/filter.js'.length)); 

    // MODERN SITE    
    // let filterUrl = (window.scrawlEnvironmentOffscreenCanvasSupported) ?    

    // MODERN SITE 
    //     `${path}worker/filter_canvas.js` :    

    // MODERN SITE                              
    //     `${path}worker/filter.js`;                                           

    // BUNDLED SITE
    return new Worker(filterUrl);                                               
};


// `Exported function` __actionFilterWorker__ - send a task to the filter web worker, and retrieve the resulting image. This function returns a Promise.
const actionFilterWorker = function (worker, items) {

    return new Promise((resolve, reject) => {

        worker.onmessage = (e) => {

            if (e && e.data && e.data.image) resolve(e.data.image);
            else resolve(false);
        };

        worker.onerror = (e) => {

            console.log('error', e.lineno, e.message);
            resolve(false);
        };

        worker.postMessage(items);
    });
};


// #### Factory
// ```
// scrawl.makeFilter({
//
//     name: 'my-grayscale-filter',
//     method: 'grayscale',
//
// }).clone({
//
//     name: 'my-sepia-filter',
//     method: 'sepia',
// });
//
// scrawl.makeFilter({
//
//     name: 'my-chroma-filter',
//     method: 'chroma',
//     ranges: [[0, 0, 0, 80, 80, 80], [180, 180, 180, 255, 255, 255]],
// });
//
// scrawl.makeFilter({
//
//     name: 'venetian-blinds-filter',
//     method: 'userDefined',
//
//     level: 9,
//
//     userDefined: `
//         let i, iz, j, jz,
//             level = filter.level || 6,
//             halfLevel = level / 2,
//             yw, transparent, pos;
//
//         for (i = localY, iz = localY + localHeight; i < iz; i++) {
//
//             transparent = (i % level > halfLevel) ? true : false;
//
//             if (transparent) {
//
//                 yw = (i * iWidth) + 3;
//              
//                 for (j = localX, jz = localX + localWidth; j < jz; j ++) {
//
//                     pos = yw + (j * 4);
//                     data[pos] = 0;
//                 }
//             }
//         }`,
// });
// ```
const makeFilter = function (items) {

    return new Filter(items);
};

constructors.Filter = Filter;


// #### Exports
export {
    makeFilter,
    requestFilterWorker,
    releaseFilterWorker,
    actionFilterWorker,
};
