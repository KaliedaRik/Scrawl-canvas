// # Demo Filters 032
// Parameters for: modulateOk filter

// [Run code](../../demo/filters-032.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('modulateOk'),
    method: 'modulateOk',
    channelA: 0,
    channelB: 1,
    channelL: 1,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('modulateOk')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Channel A (green-red): ${dom.channelA.value}
    Channel B (blue-yellow): ${dom.channelB.value}
    Channel L (luminance): ${dom.channelL.value}
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
    ['input', 'channelA', '0'],
    ['input', 'channelB', '1'],
    ['input', 'channelL', '1'],
    ['input', 'opacity', '1'],
    ['select', 'memoizeFilterOutput', 0],
]);


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        channelA: ['channelA', 'float'],
        channelB: ['channelB', 'float'],
        channelL: ['channelL', 'float'],
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
