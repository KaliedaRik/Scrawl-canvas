// # Demo DOM 011
// Canvas controller 'fit' attribute; Cell positioning (mouse)

// [Run code](../../demo/dom-011.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const stack = scrawl.findStack('mystack'),
    canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Set up the stack to be resizable
stack.set({
    width: 400,
    height: 400,
    checkForResize: true,
});


// A displayed canvas can have more than one hidden canvas. These additional 'cells' - which act much like traditional animation cels (see https://en.wikipedia.org/wiki/Cel) - will be copied onto the 'base' canvas before the it gets copied over to the displayed cell at the end of every display cycle.
const mycell = canvas.buildCell({

    name: name('mycell'),
    dimensions: ['50%', '50%'],
    start: ['center', 'center'],
    handle: ['center', 'center'],
    backgroundColor: 'blue',
    scale: 1.1,
    roll: 10,
});


// #### Scene animation
// Function to check whether mouse cursor is over the canvas element within the stack, and lock the element artefact accordingly
const check = () => {

    const here = canvas.getBase().here;

    mycell.set({ lockTo: (here.active) ? 'mouse' : 'start' });
};


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Animation loop which will run the Display cycle. Note that we don't have to define a target - useful for when we want to cascade through multiple stacks (which don't themselves trigger canvas redraws, just canvas positioning) and multiple canvases
scrawl.makeRender({

    name: name('animation'),
    commence: check,
    afterShow: report,
});


// #### User interaction
const dom = scrawl.initializeDomInputs([
    ['input', 'width', '400'],
    ['input', 'height', '400'],
    ['select', 'fitselect', 3],
    ['select', 'setRelativeDimensionsUsingBase', 0],
]);


// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener(['touchmove'], (e) => {

    e.preventDefault();
    e.returnValue = false;

}, stack.domElement);


// Handle the fit control
const updateFit = (e) => {

    if (e && e.target) canvas.set({ fit: e.target.value});
};
scrawl.addNativeListener(['input', 'change'], updateFit, dom.fitselect);


// Handle the relative dimensions control
const updateRelativeDimensions = (e) => {

    if (e && e.target) mycell.set({
        setRelativeDimensionsUsingBase: (e.target.value === '0') ? false : true,
    });
};
scrawl.addNativeListener(['input', 'change'], updateRelativeDimensions, dom.setRelativeDimensionsUsingBase);


// Handle the width/height control
const updateDimensions = (e) => {

    if (e && e.target) stack.set({
        width: parseFloat(dom.width.value),
        height: parseFloat(dom.height.value),
    });
};
scrawl.addNativeListener(['input', 'change'], updateDimensions, [dom.width, dom.height]);


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

console.log(scrawl.library);
