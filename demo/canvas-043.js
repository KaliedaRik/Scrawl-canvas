// # Demo Canvas 043 
// Test various clipping strategies

// [Run code](../../demo/canvas-043.html)
import * as scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const {canvas1, canvas2, canvas3} = scrawl.library.canvas;
const cells = scrawl.library.cell;

scrawl.importDomImage('.canal');


// #### Canvas 1
// Applying more than one clipped region to a scene, using Groups to separate them

// The scene will be made up of two clipped images, both draggable around the canvas
scrawl.makeGroup({

    name: 'canvas1-cog-clip',
    host: canvas1.base.name,

}).clone({

    name: 'canvas1-star-clip',
    host: canvas1.base.name,
});

// Clipping region entitys
scrawl.makeCog({

    name: 'canvas1-cog-clipper',
    group: 'canvas1-cog-clip',

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

    name: 'canvas1-cog-outline',
    order: 2,
    pivot: 'canvas1-cog-clipper',
    lockTo: 'pivot',

    strokeStyle: 'coral',
    lineWidth: 6,
    method: 'draw',
});

scrawl.makeStar({

    name: 'canvas1-star-clipper',
    group: 'canvas1-star-clip',

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

    name: 'canvas1-star-outline',
    order: 2,
    pivot: 'canvas1-star-clipper',
    lockTo: 'pivot',

    strokeStyle: 'coral',
    lineWidth: 6,
    method: 'draw',
});

// Picture entitys - we pivot these to our clipping region entitys to make the clipped display the same, wherever it is moved to on the canvas
scrawl.makePicture({

    name: 'canvas1-cog-image',
    group: 'canvas1-cog-clip',

    asset: 'factory',

    dimensions: [400, 400],
    copyDimensions: [400, 400],

    pivot: 'canvas1-cog-clipper',
    addPivotRotation: true,
    lockTo: 'pivot',
    handle: ['center', 'center'],

}).clone({

    name: 'canvas1-star-image',
    group: 'canvas1-star-clip',

    pivot: 'canvas1-star-clipper',
    copyStartX: 100,
});

// We're not interested with associating the canvas 1 drag group with the canvas's base cell - the entitys in this group will already be assigned to the clip groups, thus will already be included in the canvas's Display cycle
// + KNOWN BUG - the entitys are not draggable on first user mousedown, but are draggable afterwards
scrawl.makeGroup({

    name: 'canvas1-drag-group',

}).addArtefacts('canvas1-cog-clipper', 'canvas1-star-clipper');

