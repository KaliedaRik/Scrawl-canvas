// # Demo Canvas 007 
// Apply filters at the entity, group and cell level

// [Run code](../../demo/canvas-007.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

scrawl.importDomImage('.filter-image');

canvas.set({
    fit: 'fill',
    backgroundColor: 'beige',
    css: {
        border: '1px solid black'
    }
});


let myGrad = scrawl.makeGradient({
    name: 'linear1',
    endX: '100%',
    colors: [
        [0, 'pink'],
        [999, 'darkgreen']
    ],
}).clone({
    name: 'linear2',
    colors: [
        [0, 'darkblue'],
        [999, 'white']
    ],
}).clone({
    name: 'linear3',
    colors: [
        [0, 'yellow'],
        [999, 'purple']
    ],
}).clone({
    name: 'linear4',
    colors: [
        [0, 'black'],
        [999, 'coral']
    ],
});


// Create entitys
let block1 = scrawl.makeBlock({
    name: 'b1',
    width: '70%',
    height: '70%',
    startX: '5%',
    startY: '5%',
    fillStyle: 'linear1',
    lockFillStyleToEntity: true,
    strokeStyle: 'coral',
    lineWidth: 4,
    method: 'fillAndDraw',
});

let block2 = block1.clone({
    name: 'b2',
    startX: '45%',
    startY: '47%',
    handleX: 'center',
    handleY: 'center',
    scale: 0.5,
    fillStyle: 'linear2',
    strokeStyle: 'red',
    delta: {
        roll: -0.5
    },
    order: 1,
});

let wheel1 = scrawl.makeWheel({
    name: 'w1',
    radius: '20%',
    startX: '70%',
    startY: '30%',
    handleX: 'center',
    handleY: 'center',
    fillStyle: 'linear3',
    lockFillStyleToEntity: true,
    strokeStyle: 'orange',
    lineWidth: 4,
    method: 'fillAndDraw',
});

let wheel2 = wheel1.clone({
    name: 'w2',
    startX: '32%',
    startY: '82%',
    handleX: '15%',
    handleY: 'center',
    scale: 0.7,
    fillStyle: 'linear4',
    strokeStyle: 'lightblue',
    delta: {
        roll: 1
    },
    order: 1,
});


// Define filters - need to test them all, plus some user-defined filters

scrawl.makeNoiseAsset({

    name: 'my-noise-generator',
    width: 400,
    height: 400,
    scale: 60,

    sumFunction: 'modular',
    sumAmplitude: 4,

    noiseEngine: 'worley-manhattan',
});

// Required, otherwise the asset generator doesn't produce anything for the filter
scrawl.makePicture({
    name: 'temp-1',
    asset: 'my-noise-generator',
    dimensions: [100, 100],
    copyDimensions: ['100%', '100%'],
    method: 'none',
});

scrawl.makePicture({
    name: 'temp-2',
    asset: 'iris',
    dimensions: [400, 400],
    copyDimensions: ['100%', '100%'],
    method: 'none',
});

// __Displace__ filter
scrawl.makeFilter({
    name: 'displace',
    actions: [
        {
            action: 'process-image',
            asset: 'my-noise-generator',
            width: 400,
            height: 400,
            copyWidth: 400,
            copyHeight: 400,
            lineOut: 'noise-map',
        },
        {
            action: 'displace',
            lineMix: 'noise-map',
            scaleX: 3,
            scaleY: 3,
            transparentEdges: true,
        }
    ],
});

// __Blend__ filter
scrawl.makeFilter({
    name: 'blend',
    actions: [
        {
            action: 'process-image',
            asset: 'iris',
            width: 400,
            height: 400,
            copyWidth: 400,
            copyHeight: 400,
            lineOut: 'flower',
        },
        {
            action: 'blend',
            lineMix: 'flower',
            blend: 'color-burn',
        }
    ],
});

// __Blend__ filter
scrawl.makeFilter({
    name: 'blend',
    actions: [
        {
            action: 'process-image',
            asset: 'iris',
            width: 400,
            height: 400,
            copyWidth: 400,
            copyHeight: 400,
            lineOut: 'flower',
        },
        {
            action: 'blend',
            lineMix: 'flower',
            blend: 'lighten',
        }
    ],
});

scrawl.makeFilter({
    name: 'compose',
    actions: [
        {
            action: 'process-image',
            asset: 'iris',
            width: 400,
            height: 400,
            copyWidth: 400,
            copyHeight: 400,
            lineOut: 'flower',
        },
        {
            action: 'compose',
            lineMix: 'flower',
            offsetX: 5,
            compose: 'destination-in',
        }
    ],
});

