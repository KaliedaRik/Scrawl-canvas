/* eslint-disable */
// # Demo Rapier 001
// Rapier physics engine - stacking boxes

// [Run code](../../demo/rapier-001.html)
import * as scrawl from '../source/scrawl.js';

// @ts-expect-error
import rapier from "https://cdn.skypack.dev/@dimforge/rapier2d-compat";

import { reportSpeed } from './utilities.js';


// We are using a 600px x 600px canvas
// + which means we can assume 1 rapierUnit = 60px
// + remember that the y coordinates are positive-up from the bottom left corner
// + and rapier cube dimensions are measured as halfwidth, halfheight
// + also, rapier rotation is the opposite direction to Scrawl-canvas roll
const unit = 60,
    halfUnit = unit / 2,
    thirdUnit = unit / 3,
    sixthUnit = unit / 6,
    rows = 10,
    cols = 10,
    height = 600;

// #### Scene setup
const artefacts = scrawl.library.artefact;

const canvas = artefacts.mycanvas;

// Keep the dynamic boxes in their own group (for drag-and-drop functionality later)
const boxesGroup = scrawl.makeGroup({
    name: "boxes-group",
    host: canvas.base.name
});

// #### Scrawl-canvas entitys
// Build static boxes
const ground = scrawl.makeBlock({
    name: "my-ground",
    dimensions: [600, 40],
    start: [300, 580],
    handle: ["center", "center"],
    fillStyle: "green",
    method: "fill"
});

// A color generator to make our dynamic boxes look pretty
const colorMaker = scrawl.makeColor({
    name: "box-color-fill-generator",
    maximumColor: "orange",
    minimumColor: "brown"
});

// Build dynamic boxes
for (let y = 0; y < rows; y++) {

    for (let x = 0; x < cols; x++) {

        scrawl.makeBlock({
            name: `block-${y}-${x}`,
            group: "boxes-group",
            startX: halfUnit + x * unit,
            startY: -sixthUnit + y * unit,
            handle: ["center", "center"],
            width: thirdUnit + Math.ceil(Math.random() * halfUnit),
            height: thirdUnit + Math.ceil(Math.random() * halfUnit),
            fillStyle: colorMaker.getRangeColor(Math.random()),
            method: "fillThenDraw"
        });
    }
}

// ### Rapier rigid bodies
const boxes = [],
    boxnames = [...boxesGroup.artefacts],
    rad = scrawl.library.radian;

// Function to automate rigid body generation from Scrawl-canvas Block entitys
/* eslint-disable-next-line */
const createBodyFromBlock = function (world, block, density = 1, isStatic = false ) {

    const tempx = block.get("startX") / unit,
        tempy = (height - block.get("startY")) / unit,
        tempw = block.get("width") / unit,
        temph = block.get("height") / unit;

    let rbDesc, colDesc, rigidBody;

    const bodyType = isStatic
        ? rapier.RigidBodyType.Static
        : rapier.RigidBodyType.Dynamic;

    rbDesc = new rapier.RigidBodyDesc(bodyType);
    rbDesc.setTranslation(tempx, tempy);
    rigidBody = world.createRigidBody(rbDesc);
    colDesc = rapier.ColliderDesc.cuboid(tempw / 2, temph / 2);
    world.createCollider(colDesc, rigidBody.handle);

    return rigidBody;
};

// Function to update Scrawl-canvas entitys with Rapier rigid body position/rotation data
const updatePosition = function (box) {

    const { entity, body } = box;
    const { x, y } = body.translation();

    const r = -body.rotation() / rad;

    let sx = x * unit,
        sy = y * unit;

    sy = height - sy;

    entity.set({
        startX: sx,
        startY: sy,
        roll: r
    });
};

// Flag to run/halt the physics simulation
let isRunning = false;


// Initialize Rapier (involves web assembly, thus asynchronous)
rapier.init()
.then(() => {

    // Create the world, with added gravity
    const gravity = new rapier.Vector2(0.0, -9.8),
        world = new rapier.World(gravity);

    // Create rigid body for static ground entity
    createBodyFromBlock(world, ground, null, true);

    // Create dynamic rigid-bodies for the other boxes
    boxnames.forEach((name) => {

        const ent = artefacts[name];

        if (ent) {

            boxes.push({
                entity: ent,
                body: createBodyFromBlock(world, ent, 2)
            });
        }
    });

    // Simulation loop
    const physicsLoop = () => {

        if (isRunning) {

            world.step();
            boxes.forEach(b => updatePosition(b));
        }
    };


    // Add the simulation loop to our Scrawl-canvas animation object
    animation.set({
        commence: physicsLoop,
    });
})
.catch(e => console.log(e));


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
const animation = scrawl.makeRender({
    name: "demo-animation",
    target: canvas,
    afterShow: report
});

// #### User interaction
const runButton = document.querySelector("#run"),
    haltButton = document.querySelector("#halt");

scrawl.addNativeListener("click", () => {

    runButton.setAttribute("disabled", "disabled");
    haltButton.removeAttribute("disabled");
    isRunning = true;

}, runButton);

scrawl.addNativeListener("click", () => {

    runButton.removeAttribute("disabled");
    haltButton.setAttribute("disabled", "disabled");
    isRunning = false;

}, haltButton);


// #### Development and testing
console.log(scrawl.library);

