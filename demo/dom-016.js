// # Demo DOM 016
// Determine the displayed shape of the visible stack; react to changes in the displayed shape

// [Run code](../../demo/dom-016.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

const stack = scrawl.library.artefact.mystack,
    mytext = scrawl.library.artefact.myelement;

// #### Scene setup
stack.set({

    checkForResize: true,
});

mytext.set({

    start: ['center', 'center'],
    handle: ['center', 'center'],
});

// Scrawl-canvas recognises five shapes, separated by four breakpoints: 
// + `banner`
// + `landscape`
// + `rectangle`
// + `portrait`
// + `skyscraper`
//
// The values assigned to the breakpoints are Float numbers for the Stack artefact's width/height ratio - the value `3` represents the case where the width value is three times __more__ than the height value, while `0.35` represents a width (roughly) 3 times __less__ than the height.
// 
// We can set a Stack artefact's breakpoints in one go using the dedicated `setDisplayShapeBreakpoints()` function, as below. Alternatively we can use the regular `set()` function, supplying the attributes `breakToBanner`, `breakToLandscape`, `breakToPortrait` and `breakToSkyscraper` as required. The values given here are the default values for Stack artefacts.
stack.setDisplayShapeBreakpoints({
    breakToBanner: 3,
    breakToLandscape: 1.5,
    breakToPortrait: 0.65,
    breakToSkyscraper: 0.35,
});

// Each display shape has an associated hook function (by default a function that does nothing) which Scrawl-canvas will run each time it detects that the Stack display shape has changed to that shape. We can replace these null-functions with our own; this allows us to configure the scene/animation to accommodate different display shapes, thus making the code reusable in a range of different web page environments.
//
// We can set/update these functions at any time using the normal `set()` function:
stack.set({

    actionBannerShape: () => {
        mytext.set({
            roll: 0,
        });
        mytext.domElement.textContent = `Stack display shape: ${stack.get('displayShape')}`;
    },

    actionRectangleShape: () => {
        mytext.set({
            roll: -45,
        });
        mytext.domElement.textContent = `Stack display shape: ${stack.get('displayShape')}`;
    },

    actionSkyscraperShape: () => {
        mytext.set({
            roll: -90,
        });
        mytext.domElement.textContent = `Stack display shape: ${stack.get('displayShape')}`;
    },
});

// We can also set/update the functions using dedicated `setAction???Shape()` functions:
stack.setActionPortraitShape(() => {
    mytext.set({
        roll: -67.5,
    });
    mytext.domElement.textContent = `Stack display shape: ${stack.get('displayShape')}`;
});

stack.setActionLandscapeShape(() => {
    mytext.set({
        roll: -22.5,
    });
    mytext.domElement.textContent = `Stack display shape: ${stack.get('displayShape')}`;
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: stack,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
