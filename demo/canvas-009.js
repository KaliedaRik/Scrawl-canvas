// # Demo Canvas 009
// Pattern styles; Entity web link anchors; Dynamic accessibility

// [Run code](../../demo/canvas-009.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, killArtefactAndAnchor, killStyle } from './utilities.js';


// #### Google Analytics
// We load GA code in the normal way through markup in the dom-006.html file (lines 11-21), and get a handle on the __ga__ object here
const ga = window[window['GoogleAnalyticsObject'] || 'ga'];

let myTracker;

// Create a new tracker to handle tween and ticker action/progress, and set some attributes on it.
// + TS errors due to not importing/using GA types into the demo
/** @ts-expect-error */
ga('create', 'UA-000000-0', 'auto', 'demoCanvasTracker');

// We can then incorporate the tracker's functionality in our various hook functions defined further down in this script
/** @ts-expect-error */
ga(function() {

    const ga = window[window['GoogleAnalyticsObject'] || 'ga'];

/** @ts-expect-error */
    myTracker = ga.getByName('demoCanvasTracker');
    myTracker.set('transport', 'beacon');
    myTracker.set('campaignKeyword', 'Scrawl-canvas demo');

    // Uncomment the next line to suppress tracker packets (so they don't show up in the console)
    myTracker.set('sendHitTask', null);
});


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Get images from DOM
scrawl.importDomImage('.mypatterns');


// Create Pattern styles using imported images
scrawl.makePattern({

    name: name('brick-pattern'),
    asset: 'brick',

}).clone({

    name: name('leaves-pattern'),
    asset: 'leaves',

});

// Create Pattern styles dynamically
scrawl.makePattern({

    name: name('water-pattern'),
    imageSource: 'img/water.png',

}).clone({

    name: name('marble-pattern'),
    imageSource: 'img/marble.png',

});

// Create a canvas-based Cell pattern
canvas.buildCell({

    name: name('cell-pattern'),
    width: 50,
    height: 50,
    backgroundColor: 'lightblue',
    shown: false,
});

// Create a Block entity to display in the new Cell pattern
scrawl.makeBlock({

    name: name('cell-pattern-block'),
    group: name('cell-pattern'),

    width: 40,
    height: 40,

    startX: 'center',
    startY: 'center',

    handleX: 'center',
    handleY: 'center',

    method: 'fill',

    fillStyle: name('water-pattern'),

    delta: {
        roll: -0.3
    },
});