scrawl.makeDragZone({

    zone: canvas1,
    collisionGroup: 'canvas1-drag-group',
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Canvas 2: 
// Generate and use Picture entitys from clipped scenes

// We will generate Image assets from cells created specifically for this one task
canvas2.buildCell({

    name: 'canvas2-cog-clip',
    dimensions: [280, 280],
    shown: false,
});

canvas2.buildCell({

    name: 'canvas2-star-clip',
    dimensions: [280, 280],
    shown: false,
});

// Clipped entitys - this code is much the same as for canvas1, without dragging and delta animation
scrawl.makeCog({

    name: 'canvas2-cog-clipper',
    group: 'canvas2-cog-clip',

    outerRadius: 140,
    innerRadius: 120,
    outerControlsDistance: 20,
    innerControlsDistance: 16,
    points: 24,

    method: 'clip',

}).clone({

    name: 'canvas2-cog-outline',
    order: 2,
    pivot: 'canvas2-cog-clipper',
    lockTo: 'pivot',

    strokeStyle: 'coral',
    lineWidth: 6,
    method: 'draw',
});

scrawl.makeStar({

    name: 'canvas2-star-clipper',
    group: 'canvas2-star-clip',

    radius1: 140,
    radius2: 80,
    points: 6,

    method: 'clip',

}).clone({

    name: 'canvas2-star-outline',
    order: 2,
    pivot: 'canvas2-star-clipper',
    lockTo: 'pivot',

    strokeStyle: 'coral',
    lineWidth: 6,
    method: 'draw',
});

scrawl.makePicture({

    name: 'canvas2-cog-image',
    group: 'canvas2-cog-clip',

    asset: 'factory',

    dimensions: [280, 280],
    copyDimensions: [280, 280],

    copyStart: [70, 60],

    pivot: 'canvas2-cog-clipper',
    lockTo: 'pivot',

}).clone({

    name: 'canvas2-star-image',
    group: 'canvas2-star-clip',

    pivot: 'canvas2-star-clipper',
    copyStart: [170, 20],
});

// We will get Scrawl-canvas to capture the image output of each Cell as part of the first Display cycle. Then we can create regular Picture entitys from those images, and get rid of the original cells and entitys.
scrawl.createImageFromCell('canvas2-cog-clip', true);
scrawl.createImageFromCell('canvas2-star-clip', true);

// We create our Picture entitys from Cell output in a post-initialization step. Note that this function may run more than once as page loading is asynchronous and unpredictable
const canvasTwoPostInitialization = function () {

    console.log('running canvasTwoPostInitialization()');
    
    // check to see if groups have been created - they don't create until late in the page load process
    const cog = scrawl.library.cell['canvas2-cog-clip'],
        star = scrawl.library.cell['canvas2-star-clip'];

    let drag = scrawl.library.group['canvas2-drag-group'];

    // create our drag group and dragzone, if they don't already exist
    // + KNOWN BUG - the entitys are not draggable on first user mousedown, but are draggable afterwards
    if (!drag) {

        drag = scrawl.makeGroup({
            name: 'canvas2-drag-group',
        });

        scrawl.makeDragZone({
            zone: canvas2,
            collisionGroup: 'canvas2-drag-group',
            endOn: ['up', 'leave'],
            preventTouchDefaultWhenDragging: true,
        });
    }

    if (cog) {

        scrawl.makePicture({

            name: 'canvas2-cog',
            group: canvas2.base.name,

            asset: 'canvas2-cog-clip-image',

            start: ['25%', 'center'],
            handle: ['center', 'center'],

            dimensions: [280, 280],
            copyDimensions: ['100%', '100%'],

            delta: {
                roll: 0.4,
            },

            method: 'fill',
        });

        drag.addArtefacts('canvas2-cog');

        // The cog cell, and its entitys, have served their purpose; time to get rid of them
        scrawl.library.group[cog.name].kill(true);
        cog.kill();
    }

    if (star) {

        scrawl.makePicture({

            name: 'canvas2-star',
            group: canvas2.base.name,

            asset: 'canvas2-star-clip-image',

            start: ['75%', 'center'],
            handle: ['center', 'center'],

            dimensions: [280, 280],
            copyDimensions: ['100%', '100%'],

            delta: {
                roll: -0.7,
            },

            method: 'fill',
        });

        drag.addArtefacts('canvas2-star');

        // The star cell, and its entitys, have served their purpose; time to get rid of them
        scrawl.library.group[star.name].kill(true);
        star.kill();
    }
};


// #### Canvas 3: 
// Emulate clipping to a Phrase entity using a composite scene rendered in its own cell

// We will generate Image assets from cells created specifically for this one task
const serifHelloCell = canvas3.buildCell({
    name: 'canvas3-serif-cell',
    dimensions: ['100%', '100%'],
});

scrawl.makePhrase({

    name: 'canvas3-serif-text-hello',
    group: 'canvas3-serif-cell',

    text: 'HELLO!',
    font: 'bold 120px serif',
    lineHeight: 1,
});

const canvasThreePostInitialization = function () {

    console.log('running canvasThreePostInitialization()');
    
    // check to see if groups have been created - they don't create until late in the page load process
    let drag = scrawl.library.group['canvas3-drag-group'];

    // create our drag group and dragzone, if they don't already exist
    // + KNOWN BUG - the entitys are not draggable on first user mousedown, but are draggable afterwards
    if (!drag) {

        drag = scrawl.makeGroup({
            name: 'canvas3-drag-group',
        });

        scrawl.makeDragZone({
            zone: canvas3,
            collisionGroup: 'canvas3-drag-group',
            endOn: ['up', 'leave'],
            preventTouchDefaultWhenDragging: true,
        });
    }

    const phrase = scrawl.library.entity['canvas3-serif-text-hello'];

    if (phrase) {

        // We need to retrieve the Phrase entity's dimensions - which are hard to guess before it's created - and update its surrounding environment to fit.
        const [width, height] = phrase.get('dimensions');


        // We can use the phrase entity as a stencil by applying a Picture entity over it with a GCO = 'source-atop'
        scrawl.makePicture({

            name: 'canvas3-serif-image',
            group: serifHelloCell.name,

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
        phrase.clone({

            name: 'canvas3-serif-outline',
            order: 2,
            globalCompositeOperation: 'source-over',

            method: 'draw',
            lineWidth: 3,
            strokeStyle: 'coral',
        });

        // We cannot directly drag-and-drop a Cell, but we can create a Block entity and pivot the Cell to it, then drag-and-drop the Block
        scrawl.makeBlock({
            name: 'canvas3-serif-block',
            group: canvas3.base.name,
            width, 
            height,
            start: ['center', 'center'],
            handle: ['center', 'center'],
            delta: {
                roll: 0.5,
            },
            method: 'none',
        })

        serifHelloCell.set({
            width,
            height, 
            handle: ['center', 'center'],
            pivot: 'canvas3-serif-block',
            addPivotRotation: true,
            lockTo: 'pivot',
        });

        drag.addArtefacts('canvas3-serif-block');
    }
};


// #### Scene animation
// Function will be called 3 times - once per canvas - so we need to make sure the appropriate function gets invoked for that canvas
// + Multiple calls invoked because the makeRender function will generate separate animation objects for each canvas target.
const postInitialization = function (anim) {

    console.log(anim.target.name);

    let target = anim.target.name;

    if ('canvas2' === target) canvasTwoPostInitialization();
    else if ('canvas3' === target) canvasThreePostInitialization();
};

scrawl.makeRender({

    name: 'demo-animation',
    target: [canvas1, canvas2, canvas3],

    // Note that this function will be run three times - once for each of the canvases targeted. Thus we need to code the function defensively so that code related to a particular canvas runs only once 
    afterCreated: postInitialization,
});


// #### Development and testing
console.log(scrawl.library);
