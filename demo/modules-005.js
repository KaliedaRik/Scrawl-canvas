// # Demo Modules 005
// Accessible GUI-based simple canvas editor

// [Run code](../../demo/modules-005.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

import { initializeCanvasSceneEditor } from './modules/canvas-scene-editor.js';


// #### Scene setup
const sceneCanvas = scrawl.library.canvas['scene-canvas'];
const historyCanvas = scrawl.library.canvas['history-canvas'];

sceneCanvas.set({
    label: 'A demonstration of a simple design system.',
    description: 'The entitys in this canvas can be positioned, sized, copied and styled using mouse UI and keyboard input.',
});


// #### Create the editor
const {
    killSceneEditor,
    sceneLayer,
    addControllerAttributes,
    setGuiControlChars,

} = initializeCanvasSceneEditor({
    sceneCanvas, 
    historyCanvas, 
    domEntityEditor: '#scene-canvas-dahsboard',
    sceneDimensions: 1000,
}, scrawl);


// #### Build initial scene
const getRandomPosition = () => {

    const x = Math.floor(Math.random() * 800) + 100;
    const y = Math.floor(Math.random() * 800) + 100;

    return [x, y];
}
// Add some entitys that we want to control
scrawl.makeBlock({

    name: 'block-entity-1',
    group: sceneLayer.name,
    start: getRandomPosition(),
    handle: ['center', 'center'],
    dimensions: [100, 50],
    fillStyle: 'blue',
    lineWidth: 3,
    strokeStyle: 'orange',
    method: 'fillThenDraw',

    // The entity's hover, click and drag-drop functionality
    ...addControllerAttributes,

}).clone({

    name: 'block-entity-2',
    start: getRandomPosition(),

}).clone({

    name: 'block-entity-3',
    start: getRandomPosition(),

}).clone({

    name: 'block-entity-4',
    start: getRandomPosition(),
});

scrawl.makeWheel({

    name: 'wheel-entity-1',
    group: sceneLayer.name,
    start: getRandomPosition(),
    handle: ['center', 'center'],
    radius: 50,
    includeCenter: true,
    fillStyle: 'green',
    lineWidth: 3,
    strokeStyle: 'orange',
    method: 'fillThenDraw',
    ...addControllerAttributes,

}).clone({

    name: 'wheel-entity-2',
    start: getRandomPosition(),

}).clone({

    name: 'wheel-entity-3',
    start: getRandomPosition(),

}).clone({

    name: 'wheel-entity-4',
    start: getRandomPosition(),
});

scrawl.makePicture({

    name: 'picture-entity-1',
    group: sceneLayer.name,
    imageSource: 'img/iris.png',
    dimensions: [150, 150],
    start: getRandomPosition(),
    handle: ['center', 'center'],
    copyDimensions: ['100%', '100%'],
    copyStart: [0, 0],
    lineWidth: 4,
    strokeStyle: 'gold',
    method: 'drawThenFill',
    ...addControllerAttributes,

}).clone({

    name: 'picture-entity-2',
    start: getRandomPosition(),
});

scrawl.makePhrase({

    name: 'phrase-entity-1',
    group: sceneLayer.name,
    text: 'Hello',
    font: 'serif',
    size: '40px',
    lineHeight: 0,
    start: getRandomPosition(),
    handle: ['center', 'center'],
    ...addControllerAttributes,

}).clone({

    name: 'phrase-entity-2',
    start: getRandomPosition(),

}).clone({

    name: 'phrase-entity-3',
    start: getRandomPosition(),

}).clone({

    name: 'phrase-entity-4',
    start: getRandomPosition(),
});


// #### User interaction
// Most interaction is handled in the modules; the only thing we need to do here is give users the opportunity to update their keyboard character choices for manipulating the GUI controls
const button = document.querySelector('#update-keyboard-shortcuts-action');

const buttonClickAction = (e) => {

    const keys = window.prompt('To change the keyboard settings to move, scale and rotate selected entitys, enter the desired characters (11 in total) in the order MOVE-DELTA, MOVE-UP, MOVE-LEFT, MOVE-DOWN, MOVE-RIGHT, SCALE-DELTA, SCALE-GROW, SCALE-SHRINK, ROTATE-DELTA, ROTATE-CLOCKWISE, ROTATE-ANTI-CLOCKWISE (with no spaces or separating commas etc, though the comma key can be used as a shortcut). Character case will be ignored.', 'QWASDBNMGJH');
    
    setGuiControlChars(keys);
};

button.onclick = buttonClickAction;


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({
    name: "demo-animation",
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
