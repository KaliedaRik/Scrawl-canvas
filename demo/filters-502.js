// # Demo Filters 502
// SVG-based filter example: gaussian blur

// [Run code](../../demo/filters-502.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filter: 'url(#svg-blur)',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
<filter id="svg-blur">
  <feGaussianBlur in="SourceGraphic" stdDeviation="${dom.stdDeviation.value}" edgeMode="${dom.edgeMode.value}" />
</filter>`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const dom = initializeDomInputs([
    ['input', 'stdDeviation', '5'],
    ['select', 'edgeMode', 0],
    ['element', 'feGaussianBlur'],
]);


const updateStdDeviation = (e) => {

    e.preventDefault();
    e.returnValue = false;

    dom.feGaussianBlur.setAttribute('stdDeviation', e.target.value);
};
scrawl.addNativeListener(['input', 'change'], updateStdDeviation, dom.stdDeviation);


const updateEdgeMode = (e) => {

    e.preventDefault();
    e.returnValue = false;

    dom.feGaussianBlur.setAttribute(`edgeMode`, e.target.value);
};
scrawl.addNativeListener(['input', 'change'], updateEdgeMode, dom.edgeMode);


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
