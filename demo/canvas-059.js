// # Demo Canvas 059
// Semi-accessible Minimap; multiple drag zones

// [Run code](../../demo/filters-059.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.set({

    includeInTabNavigation: true,

}).setBase({
    // The base Cell needs to compile after the other Cells
    compileOrder: 2
});

// Magic numbers
const mainDimensions = 1600;
const mapDimensions = 200;
const mainMapRatio = mainDimensions / mapDimensions;

let [displayWidth, displayHeight] = canvas.get("dimensions");
let frameWidth = (displayWidth / mainDimensions) * mapDimensions;
let frameHeight = (displayHeight / mainDimensions) * mapDimensions;

// Build out the large Cell (1600px x 1600px)
// - we don't actually display this Cell
const mainCell = canvas.buildCell({

    name: "main-cell",
    dimensions: [mainDimensions, mainDimensions],
    shown: false,
    compileOrder: 0,
    backgroundColor: "ivory"
});

// Populate the large Cell with some shapes
const myColorFactory = scrawl.makeColor({

    name: "my-color-factory",
    minimumColor: "orange",
    maximumColor: "green"
});

scrawl.makeGroup({

    name: "my-circle-group",
    host: mainCell.name
});

for (let i = 0; i < 50; i++) {

    scrawl.makeWheel({

        name: `just-a-wheel-${i}`,
        group: "my-circle-group",
        startX: 50 + Math.random() * (mainDimensions - 100),
        startY: 50 + Math.random() * (mainDimensions - 100),
        radius: 20 + Math.random() * 30,
        fillStyle: myColorFactory.getRangeColor(Math.random()),
        method: "fillThenDraw"
    });
}

// Display the large Cell in the base Cell
const mainCellPicture = scrawl.makePicture({

    name: "main-cell-picture",
    group: canvas.base.name,
    asset: "main-cell",
    dimensions: [displayWidth, displayHeight],
    copyDimensions: [displayWidth, displayHeight]
});

// Functionality to enable drag-drop on main Cell
scrawl.makeDragZone({
    zone: canvas,
    collisionGroup: "my-circle-group",
    coordinateSource: mainCell,
    endOn: ["up", "leave"],
    preventTouchDefaultWhenDragging: true,
    processingOrder: 2,
});

// Build out the smaller map Cell (200px x 200px)
// - this will initially display in the top right corner
// - it will be draggable too
scrawl.makeGroup({

    name: "map-pivot-group",
    host: canvas.base.name
});

const myMapPivot = scrawl.makeBlock({

    name: "map-pivot",
    group: "map-pivot-group",
    start: [displayWidth - mapDimensions, 0],
    dimensions: [mapDimensions, mapDimensions],
    method: "none"
});

// Functionality so we can drag-drop the map Cell around the base Cell
scrawl.makeDragZone({
    zone: canvas,
    collisionGroup: "map-pivot-group",
    coordinateSource: canvas.base,
    endOn: ["up", "leave"],
    preventTouchDefaultWhenDragging: true,
    processingOrder: 1,
});

const mapCell = canvas.buildCell({

    name: "map-cell",
    dimensions: [mapDimensions, mapDimensions],
    // We pivot the map Cell to the draggable Block entity
    // - wherever the Block goes, the map Cell will follow
    pivot: "map-pivot",
    lockTo: "pivot",
    backgroundColor: "white",
    // The map Cell needs to compile after the large Cell
    compileOrder: 1
});

// Now we can copy the large Cell into the map Cell
scrawl.makePicture({

    name: "map-cell-picture",
    group: "map-cell",
    asset: "main-cell",
    dimensions: ["100%", "100%"],
    copyDimensions: ["100%", "100%"],
    lineWidth: 4,
    method: "fillThenDraw",
    globalAlpha: 0.5
});

// Add the draggable map frame
scrawl.makeGroup({

    name: "my-frame-group",
    host: mapCell.name
});

const frame = scrawl.makeBlock({

    name: "my-frame",
    group: "my-frame-group",
    dimensions: [frameWidth, frameHeight],
    strokeStyle: "red",
    lineWidth: 2,
    method: "draw"
});

