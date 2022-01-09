// # Demo Canvas 025 
// Various responsive and non-responsive canvases; responsive images

// [Run code](../../demo/canvas-025.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// Import image from DOM, and add data to it
scrawl.importDomImage('.myimage');

let myRiver = scrawl.library.asset.river;

myRiver.set({
    intrinsicDimensions: {
        "river-300.jpg": [300, 225], 
        "river-600.jpg": [600, 450], 
        "river-900.jpg": [900, 675], 
        "river-1200.jpg": [1200, 900], 
        "river-1600.jpg": [1600, 1200], 
        "river-2000.jpg": [2000, 1500], 
        "river-2400.jpg": [2400, 1800], 
        "river-2800.jpg": [2800, 2100], 
        "river-3200.jpg": [3200, 2400], 
        "river-3600.jpg": [3600, 2700], 
        "river-4000.jpg": [4000, 3000]
    },
});


// To simplify things, we'll build everything for each canvas in a local factory
const canvasFactory = function (name, canvasAttributes = {}, baseAttributes = {}) {

    const canvas = scrawl.library.canvas[name];

    canvas.set(canvasAttributes);

    canvas.setBase(baseAttributes);

    scrawl.makePicture({

        name: `${name}-responsive-relative-picture`,
        group: canvas.base.name,
        start: ['5%', '5%'],
        dimensions: ['90%', '90%'],
        copyDimensions: ['100%', '100%'],
        asset: 'river',

    }).clone({

        name: `${name}-responsive-absolute-picture`,
        start: ['35%', '70%'],
        dimensions: [300 / 3, 225 / 3],
        strokeStyle: 'gold',
        method: 'fillThenDraw',
    });

    scrawl.makeBlock({

        name: `${name}-absolute-block`,
        group: canvas.base.name,
        start: [10, 50],
        dimensions: [40, 90],
        fillStyle: 'red',
        strokeStyle: 'black',
        method: 'fillThenDraw',

    }).clone({

        name: `${name}-relative-block`,
        group: canvas.base.name,
        start: ['70%', '20%'],
        dimensions: ['20%', '20%'],
        fillStyle: 'yellow',
    });
};

const squareBase = {
    width: 500,
    height: 500,
};

const fitNone = {
    fit: 'none',
};
const fitStretch = {
    fit: 'fill',
};
const fitContain = {
    fit: 'contain',
};
const fitCover = {
    fit: 'cover',
};

const fitNone40 = {
    fit: 'none',
    dimensions: ['40%', '40%'],
};
const fitStretch40 = {
    fit: 'fill',
    dimensions: ['40%', '40%'],
};
const fitContain40 = {
    fit: 'contain',
    dimensions: ['40%', '40%'],
};
const fitCover40 = {
    fit: 'cover',
    dimensions: ['40%', '40%'],
};

const fitNone100 = {
    fit: 'none',
    dimensions: ['100%', '100%'],
};
const fitStretch100 = {
    fit: 'fill',
    dimensions: ['100%', '100%'],
};
const fitContain100 = {
    fit: 'contain',
    dimensions: ['100%', '100%'],
};
const fitCover100 = {
    fit: 'cover',
    dimensions: ['100%', '100%'],
};

// Default canvases
canvasFactory('default-none', fitNone);
canvasFactory('default-fill', fitStretch);
canvasFactory('default-contain', fitContain);
canvasFactory('default-cover', fitCover);

// CSS sized only canvases
canvasFactory('css-none', fitNone);
canvasFactory('css-fill', fitStretch);
canvasFactory('css-contain', fitContain);
canvasFactory('css-cover', fitCover);

// Default canvases with square base
canvasFactory('default-none-square-base', fitNone, squareBase);
canvasFactory('default-fill-square-base', fitStretch, squareBase);
canvasFactory('default-contain-square-base', fitContain, squareBase);
canvasFactory('default-cover-square-base', fitCover, squareBase);

// CSS sized only canvases with square base
canvasFactory('css-none-square-base', fitNone, squareBase);
canvasFactory('css-fill-square-base', fitStretch, squareBase);
canvasFactory('css-contain-square-base', fitContain, squareBase);
canvasFactory('css-cover-square-base', fitCover, squareBase);

// Default canvases: dimensions set to 100% in JS
canvasFactory('default-none-40', fitNone40);
canvasFactory('default-fill-40', fitStretch40);
canvasFactory('default-contain-40', fitContain40);
canvasFactory('default-cover-40', fitCover40);

// Responsive canvas variations
canvasFactory('responsive-canvas-1', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('responsive-canvas-1-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('responsive-canvas-2', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('responsive-canvas-2-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('responsive-canvas-2-border', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('responsive-canvas-2-100-border', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('responsive-canvas-3', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('responsive-canvas-3-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('responsive-canvas-4', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: true,
});

canvasFactory('responsive-canvas-4-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: true,
  dimensions: ['100%', '100%'],
});

canvasFactory('responsive-canvas-5', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('responsive-canvas-5-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('responsive-canvas-5-border', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('responsive-canvas-5-100-border', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('responsive-canvas-6', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: true,
});

canvasFactory('responsive-canvas-6-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: true,
  dimensions: ['100%', '100%'],
});

canvasFactory('responsive-canvas-7', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: true,
});

canvasFactory('responsive-canvas-7-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: true,
  dimensions: ['100%', '100%'],
});

canvasFactory('responsive-canvas-8', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: true,
});

