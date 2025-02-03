// # Demo Particles 017
// Dynamic update of particle colors

// [Run code](../../demo/particles-017.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('my-canvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Helper variables and functions
const rnd = (min, max) => min + Math.floor(Math.random() * max);

const [width, height] = canvas.get('dimensions');

const colors = [
    'rgb(255 0 0)',
    'rgb(0 255 0)',
    'rgb(0 0 255)',
    'rgb(255 127 0)',
    'rgb(0 255 127)',
    'rgb(127 0 255)',
    'rgb(200 100 100)',
    'rgb(100 200 100)',
    'rgb(100 100 200)',
    'rgb(0 100 100)',
    'rgb(100 0 100)',
];


// All drawing will take place on a dedicated Cell
const paper = canvas.buildCell({
    name: name('paper'),
    dimensions: ['100%', '100%'],
});

paper.set({
    clearAlpha: 0.98,
});

const paperGroup = paper.get('group');


// Build out the scene
const setup = () => {

    // Clean up previous run's detritus
    paperGroup.killArtefacts();
    scrawl.purge(name('parts'));
    paper.clear();


    // Origin line
    scrawl.makeLine({

        name: name('origin'),
        group: paperGroup,
        endX: '100%',
        lineWidth: 4,
        method: 'draw',
        useAsPath: true,
    });


    // Add the repulsive buffers (on the base Cell)
    const forces = [];

    for (let i = 0; i <= 10; i++) {

        const x = rnd(50, width - 100),
            y = rnd(100, height - 100),
            radius = rnd(15, 15);

        const buffer = scrawl.makeWheel({

            name: name(`parts-buffer-${i}`),
            start: [x, y],
            handle: ['center', 'center'],
            radius,
            strokeStyle: colors[i],
            lineWidth: 3,
            lineDash: [3, 2],
            method: 'draw',
        });


        // Each buffer has it's own repulsive force
        scrawl.makeForce({

            name: name(`parts-force-${i}`),
            action: (particle) => {

                const [bx, by] = buffer.get('position');

                const { load, position } = particle,
                    v = scrawl.requestVector({ x: bx, y: by }).vectorSubtract(position),
                    mag = v.getMagnitude();

                if (mag && mag < radius) {
                    particle.fill = colors[i];
                    v.scalarMultiply(1 / (mag / 200));
                    load.vectorSubtract(v);
                }
                scrawl.releaseVector(v);
            }
        });
        forces.push(name(`parts-force-${i}`));
    }


    // Create the particle emitter
    scrawl.makeEmitter({

        name: name('emitter'),
        group: paperGroup,

        world: scrawl.makeWorld({

            name: name('parts-world'),
            tickMultiplier: 1,
        }),

        generationRate: 200,
        generateAlongPath: name('origin'),
        killBeyondCanvas: true,

        forces: ['gravity', ...forces],

        fillMinimumColor: 'gray',
        fillMaximumColor: 'gray',

        artefact: scrawl.makeWheel({

            name: name('parts-template'),
            handle: ['center', 'center'],
            radius: 1,
            visibility: false,
            noUserInteraction: true,
            noPositionDependencies: true,
            noFilters: true,
            noDeltaUpdates: true,
        }),

        stampAction: function (artefact, particle, host) {

            const history = particle.history;
            let start;

            if (history.length) {

                [, , ...start] = history[0];

                artefact.simpleStamp(host, {

                    start,
                    fillStyle: particle.fill
                });
            }
        }
    });
};


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// Create the initial scene
setup();


// #### User interaction
scrawl.addNativeListener("dblclick", setup, canvas.domElement);

scrawl.makeDragZone({
    zone: canvas,
    endOn: ['leave', 'up'],
});


// #### Development and testing
console.log(scrawl.library);
