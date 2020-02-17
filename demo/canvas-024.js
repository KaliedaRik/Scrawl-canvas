import scrawl from '../source/scrawl.js'


// Scene setup
let canvas = scrawl.library.canvas.mycanvas;

canvas.set({
	backgroundColor: 'aliceblue',
	css: {
		border: '1px solid black'
	}
});

// Import image from DOM
scrawl.importDomImage('.flowers');


// Define the artefacts that will be used as pivots and paths before the artefacts that use them as such
scrawl.makeWheel({

	name: 'pin-1',
	order: 2,

	startX: 100,
	startY: 100,

	handleX: 'center',
	handleY: 'center',

	radius: 10,
	fillStyle: 'blue',
	strokeStyle: 'darkgray',
	lineWidth: 2,
	method: 'fillAndDraw',

}).clone({
	name: 'pin-2',
	startY: 300,

}).clone({
	name: 'pin-3',
	startY: 500,

}).clone({
	name: 'pin-4',
	fillStyle: 'green',
	startX: 500,
	startY: 100,

}).clone({
	name: 'pin-5',
	startY: 230,

}).clone({
	name: 'pin-6',
	startY: 370,

}).clone({
	name: 'pin-7',
	startY: 500,
});


// Create a group to hold the draggable artefacts, for easier user action collision detection
let pins = scrawl.makeGroup({

	name: 'my-pins',
	host: canvas.base.name,

}).addArtefacts('pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5', 'pin-6', 'pin-7');


scrawl.makeQuadratic({

	name: 'my-quad',

	pivot: 'pin-1',
	lockTo: 'pivot',

	useStartAsControlPoint: true,

	controlPivot: 'pin-2',
	controlLockTo: 'pivot',

	endPivot: 'pin-3',
	endLockTo: 'pivot',

	lineWidth: 0,
	method: 'draw',

	useAsPath: true,
	showBoundingBox: true,
});

let myBez = scrawl.makeBezier({

	name: 'my-bezier',

	pivot: 'pin-4',
	lockTo: 'pivot',
	useStartAsControlPoint: true,

	startControlPivot: 'pin-5',
	startControlLockTo: 'pivot',

	endControlPivot: 'pin-6',
	endControlLockTo: 'pivot',

	endPivot: 'pin-7',
	endLockTo: 'pivot',

	lineWidth: 0,
	method: 'draw',

	useAsPath: true,
	showBoundingBox: true,
});


// Every Loom needs a source image
scrawl.makePicture({

	name: 'myFlower',
	asset: 'iris',

	copyWidth: '100%',
	copyHeight: '100%',

	method: 'fill',
	visibility: false,
});


// The Loom entity definition
let myLoom = scrawl.makeLoom({

	name: 'display-loom',

	// Check to see that paths can be loaded either as picture name strings, or as the entity itself
	fromPath: 'my-quad',
	toPath: myBez,

	source: 'myFlower',

	lineWidth: 5,
	lineCap: 'round',
	strokeStyle: 'orange',

	boundingBoxColor: 'red',
	showBoundingBox: true,

	method: 'fillThenDraw',
});


// Create the drag-and-drop zone
scrawl.makeDragZone({

	zone: canvas,
	collisionGroup: pins,
	endOn: ['up', 'leave'],
	exposeCurrentArtefact: true,
});


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Loom frame struts - from strut: ${myLoom.fromPathStart}, ${myLoom.fromPathEnd}; to strut: ${myLoom.toPathStart}, ${myLoom.toPathEnd}
Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: canvas,
	afterShow: report,
});


// User interaction - setup form observer functionality
scrawl.observeAndUpdate({

	event: ['input', 'change'],
	origin: '.controlItem',

	target: myLoom,

	useNativeListener: true,
	preventDefault: true,

	updates: {

		fromStart: ['fromPathStart', 'float'],
		fromEnd: ['fromPathEnd', 'float'],
		toStart: ['toPathStart', 'float'],
		toEnd: ['toPathEnd', 'float'],
		fromOnly: ['useFromPathCursorsOnly', 'boolean'],
		rendering: ['isHorizontalCopy', 'boolean'],
	},
});

// Setup form
document.querySelector('#fromStart').value = 0;
document.querySelector('#fromEnd').value = 1;
document.querySelector('#toStart').value = 0;
document.querySelector('#toEnd').value = 1;
document.querySelector('#fromOnly').options.selectedIndex = 0;
document.querySelector('#rendering').options.selectedIndex = 0;
document.querySelector('#animation').options.selectedIndex = 0;

console.log(scrawl.library);

// For developers
// - if we ever need to see what the pool cells are up to, we can output their canvases like this:
window.setTimeout(() => scrawl.generatedPoolCanvases.forEach(el => document.body.appendChild(el)), 1000);
