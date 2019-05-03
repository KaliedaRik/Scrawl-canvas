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

scrawl.makeTetragon({
	name: 'square',
	fillStyle: 'lightGreen',
	method: 'fillDraw',
	startX: 20,
	startY: 20,
	radius: 40,

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'diamond',
	startX: 120,
	radiusY: 60,

}).clone({
	name: 'triangle',
	startX: 220,
	radiusX: '7%',
	radiusY: '10%',
	intersectY: 1,

}).clone({
	name: 'arrow',
	startX: 330,
	radiusY: '6.6%',
	intersectY: 1.2,

}).clone({
	name: 'skewarrow',
	startX: 470,
	radius: 50,
	intersectX: 0.32,
});

scrawl.makePolygon({
	name: 'equiTriangle',
	startX: 20,
	startY: 180,
	sideLength: 60,
	sides: 3,
	fillStyle: 'lightblue',
	method: 'fillDraw',

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'pentagon',
	startX: 120,
	sides: 5,

}).clone({
	name: 'hexagon',
	startX: 260,
	sides: 6,

}).clone({
	name: '11sides',
	startX: 420,
	sideLength: 30,
	sides: 11,
});

scrawl.makeStar({
	name: '5star',
	startX: 20,
	startY: 350,
	radius1: 80,
	radius2: 50,
	points: 5,
	fillStyle: 'linen',
	method: 'fillDraw',

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: '6star',
	startX: 220,
	points: 6,

}).clone({
	name: 'twistedstar',
	startX: 420,
	radius2: 20,
	twist: 115,
});

scrawl.makePicture({

	name: '_tab',
	imageSource: 'img/bunny.png',

	width: 26,
	height: 37,

	copyWidth: 26,
	copyHeight: 37,

	handleX: 'center',
	handleY: 'center',

	path: 'square',
	pathPosition: 0,
	lockTo: 'path',
	addPathRoll: true,

	delta: {
		pathPosition: 0.0015,
	}
}).clone({
	name: '_diamond',
	path: 'diamond',
	pathPosition: 0.05,
}).clone({
	name: '_triangle',
	path: 'triangle',
	pathPosition: 0.1,
}).clone({
	name: '_arrow',
	path: 'arrow',
	pathPosition: 0.15,
}).clone({
	name: '_skewarrow',
	path: 'skewarrow',
	pathPosition: 0.2,
}).clone({
	name: '_equiTriangle',
	path: 'equiTriangle',
	pathPosition: 0.25,
}).clone({
	name: '_pentagon',
	path: 'pentagon',
	pathPosition: 0.3,
}).clone({
	name: '_hexagon',
	path: 'hexagon',
	pathPosition: 0.35,
}).clone({
	name: '_11sides',
	path: '11sides',
	pathPosition: 0.4,
}).clone({
	name: '_5star',
	path: '5star',
	pathPosition: 0.45,
}).clone({
	name: '_6star',
	path: '6star',
	pathPosition: 0.5,
}).clone({
	name: '_twistedstar',
	path: 'twistedstar',
	pathPosition: 0.55,
});


// Animation 
scrawl.makeAnimation({

	name: 'testC025Display',
	
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
