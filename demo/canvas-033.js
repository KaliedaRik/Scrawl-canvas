// # Demo Canvas 033 
// User preferences: prefers-color-scheme; prefers-reduced-motion

// [Run code](../../demo/canvas-033.html)
import scrawl from '../source/scrawl.js'

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

const background_dark = '#404040',
    text_dark = '#c0ffc0',
    background_light = '#f0f0f0',
    text_light = '#408f40';

canvas.set({

    fit: "cover",
    checkForResize: true,
    ignoreCanvasCssDimensions: true,

}).setBase({

    width: 800,
    height: 800,

}).setAsCurrentCanvas();

// Create the demo Oval entity
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

// Create the three Phrase entitys that will animate around the oval
// + We give them their own group to make updating their attributes easier
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


// #### prefers-color-scheme actions
// Setup the actions to take, to match the animation scene to the user's preference for `dark` or `light` (default) color scheme
scrawl.setColorSchemeDarkAction(() => {

    canvas.set({ backgroundColor: background_dark});
    textGroup.setArtefacts({ fillStyle: text_dark});
});

scrawl.setColorSchemeLightAction(() => {
    
    canvas.set({ backgroundColor: background_light});
    textGroup.setArtefacts({ fillStyle: text_light});
});

// Invoke prefers-color-scheme actions test
// + Scrawl-canvas will automatically check to see if user changes their preference while the scene is running, and action the change when detected
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


// #### prefers-reduced-motion actions
// Setup the actions to take, to match the animation scene to the user's preference for `reduced` or unspecified (default) animation
scrawl.setReduceMotionAction(() => {

    if (demoAnimation.isRunning()) demoAnimation.halt();
});

scrawl.setNoPreferenceMotionAction(() => {

    if (!demoAnimation.isRunning()) demoAnimation.run();
});

// Invoke prefers-reduced-motion actions test
// + Accessibility recommendation is that a scene should not animate for more than 5 seconds - we can honour this recommendation by delaying the test using `setTimeout`. This approach also allows us to add in an event listener (and any associated canvas chrome/notifications) which would allow the user to interact with the canvas so that animation can resume.
// + Additionally, Scrawl-canvas will automatically check to see if user changes their preference while the scene is running, and action the change when detected.
setTimeout(() => scrawl.reducedMotionActions(), 5000);


// #### Development and testing
// In chrome browsers, open the inspector and enable the __Rendering__ view - this includes selectors to emulate both `prefers-reduced-motion` and `prefers-color-scheme` user choices.
console.log(scrawl.library);
