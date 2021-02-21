// # Demo Snippets 004
// Snippets included in the Scrawl-canvas Demo folder
//
// Related files:
// + [Ripple effect snippet](./snippets/ripple-effect-snippet.html)
//
// [Run code](../../demo/snippets-004.html)


// Import snippets
import rippleEffect from './snippets/ripple-effect-snippet.js';
let rippleEffectElements = document.querySelectorAll('.ripple-effect');
rippleEffectElements.forEach(el => rippleEffect(el));

import greenBox from './snippets/green-box-snippet.js';
let greenBoxElements = document.querySelectorAll('.green-box');
greenBoxElements.forEach(el => greenBox(el));

import jazzyButton from './snippets/jazzy-button-snippet.js';
let jazzyButtonElements = document.querySelectorAll('.jazzy-button');
jazzyButtonElements.forEach(el => jazzyButton(el));

import spotlight from './snippets/spotlight-text-snippet.js';
let spotlightElements = document.querySelectorAll('.spotlight-effect');
spotlightElements.forEach(el => spotlight(el));

import pagePerformance from './snippets/page-performance-snippet.js';
let performanceElements = document.querySelectorAll('.page-performance');
performanceElements.forEach(el => pagePerformance(el));

