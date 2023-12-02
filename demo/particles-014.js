// # Demo Particles 014
// Emitter functionality: generate from existing particles

// [Run code](../../demo/particles-014.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


canvas.buildCell({

    name: 'trace-chamber',
    dimensions: ['100%', '100%'],
    clearAlpha: 0.998,
});

const lowAdjuster = scrawl.makeColor({
    name: 'low-adjuster',
    minimumColor: 'black',
    maximumColor: 'blue',
});

const highAdjuster = scrawl.makeColor({
    name: 'high-adjuster',
    minimumColor: 'red',
    maximumColor: 'lightblue',
});

const myWorld = scrawl.makeWorld({
    name: 'demo-world',
    tickMultiplier: 2,
    userAttributes: [
        {
            key: 'rangeColorValue',
            defaultValue: 0,
            setter: function (item) {

// @ts-expect-error
                this.rangeColorValue = item;

                emitter.set({
                    fillMinimumColor: lowAdjuster.getRangeColor(item),
                    fillMaximumColor: highAdjuster.getRangeColor(item),
                });
            },
        },
    ],
});


const emitter = scrawl.makeEmitter({

    name: 'emitter-1',
    group: 'trace-chamber',

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
    limitDirectionToAngleMultiples: 45,

    artefact: scrawl.makeWheel({
        name: 'trace',
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

scrawl.makeTween({

    name: 'color-adjuster',
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

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
