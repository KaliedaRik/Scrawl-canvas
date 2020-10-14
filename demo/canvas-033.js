// # Demo Canvas 033 
// User preferences: prefers-color-scheme; prefers-reduced-motion

// [Run code](../../demo/canvas-033.html)
import scrawl from '../source/scrawl.js'


const canvas = scrawl.library.canvas.mycanvas;

const background_dark = '#404040',
    text_dark = '#c0ffc0',
    background_light = '#f0f0f0',
    text_light = '#408f40';

canvas.set({

    fit: "cover",
    checkForResize: true,

}).setBase({

    width: 800,
    height: 800,

}).setAsCurrentCanvas();


scrawl.makeOval({

    name: 'loader-track',

    radiusX: '22%',
    radiusY: '12%',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    strokeStyle: '#808080',
    lineWidth: 10,
    method: 'draw',

    delta: {
        roll: 0.2
    },

    useAsPath: true,
    precision: 0.1
});

const textGroup = scrawl.makeGroup({

    name: 'text-group',
    host: canvas.base.name,
});

scrawl.makePhrase({

    name: 'loader-text-1',
    group: textGroup,

    weight: 'bold',

    text: 'Loading',
    size: '50px',
    justify: 'center',

    textPath: 'loader-track',
    handleY: '120%',

    delta: {
      textPathPosition: -0.002
    },

}).clone({

    name: 'loader-text-2',
    textPathPosition: 0.333,

}).clone({

    name: 'loader-text-3',
    textPathPosition: 0.667,
});


scrawl.setColorSchemeDarkAction(() => {

    canvas.set({ backgroundColor: background_dark});
    textGroup.setArtefacts({ fillStyle: text_dark});
});

scrawl.setColorSchemeLightAction(() => {
    
    canvas.set({ backgroundColor: background_light});
    textGroup.setArtefacts({ fillStyle: text_light});
});

scrawl.colorSchemeActions();


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
});


scrawl.setReduceMotionAction(() => {

    if (demoAnimation.isRunning()) demoAnimation.halt();
});

scrawl.setNoPreferenceMotionAction(() => {

    if (!demoAnimation.isRunning()) demoAnimation.run();
});

setTimeout(() => scrawl.reducedMotionActions(), 5000);


console.log(scrawl.library);