// Main canvas display - create Block entitys which will use the patterns defined above. Note that TS errors are due to:
// + Not importing/using GA types into the demo
// + TS not recognising that `this` refers to BlockInstance - it claims that `get`, `set`, `clickAnchor` etc functions don't exist on BlockFactoryInputs (which is true), but we're defining hook functions here. It can probably be fixed in the `d.ts` file, but I don't know how to do that ...
scrawl.makeBlock({

    name: name('water-in-leaves'),
    group: canvas.get('baseGroup'),

    width: '40%',
    height: '40%',

    startX: '25%',
    startY: '25%',

    handleX: 'center',
    handleY: 'center',

    lineWidth: 20,
    lineJoin: 'round',

    method: 'fillThenDraw',

    fillStyle: name('cell-pattern'),
    strokeStyle: name('leaves-pattern'),

    // To be aware: adding shadows to entitys using patterns for their fill and/or stroke styles can lead to a serious decrease in frame rate
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

        // This function gets invoked by an event listener added to the &lt;a> link element in the DOM. `this` refers to the element, not the SC anchor wrapper or the Block entity object. The `myTracker` object is not recognised by the link element (the object's scope is local to this module), so instead we fire the `ga` analytics object directly as that lives in the global space - see line 19 above.
        clickAction: function () {

/** @ts-expect-error */
            ga('demoCanvasTracker.send', 'event', 'Outbound link', 'click', this.href);
        },
    },

    // Accessibility functionality to be used by event functions defined below in response to user activity - this time moving the mouse cursor across the &lt;canvas> element. Note that 'this' refers to the entity object, meaning the functions can be safely cloned into other entitys.
    // + Scrawl-canvas TypeScript definitions don't (at this time) extend as far as identifying types within a function set up as part of an SC object instantiation; be prepared to include TS error suppression markup wherever justified (for instance, when using `this`).
    onEnter: function () {

        // Update the block entity's visual display
/** @ts-expect-error */
        this.set({
            lineWidth: 30,
        });

        // This is where we update the accessibility information tied to the canvas element. We're using the anchor attribute object's description value to supply details of what actions will happen when the user clicks on the canvas while the mouse is over the block entity.
        canvas.set({
/** @ts-expect-error */
            title: `${this.get('name')} tile`,
/** @ts-expect-error */
            label: this.get('anchorDescription'),
        });

        // Track the action in Google Analytics
/** @ts-expect-error */
        myTracker.send('event', 'Canvas Entity', 'hover start', `${this.name} ${this.type}`);
    },

    onLeave: function () {

        // Reset the block entity's visual display
/** @ts-expect-error */
        this.set({
            lineWidth: 20,
        });

        // Reset the accessibility information tied to the canvas element.
        canvas.set({
            title: '',
            label: `${canvas.name} canvas element`,
        });

        // Track the action in Google Analytics
/** @ts-expect-error */
        myTracker.send('event', 'Canvas Entity', 'hover end', `${this.name} ${this.type}`);
    },

    // Used by the Scrawl-canvas `click` event, below.
    // + This hit report will only be generated from user interaction on the canvas element, thus will supply different numbers to the anchor's clickAction function above - a useful way to help calculate the volume of users bypassing the canvas and opening the Wikipedia page using the keyboard or assistive technology
    onUp: function () {

        // Track the action in Google Analytics
/** @ts-expect-error */
        myTracker.send('event', 'Canvas Entity Link', 'click', `${this.name} ${this.type} ${this.get('anchorHref')}`);

        // Trigger the click event on the anchor element we added to the DOM
/** @ts-expect-error */
        this.clickAnchor();
    },

    // Used by the Scrawl-canvas `contextmenu` event, below.
    // + When the user right-clicks on a block, we want them to see the context menu for a link element, not an image element
    // + Sadly I don't know a good way to achieve this - creating a `contextmenu` Pointer event and dispatching it on the anchor's element associated with the block doesn't work for me
    // + Instead, the following functionality clones the anchor's element, styles and positions it, then adds it to the web page where user can (again) right-click on it to display the context menu
    // + We then destroy the cloned element after five seconds
    // + (If anyone has a better solution for this functionality, please create a PR!)
    onOtherInteraction: function (e) {

        e.preventDefault();

/** @ts-expect-error */
        const el = this.anchor.domElement;
        const clone = el.cloneNode(true);
        const style = clone.style;

        clone.id = `${el.id}_clone`;
        style.position = 'fixed';
        style.left = `${e.clientX}px`;
        style.top = `${e.clientY}px`;
        style.transform = 'translate(-50%, -50%)';
        style.backgroundColor = 'rgb(200 200 200)';
        style.padding = '4px';
        style.border = '1px solid black';
        style.borderRadius = '4px';

        document.body.append(clone);
        setTimeout(() => clone.remove(), 5000);
    },

}).clone({

    name: name('leaves-in-brick'),

    startX: '75%',

    fillStyle: name('leaves-pattern'),
    strokeStyle: name('brick-pattern'),

    anchor: {
        name: 'wikipedia-leaf-link',
        href: 'https://en.wikipedia.org/wiki/Leaf',
        description: 'Link to the Wikipedia article on leaves (opens in new tab)',
    },

}).clone({

    name: name('brick-in-marble'),

    startY: '75%',

    fillStyle: name('brick-pattern'),
    strokeStyle: name('marble-pattern'),

    anchor: {
        name: 'wikipedia-brick-link',
        href: 'https://en.wikipedia.org/wiki/Brick',
        description: 'Link to the Wikipedia article on bricks (opens in new tab)',
    },

}).clone({

    name: name('marble-in-water'),

    startX: '25%',

    fillStyle: name('marble-pattern'),
    strokeStyle: name('water-pattern'),

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
const interactionResults = [];
const interactions = function () {

    interactionResults.length = 0;
    if (canvas.here.active) interactionResults.push(...canvas.cascadeEventAction('move'));
};
scrawl.addListener('move', interactions, canvas.domElement);

// To capture other user interaction with the &lt;a> DOM elements which, while being visually hidden, are still accessible - for instance when a user keyboard-tabs through the web page
//
// In this case, clicking on one of the tiles will open a related Wikipedia page in a new browser tab - as defined in the  __onUp__ function in the block factories above
const mylinks = function () {

    if (canvas.here.active) canvas.cascadeEventAction('up');
};
scrawl.addNativeListener('click', mylinks, canvas.domElement);

// Handle a right-click `contextmenu` user interaction on a block
// + Note that the `otherInteraction` string was introduced with SC v8.14.0
// + An entity can have a maximum of one other interaction
// + The `cascadeEventAction` function can include the (mouse or pointer) event object as its second argument
const myLinksContextMenu = function (e) {

    if (canvas.here.active) canvas.cascadeEventAction('otherInteraction', e);
};
scrawl.addNativeListener('contextmenu', (e) => myLinksContextMenu(e), canvas.domElement);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
    return `Hits: ${interactionResults}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);

console.log('Performing tests ...');

// We use the __canvas__ and __myTracker__ variables in our blocks' onEnter, onLeave and onUp functions. While this works fine for the blocks created in the scope of this module file's code, it will fail when we kill and resurrect a block - in the resurrected block the canvas and myTracker variables will be 'undefined'. So we need to reset the block's 'on...' functions (in this module file's code) after the block has resurrected
killArtefactAndAnchor(scrawl, canvas, name('brick-in-marble'), 'wikipedia-brick-link', 2000, () => {

    scrawl.findArtefact(name('brick-in-marble')).set({

        onEnter: function () {
/** @ts-expect-error */
            this.set({ lineWidth: 30 });
            canvas.set({
                title: `${this.name} tile`,
/** @ts-expect-error */
                label: this.get('anchorDescription'),
            });
/** @ts-expect-error */
            myTracker.send('event', 'Canvas Entity', 'hover start', `${this.name} ${this.type}`);
        },
        onLeave: function () {
/** @ts-expect-error */
            this.set({ lineWidth: 20 });
            canvas.set({
                title: '',
                label: `${canvas.name} canvas element`,
            });
/** @ts-expect-error */
            myTracker.send('event', 'Canvas Entity', 'hover end', `${this.name} ${this.type}`);
        },
        onUp: function () {
/** @ts-expect-error */
            myTracker.send('event', 'Canvas Entity Link', 'click', `${this.name} ${this.type} ${this.anchor.href}`);
/** @ts-expect-error */
            this.clickAnchor();
        },
        onOtherInteraction: function (e) {
            e.preventDefault();
/** @ts-expect-error */
            const el = this.anchor.domElement;
            const clone = el.cloneNode(true);
            const style = clone.style;
            clone.id = `${el.id}_clone`;
            style.position = 'fixed';
            style.left = `${e.clientX}px`;
            style.top = `${e.clientY}px`;
            style.transform = 'translate(-50%, -50%)';
            style.backgroundColor = 'rgb(255 200 180)';
            style.padding = '4px';
            style.border = '1px solid black';
            style.borderRadius = '4px';
            document.body.append(clone);
            setTimeout(() => clone.remove(), 5000);
        },
    });
});

killStyle(scrawl, canvas, name('marble-pattern'), 3000, () => {

    // Reset entitys, whose fill/strokeStyles will have been set to default values when the Pattern died
    scrawl.findEntity(name('brick-in-marble')).set({
        strokeStyle: name('marble-pattern'),
    });

    scrawl.findEntity(name('marble-in-water')).set({
        fillStyle: name('marble-pattern'),
    });
});

