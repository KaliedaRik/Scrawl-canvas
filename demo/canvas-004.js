// # Demo Canvas 004
// Radial gradients

// [Run code](../../demo/canvas-004.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create the radial gradient
const graddy = scrawl.makeRadialGradient({
    name: 'my-gradient',
    startX: '50%',
    startY: '50%',
    endX: '50%',
    endY: '50%',
    endRadius: 500,

    easing: 'linear',
    precision: 1,
});

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

// Create a block entity which will use the gradient
const blocky = scrawl.makeBlock({
    name: 'myblock',
    width: '90%',
    height: '90%',
    startX: '35%',
    startY: '35%',
    handleX: '35%',
    handleY: '35%',
    fillStyle: graddy,
    strokeStyle: 'slategray',
    lineWidth: 40,
    method: 'fillAndDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Palette - start: ${dom['paletteStart'].value}; end: ${dom['paletteEnd'].value}
    Start - x: ${dom['startX'].value}%; y: ${dom['startY'].value}%; radius: ${dom['startRadius'].value}
    End - x: ${dom['endX'].value}%; y: ${dom['endY'].value}%; radius: ${dom['endRadius'].value}
    Precision: ${dom['precision'].value}`;
});

// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.gradientControl',

    target: graddy,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        paletteStart: ['paletteStart', 'int'],
        paletteEnd: ['paletteEnd', 'int'],

        startX: ['startX', '%'],
        startY: ['startY', '%'],
        startRadius: ['startRadius', 'int'],

        endX: ['endX', '%'],
        endY: ['endY', '%'],
        endRadius: ['endRadius', 'int'],

        precision: ['precision', 'int'],

        cyclePalette: ['cyclePalette', 'boolean'],

        colorSpace: ['colorSpace', 'raw'],
        returnColorAs: ['returnColorAs', 'raw'],

        spread: ['spread', 'raw'],

        operations: ['operations', 'parse'],
    },
});

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.blockControl',

    target: blocky,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        flipUpend: ['flipUpend', 'boolean'],
        flipReverse: ['flipReverse', 'boolean'],

        fillStyle: ['fillStyle', 'raw'],
        strokeStyle: ['strokeStyle', 'raw'],

        lockFillStyleToEntity: ['lockFillStyleToEntity', 'boolean'],
        lockStrokeStyleToEntity: ['lockStrokeStyleToEntity', 'boolean'],
    },
});

const events = (e) => {

    e.preventDefault();
    e.returnValue = false;
};

scrawl.addNativeListener(['input', 'change'], (e) => {

    events(e);

    const val = parseInt(e.target.value, 10);

    switch (e.target.id) {

        case 'red' :
            if (val) graddy.updateColor(350, 'red');
            else graddy.removeColor(350);
            break;

        case 'blue' :
            if (val) graddy.updateColor(650, 'blue');
            else graddy.removeColor(650);
            break;
    }
}, '.colorItems');

scrawl.addNativeListener(['input', 'change'], (e) => {

    events(e);

    const val = e.target.value;

    if (['user-steps', 'user-repeat'].includes(val)) {
        graddy.set({
            easing: bespokeEasings[val],
        });
    }
    else {
        graddy.set({
            easing: val,
        });
    }

}, '#easing');


// Set the DOM input values
const dom = scrawl.initializeDomInputs([
    ['input', 'endRadius', '500'],
    ['input', 'endX', '50'],
    ['input', 'endY', '50'],
    ['input', 'paletteEnd', '999'],
    ['input', 'paletteStart', '0'],
    ['input', 'precision', '1'],
    ['input', 'startRadius', '0'],
    ['input', 'startX', '50'],
    ['input', 'startY', '50'],
    ['select', 'blue', 0],
    ['select', 'colorSpace', 0],
    ['select', 'cyclePalette', 0],
    ['select', 'easing', 0],
    ['select', 'red', 0],
    ['select', 'returnColorAs', 0],
    ['select', 'spread', 0],
    ['select', 'operations', 0],

    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['select', 'flipReverse', 0],
    ['select', 'flipUpend', 0],
    ['select', 'lockFillStyleToEntity', 0],
    ['select', 'lockStrokeStyleToEntity', 0],
    ['select', 'fillStyle', 1],
    ['select', 'strokeStyle', 0],
]);


// #### Development and testing
console.log(scrawl.library);
