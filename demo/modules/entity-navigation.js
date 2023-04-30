// # Demo Modules 005
// Accessible GUI-based simple canvas editor
//
// Related files:
// + [Accessible GUI-based simple canvas editor - main demo](../modules-005.html)
//
// #### Usage
// This module creates graphical underlays so that users can see entitys they've highlighted (via keyboard navigation) or selected (via mouse or keyboard). It creates the `selectedEntitys` and `keyboardEntitys` Group objects, to which the appropriate fillters are applied. It also handles navigation between entitys using the keyboard arrows, alongside moving highlighted entitys via the keyboard. The module adds the following zones to the supplied Canvas wrapper:
// + An entity drag zone, to drag entitys around the scene editor Cell (processingOrder: 100)
// + A keyboard zone - to handle `arrow` and `SHIFT + arrow` (entity navigation), and `Enter` and `Backspace` (for entity selection) keystrokes
//
// __Inputs to the `initializeEntityNavigation` function__
// + `canvas` - SC canvas wrapper object (required)
// + `cell` - the scene Cell wrapper object, from the canvas-minimap module (required)
// + `dashboard` - an object containing DOM form functions, from the dom-entity-editor module (required)
//
// __Output from the `initializeEntityNavigation` function__ - is an object containing the following attributes:
// + `selectedEntitys` - the selected entitys group, used by other modules
// + `addControllerAttributes` - an object containing attributes that need to be added to entitys which will be controlled by the scene editor
// + `removeControllerAttributes` - an object containing attributes that need to be set on entitys to remove them from scene editor control
// + `checkForEntityNavigationHoverActions` - a function to add to an animation object, which invokes the Canvas wrapper's `checkHover` functionality
// + `updateControllerDisplay` - an object containing functions to update the canvas element's cursor appearance during hover and drag actions
// + `killEntityNavigation` - kill function, to remove everything associated with the scene navigation functionality


