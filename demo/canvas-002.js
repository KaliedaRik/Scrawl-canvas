// # Demo Canvas 002 
// Block and wheel entity positioning (start, pivot, mimic, mouse)

// [Run code](../../demo/canvas-002.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    clearAlpha: 0.9,
});


// Create and clone block and wheel entitys. For the sake of safety and sanity, create the (reference) entitys on which other artefacts will pivot and mimic first. Then create those other artefacts.
//
// Note: setting this entity's `method` value to __none__ means that while it will perform all necessary calculations as part of the Display cycle, it will not complete its stamp action, thus will not appear on the display. This differs from setting its `visibility` attribute to false, which will make the entity skip both calculation and stamp operations
let myPivot = scrawl.makeWheel({
    name: 'mouse-pivot',
    method: 'none',

    startX: 'center',
    startY: 'center',
});

let myblock = scrawl.makeBlock({
    name: 'base-block',

    width: 150,
    height: 100,

    handleX: 'center',
    handleY: 'center',

    offsetX: -140,
    offsetY: -50,

    // To pivot this entity to the reference entity, we need to set both its `pivot` attribute (to the reference entity's name, or the entity itself) __and also__ set the `lockTo` attribute to the value __'pivot'__
    pivot: 'mouse-pivot',
    lockTo: 'pivot',

    fillStyle: 'darkblue',
    strokeStyle: 'gold',
    method: 'fillAndDraw',

    lineWidth: 6,
    lineJoin: 'round',

    delta: {
        roll: 0.5,
    },
});

let mywheel = scrawl.makeWheel({
    name: 'base-wheel',

    radius: 60,
    startAngle: 35,
    endAngle: -35,

    handleX: 'center',
    handleY: 'center',

    offsetX: 140,
    offsetY: 50,

    pivot: 'mouse-pivot',
    lockTo: 'pivot',

    fillStyle: 'purple',
    strokeStyle: 'gold',
    method: 'fillAndDraw',

    lineWidth: 6,
    lineJoin: 'round',

    delta: {
        roll: -0.5,
    },
});

myblock.clone({
    name: 'pivot-block',

    height: 30,

    handleX: 'center',
    handleY: 'center',

    strokeStyle: 'red',
    lineWidth: 3,
    method: 'draw',

    pivot: 'base-block',
    lockTo: 'pivot',

    offsetX: 0,
    offsetY: 110,
    addPivotOffset: true,

    delta: {
        roll: 0,
    },

}).clone({
    name: 'pivot-wheel',

    pivot: 'base-wheel',
    addPivotRotation: true,

    handleX: 0,
    handleY: '50%',

    offsetY: 0,

}).clone({
    name: 'mimic-wheel',

    // `mimic` is an extended form of `pivot`
    mimic: 'base-wheel',
    lockTo: 'mimic',

    // When an entity mimics another entity's dimensions, its own dimensions (width, height) can be added to the mimic dimensions
    width: 20,
    height: 20,

    // Handles can be directly affected by mimic dimensions. If the entity adds its own dimensions to the mimics dimensions, then it may also need to add appropriate handle values to the mimic's handle
    handleX: 10,
    handleY: 10,

    strokeStyle: 'darkgreen',

    // The default values for the __useMimic__ and __addOwn__ variables is 'false' - including false attributes here only for convenience during development work
    useMimicDimensions: true,
    useMimicScale: true,
    useMimicStart: true,
    useMimicHandle: true,
    useMimicOffset: true,
    useMimicRotation: true,
    useMimicFlip: true,

    addOwnDimensionsToMimic: true,
    addOwnScaleToMimic: false,
    addOwnStartToMimic: false,
    addOwnHandleToMimic: true,
    addOwnOffsetToMimic: false,
    addOwnRotationToMimic: false,
});

mywheel.clone({
    name: 'mimic-block',

    mimic: 'base-block',
    lockTo: 'mimic',

    width: 60,

    strokeStyle: 'darkgreen',
    lineWidth: 3,
    method: 'draw',

    useMimicDimensions: true,
    useMimicScale: true,
    useMimicStart: true,
    useMimicOffset: true,
    useMimicRotation: true,
    addOwnDimensionsToMimic: true,
});


// #### User interaction
// Function to check whether mouse cursor is over canvas, and lock the reference entity accordingly
let mouseCheck = function () {

    let active = false;

    return function () {

        if (canvas.here.active !== active) {

            active = canvas.here.active;

            myPivot.set({
                lockTo: (active) ? 'mouse' : 'start'
            });
        }
    };
}();


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    const alpha = document.querySelector('#clearAlpha');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    clearAlpha: ${alpha.value}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: mouseCheck,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality. We're doing it this way (wrapped in a function) so we can test that it can be killed, and then recreated, later
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: canvas.base,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        backgroundColor: ['backgroundColor', 'raw'],
        clearAlpha: ['clearAlpha', 'float'],
    },
});
document.querySelector('#backgroundColor').value = '';
document.querySelector('#clearAlpha').value = 0.9;

// #### Development and testing
console.log(scrawl.library);

// To test kill functionality
let killArtefact = (name, time, finishResurrection) => {

    let groupname = 'mycanvas_base',
        packet;

    let checkGroupBucket = (name, groupname) => {

        let res = scrawl.library.group[groupname].artefactBuckets.filter(e => e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    setTimeout(() => {

        console.log(`${name} alive
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
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
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

            canvas.actionPacket(packet);

            setTimeout(() => {

                console.log(`${name} resurrected
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

                finishResurrection();

            }, 100);
        }, 100);
    }, time);
};

killArtefact('mouse-pivot', 4000, () => {

    myPivot = scrawl.library.entity['mouse-pivot'];

    scrawl.library.entity['base-block'].set({

        pivot: myPivot,
        lockTo: 'pivot',
    });

    scrawl.library.entity['base-wheel'].set({

        pivot: myPivot,
        lockTo: 'pivot',
    });
});

killArtefact('mimic-block', 6000, () => {});
