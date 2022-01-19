// # Demo Filters 001
// Parameters for: Blur, Gaussianblur filters; filter memoization

// [Run code](../../demo/filters-001.html)
import {
    addNativeListener,
    importDomImage,
    library as L,
    makeFilter,
    makePicture,
    makeRender,
    observeAndUpdate,
    setIgnorePixelRatio,
} from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
setIgnorePixelRatio(false);


// #### Scene setup
const canvas = L.canvas.mycanvas;

canvas.set({
    css: {
      display: 'inline-block',
    },
}).setBase({
    compileOrder: 1,
});

importDomImage('.flowers');


// Create the filters
const blurFilters = {

    blurFilter: makeFilter({

        name: 'blur',
        method: 'blur',
        radius: 10,
        includeAlpha: false,
        passes: 1,
        step: 1,
    }),

    gaussianBlurFilter: makeFilter({

        name: 'gaussian-blur',
        method: 'gaussianBlur',
        radius: 10,
    }),
}


// Create the target entity
const piccy = makePicture({

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['gaussian-blur'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    Radius: ${radius.value}, Step: ${step.value}, Passes: ${passes.value}
    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: blurFilters.blurFilter,

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

        memoizeFilterOutput: ['memoizeFilterOutput', 'boolean'],
    },
});

addNativeListener(['update', 'change'], (e) => {

    e.preventDefault();
    e.stopPropagation();

    piccy.set({
        filters: [blurFilters[e.target.value].name],
    })

}, '#blurFilter');

observeAndUpdate({

    event: ['input', 'change'],
    origin: '#memoizeFilterOutput',

    target: piccy,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        memoizeFilterOutput: ['memoizeFilterOutput', 'boolean'],
    },
});

addNativeListener(['update', 'change'], (e) => {

    e.preventDefault();
    e.stopPropagation();

    const args = {
        radius: parseFloat(e.target.value),
    }

    blurFilters.blurFilter.set(args);
    blurFilters.gaussianBlurFilter.set(args);

}, '#radius');

addNativeListener(['update', 'change'], (e) => {

    e.preventDefault();
    e.stopPropagation();

    const args = {
        opacity: parseFloat(e.target.value),
    }

    blurFilters.blurFilter.set(args);
    blurFilters.gaussianBlurFilter.set(args);

}, '#opacity');

// Setup form
const radius = document.querySelector('#radius');
const passes = document.querySelector('#passes');
const step = document.querySelector('#step');
const opacity = document.querySelector('#opacity');

radius.value = 10;
passes.value = 1;
step.value = 1;
opacity.value = 1;

document.querySelector('#blurFilter').options.selectedIndex = 1;
document.querySelector('#includeRed').options.selectedIndex = 1;
document.querySelector('#includeGreen').options.selectedIndex = 1;
document.querySelector('#includeBlue').options.selectedIndex = 1;
document.querySelector('#includeAlpha').options.selectedIndex = 0;
document.querySelector('#processHorizontal').options.selectedIndex = 1;
document.querySelector('#processVertical').options.selectedIndex = 1;
document.querySelector('#excludeTransparentPixels').options.selectedIndex = 1;
document.querySelector('#memoizeFilterOutput').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(L);
