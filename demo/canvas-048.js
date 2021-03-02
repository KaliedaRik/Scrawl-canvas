// # Demo Canvas 048 
// Display a filtered media stream

// [Run code](../../demo/canvas-048.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.canvas.mycanvas;

canvas.set({

    // Make the canvas responsive
    fit: 'cover',
    checkForResize: true,

}).setBase({

    // We'll set the base canvas's dimensions to match our video's dimensions
    // - This isn't required, but it cuts down on possible distortions later
    width: 640,
    height: 360,
});


// #### Create filters
scrawl.makeFilter({
    name: "top-filter",

    actions: [
        {
            action: "grayscale"
        },
        {
            action: "matrix",
            width: 3,
            height: 3,
            offsetX: 1,
            offsetY: 1,
            weights: [1, 1, 1, 1, -8, 1, 1, 1, 1]
        },
        {
            action: "blur",
            radius: 2,
        },
        {
            action: "channels-to-alpha"
        },
        {
            action: "invert-channels"
        }
    ],

}).clone({

    name: "bottom-filter",

    actions: [
        {
            action: "step-channels",
            red: 63,
            green: 63,
            blue: 63
        }
    ],
});


// #### Importing video sources
// __Display a device-based media stream__ in a Picture entity
// + Note 1: Users will need to explicitly agree to let Scrawl-canvas use the media stream the first time the page loads (the browser should handle this agreement procedure itself)
// + Note 2: importMediaStream returns a Promise!
scrawl.importMediaStream({
    audio: false,
})
.then(myface => {

    scrawl.makePicture({

        name: "camera-picture-1",
        asset: myface.name,

        width: '100%',
        height: '100%',

        copyWidth: '100%',
        copyHeight: '100%',

        method: 'fill',

        globalAlpha: 0.5,

        filters: ["bottom-filter"],

    }).clone({

        name: "camera-picture-2",
        globalAlpha: 1,
        filters: ["top-filter"]
    });
})
.catch(err => console.log(err.message));


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
});
