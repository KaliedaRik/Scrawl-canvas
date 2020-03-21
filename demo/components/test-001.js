// # Component definitions
// Component definitions are functions that take a DOM element and manipulate it to supply it with additional functionality, including the ability to add Scrawl-canvas displays and animations to the DOM element

// Example of how a Javascript module can import and use a component definition:
// ```
// import scrawl from '../relative/or/absolute/path/to/scrawl.js';
// import { myScrawlComponent } from './relative/or/absolute/path/to/component/definition/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
// myElements.forEach(el => myScrawlComponent(el));
// ```

// Component definition functions can be written in any way the developer sees fit - a developer could write a component definition so that it:
// + can accept additional data to help further personalize how the component gets built
// + visits remote APIs to gather additional data as part of the component build
// + holds local state for the component
// + supplies a return object, class instance or function containing handles to the objects built by the definition, or functions for manipulating the Scrawl-canvas assets, artefacts, styles, animation(s) and/or canvas built by the definition (a 'mini-API' for each component)
// + etc...

// At a minimum, a component definition function will need to take a DOM element (or a pointer to it) as an argument. Note that Scrawl-canvas will manipulate the element in the following ways to make it work as a component:
// + the element's CSS 'position' value, if set to 'static' (the default value), will change to either 'relative' or 'absolute' - this is required to get any added canvas to _stick to_ its element in the final display
// + it will also be given a unique Scrawl-canvas identifier in a new __data-scrawl-name__ attribute on the element
// + the new &lt;canvas> element will be added to the element as its _first child_; the canvas will be absolutely positioned within the element
// + Scrawl-canvas will also add a hidden _text-hold_ &lt;div> element immediately after the canvas element - this is where Scrawl-canvas keeps dynamic text (for assistive technology)
// + by default, the canvas is built so that it displays beneath the element, using a lower z-index CSS property on the canvas element (compared to the host's z-index value)
// + the new canvas's dimensions will include the element's padding and border as well as its content

// For the sake of fellow developers, each component definition function should come with some documentation to explain:
// + the purpose and usage of the component that the definition function will deliver/render
// + any effects (beyond those explained above) that componentization will have on the DOM element and any child elements it may contain
// + what input the function requires, and in what format and argument order
// + what - if anything - the definition function will return

// Each of the following component definition functions could live in its own file; we can also bundle components together so that related components can be imported into another Javascript module using a single __import__ statement in that file

// BOILERPLATE: import the Scrawl-canvas object - the path to the file will vary according to where in a particular site's server's directory structure the Scrawl-canvas files have been placed
import scrawl from '../../source/scrawl.js';



