// # Demo Filters 502 
// SVG-based filter example: gaussian blur

// [Run code](../../demo/filters-502.html)
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
const feGaussianBlur = document.querySelector('feGaussianBlur');


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const stdDeviation = feGaussianBlur.getAttribute('stdDeviation'),
        edgeMode = feGaussianBlur.getAttribute('edgeMode');

    return `
<filter id="svg-blur">
  <feGaussianBlur in="SourceGraphic" stdDeviation="${stdDeviation}" edgeMode="${edgeMode}" />
</filter>`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form functionality
const updateStdDeviation = (e) => {

    e.preventDefault();
    e.returnValue = false;

    feGaussianBlur.setAttribute('stdDeviation', e.target.value);
};
scrawl.addNativeListener(['input', 'change'], updateStdDeviation, '#stdDeviation');

const updateEdgeMode = (e) => {

    e.preventDefault();
    e.returnValue = false;

    feGaussianBlur.setAttribute(`edgeMode`, e.target.value);
};
scrawl.addNativeListener(['input', 'change'], updateEdgeMode, '#edgeMode');

// @ts-expect-error
document.querySelector('#stdDeviation').value = 5;
// @ts-expect-error
document.querySelector('#edgeMode').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
