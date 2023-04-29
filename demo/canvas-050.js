// # Demo Canvas 050 
// Manipulate artefact delta animation values

// [Run code](../../demo/canvas-050.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;


// Create a wheel entity which we can then bounce around the canvas
const myWheel = scrawl.makeWheel({

    name: 'ball',

    start: [300, '50%'],
    handle: ['center', 'center'],

    radius: 60,
    startAngle: 35,
    endAngle: -35,

    fillStyle: '#f2aafe',
    strokeStyle: 'gold',
    lineWidth: 6,
    lineJoin: 'round',

    method: 'fillAndDraw',
    globalAlpha: 0.8,

    delta: {
        startX: 4,
        startY: '0.25%',
        roll: -0.5,
        globalAlpha: 0.006,
    },

    // We will check for bounds violations using Scrawl-canvas delta checking functionality
    // + We supply an array for each delta attribute we want to check in the deltaConstraints Object
    // + The Array holds three items: `[minimum-value, maximum-value, action-to-take]`
    // + When the attribute updated by the delta value falls outside our boundaries, Scrawl-canvas takes the appropriate action
    // + The __reverse__ action will reverse the numerical sign of the affected delta object attribute value
    // + The __loop__ action will loop the artefact's attribute value from the maximum to the minimum value, or vice-versa as appropriate
    deltaConstraints: {
        startX: [50, 550, 'reverse'],
        startY: ['10%', '90%', 'reverse'],
        scale: [0.5, 2, 'reverse'],
        globalAlpha: [0.2, 1, 'reverse'],
    },
    checkDeltaConstraints: true,
});


scrawl.makeOval({
    name: 'base-oval',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    radiusX: 150,
    radiusY: 150,
    method: 'draw',
    lineWidth: 2,
    strokeStyle: 'red',
    lineDash: [4, 3],
    useAsPath: true,
    delta: {
        roll: 0.1,
    },
    shadowColor: 'black',
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    shadowBlur: 4,
});

const pins = scrawl.makeGroup({
    name: 'pins',
    host: canvas.base.name,
});

const angle = 3 / 7;

scrawl.makeBlock({
    name: 'pin-1',
    group: 'pins',
    dimensions: [7, 7],
    handle: ['center', 'center'],
    path: 'base-oval',
    pathPosition: (angle * 1) % 1,
    lockTo: 'path',
    fillStyle: 'blue',
    shadowColor: 'black',
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    shadowBlur: 4,
}).clone({
    name: 'pin-2',
    pathPosition: (angle * 2) % 1,
}).clone({
    name: 'pin-3',
    pathPosition: (angle * 3) % 1,
}).clone({
    name: 'pin-4',
    pathPosition: (angle * 4) % 1,
}).clone({
    name: 'pin-5',
    pathPosition: (angle * 5) % 1,
}).clone({
    name: 'pin-6',
    pathPosition: (angle * 6) % 1,
}).clone({
    name: 'pin-7',
    pathPosition: (angle * 7) % 1,
});

scrawl.makePolyline({
    name: 'polly',
    pins: pins.get('artefacts'),
    tension: 0,
    closed: true,
    mapToPins: true,

    strokeStyle: 'orange',
    lineWidth: 2,
    lineCap: 'round',
    lineJoin: 'round',

    shadowColor: 'black',
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    shadowBlur: 4,
    method: 'draw',

    delta: {
        tension: 0.005,
    },
    deltaConstraints: {
        tension: [-3.5, 3, 'reverse'],
    },
    checkDeltaConstraints: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();
    e.returnValue = false;

    switch (e.target.value) {

        case 'reverse' :
            myWheel.set({
                deltaConstraints: {
                    startX: [50, 550, 'reverse'],
                    startY: ['10%', '90%', 'reverse'],
                    scale: [0.5, 2, 'reverse'],
                    globalAlpha: [0.2, 1, 'reverse'],
                },
            });
            break;

        case 'loop' :
            myWheel.set({
                deltaConstraints: {
                    startX: [50, 550, 'loop'],
                    startY: ['10%', '90%', 'loop'],
                    scale: [0.5, 2, 'loop'],
                    globalAlpha: [0.2, 1, 'loop'],
                },
            });
            break;
    }
}, '#constraintAction');

scrawl.addNativeListener('click', (e) => {

    e.preventDefault();
    e.returnValue = false;

    const target = e.target;

    if (target) {

        if (parseInt(target.value, 10)) {

            target.value = '0';
            target.innerHTML = 'Add scaling';

            myWheel.setDeltaValues({
                scale: 'remove',
            });
        }
        else {

            target.value = '1';
            target.innerHTML = 'Remove scaling';

            myWheel.setDeltaValues({
                scale: 'newNumber:0.01',
            });
        }
    }

}, '#scaling');

// @ts-expect-error
document.querySelector('#scaling').value = '0';
document.querySelector('#scaling').innerHTML = 'Add scaling';
// @ts-expect-error
document.querySelector('#constraintAction').value = 'reverse';


// #### Development and testing
console.log(scrawl.library);