// ### 'Spotlight text' component
//
// __Purpose:__ adds a spotlight effect to an element. When the user hovers the mouse over the element, a 'spotlight' gradient will track the mouse's movements.
//
// __Function input:__ the DOM element, or a handle to it, as the only argument.
//
// __Function output:__ a Javascript object will be returned, containing the following attributes
// ```
// {
//     element     // the Scrawl-canvas wrapper for the DOM element supplied to the function
//     canvas      // the Scrawl-canvas wrapper for the component's canvas
//     animation   // the Scrawl-canvas animation object
//     demolish    // remove the component from the Scrawl-canvas library
// }
// ```
// ##### Usage example:
// ```
// import scrawl from '../relative/or/absolute/path/to/scrawl.js';
// import { spotlightText } from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
// myElements.forEach(el => spotlightText(el));
// ```
// __Effects on the element:__ no additional effects.
const spotlightText = (el) => {

    // Define some variables and functions we'll be using as part of the component build
    let canvas, block;

    // Define the gradient
    let spotlightGradient = scrawl.makeRadialGradient({
        name: 'mygradient',
        startX: '50%',
        startY: '50%',
        endX: '50%',
        endY: '50%',
        endRadius: '20%',
    })
    .updateColor(0, 'white')
    .updateColor(999, 'lightgray');

    // This animation hook uses the variables and gradient we defined above
    //
    // - not defining them first leads to the animation functionality failing
    let checkMouseHover = function () {

        let active = false;

        return function () {

            if (canvas.here.active !== active) {

                active = canvas.here.active;

                // The block entity swaps between the gradient and a color fill, dependent on user interaction
                block.set({
                    lockTo: (active) ? 'mouse' : 'start',
                    fillStyle: (active) ? spotlightGradient : 'lightgray',
                });
            }
        };
    }();

    // Generate the component for the DOM element
    let component = scrawl.makeComponent({

        // (__required__) The DOM element we are about to componentize
        domElement: el,

        // (__optional__) An array of animation hook functions with the following attributes
        // `commence` - for an preparatory work required before the display cycle kicks off
        // `afterClear` - runs between the 'clear' and 'compile' stages of the display cycle
        // `afterCompile` - runs between the 'compile' and 'show' stages of the display cycle
        // `afterShow` - for any cleanup work required after the display cycle completes
        // `error` - a function to run when an error in the display cycle occurs
        animationHooks: {
            commence: checkMouseHover,
        },

        // (__optional__) Options we can supply for the [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). Defaults are usually good enough; changing the 'threshold' value is probably the most useful option to play with
        observerSpecs: {},

        // (__optional__ - default: true) Scrawl-canvas components don't have to include a canvas!
        includeCanvas: true,

        // (__optional__, and only useful if we are including a canvas) - canvas-specific options. The most useful attribute is (probably) __fit__, whose value can be one of: `contain`, `cover`, `fill`, or `none` (the default value)
        canvasSpecs: {},
    })

    // NOTE: makeComponent() defines its own __afterClear__ animation hook
    // + the functionality is to keep the canvas properly aligned and sized with its DOM element
    // + overwriting this hook here will lose that functionality!
    // + instead, use the __commence__ animation hook for all display cycle preparations
    //
    // Once the component is built, we can supply values to our previously defined variables
    if (component) {

        // Set the canvas as the current canvas - not required, it just makes things simpler for building artefacts etc
        canvas = component.canvas;
        canvas.setAsCurrentCanvas();

        // Define the block which will (sometimes) display our spotlingt gradient
        block = scrawl.makeBlock({
            width: '200%',
            height: '200%',

            startX: "50%",
            startY: "50%",
            handleX: "50%",
            handleY: "50%",

            fillStyle: 'lightgray',
            lockFillStyleToEntity: true,

            method: 'fill', 
        });

        scrawl.makeBlock({

            width: '50%',
            height: '50%',
            startX: '25%',
            startY: '25%',
            globalAlpha: 0.3,
            strokeStyle: 'lightgreen',
            lineWidth: 40,
            method: 'draw',
        });
    }

    // Return the component, so coders can access the component's parts - in case they need to tweak the output to meet the web page's specific requirements
    return component;
};



