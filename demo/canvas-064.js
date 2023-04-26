// # Demo Canvas 064
// Animation object: gradient along a line

// [Run code](../../demo/filters-064.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


// Create the Display cycle animation
canvas.setBase({
    cleared: false,
});

scrawl.makeGroup({
    
    name: 'pin-group',
    host: canvas.base.name,
});

const pinArray = [];

for (let i = 0; i < 6; i++) {
  
    pinArray.push(scrawl.makeWheel({

        name: `pin-${i}`,
        group: 'pin-group',
        radius: 22,
        startX: `${5 + ((90 / 5) * i)}%`,
        startY: '50%',
        handle: ['center', 'center'],
        strokeStyle: 'white',
        lineWidth: 3,
        method: 'none',
        lineDash: [2, 4],
    }));
}

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'pin-group',
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});

const snake = scrawl.makePolyline({

    name: 'snake',
    pins: ['pin-0', 'pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5'],
    tension: 0.5,
    mapToPins: true,
    useAsPath: true,
    strokeStyle: 'white',
    lineWidth: 3,
    method: 'none',
});

const reportLength = scrawl.makePhrase({

    name: 'report-length',
    text: '',
    fillStyle: 'white',
    font: '2em Arial, sans-serif',
    start: ['center', 10],
    handleX: 'center',
    method: 'none',
});

let colorFactory = scrawl.makeColor({

    name: 'color-factory',
    minimumColor: 'red',
    maximumColor: 'blue',
    colorSpace: 'OKLAB',
});

const snakeScale = scrawl.makeWheel({

    name: `scale`,
    handle: ['center', 'center'],
    radius: 40,
    path: 'snake',
    lockTo: 'path',
    constantSpeedAlongPath: true,
    method: 'none',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');

// Handle the Display cycle directly, using an Animation object
scrawl.makeAnimation({

    name: 'demo-animation',

    fn: function () {

        canvas.base.clear();
        canvas.compile();

        const len = Math.ceil(snake.length);

        for (let i = 0; i < len; i++) {

            const norm = i / len;

            snakeScale.simpleStamp(canvas.base, {

                method: 'fill',
                fillStyle: colorFactory.getRangeColor(norm),
                pathPosition: norm,
            });
        }

        pinArray.forEach(p => {

            p.simpleStamp(canvas.base, {
                method: 'draw',
            });
        });

        snake.simpleStamp(canvas.base, {
            method: 'draw',
        });

        reportLength.simpleStamp(canvas.base, {
            text: `Length: ${len}`,
            method: 'fill',
        });

        canvas.show();

        report();
    },
})


// #### Development and testing
console.log(scrawl.library);
