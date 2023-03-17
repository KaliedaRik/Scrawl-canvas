// # Demo Canvas 024 
// Loom entity functionality

// [Run code](../../demo/canvas-024.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Import image from DOM
scrawl.importDomImage('.flowers');


// Define some filters to play with
scrawl.makeFilter({
    name: name('grayscale'),
    method: 'grayscale',
}).clone({
    name: name('sepia'),
    method: 'sepia',
}).clone({
    name: name('cyan'),
    method: 'cyan',
}).clone({
    name: name('pixelate'),
    method: 'pixelate',
    tileWidth: 8,
    tileHeight: 8,
});


// Make an object to hold functions we'll use for UI
const setCursorTo = {

    auto: () => {
        canvas.set({
            css: {
                cursor: 'auto',
            },
        });
    },
    grab: () => {
        canvas.set({
            css: {
                cursor: 'grab',
            },
        });
    },
    grabbing: () => {
        canvas.set({
            css: {
                cursor: 'grabbing',
            },
        });
    },
};

// Create a Group to hold the draggable artefacts, for easier user action collision detection
const pins = scrawl.makeGroup({

    name: name('my-pins'),
    host: canvas.get('baseName'),
    checkForEntityHover: true,
    onEntityHover: setCursorTo.grab,
    onEntityNoHover: setCursorTo.auto,
});


// Define the artefacts that will be used as `pivots` and `paths` before the artefacts that use them as such
scrawl.makeWheel({

    name: name('pin-1'),
    group: pins,

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
    name: name('pin-2'),
    startY: 300,

}).clone({
    name: name('pin-3'),
    startY: 500,

}).clone({
    name: name('pin-4'),
    fillStyle: 'green',
    startX: 500,
    startY: 100,

}).clone({
    name: name('pin-5'),
    startY: 230,

}).clone({
    name: name('pin-6'),
    startY: 370,

}).clone({
    name: name('pin-7'),
    startY: 500,
});

// Create the Shape entitys the Loom will use as its tracks - `fromPath`, `toPath`
scrawl.makeQuadratic({

    name: name('my-quad'),

    pivot: name('pin-1'),
    lockTo: 'pivot',
    useStartAsControlPoint: true,

    precision: 0.05,

    controlPivot: name('pin-2'),
    controlLockTo: 'pivot',

    endPivot: name('pin-3'),
    endLockTo: 'pivot',

    method: 'none',

    minimumBoundingBoxDimensions: 0,
    useAsPath: true,
});

const myBez = scrawl.makeBezier({

    name: name('my-bezier'),

    pivot: name('pin-4'),
    lockTo: 'pivot',
    useStartAsControlPoint: true,

    precision: 0.05,

    startControlPivot: name('pin-5'),
    startControlLockTo: 'pivot',

    endControlPivot: name('pin-6'),
    endControlLockTo: 'pivot',

    endPivot: name('pin-7'),
    endLockTo: 'pivot',

    method: 'none',

    minimumBoundingBoxDimensions: 0,
    useAsPath: true,
});


// Every Loom needs a source image
const piccy = scrawl.makePicture({

    name: name('myFlower'),
    asset: 'iris',

    copyStartX: 0,
    copyStartY: 0,

    copyWidth: '100%',
    copyHeight: '100%',

    visibility: false,
});


// ___The Loom entity definition___
const myLoom = scrawl.makeLoom({

    name: name('display-loom'),

    // Check to see that paths can be loaded either as picture name strings, or as the entity itself
    fromPath: name('my-quad'),
    toPath: myBez,

    source: name('myFlower'),

    lineWidth: 2,
    lineCap: 'round',
    strokeStyle: 'orange',

    boundingBoxColor: 'red',
    showBoundingBox: true,

    method: 'fillThenDraw',

// @ts-expect-error
    onEnter: function () { this.set({ lineWidth: 6 }) },
// @ts-expect-error
    onLeave: function () { this.set({ lineWidth: 2 }) },
});


// #### User interaction
// Mouse movement over and away from the Loom (emulates CSS element `hover` functionality)
const interactions = function () { canvas.cascadeEventAction('move') };
scrawl.addListener('move', interactions, canvas.domElement);


// Create the drag-and-drop zone
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: pins,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,
    updateOnStart: setCursorTo.grabbing,
    updateOnEnd: setCursorTo.grab,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### More user interaction
