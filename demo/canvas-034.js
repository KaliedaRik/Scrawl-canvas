// # Demo Canvas 034 
// Determine the displayed shape of the visible canvas; react to changes in the displayed shape

// [Run code](../../demo/canvas-034.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


// Create the demo Phrase entity
const mytext = scrawl.makePhrase({

    name: 'display-shape-text',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    text: `Canvas display shape: undetermined`,
    size: '40px',
    justify: 'center',

    fillStyle: 'black',
});

// Scrawl-canvas recognises five shapes, separated by four breakpoints: 
// + `banner`
// + `landscape`
// + `rectangle`
// + `portrait`
// + `skyscraper`
//
// The values assigned to the breakpoints are Float numbers for the displayed Canvas element's width/height ratio - the value `3` represents the case where the width value is three times __more__ than the height value, while `0.35` represents a width (roughly) 3 times __less__ than the height.
// 
// We can set a Canvas artefact's breakpoints in one go using the dedicated `setDisplayShapeBreakpoints()` function, as below. Alternatively we can use the regular `set()` function, supplying the attributes `breakToBanner`, `breakToLandscape`, `breakToPortrait` and `breakToSkyscraper` as required. The values given here are the default values for Canvas artefacts.
//
// Similar functionality exists to adjust to the current (base) Cell area (width * height)
canvas.setDisplayShapeBreakpoints({

    breakToBanner: 3,
    breakToLandscape: 1.5,
    breakToPortrait: 0.65,
    breakToSkyscraper: 0.35,

    breakToSmallest: 100000,
    breakToSmaller: 150000,
    breakToLarger: 200000,
    breakToLargest: 300000,
});

// Each display shape has an associated hook function (by default a function that does nothing) which Scrawl-canvas will run each time it detects that the Canvas display shape has changed to that shape. We can replace these null-functions with our own; this allows us to configure the scene/animation to accommodate different display shapes, thus making the code reusable in a range of different web page environments.
//
// We can set/update these functions at any time using the normal `set()` function:
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

    actionLargestArea: () => {
        mytext.set({
            size: '40px',
        });
    },

    actionRegularArea: () => {
        mytext.set({
            size: '28px',
        });
    },

    actionSmallestArea: () => {
        mytext.set({
            size: '16px',
        });
    },
});

// We can also set/update the functions using dedicated `setAction???Shape()` functions:
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

canvas.setActionLargerArea(() => {
    mytext.set({
        size: '34px',
    });
});

canvas.setActionSmallerArea(() => {
    mytext.set({
        size: '22px',
    });
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


// #### Development and testing
console.log(scrawl.library);
