// # Demo Particles 010 
// Net entity: using a shape path as a net template

// [Run code](../../demo/particles-010.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'slategray',
});


scrawl.makeShape({

    name: 'my-first-template-arrow',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    start: ['33%', '33%'],
    handle: ['center', 'center'],

    scale: 0.3,
    roll: -90,
    flipUpend: true,

    useAsPath: true,

    fillStyle: 'gray',

}).clone({

    name: 'my-second-template-arrow',
    start: ['67%', '67%'],
});


// Create a World object; add some user-defined attributes to it
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,

});

const myNet = scrawl.makeNet({

    name: 'weak-arrow',
    world: myWorld,

    shapeTemplate: 'my-first-template-arrow',
    precision: 40,
    joinTemplateEnds: true,

    generate: 'weak-shape',

    postGenerate: function () {

        const regex = RegExp('-0$');

        this.particleStore.forEach(p => {

            if (regex.test(p.name)) {

                p.set({ 
                    fill: 'red',
                    stroke: 'black',
                    forces: [],
                });

                this.springs.forEach(s => {

                    if (s && s.particleFrom && s.particleFrom.name === p.name) {

                        s.particleFromIsStatic = true;
                    }
                    if (s && s.particleTo && s.particleTo.name === p.name) {

                        s.particleToIsStatic = true;
                    }
                })
            }
        });
    },

    showSprings: true,
    showSpringsColor: 'azure',

    springConstant: 300,

    engine: 'runge-kutta',

    artefact: scrawl.makeWheel({

        name: 'particle-wheel-1',
        radius: 7,

        handle: ['center', 'center'],

        method: 'fillThenDraw',
        fillStyle: 'yellow',
        strokeStyle: 'gold',

        visibility: false, 

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    stampAction: function (artefact, particle, host) {

            let [r, z, ...start] = particle.history[0];

            artefact.simpleStamp(host, { 
                start,
                fillStyle: particle.fill, 
                strokeStyle: particle.stroke, 
            });
    },
    particlesAreDraggable: true,

}).clone({

    name: 'strong-arrow',
    generate: 'strong-shape',
    shapeTemplate: 'my-second-template-arrow',

    artefact: scrawl.library.artefact['particle-wheel-1'].clone({
        name: 'particle-wheel-2',
    }),
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
// Make the Emitter draggable
scrawl.makeGroup({

    name: 'my-draggable-group',

}).addArtefacts('weak-arrow', 'strong-arrow');

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'my-draggable-group',
    endOn: ['up', 'leave'],
});


// #### Development and testing
console.log(scrawl.library);