// ### 'Jazzy button' component
// __Purpose:__ display the number of times a user has clicked on a button element; animate the text and its line when the user clicks on the button.
// __Function input:__ a &lt;button> element, or any other block-displayed DOM element containing no child elements.
//
// __Function output:__ 
// ```
// {
//     element           // wrapper
//     canvas            // wrapper
//     animation         // object
//     demolish          // function
//
//     artefacts {
//         trackLine     // Shape entity
//         label         // Phrase entity
//     }
//
//     assets {
//         lineGradient  // Gradient wrapper
//     }
//
//     functions {
//         setClickText  // increase the number of clicks recorded on the button
//         textTween     // Tween animation function
//         gradientTween // Tween animation function
//     }
// }
// ```
// ##### Usage example:
// ```
// import scrawl from '../relative/or/absolute/path/to/scrawl.js';
// import { jazzyButton } from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
// myElements.forEach(el => jazzyButton(el));
// ```
// __Effects on the element:__ no additional effects.
const jazzyButton = (el) => {

    let component = scrawl.makeComponent({
        domElement: el,
    });

    if (component) {

        let canvas = component.canvas;
        canvas.setAsCurrentCanvas();

        canvas.set({
            backgroundColor: '#f2f2f2',
        })

        let wrapper = component.element;

        // define the text we'll be displaying in the button
        let counter = 0;
        let setClickText = () => (counter === 1) ? `${counter} click` : `${counter} clicks`;

        // A path for the text to animate along, together with a gradient for its strokeStyle
        let lineGradient = scrawl.makeGradient({
            name: `${wrapper.name}-gradient`,
            endX: '100%',
            cyclePalette: true
        })
        .updateColor(0, 'blue')
        .updateColor(650, 'green')
        .updateColor(700, 'gold')
        .updateColor(750, 'green')
        .updateColor(999, 'blue');

        let trackLine = scrawl.makeLine({

            name: `${wrapper.name}-line`,
            startX: 20,
            endX: '95%',
            startY: '70%',
            endY: '70%',

            lineWidth: 2,
            lineCap: 'round',
            method: 'draw',

            strokeStyle: lineGradient,
            lockStrokeStyleToEntity: true,

            globalAlpha: 0.5,

            useAsPath: true,
        });

        // The phrase entity that will display the text
        let label = scrawl.makePhrase({

            name: `${wrapper.name}-label`,

            text: `Hello - ${setClickText()}`,
            font: `20px sans-serif`,

            fillStyle: '#000080',

            textPath: `${wrapper.name}-line`,
            textPathPosition: 0,
            textPathLoop: false,
        });

        // Animate the phrase entity along the line when button element is clicked
        let textTween = scrawl.makeTween({
            name: `${wrapper.name}-textTween`,
            duration: 2500,
            targets: label,
            definitions: [
                {
                    attribute: 'textPathPosition',
                    start: 1,
                    end: 0,
                    engine: 'easeIn'
                },
                {
                    attribute: 'globalAlpha',
                    start: 0,
                    end: 1,
                    engine: 'easeIn'
                },
                {
                    attribute: 'scale',
                    start: 0.4,
                    end: 1,
                    engine: 'easeIn'
                }
            ]
        });

        // Animate the gradient for the Line the text moves along
        let gradientTween = scrawl.makeTween({
            name: `${wrapper.name}-gradientTween`,
            targets: lineGradient,
            duration: 2500,
            definitions: [
                {
                    attribute: 'paletteStart',
                    integer: true,
                    start: 699,
                    end: 0,
                    engine: 'easeOut'
                }, {
                    attribute: 'paletteEnd',
                    integer: true,
                    start: 700,
                    end: 999,
                    engine: 'easeOut'
                }
            ]
        });

        let clickAction = (e) => {

            // Increase the local counter; update the Phrase entity with new text
            counter++;

            label.set({
                text: `Hello - ${setClickText()}`,
            });

            // Both tweens need to halt and restart if user clicks on them while they are running
            if (textTween.isRunning()) {
                textTween.halt();
                textTween.seekTo(0);
            }
            textTween.run();

            if (gradientTween.isRunning()) {
                gradientTween.halt();
                gradientTween.seekTo(0);
            }
            gradientTween.run();
        }
        scrawl.addNativeListener('click', clickAction, el);

        component.artefacts = {
            trackLine: trackLine,
            label: label,
        };

        component.assets = {
            lineGradient: lineGradient,
        };

        component.functions = {
            setClickText: setClickText,
            textTween: textTween,
            gradientTween: gradientTween,
        };
    }
    return component;
};



// ### 'Page performance' reporter
// __Purpose:__ (roughly) measure and display the time taken between calls to RequestAnimationFrame, and the resultant animated frames-per-second performance of the web page.
//
// __Function input:__ an empty &lt;div> element.
//
// __Function output:__ true if component builds; false otherwise
//
// ##### Usage example:
// ```
// import scrawl from '../relative/or/absolute/path/to/scrawl.js';
// import { pagePerformance } from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
// myElements.forEach(el => pagePerformance(el));
// ```
// __Effects on the element:__ updates the &lt;div> element's innerHTML data, which will replace any child elements or text placed between the element's opening and closing tags.
const pagePerformance = (el) => {

    let report = function () {

        let testTicker = Date.now(),
            testTime, testNow,
            testMessage = document.querySelector(`#${el.id}`);

        return function () {

            testNow = Date.now();
            testTime = testNow - testTicker;
            testTicker = testNow;

            testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;

            console.log('report animation is running')
        };
    }();

    let component = scrawl.makeComponent({
        domElement: el,
        animationHooks: {
            afterShow: report,
        },
        includeCanvas: false,
    })

    return (component) ? true : false;
};


// #### Exports
export {
    spotlightText,
    jazzyButton,
    pagePerformance,
}
