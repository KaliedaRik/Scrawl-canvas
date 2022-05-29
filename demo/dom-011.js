// # Demo DOM 011
// Canvas controller 'fit' attribute; Cell positioning (mouse)

// [Run code](../../demo/dom-011.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


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


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Animation loop which will run the Display cycle. Note that we don't have to define a target - useful for when we want to cascade through multiple stacks (which don't themselves trigger canvas redraws, just canvas positioning) and multiple canvases
scrawl.makeRender({

    name: 'demo-animation',
    commence: check,
    afterShow: report,
});


// #### User interaction
// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener(['touchmove'], (e) => {

    e.preventDefault();
    e.returnValue = false;

}, stack.domElement);

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
// @ts-expect-error
    stack.domElement.style.width = `${e.target.value}px`;
}, false);
document.querySelector('#height').addEventListener('input', (e) => {
// @ts-expect-error
    stack.domElement.style.height = `${e.target.value}px`;
}, false);


// Set the DOM input values
// @ts-expect-error
document.querySelector('#fitselect').value = 'fill';
// @ts-expect-error
document.querySelector('#width').value = '400';
// @ts-expect-error
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
