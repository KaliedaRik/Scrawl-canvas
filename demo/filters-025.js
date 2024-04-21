// # Demo Filters 025
// Filter parameters: Glitch filter

// [Run code](../../demo/filters-025.html)
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
const glitch = scrawl.makeFilter({

    name: name('glitch'),
    method: 'glitch',
    level: 0.2,
    offsetMin: -10,
    offsetMax: 10,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('glitch')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Level: ${dom.level.value}
    Mixed offset - min: ${dom.offsetMin.value}; max ${dom.offsetMax.value}
    Red offset - min: ${dom.offsetRedMin.value}; max ${dom.offsetRedMax.value}
    Green offset - min: ${dom.offsetGreenMin.value}; max ${dom.offsetGreenMax.value}
    Blue offset - min: ${dom.offsetBlueMin.value}; max ${dom.offsetBlueMax.value}
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
    ['input', 'level', '0.2'],
    ['input', 'step', '1'],
    ['input', 'offsetMin', '-10'],
    ['input', 'offsetMax', '10'],
    ['input', 'offsetRedMin', '0'],
    ['input', 'offsetRedMax', '0'],
    ['input', 'offsetGreenMin', '0'],
    ['input', 'offsetGreenMax', '0'],
    ['input', 'offsetBlueMin', '0'],
    ['input', 'offsetBlueMax', '0'],
    ['input', 'offsetAlphaMin', '0'],
    ['input', 'offsetAlphaMax', '0'],
    ['input', 'opacity', '1'],
    ['select', 'useMixedChannel', 1],
    ['select', 'transparentEdges', 0],
]);


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: glitch,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        opacity: ['opacity', 'float'],
        level: ['level', 'float'],
        step: ['step', 'round'],
        offsetMin: ['offsetMin', 'round'],
        offsetMax: ['offsetMax', 'round'],
        offsetRedMin: ['offsetRedMin', 'round'],
        offsetRedMax: ['offsetRedMax', 'round'],
        offsetGreenMin: ['offsetGreenMin', 'round'],
        offsetGreenMax: ['offsetGreenMax', 'round'],
        offsetBlueMin: ['offsetBlueMin', 'round'],
        offsetBlueMax: ['offsetBlueMax', 'round'],
        useMixedChannel: ['useMixedChannel', 'boolean'],
        transparentEdges: ['transparentEdges', 'boolean'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
