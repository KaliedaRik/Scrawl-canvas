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

scrawl.makeOval({
	name: 'circle',
	fillStyle: 'lightGreen',
	method: 'fillDraw',
	startX: 20,
	startY: 20,
	radius: 40,

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'ellipse',
	startX: 120,
	radiusY: 60,

}).clone({
	name: 'egg',
	startX: 220,
	radiusX: '7%',
	radiusY: '10%',
	intersectY: 0.6,

}).clone({
	name: 'shield',
	startX: 330,
	startY: 43,
	radiusY: '6.6%',
	intersectY: -0.2,

}).clone({
	name: 'splodge',
	startX: 470,
	startY: 32,
	radius: 50,
	offshootA: 1.2,
	offshootB: -0.5,
	intersectY: 0.32,
});

scrawl.makeRectangle({
	name: 'ovalRectangle',
	startX: 20,
	startY: 180,
	rectangleWidth: 120,
	rectangleHeight: 80,
	radius: '50%',
	fillStyle: 'lightblue',
	method: 'fillDraw',

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'tab',
	startX: 165,
	rectangleHeight: 40,
	radiusT: 20,
	radiusB: 0,

}).clone({
	name: 'blockRectangle',
	startX: 310,
	rectangleHeight: 60,
	radius: 0,

}).clone({
	name: 'notRectangle',
	startX: 460,
	radiusX: '15%',
	radiusY: '25%',
	offshootA: -0.2,
	offshootB: 0.2,
});

scrawl.makeLine({
	name: 'firstLine',
	startX: 20,
	startY: 300,
	endX: 580,
	endY: 275,
	lineWidth: 3,
	lineCap: 'round',
	strokeStyle: 'darkgoldenrod',
	method: 'draw',

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'secondLine',
	startY: '52%',
	endY: '51%',

}).clone({
	name: 'thirdLine',
	startX: '20%',
	startY: '51%',
	endX: '85%',
	endY: '49.5%',
});

scrawl.makeQuadratic({
	name: 'firstQuad',
	startX: '5%',
	startY: '67%',
	controlX: '50%',
	controlY: '50%',
	endX: '95%',
	endY: '67%',
	lineWidth: 3,
	lineCap: 'round',
	strokeStyle: 'darkseagreen',
	method: 'draw',

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'secondQuad',
	startX: '7%',
	controlY: '48%',
	endX: '93%',

}).clone({
	name: 'thirdQuad',
	startX: '9%',
	controlY: '46%',
	endX: '91%',
});

scrawl.makeBezier({
	name: 'firstBezier',
	startX: '5%',
	startY: '80%',
	startControlX: '40%',
	startControlY: '60%',
	endControlX: '60%',
	endControlY: '90%',
	endX: '95%',
	endY: '80%',
	lineWidth: 3,
	lineCap: 'round',
	strokeStyle: 'linen',
	method: 'draw',

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'secondBezier',
	startX: '7%',
	startControlY: '56%',
	endControlY: '94%',
	endX: '93%',

}).clone({
	name: 'thirdBezier',
	startX: '9%',
	startControlY: '52%',
	endControlY: '98%',
	endX: '91%',
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

	path: 'tab',
	pathPosition: 0,
	lockTo: 'path',
	addPathRoll: true,

	delta: {
		pathPosition: 0.0015,
	}
}).clone({
	name: '_blockRectangle',
	path: 'blockRectangle',
	pathPosition: 0.05,
}).clone({
	name: '_circle',
	path: 'circle',
	pathPosition: 0.1,
}).clone({
	name: '_egg',
	path: 'egg',
	pathPosition: 0.15,
}).clone({
	name: '_ellipse',
	path: 'ellipse',
	pathPosition: 0.2,
}).clone({
	name: '_firstBezier',
	path: 'firstBezier',
	pathPosition: 0.25,
}).clone({
	name: '_firstLine',
	path: 'firstLine',
	pathPosition: 0.3,
}).clone({
	name: '_firstQuad',
	path: 'firstQuad',
	pathPosition: 0.35,
}).clone({
	name: '_notRectangle',
	path: 'notRectangle',
	pathPosition: 0.4,
}).clone({
	name: '_ovalRectangle',
	path: 'ovalRectangle',
	pathPosition: 0.45,
}).clone({
	name: '_secondBezier',
	path: 'secondBezier',
	pathPosition: 0.5,
}).clone({
	name: '_secondLine',
	path: 'secondLine',
	pathPosition: 0.55,
}).clone({
	name: '_secondQuad',
	path: 'secondQuad',
	pathPosition: 0.6,
}).clone({
	name: '_shield',
	path: 'shield',
	pathPosition: 0.65,
}).clone({
	name: '_splodge',
	path: 'splodge',
	pathPosition: 0.7,
}).clone({
	name: '_thirdBezier',
	path: 'thirdBezier',
	pathPosition: 0.75,
}).clone({
	name: '_thirdQuad',
	path: 'thirdQuad',
	pathPosition: 0.8,
}).clone({
	name: '_thirdLine',
	path: 'thirdLine',
	pathPosition: 0.85,
});


// Animation 
scrawl.makeAnimation({

	name: 'testC024Display',
	
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
console.log(library.entity);
