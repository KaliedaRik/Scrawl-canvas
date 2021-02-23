// # Demo Snippets 004
// Snippets included in the Scrawl-canvas demo/snippets folder
//
// Related files:
// + [Snippets included in the Scrawl-canvas demo/snippets folder](../snippets-004.html)
//
// ### 'Word highlighter text' snippet
//
// __Purpose:__ adds highlighting to specified words.
//
// __Function input:__ 
// + the DOM element - generally a block or inline-block element.
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


// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import scrawl from '../../source/scrawl.js';


// __Effects on the element:__ 
// + no additional effects on the DOM element
// + setting any background fill on the DOM element will hide the snippet canvas, unless it is deliberately brought forward
export default function (el, args = {}) {

    // The snippet will accept an optional key:value Object as the second argument
    // + __highlightColor__ - default: `red`
    let highlightColor = args.highlightColor || 'red',
        thickness = args.thickness || 3;


    // Apply the snippet to the DOM element
    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        // Set some convenience variables
        let canvas = snippet.canvas,
            group = canvas.base.name,
            wrapper = snippet.element,
            name = wrapper.name;

        scrawl.makeBlock({
            name: `${name}-pin1`,
            group,
            dimensions: [0, 0],
            display: 'none',
            start: ['5%', '10%'],
        }).clone({
            name: `${name}-pin2`,
            start: ['90%', '40%'],
        }).clone({
            name: `${name}-pin3`,
            start: ['10%', '70%'],
        }).clone({
            name: `${name}-pin4`,
            start: ['95%', '90%'],
        })

        // Define the block which will (sometimes) display our spotlingt gradient
        scrawl.makePolyline({
            name: `${name}-highlight`,
            group,
            pins: [`${name}-pin1`, `${name}-pin2`, `${name}-pin3`, `${name}-pin4`],
            tension: 0.4,
            strokeStyle: highlightColor,
            lineWidth: thickness,
            lineCap: 'round',
            lineJoin: 'round',
            method: 'draw',
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
};
