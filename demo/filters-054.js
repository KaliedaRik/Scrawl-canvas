// # Demo Filters 054 
// SVG-based filter example: duotone

// [Run code](../../demo/filters-054.html)
import scrawl from '../source/scrawl.js';

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
let feFuncR = document.querySelector('feFuncR'),
    feFuncG = document.querySelector('feFuncG'),
    feFuncB = document.querySelector('feFuncB');


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}

<filter id="svg-duotone">
  <feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"></feColorMatrix>

  <feComponentTransfer color-interpolation-filters="sRGB">
    <feFuncR type="discrete" tableValues="${feFuncR.getAttribute('tableValues')}" />
    <feFuncG type="discrete" tableValues="${feFuncG.getAttribute('tableValues')}" />
    <feFuncB type="discrete" tableValues="${feFuncB.getAttribute('tableValues')}" />
  </feComponentTransfer>
</filter>`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
let r1 = document.querySelector('#r1'),
    r2 = document.querySelector('#r2');

let g1 = document.querySelector('#g1'),
    g2 = document.querySelector('#g2');

let b1 = document.querySelector('#b1'),
    b2 = document.querySelector('#b2');

r1.value = 0.996;
r2.value = 0.984;
g1.value = 0.125;
g2.value = 0.941;
b1.value = 0.552;
b2.value = 0.478;

// Setup form functionality
let updateR = () => feFuncR.setAttribute('tableValues', `${r1.value} ${r2.value}`);
scrawl.addNativeListener(['input', 'change'], updateR, '.feFuncR');

let updateG = () => feFuncG.setAttribute('tableValues', `${g1.value} ${g2.value}`);
scrawl.addNativeListener(['input', 'change'], updateG, '.feFuncG');

let updateB = () => feFuncB.setAttribute('tableValues', `${b1.value} ${b2.value}`);
scrawl.addNativeListener(['input', 'change'], updateB, '.feFuncB');


// #### Development and testing
console.log(scrawl.library);
