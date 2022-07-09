// # Demo Modules 005
// Accessible GUI-based simple canvas editor
//
// Related files:
// + [Accessible GUI-based simple canvas editor - main demo](../modules-005.html)
//


// #### Usage
// TODO: add documentation

const initializeMinimap = (args = {}, scrawl) => {


    // Check we have required arguments/values
    if (scrawl == null) throw new Error('SC entity navigation module error: missing Scrawl-canvas object argument');

    let { mainDimensions, mapDimensions, supportedKey, canvas } = args;

    let argsCheck = '';

    if (canvas == null) argsCheck += ' Canvas wrapper;';

    if (argsCheck.length) throw new Error(`SC canvas minimap module error: missing arguments -${argsCheck}`);


    // Magic numbers
    let mainDimensionX = 1600,
        mainDimensionY = 1600,
        mapDimensionX = 200,
        mapDimensionY = 200;

    if (mainDimensions) {

        if (Array.isArray(mainDimensions)){

            mainDimensionX = mainDimensions[0] || 1600;
            mainDimensionY = mainDimensions[1] || 1600;
        }
        else if (mainDimensions.toFixed) {

            mainDimensionX = mainDimensions || 1600;
            mainDimensionY = mainDimensions || 1600;
        }
    }

    if (mapDimensions) {

        if (Array.isArray(mapDimensions)){

            mapDimensionX = mapDimensions[0] || 200;
            mapDimensionY = mapDimensions[1] || 200;
        }
        else if (mapDimensions.toFixed) {

            mapDimensionX = mapDimensions || 200;
            mapDimensionY = mapDimensions || 200;
        }
    }

    const mainMapRatioX = mainDimensionX / mapDimensionX,
        mainMapRatioY = mainDimensionY / mapDimensionY;

    let [displayWidth, displayHeight] = canvas.get("dimensions");

    let frameWidth = (displayWidth / mainDimensionX) * mapDimensionX;
    let frameHeight = (displayHeight / mainDimensionY) * mapDimensionY;

    // Permitted values: `'altKey', 'ctrlKey', 'metaKey'`, or not defined
    // + Because key detection is a mess across browsers, we can also use an array of two strings eg: `['ctrlKey', 'metaKey']`
    let supportedKey1, supportedKey2;

    if (!supportedKey) supportedKey = 'none';

    if (Array.isArray(supportedKey)) {

        supportedKey1 = supportedKey[0];
        supportedKey2 = supportedKey[1];
    }

    canvas.set({

        includeInTabNavigation: true,

    }).setBase({
        // The base Cell needs to compile after the other Cells
        compileOrder: 2
    });


    // Build out the main Cell (default: 1600px x 1600px)
    // - we don't actually display this Cell
    const mainCell = canvas.buildCell({

        name: "main-cell",
        dimensions: [mainDimensionX, mainDimensionY],
        shown: false,
        compileOrder: 0,
    });

    // Rely on the main code to populate the main Cell with entitys, and the functionality required to interact with them. We only care here about displaying the main map in the canvas element


    // Display the main Cell in the base Cell
    const mainCellPicture = scrawl.makePicture({

        name: "main-cell-picture",
        group: canvas.base.name,
        asset: "main-cell",
        dimensions: [displayWidth, displayHeight],
        copyDimensions: [displayWidth, displayHeight]
    });


    // Build out the smaller map Cell (default: 200px x 200px)
    // - this will initially display in the top right corner
    // - it will be draggable too
    const pivotGroup = scrawl.makeGroup({

        name: "map-cell-pivot-group",
        host: canvas.base.name
    });

    const mapPivot = scrawl.makeBlock({

        name: "map-cell-pivot",
        group: "map-cell-pivot-group",
        start: [displayWidth - mapDimensionX, 0],
        dimensions: [mapDimensionX, mapDimensionY],
        method: "none"
    });

    // Functionality so we can drag-drop the map Cell around the base Cell
    scrawl.makeDragZone({
        zone: canvas,
        collisionGroup: "map-cell-pivot-group",
        coordinateSource: canvas.base,
        endOn: ["up", "leave"],
        preventTouchDefaultWhenDragging: true,
        processingOrder: 21,
    });

    const mapCell = canvas.buildCell({

        name: "map-cell",
        dimensions: [mapDimensionX, mapDimensionY],
        // We pivot the map Cell to the draggable Block entity
        // - wherever the Block goes, the map Cell will follow
        pivot: "map-cell-pivot",
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
    });


    // Add the draggable map frame
    const myFrameGroup = scrawl.makeGroup({

        name: "map-cell-frame-group",
        host: mapCell.name
    });

    const frame = scrawl.makeBlock({

        name: "map-cell-frame",
        group: "map-cell-frame-group",
        dimensions: [frameWidth, frameHeight],
        strokeStyle: "red",
        lineWidth: 2,
        method: "draw"
    });


    // Functionality so we can drag-drop the frame around the map Cell
    const checkPermittedFramePosition = (x, y) => {

        if (x < 0 || y < 0) return false;
        if (x + frameWidth > mapDimensionX) return false;
        if (y + frameHeight > mapDimensionY) return false;

        return true;
    };

    const updateFrames = (x, y) => {

        let newX = x * mainMapRatioX,
        newY = y * mainMapRatioY;

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

    const exitDrag = () => {

        let [x, y] = frame.get('position');

        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x + frameWidth > mapDimensionX) x = mapDimensionX - frameWidth;
        if (y + frameHeight > mapDimensionY) y = mapDimensionY - frameHeight;

        frame.set({
            start: [x, y],
        });

        updateFrames(x, y);
    };

    const checkMinimapFrameDrag = () => {

        let [x, y] = frame.get('position');

        if (checkPermittedFramePosition(x, y)) updateFrames(x, y);
        else frameDragZone('exit');
    };

    const frameDragZone = scrawl.makeDragZone({

        zone: canvas,
        collisionGroup: "map-cell-frame-group",
        coordinateSource: mapCell,
        endOn: ["up", "leave"],
        updateWhileMoving: checkMinimapFrameDrag,
        updateOnPrematureExit: exitDrag,
        preventTouchDefaultWhenDragging: true,
        exposeCurrentArtefact: true,
        processingOrder: 20,
    });


    // // Functionality so we can drag-drop the map Cell around the base Cell
    // let draggingMap = false;
    // const dragDownListener = scrawl.addListener("down", (e) => {

    //     if (e) {

    //         let hit = pivotGroup.getArtefactAt(canvas.here);

    //         if (hit) {

    //             e.preventDefault();
    //             e.returnValue = false;

    //             let mapHit = myFrameGroup.getArtefactAt(mapCell.here);

    //             if (!mapHit) {

    //                 draggingMap = true;
    //                 mapPivot.pickupArtefact(canvas.here);
    //             }
    //         }
    //     }
    // }, canvas.domElement);

    // const dragUpListener = scrawl.addListener(["up", "leave"], (e) => {

    //     if (e) {

    //         e.preventDefault();
    //         e.returnValue = false;

    //         if (draggingMap) {

    //             mapPivot.dropArtefact();
    //             draggingMap = false;
    //         }
    //     }
    // }, canvas.domElement);

    const checkForMinimapChanges = () => {

        const [w, h] = canvas.get("dimensions");

        if (w !== displayWidth || h !== displayHeight) {

            displayWidth = w;
            displayHeight = h;

            frameWidth = (displayWidth / mainDimensionX) * mapDimensionX;
            frameHeight = (displayHeight / mainDimensionY) * mapDimensionY;

            mainCellPicture.set({
                dimensions: [displayWidth, displayHeight],
                copyDimensions: [displayWidth, displayHeight]
            });

            frame.set({
                dimensions: [frameWidth, frameHeight]
            });

            mapPivot.set({
                start: [displayWidth - mapDimensionX, 0]
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

        [x, y] = checkPermittedFramePosition(x, y);

        let newX = x * mainMapRatioX,
            newY = y * mainMapRatioY;

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

        let [x, y] = mapPivot.get('position');

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

        mapPivot.set({
            startX: x,
            startY: y,
        });
    };

    // Show/hide minimap
    let minimapIsShowing = true;
    const displayMinimap = () => {

        minimapIsShowing = !minimapIsShowing;

        mapPivot.set({
            visibility: minimapIsShowing,
        });

        mapCell.set({
            shown: minimapIsShowing,
        });
    };


    // TODO: add functionality for zooming the main map
    const zoom = (direction) => {};


    // Keyboard event listener functions
    const extraKeys = {
        none: true,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
        metaKey: false
    };

    const canvasMinimapKeysDown = (e) => {

        const { key } = e;

        // Tab, Enter/Return, Esc
        if ('Tab' === key || 'Escape' === key) {
            canvas.domElement.blur();
            return;
        }

        if ('Shift' === key) extraKeys.shiftKey = true;
        else if ('Alt' === key) extraKeys.altKey = true;
        else if ('Control' === key) extraKeys.ctrlKey = true;
        else if ('Meta' === key) extraKeys.metaKey = true;

        if (
            extraKeys[supportedKey] || 
            extraKeys[supportedKey1] || 
            extraKeys[supportedKey2]
        ) {

            // Arrow keys (with and without shift)
            if (extraKeys.shiftKey) {

                if ('Backspace' === key) displayMinimap();
                else if ('ArrowLeft' === key) moveMinimap('left');
                else if ('ArrowUp' === key) moveMinimap('up');
                else if ('ArrowRight' === key) moveMinimap('right');
                else if ('ArrowDown' === key) moveMinimap('down');
            }
            else {

                if ('Backspace' === key) displayMinimap();
                else if ('ArrowLeft' === key) moveFrame('left');
                else if ('ArrowUp' === key) moveFrame('up');
                else if ('ArrowRight' === key) moveFrame('right');
                else if ('ArrowDown' === key) moveFrame('down');
            }
        }
        e.preventDefault();
    }
    scrawl.addNativeListener('keydown', canvasMinimapKeysDown, canvas.domElement);

    const canvasMinimapKeysUp = (e) => {

        const { key } = e;

        if ('Shift' === key) extraKeys.shiftKey = false;
        else if ('Alt' === key) extraKeys.altKey = false;
        else if ('Control' === key) extraKeys.ctrlKey = false;
        else if ('Meta' === key) extraKeys.metaKey = false;

        e.preventDefault();
    }
    scrawl.addNativeListener('keyup', canvasMinimapKeysUp, canvas.domElement);


    // #### Cleanup and return
    const killCanvasMinimap = () => {
        pivotGroup.kill(true);
        myFrameGroup.kill(true);
        scrawl.library.group[mainCell.name].kill(true);
        scrawl.library.group[mapCell.name].kill(true);
        frameDragZone(true);
        dragDownListener();
        dragUpListener();
        canvasMinimapKeysDown();
        canvasMinimapKeysUp();
    };

    return {
        mainCell,
        checkForMinimapChanges,
        killCanvasMinimap,
    };
};


// #### Export
export {
    initializeMinimap,
};
