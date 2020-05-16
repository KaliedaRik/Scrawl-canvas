// # Demo Canvas 030 
// Shape polylines

// [Run code](../../demo/canvas-030.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue'
});

let coordinates = [[100, 200], [200, 400], [300, 300], [400, 400], [500, 200], [240, 100]];

coordinates.forEach((item, index) => {

    scrawl.makeWheel({

        name: `pin-${index}`,
        // order: 1,

        start: item,

        radius: 20,

        handleX: 'center',
        handleY: 'center',

        method: 'fill',
    });
});


scrawl.makePolyline({

    name: 'my-polyline',

    pivot: 'pin-0',
    lockTo: 'pivot',

    pins: ['pin-0', 'pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5'],

    tension: 0.3,
    closed: true,

    tension: 0.3,

    strokeStyle: 'orange',
    lineWidth: 6,

    lineCap: 'round',
    lineJoin: 'round',

    shadowColor: 'black',

    method: 'draw',
});

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
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
