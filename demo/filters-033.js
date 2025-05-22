// # Demo Filters 033
// Parameters for: blur filter

// [Run code](../../demo/filters-033.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the blur filter
const legacy = scrawl.makeFilter({

    name: name('legacy-blur'),
    method: 'blur',
    includeAlpha: false,
    radius: 10,
    passes: 1,
    step: 1,
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

    filters: [name('legacy-blur')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Horizontal - Radius: ${dom.radiusHorizontal.value}, Step: ${dom.stepHorizontal.value}, Passes: ${dom.passesHorizontal.value}
    Vertical   - Radius: ${dom.radiusVertical.value}, Step: ${dom.stepVertical.value}, Passes: ${dom.passesVertical.value}

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
    ['input', 'radiusHorizontal', '10'],
    ['input', 'passesHorizontal', '1'],
    ['input', 'stepHorizontal', '1'],
    ['input', 'radiusVertical', '10'],
    ['input', 'passesVertical', '1'],
    ['input', 'stepVertical', '1'],
    ['input', 'opacity', '1'],
    ['select', 'includeRed', 1],
    ['select', 'includeGreen', 1],
    ['select', 'includeBlue', 1],
    ['select', 'includeAlpha', 0],
    ['select', 'processHorizontal', 1],
    ['select', 'processVertical', 1],
    ['select', 'excludeTransparentPixels', 1],
    ['select', 'memoizeFilterOutput', 0],
]);

// Update legacy filter attributes
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: legacy,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        processHorizontal: ['processHorizontal', 'boolean'],
        radiusHorizontal: ['radiusHorizontal', 'float'],
        passesHorizontal: ['passesHorizontal', 'round'],
        stepHorizontal: ['stepHorizontal', 'round'],

        processVertical: ['processVertical', 'boolean'],
        radiusVertical: ['radiusVertical', 'float'],
        passesVertical: ['passesVertical', 'round'],
        stepVertical: ['stepVertical', 'round'],

        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],

        excludeTransparentPixels: ['excludeTransparentPixels', 'boolean'],

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
