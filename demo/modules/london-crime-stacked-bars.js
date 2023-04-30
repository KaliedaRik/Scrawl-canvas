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


// #### Imports and exports
// We need to adapt the graph frame with data specific to this graph
import { api as frame } from './simple-chart-frame.js';

// The graph we are adapting our data for
import { api as graph } from './simple-graph-stacked-bars.js';

// Export
export const api = {};


// #### Data manipulation
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

    const d = {};

    for (let i = 0; i < yearLabels.length; i++) {

        d[yearLabels[i]] = [];
    }

    for (let i = 0; i < categoryLabels.length; i++) {

        const cData = categoryData[categoryLabels[i]];

        for (let j = 0; j < yearLabels.length; j++) {

            d[yearLabels[j]].push(cData[j]);
        }
    }
    return d;
};


// #### Build function
api.build = (items) => {

    const { namespace, canvas, dataSource, scrawl } = items;

    if (namespace && canvas && dataSource && scrawl) {


        // #### Kill function
        // + We pass the namespace through to the stacked-bars module, so we can handle kill functionality here rather than there
        api.kill = () => {
            console.log('killing namespace', namespace);
            scrawl.library.purge(namespace);
        };


        // Fetch data, manipulate it, and pass it through to the stacked-bars module
        getRawData (dataSource)
        .then (rawData => {

            // Reconstruct data into formats required by this graph type
            const area = rawData.area,
                yearLabels = rawData.years,
                categoryData = rawData.crimesByCategory,
                categoryLabels = Object.keys(categoryData),
                yearData = extractDataByYear(yearLabels, categoryLabels, categoryData);

            const data = {
                area,
                yearLabels,
                categoryLabels,
                yearData,
            };

            // Build the graph
            graph.build ({
                namespace,
                canvas,
                data,
                scrawl,
            });

            // Update the frame with additional data
            frame.updateTitle (`${data.area} Crime Statistics - Overview`);
            frame.updateBackground (data.area);
        })
        .catch (error => console.log(error.message));
    }
};
