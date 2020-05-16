// # Demo Canvas 030 
// Shape polylines

// [Run code](../../demo/canvas-030.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue'
});

let coordinates = [[100, 200], [200, 400], [300, 300], [400, 400], [500, 200], [240, 100]];

coordinates.forEach((item, index) => {

    scrawl.makeWheel({

        name: `pin-${index}`,

        start: item,

        radius: 20,

        handleX: 'center',
        handleY: 'center',

        shadowColor: 'black',
        fillStyle: 'darkgreen',
        method: 'fill',
    });
});


let myline = scrawl.makePolyline({

    name: 'my-polyline',

    // The `pins` attribute takes an array with elements which are:
    // - [x, y] coordinate arrays, where values can be absolute (Numbers) and/or relative (String%) values
    // - Artefact objects, or their name-String values
    // - (`set` function will also accept an object with attributes: `index, x, y` - to be used by tweens)
    pins: ['pin-0', 'pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5'],

    // Tension gives us the curviness of the line:
    // 0 - straight lines connecting the pins
    // 0.4ish - reasonable looking curves
    // 1 - exaggerated curves
    // negative values - add loops at the pins
    tension: 0.3,

    // Whether to connect all the pins (true), or run from first to last pin only (false)
    closed: false,

    // The starting position is the top left corner of the box which tightly encloses the Shape - regardless of the positions of any artefacts which may be used as pins. Handles and offsets should work as expected (except: don't use offsets if/when the `setToPins` flag is set - they will be overwritten in this use case)
    // startX: 100,
    // startY: 100,

    strokeStyle: 'orange',
    lineWidth: 6,

    lineCap: 'round',
    lineJoin: 'round',

    shadowColor: 'black',

    method: 'draw',

    // Note: the bounding box dimensions reflect the minimum/maximum coordinates of all the pins used to construct the shape. It will only reflect the actual shape of the Shape when `useAsPath` attribute is set to `true`
    showBoundingBox: true,
    // useAsPath: true,

    // MapToPins will map the line to the pins - which is useful when the line uses entitys for its pins. When used in this way, the start coordinate has to be unset, or set to coordinates (0, 0). Dragging the Shape will work as normal: the line no longer directly maps to the pins, but it retains its shape.
    mapToPins: true,
});

scrawl.makeDragZone({
    zone: canvas,
    collisionGroup: canvas.base.name,
    endOn: ['up', 'leave'],

    updateOnStart: {
        shadowBlur: 6,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
    },

    updateOnEnd: {
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    },
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);

// To test kill functionality
let killArtefact = (name, time, restore) => {

    let groupname = 'mycanvas_base',
        packet;

    let checkGroupBucket = (name, groupname) => {

        let res = scrawl.library.group[groupname].artefactBuckets.filter(e => e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    let checkPinsArray = (name) => {

        if (myline.pins.indexOf(name) >= 0) return 'no';

        let res = myline.pins.filter(e => e && e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    setTimeout(() => {

        console.log(`${name} alive
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from polyline pins array: ${checkPinsArray(name)}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

        packet = scrawl.library.artefact[name].saveAsPacket();

        scrawl.library.artefact[name].kill();

        setTimeout(() => {

            console.log(`${name} killed
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from polyline pins array: ${checkPinsArray(name)}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

            canvas.actionPacket(packet);

            setTimeout(() => {

                if (restore) restore();

                console.log(`${name} resurrected
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from polyline pins array: ${checkPinsArray(name)}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

            }, 500);
        }, 500);
    }, time);
};

killArtefact('pin-2', 3000, () => myline.updatePinAt('pin-2', 2));
