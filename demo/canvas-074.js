// # Demo Canvas 074
// Import and use ImageBitmap objects as assets

// [Run code](../../demo/canvas-074.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('my-canvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// #### Create SC assets from DOM &lt;img> elements
// For the DOM images, we will generate ImageBitmap based assets from them
// + ImageBitmap generation is asynchronous, the `createImageBitmap` function returns a Promise
// + This is a more involved process compared to SC's `importDomImage` functionality
const domImages = document.querySelectorAll('.dom-images'),
    rawImageBitmapsPromises = [];

[...domImages].forEach(img => rawImageBitmapsPromises.push(createImageBitmap(img)));


// We're importing 2 images from the DOM; we wait until both promises have completed
// + We must assume that the order of the images returned by `querySelectorAll` matches the order of the images in the DOM, but this is not guaranteed
Promise.all(rawImageBitmapsPromises)
.then(rawImageBitmaps => {

    // Import the bitmaps
    const results = scrawl.importImageBitmap(

        // This should be an image of an iris (flower)
        // + But we don't know that, and we take a risk by importing the ImageBitmap directly
        rawImageBitmaps[0], 

        // The better approach is to wrap the ImageBitmap in a JS object, assigning it to a `src` attribute
        // + This then allows us to give the resulting asset a known name, which we can (in this instance) define from the DOM element's `id` value
        {
            name: domImages[1].id,
            src: rawImageBitmaps[1],
        }
    );

    // We know this asset's name, because it is the `id` value of the &lt;img> element
    scrawl.makePattern({

        name: name('brick-pattern'),
        asset: 'brick',
    });

    scrawl.makeBlock({

        name: name('patterned-block'),
        dimensions: ['100%', '100%'],
        fillStyle: name('brick-pattern'),
        globalAlpha: 0.5,
    });

    // We did not give the other asset a name
    // + But we can discover the name the SC system gave it because `importImageBitmap` returns an array of the names given to each imported asset
    scrawl.makePicture({

        name: name('iris-picture'),
        start: ['center', 'center'],
        handle: ['center', 'center'],
        dimensions: ['50%', '50%'],
        copyDimensions: ['100%', '100%'],
        asset: results[0],
    });
})
.catch(error => console.log(error.message));


// #### Create SC assets from image files dropped onto the canvas
// Drag and drop event listeners
scrawl.addNativeListener(['dragenter', 'dragover', 'dragleave'], (e) => {

    e.preventDefault();
    e.stopPropagation();

}, canvas.domElement);

scrawl.addNativeListener('drop', (e) => {

    e.preventDefault();
    e.stopPropagation();

    const dt = e.dataTransfer;

    if (dt) {

        console.log(`Attempting to upload ${dt.files.length} files`);

        [...dt.files].forEach(addImageAsset);
    }

}, canvas.domElement);

// User interaction - picture drag-and-drop within canvas
const myDragGroup = scrawl.makeGroup({
    name: name('draggable'),
    host: canvas.base,
});

// Create the drag-and-drop zone
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: myDragGroup,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});

// Function to run when an image file is dropped onto the canvas
let counter = 0;

const addImageAsset = (file) => {

    if (file.type.indexOf('image/') === 0) {

        const assetName = `user-uploaded-asset-${counter}`;
        counter++;

        console.log(`Received an image file - asset name: ${assetName}`);

        // We need to get the image dimensions
        // + The simplest hack is to load the file into a temporary &lt;img> element
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {

            const { naturalWidth: w, naturalHeight: h } = img;

            URL.revokeObjectURL(url);

            // Calculate aspect-ratio-preserving resize
            let targetW, targetH;

            if (w >= h) {
                targetW = 150;
                targetH = Math.round((h / w) * 150);
            }
            else {
                targetH = 150;
                targetW = Math.round((w / h) * 150);
            }

            // Every image uploaded has a cost!
            // + a 4k x 3k (3MB) image file will generate a 48MB ImageBitmap object
            // + Which impacts page performance if more than a few such images are uploaded
            // + For this demo, we only need 150px square images
            // + `createImageBitmap` allows us to resize an image as we create the bitmap from it
            createImageBitmap(file, {
                resizeWidth: targetW,
                resizeHeight: targetH,
                resizeQuality: 'high',
            })
            .then(bitmap => {

                const [importedName] = scrawl.importImageBitmap({
                    name: assetName,
                    src: bitmap,
                });

                scrawl.makePicture({

                    name: name(`picture-for-${assetName}`),
                    asset: importedName,
                    group: myDragGroup,
                    start: [
                        Math.random() * canvas.get('width'),
                        Math.random() * canvas.get('height'),
                    ],
                    handle: ['center', 'center'],
                    dimensions: [targetW, targetH],
                    copyDimensions: ['100%', '100%'],
                    strokeStyle: 'yellow',
                    lineWidth: 2,
                    method: 'fillThenDraw',
                });
            })
            .catch(err => console.log(err.message));
        }

        // Start the import process
        img.src = url;
    }
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


// #### Development and testing
console.log(scrawl.library);
