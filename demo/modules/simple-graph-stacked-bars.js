// # Demo Modules 001
// Scrawl-canvas modularized code - London crime charts
//
// Related files:
// + [London crime charts - main module](../modules-001.html)
// + [London crime graphic module](./london-crime-graphic.html)
// + [London crime lines module](./london-crime-lines.html)
// + [London crime stacked bar module](./london-crime-stacked-bars.html)
// + [Simple chart frame module](./simple-chart-frame.html)
// + [Simple chart frame tests module](./simple-chart-frame-tests.html)
// + [Simple graph lines module](./simple-graph-lines.html)
// + [Simple graph stacked bars module](./simple-graph-stacked-bars.html)

/*
Data format requirements - a Javascript object with structure:

{
    area:           'area-label',
    yearLabels:     ['year-1-label', 'year-2-label', ...],
    categoryLabels: ['category-1-label', 'category-2-label', ...],
    yearData: {
        'year-1-label': ["category-1-data", "category-2-data", ...],
        'year-2-label': ["category-1-data", "category-2-data", ...],
        ...
    }
}
*/

import scrawl from '../../source/scrawl.js';

// We need to adapt the graph frame with data specific to this graph
import * as frame from './simple-chart-frame.js';

// Calculate height of the largest year
// - Rounded up to nearest thousand
const extractHighestAnnualMaximum = (yearLabels, yearData) => {

    let max = 0;

    for (let i = 0; i < yearLabels.length; i++) {

        let total = yearData[yearLabels[i]].reduce((a, v) => a + v, 0);
        if (total > max) max = total;
    }
    return ((Math.floor(max / 1000)) * 1000) + 1000;
};

// Variables shared across functions
let group;

// The exported 'build' function
const build = function (namespace, canvas, data) {

    // Local variables defined at the top of the build function
    let area = data.area,
        yearLabels = data.yearLabels, 
        categoryLabels = data.categoryLabels, 
        yearData = data.yearData,

        gap = 1,

        // Magic numbers
        graphWidth = frame.graphWidth,
        graphHeight = frame.graphHeight,
        graphBottom = frame.graphBottom,
        graphLeft = frame.graphLeft + (gap / 2),

        // Graph baseline calculations
        maximumBarTotal = extractHighestAnnualMaximum(yearLabels, yearData),
        numberOfYears = yearLabels.length,
        barDistance = graphWidth / numberOfYears,
        barWidth = `${barDistance - gap}%`,
        singleCrimeHeight = graphHeight / maximumBarTotal;

    // Create group
    group = scrawl.makeGroup({

        name: `${namespace}-bargroup`,
        host: canvas.base.name,
        order: 2,
        visibility: false,
    });

    // Build bars
    yearLabels.forEach((year, yearIndex) => {

        let xPosition = (barDistance * yearIndex) + graphLeft,
            localHeight = 0;

        categoryLabels.forEach((category, categoryIndex) => {

            let categoryItem = yearData[year][categoryIndex],
                crimeHeight = categoryItem * singleCrimeHeight,
                localSaturation = 30 + ((50 / categoryLabels.length) * categoryIndex),
                localColor = categoryIndex % 2;

            localHeight += crimeHeight;

            scrawl.makeBlock({

                name: `${namespace}-${year}-${category}`,
                group: group,

                width: barWidth,
                height: `${crimeHeight}%`,

                startX: `${xPosition}%`,
                startY: `${graphBottom - localHeight}%`,

                lineWidth: 6,
                strokeStyle: 'yellow',

                fillStyle: `hsla(${localColor ? 243 : 0}, 100%, ${localSaturation}%, 1)`,
                method: 'fill',

                onEnter: function () {

                    group.setArtefacts({
                        method: 'fill',
                        order: 0,
                    });

                    this.set({
                        method: 'fillThenDraw',
                        order: 1,
                    });

                    // Because an entity can belong to multiple Group objects
                    // - It won't know which Group will need to be resorted
                    // - So we directly invoke a resort on our Group object here
                    group.batchResort = true;

                    frame.updateSubtitle(`${category} in ${year}: §RED§${categoryItem.toLocaleString()}`);
                },
            });
        });
    });

    // Personalize the chart frame to meet this graph's requirements
    frame.updateSubtitle('No data selected');
    frame.updateXLeft(yearLabels[0]);
    frame.updateXRight(yearLabels[numberOfYears - 1]);
    frame.updateYTop(maximumBarTotal.toLocaleString());

    show();
};

// Other exported functions
const kill = () => group.kill(true);
const hide = () => group.visibility = false;
const show = () => group.visibility = true;

export {
    build,
    kill,

    hide,
    show,
}
