// # Demo Canvas 021 
// Import and use spritesheets

// [Run code](../../demo/canvas-021.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// ___Import a spritesheet asset___ (image file, and its associated JSON manifest file)
// + The manifest file should be a `.json` text file with the same name as the image file, in the same folder as the image file (in this case `img/cat-sprite.png` and `img/cat-sprite.json`)
// + Cat spritesheet image file taken from https://www.kisspng.com/png-walk-cycle-css-animations-drawing-sprite-sprite-1064760/
scrawl.importSprite('img/cat-sprite.png');


// Create a Picture entity to make use of the imported spritesheet asset
let piccy = scrawl.makePicture({

    name: 'walking-cat',

    asset: 'cat-sprite',

    width: 300,
    height: 150,

    startX: 240,
    startY: 170,

    roll: 20,

    method: 'fill',

    spriteTrack: 'walk',
    spriteFrameDuration: 100,
});

// Start the sprite animation
piccy.playSprite();


// Create a second Picture entity (by cloning the first one) 
// + uses a different animation track (as defined in the manifest)
// + start the animation - playing it at a faster speed (compared to the original)
piccy.clone({

    name: 'running-cat',

    startX: 300,
    startY: 20,

    spriteTrack: 'run',

    flipReverse: true,
    roll: -5,

}).playSprite(60);


// ___Import a set of spritesheet assets___
// + Comprises a number of different image files bound together by a manifest. 
// + In this case we don't have a separate manifest `.json` file, instead we define it as part of the import statement
scrawl.importSprite({

    name: 'dinosaur',

    manifestSrc: {
        default: [
            ["dinosprite_walk_0", 0, 0, 680, 472],
        ],
        walk: [
            ["dinosprite_walk_0", 0, 0, 440, 472],
            ["dinosprite_walk_1", 0, 0, 440, 472],
            ["dinosprite_walk_2", 0, 0, 440, 472],
            ["dinosprite_walk_3", 0, 0, 440, 472],
            ["dinosprite_walk_4", 0, 0, 440, 472],
            ["dinosprite_walk_5", 0, 0, 440, 472],
            ["dinosprite_walk_6", 0, 0, 440, 472],
            ["dinosprite_walk_7", 0, 0, 440, 472],
            ["dinosprite_walk_8", 0, 0, 440, 472],
            ["dinosprite_walk_9", 0, 0, 440, 472],
        ]
    },

    // Dinosaur images taken from https://www.gameart2d.com/free-dino-sprites.html
    imageSrc: [
        'img/dinosprite_walk_0.png',
        'img/dinosprite_walk_1.png',
        'img/dinosprite_walk_2.png',
        'img/dinosprite_walk_3.png',
        'img/dinosprite_walk_4.png',
        'img/dinosprite_walk_5.png',
        'img/dinosprite_walk_6.png',
        'img/dinosprite_walk_7.png',
        'img/dinosprite_walk_8.png',
        'img/dinosprite_walk_9.png',
    ],
});


// Create a Picture entity which uses the new spritesheet asset
scrawl.makePicture({

    name: 'walking-dino',
    asset: 'dinosaur',

    width: 200,
    height: 210,

    startX: 380,
    startY: 30,

    lineWidth: 3,
    strokeStyle: 'orange',

    method: 'drawThenFill',

    spriteTrack: 'walk',
    spriteFrameDuration: 100,

}).playSprite();


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
