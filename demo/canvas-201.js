// # Demo Canvas 201
// Label entity (make, clone, method); Label accessible text

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

    fontString: 'bold 2em / 3 Garamond',

    // Alternative font strings, for testing
    /*
    fontString: 'bold 2.5vmax / 3 Garamond',
    fontString: 'bold 32px / 3 Garamond',
    */

    text: '|H&epsilon;lj&ouml;!',
    accessibleText: `${name('mylabel_fill')} says: §`,
    accessibleTextOrder: 0,

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
    accessibleText: `${name('mylabel_draw')} says: §`,
    accessibleTextOrder: 2,

}).clone({

    name: name('mylabel_drawAndFill'),
    startX: '84%',
    method: 'drawAndFill',
    accessibleText: `${name('mylabel_drawAndFill')} says: §`,
    accessibleTextOrder: 4,

}).clone({

    name: name('mylabel_fillAndDraw'),
    startX: '62%',
    method: 'fillAndDraw',
    sharedState: true,
    accessibleText: `${name('mylabel_fillAndDraw')} says: §`,
    accessibleTextOrder: 6,

}).clone({

    name: name('mylabel_drawThenFill'),
    startX: '14%',
    startY: '67%',
    method: 'drawThenFill',
    accessibleText: `§ from ${name('mylabel_drawThenFill')}`,
    accessibleTextOrder: 5,

}).clone({

    name: name('mylabel_fillThenDraw'),
    startX: '38%',
    method: 'fillThenDraw',
    accessibleText: `${name('mylabel_fillThenDraw')} says: §`,
    accessibleTextOrder: 3,

}).clone({

    name: name('mylabel_clear'),
    startX: '62%',
    method: 'clear',
    accessibleText: `${name('mylabel_clear')} says: §`,
    accessibleTextOrder: 1,
    textIsAccessible: false,
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

    let rep = '';
    document.fonts.forEach(k => {
        if (k.status == 'loaded') rep +=(`    ${k.family} ${k.weight} ${k.style}\n`)
    })

    return `Currently dragging: ${(typeof dragging !== 'boolean' && dragging) ? dragging.artefact.name : 'nothing'}

Loaded fonts:
${rep}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,

    // We have to tell the canvas to check UI for hovering states every Display cycle
    commence: () => canvas.checkHover(),
});


// #### Development and testing
console.log(scrawl.library);

// Kill, and packet, functionality tests
console.log('Performing tests ...');
killArtefact(canvas, name('mylabel_fill'), 4000);
killArtefact(canvas, name('mylabel_fillAndDraw'), 6000);

// Accessible text manipulation
setTimeout(() => scrawl.library.artefact[name('mylabel_clear')].set({ textIsAccessible: true }), 8000);
setTimeout(() => scrawl.library.artefact[name('mylabel_drawAndFill')].set({ textIsAccessible: false }), 10000);
