// # Demo Mediapipe 003
// MediaPipe Face Mesh - working with the mesh coordinates

// [Run code](../../demo/mediapipe-003.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// Magic numbers
const width = 1280,
    height = 720;


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;


// Create and manipulate the face worm
let wormStart = 220,
    wormEnd = 270;

const wormstartInput = document.querySelector('#wormstart'),
    wormendInput = document.querySelector('#wormend');

// @ts-expect-error
wormstartInput.value = wormStart;
// @ts-expect-error
wormendInput.value = wormEnd;

const worm = scrawl.makePolyline({

    name: 'face-worm',

    strokeStyle: 'red',
    lineJoin: 'round',
    lineCap: 'round',
    lineWidth: 3,

    method: 'draw',

    mapToPins: true,
    tension: 0.3,
});

const updateLabelsAndWorm = function (asset) {

    const { entitys, mesh } = asset

    if (mesh.length && Array.isArray(mesh[0])) {

        const face = mesh[0];

        // We only need to create the labels once
        if (!entitys.length) {

            face.forEach((coord, index) => {

                entitys.push(scrawl.makePhrase({
                    name: `label-${index}`,
                    text: `${index}`,
                    handle: ['center', 'center'],
                    width: 20,
                    justify: 'center',
                    fontString: '10px Arial',
                }));
            });
        }

        // Update label coordinates with new mesh data
        entitys.forEach((e, index) => {

            const coord = face[index];

            const {x, y} = coord;

            e.set({
                startX: `${x * 100}%`,
                startY: `${y * 100}%`,
            });
        });

        // Check for perilous user input
        if (isNaN(wormStart)) wormStart = 0;
        if (wormStart < 0) wormStart = 0;
        if (wormStart > 468) wormStart = 468;

        if (isNaN(wormEnd)) wormEnd = 0;
        if (wormEnd < 0) wormEnd = 0;
        if (wormEnd > 468) wormEnd = 468;

        if (wormEnd < wormStart) {

            const temp = wormStart;
            wormStart = wormEnd;
            wormEnd = temp;
        }

// @ts-expect-error
        wormstartInput.value = wormStart;
// @ts-expect-error
        wormendInput.value = wormEnd;

        // Update the worm's pins
        worm.set({
            pins: entitys.slice(wormStart, wormEnd),
        });
    }
};


// #### MediaPipe functionality
// We'll handle everything in a raw asset object
const myAsset = scrawl.makeRawAsset({

    name: 'mediapipe-model-interpreter',

    userAttributes: [{

        key: 'mesh',
        defaultValue: false,
        setter: function (item) {

            if (item) {

                const {image:img, multiFaceLandmarks:mesh} = item;

                if (img) {

// @ts-expect-error
                    this.canvasWidth =  img.width;
// @ts-expect-error
                    this.canvasHeight = img.height;
                }

// @ts-expect-error
                if (mesh) this.mesh = mesh;

// @ts-expect-error
                this.dirtyData = true;
            }
        },
    },{
        key: 'entitys',
        defaultValue: [],
        setter: () => {},
    },{
        key: 'canvasWidth',
        defaultValue: 0,
        setter: () => {},
    },{
        key: 'canvasHeight',
        defaultValue: 0,
        setter: () => {},
    }],

    updateSource: function (assetWrapper) {

        const { mesh } = assetWrapper;

        if (mesh && mesh.length) updateLabelsAndWorm(this);
    },
});


// The forever loop function, which captures the MediaPipe model's output and passes it on to our raw asset for processing
const perform = function (mesh) {

    myAsset.set({ mesh });

    // To get the raw asset working, something needs to subscribe to it - even though we're not using the asset to output any graphics in this demo. We only need to create the Picture entity once.
    if (!output) output = scrawl.makePicture({

        name: 'output',
        asset: 'mediapipe-model-interpreter',
    });
};


// ##### Import and use media stream
let video, model, output;

// Capture the media stream
scrawl.importMediaStream({

    name: 'device-camera',
    audio: false,
})
.then(mycamera => {

    video = mycamera;

// @ts-expect-error
    video.source.width = width;
// @ts-expect-error
    video.source.height = height;

    scrawl.makePicture({

        name: 'background',
        asset: mycamera.name,

        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],

        globalAlpha: 0.2,
    });

    // Start the MediaPipe model
/* eslint-disable */
// @ts-expect-error
    model = new FaceMesh({

/* eslint-enable */
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    model.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    model.onResults(perform);

    // Use MediaPipe's camera functionality to get updates to the forever loop
/* eslint-disable */
// @ts-expect-error
    const mediaPipeCamera = new Camera(video.source, {

/* eslint-enable */
        onFrame: async () => {

            await model.send({image: video.source});
        },

        width,
        height,
    });

    mediaPipeCamera.start();
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
scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        e.preventDefault();
        e.stopPropagation();

        const target = e.target;

        if ('wormstart' === target.id) wormStart = parseInt(target.value, 10);
        else if ('wormend' === target.id) wormEnd = parseInt(target.value, 10);
    }

}, '.controlItem');


// #### Development and testing
console.log(scrawl.library);
