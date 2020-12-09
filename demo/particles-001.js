// # Demo Particles 001 
// Emitter entity, and Particle World, basic functionality

// [Run code](../../demo/particles-001.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

// Initial canvas background color - we will also allow the user to control this attribute's value
canvas.setBase({
    backgroundColor: '#000040',
});


// #### Particle physics animation scene

// Create a World object which we can then assign to the Emitter entity
let myWorld = scrawl.makeWorld({

    name: 'demo-world',

    // `tickMultiplier` controls the speed of the Emitter's animation
    tickMultiplier: 2,

    // We can define additional attributes for the World object, including their setter and getter functions (if required). We can also initialize the attribute as a Scrawl-canvas Coordinate, Vector or Quaternion object.
    userAttributes: [

        // These first two new attributes are purely for testing - we will get their values and log them to the console
        {
            key: 'hello', 
            defaultValue: 'Hello World',
            setter: function (item) { this.hello = `Hello ${item}!`},
        },
        {
            key: 'testCoordinate', 
            type: 'Coordinate',
            getter: function () { return [].concat(this.testCoordinate) },
            setter: function (item) { this.testCoordinate.set(item) },
        },

        // We will store a user-updatable Number value - `alphaDecay` - which we will use in the `stampAction` function to tweak the particle effect that we are trying to achieve
        {
            key: 'alphaDecay', 
            defaultValue: 6,
        },
    ],

    // Overwrite our user-defined attributes' default values with new data, for testing.
    hello: 'Wonderful Person',
    testCoordinate: [100, 100],
});

// Test the World object's user-defined attributes
console.log(myWorld.get('hello'));
myWorld.set({ testCoordinate: ['center', 'center'] });
console.log(myWorld.get('testCoordinate'));


