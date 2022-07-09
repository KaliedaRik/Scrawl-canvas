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

import * as scrawl from '../../source/scrawl.js';

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

const colorArray = ['#257394', '#947a25', '#fc0004', '#00fcbd', '#de9bc8', '#9bdeaf', '#970b99', '#0b9910', '#5f11f0', '#66f011', '#a09de0', '#d1e09d'];

// Variables shared across functions
let group,
    space,
    selectedColumn,
    selectedRow,
    currentData,
    currentDatapoint;

// The exported 'build' function
const build = function (namespace, canvas, data) {

    space = namespace;
    selectedColumn = 0;
    selectedRow = 0;
    currentData = data;

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

        const categoryLen = categoryLabels.length;

        categoryLabels.forEach((category, categoryIndex) => {

            let categoryItem = yearData[year][categoryIndex],
                crimeHeight = categoryItem * singleCrimeHeight;

            localHeight += crimeHeight;

            scrawl.makeBlock({

                name: `${namespace}-${year}-${category}`,
                group,

                width: barWidth,
                height: `${crimeHeight}%`,

                startX: `${xPosition}%`,
                startY: `${graphBottom - localHeight}%`,

                fillStyle: colorArray[categoryIndex % categoryLen],

                onEnter: function () {

                    selectedColumn = yearIndex;
                    selectedRow = categoryIndex;

                    updateSelected();
                },
            });
        });
    });

    currentDatapoint = scrawl.makeBlock({
        name: `${namespace}-dataframe`,
        group,
        mimic: `${namespace}-${selectedColumn}-${selectedRow}`,
        useMimicDimensions: true,
        useMimicStart: true,
        useMimicHandle: true,
        lockTo: 'mimic',
        lineWidth: 6,
        strokeStyle: 'yellow',
        method: 'draw',
    });


    // Personalize the chart frame to meet this graph's requirements
    frame.updateSubtitle('No data selected');
    frame.updateXLeft(yearLabels[0]);
    frame.updateXRight(yearLabels[numberOfYears - 1]);
    frame.updateYTop(maximumBarTotal.toLocaleString());


    // Accessibility
    frame.setArrowAction('up', () => doNavigation('up'));
    frame.setArrowAction('down', () => doNavigation('down'));
    frame.setArrowAction('left', () => doNavigation('left'));
    frame.setArrowAction('right', () => doNavigation('right'));


    // Display the graph entitys
    updateSelected();
    show();
};


// Accessibility
const doNavigation = (direction) => {

    const {yearLabels, categoryLabels} = currentData;

    const columnLen = yearLabels.length,
        rowLen = categoryLabels.length;

    switch (direction) {

        case 'up' : 
            selectedRow++;
            break;

        case 'down' : 
            selectedRow--;
            break;

        case 'left' : 
            selectedColumn--;
            break;

        case 'right' : 
            selectedColumn++;
            break;
    }

    if (selectedColumn < 0) selectedColumn = columnLen - 1;
    else if (selectedColumn >= columnLen) selectedColumn = 0;

    if (selectedRow < 0) selectedRow = rowLen - 1;
    else if (selectedRow >= rowLen) selectedRow = 0;

    updateSelected();
};

const updateSelected = () => {

    const {yearLabels, categoryLabels, yearData} = currentData;

    const category = categoryLabels[selectedRow],
        year = yearLabels[selectedColumn],
        data = yearData[year][selectedRow];

    currentDatapoint.set({
        mimic: `${space}-${year}-${category}`,
    });

    frame.updateSubtitle(`${category} in ${year}: §RED§${data.toLocaleString()}`);
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
