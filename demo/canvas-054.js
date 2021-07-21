// # Demo Canvas 054 
// Animated contour lines: map a complex gradient to NoiseAsset output

// [Run code](../../demo/canvas-054.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    fit: 'cover',
    checkForResize: true,
});


// Add the NoiseAsset, and a Picture entity in which to display it
const myNoise = scrawl.makeNoiseAsset({
    name: 'base-noise',
    width: 400,
    height: 400,
    scale: 80,

    color: 'rainbow',
    rainbowGradientChoke: 3,
    rainbowDelta: {
        paletteStart: -1,
        paletteEnd: -1,
    },
    rainbowColors: [
        [0, 'red'],
        [339, 'red'],
        [360, 'black'],
        [479, 'black'],
        [500, 'yellow'],
        [839, 'yellow'],
        [860, 'black'],
        [979, 'black'],
        [999, 'red']
    ],
});

scrawl.makePicture({
    name: 'base-noise-subscriber',
    asset: 'base-noise',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
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

    name: 'demo-animation',
    target: canvas,
    afterShow: report,

    commence: () => myNoise.update(),
});


// #### Development and testing
console.log(scrawl.library);
