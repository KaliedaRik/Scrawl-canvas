// # Demo Filters 505
// SVG-based filter example: noise

// [Run code](../../demo/filters-505.html)
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

    filter: 'url(#svg-noise)',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
<filter id="svg-noise">
    <feTurbulence
        type="fractalNoise"
        baseFrequency="${dom.bfx.value} ${dom.bfy.value}"
        result="NOISE"
        numOctaves="${dom.octaves.value}"
    />
    <feDisplacementMap
        in="SourceGraphic"
        in2="NOISE"
        scale="${dom.scale.value}"
        xChannelSelector="${dom.xChannelSelector.value}"
        yChannelSelector="${dom.yChannelSelector.value}"
    ></feDisplacementMap>
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
    ['input', 'bfx', '0.01'],
    ['input', 'bfy', '0.04'],
    ['input', 'octaves', '2'],
    ['input', 'scale', '20'],
    ['select', 'xChannelSelector', 0],
    ['select', 'yChannelSelector', 0],
    ['element', 'feTurbulence'],
    ['element', 'feDisplacementMap'],
]);


const baseFrequency = () => dom.feTurbulence.setAttribute('baseFrequency', `${dom.bfx.value} ${dom.bfy.value}`);
scrawl.addNativeListener(['input', 'change'], baseFrequency, '.baseFreq');

const numOctaves = () => dom.feTurbulence.setAttribute('numOctaves', dom.octaves.value);
scrawl.addNativeListener(['input', 'change'], numOctaves, dom.octaves);

const dmScale = () => dom.feDisplacementMap.setAttribute('scale', dom.scale.value);
scrawl.addNativeListener(['input', 'change'], dmScale, dom.scale);

const dmX = () => dom.feDisplacementMap.setAttribute('xChannelSelector', dom.xChannelSelector.value);
scrawl.addNativeListener(['input', 'change'], dmX, dom.xChannelSelector);

const dmY = () => dom.feDisplacementMap.setAttribute('yChannelSelector', dom.yChannelSelector.value);
scrawl.addNativeListener(['input', 'change'], dmY, dom.yChannelSelector);


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
