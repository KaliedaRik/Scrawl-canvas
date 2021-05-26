// # Demo Tensorflow 002
// Tensorflow tfjs-models / body-pix experiment - model image output

// [Run code](../../demo/tensorflow-002.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas,
    output = scrawl.library.artefact.outputcanvas;


// ##### Import and use livestream
let myCameraOutput;

scrawl.importMediaStream({
    name: 'device-camera-cell',
    audio: false,
})
.then(mycamera => {

    myCameraOutput = scrawl.makePicture({

        name: 'mediastream-video',
        asset: mycamera.name,

        width: '100%',
        height: '100%',

        copyWidth: '100%',
        copyHeight: '100%',
    });
})
.catch(err => console.log(err.message));


// #### TensorFlow functionality
let showOutput = false;

async function perform (net) {

    const engine = output.domElement.getContext('2d');

    while (showOutput) {

        const segmentation = await net.segmentPerson(canvas.domElement);

        if (segmentation && segmentation.width && segmentation.height) {

            const {width, height, data} = segmentation;

            const segLength = width * height,
                imageDataLen = segLength * 4,
                imageArray = new Uint8ClampedArray(imageDataLen);

            for (let i = 0, o = 0; i < segLength; i++) {

                o = i * 4;
                if (data[i]) {

                    imageArray[o] = 0;
                    o++;
                    imageArray[o] = 0;
                    o++;
                    imageArray[o] = 0;
                    o++;
                    imageArray[o] = 255;
                }
            }

            const iData = new ImageData(imageArray, width, height);

            engine.putImageData(iData, 0, 0);
        }
    }
};


// #### User interaction
scrawl.addNativeListener('click', () => {

    showOutput = !showOutput;

    if (showOutput) {

        bodyPix.load()
        .then (net => perform(net))
        .catch(e => console.log('ERROR: ', e));
    }
}, canvas.domElement);


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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});

console.log(scrawl.library);
