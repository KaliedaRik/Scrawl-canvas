// # Demo Canvas 025 
// Various responsive and non-responsive canvases; responsive images

// [Run code](../../demo/canvas-025.html)
import scrawl from '../source/scrawl.js'

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const c1 = scrawl.library.artefact['canvas-1'],
    c2 = scrawl.library.artefact['canvas-2'],
    c3 = scrawl.library.artefact['canvas-3'],
    c4 = scrawl.library.artefact['canvas-4'],
    c5 = scrawl.library.artefact['canvas-5'],
    c6 = scrawl.library.artefact['canvas-6'],
    c7 = scrawl.library.artefact['canvas-7'];


// Import image from DOM, and add data to it
scrawl.importDomImage('.myimage');

let myRiver = scrawl.library.asset.river;

myRiver.set({
    intrinsicDimensions: {
        "river-300.jpg": [300, 225], 
        "river-600.jpg": [600, 450], 
        "river-900.jpg": [900, 675], 
        "river-1200.jpg": [1200, 900], 
        "river-1600.jpg": [1600, 1200], 
        "river-2000.jpg": [2000, 1500], 
        "river-2400.jpg": [2400, 1800], 
        "river-2800.jpg": [2800, 2100], 
        "river-3200.jpg": [3200, 2400], 
        "river-3600.jpg": [3600, 2700], 
        "river-4000.jpg": [4000, 3000]
    },
});


// Set canvas dimensions in HTML; initial base set to canvas dimensions
c1.set({
    backgroundColor: 'red',
    fit: 'cover',
});

// Set canvas dimensions in HTML; added border; initial base set to canvas dimensions
c2.set({
    backgroundColor: 'red',
    fit: 'cover',
});

// Set canvas dimensions in HTML; base size is static (via JS)
c3.set({
    backgroundColor: 'red',
    fit: 'cover',
}).setBase({
    width: 1000,
    height: 1000,
});

// Responsive canvas via CSS + JS; initial base set to canvas dimensions
c4.set({
    backgroundColor: 'red',
    fit: 'cover',
    checkForResize: true,
    ignoreCanvasCssDimensions: true,
});

// Responsive canvas via CSS + JS; base size is static (via JS)
c5.set({
    backgroundColor: 'red',
    fit: 'cover',
    checkForResize: true,
    ignoreCanvasCssDimensions: true,
}).setBase({
    width: 1000,
    height: 1000,
});

// Responsive canvas via CSS + JS; baseMatchesCanvasDimensions is true
c6.set({
    backgroundColor: 'red',
    fit: 'cover',
    checkForResize: true,
    ignoreCanvasCssDimensions: true,
    baseMatchesCanvasDimensions: true,
});

// Full bleed canvas
c7.set({
    backgroundColor: 'red',
    fit: 'cover',
    checkForResize: true,
    ignoreCanvasCssDimensions: true,
});


// Build the Picture entity
let piccy = scrawl.makePicture({

    name: 'c1-image',
    group: c1.base.name,
    asset: 'river',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

}).clone({

    name: 'c2-image',
    group: c2.base.name,

}).clone({

    name: 'c3-image',
    group: c3.base.name,

}).clone({

    name: 'c4-image',
    group: c4.base.name,

}).clone({

    name: 'c5-image',
    group: c5.base.name,

}).clone({

    name: 'c6-image',
    group: c6.base.name,

}).clone({

    name: 'c7-image',
    group: c7.base.name,
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
    target: [c1, c2, c3, c4, c5, c6, c7],
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
