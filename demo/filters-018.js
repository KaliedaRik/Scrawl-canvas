// # Demo Filters 018
// Filter parameters: emboss

// [Run code](../../demo/filters-018.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, addCheckerboardBackground, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the background
addCheckerboardBackground(canvas, namespace);


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('emboss'),
    method: 'emboss',
    angle: 225,
    strength: 3,
    smoothing: 0,
    tolerance: 0,
    clamp: 0,
    postProcessResults: true,
    useNaturalGrayscale: false,
    keepOnlyChangedAreas: false,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('emboss')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Angle: ${dom.angle.value}°
    Strength: ${dom.strength.value}
    Smoothing: ${dom.smoothing.value}
    Clamp: ${dom.clamp.value}
    Tolerance: ${dom.tolerance.value}
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
    ['input', 'strength', '3'],
    ['input', 'angle', '225'],
    ['input', 'smoothing', '0'],
    ['input', 'clamp', '0'],
    ['input', 'tolerance', '0'],
    ['input', 'opacity', '1'],
    ['select', 'postProcessResults', 0],
    ['select', 'useNaturalGrayscale', 0],
    ['select', 'keepOnlyChangedAreas', 0],
    ['select', 'memoizeFilterOutput', 0],
]);


// Handle memoizeFilterOutput control
scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = (e.target.value === '0') ? false : true;
    piccy.set({ memoizeFilterOutput: val });

}, dom.memoizeFilterOutput);


// Setup remianing form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        strength: ['strength', 'float'],
        angle: ['angle', 'float'],
        smoothing: ['smoothing', 'round'],
        tolerance: ['tolerance', 'round'],
        clamp: ['clamp', 'round'],
        postProcessResults: ['postProcessResults', 'boolean'],
        useNaturalGrayscale: ['useNaturalGrayscale', 'boolean'],
        keepOnlyChangedAreas: ['keepOnlyChangedAreas', 'boolean'],
        opacity: ['opacity', 'float'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
