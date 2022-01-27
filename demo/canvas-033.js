// # Demo Canvas 033 
// User preferences: prefers-color-scheme; prefers-reduced-motion

// [Run code](../../demo/canvas-033.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


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
const track = scrawl.makeOval({

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
canvas.setColorSchemeDarkAction(() => {

    canvas.set({ backgroundColor: background_dark});
    textGroup.setArtefacts({ fillStyle: text_dark});
});

canvas.setColorSchemeLightAction(() => {
    
    canvas.set({ backgroundColor: background_light});
    textGroup.setArtefacts({ fillStyle: text_light});
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### prefers-reduced-motion actions
const checkE = (e) => {
    if (e) {
        if ("keydown" === e.type) {
            if (32 === e.keycode) return true; // spacebar
            if (13 === e.keycode) return true; // enter key
        }
        if ("click" === e.type) return true; // mouse click
        if ("touchend" === e.type) return true; // tap
    }
    return false;
};

const startAnimation = (e) => {
    if (e === "reduced-motion" || checkE(e)) {
        track.set({ noDeltaUpdates: false });
        textGroup.setArtefacts({ noDeltaUpdates: false });
    }
};

const stopAnimation = (e) => {
    if (e === "reduced-motion" || checkE(e)) {
        track.set({ noDeltaUpdates: true });
        textGroup.setArtefacts({ noDeltaUpdates: true });
    }
};

canvas.setReduceMotionAction(() => setTimeout(() => stopAnimation("reduced-motion"), 5000));

canvas.setNoPreferenceMotionAction(() => startAnimation("reduced-motion"));

const startButton = scrawl.addNativeListener(['click', 'keydown', 'touchend'], startAnimation, '#play');

const stopButton = scrawl.addNativeListener(['click', 'keydown', 'touchend'], stopAnimation, '#pause');



// #### Development and testing
// In chrome browsers, open the inspector and enable the __Rendering__ view - this includes selectors to emulate both `prefers-reduced-motion` and `prefers-color-scheme` user choices.
console.log(scrawl.library);
