// # Demo DOM 020
// Using the EyeDropper API

// [Run code](../../demo/dom-020.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, addCheckerboardBackground } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


scrawl.importDomImage('.flowers');


// Create the background
addCheckerboardBackground(scrawl, canvas, namespace);


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('chromakey'),
    method: 'chromakey',
    reference: '#be81df',
    opaqueAt: 0.39,
    transparentAt: 0.32,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    filters: [name('chromakey')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Reference color: ${dom.reference_color.style.backgroundColor}
    Transparent at: ${dom.transparentAt.value}, Opaque at: ${dom.opaqueAt.value}
    Opacity: ${dom.opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const dom = scrawl.initializeDomInputs([
    ['input', 'transparentAt', '0.32'],
    ['input', 'opaqueAt', '0.39'],
    ['input', 'opacity', '1'],
    ['button', 'reference_selector', 'Select color using Eye Dropper API'],
    ['', 'reference_color'],
]);

dom.reference_color.style.backgroundColor = '#be81df';


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.filter_control',

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

    dom.reference_selector.setAttribute('disabled', '');

/** @ts-expect-error */
    const dropper = new window.EyeDropper();

    try {

        const result = await dropper.open({signal: abort.signal});

        const color = result.sRGBHex;

        myFilter.set({ reference: color });

        dom.reference_color.style.backgroundColor = color;
        abort.abort();
        dom.reference_selector.removeAttribute('disabled');

    } catch (e) {

        console.log(e);
        abort.abort();
        dom.reference_selector.removeAttribute('disabled');
    }
}

const useEyedropper = () => {

    if ('EyeDropper' in window) {

        const abortController = new AbortController();
        sampleColorFromScreen(abortController)
    }
    else {
        dom.reference_selector.textContent = 'Eye Dropper API not supported by this browser';
    }
};
scrawl.addNativeListener('click', useEyedropper, dom.reference_selector);


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
