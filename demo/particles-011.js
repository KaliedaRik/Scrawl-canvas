// # Demo Particles 011 
// Tracer entity: generation and functionality

// [Run code](../../demo/particles-011.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});


// Define filters - need to test them all, plus some user-defined filters
scrawl.makeFilter({
    name: 'grayscale',
    method: 'grayscale',
}).clone({
    name: 'invert',
    method: 'invert',
});

scrawl.makeFilter({
    name: 'tint',
    method: 'tint',
    redInRed: 0.5,      redInGreen: 1,      redInBlue: 0.9,
    greenInRed: 0,      greenInGreen: 0.3,  greenInBlue: 0.8,
    blueInRed: 0.8,     blueInGreen: 0.8,   blueInBlue: 0.4,
});

scrawl.makeFilter({
    name: 'matrix',
    method: 'matrix',
    weights: [-1, -1, 0, -1, 1, 1, 0, 1, 1],
});

scrawl.makeFilter({
    name: 'venetianBlinds',
    method: 'userDefined',
    level: 9,

    userDefined: `
        let i, iz, j, jz,
            level = filter.level || 6,
            halfLevel = level / 2,
            yw, transparent, pos;

        for (i = localY, iz = localY + localHeight; i < iz; i++) {

            transparent = (i % level > halfLevel) ? true : false;

            if (transparent) {

                yw = (i * iWidth) + 3;
                
                for (j = localX, jz = localX + localWidth; j < jz; j ++) {

                    pos = yw + (j * 4);
                    data[pos] = 0;
                }
            }
        }`,
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

    bringToFrontOnDrag: false,
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

        let history = particle.history,
            remaining, z, start;

        history.forEach((p, index) => {

            if (index < 10 || (index > 20 && index < 30) || index > 40) {

                [remaining, z, ...start] = p;
                artefact.simpleStamp(host, { start });
            }
        });
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

        let history = particle.history,
            len = history.length,
            remaining, z, start;

        history.forEach((p, index) => {

            if (index % 3 === 0) {

                [remaining, z, ...start] = p;
                
                artefact.simpleStamp(host, {
                    start,
                    globalAlpha: (len - index) / len,
                });
            }
        });
    },
}).clone({

    name: 'trace-3',
    pathPosition: 0.67,

    artefact: scrawl.library.artefact['burn-1'].clone({
        name: 'burn-3',
        fillStyle: 'blue',
    }),

    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            len = history.length,
            remaining, z, start;

        history.forEach((p, index) => {

            [remaining, z, ...start] = p;
            
            artefact.simpleStamp(host, {
                start,
                scale: ((len - index) / len) * 2,
            });
        });
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

// #### User interaction
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'my-draggable-group',
    endOn: ['up', 'leave'],
});

const filterChoice = function (e) {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value,
        entity = scrawl.library.entity['trace-2'];

    entity.clearFilters();
    if (val) entity.addFilters(val);
};
scrawl.addNativeListener(['input', 'change'], filterChoice, '#filter');

document.querySelector('#filter').value = '';


// #### Development and testing
console.log(scrawl.library);