// __Gray__ filter
scrawl.makeFilter({
    name: 'gray',
    method: 'gray',

// __Grayscale__ filter
}).clone({
    name: 'grayscale',
    method: 'grayscale',

// __Sepia__ filter
}).clone({
    name: 'sepia',
    method: 'sepia',

// __Invert__ filter
}).clone({
    name: 'invert',
    method: 'invert',

// __Red__ filter
}).clone({
    name: 'red',
    method: 'red',

// __Green__ filter
}).clone({
    name: 'green',
    method: 'green',

// __Blue__ filter
}).clone({
    name: 'blue',
    method: 'blue',

// __Notred__ filter
}).clone({
    name: 'notred',
    method: 'notred',

// __Notgreen__ filter
}).clone({
    name: 'notgreen',
    method: 'notgreen',

// __Notblue__ filter
}).clone({
    name: 'notblue',
    method: 'notblue',

// __Cyan__ filter
}).clone({
    name: 'cyan',
    method: 'cyan',

// __Magenta__ filter
}).clone({
    name: 'magenta',
    method: 'magenta',

// __Yellow__ filter
}).clone({
    name: 'yellow',
    method: 'yellow',

// __Edge detect__ filter
}).clone({
    name: 'edgeDetect',
    method: 'edgeDetect',

// __Sharpen__ filter
}).clone({
    name: 'sharpen',
    method: 'sharpen',
});

// __Emboss__ filter
scrawl.makeFilter({
    name: 'emboss',
    method: 'emboss',
    angle: 225,
    strength: 10,
    tolerance: 50,
});

// __Chroma__ (green screen) filter
scrawl.makeFilter({
    name: 'chroma',
    method: 'chroma',
    ranges: [[0, 0, 0, 80, 80, 80], [180, 180, 180, 255, 255, 255]],
});

// __Brightness__ filter
scrawl.makeFilter({
    name: 'brightness',
    method: 'brightness',
    level: 0.5,

// __Saturation__ filter
}).clone({
    name: 'saturation',
    method: 'saturation',
    level: 1.4,

// __Threshhold__ filter
}).clone({
    name: 'threshold',
    method: 'threshold',
    level: 127,
    lowRed: 100,
    lowGreen: 0,
    lowBlue: 0,
    highRed: 220,
    highGreen: 60,
    highBlue: 60,
});

// __Channels__ filter
scrawl.makeFilter({
    name: 'channels',
    method: 'channels',
    red: 0.4,
    green: 0.8,
    blue: 0.6,

// __Channelstep__ filter
}).clone({
    name: 'channelstep',
    method: 'channelstep',
    red: 64,
    green: 64,
    blue: 64,
});

// __Tint__ filter
scrawl.makeFilter({
    name: 'tint',
    method: 'tint',
    redInRed: 0.5,
    redInGreen: 1,
    redInBlue: 0.9,
    greenInRed: 0,
    greenInGreen: 0.3,
    greenInBlue: 0.8,
    blueInRed: 0.8,
    blueInGreen: 0.8,
    blueInBlue: 0.4,
});

// __Offset__ filter
scrawl.makeFilter({
    name: 'offset',
    method: 'offset',
    offsetX: 12,
    offsetY: 12,
    opacity: 0.5,
});

// __Offset Channels__ filter
scrawl.makeFilter({
    name: 'offsetChannels',
    method: 'offsetChannels',
    offsetRedX: -12,
    offsetRedY: -8,
    offsetGreenX: 12,
    offsetGreenY: 16,
    offsetBlueX: 5,
    offsetBlueY: -15,
});

// __Pixellate__ filter
scrawl.makeFilter({
    name: 'pixelate',
    method: 'pixelate',
    tileWidth: 20,
    tileHeight: 20,
    offsetX: 8,
    offsetY: 8,
});

// __Blur__ filter
scrawl.makeFilter({
    name: 'blur',
    method: 'blur',
    radius: 8,
    passes: 1,
    excludeTransparentPixels: true,
});

// __Gaussian Blur__ filter
scrawl.makeFilter({
    name: 'gaussianBlur',
    method: 'gaussianBlur',
    radius: 30,
});

// __AreaAlpha__ filter
scrawl.makeFilter({
    name: 'areaAlpha',
    method: 'areaAlpha',
    tileWidth: 20,
    tileHeight: 20,
    gutterWidth: 20,
    gutterHeight: 20,
    offsetX: 8,
    offsetY: 8,
    areaAlphaLevels: [255, 0, 0, 255],
});

