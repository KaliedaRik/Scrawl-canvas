// # Demo Canvas 003 
// Linear gradients

// [Run code](../../demo/canvas-003.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed, killStyle } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    backgroundColor: 'blanchedalmond',
    css: {
        border: '1px solid black'
    }
});


// Create the linear gradient - we will kill and resurrect it as the demo runs
// + Needs to be a let, not a const, because we're going to kill/resurrect this gradient
let graddy = scrawl.makeGradient({
    name: 'mygradient',
    endX: '100%',

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
    lockFillStyleToEntity: true,
    strokeStyle: 'coral',
    lineWidth: 2,
    method: 'fillAndDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
    return `    Palette - start: ${paletteStart.value}; end: ${paletteEnd.value}
    Start - x: ${startX.value}%; y: ${startY.value}%
    End - x: ${endX.value}%; y: ${endY.value}%
    Precision: ${precision.value}`;
});

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality. We're doing it this way (wrapped in a function) so we can test that it can be killed, and then recreated, later
let makeObserver = () => {

    return scrawl.observeAndUpdate({

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

            endX: ['endX', '%'],
            endY: ['endY', '%'],

            precision: ['precision', 'int'],

            cyclePalette: ['cyclePalette', 'boolean'],

            colorSpace: ['colorSpace', 'raw'],
            returnColorAs: ['returnColorAs', 'raw'],
        },
    });
}

// ... Create the form observer
let myobserver = makeObserver();

// Adding and removing color stops to the gradient - we're using __updateColor__ and __removeColor__ functions rather than setting them on the gradient, so need separate event listener(s) to action form changes.
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
const paletteStart = document.querySelector('#paletteStart');
const paletteEnd = document.querySelector('#paletteEnd');
const startX = document.querySelector('#startX');
const startY = document.querySelector('#startY');
const endX = document.querySelector('#endX');
const endY = document.querySelector('#endY');
const precision = document.querySelector('#precision');

paletteStart.value = 0;
paletteEnd.value = 999;
startX.value = 0;
startY.value = 0;
endX.value = 100;
endY.value = 0;
precision.value = 1;

document.querySelector('#red').value = 0;
document.querySelector('#blue').value = 0;
document.querySelector('#easing').options.selectedIndex = 0;
document.querySelector('#cyclePalette').value = 0;
document.querySelector('#colorSpace').options.selectedIndex = 0;
document.querySelector('#returnColorAs').options.selectedIndex = 0;

// #### Development and testing
console.log(scrawl.library);

console.log('Performing tests ...');

killStyle(canvas, 'mygradient', 3000, () => {

    // Repopulate the graddy variable
    graddy = scrawl.library.styles['mygradient'];

    // Reset the block fillStyle to the gradient
    scrawl.library.entity['myblock'].set({
        fillStyle: 'mygradient',
    });

    // Kill the form observer
    console.log('Kill form observer');
    myobserver();

    // ... and recreate it
    myobserver = makeObserver();
    console.log('Form observer recreated');
});
