// # Demo Canvas 012 
// Shape entity position; shape entity as a path for other artefacts to follow

// [Run code](../../demo/canvas-012.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup

// Create Shape entity
let arrow = scrawl.makeShape({

    name: 'myArrow',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    startX: 300,
    startY: 200,
    handleX: '50%',
    handleY: '50%',

    scale: 0.2,
    scaleOutline: false,

    lineWidth: 10,
    lineJoin: 'round',

    fillStyle: 'lightgreen',

    method: 'fill',

    // Turn the Shape into a `path` which other artefacts can use to position themselves
    useAsPath: true,
    precision: 2,

    // Test to make sure the bounding box correctly calculates itself to fit the Shape as tightly as possible
    showBoundingBox: true,
});

// Create Wheel entity to pivot to the arrow
scrawl.makeWheel({

    // We don't need to give artefacts a `name` attribute - it's just a lot more convenient if we do.

    fillStyle: 'blue',
    radius: 5,
    handleX: 'center',
    handleY: 'center',

    pivot: 'myArrow',
    lockTo: 'pivot',
});

// Create the Wheel entitys that will use the arrow as their path
// + This Wheel is a template from which we clone the other Wheels
let myWheel = scrawl.makeWheel({

    fillStyle: 'red',
    radius: 3,

    // These are half-circles
    roll: -90,

    startAngle: 90,
    endAngle: -90,

    path: 'myArrow',
    pathPosition: 0,
    addPathRotation: true,
    lockTo: 'path',

    handleX: 'center',
    handleY: 'center',

    // Automatically animate the Wheel along the Shape's path (___delta animation___)
    delta: {
        pathPosition: 0.0008,
    }
});

// Generate the rest of the Wheels
for (let i = 0.01; i < 1; i += 0.01) {

    let col;

    if (i < 0.2) col = 'red';
    else if (i < 0.4) col = 'orange';
    else if (i < 0.6) col = 'darkgreen';
    else if (i < 0.8) col = 'blue';
    else col = 'purple';

    myWheel.clone({
        pathPosition: i,
        fillStyle: col,
    });
}


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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Shape path length: ${arrow.length}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: scrawl.library.artefact.mycanvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: arrow,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        start_xPercent: ['startX', '%'],
        start_xAbsolute: ['startX', 'round'],
        start_xString: ['startX', 'raw'],

        start_yPercent: ['startY', '%'],
        start_yAbsolute: ['startY', 'round'],
        start_yString: ['startY', 'raw'],

        handle_xPercent: ['handleX', '%'],
        handle_xAbsolute: ['handleX', 'round'],
        handle_xString: ['handleX', 'raw'],

        handle_yPercent: ['handleY', '%'],
        handle_yAbsolute: ['handleY', 'round'],
        handle_yString: ['handleY', 'raw'],

        offset_xPercent: ['offsetX', '%'],
        offset_xAbsolute: ['offsetX', 'round'],

        offset_yPercent: ['offsetY', '%'],
        offset_yAbsolute: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],
    },
});

// Setup form
document.querySelector('#start_xPercent').value = 50;
document.querySelector('#start_yPercent').value = 50;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#start_xAbsolute').value = 300;
document.querySelector('#start_yAbsolute').value = 200;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#start_xString').options.selectedIndex = 1;
document.querySelector('#start_yString').options.selectedIndex = 1;
document.querySelector('#handle_xString').options.selectedIndex = 1;
document.querySelector('#handle_yString').options.selectedIndex = 1;
document.querySelector('#offset_xPercent').value = 0;
document.querySelector('#offset_yPercent').value = 0;
document.querySelector('#offset_xAbsolute').value = 0;
document.querySelector('#offset_yAbsolute').value = 0;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 0.2;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;

console.log(scrawl.library.entity.myArrow);
