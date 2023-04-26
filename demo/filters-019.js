// # Demo Filters 019 
// Filter parameters: edgeDetect, sharpen

// [Run code](../../demo/filters-019.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    entity = scrawl.library.entity,
    filter = scrawl.library.filter;

scrawl.importDomImage('.flowers');


// Create the filters
scrawl.makeFilter({
    name: 'edgeDetect',
    method: 'edgeDetect',
}).clone({
    name: 'sharpen',
    method: 'sharpen',
});

// Create the target entity
scrawl.makePicture({

    name: 'edgeDetect-filter',
    asset: 'iris',

    start: [0, 0],
    dimensions: [300, 300],

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['edgeDetect'],

}).clone({

    name: 'sharpen-filter',
    startX: 300,
    filters: ['sharpen'],
});


scrawl.makePhrase({

    name: 'edgeDetect-label',
    text: 'Edge detect',

    font: '20px sans-serif',

    fillStyle: 'white',
    lineWidth: 4,

    method: 'drawThenFill',

    pivot: 'edgeDetect-filter',
    lockTo: 'pivot',
    offset: [5, 5],

}).clone({

    name: 'sharpen-label',
    text: 'Sharpen',
    pivot: 'sharpen-filter',

})


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
// Setup form observer functionality
const myFilters = [
    filter.edgeDetect,
    filter.sharpen
];

const myPictures = [
    entity['edgeDetect-filter'],
    entity['sharpen-filter']
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

let opacity = document.querySelector('#opacity');

// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', myPictures);


// #### Development and testing
console.log(scrawl.library);
