// # Demo Modules 002
// Spiral charts
//
// Related files:
// + [Spiral charts - main module](../modules-002.html)
//
// Import the Scrawl-canvas object 
// + There's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import scrawl from '../../source/scrawl.js';

// Function to fetch and parse Wikipedia page view timeseries data
// + Wikipedia implements the [Mediawiki Action API](https://www.mediawiki.org/wiki/API:Main_page), meaning we can retrieve page views statistics by calling the appropriate endpoint URL
// + The fetch call is asynchronous, thus all calls get wrapped in Javascript Promises
// + Function default action is to retrieve data for views of the Wikipedia Cat page for the past three years
const getData = (page = 'Cat') => {

    return new Promise((resolve, reject) => {

        const data = {
            page: '',
            max: 0,
            min: 0,
            fromdate: '20200101',
            todate: '20200101',
            sunday: [], 
            monday: [], 
            tuesday: [], 
            wednesday: [], 
            thursday: [], 
            friday: [], 
            saturday: [], 
        };

        let t = new Date(),
            f = new Date();

        t.setDate(t.getDate() - 1);
        f.setFullYear(f.getFullYear() - 3);

        let fromdate = f.toISOString().split('T')[0].replace(/-/g, ''),
            todate = t.toISOString().split('T')[0].replace(/-/g, ''),
            dayCounter = f.getDay(),
            maxViews = 0, minViews = -1;

        let url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${page}/daily/${fromdate}/${todate}`;

        fetch(url)
        .then(response => response.json())
        .then(dataObject => {

            let dataArray = dataObject.items;

            let results = [[],[],[],[],[],[],[]];

            dataArray.forEach(d => {

                let views = d.views;

                maxViews = (views > maxViews) ? views : maxViews;

                if (minViews < 0) minViews = maxViews;
                else minViews = (views < minViews) ? views : minViews;

                results[dayCounter].push(views);

                dayCounter++;
                dayCounter = dayCounter % 7;
            });

            data.page = page;
            data.max = maxViews;
            data.min = minViews;
            data.fromdate = fromdate;
            data.todate = todate;
            data.sun = results[0];
            data.mon = results[1];
            data.tue = results[2];
            data.wed = results[3];
            data.thu = results[4];
            data.fri = results[5];
            data.sat = results[6];

            resolve(data);
        })
        .catch(e => {

            console.log(e);
            reject(data);
        });
    });
};

// We export a function which issues the fetch call and then builds a chart in a Cell. The function requires the following arguments:
// + __page__ - String value of the Wikipedia page, whose views statistics are to be charted: https://en.wikipedia.org/wiki/__Cat__
// + __canvasWrapper__ - a Scrawl-canvas Canvas wrapper object
// + ___reqs___ - (not required) a Javascript Object containing key:value attributes that help define the appearance of the chart. 
//
// We include functionality to action the following attributes in the reqs object argument: 
// + ___size___ - Number - the size of the (square) generated chart. Default: 400
// + ___backgroundColor___ - CSS Color String - the background color of the generated chart. Default: 'transparent'
// + ___minimumColor___ - CSS Color String - color used to display low daily views datapoints. Default: 'azure'
// + ___medialColor___ - CSS Color String - color used to display average daily views datapoints. Default: 'blue'
// + ___maximumColor___ - CSS Color String - color used to display high daily views datapoints. Default: 'red'
export default function (page, canvasWrapper, reqs = {}) {

    // We will eventually return a Picture entity to the calling invocation - but generating it takes time, hence we return a promise and resolve the Picture entity in due course
    return new Promise((resolve, reject) => {

        // We will create a new Cell for the chart, fabricate the required entitys, render the Cell, then capture the output into a single Picture entity which we assign to the canvasWrapper's Group. After this all completes we can kill the Cell, its Group, and all of the Group's entitys
        const cell = canvasWrapper.buildCell({
            name: `${page}-cell`,
            width: reqs.size || 400,
            height: reqs.size || 400,
            cleared: false,
            compiled: false,
            shown: false,
            backgroundColor: reqs.backgroundColor || 'transparent',
        });

        const chartGroup = scrawl.library.group[cell.name];

        // Use Color objects to determine the appropriate color for each charted view value. Again, we'll kill these objects once we've finished with them
        const lowViewsFactory = scrawl.makeColor({
            name: `${page}-low-views`,
            minimumColor: reqs.minimumColor || 'azure',
            maximumColor: reqs.medialColor || 'blue',
        });

        const highViewsFactory = scrawl.makeColor({
            name: `${page}-high-views`,
            maximumColor: reqs.medialColor || 'blue',
            maximumColor: reqs.maximumColor || 'red',
        });

        // We start by retrieving the data from Wikipedia
        getData(page)
        .then(data => {

            // Some initial calculations
            const maxViews = data.max,
                minViews = data.min,
                medianViews = (maxViews - minViews) / 2;

            const maxDataLen = Math.max(data.mon.length, data.tue.length, data.wed.length, data.thu.length, data.fri.length, data.sat.length, data.sun.length);

            // Each day series is a spiral of Line entitys. We'll cut down on the code by creating a factory to generate each day's spiral
            const buildDayChart = function (dayData, offsetVal, dayName, missFirst) {

                let currentWeek, currentYear, nextWeek, nextYear;

                for (let i = 0, iz = dayData.length - 2; i < iz; i++) {

                    if (missFirst) {

                        currentWeek = (i + 1) % 52;
                        currentYear = Math.floor((i + 1) / 52);

                        nextWeek = (i + 2) % 52;
                        nextYear = Math.floor((i + 2) / 52);

                        nextWeek = nextWeek % 52;
                    }
                    else {

                        currentWeek = i % 52;
                        currentYear = Math.floor(i / 52);

                        nextWeek = (i + 1) % 52;
                        nextYear = Math.floor((i + 1) / 52);

                        nextWeek = nextWeek % 52;
                    }

                    let views = dayData[i] - minViews,
                        dataColor;

                    // Get the appropriate color for this data point's value
                    if (views < medianViews) dataColor = lowViewsFactory.getRangeColor(views / medianViews);
                    else dataColor = highViewsFactory.getRangeColor((views - medianViews) / medianViews);

                    // Each line represents a siongle data point, positioned in its appropriate place on the spiral by reference to the chart's spoke lines
                    scrawl.makeLine({

                        name: `${page}-${dayName}-line-${i}`,
                        group: chartGroup,

                        lineWidth: 5,
                        strokeStyle: dataColor,

                        path: `${page}-week-line-${currentWeek}`,
                        pathPosition: (currentYear * 0.33) + offsetVal,
                        lockTo: 'path',

                        endPath: `${page}-week-line-${nextWeek}`,
                        endPathPosition: (nextYear * 0.33) + offsetVal,
                        endLockTo: 'path',

                        method: 'draw',
                    });
                }
            }

            // A year is made up of 52 weeks. We create 52 Line entity spokes around a central point to act as the frame for our chart. By setting an appropriate value for each Line's handleY and roll attributes means that when it comes to building the day spirals we just need to pivot those Lines to our spokes - positioning made easy!
            for (let i = 0; i < 52; i++) {

                scrawl.makeLine({

                    name: `${page}-week-line-${i}`,
                    group: chartGroup,

                    start: [200, 220],
                    end: [200, (220 - 120)],
                    handle: [0, ((i / 52) * (120 / 3)) + 30],
                    roll: (i / 52) * 360,
                    useAsPath: true,

                    // We don't need to see the spokes in the finished chart; we just need them positioned correctly
                    method: 'none',
                });
            }

            // Build each day's spiral
            buildDayChart(data.mon, 0, 'mon', (data.mon.length < maxDataLen) ? true : false);
            buildDayChart(data.tue, 0.042, 'tue', (data.tue.length < maxDataLen) ? true : false);
            buildDayChart(data.wed, 0.084, 'wed', (data.wed.length < maxDataLen) ? true : false);
            buildDayChart(data.thu, 0.126, 'thu', (data.thu.length < maxDataLen) ? true : false);
            buildDayChart(data.fri, 0.168, 'fri', (data.fri.length < maxDataLen) ? true : false);
            buildDayChart(data.sat, 0.21, 'sat', (data.sat.length < maxDataLen) ? true : false);
            buildDayChart(data.sun, 0.252, 'sun', (data.sun.length < maxDataLen) ? true : false);

            // Now all the chart entitys have been created, we no longer need the Color objects
            lowViewsFactory.kill();
            highViewsFactory.kill();

            // We will render this Cell manually, outside of the Display cycle animation loop
            cell.clear();

            // Setup the cell to capture its image as it compiles ...
            scrawl.createImageFromCell(cell, true);

            // ... and invoke the compile step
            cell.compile()

            // The compile step will (eventually) add a hidden &lt;img> element to the DOM. This means we no longer require the Cell or its entitys. We need to kill the Cell's Group before we kill the Cell itself
            chartGroup.kill(true);
            cell.kill();

            // Now we can create a single Picture entity for display in the canvasWrapper's &lt;canvas> element
            let img = scrawl.makePicture({
                name: `${page}-chart-image`,
                group: canvasWrapper.base.name,

                asset: `${page}-cell-image`,

                dimensions: ['100%', '100%'],
                copyDimensions: ['100%', '100%'],
            });

            resolve(img);
        })
        .catch(e => {

            console.log('buildChart error', e);
            resolve(false);
        });
    });
};
