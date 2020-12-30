// # Demo Particles 014
// Hearts and stars

// [Run code](../../demo/particles-014.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.setBase({
    backgroundColor: 'azure',
});

canvas.buildCell({

    name: 'trace-chamber',
    dimensions: ['100%', '100%'],
    cleared: false,
});

let lowAdjuster = scrawl.makeColor({
    name: 'low-adjuster',
    minimumColor: 'black',
    maximumColor: 'blue',
});

let highAdjuster = scrawl.makeColor({
    name: 'high-adjuster',
    minimumColor: 'red',
    maximumColor: 'lightblue',
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

    world: myWorld,

    generationRate: 50,
    killAfterTime: 1.5,
    killBeyondCanvas: true,

    // ...
    generateFromExistingParticles: true,

    fillMinimumColor: 'black',
    fillMaximumColor: 'red',

    rangeX: 40,
    rangeFromX: -20,
    limitDirectionToAngleMultiples: 45,
    // rangeY: 40,
    // rangeFromY: -20,
    // rangeZ: -1,
    // rangeFromZ: -0.2,

    artefact: scrawl.makeWheel({
        name: 'trace',
        radius: 2,
    }),

    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            remaining, start, z;

        if (history.length) {

            [remaining, z, ...start] = history[0];

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
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();

// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
