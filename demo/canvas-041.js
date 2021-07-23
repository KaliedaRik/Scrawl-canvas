// # Demo Canvas 041 
// Access and use a canvas context engine using the makeAnimation factory

// [Run code](../../demo/canvas-041.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});


// Create a function to draw stuff on a canvas
// + Code taken from this blog site post: [Bartosz Ciechanowski - Cameras and lenses, 7 December 2020](https://ciechanow.ski/cameras-and-lenses/) ... specifically [this JS file](https://ciechanow.ski/js/lenses.js)
const drawBlade = function (engine, rotation = 0) {

    engine.save();

    let dpr = scrawl.getPixelRatio();
    engine.setTransform(1/dpr, 0, 0, 1/dpr, 0, 0);

    engine.translate(200, 200);
    engine.rotate(rotation * Math.PI / 180);
    engine.translate(-200, -200);

    engine.translate(71, 25);

    engine.fillStyle = "#111";
    engine.strokeStyle = "#777";

    engine.beginPath();
    engine.moveTo(89.4010224, 104.878569);
    engine.bezierCurveTo(89.2014641, 59.0393448, 52.2406566, 21.8785692, 6.40102238, 21.8785692);
    engine.bezierCurveTo(-0.598977616, 21.8785692, -3.54240333, 14.8213764, 6.40102238, 10.3785692);
    engine.bezierCurveTo(29.9010224, -0.121430803, 60.1944849, -2.5577938, 85.1944849, 4.4422062);
    engine.bezierCurveTo(106.455278, 10.3952284, 130.17673, 17.6283113, 144.389943, 43.5465243);
    engine.bezierCurveTo(161.389943, 74.5465243, 150.901934, 94.6590605, 155.901022, 116.878569);
    engine.bezierCurveTo(162.227448, 144.997707, 171.289513, 153.053505, 176.736821, 156.416713);
    engine.bezierCurveTo(183.731851, 160.735498, 184.243043, 167.938877, 181.743043, 172.438877);
    engine.bezierCurveTo(179.243043, 176.938877, 173.80372, 180.55601, 166.350116, 177.644439);
    engine.bezierCurveTo(157.688987, 174.261179, 122.055011, 166.31114, 109.41407, 154.260969);
    engine.bezierCurveTo(103.684297, 148.798975, 89.5544242, 140.115494, 89.4010224, 104.878569);
    engine.closePath();
    engine.fill("evenodd");
    engine.stroke();

    engine.fillStyle = "#333";
    engine.strokeStyle = "#777";
    engine.beginPath();
    engine.arc(171, 166, 4, 0, 6.283185307179586, false);
    engine.closePath();
    engine.fill("evenodd");
    engine.stroke();
    engine.restore();
};


// #### Scene animation

// Function to display frames-per-second data, and other information relevant to the demo
const report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
// + We can use `makeAnimation` instead of `makeRender`
// + Inside the function, we construct our Display cycle
let rotation = 0;

scrawl.makeAnimation({

    // Give our animation a name, in case we want to retrieve it from te Scrawl-canvas library later
    name: "demo-animation",

    // Every Animation object __must__ have a `fn` attribute!
    fn: () => {

        // The Display cycle includes 3 key steps:
        // + `clear()` - to wipe the canvas's drawing areas clean
        // + `compile()` - which takes place on the Canvas wrapper object's `base` canvas. 
        // + `show()` - which copies over everything drawn on the base canvas and pastes it into the display canvas
        canvas.clear();

        // In this instance, we're using our `drawBlade()` function instead of the built-in `compile` function
        drawBlade(canvas.base.engine, ++rotation);

        canvas.show();

        // We can invoke additional functions at any time, wrapping them in `Promise.resolve()` functions
        report();
    },
});


// #### Development and testing
console.log(scrawl.library);
