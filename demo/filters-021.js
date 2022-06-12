// # Demo Filters 021 
// Filter parameters: corrode

// [Run code](../../demo/filters-021.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'corrode',
    method: 'corrode',
});

// ... And apply it to the canvas's base Cell
canvas.setBase({
    filters: ['corrode'],
})


// Create the test entitys
const piccy = scrawl.makePicture({

    name: 'test-image',

    asset: 'iris',

    start: [380, 100],
    dimensions: [200, 200],
    copyDimensions: ['100%', '100%'],

    lineWidth: 4,
    strokeStyle: 'yellow',

    method: 'fillThenDraw',
});

scrawl.makeWheel({

    name: 'test-star-solid',

    radius: 90,

    start: [100, 100],
    handle: ['center', 'center'],

    fillStyle: 'orange',
    strokeStyle: 'purple',
    lineWidth: 10,
    method: 'fill',

}).clone({

    name: 'test-star-outline',
    startY: 200,
    method: 'draw',


}).clone({

    name: 'test-star-both',
    startY: 300,
    method: 'fillThenDraw',
});

scrawl.makePhrase({

    name: 'greeting-one',

    text: 'Hello',

    font: '130px bold sans-serif',

    lineWidth: 8,
    method: 'draw',

    start: [210, 370],
    width: 400,
    roll: -82,

}).clone({

    name: 'greeting-two',
    text: 'World!',
    method: 'fill',
    start: [350, 10],
    size: '70px',
    roll: 5,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Matrix dimensions - width: ${matrix_width.value} height: ${matrix_height.value}\n    Matrix offset - x: ${matrix_offset_x.value} y: ${matrix_offset_y.value}\n    Opacity - ${opacity.value}`;
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

scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = (e.target.value === '0') ? false : true;

    canvas.base.set({ memoizeFilterOutput: val });

}, '#memoizeFilterOutput');


// Setup form
const matrix_width = document.querySelector('#matrix_width'),
    matrix_height = document.querySelector('#matrix_height'),
    matrix_offset_x = document.querySelector('#matrix_offset_x'),
    matrix_offset_y = document.querySelector('#matrix_offset_y'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
matrix_width.value = 3;
// @ts-expect-error
matrix_height.value = 3;
// @ts-expect-error
matrix_offset_x.value = 1;
// @ts-expect-error
matrix_offset_y.value = 1;
// @ts-expect-error
opacity.value = 1;

// @ts-expect-error
document.querySelector('#operation').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#includeRed').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#includeGreen').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#includeBlue').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#includeAlpha').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#memoizeFilterOutput').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
