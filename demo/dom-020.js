// # Demo DOM 020
// Using the EyeDropper API

// [Run code](../../demo/dom-020.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, addCheckerboardBackground } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the background
addCheckerboardBackground(canvas, 'demo-dom-020');


// UI variables
const refBackground = document.querySelector('#reference-color'),
    refButton = refBackground.querySelector('button');

// @ts-expect-error
refBackground.style.backgroundColor = '#be81df';


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'chromakey',
    method: 'chromakey',
    reference: '#be81df',
    opaqueAt: 0.39,
    transparentAt: 0.32,
});


// Create the target entity
const piccy = scrawl.makePicture({
    
    name: 'base-piccy',
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    filters: ['chromakey'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Reference color: ${refBackground.style.backgroundColor}\n    Transparent at: ${transparentAt.value}, Opaque at: ${opaqueAt.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        transparentAt: ['transparentAt', 'float'],
        opaqueAt: ['opaqueAt', 'float'],
        opacity: ['opacity', 'float'],
    },
});


// Eyedropper API functionality
// Code taken from this [Chrome Devs article](https://developer.chrome.com/docs/capabilities/web-apis/eyedropper)
async function sampleColorFromScreen(abort) {

    refButton.setAttribute('disabled', '');

// @ts-expect-error
    const dropper = new window.EyeDropper();

    try {

        const result = await dropper.open({signal: abort.signal});
        
        const color = result.sRGBHex;

        myFilter.set({
            reference: color,
        });

// @ts-expect-error
        refBackground.style.backgroundColor = color;
        abort.abort();
        refButton.removeAttribute('disabled');

    } catch (e) { 

        abort.abort();
        refButton.removeAttribute('disabled');
    }
}

const useEyedropper = () => {

    if ('EyeDropper' in window) {

        const abortController = new AbortController();
        sampleColorFromScreen(abortController)
    }
};

scrawl.addNativeListener('click', useEyedropper, refButton);


// Setup form
const opaqueAt = document.querySelector('#opaqueAt'),
    transparentAt = document.querySelector('#transparentAt'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
opaqueAt.value = 0.39;
// @ts-expect-error
transparentAt.value = 0.32;
// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