// Define an Emitter entity
const myEmitter = scrawl.makeEmitter({

    name: 'use-raw-2d-context',

    // Every emitter __must__ be associated with a World object. The attribute's value can be the World object's String name value, or the object itself
    world: myWorld,

    // The Emitter is a normal Scrawl-canvas entity. It can be positioned absolutely/relatively - as here, by setting the `start` (`startX`, `startY`) coordinates. Or it can be positioned by reference to other Scrawl-canvas artefacts using the `pivot`, `mimic`, `path`, `mouse` and/or Net `particle` functionality.
    start: ['center', 'center'],

    // Emitter entitys use ___ephemeral particles___ to produce their visual effects, generating a steady stream of particles over time and then killing them off in various ways. The `generationRate` attribute _sets the number of particles that the Emitter will generate every second_.
    generationRate: 60,

    // A common way to kill off generated particles is to give them a lifetime limit (measured in seconds). We can set that value using the `killAfterTime` attribute. We can also add in a measure of variability using the `killAfterTimeVariation` attribute.
    // + The Emitter being defined here, for instance, will generate a regular stream of 60 particles every second, with each of the particles having a lifetime limit of between 4.9 and 5.1 seconds 
    killAfterTime: 5,
    killAfterTimeVariation: 0.1,

    // For every Display cycle tick (which in optimal conditions will be around 17 milliseconds after the previous tick), a particle will update its position and record the new position using a ParticleHistory array. This data is then added to the entity's `history` array. We can limit the number of ParticleHistory arrays stored in the history array by setting the `historyLength` attribute to a suitable integer Number value.
    historyLength: 100,

    // The key functionality of a particle is that it moves. 
    // + Particles will move as a consequence of the forces and spring constraints applied to them. 
    // + When the particle is generated, we can give it an initial ___velocity___; with no other force or spring applied to the particle, it will move at a constant speed over time to match this initial velocity value.
    // + We set the particle's initial velocity using a set of six __range__ attributes, which represent the distance travelled in the x, y and z directions, as measured in pixels-per-second.
    // + The `rangeFrom` attributes represent the lowest value in that dimension that will be generated. This value is ___local to the particle___ thus negative values are to the left (x) or above (y) or behind (z) the particles initial position.
    // + The `range` attribute is the maximum random value which will be added to the rangeFrom value. 
    // + All particles are assigned a (constrained) random velocity in this manner when they are generated. The values given below will ensure that every particle generated by this Emitter will have a vector velocity of somewhere between -20 to +20 pixels/second in both the x (left-right) and 'y' (above-below) directions, and between -0.2 and -1.2 pixels/second in the z (behind-infront) direction.
    rangeX: 40,
    rangeFromX: -20,

    rangeY: 40,
    rangeFromY: -20,

    rangeZ: -1,
    rangeFromZ: -0.2,

    // We can assign a range of colors to our particle - we'll start the demo with the minimum and maximum fillStyle colors set to the same color
    fillMinimumColor: '#f0f8ff',
    fillMaximumColor: '#f0f8ff',

    // The `stampAction` function describes the steps that our Emitter will take to draw each of its particles onto the host canvas screen.
    // + In this instance, we have not supplied the Emitter with an `artefact`; instead we will draw directly on the host object's &lt;canvas> element.
    stampAction: function (artefact, particle, host) {

        // We obtain the [canvas element's 2D rendering context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) - which we will call the ___engine___ - from the function's `host` argument.
        let engine = host.engine,
            history = particle.history,
            remaining, radius, alpha, x, y, z,
            endRad = Math.PI * 2;

        let colorFactory = this.fillColorFactory;

        // Start by saving the engine's current state.
        engine.save();

        // // We are using the same color for all of the Emitter's particles, which we've stored in a user-defined attribute in the World obvject.
        // engine.fillStyle = myWorld.get('particleColor');

        // We are going to display all of the particle's most recent tick positions, as saved in their `history` array
        history.forEach((p, index) => {

            // Every ParticleHistory Array stores its data in the following manner:
            // ```
            // [
            //     How much time the particle has to live, recorded in float Number seconds
            //     The particle's `z` position at that moment in time, recorded in pixel Number values
            //     The particle's `x` position at that moment in time, recorded in pixel Number values
            //     The particle's `y` position at that moment in time, recorded in pixel Number values
            // ]
            // ```
            [remaining, z, x, y] = p;

            // We can change the size of the particle circle, based on its given z direction value - the more distant it is from us, the smaller its radius should be.
            radius = 6 * (1 + (z / 3));

            // As the particle ages, we want it to appear to be more transparent - note that the _remaining_ value represents time remaining before the particle dies, not how long the particle has been alive.
            alpha = remaining / myWorld.alphaDecay;

            // Only draw this historical instance of the particle if it will be visible
            if (radius > 0 && alpha > 0) {

                // Start a new path
                engine.beginPath();

                // Move the path to the correct position
                engine.moveTo(x, y);

                // Define the circle to be drawn at those coordinates
                engine.arc(x, y, radius, 0, endRad);

                // Set the engine's globalAlpha attribute
                engine.globalAlpha = alpha;

                // Set the engine's fillStyle attribute - we're using a range color here
                // + We request the color from the emitter's fillColorFactory using the `get` function
                // + When `alpha == 1` the color factory will return the maximum color string
                // + When `alpha == 0` the color factory will return the minimum color
                // + values between 0 and 1 return a ranged color between the minimum and maximum colors
                engine.fillStyle = colorFactory.get(alpha);

                // Perform the fill for this particle
                engine.fill();
            }
        });

        // Restore the engine's state.
        engine.restore();
    },
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    let particlenames = scrawl.library.particlenames,
        particle = scrawl.library.particle,
        historyCount;

    let worldSpeed = document.querySelector('#world-speed'),
        maxColorController = document.querySelector('#maxcolor-controller'),
        minColorController = document.querySelector('#mincolor-controller'),
        colorAlpha = document.querySelector('#color-alpha'),
        background = document.querySelector('#background'),
        historyLength = document.querySelector('#historyLength'),
        killAfterTime = document.querySelector('#killAfterTime'),
        killAfterTimeVariation = document.querySelector('#killAfterTimeVariation'),
        rangeX = document.querySelector('#range_x'),
        rangeFromX = document.querySelector('#rangefrom_x'),
        rangeY = document.querySelector('#range_y'),
        rangeFromY = document.querySelector('#rangefrom_y'),
        rangeZ = document.querySelector('#range_z'),
        rangeFromZ = document.querySelector('#rangefrom_z'),
        generationRate = document.querySelector('#generationRate');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        // ParticleHistory arrays are not saved in the Scrawl-canvas library; instead we need to count them in each particle
        historyCount = 0;
        particlenames.forEach(n => {

            let p = particle[n];
            if (p) historyCount += p.history.length;
        });

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Particles: ${particlenames.length}, generationRate: ${generationRate.value}, historyLength: ${historyLength.value}
    Stamps per display: ${historyCount}

    backgroundColor: ${background.value}, tickMultiplier: ${worldSpeed.value}
    maxColor: ${maxColorController.value}, minColor: ${minColorController.value}, alphaDecay: ${colorAlpha.value}

    killAfterTime: ${killAfterTime.value}, killAfterTimeVariation: ${killAfterTimeVariation.value}

    Range - X: from ${rangeFromX.value} to ${parseFloat(rangeFromX.value) + parseFloat(rangeX.value)}
    Range - Y: from ${rangeFromY.value} to ${parseFloat(rangeFromY.value) + parseFloat(rangeY.value)}
    Range - Z: from ${rangeFromZ.value} to ${parseFloat(rangeFromZ.value) + parseFloat(rangeZ.value)}`;
    }
}();

// We want the Emitter to attach itself to the mouse cursor whenever it is active over the &lt;canvas> element
let mouseCheck = function () {

    let active = false;

    return function () {

        if (canvas.here.active !== active) {

            active = canvas.here.active;

            myEmitter.set({
                lockTo: (active) ? 'mouse' : 'start'
            });
        }
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: mouseCheck,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myWorld,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        'world-speed': ['tickMultiplier', 'float'],
        'color-alpha': ['alphaDecay', 'float'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myEmitter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        'maxcolor-controller': ['fillMaximumColor', 'raw'],
        'mincolor-controller': ['fillMinimumColor', 'raw'],
        generationRate: ['generationRate', 'int'],
        historyLength: ['historyLength', 'int'],
        killAfterTime: ['killAfterTime', 'float'],
        killAfterTimeVariation: ['killAfterTimeVariation', 'float'],
        'range_x': ['rangeX', 'float'],
        'rangefrom_x': ['rangeFromX', 'float'],
        'range_y': ['rangeY', 'float'],
        'rangefrom_y': ['rangeFromY', 'float'],
        'range_z': ['rangeZ', 'float'],
        'rangefrom_z': ['rangeFromZ', 'float'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: canvas,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        background: ['backgroundColor', 'raw'],
    },
});

const useGravity = function () {

    const selector = document.querySelector('#gravity');

    return function () {

        if (selector.value === "yes") {

            myEmitter.set({
                forces: ['gravity'],
            });
        }
        else {

            myEmitter.set({
                forces: [],
            });
        }
    }
}();
scrawl.addNativeListener(['input', 'change'], useGravity, '#gravity');

document.querySelector('#maxcolor-controller').value = '#F0F8FF';
document.querySelector('#mincolor-controller').value = '#F0F8FF';
document.querySelector('#world-speed').value = 2;
document.querySelector('#color-alpha').value = 6;
document.querySelector('#gravity').value = 'no';

document.querySelector('#generationRate').value = 60;
document.querySelector('#historyLength').value = 100;
document.querySelector('#killAfterTime').value = 5;
document.querySelector('#killAfterTimeVariation').value = 0.1;

document.querySelector('#range_x').value = 40;
document.querySelector('#rangefrom_x').value = -20;
document.querySelector('#range_y').value = 40;
document.querySelector('#rangefrom_y').value = -20;
document.querySelector('#range_z').value = -1;
document.querySelector('#rangefrom_z').value = -0.2;


// #### Development and testing
console.log(scrawl.library);

// Additional error capture events, for debugging work.
window.onerror = function (message, file, line, col, error) {
   alert("Trigger 1 (onerror) - Error occurred: " + error.message);
   return false;
};
window.addEventListener("error", function (e) {
   alert("Trigger 2 (addEventListener - error) - Error occurred: " + e.error.message);
   return false;
});
window.addEventListener('unhandledrejection', function (e) {
  alert("Trigger 2 (addEventListener - unhandledrejection) - Error occurred: " + e.reason.message);
});


