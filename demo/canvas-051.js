// # Demo Canvas 051 
// Manipulate artefact delta animation values

// [Run code](../../demo/canvas-051.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


let mySpiral = scrawl.makeLineSpiral({

    name: 'my-spiral',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    // KNOWN ISSUE: Setting the angle to 0 or multiples of 360 causes the spiral to truncate itself
    startAngle: 0.1,

    method: 'draw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Radius - start: ${mySpiral.startRadius}, increment: ${mySpiral.radiusIncrement}, adjust: ${mySpiral.radiusIncrementAdjust}
    Angle - start: ${mySpiral.startAngle}, increment: ${mySpiral.angleIncrement}, adjust: ${mySpiral.angleIncrementAdjust}
    Limit: ${mySpiral.stepLimit}`;
    };
}();


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

document.querySelector('#startRadius').value = 0;
document.querySelector('#radiusIncrement').value = 0.1;
document.querySelector('#radiusIncrementAdjust').value = 1;
document.querySelector('#startAngle').value = 0.1;
document.querySelector('#angleIncrement').value = 5;
document.querySelector('#angleIncrementAdjust').value = 1;
document.querySelector('#stepLimit').value = 1000;


// #### Development and testing
console.log(scrawl.library);
