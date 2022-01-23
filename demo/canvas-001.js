// # Demo Canvas 001 
// Block and Wheel entitys (make, clone, method); drag and drop block and wheel entitys

// [Run code](../../demo/canvas-001.html)

// Various ways to import the SAcrawl-canvas library, depending on project requirements
// ```
// // If library has been added to a project build using npm/yarn/etc and is being bundled:
// import scrawl from 'scrawl';
//
// // If library has been added to a public/dist folder in the code base:
// import scrawl from './path/to/min/scrawl.js';
//
// // If library is imported from a Content Distribution Network endpoint:
// import scrawl from 'https://path/to/cdn/endpoint/scrawl-canvas';
//
// // If the library is to be used in a TypeScript project, or for tree-shaking, then functions need to be imported individually.
// // (Tree-shaking functionality to help package managers reduce the size of the shipped library code is on the road map for delivery as part of SC version 9.0.0)
// import {
//     makeBlock,
//     makeWheel,
// } from 'relevant-library-path-source';
// ```
//
// + All testing Demos use the TS version for loading the library, so we can test the library's .d.ts TypeScript definitions file against them (SC doesn't use TS internally). Other approaches tend to generate a TypeScript error claiming (wrongly) that the library doesn't have a default export.
import {
    library as L,
    makeBlock,
    makeDragZone,
    makeRender,
    makeWheel,
    setIgnorePixelRatio,
} from '../source/scrawl.js';

import { reportSpeed, killArtefact } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
setIgnorePixelRatio(false);


// #### Scene setup
let canvas = L.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue'
});


// Create and clone block entitys
makeBlock({
    name: 'myblock-fill',
    width: 100,
    height: 100,
    startX: 25,
    startY: 25,

    fillStyle: 'green',
    strokeStyle: 'gold',

    lineWidth: 6,
    lineJoin: 'round',
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    shadowBlur: 2,
    shadowColor: 'black',

}).clone({
    name: 'myblock-draw',
    startX: 175,
    method: 'draw',
    sharedState: true

}).clone({
    name: 'myblock-drawAndFill',
    startX: 325,
    method: 'drawAndFill',

}).clone({
    name: 'myblock-fillAndDraw',
    startX: 475,
    method: 'fillAndDraw',
    sharedState: true

}).clone({
    name: 'myblock-drawThenFill',
    startY: 175,
    method: 'drawThenFill'

}).clone({
    name: 'myblock-fillThenDraw',
    startX: 325,
    method: 'fillThenDraw',
    sharedState: true

}).clone({
    name: 'myblock-clear',
    startX: 175,
    method: 'clear'
});


// Create and clone Wheel entitys
makeWheel({
    name: 'mywheel-fill',
    radius: 50,
    startAngle: 15,
    endAngle: -15,
    includeCenter: true,

    startX: 475,
    startY: 475,

    fillStyle: 'purple',
    strokeStyle: 'gold',

    lineWidth: 6,
    lineJoin: 'round',
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    shadowBlur: 2,
    shadowColor: 'black',

    purge: 'all',

}).clone({
    name: 'mywheel-draw',
    startX: 325,
    method: 'draw',
    sharedState: true

}).clone({
    name: 'mywheel-drawAndFill',
    startX: 175,
    method: 'drawAndFill',

}).clone({
    name: 'mywheel-fillAndDraw',
    startX: 25,
    method: 'fillAndDraw',
    sharedState: true

}).clone({
    name: 'mywheel-drawThenFill',
    startY: 325,
    method: 'drawThenFill'

}).clone({
    name: 'mywheel-fillThenDraw',
    startX: 175,
    method: 'fillThenDraw',
    sharedState: true

}).clone({
    name: 'mywheel-clear',
    startX: 325,
    method: 'clear'
});


// Change the fill and stroke styles on one of the blocks, and one of the wheels, and any entitys sharing their respective states
L.artefact['myblock-fillAndDraw'].set({
    fillStyle: 'blue',
    strokeStyle: 'coral'
});

// Entitys can be found in both the 'artefact' and 'entity' sections of the library
L.entity['mywheel-fillAndDraw'].set({
    fillStyle: 'blue',
    strokeStyle: 'coral'
});


// #### User interaction
// Create the drag-and-drop zone
let current = makeDragZone({

    zone: canvas,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
    const dragging = current();
    return `Currently dragging: ${(typeof dragging !== 'boolean' && dragging) ? dragging.artefact.name : 'nothing'}`;
});


// Create the Display cycle animation
makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(L);

console.log('Performing tests ...');
killArtefact(canvas, 'myblock-fill', 4000);
killArtefact(canvas, 'mywheel-fillAndDraw', 6000);
