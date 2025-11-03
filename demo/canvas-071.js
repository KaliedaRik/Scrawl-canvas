// # Demo Canvas 071
// Using getCellData, paintCellData functionality

// [Run code](../../demo/canvas-071.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('my-canvas');

// Get a handle to the DOM current status element
const currentStatus = document.querySelector('#current-status');

const [width, height] = canvas.get('dimensions');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create a Cell whose pixels we can directly manipulate
const easel = canvas.buildCell({
    name: name('easel'),
    dimensions: ['100%', '100%'],
    cleared: false,
    compiled: false,
});


// #### Pixel data manipulation functions
const clamp = val => {

    if (val < 0) return 0;
    if (val > 255) return 255;
    return val;
};

const setTowardsRed = () => {

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;

        red++;
        green--;
        blue--;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const setTowardsGreen = () => {

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;

        red--;
        green++;
        blue--;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const setTowardsBlue = () => {

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;

        red--;
        green--;
        blue++;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const setTowardsBlack = () => {

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;

        red--;
        green--;
        blue--;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const setTowardsWhite = () => {

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;

        red++;
        green++;
        blue++;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const redBlueAxes = () => {

    pixelState.forEach(pixel => {

        const { row, col } = pixel;
        let { red, green, blue } = pixel;

        const redAmount = Math.floor((row / height) * 255),
            greenAmount = 127,
            blueAmount = Math.floor((col / width) * 255);

        if (red > redAmount) red--;
        else red++;

        if (green > greenAmount) green--;
        else green++;

        if (blue > blueAmount) blue--;
        else blue++;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const blueGreenAxes = () => {

    pixelState.forEach(pixel => {

        const { row, col } = pixel;
        let { red, green, blue } = pixel;

        const redAmount = 127,
            greenAmount = Math.floor((col / width) * 255),
            blueAmount = Math.floor((row / height) * 255);

        if (red > redAmount) red--;
        else red++;

        if (green > greenAmount) green--;
        else green++;

        if (blue > blueAmount) blue--;
        else blue++;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const greenRedAxes = () => {

    pixelState.forEach(pixel => {

        const { row, col } = pixel;
        let { red, green, blue } = pixel;

        const redAmount = Math.floor((col / width) * 255),
            greenAmount = Math.floor((row / height) * 255),
            blueAmount = 127;

        if (red > redAmount) red--;
        else red++;

        if (green > greenAmount) green--;
        else green++;

        if (blue > blueAmount) blue--;
        else blue++;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
  update();
};

const distancesOne = () => {

    pixelState.forEach(pixel => {

        const distance = pixel.distance;
        let { red, green, blue } = pixel;

        const redDistance = 100,
            greenDistance = 250,
            blueDistance = 400;

        if (distance > redDistance) red--;
        else red++;

        if (distance > greenDistance) green--;
        else green++;

        if (distance > blueDistance) blue--;
        else blue++;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const distancesTwo = () => {

    pixelState.forEach(pixel => {

        const distance = pixel.distance;
        let { red, green, blue } = pixel;

        const redDistance = 440,
            greenDistance = 120,
            blueDistance = 270;

        if (distance > redDistance) red--;
        else red++;

        if (distance > greenDistance) green--;
        else green++;

        if (distance > blueDistance) blue--;
        else blue++;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const distancesThree = () => {

    pixelState.forEach(pixel => {

        const distance = pixel.distance;
        let { red, green, blue } = pixel;

        const redDistance = 230,
            greenDistance = 380,
            blueDistance = 80;

        if (distance > redDistance) red--;
        else red++;

        if (distance > greenDistance) green--;
        else green++;

        if (distance > blueDistance) blue--;
        else blue++;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const yellowStripes = () => {

    const stripeWidth = width / 5;

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;

        const stripeVal = Math.floor(pixel.col / stripeWidth) * 50;

        if (red > stripeVal) red--;
        else red++;

        if (green > stripeVal) green--;
        else green++;

        blue--;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const cyanStripes = () => {

    const stripeHeight = height / 5;

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;

        const stripeVal = Math.floor(pixel.row / stripeHeight) * 50;

        if (green > stripeVal) green--;
        else green++;

        if (blue > stripeVal) blue--;
        else blue++;

        red--;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const fizzBang = () => {

    pixelState.forEach(pixel => {

        const { row, col } = pixel;
        let { red, green, blue } = pixel;

        if (row % 3 === 0) {
            red++;
        }
        if (row % 5 === 0) {
            green++;
        }
        if (row % 11 === 0 ) {
            blue++;
        }
        if (col % 3 === 0) {
            red--;
        }
        if (col % 5 === 0) {
            green--;
        }
        if (col % 11 === 0 ) {
            blue--;
        }

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const thinStripe = () => {

    pixelState.forEach(pixel => {

        const { row, col } = pixel;
        let { red, green, blue } = pixel;

        if (row % 3 === col % 3) {
            red++;
        }
        if (row % 5 === col % 5) {
            green++;
        }
        if (row % 11 === col % 11 ) {
            blue++;
        }

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const thinStripeReverse = () => {

    pixelState.forEach(pixel => {

        const { row, col } = pixel;
        let { red, green, blue } = pixel;

        if ((width - row) % 3 === col % 3) {
            red++;
        }
        if ((width - row) % 5 === col % 5) {
            green++;
        }
        if ((width - row) % 11 === col % 11 ) {
            blue++;
        }

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const circlesGradient = () => {

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;

        const d = (pixel.distance * 5) % 255;

        if (red > d) red--;
        else red++;

        if (green > d) green--;
        else green++;

        if (blue > d) blue--;
        else blue++;

        pixel.red = clamp(red);
        pixel.green = clamp(green);
        pixel.blue = clamp(blue);
    });
    update();
};

const conicOne = () => {

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;
        const angle = pixel.angle;

        if (angle < 0.33) {

            if (red < 255) red++;
        }
        else if (angle < 0.67) {

            if (green < 255) green++;
        }
        else {

            if (blue < 255) blue++;
        }

        pixel.red = red;
        pixel.green = green;
        pixel.blue = blue;
    });
    update();
};

const conicTwo = () => {

    pixelState.forEach(pixel => {

        let { red, green, blue } = pixel;
        const angle = pixel.angle;

        if (angle < 0.33) {

            if (red > 0) red--;
        }
        else if (angle < 0.67) {

            if (green > 0) green--;
        }
        else {

            if (blue > 0) blue--;
        }

        pixel.red = red;
        pixel.green = green;
        pixel.blue = blue;
    });
    update();
};


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');

const easelData = easel.getCellData(true),
    pixelState = easelData.pixelState;

const update = () => easel.paintCellData(easelData);

update();


// Create the Display cycle animation
const render = scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// Update to a new pixel manipulation function every 2.5 seconds
const updateOptions = [
    setTowardsBlack,
    setTowardsWhite,
    redBlueAxes,
    blueGreenAxes,
    greenRedAxes,
    setTowardsRed,
    setTowardsGreen,
    setTowardsBlue,
    distancesOne,
    distancesTwo,
    distancesThree,
    yellowStripes,
    cyanStripes,
    fizzBang,
    thinStripe,
    circlesGradient,
    thinStripeReverse,
    conicOne,
    conicTwo,
];

const optionNames = [
    'setTowardsBlack',
    'setTowardsWhite',
    'redBlueAxes',
    'blueGreenAxes',
    'greenRedAxes',
    'setTowardsRed',
    'setTowardsGreen',
    'setTowardsBlue',
    'distancesOne',
    'distancesTwo',
    'distancesThree',
    'yellowStripes',
    'cyanStripes',
    'fizzBang',
    'thinStripe',
    'circlesGradient',
    'thinStripeReverse',
    'conicOne',
    'conicTwo',
];

const len = updateOptions.length,
    rnd = scrawl.seededRandomNumberGenerator('salting-is-good');

let choice = rnd.range(len),
    currentChoice = choice;

render.set({ commence: updateOptions[currentChoice] });
currentStatus.textContent = `Starting with ${optionNames[currentChoice]}`;

setInterval(() => {

    choice = rnd.range(len);
    render.set({ commence: updateOptions[choice] });
    currentStatus.textContent = `Changing from ${optionNames[currentChoice]} to ${optionNames[choice]}`;
    currentChoice = choice;
}, 2500);


// #### Development and testing
console.log(scrawl.library);
