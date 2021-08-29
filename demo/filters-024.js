// # Demo Filters 024 
// Filter parameters: randomNoise

// [Run code](../../demo/filters-024.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


const weights = new Array(1024);
weights.fill(1);

// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'my-filter',
    method: 'curveWeights',

    weights: [...weights],
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

    filters: ['my-filter'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let opacity = document.querySelector('#opacity');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Opacity: ${opacity.value}
    Weights: ${weights.join(', ')}`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        opacity: ['opacity', 'float'],
        includeAlpha: ['includeAlpha', 'boolean'],
    },
});

scrawl.addNativeListener('click', () => {

    let len = weights.length;

    for (let i = 0; i < len; i++) {

        let w = 0.8 + (Math.random() * 0.4);
        w = w.toFixed(2);

        weights[i] = parseFloat(w);
    }

    myFilter.set({
        weights: [...weights],
    });

}, canvas.domElement);

// Setup form
document.querySelector('#includeAlpha').options.selectedIndex = 1;
document.querySelector('#opacity').value = 1;


// #### Development and testing
console.log(scrawl.library);
