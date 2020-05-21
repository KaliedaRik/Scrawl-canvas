// # Demo DOM 005
// DOM tween stress test

// [Run code](../../demo/dom-005.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let porthole = scrawl.library.artefact.porthole;

porthole.set({
    width: 600,
    height: 600,
    perspectiveZ: 100,
    css: {
        overflow: 'hidden',
        borderRadius: '50%',
        backgroundColor: 'black',
    }
});


// Create new elements and their associated Tweens (each star element has its own Tween)
// + See Demo [Canvas-006](./canvas-006.html) for a more detailed explanation of this approach to generating new stars.
let starCount = 0,
    addNumber = 25;

let makeStars = function (buildNumber) {

    for (let i = 0; i < buildNumber; i++) {

        starCount++;

        let star = porthole.addNewElement({

            name: `star_${starCount}`,
            tag: 'div',

            width: 6,
            height: 6,
            startX: 300,
            startY: 300,
            handleX: 'center',
            handleY: 'center',

            noUserInteraction: true,
            noDeltaUpdates: true,
            noPositionDependencies: true,
            noFilters: true,
            noPathUpdates: true,

            css: {
                backgroundColor: 'white',
                borderRadius: '50%'
            }
        })

        let r1 = Math.random();

        let v = scrawl.requestVector({ 
            x: 1 
        }).rotate(Math.random() * 360).scalarMultiply(300);

        let x = v.x,
            y = v.y;

        scrawl.releaseVector(v);

        scrawl.makeTween({

            name: star.name,
            targets: star,
            duration: Math.round((r1 * 3000) + 2000),
            cycles: 0,

            definitions: [{
                attribute: 'startX',
                // integer: true,
                start: 300,
                end: 300 + x,
            }, {
                attribute: 'startY',
                // integer: true,
                start: 300,
                end: 300 + y,
            }, {
                attribute: 'scale',
                start: 0.5,
                end: Math.round((1 - r1) * 0.9) + 0.6,
            }]

        }).run();
    }
};

makeStars(50);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
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
// The event listener will add a given number of stars to the display when the user clicks on the scene
let addStars = (e) => {

    e.preventDefault();
    e.returnValue = false;

    makeStars(addNumber);
};
scrawl.addNativeListener('click', addStars, porthole.domElement);