// #### Filter weight arrays
const weights1 = [0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 8, 0, 0, 0, 12, 0, 0, 0, 15, 0, 1, 1, 19, 1, 1, 1, 22, 1, 1, 1, 25, 1, 1, 1, 29, 1, 1, 1, 32, 1, 0, 0, 36, 0, 0, 0, 39, 0, 0, 0, 43, 0, 0, 0, 47, 0, 0, 0, 50, 0, 0, 0, 54, 0, 1, 1, 58, 1, 1, 1, 61, 1, 1, 1, 65, 1, 1, 1, 68, 1, 1, 1, 72, 1, 1, 1, 75, 1, 0, 0, 78, 0, 0, 0, 82, 0, 0, 0, 85, 0, 0, 0, 88, 0, 0, 0, 91, 0, 1, 1, 94, 1, 1, 1, 97, 1, 1, 1, 100, 1, 1, 1, 103, 1, 0, 0, 105, 0, 0, 0, 108, 0, 0, 0, 111, 0, 0, 0, 113, 0, 0, 0, 115, 0, 0, 0, 117, 0, 1, 1, 119, 1, 1, 1, 121, 1, 1, 1, 123, 1, 1, 1, 125, 1, 1, 1, 127, 1, 0, 0, 129, 0, 0, 0, 130, 0, 0, 0, 132, 0, 0, 0, 133, 0, 0, 0, 134, 0, 0, 0, 136, 0, 1, 1, 137, 1, 1, 1, 138, 1, 1, 1, 139, 1, 1, 1, 140, 1, 1, 1, 141, 1, 1, 1, 142, 1, 0, 0, 143, 0, 0, 0, 144, 0, 0, 0, 145, 0, 0, 0, 145, 0, 0, 0, 146, 0, 1, 1, 147, 1, 1, 1, 147, 1, 1, 1, 148, 1, 1, 1, 148, 1, 0, 0, 149, 0, 0, 0, 149, 0, 0, 0, 149, 0, 0, 0, 150, 0, 0, 0, 150, 0, 0, 0, 150, 0, 1, 1, 151, 1, 1, 1, 151, 1, 1, 1, 151, 1, 1, 1, 151, 1, 1, 1, 151, 1, 0, 0, 151, 0, 0, 0, 151, 0, 0, 0, 151, 0, 0, 0, 151, 0, 0, 0, 151, 0, 0, 0, 151, 0, 1, 1, 151, 1, 1, 1, 151, 1, 1, 1, 151, 1, 1, 1, 151, 1, 1, 1, 150, 1, 1, 1, 150, 1, 0, 0, 150, 0, 0, 0, 150, 0, 0, 0, 149, 0, 0, 0, 149, 0, 0, 0, 149, 0, 1, 1, 148, 1, 1, 1, 148, 1, 1, 1, 148, 1, 1, 1, 147, 1, 0, 0, 147, 0, 0, 0, 146, 0, 0, 0, 146, 0, 0, 0, 146, 0, 0, 0, 145, 0, 0, 0, 145, 0, 1, 1, 144, 1, 1, 1, 144, 1, 1, 1, 143, 1, 1, 1, 143, 1, 1, 1, 142, 1, 0, 0, 141, 0, 0, 0, 141, 0, 0, 0, 140, 0, 0, 0, 140, 0, 0, 0, 139, 0, 0, 0, 138, 0, 1, 1, 138, 1, 1, 1, 137, 1, 1, 1, 137, 1, 1, 1, 136, 1, 1, 1, 135, 1, 1, 1, 134, 1, 0, 0, 134, 0, 0, 0, 133, 0, 0, 0, 132, 0, 0, 0, 132, 0, 0, 0, 131, 0, 1, 1, 130, 1, 1, 1, 129, 1, 1, 1, 129, 1, 1, 1, 128, 1, 0, 0, 127, 0, 0, 0, 126, 0, 0, 0, 125, 0, 0, 0, 125, 0, 0, 0, 124, 0, 0, 0, 123, 0, 1, 1, 122, 1, 1, 1, 121, 1, 1, 1, 120, 1, 1, 1, 119, 1, 1, 1, 119, 1, 0, 0, 118, 0, 0, 0, 117, 0, 0, 0, 116, 0, 0, 0, 114, 0, 0, 0, 113, 0, 0, 0, 112, 0, 1, 1, 111, 1, 1, 1, 110, 1, 1, 1, 109, 1, 1, 1, 108, 1, 1, 1, 107, 1, 1, 1, 106, 1, 0, 0, 105, 0, 0, 0, 104, 0, 0, 0, 103, 0, 0, 0, 102, 0, 0, 0, 101, 0, 1, 1, 100, 1, 1, 1, 99, 1, 1, 1, 98, 1, 1, 1, 97, 1, 0, 0, 96, 0, 0, 0, 95, 0, 0, 0, 94, 0, 0, 0, 93, 0, 0, 0, 92, 0, 0, 0, 91, 0, 1, 1, 90, 1, 1, 1, 89, 1, 1, 1, 88, 1, 1, 1, 87, 1, 1, 1, 86, 1, 0, 0, 85, 0, 0, 0, 84, 0, 0, 0, 83, 0, 0, 0, 82, 0, 0, 0, 81, 0, 0, 0, 80, 0, 1, 1, 79, 1, 1, 1, 78, 1, 1, 1, 77, 1, 1, 1, 76, 1, 1, 1, 75, 1, 1, 1, 74, 1, 0, 0, 73, 0, 0, 0, 72, 0, 0, 0, 71, 0, 0, 0, 70, 0, 0, 0, 69, 0, 1, 1, 68, 1, 1, 1, 67, 1, 1, 1, 66, 1, 1, 1, 65, 1, 0, 0, 64, 0, 0, 0, 63, 0, 0, 0, 62, 0, 0, 0, 61, 0, 0, 0, 60, 0, 0, 0, 59, 0, 1, 1, 58, 1, 1, 1, 57, 1, 1, 1, 56, 1, 1, 1, 55, 1, 1, 1, 54, 1, 0, 0, 53, 0, 0, 0, 52, 0, 0, 0, 51, 0, 0, 0, 50, 0, 0, 0, 49, 0, 0, 0, 48, 0, 1, 1, 47, 1, 1, 1, 46, 1, 1, 1, 45, 1, 1, 1, 44, 1, 1, 1, 43, 1, 1, 1, 42, 1, 0, 0, 41, 0, 0, 0, 40, 0, 0, 0, 39, 0, 0, 0, 38, 0, 0, 0, 37, 0, 1, 1, 36, 1, 1, 1, 35, 1, 1, 1, 34, 1, 1, 1, 33, 1, 0, 0, 32, 0, 0, 0, 31, 0, 0, 0, 30, 0, 0, 0, 29, 0, 0, 0, 28, 0, 0, 0, 27, 0, 1, 1, 26, 1, 1, 1, 25, 1, 1, 1, 24, 1, 1, 1, 23, 1, 1, 1, 22, 1, 0, 0, 21, 0, 0, 0, 20, 0, 0, 0, 19, 0, 0, 0, 18, 0, 0, 0, 17, 0, 0, 0, 16, 0, 1, 1, 15, 1, 1, 1, 14, 1, 1, 1, 13, 1, 1, 1, 12, 1, 1, 1, 11, 1, 1, 1, 10, 1, 0, 0, 9, 0, 0, 0, 8, 0, 0, 0, 7, 0, 0, 0, 6, 0, 0, 0, 5, 0, 1, 1, 4, 1, 1, 1, 3, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0];

