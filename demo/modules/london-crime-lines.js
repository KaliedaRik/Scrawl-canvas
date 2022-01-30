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
Data fetched from server as JSON String with structure:

{
    "area": "area-label",
    "years": ["year-1-label", "year-2-label", ...],
    "crimesByCategory": {
        "category-1-label": [year-1-data, year-2-data, ...],
        "category-2-label": [year-1-data, year-2-data, ...],
        ...
    }
}

Data supplied to graph module as Javascript object with structure:

{
    yearLabels: ['year-1-label', 'year-2-label', ...],
    data:       [year-1-data, year-2-data, ...],
}
*/

import * as scrawl from '../../source/scrawl.js';

// We need to adapt the chart frame with data specific to this graph
import * as frame from './simple-chart-frame.js';

// The graph we are adapting our data for
import * as graph from './simple-graph-lines.js'

// The asynchronous data fetch
const getRawData = (file) => {

    return new Promise ((resolve, reject) => {

        fetch (new Request(file))
        .then (response => {

            if (!response.ok) throw new Error(`Network Error ${response.status}: ${response.statusText}`);
            return response.json();
        })
        .then (rawData => resolve(rawData))
        .catch (e => reject(e));
    });
};

// Add some module state
let currentData, isBuilt;

// Extract relevant data for the graph being requested
const getData = (category) => {

    return {
        yearLabels: currentData.years,
        data: currentData.crimesByCategory[category]
    };
};

// The exported 'build' function
const build = function (namespace, canvas, data, category) {

    if (!isBuilt) {

        getRawData (data)
        .then (rawData => {

            currentData = rawData;

            graph.build(namespace, canvas, getData(category));
            isBuilt = true;

            update(namespace, canvas, category);
        })
        .catch(e => console.log(e.message));;
    }
}

// The exported 'update' function
const update = (namespace, canvas, category) => {

    // Only update if we already have data available
    if (currentData) {

        let myData = getData(category);

        if (!isBuilt) {

            graph.build(namespace, canvas, myData);
            isBuilt = true;
        }
        else graph.update(namespace, myData);

        frame.updateTitle(`${currentData.area} Crimes: ${category}`);
        frame.updateBackground(category);
    }
};

// The exported 'kill' function
const kill = () => {

    graph.kill();
    currentData = false;
    isBuilt = false;
};

// Other exported functions
const hide = graph.hide;
const show = graph.show;

export {
    build,
    update,

    hide,
    show,

    kill,
}
