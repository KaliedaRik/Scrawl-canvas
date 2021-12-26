// # Demo Filters 009 
// Filter parameters: pixelate

// [Run code](../../demo/filters-009.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'pixelate',
    method: 'pixelate',

    tileWidth: 10,
    tileHeight: 10,
    offsetX: 0,
    offsetY: 0,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['pixelate'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    Tile dimensions - width: ${tile_width.value} height: ${tile_height.value}
    Offset - x: ${offset_x.value} y: ${offset_y.value}
    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

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

// Setup form
const tile_width = document.querySelector('#tile_width'),
    tile_height = document.querySelector('#tile_height'),
    offset_x = document.querySelector('#offset_x'),
    offset_y = document.querySelector('#offset_y'),
    opacity = document.querySelector('#opacity');

tile_width.value = 10;
tile_height.value = 10;
offset_x.value = 0;
offset_y.value = 0;
opacity.value = 1;

document.querySelector('#includeRed').options.selectedIndex = 1;
document.querySelector('#includeGreen').options.selectedIndex = 1;
document.querySelector('#includeBlue').options.selectedIndex = 1;
document.querySelector('#includeAlpha').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
