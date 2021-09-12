// # Demo Particles 010 
// Net entity: using a shape path as a net template

// [Run code](../../demo/particles-010.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'slategray',
});


// For this Demo, we are creating some Shape entitys and using them as a template for generating Net entity Particles.
scrawl.makeShape({

    name: 'my-first-template-arrow',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    start: ['25%', '25%'],
    handle: ['center', 'center'],

    scale: 0.3,
    roll: -90,
    flipUpend: true,

    useAsPath: true,

    fillStyle: 'gray',

}).clone({

    name: 'my-second-template-arrow',
    start: ['50%', '50%'],

}).clone({

    name: 'my-third-template-arrow',
    start: ['75%', '75%'],
});


// #### Particle physics animation scene

// Create a World object which we can then assign to the Net entity
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,

});


// Create a Net entity
const myNet = scrawl.makeNet({

    name: 'weak-arrow',
    world: myWorld,

    // The Net entity comes with four pre-defined `generate` functions - we will be testing 'weak-shape' and 'strong-shape' in this demo.
    // + We can define our own generate function if the pre-defined functions do not meet our needs.
    generate: 'weak-shape',
    shapeTemplate: 'my-first-template-arrow',
    precision: 40,
    joinTemplateEnds: true,

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

    springConstant: 100,
    damperConstant: 1,

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

// Clone the Net entity
}).clone({

    name: 'strong-arrow',
    generate: 'strong-shape',
    shapeTemplate: 'my-second-template-arrow',

    artefact: scrawl.library.artefact['particle-wheel-1'].clone({
        name: 'particle-wheel-2',
    }),

// Clone again
}).clone({

    name: 'hub-spoke-arrow',
    generate: 'hub-spoke',
    shapeTemplate: 'my-third-template-arrow',

    artefact: scrawl.library.artefact['particle-wheel-1'].clone({
        name: 'particle-wheel-3',
    }),
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Make the Net entity's Particles draggable
scrawl.makeGroup({

    name: 'my-draggable-group',

}).addArtefacts('weak-arrow', 'strong-arrow', 'hub-spoke-arrow');

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'my-draggable-group',
    endOn: ['up', 'leave'],
});


// #### Development and testing
console.log(scrawl.library);
