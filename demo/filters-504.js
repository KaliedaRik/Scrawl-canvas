// # Demo Filters 504
// SVG-based filter example: duotone

// [Run code](../../demo/filters-504.html)
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

    filter: 'url(#svg-duotone)',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
<filter id="svg-duotone">
  <feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"></feColorMatrix>

  <feComponentTransfer color-interpolation-filters="sRGB">
    <feFuncR type="discrete" tableValues="${dom.r1.value} ${dom.r2.value}" />
    <feFuncG type="discrete" tableValues="${dom.g1.value} ${dom.g2.value}" />
    <feFuncB type="discrete" tableValues="${dom.b1.value} ${dom.b2.value}" />
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
const dom = initializeDomInputs([
    ['input', 'r1', '0.996'],
    ['input', 'r2', '0.984'],
    ['input', 'g1', '0.125'],
    ['input', 'g2', '0.941'],
    ['input', 'b1', '0.552'],
    ['input', 'b2', '0.478'],
    ['element', 'feFuncR'],
    ['element', 'feFuncG'],
    ['element', 'feFuncB'],
]);


// Setup form functionality
const updateR = () => dom.feFuncR.setAttribute('tableValues', `${dom.r1.value} ${dom.r2.value}`);
scrawl.addNativeListener(['input', 'change'], updateR, '.feFuncR');

const updateG = () => dom.feFuncG.setAttribute('tableValues', `${dom.g1.value} ${dom.g2.value}`);
scrawl.addNativeListener(['input', 'change'], updateG, '.feFuncG');

const updateB = () => dom.feFuncB.setAttribute('tableValues', `${dom.b1.value} ${dom.b2.value}`);
scrawl.addNativeListener(['input', 'change'], updateB, '.feFuncB');

// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
