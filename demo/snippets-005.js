// ## Demo Snippets 005
// Create a responsive, interactive and accessible before/after slider infographic

// Related files:
// + [Slider infographic snippet](./snippets/before-after-slider-infographic.html)
//
// [Run code](../../demo/snippets-005.html)


// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../source/scrawl.js';


// Import snippet
import slider from './snippets/before-after-slider-infographic.js';

document.querySelectorAll('.slider-infographic').forEach(el => slider(scrawl, el));


console.log(scrawl.library);