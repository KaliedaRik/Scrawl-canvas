// ## Demo Canvas 024 

// [Loom entity functionality](../../demo/canvas-024.html)
import scrawl from '../source/scrawl.js'


// Scene setup
let canvas = scrawl.library.canvas.mycanvas;

canvas.set({
    backgroundColor: 'aliceblue',
    css: {
        border: '1px solid black'
    }
});

// Import image from DOM
scrawl.importDomImage('.flowers');


// Define some filters to play with
scrawl.makeFilter({
    name: 'grayscale',
    method: 'grayscale',
}).clone({
    name: 'sepia',
    method: 'sepia',
}).clone({
    name: 'cyan',
    method: 'cyan',
}).clone({
    name: 'pixelate',
    method: 'pixelate',
    tileWidth: 8,
    tileHeight: 8,
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


scrawl.makeQuadratic({

    name: 'my-quad',

    pivot: 'pin-1',
    lockTo: 'pivot',

    useStartAsControlPoint: true,

    controlPivot: 'pin-2',
    controlLockTo: 'pivot',

    endPivot: 'pin-3',
    endLockTo: 'pivot',

    method: 'none',

    minimumBoundingBoxDimensions: 0,
    useAsPath: true,
});

let myBez = scrawl.makeBezier({

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

    method: 'none',

    minimumBoundingBoxDimensions: 0,
    useAsPath: true,
});


// Every Loom needs a source image
let piccy = scrawl.makePicture({

    name: 'myFlower',
    asset: 'iris',

    copyStartX: 0,
    copyStartY: 0,

    copyWidth: '100%',
    copyHeight: '100%',

    visibility: false,
});


// The Loom entity definition
let myLoom = scrawl.makeLoom({

    name: 'display-loom',

    // Check to see that paths can be loaded either as picture name strings, or as the entity itself
    fromPath: 'my-quad',
    toPath: myBez,

    source: 'myFlower',

    lineWidth: 2,
    lineCap: 'round',
    strokeStyle: 'orange',

    boundingBoxColor: 'red',
    showBoundingBox: true,

    method: 'fillThenDraw',

    onEnter: function () { this.set({ lineWidth: 6 }) },
    onLeave: function () { this.set({ lineWidth: 2 }) },
});

let interactions = function () { canvas.cascadeEventAction('move') };
scrawl.addListener('move', interactions, canvas.domElement);

// Test packet functionality
console.log(myLoom.saveAsPacket());
//    RESULT:
//    [
//        "display-loom",
//        "Loom",
//        "entity",
//        {
//            "name":"display-loom",
//            "showBoundingBox":true,
//            "boundingBoxColor":"red",
//            "method":"fillThenDraw",
//            "onEnter":"~~~ this.set({ lineWidth: 6 }) ",
//            "onLeave":"~~~ this.set({ lineWidth: 2 }) ",
//            "onDown":"~~~",
//            "onUp":"~~~",
//            "delta":{},
//            "fromPath":"my-quad",
//            "toPath":"my-bezier",
//            "source":"myFlower",
//            "group":"mycanvas_base",
//            "strokeStyle":"orange",
//            "lineWidth":2,
//            "lineCap":"round"
//        }
//    ]

// Create the drag-and-drop zone
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: pins,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
});


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Loom frame struts - from strut: ${myLoom.fromPathStart.toFixed(3)}, ${myLoom.fromPathEnd.toFixed(3)}; to strut: ${myLoom.toPathStart.toFixed(3)}, ${myLoom.toPathEnd.toFixed(3)}
Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// User interaction - Loom functionality
scrawl.observeAndUpdate({

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

// User interaction - delta animation controls handler
let updateAnimation = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

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

// User interaction - Picture entity filters
let updateFilter = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

    piccy.clearFilters();

    if (val) piccy.addFilters(val);
};
scrawl.addNativeListener(['input', 'change'], updateFilter, '#filter');

// User interaction - Picture entity copy start and copy dimensions
scrawl.observeAndUpdate({

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
});

// Setup form
document.querySelector('#fromStart').value = 0;
document.querySelector('#fromEnd').value = 1;
document.querySelector('#toStart').value = 0;
document.querySelector('#toEnd').value = 1;
document.querySelector('#sync').options.selectedIndex = 1;
document.querySelector('#looping').options.selectedIndex = 1;
document.querySelector('#rendering').options.selectedIndex = 0;
document.querySelector('#animation').options.selectedIndex = 0;
document.querySelector('#filter').options.selectedIndex = 0;
document.querySelector('#method').options.selectedIndex = 4;
document.querySelector('#copy_start_xPercent').value = 0;
document.querySelector('#copy_start_yPercent').value = 0;
document.querySelector('#copy_dims_widthPercent').value = 100;
document.querySelector('#copy_dims_widthAbsolute').value = 400;
document.querySelector('#copy_start_xAbsolute').value = 0;
document.querySelector('#copy_start_yAbsolute').value = 0;
document.querySelector('#copy_dims_heightPercent').value = 100;
document.querySelector('#copy_dims_heightAbsolute').value = 400;

console.log(scrawl.library);
