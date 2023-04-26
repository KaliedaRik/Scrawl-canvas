// # Demo Modules 005
// Accessible GUI-based simple canvas editor
//
// Related files:
// + [Accessible GUI-based simple canvas editor - main demo](../modules-005.html)
//
// #### Usage
// This module creates a simple GUI control that appears when an entity, or a group of entitys, are selected. The control allows users to move, scale and rotate selected entitys. The control can be positioned in relation to the selected entitys using both drag, and keyboard, input. All the control's actions can be replicated using the keyboard. The module adds the following zones to the supplied Canvas wrapper:
// + Three GUI drag zones -one for each part of the control - to manipulate the GUI control (processingOrder: 50, 51, 52)
// + A keyboard zone - to handle `alphanumeric` and `SHIFT + alphanumeric` input to position, scale and rotate selected entitys. A function is also exported to allow users to customise the alphanumeric key mappings
//
// __Inputs to the `initializeEntityManipulationGui` function__
// + `canvas` - SC canvas wrapper object (required)
// + `cell` - the scene Cell wrapper object, from the canvas-minimap module (required)
// + `selectedEntitys` - the selected entitys group, from the entity-navigation module (required)
// + `updateControllerDisplay` - an object containing functions to update the canvas element's cursor appearance during hover and drag actions, from the entity-navigation module (required)
// + `dashboard` - an object containing DOM form functions, from the dom-entity-editor module (required)
//
// __Output from the `initializeEntityManipulationGui` function__ - is an object containing the following attributes:
// + `checkForSelectionUpdates` - a function to be added to an animation object elsewhere
// + `setGuiControlChars` - a function which allows users to adjust their keyboard mappings
// + `createGui` - the function to (re)create the GUI control
// + `killEntityManipulationGui` - kill function, to remove everything associated with the GUI control


