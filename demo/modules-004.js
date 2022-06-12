// # Demo Modules 004
// Import and use Lottie animations
//
// Related files:
// + [Lottie loader module](./modules/lottie-loader.html)
//
// [Run code](../../demo/modules-004.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

// Import the Lottie loader module
import lottieLoader from './modules/lottie-loader.js';


// #### Upload the Lottie animation, and the infrastructure required to play it
// The module returns a Promise, in case it needs to fetch and install the Bodymovin library, which is used to play and control the Lottie animation.
lottieLoader({
    name: 'my-first-lottie-animation',
    src: 'img/33-video-cam.json',
})
// @ts-expect-error
.then(lottiePacket => {

    console.log(lottiePacket);

    const lottieAsset = lottiePacket.asset;

    scrawl.makePicture({

        name: 'first-piccy',
        start: ['30%', '30%'],
        handle: ['center', 'center'],
        dimensions: [200, 100],
        copyStart: ['30%', '30%'],
        copyDimensions: ['40%', '40%'],
        lineWidth: 8,
        lineJoin: 'round',
        strokeStyle: 'orange',
        method: 'drawThenFill',
        asset: lottieAsset.name,
        delta: {
            roll: 0.5,
        },

    }).clone({

        name: 'second-piccy',
        start: ['30%', '70%'],
        strokeStyle: 'green',

    }).clone({

        name: 'third-piccy',
        start: ['70%', '70%'],
        strokeStyle: 'red',

    }).clone({

        name: 'fourth-piccy',
        start: ['70%', '30%'],
        strokeStyle: 'blue',

    }).clone({

        name: 'fifth-piccy',
        start: ['50%', '50%'],
        strokeStyle: 'gray',
    });


    // #### Scene animation
    // Function to display frames-per-second data, and other information relevant to the demo
    const report = reportSpeed('#reportmessage');


    // Create the Display cycle animation
    scrawl.makeRender({
        name: 'my-demo',
        target: canvas,
        commence: () => lottieAsset.set({ trigger: true }),
        afterShow: report,
    });
})
.catch(err => console.log(err));



// #### Development and testing
console.log(scrawl.library);

