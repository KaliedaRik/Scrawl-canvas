var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// define variables
	var myPad = scrawl.pad.mycanvas,
		here,

		blocky,
		wheely,
		hollow,
		texty,
		pathy,
		shapy,
		piccy,
		framy,

		currentEntity,
		entitys,
		filter,
		currentFilter,
		filterDefinitions,

		input_entity = document.getElementById('entity'),
		input_filter = document.getElementById('filter'),

		event_entity,
		event_filter,

		stopE;

	// import image into scrawl library
	scrawl.getImagesByClass('demo101');

	scrawl.stack.mystack.set({
		width: 600,
		height: 300,
		perspectiveZ: 800
	});

	// set up multiFilters
	currentFilter = 'grayscale';
	filterDefinitions = {
		grayscale: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'grayscale'
		}),
		sepia: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'sepia'
		}),
		invert: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'invert'
		}),
		red: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'red'
		}),
		green: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'green'
		}),
		blue: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'blue'
		}),
		notred: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'notred'
		}),
		notgreen: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'notgreen'
		}),
		notblue: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'notblue'
		}),
		cyan: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'cyan'
		}),
		magenta: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'magenta'
		}),
		yellow: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'yellow'
		}),
		brightness: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'brightness',
			level: 2
		}),
		saturation: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'saturation',
			level: 2
		}),
		threshold: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'threshold',
			level: 127
		}),
		channels: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'channels',
			red: 0.8,
			green: 0.4,
			blue: 2
		}),
		channelstep: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'channelstep',
			red: 100,
			green: 100,
			blue: 100
		}),
		tint: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'tint',
			redInRed: 1,
			redInGreen: 0,
			redInBlue: 0.5,
			greenInRed: 0,
			greenInGreen: 0.5,
			greenInBlue: 0,
			blueInRed: 0.5,
			blueInGreen: 1.2,
			blueInBlue: 1
		}),
		pixelate: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'pixelate',
			blockWidth: 12,
			blockHeight: 12,
			offsetX: 0,
			offsetY: 0
		}),
		matrix: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'matrix',
			blockWidth: 3,
			blockHeight: 3,
			offsetX: -1,
			offsetY: -1,
			weights: [1, 1, 0, 1, 0, -1, 0, -1, -1]
		}),
		blur: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'blur',
			radius: 3,
			step: 1
		})
	};
	filter = scrawl.makeMultiFilter({
		name: 'myFilter',
		stencil: true,
		filters: filterDefinitions[currentFilter]
	});

	scrawl.makeGroup({
		name: 'eGroup',
		multiFilter: 'myFilter',
	});

	// define entitys
	scrawl.makePicture({
		name: 'background',
		width: 600,
		height: 300,
		copyX: 50,
		copyY: 50,
		copyWidth: 600,
		copyHeight: 300,
		order: 0,
		source: 'flower'
	});
	blocky = scrawl.makeBlock({
		width: 100,
		height: 100,
		roll: 30,
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
		visibility: false,
		group: 'eGroup'
	});
	wheely = scrawl.makeWheel({
		radius: 70,
		startAngle: 20,
		endAngle: 340,
		includeCenter: true,
		pivot: 'mouse',
		visibility: false,
		roll: 90,
		group: 'eGroup'
	});
	hollow = scrawl.makeWheel({
		startAngle: 20,
		endAngle: 340,
		includeCenter: true,
		lineWidth: 20,
		radius: 85,
		filterOnStroke: true,
		pivot: 'mouse',
		visibility: false,
		roll: 145,
		method: 'draw',
		group: 'eGroup'
	});
	scrawl.makeQuadratic({
		name: 'phrasepath',
		startX: 0,
		startY: 100,
		endX: 250,
		endY: 100,
		controlX: 125,
		controlY: 40,
		handleX: 'center',
		pivot: 'mouse',
		method: 'none',
		group: 'eGroup'
	});
	texty = scrawl.makePhrase({
		textAlign: 'center',
		font: '70pt bold Arial, sans-serif',
		text: 'Hello!',
		path: 'phrasepath',
		pathPlace: 0,
		textAlongPath: 'glyph',
		method: 'fill',
		visibility: false,
		group: 'eGroup'
	});
	pathy = scrawl.makeRegularShape({
		radius: 70,
		angle: 60,
		startControlX: 70,
		startControlY: 0,
		lineType: 'q',
		pivot: 'mouse',
		method: 'fill',
		visibility: false,
		group: 'eGroup'
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
		pivot: 'mouse',
		method: 'fill',
		visibility: false,
		group: 'eGroup'
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
        }]
	});
	piccy = scrawl.makePicture({
		handleX: 'center',
		handleY: 'center',
		width: 400,
		height: 200,
		source: 'runningcat',
		animation: 'animatedCat',
		pivot: 'mouse',
		visibility: false,
		group: 'eGroup'
	});
	framy = scrawl.makeFrame({
		handleX: 'center',
		handleY: 'center',
		width: 200,
		height: 100,
		pitch: 30,
		yaw: 60,
		source: 'swan',
		pivot: 'mouse',
		visibility: false,
		lockFrameTo: 'myframe',
		group: 'eGroup'
	});

	currentEntity = blocky;
	input_entity.value = 'blocky';
	input_filter.value = 'grayscale';

	// event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_entity = function(e) {
		stopE(e);
		switch (input_entity.value) {
			case 'wheely':
				currentEntity = wheely;
				break;
			case 'hollow':
				currentEntity = hollow;
				break;
			case 'texty':
				currentEntity = texty;
				break;
			case 'pathy':
				currentEntity = pathy;
				break;
			case 'shapy':
				currentEntity = shapy;
				break;
			case 'piccy':
				currentEntity = piccy;
				break;
			case 'framy':
				currentEntity = framy;
				break;
			default:
				currentEntity = blocky;
		}
	};
	input_entity.addEventListener('change', event_entity, false);

	event_filter = function(e) {
		stopE(e);
		currentFilter = input_filter.value;
		filter.set({
			filters: filterDefinitions[currentFilter]
		})
	};
	input_filter.addEventListener('change', event_filter, false);

	// input movement event listeners
	scrawl.addListener(['down', 'enter'], function(e) {
		if (e) {
			e.preventDefault();
			currentEntity.set({
				mouseIndex: here.id,
				visibility: true
			});
		}
	}, scrawl.canvas.mycanvas);
	scrawl.addListener(['up', 'leave'], function(e) {
		if (e) {
			e.preventDefault();
			currentEntity.set({
				visibility: false
			});
		}
	}, scrawl.canvas.mycanvas);

	// animation object
	scrawl.makeAnimation({
		fn: function() {

			// here = scrawl.stack.mystack.getMouse();
			here = myPad.getMouse();
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['images', 'animation', 'multifilters', 'block', 'wheel', 'phrase', 'path', 'shape', 'factories', 'stacks', 'frame'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
