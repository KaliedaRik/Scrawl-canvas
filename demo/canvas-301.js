// # Demo Canvas 301
// Phrase entity (make, clone, method, multiline)

// [Run code](../../demo/canvas-301.html)
import {
    library as L,
    makeDragZone,
    makePhrase,
    makeRender,
} from '../source/scrawl.js'

import { reportSpeed, killArtefact } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = L.artefact.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Create and clone Phrase entitys
makePhrase({
    name: name('myphrase_fill'),

    text: 'H&epsilon;lj&ouml;!',
    font: 'bold 40px Garamond, serif',

    startX: '14%',
    startY: '28%',
    handleX: 'center',
    handleY: 'center',

    fillStyle: 'green',
    strokeStyle: 'gold',

    lineWidth: 2,
    lineJoin: 'round',
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 2,
    shadowColor: 'black',

    showBoundingBox: true,
    boundingBoxColor: 'red',

    accessibleText: 'Phrase saying: §',
    accessibleTextOrder: 0,

}).clone({
    name: name('myphrase_draw'),
    startX: '38%',
    method: 'draw',
    accessibleTextOrder: 1,

}).clone({
    name: name('myphrase_drawAndFill'),
    startX: '84%',
    method: 'drawAndFill',
    accessibleTextOrder: 2,

}).clone({
    name: name('myphrase_fillAndDraw'),
    startX: '62%',
    method: 'fillAndDraw',
    accessibleTextOrder: 3,
    sharedState: true

}).clone({
    name: name('myphrase_drawThenFill'),
    startX: '14%',
    startY: '67%',
    method: 'drawThenFill',
    accessibleTextOrder: 4,

}).clone({
    name: name('myphrase_fillThenDraw'),
    startX: '38%',
    method: 'fillThenDraw',
    accessibleText: '§ - says the phrase',
    accessibleTextOrder: 5,

}).clone({
    name: name('myphrase_clear'),
    startX: '62%',
    method: 'clear',
    accessibleTextOrder: 6,

}).clone({
    name: name('myphrase_multiline'),

    text: 'Lorem ipsum har varit standard 😀 ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal 🤖 bokstäver och blandade dem för att göra ett 🎻 provexemplar av en bok.',

    width: 120,
    justify: 'center',

    size: '12px',
    weight: 'normal',

    startX: '84%',
    method: 'fill',

    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,

    accessibleText: 'Long phrase: §',
    accessibleTextOrder: 7,
});


// Change the fill and stroke styles on one of the phrase entitys, and any entity sharing that phrase's state
L.artefact[name('myphrase_fillAndDraw')].set({
    fillStyle: 'blue',
    strokeStyle: 'coral'
});


// #### User interaction
// Create the drag-and-drop zone
const current = makeDragZone({

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

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(L);

console.log('Performing tests ...');
killArtefact(canvas, name('myphrase_fill'), 4000);
killArtefact(canvas, name('myphrase_fillAndDraw'), 5000);
killArtefact(canvas, name('myphrase_multiline'), 6000);
