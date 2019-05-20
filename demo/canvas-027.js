import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
scrawl.library.canvas.mycanvas.set({
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});

scrawl.makePhrase({
	name: 'myphrase_fill',

	text: 'H&epsilon;lj&ouml;!',
	font: 'bold 40px Garamond, serif',

	width: 120,
	startX: '14%',
	startY: '33%',
	handleX: 'center',
	handleY: 'center',

	justify: 'center',
	lineHeight: 1,

	fillStyle: 'green',
	strokeStyle: 'gold',

	lineWidth: 2,
	lineJoin: 'round',
	shadowOffsetX: 2,
	shadowOffsetY: 2,
	shadowBlur: 2,
	shadowColor: 'black',

	showBoundingBox: true,
	boundingBoxColor: 'red',

}).clone({
	name: 'myphrase_draw',
	startX: '38%',
	method: 'draw',

}).clone({
	name: 'myphrase_drawFill',
	startX: '84%',
	method: 'drawFill',

}).clone({
	name: 'myphrase_fillDraw',
	startX: '62%',
	method: 'fillDraw',
	sharedState: true

}).clone({
	name: 'myphrase_floatOver',
	startX: '16%',
	startY: '67%',
	method: 'floatOver'

}).clone({
	name: 'myphrase_sinkInto',
	startX: '38%',
	method: 'sinkInto',

}).clone({
	name: 'myphrase_clear',
	startX: '62%',
	method: 'clear'

}).clone({
	name: 'myphrase_multiline',

	text: 'Lorem ipsum har varit standard ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal bokstäver och blandade dem för att göra ett provexemplar av en bok.',

	size: '12px',
	weight: 'normal',

	startX: '84%',
	method: 'fill',

	shadowOffsetX: 0,
	shadowOffsetY: 0,
	shadowBlur: 0,
});

scrawl.makeWheel({
	fillStyle: 'red',
	radius: 5,
	pivot: 'myphrase_fill',
	lockTo: 'pivot',
});

// Change the fill and stroke styles on one of the blocks, and any block sharing that block's state
scrawl.library.artefact.myphrase_fillDraw.set({
	fillStyle: 'blue',
	strokeStyle: 'coral'
});


// Display the scene
scrawl.render().catch(() => {});
console.log(scrawl.library.entity)