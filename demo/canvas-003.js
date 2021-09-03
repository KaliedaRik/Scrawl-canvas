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
let graddy = scrawl.makeGradient({
    name: 'mygradient',
    endX: '100%',
});


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
    return `    Palette - start: ${graddy.get('paletteStart')}; end: ${graddy.get('paletteEnd')}
    Start - x: ${graddy.get('startX').toFixed(0)}; y: ${graddy.get('startY').toFixed(0)}
    End - x: ${graddy.get('endX').toFixed(0)}; y: ${graddy.get('endY').toFixed(0)}`;
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
        },
    });
}

// ... Create the form observer
let myobserver = makeObserver();

// Adding and removing color stops to the gradient - we're using __updateColor__ and __removeColor__ functions rather than setting them on the gradient, so need separate event listener(s) to action form changes.
let events = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = parseInt(e.target.value, 10);

    switch (e.target.id) {

        case 'red':
            if (val) graddy.updateColor(350, 'red');
            else graddy.removeColor(350);
            break;

        case 'blue':
            if (val) graddy.updateColor(650, 'blue');
            else graddy.removeColor(650);
            break;
    }
};
scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

// Set the DOM input values
document.querySelector('#paletteStart').value = 0;
document.querySelector('#paletteEnd').value = 999;
document.querySelector('#startX').value = 0;
document.querySelector('#startY').value = 0;
document.querySelector('#endX').value = 100;
document.querySelector('#endY').value = 0;
document.querySelector('#red').value = 0;
document.querySelector('#blue').value = 0;


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
