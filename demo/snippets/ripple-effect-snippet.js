// # Demo Snippets 003
// DOM element snippet - test canvas adaption to local element variations
//
// Related files:
// + [DOM element snippets - main module](../snippets-003.html)
//
// ### 'Ripple effect' snippet
// __Purpose:__ replicate the Material design 'ripple effect' when user clicks on an element decorated with this snippet.
// __Function input:__ 
// + the DOM element, or a handle to it, as the first argument.
// + an optional key:value Object as the second argument
//
// __Function output:__ 
// ```
// {
//     element           // wrapper
//     canvas            // wrapper
//     animation         // object
//     demolish          // function
// }
// ```
// ##### Usage example:
// ```
// import ripples from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
//
// myElements.forEach(el => ripples(el, {
//   backgroundColor: 'red',
//   rippleColor: 'pink',
// }));
// ```

// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../../source/scrawl.js';


// __Effects on the element:__ 
// + The DOM element's background color will be brought into the canvas, with the element's backgroundColor set to `transparent` - any background image, gradient, etc will be hidden by the snippet effect
export default function (el, args = {}) {

    // The snippet will accept an optional key:value Object as the second argument
    // + __rippleColor__ - default: `white`
    // + __backgroundColor__ - default: false (will use the DOM element's background-color style)
    let backgroundColor = args.backgroundColor || false,
        rippleColor = args.rippleColor || 'white';

    // Apply the snippet to the DOM element
    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        // Set some convenience variables
        let canvas = snippet.canvas,
            wrapper = snippet.element,
            styles = wrapper.elementComputedStyles,
            name = wrapper.name;

        // Transfer the DOM element's current background-color style over to the canvas
        // + This does not handle situations where the DOM element has a gradient assigned to it
        // + if the function is invoked with the backgroundColor attribute set in the args Object, that color will replace the DOM element's current background color
        if (!backgroundColor) backgroundColor = styles.backgroundColor;

        // We don't want a transparent background - default to beige!
        if ('rgba(0, 0, 0, 0)' === backgroundColor || 'transparent' === backgroundColor || '#00000000' === backgroundColor || '#0000' === backgroundColor) backgroundColor = 'beige';

        canvas.set({
            backgroundColor,
        })        
        wrapper.domElement.style.backgroundColor = 'transparent';
 
        // We add an event listener to the DOM element
        let clickAction = (e) => {

            let {x, y, active} = canvas.here;

            if (active) {

                // Implement the ripple effect using a run-once-and-die tween operating on a create-and-destroy Wheel entity
                let r = scrawl.makeWheel({
                    name: `${name}-ripple`,
                    start: [x, y],
                    group: canvas.base.name,
                    handle: ['center', 'center'],
                    radius: '100%',
                    fillStyle: rippleColor,
                });

                scrawl.makeTween({
                    name: `${name}-tween`,
                    targets: r,
                    duration: 1000,
                    completeAction: () => r.kill(),
                    killOnComplete: true,
                    definitions: [
                        {
                            attribute: 'scale',
                            start: 0,
                            end: 1,
                        }, {
                            attribute: 'globalAlpha',
                            start: 1,
                            end: 0,
                        }
                    ],
                }).run();
            }
        };
        scrawl.addNativeListener(['click', 'touchend'], clickAction, el);
    }
    return snippet;
};

console.log(scrawl.library);
