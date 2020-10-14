// # Demo DOM 016
// Determine the displayed shape of the visible stack; react to changes in the displayed shape

// [Run code](../../demo/dom-016.html)
import scrawl from '../source/scrawl.js';

const stack = scrawl.library.artefact.mystack,
    mytext = scrawl.library.artefact.myelement;

// Update the Stack
stack.set({

    checkForResize: true,
});

mytext.set({

    start: ['center', 'center'],
    handle: ['center', 'center'],
});


stack.setDisplayShapeBreakpoints({
    breakToBanner: 3,
    breakToLandscape: 1.5,
    breakToPortrait: 0.65,
    breakToSkyscraper: 0.35,
});


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
    target: stack,
    afterShow: report,

    afterCreated: () => stack.updateDisplayShape(),
});


console.log(scrawl.library);
