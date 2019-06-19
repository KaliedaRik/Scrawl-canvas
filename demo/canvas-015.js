import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
	backgroundColor: 'aliceblue',
	css: {
		border: '1px solid black'
	}
});


// Create and clone Phrase entitys
scrawl.makePhrase({
	name: 'myphrase_fill',

	text: 'H&epsilon;lj&ouml;!',
	font: 'bold 40px Garamond, serif',

	width: 120,
	startX: '14%',
	startY: '28%',
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
	startX: '14%',
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


// Change the fill and stroke styles on one of the phrase entitys, and any entity sharing that phrase's state
scrawl.library.artefact.myphrase_fillDraw.set({
	fillStyle: 'blue',
	strokeStyle: 'coral'
});


// Wheel pivot to check placement of start on first Phrase entity
scrawl.makeWheel({
	fillStyle: 'red',
	radius: 5,
	handleX: 'center',
	handleY: 'center',
	pivot: 'myphrase_fill',
	lockTo: 'pivot',
});


// Create the drag-and-drop zone
let current = scrawl.makeDragZone({

	zone: canvas,
	endOn: ['up', 'leave'],
	exposeCurrentArtefact: true,
});


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow, dragging,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		dragging = current();

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Currently dragging: ${(dragging) ? dragging.artefact.name : 'nothing'}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: canvas,
	afterShow: report,
});
