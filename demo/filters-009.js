// # Demo Filters 009
// Filter parameters: pixelate

// [Run code](../../demo/filters-009.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('pixelate'),
    method: 'pixelate',

    tileWidth: 10,
    tileHeight: 10,
    offsetX: 0,
    offsetY: 0,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('pixelate')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Tile dimensions - width: ${dom.tile_width.value}px, height: ${dom.tile_height.value}px
    Tile offset offset - x: ${dom.offset_x.value}px, y: ${dom.offset_y.value}px
    Opacity: ${dom.opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form
const dom = initializeDomInputs([
    ['input', 'tile_width', '10'],
    ['input', 'tile_height', '10'],
    ['input', 'offset_x', '0'],
    ['input', 'offset_y', '0'],
    ['input', 'opacity', '1'],
    ['select', 'includeRed', 1],
    ['select', 'includeGreen', 1],
    ['select', 'includeBlue', 1],
    ['select', 'includeAlpha', 0],
]);


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        tile_width: ['tileWidth', 'round'],
        tile_height: ['tileHeight', 'round'],
        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],

        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],

        opacity: ['opacity', 'float'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
