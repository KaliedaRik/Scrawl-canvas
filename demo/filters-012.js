// # Demo Filters 012 
// Filter parameters: matrix, matrix5

// [Run code](../../demo/filters-012.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


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

// @ts-expect-error
    return `    matrix3 weights array: ${matrix3.weights}\n    matrix5 weights array: ${matrix5.weights}    \n    Opacity: ${opacity.value}`;
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
// @ts-expect-error
            filters: [selector.value],
        });
    }
}();
scrawl.addNativeListener(['input', 'change'], changeMatrix, '#selectMatrix');

const updateWeights = function () {

    let weights3, weights5;

    return function () {

// @ts-expect-error
        weights3 = [parseFloat(m22.value), parseFloat(m23.value), parseFloat(m24.value), 
// @ts-expect-error
                    parseFloat(m32.value), parseFloat(m33.value), parseFloat(m34.value), 
// @ts-expect-error
                    parseFloat(m42.value), parseFloat(m43.value), parseFloat(m44.value)];

// @ts-expect-error
        weights5 = [parseFloat(m11.value), parseFloat(m12.value), parseFloat(m13.value), parseFloat(m14.value), parseFloat(m15.value), 
// @ts-expect-error
                    parseFloat(m21.value), parseFloat(m22.value), parseFloat(m23.value), parseFloat(m24.value), parseFloat(m25.value), 
// @ts-expect-error
                    parseFloat(m31.value), parseFloat(m32.value), parseFloat(m33.value), parseFloat(m34.value), parseFloat(m35.value), 
// @ts-expect-error
                    parseFloat(m41.value), parseFloat(m42.value), parseFloat(m43.value), parseFloat(m44.value), parseFloat(m45.value), 
// @ts-expect-error
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

scrawl.makeUpdater({

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

scrawl.makeUpdater({

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

// @ts-expect-error
m11.value = 0;
// @ts-expect-error
m12.value = 0;
// @ts-expect-error
m13.value = 0;
// @ts-expect-error
m14.value = 0;
// @ts-expect-error
m15.value = 0;
// @ts-expect-error
m21.value = 0;
// @ts-expect-error
m22.value = 0;
// @ts-expect-error
m23.value = 0;
// @ts-expect-error
m24.value = 0;
// @ts-expect-error
m25.value = 0;
// @ts-expect-error
m31.value = 0;
// @ts-expect-error
m32.value = 0;
// @ts-expect-error
m33.value = 1;
// @ts-expect-error
m34.value = 0;
// @ts-expect-error
m35.value = 0;
// @ts-expect-error
m41.value = 0;
// @ts-expect-error
m42.value = 0;
// @ts-expect-error
m43.value = 0;
// @ts-expect-error
m44.value = 0;
// @ts-expect-error
m45.value = 0;
// @ts-expect-error
m51.value = 0;
// @ts-expect-error
m52.value = 0;
// @ts-expect-error
m53.value = 0;
// @ts-expect-error
m54.value = 0;
// @ts-expect-error
m55.value = 0;
// @ts-expect-error
opacity.value = 1;

// @ts-expect-error
document.querySelector('#selectMatrix').value = 'matrix3';
// @ts-expect-error
document.querySelector('#includeRed').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeGreen').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeBlue').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeAlpha').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#memoizeFilterOutput').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', target);


// #### Development and testing
console.log(scrawl.library);
