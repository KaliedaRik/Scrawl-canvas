// # Demo Canvas 070
// Test Cell splitShift functionality (infinite scroll)

// [Run code](../../demo/canvas-070.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Import the assets
scrawl.importDomImage('.demo-assets');


// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Add new Cells for the carpet tile, and the pattern to go on it
const carpetTile = canvas.buildCell({

    name: name('carpet-tile-cell'),
    dimensions: ["100%", "100%"],
    cleared: false,
    compiled: false,
    shown: false
});

const carpetPattern = canvas.buildCell({

    name: name('carpet-pattern-cell'),
    dimensions: [200, 200],
    cleared: false,
    compiled: false,
    shown: false
});


// Create a color factory
const rugColors = scrawl.makeColor({

    name: name("rug-colors"),
    colorSpace: "OKLAB",
});


// Define available colors and assets
const backgrounds = [
    'honeydew',
    'aliceblue',
    'whitesmoke',
    'beige',
    'ivory',
    'linen',
];
const backgroundsLength = backgrounds.length;

const assets = [
    'carpet-0',
    'carpet-1',
    'carpet-2',
    'carpet-3',
    'carpet-4',
];
const assetsLength = assets.length;

const foregrounds = [
    'salmon',
    'gold',
    'orange',
    'yellow',
    'khaki',
    'forestgreen',
    'olivedrab',
    'aquamarine',
    'cadetblue',
    'cornflowerblue',
    'lightskyblue',
    'orchid',
    'plum',
    'mediumpurple',
    'lightpink',
    'palevioletred',
    'silver',
    'slategray',
    'rosybrown',
    'chocolate',
];
const foregroundsLength = foregrounds.length;


// Factory to build out the carpet tile
const generatePattern = (amount) => {

    const rnd = Math.random,
        floor = Math.floor;

    for (let i = 0; i < amount; i++) {

        scrawl.makeBlock({

            name: name(`block-${i}`),
            group: name("carpet-pattern-cell"),
            startX: 50 + floor(rnd() * 100),
            startY: 50 + floor(rnd() * 100),
            width: 30 + floor(rnd() * 80),
            height: 10 + floor(rnd() * 20),
            handle: ["center", "center"],
            fillStyle: rugColors.getRangeColor(rnd()),
            roll: rnd() * 90,
            lineWidth: 3,
            method: "fillThenDraw"
        });

        scrawl.makeWheel({

            name: name(`wheel-${i}`),
            group: name("carpet-pattern-cell"),
            startX: 50 + floor(rnd() * 100),
            startY: 50 + floor(rnd() * 100),
            radius: 30 + floor(rnd() * 20),
            handle: ["center", "center"],
            endAngle: 180,
            fillStyle: rugColors.getRangeColor(rnd()),
            roll: rnd() * 90,
            lineWidth: 3,
            method: "fillThenDraw"
        });
    }

    carpetPattern.compile();
    carpetPattern.get('group').killArtefacts();

    carpetPattern.splitShift({px: '50%', vertical: false, cycle: true});
    carpetPattern.splitShift({px: '50%', vertical: true, cycle: true});
};


// Factory to weave the carpet
const generateCarpet = () => {

    const rnd = Math.random,
        floor = Math.floor;

    const background = backgrounds[floor(rnd() * backgroundsLength)];

    const min = floor(rnd() * (foregroundsLength - 1));

    let max = min + (1 + floor(rnd() * (foregroundsLength - 2)));
    if (max >= foregroundsLength) max -= foregroundsLength;

    const minimumColor = foregrounds[min],
        maximumColor = foregrounds[max];

    rugColors.set({
        minimumColor,
        maximumColor,
    });

    carpetPattern.clear();

    scrawl.makeBlock({

        name: name(`tile-background`),
        group: name("carpet-pattern-cell"),
        dimensions: ["100%", "100%"],
        fillStyle: background,
    });

    generatePattern(4);
    generatePattern(4);

    carpetTile.clear();

    carpetImage.set({
        asset: assets[floor(rnd() * assetsLength)],
    });

    carpetTile.compile();
};


// Create the initial scene
const carpetImage = scrawl.makePicture({

    name: name("carpet-pattern-background"),
    group: name("carpet-tile-cell"),
    dimensions: ["100%", "100%"],
    copyDimensions: ["100%", "100%"],
});

generateCarpet();

scrawl.makeBlock({
    name: name("carpet-tile-block"),
    dimensions: ["100%", "100%"],
    fillStyle: name("carpet-tile-cell"),
});

scrawl.makeBlock({
    name: name("carpet-pattern-block"),
    dimensions: ["100%", "100%"],
    fillStyle: name("carpet-pattern-cell"),
    globalCompositeOperation: "soft-light",
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Check for moves at the start of each Display cycle
const commence = () => {

    const floor = Math.floor;

    const { x, y } = canvas.here;

    if (x >= 0 && x < 600 && y >= 0 && y < 400) {

        const dx = floor((350 - x) / 100),
           dy = floor((250 - y) / 100);

        carpetTile.splitShift({ px: dx, vertical: false, cycle: true });
        carpetTile.splitShift({ px: dy, vertical: true, cycle: true });

        carpetPattern.splitShift({ px: dx, vertical: false, cycle: true });
        carpetPattern.splitShift({ px: dy, vertical: true, cycle: true });
    }
}

// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence,
    afterShow: report,
});


// #### User interaction
scrawl.addNativeListener("click", generateCarpet, canvas.domElement);


// #### Development and testing
console.log(scrawl.library);
