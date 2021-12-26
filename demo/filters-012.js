// # Demo Filters 012 
// Filter parameters: matrix, matrix5

// [Run code](../../demo/filters-012.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filters
const matrix3 = scrawl.makeFilter({

    name: 'matrix3',
    method: 'matrix',

    weights: [0, 0, 0, 0, 1, 0, 0, 0, 0],
});

const matrix5 = scrawl.makeFilter({

    name: 'matrix5',
    method: 'matrix5',

    weights: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
});


// Create the target entity
const target = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['matrix3'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    matrix3 weights array: ${matrix3.weights}
    matrix5 weights array: ${matrix5.weights}
    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
const changeMatrix = function () {

    const selector = document.querySelector('#selectMatrix');

    return function () {

        target.set({
            filters: [selector.value],
        });
    }
}();
scrawl.addNativeListener(['input', 'change'], changeMatrix, '#selectMatrix');

const updateWeights = function () {

    let weights3, weights5;

    return function () {

        weights3 = [parseFloat(m22.value), parseFloat(m23.value), parseFloat(m24.value), 
                    parseFloat(m32.value), parseFloat(m33.value), parseFloat(m34.value), 
                    parseFloat(m42.value), parseFloat(m43.value), parseFloat(m44.value)];

        weights5 = [parseFloat(m11.value), parseFloat(m12.value), parseFloat(m13.value), parseFloat(m14.value), parseFloat(m15.value), 
                    parseFloat(m21.value), parseFloat(m22.value), parseFloat(m23.value), parseFloat(m24.value), parseFloat(m25.value), 
                    parseFloat(m31.value), parseFloat(m32.value), parseFloat(m33.value), parseFloat(m34.value), parseFloat(m35.value), 
                    parseFloat(m41.value), parseFloat(m42.value), parseFloat(m43.value), parseFloat(m44.value), parseFloat(m45.value), 
                    parseFloat(m51.value), parseFloat(m52.value), parseFloat(m53.value), parseFloat(m54.value), parseFloat(m55.value)];

        matrix3.set({
            weights: weights3,
        });

        matrix5.set({
            weights: weights5,
        });
    }
}();
scrawl.addNativeListener(['input', 'change'], updateWeights, '.weight');

scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = (e.target.value === '0') ? false : true;

    target.set({ memoizeFilterOutput: val });

}, '#memoizeFilterOutput');

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: matrix3,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],

        opacity: ['opacity', 'float'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: matrix5,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],

        opacity: ['opacity', 'float'],
    },
});

// Setup form
const m11 = document.querySelector('#m11'),
    m12 = document.querySelector('#m12'),
    m13 = document.querySelector('#m13'),
    m14 = document.querySelector('#m14'),
    m15 = document.querySelector('#m15'),
    m21 = document.querySelector('#m21'),
    m22 = document.querySelector('#m22'),
    m23 = document.querySelector('#m23'),
    m24 = document.querySelector('#m24'),
    m25 = document.querySelector('#m25'),
    m31 = document.querySelector('#m31'),
    m32 = document.querySelector('#m32'),
    m33 = document.querySelector('#m33'),
    m34 = document.querySelector('#m34'),
    m35 = document.querySelector('#m35'),
    m41 = document.querySelector('#m41'),
    m42 = document.querySelector('#m42'),
    m43 = document.querySelector('#m43'),
    m44 = document.querySelector('#m44'),
    m45 = document.querySelector('#m45'),
    m51 = document.querySelector('#m51'),
    m52 = document.querySelector('#m52'),
    m53 = document.querySelector('#m53'),
    m54 = document.querySelector('#m54'),
    m55 = document.querySelector('#m55'),
    opacity = document.querySelector('#opacity');

m11.value = 0;
m12.value = 0;
m13.value = 0;
m14.value = 0;
m15.value = 0;
m21.value = 0;
m22.value = 0;
m23.value = 0;
m24.value = 0;
m25.value = 0;
m31.value = 0;
m32.value = 0;
m33.value = 1;
m34.value = 0;
m35.value = 0;
m41.value = 0;
m42.value = 0;
m43.value = 0;
m44.value = 0;
m45.value = 0;
m51.value = 0;
m52.value = 0;
m53.value = 0;
m54.value = 0;
m55.value = 0;
opacity.value = 1;

document.querySelector('#selectMatrix').value = 'matrix3';
document.querySelector('#includeRed').options.selectedIndex = 1;
document.querySelector('#includeGreen').options.selectedIndex = 1;
document.querySelector('#includeBlue').options.selectedIndex = 1;
document.querySelector('#includeAlpha').options.selectedIndex = 0;
document.querySelector('#memoizeFilterOutput').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', target);


// #### Development and testing
console.log(scrawl.library);
