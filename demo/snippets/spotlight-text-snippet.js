// # Demo Snippets 001
// Scrawl-canvas DOM element snippets
//
// Related files:
// + [DOM element snippets - main module](../snippets-001.html)
// + [Spotlight text snippet](./spotlight-text-snippet.html)
// + [Jazzy button snippet](./jazzy-button-snippet.html)
// + [Page performance snippet](./page-performance-snippet.html)
//
// ###  Snippet definitions
// Snippet definitions are functions that take a DOM element and manipulate it to supply it with additional functionality, including the ability to add Scrawl-canvas displays and animations to the DOM element
//
// Example of how a Javascript module can import and use a snippet definition:
// ```
// import scrawl from '../relative/or/absolute/path/to/scrawl.js';
// import { mySnippet } from './relative/or/absolute/path/to/snippet/definition/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
// myElements.forEach(el => mySnippet(el));
// ```
//
// Snippet definition functions can be written in any way the developer sees fit - a developer could write a snippet definition so that it:
// + can accept additional data to help further personalize how the snippet gets built
// + visits remote APIs to gather additional data as part of the snippet build
// + holds local state for the snippet
// + supplies a return object, class instance or function containing handles to the objects built by the definition, or functions for manipulating the Scrawl-canvas assets, artefacts, styles, animation(s) and/or canvas built by the definition (a 'mini-API' for each snippet)
// + etc...
//
// At a minimum, a snippet definition function will need to take a DOM element (or a pointer to it) as an argument. Note that Scrawl-canvas will manipulate the element in the following ways to make it work as a snippet:
// + the element's CSS 'position' value, if set to 'static' (the default value), will change to either 'relative' or 'absolute' - this is required to get any added canvas to _stick to_ its element in the final display
// + it will also be given a unique Scrawl-canvas identifier in a new __data-scrawl-name__ attribute on the element
// + the new &lt;canvas> element will be added to the element as its _first child_; the canvas will be absolutely positioned within the element
// + Scrawl-canvas will also add a hidden _text-hold_ &lt;div> element immediately after the canvas element - this is where Scrawl-canvas keeps dynamic text (for assistive technology)
// + by default, the canvas is built so that it displays beneath the element, using a lower z-index CSS property on the canvas element (compared to the host's z-index value)
// + the new canvas's dimensions will include the element's padding and border as well as its content
//
// For the sake of fellow developers, each snippet definition function should come with some documentation to explain:
// + the purpose and usage of the snippet that the definition function will deliver/render
// + any effects (beyond those explained above) that snippetization will have on the DOM element and any child elements it may contain
// + what input the function requires, and in what format and argument order
// + what - if anything - the definition function will return
//
// Each of the following snippet definition functions could live in its own file; we can also bundle snippets together so that related snippets can be imported into another Javascript module using a single __import__ statement in that file
//
// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import scrawl from '../../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// ### 'Spotlight text' snippet
//
// __Purpose:__ adds a spotlight effect to an element. When the user hovers the mouse over the element, a 'spotlight' gradient will track the mouse's movements.
//
// __Function input:__ 
// + the DOM element, or a handle to it, as the first argument.
// + an optional key:value Object as the second argument
//
// __Function output:__ a Javascript object will be returned, containing the following attributes
// ```
// {
//     element     // the Scrawl-canvas wrapper for the DOM element supplied to the function
//     canvas      // the Scrawl-canvas wrapper for the snippet's canvas
//     animation   // the Scrawl-canvas animation object
//     demolish    // remove the snippet from the Scrawl-canvas library
// }
// ```
// ##### Usage example:
// ```
// import spotlightText from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
//
// myElements.forEach(el => spotlightText(el));
// ```
// __Effects on the element:__ 
// + no additional effects on the DOM element
// + setting any background fill on the DOM element will hide the snippet canvas, unless it is deliberately brought forward
export default function (el, args = {}) {

    // The snippet will accept an optional key:value Object as the second argument
    // + __spotlightColor__ - default: `white`
    // + __backgroundColor__ - default: `lightgray`
    let spotlightColor = args.spotlightColor || 'white',
        backgroundColor = args.backgroundColor || 'lightgray';


    // Apply the snippet to the DOM element
    let snippet = scrawl.makeSnippet({

        // (__required__) The DOM element we are about to snippetize
        domElement: el,

        // (__optional__) An array of animation hook functions with the following attributes
        // + `commence` - for an preparatory work required before the display cycle kicks off
        // + `afterClear` - runs between the 'clear' and 'compile' stages of the display cycle
        // + `afterCompile` - runs between the 'compile' and 'show' stages of the display cycle
        // + `afterShow` - for any cleanup work required after the display cycle completes
        // + `error` - a function to run when an error in the display cycle occurs
        // 
        // For this snippet, we'll define and add an animation hook function after the animation object has been created
        animationHooks: {},

        // (__optional__) Options we can supply for the [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). Defaults are usually good enough; changing the 'threshold' value is probably the most useful option to play with
        observerSpecs: {},

        // (__optional__ - default: true) Scrawl-canvas snippets don't have to include a canvas!
        includeCanvas: true,

        // (__optional__, and only useful if we are including a canvas) - canvas-specific options. The most useful attribute is (probably) __fit__, whose value can be one of: `contain`, `cover`, `fill`, or `none` (the default value)
        canvasSpecs: {},
    });

    // NOTE: makeSnippet() defines its own __afterClear__ animation hook
    // + the functionality is to keep the canvas properly aligned and sized with its DOM element
    // + overwriting this hook here will lose that functionality!
    // + instead, use the __commence__ animation hook for all display cycle preparations
    //
    // Once the snippet is built, we can supply values to our previously defined variables
    if (snippet) {

        // Set some convenience variables
        let canvas = snippet.canvas,
            animation = snippet.animation,
            wrapper = snippet.element,
            name = wrapper.name;

        canvas.setAsCurrentCanvas();

        // Define the gradient
        let spotlightGradient = scrawl.makeRadialGradient({

            name: `${name}-gradient`,
            startX: '50%',
            startY: '50%',
            endX: '50%',
            endY: '50%',
            endRadius: '20%',
        })
        .updateColor(0, spotlightColor)
        .updateColor(999, backgroundColor);

        // This animation hook uses the variables and gradient we defined above
        animation.commence = function () {

            let active = false;

            return function () {

                if (canvas.here.active !== active) {

                    active = canvas.here.active;

                    // The block entity swaps between the gradient and a color fill, dependent on user interaction
                    block.set({
                        lockTo: (active) ? 'mouse' : 'start',
                        fillStyle: (active) ? spotlightGradient : backgroundColor,
                    });
                }
            };
        }();

        // Define the block which will (sometimes) display our spotlingt gradient
        let block = scrawl.makeBlock({

            name: `${name}-spotlight`,
            width: '200%',
            height: '200%',

            startX: "50%",
            startY: "50%",
            handleX: "50%",
            handleY: "50%",

            fillStyle: backgroundColor,
            lockFillStyleToEntity: true,

            method: 'fill', 
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
};
