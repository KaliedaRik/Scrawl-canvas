// # Demo DOM 011
// Canvas controller 'fit' attribute; Cell positioning (mouse)

// [Run code](../../demo/dom-011.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let artefact = scrawl.library.artefact,
    stack = artefact.mystack,
    canvas = artefact.mycanvas;


// Resize the stack, and give it some CSS
stack.set({
    width: 400,
    height: 400,
    css: {
        margin: '15px 0 0 0',
        border: '1px solid black',
        overflow: 'hidden',
        resize: 'both',
    },
    checkForResize: true,
});


// Setup the (displayed) canvas element to cover the entire stack element, and to respond to changes in the Stack's dimensions
canvas.set({
    width: '100%',
    height: '100%',

    // The `fit` attribute comes into play when the displayed canvas element and its hidden canvas companion (the base canvas) have different dimensions. The hidden canvas is copied over to the displayed canvas at the end of every display cycle.
    //
    // We can influence how this copy happens by setting the `fit` attribute to an appropriate String value (`fill`, `contain`, `cover`, or `none`). These replicate the effect of the [CSS object-fit property](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit).
    fit: 'fill',

    // The Stack artefact's coordinate `[0, 0]` lies at the top left corner of its DOM element's ___content box__, not its _border box_ (as per the HTML/CSS specifications).
    // + We've given the Stack element a 1px border. We need to compensate for this (and any top/left padding) when aligning the canvas element within the stack. 
    // + If we don't do this, we get a 1px white line between the stack border and the canvas (on the top and left edges)
    startX: -1,
    startY: -1,
});


// The base canvas - every displayed canvas element has at least one hidden ('base') canvas companion - does not need to replicate the displayed canvas. For instance, it can have different dimensions. The base canvas is copied over to the displayed canvas at the end of every display cycle.
canvas.setBase({
    width: 800,
    height: 600,
    backgroundColor: 'lightblue',
});


// A displayed canvas can have more than one hidden canvas. These additional 'cells' - which act much like traditional animation cels (see https://en.wikipedia.org/wiki/Cel) - will be copied onto the 'base' canvas before the it gets copied over to the displayed cell at the end of every display cycle.
let cell = canvas.buildCell({
    name: 'mycell',
    width: '50%',
    height: '50%',
    startX: 'center',
    startY: 'center',
    handleX: 'center',
    handleY: 'center',
    roll: 12,
    scale: 1.2,
    backgroundColor: 'blue',
});


// #### Scene animation
// Function to check whether mouse cursor is over the canvas element within the stack, and lock the element artefact accordingly
let check = function () {

    let active = false,
        here = canvas.here,
        cell = scrawl.library.asset.mycell;

    return function () {

        if (here.baseActive !== active) {

            active = here.baseActive;

            cell.set({
                lockTo: (active) ? 'mouse' : 'start',
            });
        }
    };
}();


let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, text,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Animation loop which will run the Display cycle. Note that we don't have to define a target - useful for when we want to cascade through multiple stacks (which don't themselves trigger canvas redraws, just canvas positioning) and multiple canvases
scrawl.makeRender({

    name: 'demo-animation',
    commence: check,
    afterShow: report,

    // During setup, the canvas resizes before its parent stack, meaning that the stack resize doesn't get cascaded down to the canvas for the initial display. We can fix that by adding a run-once function to the animation loop
    afterCreated: () => canvas.set({ width: '100%'}),
});


// #### User interaction
// Event listeners
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: canvas,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        fitselect: ['fit', 'raw'],
    },
});


// Test to make sure Stack is listening for external changes in its dimensions, and that these changes are perculating down to the canvas and its base cell
// + Stack artefact's `checkForResize` flag set to true, enabling the checks
// + Can resize Stack's DOM element by dragging the lower right corner
// + Can also resize the element by using the width and height form controls - these controls then update the element's style width and height via the event listeners below.
// + In both cases, the Stack artefact needs to check whether resizing has occurred and take action.
document.querySelector('#width').addEventListener('input', (e) => {
    stack.domElement.style.width = `${e.target.value}px`;
}, false);
document.querySelector('#height').addEventListener('input', (e) => {
    stack.domElement.style.height = `${e.target.value}px`;
}, false);


// Set the DOM input values
document.querySelector('#fitselect').value = 'fill';
document.querySelector('#width').value = '400';
document.querySelector('#height').value = '400';


// #### Development and testing
// __Dev tip 1:__ Scrawl-canvas doesn't add a namespace object to the Javascript global object. To see what's going on in the Scrawl-canvas library - where all relevant SC objects are held - console log it (in the code file, not directly in the browser console):
//
// `console.log(scrawl.library);`
//
// + doesn't update in real time, but closing and opening the object in the console should reveal values at the point in time when it is reopened
// + In Chrome console (at least), the various objects in the library will be listed with their object type eg Stack, Canvas, Cell, etc
//
// If you only want to view a specific part of the library - for example, just artefacts - console log it out in the same way:
//
// `console.log(scrawl.library.artefact);`
//
// __Dev tip 2:__ to see what's going on in any hidden canvas, temporarily add it to the bottom of the page, or insert it wherever using appropriate DOM API functionality:
//
// `document.body.appendChild(scrawl.library.cell[NAME].element);`
