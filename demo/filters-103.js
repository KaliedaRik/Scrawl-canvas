// # Demo Filters 103 
// A gallery of compound filter effects

// [Run code](../../demo/filters-103.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


scrawl.importDomImage('.flowers');


// #### Scene setup and animation
const {
    'canvas-1':canvas1, 
    'canvas-2':canvas2, 
    'canvas-3':canvas3, 
    'canvas-4':canvas4,
    'canvas-5':canvas5,
    'canvas-6':canvas6,
    'canvas-7':canvas7,
    'canvas-8':canvas8,
    'canvas-9':canvas9,
    'canvas-10':canvas10,
    'canvas-11':canvas11,
    'canvas-12':canvas12,
} = scrawl.library.canvas;

// Create the target entitys
scrawl.makePicture({

    name: 'canvas-output-1',
    group: canvas1.base.name,
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    filters: ['blotchy-newsprint'],
    memoizeFilterOutput: true,

}). clone({

    name: 'canvas-output-2',
    group: canvas2.base.name,
    filters: ['jagged-shapes'],

}). clone({

    name: 'canvas-output-3',
    group: canvas3.base.name,
    filters: ['brass-rubbing'],

}). clone({

    name: 'canvas-output-4',
    group: canvas4.base.name,
    filters: ['blueprint'],

}). clone({

    name: 'canvas-output-5',
    group: canvas5.base.name,
    filters: ['comic'],

}). clone({

    name: 'canvas-output-6',
    group: canvas6.base.name,
    filters: ['square-quilt'],

}). clone({

    name: 'canvas-output-7',
    group: canvas7.base.name,
    filters: ['raised-tiles'],

}). clone({

    name: 'canvas-output-8',
    group: canvas8.base.name,
    filters: ['blotches'],

}). clone({

    name: 'canvas-output-9',
    group: canvas9.base.name,
    filters: ['watermark'],

}). clone({

    name: 'canvas-output-10',
    group: canvas10.base.name,
    filters: ['rays'],

}). clone({

    name: 'canvas-output-11',
    group: canvas11.base.name,
    filters: ['grayscale-crt'],

}). clone({

    name: 'canvas-output-12',
    group: canvas12.base.name,
    filters: ['color-crt'],
});

const pictures = scrawl.makeGroup({
    name: 'target-images',
}).addArtefacts('canvas-output-1', 'canvas-output-2', 'canvas-output-3', 'canvas-output-4', 'canvas-output-5', 'canvas-output-6', 'canvas-output-7', 'canvas-output-8', 'canvas-output-9', 'canvas-output-10', 'canvas-output-11', 'canvas-output-12');


// Animation
const report = reportSpeed('#reportmessage');

scrawl.makeRender({
    name: "demo-reporter",
    noTarget: true,
    afterShow: report,
});

scrawl.makeRender({
    name: "demo-canvases",
    target: [canvas1, canvas2, canvas3, canvas4, canvas5, canvas6, canvas7, canvas8, canvas9, canvas10, canvas11, canvas12],
    observer: true,
});


// #### Filter setup
// Blotchy newsprint
scrawl.makeFilter({

    name: 'blotchy-newsprint',
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


// Translucent jagged edges effect
const points1 = [],
    points2 = [];

for (let i = 0; i < 2000; i++) {
    points1.push(Math.floor(Math.random() * 400));
    points2.push(Math.floor(Math.random() * 400));
}

scrawl.makeFilter({

    name: 'jagged-shapes',
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


// Brass rubbing effect
scrawl.makeFilter({

    name: 'brass-rubbing',
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


// Blueprint effect
scrawl.makeFilter({

    name: 'blueprint',
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


// Comic effect
scrawl.makeFilter({

    name: 'comic',
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


// Square quilt effect
scrawl.makeFilter({

    name: 'square-quilt',
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


// Raised tiles effect
scrawl.makeFilter({

    name: 'raised-tiles',
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


// Blotchy color effect
scrawl.makeNoiseAsset({

    name: 'worley-basic',
    width: 400,
    height: 400,

    // noiseEngine: 'worley-euclidean',

    colors: [
        [0, 'rgba(0 0 0 / 0)'],
        [999, 'rgba(0 0 0 / 1)']
    ],

    easing: 'easeOut',
})

scrawl.makeFilter({

    name: 'blotches',
    actions: [{
        action: 'process-image',
        asset: 'worley-basic',
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


// Watermark effect
canvas9.setBase({
    compileOrder: 2,
});

canvas9.buildCell({

    name: 'watermark-pattern-cell',
    shown: false,
    dimensions: [200, 150],
    useAsPattern: true,
    skewX: 0.2,
    skewY: -0.4,
    compileOrder: 0,
});

scrawl.makePhrase({

    name: 'watermark-text',
    group: 'watermark-pattern-cell',
    text: 'Scrawl-canvas',
    family: 'Arial, sans-serif',
    weight: 'bold',
    size: '25px',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    method: 'draw',
});

canvas9.buildCell({

    name: 'watermark-display-cell',
    shown: false,
    dimensions: ['100%', '100%'],
    compileOrder: 1,
});

scrawl.makeBlock({

    name: 'watermark-block',
    group: 'watermark-display-cell',
    dimensions: ['100%', '100%'],
    fillStyle: 'watermark-pattern-cell',
});

scrawl.makeFilter({

    name: 'watermark',
    actions: [{
        action: 'process-image',
        asset: 'watermark-display-cell',
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


// Animated rays effect
canvas10.buildCell({

    name: 'rays-cell',
    shown: false,
    dimensions: ['100%', '100%'],
});

canvas10.setBase({
    compileOrder: 1,
});

scrawl.makeConicGradient({

    name: 'rays-filter',
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

    name: 'ray-wheel',
    group: 'rays-cell',
    radius: '150%',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fillStyle: 'rays-filter',
    lockFillStyleToEntity: true,
    delta: {
        roll: 0.5,
    }
});

scrawl.makeFilter({

    name: 'rays',
    actions: [{
        action: 'process-image',
        asset: 'rays-cell',
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


// Grayscale cathode ray tube
scrawl.makeFilter({

    name: 'grayscale-crt',
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


// Color cathode ray tube
scrawl.makeFilter({

    name: 'color-crt',
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



// #### Drag-and-Drop image loading functionality
addImageDragAndDrop([canvas1, canvas2, canvas3, canvas4, canvas5, canvas6, canvas7, canvas8, canvas9, canvas10, canvas11, canvas12], '#my-image-store', pictures);


// #### Development and testing
console.log(scrawl.library);
