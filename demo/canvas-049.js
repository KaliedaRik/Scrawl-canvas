// # Demo Canvas 049
// Conic gradients

// [Run code](../../demo/canvas-049.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;


// Create the radial gradient
const graddy = scrawl.makeConicGradient({
    name: 'mygradient',
    startX: '50%',
    startY: '50%',
    angle: 0,
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
scrawl.makeBlock({
    name: 'myblock',
    width: '90%',
    height: '90%',
    startX: '5%',
    startY: '5%',

    fillStyle: graddy,
    strokeStyle: 'coral',
    lineWidth: 2,
    method: 'fillAndDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Palette - start: ${paletteStart.value}; end: ${paletteEnd.value}\n    Start - x: ${startX.value}%; y: ${startY.value}%\n    Angle - ${angle.value}°`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: graddy,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        paletteStart: ['paletteStart', 'int'],
        paletteEnd: ['paletteEnd', 'int'],

        startX: ['startX', '%'],
        startY: ['startY', '%'],

        angle: ['angle', 'float'],

        precision: ['precision', 'int'],

        cyclePalette: ['cyclePalette', 'boolean'],

        colorSpace: ['colorSpace', 'raw'],
        returnColorAs: ['returnColorAs', 'raw'],
    },
});

// Adding and removing color stops to the gradient - we're using __updateColor__ and __removeColor__ functions rather than setting them on the gradient, so need separate event listener(s) to action form changes.
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
const paletteStart = document.querySelector('#paletteStart');
const paletteEnd = document.querySelector('#paletteEnd');
const startX = document.querySelector('#startX');
const startY = document.querySelector('#startY');
const angle = document.querySelector('#angle');
const precision = document.querySelector('#precision');

// @ts-expect-error
paletteStart.value = 0;
// @ts-expect-error
paletteEnd.value = 999;
// @ts-expect-error
startX.value = 50;
// @ts-expect-error
startY.value = 50;
// @ts-expect-error
angle.value = 0;
// @ts-expect-error
precision.value = 1;

// @ts-expect-error
document.querySelector('#red').value = 0;
// @ts-expect-error
document.querySelector('#blue').value = 0;
// @ts-expect-error
document.querySelector('#easing').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#cyclePalette').value = 0;
// @ts-expect-error
document.querySelector('#colorSpace').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#returnColorAs').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
