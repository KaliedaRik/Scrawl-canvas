// # Demo Canvas 056 
// Seeded random number generator; point on path

// [Run code](../../demo/canvas-056.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    backgroundColor: 'azure',
});

// Magic numbers
const noOfPins = 16,
    angleAddition = 90,
    pinRotationAngle = 360 / noOfPins;;

// User-updatable values
let densityValue = 600,
    lengthValue = 20,
    rotationValue = 360,
    pathrollValue = false;

// We use a Polyline entity as the guide along which we shall calculate the hairs for our Shape entity. The Polyline's pins are a set of Wheel entitys which the user can drag around the canvas to reshape the Polyline
const firstPins = scrawl.makeGroup({
    name: 'first-pins',
    host: canvas.base.name,
});

const coord = scrawl.requestCoordinate();

for (let i = 0; i < noOfPins; i++) {

    coord.setFromArray([0, 200]).rotate(i * pinRotationAngle).add([300, 300]);

    scrawl.makeWheel({
        name: `pin-1-${i}`,
        group: 'first-pins',
// @ts-expect-error
        start: [...coord],
        handle: ['center', 'center'],
        radius: 10,
        fillStyle: 'red',
        method: 'fillThenDraw',
    });
}

scrawl.releaseCoordinate(coord);

const firstOutline = scrawl.makePolyline({

    name: 'first-outline',
    pins: firstPins.get('artefacts'),
    mapToPins: true,
    tension: 0.25,
    strokeStyle: 'green',
    method: 'draw',
    closed: true,
    useAsPath: true,
    constantPathSpeed: true,
});

// The Shape entity starts with a minimal pathDefinition value. Note that the Shape's start and handle attributes are centered; this entity does not pivot or mimic to the Polyline entity which is why their borders are often misaligned.
const secondOutline = scrawl.makeShape({

    name: 'second-outline',
    pathDefinition: 'm0,0',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    lineWidth: 4,
    lineCap: 'round',
    strokeStyle: 'darkslategray',
    method: 'draw',
});


// We recalculate the Shape entity's pathDefinition value each time the user updates a control or drags one of the Polyline entity's pins. 
let currentOutline = '';

const checkOutlines = function () {

    let outline = firstOutline.get('pathDefinition');

    if (outline !== currentOutline) {

        currentOutline = outline;

        // Rotations are calculated with the help of a pool Coordinate object
        const coord = scrawl.requestCoordinate();

        // Get the number generator
        const numberGenerator = scrawl.seededRandomNumberGenerator('hello-world');

        let pos, x, y, a, dx, dy;
        let line = '';

        for (let i = 0; i < densityValue; i++) {

            // __getPathPositionData__ returns an Object with attributes `x`, `y`, `angle`.
            // + The first argument is a float Number value between `0` and `1`, representing the relative position of the required point along the path.
            // + The second argument is a boolean which, when set to true, will return the `constant speed` coordinate rather than the `natural speed` coordinate.
            pos = firstOutline.getPathPositionData(i / densityValue, true);
            x = pos.x;
            y = pos.y;

            if (pathrollValue) {

                a = pos.angle + 90;

                coord.set(0, numberGenerator.random() * lengthValue).rotate(a + (numberGenerator.random() * rotationValue)).add([x, y]);
            }
            else {

                coord.set(0, numberGenerator.random() * lengthValue).rotate(numberGenerator.random() * rotationValue).add([x, y]);
            }
            [dx, dy] = coord;

            line += `M${x},${y}L${dx},${dy}`;
        }

        // Return the Coordinate object back to the pool - failure to do this leads to memory leaks!
        scrawl.releaseCoordinate(coord);

        secondOutline.set({
            pathDefinition: line,
        });
    }
};


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Rotation: ${rotation.value}; Length: ${length.value}; Density: ${density.value}`;
});

// Create the Display cycle animation
const animation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    commence: checkOutlines,
    afterShow: report,
});

scrawl.makeDragZone({
    zone: canvas,
    collisionGroup: 'first-pins',
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});

// #### Development and testing
const rotation = document.querySelector('#rotation');
const length = document.querySelector('#length');
const density = document.querySelector('#density');
const pathRotation = document.querySelector('#pathroll');

scrawl.addNativeListener(['input', 'change'], () => {

// @ts-expect-error
    rotationValue = rotation.value;
// @ts-expect-error
    lengthValue = length.value;
// @ts-expect-error
    densityValue = density.value;

// @ts-expect-error
    pathrollValue = ('0' === pathroll.value) ? false : true;

    // Setting the `currentOutline` variable to a null string guarantees that the Shape entity's pathDefinition will be recalculated at the start of the next Display cycle
    currentOutline = '';

}, '.controlItem');

// @ts-expect-error
rotation.value = 360;
// @ts-expect-error
length.value = 20;
// @ts-expect-error
density.value = 600;
pathroll.options.selectedIndex = 0;

console.log(scrawl.library);
