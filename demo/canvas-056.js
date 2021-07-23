// # Demo Canvas 056 
// Canvas creation; device pixel ratio considerations

// [Run code](../../demo/canvas-056.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const c1 = scrawl.library.artefact['canvas-1'],
    c2 = scrawl.library.artefact['canvas-2'],
    c3 = scrawl.library.artefact['canvas-3'],
    c4 = scrawl.library.artefact['canvas-4'],
    c5 = scrawl.library.artefact['canvas-5'],
    c6 = scrawl.library.artefact['canvas-6'];

// Set canvas dimensions in HTML; initial base set to canvas dimensions
c1.set({
    backgroundColor: 'beige',
});

// Set canvas dimensions in HTML; added border; initial base set to canvas dimensions
c2.set({
    backgroundColor: 'azure',
});

// Set canvas dimensions in HTML; base size is static (via JS)
c3.set({
    backgroundColor: 'lightslategray',
    fit: 'contain',
}).setBase({
    width: 1000,
    height: 1000,
});

// Responsive canvas via CSS + JS; initial base set to canvas dimensions
c4.set({
    backgroundColor: 'lemonchiffon',
    checkForResize: true,
    fit: 'contain',
    ignoreCanvasCssDimensions: true,
});

// Responsive canvas via CSS + JS; base size is static (via JS)
c5.set({
    backgroundColor: 'honeydew',
    checkForResize: true,
    fit: 'contain',
    ignoreCanvasCssDimensions: true,
}).setBase({
    width: 1000,
    height: 1000,
});

// Responsive canvas via CSS + JS; baseMatchesCanvasDimensions is true
c6.set({
    backgroundColor: 'pink',
    checkForResize: true,
    baseMatchesCanvasDimensions: true,
    ignoreCanvasCssDimensions: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();

        // Because we are using the same render object to animate all four canvases, this report function gets run four times for each Display cycle (once each time each canvas is rendered). The fix is to choke the functionality so it actions only after a given number of milliseconds since it was last run - typically 2 milliseconds is enough to ensure the action only runs once per cycle.
        if (testNow - testTicker > 2) {

            testTime = testNow - testTicker;
            testTicker = testNow;

            testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
        }
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: [c1, c2, c3, c4, c5, c6],
    afterShow: report,
});


// // #### User interaction
// // Setup form observer functionality
// scrawl.observeAndUpdate({

//     event: ['input', 'change'],
//     origin: '.controlItem',

//     target: myMoon,

//     useNativeListener: true,
//     preventDefault: true,

//     updates: {

//         start_xPercent: ['startX', '%'],
//         start_xAbsolute: ['startX', 'round'],
//         start_xString: ['startX', 'raw'],

//         start_yPercent: ['startY', '%'],
//         start_yAbsolute: ['startY', 'round'],
//         start_yString: ['startY', 'raw'],

//         handle_xPercent: ['handleX', '%'],
//         handle_xAbsolute: ['handleX', 'round'],
//         handle_xString: ['handleX', 'raw'],

//         handle_yPercent: ['handleY', '%'],
//         handle_yAbsolute: ['handleY', 'round'],
//         handle_yString: ['handleY', 'raw'],

//         roll: ['roll', 'float'],
//         scale: ['scale', 'float'],

//         upend: ['flipUpend', 'boolean'],
//         reverse: ['flipReverse', 'boolean'],

//         outerRadius: ['outerRadius', 'round'],
//         innerRadius: ['innerRadius', 'round'],
//         displacement: ['displacement', 'round'],
//         displayIntersect: ['displayIntersect', 'boolean'],
//     },
// });

// // Setup form
// document.querySelector('#start_xPercent').value = 50;
// document.querySelector('#start_yPercent').value = 50;
// document.querySelector('#handle_xPercent').value = 50;
// document.querySelector('#handle_yPercent').value = 50;
// document.querySelector('#start_xAbsolute').value = 300;
// document.querySelector('#start_yAbsolute').value = 200;
// document.querySelector('#handle_xAbsolute').value = 100;
// document.querySelector('#handle_yAbsolute').value = 100;
// document.querySelector('#start_xString').options.selectedIndex = 1;
// document.querySelector('#start_yString').options.selectedIndex = 1;
// document.querySelector('#handle_xString').options.selectedIndex = 1;
// document.querySelector('#handle_yString').options.selectedIndex = 1;
// document.querySelector('#roll').value = 0;
// document.querySelector('#scale').value = 1;
// document.querySelector('#upend').options.selectedIndex = 0;
// document.querySelector('#reverse').options.selectedIndex = 0;
// document.querySelector('#outerRadius').value = 150;
// document.querySelector('#innerRadius').value = 100;
// document.querySelector('#displacement').value = 40;
// document.querySelector('#displayIntersect').options.selectedIndex = 0;

// #### Development and testing
console.log(scrawl.library);
