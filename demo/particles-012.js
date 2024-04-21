// # Demo Particles 012
// Use Net entity particles as reference coordinates for other artefacts

// [Run code](../../demo/particles-012.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;

// Import assets
scrawl.importDomImage('#bunny');


// #### Particle physics animation scene
// Create a World object; add some user-defined attributes to it
const myWorld = scrawl.makeWorld({

    name: name('my-world'),
    tickMultiplier: 2,

});

// Create the Net entity and pin the top row of Particles
scrawl.makeNet({

    name: name('test-net'),
    world: myWorld,

    start: [50, 20],

    generate: 'weak-net',

    postGenerate: function () {

        const regex = RegExp('-0-[0-9]+$');

/** @ts-expect-error */
        this.particleStore.forEach(p => {

            if (regex.test(p.name)) {

                p.set({ forces: [] });

/** @ts-expect-error */
                this.springs.forEach(s => {

                    if (s && s.particleFrom && s.particleFrom.name === p.name) {

                        s.particleFromIsStatic = true;
                    }
                    if (s && s.particleTo && s.particleTo.name === p.name) {

                        s.particleToIsStatic = true;
                    }
                })
            }
        });
    },

    rows: 15,
    columns: 17,
    rowDistance: 25,
    columnDistance: 30,

    forces: ['gravity'],

    mass: 3,
    springConstant: 200,

    engine: 'runge-kutta',

    showSpringsColor: 'lightGray',
    showSprings: true,

    particlesAreDraggable: true,

    artefact: scrawl.makeBlock({

        name: name('unseen-net-block'),
        visibility: false,
    }),
});


// Create a range of entitys which use Net Particles as their reference coordinate.
scrawl.makeBlock({

    name: name('block1'),

    width: 80,
    height: 40,

    particle: name('test-net-3-3'),
    lockTo: 'particle',

    strokeStyle: 'red',
    lineWidth: 5,

    method: 'draw',

}).clone({

    name: name('block2'),
    particle: name('test-net-1-3'),
});

scrawl.makeWheel({

    name: name('wheel1'),

    radius: 50,
    handle: ['center', 'center'],

    particle: name('test-net-3-12'),
    lockTo: 'particle',

    strokeStyle: 'blue',
    lineWidth: 5,

    method: 'draw',

}).clone({

    name: name('wheel2'),
    particle: name('test-net-5-12'),
});

scrawl.makePicture({

    name: name('bunny1'),
    asset: 'bunny',

    width: 26,
    height: 37,

    handle: ['center', 'center'],

    copyWidth: '100%',
    copyHeight: '100%',

    particle: name('test-net-11-5'),
    lockTo: 'particle',

    method: 'fill',

}).clone({

    name: name('bunny2'),
    particle: name('test-net-11-6'),

}).clone({

    name: name('bunny3'),
    particle: name('test-net-11-7'),

}).clone({

    name: name('bunny4'),
    particle: name('test-net-11-8'),

}).clone({

    name: name('bunny5'),
    particle: name('test-net-11-9'),
});

scrawl.makeLabel({

    name: name('label1'),

    text: 'HELLO',
    fontString: '30px sans-serif',

    particle: name('test-net-7-1'),
    lockTo: 'particle',

}).clone({

    name: name('label2'),
    particle: name('test-net-9-15'),
    handleX: 'right',
    handleY: 'bottom',
});

scrawl.makeStar({

    name: name('star1'),

    radius1: 12,
    radius2: 8,

    points: 5,

    handle: ['center', 'center'],

    fillStyle: 'gold',
    method: 'fillThenDraw',

    particle: name('test-net-11-4'),
    lockTo: 'particle',

}).clone({

    name: name('star2'),
    particle: name('test-net-11-10'),
});


scrawl.makeLine({

    name: name('line1'),

    particle: name('test-net-1-1'),
    lockTo: 'particle',

    endParticle: name('test-net-5-2'),
    endLockTo: 'particle',

    lineWidth: 8,
    strokeStyle: 'coral',
    lineCap: 'round',

    method: 'draw',

}).clone({

    name: name('line2'),
    particle: name('test-net-5-2'),
    endParticle: name('test-net-5-6'),
});

