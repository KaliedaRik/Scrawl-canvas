// # Demo Particles 013
// Seasons greetings

// [Run code](../../demo/particles-013.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.setBase({
    backgroundColor: 'navy',
    compileOrder: 1,
});


// #### Christmas tree Shape entity
// We generate a 'twinkling' particle Emitter using this entity's shape as a generation field. We also position the 'star' particle Emitter on this entity's path, alongside a set of 10 'candle' Pictures
const tree = scrawl.makeShape({

    name: 'my-tree',

    pathDefinition: 'M 1049.6339,1050 C 1049.6339,1050 1030.0866,1022.855 1019.4084,1003.5845 C 991.5593,954.92478 986.46204,868.69686 979.32292,780.61374 C 979.32292,780.61374 1022.3499,838.11219 1052.1807,857.87889 C 1061.3371,863.94619 1085.4929,869.8246 1085.4929,869.8246 L 1138.1801,908.67848 C 1138.1801,908.67848 1229.7506,966.738 1241.4829,953.27545 C 1251.6457,941.61167 1177.0219,890.53297 1150.458,859.57897 C 1123.8942,828.625 1078.1083,775.02293 1085.4929,768.6793 C 1085.4929,768.6793 1120.9803,809.96348 1147.5318,819.95537 C 1153.1541,822.07274 1165.8575,819.22515 1170.5407,822.98904 C 1201.6335,847.96874 1239.8905,866.16504 1276.7703,883.65648 C 1326.4934,907.2406 1432.0937,928.36623 1432.4404,911.839 C 1432.5948,904.4776 1364.7319,871.36397 1299.0621,817.82956 C 1228.6904,760.458 1163.527,674.95463 1152.9663,662.29841 C 1142.675,649.96363 1234.3802,721.91704 1276.7703,717.313 C 1280.7075,716.88726 1280.1051,706.69523 1283.8876,707.86808 C 1314.0423,717.21997 1345.6886,727.02011 1370.4551,732.13167 C 1437.8515,746.0453 1438.1332,733.547 1437.5631,724.27404 C 1437.0206,715.44937 1237.418,666.37808 1105.4596,514.91526 C 1100.3923,509.09889 1156.4895,551.98167 1185.1454,544.04793 C 1189.2891,542.90045 1188.6277,535.21482 1192.8987,535.71104 C 1218.2777,538.65445 1299.3631,566.90467 1298.7537,545.06011 C 1298.4037,532.51386 1230.5378,512.781 1170.7235,471.37556 C 1119.3785,435.83445 1080.4259,400.30745 1058.2683,379.16489 C 1052.6276,373.78271 1096.7566,406.8033 1116.3075,400.52452 C 1119.2343,399.58567 1116.8789,394.74197 1119.9305,395.11415 C 1136.9769,397.18074 1195.0389,429.0623 1200.81,409.55219 C 1202.0804,405.25545 1148.0173,376.24119 1101.588,340.34766 C 1055.1587,304.45412 1015.8333,263.80146 1015.8333,263.80146 C 1028.2571,271.14877 1044.0133,281.27599 1054.2258,279.95934 C 1055.7326,279.10224 1058.8007,278.21978 1057.0348,273.17309 C 1063.5569,274.37696 1103.9124,294.83721 1107.0658,281.63969 C 1108.7025,277.62489 1044.8219,244.56483 1009.291,216.46406 C 971.49092,186.56734 933.15826,149.99997 933.15826,149.99997 C 933.15826,149.99997 894.82544,186.56734 857.02537,216.46406 C 821.49448,244.56483 757.61385,277.62489 759.25055,281.63969 C 762.40389,294.83721 802.75948,274.37696 809.28155,273.17309 C 807.51567,278.21978 810.58381,279.10224 812.09059,279.95934 C 822.30307,281.27599 838.05918,271.14877 850.48307,263.80146 C 850.48307,263.80146 811.15767,304.45412 764.72841,340.34766 C 718.29911,376.24119 664.23589,405.25545 665.50633,409.55219 C 671.27744,429.0623 729.33944,397.18074 746.38589,395.11415 C 749.43744,394.74197 747.08207,399.58567 750.00885,400.52452 C 769.5597,406.8033 813.68878,373.78271 808.04807,379.16489 C 785.89052,400.30745 746.93789,435.83445 695.59281,471.37556 C 635.77859,512.781 567.91263,532.51386 567.56263,545.06011 C 566.95322,566.90467 648.03863,538.65445 673.4177,535.71104 C 677.68863,535.21482 677.02726,542.90045 681.171,544.04793 C 709.82685,551.98167 765.92404,509.09889 760.8567,514.91526 C 628.89841,666.37808 429.2957,715.44937 428.75322,724.27404 C 428.18315,733.547 428.46481,746.0453 495.86126,732.13167 C 520.62778,727.02011 552.27407,717.21997 582.42874,707.86808 C 586.21126,706.69523 585.60889,716.88726 589.54604,717.313 C 631.93615,721.91704 723.64137,649.96363 713.35007,662.29841 C 702.78933,674.95463 637.626,760.458 567.25422,817.82956 C 501.58452,871.36397 433.72152,904.4776 433.87596,911.839 C 434.22263,928.36623 539.82289,907.2406 589.54604,883.65648 C 626.42589,866.16504 664.68285,847.96874 695.77563,822.98904 C 700.45881,819.22515 713.1623,822.07274 718.78455,819.95537 C 745.33607,809.96348 780.82344,768.6793 780.82344,768.6793 C 788.20804,775.02293 742.42218,828.625 715.85833,859.57897 C 689.29448,890.53297 614.67067,941.61167 624.83348,953.27545 C 636.56578,966.738 728.13626,908.67848 728.13626,908.67848 L 780.82344,869.8246 C 780.82344,869.8246 804.97922,863.94619 814.13567,857.87889 C 843.96641,838.11219 886.99344,780.61374 886.99344,780.61374 C 879.85433,868.69686 874.75704,954.92478 846.90796,1003.5845 C 836.22978,1022.855 816.68115,1050 816.68115,1050 C 894.33207,1050 971.983,1050 1049.6339,1050 z',

    start: ['center', '60%'],
    handle: ['center', 'center'],

    fillStyle: 'darkgreen',
    lineWidth: 4,

    scale: 0.5,

    useAsPath: true,
    precision: 1,

    method: 'fill',
});


