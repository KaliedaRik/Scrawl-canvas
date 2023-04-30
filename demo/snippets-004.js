// # Demo Snippets 004
// Snippets included in the Scrawl-canvas Demo folder
//
// Related files:
// + [Ripple effect snippet](./snippets/ripple-effect-snippet.html)
//
// [Run code](../../demo/snippets-004.html)


// Import the Scrawl-canvas object
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../source/scrawl.js';


// Import snippets
import rippleEffect from './snippets/ripple-effect-snippet.js';
rippleEffect(scrawl, document.getElementById('ripple-01'));
rippleEffect(scrawl, document.querySelector('#ripple-02'));
rippleEffect(scrawl, document.querySelector('#ripple-04'));

rippleEffect(scrawl, document.querySelector('#ripple-03'), {
	backgroundColor: 'rgb(255 170 170)',
	rippleColor: 'rgb(255 220 220)',
});

import greenBox from './snippets/green-box-snippet.js';
const greenBoxElements = document.querySelectorAll('.green-box');
greenBoxElements.forEach(el => greenBox(scrawl, el));

import jazzyButton from './snippets/jazzy-button-snippet.js';
const jazzyButtonElements = document.querySelectorAll('.jazzy-button');
jazzyButtonElements.forEach(el => jazzyButton(scrawl, el));

import spotlight from './snippets/spotlight-text-snippet.js';
spotlight(scrawl, document.querySelector('#spotlight-01'));

spotlight(scrawl, document.querySelector('#spotlight-02'), {
	backgroundColor: 'gold',
	spotlightColor: 'yellow',
});

import pagePerformance from './snippets/page-performance-snippet.js';
const performanceElements = document.querySelectorAll('.page-performance');
performanceElements.forEach(el => pagePerformance(scrawl, el));

import placeholder from './snippets/placeholder-effect-snippet.js';
const placeholderElements = document.querySelectorAll('.placeholder');
placeholderElements.forEach(el => placeholder(scrawl, el));

import wordHighlighter from './snippets/word-highlighter-snippet.js';
document.querySelectorAll('.default-highlighter').forEach(el => wordHighlighter(scrawl, el));

document.querySelectorAll('.thick-orange-highlighter').forEach(el => wordHighlighter(scrawl, el, {
	highlightColor: 'orange',
	thickness: 6,
}));

import animatedHoverGradient from './snippets/animated-hover-gradient-snippet.js';
document.querySelectorAll('.animated-hover-gradient').forEach(el => animatedHoverGradient(scrawl, el));

import animatedWordGradient from './snippets/animated-word-gradient-snippet.js';
document.querySelectorAll('.animated-word-gradient').forEach(el => animatedWordGradient(scrawl, el));

import panImage from './snippets/pan-image-snippet.js';
document.querySelectorAll('.pan-image').forEach(el => panImage(scrawl, el));

