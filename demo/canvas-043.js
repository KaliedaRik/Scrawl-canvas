// # Demo Canvas 043 
// Test various clipping strategies

// [Run code](../../demo/canvas-043.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const {canvas1, canvas2, canvas3} = scrawl.library.canvas;


scrawl.importDomImage('.canal');


// #### Canvas 1
// Applying more than one clipped region to a scene, using Groups to separate them
const ns1 = `canvas1`;
const name1 = (name) => `${ns1}-${name}`;

// The scene will be made up of two clipped images, both draggable around the canvas
scrawl.makeGroup({

    name: name1('cog-clip'),
    host: canvas1.get('baseName'),

}).clone({

    name: name1('star-clip'),
    host: canvas1.get('baseName'),
});

// Clipping region entitys
scrawl.makeCog({

    name: name1('cog-clipper'),
    group: name1('cog-clip'),

    start: ['25%', 'center'],
    handle: ['center', 'center'],

    outerRadius: 140,
    innerRadius: 120,
    outerControlsDistance: 20,
    innerControlsDistance: 16,
    points: 24,

    method: 'clip',

    delta: {
        roll: 0.4,
    },

    // The clipping region entity MUST be stamped on the canvas before the entitys that will be clipped by it
    bringToFrontOnDrag: false,

// Add outlines to our clipped regions
}).clone({

    name: name1('cog-outline'),
    order: 2,
    pivot: name1('cog-clipper'),
    lockTo: 'pivot',

    strokeStyle: 'coral',
    lineWidth: 6,
    method: 'draw',
});

scrawl.makeStar({

    name: name1('star-clipper'),
    group: name1('star-clip'),

    start: ['75%', 'center'],
    handle: ['center', 'center'],

    radius1: 80,
    radius2: 140,
    points: 6,

    delta: {
        roll: -0.7,
    },

    method: 'clip',
    bringToFrontOnDrag: false,

}).clone({

    name: name1('star-outline'),
    order: 2,
    pivot: name1('star-clipper'),
    lockTo: 'pivot',

    strokeStyle: 'coral',
    lineWidth: 6,
    method: 'draw',
});

// Picture entitys - we pivot these to our clipping region entitys to make the clipped display the same, wherever it is moved to on the canvas
scrawl.makePicture({

    name: name1('cog-image'),
    group: name1('cog-clip'),

    asset: 'factory',

    dimensions: [400, 400],
    copyDimensions: [400, 400],

    pivot: name1('cog-clipper'),
    addPivotRotation: true,
    lockTo: 'pivot',
    handle: ['center', 'center'],

}).clone({

    name: name1('star-image'),
    group: name1('star-clip'),

    pivot: name1('star-clipper'),
    copyStartX: 100,
});

// We're not interested with associating the canvas 1 drag group with the canvas's base cell - the entitys in this group will already be assigned to the clip groups, thus will already be included in the canvas's Display cycle
scrawl.makeGroup({

    name: name1('drag-group'),

}).addArtefacts(name1('cog-clipper'), name1('star-clipper'));

