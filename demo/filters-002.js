// # Demo Filters 002
// Filter parameters: red, green, blue, cyan, magenta, yellow, notred, notgreen, notblue, grayscale, sepia, invert

// [Run code](../../demo/filters-002.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    entity = scrawl.library.entity,
    filter = scrawl.library.filter;

scrawl.importDomImage('.flowers');


// Create the filters
scrawl.makeFilter({
    name: 'red',
    method: 'red',
}).clone({
    name: 'green',
    method: 'green',
}).clone({
    name: 'blue',
    method: 'blue',
}).clone({
    name: 'cyan',
    method: 'cyan',
}).clone({
    name: 'magenta',
    method: 'magenta',
}).clone({
    name: 'yellow',
    method: 'yellow',
}).clone({
    name: 'notred',
    method: 'notred',
}).clone({
    name: 'notgreen',
    method: 'notgreen',
}).clone({
    name: 'notblue',
    method: 'notblue',
}).clone({
    name: 'grayscale',
    method: 'grayscale',
}).clone({
    name: 'sepia',
    method: 'sepia',
}).clone({
    name: 'invert',
    method: 'invert',
});


// Create the target entitys
scrawl.makePicture({

    name: 'red-filter',
    asset: 'iris',

    start: [10, 10],
    dimensions: [120, 120],

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['red'],

}).clone({

    name: 'green-filter',
    startX: 140,
    filters: ['green'],

}).clone({

    name: 'blue-filter',
    startX: 270,
    filters: ['blue'],

}).clone({

    name: 'cyan-filter',
    start: [10, 140],
    filters: ['cyan'],

}).clone({

    name: 'magenta-filter',
    startX: 140,
    filters: ['magenta'],

}).clone({

    name: 'yellow-filter',
    startX: 270,
    filters: ['yellow'],

}).clone({

    name: 'notred-filter',
    start: [10, 270],
    filters: ['notred'],

}).clone({

    name: 'notgreen-filter',
    startX: 140,
    filters: ['notgreen'],

}).clone({

    name: 'notblue-filter',
    startX: 270,
    filters: ['notblue'],

}).clone({

    name: 'grayscale-filter',
    start: [10, 400],
    filters: ['grayscale'],

}).clone({

    name: 'sepia-filter',
    startX: 140,
    filters: ['sepia'],

}).clone({

    name: 'invert-filter',
    startX: 270,
    filters: ['invert'],
});

scrawl.makePhrase({

    name: 'red-label',
    text: 'Red',

    font: '20px sans-serif',

    fillStyle: 'white',
    lineWidth: 4,

    method: 'drawThenFill',

    pivot: 'red-filter',
    lockTo: 'pivot',
    offset: [5, 5],

}).clone({

    name: 'green-label',
    text: 'Green',
    pivot: 'green-filter',

}).clone({

    name: 'blue-label',
    text: 'Blue',
    pivot: 'blue-filter',

}).clone({

    name: 'cyan-label',
    text: 'Cyan',
    pivot: 'cyan-filter',

}).clone({

    name: 'magenta-label',
    text: 'Magenta',
    pivot: 'magenta-filter',

}).clone({

    name: 'yellow-label',
    text: 'Yellow',
    pivot: 'yellow-filter',

}).clone({

    name: 'notred-label',
    text: 'Notred',
    pivot: 'notred-filter',

}).clone({

    name: 'notgreen-label',
    text: 'Notgreen',
    pivot: 'notgreen-filter',

}).clone({

    name: 'notblue-label',
    text: 'Notblue',
    pivot: 'notblue-filter',

}).clone({

    name: 'grayscale-label',
    text: 'Grayscale',
    pivot: 'grayscale-filter',

}).clone({

    name: 'sepia-label',
    text: 'Sepia',
    pivot: 'sepia-filter',

}).clone({

    name: 'invert-label',
    text: 'Invert',
    pivot: 'invert-filter',
});



// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
const myFilters = [
    filter.red,
    filter.green,
    filter.blue,
    filter.cyan,
    filter.magenta,
    filter.yellow,
    filter.notred,
    filter.notgreen,
    filter.notblue,
    filter.grayscale,
    filter.sepia,
    filter.invert
];

const myPictures = [
    entity['red-filter'],
    entity['green-filter'],
    entity['blue-filter'],
    entity['cyan-filter'],
    entity['magenta-filter'],
    entity['yellow-filter'],
    entity['notred-filter'],
    entity['notgreen-filter'],
    entity['notblue-filter'],
    entity['grayscale-filter'],
    entity['sepia-filter'],
    entity['invert-filter'],
];

scrawl.addNativeListener(['input', 'change'], (e) => {

    myFilters.forEach(f => f.set({ opacity: parseFloat(e.target.value) }));

}, '#opacity');

scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = (e.target.value === '0') ? false : true;

    myPictures.forEach(p => p.set({ memoizeFilterOutput: val }));

}, '#memoizeFilterOutput');

// Setup form
// @ts-expect-error
document.querySelector('#memoizeFilterOutput').options.selectedIndex = 0;
const opacity = document.querySelector('#opacity');
// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', myPictures);


// #### Development and testing
console.log(scrawl.library);
