// # Demo Particles 016 
// Mesh entitys

// [Run code](../../demo/particles-016.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'azure',
});

// Import image from DOM
scrawl.importDomImage('.flowers');


// Every Mesh uses a Net entity
const myNet = scrawl.makeNet({

    name: 'test-net',
    order: 1,

    world: scrawl.makeWorld({
        name: 'demo-world',
    }),

    start: [50, 50],

    generate: 'weak-net',

    postGenerate: function () {

// @ts-expect-error
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
    showSpringsColor: 'rgba(255, 255, 255, 0.3)',

    forces: [],

    engine: 'euler',

    artefact: scrawl.makeWheel({

        name: 'particle-wheel',
        radius: 7,

        handle: ['center', 'center'],

        method: 'fillThenDraw',
        fillStyle: 'rgba(200, 0, 0, 0.7)',
        strokeStyle: 'white',
        lineWidth: 2,

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

    // Make all of the Net entity's Particles draggable
    particlesAreDraggable: true,
});

// Every Mesh also needs a source image
const myPicture = scrawl.makePicture({

    name: 'my-flower',
    asset: 'iris',

    copyStartX: 0,
    copyStartY: 0,

    copyWidth: '100%',
    copyHeight: '100%',

    visibility: false,
});


// ___The Loom entity definition___
let myMesh = scrawl.makeMesh({

    name: 'display-mesh',

    net: 'test-net',
    source: 'my-flower',

    lineWidth: 2,
    lineJoin: 'round',
    strokeStyle: 'orange',

    method: 'fillThenDraw',

// @ts-expect-error
    onEnter: function () { this.set({ lineWidth: 6 }) },
// @ts-expect-error
    onLeave: function () { this.set({ lineWidth: 2 }) },
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

// Mouse movement over and away from the Loom (emulates CSS element `hover` functionality)
let interactions = function () { canvas.cascadeEventAction('move') };
scrawl.addListener('move', interactions, canvas.domElement);


// Create drag functionality
// + KNOWN BUG - the particles are not draggable on first user mousedown, but are draggable afterwards
scrawl.makeGroup({

    name: 'my-draggable-group',

}).addArtefacts('test-net');

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'my-draggable-group',
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', [myPicture]);


// #### Development and testing
console.log(scrawl.library);
