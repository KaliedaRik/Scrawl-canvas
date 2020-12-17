// # Demo DOM 015
// Use stacked DOM artefact corners as pivot points

// [Run code](../../demo/dom-015.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
// Create some useful variables for use elsewhere in the script
let artefact = scrawl.library.artefact,
    stack = artefact.mystack,
    element = artefact.myelement,
    canvas = artefact.mycanvas,
    cell = canvas.base;


// Give the stack element some depth
stack.set({
    width: 600,
    height:400,
    perspectiveZ: 1200,
    checkForResize: true,
});


canvas.set({
    width: '100%',
    height: '100%',
    backgroundColor: 'gray',
});

cell.set({
    width: '100%',
    height: '100%',
});


// Setup the main element
element.set({

    startX: 300,
    startY: 200,
    handleX: 100,
    handleY: 100,

    width: 200,
    height: 200,

    roll: 10,
    pitch: 20,
    yaw: 30,

    css: {
        borderWidth: '0',
        color: 'white',
    },
});


// Import image from DOM
scrawl.importDomImage('.flowers');


// Create entitys to pivot to the element's corners
scrawl.makeLine({

    name: 'left-line',

    strokeStyle: 'red',
    lineWidth: 8,
    lineCap: 'round',
    method: 'draw',

    pivot: element,
    pivotCorner: 'topLeft',
    lockTo: 'pivot',

    useStartAsControlPoint: true,

    endPivot: element,
    endPivotCorner: 'bottomLeft',
    endLockTo: 'pivot',

    minimumBoundingBoxDimensions: 0,
    useAsPath: true,

}).clone({

    name: 'right-line',
    pivotCorner: 'topRight',
    endPivotCorner: 'bottomRight',
});

scrawl.makeWheel({

    name: 'top-left-wheel',
    radius: 20,
    handleX: 'center',
    handleY: 'center',
    fillStyle: 'red',
    strokeStyle: 'yellow',
    lineWidth: 8,
    globalAlpha: 0.6,
    method: 'fillThenDraw',

    pivot: element,
    pivotCorner: 'topLeft',
    lockTo: 'pivot',

}).clone({

    name: 'top-right-wheel',
    pivotCorner: 'topRight',
}).clone({

    name: 'bottom-right-wheel',
    pivotCorner: 'bottomRight',
}).clone({

    name: 'bottom-left-wheel',
    pivotCorner: 'bottomLeft',
});

scrawl.makePicture({

    name: 'myFlower',
    asset: 'iris',

    copyStartX: 0,
    copyStartY: 0,

    copyWidth: '100%',
    copyHeight: '100%',

    visibility: false,
});

scrawl.makeLoom({

    name: 'display-loom',

    fromPath: 'left-line',
    toPath: 'right-line',

    source: 'myFlower',

    method: 'fill',

    fromPathEnd: 0.95,

    delta: {
        fromPathStart: 0.0015,
        fromPathEnd: 0.0015,
    },
});


// #### User interaction
// Function to check whether mouse cursor is over stack, and lock the element artefact accordingly

// A group to help manage pin drag-and-drop functionality
scrawl.makeGroup({

    name: 'draggable-artefacts',

}).addArtefacts(element);

scrawl.makeDragZone({

    zone: stack,
    collisionGroup: 'draggable-artefacts',
    endOn: ['up', 'leave'],
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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation-stack',
    target: stack,
    afterShow: report,

    // Fixes element misplacement issue on scene creation - see Demo [DOM-007](./dom-007.html) for more details of the fix
    afterCreated: () => {
        stack.set({height: 400.1});
        scrawl.startCoreListeners();
    },
});

// We can have more than one Display cycle animation on a web page
scrawl.makeRender({

    name: 'demo-animation-canvas',
    target: canvas,
});


// #### More user interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: element,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        width: ['width', 'round'],
        height: ['height', 'round'],

        handle_xAbsolute: ['handleX', 'round'],
        handle_yAbsolute: ['handleY', 'round'],

        offset_xAbsolute: ['offsetX', 'round'],
        offset_yAbsolute: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        pitch: ['pitch', 'float'],
        yaw: ['yaw', 'float'],
        scale: ['scale', 'float'],
    },
});

// Setup form
document.querySelector('#width').value = 200;
document.querySelector('#height').value = 200;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#offset_xAbsolute').value = 0;
document.querySelector('#offset_yAbsolute').value = 0;
document.querySelector('#roll').value = 10;
document.querySelector('#pitch').value = 20;
document.querySelector('#yaw').value = 30;
document.querySelector('#scale').value = 1;


// #### Development and testing
console.log(artefact);
