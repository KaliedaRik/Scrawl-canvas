// # Demo Canvas 019 
// Gradient and Color factories - transparency

// [Run code](../../demo/canvas-018.html)
import scrawl from '../source/scrawl.js';


// #### Scene setup
const canvases = scrawl.library.canvas,
    entitys = scrawl.library.entity,
    c1 = canvases['canvas-1'],
    c2 = canvases['canvas-2'],
    c3 = canvases['canvas-3'],
    c4 = canvases['canvas-4'];

// Import the images we defined in the DOM (in &lt;img> elements)
scrawl.importDomImage('.places');

// For this scene, we'll build a data structure which we can iterate over, to build the entitys, assets and gradients required by the scene
const data = [
    {
        canvas: c1,
        image: 'hackney',
        transparency: 'transparent',
    },
    {
        canvas: c2,
        image: 'heathrow',
        transparency: 'rgba(0,0,0,0)',
    },
    {
        canvas: c3,
        image: 'kingston',
        transparency: '#00000000',
    },
    {
        canvas: c4,
        image: 'burglary',
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

    // The original picture, with the blur filter applied to it
    // - We will remove the filter in a later step
    let entity = scrawl.makePicture({

        name: `${scene.image}-original`,
        group: `${scene.canvas.base.name}`,

        asset: `${scene.image}`,

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
    })
    .updateColor(0, `${scene.transparency}`)
    .updateColor(999, 'black');

    // Apply the gradient to the scene via a Block entity
    const filterBlock = scrawl.makeBlock({

        name: `${scene.image}-block`,
        group: `${scene.canvas.base.name}`,

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
const postInitialization = () => {

    data.forEach(scene => {

        let original = entitys[`${scene.image}-original`];

        // Update our original Picture entity, in particular to remove the blur filter and set up its composition in the scene
        original.set({
            filters: [],
            order: 2,
            globalCompositeOperation: 'destination-over',
        });

        // Create a second Picture entity using the blurred image asset Scrawl-canvas created for us during the first iteration of the Display cycle.
        // + Note that we've asked Scrawl-canvas to create an &lt;img> element (outside of the DOM) from our original Picture's blurred output. Element creation takes time (it's an asynchronous action), which means that our new Picture entity won't show up for up to a second after the demo starts running.
        original.clone({
            name: `${scene.image}-blurred`,
            asset: `${scene.image}-original-image`,
            order: 1,
            globalCompositeOperation: 'source-atop',
        });
    });
}

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
    target: [c1, c2, c3, c4],

    afterCreated: postInitialization,
    commence: () => checkFunctions.forEach(f => f()),
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
