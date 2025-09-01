// # Demo Mediapipe 002
// MediaPipe Face Landmarker - model image output

// [Run code](../../demo/mediapipe-002.html)
import * as MediaPipe from './js/mediapipe/tasks-vision/vision-bundle.js';
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// #### Importing a device-based media stream
// For this Demo we:
// + Create a hidden Cell (camera-input-cell) which will hold the raw data from the media stream video
// + Create a media stream video asset
// + Display the media stream asset in a Picture entity in our hidden Cell
// + Display the hidden Cell in the base Cell using a second Picture entity (the background)
// + Display an overlay of label coordinates detected by the face landmarker
//
// + Note 1: Users will need to explicitly agree to let Scrawl-canvas use the media stream the first time the page loads (the browser should handle this agreement procedure itself)
// + Note 2: importMediaStream returns a Promise!

const videoFeedCell = canvas.buildCell({

    name: name('camera-input-cell'),
    dimensions: [768, 768],

    // We pipe the media stream displayed in this cell:
    // + Through the MediaPipe ML model code, to remove background
    // + Into the base cell to display the filtered background
    //
    // Because MediaPipe needs time to process each frame, this means:
    // + There's a chance of the face and background falling out of sync
    // + So we only update the cell after MediaPipe completes its processing work
    // + Thus keeping both background and face in sync

    cleared: false,
    compiled: false,
    shown: false,
});

// We use another Cell to feed data into MediaPipe
// + Required dimensions: 128 x 128
const modelInputCell = canvas.buildCell({

    name: name('model-input-cell'),
    dimensions: [128, 128],
    shown: false,
});


// #### Entitys

// Media stream picture entity
// + Goes into the hidden video feed Cell
// + Initialized without an asset, and given some default dimensions - these will be updated when the media stream completes initialization
const inputPicture = scrawl.makePicture({

    name: name('camera-input-picture'),
    group: videoFeedCell,

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    // To get a mirror effect
    start: ['center', 'center'],
    handle: ['center', 'center'],
    flipReverse: true,
});

// The model input Cell also needs a Picture entity, to feed into the model
// + The model requires image data with set dimensions (128 x 128)
scrawl.makePicture({

    name: name('model-input-picture'),
    group: modelInputCell,

    asset: videoFeedCell,

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
});

// Base Cell background image
// + We apply filters to the background image, and stamp it onto the base cell last (with appropriate GCO)
const background = scrawl.makePicture({

    name: name('background-picture'),
    asset: videoFeedCell,

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    globalAlpha: 0.4,
});

// Create some Label entitys to display landmark points
const labels = [];

for (let i = 0; i < 478; i++) {

    labels.push(scrawl.makeLabel({

        name: name(`p${i}`),
        fontString: '8px monospace',
        text: `${i}`,
        handle: ['center', 'center'],
        scale: 1,
        visibility: false,
    }));
}


// #### Google MediaPipe ML model code
let faceLandmarker;

const startModel = async () => {

    const path = 'js/mediapipe/tasks-vision/'
    const vision = await MediaPipe.FilesetResolver.forVisionTasks();

    vision.wasmBinaryPath = `${path}wasm${vision.wasmBinaryPath}`;
    vision.wasmLoaderPath = `${path}wasm${vision.wasmLoaderPath}`;

    faceLandmarker = await MediaPipe.FaceLandmarker.createFromOptions(vision, {

        baseOptions: {
            modelAssetPath: `${path}model/face_landmarker.task`,
        },

        runningMode: 'VIDEO',
    });
};

// We can start the model code running straight away
// - It's the camera for which we need user permission
startModel();


// This function gets consumed by the model's faceLandmarker object
// - faceLandmarker doesn't start its work until it has something to segment
const processModelData = (results) => {

    if (results && results.faceLandmarks && results.faceLandmarks.length) {

        const data = results.faceLandmarks[0];

        if (data && data.length) {

            let point, label;

            for (let i = 0, iz = labels.length; i < iz; i++) {

                point = data[i];
                label = labels[i];

                label.set({
                    startX: `${point.x * 100}%`,
                    startY: `${point.y * 100}%`,
                    scale: 1 - (point.z * 2),
                    visibility: true,
                });
            }
        }
    }

    else {

        for (let i = 0, iz = labels.length; i < iz; i++) {

            labels[i].set({ visibility: false });
        }
    }
    videoFeedCell.clear();
    videoFeedCell.compile();
};


// #### Media stream capture
scrawl.importMediaStream({

    name: name('video-feed'),
    audio: false,
    video: {
        width: { ideal: 768 },
        height: { ideal: 768 },
        facingMode: 'user',
    },
})
.then(streamAsset => {

    // The asset creates a non-DOM video element, which loads metadata asynchronously
    scrawl.addNativeListener('loadedmetadata', () => {

        // We need to account for the case when the browser doesn't return the desired dimensions
        // + The handle to the non-DOM video element is stored in the `asset.source` attribute
        const width = streamAsset.source.videoWidth,
            height = streamAsset.source.videoHeight,
            minimumDimension = Math.min(width, height),
            scale = 768 / minimumDimension;

        // Use the asset's actual dimensions, and scale to prevent distortions
        inputPicture.set({
            dimensions: [width, height],
            scale,
            asset: streamAsset,
        });

        // We need to feed input data into the model discretely, via an SC animation object
        scrawl.makeAnimation({

            name: name('model-segmenter'),
            order: 0,
            fn: () => {

                if (faceLandmarker && faceLandmarker.detectForVideo) {

                    const results = faceLandmarker.detectForVideo(modelInputCell.element, performance.now());

                    if (results) processModelData(results);
                }
            }
        });

    }, streamAsset.source);
})
.catch(err => console.log(err.message));


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

  name: name('render'),
  target: canvas,
  afterShow: report,
});


// #### Development and testing
console.log('scrawl.library', scrawl.library);
console.log('MediaPipe', MediaPipe);
