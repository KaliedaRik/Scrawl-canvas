// ## Demo Canvas 006 

// [Canvas tween stress test](../../demo/canvas-006.html)
import scrawl from '../source/scrawl.js'


// Scene setup
let porthole = scrawl.library.artefact.porthole;

porthole.set({
    backgroundColor: 'black',
    css: {
        borderRadius: '50%'
    }
});


// Star generation functionality
let starling = scrawl.makeWheel({
    name: 'starling',
    radius: 3,
    handleX: 'center',
    handleY: 'center',
    method: 'fill',
    fillStyle: 'white',

    noDeltaUpdates: true,
    noPositionDependencies: true,
    noFilters: true,
    noUserInteraction: true,
});

let starCount = 0,
    addNumber = 100;

let makeStars = function (buildNumber) {

    let star, i, myRandom, 
        v = scrawl.requestVector();

    for (i = 0; i < buildNumber; i++) {

        starCount++;

        star = starling.clone({
            name: `star_${starCount}`,
            noCanvasEngineUpdates: true,
            sharedState: true,
        });

        myRandom = Math.random();

        v.setXY(1, 0).rotate(Math.random() * 360).scalarMultiply(300);

        scrawl.makeTween({
            name: star.name,

            targets: star,
            duration: Math.round((myRandom * 3000) + 2000),
            cycles: 0,

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
                attribute: 'scale',
                start: 0.5,
                end: Math.round((1 - myRandom) * 0.9) + 0.6,
            }]
        }).run();

    }

    scrawl.releaseVector(v);

    // Change the color of the stars each time the user clicks on the porthole
    starling.set({
        fillStyle: `rgb(${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200}, ${Math.floor(Math.random() * 55) + 200})`
    });
};

// Generate the initial stars
makeStars(100);


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


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

    name: 'demo-animation',
    target: porthole,
    afterShow: report,
});


// Event listeners
let addStars = (e) => {

    e.preventDefault();
    e.returnValue = false;

    makeStars(addNumber);
};
scrawl.addNativeListener('click', addStars, porthole.domElement);
