import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let artefact = scrawl.library.artefact,
	canvas = artefact.mycanvas;


// Get image from DOM
scrawl.importDomImage('.mypatterns');

// Create Pattern styles
scrawl.makePattern({

	name: 'brick-pattern',
	asset: 'brick',

}).clone({

	name: 'leaves-pattern',
	asset: 'leaves',

}).clone({

	name: 'water-pattern',
	imageSource: 'img/water.png',

}).clone({

	name: 'marble-pattern',
	imageSource: 'img/marble.png',

});

// Create a canvas-based pattern
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

// Create Block entitys
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

// Animation 
scrawl.makeAnimation({

	name: 'testC018Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;

				resolve(true);
			})
			.catch((err) => {

				testTicker = Date.now();
				testMessage.innerHTML = (err.substring) ? err : JSON.stringify(err);

				resolve(false);
			});
		});
	}
});