const weights2 = [0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 22, 0, 0, 0, 30, 0, 0, 0, 38, 0, 1, 1, 46, 1, 1, 1, 53, 1, 1, 1, 60, 1, 1, 1, 67, 1, 1, 1, 74, 1, 0, 0, 80, 0, 0, 0, 86, 0, 0, 0, 92, 0, 0, 0, 97, 0, 0, 0, 103, 0, 0, 0, 108, 0, 1, 1, 113, 1, 1, 1, 117, 1, 1, 1, 122, 1, 1, 1, 126, 1, 1, 1, 130, 1, 1, 1, 134, 1, 0, 0, 137, 0, 0, 0, 140, 0, 0, 0, 144, 0, 0, 0, 147, 0, 0, 0, 150, 0, 1, 1, 152, 1, 1, 1, 155, 1, 1, 1, 157, 1, 1, 1, 160, 1, 0, 0, 162, 0, 0, 0, 164, 0, 0, 0, 166, 0, 0, 0, 167, 0, 0, 0, 169, 0, 0, 0, 171, 0, 1, 1, 172, 1, 1, 1, 173, 1, 1, 1, 174, 1, 1, 1, 176, 1, 1, 1, 177, 1, 0, 0, 178, 0, 0, 0, 178, 0, 0, 0, 179, 0, 0, 0, 180, 0, 0, 0, 181, 0, 0, 0, 181, 0, 1, 1, 182, 1, 1, 1, 182, 1, 1, 1, 182, 1, 1, 1, 183, 1, 1, 1, 183, 1, 1, 1, 183, 1, 0, 0, 183, 0, 0, 0, 183, 0, 0, 0, 183, 0, 0, 0, 183, 0, 0, 0, 183, 0, 1, 1, 183, 1, 1, 1, 183, 1, 1, 1, 183, 1, 1, 1, 183, 1, 0, 0, 182, 0, 0, 0, 182, 0, 0, 0, 182, 0, 0, 0, 181, 0, 0, 0, 181, 0, 0, 0, 180, 0, 1, 1, 180, 1, 1, 1, 180, 1, 1, 1, 179, 1, 1, 1, 178, 1, 1, 1, 178, 1, 0, 0, 177, 0, 0, 0, 177, 0, 0, 0, 176, 0, 0, 0, 175, 0, 0, 0, 175, 0, 0, 0, 174, 0, 1, 1, 173, 1, 1, 1, 173, 1, 1, 1, 172, 1, 1, 1, 171, 1, 1, 1, 170, 1, 1, 1, 169, 1, 0, 0, 169, 0, 0, 0, 168, 0, 0, 0, 167, 0, 0, 0, 166, 0, 0, 0, 165, 0, 1, 1, 164, 1, 1, 1, 164, 1, 1, 1, 163, 1, 1, 1, 162, 1, 0, 0, 161, 0, 0, 0, 160, 0, 0, 0, 159, 0, 0, 0, 157, 0, 0, 0, 156, 0, 0, 0, 155, 0, 1, 1, 154, 1, 1, 1, 153, 1, 1, 1, 152, 1, 1, 1, 151, 1, 1, 1, 150, 1, 0, 0, 149, 0, 0, 0, 148, 0, 0, 0, 147, 0, 0, 0, 146, 0, 0, 0, 145, 0, 0, 0, 144, 0, 1, 1, 143, 1, 1, 1, 142, 1, 1, 1, 141, 1, 1, 1, 140, 1, 1, 1, 139, 1, 1, 1, 138, 1, 0, 0, 137, 0, 0, 0, 136, 0, 0, 0, 135, 0, 0, 0, 134, 0, 0, 0, 133, 0, 1, 1, 132, 1, 1, 1, 131, 1, 1, 1, 130, 1, 1, 1, 129, 1, 0, 0, 128, 0, 0, 0, 127, 0, 0, 0, 126, 0, 0, 0, 125, 0, 0, 0, 124, 0, 0, 0, 123, 0, 1, 1, 122, 1, 1, 1, 121, 1, 1, 1, 120, 1, 1, 1, 119, 1, 1, 1, 118, 1, 0, 0, 117, 0, 0, 0, 116, 0, 0, 0, 115, 0, 0, 0, 114, 0, 0, 0, 113, 0, 0, 0, 112, 0, 1, 1, 111, 1, 1, 1, 110, 1, 1, 1, 109, 1, 1, 1, 108, 1, 1, 1, 107, 1, 1, 1, 106, 1, 0, 0, 105, 0, 0, 0, 104, 0, 0, 0, 103, 0, 0, 0, 102, 0, 0, 0, 101, 0, 1, 1, 100, 1, 1, 1, 99, 1, 1, 1, 98, 1, 1, 1, 97, 1, 0, 0, 96, 0, 0, 0, 95, 0, 0, 0, 94, 0, 0, 0, 93, 0, 0, 0, 92, 0, 0, 0, 91, 0, 1, 1, 90, 1, 1, 1, 89, 1, 1, 1, 88, 1, 1, 1, 87, 1, 1, 1, 86, 1, 0, 0, 85, 0, 0, 0, 84, 0, 0, 0, 83, 0, 0, 0, 82, 0, 0, 0, 81, 0, 0, 0, 80, 0, 1, 1, 79, 1, 1, 1, 78, 1, 1, 1, 77, 1, 1, 1, 76, 1, 1, 1, 75, 1, 1, 1, 74, 1, 0, 0, 73, 0, 0, 0, 72, 0, 0, 0, 71, 0, 0, 0, 70, 0, 0, 0, 69, 0, 1, 1, 68, 1, 1, 1, 67, 1, 1, 1, 66, 1, 1, 1, 65, 1, 0, 0, 64, 0, 0, 0, 63, 0, 0, 0, 62, 0, 0, 0, 61, 0, 0, 0, 60, 0, 0, 0, 59, 0, 1, 1, 58, 1, 1, 1, 57, 1, 1, 1, 56, 1, 1, 1, 55, 1, 1, 1, 54, 1, 0, 0, 53, 0, 0, 0, 52, 0, 0, 0, 51, 0, 0, 0, 50, 0, 0, 0, 49, 0, 0, 0, 48, 0, 1, 1, 47, 1, 1, 1, 46, 1, 1, 1, 45, 1, 1, 1, 44, 1, 1, 1, 43, 1, 1, 1, 42, 1, 0, 0, 41, 0, 0, 0, 40, 0, 0, 0, 39, 0, 0, 0, 38, 0, 0, 0, 37, 0, 1, 1, 36, 1, 1, 1, 35, 1, 1, 1, 34, 1, 1, 1, 33, 1, 0, 0, 32, 0, 0, 0, 31, 0, 0, 0, 30, 0, 0, 0, 29, 0, 0, 0, 28, 0, 0, 0, 27, 0, 1, 1, 26, 1, 1, 1, 25, 1, 1, 1, 24, 1, 1, 1, 23, 1, 1, 1, 22, 1, 0, 0, 21, 0, 0, 0, 20, 0, 0, 0, 19, 0, 0, 0, 18, 0, 0, 0, 17, 0, 0, 0, 16, 0, 1, 1, 15, 1, 1, 1, 14, 1, 1, 1, 13, 1, 1, 1, 12, 1, 1, 1, 11, 1, 1, 1, 10, 1, 0, 0, 9, 0, 0, 0, 8, 0, 0, 0, 7, 0, 0, 0, 6, 0, 0, 0, 5, 0, 1, 1, 4, 1, 1, 1, 3, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0];


