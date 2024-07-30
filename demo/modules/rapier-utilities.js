// # Demo Rapier 001
// Helper functions to help Rapier and Scrawl-canvas libraries work together
//
// Related files:
// + [Rapier physics engine - stacking boxes](../rapier-001.html)

/*
The plan is that we initialize Rapier in the main code, then use these helper functions to build stuff and show stuff on the canvas. We do it this way because Rapier is a Wasm program which needs (async) initialization; only after that completes can we build anything
*/



const Rapier = function (items = {}) {

    const { 
        scrawl = null,
        canvas = null,
        rapier = null,
        bodies = [],
        pixelsPerMeter = 1,
        genericWorld = false,
    } = items;

    if (scrawl != null && rapier != null && canvas != null) {

        this.scrawl = scrawl;
        this.canvas = canvas;
        this.rapier = rapier;
        this.pixelsPerMeter = pixelsPerMeter;

        this.hold = [];

        this.namespace = canvas.name;

console.log('before', rapier)
        rapier.init()
        .then(() => {

console.log('after', rapier)

            // @ts-ignore
            if (genericWorld) this.createGenericWorld();

            // @ts-ignore
            this.prepareCanvas();

            // @ts-ignore
            this.buildBodies(bodies);

            return this;
        })
        .catch(error => {

            console.log('Rapier initialization ERROR', error);
            return null;
        });
    }
    else {

        console.log('Rapier initialization ERROR: missing arguments');
        return null;
    }
};

// #### Rapier prototype
const P = Rapier.prototype = Object.create(Object.prototype);

P.name = function (n) { 

    return `${this.namespace}-${n}`;
};

P.createGenericWorld = function () {

    // @ts-ignore
    const RAPIER = this.rapier;
    const gravity = new RAPIER.Vector2(0.0, -9.81);
    this.world = new RAPIER.World(gravity);
};

P.prepareCanvas = function () {

    // @ts-ignore
    const { canvas, scrawl, pixelsPerMeter } = this;

    const [width, height] = canvas.get('dimensions');
    this.width = width;
    this.height = height;
    this.modelWidth = width / pixelsPerMeter;
    this.modelHeight = height / pixelsPerMeter;

    this.cell = canvas.buildCell({

        // @ts-ignore
        name: this.name('rapier-cell'),
        dimensions: ['100%', '100%'],
        shown: false,
    });

    scrawl.makePicture({

        // @ts-ignore
        name: this.name('rapier-image'),
        group: canvas.get('baseName'),
        // @ts-ignore
        asset: this.name('rapier-cell'),
        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],
        start: [0, 'center'],
        handle: [0, 'center'],
        flipUpend: true,

        strokeStyle: 'slategray',
        lineWidth: 4,
        method: 'fillThenDraw', 
    });
};

P.buildBodies = function (bodies) {

    const { rapier, scrawl, pixelsPerMeter, world, cell, hold } = this;

    let rigidBodyDesc, rigidBody, colliderDesc, collider, block, name;

    // We're dealing with `cuboid` shapes here
    // + The factory would need additional code to handle non-cuboid shapes
    bodies.forEach(body => {

        const { startX, startY, width, height, color, isFixed } = body;

        if (isFixed) rigidBodyDesc = rapier.RigidBodyDesc.fixed().setTranslation(startX, startY);
        else rigidBodyDesc = rapier.RigidBodyDesc.dynamic().setTranslation(startX, startY);

        rigidBody = world.createRigidBody(rigidBodyDesc);

        // // Cuboid shapes measure their dimensions in half-width, half-height
        // colliderDesc = rapier.ColliderDesc.cuboid(width / 2, height / 2).setDensity(2.0);

        // // Combine the two
        // collider = world.createCollider(colliderDesc, rigidBody.handle);

        // name = this.name(`${isFixed ? 'ground' : 'brick'}-${collider.handle}`);

        // block = scrawl.makeBlock({

        //     name,
        //     group: cell.get('group'),

        //     startX: startX * pixelsPerMeter,
        //     startY: startY * pixelsPerMeter,
        //     handle: ['center', 'center'],
        //     width: width * pixelsPerMeter,
        //     height: height * pixelsPerMeter,

        //     fillStyle: color,
        //     lineWidth: 1,
        //     method: 'fillThenDraw',
        // });

        // console.log(name)
        // console.log(rigidBodyDesc)
        // console.log(rigidBody)
        // console.log(colliderDesc)
        // console.log(collider)

        hold.push({
            rigidBody,
            block,
        });
    });
};

P.updateDisplay = function () {

    const { hold, pixelsPerMeter } = this;

    hold.forEach((item, index) => {

        const { rigidBody, block } = item;
        const { x, y } = rigidBody.translation();

        if (index === 30) console.log(x * pixelsPerMeter, y * pixelsPerMeter);

        block.set({
            start: [x * pixelsPerMeter, y * pixelsPerMeter],
            // roll: rotation,
        });
    });
};

P.update = function () {

    console.log('Updating model');

    const { world, hold} = this;

    world.step();

    const { x, y } = hold[1].rigidBody.translation();
    console.log(x, y);

    // this.updateDisplay();
};

export const makeRapier = (items = {}) => new Rapier(items);
