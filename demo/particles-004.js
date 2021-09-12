// # Demo Particles 004 
// Emit particles along the length of a path

// [Run code](../../demo/particles-004.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});


// #### Particle physics animation scene

// Create a World object which we can then assign to the particle emitter
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,
});


// #### User-controlled bezier curve with star emitter along its length

// Pins to control the shape of the bezier 
scrawl.makeWheel({

    name: 'pin-1',
    order: 2,

    startX: 75,
    startY: 200,

    handleX: 'center',
    handleY: 'center',

    radius: 10,
    fillStyle: 'blue',
    strokeStyle: 'darkgray',
    lineWidth: 2,
    method: 'fillAndDraw',

}).clone({
    name: 'pin-2',
    startX: 225,

}).clone({
    name: 'pin-3',
    startX: 375,

}).clone({
    name: 'pin-4',
    startX: 525,
});

// A group to help manage pin drag-and-drop functionality
let pins = scrawl.makeGroup({

    name: 'my-pins',

}).addArtefacts('pin-1', 'pin-2', 'pin-3', 'pin-4');

// Bezier curve using pins as its control points
const userControlledBezier = scrawl.makeBezier({

    name: 'my-bezier',

    pivot: 'pin-1',
    lockTo: 'pivot',
    // start: [75, 200],
    useStartAsControlPoint: true,

    startControlPivot: 'pin-2',
    startControlLockTo: 'pivot',

    endControlPivot: 'pin-3',
    endControlLockTo: 'pivot',

    endPivot: 'pin-4',
    endLockTo: 'pivot',

    method: 'draw',

    useAsPath: true,
});

// Star entity template
const stars = scrawl.makeStar({

    name: 'particle-star-template',

    radius1: 6,
    radius2: 4,

    points: 5,

    handle: ['center', 'center'],

    fillStyle: 'gold',
    method: 'fillThenDraw',
    visibility: false, 

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

// Particle Emitter entity using the bezier curve as its emission line
let emitter = scrawl.makeEmitter({

    name: 'emitter-1',
    world: myWorld,

    generationRate: 20,
    killAfterTime: 5,

    // We tell the Emitter to generate its particles along our curve by setting its `generateAlongPath` attribute to the Bezier entity's String name, or the entity object itself.
    generateAlongPath: 'my-bezier',

    artefact: stars.clone({ name: 'stars-1' }),

    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            remaining, start, z;

        if (history.length) {

            [remaining, z, ...start] = history[0];

            artefact.simpleStamp(host, {

                start, 
                globalAlpha: remaining / 5,
            });
        }
    },
});


// #### Other examples of emission along a path

// Static line
scrawl.makeLine({

    name: 'line-1',
    start: [50, 50],
    end: [550, 50],
    strokeStyle: 'green',
    method: 'draw',
    roll: 10,
    useAsPath: true,
});

emitter.clone({

    name: 'emitter-2',
    artefact: stars.clone({ 
        name: 'stars-2',
        fillStyle: 'red',
    }),
    generateAlongPath: 'line-1',
});


// Static oval
scrawl.makeOval({

    name: 'oval-1',
    start: ['center', 320],
    handle: ['center', 'center'],
    radiusX: 90,
    radiusY: 50,
    strokeStyle: 'green',
    method: 'draw',
    useAsPath: true,
});

emitter.clone({

    name: 'emitter-3',
    artefact: stars.clone({ 
        name: 'stars-3',
        fillStyle: 'blue',
    }),
    generateAlongPath: 'oval-1',
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const particlenames = scrawl.library.particlenames,
    particle = scrawl.library.particle;

const report = reportSpeed('#reportmessage', function () {

    // ParticleHistory arrays are not saved in the Scrawl-canvas library; instead we need to count them in each particle
    let historyCount = 0;
    particlenames.forEach(n => {

        let p = particle[n];
        if (p) historyCount += p.history.length;
    });

    return `    Particles: ${particlenames.length}
    Stamps per display: ${historyCount}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: pins,
    endOn: ['up', 'leave'],
});


// #### Development and testing
console.log(scrawl.library);
