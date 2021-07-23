// # Demo Modules 002
// Spiral charts
//
// Related files:
// + [Wikipedia views spiral chart module](./modules/wikipedia-views-spiral-chart.html)
//
// [Run code](../../demo/modules-002.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

// // Function to fetch and parse Wikipedia page view timeseries data
import buildChart from './modules/wikipedia-views-spiral-chart.js';

// Initiate the process on page load
let currentPage = false;

buildChart('Cat', canvas, {})
.then(res => currentPage = res)
.catch(e => {});


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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Entity count: ${scrawl.library.entitynames.length}`;
    };
}();

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});

// #### User interaction
scrawl.addNativeListener('click', () => {

    let page = document.querySelector('#wikipedia-page').value;

    if (page) {

        buildChart(page, canvas, {})
        .then(res => {

            if (currentPage) currentPage.kill();
            currentPage = res;
        })
        .catch(e => {

            console.log('main invoker error', e);
        });
    };
}, '#page-request');


// #### Development and testing
console.log(scrawl.library);
