var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		blocky,
		wheely,
		texty,
		pathy,
		shapy,
		piccy,
		currentEntity,
		currentFilter,
		here;

	//import image into scrawl library
	scrawl.getImagesByClass('demo101');

	//define filters
	scrawl.newGreyscaleFilter({
		name: 'myGreyscale',
	});

	currentFilter = 'myGreyscale';

	//define entitys
	scrawl.newPicture({
		name: 'background',
		width: 600,
		height: 300,
		copyX: 50,
		copyY: 50,
		copyWidth: 600,
		copyHeight: 300,
		source: 'flower',
	});
	blocky = scrawl.newBlock({
		width: 100,
		height: 100,
		roll: 30,
		method: 'draw',
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
		visibility: false,
		filters: [currentFilter],
	});
	wheely = scrawl.newWheel({
		radius: 70,
		startAngle: 20,
		endAngle: 340,
		includeCenter: true,
		roll: 90,
		method: 'draw',
		pivot: 'mouse',
		visibility: false,
		filters: [currentFilter],
	});
	scrawl.makeQuadratic({
		name: 'phrasepath',
		startX: 0,
		startY: 100,
		endX: 250,
		endY: 100,
		controlX: 125,
		controlY: 40,
		pivot: 'mouse',
		method: 'none',
	});
	texty = scrawl.newPhrase({
		method: 'draw',
		textAlign: 'center',
		font: '70pt bold Arial, sans-serif',
		text: 'Hello!',
		path: 'phrasepath',
		pathPlace: 0,
		textAlongPath: 'glyph',
		visibility: false,
		filters: [currentFilter],
	});
	pathy = scrawl.makeRegularShape({
		radius: 70,
		angle: 60,
		startControlX: 70,
		startControlY: 0,
		lineType: 'q',
		method: 'draw',
		pivot: 'mouse',
		visibility: false,
		filters: [currentFilter],
	});
	shapy = scrawl.makeRegularShape({
		radius: 70,
		angle: 45,
		startControlX: 100,
		startControlY: -30,
		endControlX: -30,
		endControlY: 10,
		lineType: 'c',
		shape: true,
		method: 'draw',
		pivot: 'mouse',
		visibility: false,
		filters: [currentFilter],
	});
	scrawl.newSpriteAnimation({
		name: 'animatedCat',
		running: 'forward',
		loop: 'loop',
		speed: 1.3,
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
	piccy = scrawl.newPicture({
		handleX: 'center',
		handleY: 'center',
		width: 400,
		height: 200,
		method: 'fill',
		source: 'runningcat',
		animation: 'animatedCat',
		pivot: 'mouse',
		visibility: false,
		filters: [currentFilter],
	});

	currentEntity = piccy;

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();

			currentEntity.set({
				visibility: (here.active) ? true : false,
			});

			scrawl.render();

			//TEMPORARY, for testing
			scrawl.canvas.tempcanvas.width = 600;
			scrawl.context.tempcanvas.drawImage(scrawl.cv, 0, 0, 600, 300);

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
	modules: ['images', 'animation', 'filters', 'block', 'wheel', 'phrase', 'path', 'shape', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