scrawl.makeQuadratic({

    name: name('quad1'),

    particle: name('test-net-1-7'),
    lockTo: 'particle',

    controlParticle: name('test-net-3-12'),
    controlLockTo: 'particle',

    endParticle: name('test-net-6-7'),
    endLockTo: 'particle',

    lineWidth: 8,
    strokeStyle: 'olivedrab',
    lineCap: 'round',

    method: 'draw',

}).clone({

    name: name('quad2'),
    particle: name('test-net-1-7'),
    controlParticle: name('test-net-2-9'),
    endParticle: name('test-net-3-7'),
});

scrawl.makeBezier({

    name: name('bezier1'),

    particle: name('test-net-8-5'),
    lockTo: 'particle',

    startControlParticle: name('test-net-4-7'),
    startControlLockTo: 'particle',

    endControlParticle: name('test-net-12-9'),
    endControlLockTo: 'particle',

    endParticle: name('test-net-8-11'),
    endLockTo: 'particle',

    lineWidth: 8,
    strokeStyle: 'purple',
    lineCap: 'round',

    method: 'draw',

}).clone({

    name: name('bezier2'),
    particle: name('test-net-9-5'),
    startControlParticle: name('test-net-5-7'),
    endControlParticle: name('test-net-13-9'),
    endParticle: name('test-net-9-11'),
});

scrawl.makePolyline({

    name: name('polyline-1'),

    pins: [[0,0], [0,10], [120,10], [120,0]],
    tension: 0.3,

    particle: name('test-net-12-5'),
    lockTo: 'particle',

    strokeStyle: 'cornflowerblue',
    lineWidth: 6,
    lineCap: 'round',
    lineJoin: 'round',
    method: 'draw',

}).clone({

    name: name('polyline-2'),
    lockTo: 'start',

    tension: 0.4,
    closed: true,
    useParticlesAsPins: true,

    mapToPins: true,
    pins: [
        name('test-net-0-1'), name('test-net-0-2'), name('test-net-0-3'),
        name('test-net-0-4'), name('test-net-0-5'), name('test-net-0-6'),
        name('test-net-0-7'), name('test-net-0-8'), name('test-net-0-9'),
        name('test-net-0-10'), name('test-net-0-11'), name('test-net-0-12'),
        name('test-net-0-13'), name('test-net-0-14'), name('test-net-0-15'),
        name('test-net-1-16'), name('test-net-2-16'), name('test-net-3-16'),
        name('test-net-4-16'), name('test-net-5-16'), name('test-net-6-16'),
        name('test-net-7-16'), name('test-net-8-16'), name('test-net-9-16'),
        name('test-net-10-16'), name('test-net-11-16'), name('test-net-12-16'),
        name('test-net-13-16'), name('test-net-14-15'), name('test-net-14-14'),
        name('test-net-14-13'), name('test-net-14-12'), name('test-net-14-11'),
        name('test-net-14-10'), name('test-net-14-9'), name('test-net-14-8'),
        name('test-net-14-7'), name('test-net-14-6'), name('test-net-14-5'),
        name('test-net-14-4'), name('test-net-14-3'), name('test-net-14-2'),
        name('test-net-14-1'), name('test-net-13-0'), name('test-net-12-0'),
        name('test-net-11-0'), name('test-net-10-0'), name('test-net-9-0'),
        name('test-net-8-0'), name('test-net-7-0'), name('test-net-6-0'),
        name('test-net-5-0'), name('test-net-4-0'), name('test-net-3-0'),
        name('test-net-2-0'), name('test-net-1-0')
    ],

    strokeStyle: 'rosybrown',

    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowBlur: 2,
    shadowColor: 'black',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Make the Net Particles draggable
scrawl.makeGroup({

    name: name('my-draggable-group'),

}).addArtefacts(name('test-net'));

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: name('my-draggable-group'),
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Development and testing
console.log(scrawl.library);
