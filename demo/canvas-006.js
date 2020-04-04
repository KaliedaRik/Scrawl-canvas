// # Demo Canvas 006 
// Canvas tween stress test

// [Run code](../../demo/canvas-006.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let porthole = scrawl.library.artefact.porthole;

porthole.set({
    backgroundColor: 'black',
    css: {
        borderRadius: '50%'
    }
});


// ##### Star generation functionality

// We use this entity as a template for cloning new stars
let starling = scrawl.makeWheel({

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
});

let starCount = 0,
    addNumber = 100;

// `makeStar` function
let makeStars = function (buildNumber) {

    // We use a Vector for calculating the new star's direction
    let v = scrawl.requestVector(),
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
        scrawl.makeTween({

            name: star.name,

            targets: star,
            duration: Math.round((myRandom * 3000) + 2000),
            cycles: 0,

            // We will animate the star's `start` Coordinate (using __startX__ and __startY__ pseudo-attributes)
            definitions: [{
                attribute: 'startX',
                integer: true,
                start: 300,
                end: 300 + v.x
            }, {
                attribute: 'startY',
                integer: true,
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
    scrawl.releaseVector(v);

    // Change the color of the stars each time the user clicks on the porthole
    starling.set({
        fillStyle: `rgb(${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200})`
    });
};

// Generate the initial stars
makeStars(100);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Stars: ${starCount}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

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
scrawl.addNativeListener('click', addStars, porthole.domElement);
