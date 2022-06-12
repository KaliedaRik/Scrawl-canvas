// # Demo Canvas 012 
// Shape entity position; shape entity as a path for other artefacts to follow

// [Run code](../../demo/canvas-012.html)
import {
    library as L,
    makeRender,
    makeShape,
    makeWheel,
    observeAndUpdate,
} from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup

// Create Shape entity
let arrow = makeShape({

    name: 'myArrow',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    /* 
    //Alternative path for testing
    pathDefinition: 'M 1049.6339,1050 C 1049.6339,1050 1030.0866,1022.855 1019.4084,1003.5845 C 991.5593,954.92478 986.46204,868.69686 979.32292,780.61374 C 979.32292,780.61374 1022.3499,838.11219 1052.1807,857.87889 C 1061.3371,863.94619 1085.4929,869.8246 1085.4929,869.8246 L 1138.1801,908.67848 C 1138.1801,908.67848 1229.7506,966.738 1241.4829,953.27545 C 1251.6457,941.61167 1177.0219,890.53297 1150.458,859.57897 C 1123.8942,828.625 1078.1083,775.02293 1085.4929,768.6793 C 1085.4929,768.6793 1120.9803,809.96348 1147.5318,819.95537 C 1153.1541,822.07274 1165.8575,819.22515 1170.5407,822.98904 C 1201.6335,847.96874 1239.8905,866.16504 1276.7703,883.65648 C 1326.4934,907.2406 1432.0937,928.36623 1432.4404,911.839 C 1432.5948,904.4776 1364.7319,871.36397 1299.0621,817.82956 C 1228.6904,760.458 1163.527,674.95463 1152.9663,662.29841 C 1142.675,649.96363 1234.3802,721.91704 1276.7703,717.313 C 1280.7075,716.88726 1280.1051,706.69523 1283.8876,707.86808 C 1314.0423,717.21997 1345.6886,727.02011 1370.4551,732.13167 C 1437.8515,746.0453 1438.1332,733.547 1437.5631,724.27404 C 1437.0206,715.44937 1237.418,666.37808 1105.4596,514.91526 C 1100.3923,509.09889 1156.4895,551.98167 1185.1454,544.04793 C 1189.2891,542.90045 1188.6277,535.21482 1192.8987,535.71104 C 1218.2777,538.65445 1299.3631,566.90467 1298.7537,545.06011 C 1298.4037,532.51386 1230.5378,512.781 1170.7235,471.37556 C 1119.3785,435.83445 1080.4259,400.30745 1058.2683,379.16489 C 1052.6276,373.78271 1096.7566,406.8033 1116.3075,400.52452 C 1119.2343,399.58567 1116.8789,394.74197 1119.9305,395.11415 C 1136.9769,397.18074 1195.0389,429.0623 1200.81,409.55219 C 1202.0804,405.25545 1148.0173,376.24119 1101.588,340.34766 C 1055.1587,304.45412 1015.8333,263.80146 1015.8333,263.80146 C 1028.2571,271.14877 1044.0133,281.27599 1054.2258,279.95934 C 1055.7326,279.10224 1058.8007,278.21978 1057.0348,273.17309 C 1063.5569,274.37696 1103.9124,294.83721 1107.0658,281.63969 C 1108.7025,277.62489 1044.8219,244.56483 1009.291,216.46406 C 971.49092,186.56734 933.15826,149.99997 933.15826,149.99997 C 933.15826,149.99997 894.82544,186.56734 857.02537,216.46406 C 821.49448,244.56483 757.61385,277.62489 759.25055,281.63969 C 762.40389,294.83721 802.75948,274.37696 809.28155,273.17309 C 807.51567,278.21978 810.58381,279.10224 812.09059,279.95934 C 822.30307,281.27599 838.05918,271.14877 850.48307,263.80146 C 850.48307,263.80146 811.15767,304.45412 764.72841,340.34766 C 718.29911,376.24119 664.23589,405.25545 665.50633,409.55219 C 671.27744,429.0623 729.33944,397.18074 746.38589,395.11415 C 749.43744,394.74197 747.08207,399.58567 750.00885,400.52452 C 769.5597,406.8033 813.68878,373.78271 808.04807,379.16489 C 785.89052,400.30745 746.93789,435.83445 695.59281,471.37556 C 635.77859,512.781 567.91263,532.51386 567.56263,545.06011 C 566.95322,566.90467 648.03863,538.65445 673.4177,535.71104 C 677.68863,535.21482 677.02726,542.90045 681.171,544.04793 C 709.82685,551.98167 765.92404,509.09889 760.8567,514.91526 C 628.89841,666.37808 429.2957,715.44937 428.75322,724.27404 C 428.18315,733.547 428.46481,746.0453 495.86126,732.13167 C 520.62778,727.02011 552.27407,717.21997 582.42874,707.86808 C 586.21126,706.69523 585.60889,716.88726 589.54604,717.313 C 631.93615,721.91704 723.64137,649.96363 713.35007,662.29841 C 702.78933,674.95463 637.626,760.458 567.25422,817.82956 C 501.58452,871.36397 433.72152,904.4776 433.87596,911.839 C 434.22263,928.36623 539.82289,907.2406 589.54604,883.65648 C 626.42589,866.16504 664.68285,847.96874 695.77563,822.98904 C 700.45881,819.22515 713.1623,822.07274 718.78455,819.95537 C 745.33607,809.96348 780.82344,768.6793 780.82344,768.6793 C 788.20804,775.02293 742.42218,828.625 715.85833,859.57897 C 689.29448,890.53297 614.67067,941.61167 624.83348,953.27545 C 636.56578,966.738 728.13626,908.67848 728.13626,908.67848 L 780.82344,869.8246 C 780.82344,869.8246 804.97922,863.94619 814.13567,857.87889 C 843.96641,838.11219 886.99344,780.61374 886.99344,780.61374 C 879.85433,868.69686 874.75704,954.92478 846.90796,1003.5845 C 836.22978,1022.855 816.68115,1050 816.68115,1050 C 894.33207,1050 971.983,1050 1049.6339,1050 z',
    */

    startX: 300,
    startY: 200,
    handleX: '50%',
    handleY: '50%',

    scale: 0.2,
    scaleOutline: false,

    lineWidth: 10,
    lineJoin: 'round',

    fillStyle: 'lightgreen',

    method: 'fill',

    // Turn the Shape into a `path` which other artefacts can use to position themselves
    useAsPath: true,
    precision: 2,

    // Test to make sure the bounding box correctly calculates itself to fit the Shape as tightly as possible
    showBoundingBox: true,
});

