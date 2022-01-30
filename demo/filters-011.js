// # Demo Filters 011 
// Filter parameters: chromakey

// [Run code](../../demo/filters-011.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

canvas.setBase({
    backgroundColor: 'red',
})


// Create the filter
// + Chroma filters can have more than one range; each range array should be added to the `ranges` attribute
const myFilter = scrawl.makeFilter({

    name: 'chromakey',
    method: 'chromakey',

    red: 0,
    green: 127,
    blue: 0,

    opaqueAt: 1,
    transparentAt: 0,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['chromakey'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Reference color: ${reference.value}\n    Transparent at: ${transparentAt.value}, Opaque at: ${opaqueAt.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        transparentAt: ['transparentAt', 'float'],
        opaqueAt: ['opaqueAt', 'float'],
        opacity: ['opacity', 'float'],
        reference: ['reference', 'raw'],
    },
});


// Setup form
const reference = document.querySelector('#reference'),
    opaqueAt = document.querySelector('#opaqueAt'),
    transparentAt = document.querySelector('#transparentAt'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
reference.value = '#007700';
// @ts-expect-error
opaqueAt.value = 1;
// @ts-expect-error
transparentAt.value = 0;
// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
