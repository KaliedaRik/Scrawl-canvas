// # Demo DOM 015
// Use stacked DOM artefact corners as pivot points

// [Run code](../../demo/dom-015.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const stack = scrawl.findStack('mystack'),
    element = scrawl.findElement('myelement'),
    canvas = scrawl.findCanvas('mycanvas');


// Give the stack element some depth
stack.set({
    width: 600,
    height:400,
    perspectiveZ: 1200,
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
        textShadow: '0 0 2px black',
    },
});


// Import image from DOM
scrawl.importDomImage('.flowers');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create entitys to pivot to the element's corners
scrawl.makeLine({

    name: name('left-line'),

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

    name: name('right-line'),
    pivotCorner: 'topRight',
    endPivotCorner: 'bottomRight',
});

scrawl.makeWheel({

    name: name('top-left-wheel'),
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

    name: name('top-right-wheel'),
    pivotCorner: 'topRight',
}).clone({

    name: name('bottom-right-wheel'),
    pivotCorner: 'bottomRight',
}).clone({

    name: name('bottom-left-wheel'),
    pivotCorner: 'bottomLeft',
});

const piccy = scrawl.makePicture({

    name: name('myFlower'),
    asset: 'iris',

    copyStartX: 0,
    copyStartY: 0,

    copyWidth: '100%',
    copyHeight: '100%',

    visibility: false,
});

scrawl.makeLoom({

    name: name('display-loom'),

    fromPath: name('left-line'),
    toPath: name('right-line'),

    source: name('myFlower'),

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

    name: name('draggable-artefacts'),

}).addArtefacts(element);

scrawl.makeDragZone({

    zone: stack,
    collisionGroup: name('draggable-artefacts'),
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'animation-stack',
    target: stack,
    afterShow: report,

    // Fixes element misplacement issue on scene creation
    afterCreated: () => stack.reset(),
});

// We can have more than one Display cycle animation on a web page
scrawl.makeRender({

    name: 'animation-canvas',
    target: canvas,
});


// #### More user interaction
// Setup form
initializeDomInputs([
    ['input', 'width', '200'],
    ['input', 'height', '200'],
    ['input', 'handle_xAbsolute', '100'],
    ['input', 'handle_yAbsolute', '100'],
    ['input', 'offset_xAbsolute', '0'],
    ['input', 'offset_yAbsolute', '0'],
    ['input', 'roll', '10'],
    ['input', 'pitch', '20'],
    ['input', 'yaw', '30'],
    ['input', 'scale', '1'],
]);


// Setup form observer functionality
scrawl.makeUpdater({

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


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, [canvas, element], `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
