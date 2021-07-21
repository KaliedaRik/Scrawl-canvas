// # Demo Canvas 025 
// Responsive images

// [Run code](../../demo/canvas-025.html)
import scrawl from '../source/scrawl.js'

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.canvas.mycanvas;


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


// Make canvas responsive
canvas.set({
    backgroundColor: 'honeydew',
    checkForResize: true,
    fit: 'contain',
}).setBase({
    width: 4000,
    height: 3000,
});


// Build the Picture entity
let piccy = scrawl.makePicture({

    name: `${canvas.name}-image`,
    asset: 'river',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',
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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    asset natural dims: ${myRiver.source.naturalWidth}, ${myRiver.source.naturalHeight}
    asset current dims: ${myRiver.sourceNaturalWidth}, ${myRiver.sourceNaturalHeight}
    entity copy dims: ${piccy.currentCopyDimensions[0]}, ${piccy.currentCopyDimensions[1]}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: `${canvas.name}-render`,
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
