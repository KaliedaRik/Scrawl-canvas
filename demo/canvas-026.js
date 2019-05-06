import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Scene setup
let library = scrawl.library;

library.canvas.mycanvas.set({
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});

scrawl.makeSpiral({
	name: 'spiral1',
	strokeStyle: 'darkgreen',
	method: 'draw',
	startX: 50,
	startY: 50,
	loops: 5,
	loopIncrement: 0.1,
	innerRadius: 0,

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'spiral2',
	startX: 350,
	innerRadius: 50,

}).clone({
	name: 'spiral3',
	startY: 350,
	loopIncrement: 0.3,
	innerRadius: 0,

}).clone({
	name: 'spiral4',
	startX: 50,
	loopIncrement: 0.3,
	innerRadius: 20,
});

scrawl.makePicture({

	name: '_spiral1',
	imageSource: 'img/bunny.png',

	width: 26,
	height: 37,

	copyWidth: 26,
	copyHeight: 37,

	handleX: 'center',
	handleY: 'center',

	path: 'spiral1',
	pathPosition: 0,
	lockTo: 'path',
	addPathRoll: true,

	delta: {
		pathPosition: 0.0015,
	}
}).clone({
	name: '_spiral2',
	path: 'spiral2',
	pathPosition: 0.25,
}).clone({
	name: '_spiral3',
	path: 'spiral3',
	pathPosition: 0.5,
}).clone({
	name: '_spiral4',
	path: 'spiral4',
	pathPosition: 0.75,
});


// Animation 
scrawl.makeAnimation({

	name: 'testC026Display',
	
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
