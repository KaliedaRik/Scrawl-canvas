// # Demo Canvas 019 
// Gradient and Color factories - transparency

// [Run code](../../demo/canvas-019.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvases = scrawl.library.canvas,
    entitys = scrawl.library.entity,
    c1 = canvases['hackney'],
    c2 = canvases['heathrow'],
    c3 = canvases['kingston'],
    c4 = canvases['burglary'];

// Import the images we defined in the DOM (in &lt;img> elements)
scrawl.importDomImage('.places');

// For this scene, we'll build a data structure which we can iterate over, to build the entitys, assets and gradients required by the scene
const data = [
    {
        canvas: c1,
        image: 'hackney-bg',
        transparency: 'transparent',
    },
    {
        canvas: c2,
        image: 'heathrow-bg',
        transparency: 'rgba(0,0,0,0)',
    },
    {
        canvas: c3,
        image: 'kingston-bg',
        transparency: '#00000000',
    },
    {
        canvas: c4,
        image: 'burglary-bg',
        transparency: '#0000',
    },
];

// This array will hold a set of functions which we will invoke in turn at the start of each Display cycle
const checkFunctions = [];

// The blur filter is temporary - we use it once on each image to generate a blurred version of that image
// + We do it this way because the blur filter is computationally very expensive - capturing a blurred version of the image is a lot better for end user power consumption
scrawl.makeFilter({
    name: 'blur',
    method: 'gaussianBlur',
    radius: 20,
});

// Iterate through our data array to create Scrawl-canvas objects
data.forEach(scene => {

    // The original picture, with the blur filter applied to it
    // - We will remove the filter in a later step
    let entity = scrawl.makePicture({

        name: `${scene.image}-original`,
        group: scene.canvas.base.name,

        asset: scene.image,

        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],

        filters: ['blur'],
        method: 'fill',
    });

    // A one-off instruction to tell Scrawl-canvas to create an image asset from our Picture entity the next time it performs a Display cycle
    scrawl.createImageFromEntity(entity, true);

    // The purpose of this demo is to test the various ways we can define 'transparency' in Scrawl-canvas Color objects and Gradients - tests a set of Color factory bugs uncovered and fixed in v8.3.2
    scrawl.makeRadialGradient({

        name: `${scene.image}-gradient`,
        start: ['50%', '50%'],
        end: ['50%', '50%'],
        startRadius: '5%',
        endRadius: '20%',

        colors: [
            [0, scene.transparency],
            [999, 'black']
        ],
    });

    // Apply the gradient to the scene via a Block entity
    const filterBlock = scrawl.makeBlock({

        name: `${scene.image}-block`,
        group: scene.canvas.base.name,

        start: ['center', 'center'],
        handle: ['center', 'center'],
        dimensions: ['200%', '200%'],

        fillStyle: `${scene.image}-gradient`,
        lockFillStyleToEntity: true,
    });

    // Check whether the mouse cursor is hovering over this canvas, and update the filter Block entity's positioning accordingly
    const f = () => {

        const here = scene.canvas.here,
            block = filterBlock;

        return function () {

            block.set({
                lockTo: (here.active) ? 'mouse' : 'start',
            });
        }
    };
    checkFunctions.push(f());
});

// This function will run once, at the end of the first Display cycle
const postInitialization = (anim) => {

    console.log(anim.target.name, 'postInitialization')

    let original = entitys[`${anim.target.name}-bg-original`];

    // Update our original Picture entity, in particular to remove the blur filter and set up its composition in the scene
    original.set({
        filters: [],
        order: 2,
        globalCompositeOperation: 'destination-over',
    });

    // Create a second Picture entity using the blurred image asset Scrawl-canvas created for us during the first iteration of the Display cycle.
    // + Note that we've asked Scrawl-canvas to create an &lt;img> element (outside of the DOM) from our original Picture's blurred output. Element creation takes time (it's an asynchronous action), which means that our new Picture entity won't show up for up to a second after the demo starts running.
    original.clone({
        name: `${anim.target.name}-bg-blurred`,
        asset: `${anim.target.name}-bg-original-image`,
        order: 1,
        globalCompositeOperation: 'source-atop',
    });
};


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: [c1, c2, c3, c4],

    afterCreated: postInitialization,
    commence: () => checkFunctions.forEach(f => f()),
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
