// # Demo Canvas 004 
// Radial gradients

// [Run code](../../demo/canvas-004.html)
import {
    addNativeListener,
    library as L,
    makeBlock,
    makeRadialGradient,
    makeRender,
    makeUpdater,
} from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = L.artefact.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Create the radial gradient
const graddy = makeRadialGradient({
    name: name('mygradient'),
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
makeBlock({
    name: name('myblock'),
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
    return `    Palette - start: ${paletteStart.value}; end: ${paletteEnd.value}\n    Start - x: ${startX.value}%; y: ${startY.value}%; radius: ${startRadius.value}\n    End - x: ${endX.value}%; y: ${endY.value}%; radius: ${endRadius.value}\n    Precision: ${precision.value}`;
});

// Create the Display cycle animation
makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
makeUpdater({

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
        startRadius: ['startRadius', 'int'],

        endX: ['endX', '%'],
        endY: ['endY', '%'],
        endRadius: ['endRadius', 'int'],

        precision: ['precision', 'int'],

        cyclePalette: ['cyclePalette', 'boolean'],

        colorSpace: ['colorSpace', 'raw'],
        returnColorAs: ['returnColorAs', 'raw'],
    },
});

const events = (e) => {

    e.preventDefault();
    e.returnValue = false;
};

addNativeListener(['input', 'change'], (e) => {

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

addNativeListener(['input', 'change'], (e) => {

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
const startRadius = document.querySelector('#startRadius');
const endX = document.querySelector('#endX');
const endY = document.querySelector('#endY');
const endRadius = document.querySelector('#endRadius');
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
startRadius.value = 0;
// @ts-expect-error
endX.value = 50;
// @ts-expect-error
endY.value = 50;
// @ts-expect-error
endRadius.value = 500;
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
console.log(L);
