// # Demo Canvas 006 
// Canvas tween stress test

// [Run code](../../demo/canvas-006.html)
import {
    addNativeListener,
    library as L,
    makeRender,
    makeTween,
    makeWheel,
    releaseVector,
    requestVector,
    setIgnorePixelRatio,
} from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
setIgnorePixelRatio(false);


// #### Scene setup
let porthole = L.artefact.porthole;

porthole.set({
    css: {
        borderRadius: '50%'
    }
});


// ##### Star generation functionality

// We use this entity as a template for cloning new stars
let starling = makeWheel({

    name: 'starling',

    radius: 3,
    handleX: 'center',
    handleY: 'center',

    method: 'fill',
    fillStyle: 'white',

    // Adding in some flags to help speed up the Display cycle
    noDeltaUpdates: true,
    noPositionDependencies: true,
    noFilters: true,
    noUserInteraction: true,

    purge: 'all',
});

let starCount = 0,
    addNumber = 100;

// `makeStar` function
let makeStars = function (buildNumber) {

    // We use a Vector for calculating the new star's direction
    let v = requestVector(),
        star, i, myRandom;

    for (i = 0; i < buildNumber; i++) {

        starCount++;

        // Clone the entity template
        star = starling.clone({

            name: `star_${starCount}`,

            // Additional flags for speeding up the Display cycle
            noCanvasEngineUpdates: true,

            // All cloned stars will share the template star's State object - to save on memory
            sharedState: true,
        });

        myRandom = Math.random();

        v.setXY(1, 0).rotate(Math.random() * 360).scalarMultiply(300);

        // Every star gets its own Tween object
        // + And each Tween generates its own Ticker timeline object
        makeTween({

            name: star.name,

            targets: star,
            duration: Math.round((myRandom * 3000) + 2000),
            cycles: 0,

            // We will animate the star's `start` Coordinate (using __startX__ and __startY__ pseudo-attributes)
            definitions: [{
                attribute: 'startX',
                // integer: true,
                start: 300,
                end: 300 + v.x
            }, {
                attribute: 'startY',
                // integer: true,
                start: 300,
                end: 300 + v.y
            }, {

                // We will also animate the star's `scale` value to make the animation look more 3D
                attribute: 'scale',
                start: 0.5,
                end: Math.round((1 - myRandom) * 0.9) + 0.6,
            }]

        // We start the Tween running immediately after it has been created.
        }).run();

    }

    // We need to release our Vector back to its vector pool
    // + Failure to release pool objects can lead to memory leaks.
    releaseVector(v);

    // Change the color of the stars each time the user clicks on the porthole
    starling.set({
        fillStyle: `rgb(${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200})`
    });
};

// Generate the initial stars
makeStars(100);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
    return `Stars: ${starCount}`;
});


// Create the Display cycle animation
makeRender({

    name: 'demo-animation',
    target: porthole,
    afterShow: report,
});


// #### User interaction
// Event listeners
let addStars = (e) => {

    e.preventDefault();
    e.returnValue = false;

    makeStars(addNumber);
};
addNativeListener('click', addStars, porthole.domElement);
