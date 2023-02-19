// # Demo Modules 002
// Spiral charts
//
// Related files:
// + [Wikipedia views spiral chart module](./modules/wikipedia-views-spiral-chart.html)
//
// [Run code](../../demo/modules-002.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

import buildChart from './modules/wikipedia-views-spiral-chart.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


// We need to generate an initial chart to display
// + We give the asset a name, which we can then use with our Picture entity
const initialAssetName = 'wiki-Cat-chart';

buildChart({
    page: 'Cat',
    assetName: initialAssetName,
    canvas,
    scrawl,
});


// And we need a picture entity in which to display the chart
const piccy = scrawl.makePicture({
    name: 'spiral-chart',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    asset: initialAssetName,
});


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
scrawl.addNativeListener('change', () => {

// @ts-expect-error
    let page = document.querySelector('#wikipedia-page').value;

    if (page) {

        const assetName = `wiki-${page}-chart`;

        if (!scrawl.library.assetnames.includes(assetName)) {

            buildChart({
                page,
                assetName,
                canvas,
                scrawl,
            });
        }

        piccy.set({
            asset: assetName,
        });
    };
}, '#wikipedia-page');


// #### Development and testing
console.log(scrawl.library);
