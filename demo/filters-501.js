// # Demo Filters 501 
// Canvas engine filter strings (based on CSS filters)

// [Run code](../../demo/filters-501.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the target entitys
const piccy = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',
});

const text = scrawl.makePhrase({

    name: 'demo-text',
    text: 'Hello world',
    font: 'bold 70px sans-serif',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    lineHeight: 0.5,
    fillStyle: 'aliceblue',
    strokeStyle: 'red',
    lineWidth: 3,
    method: 'fillThenDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// No additional work required in the Javascript file to create the CSS filters; these are defined as Strings in the HTML select &lt;option> elements, and will be set on the target entitys as part of the form control user interaction below.
// 
// ```
// <select class="controlItem" id="filter">
//     <option value="none">none</option>
//     <option value="blur(6px)">blur(6px)</option>
//     <option value="brightness(0.4)">brightness(0.4)</option>
//     <option value="contrast(200%)">contrast(200%)</option>
//     <option value="drop-shadow(4px 4px 4px blue)">drop-shadow(4px 4px 4px blue)</option>
//     <option value="grayscale(100%)">grayscale(100%)</option>
//     <option value="hue-rotate(90deg)">hue-rotate(90deg)</option>
//     <option value="invert(75%)">invert(75%)</option>
//     <option value="opacity(25%)">opacity(25%)</option>
//     <option value="saturate(30%)">saturate(30%)</option>
//     <option value="sepia(100%)">sepia(100%)</option>
// </select>
// ```

let filterTarget = piccy,
    filterString = 'none';

// Setup form functionality
let updateTarget = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

    if (val) {

        piccy.set({ filter: 'none'});
        text.set({ filter: 'none'});
        canvas.setBase({ filter: 'none'});

        if (val === 'picture') filterTarget = piccy;
// @ts-expect-error
        else if (val === 'phrase') filterTarget = text;
        else if (val === 'cell') filterTarget = canvas.base;

        filterTarget.set({ filter: filterString });
    }
};
scrawl.addNativeListener(['input', 'change'], updateTarget, '#target');

let updateFilter = (e) => {

    e.preventDefault();
    e.returnValue = false;

    if (e.target && e.target.value) {

        filterString = e.target.value;
        filterTarget.set({ filter: filterString });
    }
};
scrawl.addNativeListener(['input', 'change'], updateFilter, '#filter');

// @ts-expect-error
document.querySelector('#filter').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#target').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
