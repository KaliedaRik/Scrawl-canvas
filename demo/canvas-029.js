// # Demo Canvas 029 
// Phrase entitys and gradients

// [Run code](../../demo/canvas-029.html)
import scrawl from '../source/scrawl.js'


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
})
.updateColor(0, 'black')
.updateColor(19, 'red')
.updateColor(499, 'black')
.updateColor(549, 'yellow')
.updateColor(599, 'black')
.updateColor(979, 'aqua')
.updateColor(999, 'black');

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
