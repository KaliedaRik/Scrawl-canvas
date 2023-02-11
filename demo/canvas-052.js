// # Demo Canvas 052 
// Create and use a RawAsset object to modify an image asset

// [Run code](../../demo/canvas-052.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

// Magic numbers
const dimension = 600;


// Import image from DOM, and create Picture entity using it
scrawl.importDomImage('.flowers');


// We need a background image to act as the template on which we will draw
const backgroundImage = scrawl.makePicture({

    name: 'background',
    asset: 'iris',
    dimensions: [dimension, dimension],
    copyDimensions: ['100%', '100%'],
    method: 'none',
});


// We will use Perlin noise to determine brush stroke length and direction
let noiseAsset = scrawl.makeNoiseAsset({

    name: 'my-noise-generator',
    width: dimension,
    height: dimension,
    noiseEngine: 'improved-perlin',
    scale: 80,
});


// We'll code up the painting effect in a RawAsset, which can then be used by Picture entitys, Pattern styles, and filters
let impressionistAsset = scrawl.makeRawAsset({

    name: 'pretend-van-gogh',

    userAttributes: [{
        // __lineWidth__, __lineLengthMultiplier__, __lineLengthStart__, __linesToAdd__, __lineBlend__, __lineOpacity__ - some brush attributes that we'll allow the user to modify in real time.
        key: 'lineWidth', 
        defaultValue: 4,
    },{
        key: 'lineLengthMultiplier', 
        defaultValue: 20,
    },{
        key: 'lineLengthStart', 
        defaultValue: 5,
    },{
        key: 'linesToAdd', 
        defaultValue: 50,
    },{
        key: 'lineBlend', 
        defaultValue: 'source-over',
    },{
        key: 'lineOpacity', 
        defaultValue: 1,
    },{
        // __offsetX__, __offsetY__, __rotationMultiplier__, __rotationStart__ - some additional brush rotation attributes.
        key: 'offsetX', 
        defaultValue: 0,
    },{
        key: 'offsetY', 
        defaultValue: 0,
    },{
        key: 'rotationMultiplier', 
        defaultValue: 90,
    },{
        key: 'rotationStart', 
        defaultValue: 0,
    },{
        // __canvasWidth__, __canvasHeight__ - make the RawAsset's dimensions the same as our canvas base Cell's dimensions
        key: 'canvasWidth', 
        defaultValue: dimension,
    },{
        key: 'canvasHeight', 
        defaultValue: dimension,
    },{
        // __background__ - a handle to our background Picture entity, from which we will be extracting color values
        key: 'background', 
        defaultValue: false,
        setter: function (item) {
            this.background = item;
            this.dirtyBackground = true;
        },
    },{
        // __noise__ - a handle to our Noise asset, from which we will be extracting brushstroke direction and length data
        key: 'noise', 
        defaultValue: false,
        setter: function (item) {
            this.noise = item;
            this.dirtyData = true;
        },
    },{
        // __trigger__ - we update the RawAsset at the start of each Display cycle by setting its `trigger` attribute. 
        // + It's at this point that we fill the RawAsset canvas with the background image, if required
        key: 'trigger', 
        defaultValue: false,
        setter: function (item) {

            if (this.dirtyBackground) {

                this.dirtyBackground = false;

// @ts-expect-error
                const { element, engine, canvasWidth, canvasHeight, background } = this;

                element.width = canvasWidth;
                element.height = canvasHeight;

                const { source, copyArray, pasteArray } = background;

                if (source && copyArray && pasteArray ) {

                    // Strictly speaking, copyArray and pasteArray are Picture entity internal data structures but that doesn't stop us using them here.
                    // + TODO: consider whether the RawAsset object should be using a Cell wrapper rather than a raw &lt;canvas> element 
                    // + if we did it that way, then we would be able to simpleStamp the Picture entity onto the canvas
                    // + the reason why we're NOT doing it that way at the moment is to keep RawAsset canvases out of the SC library
                    engine.drawImage(background.source, ...background.copyArray, ...background.pasteArray);

                    this.backgroundData = engine.getImageData(0, 0, dimension, dimension);

                    this.dirtyData = true;
                }
                else this.dirtyBackground = true;
            }
            else this.dirtyData = true;
        },
    }],

    // `assetWrapper` is the same as `this` when function is declared with the function keyword
    // + We clear the RawAsset's canvas, then draw the updated Voronoi web onto it
    updateSource: function (assetWrapper) {

        const { engine, noise, backgroundData, lineWidth, lineLengthMultiplier, lineLengthStart, linesToAdd, lineBlend, lineOpacity, offsetX, offsetY, rotationMultiplier, rotationStart } = assetWrapper;

        if (noise && backgroundData) {

            const { data, width, height } = backgroundData;

            const { noiseValues } = noise;

            if (noiseValues) {

                engine.lineWidth = lineWidth;
                engine.lineCap = 'round';
                engine.globalCompositeOperation = lineBlend;
                engine.globalAlpha = lineOpacity;

                let x, y, pos, len, rx, ry, dx, dy, roll, r, g, b, a;

                const coord = scrawl.requestCoordinate();

                for (let i = 0; i < linesToAdd; i++) {

                    x = Math.floor(Math.random() * width);
                    y = Math.floor(Math.random() * height);

                    len = (noiseValues[y][x] * lineLengthMultiplier) + lineLengthStart;

                    pos = ((y * width) + x) * 4;

                    r = data[pos];
                    g = data[++pos];
                    b = data[++pos];
                    a = data[++pos];

                    engine.strokeStyle = `rgb(${r} ${g} ${b} / ${a/255})`;

                    rx = (x + offsetX);
                    if (rx < 0 || rx >= width) {
                        rx = (rx < 0) ? rx + width : rx - width;
                    }

                    ry = (y + offsetY);
                    if (ry < 0 || ry >= height) {
                        ry = (ry < 0) ? ry + height : ry - height;
                    }

                    roll = (noiseValues[ry][rx] * rotationMultiplier) + rotationStart;

                    coord.set(len, 0).rotate(roll);
                    [dx, dy] = coord;

                    engine.beginPath();
                    engine.moveTo(x, y);
// @ts-expect-error
                    engine.lineTo(x + dx, y + dy);
                    engine.stroke();
                }
                scrawl.releaseCoordinate(coord);
            }
        }
    },
});

