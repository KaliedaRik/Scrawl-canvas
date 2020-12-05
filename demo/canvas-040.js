// # Demo Canvas 040 
// Trace out a Shape path over time

// [Run code](../../demo/canvas-040.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});


// Create a Shape entity to act as a path for our strokeStyle outline
const arrow = scrawl.makeShape({

    name: 'my-arrow',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    strokeStyle: 'red',
    fillStyle: 'lavender',
    lineWidth: 6,
    lineJoin: 'round',
    lineCap: 'round',

    scale: 0.4,
    scaleOutline: false,
    roll: -90,

    // We create this effect using a dashed line with very large dash/nodash values
    // + We can then set the offset to the point where the displayed dash ends, so it looks like the arrow doesn't have a stroke
    lineDash: [10000, 10000],
    lineDashOffset: 10000,

    // To retrieve the Shape's length, we need to tell it that it is being used as a path
    useAsPath: true,
    precision: 1,

    method: 'fillThenDraw',
});


// #### Scene animation

// Our outline has been set up - in the HTML file range input element with an id of "progress" - as a number value running from 0.0 (no outline visible) to 100.0 (whole Shape is outlined). What we need to do in our code is link this novel `progress` attribute to our Shape entity's `lineDashOffset` attribute.
//+ We cannot set the `lineDashOffset` attribute directly because it is an absolute value, dependent on the Shape entity's (computed) path length value which is, in turn, dependent on the entity's `pathDefinition` and `scale` attribute values.
// + We also want to animate the progress value using a Tween animation; however we can only tween values which reside in a Scrawl-canvas object, with a Scrawl-canvas `set` function.
//
// To solve these issues, we create a World object and define the `progress` attribute there; at the same time we can define its setter function to both calculate and update the Shape entity's `lineDashOffset` attribute and also update the web page's progress input field.
const progressElement = document.querySelector('#progress');

const myWorld = scrawl.makeWorld({

    name: 'demo-world',

    userAttributes: [

        {
            key: 'progress', 
            defaultValue: 0,
            setter: function (item) {

                this.progress = item;

                arrow.set({
                    lineDashOffset: 10000 - Math.round(arrow.length * (item / 100)),
                });

                progressElement.value = item;
            },
        }
    ],
});


// We allow users to update the Shape entity's scale and roll attributes manually (and, when the tween is not running, the progress value too). The following function checks to see if we need to update anything and, if required, invokes the myWorld.progress setter function to action the visual output of any updates.
let dirty = true;

const checkDirty = function () {

    if (dirty) {

        dirty = false;

        myWorld.set({
            progress: progressElement.value,
        });
    }
};


// Build a tween to progressively outline the arrow Shape entity
// + We actually tween the myWorld.progress attribute, which in turn will update the arrow entity
const myTween = scrawl.makeTween({
  
  name: 'line-progression',
  
  duration: 5000,
  reverseOnCycleEnd: true,
  cycles: 0,
  targets: myWorld,
  
  definitions: [
    {
      attribute: 'progress',
      start: 0,
      end: 100,
      engine: 'easeOutIn',
    }
  ],
})


// Function to display frames-per-second data, and other information relevant to the demo
const report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Arrow length: ${arrow.length}
    Line progress: ${progressElement.value}`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    commence: checkDirty,
    afterShow: report,
});


// #### User interaction
const updateScale = function (e) {

    e.preventDefault();
    e.returnValue = false;

    arrow.set({
        scale: e.target.value,
    });

    dirty = true;
};
scrawl.addNativeListener(['input', 'change'], updateScale, '#scale');

const updateProgress = function (e) {

    e.preventDefault();
    e.returnValue = false;
    dirty = true;
};
scrawl.addNativeListener(['input', 'change'], updateProgress, '#progress');

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '#roll',

    target: arrow,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        roll: ['roll', 'float'],
    },
});

const actionTween = function (e) {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

    if (myTween.isRunning() && val === 'halt') {

        myTween.halt();
        progressElement.removeAttribute('disabled');
    }
    else if (!myTween.isRunning() && val === 'run') {

        myTween.run();
        progressElement.setAttribute('disabled', '');
    }
};
scrawl.addNativeListener(['input', 'change'], actionTween, '#tween');


// #### Development and testing
console.log(scrawl.library);
