// # Demo Snippets 006
// Snippets included in the Scrawl-canvas Demo folder
//
// Related files:
// + [Animated drape text gradient](./snippets/animated-drape-text-gradient-snippet.html)
// + [Worley text gradient(./snippets/worley-text-gradient-snippet.html)
//
// [Run code](../../demo/snippets-006.html)

import risographEffect from './snippets/risograph-text-gradient-snippet.js';
const risographHeaders = document.querySelectorAll('.risograph-header');
risographHeaders.forEach(el => risographEffect(el));

import worleyEffect from './snippets/worley-text-gradient-snippet.js';
const worleyHeaders = document.querySelectorAll('.worley-header');
worleyHeaders.forEach(el => worleyEffect(el));

import pagePerformance from './snippets/page-performance-snippet-test.js';
const pageReport = document.querySelectorAll('#reportmessage');
pageReport.forEach(el => pagePerformance(el));