canvasFactory('responsive-canvas-8-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: true,
  dimensions: ['100%', '100%'],
});

// Banner canvas variations
canvasFactory('banner-canvas-1', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('banner-canvas-1-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('banner-canvas-2', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('banner-canvas-2-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('banner-canvas-2-border', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('banner-canvas-2-100-border', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('banner-canvas-3', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('banner-canvas-3-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('banner-canvas-4', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: true,
});

canvasFactory('banner-canvas-4-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: true,
  dimensions: ['100%', '100%'],
});

canvasFactory('banner-canvas-5', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('banner-canvas-5-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('banner-canvas-5-border', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
});

canvasFactory('banner-canvas-5-100-border', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: false,
  dimensions: ['100%', '100%'],
});

canvasFactory('banner-canvas-6', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: true,
});

canvasFactory('banner-canvas-6-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: false,
  ignoreCanvasCssDimensions: true,
  dimensions: ['100%', '100%'],
});

canvasFactory('banner-canvas-7', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: true,
});

canvasFactory('banner-canvas-7-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: false,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: true,
  dimensions: ['100%', '100%'],
});

canvasFactory('banner-canvas-8', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: true,
});

canvasFactory('banner-canvas-8-100', {
  backgroundColor: 'beige',
  fit: 'contain',
  checkForResize: true,
  baseMatchesCanvasDimensions: true,
  ignoreCanvasCssDimensions: true,
  dimensions: ['100%', '100%'],
});

// #### Scene setup
// const c1 = scrawl.library.artefact['canvas-1'],
//     c2 = scrawl.library.artefact['canvas-2'],
//     c3 = scrawl.library.artefact['canvas-3'],
//     c4 = scrawl.library.artefact['canvas-4'],
//     c5 = scrawl.library.artefact['canvas-5'],
//     c6 = scrawl.library.artefact['canvas-6'],
//     c7 = scrawl.library.artefact['canvas-7'];


// // Import image from DOM, and add data to it
// scrawl.importDomImage('.myimage');

// let myRiver = scrawl.library.asset.river;

// myRiver.set({
//     intrinsicDimensions: {
//         "river-300.jpg": [300, 225], 
//         "river-600.jpg": [600, 450], 
//         "river-900.jpg": [900, 675], 
//         "river-1200.jpg": [1200, 900], 
//         "river-1600.jpg": [1600, 1200], 
//         "river-2000.jpg": [2000, 1500], 
//         "river-2400.jpg": [2400, 1800], 
//         "river-2800.jpg": [2800, 2100], 
//         "river-3200.jpg": [3200, 2400], 
//         "river-3600.jpg": [3600, 2700], 
//         "river-4000.jpg": [4000, 3000]
//     },
// });


// // Set canvas dimensions in HTML; initial base set to canvas dimensions
// c1.set({
//     backgroundColor: 'red',
//     fit: 'cover',
// });

// // Set canvas dimensions in HTML; added border; initial base set to canvas dimensions
// c2.set({
//     backgroundColor: 'red',
//     fit: 'cover',
// });

// // Set canvas dimensions in HTML; base size is static (via JS)
// c3.set({
//     backgroundColor: 'red',
//     fit: 'cover',
// }).setBase({
//     width: 1000,
//     height: 1000,
// });

// // Responsive canvas via CSS + JS; initial base set to canvas dimensions
// c4.set({
//     backgroundColor: 'red',
//     fit: 'cover',
//     checkForResize: true,
//     ignoreCanvasCssDimensions: true,
// });

// // Responsive canvas via CSS + JS; base size is static (via JS)
// c5.set({
//     backgroundColor: 'red',
//     fit: 'cover',
//     checkForResize: true,
//     ignoreCanvasCssDimensions: true,
// }).setBase({
//     width: 1000,
//     height: 1000,
// });

// // Responsive canvas via CSS + JS; baseMatchesCanvasDimensions is true
// c6.set({
//     backgroundColor: 'red',
//     fit: 'cover',
//     checkForResize: true,
//     ignoreCanvasCssDimensions: true,
//     baseMatchesCanvasDimensions: true,
// });

// // Full bleed canvas
// c7.set({
//     backgroundColor: 'red',
//     fit: 'cover',
//     checkForResize: true,
//     ignoreCanvasCssDimensions: true,
//     baseMatchesCanvasDimensions: true,
// });


// // Build the Picture entity
// let piccy = scrawl.makePicture({

//     name: 'c1-image',
//     group: c1.base.name,
//     asset: 'river',

//     width: '100%',
//     height: '100%',

//     copyWidth: '100%',
//     copyHeight: '100%',

// }).clone({

//     name: 'c2-image',
//     group: c2.base.name,

// }).clone({

//     name: 'c3-image',
//     group: c3.base.name,

// }).clone({

//     name: 'c4-image',
//     group: c4.base.name,

// }).clone({

//     name: 'c5-image',
//     group: c5.base.name,

// }).clone({

//     name: 'c6-image',
//     group: c6.base.name,

// }).clone({

//     name: 'c7-image',
//     group: c7.base.name,
// });


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
// scrawl.makeRender({

//     name: 'demo-animation',
//     target: [c1, c2, c3, c4, c5, c6, c7],
//     afterShow: report,
// });

scrawl.makeAnimation({
    name: 'update-all-canvases',
    fn: () => {
        scrawl.render();
        report();
    },
}),


// #### Development and testing
console.log(scrawl.library);
