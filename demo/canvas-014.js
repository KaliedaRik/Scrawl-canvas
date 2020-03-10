// ## Demo Canvas 014 

// [Line, quadratic and bezier Shapes - control lock alternatives](../../demo/canvas-014.html)
import scrawl from '../source/scrawl.js'


// Scene setup
let canvas = scrawl.library.canvas.mycanvas;

canvas.set({
    backgroundColor: 'aliceblue',
    css: {
        border: '1px solid black'
    }
});

// Define the artefacts that will be used as pivots and paths before the artefacts that use them as such
scrawl.makeWheel({

    name: 'pin-1',
    order: 2,

    startX: 100,
    startY: 100,

    handleX: 'center',
    handleY: 'center',

    radius: 10,
    fillStyle: 'blue',
    strokeStyle: 'darkgray',
    lineWidth: 2,
    method: 'fillAndDraw',

}).clone({
    name: 'pin-2',
    startY: 300,

}).clone({
    name: 'pin-3',
    startY: 500,

}).clone({
    name: 'pin-4',
    fillStyle: 'green',
    startX: 500,
    startY: 100,

}).clone({
    name: 'pin-5',
    startY: 230,

}).clone({
    name: 'pin-6',
    startY: 370,

}).clone({
    name: 'pin-7',
    startY: 500,
});


// Create a group to hold the draggable artefacts, for easier user action collision detection
let pins = scrawl.makeGroup({

    name: 'my-pins',
    host: canvas.base.name,

}).addArtefacts('pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5', 'pin-6', 'pin-7');


// Now start defining the Shape lines. Bezier, Quadratic and Line Shapes can 'pivot' and 'path' (but not 'mimic') their control coordinates to other artefacts, similar to how start coordinates operate.
scrawl.makeQuadratic({

    name: 'my-quad',

    pivot: 'pin-1',
    lockTo: 'pivot',

    // The normal action when the Start coordinates for Bezier, Quadratic and Line Shapes change is that the entire shape moves to the new coordinates. In this demo, we don't want that; when a user drags the wheel on which the shape's start coordinates pivots, we want the shape to 'change shape'. We can make sure this happens by setting the 'useStartAsControlPoint' attribute to true.
    useStartAsControlPoint: true,

    controlPivot: 'pin-2',
    controlLockTo: 'pivot',

    endPivot: 'pin-3',
    endLockTo: 'pivot',

    lineWidth: 5,
    lineCap: 'round',
    strokeStyle: 'darkblue',
    method: 'draw',

    useAsPath: true,
});

scrawl.makeBezier({

    name: 'my-bezier',

    pivot: 'pin-4',
    lockTo: 'pivot',
    useStartAsControlPoint: true,

    startControlPivot: 'pin-5',
    startControlLockTo: 'pivot',

    endControlPivot: 'pin-6',
    endControlLockTo: 'pivot',

    endPivot: 'pin-7',
    endLockTo: 'pivot',

    lineWidth: 5,
    lineCap: 'round',
    strokeStyle: 'darkgreen',
    method: 'draw',

    useAsPath: true,
});

// The 'path-line' shape uses the quadratic and bezier curves as paths for its start and end coordinates
scrawl.makeLine({

    name: 'path-line',

    path: 'my-quad',
    pathPosition: 0,
    lockTo: 'path',
    useStartAsControlPoint: true,

    endPath: 'my-bezier',
    endPathPosition: 0,
    endLockTo: 'path',

    lineWidth: 5,
    lineCap: 'round',
    strokeStyle: 'black',
    method: 'draw',

    delta: {
        pathPosition: 0.0015,
        endPathPosition: 0.0015,
    },

    useAsPath: true,
});

// the 'mouse-line' shape has its start coordinates permanently fixed to the center opf the screen, while its end coordinates alternate between tracking a point along the 'path-line' shape, and the mouse cursor when it is moving over the canvas
scrawl.makeLine({

    name: 'mouse-line',

    startX: 'center',
    startY: 'center',
    useStartAsControlPoint: true,

    // ISSUE: Setting 'endPathPosition' to value 0.5 causes the arrow line to momentarily disappear at a few (regular!) intervals when the line is shorter. Setting the value to 0.499 fixes the issue. TODO: investigate further, when time allows.
    endPath: 'path-line',
    endPathPosition: 0.499,
    endLockTo: 'path',

    lineWidth: 5,
    lineCap: 'round',
    strokeStyle: 'darkred',
    method: 'draw',

    useAsPath: true,
});


// Decorate the 'mouse-line' shape with other artefacts to turn it into an arrow
scrawl.makeTetragon({

    name: 'arrowhead',

    order: 2,

    fillStyle: 'darkred',
    method: 'fill',

    radius: 10,
    intersectY: 1.2,

    handleX: 'center',
    handleY: '20%',
    roll: 90,

    path: 'mouse-line',
    pathPosition: 1,
    lockTo: 'path',
    addPathRotation: true,
});

scrawl.makeWheel({

    name: 'arrowbase',

    order: 2,

    fillStyle: 'darkred',
    method: 'fill',

    radius: 20,
    startAngle: 90,
    endAngle: -90,

    handleX: 'center',
    handleY: 'center',

    path: 'mouse-line',
    pathPosition: 0,
    lockTo: 'path',
    addPathRotation: true,
});


// We can always grab a handle to any canvas entity by reference to its entry in the Scrawl-canvas library. Entitys are stored in both the 'artefact' and the 'entity' sections of the library
let arrow = scrawl.library.entity['mouse-line'];


// Testing to make sure artefacts stick to their paths, even when those paths are animated or manipulated in various ways
scrawl.makePicture({

    name: 'bunny1',
    imageSource: 'img/bunny.png',

    width: 26,
    height: 37,

    copyWidth: 26,
    copyHeight: 37,

    handleX: 'center',
    handleY: 'center',

    path: 'my-bezier',
    pathPosition: 0,
    lockTo: 'path',
    addPathRotation: true,

    delta: {
        pathPosition: 0.0015,
    }
}).clone({

    name: 'bunny2',
    path: 'my-quad',
    pathPosition: 0,
    roll: 180,
});


// Create the drag-and-drop zone
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: pins,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
});


// Function to check whether mouse cursor is over canvas, and lock the arrow's end point accordingly
let mouseCheck = function () {

    let active = false;

    return function () {

        if (canvas.here.active !== active) {

            active = canvas.here.active;

            arrow.set({
                endLockTo: (active) ? 'mouse' : 'path'
            });
        }
    };
}();


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: mouseCheck,
    afterShow: report,
});
