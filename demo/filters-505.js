// # Demo Filters 505 
// SVG-based filter example: noise

// [Run code](../../demo/filters-505.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the target entity
const piccy = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filter: 'url(#svg-noise)',
});


// #### SVG filter
// We create the filter in the HTML script, not here:
// ```
// <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//   <filter id="svg-noise">
//     <feTurbulence type="fractalNoise" baseFrequency="0.01 0.04" result="NOISE" numOctaves="2" />
//     <feDisplacementMap in="SourceGraphic" in2="NOISE" scale="20" xChannelSelector="R" yChannelSelector="R"></feDisplacementMap>
//   </filter>
// </svg>
// ```
let bfx = document.querySelector('#bfx'),
    bfy = document.querySelector('#bfy'),
    octaves = document.querySelector('#octaves'),
    scale = document.querySelector('#scale'),
    xChannelSelector = document.querySelector('#xChannelSelector'),
    yChannelSelector = document.querySelector('#yChannelSelector'),
    feTurbulence = document.querySelector('feTurbulence'),
    feDisplacementMap = document.querySelector('feDisplacementMap');

// @ts-expect-error
bfx.value = 0.01;
// @ts-expect-error
bfy.value = 0.04;
// @ts-expect-error
octaves.value = 2;
// @ts-expect-error
scale.value = 20;
// @ts-expect-error
xChannelSelector.options.selectedIndex = 0;
// @ts-expect-error
yChannelSelector.options.selectedIndex = 0;


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `<filter id="svg-noise">\n  <feTurbulence type="fractalNoise" baseFrequency="${bfx.value} ${bfy.value}" result="NOISE" numOctaves="${octaves.value}" />\n  <feDisplacementMap in="SourceGraphic" in2="NOISE" scale="${scale.value}" xChannelSelector="${xChannelSelector.value}" yChannelSelector="${yChannelSelector.value}"></feDisplacementMap>\n</filter>`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form functionality
// @ts-expect-error
let baseFrequency = () => feTurbulence.setAttribute('baseFrequency', `${bfx.value} ${bfy.value}`);
scrawl.addNativeListener(['input', 'change'], baseFrequency, '.baseFreq');

// @ts-expect-error
let numOctaves = () => feTurbulence.setAttribute('numOctaves', octaves.value);
scrawl.addNativeListener(['input', 'change'], numOctaves, '#octaves');

// @ts-expect-error
let dmScale = () => feDisplacementMap.setAttribute('scale', scale.value);
scrawl.addNativeListener(['input', 'change'], dmScale, '#scale');

// @ts-expect-error
let dmX = () => feDisplacementMap.setAttribute('xChannelSelector', xChannelSelector.value);
scrawl.addNativeListener(['input', 'change'], dmX, '#xChannelSelector');

// @ts-expect-error
let dmY = () => feDisplacementMap.setAttribute('yChannelSelector', yChannelSelector.value);
scrawl.addNativeListener(['input', 'change'], dmY, '#yChannelSelector');


// #### Development and testing
console.log(scrawl.library);
