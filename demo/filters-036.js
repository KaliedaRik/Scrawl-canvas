// # Demo Filters 036
// Parameters for: OffsetChannels filter

// [Run code](../../demo/filters-036.html)
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
const offset = scrawl.makeFilter({

    name: name('offset'),
    method: 'offsetChannels',
    offsetRedX: -20,
    offsetRedY: -20,
    offsetGreenX: 20,
    offsetGreenY: 20,
    offsetBlueX: -20,
    offsetBlueY: 20,
    useInputAsMask: false,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('offset')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Red offset - X: ${dom.offsetRedX.value}; Y ${dom.offsetRedY.value}
    Green offset - X: ${dom.offsetGreenX.value}; Y ${dom.offsetGreenY.value}
    Blue offset - X: ${dom.offsetBlueX.value}; Y ${dom.offsetBlueY.value}
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
    ['input', 'offsetRedX', '-20'],
    ['input', 'offsetRedY', '-20'],
    ['input', 'offsetGreenX', '20'],
    ['input', 'offsetGreenY', '20'],
    ['input', 'offsetBlueX', '-20'],
    ['input', 'offsetBlueY', '20'],
    ['input', 'opacity', '1'],
    ['select', 'useInputAsMask', 0],
]);


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: offset,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        opacity: ['opacity', 'float'],
        offsetRedX: ['offsetRedX', 'round'],
        offsetRedY: ['offsetRedY', 'round'],
        offsetGreenX: ['offsetGreenX', 'round'],
        offsetGreenY: ['offsetGreenY', 'round'],
        offsetBlueX: ['offsetBlueX', 'round'],
        offsetBlueY: ['offsetBlueY', 'round'],
        useInputAsMask: ['useInputAsMask', 'boolean'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
