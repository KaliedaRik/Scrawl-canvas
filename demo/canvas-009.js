// # Demo Canvas 009 
// Pattern styles; Entity web link anchors; Dynamic accessibility

// [Run code](../../demo/canvas-009.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed, killArtefactAndAnchor, killStyle } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Google Analytics
// We load GA code in the normal way through markup in the dom-006.html file (lines 11-21), and get a handle on the __ga__ object here
let ga = window[window['GoogleAnalyticsObject'] || 'ga'],
    myTracker;

// Create a new tracker to handle tween and ticker action/progress, and set some attributes on it. 
ga('create', 'UA-000000-0', 'auto', 'demoCanvasTracker');

// We can then incorporate the tracker's functionality in our various hook functions defined further down in this script
ga(function() {

    let ga = window[window['GoogleAnalyticsObject'] || 'ga'];

    myTracker = ga.getByName('demoCanvasTracker');
    myTracker.set('transport', 'beacon');
    myTracker.set('campaignKeyword', 'Scrawl-canvas demo');

    // Comment out the next line to send tracker packets (so they show up in the console)
    myTracker.set('sendHitTask', null);
});


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Get images from DOM
scrawl.importDomImage('.mypatterns');


// Create Pattern styles using imported images
scrawl.makePattern({

    name: 'brick-pattern',
    asset: 'brick',

}).clone({

    name: 'leaves-pattern',
    asset: 'leaves',

});

// Create Pattern styles dynamically
scrawl.makePattern({

    name: 'water-pattern',
    imageSource: 'img/water.png',

}).clone({

    name: 'marble-pattern',
    imageSource: 'img/marble.png',

});

// Create a canvas-based Cell pattern
canvas.buildCell({

    name: 'cell-pattern',

    width: 50,
    height: 50,

    backgroundColor: 'lightblue',

    shown: false,
    useAsPattern: true,
});

canvas.base.set({

    compileOrder: 1,
});

// Create a Block entity to display in the new Cell pattern
scrawl.makeBlock({

    name: 'cell-pattern-block',
    group: 'cell-pattern',

    width: 40,
    height: 40,

    startX: 'center',
    startY: 'center',

    handleX: 'center',
    handleY: 'center',

    method: 'fill',

    fillStyle: 'water-pattern',

    delta: {
        roll: -0.3
    },
});


// Main canvas display - create Block entitys which will use the patterns defined above
scrawl.makeBlock({

    name: 'water-in-leaves',
    group: canvas.base.name,

    width: '40%',
    height: '40%',

    startX: '25%',
    startY: '25%',

    handleX: 'center',
    handleY: 'center',

    lineWidth: 20,
    lineJoin: 'round',

    method: 'fillThenDraw',

    fillStyle: 'cell-pattern',
    strokeStyle: 'leaves-pattern',

    shadowOffsetX: 5,
    shadowOffsetY: 5,
    shadowBlur: 3,
    shadowColor: 'black',

    // Include an anchor (href) link which can be tied to user interaction (in this case, mouse clicks on the canvas element) through events defined further down in this script.

    // ALWAYS include a description! We will be using the anchor's description string later as part of our asistive technology solution for this demo.
    anchor: {
        name: 'wikipedia-water-link',
        href: 'https://en.wikipedia.org/wiki/Water',
        description: 'Link to the Wikipedia article on water (opens in new tab)',

        // The clickAction attribute captures both Scrawl-canvas trigger clicks and also non-mouse 'clicks' on the anchor element hidden at the top of the web page, for example using the keyboard (tab, return) or other assistive technology.

        // The function returns a string which Scrawl-canvas will add to the anchor's 'onclick' attribute when it creates the anchor element dynamically and adds it to the DOM.
        clickAction: function () {

            return `ga('demoCanvasTracker.send', 'event', 'Outbound link', 'click', '${this.href}')`;
        },

        // Include focus and blur actions, which will trigger the onEnter and onLeave functions (below) for visitors using non-mouse/touch navigation (for example: keyboard tabbing)
        focusAction: true,
        blurAction: true,
    },

    // Accessibility functionality to be used by event functions defined below in response to user activity - this time moving the mouse cursor across the &lt;canvas> element. Note that 'this' refers to the entity object, meaning the functions can be safely cloned into other entitys.
    onEnter: function () {

        // Update the block entity's visual display
        this.set({
            lineWidth: 30,
        });

        // This is where we update the accessibility information tied to the canvas element. We're using the anchor attribute object's description value to supply details of what actions will happen when the user clicks on the canvas while the mouse is over the block entity.
        canvas.set({
            title: `${this.name} tile`,
            label: this.get('anchorDescription'),
        });

        // Track the action in Google Analytics
        myTracker.send('event', 'Canvas Entity', 'hover start', `${this.name} ${this.type}`);
    },

    onLeave: function () {

        // Reset the block entity's visual display
        this.set({
            lineWidth: 20,
        });

        // Reset the accessibility information tied to the canvas element.
        canvas.set({
            title: '',
            label: `${canvas.name} canvas element`,
        });

        // Track the action in Google Analytics
        myTracker.send('event', 'Canvas Entity', 'hover end', `${this.name} ${this.type}`);
    },

    // Used by the Scrawl-canvas click event, below. This hit report will only be generated from user interaction on the canvas element, thus will supply different numbers to the anchor's clickAction function above - a useful way to help calculate the volume of users bypassing the canvas and opening the Wikipedia page using the keyboard or assistive technology
    onUp: function () {

        // Track the action in Google Analytics
        myTracker.send('event', 'Canvas Entity Link', 'click', `${this.name} ${this.type} ${this.anchor.href}`);

        // Trigger the click event on the anchor element we added to the DOM
        this.clickAnchor();
    },

}).clone({

    name: 'leaves-in-brick',

    startX: '75%',

    fillStyle: 'leaves-pattern',
    strokeStyle: 'brick-pattern',

    anchor: {
        name: 'wikipedia-leaf-link',
        href: 'https://en.wikipedia.org/wiki/Leaf',
        description: 'Link to the Wikipedia article on leaves (opens in new tab)',
    },

}).clone({
    
    name: 'brick-in-marble',

    startY: '75%',

    fillStyle: 'brick-pattern',
    strokeStyle: 'marble-pattern',

    anchor: {
        name: 'wikipedia-brick-link',
        href: 'https://en.wikipedia.org/wiki/Brick',
        description: 'Link to the Wikipedia article on bricks (opens in new tab)',
    },

}).clone({
    
    name: 'marble-in-water',

    startX: '25%',

    fillStyle: 'marble-pattern',
    strokeStyle: 'water-pattern',

    anchor: {
        name: 'wikipedia-marble-link',
        href: 'https://en.wikipedia.org/wiki/Marble',
        description: 'Link to the Wikipedia article on marble (opens in new tab)',
    },
});


