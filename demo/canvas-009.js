import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Get images from DOM
scrawl.importDomImage('.mypatterns');


// Create Pattern styles using imported images
scrawl.makePattern({

	name: 'brick-pattern',
	asset: 'brick',

}).clone({

	name: 'leaves-pattern',
	asset: 'leaves',

});

// Create Pattern styles dynamically
scrawl.makePattern({

	name: 'water-pattern',
	imageSource: 'img/water.png',

}).clone({

	name: 'marble-pattern',
	imageSource: 'img/marble.png',

});

// Create a canvas-based Cell pattern
canvas.buildCell({

	name: 'cell-pattern',

	width: 50,
	height: 50,

	backgroundColor: 'lightblue',

	shown: false,
});

canvas.base.set({

	compileOrder: 1,
});

// Create a Block entity to display in the new Cell pattern
scrawl.makeBlock({

	name: 'cell-pattern-block',
	group: 'cell-pattern',

	width: 40,
	height: 40,

	startX: 'center',
	startY: 'center',

	handleX: 'center',
	handleY: 'center',

	method: 'fill',

	fillStyle: 'water-pattern',

	delta: {
		roll: -0.3
	},
});


// Create Block entitys for the main display
scrawl.makeBlock({

	name: 'water-in-leaves',
	group: canvas.base.name,

	width: '40%',
	height: '40%',

	startX: '25%',
	startY: '25%',

	handleX: 'center',
	handleY: 'center',

	lineWidth: 20,
	lineJoin: 'round',

	method: 'sinkInto',

	fillStyle: 'cell-pattern',
	strokeStyle: 'leaves-pattern',

	shadowOffsetX: 5,
	shadowOffsetY: 5,
	shadowBlur: 3,
	shadowColor: 'black',

}).clone({

	name: 'leaves-in-brick',

	startX: '75%',

	fillStyle: 'leaves-pattern',
	strokeStyle: 'brick-pattern',

}).clone({
	
	name: 'brick-in-marble',

	startY: '75%',

	fillStyle: 'brick-pattern',
	strokeStyle: 'marble-pattern',

}).clone({
	
	name: 'marble-in-water',

	startX: '25%',

	fillStyle: 'marble-pattern',
	strokeStyle: 'water-pattern',

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

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: canvas,
	afterShow: report,
});
