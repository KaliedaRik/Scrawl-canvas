import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


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
	radius: '6%',
	showBoundingBox: true,

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


// Display the scene
scrawl.render().catch(() => {});