// Demonstrate zoned actions on a canvas element as a result of user interaction
// + Available cascadeEventAction arguments are: 'enter', 'leave', 'down', or 'up'
// + Also, the 'move' argument will trigger enter and leave actions on the entitys, as appropriate to each
//
// In this case, moving the mouse cursor over a block entity will increase its line width, as specified in the __onEnter__ and __onLeave__ functions in the block factories above. 
//
// Additionally, it will update the &lt;canvas> element's title attribute (for tool tips) and its ARIA label value (for accessibility)
//
// The cascadeEventAction function returns an Array of name Strings for the entitys at the current mouse cursor coordinates 
let interactionResults = '';
let interactions = function () {

    if (canvas.here.active) interactionResults = canvas.cascadeEventAction('move');
    else interactionResults = '';
};
scrawl.addListener('move', interactions, canvas.domElement);

// To capture other user interaction with the &lt;a> DOM elements which, while being visually hidden, are still accessible - for instance when a user keyboard-tabs through the web page
//
// In this case, clicking on one of the tiles will open a related Wikipedia page in a new browser tab - as defined in the  __onUp__ function in the block factories above
let mylinks = function () {

    if (canvas.here.active) canvas.cascadeEventAction('up');
};
scrawl.addListener('up', mylinks, canvas.domElement);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
    return `Hits: ${interactionResults}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);

console.log('Performing tests ...');

// We use the __canvas__ and __myTracker__ variables in our blocks' onEnter, onLeave and onUp functions. While this works fine for the blocks created in the scope of this module file's code, it will fail when we kill and resurrect a block - in the resurrected block the canvas and myTracker variables will be 'undefined'. So we need to reset the block's 'on...' functions (in this module file's code) after the block has resurrected
killArtefactAndAnchor(canvas, 'brick-in-marble', 'wikipedia-brick-link', 2000, () => {

    scrawl.library.artefact['brick-in-marble'].set({

        onEnter: function () {
            this.set({ lineWidth: 30 });
            canvas.set({
                title: `${this.name} tile`,
                label: this.get('anchorDescription'),
            });
            myTracker.send('event', 'Canvas Entity', 'hover start', `${this.name} ${this.type}`);
        },
        onLeave: function () {
            this.set({ lineWidth: 20 });
            canvas.set({
                title: '',
                label: `${canvas.name} canvas element`,
            });
            myTracker.send('event', 'Canvas Entity', 'hover end', `${this.name} ${this.type}`);
        },
        onUp: function () {
            myTracker.send('event', 'Canvas Entity Link', 'click', `${this.name} ${this.type} ${this.anchor.href}`);
            this.clickAnchor();
        },
    });
});

killStyle(canvas, 'marble-pattern', 3000, () => {

    // Reset entitys, whose fill/strokeStyles will have been set to default values when the Pattern died
    scrawl.library.entity['brick-in-marble'].set({
        strokeStyle: 'marble-pattern',
    });

    scrawl.library.entity['marble-in-water'].set({
        fillStyle: 'marble-pattern',
    });
});

