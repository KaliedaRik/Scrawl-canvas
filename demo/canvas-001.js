// # Demo Canvas 001
// Block and Wheel entitys (make, clone, method); drag and drop block and wheel entitys

// [Run code](../../demo/canvas-001.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, killArtefact } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');

// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create and clone block entitys
scrawl.makeBlock({
    name: name('block-fill'),
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
    name: name('block-draw'),
    startX: 175,
    method: 'draw',
    sharedState: true

}).clone({
    name: name('block-drawAndFill'),
    startX: 325,
    method: 'drawAndFill',

}).clone({
    name: name('block-fillAndDraw'),
    startX: 475,
    method: 'fillAndDraw',
    sharedState: true

}).clone({
    name: name('block-drawThenFill'),
    startY: 175,
    method: 'drawThenFill'

}).clone({
    name: name('block-fillThenDraw'),
    startX: 325,
    method: 'fillThenDraw',
    sharedState: true

}).clone({
    name: name('block-clear'),
    startX: 175,
    method: 'clear'
});


// Create and clone Wheel entitys
scrawl.makeWheel({
    name: name('wheel-fill'),
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
    name: name('wheel-draw'),
    startX: 325,
    method: 'draw',
    sharedState: true

}).clone({
    name: name('wheel-drawAndFill'),
    startX: 175,
    method: 'drawAndFill',

}).clone({
    name: name('wheel-fillAndDraw'),
    startX: 25,
    method: 'fillAndDraw',
    sharedState: true

}).clone({
    name: name('wheel-drawThenFill'),
    startY: 325,
    method: 'drawThenFill'

}).clone({
    name: name('wheel-fillThenDraw'),
    startX: 175,
    method: 'fillThenDraw',
    sharedState: true

}).clone({
    name: name('wheel-clear'),
    startX: 325,
    method: 'clear'
});


// Change the fill and stroke styles on one of the blocks, and one of the wheels, and any entitys sharing their respective states
// + This is also a test to make sure the library `findXYZ` functions are working
scrawl.findArtefact(name('block-fillAndDraw')).set({
    fillStyle: 'blue',
    strokeStyle: 'coral'
});

scrawl.findEntity(name('wheel-fillAndDraw')).set({
    fillStyle: 'blue',
    strokeStyle: 'coral'
});


// #### User interaction
// Make an object to hold functions we'll use for UI
const setCursorTo = {

    auto: () => {
        canvas.set({
            css: {
                cursor: 'auto',
            },
        });
    },
    pointer: () => {
        canvas.set({
            css: {
                cursor: 'grab',
            },
        });
    },
    grabbing: () => {
        canvas.set({
            css: {
                cursor: 'grabbing',
            },
        });
    },
};

// Create the drag-and-drop zone
const current = scrawl.makeDragZone({

    zone: canvas,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,
    updateOnStart: setCursorTo.grabbing,
    updateOnEnd: setCursorTo.pointer,
});

// Implement the hover check on the Canvas wrapper
canvas.set({
    checkForEntityHover: true,
    onEntityHover: setCursorTo.pointer,
    onEntityNoHover: setCursorTo.auto,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const dragging = current();
    return `Currently dragging: ${(typeof dragging !== 'boolean' && dragging) ? dragging.artefact.name : 'nothing'}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: () => canvas.checkHover(),
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);

console.log('Performing tests ...');

// Test to make sure the shorthand ways to find a Canvas wrapper's base Cell's group are working as expected
console.log('canvas.get(\'baseName\')', canvas.get('baseName'));
console.log('canvas.get(\'baseGroup\')', canvas.get('baseGroup'));
console.log('canvas.base.get(\'group\')', canvas.base.get('group'));
console.log('canvas.getBase()', canvas.getBase());
console.log('canvas.getBaseHere()', canvas.getBaseHere());
console.log('canvas.here', canvas.here);

// Kill, and packet, functionality tests
killArtefact(scrawl, canvas, name('block-fill'), 4000);
killArtefact(scrawl, canvas, name('wheel-fillAndDraw'), 6000);