// #### Greetings logo
scrawl.makeQuadratic({

    name: 'text-arch',

    startX: '10%',
    startY: '30%',
    endX: '90%',
    endY: '30%',
    controlX: '50%',
    controlY: '0%',

    method: 'draw',

    useAsPath: true,
    visibility: false,
});

scrawl.makePhrase({

    name: 'message',

    text: 'HAPPY HOLIDAYS',

    textPath: 'text-arch',
    textPathPosition: 0.06,
    handleY: 'bottom',

    size: '50px',
    family: '"Brush Script MT", "Brush Script Std", "Lucida Calligraphy", "Lucida Handwriting", "Apple Chancery", cursive',

    justify: 'center',
    lineHeight: 0,
    letterSpacing: 4,

    fillStyle: 'red',
    strokeStyle: 'yellow',
    lineWidth: 4,

    method: 'drawThenFill',
});


// ### Particle physics
// The world object will be used by multiple Emitter entitys
const myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,
});


// #### Star decoration
// The tree topper decoration is a star which generates a cloud of multicoloured stars
// + Uses a point-based Emitter entity positioned along the tree Shape entity's path
scrawl.makeEmitter({

    name: 'star-particles',
    world: myWorld,

    path: 'my-tree',
    pathPosition: 0.484,
    lockTo: 'path',

    generationRate: 10,
    killAfterTime: 6,

    rangeX: 10,
    rangeFromX: -5,

    rangeY: -10,
    rangeFromY: -5,

    rangeZ: -1,
    rangeFromZ: -0.2,

    fillMinimumColor: 'pink',
    fillMaximumColor: 'white',

    // Define the artefact used to visualize the particles as part of the Emitter factory function
    artefact: scrawl.makeStar({

        name: 'particle-star-entity',

        radius1: 20,
        radius2: 14,

        points: 5,

        handle: ['center', 'center'],

        method: 'fill',
        visibility: false, 

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            remaining, globalAlpha, scale, start, z, roll;

        // These particles only keep data for their most recent position
        if (history.length) {

            [remaining, z, ...start] = history[0];
            globalAlpha = remaining / 6;
            scale = 1 + (z / 3);

            if (globalAlpha > 0 && scale > 0) {

                artefact.simpleStamp(host, {
                    start, 
                    scale, 
                    globalAlpha, 
                    fillStyle: particle.fill,
                });
            }
        }
    },
});

// The static star goes over the top of the Emitter entity's stars
scrawl.makeStar({

    name: 'main-star',

    radius1: 21,
    radius2: 15,
    points: 5,

    path: 'my-tree',
    pathPosition: 0.484,
    lockTo: 'path',

    handle: ['center', 'center'],

    fillStyle: 'yellow',
    strokeStyle: 'gold',
    lineWidth: 2,
    method: 'fillThenDraw',
});


// #### Tree spangles 
// The tree spangles decoration is a set of stars within the tree which fade in, rotate andf elongate over the course of their lives
// + Uses an area-based Emitter entity positioned within the tree Shape entity's path
scrawl.makeEmitter({

    name: 'spangles-particles',

    world: myWorld,

    generateInArea: tree,
    // generateAlongPath: tree.name,

    particleCount: 100,
    generationRate: 10,

    killAfterTime: 30,
    killAfterTimeVariation: 5,

    fillMinimumColor: 'lightgray',
    fillMaximumColor: 'white',

    artefact: scrawl.makeStar({

        name: 'particle-spangle-entity',

        radius1: 6,
        radius2: 2,

        points: 4,

        handle: ['center', 'center'],

        method: 'fill',
        visibility: false, 

        delta: {
            roll: 0.6,
        },

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
    }),

    stampAction: function (artefact, particle, host) {

        let history = particle.history;

        // These particles only keep data for their most recent position
        if (history.length) {

            let [remaining, z, ...start] = history[0];

            // This function handles fadein/out, and spangle shape. Spangle rotation is handled by the spangle entity itself, using a delta animation
            let globalAlpha = 1,
                radius1 = 6;

            // Fade in young particles
            if (remaining > 18) {

                globalAlpha = 1 / (remaining - 18);
            }
            // Fade out old particles
            else if (remaining < 2) {

                globalAlpha = remaining / 2;
            }

            // Limit the globalAlpha value to between 0 and 1
            if (globalAlpha > 1) globalAlpha = 1;

            // Grow and shrink the spangle's spikes as it matures
            if (remaining < 8) {

                if (remaining > 4) radius1 = 6 + ((8 - remaining) * 5);
                else radius1 = 6 + (remaining * 5);
            }

            artefact.simpleStamp(host, {
                start, 
                fillStyle: particle.fill,
                globalAlpha,
                radius1,
            });
        }
    },
});


// #### Candles with flames
// The scene uses ten candles with a particle-based flame effect. Rather than create all ten candles, with ten Emitters, we can instead define one candle + one Emitter in its own Cell, then use that Cell as the asset for ten Picture entitys - a much more efficient approach.

// Create a Cell in which to build our candle and flame animation
canvas.buildCell({

    name: 'candle-cell',

    width: 100,
    height: 100,

    shown: false,
});

// We'll apply a filter to the flame
scrawl.makeFilter({

    name: 'blur',
    method: 'blur',
    radius: 2,
    includeAlpha: true,
});


// The flame animation uses a point-based Emitter entity positioned at the center of the Cell
const myEmitter = scrawl.makeEmitter({

    name: 'flame',
    group: 'candle-cell',

    world: myWorld,

    start: ['center', 'center'],

    generationRate: 25,
    killAfterTime: 4,

    rangeX: 2,
    rangeFromX: -1,

    rangeY: -5,
    rangeFromY: -0.5,

    rangeZ: 1,
    rangeFromZ: 0,

    fillMinimumColor: 'orange',
    fillMaximumColor: 'yellow',

    filters: 'blur',

    stampAction: function (artefact, particle, host) {

        let engine = host.engine,
            history = particle.history,
            len = history.length,
            remaining, radius, alpha, x, y, z,
            endRad = Math.PI * 2;

// @ts-expect-error
        let colorFactory = this.fillColorFactory;

        engine.save();
        engine.setTransform(1, 0, 0, 1, 0, 0);

        history.forEach((p, index) => {

            [remaining, z, x, y] = p;
            radius = 2 + z;
            alpha = remaining / 4;

            if (radius > 0 && alpha > 0) {

                // We could have used a Wheel entity instead
                engine.beginPath();
                engine.moveTo(x, y);
                engine.arc(x, y, radius, 0, endRad);
                engine.globalAlpha = alpha;
                engine.fillStyle = colorFactory.get(alpha);
                engine.fill();
            }
        });
        engine.restore();
    },
});

// The candle itself is just a Block entity
scrawl.makeBlock({

    name: 'candle',
    group: 'candle-cell',

    start: ['center', 'center'],
    handle: ['center', '-10%'],
    dimensions: ['6%', '25%'],

    fillStyle: 'white',
    method: 'fill',
});

// Define a Picture entity which will display the candle + flame animation
// + The entity is positioned along the tree Shape entity's path
scrawl.makePicture({

    name: 'candle-1',

    width: 100,
    height: 100,

    copyWidth: '100%',
    copyHeight: '100%',

    path: 'my-tree',
    pathPosition: 0.175,
    lockTo: 'path',

    handle: ['center', '74%'],

    asset: 'candle-cell',

// The Picture entity gets cloned nine times
}).clone({

    name: 'candle-2',
    pathPosition: 0.793,
    
}).clone({

    name: 'candle-3',
    pathPosition: 0.272,
    
}).clone({

    name: 'candle-4',
    pathPosition: 0.696,
    
}).clone({

    name: 'candle-5',
    pathPosition: 0.352,
    
}).clone({

    name: 'candle-6',
    pathPosition: 0.616,
    
}).clone({

    name: 'candle-7',
    pathPosition: 0.413,
    
}).clone({

    name: 'candle-8',
    pathPosition: 0.555,
    
}).clone({

    name: 'candle-9',
    pathPosition: 0.459,
    
}).clone({

    name: 'candle-10',
    pathPosition: 0.509,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
