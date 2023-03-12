// # Demo Snippets 004
// Snippets included in the Scrawl-canvas demo/snippets folder
//
// Related files:
// + [Snippets included in the Scrawl-canvas demo/snippets folder](../snippets-004.html)
// + [Animated hover gradient snippet](./animated-hover-gradient-snippet.html)
// + [Animated word gradient snippet](./animated-word-gradient-snippet.html)
// + [Green box snippet](./green-box-snippet.html)
// + [Jazzy button snippet](./jazzy-button-snippet.html)
// + [Page performance snippet](./page-performance-snippet.html)
// + [Pan image snippet](./pan-image-snippet.html)
// + [Placeholder effect snippet](./placeholder-effect-snippet.html)
// + [Ripple effect snippet](./ripple-effect-snippet.html)
// + [Spotlight text snippet](./spotlight-text-snippet.html)
// + [Word highlighter snippet](./word-highlighter-snippet.html)


// ### 'Placeholder' snippet
// __Purpose:__ Place a large X across the DOM element to indicate that it is a placeholder for something else
//
// __Function input:__ 
// + any block-displayed DOM element
// + additional data values can be passed by setting appropriate `data-` attributes on the DOM element
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
// import placeholder from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
//
// myElements.forEach(el => placeholder(scrawl, el));
// ```

// __Effects on the element:__
// + The DOM element's background color will be brought into the canvas, with the element's backgroundColor set to `transparent` - any background image, gradient, etc will be hidden by the snippet effect
export default function (scrawl, el) {

    // Apply the snippet to the DOM element
    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        // Set some convenience variables
        let canvas = snippet.canvas,
            wrapper = snippet.element,
            name = wrapper.name;

        // Data can be passed to the snippet via `data-` attributes on the DOM element:
        // + __data-line-width__ - default: "4"
        // + __data-line-color__ - default: "black"
        let lineWidth = el.dataset.lineWidth || '4',
            lineColor = el.dataset.lineColor || 'black';

        lineWidth = parseFloat(lineWidth);

        // Transfer the DOM element's current background-color style over to the canvas
        // + This does not handle situations where the DOM element has a gradient assigned to it
        let backgroundColor = wrapper.elementComputedStyles.backgroundColor || false;

        if (backgroundColor) {

            canvas.set({
                backgroundColor,
            })        
            wrapper.domElement.style.backgroundColor = 'transparent';
        }

        // Generate the Scrawl-canvas artefacts that display the effect
        scrawl.makeLine({

            name: `${name}-line-1`,
            group: canvas.base.name,
            start: ['0%', '1%'],
            end: ['100%', '99%'],
            lineWidth,
            strokeStyle: lineColor,
            method: 'draw',

        }).clone({

            name: `${name}-line-2`,
            start: ['0%', '99%'],
            end: ['100%', '1%'],
        });

        scrawl.makeBlock({

            name: `${name}-block`,
            group: canvas.base.name,
            lineWidth: lineWidth * 2,
            dimensions: ['100%', '100%'],
            strokeStyle: lineColor,
            method: 'draw',
        })
    }
    return snippet;
};
