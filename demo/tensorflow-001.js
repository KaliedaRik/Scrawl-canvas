// # Demo Tensorflow 001
// Tensorflow tfjs-models / body-pix experiment - follow my eyes

// [Run code](../../demo/tensorflow-001.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// ##### Import and use livestream
let myCameraOutput, leftEye, rightEye;

scrawl.importMediaStream({
    name: 'device-camera',
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

    leftEye = scrawl.makeWheel({

        name: 'my-left-eye',

        radius: 40,
        start: [0, 0],
        handle: ['center', 'center'],

        fillStyle: 'red',

        globalAlpha: 0.6,

        visibility: false,
    });

    rightEye = leftEye.clone({

        name: 'my-right-eye',
        fillStyle: 'green',
    });
})
.catch(err => console.log(err.message));


// #### TensorFlow functionality
let parts = {},
    segmentation,

    // We need to smooth the position calculation over several frames
    // - Otherwise the output demonstrates excessive jitter
    leftX = [],
    leftY = [],
    rightX = [],
    rightY = [],
    maxLen = 6;

// The perform function relies on a flag to control the while loop
let trackingEyes = false;

async function perform (net) {

    while (trackingEyes) {

        segmentation = await net.segmentPerson(canvas.domElement);

        if (segmentation && segmentation.allPoses && segmentation.allPoses.length) {

            let segs = segmentation.allPoses[0];

            segs.keypoints.forEach(s => parts[s.part] = s.position);
        }

        if (parts.leftEye) updateFactory(parts.leftEye, leftX, leftY, leftEye);
        if (parts.rightEye) updateFactory(parts.rightEye, rightX, rightY, rightEye);
    }
};

const updateFactory = function (part, storeX, storeY, ent) {

    if (storeX.length > maxLen) storeX.shift();
    if (storeY.length > maxLen) storeY.shift();

    storeX.push(part.x);
    storeY.push(part.y);

    ent.set({
        startX: storeX.reduce((a, v) => a + v, 0) / storeX.length,
        startY: storeY.reduce((a, v) => a + v, 0) / storeY.length,
    });
} 


// #### User interaction
scrawl.addNativeListener('click', () => {

    trackingEyes = !trackingEyes;

    // Apply tensorflow model to track the eyes
    if (trackingEyes) {

        leftEye.set({ visibility: true });
        rightEye.set({ visibility: true });

        bodyPix.load()
        .then (net => perform(net))
        .catch(e => console.log('ERROR: ', e));
    }
    // Stop tracking
    else {

        leftEye.set({ visibility: false });
        rightEye.set({ visibility: false });
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
