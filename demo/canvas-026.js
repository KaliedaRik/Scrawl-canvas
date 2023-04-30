// # Demo Canvas 026
// Tower of Hanoi

// [Run code](../../demo/canvas-026.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


scrawl.makeBlock({

    name: name('peg-1'),

    width: '30%',
    height: '90%',

    startX: '17%',
    startY: 'center',

    handleX: 'center',
    handleY: 'center',

    fillStyle: 'rgb(220 220 220)',
    strokeStyle: 'red',
    lineWidth: 5,

    method: 'drawThenFill',

}).clone({

    name: name('peg-2'),
    startX: '50%',
    strokeStyle: 'blue',

}).clone({

    name: name('peg-3'),
    startX: '83%',
    strokeStyle: 'orange',
});

scrawl.makeWheel({

    name: name('disc-1'),

    order: 1,

    radius: '12%',

    handleX: 'center',
    handleY: 'center',

    pivot: name('peg-1'),
    lockTo: 'pivot',

    fillStyle: 'pink',
    strokeStyle: 'red',
    lineWidth: 6,

    method: 'drawAndFill',

    shadowColor: 'black',

}).clone({

    name: name('disc-2'),
    order: 2,
    radius: '10%',
    fillStyle: 'lightblue',
    strokeStyle: 'blue',

}).clone({

    name: name('disc-3'),
    order: 3,
    radius: '8%',
    fillStyle: 'yellow',
    strokeStyle: 'orange',
});

const discGroup = scrawl.makeGroup({

    name: name('discs'),
});

const dragActions = scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: name('discs'),
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,

    resetCoordsToZeroOnTouchEnd: false,

    updateOnStart: {
        shadowBlur: 10,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
    },

    updateOnEnd: {
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    },
});

const checkPeg = function () {

    let peg, disc;

    const pegGroup = scrawl.makeGroup({

        name: name('pegs'),

    }).addArtefacts(
        name('peg-1'),
        name('peg-2'),
        name('peg-3'),
    );

    // Setup the game's initial state
    const pegState = {

        [name('peg-1')]: [
            name('disc-1'),
            name('disc-2'),
            name('disc-3'),
        ],
        [name('peg-2')]: [],
        [name('peg-3')]: [],
    };

    // Function to update the game's state
    // - mydisc will always be the last member of an array,
    // - so we can pop it when found, then push it onto mypeg
    const updateState = function (mypeg, mydisc) {

        Object.values(pegState).forEach(pState => {

            if (pState.includes(mydisc.name)) pState.pop();
        });

        pegState[mypeg.name].push(mydisc.name);
    }

    // Function to update the disc group's membership
    // - a disc can only be moved if it is a member of this group
    const updateDiscGroup = function () {

        discGroup.clearArtefacts();

        Object.values(pegState).forEach(pState => {

            if (pState.length) discGroup.addArtefacts(pState[pState.length - 1]);
        });

        // Because this Group is outside the Display cycle
        // - (we haven't assigned it to a Cell object)
        // - we need to manually invoke its sort routine
        discGroup.sortArtefacts();
    }
    updateDiscGroup();

    // Enforce the game rules
    // - a disc can only move to a peg if no smaller discs are already on that peg
    const entity = scrawl.library.entity;

    const checkForLegalMove = function (mypeg, mydisc) {

        if (!pegState[mypeg.name].length) return true;

        return pegState[mypeg.name].every(d => entity[d].get('order') < mydisc.get('order'));
    }

    return function () {

        const hit = pegGroup.getArtefactAt(canvas.here);

        if (typeof hit !== 'boolean' && hit) peg = hit.artefact;
        else peg = false;

        const checkDrag = dragActions();

        if (typeof checkDrag !== 'boolean' && checkDrag) disc = checkDrag.artefact;

        else if (disc) {

            if (peg) {

                if (checkForLegalMove(peg, disc)) {

                    updateState(peg, disc);
                    updateDiscGroup();

                    disc.set({
                        pivot: peg,
                    });
                }
            }
            disc = false;
        }
    }
}();

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({
    name: name('render'),
    target: canvas,
    commence: checkPeg,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
