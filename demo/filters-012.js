// # Demo Filters 012 
// SVG-based filter example: gaussian blur

// [Run code](../../demo/filters-012.html)
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

    filter: 'url(#svg-blur)',
});


// #### SVG filter
// We create the filter in the HTML script, not here:
// ```
// <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
//   <filter id="svg-blur">
//     <feGaussianBlur in="SourceGraphic" stdDeviation="5" edgeMode="duplicate" />
//   </filter>
// </svg>
// ```
let feGaussianBlur = document.querySelector('feGaussianBlur');


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

<filter id="svg-blur">
  <feGaussianBlur in="SourceGraphic" stdDeviation="${feGaussianBlur.getAttribute('stdDeviation')}" edgeMode="${feGaussianBlur.getAttribute('edgeMode')}" />
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
let updateStdDeviation = (e) => {

    e.preventDefault();
    e.returnValue = false;

    feGaussianBlur.setAttribute('stdDeviation', parseFloat(e.target.value));
};
scrawl.addNativeListener(['input', 'change'], updateStdDeviation, '#stdDeviation');

let updateEdgeMode = (e) => {

    e.preventDefault();
    e.returnValue = false;

    feGaussianBlur.setAttribute(`edgeMode`, e.target.value);
};
scrawl.addNativeListener(['input', 'change'], updateEdgeMode, '#edgeMode');

document.querySelector('#stdDeviation').value = 5;
document.querySelector('#edgeMode').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
