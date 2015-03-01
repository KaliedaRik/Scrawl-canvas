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
		here,

		blocky,
		wheely,
		texty,
		pathy,
		shapy,
		piccy,

		current_entity,
		entitys,
		current_filter,

		input_entity = document.getElementById('entity'),
		input_filter = document.getElementById('filter'),

		event_entity,
		event_filter,

		stopE;

	//import image into scrawl library
	scrawl.getImagesByClass('demo101');

	//define filters
	scrawl.makeGreyscaleFilter({
		name: 'myGreyscale',
		filterStrength: 0.9,
	});
	scrawl.makeInvertFilter({
		name: 'myInvert',
	});
	scrawl.makeBrightnessFilter({
		name: 'myBrightness',
		brightness: 0.4,
	});
	scrawl.makeSaturationFilter({
		name: 'mySaturation',
		saturation: 0.4,
	});
	scrawl.makeThresholdFilter({
		name: 'myThreshold',
		filterStrength: 0.8,
		threshold: 0.6,
	});
	scrawl.makeChannelsFilter({
		name: 'myChannels',
		red: 1.3,
		green: '120%',
		blue: 0,
	});
	scrawl.makeChannelStepFilter({
		name: 'myChannelStep',
		red: 64,
		green: 64,
		blue: 64,
	});
	scrawl.makeTintFilter({
		name: 'myTint',
		greenInGreen: 0,
		blueInGreen: 1,
	});
	scrawl.makeSepiaFilter({
		name: 'mySepia',
	});
	scrawl.makeMatrixFilter({
		name: 'myMatrix',
		data: [-2, -1, 0, -1, 0, 1, 0, 1, 2],
	});
	scrawl.makeSharpenFilter({
		name: 'mySharpen',
	});
	scrawl.makePixelateFilter({
		name: 'myPixelate',
		width: 8,
		height: 8,
	});
	scrawl.makeBlurFilter({
		name: 'myBlur',
		radiusX: 12,
		radiusY: 4,
		roll: 45,
		includeInvisiblePoints: true,
	});
	scrawl.makeLeachFilter({
		name: 'myLeach',
		exclude: [[0, 40, 0, 200, 255, 100]],
	});
	scrawl.makeSeparateFilter({
		name: 'mySeparate',
		channel: 'yellow',
	});
	scrawl.makeNoiseFilter({
		name: 'myNoise',
		radiusX: 12,
		radiusY: 4,
		roll: 45,
		noise: 1,
	});

	current_filter = 'myGreyscale';

	//define entitys
	scrawl.makePicture({
		name: 'background',
		width: 600,
		height: 300,
		copyX: 50,
		copyY: 50,
		copyWidth: 600,
		copyHeight: 300,
		source: 'flower',
	});
	blocky = scrawl.makeBlock({
		width: 100,
		height: 100,
		roll: 30,
		method: 'draw',
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
		visibility: false,
		filters: [current_filter],
	});
	wheely = scrawl.makeWheel({
		radius: 70,
		startAngle: 20,
		endAngle: 340,
		includeCenter: true,
		roll: 90,
		method: 'draw',
		pivot: 'mouse',
		visibility: false,
		filters: [current_filter],
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
	texty = scrawl.makePhrase({
		method: 'draw',
		textAlign: 'center',
		font: '70pt bold Arial, sans-serif',
		text: 'Hello!',
		path: 'phrasepath',
		pathPlace: 0,
		textAlongPath: 'glyph',
		visibility: false,
		filters: [current_filter],
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
		filters: [current_filter],
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
		filters: [current_filter],
	});
	scrawl.makeSpriteAnimation({
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
	piccy = scrawl.makePicture({
		handleX: 'center',
		handleY: 'center',
		width: 400,
		height: 200,
		method: 'none',
		source: 'runningcat',
		animation: 'animatedCat',
		pivot: 'mouse',
		visibility: false,
		filters: [current_filter],
	});

	current_entity = blocky;
	entitys = [blocky, wheely, texty, pathy, shapy, piccy];
	input_entity.value = 'blocky';
	input_filter.value = 'myGreyscale';

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_entity = function(e) {
		stopE(e);
		switch (input_entity.value) {
			case 'wheely':
				current_entity = wheely;
				break;
			case 'texty':
				current_entity = texty;
				break;
			case 'pathy':
				current_entity = pathy;
				break;
			case 'shapy':
				current_entity = shapy;
				break;
			case 'piccy':
				current_entity = piccy;
				break;
			default:
				current_entity = blocky;
		}
	};
	input_entity.addEventListener('change', event_entity, false);

	event_filter = function(e) {
		stopE(e);
		current_filter = input_filter.value;

		for (var i = 0, iz = entitys.length; i < iz; i++) {
			entitys[i].set({
				filters: [current_filter],
			});
		}
	};
	input_filter.addEventListener('change', event_filter, false);

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			here = myPad.getMouse();

			current_entity.set({
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
