// # Demo Filters 503 
// SVG-based filter example: posterize

// [Run code](../../demo/filters-503.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


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

    filter: 'url(#svg-posterize)',
});


// #### SVG filter
// We create the filter in the HTML script, not here:
// ```
// <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//   <filter id="svg-posterize">
//     <feComponentTransfer>
//       <feFuncR type="discrete" tableValues=".1 .4 .7 1" />
//       <feFuncG type="discrete" tableValues=".1 .4 .7 1" />
//       <feFuncB type="discrete" tableValues=".1 .4 .7 1" />
//     </feComponentTransfer>
//   </filter>
// </svg>
// ```
let feFuncR = document.querySelector('feFuncR'),
    feFuncG = document.querySelector('feFuncG'),
    feFuncB = document.querySelector('feFuncB');


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const tableValuesR = feFuncR.getAttribute('tableValues'),
        tableValuesG = feFuncG.getAttribute('tableValues'),
        tableValuesB = feFuncB.getAttribute('tableValues');

    return `
<filter id="svg-posterize">
  <feComponentTransfer>
    <feFuncR type="discrete" tableValues="${tableValuesR}" />
    <feFuncG type="discrete" tableValues="${tableValuesG}" />
    <feFuncB type="discrete" tableValues="${tableValuesB}" />
  </feComponentTransfer>
</filter>`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
let r1 = document.querySelector('#r1'),
    r2 = document.querySelector('#r2'),
    r3 = document.querySelector('#r3'),
    r4 = document.querySelector('#r4');

let g1 = document.querySelector('#g1'),
    g2 = document.querySelector('#g2'),
    g3 = document.querySelector('#g3'),
    g4 = document.querySelector('#g4');

let b1 = document.querySelector('#b1'),
    b2 = document.querySelector('#b2'),
    b3 = document.querySelector('#b3'),
    b4 = document.querySelector('#b4');

// @ts-expect-error
r1.value = 0.1;
// @ts-expect-error
r2.value = 0.4;
// @ts-expect-error
r3.value = 0.7;
// @ts-expect-error
r4.value = 1;
// @ts-expect-error
g1.value = 0.1;
// @ts-expect-error
g2.value = 0.4;
// @ts-expect-error
g3.value = 0.7;
// @ts-expect-error
g4.value = 1;
// @ts-expect-error
b1.value = 0.1;
// @ts-expect-error
b2.value = 0.4;
// @ts-expect-error
b3.value = 0.7;
// @ts-expect-error
b4.value = 1;

// Setup form functionality
// @ts-expect-error
let updateR = () => feFuncR.setAttribute('tableValues', `${r1.value} ${r2.value} ${r3.value} ${r4.value}`);
scrawl.addNativeListener(['input', 'change'], updateR, '.feFuncR');

// @ts-expect-error
let updateG = () => feFuncG.setAttribute('tableValues', `${g1.value} ${g2.value} ${g3.value} ${g4.value}`);
scrawl.addNativeListener(['input', 'change'], updateG, '.feFuncG');

// @ts-expect-error
let updateB = () => feFuncB.setAttribute('tableValues', `${b1.value} ${b2.value} ${b3.value} ${b4.value}`);
scrawl.addNativeListener(['input', 'change'], updateB, '.feFuncB');


// #### Development and testing
console.log(scrawl.library);
