/*
Data supplied to graph module as Javascript object with structure:
{
    yearLabels: ['year-1-label', 'year-2-label', ...],
    data:       [year-1-data, year-2-data, ...],
}
*/

// import scrawl from 'https://unpkg.com/scrawl-canvas@8.0.11';
import scrawl from '../../source/scrawl.js';

// We need to adapt the graph frame with data specific to this graph
import * as frame from './simple-chart-frame.js';

// Get the Magic Numbers from the chart frame
let graphWidth = frame.graphWidth,
    graphHeight = frame.graphHeight,
    graphBottom = frame.graphBottom,
    graphLeft = frame.graphLeft;

// Define the group variables
let positionGroup,
    lineGroup,
    pinGroup;

// The exported 'build' function
const build = function (namespace, canvas, dataSet) {

    // Only build the Groups and entitys if they don't already exist
    if (!positionGroup) {

        let yearLabels = dataSet.yearLabels,
            xStep = graphWidth / yearLabels.length;

        // The 'positions' Group
        // - A set of Block entitys used as pivots by the other entitys
        positionGroup = scrawl.makeGroup({

            name: `${namespace}-position-group`,
            host: canvas.base.name,
            order: 1,
            visibility: false,
        });

        // The 'lines' Group
        // - A set of line Shape entitys 
        // - Use position entitys for their start and end coordinate pivots
        lineGroup = scrawl.makeGroup({

            name: `${namespace}-line-group`,
            host: canvas.base.name,
            order: 2,
            visibility: false,
        });

        // The 'pins' Group
        // - A set of Wheel entitys to mark the position of each data point
        // - Use position entitys as their pivots
        // - Interactive 
        pinGroup = scrawl.makeGroup({

            name: `${namespace}-pin-group`,
            host: canvas.base.name,
            order: 3,
            visibility: false,
        });

        // Build the entitys
        yearLabels.forEach((label, index) => {

            // Hidden position Blocks
            scrawl.makeBlock({

                name: `${namespace}-${index}-position`,
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

                    name: `${namespace}-${index}-line`,
                    group: lineGroup,

                    pivot: `${namespace}-${index - 1}-position`,
                    lockTo: 'pivot',

                    endPivot: `${namespace}-${index}-position`,
                    endLockTo: 'pivot',

                    useStartAsControlPoint: true,

                    strokeStyle: 'blue',
                    lineWidth: 2,

                    method: 'draw',
                });
            }

            // Visible pin Wheels
            scrawl.makeWheel({

                name: `${namespace}-${index}-pin`,
                group: pinGroup,

                radius: 8,

                handleX: 'center',
                handleY: 'center',

                pivot: `${namespace}-${index}-position`,
                lockTo: 'pivot',

                fillStyle: 'aliceblue',
                strokeStyle: 'blue',
                lineWidth: 4,

                method: 'drawThenFill',
            });
        });

        // All further calculation happens in the 'update' function
        update(namespace, dataSet);

        // Display the graph entitys
        show();
    }
};

// Determine the range batch
// - To make sure the graph covers as much vertical space as possible
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

// the exported 'update' function
const update = (namespace, dataSet) => {

    // Only update if we have entitys to update
    if (positionGroup) {

        // Initial positioning calculations
        let yearLabels = dataSet.yearLabels,
            data = dataSet.data,
            max = Math.max(...data),
            min = Math.min(...data),
            batch = calculateBatchValue(max - min);

        max = ((Math.floor(max / batch)) * batch) + batch;
        min = (Math.floor(min / batch)) * batch;

        let categoryValue = graphHeight / (max - min),
            yDepth = graphBottom - graphHeight;

        // Grab a handle to the 'entity' section in the Scrawl-canvas library
        let entity = scrawl.library.entity;

        // Reset any highlighted pin Wheel
        pinGroup.setArtefacts({
            scale: 1,
            fillStyle: 'aliceblue',
        });

        // Final calculations and updates
        yearLabels.forEach((label, index) => {

            let pointDepth = (data[index] - min) * categoryValue,
                yVal = yDepth + (graphHeight - pointDepth),
                tempName = `${namespace}-${index}`;

            entity[`${tempName}-position`].set({
                startY: `${yVal}%`,
            });

            entity[`${tempName}-pin`].set({

                onEnter: function () {

                    pinGroup.setArtefacts({
                        scale: 1,
                        fillStyle: 'aliceblue',
                    });

                    frame.updateSubtitle(`${label}: §RED§${data[index].toLocaleString()}`);

                    this.set({
                        scale: 1.5,
                        fillStyle: 'red',
                    });
                },
            });
        });

        // Update the chart frame
        frame.updateSubtitle('No data selected');
        frame.updateYTop(max.toLocaleString());
        frame.updateYBottom(min.toLocaleString());
        frame.updateXLeft(yearLabels[0]);
        frame.updateXRight(yearLabels[yearLabels.length - 1]);
    }
};

// Exported 'kill' function
const kill = () => {

    if (positionGroup) {

        positionGroup.kill(true);
        lineGroup.kill(true);
        pinGroup.kill(true);

        positionGroup = false;
        lineGroup = false;
        pinGroup = false;
    }
};

// Exported 'hide' function
const hide = () => {

    if (positionGroup) {

        positionGroup.visibility = false;
        lineGroup.visibility = false;
        pinGroup.visibility = false;
    }
};

// Exported 'show' function
const show = () => {

    if (positionGroup) {

        positionGroup.visibility = true;
        lineGroup.visibility = true;
        pinGroup.visibility = true;
    }
};

export {
    build,
    update,
    kill,
    hide,
    show,
}
