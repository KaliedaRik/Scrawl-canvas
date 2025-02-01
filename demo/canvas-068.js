// # Demo Canvas 068
// LineSpiral entity attributes and functionality

// [Run code](../../demo/canvas-068.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


const mySpiral = scrawl.makeLineSpiral({

    name: name('my-spiral'),

    start: ['center', 'center'],
    handle: ['center', 'center'],

    method: 'draw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Radius - start: ${dom.startRadius.value}, increment: ${dom.radiusIncrement.value}, adjust: ${dom.radiusIncrementAdjust.value}
    Angle - start: ${dom.startAngle.value}, increment: ${dom.angleIncrement.value}, adjust: ${dom.angleIncrementAdjust.value}
    Limit: ${dom.stepLimit.value}`;
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
    origin: '.controlItem',

    target: mySpiral,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        startRadius: ['startRadius', 'float'],
        radiusIncrement: ['radiusIncrement', 'float'],
        radiusIncrementAdjust: ['radiusIncrementAdjust', 'float'],
        startAngle: ['startAngle', 'float'],
        angleIncrement: ['angleIncrement', 'float'],
        angleIncrementAdjust: ['angleIncrementAdjust', 'float'],
        stepLimit: ['stepLimit', 'float'],
    },
});


// Set the DOM input values
const dom = initializeDomInputs([
    ['input', 'startRadius', '0'],
    ['input', 'radiusIncrement', '0.1'],
    ['input', 'radiusIncrementAdjust', '1'],
    ['input', 'startAngle', '0'],
    ['input', 'angleIncrement', '5'],
    ['input', 'angleIncrementAdjust', '1'],
    ['input', 'stepLimit', '100'],
]);


// #### Development and testing
console.log(scrawl.library);
