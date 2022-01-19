// # Demo DOM 001
// Loading the scrawl-canvas library using a script tag in the HTML code

// [Run code](../../demo/dom-001.html)


// #### Imports
// Import Scrawl-canvas. It will auto-initialize the page as soon as it loads.
import {
    library as L,
    makeAnimation,
    render,
} from '../source/scrawl.js';


// #### Scene setup
// Define some demo variables. All Scrawl-canvas wrappers for DOM elements can be found in the __scrawl.library.artefact__ section of the Scrawl-canvas library. The elements themselves are held in the __domElement__ attribute of the wrapper. 
let artefact = L.artefact,
    myStack = artefact.mystack,
    report = artefact.reportmessage;


// Scrawl-canvas stack elements calculate the positions and dimensions of their member artefacts on the assumption that the stack element itself has no padding. If the element does include padding then all member artefacts will be offset (rightwards and downwards) by the left and top padfding values.
//
// Stack element padding can be set to zero either using regular CSS, or programatically as shown below.
//
// TODO: fix this - it's very annoying!
myStack.set({
    css: {
        padding: 0
    }
});


// Position and size the report &lt;div> element, which is where we will be displaying details about the stack.
//
// Note that moving this div element will leave a gap at the top of the stack. The positions and dimensions of Stack member artefacts (in other words, all immediate child elements of the stack element) are calculated when Scrawl-canvas initializes, before Scrawl-canvas updates their CSS position value to "absolute". Thus moving the report div downwards will not trigger a DOM redraw/reflow action
report.set({
    startY: '50%',
    width: '91.5%',
    height: 'auto'
});


// #### Scene animation
// The animation loop updates the output with details of the stack's dimensions and positioning, and details of the mouse cursor's position in relation to the stack's top-left hand corner.
//
// Much of the data required for the information panel is contained in the stack wrapper's __here__ object. This data is updated every time Scrawl-canvas detects some sort of user interaction such as a mouse/pointer cursor movement, page scrolling, or when the browser window resizes.
makeAnimation({


    // Giving the animation object a name will make it easy to find in the Scrawl-canvas library object
    name: 'demo-animation',

    // Every animation object must include a __fn__ function attribute which ___MUST___ return a Promise object - even if the functionality within the function is entirely synchronous. 
    //
    // This is because some animation functions (for instance: canvas filters) rely on web workers to speed up their calculations which are - by definition - asynchronous. The promise should resolve as true if all is well; false otherwise
    fn: function () {

        render()

        let here = myStack.here || {};

        reportmessage.textContent =  `File dom-001.js has loaded successfully
   Stack name: ${myStack.name} - width: ${here.w}, height: ${here.h}
   Interaction type: ${here.type} - active: ${here.active}
   Current cursor coordinates - x: ${here.x}, y: ${here.y} 
   Current stack normals values - x: ${here.normX.toFixed(4)}, y: ${here.normY.toFixed(4)}`;
    }
});


// #### Development and testing
// Because the code has been loaded as a __module__, Scrawl-canvas attributes and functions do not get added to the global namespace. For development work, we can overcome this issue (to a small extent) by console logging the scrawl library, so we can check internal attribute values and calculation results.
console.log(L);

// A more interactive method is to assign the scrawl object to a window global variable - this then allows us to access all of the objects created by Scrawl-canvas and interact with them in the browser console:
//
// ```
// // In the .js module file
// window.scrawl = scrawl;
//
// // In the browser console
// let b = scrawl.makeBlock({ ...etc... });
// b.set({ ... etc ... });
//
// let a = scrawl.library.artefact['my-artefact'];
// a.set({ ... etc ... })
// ```
