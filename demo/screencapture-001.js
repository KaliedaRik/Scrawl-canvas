// # Demo Screencapture 001
// MediaPipe Selfie Segmentation - model image output

// [Run code](../../demo/screencapture-001.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;


scrawl.makeFilter({
    name: 'grayscale',
    method: 'grayscale',
}).clone({
    name: 'sepia',
    method: 'sepia',
}).clone({
    name: 'invert',
    method: 'invert',
}).clone({
    name: 'red',
    method: 'red',
});

scrawl.makeFilter({
    name: 'pixelate',
    method: 'pixelate',
    tileWidth: 4,
    tileHeight: 4,
});

scrawl.makeFilter({
    name: 'background-blur',
    method: 'gaussianBlur',
    radius: 2,
});

// ##### Import and use stream capture
let myBackground;

// Capture the media stream
scrawl.importScreenCapture({
    name: 'my-screen-capture',
})
.then(mycamera => {

    // Take the media stream and display it in our canvas element
    myBackground = scrawl.makePicture({

        name: 'background',
        asset: mycamera.name,
        order: 2,

        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],
    });
})
.catch(err => console.log(err.message));


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Event listeners
scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();
    e.returnValue = false;

    if (e && e.target) {

        const id = e.target.id,
            val = e.target.value;

        if (myBackground && 'backgroundFilter' === id) {

            myBackground.clearFilters();

            if (val) myBackground.addFilters(val);
        }
    }
}, '.controlItem');

// Set DOM form initial input values
// @ts-expect-error
document.querySelector('#backgroundFilter').value = '';
// @ts-expect-error
document.querySelector('#outlineFilter').value = '1';


// #### Development and testing
console.log(scrawl.library);

