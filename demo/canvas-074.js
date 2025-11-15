// # Demo Canvas 074
// EnhancedShape entity composition

// [Run code](../../demo/canvas-074.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('my-canvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create component entitys
const circle = scrawl.makeOval({
    name: name('circle'),
    fillStyle: 'lightGreen',
    strokeStyle: 'orange',
    lineWidth: 4,
    method: 'fillAndDraw',
    start: [40, 40],
    radius: 60,
});

const cog = scrawl.makeCog({
    name: name('cog'),
    start: ['50%', 100],
    handle: ['center', 'center'],

    outerRadius: 80,
    innerRadius: 65,
    outerControlsDistance: 4,
    innerControlsDistance: 2,
    points: 7,
    twist: 20,

    fillStyle: 'beige',
    strokeStyle: 'gray',
    lineWidth: 4,
    method: 'fillAndDraw',
    curve: 'quadratic',
});

const box = scrawl.makeRectangle({
    name: name('box'),
    start: [440, 50],
    rectangleWidth: 120,
    rectangleHeight: 80,
    radius: 20,
    fillStyle: 'lightblue',
    strokeStyle: 'orange',
    lineWidth: 4,
    method: 'fillAndDraw',
});

scrawl.makeBlock({
    name: name('block'),
    start: [440, 160],
    dimensions: [120, 80],
    fillStyle: 'rgb(200 200 200 / 1)',
    strokeStyle: 'gray',
    lineWidth: 4,
    method: 'fillAndDraw',
})

const mixup = scrawl.makeEnhancedShape({
    name: name('mixup'),
    start: [100, 400],

    fillStyle: 'pink',
    strokeStyle: 'gray',
    lineWidth: 4,
    method: 'fillAndDraw',

    components: [{
        component: box,
        order: 5,
        operation: 'add',
    }, {
        // Should exclude from components - duplicate object
        component: name('box'),
        order: 4,
        operation: 'subtract',
   }, {
        component: box,
        order: 3,
        // Should exclude from components - illegal operation
        operation: 'xor',
   }, {
        // Should exclude from components - not a permitted component
        component: name('block'),
        order: 2,
        operation: 'add',
    }, {
        component: name('circle'),
        // Should exclude from components - unacceptable order (check happens before duplicates check)
        order: -1,
        operation: 'intersect',
    }, {
        component: name('circle'),
        order: 0,
        operation: 'base',
    }],
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