scrawl.makeDragZone({

    zone: canvas1,
    collisionGroup: name1('drag-group'),
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Canvas 2: 
// Generate and use Picture entitys from clipped scenes
const ns2 = `canvas2`;
const name2 = (name) => `${ns2}-${name}`;

// We'll be creating some temporary cells etc which we need to clear out after completing work
const prepNamespace = `prep-for-canvas2`;
const prepName = (name) => `${prepNamespace}-${name}`;

// We will generate Image assets from cells created specifically for this one task
canvas2.buildCell({

    name: prepName('cog-clip'),
    dimensions: [280, 280],
    shown: false,
});

canvas2.buildCell({

    name: prepName('star-clip'),
    dimensions: [280, 280],
    shown: false,
});

// Clipped entitys - this code is much the same as for canvas1, without dragging and delta animation
scrawl.makeCog({

    name: prepName('cog-clipper'),
    group: prepName('cog-clip'),

    outerRadius: 140,
    innerRadius: 120,
    outerControlsDistance: 20,
    innerControlsDistance: 16,
    points: 24,

    method: 'clip',

}).clone({

    name: prepName('cog-outline'),
    order: 2,
    pivot: prepName('cog-clipper'),
    lockTo: 'pivot',

    strokeStyle: 'coral',
    lineWidth: 6,
    method: 'draw',
});

scrawl.makeStar({

    name: prepName('star-clipper'),
    group: prepName('star-clip'),

    radius1: 140,
    radius2: 80,
    points: 6,

    method: 'clip',

}).clone({

    name: prepName('star-outline'),
    order: 2,
    pivot: prepName('star-clipper'),
    lockTo: 'pivot',

    strokeStyle: 'coral',
    lineWidth: 6,
    method: 'draw',
});

scrawl.makePicture({

    name: prepName('cog-image'),
    group: prepName('cog-clip'),

    asset: 'factory',

    dimensions: [280, 280],
    copyDimensions: [280, 280],

    copyStart: [70, 60],

    pivot: prepName('cog-clipper'),
    lockTo: 'pivot',

}).clone({

    name: prepName('star-image'),
    group: prepName('star-clip'),

    pivot: prepName('star-clipper'),
    copyStart: [170, 20],
});

// We will get Scrawl-canvas to capture the image output of each Cell as part of the first Display cycle. Then we can create regular Picture entitys from those images, and get rid of the original cells and entitys.
scrawl.createImageFromCell(prepName('cog-clip'), name2('cog-image'),);
scrawl.createImageFromCell(prepName('star-clip'), name2('star-image'));

// We create our Picture entitys from Cell output in a post-initialization step. Note that this function may run more than once as page loading is asynchronous and unpredictable
const canvasTwoPostInitialization = function () {

    console.log('running canvasTwoPostInitialization()');
    
    const drag = scrawl.makeGroup({
        name: name2('drag-group'),
    });

    scrawl.makeDragZone({
        zone: canvas2,
        collisionGroup: name2('drag-group'),
        endOn: ['up', 'leave'],
        preventTouchDefaultWhenDragging: true,
    });

    scrawl.makePicture({

        name: name2('cog'),
        group: canvas2.get('baseGroup'),

        asset: name2('cog-image'),

        start: ['25%', 'center'],
        handle: ['center', 'center'],

        dimensions: [280, 280],
        copyDimensions: ['100%', '100%'],

        delta: {
            roll: 0.4,
        },

        method: 'fill',
    });

    drag.addArtefacts(name2('cog'));

    scrawl.makePicture({

        name: name2('star'),
        group: canvas2.get('baseGroup'),

        asset: name2('star-image'),

        start: ['75%', 'center'],
        handle: ['center', 'center'],

        dimensions: [280, 280],
        copyDimensions: ['100%', '100%'],

        delta: {
            roll: -0.7,
        },

        method: 'fill',
    });

    drag.addArtefacts(name2('star'));

    // The cog and star Cells - and their Groups, entitys, etc - have served their purpose
    // + Time to get rid of them
    setTimeout(() => scrawl.library.purge(prepNamespace), 0);
};


// #### Canvas 3: 
// Emulate clipping to a Phrase entity using a composite scene rendered in its own cell
const ns3 = `canvas3`;
const name3 = (name) => `${ns3}-${name}`;


// We will generate Image assets from cells created specifically for this one task
const c3Cell = canvas3.buildCell({
    name: name3('serif-cell'),
    dimensions: ['100%', '100%'],
});

const c3Phrase = scrawl.makePhrase({

    name: name3('serif-text-hello'),
    group: name3('serif-cell'),

    text: 'HELLO!',
    font: 'bold 120px serif',
    lineHeight: 1,
});

const canvasThreePostInitialization = function () {

    console.log('running canvasThreePostInitialization()');
    
    // create our drag group and dragzone
    const drag = scrawl.makeGroup({
        name: name3('drag-group'),
    });

    scrawl.makeDragZone({
        zone: canvas3,
        collisionGroup: name3('drag-group'),
        endOn: ['up', 'leave'],
        preventTouchDefaultWhenDragging: true,
    });

    // We need to retrieve the Phrase entity's dimensions - which are hard to guess before it's created - and update its surrounding environment to fit.
    const [width, height] = c3Phrase.get('dimensions');


    // We can use the phrase entity as a stencil by applying a Picture entity over it with a GCO = 'source-atop'
    scrawl.makePicture({

        name: name3('serif-image'),
        group: name3('serif-cell'),

        asset: 'factory',

        width,
        height,
        copyDimensions: [width, height],
        copyStart: [50, 50],

        method: 'fill',
        order: 1,
        globalCompositeOperation: 'source-atop',
    });

    // We can also add an outline, if we want
    c3Phrase.clone({

        name: name3('serif-outline'),
        order: 2,
        globalCompositeOperation: 'source-over',

        method: 'draw',
        lineWidth: 3,
        strokeStyle: 'coral',
    });

    // We cannot directly drag-and-drop a Cell, but we can create a Block entity and pivot the Cell to it, then drag-and-drop the Block
    scrawl.makeBlock({
        name: name3('serif-block'),
        group: canvas3.get('baseGroup'),
        width, 
        height,
        start: ['center', 'center'],
        handle: ['center', 'center'],
        delta: {
            roll: 0.5,
        },
        method: 'none',
    })

    c3Cell.set({
        width,
        height, 
        handle: ['center', 'center'],
        pivot: name3('serif-block'),
        addPivotRotation: true,
        lockTo: 'pivot',
    });

    drag.addArtefacts(name3('serif-block'));
};


// #### Scene animation
// Function will be called 3 times - once per canvas - so we need to make sure the appropriate function gets invoked for that canvas
// + Multiple calls invoked because the makeRender function will generate separate animation objects for each canvas target.
const postInitialization = function (anim) {

    console.log(anim.target.name);

    const target = anim.target.name;

    if ('canvas2' === target) canvasTwoPostInitialization();
    else if ('canvas3' === target) canvasThreePostInitialization();
};

// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');

scrawl.makeRender({

    name: 'demo-animation',
    target: [canvas1, canvas2, canvas3],

    // Note that this function will be run three times - once for each of the canvases targeted. Thus we need to code the function defensively so that code related to a particular canvas runs only once 
    afterCreated: postInitialization,
});

scrawl.makeRender({

    name: 'demo-speed',
    noTarget: true,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
