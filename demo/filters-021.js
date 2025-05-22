// # Demo Filters 021
// Filter parameters: corrode

// [Run code](../../demo/filters-021.html)
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

    name: name('corrode'),
    method: 'corrode',
});

// ... And apply it to the canvas's base Cell
canvas.setBase({ filters: [name('corrode')] });


// Create the test entitys
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    start: [380, 100],
    dimensions: [200, 200],
    copyDimensions: ['100%', '100%'],
    lineWidth: 4,
    strokeStyle: 'yellow',
    method: 'fillThenDraw',
});

scrawl.makeWheel({

    name: name('circle-solid'),
    radius: 90,
    start: [100, 100],
    handle: ['center', 'center'],
    fillStyle: 'orange',
    strokeStyle: 'purple',
    lineWidth: 10,
    method: 'fill',

}).clone({

    name: name('circle-outline'),
    startY: 200,
    method: 'draw',


}).clone({

    name: name('circle-both'),
    startY: 300,
    method: 'fillThenDraw',
});

scrawl.makeLabel({

    name: name('greeting-one'),
    text: 'Hello',
    fontString: 'bold 130px sans-serif',
    lineWidth: 8,
    method: 'draw',
    start: [210, 370],
    roll: -82,

}).clone({

    name: name('greeting-two'),
    text: 'World!',
    method: 'fill',
    start: [350, 10],
    scale: 0.55,
    roll: 5,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Matrix dimensions - width: ${dom.matrix_width.value}, height: ${dom.matrix_height.value}
    Matrix offset - x: ${dom.matrix_offset_x.value}, y: ${dom.matrix_offset_y.value}
    Opacity - ${dom.opacity.value}`;
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
    ['input', 'matrix_width', '3'],
    ['input', 'matrix_height', '3'],
    ['input', 'matrix_offset_x', '1'],
    ['input', 'matrix_offset_y', '1'],
    ['input', 'opacity', '1'],
    ['select', 'operation', 0],
    ['select', 'includeRed', 1],
    ['select', 'includeGreen', 1],
    ['select', 'includeBlue', 1],
    ['select', 'includeAlpha', 0],
    ['select', 'memoizeFilterOutput', 0],
]);


// Handle the memoize filter selector
scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = (e.target.value === '0') ? false : true;
    canvas.setBase({ memoizeFilterOutput: val });

}, '#memoizeFilterOutput');


// Handle all other user inputs
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        matrix_width: ['width', 'round'],
        matrix_height: ['height', 'round'],
        matrix_offset_x: ['offsetX', 'round'],
        matrix_offset_y: ['offsetY', 'round'],

        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],

        opacity: ['opacity', 'float'],

        operation: ['operation', 'raw'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
