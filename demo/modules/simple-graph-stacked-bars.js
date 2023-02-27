// # Demo Modules 001
// Scrawl-canvas modularized code - London crime charts
//
// Related files:
// + [London crime charts - main module](../modules-001.html)
// + [London crime lines module](./london-crime-lines.html)
// + [London crime stacked bar module](./london-crime-stacked-bars.html)
// + [Simple chart frame module](./simple-chart-frame.html)
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


// #### Imports
// We need to adapt the graph frame with data specific to this graph
import { 
    api as frame,
    dims as frameDims,
} from './simple-chart-frame.js';


// #### Helper functionality
// Calculate height of the largest year
// + Rounded up to nearest thousand
const extractHighestAnnualMaximum = (yearLabels, yearData) => {

    let max = 0;

    for (let i = 0; i < yearLabels.length; i++) {

        let total = yearData[yearLabels[i]].reduce((a, v) => a + v, 0);
        if (total > max) max = total;
    }
    return ((Math.floor(max / 1000)) * 1000) + 1000;
};

const colorArray = ['#257394', '#947a25', '#fc0004', '#00fcbd', '#de9bc8', '#9bdeaf', '#970b99', '#0b9910', '#5f11f0', '#66f011', '#a09de0', '#d1e09d'];


// #### API - exported functions
export const api = {};


// The exported `build` function
api.build = function (items) {

    const { namespace, canvas, data, scrawl } = items;

    // Module state
    let selectedColumn = 0,
        selectedRow = 0,
        currentData = data;

    if (namespace && canvas && data && scrawl) {

        // Namespace boilerplate
        const name = (item) => `${namespace}-${item}`;


        // Local variables defined at the top of the build function
        const area = data.area,
            yearLabels = data.yearLabels, 
            categoryLabels = data.categoryLabels, 
            yearData = data.yearData,

            gap = 1,

            // Magic numbers
            graphWidth = frameDims.graphWidth,
            graphHeight = frameDims.graphHeight,
            graphBottom = frameDims.graphBottom,
            graphLeft = frameDims.graphLeft + (gap / 2),

            // Graph baseline calculations
            maximumBarTotal = extractHighestAnnualMaximum(yearLabels, yearData),
            numberOfYears = yearLabels.length,
            barDistance = graphWidth / numberOfYears,
            barWidth = `${barDistance - gap}%`,
            singleCrimeHeight = graphHeight / maximumBarTotal;


        // Create group
        const group = scrawl.makeGroup({

            name: name('bargroup'),
            host: canvas.get('baseName'),
            order: 2,
        });


        // Build bars
        yearLabels.forEach((year, yearIndex) => {

            let xPosition = (barDistance * yearIndex) + graphLeft,
                localHeight = 0;

            const categoryLen = categoryLabels.length;

            categoryLabels.forEach((category, categoryIndex) => {

                const categoryItem = yearData[year][categoryIndex],
                    crimeHeight = categoryItem * singleCrimeHeight;

                localHeight += crimeHeight;

                scrawl.makeBlock({

                    name: name(`${year}-${category}`),
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


        // Build highlight cursor
        const currentDatapoint = scrawl.makeBlock({
            name: name('dataframe'),
            group,
            mimic: name(`${selectedColumn}-${selectedRow}`),
            useMimicDimensions: true,
            useMimicStart: true,
            useMimicHandle: true,
            lockTo: 'mimic',
            lineWidth: 6,
            strokeStyle: 'yellow',
            method: 'draw',
        });

        const updateSelected = () => {

            const {yearLabels, categoryLabels, yearData} = currentData;

            const category = categoryLabels[selectedRow],
                year = yearLabels[selectedColumn],
                data = yearData[year][selectedRow];

            currentDatapoint.set({
                mimic: name(`${year}-${category}`),
            });

            frame.updateSubtitle(`${category} in ${year}: §RED§${data.toLocaleString()}`);
        };

        updateSelected();


        // Personalize the chart frame to meet this graph's requirements
        frame.updateSubtitle('No data selected');
        frame.updateXLeft(yearLabels[0]);
        frame.updateXRight(yearLabels[numberOfYears - 1]);
        frame.updateYTop(maximumBarTotal.toLocaleString());


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

        frame.keyboard = scrawl.makeKeyboardZone({

            zone: canvas,

            none: {
                ArrowLeft: () => doNavigation('left'),
                ArrowUp: () => doNavigation('up'),
                ArrowRight: () => doNavigation('right'),
                ArrowDown: () => doNavigation('down'),
            },
        });
    }
};
