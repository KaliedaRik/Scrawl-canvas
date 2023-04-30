// # Demo Modules 005
// Accessible GUI-based simple canvas editor
//
// Related files:
// + [Accessible GUI-based simple canvas editor - main demo](../modules-005.html)
//
// #### Usage
// This module coordinates the setting up of a basic GUI-based editor of a SC scene. Once run, it returns (among other things) a Cell wrapper (created in a sub-module) which we can use to host the entitys to be used in the scene. To help edit the scene, it gives us:
// + A moveable, responsive minimap which we can use to navigate around the Cell
// + Drag-drop functionality for the entitys defined as part of the Cell
// + The ability to select an entity, or a group of entitys, for editing
// + A simple GUI control which users can use to move, rotate and scale the selected entity or group of entitys
// + Full accessibility via a set of keyboard commands to move, rotate and/or scale the selected entitys, the GUI control and the minimap
// + When an entity, or group of entitys, are selected for editing, a keyboard accessible form will appear which allows users to edit a comprehensive subset of that entity's attributes
// + Cut|Copy|Paste functionality for selected entitys using keyboard `CTRL + X`, `CTRL + C`, `CTRL + V` keystrokes
//
// __Inputs to the `initializeCanvasSceneEditor` function__
// + `sceneCanvas` - SC canvas wrapper object (required)
// + `domEntityEditor` - CSS query string to locate the DOM element where the entity editor form will appear (required)
// + `sceneDimensions` - a Number, or an array of `[width, height]` Numbers, setting the size of the scene Cell which will be returned to the calling code (default: 1600)
// + `minimapDimensions` - a Number, or an array of `[width, height]` Numbers, setting the size of minimap that appears on the scene Cell (default: 200)
//
// __Output from the `initializeCanvasSceneEditor` function__ - is an object containing the following attributes:
// + `animation` - the scene editor's animation object
// + `sceneLayer` - the scene Cell wrapper object
// + `addControllerAttributes` - an object containing attributes that need to be added to entitys which will be controlled by the scene editor
// + `setGuiControlChars` - a function to allow users to map keyboard action keys to better suit their preferred keyboard layout
// + `killSceneEditor` - kill function, to remove everything associated with the scene editor from the SC library


// #### Import required sub-modules
import { initializeMinimap } from './canvas-minimap.js'
import { initializeDomEntityEditor } from './dom-entity-editor.js'
import { initializeEntityNavigation } from './entity-navigation.js'
import { initializeEntityManipulationGui } from './entity-manipulation-gui.js'
import { initializeEntityCopyPaste } from './entity-copy-paste.js'


// #### Initialization function (exported)
const initializeCanvasSceneEditor = (items = {}, scrawl) => {


    // Check we have required arguments/values
    const { sceneCanvas, domEntityEditor, sceneDimensions, minimapDimensions } = items;

    if (scrawl == null) throw new Error('SC entity manipulation GUI module error: missing Scrawl-canvas object argument');

    let argsCheck = '';

    if (sceneCanvas == null) argsCheck += ' Scene canvas wrapper;';
    if (domEntityEditor == null) argsCheck += ' DOM entity editor CSS query string;';

    if (argsCheck.length) throw new Error(`SC entity manipulation GUI module error: missing arguments${argsCheck}`);


    // #### Build the editor
    // This is mostly plumbing work, making sure each sub-module gets the right attributes they need
    // + Because some sub-modules require access to objects/functionality supplied by other sub-modules, the order in which we initialize the modules becomes important
    //
    // Initialize minimap
    // + Adds a minimap to our scene, which can be drag/dropped and controlled via keyboard
    // + Returns a new Cell wrapper, which we can supply to the entity navigation module
    // + Supplies a function which will adapt the minimap display during responsive canvas resizing
    const {
        mainCell,
        checkForMinimapChanges,
        killCanvasMinimap,

    } = initializeMinimap({
        canvas: sceneCanvas,
        mainDimensions: sceneDimensions,
        mapDimensions: minimapDimensions,
    }, scrawl);


    // Initialize DOM entity editor functionality
    // + Will build HTML on a per-entity or group basis, which can be displayed in our dashboard element
    // + Returns an object containing functions that we can supply to the entity navigation module, where all the work happens
    const {
        dashboard,
        killDomEntityEditor,

    } = initializeDomEntityEditor({
        queryString: domEntityEditor,
    }, scrawl);


    // Initialize entity navigation
    // + Adds ability to navigate/select entitys using mouse or keyboard
    // + Adds ability to move selected entitys using mouse or keyboard
    // + Supplies a set of objects to be added to entitys that should include this functionality
    // + Opens up access to selected entitys via an array
    const {
        selectedEntitys,
        addControllerAttributes,
        checkForEntityNavigationHoverActions,
        updateControllerDisplay,
        killEntityNavigation,

    } = initializeEntityNavigation({
        canvas: sceneCanvas,
        cell: mainCell,
        dashboard,
    }, scrawl);


    // Initialize entity manipulation GUI
    // + Builds the GUI editor controls that appear on the canvas when a user selects one or more entitys for editing
    const {
        checkForSelectionUpdates,
        setGuiControlChars,
        createGui,
        killEntityManipulationGui,

    } = initializeEntityManipulationGui({
        canvas: sceneCanvas,
        cell: mainCell,
        selectedEntitys,
        dashboard,
        updateControllerDisplay,
    }, scrawl);


    // Initialize entity copy-paste
    // + Builds the GUI editor controls that appear on the canvas when a user selects one or more entitys for editing
    const {
        killEntityCopyPaste,

    } = initializeEntityCopyPaste({
        canvas: sceneCanvas,
        selectedEntitys,
        addControllerAttributes,
        updateControllerDisplay,
        dashboard,
        createGui,
    }, scrawl);


    // #### Scene animation
    // Create the Display cycle animation
    const animation = scrawl.makeRender({
        name: 'canvas-scene-editor-animation',
        target: sceneCanvas,
        commence: () => {
            checkForMinimapChanges();
            checkForSelectionUpdates();
            dashboard.update(selectedEntitys);
        },
        afterShow: checkForEntityNavigationHoverActions,
    });


    // #### Cleanup and return
    // For the kill/cleanup sequence, we run through the module kill functions in the reverse order in which we created them
    const killSceneEditor = () => {
        killEntityCopyPaste();
        killEntityManipulationGui();
        killEntityNavigation();
        killDomEntityEditor();
        killCanvasMinimap();
    };

    // Return object
    return {
        animation,
        sceneLayer: mainCell,
        addControllerAttributes,
        setGuiControlChars,
        killSceneEditor,
    };
};


// #### Export
export {
    initializeCanvasSceneEditor,
};
