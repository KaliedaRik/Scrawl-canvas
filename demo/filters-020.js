// # Demo Filters 020
// Parameters for: clampChannels filter

// [Run code](../../demo/filters-020.html)
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

    name: name('clamp'),
    method: 'clampChannels',
    lowRed: 20,
    lowGreen: 0,
    lowBlue: 120,
    highRed: 255,
    highGreen: 216,
    highBlue: 0,
    opacity: 1,
});

const colorFactory = scrawl.makeColor({

    name: name('colors'),
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('clamp')],
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Red - low: ${dom.low_red.value}, high - ${dom.high_red.value}
    Green - low: ${dom.low_green.value}, high - ${dom.high_green.value}
    Blue - low: ${dom.low_blue.value}, high - ${dom.high_blue.value}
    Color - low: ${dom.low_color.value}, high: ${dom.high_color.value}
    Opacity - ${dom.opacity.value}`;
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
    ['input', 'low_color', '#170078'],
    ['input', 'low_red', '20'],
    ['input', 'low_green', '0'],
    ['input', 'low_blue', '120'],
    ['input', 'high_color', '#ffd800'],
    ['input', 'high_red', '255'],
    ['input', 'high_green', '216'],
    ['input', 'high_blue', '0'],
    ['input', 'opacity', '1'],
]);


// Handle color selectors
scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        const target = e.target.id,
            val = e.target.value;

        const [r, g, b] = colorFactory.extractRGBfromColorString(val);

        if ('low_color' === target) {

            myFilter.set({ lowColor: val });
            dom.low_red.value = r.toFixed(0);
            dom.low_green.value = g.toFixed(0);
            dom.low_blue.value = b.toFixed(0);
        }
        else if ('high_color' === target) {

            myFilter.set({ highColor: val });
            dom.high_red.value = r.toFixed(0);
            dom.high_green.value = g.toFixed(0);
            dom.high_blue.value = b.toFixed(0);
        }
    }
}, '.colorSelector');


// Handle other user input
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        low_red: ['lowRed', 'round'],
        low_green: ['lowGreen', 'round'],
        low_blue: ['lowBlue', 'round'],
        high_red: ['highRed', 'round'],
        high_green: ['highGreen', 'round'],
        high_blue: ['highBlue', 'round'],
        opacity: ['opacity', 'float'],
    },

    callback: () => {

        dom.low_color.value = colorFactory.convertRGBtoHex(parseInt(dom.low_red.value, 10), parseInt(dom.low_green.value, 10), parseInt(dom.low_blue.value, 10));

        dom.high_color.value = colorFactory.convertRGBtoHex(parseInt(dom.high_red.value, 10), parseInt(dom.high_green.value, 10), parseInt(dom.high_blue.value, 10));
    },
});



// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
