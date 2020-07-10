// # Demo Canvas 031 
// Cell generation and processing order - kaliedoscope clock

// [Run code](../../demo/canvas-031.html)
import scrawl from '../source/scrawl.js'


// This code can be factored away into its own module
const buildClockface = function (canvas, namespace) {

    let entity = scrawl.library.entity;

    let myFace = canvas.buildCell({

        name: `${namespace}-face`,

        width: '100%',
        height: '100%',

        compileOrder: 2,
        showOrder: 2,
    });


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

    return {

        cell: myFace,
        update: updateClockHands
    }
};


let canvas = scrawl.library.canvas.mycanvas,
    base = canvas.base,
    namespace = 'kaliedoscope-clock';

// Prepare the canvas
canvas.set({

    backgroundColor: 'honeydew',
    checkForResize: true,
    fit: 'cover',
});

// Building the background - this goes in a separate Cell (offscreen canvas)
let myBackground = canvas.buildCell({

    name: `${namespace}-background`,

    width: '100%',
    height: '100%',
});

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

// Using a color factory object to generate random colors within a restricted palette
let myColorFactory = scrawl.makeColor({

    name: `${namespace}-color-factory`,

    rMax: 160,
    gMax: 160,
    bMax: 160,
});


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
        roll: Math.floor(`${Math.random() * 360}`),

        fillStyle: myColorFactory.get('random'),

        delta: {
            roll: ((Math.random() * 2) - 1) / 4,
        },
    });
}

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

let clock = buildClockface(canvas, namespace);

canvas.base.set({
    compileOrder: 1,
});

myBackground.set({
    compileOrder: 0,
    shown: false,
});

clock.cell.set({
    showOrder: 2,
});

scrawl.makeRender({

    name: `${namespace}-animation`,
    target: canvas,

    commence: clock.update,
});
