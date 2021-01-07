// # Demo Filters 055 
// SVG-based filter example: noise

// [Run code](../../demo/filters-055.html)
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

bfx.value = 0.01;
bfy.value = 0.04;
octaves.value = 2;
scale.value = 20;
xChannelSelector.options.selectedIndex = 0;
yChannelSelector.options.selectedIndex = 0;


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

<filter id="svg-noise">
  <feTurbulence type="fractalNoise" baseFrequency="${bfx.value} ${bfy.value}" result="NOISE" numOctaves="${octaves.value}" />
  <feDisplacementMap in="SourceGraphic" in2="NOISE" scale="${scale.value}" xChannelSelector="${xChannelSelector.value}" yChannelSelector="${yChannelSelector.value}"></feDisplacementMap>
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
// Setup form functionality
let baseFrequency = () => feTurbulence.setAttribute('baseFrequency', `${bfx.value} ${bfy.value}`);
scrawl.addNativeListener(['input', 'change'], baseFrequency, '.baseFreq');

let numOctaves = () => feTurbulence.setAttribute('numOctaves', octaves.value);
scrawl.addNativeListener(['input', 'change'], numOctaves, '#octaves');

let dmScale = () => feDisplacementMap.setAttribute('scale', scale.value);
scrawl.addNativeListener(['input', 'change'], dmScale, '#scale');

let dmX = () => feDisplacementMap.setAttribute('xChannelSelector', xChannelSelector.value);
scrawl.addNativeListener(['input', 'change'], dmX, '#xChannelSelector');

let dmY = () => feDisplacementMap.setAttribute('yChannelSelector', yChannelSelector.value);
scrawl.addNativeListener(['input', 'change'], dmY, '#yChannelSelector');


// #### Development and testing
console.log(scrawl.library);
