// # Demo Modules 005
// Accessible GUI-based simple canvas editor
//
// Related files:
// + [Accessible GUI-based simple canvas editor - main demo](../modules-005.html)
//


// #### Usage
// TODO: add documentation

import { initializeMinimap } from './canvas-minimap.js'
import { initializeDomEntityEditor } from './dom-entity-editor.js'
import { initializeEntityNavigation } from './entity-navigation.js'
import { initializeEntityManipulationGui } from './entity-manipulation-gui.js'
import { initializeEntityCopyPaste } from './entity-copy-paste.js'

const initializeCanvasSceneEditor = (items = {}, scrawl) => {


    // Check we have required arguments/values
    const { sceneCanvas, historyCanvas, domEntityEditor, sceneDimensions, minimapDimensions } = items;

    if (scrawl == null) throw new Error('SC entity manipulation GUI module error: missing Scrawl-canvas object argument');

    let argsCheck = '';

    if (sceneCanvas == null) argsCheck += ' Scene canvas wrapper;';
    if (historyCanvas == null) argsCheck += ' History canvas wrapper;';
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
    scrawl.makeRender({
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
    //
    // For the kill/cleanup sequence, we run through the module kill functions in the reverse order in which we created them
    const killSceneEditor = () => {
        killEntityCopyPaste();
        killEntityManipulationGui();
        killEntityNavigation();
        killDomEntityEditor();
        killCanvasMinimap();
    };

    return {
        killSceneEditor,
        sceneLayer: mainCell,
        addControllerAttributes,
        setGuiControlChars,
    };
};


// #### Export
export {
    initializeCanvasSceneEditor,
};