// Create Wheel entity to pivot to the arrow
makeWheel({

    // We don't need to give artefacts a `name` attribute - it's just a lot more convenient if we do.

    fillStyle: 'blue',
    radius: 5,
    handleX: 'center',
    handleY: 'center',

    pivot: 'myArrow',
    lockTo: 'pivot',
});

// Create the Wheel entitys that will use the arrow as their path
// + This Wheel is a template from which we clone the other Wheels
let myWheel = makeWheel({

    fillStyle: 'red',
    radius: 3,

    // These are half-circles
    roll: -90,

    startAngle: 90,
    endAngle: -90,

    path: 'myArrow',
    pathPosition: 0,
    addPathRotation: true,
    lockTo: 'path',

    handleX: 'center',
    handleY: 'center',

    // Automatically animate the Wheel along the Shape's path (___delta animation___)
    delta: {
        pathPosition: 0.0008,
    }
});

// Generate the rest of the Wheels
for (let i = 0.01; i < 1; i += 0.01) {

    let col;

    if (i < 0.2) col = 'red';
    else if (i < 0.4) col = 'orange';
    else if (i < 0.6) col = 'darkgreen';
    else if (i < 0.8) col = 'blue';
    else col = 'purple';

    myWheel.clone({
        pathPosition: i,
        fillStyle: col,
    });
}


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    let [startX, startY] = arrow.start;
    let [handleX, handleY] = arrow.handle;
    let [offsetX, offsetY] = arrow.offset;

    let {roll, scale, length} = arrow;

    return `    Arrow path length: ${length}
    Start - x: ${startX}, y: ${startY}
    Handle - x: ${handleX}, y: ${handleY}
    Offset - x: ${offsetX}, y: ${offsetY}
    Roll: ${roll}; Scale: ${scale}`;
});


// Create the Display cycle animation
makeRender({

    name: 'demo-animation',
    target: L.artefact.mycanvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: arrow,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        start_xPercent: ['startX', '%'],
        start_xAbsolute: ['startX', 'round'],
        start_xString: ['startX', 'raw'],

        start_yPercent: ['startY', '%'],
        start_yAbsolute: ['startY', 'round'],
        start_yString: ['startY', 'raw'],

        handle_xPercent: ['handleX', '%'],
        handle_xAbsolute: ['handleX', 'round'],
        handle_xString: ['handleX', 'raw'],

        handle_yPercent: ['handleY', '%'],
        handle_yAbsolute: ['handleY', 'round'],
        handle_yString: ['handleY', 'raw'],

        offset_xPercent: ['offsetX', '%'],
        offset_xAbsolute: ['offsetX', 'round'],

        offset_yPercent: ['offsetY', '%'],
        offset_yAbsolute: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],
    },
});

// Setup form
// @ts-expect-error
document.querySelector('#start_xPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_yPercent').value = 50;
// @ts-expect-error
document.querySelector('#handle_xPercent').value = 50;
// @ts-expect-error
document.querySelector('#handle_yPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_xAbsolute').value = 300;
// @ts-expect-error
document.querySelector('#start_yAbsolute').value = 200;
// @ts-expect-error
document.querySelector('#handle_xAbsolute').value = 100;
// @ts-expect-error
document.querySelector('#handle_yAbsolute').value = 100;
// @ts-expect-error
document.querySelector('#start_xString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#start_yString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#handle_xString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#handle_yString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#offset_xPercent').value = 0;
// @ts-expect-error
document.querySelector('#offset_yPercent').value = 0;
// @ts-expect-error
document.querySelector('#offset_xAbsolute').value = 0;
// @ts-expect-error
document.querySelector('#offset_yAbsolute').value = 0;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#scale').value = 0.2;
// @ts-expect-error
document.querySelector('#upend').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#reverse').options.selectedIndex = 0;


// #### Development and testing
console.log(L.entity.myArrow);
