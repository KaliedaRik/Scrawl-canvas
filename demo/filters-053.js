// # Demo Filters 053 
// SVG-based filter example: posterize

// [Run code](../../demo/filters-053.html)
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
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}

<filter id="svg-posterize">
  <feComponentTransfer>
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

r1.value = 0.1;
r2.value = 0.4;
r3.value = 0.7;
r4.value = 1;
g1.value = 0.1;
g2.value = 0.4;
g3.value = 0.7;
g4.value = 1;
b1.value = 0.1;
b2.value = 0.4;
b3.value = 0.7;
b4.value = 1;

// Setup form functionality
let updateR = () => feFuncR.setAttribute('tableValues', `${r1.value} ${r2.value} ${r3.value} ${r4.value}`);
scrawl.addNativeListener(['input', 'change'], updateR, '.feFuncR');

let updateG = () => feFuncG.setAttribute('tableValues', `${g1.value} ${g2.value} ${g3.value} ${g4.value}`);
scrawl.addNativeListener(['input', 'change'], updateG, '.feFuncG');

let updateB = () => feFuncB.setAttribute('tableValues', `${b1.value} ${b2.value} ${b3.value} ${b4.value}`);
scrawl.addNativeListener(['input', 'change'], updateB, '.feFuncB');


// #### Development and testing
console.log(scrawl.library);
