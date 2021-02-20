// # Demo Snippets 001
// Scrawl-canvas DOM element snippets

// [Run code](../../demo/snippets-001.html)


// Import snippets
import spotlightText from './snippets/spotlight-text-snippet.js';
import jazzyButton from './snippets/jazzy-button-snippet.js';
import pagePerformance from './snippets/page-performance-snippet.js';


// Get the relevant Scrawl-canvas stack elements that need snippet skinning
let spotlightElements = document.querySelectorAll('.spotlight-text');
let jazzyElements = document.querySelectorAll('.jazzy-button');
let pageReport = document.querySelectorAll('#reportmessage');


// ... And then skin them using the snippet code we imported
spotlightElements.forEach(el => spotlightText(el));

let myJazzy = [];
jazzyElements.forEach(el => myJazzy.push(jazzyButton(el)));

// make the third jazzy button (in the middle of the grid element) display its canvas over the button
myJazzy[2].element.set({
    canvasOnTop: true,
});

pageReport.forEach(el => pagePerformance(el));
