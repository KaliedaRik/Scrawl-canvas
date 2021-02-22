// # Demo Snippets 004
// Snippets included in the Scrawl-canvas Demo folder
//
// Related files:
// + [Ripple effect snippet](./snippets/ripple-effect-snippet.html)
//
// [Run code](../../demo/snippets-004.html)


// Import snippets
import rippleEffect from './snippets/ripple-effect-snippet.js';
rippleEffect(document.getElementById('ripple-01'));
rippleEffect(document.querySelector('#ripple-02'));
rippleEffect(document.querySelector('#ripple-04'));

rippleEffect(document.querySelector('#ripple-03'), {
	backgroundColor: 'rgb(255, 170, 170)',
	rippleColor: 'rgb(255, 220, 220)',
});

import greenBox from './snippets/green-box-snippet.js';
let greenBoxElements = document.querySelectorAll('.green-box');
greenBoxElements.forEach(el => greenBox(el));

import jazzyButton from './snippets/jazzy-button-snippet.js';
let jazzyButtonElements = document.querySelectorAll('.jazzy-button');
jazzyButtonElements.forEach(el => jazzyButton(el));

import spotlight from './snippets/spotlight-text-snippet.js';
spotlight(document.querySelector('#spotlight-01'));

spotlight(document.querySelector('#spotlight-02'), {
	backgroundColor: 'gold',
	spotlightColor: 'yellow',
});

import pagePerformance from './snippets/page-performance-snippet.js';
let performanceElements = document.querySelectorAll('.page-performance');
performanceElements.forEach(el => pagePerformance(el));

