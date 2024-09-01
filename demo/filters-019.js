// # Demo Filters 019
// Filter parameters: edgeDetect, sharpen

// [Run code](../../demo/filters-019.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filters
scrawl.makeFilter({

    name: name('edgeDetect'),
    method: 'edgeDetect',

}).clone({

    name: name('sharpen'),
    method: 'sharpen',
});


// Create the target entity
scrawl.makePicture({

    name: name('edgeDetect-image'),
    asset: 'iris',
    dimensions: ['50%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('edgeDetect')],

}).clone({

    name: name('sharpen-image'),
    startX: 300,
    filters: [name('sharpen')],
});


scrawl.makeLabel({

    name: name('edgeDetect-label'),
    text: 'Edge detect',

    fontString: '20px sans-serif',

    fillStyle: 'white',
    lineWidth: 4,

    method: 'drawThenFill',

    pivot: name('edgeDetect-image'),
    lockTo: 'pivot',
    offset: [5, 5],

}).clone({

    name: name('sharpen-label'),
    text: 'Sharpen',
    pivot: name('sharpen-image'),

});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
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
    ['input', 'opacity', '1'],
    ['select', 'memoizeFilterOutput', 0],
]);


// Setup form observer functionality
const myFilters = [
    scrawl.findFilter(name('edgeDetect')),
    scrawl.findFilter(name('sharpen')),
];

scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        const val = parseFloat(e.target.value)
        myFilters.forEach(f => f.set({ opacity: val }));
    }

}, dom.opacity);


const myPictures = [
    scrawl.findEntity(name('edgeDetect-image')),
    scrawl.findEntity(name('sharpen-image')),
];

scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = (e.target.value === '0') ? false : true;
    myPictures.forEach(p => p.set({ memoizeFilterOutput: val }));

}, dom.memoizeFilterOutput);


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, myPictures);


// #### Development and testing
console.log(scrawl.library);
