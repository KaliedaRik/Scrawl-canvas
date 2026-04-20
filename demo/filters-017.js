// # Demo Filters 017
// Filter parameters: displace

// [Run code](../../demo/filters-017.html)
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
const noiseFilter = scrawl.makeFilter({

    name: name('noise'),
    method: 'image',

    asset: 'perlin',

    width: 500,
    height: 500,

    copyWidth: '100%',
    copyHeight: '100%',

    lineOut: 'map',
});

console.log(noiseFilter.saveAsPacket());

const myFilter = scrawl.makeFilter({

    name: name('displace'),
    method: 'displace',

    lineMix: 'map',

    offsetX: 0,
    offsetY: 0,

    scaleX: 20,
    scaleY: 20,
});

console.log(myFilter.saveAsPacket());


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('noise'), name('displace')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Scale - x: ${dom.scale_x.value}, y: ${dom.scale_y.value}
    Offset - x: ${dom.offset_x.value}, y: ${dom.offset_y.value}
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
const dom = scrawl.initializeDomInputs([
    ['input', 'offset_x', '0'],
    ['input', 'offset_y', '0'],
    ['input', 'scale_x', '20'],
    ['input', 'scale_y', '20'],
    ['input', 'opacity', '1'],
    ['select', 'transparent_edges', 0],
    ['select', 'useInputAsMask', 0],
]);


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
        useInputAsMask: ['useInputAsMask', 'boolean'],
        opacity: ['opacity', 'float'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
