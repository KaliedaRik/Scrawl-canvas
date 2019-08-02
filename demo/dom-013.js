import scrawl from '../source/scrawl.js'


// Scene setup - create some useful variables for use elsewhere in the script
let artefact = scrawl.library.artefact,
	stack = artefact.mystack,
	element = artefact.myelement,
	canvas = artefact.mycanvas,
	cell = canvas.base;


// Give the stack element some depth
stack.set({
	width: 600,
	height:400,
	perspectiveZ: 1200,
});


canvas.set({
	width: '100%',
	height:'100%',
	backgroundColor: 'black',
});

cell.set({
	width: '100%',
	height:'100%',
});


// Make a separate collisions group for our element
let testers = scrawl.makeGroup({

	name: 'testers',
	host: 'mystack',
});


// Setup the main element
element.set({

	group: 'testers',

	startX: 300,
	startY: 200,
	handleX: 100,
	handleY: 100,

	width: 200,
	height: 200,

	roll: 10,
	pitch: 20,
	yaw: 30,

	css: {
		borderWidth: '6px',
	},

	collides: true,
});


// Setup the background grid
let baseColor = 'aliceblue',
	highlightColor = 'red',
	gridSize = 40;

let grid = scrawl.makeGroup({

	name: 'grid',
	host: cell.name,
});

for (let y = 0; y < 400; y += gridSize) {

	for (let x = 0; x < 600; x += gridSize) {

		scrawl.makeBlock({

			name: `grid-${x / gridSize}-${y / gridSize}`,
			group: 'grid',

			width: gridSize - 0.5,
			height: gridSize - 0.5,
			startX: x,
			startY: y,

			fillStyle: baseColor,

			method: 'fill',
		});
	}
}


// Function to check whether mouse cursor is over stack, and lock the element artefact accordingly
scrawl.makeDragZone({

	zone: stack,
	collisionGroup: testers,
	endOn: ['up', 'leave'],
});


// Function to display grid blocks which are currently in collision with the element artefact
let checkHits = function () {

	let hits = [];

	return function () {

		hits.forEach(hit => hit.artefact.set({
			fillStyle: baseColor
		}));

		// BUG: for some reason, the getArtefactCollisions function is interfering with the drag zone functionality - meaning that when it is running, we can't drag our element around the stack/canvas. Comment it out and the drag functionality works fine.
		hits = grid.getArtefactCollisions(element);

		hits.forEach(hit => hit.artefact.set({
			fillStyle: highlightColor
		}));
	};
}();


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow,
		testMessage = document.querySelector('#reportmessage');

	// BUG: the final positioning, dimensions, scaling etc of DOM elements often don't settle down until after the first Display cycle completes, by which time certain internal structures (such as, in this case, the sensor coordinates for our element) have been set to old values. Which for this demo means that the element sensor data doesn't translate over to the canvas until after a user interaction of some sort brings everything back into synchronicity

	// The simplest way to correct this BUG (for now) is to a pply a .set() call on the element, changing one attribute a small amount. We only need to do this once, after the first Display cycle has completed.
	let firstRun = true;

	return function () {

		if (firstRun) {

			element.set({
				roll: 11,
			});

			firstRun = false;
		}

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	commence: checkHits,
	afterShow: report,
});


// User interaction - setup form observer functionality
scrawl.observeAndUpdate({

	event: ['input', 'change'],
	origin: '.controlItem',

	target: element,

	useNativeListener: true,
	preventDefault: true,

	updates: {
		handle_xAbsolute: ['handleX', 'round'],
		handle_yAbsolute: ['handleY', 'round'],

		offset_xAbsolute: ['offsetX', 'round'],
		offset_yAbsolute: ['offsetY', 'round'],

		roll: ['roll', 'float'],
		pitch: ['pitch', 'float'],
		yaw: ['yaw', 'float'],
		scale: ['scale', 'float'],

		sensitivity: ['sensorSpacing', 'round'],
	},
});

scrawl.observeAndUpdate({

	event: ['input', 'change'],
	origin: '.controlItem',

	target: stack,

	useNativeListener: true,
	preventDefault: true,

	updates: {
		perspective: ['perspectiveZ', 'round'],
	},
});


// Setup form
document.querySelector('#sensitivity').value = 50;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#offset_xAbsolute').value = 0;
document.querySelector('#offset_yAbsolute').value = 0;
document.querySelector('#roll').value = 10;
document.querySelector('#pitch').value = 20;
document.querySelector('#yaw').value = 30;
document.querySelector('#scale').value = 1;
document.querySelector('#perspective').value = 1200;
