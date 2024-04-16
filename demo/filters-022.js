// # Demo Filters 022
// Filter parameters: mapToGradient

// [Run code](../../demo/filters-022.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the gradients
scrawl.makeGradient({

    name: name('red-to-blue'),
    endX: '100%',
    easing: 'linear',
    precision: 1,
    colors: [
        [0, 'red'],
        [999, 'blue']
    ],

}).clone({

    name: name('blue-to-red'),
    colors: [
        [999, 'red'],
        [0, 'blue']
    ],

}).clone({

    name: name('rainbow'),
    delta: {
        paletteStart: -1,
        paletteEnd: -1,
    },
    cyclePalette: true,
    animateByDelta: true,
    colors: [
        [0, '#ff0000'],
        [83, '#000000'],
        [166, '#ffff00'],
        [249, '#000000'],
        [332, '#00ff00'],
        [415, '#000000'],
        [499, '#00ffff'],
        [582, '#000000'],
        [665, '#0000ff'],
        [749, '#000000'],
        [832, '#ff00ff'],
        [915, '#000000'],
        [999, '#ff0000'],
    ],

}).clone({

    name: name('banded'),
    colors: [
        [0, 'red'],
        [339, 'red'],
        [360, 'yellow'],
        [479, 'yellow'],
        [500, 'green'],
        [839, 'green'],
        [860, 'blue'],
        [979, 'blue'],
        [999, 'red'],
    ],

    // TODO - check: delta objects don't clone? If no, then fix.
    delta: {
        paletteStart: -1,
        paletteEnd: -1,
    },
});

const gradients = [
    scrawl.findStyles(name('red-to-blue')),
    scrawl.findStyles(name('blue-to-red')),
    scrawl.findStyles(name('rainbow')),
    scrawl.findStyles(name('banded')),
];


// Test the ability to load a user-created easing algorithm into the gradient
const bespokeEasings = {

    'user-steps': (val) => {

        if (val < 0.2) return 0.1;
        if (val < 0.4) return 0.3;
        if (val < 0.6) return 0.5;
        if (val < 0.8) return 0.7;
        return 0.9;
    },
    'user-repeat': (val) => (val * 4) % 1,
};


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('my-filter'),
    method: 'mapToGradient',
    gradient: name('red-to-blue'),
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('my-filter')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

   return `
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
    ['input', 'opacity', '1'],
    ['select', 'useNaturalGrayscale', 0],
    ['select', 'gradient', 0],
    ['select', 'easing', 0],
]);


// Handle filter gradient input
scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) myFilter.set({ gradient: name(e.target.value)});

}, dom.gradient);


// Handle filter easing input
scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        let val = e.target.value;

        if (['user-steps', 'user-repeat'].includes(val)) val = bespokeEasings[val];

        gradients.forEach(g => g.set({ easing: val }));
    }
}, dom.easing);


// Handle other inputs for filter
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        useNaturalGrayscale: ['useNaturalGrayscale', 'boolean'],
        opacity: ['opacity', 'float'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
