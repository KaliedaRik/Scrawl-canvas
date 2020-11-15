// # Demo Particles 005 
// Emit particles from inside an artefact's area

// [Run code](../../demo/particles-005.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

scrawl.library.group[canvas.base.name].set({

    order: 1,
})

let dragItems = scrawl.makeGroup({

    name: 'my-drag-items',
    host: canvas.base.name,
    order: 0,
});


scrawl.makePhrase({

    name: 'hello',
    group: 'my-drag-items',

    text: 'HELLO!',

    font: 'bold 100px sans-serif',
    lineHeight: 0.8,

    startX: 70,
    startY: 200,

    handleX: 20,
    handleY: 20,

    roll: -30,
    scale: 1.1,

    fillStyle: 'aliceblue',
    method: 'fill',

});

scrawl.makeShape({

    name: 'myshape',
    group: 'my-drag-items',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    start: [400, 300],
    handle: ['center', 'center'],

    scale: 0.2,
    roll: -90,
    flipUpend: true,
    scaleOutline: false,

    fillStyle: 'white',
    method: 'fill',
});


// Create a World object; add some user-defined attributes to it
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,
});

let emitter1 = scrawl.makeEmitter({

    name: 'emitter-one',
    world: myWorld,

    generationRate: 60,
    killAfterTime: 5,

    rangeZ: 0.3,
    rangeFromZ: 0.1,

    generateInArea: 'hello',

    artefact: scrawl.makeWheel({

        name: 'particle-wheel-entity',

        radius: 12,

        handle: ['center', 'center'],

        globalCompositeOperation: 'source-atop',

        fillStyle: 'blue',
        strokeStyle: 'white',
        method: 'fillThenDraw',
        visibility: false, 

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
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

                // Do not stamp the artefact if we cannot see it
                if (alpha && scale) {

                    artefact.simpleStamp(host, {
                        start: position,
                        scale: scale,
                        globalAlpha: alpha,
                        roll: roll,
                    });
                }
                else p.isRunning = false;
            });
        }
    },
});

let emitter2 = emitter1.clone({

    name: 'emitter-two',
    generateInArea: 'myshape',

    artefact: scrawl.makeBlock({

        name: 'particle-block-entity',

        width: 20,
        height: 20,

        handle: ['center', 'center'],

        fillStyle: 'red',
        method: 'fillThenDraw',
        visibility: false, 

        globalCompositeOperation: 'source-atop',

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),
});

emitter1.run();
emitter2.run();


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    let particlenames = scrawl.library.particlenames,
        particle = scrawl.library.particle,
        historyCount;

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        historyCount = 0;
        particlenames.forEach(n => {

            let p = particle[n];
            if (p) historyCount += p.history.length;
        });

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Particles: ${particlenames.length}
    Drawn entitys: ${historyCount}`;
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
