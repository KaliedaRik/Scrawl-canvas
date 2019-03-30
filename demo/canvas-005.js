import scrawl from '../source/scrawl.js'

// Scene setup
scrawl.library.canvas.mycanvas.set({
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});

scrawl.makeWheel({
	name: 'mywheel_fill',
	radius: 50,
	startAngle: 15,
	endAngle: -15,
	includeCenter: true,

	startX: 100,
	startY: 100,

	fillStyle: 'green',
	strokeStyle: 'gold',

	lineWidth: 6,
	lineJoin: 'round',
	shadowOffsetX: 4,
	shadowOffsetY: 4,
	shadowBlur: 2,
	shadowColor: 'black'

}).clone({
	name: 'mywheel_draw',
	startX: 250,
	method: 'draw',
	sharedState: true

}).clone({
	name: 'mywheel_drawFill',
	startX: 400,
	method: 'drawFill',

}).clone({
	name: 'mywheel_fillDraw',
	startX: 550,
	method: 'fillDraw',
	sharedState: true

}).clone({
	name: 'mywheel_floatOver',
	startX: 100,
	startY: 250,
	method: 'floatOver'

}).clone({
	name: 'mywheel_sinkInto',
	startX: 250,
	method: 'sinkInto',
	sharedState: true

}).clone({
	name: 'mywheel_clear',
	startX: 400,
	method: 'clear'
});

// Change the fill and stroke styles on one of the blocks, and any block sharing that block's state
scrawl.library.artefact.mywheel_drawFill.set({
	fillStyle: 'blue',
	strokeStyle: 'coral'
});

// Display the scene
scrawl.render()
.catch(() => {});
