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


// #### Imports and exports
// We need to adapt the graph frame with data specific to this graph
import { api as frame } from './simple-chart-frame.js';

// The graph we are adapting our data for
import { api as graph } from './simple-graph-lines.js';

// Export
export const api = {};


// #### Data manipulation
// Module state
let currentData, isBuilt;

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

// Extract relevant data for the graph being requested
const getData = (category) => {

    return {
        yearLabels: currentData.years,
        data: currentData.crimesByCategory[category]
    };
};


// #### Build function
api.build = function (items) {

    const { namespace, canvas, dataSource, category, scrawl } = items;

    if (namespace && canvas && dataSource && category && scrawl) {

        // #### Update function
        const update = api.update = (items) => {

            const { namespace, canvas, category, scrawl } = items;

            // Only update if we already have data available
            if (currentData && namespace && canvas && category && scrawl) {

                let myData = getData(category);

                if (!isBuilt) {

                    graph.build({
                        namespace,
                        data: myData,
                        canvas,
                        scrawl,
                    });

                    isBuilt = true;
                }
                else graph.update(myData);

                frame.updateTitle(`${currentData.area} Crimes: ${category}`);
                frame.updateBackground(category);
            }
        };


        // #### Kill function
        // + We pass the namespace through to the lines module, so we can handle kill functionality here rather than there
        api.kill = () => {

            scrawl.library.purge(namespace);
            currentData = false;
            isBuilt = false;
        }

        // #### Build
        if (!isBuilt) {

            getRawData (dataSource)
            .then (rawData => {

                currentData = rawData;

                graph.build({
                    namespace, 
                    data: getData(category),
                    canvas, 
                    scrawl,
                });

                isBuilt = true;

                update({
                    namespace,
                    category,
                    canvas,
                    scrawl,
                });
            })
            .catch(e => console.log(e.message));
        }
    }
};
