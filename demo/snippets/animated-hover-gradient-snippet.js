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


// ### 'Animated hover gradient' snippet
//
// __Purpose:__ adds a gradient behind the words, which animates on user hover over the &lt;span> (or similar) element.
//
// __Function input:__ 
// + the DOM element - generally a block or inline-block element.
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
// import hoverGradient from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
//
// myElements.forEach(el => hoverGradient(scrawl, el));
// ```


// __Effects on the element:__ 
// + no additional effects on the DOM element
// + setting any background fill on the DOM element will hide the snippet canvas, unless it is deliberately brought forward
export default function (scrawl, el) {

    // Apply the snippet to the DOM element
    const snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        // Set some convenience variables
        const canvas = snippet.canvas,
            group = canvas.base.name,
            animation = snippet.animation,
            wrapper = snippet.element,
            name = wrapper.name;

        const animatedGradient = scrawl.makeRadialGradient({
            name: `${name}-gradient`,
            start: [0, 0],
            end: [0, 0],
            endRadius: '120%',
            paletteStart: 0,
            paletteEnd: 99,
            delta: {
                paletteStart: -3,
                paletteEnd: -3,
            },
            cyclePalette: true,
        })
        .updateColor(0, 'orange')
        .updateColor(99, 'orange')
        .updateColor(100, 'red')
        .updateColor(299, 'red')
        .updateColor(300, 'lightblue')
        .updateColor(499, 'lightblue')
        .updateColor(500, 'gold')
        .updateColor(699, 'gold')
        .updateColor(700, 'green')
        .updateColor(899, 'green')
        .updateColor(900, 'orange')
        .updateColor(999, 'orange');
        
        scrawl.makeBlock({
            name: `${name}-block`,
            group,
            dimensions: ['100%', '100%'],
            fillStyle: `${name}-gradient`,
            method: 'fill',
        });

        animation.set({
            commence: function () {
                if (canvas.here.active) animatedGradient.updateByDelta();
            },
        });
    }


    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
}
