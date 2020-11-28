// # Demo Filters 011 
// Canvas engine filter strings (based on CSS filters)

// [Run code](../../demo/filters-011.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the target entity
const piccy = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',
});

const text = scrawl.makePhrase({

    name: 'demo-text',
    text: 'Hello world',
    font: 'bold 70px sans-serif',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    lineHeight: 0.5,
    fillStyle: 'aliceblue',
    strokeStyle: 'red',
    lineWidth: 3,
    method: 'fillThenDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
let filterTarget = piccy,
    filterString = 'none';

// Setup form functionality
let updateTarget = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

    if (val) {

        piccy.set({ filter: 'none'});
        text.set({ filter: 'none'});
        canvas.setBase({ filter: 'none'});

        if (val === 'picture') filterTarget = piccy;
        else if (val === 'phrase') filterTarget = text;
        else if (val === 'cell') filterTarget = canvas.base;

        filterTarget.set({ filter: filterString });
    }
};
scrawl.addNativeListener(['input', 'change'], updateTarget, '#target');

let updateFilter = (e) => {

    e.preventDefault();
    e.returnValue = false;

    if (e.target && e.target.value) {

        filterString = e.target.value;
        filterTarget.set({ filter: filterString });
    }
};
scrawl.addNativeListener(['input', 'change'], updateFilter, '#filter');


document.querySelector('#filter').options.selectedIndex = 0;
document.querySelector('#target').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
