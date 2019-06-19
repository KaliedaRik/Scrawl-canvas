import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
	backgroundColor: 'aliceblue',
});


// Create and clone block and wheel entitys. For the sake of safety and sanity, create the entitys on which other artefacts will pivot and mimic first. Then create those other artefacts.

// Note: setting this entity's method value to 'none' means that while it will perform all necessary calculations as part of the Display cycle, it will not complete its stamp action, thus will not appear on the display. This differs from setting its visibility attribute to false, which will make the entity skip both calculation and stamp operations
let myPivot = scrawl.makeWheel({
	name: 'mouse-pivot',
	method: 'none',

	startX: 'center',
	startY: 'center',
});

let myblock = scrawl.makeBlock({
	name: 'base-block',

	width: 150,
	height: 100,

	handleX: 'center',
	handleY: 'center',

	offsetX: -140,
	offsetY: -50,

	pivot: 'mouse-pivot',
	lockTo: 'pivot',

	fillStyle: 'darkblue',
	strokeStyle: 'gold',
	method: 'fillDraw',

	lineWidth: 6,
	lineJoin: 'round',

	delta: {
		roll: 0.5,
	},
});

let mywheel = scrawl.makeWheel({
	name: 'base-wheel',

	radius: 60,
	startAngle: 35,
	endAngle: -35,

	handleX: 'center',
	handleY: 'center',

	offsetX: 140,
	offsetY: 50,

	pivot: 'mouse-pivot',
	lockTo: 'pivot',

	fillStyle: 'purple',
	strokeStyle: 'gold',
	method: 'fillDraw',

	lineWidth: 6,
	lineJoin: 'round',

	delta: {
		roll: -0.5,
	},
});

myblock.clone({
	name: 'pivot-block',

	height: 30,

	handleX: 'center',
	handleY: 'center',

	strokeStyle: 'red',
	lineWidth: 3,
	method: 'draw',

	pivot: 'base-block',
	lockTo: 'pivot',

	offsetX: 0,
	offsetY: 110,
	addPivotOffset: true,

	delta: {
		roll: 0,
	},

}).clone({
	name: 'pivot-wheel',

	pivot: 'base-wheel',
	addPivotRotation: true,

	handleX: 0,
	handleY: '50%',

	offsetY: 0,

}).clone({
	name: 'mimic-wheel',

	mimic: 'base-wheel',
	lockTo: 'mimic',

	// When an entity mimics another entity's dimensions, its own dimensions (width, height) can be added to the mimic dimensions
	width: 20,
	height: 20,

	// Handles can be directly affected by mimic dimensions. If the entity adds its own dimensions to the mimics dimensions, then it may also need to add appropriate handle values to the mimic's handle
	handleX: 10,
	handleY: 10,

	strokeStyle: 'darkgreen',

	// The default values for the __useMimic__ and __addOwn__ variables is 'false' - including false attributes here only for convenience during development work
	useMimicDimensions: true,
	useMimicScale: true,
	useMimicStart: true,
	useMimicHandle: true,
	useMimicOffset: true,
	useMimicRotation: true,
	useMimicFlip: true,

	addOwnDimensionsToMimic: true,
	addOwnScaleToMimic: false,
	addOwnStartToMimic: false,
	addOwnHandleToMimic: true,
	addOwnOffsetToMimic: false,
	addOwnRotationToMimic: false,
});

mywheel.clone({
	name: 'mimic-block',

	mimic: 'base-block',
	lockTo: 'mimic',

	width: 60,

	strokeStyle: 'darkgreen',
	lineWidth: 3,
	method: 'draw',

	useMimicDimensions: true,
	useMimicScale: true,
	useMimicStart: true,
	useMimicHandle: false,
	useMimicOffset: true,
	useMimicRotation: true,

	addOwnDimensionsToMimic: true,
	addOwnScaleToMimic: false,
	addOwnStartToMimic: false,
	addOwnHandleToMimic: false,
	addOwnOffsetToMimic: false,
	addOwnRotationToMimic: false,
});


// Function to check whether mouse cursor is over stack, and lock the element artefact accordingly
let mouseCheck = function () {

	let active = false;

	return function () {

		if (canvas.here.active !== active) {

			active = canvas.here.active;

			myPivot.set({
				lockTo: (active) ? 'mouse' : 'start'
			});
		}
	};
}();


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: canvas,
	commence: mouseCheck,
	afterShow: report,
});
