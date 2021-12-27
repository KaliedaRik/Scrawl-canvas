// # Demo Canvas 004 
// Radial gradients

// [Run code](../../demo/canvas-004.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    backgroundColor: 'blanchedalmond',
    checkForResize: true,
    fit: 'cover',
    ignoreCanvasCssDimensions: true,
}).setBase({
    width: 1000,
    height: 1000,
});


// Create the radial gradient
let graddy = scrawl.makeRadialGradient({
    name: 'mygradient',
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
    return `    Palette - start: ${paletteStart.value}; end: ${paletteEnd.value}
    Start - x: ${startX.value}%; y: ${startY.value}%; radius: ${startRadius.value}
    End - x: ${endX.value}%; y: ${endY.value}%; radius: ${endRadius.value}
    Precision: ${precision.value}`;
});

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

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

        easing: ['easing', 'raw'],
        precision: ['precision', 'int'],

        cyclePalette: ['cyclePalette', 'boolean'],
    },
});

const events = (e) => {

    e.preventDefault();
    e.returnValue = false;
};

scrawl.addNativeListener(['input', 'change'], (e) => {

    events(e);

    let val = parseInt(e.target.value, 10);

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

    let val = e.target.value;

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
document.querySelector('#paletteStart').value = 0;
document.querySelector('#paletteEnd').value = 999;
document.querySelector('#startX').value = 50;
document.querySelector('#startY').value = 50;
document.querySelector('#startRadius').value = 0;
document.querySelector('#endX').value = 50;
document.querySelector('#endY').value = 50;
document.querySelector('#endRadius').value = 500;
document.querySelector('#red').value = 0;
document.querySelector('#blue').value = 0;
document.querySelector('#easing').options.selectedIndex = 0;
document.querySelector('#precision').value = 50;

const paletteStart = document.querySelector('#paletteStart');
const paletteEnd = document.querySelector('#paletteEnd');
const startX = document.querySelector('#startX');
const startY = document.querySelector('#startY');
const startRadius = document.querySelector('#startRadius');
const endX = document.querySelector('#endX');
const endY = document.querySelector('#endY');
const endRadius = document.querySelector('#endRadius');
const precision = document.querySelector('#precision');

paletteStart.value = 0;
paletteEnd.value = 999;
startX.value = 50;
startY.value = 50;
startRadius.value = 0;
endX.value = 50;
endY.value = 50;
endRadius.value = 500;
precision.value = 1;

document.querySelector('#red').value = 0;
document.querySelector('#blue').value = 0;
document.querySelector('#easing').options.selectedIndex = 0;
document.querySelector('#cyclePalette').value = 0;


// #### Development and testing
console.log(scrawl.library);
