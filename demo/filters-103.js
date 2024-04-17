// # Demo Filters 103
// A gallery of compound filter effects

// [Run code](../../demo/filters-103.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Namespacing boilerplate
let canvas, namespace;
const name = (n) => `${namespace}-${n}`;


// #### Scene setup and animation
// Holding group - stands outside any canvas
const pictures = scrawl.makeGroup({

    name: 'target-images',
});


// Report speed animation - stands outside any canvas
const report = reportSpeed('#reportmessage');

scrawl.makeRender({

    name: 'page-speed',
    noTarget: true,
    afterShow: report,
});


// Initialise each canvas and its entitys
const initCanvas = (canvasId) => {

    canvas = scrawl.findCanvas(canvasId);
    namespace = canvas.name;

    canvas.setAsCurrentCanvas();

    const p = scrawl.makePicture({

        name: name('display'),
        asset: 'iris',
        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],
        memoizeFilterOutput: true,
    });

    pictures.addArtefacts(p);

    scrawl.makeRender({

        name: name('animation'),
        target: canvas,
        observer: true,
    });
};


const canvases = [
    'canvas-1', 'canvas-2',  'canvas-3',  'canvas-4',
    'canvas-5', 'canvas-6',  'canvas-7',  'canvas-8',
    'canvas-9', 'canvas-10', 'canvas-11', 'canvas-12',
];

canvases.forEach(c => initCanvas(c));


// #### Filter setup
// Blotchy newsprint
canvas = scrawl.findCanvas('canvas-1');
namespace = canvas.name;

