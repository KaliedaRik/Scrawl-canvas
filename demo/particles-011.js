// # Demo Particles 011 
// Tracer entity: generation and functionality

// [Run code](../../demo/particles-011.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});


scrawl.makeShape({

    name: 'my-arrow',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    scale: 0.4,
    roll: -70,
    flipUpend: true,

    useAsPath: true,

    strokeStyle: 'gray',
    fillStyle: 'lavender',
    lineWidth: 8,
    method: 'fillThenDraw',
});

scrawl.makeTracer({

    name: 'trace-1',

    historyLength: 50,

    path: 'my-arrow',
    pathPosition: 0,
    lockTo: 'path',

    delta: {
        pathPosition: 0.002,
    },

    artefact: scrawl.makeWheel({

        name: 'burn-1',

        radius: 6,

        handle: ['center', 'center'],

        fillStyle: 'red',
        method: 'fill',
        visibility: false,

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    stampAction: function (artefact, particle, host) {

        if (particle && particle.history) {

            let history = particle.history,
                remaining, z, position;

            history.forEach((p, index) => {

                if (index < 10 || (index > 20 && index < 30) || index > 40) {

                    [remaining, z, ...position] = p;
                    
                    artefact.simpleStamp(host, {
                        start: position,
                    });
                }
            });
        }
    },
}).clone({

    name: 'trace-2',
    pathPosition: 0.33,

    artefact: scrawl.library.artefact['burn-1'].clone({
        name: 'burn-2',
        fillStyle: 'green',
        globalAlpha: 0.2,
    }),

    stampAction: function (artefact, particle, host) {

        if (particle && particle.history) {

            let history = particle.history,
                len = history.length,
                remaining, z, position;

            history.forEach((p, index) => {

                if (index % 3 === 0) {

                    [remaining, z, ...position] = p;
                    
                    artefact.simpleStamp(host, {
                        start: position,
                        globalAlpha: (len - index) / len,
                    });
                }
            });
        }
    },
}).clone({

    name: 'trace-3',
    pathPosition: 0.67,

    artefact: scrawl.library.artefact['burn-1'].clone({
        name: 'burn-3',
        fillStyle: 'blue',
    }),

    stampAction: function (artefact, particle, host) {

        if (particle && particle.history) {

            let history = particle.history,
                len = history.length,
                remaining, z, position;

            history.forEach((p, index) => {

                [remaining, z, ...position] = p;
                
                artefact.simpleStamp(host, {
                    start: position,
                    scale: ((len - index) / len) * 2,
                });
            });
        }
    },
});


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
// Make the arrow draggable
scrawl.makeGroup({

    name: 'my-draggable-group',

}).addArtefacts('my-arrow');

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'my-draggable-group',
    endOn: ['up', 'leave'],
});

// #### Development and testing
console.log(scrawl.library);
