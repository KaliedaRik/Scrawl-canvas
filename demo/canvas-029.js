// # Demo Canvas 029
// Image smoothing

// [Run code](../../demo/canvas-029.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;

scrawl.importDomImage('.flowers');


canvas.setBase({
    compileOrder: 1,
});

const textCell = canvas.buildCell({

    name: 'text-cell',
    dimensions: [100, 100],
    shown: false,
});


scrawl.makeLabel({

    name: 'hello-world-in-cell',
    group: 'text-cell',

    text: 'Hello world!',

    start: ['center', 'center'],
    handle: ['center', 'center'],
});


scrawl.makePicture({

    name: 'flower',
    asset: 'iris',

    start: [3, 3],
    dimensions: [297, 297],

    copyStart: [200, 200],
    copyDimensions: [50, 50],

    lineWidth: 6,
    strokeStyle: 'gold',

    method: 'fillThenDraw',

}).clone({

    name: 'hello',
    asset: 'text-cell',

    start: [300, 300],
    dimensions: [297, 297],

    copyStart: [15, 15],
    copyDimensions: [70, 70],
});

scrawl.makeLabel({

    name: 'hello-world-in-base-1',

    text: 'Hello world!',

    start: ['25%', '60%'],
    handle: ['center', 'center'],

}).clone({

    name: 'hello-world-in-base-2',
    startY: '70%',
    scale: 2,

}).clone({

    name: 'hello-world-in-base-3',
    startY: '85%',
    scale: 4.5,
});

scrawl.makePattern({

    name: 'bunny-pattern',
    imageSource: 'img/bunny.png',
    matrixA: 3,
    matrixD: 3,
});

scrawl.makeBlock({

    name: 'pattern-block',

    start: [300, 3],
    dimensions: [297, 297],

    lineWidth: 6,
    fillStyle: 'bunny-pattern',
    strokeStyle: 'gold',

    method: 'fillThenDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');

// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});

// #### Development and testing
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: canvas.base.name,
    targetLibrarySection: 'group',

    useNativeListener: true,
    preventDefault: true,

    updates: {

        imageSmoothingEnabled: ['imageSmoothingEnabled', 'boolean'],
        imageSmoothingQuality: ['imageSmoothingQuality', 'raw'],
    },
});


scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        const val = (e.target.value === '1') ? true : false;

        canvas.set({ smoothFont: val });
        canvas.setBase({ smoothFont: val });
        textCell.set({ smoothFont: val });
    }
}, '#smoothFont')

// @ts-expect-error
document.querySelector('#smoothFont').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#imageSmoothingEnabled').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#imageSmoothingQuality').options.selectedIndex = 2;


console.log(scrawl.library);