// #### Initialization function (exported)
const initializeEntityManipulationGui = (items = {}, scrawl) => {

    // Check we have required arguments/values
    const { canvas, cell, selectedEntitys, dashboard, updateControllerDisplay } = items;

    if (scrawl == null) throw new Error('SC entity manipulation GUI module error: missing Scrawl-canvas object argument');

    let argsCheck = '';

    if (canvas == null) argsCheck += ' Canvas wrapper;';
    if (cell == null) argsCheck += ' - Cell wrapper';
    if (selectedEntitys == null) argsCheck += ' - Selected entitys group';
    if (updateControllerDisplay == null) argsCheck += ' - Controllers display functions';
    if (dashboard == null) argsCheck += ' - DOM entity editor dashboard functionality';

    if (argsCheck.length) throw new Error(`SC entity manipulation GUI module error: missing arguments${argsCheck}`);


    // All GUI operations happen in their own cell group
    const gui = scrawl.makeGroup({
        name: `${cell.name}-gui-group`,
        host: cell.name,
        order: 9999,
        visibility: false,
        checkForEntityHover: true,
        onEntityHover: updateControllerDisplay.setCursorTo.pointer,
        onEntityNoHover: updateControllerDisplay.setCursorTo.auto,
    });


    // Functions to switch the GUI display on/off
    const showGui = () => {

        movePinGroup.addArtefacts(moveControl);
        rotatePinGroup.addArtefacts(rotateControl);
        scalePinGroup.addArtefacts(scaleControl);

        gui.set({
            visibility: true,
        });
    };

    const hideGui = () => {

        gui.set({
            visibility: false,
        });
    };


    // We rebuild the GUI every time the user (un)selects entitys
    let moveControl,
        scaleControl,
        rotateControl;

    const movePinGroup = scrawl.makeGroup({

        name: 'gui-control-drag-group',
    });

    const getGuiPinPosition = () => {

        const artefacts = selectedEntitys.artefacts;

        if (artefacts.length === 1) {

            const entity = selectedEntitys.getArtefact(artefacts[0]);
            return entity.get('position');
        }
        else {

            let [minX, minY] = cell.get('dimensions');
            let maxX = 0,
                maxY = 0;

            artefacts.forEach(name => {

                const entity = selectedEntitys.getArtefact(name);
                const [x, y] = entity.get('position');

                if (minX > x) minX = x;
                if (minY > y) minY = y;
                if (maxX < x) maxX = x;
                if (maxY < y) maxY = y;
            });

            return [
                minX + ((maxX - minX) / 2),
                minY + ((maxY - minY) / 2),
            ];
        }
    };

    const createGui = () => {

        // get rid of the old GUI entitys
        gui.killArtefacts();

        if (!selectedEntitys.artefacts.length) hideGui();
        else {

            const pinPosition = getGuiPinPosition();

            moveControl = scrawl.makeWheel({

                name: 'gui-move-control',
                group: gui,
                stampOrder: 20,

                radius: 22,

                start: pinPosition,
                handle: ['center', 'center'],

                fillStyle: 'white',
                strokeStyle: 'red',
                lineWidth: 2,
                method: 'fillThenDraw',

                bringToFrontOnDrag: false,
            });

            const moveControlLabel = scrawl.makePhrase({

                name: 'gui-move-control-label',
                group: gui,
                order: 21,

                text: 'MOVE',

                lineHeight: 0,
                handle: ['center', 'center'],

                pivot: moveControl,
                lockTo: 'pivot',
            });

            scaleControl = moveControl.clone({

                name: 'gui-scale-control',
                calculateOrder: 0,
                stampOrder: 10,

                pivot: moveControl,
                lockTo: 'pivot',

                offsetY: -100,
            });

            moveControlLabel.clone({

                name: 'gui-scale-control-label',
                order: 11,

                text: 'SCALE',

                pivot: scaleControl,
            });

            rotateControl = moveControl.clone({

                name: 'gui-rotate-control',
                stampOrder: 10,

                pivot: moveControl,
                lockTo: 'pivot',

                offsetX: 100,
            });

            moveControlLabel.clone({

                name: 'gui-rotate-control-label',
                order: 11,

                text: 'ROLL',

                pivot: rotateControl,
            });

            scrawl.makeLine({

                name: 'gui-scale-control-line',
                group: gui,
                calculateOrder: 2,

                method: 'draw',
                strokeStyle: 'red',
                lineWidth: 2,

                pivot: moveControl,
                lockTo: 'pivot',

                endPivot: scaleControl,
                endLockTo: 'pivot',

                useStartAsControlPoint: true,

            }).clone({

                name: 'gui-rotate-control-line',
                endPivot: rotateControl,
            });

            createGuiStrings(pinPosition);

            showGui();
        }
    };

    const createGuiStrings = (start) => {

        selectedEntitys.artefacts.forEach(name => {

            scrawl.makeLine({

                name: `${name}-string`,
                group: gui,
                calculateOrder: 3,

                method: 'draw',
                strokeStyle: 'red',

                start, 

                pivot: moveControl,
                lockTo: 'pivot',

                endPivot: name,
                endLockTo: 'pivot',
                useStartAsControlPoint: true,
            });

            scrawl.makeWheel({
                name: `${name}-pin`,
                group: gui,

                pivot: name,
                lockTo: 'pivot',

                handle: ['center', 'center'],
                radius: 5,

                fillStyle: 'white',
                strokeStyle: 'red',
                method: 'fillThenDraw',
            });
        });
    };

    const restorePinDisplay = (pin) => {

        pin.set({
            fillStyle: 'white',
        });
    };

    const setPinDisplayForMove = (pin) => {

        pin.set({
            fillStyle: '#bfb',
        });
    };

    const setPinDisplayForGroup = (pin) => {

        pin.set({
            fillStyle: '#fbb',
        });
    };

    const setPinDisplayForEntity = (pin) => {

        pin.set({
            fillStyle: '#bbf',
        });
    };


    // Functions common to the following code
    let centerPosition;
    const getCenterPosition = () => centerPosition = moveControl.get('position');

    let pinStartPosition,
        pinStartDistance;

    const getPinStartPosition = (pin) => {

        const coord = scrawl.requestCoordinate();

        getCenterPosition();
        pinStartPosition = pin.get('position');
        pinStartDistance = coord.setFromArray(pinStartPosition).subtract(centerPosition).getMagnitude();

        scrawl.releaseCoordinate(coord);
    };

    const enqueueDashboardUpdates = () => {

        if (selectedEntitys.artefacts.length === 1) {

            const name = selectedEntitys.artefacts[0];

            const artefact = selectedEntitys.getArtefact(name);

            const [startX, startY] = artefact.get('start');

            dashboard.queue.push({
                startX: Math.round(startX),
                startY: Math.round(startY),
                scale: parseFloat(artefact.get('scale').toFixed(4)),
                roll: artefact.get('roll'),
            });
        }
    };


    // MOVE pin's drag-drop functionality 
    const startMove = () => {

        updateControllerDisplay.onStart();
        setPinDisplayForMove(moveControl);
    };

    const whileMoveGroup = (e) => {

        selectedEntitys.updateArtefacts({
            startX: e.movementX,
            startY: e.movementY,
        });
    };

    const endMove = () => {

        updateControllerDisplay.onEnd();
        restorePinDisplay(moveControl);
        enqueueDashboardUpdates();
    };

    const movePinDragZone = scrawl.makeDragZone({
        zone: canvas,
        coordinateSource: cell,
        collisionGroup: movePinGroup,
        endOn: ['up', 'leave'],
        preventTouchDefaultWhenDragging: true,
        updateOnStart: startMove,
        updateWhileMoving: whileMoveGroup,
        updateWhileShiftMoving: () => {},
        updateOnEnd: endMove,
        processingOrder: 50,
    });


    // ROLL pin's drag-drop functionality 
    const rotatePinGroup = scrawl.makeGroup({
        name: `${cell.name}-gui-rotate-group`,
    });

    let rotatingWithShift = false;
    let rotateStartValues;

    const radToDeg = 180 / Math.PI;

    const calculateAngle = () => {

        const coord = scrawl.requestCoordinate();

        const currentPinPosition = rotateControl.get('position');
        const currentPinDistance = coord.setFromArray(currentPinPosition).subtract(centerPosition).getMagnitude();
        const pinMoveDistance = coord.setFromArray(currentPinPosition).subtract(pinStartPosition).getMagnitude();

        const isAbove = currentPinPosition[1] > centerPosition[1];

        const angle = Math.acos(((currentPinDistance * currentPinDistance) + (pinStartDistance * pinStartDistance) - (pinMoveDistance * pinMoveDistance)) / (2 * currentPinDistance * pinStartDistance)) * radToDeg;

        scrawl.releaseCoordinate(coord);

        if (isAbove) return 360 - angle;

        return angle;
    };

    const getRotateEntityStartValues = () => {

        rotateStartValues = {};

        selectedEntitys.artefacts.forEach(name => {

            rotateStartValues[name] = selectedEntitys.getArtefact(name).get('roll');
        });
    };

    const startRotateEntity = () => {

        rotatingWithShift = false;
        updateControllerDisplay.onStart();
        setPinDisplayForEntity(rotateControl);

        getCenterPosition();
        getPinStartPosition(rotateControl);
        getRotateEntityStartValues();
    };

    const whileRotateEntity = () => {

        if (rotatingWithShift) whileRotateGroup();
        else {

            const angle = calculateAngle();

            selectedEntitys.artefacts.forEach(name => {

                let roll = rotateStartValues[name] - angle;

                while (roll < 0) {
                    roll += 360;
                }
                while (roll > 360) {
                    roll -= 360;
                }

                selectedEntitys.getArtefact(name).set({
                    roll,
                });
            });
        }
    };

    const endRotateEntity = () => {

        rotatingWithShift = false;
        updateControllerDisplay.onEnd();
        restorePinDisplay(rotateControl);
        enqueueDashboardUpdates();
    };

    const getRotateGroupStartValues = () => {

        rotateStartValues = {};

        const coord = scrawl.requestCoordinate();
        
        selectedEntitys.artefacts.forEach(name => {

            const artefact = selectedEntitys.getArtefact(name);
            const pos = artefact.get('position');

            rotateStartValues[name] = {
                position: [...coord.setFromArray(pos).subtract(centerPosition)],
                roll: artefact.get('roll'),
            };
        });
        scrawl.releaseCoordinate(coord);
    };

    const startRotateGroup = () => {

        rotatingWithShift = true;
        updateControllerDisplay.onStart();
        setPinDisplayForGroup(rotateControl);

        getCenterPosition();
        getPinStartPosition(rotateControl);
        getRotateGroupStartValues();
    };

    const whileRotateGroup = () => {

        if (!rotatingWithShift) whileRotateEntity();
        else {

            const angle = calculateAngle();

            const coord = scrawl.requestCoordinate();

            selectedEntitys.artefacts.forEach(name => {

                const artefactValues = rotateStartValues[name];

                coord.setFromArray(artefactValues.position).rotate(-angle).add(centerPosition);

                let roll = artefactValues.roll - angle;

                while (roll < 0) {
                    roll += 360;
                }
                while (roll > 360) {
                    roll -= 360;
                }

                selectedEntitys.getArtefact(name).set({

                    start: [...coord],
                    roll,
                });
            });
            scrawl.releaseCoordinate(coord);
        }
    };

    const endRotateGroup = () => {

        rotatingWithShift = false;
        updateControllerDisplay.onEnd();
        restorePinDisplay(rotateControl);
        enqueueDashboardUpdates();
    };

    const rotatePinDragZone = scrawl.makeDragZone({
        zone: canvas,
        coordinateSource: cell,
        collisionGroup: rotatePinGroup,
        endOn: ['up', 'leave'],
        preventTouchDefaultWhenDragging: true,
        updateOnShiftStart: startRotateEntity,
        updateOnStart: startRotateGroup,
        updateWhileShiftMoving: whileRotateEntity,
        updateWhileMoving: whileRotateGroup,
        updateOnShiftEnd: endRotateEntity,
        updateOnEnd: endRotateGroup,
        processingOrder: 51,
    });


    // SCALE pin's drag-drop functionality 
    const scalePinGroup = scrawl.makeGroup({

        name: `${cell.name}-gui-scale-group`,
    });

    let scalingWithShift = false;
    let scaleStartValues;

    const getScaleRatio = () => {

        const coord = scrawl.requestCoordinate();

        const currentPinPosition = scaleControl.get('position');
        const currentDistance = coord.setFromArray(currentPinPosition).subtract(centerPosition).getMagnitude();

        scrawl.releaseCoordinate(coord);

        return currentDistance / pinStartDistance;
    };

    const getScaleEntityStartValues = () => {

        scaleStartValues = {};

        selectedEntitys.artefacts.forEach(name => {

            scaleStartValues[name] = selectedEntitys.getArtefact(name).get('scale');
        });
    };

    const startScaleEntity = () => {

        scalingWithShift = false;
        updateControllerDisplay.onStart();
        setPinDisplayForEntity(scaleControl);

        getCenterPosition();
        getPinStartPosition(scaleControl);
        getScaleEntityStartValues();
    };

    const whileScaleEntity = () => {

        if (scalingWithShift) whileScaleGroup();
        else {

            const ratio = getScaleRatio();

            selectedEntitys.artefacts.forEach(name => {

                selectedEntitys.getArtefact(name).set({

                    scale: scaleStartValues[name] * ratio,
                });
            });
        }
    };

    const endScaleEntity = () => {

        scalingWithShift = false;
        updateControllerDisplay.onEnd();
        restorePinDisplay(scaleControl);
        enqueueDashboardUpdates();
    };

    const getScaleGroupStartValues = () => {

        scaleStartValues = {};

        const coord = scrawl.requestCoordinate();

        selectedEntitys.artefacts.forEach(name => {

            const artefact = selectedEntitys.getArtefact(name);

            const pos = artefact.get('position');

            scaleStartValues[name] = {
                position: [...coord.setFromArray(pos).subtract(centerPosition)],
                scale: artefact.get('scale'),
            };
        });

        scrawl.releaseCoordinate(coord);
    };

    const startScaleGroup = () => {

        scalingWithShift = true;
        updateControllerDisplay.onStart();
        setPinDisplayForGroup(scaleControl);

        getCenterPosition();
        getPinStartPosition(scaleControl);
        getScaleGroupStartValues();
    };

    const whileScaleGroup = () => {

        if (!scalingWithShift) whileScaleEntity();
        else {

            const ratio = getScaleRatio();

            const coord = scrawl.requestCoordinate();

            selectedEntitys.artefacts.forEach(name => {

                const values = scaleStartValues[name];

                selectedEntitys.getArtefact(name).set({

                    start: coord.setFromArray(values.position).scalarMultiply(ratio).add(centerPosition),
                    scale: values.scale * ratio,
                });
            });
            scrawl.releaseCoordinate(coord);
        }
    };

    const endScaleGroup = () => {
        
        scalingWithShift = false;
        updateControllerDisplay.onEnd();
        restorePinDisplay(scaleControl);
        enqueueDashboardUpdates();
    };

    const scalePinDragZone = scrawl.makeDragZone({
        zone: canvas,
        coordinateSource: cell,
        collisionGroup: scalePinGroup,
        endOn: ['up', 'leave'],
        preventTouchDefaultWhenDragging: true,
        updateOnShiftStart: startScaleEntity,
        updateOnStart: startScaleGroup,
        updateWhileShiftMoving: whileScaleEntity,
        updateWhileMoving: whileScaleGroup,
        updateOnShiftEnd: endScaleEntity,
        updateOnEnd: endScaleGroup,
        processingOrder: 52,
    });


    // ### Accessibility
    // Because what's the point of having controllers if they can't be used via the keyboard?
    let deltaMove = 1,
        deltaAngle = 0.5,
        deltaScale = 0.01;

    const moveSelection = (direction = '') => {

        if (direction && gui.visibility) {

            moveGuiPin(direction);

            // Perform the move
            switch (direction) {

                case 'left' :
                    selectedEntitys.updateArtefacts({
                        startX: -deltaMove
                    });
                    break;

                case 'right' :
                    selectedEntitys.updateArtefacts({
                        startX: deltaMove
                    });
                    break;

                case 'up' :
                    selectedEntitys.updateArtefacts({
                        startY: -deltaMove
                    });
                    break;

                case 'down' :
                    selectedEntitys.updateArtefacts({
                        startY: deltaMove
                    });
                    break;
            }
            updateControllerDisplay.onEnd();
            enqueueDashboardUpdates();
        }
    };

    const moveGuiPin = (direction = '') => {

        if (direction && gui.visibility) {

            // Perform the move
            switch (direction) {

                case 'left' :
                    moveControl.setDelta({
                        startX: -deltaMove
                    });
                    break;

                case 'right' :
                    moveControl.setDelta({
                        startX: deltaMove
                    });
                    break;

                case 'up' :
                    moveControl.setDelta({
                        startY: -deltaMove
                    });
                    break;

                case 'down' :
                    moveControl.setDelta({
                        startY: deltaMove
                    });
                    break;
            }
        }
    };

    const scaleGroup = (direction = '') => {

        if (direction && gui.visibility) {

            getCenterPosition();
            getScaleGroupStartValues();

            let ratio;

            // Perform the move
            switch (direction) {

                case 'grow' :
                    ratio = 1 + deltaScale;
                    break;

                case 'shrink' :
                    ratio = 1 - deltaScale;
                    break;
            }
            const coord = scrawl.requestCoordinate();

            selectedEntitys.artefacts.forEach(name => {

                const values = scaleStartValues[name];

                selectedEntitys.getArtefact(name).set({

                    start: coord.setFromArray(values.position).scalarMultiply(ratio).add(centerPosition),
                    scale: values.scale * ratio,
                });
            });

            scrawl.releaseCoordinate(coord);
            updateControllerDisplay.onEnd();
            enqueueDashboardUpdates();
        }
    };

    const scaleEntitys = (direction = '') => {

        if (direction && gui.visibility) {

            getScaleEntityStartValues();

            let ratio;

            // Perform the move
            switch (direction) {

                case 'grow' :
                    ratio = 1 + deltaScale;
                    break;

                case 'shrink' :
                    ratio = 1 - deltaScale;
                    break;
            }
            selectedEntitys.artefacts.forEach(name => {

                selectedEntitys.getArtefact(name).set({

                    scale: scaleStartValues[name] * ratio,
                });
            });
            updateControllerDisplay.onEnd();
            enqueueDashboardUpdates();
        }
    };

    const rotateGroup = (direction = '') => {

        if (direction && gui.visibility) {

            getCenterPosition();
            getRotateGroupStartValues();

            let angle;

            // Perform the move
            switch (direction) {

                case 'sinistral' :
                    angle = -deltaAngle;
                    break;

                case 'dextral' :
                    angle = deltaAngle;
                    break;
            }
            const coord = scrawl.requestCoordinate();

            selectedEntitys.artefacts.forEach(name => {

                const artefactValues = rotateStartValues[name];

                coord.setFromArray(artefactValues.position).rotate(angle).add(centerPosition);

                selectedEntitys.getArtefact(name).set({

                    start: [...coord],
                    roll: artefactValues.roll + angle,
                });
            });
            scrawl.releaseCoordinate(coord);
            updateControllerDisplay.onEnd();
            enqueueDashboardUpdates();
        }
    };

    const rotateEntitys = (direction = '') => {

        if (direction && gui.visibility) {

            getRotateEntityStartValues();

            let angle;

            // Perform the move
            switch (direction) {

                case 'sinistral' :
                    angle = -deltaAngle;
                    break;

                case 'dextral' :
                    angle = deltaAngle;
                    break;
            }
            selectedEntitys.artefacts.forEach(name => {

                selectedEntitys.getArtefact(name).set({

                    roll: rotateStartValues[name] + angle,
                });
            });
            updateControllerDisplay.onEnd();
            enqueueDashboardUpdates();
        }
    };

    const setDeltaAngle = () => {

        const val = window.prompt('Set the delta angle to be applied to selected entitys via keyboard interactions', '0.5');
        
        deltaAngle = parseFloat(val);

        if (isNaN(deltaAngle)) deltaAngle = 0.5;
    };

    const setDeltaScale = () => {

        const val = window.prompt('Set the delta scale to be applied to selected entitys via keyboard interactions', '0.01');
        
        deltaScale = parseFloat(val);

        if (isNaN(deltaScale)) deltaScale = 0.5;
    };

    const setDeltaMove = () => {

        const val = window.prompt('Set the delta move (in px) to be applied to selected entitys via keyboard interactions', '1');
        
        deltaMove = parseInt(val, 10);

        if (isNaN(deltaMove)) deltaMove = 1;
    };


    // Keyboard event listener functions
    let keyboard = scrawl.makeKeyboardZone({

        zone: canvas,
    });

    // Because keyboards have different layouts, we need a function that will allow users to set their preferred character keys to trigger GUI interaction
    // + On QWERTY keyboards, the standard choice for arrow directions is often `wasd` for `up left down right`
    // + The Dvorak keyboard equivalent often changes to `,aoe`
    // + For AZERTY keyboards, `zqsd`
    // + By default this demo uses `n` for scale up, `m` for scale down, `h` for rotate anti-clockwise, and `j` for rotate clockwise. These key choices are entirely arbitrary!
    // + Users can change the default deltas for move, scale and rotate keyboard actions via an alert triggered by the appropriate key press; by default these keys are `q` (move), `b` (scale), `g` (rotation)
    const setGuiControlChars = (chars) => {

        if (chars != null) {
            
            chars = chars.replace(/ /g, '');

            if (chars.length === 11) {

                const unshiftedActions = {},
                    shiftedActions = {};

                const oldChars = currentGuiControlChars.split('');

                oldChars.forEach(char => {

                    unshiftedActions[char] = null;
                    shiftedActions[char.toUpperCase()] = null;
                });

                currentGuiControlChars = chars.toUpperCase();

                shiftedActions[currentGuiControlChars[0]] = () => setDeltaMove(); // q
                shiftedActions[currentGuiControlChars[1]] = () => moveGuiPin('up'); // w
                shiftedActions[currentGuiControlChars[2]] = () => moveGuiPin('left'); // a
                shiftedActions[currentGuiControlChars[3]] = () => moveGuiPin('down'); // s
                shiftedActions[currentGuiControlChars[4]] = () => moveGuiPin('right'); // d
                shiftedActions[currentGuiControlChars[5]] = () => setDeltaScale(); // b
                shiftedActions[currentGuiControlChars[6]] = () => scaleEntitys('grow'); // n
                shiftedActions[currentGuiControlChars[7]] = () => scaleEntitys('shrink'); // m
                shiftedActions[currentGuiControlChars[8]] = () => setDeltaAngle(); // g
                shiftedActions[currentGuiControlChars[9]] = () => rotateEntitys('dextral'); // j
                shiftedActions[currentGuiControlChars[10]] = () => rotateEntitys('sinistral'); // h

                currentGuiControlChars = currentGuiControlChars.toLowerCase();

                unshiftedActions[currentGuiControlChars[0]] = () => setDeltaMove(); // q
                unshiftedActions[currentGuiControlChars[1]] = () => moveSelection('up'); // w
                unshiftedActions[currentGuiControlChars[2]] = () => moveSelection('left'); // a
                unshiftedActions[currentGuiControlChars[3]] = () => moveSelection('down'); // s
                unshiftedActions[currentGuiControlChars[4]] = () => moveSelection('right'); // d
                unshiftedActions[currentGuiControlChars[5]] = () => setDeltaScale(); // b
                unshiftedActions[currentGuiControlChars[6]] = () => scaleGroup('grow'); // n
                unshiftedActions[currentGuiControlChars[7]] = () => scaleGroup('shrink'); // m
                unshiftedActions[currentGuiControlChars[8]] = () => setDeltaAngle(); // g
                unshiftedActions[currentGuiControlChars[9]] = () => rotateGroup('dextral'); // j
                unshiftedActions[currentGuiControlChars[10]] = () => rotateGroup('sinistral'); // h

                keyboard = scrawl.makeKeyboardZone({
                    zone: canvas,
                    none: unshiftedActions,
                    shiftOnly: shiftedActions,
                });
            }
        }
    };

    // The default keys are `q w a s d b n m g j h`
    let currentGuiControlChars = 'qwasdbnmgjh';
    setGuiControlChars(currentGuiControlChars);


    const currentSelectedEntries = [...selectedEntitys.artefacts];

    const checkForSelectionUpdates = () => {

        const current = currentSelectedEntries.join('|'),
            selected = selectedEntitys.artefacts.join('|');

        if (current !== selected) {

            currentSelectedEntries.length = 0;
            currentSelectedEntries.push(...selectedEntitys.artefacts);

            createGui();
        }
    };


    // #### Cleanup and return
    const killEntityManipulationGui = () => {
        movePinGroup.kill();
        gui.kill(true);
        movePinDragZone();
        rotatePinDragZone();
        scalePinDragZone();
        keyboard.kill();
    };

    return {
        checkForSelectionUpdates,
        setGuiControlChars,
        createGui,
        killEntityManipulationGui,
    };
};


// #### Export
export {
    initializeEntityManipulationGui,
};
