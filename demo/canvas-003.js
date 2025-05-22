// # Demo Canvas 003
// Linear gradients

// [Run code](../../demo/canvas-003.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, killStyle } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create the linear gradient - we will kill and resurrect it as the demo runs
// + Needs to be a let, not a const, because we're going to kill/resurrect this gradient
let graddy = scrawl.makeGradient({

    name: name('mygradient'),
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

    name: name('myblock'),
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

    return `
    Palette - start: ${dom['paletteStart'].value}; end: ${dom['paletteEnd'].value}
    Start - x: ${dom['startX'].value}%; y: ${dom['startY'].value}%
    End - x: ${dom['endX'].value}%; y: ${dom['endY'].value}%
    Precision: ${dom['precision'].value}`;
});

// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality. We're doing it this way (wrapped in a function) so we can test that it can be killed, and then recreated, later
const makeObserver = () => {

    return scrawl.makeUpdater({

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
    ['input', 'endX', '100'],
    ['input', 'endY', '0'],
    ['input', 'paletteEnd', '999'],
    ['input', 'paletteStart', '0'],
    ['input', 'precision', '1'],
    ['input', 'startX', '0'],
    ['input', 'startY', '0'],
    ['select', 'blue', 0],
    ['select', 'colorSpace', 0],
    ['select', 'cyclePalette', 0],
    ['select', 'easing', 0],
    ['select', 'red', 0],
    ['select', 'returnColorAs', 0],
]);


// #### Development and testing
console.log(scrawl.library);

console.log('Performing tests ...');

killStyle(scrawl, canvas, name('mygradient'), 3000, () => {

    // Repopulate the graddy variable
/** @ts-expect-error */
    graddy = scrawl.findStyles(name('mygradient'));

    // Reset the block fillStyle to the gradient
    scrawl.findEntity(name('myblock')).set({
        fillStyle: name('mygradient'),
    });

    // Kill the form observer
    console.log('Kill form observer');
    myobserver();

    // ... and recreate it
    myobserver = makeObserver();
    console.log('Form observer recreated');
});
