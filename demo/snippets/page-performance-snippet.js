// # 'Page performance' reporter
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
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import scrawl from '../../source/scrawl.js';


// __Effects on the element:__ updates the &lt;div> element's innerHTML data, which will replace any child elements or text placed between the element's opening and closing tags.
export default function (el) {

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

    let snippet = scrawl.makeComponent({
        domElement: el,
        animationHooks: {
            afterShow: report,
        },
        includeCanvas: false,
    })

    return (snippet) ? true : false;
};
