// # Demo Canvas 056
// Seeded random number generator; point on path

// [Run code](../../demo/canvas-056.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Magic numbers
const noOfPins = 16,
    pinRotationAngle = 360 / noOfPins;

// User-updatable values
let densityValue = 600,
    lengthValue = 20,
    rotationValue = 360,
    pathrollValue = false;


// We use a Polyline entity as the guide along which we shall place our "frond" Shape entitys. The Polyline's pins are a set of Wheel entitys which the user can drag around the canvas to reshape the Polyline
const pinGroup = scrawl.makeGroup({

    name: name('pins'),
    host: canvas.getBase(),
    order: 1,
});


// Use a pool coordinate to help quickly calculate the positions of the pins
const coord = scrawl.requestCoordinate();

for (let i = 0; i < noOfPins; i++) {

    coord.setFromArray([0, 200]).rotate(i * pinRotationAngle).add([300, 300]);

    scrawl.makeWheel({

        name: name(`pin-1-${i}`),
        group: pinGroup,
/** @ts-expect-error */
        start: [...coord],
        handle: ['center', 'center'],
        radius: 10,
        fillStyle: 'red',
        method: 'fillThenDraw',
    });
}

// __Always__ release a pool coordinate after we're done using it!
scrawl.releaseCoordinate(coord);


const rope = scrawl.makePolyline({

    name: name('rope'),
    pins: pinGroup.get('artefacts'),
    mapToPins: true,
    tension: 0.25,
    strokeStyle: 'green',
    method: 'draw',
    closed: true,
    useAsPath: true,
});


// We'll generate the frond entitys from a template
const template = scrawl.makeShape({

    name: name('frond-template'),
    path: rope,
    constantSpeedAlongPath: true,
    pathDefinition: 'm0,0 l0,0',
    lineWidth: 4,
    lineCap: 'round',
    strokeStyle: 'darkslategray',
    method: 'draw',
    visibility: false,
});


// All frond entitys go into their own group
const fronds = scrawl.makeGroup({

    name: name('fronds'),
    host: canvas.getBase(),
});


// The flag stores a copy of the rope entitys pathDefinition string.
// + When the pathDefinition changes (user action) or we set it to an empty string, we'll regenerate all of the fronds
let flag = '';

const checkOutlines = function () {

    const def = rope.get('pathDefinition');

    if (def !== flag) {

        flag = def;

        // We'll just kill all the existing fronds and regenerate them
        fronds.killArtefacts();

        // The "random" numbers will be the same values and order every time this regeneration runs
        const numberGenerator = scrawl.seededRandomNumberGenerator('hello-world');

        for (let i = 0; i < densityValue; i++) {

            template.clone({

                name: name(`frond-${i}`),
                group: fronds,

                pathDefinition: `m0,0 l0,${lengthValue * numberGenerator.random()}`,

                visibility: true,

                pathPosition: numberGenerator.random(),
                lockTo: 'path',

                roll: rotationValue * numberGenerator.random(),
                addPathRotation: pathrollValue,
            });
        }
    }
};



// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Rotation: ${dom.rotation.value}
    Length: ${dom.length.value}
    Density: ${dom.density.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: checkOutlines,
    afterShow: report,
});


// #### User interaction
scrawl.makeDragZone({
    zone: canvas,
    collisionGroup: pinGroup,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


scrawl.addNativeListener(['input', 'change'], () => {

    rotationValue = parseFloat(dom.rotation.value);
    lengthValue = parseFloat(dom.length.value);
    densityValue = parseFloat(dom.density.value);

    pathrollValue = ('0' === dom.pathroll.value) ? false : true;

    // Setting the `flag` variable to a null string guarantees that the frond entitys will be recalculated at the start of the next Display cycle
    flag = '';

}, '.controlItem');


// Setup form
const dom = scrawl.initializeDomInputs([
    ['input', 'rotation', '360'],
    ['input', 'length', '20'],
    ['input', 'density', '600'],
    ['select', 'pathroll', 0],
]);


// #### Development and testing
console.log(scrawl.library);
