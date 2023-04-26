// # Demo Canvas 031 
// Cell generation and processing order - kaleidoscope clock

// [Run code](../../demo/canvas-031.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// This code can be factored away into its own module
// + Because: clocks are useful; most of this code can be thought of as clock boilerplate
const buildClockface = function (canvas, namespace) {

    let entity = scrawl.library.entity;

    // The clock face will go into its own Cell
    let myFace = canvas.buildCell({

        name: `${namespace}-face`,

        width: '100%',
        height: '100%',
    });


    // The clock frame is a wheel, as is the center pin
    scrawl.makeWheel({

        name: `${namespace}-clock-frame`,
        group: `${namespace}-face`,

        radius: '40%',

        start: ['center', 'center'],
        handle: ['center', 'center'],

        lineWidth: 6,
        strokeStyle: 'black',
        method: 'draw',

    }).clone({

        name: `${namespace}-center-pin`,

        radius: '2%',

        lineWidth: 2,
        fillStyle: 'darkred',
        strokeStyle: 'gold',
        method: 'fillThenDraw',

        order: 1,

        shadowOffsetX: 1,
        shadowOffsetY: 1,
        shadowColor: 'black',
        shadowBlur: 3,
    });

    // The hour, minute and second hands are all Line shapes
    scrawl.makeLine({

        name: `${namespace}-hour-hand`,
        group: `${namespace}-face`,

        startX: 'center',
        startY: 'center',
        endX: 'center',
        endY: '23%',

        handleY: '-15%',

        lineWidth: 10,
        lineCap: 'round',
        strokeStyle: 'darkblue',
        method: 'draw',

        shadowOffsetX: 3,
        shadowOffsetY: 3,
        shadowColor: 'black',
        shadowBlur: 3,

    }).clone({

        name: `${namespace}-minute-hand`,

        endY: '15%',
        strokeStyle: 'blue',
        lineWidth: 6,

    }).clone({

        name: `${namespace}-second-hand`,

        endY: '12%',
        lineWidth: 4,
        strokeStyle: 'red',
    });

    // Function to make the clock tick
    const updateClockHands = function () {

        const hourHand = entity[`${namespace}-hour-hand`],
            minuteHand = entity[`${namespace}-minute-hand`],
            secondHand = entity[`${namespace}-second-hand`];

        const secondsSinceMidnight = () => {

            let now = new Date(),
                then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

            return (now.getTime() - then.getTime()) / 1000;
        };

        return function () {

            let time = secondsSinceMidnight(),
                hour = ((time % 43200) / 12) * (360 / 3600),
                minute = ((time % 3600)) * (360 / 3600),
                second = ((time % 60)) * (360 / 60);

            hourHand.set({ roll: hour });
            minuteHand.set({ roll: minute });
            secondHand.set({ roll: second });
        }

    }();

    // Once modularized, we can export a function to run the above code
    // + When the function is invoked it builds the clock face Cell and entitys
    // + It returns the cell, and the the clock tick function
    return {

        cell: myFace,
        update: updateClockHands
    }
};


// #### Scene setup
let canvas = scrawl.library.canvas.mycanvas,
    namespace = 'kaliedoscope-clock';

// Building the background - this goes in a separate Cell
let myBackground = canvas.buildCell({

    name: `${namespace}-background`,

    width: '100%',
    height: '100%',
});

// We use a wheel segment as a stencil
scrawl.makeWheel({

    name: `${namespace}-clock-stencil`,
    group: `${namespace}-background`,

    order: 0,

    radius: '40%',
    startAngle: -30,
    endAngle: 30,
    includeCenter: true,

    start: ['center', 'center'],
    handle: ['center', 'center'],

    fillStyle: 'white',
    method: 'fill',
});

// Use a color factory object to generate random colors within a restricted palette
let myColorFactory = scrawl.makeColor({

    name: `${namespace}-color-factory`,
});

// Add some blocks to create the animated background
for (let i = 0; i < 50; i++) {

    scrawl.makeBlock({

        name: `${namespace}-decoration-block-${i}`,
        group: `${namespace}-background`,

        globalCompositeOperation: 'source-atop',
        globalAlpha: 0.3,

        order: 1,

        startX: `${10 + (Math.random() * 80)}%`,
        startY: `${10 + (Math.random() * 80)}%`,

        handleX: `${(Math.random() * 400) - 200}%`,
        handleY: `${(Math.random() * 400) - 200}%`,

        width: `${10 + (Math.random() * 15)}%`,
        height: `${2 + (Math.random() * 10)}%`,
        roll: Math.floor(Math.random() * 360),

        fillStyle: myColorFactory.get('random'),

        delta: {
            roll: ((Math.random() * 2) - 1) / 4,
        },
    });
}

// We don't display the background Cell. Instead we use it as the source for a set of Picture entitys 
scrawl.makePicture({

    name: `${namespace}-segment-0`,
    group: canvas.base.name,

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    asset: `${namespace}-background`,

}).clone({

    name: `${namespace}-segment-1`,
    roll: 120,

}).clone({

    name: `${namespace}-segment-2`,
    roll: 240,

}).clone({

    name: `${namespace}-segment-3`,
    flipReverse: true,

}).clone({

    name: `${namespace}-segment-4`,
    roll: 120,

}).clone({

    name: `${namespace}-segment-5`,
    roll: 0,
});

// Build the clock face
let clock = buildClockface(canvas, namespace);


// #### Cell display and compile ordering
myBackground.set({
    compileOrder: 0,
    shown: false,
});

canvas.base.set({
    compileOrder: 1,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: `${namespace}-animation`,
    target: canvas,

    commence: clock.update,
    afterShow: report,
});

// #### Development and testing
console.log(scrawl.library);

