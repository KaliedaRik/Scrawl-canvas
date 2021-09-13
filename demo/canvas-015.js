// # Demo Canvas 015 
// Phrase entity (make, clone, method, multiline)

// [Run code](../../demo/canvas-015.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed, killArtefact } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    backgroundColor: 'aliceblue',
    css: {
        border: '1px solid black'
    }
});


// Create and clone Phrase entitys
scrawl.makePhrase({
    name: 'myphrase_fill',

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

}).clone({
    name: 'myphrase_draw',
    startX: '38%',
    method: 'draw',

}).clone({
    name: 'myphrase_drawAndFill',
    startX: '84%',
    method: 'drawAndFill',

}).clone({
    name: 'myphrase_fillAndDraw',
    startX: '62%',
    method: 'fillAndDraw',
    sharedState: true

}).clone({
    name: 'myphrase_drawThenFill',
    startX: '14%',
    startY: '67%',
    method: 'drawThenFill'

}).clone({
    name: 'myphrase_fillThenDraw',
    startX: '38%',
    method: 'fillThenDraw',

}).clone({
    name: 'myphrase_clear',
    startX: '62%',
    method: 'clear'

}).clone({
    name: 'myphrase_multiline',

    text: 'Lorem ipsum har varit standard ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal bokstäver och blandade dem för att göra ett provexemplar av en bok.',

    width: 120,
    justify: 'center',

    size: '12px',
    weight: 'normal',

    startX: '84%',
    method: 'fill',

    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
});


// Change the fill and stroke styles on one of the phrase entitys, and any entity sharing that phrase's state
scrawl.library.artefact.myphrase_fillAndDraw.set({
    fillStyle: 'blue',
    strokeStyle: 'coral'
});


// #### User interaction
// Create the drag-and-drop zone
let current = scrawl.makeDragZone({

    zone: canvas,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
    const dragging = current();
    return `Currently dragging: ${(dragging) ? dragging.artefact.name : 'nothing'}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);

console.log('Performing tests ...');
killArtefact(canvas, 'myphrase_fill', 4000);
killArtefact(canvas, 'myphrase_fillAndDraw', 5000);
killArtefact(canvas, 'myphrase_multiline', 6000);
