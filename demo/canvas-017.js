// # Demo Canvas 017
// Gradients stress test

// [Run code](../../demo/canvas-017.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


const [width, height] = canvas.get('dimensions');


scrawl.makeGradient({

    name: name('monochrome'),
    endX: '100%',
    colors: [
      [0, 'black'],
      [999, 'white'],
    ],

}).clone({

    name: name('stepped-grays'),
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

    name: name('red-gradient'),
    colors: [
      [0, 'hsl(0 100% 40%)'],
      [999, 'hsl(0 100% 100%)'],
    ],

}).clone({

    name: name('red-blue'),
    colors: [
      [0, 'rgb(255 0 0)'],
      [999, 'rgb(0 0 255)'],
    ],
    colorSpace: 'LAB',

}).clone({

    name: name('hue-gradient'),
    colors: [
      [0, 'hwb(120 10% 10%)'],
      [999, 'hwb(20 10% 10%)'],
    ],
});

const grads = [
    scrawl.findStyles(name('monochrome')),
    scrawl.findStyles(name('stepped-grays')),
    scrawl.findStyles(name('red-gradient')),
    scrawl.findStyles(name('red-blue')),
    scrawl.findStyles(name('hue-gradient')),
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

    name: name('block-group'),
    host: canvas.base.name,
});

let counter = 0;
const generateBlocks = (numRequired) => {

    const maxWidth = width - 60;
    const maxHeight = height - 60;

    for (let i = 0; i < numRequired; i++) {

        scrawl.makeBlock({

            name: name(`b-${counter}`),
            group: name('block-group'),

            fillStyle: name(dom.colorStops.value),
            lockFillStyleToEntity: true,

            method: dom.method.value,

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

    return `
    Precision: ${dom.precision.value}
    Boxes: ${counter}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.addNativeListener(['change'], (e) => {

    e.preventDefault();

    blockGroup.setArtefacts({ fillStyle: name(dom.colorStops.value) });

}, '#colorStops');

scrawl.addNativeListener(['change'], (e) => {

    e.preventDefault();

    blockGroup.setArtefacts({ method: dom.method.value });

}, '#method');

scrawl.addNativeListener(['change'], (e) => {

    e.preventDefault();

    const ease = (bespokeEasings[dom.easing.value]) ? bespokeEasings[dom.easing.value] : dom.easing.value;
    grads.forEach(g => g.set({ easing: ease}));

}, '#easing');

scrawl.addNativeListener(['change'], (e) => {

    e.preventDefault();

    const p = parseInt(dom.precision.value, 10);
    grads.forEach(g => g.set({ precision: p}));

}, '#precision');

scrawl.addNativeListener(['click'], () => {

    generateBlocks(100);

}, canvas.domElement);


// Setup form
const dom = scrawl.initializeDomInputs([
    ['select', 'easing', 0],
    ['select', 'colorStops', 0],
    ['select', 'method', 0],
    ['input', 'precision', '25'],
]);


// Populate scene - because we're generating from DOM form element values, they need to be correctly initialized before we create any Block elements
generateBlocks(100);


// #### Development and testing
console.log(scrawl.library);
