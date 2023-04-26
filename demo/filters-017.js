// # Demo Filters 017 
// Filter parameters: displace

// [Run code](../../demo/filters-017.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
scrawl.makeFilter({

    name: 'noise',
    method: 'image',

    asset: 'perlin',

    width: 500,
    height: 500,

    copyWidth: '100%',
    copyHeight: '100%',

    lineOut: 'map',
});

const myFilter = scrawl.makeFilter({

    name: 'displace',
    method: 'displace',

    lineMix: 'map',

    offsetX: 0,
    offsetY: 0,

    scaleX: 1,
    scaleY: 1,
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

    filters: ['noise', 'displace'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Scales - x: ${scaleX.value}, y: ${scaleY.value}\n    Offset - x: ${offsetX.value}, y: ${offsetY.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],
        scale_x: ['scaleX', 'float'],
        scale_y: ['scaleY', 'float'],
        transparent_edges: ['transparentEdges', 'boolean'],
        opacity: ['opacity', 'float'],
    },
});

// Setup form
const offsetX = document.querySelector('#offset_x'),
    offsetY = document.querySelector('#offset_y'),
    scaleX = document.querySelector('#scale_x'),
    scaleY = document.querySelector('#scale_y'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
offsetX.value = 0;
// @ts-expect-error
offsetY.value = 0;
// @ts-expect-error
scaleX.value = 1;
// @ts-expect-error
scaleY.value = 1;
// @ts-expect-error
opacity.value = 1;

// @ts-expect-error
document.querySelector('#transparent_edges').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
