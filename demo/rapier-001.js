// # Demo Rapier 001
// Load and use the Rapier physics engine

// [Run code](../../demo/rapier-001.html)
import scrawl from '../source/scrawl.js'
import rapier from 'https://cdn.skypack.dev/@dimforge/rapier2d-compat';

// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;

// We are using a 600px x 600px canvas 
// - which means we can assume 1 rapierUnit = 30px
// - remember that the y coordinates are positive-up from the bottom left corner
// - and dimensional data appears to be halfwidth, halfheight, etc
const unit = 60,
    width = 600,
    height = 600;

let ground = scrawl.makeBlock({

    name: 'my-ground', 
    dimensions: [600, 40],
    start: [300, 580],
    handle: ['center', 'center'],

    fillStyle: 'green',
    method: 'fill',
});

let box1 = scrawl.makeBlock({

    name: 'my-box-1',
    dimensions: [60, 60],
    start: [325, 30],
    handle: ['center', 'center'],

    fillStyle: 'orange',
    method: 'fill',
});

let box2 = scrawl.makeBlock({

    name: 'my-box-2',
    dimensions: [60, 60],
    start: [300, 100],
    handle: ['center', 'center'],

    fillStyle: 'brown',
    method: 'fill',
});

const createBodyFromBlock = function(world, block, density = 1, isStatic = false) {

    let tempx = block.get('startX') / unit,
        tempy = (height - block.get('startY')) / unit,
        tempw = block.get('width') / unit,
        temph = block.get('height') / unit;

    let rbDesc, colDesc, rigidBody;

    if (isStatic) {

        rbDesc = new rapier.RigidBodyDesc(rapier.BodyStatus.Static);
        rbDesc.setTranslation(tempx, tempy);
        rigidBody = world.createRigidBody(rbDesc);
        colDesc = rapier.ColliderDesc.cuboid(tempw / 2, temph / 2);
        world.createCollider(colDesc, rigidBody.handle);
    }
    else {

        rbDesc = new rapier.RigidBodyDesc(rapier.BodyStatus.Dynamic);
        rbDesc.setTranslation(tempx, tempy);
        rigidBody = world.createRigidBody(rbDesc);
        colDesc = rapier.ColliderDesc.cuboid(tempw / 2, temph / 2);
        colDesc.setDensity(density);
        world.createCollider(colDesc, rigidBody.handle);
    }
    return rigidBody;
}

const rad = scrawl.library.radian;

const updatePosition = function (entity, body) {

    let {x, y} = body.translation();

    let r = -body.rotation() / rad;

    let sx = x * unit,
        sy = y * unit;

    sy = height - sy;

    entity.set({
        startX: sx,
        startY: sy,
        roll: r,
    });
};

rapier.init()
.then(() => {

    let tempx, tempy, tempw, temph;

    // Create the world, with added gravity
    let gravity = new rapier.Vector2(0.0, -9.8);
    let world = new rapier.World(gravity);

    // Create the ground
    createBodyFromBlock(world, ground, null, true);

    // Create first dynamic rigid-body.
    let rigidBody1 = createBodyFromBlock(world, box1, 2);

    // Create second dynamic rigid-body.
    let rigidBody2 = createBodyFromBlock(world, box2, 2);

    // Game loop
    const physicsLoop = () => {

        world.step();

        updatePosition(box1, rigidBody1);
        updatePosition(box2, rigidBody2);
    };

    // Add the game loop to our Scrawl-canvas animation object
    animation.set({
        commence: physicsLoop,
    });
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
const animation = scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);