// __Matrix__ filter
scrawl.makeFilter({
    name: 'matrix',
    method: 'matrix',
    weights: [-1, -1, 0, -1, 1, 1, 0, 1, 1],

// __Matrix5__ filter
}).clone({
    name: 'matrix5',
    method: 'matrix5',
    weights: [-1, -1, -1, -1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
});

// __ChannelLevels__ filter
scrawl.makeFilter({
    name: 'channelLevels',
    method: 'channelLevels',
    red: [50, 200],
    green: [60, 220, 150],
    blue: [40, 180],
    alpha: [],
});

scrawl.makeFilter({
    name: 'chromakey',
    method: 'chromakey',
    red: 0,
    green: 127,
    blue: 0,
    opaqueAt: 0.7,
    transparentAt: 0.5,
});

scrawl.makeFilter({
    name: 'alphaToChannels',
    method: 'alphaToChannels',
    includeRed: false,
    includeGreen: false,
    excludeRed: false,
});

scrawl.makeFilter({
    name: 'binary',
    method: 'binary',
    red: 0,
    green: 100,
    blue: 200,
});

scrawl.makeFilter({
    name: 'channelsToAlpha',
    method: 'channelsToAlpha',
});

scrawl.makeFilter({
    name: 'clampChannels',
    method: 'clampChannels',
    lowRed: 0,
    highRed: 64,
    lowGreen: 100,
    highGreen: 200,
    lowBlue: 200,
    highBlue: 255,
});

scrawl.makeFilter({
    name: 'corrode',
    method: 'corrode',
    width: 5,
    height: 5,
    operation: 'lowest',
});

scrawl.makeFilter({
    name: 'curveWeights',
    method: 'curveWeights',
    useMixedChannel: false,
    weights: [255, 2, 0, 0, 255, 5, -1, 0, 253, 8, -2, 0, 252, 11, -3, 0, 250, 14, -4, 0, 249, 16, -5, 1, 247, 19, -6, 1, 246, 22, -7, 1, 244, 24, -8, 1, 243, 26, -9, 1, 241, 29, -10, 0, 239, 31, -11, 0, 238, 33, -12, 0, 236, 35, -13, 0, 235, 37, -14, 0, 233, 39, -15, 0, 232, 41, -16, 1, 230, 43, -17, 1, 229, 45, -18, 1, 227, 46, -19, 1, 225, 48, -20, 1, 224, 50, -21, 1, 222, 51, -22, 0, 221, 53, -23, 0, 219, 54, -24, 0, 218, 56, -25, 0, 216, 57, -26, 0, 214, 58, -27, 1, 213, 60, -28, 1, 211, 61, -29, 1, 209, 62, -30, 1, 208, 63, -31, 0, 206, 64, -32, 0, 205, 65, -33, 0, 203, 66, -34, 0, 201, 68, -35, 0, 200, 68, -36, 0, 198, 69, -37, 1, 196, 70, -38, 1, 195, 71, -39, 1, 193, 72, -40, 1, 191, 73, -41, 1, 190, 73, -42, 0, 188, 74, -43, 0, 186, 75, -44, 0, 185, 75, -45, 0, 183, 76, -46, 0, 181, 77, -47, 0, 180, 77, -48, 1, 178, 78, -49, 1, 176, 78, -50, 1, 175, 79, -51, 1, 173, 80, -52, 1, 171, 80, -53, 1, 169, 80, -54, 0, 167, 81, -55, 0, 166, 81, -56, 0, 164, 81, -57, 0, 162, 82, -58, 0, 160, 82, -59, 1, 159, 82, -60, 1, 157, 82, -61, 1, 155, 83, -62, 1, 153, 83, -63, 0, 151, 83, -64, 0, 149, 83, -65, 0, 148, 83, -66, 0, 146, 83, -67, 0, 144, 84, -68, 0, 142, 84, -69, 1, 140, 84, -70, 1, 138, 84, -71, 1, 136, 84, -72, 1, 134, 84, -73, 1, 132, 84, -74, 0, 130, 84, -75, 0, 128, 84, -76, 0, 126, 84, -77, 0, 124, 84, -78, 0, 122, 84, -79, 0, 120, 84, -80, 1, 118, 83, -81, 1, 116, 83, -82, 1, 114, 83, -83, 1, 112, 83, -84, 1, 110, 83, -85, 1, 108, 83, -86, 0, 106, 82, -86, 0, 104, 82, -87, 0, 101, 82, -88, 0, 99, 82, -88, 0, 97, 82, -89, 1, 95, 81, -90, 1, 93, 81, -91, 1, 90, 81, -91, 1, 88, 80, -92, 0, 86, 80, -93, 0, 83, 80, -93, 0, 81, 79, -94, 0, 79, 79, -95, 0, 76, 79, -96, 0, 74, 78, -96, 1, 71, 78, -97, 1, 69, 78, -98, 1, 66, 77, -98, 1, 64, 77, -99, 1, 61, 76, -100, 0, 59, 76, -100, 0, 56, 76, -101, 0, 53, 75, -102, 0, 51, 75, -102, 0, 48, 74, -103, 0, 45, 74, -104, 1, 42, 73, -104, 1, 40, 73, -105, 1, 37, 72, -105, 1, 34, 72, -106, 1, 31, 71, -107, 1, 28, 71, -107, 0, 25, 70, -108, 0, 22, 70, -109, 0, 19, 69, -109, 0, 16, 69, -110, 0, 13, 68, -111, 1, 10, 68, -111, 1, 7, 67, -112, 1, 4, 67, -112, 1, 1, 66, -113, 0, -2, 65, -114, 0, -5, 65, -114, 0, -8, 64, -115, 0, -11, 64, -115, 0, -14, 63, -116, 0, -17, 62, -117, 1, -20, 62, -117, 1, -23, 61, -118, 1, -26, 61, -118, 1, -29, 60, -119, 1, -32, 59, -119, 0, -35, 59, -120, 0, -38, 58, -121, 0, -41, 58, -121, 0, -44, 57, -122, 0, -46, 56, -122, 0, -49, 56, -123, 1, -52, 55, -123, 1, -55, 54, -124, 1, -57, 54, -124, 1, -60, 53, -125, 1, -62, 52, -125, 1, -65, 52, -126, 0, -68, 51, -126, 0, -70, 51, -127, 0, -73, 50, -127, 0, -75, 49, -128, 0, -77, 49, -128, 1, -80, 48, -129, 1, -82, 47, -129, 1, -85, 47, -129, 1, -87, 46, -130, 0, -89, 45, -130, 0, -92, 45, -131, 0, -94, 44, -131, 0, -96, 43, -132, 0, -98, 43, -132, 0, -100, 42, -132, 1, -103, 41, -133, 1, -105, 41, -133, 1, -107, 40, -134, 1, -109, 39, -134, 1, -111, 39, -134, 0, -113, 38, -134, 0, -115, 37, -135, 0, -118, 37, -135, 0, -120, 36, -135, 0, -122, 35, -136, 0, -124, 35, -136, 1, -126, 34, -136, 1, -128, 33, -136, 1, -130, 33, -137, 1, -131, 32, -137, 1, -134, 31, -137, 1, -136, 31, -137, 0, -137, 30, -137, 0, -139, 29, -137, 0, -141, 29, -138, 0, -143, 28, -138, 0, -145, 27, -138, 1, -147, 27, -138, 1, -149, 26, -138, 1, -151, 26, -138, 1, -152, 25, -138, 0, -154, 24, -138, 0, -156, 24, -138, 0, -158, 23, -138, 0, -160, 23, -138, 0, -161, 22, -138, 0, -163, 21, -138, 1, -165, 21, -138, 1, -167, 20, -137, 1, -169, 20, -137, 1, -170, 19, -137, 1, -172, 18, -137, 0, -174, 18, -136, 0, -176, 17, -136, 0, -177, 17, -136, 0, -179, 16, -135, 0, -181, 16, -135, 0, -183, 15, -134, 1, -184, 15, -134, 1, -186, 14, -133, 1, -188, 14, -133, 1, -189, 13, -132, 1, -191, 13, -131, 1, -193, 12, -130, 0, -194, 12, -130, 0, -196, 11, -129, 0, -198, 11, -128, 0, -199, 10, -127, 0, -201, 10, -126, 1, -203, 9, -124, 1, -204, 9, -123, 1, -206, 8, -122, 1, -208, 8, -120, 0, -209, 8, -119, 0, -211, 7, -117, 0, -212, 7, -115, 0, -214, 6, -114, 0, -216, 6, -112, 0, -217, 6, -110, 1, -219, 5, -107, 1, -220, 5, -105, 1, -222, 5, -102, 1, -223, 4, -100, 1, -225, 4, -97, 0, -227, 4, -94, 0, -228, 3, -91, 0, -230, 3, -87, 0, -231, 3, -84, 0, -233, 3, -80, 0, -234, 2, -76, 1, -236, 2, -72, 1, -238, 2, -68, 1, -239, 2, -63, 1, -241, 2, -59, 1, -242, 1, -54, 1, -244, 1, -49, 0, -245, 1, -44, 0, -247, 1, -39, 0, -248, 1, -34, 0, -250, 1, -29, 0, -251, 1, -24, 1, 3, 1, -18, 1, 2, 1, -13, 1, 1, 1, -8, 1, 0, 0, -2, 0],
});

scrawl.makeFilter({
    name: 'flood',
    method: 'flood',
    alpha: 100,
});

scrawl.makeFilter({
    name: 'randomNoise',
    method: 'randomNoise',
    width: 10,
    height: 10,
    level: 0.7,
});

// <option value="mapToGradient">mapToGradient</option>
scrawl.makeGradient({
    name: 'red-to-blue',
    endX: '100%',

    colors: [
        [0, 'red'],
        [999, 'blue']
    ],
});

const myFilter = scrawl.makeFilter({

    name: 'mapToGradient',
    method: 'mapToGradient',

    gradient: 'red-to-blue',
});


scrawl.makeFilter({
    name: 'dropShadow',
    actions: [
        {
            action: 'gaussian-blur',
            lineIn: 'source-alpha',
            lineOut: 'shadow',
            radius: 2, 
        },
        {
            action: 'compose',
            lineIn: 'source',
            lineMix: 'shadow',
            offsetX: 6,
            offsetY: 6,
        }
    ],
});

scrawl.makeFilter({
    name: 'redBorder',
    actions: [
        {
            action: 'gaussian-blur',
            lineIn: 'source-alpha',
            lineOut: 'shadow',
            radius: 2,
        },
        {
            action: 'binary',
            lineIn: 'shadow',
            lineOut: 'shadow',
            alpha: 1, 
        },
        {
            action: 'flood',
            lineIn: 'shadow',
            lineOut: 'red-flood',
            red: 255,
        },
        {
            action: 'compose',
            lineIn: 'shadow',
            lineMix: 'red-flood',
            lineOut: 'colorized',
            compose: 'destination-in',
        },
        {
            action: 'compose',
            lineIn: 'source',
            lineMix: 'colorized',
        }
    ],
});


// #### Scene animation
const report = reportSpeed('#reportmessage');

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Event listeners function
let events = function () {

    let base = canvas.base,
        group = scrawl.library.group[base.name],
        currentTarget, currentFilter;

    return function (e) {

        e.preventDefault();
        e.returnValue = false;

        let action = false, 
            val;

        switch (e.target.id) {

            case 'target':
                val = e.target.value;

                if (val !== currentTarget) {

                    currentTarget = val;
                    action = true;
                }
                break;

            case 'filter':
                val = e.target.value;

                if(val !== currentFilter){

                    currentFilter = val.split(',');
                    action = true;
                }
                break;
        }

        if (action) {

            base.clearFilters();
            group.clearFilters();
            group.clearFiltersFromEntitys();

            if (currentTarget && currentFilter) {

                switch (currentTarget) {

                    case 'block1' :
                        block1.addFilters(...currentFilter);
                        break;

                    case 'block2' :
                        block2.addFilters(...currentFilter);
                        break;

                    case 'wheel1' :
                        wheel1.addFilters(...currentFilter);
                        break;

                    case 'wheel2' :
                        wheel2.addFilters(...currentFilter);
                        break;

                    case 'group' :
                        group.addFilters(...currentFilter);
                        break;

                    case 'cell' :
                        base.addFilters(...currentFilter);
                        break;
                }
            }
        }
    };
}();

// Event listeners
scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

// Set DOM form initial input values
document.querySelector('#target').value = '';
document.querySelector('#filter').value = '';


// #### Development and testing
console.log(scrawl.library);

// Gradient packet test
console.log(myGrad.saveAsPacket());
console.log(myGrad.palette.saveAsPacket());

// RESULT:
// ```
// [
//     "linear4",
//     "Gradient",
//     "styles",
//     {
//         "name":"linear4",
//         "start":[0,0],
//         "end":["100%",0],
//         "palette":"linear4_palette",
//         "colors":{
//             "0 ":[0,0,0,1],
//             "999 ":[255,127,80,1]
//         }
//     }
// ]
// [
//     "linear4_palette",
//     "Palette",
//     "palette",
//     {
//         "name":"linear4_palette",
//         "colors":{
//             "0 ":[0,0,0,1],
//             "999 ":[255,127,80,1]
//         }
//     }
// ]
// ```
