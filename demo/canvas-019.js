// # Demo Canvas 019
// Gradient and Color factories - transparency - alternative approach using Cells instead of images

// [Run code](../../demo/canvas-019.html)
import {
    library as L,
    importDomImage,
    makeFilter,
    makePicture,
    makeRadialGradient,
    makeBlock,
    makeRender,
    addNativeListener,
} from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvases = L.canvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Import the images we defined in the DOM (in &lt;img> elements)
importDomImage('.places');


// For this scene, we'll build a data structure which we can iterate over, to build the entitys, assets and gradients required by the scene
const data = [
    {
        canvas: canvases['hackney'],
        image: 'hackney-bg',
        transparency: 'transparent',
    },
    {
        canvas: canvases['heathrow'],
        image: 'heathrow-bg',
        transparency: 'rgb(0 0 0 / 0)',
    },
    {
        canvas: canvases['kingston'],
        image: 'kingston-bg',
        transparency: '#00000000',
    },
    {
        canvas: canvases['burglary'],
        image: 'burglary-bg',
        transparency: '#0000',
    },
];

// This array will hold a set of functions which we will invoke in turn at the start of each Display cycle
const checkFunctions = [];

// The blur filter is temporary - we use it once on each image to generate a blurred version of that image
// + We do it this way because the blur filter is computationally very expensive - capturing a blurred version of the image is a lot better for end user power consumption
makeFilter({
    name: name('blur'),
    method: 'gaussianBlur',
    radius: 20,
});

// Iterate through our data array to create Scrawl-canvas objects
data.forEach(scene => {

    // Firstly, build the blurred image in its own cell
    // + We only need to compile this once, thus don't include the cell in any part of the Display cycle
    const mycell = scene.canvas.buildCell({

        name: name(`${scene.image}-blurred-cell`),
        dimensions: ['100%', '100%'],
        cleared: false,
        compiled: false,
        shown: false,
    });

    makePicture({

        name: name(`${scene.image}-blurred-image`),
        group: name(`${scene.image}-blurred-cell`),

        asset: scene.image,

        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],

        filters: [name('blur')],
        method: 'fill',
    });

    // The new Cell's compile action is blocking, because the blur filter takes a long time to complete. To get something up on the screen we can defer the compile action until after the current RAF completes by putting it in a setTimeout invocation.
    setTimeout(() => mycell.compile(), 0);


    // Next, build a gradient using transparency and apply it in a second Block which displays in the original canvas
    makeRadialGradient({

        name: name(`${scene.image}-gradient`),
        start: ['50%', '50%'],
        end: ['50%', '50%'],
        startRadius: '5%',
        endRadius: '20%',

        colors: [
            [0, scene.transparency],
            [999, 'lightgray']
        ],
    });

    const gradientBlock = makeBlock({

        name: name(`${scene.image}-gradient-block`),
        group: scene.canvas.base.name,

        start: ['center', 'center'],
        handle: ['center', 'center'],
        dimensions: ['200%', '200%'],

        fillStyle: name(`${scene.image}-gradient`),
        lockFillStyleToEntity: true,
    });

    // Now we can draw our blurred image into the scene
    // + We use some compositing magic so it only appears where the gradient is not transparent
    makePicture({

        name: name(`${scene.image}-blurred-block`),
        group: scene.canvas.base.name,

        asset: name(`${scene.image}-blurred-cell`),

        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],

        method: 'fill',
        globalCompositeOperation: 'source-atop',
    });

    // Lastly, display the original image in the canvas
    // + Again, we use compositing magic to draw on the bits missed by the blurred image
    makePicture({

        name: name(`${scene.image}-original-image`),
        group: scene.canvas.base.name,

        asset: scene.image,

        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],

        method: 'fill',
        globalCompositeOperation: 'destination-over',
    });

    // Check whether the mouse cursor is hovering over this canvas, and update the filter Block entity's positioning accordingly
    const f = () => {

        const here = scene.canvas.here;

        return function () {

            gradientBlock.set({
                lockTo: (here.active) ? 'mouse' : 'start',
            });
        }
    };
    checkFunctions.push(f());
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
makeRender({

    name: name('animation'),
    target: [canvases['hackney'], canvases['heathrow'], canvases['kingston'], canvases['burglary']],
    observer: true,

    commence: () => checkFunctions.forEach(f => f()),
});

makeRender({

    name: name('speed'),
    noTarget: true,
    afterShow: report,
});


// For this demo we will suppress touchmove functionality over the canvas
addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, [canvases['hackney'].domElement, canvases['heathrow'].domElement, canvases['kingston'].domElement, canvases['burglary'].domElement]);


// #### Development and testing
console.log(L);
