// # Demo Filters 039
// Parameters for: unsharpen filter

// [Run code](../../demo/filters-039.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, addCheckerboardBackground } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the background
addCheckerboardBackground(scrawl, canvas, namespace);


// Create the filter
const unsharp = scrawl.makeFilter({

    name: name('unsharp'),
    method: 'unsharp',
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('unsharp')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Strength: ${dom.strength.value}
    Radius: ${dom.radius.value}
    Level: ${dom.level.value}
    Smoothing: ${dom.smoothing.value}
    Clamp: ${dom.clamp.value}
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
    ['input', 'strength', '0.8'],
    ['input', 'radius', '2'],
    ['input', 'level', '0.015'],
    ['input', 'smoothing', '0.015'],
    ['input', 'clamp', '0.08'],
    ['input', 'opacity', '1'],
]);

// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: unsharp,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        strength: ['strength', 'float'],
        smoothing: ['smoothing', 'float'],
        radius: ['radius', 'float'],
        level: ['level', 'float'],
        clamp: ['clamp', 'float'],
        opacity: ['opacity', 'float'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
