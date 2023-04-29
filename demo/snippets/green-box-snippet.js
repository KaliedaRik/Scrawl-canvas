// # Demo Snippets 002
// Scrawl-canvas stack element snippets
//
// Related files:
// + [Stack element snippets - main module](../snippets-002.html)
//
// ### 'Green box' snippet
//
// __Purpose:__ adds a translucent green box to an element.
//
// __Function input:__ the DOM element, or a handle to it, as the only argument.
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
//
// __Usage example:__
// ```
// import greenBox from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
//
// myElements.forEach(el => greenBox(scrawl, el));
// ```
//


// __Effects on the element:__ 
// + Adds a green box to the background display
export default function (scrawl, el) {

    const snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        scrawl.makeBlock({

            name: `${snippet.element.name}-box`,
            group: snippet.canvas.base.name,
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
    return snippet;
}
