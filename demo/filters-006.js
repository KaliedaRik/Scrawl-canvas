// # Demo Filters 006 
// Filter parameters: channelLevels

// [Run code](../../demo/filters-006.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'channelLevels',
    method: 'channelLevels',

    red: [50, 200],
    green: [60, 220, 150],
    blue: [40, 180],
    alpha: [],
});


// Create the target entity
scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['channelLevels'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let red = document.querySelector('#red'),
        green = document.querySelector('#green'),
        alpha = document.querySelector('#alpha'),
        blue = document.querySelector('#blue'),
        opacity = document.querySelector('#opacity');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Red: [${red.value}]
    Green: [${green.value}]
    Blue: [${blue.value}]
    Alpha: [${alpha.value}]
    Opacity: ${opacity.value}`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.addNativeListener(
    ['input', 'change'], 
    (e) => {

        let a;

        if (e.target.id === 'opacity') a = e.target.value;
        else {

            let temp = e.target.value.split(',');
            a = [];

            temp.forEach(t => {
                let n = parseInt(t, 10);
                if (n.toFixed && !isNaN(n)) a.push(n)
            });
        }

        myFilter.set({ 
            [e.target.id]: a,
        });
    }, 
    '.controlItem');

// Setup form
document.querySelector('#red').value = '50, 200';
document.querySelector('#green').value = '60, 220, 150';
document.querySelector('#blue').value = '40, 180';
document.querySelector('#alpha').value = '';
document.querySelector('#opacity').value = 1;


// #### Development and testing
console.log(scrawl.library);
