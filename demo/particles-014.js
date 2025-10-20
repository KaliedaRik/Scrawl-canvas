// # Demo Particles 014
// Emitter functionality: generate from existing particles

// [Run code](../../demo/particles-014.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


canvas.buildCell({

    name: name('trace-chamber'),
    dimensions: ['100%', '100%'],
    clearAlpha: 0.998,
});

const lowAdjuster = scrawl.makeColor({

    name: name('low-adjuster'),
    minimumColor: 'black',
    maximumColor: 'blue',
});

const highAdjuster = scrawl.makeColor({

    name: name('high-adjuster'),
    minimumColor: 'red',
    maximumColor: 'lightblue',
});

const myWorld = scrawl.makeWorld({

    name: name('my-world'),
    tickMultiplier: 2,
});

const emitter = scrawl.makeEmitter({

    name: name('emitter-1'),
    group: name('trace-chamber'),

    start: ['center', 'center'],

    world: myWorld,

    generationRate: 50,
    killAfterTime: 1.5,
    killBeyondCanvas: true,

    generateFromExistingParticles: true,

    fillMinimumColor: 'black',
    fillMaximumColor: 'red',

    rangeX: 40,
    rangeFromX: -20,
    minimumVelocityX: 10,
    limitDirectionToAngleMultiples: 45,

    artefact: scrawl.makeWheel({
        name: name('trace'),
        radius: 2,
    }),

    stampAction: function (artefact, particle, host) {

        const history = particle.history;

        let start;

        if (history.length) {

            [ , , ...start] = history[0];

            artefact.simpleStamp(host, {
                start,
                fillStyle: particle.fill,
            });
        }
    },
});

// Add the world attribute after the world and emitter objects have been created
// + Have to do it this way as the attribute lives in one and references the other.
myWorld.addAttribute({
    key: 'rangeColorValue',
    defaultValue: 0,
    setter: function (item) {

/** @ts-expect-error */
        this.rangeColorValue = item;

        emitter.set({
            fillMinimumColor: lowAdjuster.getRangeColor(item),
            fillMaximumColor: highAdjuster.getRangeColor(item),
        });
    },
});

scrawl.makeTween({

    name: name('color-adjuster'),
    duration: '100s',
    cycles: 0,
    reverseOnCycleEnd: true,

    targets: myWorld,

    definitions: [
        {
            attribute: 'rangeColorValue',
            start: 0,
            end: 1,
        },
    ],
}).run();

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