// #### Initialization function (exported)
const initializeEntityNavigation = (items = {}, scrawl) => {


    // Check we have required arguments/values
    const { canvas, cell, dashboard } = items;

    if (scrawl == null) throw new Error('SC entity navigation module error: missing Scrawl-canvas object argument');

    let argsCheck = '';

    if (canvas == null) argsCheck += ' - Canvas wrapper';
    if (cell == null) argsCheck += ' - Cell wrapper';
    if (dashboard == null) argsCheck += ' - DOM entity editor dashboard functionality';

    if (argsCheck.length) throw new Error(`SC entity navigation module error: missing arguments${argsCheck}`);


    // Make an object to hold functions we'll use for UI
    const setCursorTo = {

        auto: () => {
            canvas.set({
                css: {
                    cursor: 'auto',
                },
            });
        },
        pointer: () => {
            canvas.set({
                css: {
                    cursor: 'pointer',
                },
            });
        },
        grabbing: () => {
            canvas.set({
                css: {
                    cursor: 'grabbing',
                },
            });
        },
    };


    // Sometimes the supplied cell may not be shown directly in the canvas - for example, the canvas-minimap.js module does not directly show its mainCell; in these cases we need to make sure entitys in the Cell get included in the event cascade
    cell.set({
        includeInCascadeEventActions: true,
        checkForEntityHover: true,
        onEntityHover: setCursorTo.pointer,
        onEntityNoHover: setCursorTo.auto,
    });


    // #### Entity selection for editing
    // Editing options are dependant on:
    // + if more than 1 entitys selected, then a restricted set of editing options get presented and will affect all entitys (in a delta-like manner)
    // + if only one entity is selected, then editing options should relate to that entity's type
    //
    // We use a filter to help indicate which entitys are currently selected
    scrawl.makeFilter({
        name: 'selected-entitys-border',
        actions: [
            {
                action: 'invert-channels',
                lineIn: 'source-alpha',
                includeGreen: false,
                includeBlue: false,
            },
            {
                action: 'gaussian-blur',
                radius: 2,
            },
            {
                action: 'vary-channels-by-weights',
                useMixedChannel: false,
                weights: weights2,
            },
        ],
    });


    // Group compile ordering
    // + keyboardEntitys group two beneath the canvas base group
    // + selectedEntitys group above keyboardEntitys group
    // + the canvas base group needs to be raised by two to accommodate these additional groups
    const canvasGroup = cell.get('group');
    let canvasOrder = 2;

    if (canvasGroup) {

        canvasOrder = canvasGroup.get('order') + 2;

        canvasGroup.set({
            order: canvasOrder,
        });
    }

    const selectedEntitys = scrawl.makeGroup({
        name: `${cell.name}-selected-entitys`,
        host: cell.name,
        order: canvasOrder - 1,
        filters: ['selected-entitys-border'],
        memoizeFilterOutput: true,
    });


    // Function to add/remove an entity to/from the selectedEntitys Group
    const selectEntity = (entity) => {

        const arts = selectedEntitys.artefacts;

        if (arts.includes(entity.name)) selectedEntitys.removeArtefacts(entity);
        else selectedEntitys.addArtefacts(entity);

        // Selected entitys have a red border around them, to make them easier to identify
        // + We need to reset the group filter memoization to make them display
        // + Recalculating the borders is too expensive to do this on every Display cycle
        selectedEntitys.set({
            noFilters: false,
        });

        dashboard.refresh(selectedEntitys, updateControllersDisplayOnEnd);
    };

    const clearSelectedEntitys = () => {

        selectedEntitys.clearArtefacts();

        selectedEntitys.set({
            noFilters: false,
        });

        dashboard.refresh(selectedEntitys, updateControllersDisplayOnEnd);
    };


    // A set of attributes that can be applied to entitys to include them from the entity controllers system
    const addControllerAttributes = {

        onUp: function (e) {

            if (e.shiftKey) selectEntity(this);
        },
    };


    // A set of attributes that can be applied to entitys to remove them from the entity controllers system
    const removeControllerAttributes = {
        onUp: () => {},
    };

    const cascade = (e) => canvas.cascadeEventAction('up', e);
    scrawl.addListener('up', cascade, canvas.domElement);


    // #### Accessibility - Keyboard navigation
    canvas.set({
        role: 'application',
        includeInTabNavigation: true,
    });


    // Setup a group which will display the current keyboard-navigated entity
    scrawl.makeFilter({
        name: 'keyboard-entitys-border',
        actions: [
            {
                action: 'gaussian-blur',
                lineIn: 'source-alpha',
                radius: 3,
            },
            {
                action: 'vary-channels-by-weights',
                useMixedChannel: false,
                weights: weights1,
            },
        ],
    });

    const keyboardEntitys = scrawl.makeGroup({
        name: `${cell.name}-keyboard-entitys`,
        host: cell.name,
        order: canvasOrder - 2,
        filters: ['keyboard-entitys-border'],
        memoizeFilterOutput: true,
    });


    // Setup some state to keep track of navigable entitys, and where we currently are in that list
    const entityNames = [];
    let currentKeyboardEntity;

    const updateEntityNames = () => {

        entityNames.length = 0;
        entityNames.push(...canvasGroup.artefacts);
    };

    const getNextEntity = (forward = true) => {

        updateEntityNames();

        const len = entityNames.length;

        if (!len) return null;

        if (len === 1 || !currentKeyboardEntity) return canvasGroup.getArtefact(entityNames[0]);

        let entityIndex = entityNames.indexOf(currentKeyboardEntity.name);

        if (entityIndex < 0) return null;

        if (forward) entityIndex++;
        else entityIndex--;

        if (entityIndex < 0) entityIndex = len - 1;
        else if (entityIndex >= len) entityIndex = 0;

        return canvasGroup.getArtefact(entityNames[entityIndex]) || null;
    };

    const keyboardNavigateEntitys = (forward = true) => {

        currentKeyboardEntity = getNextEntity(forward);

        keyboardEntitys.clearArtefacts();

        if (currentKeyboardEntity) keyboardEntitys.addArtefacts(currentKeyboardEntity);

        keyboardEntitys.set({
            noFilters: false,
        });
    };


    // Add/remove a highlighted entity to/from the selection
    const keyboardSelectEntity = () => {

        if (currentKeyboardEntity) selectEntity(currentKeyboardEntity);
    };


    // Move the highlighted entity
    const keyboardPositionEntity = (direction = '', delta = 1) => {

        // Check we have an entity to move, and in which direction to move it
        if (direction && currentKeyboardEntity) {

            // Perform the move
            switch (direction) {

                case 'left' :
                    currentKeyboardEntity.setDelta({
                        startX: -delta,
                    });
                    break;

                case 'right' :
                    currentKeyboardEntity.setDelta({
                        startX: delta,
                    });
                    break;

                case 'up' :
                    currentKeyboardEntity.setDelta({
                        startY: -delta,
                    });
                    break;

                case 'down' :
                    currentKeyboardEntity.setDelta({
                        startY: delta,
                    });
                    break;
            }

            // Trigger the Group filters to update their output
            keyboardEntitys.set({
                noFilters: false,
            });

            if (selectedEntitys.artefacts.includes(currentKeyboardEntity.name)) {

                selectedEntitys.set({
                    noFilters: false,
                });
            }
        }
    };


    // Keyboard event listener functions
    const keyboard = scrawl.makeKeyboardZone({

        zone: canvas,

        shiftOnly: {
            Backspace: () => clearSelectedEntitys(),
            Enter: () => keyboardSelectEntity(),
            ArrowLeft: () => keyboardPositionEntity('left'),
            ArrowUp: () => keyboardPositionEntity('up'),
            ArrowRight: () => keyboardPositionEntity('right'),
            ArrowDown: () => keyboardPositionEntity('down'),
        },

        none: {
            Backspace: () => clearSelectedEntitys(),
            Enter: () => keyboardSelectEntity(),
            ArrowLeft: () => keyboardNavigateEntitys(true),
            ArrowRight: () => keyboardNavigateEntitys(false),
        },
    });


    // Drag-and-drop entitys
    const updateControllersDisplayOnStart = () => {

        keyboardEntitys.set({
            noFilters: true,
        });
        selectedEntitys.set({
            noFilters: true,
        });
        setCursorTo.grabbing();
    };

    const updateControllersDisplayOnEnd = () => {

        keyboardEntitys.set({
            noFilters: false,
        });
        selectedEntitys.set({
            noFilters: false,
        });
        setCursorTo.pointer();
    };

    // Keep the DOM entity editor's form synchronised with selected entity movement
    const enqueueDashboardUpdates = () => {

        if (selectedEntitys.artefacts.length === 1) {

            const name = selectedEntitys.artefacts[0];

            const artefact = selectedEntitys.getArtefact(name);

            const [startX, startY] = artefact.get('start');

            dashboard.queue.push({
                startX: Math.round(startX),
                startY: Math.round(startY),
            });
        }
    };


    // Drag entitys around the scene
    const entityNavigationDrag = scrawl.makeDragZone({
        zone: canvas,
        coordinateSource: cell,
        collisionGroup: cell.name,
        endOn: ['up', 'leave'],
        preventTouchDefaultWhenDragging: true,
        updateOnStart: updateControllersDisplayOnStart,
        updateOnEnd: () => {
            updateControllersDisplayOnEnd();
            enqueueDashboardUpdates();
        },
        processingOrder: 100,
    });


    // Show the DOM entity editor's initial message
    dashboard.refresh(selectedEntitys, updateControllersDisplayOnEnd);


    // #### Cleanup and return
    const killEntityNavigation = () => {
        selectedEntitys.kill(true);
        keyboardEntitys.kill(true);
        cascade();
        entityNavigationDrag();
        keyboard.kill();
    };

    // Return object
    return {
        selectedEntitys,
        addControllerAttributes,
        removeControllerAttributes,
        checkForEntityNavigationHoverActions: () => canvas.checkHover(),
        updateControllerDisplay: {
            onStart: updateControllersDisplayOnStart,
            onEnd: updateControllersDisplayOnEnd,
            setCursorTo,
        },
        killEntityNavigation,
    };
};


// #### Export
export {
    initializeEntityNavigation,
};
