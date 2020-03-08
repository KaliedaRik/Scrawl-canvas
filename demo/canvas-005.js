import scrawl from '../source/scrawl.js'


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
	css: {
		border: '1px solid black'
	}
});


// Build the gradient objects
let myRadial = scrawl.makeRadialGradient({
	name: 'circle-waves',

	startX: '30%',
	startY: '30%',
	endX: '50%',
	endY: '50%',

	endRadius: '50%',

	paletteStart: 200,
	paletteEnd: 800,

	delta: {
		paletteStart: -1,
		paletteEnd: -1
	},

	cyclePalette: true
})
.updateColor(0, 'black')
.updateColor(99, 'red')
.updateColor(199, 'black')
.updateColor(299, 'blue')
.updateColor(399, 'black')
.updateColor(499, 'gold')
.updateColor(599, 'black')
.updateColor(699, 'green')
.updateColor(799, 'black')
.updateColor(899, 'lavender')
.updateColor(999, 'black');

scrawl.makeGradient({
	name: 'colored-pipes',
	endX: '100%',
	cyclePalette: true
})
.updateColor(0, 'black')
.updateColor(49, 'yellow')
.updateColor(99, 'black')
.updateColor(149, 'lightyellow')
.updateColor(199, 'black')
.updateColor(249, 'goldenrod')
.updateColor(299, 'black')
.updateColor(349, 'lemonchiffon')
.updateColor(399, 'black')
.updateColor(449, 'gold')
.updateColor(499, 'black')
.updateColor(549, 'tan')
.updateColor(599, 'black')
.updateColor(649, 'wheat')
.updateColor(699, 'black')
.updateColor(749, 'yellowgreen')
.updateColor(799, 'black')
.updateColor(849, 'peachpuff')
.updateColor(899, 'black')
.updateColor(949, 'papayawhip')
.updateColor(999, 'black');

scrawl.makeGradient({
	name: 'linear',
	endX: '100%',
})
.updateColor(0, 'blue')
.updateColor(495, 'red')
.updateColor(500, 'yellow')
.updateColor(505, 'red')
.updateColor(999, 'green');


// Build the block and wheel entitys
scrawl.makeBlock({
	name: 'cell-locked-block',

	width: 150,
	height: 150,

	startX: 180,
	startY: 120,

	handleX: 'center',
	handleY: 'center',

	fillStyle: 'linear',
	strokeStyle: 'coral',
	lineWidth: 6,

	delta: {
		roll: 0.5
	},

	method: 'fillAndDraw',

}).clone({
	name: 'entity-locked-block',

	scale: 1.2,
	startY: 480,

	lockFillStyleToEntity: true,

}).clone({
	name: 'animated-block',

	width: 160,
	height: 90,

	startY: 300,

	fillStyle: 'colored-pipes',
	lineWidth: 2,

	delta: {
		roll: -0.2
	},
});

scrawl.makeWheel({
	name: 'cell-locked-wheel',

	radius: 75,

	startX: 480,
	startY: 120,
	handleX: 'center',
	handleY: 'center',

	fillStyle: 'linear',
	strokeStyle: 'coral',
	lineWidth: 6,
	lineDash: [4, 4],

	delta: {
		roll: -0.5
	},

	method: 'fillAndDraw',

}).clone({
	name: 'entity-locked-wheel',

	scale: 1.2,
	startY: 480,

	lockFillStyleToEntity: true,

}).clone({
	name: 'animated-wheel',

	scale: 0.9,
	startY: 300,

	fillStyle: myRadial,
	lineWidth: 2,
	lineDash: [],

	delta: {
		roll: 0.2
	},
});


// Tween, and the engine used by the tween to calculate values
let tweenEngine = (start, change, position) => {

	let temp = 1 - position,
		val;

	// This is a fairly basic ease-in-out function: the tween will call the function with start, change and position arguments, and the function is required to return a value calculated from those arguments
	val = (position < 0.5) ?
		start + ((position * position) * change * 2) :
		(start + change) + ((temp * temp) * -change * 2);

	// We're asking the tween to calculate an ease over 3000 steps, but the palette cursors (paletteStart, paletteEnd) are only permitted to have integer values between 0 and 999. Effectively we're asking the tween to cycle through the palette 3 times.
	return val % 1000;
};

let tweeny = scrawl.makeTween({
	name: 'mytween',
	targets: 'colored-pipes',
	duration: 5000,
	cycles: 1,
	definitions: [{
		attribute: 'paletteStart',
		integer: true,
		start: 0,
		end: 2999,
		engine: tweenEngine
	}, {
		attribute: 'paletteEnd',
		integer: true,
		start: 999,
		end: 3998,
		engine: tweenEngine
	}]
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

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		dragging = current();

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Currently dragging: ${(dragging) ? dragging.artefact.name : 'nothing'}`;
	};
}();


// Function to animate the gradients
let animateGradients = function () {

	let dragging;

	return function () {

		myRadial.updateByDelta();
		dragging = current();

		if (dragging && dragging.artefact.name === 'animated-block' && !tweeny.isRunning()) tweeny.run();
	}
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: canvas,
	commence: animateGradients,
	afterShow: report,
});

console.log(scrawl.library);
