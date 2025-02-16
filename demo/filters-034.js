// # Demo Filters 034
// Parameters for: gaussianblur filter

// [Run code](../../demo/filters-034.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the gaussianblur filter
const gaussian = scrawl.makeFilter({

    name: name('gaussian-blur'),
    method: 'gaussianBlur',
    radius: 10,
});


// Create the Picture entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: [name('gaussian-blur')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Radius: ${dom.radius.value}
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
    ['input', 'radius', '10'],
    ['input', 'opacity', '1'],
    ['select', 'memoizeFilterOutput', 0],
]);

// Update the filter
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: gaussian,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        radius: ['radius', 'round'],
        opacity: ['opacity', 'float'],
    },
});

// Get the Picture entity to memoize the filter
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: dom.memoizeFilterOutput,

    target: piccy,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        memoizeFilterOutput: ['memoizeFilterOutput', 'boolean'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
