// # Demo Canvas 062
// Gradients stress test

// [Run code](../../demo/filters-062.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    styles = scrawl.library.styles;

const [w, h] = canvas.get('dimensions');


const colorEngine = scrawl.makeColor({

    name: 'color-engine',
    minimumColor: 'red',
    maximumColor: 'blue',
});


const boxGroup = scrawl.makeGroup({
    name: 'box-group',
    host: canvas.base.name,
});

for (let i = 0; i < 100; i++) {

    scrawl.makeBlock({

        name: `b-${i}`,
        group: 'box-group',
        dimensions: [30, 30],
        startX: (w * 0.1) + (Math.random() * (w * 0.8)),
        startY: (h * 0.1) + (Math.random() * (h * 0.8)),
        handle: ['center', 'center'],
        roll: Math.random() * 360,
        fillStyle: colorEngine.getRangeColor(Math.random()),
        globalAlpha: 0.25,
    });
}

const referenceGroup = scrawl.makeGroup({
    name: 'reference-group',
    host: canvas.base.name,
});

const referenceBlock = scrawl.makeBlock({

    name: 'reference-block',
    group: 'reference-group',
    dimensions: [0, 0],
    method: 'draw',
    lineDash: [4, 2],
    delta: {
        lineDashOffset: 0.2,
    },

    onEnter: function () {

        canvas.set({
            css: {
                cursor: 'grab',
            },
        });

// @ts-expect-error
        this.set({
            lineDash: [16, 2],
            lineWidth: 2,
        });
    },

    onLeave: function () {

        canvas.set({
            css: {
                cursor: 'auto',
            },
        });

// @ts-expect-error
        this.set({
            lineDash: [4, 2],
            lineWidth: 1,
        });
    },
});


const gatherGroup = scrawl.makeGroup({
    name: 'gather-group',
});

let isGathering = false,
    isMoving = false;

let startX = 0,
    startY = 0;

const downAction = (e) => {

    const { here } = canvas;

    if (here) {

        const hit = referenceGroup.getArtefactAt(here);

        if (typeof hit !== 'boolean' && hit.artefact) {

            isMoving = true;
            isGathering = false;
        }
        else {

            boxGroup.setArtefacts({
                globalAlpha: 0.25,
                delta: {
                    roll: 0,
                },
            });

            const { here } = canvas;

            if (here) {

                const {x, y} = here;

                startX = x;
                startY = y;

                referenceBlock.set({
                    start: [x, y],
                    dimensions: [0, 0],
                });

                isGathering = true;
                isMoving = false;
            }
        }
    }
}

const moveAction = (e) => {

    if (isGathering) doGathering();
    else if (isMoving) doMoving(e);
};

const doGathering = () => {

    const { here } = canvas;

    if (here) {

        const {x, y} = here;

        let width = 0,
            height = 0,
            revStartX = 0,
            revStartY = 0;

        if (x < startX) {

            width = startX - x;
            revStartX = x;
        }
        else width = x - startX;

        if (y < startY) {

            height = startY - y;
            revStartY = y;
        }
        else height = y - startY;

        referenceBlock.set({
            startX: revStartX || startX,
            startY: revStartY || startY,
            width,
            height,
        });

        gatherGroup.setArtefacts({
            globalAlpha: 0.25,
            delta: {
                roll: 0,
            },
        });

        gatherGroup.clearArtefacts();

        const boxes = boxGroup.get('artefacts');

        boxes.forEach(b => {

            const box = boxGroup.getArtefact(b);

            if (box) {

                const hit = referenceGroup.getArtefactAt([box.get('position')]);

                if (typeof hit !== 'boolean' && hit.artefact) {

                    gatherGroup.addArtefacts(box);
                }
            }
        });

        gatherGroup.setArtefacts({
            globalAlpha: 1,
            delta: {
                roll: 0.8,
            },
        });
    }
};

const doMoving = (e) => {

    if (e) {

        e.preventDefault();

        const { movementX, movementY } = e;

        gatherGroup.updateArtefacts({
            startX: movementX,
            startY: movementY,
        });

        referenceGroup.updateArtefacts({
            startX: movementX,
            startY: movementY,
        });
    }
}

const upAction = () => {

    isGathering = false;
    isMoving = false;
    startX = 0;
    startY = 0;
};

scrawl.addListener('down', downAction, canvas.domElement);
scrawl.addListener('move', moveAction, canvas.domElement);
scrawl.addListener(['up', 'leave'], upAction, canvas.domElement);

scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
