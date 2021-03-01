// # Demo Canvas 019a 
// Gradient and Color factories - transparency - alternative approach using Cells instead of images

// [Run code](../../demo/canvas-019a.html)
import scrawl from '../source/scrawl.js';


// #### Scene setup
const canvases = scrawl.library.canvas;

// Import the images we defined in the DOM (in &lt;img> elements)
scrawl.importDomImage('.places');

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
        transparency: 'rgba(0,0,0,0)',
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
scrawl.makeFilter({
    name: 'blur',
    method: 'blur',
    radius: 20,
    passes: 2,
});

// Iterate through our data array to create Scrawl-canvas objects
data.forEach(scene => {

    // Firstly, build the blurred image in its own cell
    // + We only need to compile this once, thus don't include the cell in any part of the Display cycle
    let mycell = scene.canvas.buildCell({

        name: `${scene.image}-blurred-cell`,
        dimensions: ['100%', '100%'],
        cleared: false,
        compiled: false,
        shown: false,
    });

    scrawl.makePicture({

        name: `${scene.image}-blurred-image`,
        group: `${scene.image}-blurred-cell`,

        asset: `${scene.image}`,

        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],

        filters: ['blur'],
        method: 'fill',
    });

    // The new Cell's compile action is blocking, because the blur filter takes a long time to complete. To get something up on the screen we can defer the compile action until after the current RAF completes by putting it in a setTimeout invocation.
    setTimeout(() => mycell.compile(), 0);


    // Next, build a gradient using transparency and apply it in a second Block which displays in the original canvas
    scrawl.makeRadialGradient({

        name: `${scene.image}-gradient`,
        start: ['50%', '50%'],
        end: ['50%', '50%'],
        startRadius: '5%',
        endRadius: '20%',
    })
    .updateColor(0, `${scene.transparency}`)
    .updateColor(999, 'lightgray');

    const gradientBlock = scrawl.makeBlock({

        name: `${scene.image}-gradient-block`,
        group: `${scene.canvas.base.name}`,

        start: ['center', 'center'],
        handle: ['center', 'center'],
        dimensions: ['200%', '200%'],

        fillStyle: `${scene.image}-gradient`,
        lockFillStyleToEntity: true,
    });

    // Now we can draw our blurred image into the scene 
    // + We use some compositing magic so it only appears where the gradient is not transparent
    scrawl.makePicture({

        name: `${scene.image}-blurred-block`,
        group: scene.canvas.base.name,

        asset: `${scene.image}-blurred-cell`,

        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],

        method: 'fill',
        globalCompositeOperation: 'source-atop',
    });

    // Lastly, display the original image in the canvas
    // + Again, we use compositing magic to draw on the bits missed by the blurred image
    scrawl.makePicture({

        name: `${scene.image}-original-image`,
        group: scene.canvas.base.name,

        asset: `${scene.image}`,

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
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();

        // Because we are using the same render object to animate all four canvases, this report function gets run four times for each Display cycle (once each time each canvas is rendered). The fix is to choke the functionality so it actions only after a given number of milliseconds since it was last run - typically 2 milliseconds is enough to ensure the action only runs once per cycle.
        if (testNow - testTicker > 2) {

            testTime = testNow - testTicker;
            testTicker = testNow;

            testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
        }
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: [canvases['hackney'], canvases['heathrow'], canvases['kingston'], canvases['burglary']],

    commence: () => checkFunctions.forEach(f => f()),
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
