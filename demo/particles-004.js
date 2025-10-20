// # Demo Particles 004
// Emit particles along the length of a path

// [Run code](../../demo/particles-004.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// #### Particle physics animation scene
// Create a World object which we can then assign to the particle emitter
const myWorld = scrawl.makeWorld({

    name: name('my-world'),
    tickMultiplier: 2,
});


// #### User-controlled bezier curve with star emitter along its length
// Pins to control the shape of the bezier
scrawl.makeWheel({

    name: name('pin-1'),
    order: 2,
    start: [75, 200],
    handle: ['center', 'center'],
    radius: 10,
    fillStyle: 'green',
    strokeStyle: 'darkgray',
    lineWidth: 2,
    method: 'fillAndDraw',

}).clone({

    name: name('pin-2'),
    startX: 225,

}).clone({

    name: name('pin-3'),
    startX: 375,

}).clone({

    name: name('pin-4'),
    startX: 525,
});

// A group to help manage pin drag-and-drop functionality
const pins = scrawl.makeGroup({

    name: name('my-pins'),

}).addArtefacts(name('pin-1'), name('pin-2'), name('pin-3'), name('pin-4'));

// Bezier curve using pins as its control points
scrawl.makeBezier({

    name: name('my-bezier'),

    pivot: name('pin-1'),
    lockTo: 'pivot',
    useStartAsControlPoint: true,

    startControlPivot: name('pin-2'),
    startControlLockTo: 'pivot',

    endControlPivot: name('pin-3'),
    endControlLockTo: 'pivot',

    endPivot: name('pin-4'),
    endLockTo: 'pivot',

    method: 'draw',
    useAsPath: true,
});

// Star entity template
const stars = scrawl.makeStar({

    name: name('star'),
    radius1: 3,
    radius2: 7,
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
const emitter = scrawl.makeEmitter({

    name: name('emitter-1'),
    world: myWorld,

    generationRate: 20,
    killAfterTime: 5,

    // We tell the Emitter to generate its particles along our curve by setting its `generateAlongPath` attribute to the Bezier entity's String name, or the entity object itself.
    generateAlongPath: name('my-bezier'),

    artefact: stars.clone({

        name: name('stars-1'),
    }),

    stampAction: function (artefact, particle, host) {

        const history = particle.history;

        let remaining, start;

        if (history.length) {

            [remaining, , ...start] = history[0];

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

    name: name('my-line'),
    start: [50, 50],
    end: [550, 50],
    strokeStyle: 'green',
    method: 'draw',
    roll: 10,
    useAsPath: true,
});

emitter.clone({

    name: name('emitter-2'),
    artefact: stars.clone({

        name: 'stars-2',
        fillStyle: 'red',
    }),
    generateAlongPath: name('my-line'),
});


// Static oval
scrawl.makeOval({

    name: name('my-oval'),
    start: ['center', 320],
    handle: ['center', 'center'],
    radiusX: 90,
    radiusY: 50,
    strokeStyle: 'green',
    method: 'draw',
    useAsPath: true,
});

emitter.clone({

    name: name('emitter-3'),
    artefact: stars.clone({

        name: name('stars-3'),
        fillStyle: 'blue',
    }),
    generateAlongPath: name('my-oval'),
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const { particlenames, particle } = scrawl.library;

const report = reportSpeed('#reportmessage', function () {

    let historyCount = 0;
    particlenames.forEach(n => {

        const p = particle[n];
        if (p) historyCount += p.history.length;
    });

    return `
    Particles: ${particlenames.length}
    Stamps per display: ${historyCount}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: pins,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Development and testing
console.log(scrawl.library);
