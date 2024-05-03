// # Demo Filters 010
// Filter parameters: chroma

// [Run code](../../demo/filters-010.html)
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
addCheckerboardBackground(scrawl, canvas, namespace);


// Create the filter
// + Chroma filters can have more than one range; each range array should be added to the `ranges` attribute
const myFilter = scrawl.makeFilter({

    name: name('chroma'),
    method: 'chroma',

    ranges: [[0, 0, 0, 92, 127, 92]],
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('chroma')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    (Low color: ${dom.lowColor.value}, High color: ${dom.highColor.value})
    Range: [${myFilter.ranges}] → [${myFilter.actions[0].ranges}]
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
    ['input', 'lowColor', '#000000'],
    ['input', 'highColor', '#5c7f5c'],
    ['input', 'opacity', '1'],
]);

// Handle color input
const interpretColors = () => myFilter.set({ ranges: [[dom.lowColor.value, dom.highColor.value]] });
scrawl.addNativeListener(['input', 'change'], interpretColors, '.controlItem');

// Handle opacity input
const handleOpacity = () => myFilter.set({ opacity: parseFloat(dom.opacity.value) });
scrawl.addNativeListener(['input', 'change'], handleOpacity, '#opacity');


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
