// # Demo Canvas 034 
// Determine the displayed shape of the visible canvas; react to changes in the displayed shape

// [Run code](../../demo/canvas-034.html)
import scrawl from '../source/scrawl.js';


const canvas = scrawl.library.canvas.mycanvas;

canvas.set({

    fit: "cover",
    checkForResize: true,

}).setBase({

    width: 800,
    height: 800,

}).setAsCurrentCanvas();


const mytext = scrawl.makePhrase({

    name: 'display-shape-text',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    text: `Canvas display shape: undetermined`,
    size: '40px',
    justify: 'center',

    fillStyle: 'black',
});


canvas.setDisplayShapeBreakpoints({
    breakToBanner: 3,
    breakToLandscape: 1.5,
    breakToPortrait: 0.65,
    breakToSkyscraper: 0.35,
});


canvas.set({

    actionBannerShape: () => {
        mytext.set({
            text: `Canvas display shape: ${canvas.get('displayShape')}`,
            roll: 0,
        });
    },

    actionRectangleShape: () => {
        mytext.set({
            text: `Canvas display shape: ${canvas.get('displayShape')}`,
            roll: -45,
        });
    },

    actionSkyscraperShape: () => {
        mytext.set({
            text: `Canvas display shape: ${canvas.get('displayShape')}`,
            roll: -90,
        });
    },
});

canvas.setActionPortraitShape(() => {
    mytext.set({
        text: `Canvas display shape: ${canvas.get('displayShape')}`,
        roll: -67.5,
    });
});

canvas.setActionLandscapeShape(() => {
    mytext.set({
        text: `Canvas display shape: ${canvas.get('displayShape')}`,
        roll: -22.5,
    });
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
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,

    afterCreated: () => canvas.updateDisplayShape(),
});


console.log(scrawl.library);
