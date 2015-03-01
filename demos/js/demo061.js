var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var track,
		trains,
		temp;

	//import images into scrawl library
	scrawl.getImagesByClass('demo061');

	//define groups
	trains = scrawl.makeGroup({ //train group
		name: 'trains',
	});

	//define entitys
	track = scrawl.makeEllipse({ //train track
		name: 'track',
		startX: 300,
		startY: 300,
		radiusX: 230,
		radiusY: 120,
		precision: 100,
	});

	scrawl.makeEllipse({ //trains
		name: 'Percy',
		radiusX: 30,
		radiusY: 10,
		pathPlace: 0,
		lineWidth: 2,
		fillStyle: 'yellow',
		method: 'fillDraw',
		group: 'trains',
	});

	scrawl.newBlock({
		name: 'Chica',
		width: 60,
		height: 30,
		handleX: 'center',
		handleY: 'center',
		pathPlace: 0.1,
		lineWidth: 2,
		fillStyle: 'grey',
		method: 'fillDraw',
		group: 'trains',
	});

	scrawl.makeRegularShape({
		name: 'Hercules',
		sides: 5,
		radius: 30,
		pathPlace: 0.2,
		lineWidth: 2,
		roll: 54,
		fillStyle: 'lightblue',
		method: 'fillDraw',
		group: 'trains',
	});

	scrawl.makeQuadratic({
		name: 'Typhoon',
		startX: 250,
		startY: 200,
		endX: 350,
		endY: 200,
		controlX: 300,
		controlY: 90,
		pathPlace: 0.3,
		lineWidth: 2,
		group: 'trains',
	});

	temp = scrawl.makeLine({
		name: 'Hair',
		endY: 150,
		pathPlace: 0.25,
		lineWidth: 2,
		strokeStyle: 'orange',
		group: 'trains',
	});
	for (var i = 1; i < 10; i++) {
		temp.clone({
			pathPlace: 0.25 + (0.01 * i),
		});
	}

	temp = scrawl.makeRectangle({
		name: 'Peter',
		width: 60,
		height: 20,
		radius: 10,
		pathPlace: 0.445,
		lineWidth: 2,
		fillStyle: 'red',
		method: 'fillDraw',
		group: 'trains',
	});
	temp.clone({
		name: 'Ivor',
		pathPlace: 0.5,
		fillStyle: 'blue',
	});
	temp.clone({
		name: 'Gordon',
		pathPlace: 0.555,
		fillStyle: 'green',
	});

	scrawl.newPhrase({
		name: 'Steve',
		text: 'Hello, everyone!',
		font: '20pt Arial, sans-serif',
		textAlign: 'center',
		textAlongPath: true,
		pathPlace: 0.6,
		group: 'trains',
	});

	scrawl.newWheel({
		name: 'Jimmy',
		fillStyle: 'pink',
		radius: 25,
		startAngle: 15,
		endAngle: -15,
		lineWidth: 2,
		method: 'fillDraw',
		includeCenter: true,
		pathPlace: 0.81,
		group: 'trains',
	});

	scrawl.newSpriteAnimation({
		name: 'animatedCat',
		running: 'forward',
		loop: 'loop',
		speed: 1.2,
		frames: [{
			x: 0,
			y: 0,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 0,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 256,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 256,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 512,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 512,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 0,
			y: 768,
			w: 512,
			h: 256,
			d: 100,
        }, {
			x: 512,
			y: 768,
			w: 512,
			h: 256,
			d: 100,
        }, ],
	});
	scrawl.newPicture({
		name: 'Charlie',
		width: 128,
		height: 64,
		handleX: 'center',
		handleY: 'bottom',
		method: 'fill',
		source: 'runningcat',
		animation: 'animatedCat',
		pathPlace: 0.9,
		group: 'trains',
	});

	trains.setEntitysTo({
		path: 'track',
		deltaPathPlace: 0.0015,
		addPathRoll: true,
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			track.setDelta({
				roll: -0.2,
			});
			trains.updateStart();
			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel', 'factories', 'animation', 'images', 'path', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
