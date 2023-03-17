// # Demo Canvas 051 
// Line Spirals

// [Run code](../../demo/canvas-051.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


let mySpiral = scrawl.makeLineSpiral({

    name: 'my-spiral',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    method: 'draw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    let {startRadius, radiusIncrement, radiusIncrementAdjust, startAngle, angleIncrement, angleIncrementAdjust, stepLimit} = mySpiral;

    return `    Radius - start: ${startRadius}, increment: ${radiusIncrement}, adjust: ${radiusIncrementAdjust}
    Angle - start: ${startAngle}, increment: ${angleIncrement}, adjust: ${angleIncrementAdjust}
    Limit: ${stepLimit}`;
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

// @ts-expect-error
document.querySelector('#startRadius').value = 0;
// @ts-expect-error
document.querySelector('#radiusIncrement').value = 0.1;
// @ts-expect-error
document.querySelector('#radiusIncrementAdjust').value = 1;
// @ts-expect-error
document.querySelector('#startAngle').value = 0;
// @ts-expect-error
document.querySelector('#angleIncrement').value = 5;
// @ts-expect-error
document.querySelector('#angleIncrementAdjust').value = 1;
// @ts-expect-error
document.querySelector('#stepLimit').value = 100;


// #### Development and testing
console.log(scrawl.library);
