// # Demo Canvas 048
// Display a filtered media stream

// [Run code](../../demo/canvas-048.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// #### Create filters
scrawl.makeFilter({

    name: name('my-complex-filter'),

    actions: [
        {
            action: 'grayscale',
            lineOut: 'top-filter-1',
        },
        {
            lineIn: 'top-filter-1',
            action: 'gaussian-blur',
            radius: 1,
            lineOut: 'top-filter-1',
        },

        // Known issue: if we set lineOut to the same String as lineIn at this point in the filter then it produces incorrect output. Changing (and continuing with) a new lineOut String fixes the bug.
        {
            lineIn: 'top-filter-1',
            action: 'matrix',
            weights: [1, 1, 1, 1, -8, 1, 1, 1, 1],
            lineOut: 'top-filter-2',
        },
        {
            lineIn: 'top-filter-2',
            action: 'channels-to-alpha',
            lineOut: 'top-filter-2',
        },
        {
            lineIn: 'top-filter-2',
            action: 'threshold',
            low: [0, 0, 0, 0],
            high: [0, 0, 0, 255],
            includeAlpha: true,
            level: 20,
            lineOut: 'top-filter-2',
        },
        {
            lineIn: 'source',
            action: 'step-channels',
            red: 15,
            green: 60,
            blue: 60,
            lineOut: 'bottom-filter',
        },
        {
            lineIn: 'bottom-filter',
            action: 'modulate-channels',
            red: 2,
            green: 2,
            blue: 2,
            alpha: 0.5,
            lineOut: 'bottom-filter',
        },
        {
            lineIn: 'top-filter-2',
            lineMix: 'bottom-filter',
            action: 'compose',
            compose: 'source-over',
        }
    ],
});


// #### Importing video sources
// __Display a device-based media stream__ in a Picture entity
// + Note 1: Users will need to explicitly agree to let Scrawl-canvas use the media stream the first time the page loads (the browser should handle this agreement procedure itself)
// + Note 2: importMediaStream returns a Promise!
scrawl.importMediaStream({

    name: name('video-feed'),
    audio: false,
})
.then(res => {

    scrawl.makePicture({

        name: name('camera-picture'),
        asset: res.name,

        width: '100%',
        height: '100%',

        copyWidth: '100%',
        copyHeight: '100%',

        // To get a mirror effect
        start: ['center', 'center'],
        handle: ['center', 'center'],
        flipReverse: true,

        method: 'fill',

        filters: [name('my-complex-filter')],
    });
})
.catch(err => console.log(err.message));


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
