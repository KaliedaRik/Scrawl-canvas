// # Demo Modules 002
// Spiral charts
//
// Related files:
// + [Wikipedia views spiral chart module](./modules/wikipedia-views-spiral-chart.html)
//
// [Run code](../../demo/modules-002.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

// // Function to fetch and parse Wikipedia page view timeseries data
import buildChart from './modules/wikipedia-views-spiral-chart.js';

// Initiate the process on page load
let currentPage;

buildChart('Cat', canvas, {})
.then(res => currentPage = res)
.catch(e => {});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const entitys = scrawl.library.entitynames;

const report = reportSpeed('#reportmessage', function () {

    return `Entity count: ${entitys.length}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});

// #### User interaction
scrawl.addNativeListener('click', () => {

// @ts-expect-error
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
