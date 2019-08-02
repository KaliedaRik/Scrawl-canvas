import scrawl from '../source/scrawl.js'


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
	backgroundColor: 'aliceblue'
});

scrawl.makeParticle({

	name: 'particle-0',

	mass: 100,

	startX: 'center',
	startY: 50,

}).clone({

	name: 'particle-1',
	forces: ['defaultGravity', scrawl.library.force.defaultDrag],
	mass: 2,
	startY: 70,

}).clone({

	name: 'particle-2',
	startY: 90,

}).clone({

	name: 'particle-3',
	startY: 110,

}).clone({

	name: 'particle-4',
	startY: 130,

}).clone({

	name: 'particle-5',
	startY: 150,

}).clone({

	name: 'particle-6',
	startY: 170,

}).clone({

	name: 'particle-7',
	startY: 190,

}).clone({

	name: 'particle-8',
	startY: 210,

}).clone({

	name: 'particle-9',
	startY: 230,
});

scrawl.makeSpring({

	name: 'spring-0',

	start: 'particle-0',
	end: 'particle-1',

	restLength: 10,
});

scrawl.makeWheel({

	name: 'wheel-0',
	radius: 10,

	handleX: 'center',
	handleY: 'center',

	pivot: 'particle-0',
	lockTo: 'pivot',

	fillStyle: '#99ffff',
	strokeStyle: 'darkblue',
	method: 'fillAndDraw',

}).clone({

	name: 'wheel-1',
	fillStyle: '#88ffff',
	pivot: 'particle-1',

}).clone({

	name: 'wheel-2',
	fillStyle: '#77ffff',
	pivot: 'particle-2',

}).clone({

	name: 'wheel-3',
	fillStyle: '#66ffff',
	pivot: 'particle-3',

}).clone({

	name: 'wheel-4',
	fillStyle: '#55ffff',
	pivot: 'particle-4',

}).clone({

	name: 'wheel-5',
	fillStyle: '#44ffff',
	pivot: 'particle-5',

}).clone({

	name: 'wheel-6',
	fillStyle: '#33ffff',
	pivot: 'particle-6',

}).clone({

	name: 'wheel-7',
	fillStyle: '#22ffff',
	pivot: 'particle-7',

}).clone({

	name: 'wheel-8',
	fillStyle: '#11ffff',
	pivot: 'particle-8',

}).clone({

	name: 'wheel-9',
	fillStyle: '#00ffff',
	pivot: 'particle-9',
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

console.log(scrawl.library)