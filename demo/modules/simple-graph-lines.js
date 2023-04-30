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
Data supplied to graph module as Javascript object with structure:
{
    yearLabels: ['year-1-label', 'year-2-label', ...],
    data:       [year-1-data, year-2-data, ...],
}
*/


// #### Imports and exports
// We need to adapt the graph frame with data specific to this graph
import {
    api as frame,
    dims as frameDims,
} from './simple-chart-frame.js';

export const api = {};


// #### Helper functionality
// Determine the range batch
// + To make sure the graph covers as much vertical space as possible
const calculateBatchValue = (val) => {

    if (val > 50000) return 10000;
    if (val > 25000) return 5000;
    if (val > 10000) return 2000;
    if (val > 5000) return 1000;
    if (val > 2500) return 500;
    if (val > 1000) return 200;
    if (val > 500) return 100;
    if (val > 250) return 50;
    if (val > 100) return 20;
    if (val > 50) return 10;
    if (val > 25) return 5;
    if (val > 10) return 2;
    return 1;
}


// #### Build function
api.build = function (items) {

    // Module state
    let currentData,
        xStep = 0,
        yearLabels,
        selectedColumn = 0;

    const { graphWidth, graphHeight, graphLeft, graphBottom } = frameDims;
    const { namespace, canvas, data, scrawl } = items;


    if (namespace && canvas && data && scrawl) {

        // Namespace boilerplate
        const name = (item) => `${namespace}-${item}`;


        // Group host name
        const host = canvas.get('baseName');


        // Update module state
        currentData = data;
        yearLabels = data.yearLabels;
        xStep = graphWidth / yearLabels.length;

        // The `positions` Group
        // + A set of Block entitys used as pivots by the other entitys
        const positionGroup = scrawl.makeGroup({

            name: name('position-group'),
            host,
            order: 1,
        });

        // The `lines` Group
        // + A set of line Shape entitys
        // + Use position entitys for their start and end coordinate pivots
        const lineGroup = scrawl.makeGroup({

            name: name('line-group'),
            host,
            order: 2,
        });

        // The `pins` Group
        // + A set of Wheel entitys to mark the position of each data point
        // + Use position entitys as their pivots
        // + Interactive
        const pinGroup = scrawl.makeGroup({

            name: name('pin-group'),
            host,
            order: 3,
        });


        // Build the entitys
        yearLabels.forEach((label, index) => {

            // Hidden position Blocks
            scrawl.makeBlock({

                name: name(`${index}-position`),
                group: positionGroup,

                width: 0,
                height: 0,
                method: 'none',

                startX: `${graphLeft + (xStep * index) + (xStep / 2)}%`,
                startY: `${graphBottom}%`,
            });

            if (index) {

                // Line Shapes
                scrawl.makeLine({

                    name: name(`${index}-line`),
                    group: lineGroup,

                    pivot: name(`${index - 1}-position`),
                    lockTo: 'pivot',

                    endPivot: name(`${index}-position`),
                    endLockTo: 'pivot',

                    useStartAsControlPoint: true,

                    strokeStyle: 'blue',
                    lineWidth: 2,

                    method: 'draw',
                });
            }

            // Visible pin Wheels
            scrawl.makeWheel({

                name: name(`${index}-pin`),
                group: pinGroup,
                order: index,

                radius: 8,

                handleX: 'center',
                handleY: 'center',

                pivot: name(`${index}-position`),
                lockTo: 'pivot',

                fillStyle: 'aliceblue',
                strokeStyle: 'blue',
                lineWidth: 4,

                method: 'drawThenFill',
            });
        });


        // #### User interaction
        const updateSelected = () => {

            const { yearLabels, data } = currentData;

            const entity = pinGroup.getArtefact(pinGroup.artefacts[selectedColumn]);

            pinGroup.setArtefacts({
                scale: 1,
                fillStyle: 'aliceblue',
            });

            frame.updateSubtitle(`${yearLabels[selectedColumn]}: §RED§${data[selectedColumn].toLocaleString()}`);

            entity.set({
                scale: 1.5,
                fillStyle: 'red',
            });
        };


        // #### Update function
        const update = api.update = (dataSet) => {

            if (dataSet) currentData = dataSet;

            // Only update if we have entitys to update
            if (positionGroup) {

                // Initial positioning calculations
                const yearLabels = currentData.yearLabels,
                    data = currentData.data;

                let max = Math.max(...data),
                    min = Math.min(...data);

                const batch = calculateBatchValue(max - min);

                max = ((Math.floor(max / batch)) * batch) + batch;
                min = (Math.floor(min / batch)) * batch;

                const categoryValue = graphHeight / (max - min),
                    yDepth = graphBottom - graphHeight;

                // Grab a handle to the 'entity' section in the Scrawl-canvas library
                const entity = scrawl.library.entity;

                // Reset any highlighted pin Wheel
                pinGroup.setArtefacts({
                    scale: 1,
                    fillStyle: 'aliceblue',
                });

                // Final calculations and updates
                yearLabels.forEach((label, index) => {

                    const pointDepth = (data[index] - min) * categoryValue,
                        yVal = yDepth + (graphHeight - pointDepth),
                        tempName = name(`${index}`);

                    entity[`${tempName}-position`].set({
                        startY: `${yVal}%`,
                    });

                    entity[`${tempName}-pin`].set({

                        onEnter: function () {

                            selectedColumn = this.get('order');
                            updateSelected();
                        },
                    });
                });

                // Update the chart frame
                frame.updateSubtitle('No data selected');
                frame.updateYTop(max.toLocaleString());
                frame.updateYBottom(min.toLocaleString());
                frame.updateXLeft(yearLabels[0]);
                frame.updateXRight(yearLabels[yearLabels.length - 1]);

                selectedColumn = 0;
                updateSelected();
            }
        };

        update();


        // #### Accessibility
        const doNavigation = (direction) => {

            const {yearLabels} = currentData;

            const columnLen = yearLabels.length;

            switch (direction) {

                case 'left' :
                    selectedColumn--;
                    break;

                case 'right' :
                    selectedColumn++;
                    break;
            }

            if (selectedColumn < 0) selectedColumn = columnLen - 1;
            else if (selectedColumn >= columnLen) selectedColumn = 0;

            updateSelected();
        };

        frame.keyboard = scrawl.makeKeyboardZone({

            zone: canvas,
            none: {
                ArrowLeft: () => doNavigation('left'),
                ArrowUp: () => {},
                ArrowRight: () => doNavigation('right'),
                ArrowDown: () => {},
            },
        });
    }
};
