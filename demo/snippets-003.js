// # Demo Snippets 003
// DOM element snippet - test canvas adaption to local element variations
//
// Related files:
// + [Ripple effect snippet](./snippets/ripple-effect-snippet.html)
//
// [Run code](../../demo/snippets-003.html)



// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../source/scrawl.js';


// Import snippets
import rippleEffect from './snippets/ripple-effect-snippet.js';
let rippleElements = document.querySelectorAll('.ripple');
rippleElements.forEach(el => rippleEffect(scrawl, el));
