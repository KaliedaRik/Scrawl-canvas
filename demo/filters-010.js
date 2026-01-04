// # Demo Filters 010
// Filter parameters: chroma

// [Run code](../../demo/filters-010.html)
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
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('chroma')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    (Low color: ${dom.lowColor.value}, High color: ${dom.highColor.value})

    Feather (overides channels): ${dom.feather.value}
        Feather channels - red: ${dom.featherRed.value}, green: ${dom.featherGreen.value}, blue: ${dom.featherBlue.value}

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
const dom = scrawl.initializeDomInputs([
    ['input', 'lowColor', '#000000'],
    ['input', 'highColor', '#5c7f5c'],
    ['input', 'opacity', '1'],
    ['input', 'feather', '0'],
    ['input', 'featherRed', '0'],
    ['input', 'featherGreen', '0'],
    ['input', 'featherBlue', '0'],
]);

// Handle color input
const interpretColors = () => myFilter.set({ ranges: [[dom.lowColor.value, dom.highColor.value]] });
scrawl.addNativeListener(['input', 'change'], interpretColors, '.controlItem');

// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        feather: ['feather', 'round'],
        featherRed: ['featherRed', 'round'],
        featherGreen: ['featherGreen', 'round'],
        featherBlue: ['featherBlue', 'round'],

        opacity: ['opacity', 'float'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
