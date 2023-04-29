// # Demo Snippets 001
// Scrawl-canvas DOM element snippets
//
// Related files:
// + [Spotlight text snippet](./snippets/spotlight-text-snippet.html)
// + [Jazzy button snippet](./snippets/jazzy-button-snippet.html)
// + [Page performance snippet](./snippets/page-performance-snippet.html)
//
// [Run code](../../demo/snippets-001.html)


// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../source/scrawl.js';


// Import snippets
import spotlightText from './snippets/spotlight-text-snippet-test.js';
import jazzyButton from './snippets/jazzy-button-snippet.js';
import pagePerformance from './snippets/page-performance-snippet-test.js';


// Get the relevant Scrawl-canvas stack elements that need snippet skinning
const spotlightElements = document.querySelectorAll('.spotlight-text');
const jazzyElements = document.querySelectorAll('.jazzy-button');
const pageReport = document.querySelectorAll('#reportmessage');


// ... And then skin them using the snippet code we imported
spotlightElements.forEach(el => spotlightText(scrawl, el));

const myJazzy = [];
jazzyElements.forEach(el => myJazzy.push(jazzyButton(scrawl, el)));

// make the third jazzy button (in the middle of the grid element) display its canvas over the button
myJazzy[2].element.set({
    canvasOnTop: true,
});

pageReport.forEach(el => pagePerformance(scrawl, el));
