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
    area:           'area-label',
    yearLabels:     ['year-1-label', 'year-2-label', ...],
    categoryLabels: ['category-1-label', 'category-2-label', ...],
    yearData: {
        'year-1-label': [category-1-data, category-2-data, ...],
        'year-2-label': [category-1-data, category-2-data, ...],
        ...
    }
}
*/

import * as scrawl from '../../source/scrawl.js';

// We need to adapt the graph frame with data specific to this graph
import * as frame from './simple-chart-frame.js';

// The graph we are adapting our data for
import * as graph from './simple-graph-stacked-bars.js'

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
}

// Rearrange data
// - From 'by-category' - as supplied in the raw data
// - To 'by-year' - required for this graph's display
const extractDataByYear = (yearLabels, categoryLabels, categoryData) => {

    let d = {};

    for (let i = 0; i < yearLabels.length; i++) {

        d[yearLabels[i]] = [];
    }

    for (let i = 0; i < categoryLabels.length; i++) {

        let cData = categoryData[categoryLabels[i]];

        for (let j = 0; j < yearLabels.length; j++) {

            d[yearLabels[j]].push(cData[j]);
        }
    }
    return d;
};

// The exported 'build' function
const build = function (namespace, canvas, dataSource) {

    getRawData (dataSource)
    .then (rawData => {

        // Reconstruct data into formats required by this graph type
        let area = rawData.area,
            yearLabels = rawData.years,
            categoryData = rawData.crimesByCategory,
            categoryLabels = Object.keys(categoryData),
            yearData = extractDataByYear(yearLabels, categoryLabels, categoryData);

        let data = {
            area,
            yearLabels,
            categoryLabels,
            yearData,
        };

        // Build the graph
        graph.build(namespace, canvas, data);

        // Update the frame with additional data
        frame.updateTitle(`${data.area} Crime Statistics - Overview`);
        frame.updateBackground(data.area);
    })
    .catch (error => console.log(error.message));
};


// Other exported functions 
// - Piping these through from graph module exported functions
const kill = graph.kill;
const hide = graph.hide;
const show = graph.show;

export {
    build,
    kill,

    hide,
    show,
}
