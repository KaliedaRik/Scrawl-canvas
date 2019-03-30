import scrawl from '../source/scrawl.js'

// Scene setup
scrawl.library.canvas.mycanvas.set({
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});

scrawl.makeBlock({
	name: 'myblock_fill',
	width: 100,
	height: 100,
	startX: 50,
	startY: 50,

	fillStyle: 'green',
	strokeStyle: 'gold',

	lineWidth: 6,
	lineJoin: 'round',
	shadowOffsetX: 4,
	shadowOffsetY: 4,
	shadowBlur: 2,
	shadowColor: 'black'

}).clone({
	name: 'myblock_draw',
	startX: 200,
	method: 'draw',
	sharedState: true

}).clone({
	name: 'myblock_drawFill',
	startX: 500,
	method: 'drawFill',

}).clone({
	name: 'myblock_fillDraw',
	startX: 350,
	method: 'fillDraw',
	sharedState: true

}).clone({
	name: 'myblock_floatOver',
	startX: 50,
	startY: 200,
	method: 'floatOver'

}).clone({
	name: 'myblock_sinkInto',
	startX: 200,
	method: 'sinkInto',
	sharedState: true

}).clone({
	name: 'myblock_clear',
	startX: 350,
	method: 'clear'
});

// Change the fill and stroke styles on one of the blocks, and any block sharing that block's state
scrawl.library.artefact.myblock_fillDraw.set({
	fillStyle: 'blue',
	strokeStyle: 'coral'
});

// Display the scene
scrawl.render()
.catch(() => {});
