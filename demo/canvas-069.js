// # Demo Canvas 069
// Test Cell splitShift functionality (shift only)

// [Run code](../../demo/canvas-069.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');

// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create a Cell to use for the effect
const paper = canvas.buildCell({
    name: name("easel-cell"),
    dimensions: ["100%", "100%"],
    cleared: false,
    compiled: false,
});


// Create a line from which the ribbons can flow
const line = scrawl.makeLine({

    name: name('line'),
    start: [580, 0],
    end: [580, 400],
    method: 'draw',
    useAsPath: true,
});


// Create a ribbon for each color
const colors = ['mediumvioletred', 'crimson', 'coral', 'gold', 'darkgoldenrod', 'darkorchid', 'royalblue', 'cadetblue', 'mediumseagreen', 'slategray'];

for (let i = 0, iz = colors.length; i < iz; i++) {

    scrawl.makeWheel({

        name: name(`dot-${i}`),
        handle: ['center', 'center'],
        group: paper,
        radius: 5,
        path: line,
        pathPosition: i / iz,
        lockTo: 'path',
        fillStyle: colors[i],
        shadowOffsetX: 2,
        shadowOffsetY: 2,
    });
}


// #### Scene animation
const commence = () => {

    const px = -parseInt(dom.speed.value, 10);

    if (px) {

        paper.splitShift({ px });

        paper.get('group').getArtefactNames().forEach(art => {

            if (Math.random() > 0.85) {

                scrawl.findEntity(art).set({
                    delta: {
                        pathPosition: -0.003 + ((Math.random() / 1000) * 6),
                    }
                });
            }
        });
        paper.compile();
    }
};

const afterShow = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence,
    afterShow,
});


const dom = scrawl.initializeDomInputs([
    ['input', 'speed', '3'],
]);


// #### Development and testing
console.log(scrawl.library);
