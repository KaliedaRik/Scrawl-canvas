// # Demo Canvas 029 
// Phrase entitys and gradients

// [Run code](../../demo/canvas-029.html)
import scrawl from '../source/scrawl.js'

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'lightgray'
});


// Create Gradient
let mygradient = scrawl.makeGradient({

    name: 'gradient-1',

    endX: '100%',

    paletteStart: 10,
    paletteEnd: 990,

    delta: {
        paletteStart: -1,
        paletteEnd: -1,
    },

    cyclePalette: true,

    colors: [
        [0, 'black'],
        [19, 'red'],
        [499, 'black'],
        [549, 'yellow'],
        [599, 'black'],
        [979, 'aqua'],
        [999, 'black'],
    ],
});

scrawl.makeQuadratic({

    name: 'my-quad',

    startX: '30%',
    startY: '98%',

    controlX: '60%',
    controlY: '78%',

    endX: '90%',
    endY: '98%',

    method: 'draw',

    useAsPath: true,
});


// Create Phrase entitys
scrawl.makePhrase({

    name: 'test-phrase-1',
    order: 1,

    text: 'Test phrase',
    font: 'bold 46px Garamond, serif',

    startX: '5%',
    startY: '5%',

    fillStyle: 'gradient-1',

}).clone({

    name: 'test-phrase-2',

    width: '40%',

    startX: '50%',

    justify: 'left',

}).clone({

    name: 'test-phrase-3',

    startY: '30%',

    flipUpend: true,


}).clone({

    name: 'test-phrase-4',

    startX: '5%',

    lockFillStyleToEntity: true,

}).clone({

    name: 'test-phrase-5',

    font: '46px cursive',

    roll: 90,
    scale: 0.8,

    startX: '50%',
    startY: '33%',

    width: 'auto',

}).clone({

    name: 'test-phrase-6',

    startX: '43%',
    startY: '75%',

    lockFillStyleToEntity: false,

    flipReverse: true,
    
}).clone({

    name: 'test-phrase-7',

    // Test to see if we can load a webfont from a remote server and see it show up in the canvas element
    // + If the test fails then the phrase will display as 46pt sans-serif
    font: '46px "Mountains of Christmas"',

    startX: '0%',
    startY: '10%',

    flipReverse: false,
    flipUpend: false,
    
    roll: 0,
    scale: 1,

    textPath: 'my-quad',

    handleY: '50%',

    lockFillStyleToEntity: true,

    delta: {
        textPathPosition: -0.005,
    }
});

scrawl.makePhrase({

    name: 'test-phrase-8',

    text: 'Lorem ipsum har varit standard ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal bokstäver och blandade dem för att göra ett provexemplar av en bok.',

    font: '18px Garamond, serif',
    lineHeight: 1,

    width: '35%',

    startX: '5%',
    startY: '35%',

    fillStyle: 'gradient-1',

}).clone({

    name: 'test-phrase-9',

    startX: '58%',
    scale: 0.8,
    letterSpacing: 3,

    lockFillStyleToEntity: true,
});

scrawl.makeBlock({

    name: 'top-block',

    width: '100%',
    height: 10,
    
    fillStyle: 'gradient-1',

    order: 0,

}).clone({

    name: 'left-block',

    height: '100%',
    width: 10,
});

let myGroup = scrawl.makeGroup({

    name: 'text-group',

}).addArtefacts('test-phrase-1', 'test-phrase-2', 'test-phrase-3', 'test-phrase-4',
    'test-phrase-5', 'test-phrase-6', 'test-phrase-7', 'test-phrase-8', 'test-phrase-9');


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

    commence: () => mygradient.updateByDelta(),
    afterShow: report,
});


// #### User interaction
scrawl.addNativeListener('change', (e) => {

    if (e && e.target) {

        e.preventDefault();
        e.stopPropagation();

        let value = e.target.value;

        switch (value) {

            case 'horizontal' :

                mygradient.set({
                    endX: '100%',
                    endY: 0,
                });
                break;

            case 'vertical' :

                mygradient.set({
                    endX: 0,
                    endY: '100%',
                });
                break;

            case 'diagonal' :

                mygradient.set({
                    endX: '100%',
                    endY: '100%',
                });
                break;
        }
    }
}, '#gradient');

scrawl.addNativeListener('change', (e) => {

    if (e && e.target) {

        e.preventDefault();
        e.stopPropagation();

        myGroup.setArtefacts({
            justify: e.target.value,
        });
    }
}, '#justify');

document.querySelector('#gradient').value = 'horizontal';
document.querySelector('#justify').value = 'left';


// #### Development and testing
console.log(scrawl.library);


// Text measurements
// 
// To see forthcoming measurements, we need to go to chrome://flags and enable 'Experimental Web Platform Features'
// + The eventual aim is to replace a whole stack of code in factory/phrase.js where we calculate font height etc
// + At the moment Phrase entitys ignore font baselines; positioning is entirely from the top left corner of the text rectangle
if ('fonts' in document) {

    Promise.all([
        document.fonts.load('18px Garamond'),
        document.fonts.load('46px "Mountains of Christmas"')
    ])
    .then(res => {

        let { engine } = canvas;

        engine.save();

        engine.font = '18px Garamond';
        let garamond = engine.measureText('The quick brown fox jumps over the lazy dog');
        console.log('garamond', garamond);

        engine.font = '46px "Mountains of Christmas"';
        let moc = engine.measureText('The quick brown fox jumps over the lazy dog');
        console.log('moc', moc);

        engine.restore();
    })
    .catch(e => console.log(e));
}


/*
RESULTS - Chrome, with flag enabled

garamond TextMetrics
    actualBoundingBoxAscent: 12.33984375
    actualBoundingBoxDescent: 3.9375
    actualBoundingBoxLeft: -0.24609375
    actualBoundingBoxRight: 328.376953125
    advances: [
        0, 10.9951171875, 19.9951171875, 27.984375, 32.484375, 41.484375, 50.484375, 55.4853515625, 63.474609375, 72.474609375, 76.974609375, 85.974609375, 91.96875, 100.96875, 113.9677734375, 122.9677734375, 127.4677734375, 133.4619140625, 142.4619140625, 151.4619140625, 155.9619140625, 160.962890625, 169.962890625, 183.9638671875, 192.9638671875, 199.96875, 204.46875, 213.46875, 222.46875, 230.4580078125, 236.4521484375, 240.9521484375, 245.953125, 254.953125, 262.9423828125, 267.4423828125, 272.443359375, 280.4326171875, 288.421875, 297.421875, 301.921875, 310.921875, 319.921875
    ]
    emHeightAscent: 13.5
    emHeightDescent: 4.5
    fontBoundingBoxAscent: 17
    fontBoundingBoxDescent: 5
    width: 328.921875


RESULTS - Chrome, with flag disabled

garamond TextMetrics
    actualBoundingBoxAscent: 12.33984375
    actualBoundingBoxDescent: 3.9375
    actualBoundingBoxLeft: -0.24609375
    actualBoundingBoxRight: 328.376953125
    fontBoundingBoxAscent: 17
    fontBoundingBoxDescent: 5
    width: 328.921875

*/