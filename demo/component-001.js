// # Demo Component 001
// Scrawl-canvas DOM element components

// [Run code](../../demo/component-001.html)
//
// [See component code](./components/test-001.html)


// #### Imports
// Initialize scrawl-canvas
import scrawl from '../source/scrawl.js';

// Import the component code we want to use
import { spotlightText, jazzyButton, pagePerformance } from './components/test-001.js';


// #### Scene setup
// Get the relevant Scrawl-canvas stack elements that need component skinning
let spotlightElements = document.querySelectorAll('.spotlight-text');
let jazzyElements = document.querySelectorAll('.jazzy-button');
let pageReport = document.querySelectorAll('#reportmessage');


// ... And then skin them using the component code we imported
spotlightElements.forEach(el => spotlightText(el));

let myJazzy = [];
jazzyElements.forEach(el => myJazzy.push(jazzyButton(el)));

// make the third jazzy button (in the middle of the grid element) display it's canvas over the button
myJazzy[2].element.set({
    canvasOnTop: true,
});

pageReport.forEach(el => pagePerformance(el));


// #### Development and testing
console.log(scrawl.library)