// Functionality so we can drag-drop the frame around the map Cell
const checkFrameDrag = () => {

    if (frameDragZone()) {

        const [x, y] = frame.get("position");

        const newX = x * mainMapRatio,
        newY = y * mainMapRatio;

        // Adjust the position of the Picture wrt to the frame in the map
        mainCellPicture.set({
            copyStartX: newX,
            copyStartY: newY
        });

        // Adjust the position of the large Cell wrt the base Cell
        mainCell.set({
            startX: -newX,
            startY: -newY
        });
    }
};

const frameDragZone = scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: "my-frame-group",
    coordinateSource: mapCell,
    endOn: ["up", "leave"],
    updateWhileMoving: checkFrameDrag,
    preventTouchDefaultWhenDragging: true,
    exposeCurrentArtefact: true,
    processingOrder: 0,
});


// Add a label to the map Cell
scrawl.makePhrase({

    name: "map-label",
    group: "map-cell",
    text: "Minimap (draggable)",
    fontString: "16px Arial, sans-serif",
    start: ["center", 10],
    handle: ["center", 0]
});

// #### Scene animation
const checkForChanges = () => {

    const [w, h] = canvas.get("dimensions");

    if (w !== displayWidth || h !== displayHeight) {

        displayWidth = w;
        displayHeight = h;

        frameWidth = (displayWidth / mainDimensions) * mapDimensions;
        frameHeight = (displayHeight / mainDimensions) * mapDimensions;

        mainCellPicture.set({
            dimensions: [displayWidth, displayHeight],
            copyDimensions: [displayWidth, displayHeight]
        });

        frame.set({
            dimensions: [frameWidth, frameHeight]
        });

        myMapPivot.set({
            start: [displayWidth - mapDimensions, 0]
        });
    }

    mainCell.updateHere();
    mapCell.updateHere();
};


// Keyboard navigation
const moveFrame = (direction) => {

    let [x, y] = frame.get('position');

    switch (direction) {

        case 'left' :
            x -= 1;
            break;
        case 'up' :
            y -= 1;
            break;
        case 'right' :
            x += 1;
            break;
        case 'down' :
            y += 1;
            break;
    }

    const newX = x * mainMapRatio,
        newY = y * mainMapRatio;

    frame.set({
        startX: x,
        startY: y,
    });

    // Adjust the position of the Picture wrt to the frame in the map
    mainCellPicture.set({
        copyStartX: newX,
        copyStartY: newY
    });

    // Adjust the position of the large Cell wrt the base Cell
    mainCell.set({
        startX: -newX,
        startY: -newY
    });
};

const moveMinimap = (direction) => {

    let [x, y] = myMapPivot.get('position');

    switch (direction) {

        case 'left' :
            x -= 2;
            break;
        case 'up' :
            y -= 2;
            break;
        case 'right' :
            x += 2;
            break;
        case 'down' :
            y += 2;
            break;
    }

    myMapPivot.set({
        startX: x,
        startY: y,
    });
};

const canvasKeys = (e) => {

    const { keyCode, shiftKey, isComposing } = e;

    // Ignore when user is composing a glyph
    if (isComposing || 229 === keyCode) return;

    // Tab, Enter/Return, Esc
    if (9 === keyCode || 13 === keyCode || 27 === keyCode) {
        canvas.domElement.blur();
        return;
    }

    e.preventDefault();

    // Left/right arrow keys (with and without shift)
    if (shiftKey) {
        if (37 === keyCode) moveMinimap('left');
        else if (38 === keyCode) moveMinimap('up');
        else if (39 === keyCode) moveMinimap('right');
        else if (40 === keyCode) moveMinimap('down');
    }
    else {
        if (37 === keyCode) moveFrame('left');
        else if (38 === keyCode) moveFrame('up');
        else if (39 === keyCode) moveFrame('right');
        else if (40 === keyCode) moveFrame('down');
    }
}
scrawl.addNativeListener('keydown', canvasKeys, canvas.domElement);


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    commence: checkForChanges,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
