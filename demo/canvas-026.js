// # Demo Canvas 026 
// Tower of Hanoi

// [Run code](../../demo/canvas-026.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
let canvas = scrawl.library.canvas.mycanvas;


scrawl.makeBlock({

    name: 'peg-1',

    width: '30%',
    height: '90%',

    startX: '17%',
    startY: 'center',

    handleX: 'center',
    handleY: 'center',

    fillStyle: 'rgb(220, 220, 220)',
    strokeStyle: 'red',
    lineWidth: 5,

    method: 'drawThenFill',

}).clone({

    name: 'peg-2',
    startX: '50%',
    strokeStyle: 'blue',

}).clone({

    name: 'peg-3',
    startX: '83%',
    strokeStyle: 'orange',
});

scrawl.makeWheel({

    name: 'disc-1',

    order: 1,

    radius: '12%',

    handleX: 'center',
    handleY: 'center',

    pivot: 'peg-1',
    lockTo: 'pivot',

    fillStyle: 'pink',
    strokeStyle: 'red',
    lineWidth: 6,

    method: 'drawAndFill',

    shadowColor: 'black',

}).clone({

    name: 'disc-2',
    order: 2,
    radius: '10%',
    fillStyle: 'lightblue',
    strokeStyle: 'blue',

}).clone({

    name: 'disc-3',
    order: 3,
    radius: '8%',
    fillStyle: 'yellow',
    strokeStyle: 'orange',
});

let discGroup = scrawl.makeGroup({

    name: 'discs',
});

let dragActions = scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'discs',
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

let checkPeg = function () {

    let peg, disc;

    let pegGroup = scrawl.makeGroup({

        name: 'pegs',

    }).addArtefacts('peg-1', 'peg-2', 'peg-3');

    // Setup the game's initial state
    let pegState = {

        'peg-1': ['disc-1', 'disc-2', 'disc-3'],
        'peg-2': [],
        'peg-3': [],
    };

    // Function to update the game's state
    // - mydisc will always be the last member of an array, 
    // - so we can pop it when found, then push it onto mypeg
    let updateState = function (mypeg, mydisc) {

        for (let [pName, pState] of Object.entries(pegState)) {

            if (pState.includes(mydisc.name)) pState.pop();
        }
        pegState[mypeg.name].push(mydisc.name);
    }

    // Function to update the disc group's membership
    // - a disc can only be moved if it is a member of this group
    let updateDiscGroup = function () {

        discGroup.clearArtefacts();

        for (let [pName, pState] of Object.entries(pegState)) {

            if (pState.length) discGroup.addArtefacts(pState[pState.length - 1]);
        }

        // Because this Group is outside the Display cycle
        // - (we haven't assigned it to a Cell object)
        // - we need to manually invoke its sort routine
        discGroup.sortArtefacts();
    }
    updateDiscGroup();

    // Enforce the game rules
    // - a disc can only move to a peg if no smaller discs are already on that peg
    let entity = scrawl.library.entity;

    let checkForLegalMove = function (mypeg, mydisc) {

        if (!pegState[mypeg.name].length) return true;

        return pegState[mypeg.name].every(d => entity[d].order < mydisc.order);
    }

    return function () {

        let hit = pegGroup.getArtefactAt(canvas.here);

        if (typeof hit !== 'boolean' && hit) peg = hit.artefact;
        else peg = false;

        let checkDrag = dragActions();

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
    name: `${canvas.name}-render`,
    target: canvas,
    commence: checkPeg,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
