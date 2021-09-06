// # Demo Canvas 049 
// Conic gradients

// [Run code](../../demo/canvas-049.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

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


// Create the radial gradient
let graddy = scrawl.makeConicGradient({
    name: 'mygradient',
    startX: '50%',
    startY: '50%',
    startAngle: 0.
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

    let [startX, startY] = graddy.start;

    let {paletteStart, paletteEnd, startAngle} = graddy;

    return `    Palette - start: ${paletteStart}; end: ${paletteEnd}
    Start - x: ${startX}; y: ${startY}
    Angle - ${startAngle}°`;
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
        startAngle: ['startAngle', 'float'],
    },
});

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
document.querySelector('#startX').value = 50;
document.querySelector('#startY').value = 50;
document.querySelector('#startAngle').value = 0;


// #### Development and testing
console.log(scrawl.library);
