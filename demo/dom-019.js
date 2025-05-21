// # Demo DOM 019
// Screen Capture API - apply a filter to a browser web page

// [Run code](../../demo/dom-019.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create demo filters
scrawl.makeFilter({

    name: name('grayscale'),
    method: 'grayscale',

}).clone({

    name: name('sepia'),
    method: 'sepia',

}).clone({

    name: name('invert'),
    method: 'invert',

}).clone({

    name: name('red'),
    method: 'red',
});

scrawl.makeFilter({

    name: name('pixelate'),
    method: 'pixelate',
    tileWidth: 4,
    tileHeight: 4,
});

scrawl.makeFilter({

    name: name('background-blur'),
    method: 'gaussianBlur',
    radius: 2,
});

// ##### Import and use stream capture
let myBackground;

// Capture the media stream
// + Function invoked when user clicks a button (set up below)
const requestScreenCapture = () => {

    console.log('attempting to capture screen');

    scrawl.importScreenCapture({
        name: name('my-screen-capture'),
        audio: {
            suppressLocalAudioPlayback: true,
        },
    })
    .then(mycamera => {

        dom.screen_request_button.setAttribute('disabled', '');

        // Take the media stream and display it in our canvas element
        myBackground = scrawl.makePicture({

            name: name('background'),
            asset: mycamera.name,
            order: 2,

            dimensions: ['100%', '100%'],
            copyDimensions: ['100%', '100%'],
        });

        console.log('screen capture should be working');
    })
    .catch(err => {

        console.log(err.message);
        dom.screen_request_button.removeAttribute('disabled');
    });
};


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const dom = scrawl.initializeDomInputs([
    ['select', 'backgroundFilter', 0],
    ['button', 'screen_request_button', 'Request screen capture'],
]);


// Event listeners
scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        e.preventDefault();
        e.returnValue = false;

        if (myBackground) {

            const val = e.target.value;

            myBackground.clearFilters();

            if (val) myBackground.addFilters(name(val));
        }
    }
}, dom.backgroundFilter);


// Attach the screen capture function to the button
scrawl.addNativeListener('click', requestScreenCapture, dom.screen_request_button);


// #### Development and testing
console.log(scrawl.library);
