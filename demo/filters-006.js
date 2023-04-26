// # Demo Filters 006 
// Filter parameters: channelLevels

// [Run code](../../demo/filters-006.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'channelLevels',
    method: 'channelLevels',

    red: [50, 200],
    green: [60, 220, 150],
    blue: [40, 180],
    alpha: [],
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

    filters: ['channelLevels'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Red: [${red.value}]\n    Green: [${green.value}]\n    Blue: [${blue.value}]\n    Alpha: [${alpha.value}]\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.addNativeListener(
    ['input', 'change'], 
    (e) => {

        let a;

        if (e.target.id === 'opacity') a = e.target.value;
        else {

            let temp = e.target.value.split(',');
            a = [];

            temp.forEach(t => {
                let n = parseInt(t, 10);
                if (n.toFixed && !isNaN(n)) a.push(n)
            });
        }

        myFilter.set({ 
            [e.target.id]: a,
        });
    }, 
    '.controlItem');

// Setup form
const red = document.querySelector('#red'),
    green = document.querySelector('#green'),
    blue = document.querySelector('#blue'),
    alpha = document.querySelector('#alpha'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
red.value = '50, 200';
// @ts-expect-error
green.value = '60, 220, 150';
// @ts-expect-error
blue.value = '40, 180';
// @ts-expect-error
alpha.value = '';
// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