// Loom functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myLoom,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        fromStart: ['fromPathStart', 'float'],
        fromEnd: ['fromPathEnd', 'float'],
        toStart: ['toPathStart', 'float'],
        toEnd: ['toPathEnd', 'float'],
        sync: ['synchronizePathCursors', 'boolean'],
        looping: ['loopPathCursors', 'boolean'],
        rendering: ['isHorizontalCopy', 'boolean'],
        method: ['method', 'raw'],
    },
});

// Delta animation controls handler
const updateAnimation = (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value;

    switch (val) {

        case 'off' :
            myLoom.set({ delta: {
                fromPathStart: 0,
                fromPathEnd: 0,
                toPathStart: 0,
                toPathEnd: 0,
            }});
            break;

        case 'posDelta' :
            myLoom.set({ delta: {
                fromPathStart: 0.002,
                fromPathEnd: 0.002,
                toPathStart: 0.002,
                toPathEnd: 0.002,
            }});
            break;

        case 'negDelta' :
            myLoom.set({ delta: {
                fromPathStart: -0.002,
                fromPathEnd: -0.002,
                toPathStart: -0.002,
                toPathEnd: -0.002,
            }});
            break;
    }
};
scrawl.addNativeListener(['input', 'change'], updateAnimation, '#animation');

// Picture entity filters
const updateFilter = (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value;

    piccy.clearFilters();

    if (val) piccy.addFilters(name(val));

    // Loom will not pickup changes to picture attributes, need to trigger its output for the changes to be instantaneous
    myLoom.update();
};
scrawl.addNativeListener(['input', 'change'], updateFilter, '#filter');

// Picture entity copy start and copy dimensions
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: piccy,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        copy_start_xPercent: ['copyStartX', '%'],
        copy_start_xAbsolute: ['copyStartX', 'round'],

        copy_start_yPercent: ['copyStartY', '%'],
        copy_start_yAbsolute: ['copyStartY', 'round'],

        copy_dims_widthPercent: ['copyWidth', '%'],
        copy_dims_widthAbsolute: ['copyWidth', 'round'],

        copy_dims_heightPercent: ['copyHeight', '%'],
        copy_dims_heightAbsolute: ['copyHeight', 'round'],
    },

    callback: () => myLoom.update(),
});

// Setup form
// @ts-expect-error
document.querySelector('#fromStart').value = 0;
// @ts-expect-error
document.querySelector('#fromEnd').value = 1;
// @ts-expect-error
document.querySelector('#toStart').value = 0;
// @ts-expect-error
document.querySelector('#toEnd').value = 1;
// @ts-expect-error
document.querySelector('#sync').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#looping').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#rendering').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#animation').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#filter').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#method').options.selectedIndex = 4;
// @ts-expect-error
document.querySelector('#copy_start_xPercent').value = 0;
// @ts-expect-error
document.querySelector('#copy_start_yPercent').value = 0;
// @ts-expect-error
document.querySelector('#copy_dims_widthPercent').value = 100;
// @ts-expect-error
document.querySelector('#copy_dims_widthAbsolute').value = 400;
// @ts-expect-error
document.querySelector('#copy_start_xAbsolute').value = 0;
// @ts-expect-error
document.querySelector('#copy_start_yAbsolute').value = 0;
// @ts-expect-error
document.querySelector('#copy_dims_heightPercent').value = 100;
// @ts-expect-error
document.querySelector('#copy_dims_heightAbsolute').value = 400;


// #### Development and testing
// Test packet functionality
console.log(myLoom.saveAsPacket());
// ```
// RESULT:
// [
//     "display-loom",
//     "Loom",
//     "entity",
//     {
//         "name":"display-loom",
//         "showBoundingBox":true,
//         "boundingBoxColor":"red",
//         "method":"fillThenDraw",
//         "onEnter":"~~~ this.set({ lineWidth: 6 }) ",
//         "onLeave":"~~~ this.set({ lineWidth: 2 }) ",
//         "onDown":"~~~",
//         "onUp":"~~~",
//         "delta":{},
//         "fromPath":"my-quad",
//         "toPath":"my-bezier",
//         "source":"myFlower",
//         "group":"mycanvas_base",
//         "strokeStyle":"orange",
//         "lineWidth":2,
//         "lineCap":"round"
//     }
// ]
// ```

console.log(scrawl.library);
