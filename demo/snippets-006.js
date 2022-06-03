// # Demo Snippets 006
// Editable header element color font snippets
//
// Related files:
// + [Animated highlight gradient text snippet](./snippets/animated-highlight-gradient-text-snippet.html)
// + [Bubbles text snippet](./snippets/bubbles-text-snippet.html)
// + [Risograph text gradient snippet](./snippets/risograph-text-gradient-snippet.html)
// + [Swirling stripes text snippet](./snippets/swirling-stripes-text-snippet.html)
// + [Worley text gradient snippet](./snippets/worley-text-gradient-snippet.html)
// + [Text snippet helper](./snippets/text-snippet-helper.html)
//
// [Run code](../../demo/snippets-006.html)

// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Apply snippets

// Risograph text gradient snippet
import risographEffect from './snippets/risograph-text-gradient-snippet.js';
const risographHeaders = document.querySelectorAll('.risograph-header');
risographHeaders.forEach(el => risographEffect(el, scrawl));

// Worley text gradient snippet
import worleyEffect from './snippets/worley-text-gradient-snippet.js';
const worleyHeaders = document.querySelectorAll('.worley-header');
worleyHeaders.forEach(el => worleyEffect(el, scrawl));

// Animated highlight gradient text snippet
import highlightGradientEffect from './snippets/animated-highlight-gradient-text-snippet.js';
const highlightGradientHeaders = document.querySelectorAll('.highlight-gradient-header');
highlightGradientHeaders.forEach(el => highlightGradientEffect(el, scrawl));

// Bubbles text snippet
import bubblesEffect from './snippets/bubbles-text-snippet.js';
const bubblesHeaders = document.querySelectorAll('.bubbles-text-header');
bubblesHeaders.forEach(el => bubblesEffect(el, scrawl));

// Swirling stripes text snippet
import swirlStripesEffect from './snippets/swirling-stripes-text-snippet.js';
const swirlStripesHeaders = document.querySelectorAll('.swirling-stripes-header');
swirlStripesHeaders.forEach(el => swirlStripesEffect(el, scrawl));

// Page performance snippet
import pagePerformance from './snippets/page-performance-snippet.js';
const pageReport = document.querySelectorAll('#reportmessage');
pageReport.forEach(el => pagePerformance(el));


// #### Development and testing
console.log(scrawl.library);
