// # Demo Canvas 025
// Various responsive and non-responsive canvases; responsive images

// [Run code](../../demo/canvas-025.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// Namespacing boilerplate
const namespace = 'demo-canvas-025';
const name = (n) => `${namespace}-${n}`;


// Import image from DOM, and add data to it
scrawl.importDomImage('.myimage');


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Build (most of) the canvas displays
const demoBuilder = (canvasName) => {

    const c = scrawl.findCanvas(canvasName);

    c.set({ backgroundColor: 'yellow' });

    scrawl.makeOval({

        name: name(`${canvasName}-oval1`),
        group: c.base.name,
        start: ['center', 'center'],
        handle: ['center', 'center'],
        radiusX: '20%',
        radiusY: '20%',
        fillStyle: 'blue',
        strokeStyle: 'lightblue',
        lineWidth: 10,
        method: 'fillThenDraw',
    });

    scrawl.makeOval({

        name: name(`${canvasName}-oval2`),
        group: c.base.name,
        start: ['center', 'center'],
        handle: ['center', 'center'],
        radiusX: 30,
        radiusY: 30,
        fillStyle: 'green',
        strokeStyle: 'lightgreen',
        lineWidth: 4,
        method: 'fillThenDraw',
    });
};

demoBuilder('nr-canvas-1');
demoBuilder('nr-canvas-2');
demoBuilder('nr-canvas-3');
demoBuilder('nr-canvas-4');
demoBuilder('nr-canvas-5');
demoBuilder('canvas-1');
demoBuilder('canvas-2');


// Build the canvas with the responsive image
const canvas3 = scrawl.findCanvas('canvas-3');

scrawl.makePicture({
    name: name(`${canvas3.name}-image`),
    group: canvas3.base.name,
    asset: "river",
    width: "100%",
    height: "100%",
    copyWidth: "100%",
    copyHeight: "100%"
});


// Display cycle loop
scrawl.makeAnimation({
    name: name('update-all-canvases'),
    fn: () => {
        scrawl.render();
        report();
    },
});


// #### Development and testing
console.log(scrawl.library);
