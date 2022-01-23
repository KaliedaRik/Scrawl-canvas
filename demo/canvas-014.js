// # Demo Canvas 014 
// Line, Quadratic and Bezier entitys - control lock alternatives

// [Run code](../../demo/canvas-014.html)
import {
    library as L,
    makeBezier,
    makeDragZone,
    makeGroup,
    makeLine,
    makePicture,
    makeQuadratic,
    makeRender,
    makeTetragon,
    makeWheel,
    setIgnorePixelRatio,
} from '../source/scrawl.js'

import { reportSpeed, killArtefact } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
setIgnorePixelRatio(false);


// #### Scene setup
let canvas = L.canvas.mycanvas;

canvas.set({
    backgroundColor: 'aliceblue',
    css: {
        border: '1px solid black',
    }
});

// Define the entitys that will be used as pivots and paths before the entitys that use them as such
makeWheel({

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
let pins = makeGroup({

    name: 'my-pins',
    host: canvas.base.name,

}).addArtefacts('pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5', 'pin-6', 'pin-7');


// Now start defining the Shape lines. Bezier, Quadratic and Line Shapes can `pivot` and `path` their control coordinates to other artefacts, similar to how start coordinates operate.
makeQuadratic({

    name: 'my-quad',

    pivot: 'pin-1',
    lockTo: 'pivot',

    // The normal action when the Start coordinates for Bezier, Quadratic and Line Shapes change is that the entire shape moves to the new coordinates. In this demo, we don't want that; when a user drags the wheel on which the shape's start coordinates pivots, we want the shape to 'change shape'. We can make sure this happens by setting its `useStartAsControlPoint` attribute to true.
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

makeBezier({

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
makeLine({

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

    // Delta animate the path-line entity along the lengths of the bezier and quadratic Shape entitys
    delta: {
        pathPosition: 0.0015,
        endPathPosition: 0.0015,
    },

    useAsPath: true,
});

// the 'mouse-line' shape has its start coordinates permanently fixed to the center of the screen, while its end coordinates alternate between tracking a point along the 'path-line' shape, and the mouse cursor when it is moving over the canvas
makeLine({

    name: 'mouse-line',

    startX: 'center',
    startY: 'center',
    useStartAsControlPoint: true,

    endPath: 'path-line',
    endPathPosition: 0.5,
    endLockTo: 'path',

    lineWidth: 5,
    lineCap: 'round',
    strokeStyle: 'darkred',
    method: 'draw',

    useAsPath: true,
});


// Decorate the 'mouse-line' shape with other artefacts to turn it into an arrow
makeTetragon({

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

makeWheel({

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


// We can always grab a handle to any canvas entity by reference to its entry in the Scrawl-canvas library. Entitys are stored in both the `artefact` and the `entity` sections of the library
let arrow = L.entity['mouse-line'];


// Testing to make sure artefacts stick to their paths, even when those paths are animated or manipulated in various ways
makePicture({

    name: 'bunny1',
    imageSource: 'img/bunny.png',

    width: 26,
    height: 37,

    copyWidth: 26,
    copyHeight: 37,

    handleX: 'center',
    handleY: 'center',

    path: 'path-line',
    pathPosition: 0.1,
    addPathRotation: true,
    lockTo: 'path',

}).clone({

    name: 'bunny2',
    pathPosition: 0.9,
});


// #### User interaction
// Create the drag-and-drop zone
makeDragZone({

    zone: canvas,
    collisionGroup: pins,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,
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


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: mouseCheck,
    afterShow: report,
});


// #### Development and testing
console.log(L);

console.log('Performing tests ...');

killArtefact(canvas, 'pin-1', 2000, () => {

    pins.addArtefacts('pin-1');

    L.artefact['my-quad'].set({
        pivot: 'pin-1',
        lockTo: 'pivot',
    });
});

killArtefact(canvas, 'pin-5', 3000, () => {

    pins.addArtefacts('pin-5');

    L.artefact['my-bezier'].set({
        startControlPivot: 'pin-5',
        startControlLockTo: 'pivot',
    });
});

killArtefact(canvas, 'pin-7', 4000, () => {

    pins.addArtefacts('pin-7');

    L.artefact['my-bezier'].set({
        endPivot: 'pin-7',
        endLockTo: 'pivot',
    });
});

killArtefact(canvas, 'my-bezier', 5000, () => {

    L.artefact['path-line'].set({
        endPath: 'my-bezier',
        endLockTo: 'path',
    });
});
