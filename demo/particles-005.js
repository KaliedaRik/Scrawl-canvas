// # Demo Particles 005 
// Emit particles from inside an artefact's area

// [Run code](../../demo/particles-005.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});


scrawl.makeBlock({

    name: 'myblock',

    startX: 170,
    startY: 170,

    handleX: 20,
    handleY: 20,

    width: 100,
    height: 100,

    roll: 30,
    scale: 1.5,

    flipReverse: true,
    flipUpend: true,

    strokeStyle: 'blue',
    lineWidth: 2,
    method: 'draw',
});

scrawl.makeShape({

    name: 'myshape',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    start: [400, 300],
    handle: ['center', 'center'],

    scale: 0.2,
    roll: -90,
    flipUpend: true,
    scaleOutline: false,

    strokeStyle: 'green',
    lineWidth: 2,
    method: 'draw',
});

let dragItems = scrawl.makeGroup({

    name: 'my-drag-items',
    host: canvas.base.name,

}).addArtefacts('myblock', 'myshape');

// Create a World object; add some user-defined attributes to it
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,
});

scrawl.makeEmitter({

    name: 'line-emitter',
    world: myWorld,

    generationRate: 100,
    killAfterTime: 5,

    rangeZ: -1,
    rangeFromZ: -0.2,

    generateInArea: 'myblock',

    artefact: scrawl.makeWheel({

        name: 'particle-wheel-entity',

        radius: 9,

        handle: ['center', 'center'],

        fillStyle: 'gold',
        method: 'fillThenDraw',
        visibility: false, 
    }),

    stampAction: function (artefact, particle, host) {

        if (particle && particle.history) {

            let history = particle.history,
                fill = particle.fill,
                remaining, alpha, scale, position, z, roll;

            history.forEach((p, index) => {

                [remaining, z, ...position] = p;
                
                alpha = remaining / 6;
                if (alpha < 0) alpha = 0;

                roll = alpha * 720;

                scale = 1 + (z / 3);
                if (scale < 0.001) scale = 0; 

                if (alpha && scale) {

                    artefact.simpleStamp(host, {
                        start: position,
                        scale: scale,
                        globalAlpha: alpha,
                        roll: roll,
                    });
                }
            });
        }
    },

}).run();

// This needs to be cloned!!!
scrawl.makeEmitter({

    name: 'line-emitter',
    world: myWorld,

    generationRate: 60,
    killAfterTime: 5,

    rangeZ: -1,
    rangeFromZ: -0.2,

    generateInArea: 'myshape',

    artefact: scrawl.makeBlock({

        name: 'particle-block-entity',

        width: 20,
        height: 20,

        handle: ['center', 'center'],

        fillStyle: 'red',
        method: 'fillThenDraw',
        visibility: false, 
    }),

    stampAction: function (artefact, particle, host) {

        if (particle && particle.history) {

            let history = particle.history,
                fill = particle.fill,
                remaining, alpha, scale, position, z, roll;

            history.forEach((p, index) => {

                [remaining, z, ...position] = p;
                
                alpha = remaining / 6;
                if (alpha < 0) alpha = 0;

                roll = alpha * 720;

                scale = 1 + (z / 3);
                if (scale < 0.001) scale = 0; 

                if (alpha && scale) {

                    artefact.simpleStamp(host, {
                        start: position,
                        scale: scale,
                        globalAlpha: alpha,
                        roll: roll,
                    });
                }
            });
        }
    },

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
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: dragItems,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
});


// #### Development and testing
console.log(scrawl.library);
