// # Demo Particles 011 
// Tracer entity: generation and functionality

// [Run code](../../demo/particles-011.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Define some filters
scrawl.makeFilter({
    name: 'grayscale',
    method: 'grayscale',
}).clone({
    name: 'invert',
    method: 'invert',
});

scrawl.makeFilter({
    name: 'tint',
    method: 'tint',
    redInRed: 0.5,      redInGreen: 1,      redInBlue: 0.9,
    greenInRed: 0,      greenInGreen: 0.3,  greenInBlue: 0.8,
    blueInRed: 0.8,     blueInGreen: 0.8,   blueInBlue: 0.4,
});

scrawl.makeFilter({
    name: 'matrix',
    method: 'matrix',
    weights: [-1, -1, 0, -1, 1, 1, 0, 1, 1],
});


// Create a Shape entity to act as a path for our Tracer entitys
scrawl.makeShape({

    name: 'my-arrow',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    scale: 0.4,
    roll: -70,
    flipUpend: true,

    useAsPath: true,

    strokeStyle: 'gray',
    fillStyle: 'lavender',
    lineWidth: 8,
    method: 'fillThenDraw',

    bringToFrontOnDrag: false,
});


// #### Particle physics animation scene

// Tracer entitys don't have any color control built in; we need to create our own color factory
let colorFactory = scrawl.makeColor({

    name: 'tracer-3-color-factory',

    minimumColor: 'red',
    maximumColor: 'blue',

    colorSpace: 'LAB',
});

// Create a Tracer entity
// + Note that Tracers do not require a World object, cannot process Force objects, and cannot be connected together using Spring objects.
scrawl.makeTracer({

    name: 'trace-1',

    historyLength: 50,

    // We will delta-animate this Tracer alonbg the path of our Shape entity
    path: 'my-arrow',
    pathPosition: 0,
    lockTo: 'path',

    delta: {
        pathPosition: 0.002,
    },

    artefact: scrawl.makeWheel({

        name: 'burn-1',

        radius: 6,

        handle: ['center', 'center'],

        fillStyle: 'red',
        method: 'fill',
        visibility: false,

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    // This Tracer will produce a 'dashed' effect, by displaying discrete ranges of its history
    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            start;

        history.forEach((p, index) => {

            if (index < 10 || (index > 20 && index < 30) || index > 40) {

                [ , , ...start] = p;
                artefact.simpleStamp(host, { start });
            }
        });
    },

// Clone the Tracer entity
}).clone({

    name: 'trace-2',
    pathPosition: 0.33,

    artefact: scrawl.library.artefact['burn-1'].clone({
        name: 'burn-2',
        fillStyle: 'green',
        globalAlpha: 0.2,
    }),

    // Our second Tracer shows a 'tail-fade' effect
    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            len = history.length,
            start;

        history.forEach((p, index) => {

            if (index % 3 === 0) {

                [ , , ...start] = p;
                
                artefact.simpleStamp(host, {
                    start,
                    globalAlpha: (len - index) / len,
                });
            }
        });
    },

// Clone the second Tracer entity
}).clone({

    name: 'trace-3',
    pathPosition: 0.67,

    artefact: scrawl.library.artefact['burn-1'].clone({
        name: 'burn-3',
        fillStyle: 'blue',
    }),

    // This Tracer varies its scale to create a 'teardrop' effect
    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            len = history.length,
            start;

        history.forEach((p, index) => {

            [ , , ...start] = p;

            let magicNumber = (len - index) / len;
            
            artefact.simpleStamp(host, {
                start,
                scale: magicNumber * 3,
                fillStyle: colorFactory.getRangeColor(magicNumber),
            });
        });
    },
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Make the arrow draggable
// + KNOWN BUG - the arrow is not draggable on first user mousedown, but is draggable afterwards
scrawl.makeGroup({

    name: 'my-draggable-group',

}).addArtefacts('my-arrow');

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'my-draggable-group',
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// Action user choice to apply a filter to a Tracer entity
const filterChoice = function (e) {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value,
        entity = scrawl.library.entity['trace-2'];

    entity.clearFilters();
    if (val) entity.addFilters(val);
};
scrawl.addNativeListener(['input', 'change'], filterChoice, '#filter');

// @ts-expect-error
document.querySelector('#filter').value = '';


// #### Development and testing
console.log(scrawl.library);
