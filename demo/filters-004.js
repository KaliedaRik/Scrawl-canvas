// # Demo Filters 004
// Filter parameters: threshold

// [Run code](../../demo/filters-004.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('threshold'),
    method: 'threshold',

    level: 127,

    lowRed: 0,
    lowGreen: 0,
    lowBlue: 0,

    highRed: 255,
    highGreen: 255,
    highBlue: 255,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('threshold')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Low color: ${dom.lowColor.value}
    High color: ${dom.highColor.value}

    Level: ${dom.level.value}
    Red level: ${dom.red.value}
    Green level: ${dom.green.value}
    Blue level: ${dom.blue.value}
    Alpha level: ${dom.alpha.value};
    
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
    ['input', 'lowColor', '#000000'],
    ['input', 'highColor', '#ffffff'],
    ['input', 'level', '128'],
    ['input', 'red', '128'],
    ['input', 'green', '128'],
    ['input', 'blue', '128'],
    ['input', 'alpha', '128'],
    ['input', 'opacity', '1'],
    ['select', 'useMixedChannel', 1],
    ['select', 'includeRed', 1],
    ['select', 'includeGreen', 1],
    ['select', 'includeBlue', 1],
    ['select', 'includeAlpha', 0],
]);

// Updating the filter
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        opacity: ['opacity', 'float'],
        level: ['level', 'round'],
        lowColor: ['lowColor', 'raw'],
        highColor: ['highColor', 'raw'],
        red: ['red', 'round'],
        green: ['green', 'round'],
        blue: ['blue', 'round'],
        alpha: ['alpha', 'round'],
        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],
        useMixedChannel: ['useMixedChannel', 'boolean'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
