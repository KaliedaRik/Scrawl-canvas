import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let canvas = scrawl.library.canvas.mycanvas

canvas.set({
	backgroundColor: 'lightgray',
	css: {
		border: '1px solid black'
	}
});


// Create various Shape entitys using various factory functions... 

// makeOval factory function 
scrawl.makeOval({
	name: 'circle',
	fillStyle: 'lightGreen',
	method: 'fillAndDraw',
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
	radiusY: '3%',
	intersectY: 0.6,

}).clone({
	name: 'shield',
	startX: 335,
	radiusY: '2.7%',
	intersectY: -0.2,

}).clone({
	name: 'splodge',
	startX: 460,
	radius: 50,
	offshootA: 1.2,
	offshootB: -0.5,
	intersectY: 0.32,
});

// makeRectangle factory function 
scrawl.makeRectangle({
	name: 'ovalRectangle',
	startX: 20,
	startY: 200,
	rectangleWidth: 120,
	rectangleHeight: 80,
	radius: '50%',
	fillStyle: 'lightblue',
	method: 'fillAndDraw',

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

// makeLine factory function 
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
	startY: '19%',
	endY: '17.2%',

}).clone({
	name: 'thirdLine',
	startX: '20%',
	startY: '18.25%',
	endX: '85%',
	endY: '18.25%',
});

// makeQuadratic factory function 
scrawl.makeQuadratic({
	name: 'firstQuad',
	startX: '5%',
	startY: '26.5%',
	controlX: '50%',
	controlY: '18%',
	endX: '95%',
	endY: '26.5%',
	handleY: 'center',
	lineWidth: 3,
	lineCap: 'round',
	strokeStyle: 'darkseagreen',
	method: 'draw',

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'secondQuad',
	startX: '7%',
	controlY: '15.5%',
	endX: '93%',

}).clone({
	name: 'thirdQuad',
	startX: '9%',
	controlY: '12%',
	endX: '91%',
});

// makeBezier factory function 
scrawl.makeBezier({
	name: 'firstBezier',
	startX: '5%',
	startY: '36%',
	startControlX: '40%',
	startControlY: '31%',
	endControlX: '60%',
	endControlY: '41%',
	endX: '95%',
	endY: '36%',
	handleY: 'center',
	lineWidth: 3,
	lineCap: 'round',
	strokeStyle: 'linen',
	method: 'draw',

	showBoundingBox: true,
	useAsPath: true,

}).clone({
	name: 'secondBezier',
	startX: '7%',
	startControlY: '25%',
	endControlY: '47%',
	endX: '93%',

}).clone({
	name: 'thirdBezier',
	startX: '9%',
	startControlY: '19%',
	endControlY: '53%',
	endX: '91%',
});

// makeTetragon factory function 
scrawl.makeTetragon({
	name: 'square',
	fillStyle: 'lightGreen',
	method: 'fillAndDraw',
	startX: 20,
	startY: 750,
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
	radiusY: '3%',
	intersectY: 1,

}).clone({
	name: 'arrow',
	startX: 330,
	radiusY: '2.6%',
	intersectY: 1.2,

}).clone({
	name: 'skewarrow',
	startX: 470,
	radius: 50,
	intersectX: 0.32,
});

// makePolygon factory function 
scrawl.makePolygon({
	name: 'equiTriangle',
	startX: 20,
	startY: 935,
	sideLength: 60,
	sides: 3,
	fillStyle: 'lightblue',
	method: 'fillAndDraw',

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

// makeStar factory function 
scrawl.makeStar({
	name: '5star',
	startX: 20,
	startY: 1080,
	radius1: 80,
	radius2: 50,
	points: 5,
	fillStyle: 'linen',
	method: 'fillAndDraw',

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

// makeSpiral factory function 
scrawl.makeSpiral({
	name: 'spiral1',
	strokeStyle: 'darkgreen',
	method: 'draw',
	startX: 50,
	startY: 1310,
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
	startY: 1550,
	loopIncrement: 0.3,
	innerRadius: 0,

}).clone({
	name: 'spiral4',
	startX: 50,
	loopIncrement: 0.3,
	innerRadius: 20,
});


// Create entitys to use the above Shape entitys as paths along which they can be animated
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
	addPathRotation: true,

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

}).clone({
	name: '_square',
	path: 'square',
	pathPosition: 0,

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

}).clone({
	name: '_spiral1',
	path: 'spiral1',
	pathPosition: 0,

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
