// # Demo Canvas 030
// Polyline entity functionality
// + Note that the Polyline entity remains experimental technology and may be subject to breaking changes in future minor updates

// [Run code](../../demo/canvas-030.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed, killPolylineArtefact } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;


// Build some coordinate arrays ...
const absoluteCoords = [[100, 200], [200, 400], [300, 300], [400, 400], [500, 200], [240, 100]];

const relativeCoords = [['50%', 'center'], ['40%', '10%'], ['20%', '40%'], ['25%', '80%'], ['70%', '75%'], ['85%', '60%']];


// ... And a third coordinate array using Wheel entitys
absoluteCoords.forEach((item, index) => {

    const [x, y] = item;

    scrawl.makeWheel({

        name: `pin-${index}`,

        startX: x,
        startY: y,

        radius: 20,

        handleX: 'center',
        handleY: 'center',

        shadowColor: 'black',
        fillStyle: 'darkgreen',
        method: 'fill',
    });
});

const pivotCoords = ['pin-0', 'pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5'];


// Add another Wheel entity to act as a (potential) pivot for the Polyline
scrawl.makeWheel({

    name: 'pivot-wheel',

    start: [50, 50],

    radius: 20,

    handleX: 'center',
    handleY: 'center',

    shadowColor: 'black',
    fillStyle: 'darkred',
    method: 'fill',
});


// Define the Polyline entity
const myline = scrawl.makePolyline({

    name: 'my-polyline',

    // The `pins` attribute takes an array with elements which are:
    // + [x, y] coordinate arrays, where values can be absolute (Numbers) and/or relative (String%) values
    // + Artefact objects, or their name-String values
    // + (`set` function will also accept an object with attributes: `index, x, y` - to be used by tweens)
    // pins: absoluteCoords,
    pins: absoluteCoords,

    // Tension gives us the curviness of the line:
    // + 0 - straight lines connecting the pins
    // + 0.4ish - reasonable looking curves
    // + 1 - exaggerated curves
    // + negative values - add loops at the pins
    tension: 0,

    // Whether to connect all the pins (true), or run from first to last pin only (false)
    closed: false,

    // The starting position is the top left corner of the box which tightly encloses the Shape - regardless of the positions of any artefacts which may be used as pins. Handles and offsets should work as expected
    // + This functionality changes when the `mapToPins` flag is set; now the start coordinate maps directly to the first coordinate supplied in the `pins` array. Handle and offset values can no longer be relied on.
    startX: 0,
    startY: 0,

    // The `precision` attribute determines the accuracy for positioning artefacts on the path when they have set their `constantPathSpeed` flag to `true`
    // + Natural path speed leads to slower progression around tight corners; constant path speed attempts to even out these variations across the length of the path.
    // + The default precision value is `10`; decreasing the value increases the positioning accuracy. The more accurate the positioning, the greater the computational (and memory) burden.
    precision: 0.05,

    pivot: 'pivot-wheel',
    lockTo: 'start',

    mapToPins: false,

    strokeStyle: 'orange',
    lineWidth: 6,

    lineCap: 'round',
    lineJoin: 'round',

    shadowColor: 'black',

    method: 'draw',

    // Note: the bounding box dimensions reflect the minimum/maximum coordinates of all the pins used to construct the shape. It will only reflect the actual shape of the Shape when `useAsPath` attribute is set to `true`
    showBoundingBox: true,

    // Note: when using a Polyline entity as a pivot for other artefacts, set the `useAsPath` flag to true
    // + It generates more accurate results - particularly when the Polyline is flipped, rolled and/or scaled, and when underlying pins (particularly when those pins are artefacts) update their coordinates.
    useAsPath: true,

    bringToFrontOnDrag: false,
});


// Add some Block entitys which will pivot to our Polyline entity
absoluteCoords.forEach((item, index) => {

    scrawl.makeBlock({

        name: `block-${index}`,

        width: 20,
        height: 20,

        pivot: 'my-polyline',
        pivotPin: index,
        lockTo: 'pivot',

        handleX: 'center',
        handleY: 'center',

        roll: 45,

        fillStyle: 'lightblue',
        strokeStyle: 'yellow',
        lineWidth: 3,
        method: 'fillThenDraw',
    });
});

// Testing natural vs constant speeds along the path
for (let i = 0; i < 10; i++) {

    scrawl.makeWheel({

        name: `normal-ball-${i}`,
        order: 2,

        radius: 10,
        fillStyle: 'lightgreen',
        strokeStyle: 'red',
        method: 'fillThenDraw',

        handle: ['center', 'center'],

        path: 'my-polyline',
        pathPosition: i / 100,
        lockTo: 'path',

        delta: {
            pathPosition: 0.001,
        },

    }).clone({

        name: `constant-ball-${i}`,
        fillStyle: 'yellow',
        strokeStyle :'blue',

        pathPosition: (i / 100) + 0.5,

        constantSpeedAlongPath: true,
    });
}

// #### User interaction
// Create the drag-and-drop zone
scrawl.makeDragZone({
    zone: canvas,
    collisionGroup: canvas.base.name,
    endOn: ['up', 'leave'],

    updateOnStart: {
        shadowBlur: 6,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
    },

    updateOnEnd: {
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    },

    preventTouchDefaultWhenDragging: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
    return `Bounding box: ${myline.getBoundingBox().join(', ')}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### More user interaction
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myline,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        tension: ['tension', 'float'],
        pivot: ['lockTo', 'raw'],
        closed: ['closed', 'boolean'],
        path: ['useAsPath', 'boolean'],
        map: ['mapToPins', 'boolean'],
        reverse: ['flipReverse', 'boolean'],
        upend: ['flipUpend', 'boolean'],
        roll: ['roll', 'float'],
        scale: ['scale', 'float'],
    },
});


// Change the coordinate array used by the Polyline
const updatePins = (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value;

    if (val === 'absolute') myline.set({ pins: absoluteCoords });
    else if (val === 'relative') myline.set({ pins: relativeCoords });
    else if (val === 'artefacts') myline.set({ pins: pivotCoords });
};
scrawl.addNativeListener(['input', 'change'], updatePins, '#pins');


// Setup form
// @ts-expect-error
document.querySelector('#tension').value = 0;
// @ts-expect-error
document.querySelector('#pivot').value = 'start';
// @ts-expect-error
document.querySelector('#closed').value = 0;
// @ts-expect-error
document.querySelector('#path').value = 1;
// @ts-expect-error
document.querySelector('#map').value = 0;
// @ts-expect-error
document.querySelector('#pins').value = 'absolute';
// @ts-expect-error
document.querySelector('#reverse').value = 0;
// @ts-expect-error
document.querySelector('#upend').value = 0;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#scale').value = 1;


// #### Development and testing
console.log(scrawl.library);

console.log('Performing tests ...');

killPolylineArtefact(canvas, 'pin-2', 3000, myline, () => myline.updatePinAt('pin-2', 2));
