// # Demo Filters 012
// Filter parameters: matrix, matrix5

// [Run code](../../demo/filters-012.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filters
const matrix3 = scrawl.makeFilter({

    name: name('matrix3'),
    method: 'matrix',
    weights: [1, 0, 0, 0, 0.7, 0, 0, 0, -1],
});

const matrix5 = scrawl.makeFilter({

    name: name('matrix5'),
    method: 'matrix5',
    weights: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0],
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('matrix3')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const [x3, x5] = getWeightsFromInput();

    return `
    matrix3 weights array: ${x3.join(', ')}
    matrix5 weights array: ${x5.join(', ')}
    Opacity: ${dom.opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form
const dom = scrawl.initializeDomInputs([
    ['input', 'm11', '0'],
    ['input', 'm12', '0'],
    ['input', 'm13', '0'],
    ['input', 'm14', '0'],
    ['input', 'm15', '0'],
    ['input', 'm21', '0'],
    ['input', 'm22', '1'],
    ['input', 'm23', '0'],
    ['input', 'm24', '0'],
    ['input', 'm25', '0'],
    ['input', 'm31', '0'],
    ['input', 'm32', '0'],
    ['input', 'm33', '0.7'],
    ['input', 'm34', '0'],
    ['input', 'm35', '0'],
    ['input', 'm41', '0'],
    ['input', 'm42', '0'],
    ['input', 'm43', '0'],
    ['input', 'm44', '-1'],
    ['input', 'm45', '0'],
    ['input', 'm51', '0'],
    ['input', 'm52', '0'],
    ['input', 'm53', '0'],
    ['input', 'm54', '0'],
    ['input', 'm55', '0'],
    ['input', 'opacity', '1'],
    ['select', 'selectMatrix', 0],
    ['select', 'includeRed', 1],
    ['select', 'includeBlue', 1],
    ['select', 'includeGreen', 1],
    ['select', 'includeAlpha', 0],
    ['select', 'premultiply', 0],
    ['select', 'useInputAsMask', 0],
    ['select', 'memoizeFilterOutput', 0],
]);

const getWeightsFromInput = () => {

    const val = (v) => parseFloat(v);

    const x3 = [
        val(dom.m22.value), val(dom.m23.value), val(dom.m24.value),
        val(dom.m32.value), val(dom.m33.value), val(dom.m34.value),
        val(dom.m42.value), val(dom.m43.value), val(dom.m44.value),
    ];

    const x5 = [
        val(dom.m11.value), val(dom.m12.value), val(dom.m13.value), val(dom.m14.value), val(dom.m15.value),
        val(dom.m21.value), val(dom.m22.value), val(dom.m23.value), val(dom.m24.value), val(dom.m25.value),
        val(dom.m31.value), val(dom.m32.value), val(dom.m33.value), val(dom.m34.value), val(dom.m35.value),
        val(dom.m41.value), val(dom.m42.value), val(dom.m43.value), val(dom.m44.value), val(dom.m45.value),
        val(dom.m51.value), val(dom.m52.value), val(dom.m53.value), val(dom.m54.value), val(dom.m55.value),
    ];

    return [x3, x5];
};


// Manage entity updates
const changeMatrix = () => {

    piccy.clearFilters();
    piccy.addFilters(name(dom.selectMatrix.value));
};
scrawl.addNativeListener(['input', 'change'], changeMatrix, '#selectMatrix');

const memoize = () => {

    piccy.set({
        memoizeFilterOutput: dom.memoizeFilterOutput.value === '0' ? false : true,
    });
};
scrawl.addNativeListener(['input', 'change'], memoize, '#memoizeFilterOutput');


// Manage filter updates
const updateWeights = () => {

    const [x3, x5] = getWeightsFromInput();

    matrix3.set({ weights: x3 });
    matrix5.set({ weights: x5 });
};
scrawl.addNativeListener(['input', 'change'], updateWeights, '.weight-control');

const updateFilters = () => {

    const updates = {
        includeRed: dom.includeRed.value === '0' ? false : true,
        includeGreen: dom.includeGreen.value === '0' ? false : true,
        includeBlue: dom.includeBlue.value === '0' ? false : true,
        includeAlpha: dom.includeAlpha.value === '0' ? false : true,
        premultiply: dom.premultiply.value === '0' ? false : true,
        useInputAsMask: dom.useInputAsMask.value === '0' ? false : true,
        opacity: parseFloat(dom.opacity.value),
    };

    matrix3.set(updates);
    matrix5.set(updates);
};
scrawl.addNativeListener(['input', 'change'], updateFilters, '.filter-control');


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
