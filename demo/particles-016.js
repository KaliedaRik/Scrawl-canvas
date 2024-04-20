// # Demo Particles 016
// Mesh entitys

// [Run code](../../demo/particles-016.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import image from DOM
scrawl.importDomImage('.flowers');


// Every Mesh uses a Net entity
scrawl.makeNet({

    name: name('test-net'),
    order: 1,

    world: scrawl.makeWorld({
        name: name('my-world'),
    }),

    start: [50, 50],

    generate: 'weak-net',

    postGenerate: function () {

/** @ts-expect-error */
        this.springs.forEach(s => {

            s.particleFromIsStatic = true;
            s.particleToIsStatic = true;
        });
    },

    rows: 4,
    columns: 6,
    rowDistance: 100,
    columnDistance: 100,

    showSprings: true,
    showSpringsColor: 'rgb(255 255 255 / 0.3)',

    forces: [],

    engine: 'euler',

    artefact: scrawl.makeWheel({

        name: name('particle-wheel'),
        radius: 7,

        handle: ['center', 'center'],

        method: 'fillThenDraw',
        fillStyle: 'rgb(200 0 0 / 0.7)',
        strokeStyle: 'white',
        lineWidth: 2,

        visibility: false,

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    stampAction: function (artefact, particle, host) {

        const [ , , ...start] = particle.history[0];

        artefact.simpleStamp(host, {
            start,
            fillStyle: particle.fill,
            strokeStyle: particle.stroke,
        });
    },

    // Make all of the Net entity's Particles draggable
    particlesAreDraggable: true,
});


// Every Mesh also needs a source image
const myPicture = scrawl.makePicture({

    name: name('my-flower'),
    asset: 'iris',

    copyStartX: 0,
    copyStartY: 0,

    copyWidth: '100%',
    copyHeight: '100%',

    visibility: false,
});


// ___The Mesh entity definition___
scrawl.makeMesh({

    name: name('display-mesh'),

    net: name('test-net'),
    source: name('my-flower'),

    lineWidth: 2,
    lineJoin: 'round',
    strokeStyle: 'orange',

    method: 'fillThenDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Create drag functionality
scrawl.makeGroup({

    name: name('my-draggable-group'),

}).addArtefacts(name('test-net'));

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: name('my-draggable-group'),
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, myPicture);


// #### Development and testing
console.log(scrawl.library);
