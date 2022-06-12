// # Demo Particles 015
// Emitter functionality: generate from existing particle histories

// [Run code](../../demo/particles-015.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


canvas.buildCell({

    name: 'trace-chamber',
    dimensions: ['100%', '100%'],
    clearAlpha: 0.995,
});

let lowAdjuster = scrawl.makeColor({
    name: 'low-adjuster',
    minimumColor: 'black',
    maximumColor: 'green',
});

let highAdjuster = scrawl.makeColor({
    name: 'high-adjuster',
    minimumColor: 'red',
    maximumColor: 'lightgreen',
});

let myWorld = scrawl.makeWorld({
    name: 'demo-world',
    tickMultiplier: 2,
    userAttributes: [
        {
            key: 'rangeColorValue', 
            defaultValue: 0,
            setter: function (item) { 

                this.rangeColorValue = item;

                emitter.set({
                    fillMinimumColor: lowAdjuster.getRangeColor(item),
                    fillMaximumColor: highAdjuster.getRangeColor(item),
                });
            },
        },
    ],
});


let emitter = scrawl.makeEmitter({

    name: 'emitter-1',
    group: 'trace-chamber',

    start: ['center', 'center'],
    roll: 10,

    world: myWorld,

    generationRate: 100,
    killAfterTime: 5,
    historyLength: 40,
    killBeyondCanvas: true,
    particleCount: 40,

    // ...
    generateFromExistingParticleHistories: true,

    fillMinimumColor: 'black',
    fillMaximumColor: 'red',

    rangeX: 40,
    rangeFromX: -20,
    limitDirectionToAngleMultiples: 60,

    artefact: scrawl.makeWheel({
        name: 'trace',
        radius: 2,
        handle: ['center', 'center'],
    }),

    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            len = history.length,
            remaining, start, z;

        history.forEach((p, index) => {

            [remaining, z, ...start] = p;

            artefact.simpleStamp(host, { 
                start,
                fillStyle: particle.fill,
                radius: (index / len) * 4,
            });
        });
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
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
