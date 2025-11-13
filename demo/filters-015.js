// # Demo Filters 015
// Filter parameters: tiles

// [Run code](../../demo/filters-015.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('tiles'),
    method: 'tiles',

    mode: 'rect',

    rectWidth: 20,
    rectHeight: 20,
    hexRadius: 14,
    randomCount: 100,
    originX: 200,
    originY: 200,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('tiles')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Tile dimensions - width: ${dom.rectWidth.value}px, height: ${dom.rectHeight.value}px, radius: ${dom.hexRadius.value}px
    Origin - x: ${dom.originX.value}px, y: ${dom.originY.value}px
    Angle: ${dom.angle.value}
    Random count: ${dom.randomCount.value}
    Opacity: ${dom.opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const dom = scrawl.initializeDomInputs([
    ['input', 'rectWidth', '20'],
    ['input', 'rectHeight', '20'],
    ['input', 'hexRadius', '14'],
    ['input', 'originX', '200'],
    ['input', 'originY', '200'],
    ['input', 'angle', '0'],
    ['input', 'randomCount', '100'],
    ['input', 'opacity', '1'],
    ['select', 'mode', 0],
    ['select', 'include_red', 1],
    ['select', 'include_green', 1],
    ['select', 'include_blue', 1],
    ['select', 'include_alpha', 0],
]);


// Setup form observer functionality for remaining inputs/selectors
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        mode: ['mode', 'raw'],

        rectWidth: ['rectWidth', 'round'],
        rectHeight: ['rectHeight', 'round'],
        hexRadius: ['hexRadius', 'round'],
        originX: ['originX', 'round'],
        originY: ['originY', 'round'],
        angle: ['angle', 'round'],
        randomCount: ['randomCount', 'round'],

        include_red: ['includeRed', 'boolean'],
        include_green: ['includeGreen', 'boolean'],
        include_blue: ['includeBlue', 'boolean'],
        include_alpha: ['includeAlpha', 'boolean'],

        premultiply: ['premultiply', 'boolean'],
        useInputAsMask: ['useInputAsMask', 'boolean'],

        opacity: ['opacity', 'float'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
