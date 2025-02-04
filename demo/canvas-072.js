// # Demo Canvas 072
// Public transport furniture cover design

// [Run code](../../demo/canvas-072.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('my-canvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Get image from DOM
scrawl.importDomImage('.image-assets');


// Create Pattern style using imported image
scrawl.makePattern({

    name: name('weave-pattern'),
    asset: 'weave',
    stretchX: 0.37 / 2.5,
    stretchY: 0.37 / 2.5,
});


// Do the work in a dedicated 150 x 100 Cell
const eWidth = 150,
    eHeight = 100;

const easel = canvas.buildCell({
    name: name('easel-cell'),
    dimensions: [eWidth, eHeight],
    cleared: false,
    compiled: false,
    shown: false
});


// Get handles to the Cell's engine and pixel data
const easelData = easel.getCellData(true),
    pixelState = easelData.pixelState;


// Create the display Picture
scrawl.makeBlock({
    name: name('cloth'),
    dimensions: ['100%', '100%'],
    fillStyle: name('weave-pattern'),
});

scrawl.makePicture({
    name: name('display'),
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    asset: easel,
    imageSmoothingEnabled: false,
    globalAlpha: 0.5,
});


// Define the different species
const empty = {
    name: 'empty',
};

const species = {
    lightblue: {
        name: 'lightblue',
        isAlive: true,
        // moveX: Math.floor(Math.random() * 7) - 3,
        // moveY: Math.floor(Math.random() * 7) - 3,
        // breedX: Math.floor(Math.random() * 3) - 1,
        // breedY: Math.floor(Math.random() * 3) - 1,
        red: 200,
        green: 200,
        blue: 250
    },

    darkblue: {
        name: 'darkblue',
        isAlive: true,
        // moveX: Math.floor(Math.random() * 7) - 3,
        // moveY: Math.floor(Math.random() * 7) - 3,
        // breedX: Math.floor(Math.random() * 3) - 1,
        // breedY: Math.floor(Math.random() * 3) - 1,
        red: 20,
        green: 20,
        blue: 150
    },
};

const speciesNames = Object.keys(species);


// Create the beasts
const beasts = [];


// Create the landscape array
const landscape = new Array(eHeight * eWidth).fill(empty);


const initialize = () => {

    render.halt();

    beasts.length = 0;
    landscape.fill(empty);

    speciesNames.forEach(label => {

        const s = species[label];

        s.moveX = Math.floor(Math.random() * 7) - 3;
        s.moveY = Math.floor(Math.random() * 7) - 3;
        s.breedX = Math.floor(Math.random() * 3) - 1;
        s.breedY = Math.floor(Math.random() * 3) - 1;
    });

    for (let i = 0; i < 50; i++) {

        const x = Math.floor(Math.random() * eWidth),
            y = Math.floor(Math.random() * eHeight),
            index = y * eWidth + x;

        if (landscape[index].name === 'empty') {

            const egg = Math.floor(Math.random() * speciesNames.length);

            const baby = Object.assign({}, species[speciesNames[egg]]);

            baby.currentX = x;
            baby.currentY = y;
            baby.currentIndex = index;

            beasts.push(baby);
            landscape[index] = baby;
        }
    }
    counter = 0,
    generations = 0;

    finalize();

    render.run();
};


// Beast functionality - movement
const move = () => {

    beasts.forEach((beast) => {

        const { currentX, currentY, moveX, moveY } = beast;

        let nextX = currentX + moveX,
            nextY = currentY + moveY;

        if (nextX >= eWidth) nextX -= eWidth;
        else if (nextX < 0) nextX += eWidth;

        if (nextY >= eHeight) nextY -= eHeight;
        else if (nextY < 0) nextY += eHeight;

        const nextIndex = nextY * eWidth + nextX;

        if (landscape[nextIndex].name === "empty") {

            beast.currentX = nextX;
            beast.currentY = nextY;
            beast.currentIndex = nextIndex;

            landscape[nextIndex] = beast;
        } 
        else {

            beast.isAlive = false;
            landscape[nextIndex].isAlive = false;
        }
    });
};


// Beast functionality - breeding
const breed = () => {

    beasts.forEach((beast) => {

        const { currentX, currentY, breedX, breedY } = beast;

        let nextX = currentX + breedX,
            nextY = currentY + breedY;

        if (nextX >= eWidth) nextX -= eWidth;
        else if (nextX < 0) nextX += eWidth;

        if (nextY >= eHeight) nextY -= eHeight;
        else if (nextY < 0) nextY += eHeight;

        const nextIndex = nextY * eWidth + nextX;

        if (landscape[nextIndex].name === 'empty') {

            const egg = Math.floor(Math.random() * speciesNames.length);

            const baby = Object.assign({}, species[speciesNames[egg]]);

            baby.currentX = nextX;
            baby.currentY = nextY;
            baby.currentIndex = nextIndex;

            beasts.push(baby);
            landscape[nextIndex] = baby;
        }
    });
};


// Transfer data to pixel objects
const finalize = () => {

    const tempBeasts = beasts.filter((beast) => beast.isAlive);

    beasts.length = 0;
    beasts.push(...tempBeasts);

    beasts.forEach((beast) => {

        const p = pixelState[beast.currentIndex];

        p.red = beast.red;
        p.green = beast.green;
        p.blue = beast.blue;
    });
};


// Update once every Display cycle, with added choke and stop
const counterChoke = 3,
    generationsChoke = 40;

let counter = 0,
    generations = 0;

const update = () => {

    if (generations < generationsChoke) {

        counter++;

        if (counter >= counterChoke) {

            counter = 0;
            generations++;

            pixelState.forEach(p => {

                p.red = 200;
                p.green = 0;
                p.blue = 0;
            });

            landscape.fill(empty);

            move();
            breed();
            finalize();

            easel.paintCellData(easelData);
        }
    }
};


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');

// Create the Display cycle animation
const render = scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: update,
    afterShow: report,
});


// Start run
initialize();


// #### User interaction
scrawl.addNativeListener('click', initialize, canvas.domElement);


// #### Development and testing
console.log(scrawl.library);
