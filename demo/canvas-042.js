// # Demo Canvas 042
// Canvas entity clip regions

// [Run code](../../demo/canvas-042.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas,
    entity = scrawl.library.entity;


// Import image from DOM, and create Picture entity using it
scrawl.importDomImage('.canal');

// The image to be clipped
scrawl.makePicture({

    name: 'background',
    asset: 'factory',

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    order: 1,
});

const generics = {
    start: ['center', 'center'],
    handle: ['center', 'center'],
    method: 'clip',
    visibility: false,
    delta: {
        roll: 0.5,
    }
};

// The entitys to be used as clip regions
let clipzone = scrawl.makeBlock({
    name: 'block-clipper',
    dimensions: [200, 200],
// @ts-expect-error
}).set(generics).set({ visibility: true });

scrawl.makeWheel({
    name: 'wheel-clipper',
    radius: 150,
    startAngle: 30,
    endAngle: -30,
    includeCenter: true,
// @ts-expect-error
}).set(generics);

scrawl.makePhrase({
    name: 'phrase-clipper',
    text: 'HELLO!',
    fontString: '50px arial, sans-serif',
// @ts-expect-error
}).set(generics);

scrawl.makeCog({
    name: 'cog-clipper',
    outerRadius: 140,
    innerRadius: 120,
    outerControlsDistance: 20,
    innerControlsDistance: 16,
    points: 24,
// @ts-expect-error
}).set(generics);

scrawl.makeOval({
    name: 'oval-clipper',
    radiusX: 120,
    radiusY: 150,
    intersectY: 0.55,
// @ts-expect-error
}).set(generics);

scrawl.makePolygon({
    name: 'polygon-clipper',
    sideLength: 150,
    sides: 6,
// @ts-expect-error
}).set(generics);

scrawl.makeRectangle({
    name: 'rectangle-clipper',
    rectangleWidth: 240,
    rectangleHeight: 180,
    radius: 30,
// @ts-expect-error
}).set(generics);

scrawl.makeShape({
    name: 'shape-clipper',
    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',
    scale: 0.4,
// @ts-expect-error
}).set(generics);

scrawl.makeSpiral({
    name: 'spiral-clipper',
    loops: 2,
    loopIncrement: 80,
    drawFromLoop: 1,
// @ts-expect-error
}).set(generics);

scrawl.makeStar({
    name: 'star-clipper',
    radius1: 80,
    radius2: 140,
    points: 6,
// @ts-expect-error
}).set(generics);

scrawl.makeTetragon({
    name: 'tetragon-clipper',
    radiusX: 120,
    radiusY: 150,
    intersectY: 1.2,
// @ts-expect-error
}).set(generics);

scrawl.makePolyline({
    name: 'polyline-clipper',
    pins: [[100, 200], [200, 400], [300, 300], [400, 400], [500, 200], [240, 100]],
    tension: 0.5,
    closed: true,
// @ts-expect-error
}).set(generics);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `Current clip entity: ${clipzone.name}`;
});


const checkForActivity = function () {

    clipzone.set({
        lockTo: (canvas.here.active) ? 'mouse' : 'start',
    });
};


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: checkForActivity,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = e.target.value,
        selected = entity[val];

    if (selected) {

        clipzone.set({
            visibility: false,
        });

        clipzone = selected;

        clipzone.set({
            visibility: true,
        });
    }

}, '#clip-entity')

// Setup form
// @ts-expect-error
document.querySelector('#clip-entity').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
