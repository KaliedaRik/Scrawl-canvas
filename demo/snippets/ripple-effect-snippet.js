// # Demo Snippets 003
// DOM element snippet - test canvas adaption to local element variations
//
// Related files:
// + [DOM element snippets - main module](../snippets-003.html)
//
// ### 'Ripple effect' snippet
// __Purpose:__ replicate the Material design 'ripple effect' when user clicks on an element decorated with this snippet.
// __Function input:__ 
// + any block-displayed DOM element
// + a Javascript object containing key:value pairs defining the canvas ___backgroundColor___ (default: 'beige') and the ___rippleColor___ (default: 'white')
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
// import { ripples } from './relative/or/absolute/path/to/this/file.js';
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
import scrawl from '../../source/scrawl.js';


// __Effects on the element:__ no additional effects.
export default function (el, args = {}) {

    let backgroundColor = args.backgroundColor || false,
        rippleColor = args.rippleColor || 'white';

    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        let canvas = snippet.canvas,
            wrapper = snippet.element;

        // Transfer the DOM element's current background-color style over to the canvas
        // + This does not handle situations where the DOM element has a gradient assigned to it
        // + if the function is invoked with the backgroundColor attribute set in the args Object, that color will replace the DOM element's current background color
        canvas.set({
            backgroundColor: backgroundColor || wrapper.elementComputedStyles.backgroundColor,
        })        
        wrapper.domElement.style.backgroundColor = 'transparent';
 
        let clickAction = (e) => {

            let {x, y, active} = canvas.here;

            if (active) {

                // Implement the ripple effect using a run-once-and-die tween operating on a create-and-destroy Wheel entity
                // + We're not bothering to name these Scrawl-canvas objects because they're both short-lived and clean up after themselves when we invoke their kill functions
                // + We do need to be explicit about the entity's group, otherwise all the entitys will end up in the last DOM element processed by the calling code
                let r = scrawl.makeWheel({
                    start: [x, y],
                    group: canvas.base.name,
                    handle: ['center', 'center'],
                    radius: '100%',
                    fillStyle: rippleColor,
                });

                scrawl.makeTween({
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
        scrawl.addNativeListener('click', clickAction, el);
    }
    return snippet;
};

console.log(scrawl.library);
