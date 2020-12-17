// # Demo Particles 014
// Hearts and stars

// [Run code](../../demo/particles-014.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


canvas.setBase({
    backgroundColor: 'honeydew',
});


const myHeart = scrawl.makeShape({
  
    name: 'myheart',

    pathDefinition: 'M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2 c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z',

    start: ['center', '55%'],
    handle: ['center', 'center'],
    fillStyle: 'red',
    strokeStyle: 'darkred',
    lineWidth: 3,
    method: 'fillThenDraw',
    scaleOutline: false,

    useAsPath: true,
    precision: 2,
});

for (let i = 0; i < 1; i += 0.1) {
  
    myHeart.clone({

        name: `pathHeart-${i}`,
        fillStyle: 'pink',
        strokeStyle: 'indianred',
        lineWidth: 2,
        useAsPath: false,
        roll: 180,
        handleY: '30%',

        path: myHeart,
        pathPosition: i + 0.05,
        constantPathSpeed: true,
        addPathRotation: true,
        lockTo: 'path',
    });
}

scrawl.makeEmitter({
  
    name: 'star-particles',

    world: scrawl.makeWorld({
        name: 'demo-world',
        tickMultiplier: 2,
    }),

    artefact: scrawl.makeStar({
        name: 'particle-star-entity',
        radius1: 18,
        radius2: 8,
        points: 5,
        handle: ['center', 'center'],
        method: 'fillThenDraw',
        visibility: false, 
    }),

    rangeX: 80,
    rangeFromX: -40,
    rangeY: -40,
    rangeFromY: -30,
    rangeZ: -1,
    rangeFromZ: -0.2,

    generateInArea: myHeart,
    generationRate: 100,
    killAfterTime: 5,
    killBeyondCanvas: true,

    fillMinimumColor: 'yellow',
    fillMaximumColor: 'gold',

    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            remaining, globalAlpha, scale, start, z, roll;

        if (history[0]) {

            [remaining, z, ...start] = history[0];
            globalAlpha = remaining / 5;
            scale = 1 + (z / 3);

            if (globalAlpha > 0 && scale > 0) {

                roll = globalAlpha * 720;

                artefact.simpleStamp(host, {
                    start, 
                    scale, 
                    globalAlpha, 
                    roll,
                    fillStyle: particle.fill,
                });
            }
        }
    },
});

scrawl.makeTween({
  
    name: 'heartbeat',

    duration: 1600,
    reverseOnCycleEnd: true,
    cycles: 0,
    targets: myHeart,

    definitions: [
        {
            attribute: 'scale',
            start: 8,
            end: 12,
            engine: 'easeIn',
        }
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
