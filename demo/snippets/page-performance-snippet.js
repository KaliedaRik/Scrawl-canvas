// # Demo Snippets 001
// Scrawl-canvas DOM element snippets
//
// Related files:
// + [DOM element snippets - main module](../snippets-001.html)
// + [Spotlight text snippet](./spotlight-text-snippet.html)
// + [Jazzy button snippet](./jazzy-button-snippet.html)
// + [Page performance snippet](./page-performance-snippet.html)
//
// ### 'Page performance' reporter
// __Purpose:__ (roughly) measure and display the time taken between calls to RequestAnimationFrame, and the resultant animated frames-per-second performance of the web page.
//
// __Function input:__ an empty &lt;div> element.
//
// __Function output:__ true if snippet builds; false otherwise
//
// ##### Usage example:
// ```
// import { pagePerformance } from './relative/or/absolute/path/to/this/page-performance-snippet.js';
//
// let myElements = document.querySelectorAll('.some-class');
//
// myElements.forEach(el => pagePerformance(el));
// ```


// Import the Scrawl-canvas object 
// + There's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// __Effects on the element:__ 
// + updates the &lt;div> element's `innerHTML` data, which will replace any child elements or text placed between the element's opening and closing tags.
export default function (el) {

    // Define the report function that will record the time taken for each Display cycle animation
    let report = function () {

        let testTicker = Date.now(),
            testTime, testNow,
            testMessage = document.querySelector(`#${el.id}`);

        let history = [],
            averageTime = 0;

        const addTime = (t) => {

            if (history.length > 20) history.shift();
            history.push(t);
            averageTime = history.reduce((p, c) => p + c, 0);
            averageTime /= history.length;
        }

        return function () {

            testNow = Date.now();
            testTime = testNow - testTicker;
            testTicker = testNow;

            addTime(testTime);

            testMessage.textContent = `Screen refresh: ${Math.ceil(averageTime)}ms; fps: ${Math.floor(1000 / averageTime)}`;
        };
    }();


    // Apply the snippet to the DOM element
    let snippet = scrawl.makeSnippet({
        domElement: el,
        animationHooks: {
            afterShow: report,
        },
        includeCanvas: false,
    })

    // The return value for this snippet is a boolean, not a JS Object containing links to major actors/actions in the snippet
    return (snippet) ? true : false;
};
