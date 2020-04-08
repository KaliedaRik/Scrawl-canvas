// # Demo DOM 013
// Artefact collision detection - DOM artefacts

// [Run code](../../demo/dom-013.html)
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
    backgroundColor: 'black',
});

cell.set({
    width: '100%',
    height: '100%',
});


// Make a separate collisions group for our element
let testers = scrawl.makeGroup({

    name: 'testers',
    host: 'mystack',
});


// Setup the main element
element.set({

    group: 'testers',

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
        borderWidth: '6px',
    },

    collides: true,
});


// Setup the background grid
let myGrid = scrawl.makeGrid({

    name: 'test-grid',

    width: 600,
    height: 400,

    columns: 60,
    rows: 40,

    columnGutterWidth: 0.3,
    rowGutterWidth: 0.3,

    tileSources: [
        {
            type: 'color',
            source: 'aliceblue',
        }, {
            type: 'color',
            source: 'red',
        }
    ]
});


// #### User interaction
// Function to check whether mouse cursor is over stack, and lock the element artefact accordingly
scrawl.makeDragZone({

    zone: stack,
    collisionGroup: testers,
    endOn: ['up', 'leave'],
});


// #### Scene animation
// Function to display grid blocks which are currently in collision with the element artefact
let checkHits = function () {

    myGrid.setAllTilesTo(0);

    let hits = myGrid.checkHit(element.getSensors());

    if (hits) myGrid.setTilesTo(hits.tiles, 1);
};


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

    name: 'demo-animation',
    commence: checkHits,
    afterShow: report,

    // Fixes element misplacement issue on scene creation - see Demo [DOM-007](./dom-007.html) for more details of the fix
    afterCreated: () => {
        stack.set({height: 400.1});
        scrawl.startCoreListeners();
    },
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
        handle_xAbsolute: ['handleX', 'round'],
        handle_yAbsolute: ['handleY', 'round'],

        offset_xAbsolute: ['offsetX', 'round'],
        offset_yAbsolute: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        pitch: ['pitch', 'float'],
        yaw: ['yaw', 'float'],
        scale: ['scale', 'float'],

        sensitivity: ['sensorSpacing', 'round'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: stack,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        perspective: ['perspectiveZ', 'round'],
    },
});


// Setup form
document.querySelector('#sensitivity').value = 50;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#offset_xAbsolute').value = 0;
document.querySelector('#offset_yAbsolute').value = 0;
document.querySelector('#roll').value = 10;
document.querySelector('#pitch').value = 20;
document.querySelector('#yaw').value = 30;
document.querySelector('#scale').value = 1;
document.querySelector('#perspective').value = 1200;


// #### Development and testing
console.log(scrawl.library);
