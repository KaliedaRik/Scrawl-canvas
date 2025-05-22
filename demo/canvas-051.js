// # Demo Canvas 051
// Interactions between filters, GCO and GlobalAlpha applied to an entity

// [Run code](../../demo/filters-051.html)
import * as scrawl from '../source/scrawl.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create the filter
const gray = scrawl.makeFilter({
    name: name('gray'),
    method: 'grayscale',
});

// Create separate groups for each box (for clipping purposes)
scrawl.makeGroup({ name: name('tl'), host: canvas.base })
.clone({ name: name('tc'), host: canvas.base })
.clone({ name: name('tr'), host: canvas.base })
.clone({ name: name('ml'), host: canvas.base })
.clone({ name: name('mc'), host: canvas.base })
.clone({ name: name('mr'), host: canvas.base })
.clone({ name: name('bl'), host: canvas.base })
.clone({ name: name('bc'), host: canvas.base })
.clone({ name: name('br'), host: canvas.base });

// Top left
const clip = scrawl.makeBlock({
    name: name('clip-tl'),
    group: name('tl'),
    start: ['17%', '17%'],
    handle: ['center', 'center'],
    dimensions: ['33%', '33%'],
    method: 'clip',
});
const cover = scrawl.makeBlock({
    name: name('cover-tl'),
    group: name('tl'),
    start: ['17%', '17%'],
    handle: ['center', 'center'],
    dimensions: ['16%', '16%'],
    fillStyle: 'lightgreen',
    globalCompositeOperation: 'source-over',
});
const stencil = scrawl.makeBlock({
    name: name('stencil-tl'),
    group: name('tl'),
    start: ['17%', '17%'],
    handle: ['center', 'center'],
    dimensions: ['32%', '32%'],
    fillStyle: 'blue',
    globalCompositeOperation: 'destination-in',
});
const background = scrawl.makeBlock({
    name: name('background-tl'),
    group: name('tl'),
    start: ['17%', '17%'],
    handle: ['center', 'center'],
    dimensions: ['32%', '32%'],
    fillStyle: 'red',
    globalCompositeOperation: 'destination-over',
});

// Top middle
clip.clone({
    name: name('clip-tc'),
    group: name('tc'),
    startX: '50%',
});
cover.clone({
    name: name('cover-tc'),
    group: name('tc'),
    startX: '50%',
    // Test setting filters attribute using the filter object (no array)
    filters: gray,
});
stencil.clone({
    name: name('stencil-tc'),
    group: name('tc'),
    startX: '50%',
});
background.clone({
    name: name('background-tc'),
    group: name('tc'),
    startX: '50%',
});

// Top right
clip.clone({
    name: name('clip-tr'),
    group: name('tr'),
    startX: '83%',
});
cover.clone({
    name: name('cover-tr'),
    group: name('tr'),
    startX: '83%',
    filters: gray,
    globalAlpha: 0.8,
});
stencil.clone({
    name: name('stencil-tr'),
    group: name('tr'),
    startX: '83%',
});
background.clone({
    name: name('background-tr'),
    group: name('tr'),
    startX: '83%',
});

// Middle left
clip.clone({
    name: name( 'clip-ml'),
    group: name('ml'),
    startY: '50%',
});
stencil.clone({
    name: name('stencil-ml'),
    group: name('ml'),
    startY: '50%',
    globalCompositeOperation: 'source-over',
});
cover.clone({
    name: name('cover-ml'),
    group: name('ml'),
    startY: '50%',
    globalCompositeOperation: 'source-in',
});
background.clone({
    name: name('background-ml'),
    group: name('ml'),
    startY: '50%',
});

// Middle center
clip.clone({
    name: name('clip-mc'),
    group: name('mc'),
    start: ['50%', '50%'],
});
stencil.clone({
    name: name('stencil-mc'),
    group: name('mc'),
    start: ['50%', '50%'],
    globalCompositeOperation: 'source-over',
});
cover.clone({
    name: name('cover-mc'),
    group: name('mc'),
    start: ['50%', '50%'],
    // Test setting filters attribute using the filter object (in array)
    filters: [gray],
    globalCompositeOperation: 'source-in',
});
background.clone({
    name: name('background-mc'),
    group: name('mc'),
    start: ['50%', '50%'],
});

// Middle right
clip.clone({
    name: name('clip-mr'),
    group: name('mr'),
    start: ['83%', '50%'],
});
stencil.clone({
    name: name('stencil-mr'),
    group: name('mr'),
    start: ['83%', '50%'],
    globalCompositeOperation: 'source-over',
});
cover.clone({
    name: name('cover-mr'),
    group: name('mr'),
    start: ['83%', '50%'],
    // Test setting filters attribute using the filter name string (no array)
    filters: name('gray'),
    globalCompositeOperation: 'source-in',
    globalAlpha: 0.8,
});
background.clone({
    name: name('background-mr'),
    group: name('mr'),
    start: ['83%', '50%'],
});

// Bottom left
clip.clone({
    name: name('clip-bl'),
    group: name('bl'),
    startY: '83%',
});
stencil.clone({
    name: name('stencil-bl'),
    group: name('bl'),
    startY: '83%',
    globalCompositeOperation: 'source-over',
});
cover.clone({
    name: name('cover-bl'),
    group: name('bl'),
    startY: '83%',
    globalCompositeOperation: 'source-atop',
});
background.clone({
    name: name('background-bl'),
    group: name('bl'),
    startY: '83%',
});

// Bottom center
clip.clone({
    name: name('clip-bc'),
    group: name('bc'),
    start: ['50%', '83%'],
});
stencil.clone({
    name: name('stencil-bc'),
    group: name('bc'),
    start: ['50%', '83%'],
    globalCompositeOperation: 'source-over',
});
cover.clone({
    name: name('cover-bc'),
    group: name('bc'),
    start: ['50%', '83%'],
    // Test setting filters attribute using the filter name string (in array)
    filters: [name('gray')],
    globalCompositeOperation: 'source-atop',
});
background.clone({
    name: name('background-bc'),
    group: name('bc'),
    start: ['50%', '83%'],
});

// Bottom right
clip.clone({
    name: name('clip-br'),
    group: name('br'),
    start: ['83%', '83%'],
});
stencil.clone({
    name: name('stencil-br'),
    group: name('br'),
    start: ['83%', '83%'],
    globalCompositeOperation: 'source-over',
});
cover.clone({
    name: name('cover-br'),
    group: name('br'),
    start: ['83%', '83%'],
    filters: [name('gray')],
    globalCompositeOperation: 'source-atop',
    globalAlpha: 0.8,
});
background.clone({
    name: name('background-br'),
    group: name('br'),
    start: ['83%', '83%'],
});

// #### Scene display
canvas.render();


// #### Development and testing
console.log(scrawl.library);
