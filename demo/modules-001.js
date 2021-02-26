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

import scrawl from '../source/scrawl.js';

let canvas = scrawl.library.canvas.mycanvas,
    namespace = 'London-crimes';

import * as frame from './modules/simple-chart-frame.js';
import * as barGraph from './modules/london-crime-stacked-bars.js';
import * as lineGraph from './modules/london-crime-lines.js';

canvas.set({

    backgroundColor: 'lemonchiffon',

    label: 'Crime statistics for London areas - from 1999 to 2017',

    description: 'Interactive graphic showing crimes recorded in various London areas, broken down into crime types. Data taken from https://data.london.gov.uk/dataset/recorded_crime_rates',

    fit: 'contain',
    checkForResize: true,

}).setBase({

    width: 600,
    height: 600,
});

let report = function () {

    let assets = scrawl.library.assetnames,
        groups = scrawl.library.groupnames,
        entitys = scrawl.library.entitynames,

        reporter = document.querySelector('#library-reporter');

    return function () {

        reporter.textContent = `Assets:
${assets.join(', ')}

Groups:
${groups.join(', ')}

Entitys:
${entitys.join(', ')}`;
    }
}();

scrawl.makeRender({
    name: `${namespace}-animation`,
    target: canvas,

    afterShow: report,
});

scrawl.addListener(
    'move', 
    () => canvas.cascadeEventAction('move'), 
    canvas.domElement 
);

let currentGraphType = 'bars',
    currentArea = 'Hackney',
    currentCategory = 'Burglary';

let crimeCategoryInput = document.querySelector('#crime-categories');

scrawl.addNativeListener(['input', 'change'], function (e) {

    if (e && e.target) {

        e.preventDefault();
        e.stopPropagation();

        let target = e.target.id,
            value = e.target.value;

        switch (target) {

            case 'areas' :

                if (value !== currentArea) {

                    currentArea = value;

                    if (currentGraphType === 'bars') {

                        barGraph.kill();

                        barGraph.build(
                            `${namespace}-bars`, 
                            canvas, 
                            `data/crimes-in-${currentArea.toLowerCase()}.json`
                        );
                    }
                    else if (currentGraphType === 'lines') {

                        lineGraph.kill();

                        lineGraph.build(
                            `${namespace}-lines`, 
                            canvas, 
                            `data/crimes-in-${currentArea.toLowerCase()}.json`, 
                            currentCategory
                        );
                    }
                }
                break;

            case 'graph-types' :

                if (value !== currentGraphType) {

                    currentGraphType = value;

                    if (currentGraphType === 'bars') {

                        lineGraph.kill();

                        barGraph.build(
                            `${namespace}-bars`, 
                            canvas, 
                            `data/crimes-in-${currentArea.toLowerCase()}.json`
                        );

                        crimeCategoryInput.setAttribute('disabled', '');
                    }
                    else if (currentGraphType === 'lines') {

                        barGraph.kill();

                        lineGraph.build(
                            `${namespace}-lines`, 
                            canvas, 
                            `data/crimes-in-${currentArea.toLowerCase()}.json`, 
                            currentCategory
                        );

                        crimeCategoryInput.removeAttribute('disabled');
                    }
                }
                break;

            case 'crime-categories' :

                if (currentGraphType === 'lines' && value !== currentCategory) {

                    currentCategory = value;

                    lineGraph.update(
                        `${namespace}-lines`, 
                        canvas, 
                        currentCategory
                    );
                }
                break;
        }
    }
}, '.control-item');

// Initial display
frame.build(`${namespace}-frame`, canvas, 'Hackney');
barGraph.build(`${namespace}-bars`, canvas, 'data/crimes-in-hackney.json');

crimeCategoryInput.value = 'Burglary';
crimeCategoryInput.setAttribute('disabled', '');

console.log(scrawl.library);