scrawl.makeFilter({

    name: name('blotchy-newsprint'),
    actions: [{
        action: 'newsprint',
        width: 3,
        opacity: 0.5,
    }, {
        action: 'gaussian-blur',
        radius: 2,
    }, {
        action: 'step-channels',
        red: 31,
        green: 31,
        blue: 31,
        clamp: 'round',
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('blotchy-newsprint'));


// Translucent jagged edges effect
canvas = scrawl.findCanvas('canvas-2');
namespace = canvas.name;

const points1 = [],
    points2 = [];

for (let i = 0; i < 2000; i++) {
    points1.push(Math.floor(Math.random() * 400));
    points2.push(Math.floor(Math.random() * 400));
}

scrawl.makeFilter({

    name: name('jagged-shapes'),
    actions: [{
        action: 'tiles',
        points: points1,
        tileRadius: 30,
    }, {
        action: 'tiles',
        points: points2,
        tileRadius: 30,
        opacity: 0.5
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('jagged-shapes'));


// Brass rubbing effect
canvas = scrawl.findCanvas('canvas-3');
namespace = canvas.name;

scrawl.makeFilter({

    name: name('brass-rubbing'),
    actions: [{
        action: 'gaussian-blur',
        radius: 2,
    }, {
        action: 'matrix',
        width: 3,
        height: 3,
        offsetX: 1,
        offsetY: 1,
        weights: [0, 1, 0, 1, -4, 1, 0, 1, 0],
    }, {
        action: 'channels-to-alpha',
    }, {
        action: 'flood',
        red: 180,
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('brass-rubbing'));


// Blueprint effect
canvas = scrawl.findCanvas('canvas-4');
namespace = canvas.name;

scrawl.makeFilter({

    name: name('blueprint'),
    actions: [{
        action: 'gaussian-blur',
        radius: 1,
    }, {
        action: 'matrix',
        width: 3,
        height: 3,
        offsetX: 1,
        offsetY: 1,
        weights: [0, 1, 0, 1, -4, 1, 0, 1, 0],
    }, {
        action: 'threshold',
        level: 6,
        high: [255, 255, 255, 255],
        low: [0, 0, 120, 255],
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('blueprint'));


// Comic effect
canvas = scrawl.findCanvas('canvas-5');
namespace = canvas.name;

scrawl.makeFilter({

    name: name('comic'),
    actions: [{
        action: 'gaussian-blur',
        radius: 1,
        lineOut: 'outline1',
    }, {
        action: 'matrix',
        lineIn: 'outline1',
        lineOut: 'outline2',
        width: 3,
        height: 3,
        offsetX: 1,
        offsetY: 1,
        weights: [0,1,0,1,-4,1,0,1,0],
    }, {
        action: 'threshold',
        lineIn: 'outline2',
        lineOut: 'outline3',
        level: 6,
        high: [0, 0, 0, 255],
        low: [0, 0, 0, 0],
        includeAlpha: true,
    }, {
        action: 'gaussian-blur',
        radius: 1,
        lineIn: 'outline3',
        lineOut: 'outline4',
    }, {
        action: 'step-channels',
        clamp: 'round',
        lineOut: 'color1',
        red: 16,
        green: 16,
        blue: 16,
    }, {
        action: 'gaussian-blur',
        radius: 4,
        lineIn: 'color1',
        lineOut: 'color2',
    }, {
        action: 'compose',
        compose: 'destination-over',
        lineIn: 'color2',
        lineMix: 'outline4',
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('comic'));


// Square quilt effect
canvas = scrawl.findCanvas('canvas-6');
namespace = canvas.name;

scrawl.makeFilter({

    name: name('square-quilt'),
    actions: [{
        action: 'pixelate',
        lineOut: 'large',
        tileWidth: 24,
        tileHeight: 24,
    }, {
        action: 'area-alpha',
        lineIn: 'large',
        lineOut: 'large',
        tileWidth: 12,
        tileHeight: 12,
        gutterWidth: 12,
        gutterHeight: 12,
        areaAlphaLevels: [255,0,0,255],
    }, {
        action: 'pixelate',
        lineOut: 'medium',
        tileWidth: 12,
        tileHeight: 12,
    }, {
        action: 'area-alpha',
        lineIn: 'medium',
        lineOut: 'medium',
        tileWidth: 6,
        tileHeight: 6,
        gutterWidth: 6,
        gutterHeight: 6,
        areaAlphaLevels: [255, 0, 0, 255],
    }, {
        action: 'pixelate',
        lineOut: 'small',
        tileWidth: 3,
        tileHeight: 3,
    }, {
        action: 'compose',
        compose: 'source-over',
        lineIn: 'medium',
        lineMix: 'small',
        lineOut: 'mixed',
    }, {
        action: 'compose',
        compose: 'source-over',
        lineIn: 'large',
        lineMix: 'mixed',
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('square-quilt'));


// Raised tiles effect
canvas = scrawl.findCanvas('canvas-7');
namespace = canvas.name;

scrawl.makeFilter({

    name: name('raised-tiles'),
    actions: [{
        action: 'area-alpha',
        lineOut: 'image-grid',
        tileWidth: 30,
        tileHeight: 30,
        gutterWidth: 4,
        gutterHeight: 4,
        areaAlphaLevels: [255, 0, 0, 0],
    }, {
        action: 'flood',
        lineOut: 'shadow-grid',
    }, {
        action: 'area-alpha',
        lineIn: 'shadow-grid',
        lineOut: 'shadow-grid',
        tileWidth: 30,
        tileHeight: 30,
        gutterWidth: 4,
        gutterHeight: 4,
        areaAlphaLevels: [255, 0, 0, 0],
    }, {
        action: 'gaussian-blur',
        lineIn: 'shadow-grid',
        lineOut: 'shadow-grid',
        radius: 2,
    }, {
        action: 'compose',
        compose: 'source-over',
        lineIn: 'image-grid',
        lineMix: 'shadow-grid',
        offsetX: 2,
        offsetY: 2,
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('raised-tiles'));


// Blotchy color effect
canvas = scrawl.findCanvas('canvas-8');
namespace = canvas.name;

scrawl.makeNoiseAsset({

    name: name('blotch-effect'),
    width: 400,
    height: 400,

    colors: [
        [0, 'rgba(0 0 0 / 0)'],
        [999, 'rgba(0 0 0 / 1)']
    ],

    easing: 'easeOut',
})

scrawl.makeFilter({

    name: name('blotches'),
    actions: [{
        action: 'process-image',
        asset: name('blotch-effect'),
        width: '100%',
        height: '100%',
        copyWidth: '100%',
        copyHeight: '100%',
        lineOut: 'noise',
    }, {
        action: 'grayscale',
        lineOut: 'gray',
    }, {
        action: 'compose',
        compose: 'source-in',
        lineMix: 'noise',
        lineOut: 'color',
    }, {
        action: 'compose',
        compose: 'destination-over',
        lineIn: 'gray',
        lineMix: 'color',
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('blotches'));


// Watermark effect
canvas = scrawl.findCanvas('canvas-9');
namespace = canvas.name;

canvas.buildCell({

    name: name('watermark-pattern-cell'),
    shown: false,
    dimensions: [200, 150],
    skewX: 0.2,
    skewY: -0.4,
});

scrawl.makeLabel({

    name: name('watermark-text'),
    group: name('watermark-pattern-cell'),
    text: 'Scrawl-canvas',
    fontString: 'bold 20px Arial',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    method: 'draw',
    shadowOffsetX: 1,
    shadowOffsetY: 1,
    shadowBlur: 0,
    shadowColor: 'white',
    textIsAccessible: false,
});

canvas.buildCell({

    name: name('watermark-display-cell'),
    shown: false,
    dimensions: ['100%', '100%'],
    compileOrder: 1,
});

scrawl.makeBlock({

    name: name('watermark-block'),
    group: name('watermark-display-cell'),
    dimensions: ['100%', '100%'],
    fillStyle: name('watermark-pattern-cell'),
});

scrawl.makeFilter({

    name: name('watermark'),
    actions: [{
        action: 'process-image',
        asset: name('watermark-display-cell'),
        width: '100%',
        height: '100%',
        copyWidth: '100%',
        copyHeight: '100%',
        lineOut: 'watermark-panel',
    }, {
        action: 'compose',
        compose: 'destination-over',
        lineMix: 'watermark-panel',
        opacity: 0.7,
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('watermark'));


// Animated rays effect
canvas = scrawl.findCanvas('canvas-10');
namespace = canvas.name;

canvas.buildCell({

    name: name('rays-cell'),
    shown: false,
    dimensions: ['100%', '100%'],
});

scrawl.makeConicGradient({

    name: name('rays-filter'),
    start: ['center', 'center'],
    colors: [
        [0, 'red'],
        [9, 'red'],
        [239, 'green'],
        [259, 'green'],
        [489, 'gold'],
        [509, 'gold'],
        [739, 'blue'],
        [759, 'blue'],
        [989, 'red'],
        [999, 'red'],
    ],
    colorSpace: 'LAB',
});

scrawl.makeWheel({

    name: name('ray-wheel'),
    group: name('rays-cell'),
    radius: '150%',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fillStyle: name('rays-filter'),
    lockFillStyleToEntity: true,
    delta: {
        roll: 0.5,
    }
});

scrawl.makeFilter({

    name: name('rays'),
    actions: [{
        action: 'process-image',
        asset: name('rays-cell'),
        width: '100%',
        height: '100%',
        copyWidth: '100%',
        copyHeight: '100%',
        lineOut: 'rays-panel',
    }, {
        action: 'blend',
        lineMix: 'rays-panel',
        blend: 'difference',
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('rays'));


// Grayscale cathode ray tube
canvas = scrawl.findCanvas('canvas-11');
namespace = canvas.name;

scrawl.makeFilter({

    name: name('grayscale-crt'),
    actions: [{
        action: 'area-alpha',
        tileWidth: 20,
        tileHeight: 2,
        gutterWidth: 1,
        gutterHeight: 1,
        areaAlphaLevels: [255, 100, 255, 100],
    }, {
        action: 'modulate-channels',
        red: 0.7,
        green: 0.7,
        blue: 0.7,
    }, {
        action: 'gaussian-blur',
        radius: 1.2,
    }, {
        action: 'grayscale',
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('grayscale-crt'));


// Color cathode ray tube
canvas = scrawl.findCanvas('canvas-12');
namespace = canvas.name;

scrawl.makeFilter({

    name: name('color-crt'),
    actions: [{
        action: 'area-alpha',
        tileWidth: 20,
        tileHeight: 2,
        gutterWidth: 1,
        gutterHeight: 1,
        areaAlphaLevels: [255, 100, 255, 100],
    }, {
        action: 'modulate-channels',
        red: 0.7,
        green: 0.7,
        blue: 0.7,
    }, {
        action: 'gaussian-blur',
        radius: 1.2,
    }],
});

/** @ts-expect-error */
scrawl.findEntity(name('display')).addFilters(name('color-crt'));


// #### Drag-and-Drop image loading functionality
// We'll only add any user images to the first canvas, which contains an assets &lt;div> element
addImageDragAndDrop(canvases, `#canvas-1 .assets`, pictures);


// #### Development and testing
console.log(scrawl.library);
