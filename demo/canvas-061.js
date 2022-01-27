// # Demo Canvas 061
// Gradients stress test

// [Run code](../../demo/filters-019.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    styles = scrawl.library.styles;

const [width, height] = canvas.get('dimensions');


// Build and display the reaction-diffusion asset

scrawl.makeGradient({

    name: 'monochrome',
    endX: '100%',
    colors: [
      [0, 'black'],
      [999, 'white'],
    ],

}).clone({

    name: 'stepped-grays',
    colors: [
      [0, '#333'],
      [199, '#333'],
      [200, '#666'],
      [399, '#666'],
      [400, '#999'],
      [599, '#999'],
      [600, '#ccc'],
      [799, '#ccc'],
      [800, '#fff'],
      [999, '#fff'],
    ],

}).clone({

    name: 'red-gradient',
    colors: [
      [0, 'hsl(0 100% 40%)'],
      [999, 'hsl(0 100% 100%)'],
    ],

}).clone({

    name: 'red-blue',
    colors: [
      [0, 'rgb(255 0 0)'],
      [999, 'rgb(0 0 255)'],
    ],
    colorSpace: 'LAB',

}).clone({

    name: 'hue-gradient',
    colors: [
      [0, 'hwb(120 10% 10%)'],
      [999, 'hwb(20 10% 10%)'],
    ],
});

const grads = [
    styles['monochrome'],
    styles['stepped-grays'],
    styles['red-gradient'],
    styles['red-blue'],
    styles['hue-gradient'],
];

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


const blockGroup = scrawl.makeGroup({

    name: 'block-group',
    host: canvas.base.name,
});

let counter = 0;
const generateBlocks = (numRequired) => {

// @ts-expect-error
    const ease = (bespokeEasings[easing.value]) ? bespokeEasings[easing.value] : easing.value;
// @ts-expect-error
    const p = parseInt(precision.value, 10);
    const maxWidth = width - 60;
    const maxHeight = height - 60;

    for (let i = 0; i < numRequired; i++) {

        scrawl.makeBlock({

            name: `b-${counter}`,
            group: 'block-group',

// @ts-expect-error
            fillStyle: gradient.value,
            lockFillStyleToEntity: true,

// @ts-expect-error
            method: method.value,

            width: Math.floor(10 + (Math.random() * 50)),
            height: Math.floor(10 + (Math.random() * 50)),
            startX: Math.floor(30 + (Math.random() * maxWidth)),
            startY: Math.floor(30 + (Math.random() * maxHeight)),

            handle: ['center', 'center'],

            delta: {
                roll: 1 - (Math.random() * 2),
            },
        });

        counter++;
    }
};


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Precision: ${precision.value}\n    Boxes: ${counter}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.addNativeListener(['change'], (e) => {

    e.preventDefault();

// @ts-expect-error
    blockGroup.setArtefacts({ fillStyle: gradient.value });

}, '#colorStops');

scrawl.addNativeListener(['change'], (e) => {

    e.preventDefault();

// @ts-expect-error
    blockGroup.setArtefacts({ method: method.value });

}, '#method');

scrawl.addNativeListener(['change'], (e) => {

    e.preventDefault();

// @ts-expect-error
    const ease = (bespokeEasings[easing.value]) ? bespokeEasings[easing.value] : easing.value;
    grads.forEach(g => g.set({ easing: ease}));

}, '#easing');

scrawl.addNativeListener(['change'], (e) => {

    e.preventDefault();

// @ts-expect-error
    const p = parseInt(precision.value, 10);
    grads.forEach(g => g.set({ precision: p}));

}, '#precision');

scrawl.addNativeListener(['click'], (e) => {

    generateBlocks(100);

}, canvas.domElement);


// Setup form
const precision = document.querySelector('#precision'), 
    easing = document.querySelector('#easing'),
    gradient = document.querySelector('#colorStops'),
    method = document.querySelector('#method');

// @ts-expect-error
precision.value = 25;
// @ts-expect-error
easing.options.selectedIndex = 0;
// @ts-expect-error
gradient.options.selectedIndex = 0;
// @ts-expect-error
method.options.selectedIndex = 0;


// Populate scene - because we're generating from DOM form element values, they need to be correctly initialized before we create any Block elements
generateBlocks(100);


// #### Development and testing
console.log(scrawl.library);
