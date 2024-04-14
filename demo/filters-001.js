// # Demo Filters 001
// Parameters for: Blur, Gaussianblur filters; filter memoization

// [Run code](../../demo/filters-001.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the two blur filters
const gaussian = scrawl.makeFilter({

    name: name('gaussian-blur'),
    method: 'gaussianBlur',
    radius: 10,
});

const legacy = gaussian.clone({

    name: name('legacy-blur'),
    method: 'blur',
    includeAlpha: false,
    passes: 1,
    step: 1,
});


// Create the Picture entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: [name('gaussian-blur')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
Legacy:
    Radius: ${dom.radius.value}, Step: ${dom.step.value}, Passes: ${dom.passes.value}, Opacity: ${dom.opacity.value}

Gaussian:
    Radius: ${dom.radius.value}, Opacity: ${dom.opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const enableLegacyButtons = () => {
    dom.includeRed.removeAttribute('disabled');
    dom.includeGreen.removeAttribute('disabled');
    dom.includeBlue.removeAttribute('disabled');
    dom.includeAlpha.removeAttribute('disabled');
    dom.excludeTransparentPixels.removeAttribute('disabled');
    dom.processHorizontal.removeAttribute('disabled');
    dom.processVertical.removeAttribute('disabled');
    dom.passes.removeAttribute('disabled');
    dom.step.removeAttribute('disabled');
};

const disableLegacyButtons = () => {
    dom.includeRed.setAttribute('disabled', '');
    dom.includeGreen.setAttribute('disabled', '');
    dom.includeBlue.setAttribute('disabled', '');
    dom.includeAlpha.setAttribute('disabled', '');
    dom.excludeTransparentPixels.setAttribute('disabled', '');
    dom.processHorizontal.setAttribute('disabled', '');
    dom.processVertical.setAttribute('disabled', '');
    dom.passes.setAttribute('disabled', '');
    dom.step.setAttribute('disabled', '');
};

// Setup form
const dom = initializeDomInputs([
    ['input', 'radius', '10'],
    ['input', 'passes', '1'],
    ['input', 'step', '1'],
    ['input', 'opacity', '1'],
    ['select', 'blurFilter', 1],
    ['select', 'includeRed', 1],
    ['select', 'includeGreen', 1],
    ['select', 'includeBlue', 1],
    ['select', 'includeAlpha', 0],
    ['select', 'processHorizontal', 1],
    ['select', 'processVertical', 1],
    ['select', 'excludeTransparentPixels', 1],
    ['select', 'memoizeFilterOutput', 0],
]);

disableLegacyButtons();


// Update attributes specific to the legacy filter
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: legacy,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        passes: ['passes', 'round'],
        step: ['step', 'round'],

        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],

        processHorizontal: ['processHorizontal', 'boolean'],
        processVertical: ['processVertical', 'boolean'],
        excludeTransparentPixels: ['excludeTransparentPixels', 'boolean'],
    },
});

// Switch between gaussian and legacy blurs
scrawl.addNativeListener(['update', 'change'], (e) => {

    e.preventDefault();
    e.stopPropagation();

    const val = e.target.value;

    if (val) {

        // Update the filter applied to the Picture entity
        piccy.clearFilters();
        piccy.addFilters(name(val));

        // Update UI controls
        switch (val) {

            case 'legacy-blur' :
                enableLegacyButtons();
                break;

            case 'gaussian-blur' :
                disableLegacyButtons();
                break;
        }
    }

}, dom.blurFilter);

// Get the Picture entity to memoize the filter
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: dom.memoizeFilterOutput,

    target: piccy,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        memoizeFilterOutput: ['memoizeFilterOutput', 'boolean'],
    },
});

// Set the filter radius (both filters)
scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();
    e.stopPropagation();

    const args = {
        radius: parseFloat(e.target.value),
    }

    gaussian.set(args);
    legacy.set(args);

}, dom.radius);

// Set the filter opacity (both filters)
scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();
    e.stopPropagation();

    const args = {
        opacity: parseFloat(e.target.value),
    }

    gaussian.set(args);
    legacy.set(args);

}, dom.opacity);


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
