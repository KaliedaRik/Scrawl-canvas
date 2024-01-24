// # Demo Canvas 201
// Label entity (make, clone, method)

// [Run code](../../demo/canvas-201.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, killArtefact } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Create and clone Phrase entitys
scrawl.makeLabel({

    name: name('mylabel_fill'),

    text: '|H&epsilon;lj&ouml;!',
    fontString: 'bold 2rem / 3 Garamond',

    start: ['14%', '28%'],
    handle: ['center', 'center'],

    fillStyle: 'rgb(40, 180, 40)',
    strokeStyle: 'gold',

    lineWidth: 2,
    lineJoin: 'round',

    scale: 1.8,
    scaleOutline: false,

    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 2,
    shadowColor: 'black',

    showBoundingBox: true,
    boundingBoxStyle: 'rgb(255 0 0 / 0.7)',

}).clone({

    name: name('mylabel_draw'),
    startX: '38%',
    method: 'draw',

}).clone({

    name: name('mylabel_drawAndFill'),
    startX: '84%',
    method: 'drawAndFill',

}).clone({

    name: name('mylabel_fillAndDraw'),
    startX: '62%',
    method: 'fillAndDraw',
    sharedState: true

}).clone({

    name: name('mylabel_drawThenFill'),
    startX: '14%',
    startY: '67%',
    method: 'drawThenFill'

}).clone({

    name: name('mylabel_fillThenDraw'),
    startX: '38%',
    method: 'fillThenDraw',

}).clone({

    name: name('mylabel_clear'),
    startX: '62%',
    method: 'clear'
});


// Change the fill and stroke styles on one of the Phrase entitys, and any entity sharing that Phrase's state
scrawl.library.artefact[name('mylabel_fillAndDraw')].set({
    fillStyle: 'blue',
    strokeStyle: 'coral',
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


// We have to tell the canvas to check UI for hovering states every Display cycle
const commence = () => canvas.checkHover();


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);

// Kill, and packet, functionality tests
console.log('Performing tests ...');
killArtefact(canvas, name('mylabel_fill'), 4000);
killArtefact(canvas, name('mylabel_fillAndDraw'), 6000);
