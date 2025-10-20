// # Demo Mediapipe 001
// MediaPipe Selfie Segmentation - model image output

// [Run code](../../demo/mediapipe-001.html)
import * as MediaPipe from './js/mediapipe/tasks-vision/vision-bundle.js';
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// #### Define some filters
scrawl.makeFilter({

    name: name('grayscale'),
    method: 'grayscale',

}).clone({

    name: name('sepia'),
    method: 'sepia',

}).clone({

    name: name('negative'),
    method: 'negative',

}).clone({

    name: name('red'),
    method: 'red',
});

scrawl.makeFilter({

    name: name('pixelate'),
    method: 'pixelate',
    tileWidth: 10,
    tileHeight: 10,
});

scrawl.makeFilter({

    name: name('background-blur'),
    method: 'gaussianBlur',
    radius: 8,
});

scrawl.makeFilter({

    name: name('body-blur'),
    method: 'gaussianBlur',
    radius: 2,
});


// #### Importing a device-based media stream
// For this Demo we:
// + Create a hidden Cell (camera-input-cell) which will hold the raw data from the media stream video
// + Create a media stream video asset
// + Display the media stream asset in a Picture entity in our hidden Cell
// + Display the hidden Cell in the base Cell using a second Picture entity (the background)
// + Apply filters to the background output
//
// We are using this approach because we:
// + Want to feed the hidden Cell data through MediaPipe to remove the background
// + We can then display the results in the base Cell over the filtered background
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
const modelInputCell = canvas.buildCell({

    name: name('model-input-cell'),
    dimensions: [256, 256],
    shown: false,
});


// We process the model's output in a dedicated mask Cell
// - We do this using direct manipulation of the Cell's image data
const modelOutputCell = canvas.buildCell({

    name: name('model-output-cell'),
    dimensions: [256, 256],
    cleared: false,
    compiled: false,
    shown: false,
});

const maskData = modelOutputCell.getCellData(true),
    pixels = maskData.pixelState;


// #### Picture entitys

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
// + The model requires image data with set dimensions (256 x 256)
scrawl.makePicture({

    name: name('model-input-picture'),
    group: modelInputCell,

    asset: videoFeedCell,

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
});

// Base Cell head mask
const mask = scrawl.makePicture({

    name: name('model-mask-picture'),
    asset: modelOutputCell,

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('body-blur')],
    order: 0,
});

// Base Cell head image
// + We fill the mask with the media stream image
scrawl.makePicture({

    name: name('foreground-picture'),
    asset: videoFeedCell,

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    globalCompositeOperation: 'source-atop',
    order: 1,
});

// Base Cell background image
// + We apply filters to the background image, and stamp it onto the base cell last (with appropriate GCO)
const background = scrawl.makePicture({

    name: name('background-picture'),
    asset: videoFeedCell,

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('pixelate')],

    globalCompositeOperation: 'destination-over',
    order: 2,
});


// #### Google MediaPipe ML model code
let imageSegmenter;

const startModel = async () => {

    const path = 'js/mediapipe/tasks-vision/'
    const vision = await MediaPipe.FilesetResolver.forVisionTasks();

    vision.wasmBinaryPath = `${path}wasm${vision.wasmBinaryPath}`;
    vision.wasmLoaderPath = `${path}wasm${vision.wasmLoaderPath}`;

    imageSegmenter = await MediaPipe.ImageSegmenter.createFromOptions(vision, {

        baseOptions: {
            modelAssetPath: `${path}model/selfie_segmenter.tflite`,
        },

        outputCategoryMask: true,
        outputConfidenceMasks: false,
        runningMode: 'LIVE_STREAM',
    });
};

// We can start the model code running straight away
// - It's the camera for which we need user permission
startModel();


// This function gets consumed by the model's imageSegmenter object
// - imageSegmenter doesn't start its work until it has something to segment
const processModelData = (results) => {

    // Be aware: MediaPipe objects don't feel stable
    // + This model instance is returning data in a `g` attribute (as the first element of an array)
    // + Previous (recent) versions returned this data in a `categoryMask.containers` attribute
    // + Moral: never trust; always check!
    if (results && results.categoryMask && results.categoryMask.g && results.categoryMask.g.length) {

        const data = results.categoryMask.g[0];

        if (data && data.length) {

            for (let i = 0, iz = data.length; i < iz; i++) {

                pixels[i].alpha = 256 - data[i];
            }

            modelOutputCell.paintCellData(maskData);

            videoFeedCell.clear();
            videoFeedCell.compile();
        }
    }
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

                if (imageSegmenter && imageSegmenter.segmentForVideo) {

                    imageSegmenter.segmentForVideo(modelInputCell.element, performance.now(), processModelData);
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


// #### User interaction
scrawl.initializeDomInputs([
    ['select', 'backgroundFilter', 6],
    ['select', 'outlineFilter', 1],
]);


// Event listeners
scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();
    e.returnValue = false;

    if (e && e.target) {

        const id = e.target.id,
            val = e.target.value;

        if ('backgroundFilter' === id) {

            background.clearFilters();

            if (val) background.addFilters(name(val));
        }
        else {

            if ('1' === val) mask.addFilters(name('body-blur'));
            else mask.clearFilters();
        }
    }
}, '.controlItem');


// #### Development and testing
console.log('scrawl.library', scrawl.library);
console.log('MediaPipe', MediaPipe);
