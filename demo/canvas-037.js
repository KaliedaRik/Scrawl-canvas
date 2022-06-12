// # Demo Canvas 037 
// Pan and zoom using a Picture entity
//
// Scrawl-canvas does not include built-in functionality to easily "zoom" (expand/contract the contents of) a &lt;canvas> element. Nor does it include functionality to "pan" (move in any direction through the contents of) the canvas. The use cases for, and the user interactions for controlling, such functionality are too varied; any attempt to capture a particular approach within the library's code base would necessarily make other, equally valid, approaches more problematic for developers to implement.
//
// The code in this demo demonstrates how to capture user actions in events, which can then be used to build a "zoom and pan" experience. The demo uses a Picture entity, because that entity _does_ include functionality which prevents the entity from going beyond the borders of its image (or video) asset.
//
// [Run code](../../demo/canvas-037.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene state
// Because we need to manually calculate the copy position and dimensions for the Picture entity, we need to create state to hold known values and record changes between user interactions
// + `naturalWidth/Height` - the image asset's natural dimensions (fixed value)
// + `frameDimension` - the &lt;canvas> element's (non-responsive) dimension values
// + `scale` variables to track scale limits and value
// + `from` variables to track the copyStart coordinate
let naturalWidth = 4160,
    naturalHeight = 3120,
    frameDimension = 500,
    maxScale = naturalHeight / frameDimension,
    currentScale = maxScale,
    minScale = 1,
    fromLeft = 0,
    fromTop = 0;

// Convenience variables to access key Scrawl-canvas objects stored in the library
let canvas = scrawl.library.canvas.mycanvas, 
    base = canvas.base,
    baseGroup = scrawl.library.group[base.name];


// #### Scene setup

// The Picture entity will cover the entire displayed canvas
let piccie = scrawl.makePicture({

    name: 'river-pic',

    imageSource: './img/river.jpg',

    width: '100%',
    height: '100%',

    copyWidth: currentScale * frameDimension,
    copyHeight: currentScale * frameDimension,

    copyStartX: fromLeft,
    copyStartY: fromTop,
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


// #### Bespoke user interaction
// We shall build the "zoom" and "pan" effects using event listeners.
// + For the purposes of accessibility these events should be extended to include keyboard interactions
// + Mobile devices should also include multitouch gestures - such activity is often best captured using a dedicated third party Javascript library, for example [hammer.js](https://hammerjs.github.io/)
//
// Zoom effect
scrawl.addNativeListener('wheel', (e) => {

    e.preventDefault();

    let oldScale = currentScale,
        here = canvas.here;

    currentScale += (e.deltaY * -0.0005);

    if (currentScale > maxScale) currentScale = maxScale;
    else if (currentScale < minScale) currentScale = minScale;

    let delta = (frameDimension * oldScale) - (frameDimension * currentScale);

    fromLeft += delta * here.normX;
    fromTop += delta * here.normY;

    piccie.set({

        copyWidth: currentScale * frameDimension,
        copyHeight: currentScale * frameDimension,

        copyStartX: fromLeft,
        copyStartY: fromTop,
    });
}, canvas.domElement);

// Define some additional scene state, specifically for the "pan" effect
let draggingArtefact = false,
    currentDragX = 0,
    currentDragY = 0;

// Pan effect, split across three separate event listeners (starting, during, ending)
scrawl.addListener('down', (e) => {

    let here = base.here,
        target = baseGroup.getArtefactAt(base.here);

    draggingArtefact = (target && target.artefact && target.artefact.type == 'Picture') ? 
        target.artefact : 
        false; 

    if (draggingArtefact) {
        currentDragX = here.x;
        currentDragY = here.y;
    }
}, canvas.domElement);

scrawl.addListener('move', (e) => {

    let here = base.here;

    if (draggingArtefact) {

        fromLeft += (currentDragX - here.x) * currentScale;
        fromTop += (currentDragY - here.y) * currentScale;

        currentDragX = here.x,
        currentDragY = here.y;

        if (fromLeft < 0) fromLeft = 0;
        else if (fromLeft > naturalWidth - frameDimension) fromLeft = naturalWidth - frameDimension;

        if (fromTop < 0) fromTop = 0;
        else if (fromTop > naturalHeight - frameDimension) fromTop = naturalHeight - frameDimension;

        piccie.set({
            copyStartX: fromLeft,
            copyStartY: fromTop,
        });
    }
}, canvas.domElement);

scrawl.addListener(['up', 'leave'], (e) => {

    draggingArtefact = false;
    currentDragX = 0;
    currentDragY = 0;

}, canvas.domElement);


// #### Development and testing
console.log(scrawl.library);
