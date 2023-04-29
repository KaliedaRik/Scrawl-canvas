// # Demo Canvas 025 
// Various responsive and non-responsive canvases; responsive images

// [Run code](../../demo/canvas-025.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// Import image from DOM, and add data to it
scrawl.importDomImage('.myimage');


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');

const oval1 = {
    start: ['center', 'center'],
    handle: ['center', 'center'],
    radiusX: '20%',
    radiusY: '20%',
    fillStyle: 'blue',
    strokeStyle: 'lightblue',
    lineWidth: 10,
    method: 'fillThenDraw',
};

const oval2 = {
    start: ['center', 'center'],
    handle: ['center', 'center'],
    radiusX: 30,
    radiusY: 30,
    fillStyle: 'green',
    strokeStyle: 'lightgreen',
    lineWidth: 4,
    method: 'fillThenDraw',
};

const demoBuilder = (name) => {

    const c = scrawl.library.canvas[name];

    c.set({
        backgroundColor: 'yellow',
    });

    scrawl.makeOval({
        name: `${name}-oval1`,
        group: c.base.name
// @ts-expect-error
    }).set(oval1);

    scrawl.makeOval({
        name: `${name}-oval2`,
        group: c.base.name
// @ts-expect-error
    }).set(oval2);
};

demoBuilder('nr-canvas-1');
demoBuilder('nr-canvas-2');
demoBuilder('nr-canvas-3');
demoBuilder('nr-canvas-4');
demoBuilder('nr-canvas-5');
demoBuilder('canvas-1');
demoBuilder('canvas-2');

const canvas3 = scrawl.library.canvas['canvas-3'];

scrawl.makePicture({
    name: `${canvas3.name}-image`,
    group: canvas3.base.name,
    asset: "river",
    width: "100%",
    height: "100%",
    copyWidth: "100%",
    copyHeight: "100%"
});

scrawl.makeAnimation({
    name: 'update-all-canvases',
    fn: () => {
        scrawl.render();
        report();
    },
});


// #### Development and testing
console.log(scrawl.library);
