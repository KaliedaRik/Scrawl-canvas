// # Demo Canvas 052 
// Drag-drop load image files into the canvas element

// [Run code](../../demo/canvas-052.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Magic numbers
const dimension = 600;


// Make the canvas responsive
canvas.set({
    fit: 'cover',
    checkForResize: true,
}).setBase({
    dimensions: [dimension, dimension],
});


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
    color: 'gradient',
    scale: 80,
});


// We'll code up the painting effect in a RawAsset, which can then be used by Picture entitys, Pattern styles, and filters
let impressionistAsset = scrawl.makeRawAsset({

    name: 'pretend-van-gogh',

    userAttributes: [{
        // __lineWidth__, __lineLengthReducer__, __linesToAdd__, __lineBlend__, __lineOpacity__ - some brush attributes that we'll allow the user to modify in real time.
        key: 'lineWidth', 
        defaultValue: 4,
    },{
        key: 'lineLengthReducer', 
        defaultValue: 6,
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

        const { engine, noise, backgroundData, lineWidth, lineLengthReducer, linesToAdd, lineBlend, lineOpacity } = assetWrapper;

        if (noise && backgroundData) {

            const { data, width, height } = backgroundData;

            const { noiseValues, colorFactory } = noise;

            if (noiseValues && colorFactory) {

                engine.lineWidth = lineWidth;
                engine.lineCap = 'round';
                engine.globalCompositeOperation = lineBlend;
                engine.globalAlpha = lineOpacity;

                let x, y, pos, dx, dy, r, g, b, a;

                for (let i = 0; i < linesToAdd; i++) {

                    x = Math.floor(Math.random() * width);
                    y = Math.floor(Math.random() * height);

                    pos = ((y * width) + x) * 4;

                    colorFactory.convert(colorFactory.getRangeColor(noiseValues[y][x]));

                    dx = colorFactory.r / lineLengthReducer;
                    dy = colorFactory.g / lineLengthReducer;

                    r = data[pos];
                    g = data[++pos];
                    b = data[++pos];
                    a = data[++pos];

                    engine.strokeStyle = `rgba(${r},${g},${b},${a/255})`;

                    engine.beginPath();
                    engine.moveTo(x, y);
                    engine.lineTo(x + dx, y + dy);
                    engine.stroke();
                }
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

    commence: () => impressionistAsset.set({ trigger: true }),
    afterShow: report,
});


// #### Drag-and-Drop functionality
const store = document.querySelector('#my-image-store');
const timeoutDelay = 200;

let counter = 0;

scrawl.addNativeListener(['dragenter', 'dragover', 'dragleave'], (e) => {

    e.preventDefault();
    e.stopPropagation();

}, canvas.domElement);

scrawl.addNativeListener('drop', (e) => {

    e.preventDefault();
    e.stopPropagation();

    const dt = e.dataTransfer;

    if (dt) [...dt.files].forEach(addImageAsset);

}, canvas.domElement);

const addImageAsset = (file) => {

    if (file.type.indexOf('image/') === 0) {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onloadend = function() {

            // Create a name for our new asset
            const name = `user-upload-${counter}`;
            counter++;

            // Add the image to the DOM and create our asset from it
            const img = document.createElement('img');
            img.src = reader.result;
            img.id = name;
            store.appendChild(img);

            scrawl.importDomImage(`#${name}`);

            // Update our Picture entity's asset attribute so it displays the new image
            backgroundImage.set({
                asset: name,
            });

            // HOW TO: set the Picture entity's copy dimensions to take into account any difference between the old and new image's dimensions
            // + Because of asynch stuff, we need to wait for stuff to complete before performing this functionality
            // + The Picture entity copies (for the sake of our sanity) a square part of the image. Thus we shall use the new image's shorter dimension as the copy dimension and offset the longer copy start so we are viewing the middle of it
            setTimeout(() => {

                const asset = scrawl.library.asset[name];

                const width = asset.get('width'),
                    height = asset.get('height');

                let copyStartX = 0,
                    copyStartY = 0,
                    dim = 0;

                if (width > height) {

                    copyStartX = (width - height) / 2;
                    dim = height;
                }
                else {

                    copyStartY = (height - width) / 2;
                    dim = width;
                }

                backgroundImage.set({
                    copyStartX,
                    copyStartY,
                    copyWidth: dim,
                    copyHeight: dim,
                });

                // The background image won't settle until it has completed the next Display cycle, after which we can tell our RawAsset that the user has decided to load up a new image for it to paint over ... so, another timeout.
                setTimeout(() => {

                    impressionistAsset.set({
                        background: backgroundImage,
                    });
                }, timeoutDelay);
            }, timeoutDelay);
        }
    }
};


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
        lineLengthReducer: ['lineLengthReducer', 'round'],
        lineWidth: ['lineWidth', 'round'],
        linesToAdd: ['linesToAdd', 'round'],
        lineOpacity: ['lineOpacity', 'float'],
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
document.querySelector('#lineBlend').options.selectedIndex = 0;
document.querySelector('#lineWidth').value = 4;
document.querySelector('#lineLengthReducer').value = 6;
document.querySelector('#linesToAdd').value = 50;
document.querySelector('#lineOpacity').value = 1;
document.querySelector('#noiseScale').value = 80;


// #### Development and testing
console.log(scrawl.library);
