// # Demo Filters 504 
// SVG-based filter example: duotone

// [Run code](../../demo/filters-504.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the target entity
scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filter: 'url(#svg-duotone)',
});


// #### SVG filter
// We create the filter in the HTML script, not here:
// ```
// <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//   <filter id="svg-duotone">
//     <feColorMatrix type="matrix" values=".33 .33 .33 0 0
//       .33 .33 .33 0 0
//       .33 .33 .33 0 0
//        0   0   0  1 0">
//     </feColorMatrix>

//     <feComponentTransfer color-interpolation-filters="sRGB">
//       <feFuncR type="table" tableValues=".996 0.984"></feFuncR>
//       <feFuncG type="table" tableValues=".125 0.941"></feFuncG>
//       <feFuncB type="table" tableValues=".552 0.478"></feFuncB>
//     </feComponentTransfer>
//   </filter>
// </svg>
// ```
const feFuncR = document.querySelector('feFuncR'),
    feFuncG = document.querySelector('feFuncG'),
    feFuncB = document.querySelector('feFuncB');


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const tableValuesR = feFuncR.getAttribute('tableValues'),
        tableValuesG = feFuncG.getAttribute('tableValues'),
        tableValuesB = feFuncB.getAttribute('tableValues');

    return `
<filter id="svg-duotone">
  <feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"></feColorMatrix>

  <feComponentTransfer color-interpolation-filters="sRGB">
    <feFuncR type="discrete" tableValues="${tableValuesR}" />
    <feFuncG type="discrete" tableValues="${tableValuesG}" />
    <feFuncB type="discrete" tableValues="${tableValuesB}" />
  </feComponentTransfer>
</filter>`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
const r1 = document.querySelector('#r1'),
    r2 = document.querySelector('#r2');

const g1 = document.querySelector('#g1'),
    g2 = document.querySelector('#g2');

const b1 = document.querySelector('#b1'),
    b2 = document.querySelector('#b2');

// @ts-expect-error
r1.value = 0.996;
// @ts-expect-error
r2.value = 0.984;
// @ts-expect-error
g1.value = 0.125;
// @ts-expect-error
g2.value = 0.941;
// @ts-expect-error
b1.value = 0.552;
// @ts-expect-error
b2.value = 0.478;

// Setup form functionality
// @ts-expect-error
const updateR = () => feFuncR.setAttribute('tableValues', `${r1.value} ${r2.value}`);
scrawl.addNativeListener(['input', 'change'], updateR, '.feFuncR');

// @ts-expect-error
const updateG = () => feFuncG.setAttribute('tableValues', `${g1.value} ${g2.value}`);
scrawl.addNativeListener(['input', 'change'], updateG, '.feFuncG');

// @ts-expect-error
const updateB = () => feFuncB.setAttribute('tableValues', `${b1.value} ${b2.value}`);
scrawl.addNativeListener(['input', 'change'], updateB, '.feFuncB');


// #### Development and testing
console.log(scrawl.library);
