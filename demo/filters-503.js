// # Demo Filters 503
// SVG-based filter example: posterize

// [Run code](../../demo/filters-503.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


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

    filter: 'url(#svg-posterize)',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
<filter id="svg-posterize">
  <feComponentTransfer>
    <feFuncR type="discrete" tableValues="${dom.r1.value} ${dom.r2.value} ${dom.r3.value} ${dom.r4.value}" />
    <feFuncG type="discrete" tableValues="${dom.g1.value} ${dom.g2.value} ${dom.g3.value} ${dom.g4.value}" />
    <feFuncB type="discrete" tableValues="${dom.b1.value} ${dom.b2.value} ${dom.b3.value} ${dom.b4.value}" />
  </feComponentTransfer>
</filter>`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const dom = scrawl.initializeDomInputs([
    ['input', 'r1', '0.1'],
    ['input', 'r2', '0.4'],
    ['input', 'r3', '0.7'],
    ['input', 'r4', '1'],
    ['input', 'g1', '0.1'],
    ['input', 'g2', '0.4'],
    ['input', 'g3', '0.7'],
    ['input', 'g4', '1'],
    ['input', 'b1', '0.1'],
    ['input', 'b2', '0.4'],
    ['input', 'b3', '0.7'],
    ['input', 'b4', '1'],
    ['element', 'feFuncR'],
    ['element', 'feFuncG'],
    ['element', 'feFuncB'],
]);


// Setup form functionality
const updateR = () => dom.feFuncR.setAttribute('tableValues', `${dom.r1.value} ${dom.r2.value} ${dom.r3.value} ${dom.r4.value}`);
scrawl.addNativeListener(['input', 'change'], updateR, '.feFuncR');

const updateG = () => dom.feFuncG.setAttribute('tableValues', `${dom.g1.value} ${dom.g2.value} ${dom.g3.value} ${dom.g4.value}`);
scrawl.addNativeListener(['input', 'change'], updateG, '.feFuncG');

const updateB = () => dom.feFuncB.setAttribute('tableValues', `${dom.b1.value} ${dom.b2.value} ${dom.b3.value} ${dom.b4.value}`);
scrawl.addNativeListener(['input', 'change'], updateB, '.feFuncB');


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
