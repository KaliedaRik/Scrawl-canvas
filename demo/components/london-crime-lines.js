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

// import scrawl from 'https://unpkg.com/scrawl-canvas@8.0.11';
import scrawl from '../../source/scrawl.js';

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
let currentData = false,
    isBuilt = false;

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
