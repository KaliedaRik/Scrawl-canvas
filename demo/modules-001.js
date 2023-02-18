// # Demo Modules 001
// Scrawl-canvas modularized code - London crime charts
//
// Related files:
// + [London crime graphic module](./modules/london-crime-graphic.html)
// + [London crime lines module](./modules/london-crime-lines.html)
// + [London crime stacked bar module](./modules/london-crime-stacked-bars.html)
// + [Simple chart frame module](./modules/simple-chart-frame.html)
// + [Simple chart frame tests module](./modules/simple-chart-frame-tests.html)
// + [Simple graph lines module](./modules/simple-graph-lines.html)
// + [Simple graph stacked bars module](./modules/simple-graph-stacked-bars.html)
//
// [Run code](../../demo/modules-001.html)

// #### Imports
import * as scrawl from '../source/scrawl.js';

import * as frame from './modules/simple-chart-frame.js';
import {api as barGraph} from './modules/london-crime-stacked-bars.js';
import {api as lineGraph} from './modules/london-crime-lines.js';

import { reportSpeed } from './utilities.js';


// #### Initial setup
scrawl.importDomImage('.crime');

const canvas = scrawl.library.canvas.mycanvas;
const namespace = 'Crimes';
const name = (item) => `${namespace}-${item}`;

// Accessibility
canvas.set({

    label: 'Crime statistics for London areas - from 1999 to 2017',
    description: 'Interactive graphic showing crimes recorded in various London areas, broken down into crime types. Data taken from https://data.london.gov.uk/dataset/recorded_crime_rates',
});


// #### Animation and reporting
const assets = scrawl.library.assetnames,
    groups = scrawl.library.groupnames,
    entitys = scrawl.library.entitynames;

const report = reportSpeed('#library-reporter', function () {

    return `
Assets: (${assets.length})
${assets.join(', ')}

Groups: (${groups.length})
${groups.join(', ')}

Entitys: (${entitys.length})
${entitys.join(', ')}`;
});


scrawl.makeRender({
    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.addListener(
    'move', 
    () => canvas.cascadeEventAction('move'), 
    canvas.domElement 
);

scrawl.addNativeListener(
    'touchstart', 
    () => canvas.cascadeEventAction('move'), 
    canvas.domElement 
);

// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);


// Infographic state
let currentGraphType = 'bars',
    currentArea = 'Hackney',
    currentCategory = 'Burglary';

const crimeCategoryInput = document.querySelector('#crime-categories');
// @ts-expect-error
crimeCategoryInput.value = 'Burglary';
crimeCategoryInput.setAttribute('disabled', '');

scrawl.addNativeListener(['input', 'change'], function (e) {

    if (e && e.target) {

        e.preventDefault();
        e.stopPropagation();

        const target = e.target.id,
            value = e.target.value;

        switch (target) {

            case 'areas' :

                if (value !== currentArea) {

                    currentArea = value;

                    if (currentGraphType === 'bars') {

                        barGraph.kill();

                        // We need to delay the rebuild to the next Display cycle
                        // + SC library purges are batched to run once per RAF
                        // + We can't rebuild until after the library is purged
                        setTimeout(() => barGraph.build({
                            namespace: name('bars'), 
                            dataSource: `data/crimes-in-${currentArea.toLowerCase()}.json`,
                            canvas,
                            scrawl,
                        }), 0);
                    }
                    else if (currentGraphType === 'lines') {

                        lineGraph.kill();

                        // Again, we delay the rebuild to the next Display cycle
                        setTimeout(() => lineGraph.build({
                            namespace: name('lines'), 
                            dataSource: `data/crimes-in-${currentArea.toLowerCase()}.json`,
                            category: currentCategory,
                            canvas,
                            scrawl,
                        }), 0);
                    }
                }
                break;

            case 'graph-types' :

                if (value !== currentGraphType) {

                    currentGraphType = value;

                    if (currentGraphType === 'bars') {

                        lineGraph.kill();

                        barGraph.build({
                            namespace: name('bars'), 
                            dataSource: `data/crimes-in-${currentArea.toLowerCase()}.json`,
                            canvas,
                            scrawl,
                        });

                        crimeCategoryInput.setAttribute('disabled', '');
                    }
                    else if (currentGraphType === 'lines') {

                        barGraph.kill();

                        lineGraph.build({
                            namespace: name('lines'), 
                            dataSource: `data/crimes-in-${currentArea.toLowerCase()}.json`,
                            category: currentCategory,
                            canvas,
                            scrawl,
                        });

                        crimeCategoryInput.removeAttribute('disabled');
                    }
                }
                break;

            case 'crime-categories' :

                if (currentGraphType === 'lines' && value !== currentCategory) {

                    currentCategory = value;

                    lineGraph.update({
                        namespace: name('lines'),
                        category: currentCategory,
                        canvas, 
                        scrawl,
                    });
                }
                break;
        }
    }
}, '.control-item');


// #### Build out initial graphic
frame.build({
    namespace: name('frame'),
    backgroundImage: 'Hackney',
    canvas,
    scrawl,
});

barGraph.build({
    namespace: name('bars'), 
    dataSource: 'data/crimes-in-hackney.json',
    canvas,
    scrawl,
});


// #### Development
console.log(scrawl.library);
