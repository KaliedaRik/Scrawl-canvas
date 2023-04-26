// # Demo Filters 010 
// Filter parameters: chroma

// [Run code](../../demo/filters-010.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
// + Chroma filters can have more than one range; each range array should be added to the `ranges` attribute
const myFilter = scrawl.makeFilter({

    name: 'chroma',
    method: 'chroma',

    ranges: [[0, 0, 0, 92, 127, 92]],
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['chroma'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    (Low color: ${lowCol.value}, High color: ${highCol.value})\n    Range: [${myFilter.ranges}] → [${myFilter.actions[0].ranges}]\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
const interpretColors = function () {

    const lowColor = document.querySelector('#lowColor');
    const highColor = document.querySelector('#highColor');

    return function () {

        myFilter.set({

// @ts-expect-error
            ranges: [[lowColor.value, highColor.value]],
        })
    }
}();
scrawl.addNativeListener(['input', 'change'], interpretColors, '.controlItem');

scrawl.addNativeListener(
    ['input', 'change'], 
    (e) => myFilter.set({ opacity: parseFloat(e.target.value) }), 
    '#opacity');


// Setup form
const lowCol = document.querySelector('#lowColor'),
    highCol = document.querySelector('#highColor'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
lowCol.value = '#000000';
// @ts-expect-error
highCol.value = '#5c7f5c';
// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
