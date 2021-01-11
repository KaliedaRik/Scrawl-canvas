// # Demo Canvas 007 
// Apply filters at the entity, group and cell level

// [Run code](../../demo/canvas-007.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    fit: 'fill',
    backgroundColor: 'lightgray',
    css: {
        border: '1px solid black'
    }
});


// Create gradients - clone test
let myGrad = scrawl.makeGradient({
    name: 'linear1',
    endX: '100%',
})
.updateColor(0, 'pink')
.updateColor(999, 'darkgreen');

myGrad.clone({
    name: 'linear2',
})
.updateColor(0, 'darkblue')
.updateColor(999, 'white');

myGrad.clone({
    name: 'linear3',
})
.updateColor(0, 'yellow')
.updateColor(999, 'purple');

myGrad.clone({
    name: 'linear4',
})
.updateColor(0, 'black')
.updateColor(999, 'coral');


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
    radius: 6,
    passes: 2,
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


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
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
//     "linear1",
//     "Gradient",
//     "styles",
//     {
//         "name":"linear1",
//         "start":[0,0],
//         "end":["100%",0],
//         "palette":"linear1_palette"
//     }
// ]
//    
// [
//     "linear1_palette",
//     "Palette",
//     "palette",
//     {
//         "name":"linear1_palette",
//         "colors":{
//             "0 ":[255,192,203,1],
//             "999 ":[0,100,0,1]
//         }
//     }
// ]
// ```