impressionistAsset.set({
    background: backgroundImage,
    noise: noiseAsset,
});

scrawl.makePicture({
    name: 'noise-image',
    asset: 'my-noise-generator',
    method: 'none',
});

const displayImage = scrawl.makePicture({
    name: 'display-image',
    asset: 'pretend-van-gogh',
    dimensions: [dimension, dimension],
    copyDimensions: ['100%', '100%'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,

    // We need to trigger the RawAsset object to update its output at the start of each Display cycle
    commence: () => impressionistAsset.set({ trigger: true }),
    
    afterShow: report,
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(
    canvas, 
    '#my-image-store', 
    backgroundImage, 
    () => { 
        impressionistAsset.set({
            background: backgroundImage,
        });
    },
);


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: impressionistAsset,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        lineBlend: ['lineBlend', 'raw'],
        lineLengthMultiplier: ['lineLengthMultiplier', 'round'],
        lineLengthStart: ['lineLengthStart', 'round'],
        lineWidth: ['lineWidth', 'round'],
        linesToAdd: ['linesToAdd', 'round'],
        lineOpacity: ['lineOpacity', 'float'],
        offsetX: ['offsetX', 'round'],
        offsetY: ['offsetY', 'round'],
        rotationMultiplier: ['rotationMultiplier', 'round'],
        rotationStart: ['rotationStart', 'round'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '#noiseScale',

    target: noiseAsset,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        noiseScale: ['scale', 'round'],
    },
});

// Setup form
// @ts-expect-error
document.querySelector('#lineBlend').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#lineWidth').value = 4;
// @ts-expect-error
document.querySelector('#lineLengthMultiplier').value = 20;
// @ts-expect-error
document.querySelector('#lineLengthStart').value = 5;
// @ts-expect-error
document.querySelector('#linesToAdd').value = 50;
// @ts-expect-error
document.querySelector('#lineOpacity').value = 1;
// @ts-expect-error
document.querySelector('#noiseScale').value = 80;
// @ts-expect-error
document.querySelector('#offsetX').value = 0;
// @ts-expect-error
document.querySelector('#offsetY').value = 0;
// @ts-expect-error
document.querySelector('#rotationMultiplier').value = 90;
// @ts-expect-error
document.querySelector('#rotationStart').value = 0;


// #### Video recording and download functionality
const videoButton = document.querySelector("#my-record-video-button");

let recording = false;
let myRecorder;
let recordedChunks;

videoButton.addEventListener("click", () => {
    recording = !recording;

    if (recording) {

        videoButton.textContent = "Stop recording";

        const stream = canvas.domElement.captureStream(25);

        myRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm;codecs=vp8"
        });

        recordedChunks = [];

        myRecorder.ondataavailable = (e) => {

            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        myRecorder.start();
    } 
    else {

        videoButton.textContent = "Record a video";

        myRecorder.stop();

        setTimeout(() => {
            
            const blob = new Blob(recordedChunks, { type: "video/webm" });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `Scrawl-canvas-art-recording-${Date().slice(4, 24)}.webm`;
            a.click();

            URL.revokeObjectURL(url);
        }, 0);
    }
});


// #### Development and testing
console.log(scrawl.library);
