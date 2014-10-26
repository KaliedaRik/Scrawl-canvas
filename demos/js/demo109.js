var mycode = function() {
	'use strict';

	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var block,
		wheel,
		phrase,
		image,
		shape,
		path,

		current_block_x = '10%',
		current_block_y = '10%',
		current_block_width = '10%',
		current_block_height = '10%',
		current_wheel_x = '10%',
		current_wheel_y = '10%',
		current_phrase_x = '10%',
		current_phrase_y = '10%',
		current_shape_x = '10%',
		current_shape_y = '10%',
		current_path_x = '10%',
		current_path_y = '10%',
		current_image_width = '10%',
		current_image_height = '10%',
		current_image_x = '10%',
		current_image_y = '10%',

		input_block_x = document.getElementById('block_startX'),
		input_block_y = document.getElementById('block_startY'),
		input_block_width = document.getElementById('block_width'),
		input_block_height = document.getElementById('block_height'),
		input_wheel_x = document.getElementById('wheel_startX'),
		input_wheel_y = document.getElementById('wheel_startY'),
		input_phrase_x = document.getElementById('phrase_startX'),
		input_phrase_y = document.getElementById('phrase_startY'),
		input_shape_x = document.getElementById('shape_startX'),
		input_shape_y = document.getElementById('shape_startY'),
		input_path_x = document.getElementById('path_startX'),
		input_path_y = document.getElementById('path_startY'),
		input_image_width = document.getElementById('image_width'),
		input_image_height = document.getElementById('image_height'),
		input_image_x = document.getElementById('image_startX'),
		input_image_y = document.getElementById('image_startY'),

		event_block_x,
		event_block_y,
		event_block_width,
		event_block_height,
		event_wheel_x,
		event_wheel_y,
		event_phrase_x,
		event_phrase_y,
		event_shape_x,
		event_shape_y,
		event_path_x,
		event_path_y,
		event_image_width,
		event_image_height,
		event_image_x,
		event_image_y,

		stopE;

	//code here
	scrawl.getImagesByClass('demo109');

	block = scrawl.newBlock({
		name: 'myBlock',
		startX: '15%',
		startY: '20%',
		width: '10%',
		height: '10%',
		method: 'fillDraw',
		fillStyle: 'lightblue',
		strokeStyle: 'green',
		lineWidth: 3,
		handleX: 'center',
		handleY: 'center',
	});
	image = scrawl.newPicture({
		name: 'myImage',
		startX: '45%',
		startY: '70%',
		source: 'parrot',
		width: '20%',
		height: '20%',
		handleX: 'center',
		handleY: 'center',
	});
	wheel = scrawl.newWheel({
		name: 'myWheel',
		startX: '50%',
		startY: '20%',
		radius: 40,
		method: 'fillDraw',
		fillStyle: 'yellow',
		strokeStyle: 'brown',
		lineWidth: 3,
	});
	phrase = scrawl.newPhrase({
		name: 'myPhrase',
		text: 'Hello world!\nHow are you today?',
		font: '20pt Arial',
		startX: '80%',
		startY: '40%',
		handleX: 'center',
		handleY: 'center',
		textAlign: 'center',
		fillStyle: 'orange',
	});
	shape = scrawl.makeLine({
		name: 'myShape',
		startX: '10%',
		startY: '70%',
		endX: '15%',
		endY: '90%',
		shape: true,
		strokeStyle: 'pink',
		lineWidth: 6,
		lineCap: 'round',
	});
	path = scrawl.makeEllipse({
		name: 'myPath',
		startX: '85%',
		startY: '80%',
		radiusX: 25,
		radiusY: 45,
		roll: 45,
		strokeStyle: 'green',
		lineWidth: 3,
	});

	scrawl.newWheel({
		pivot: 'myBlock',
		fillStyle: 'red',
		radius: 4,
	}).clone({
		pivot: 'myWheel',
	}).clone({
		pivot: 'myPhrase',
	}).clone({
		pivot: 'myShape',
	}).clone({
		pivot: 'myPath',
	}).clone({
		pivot: 'myImage',
	});

	input_block_x.value = 15;
	input_block_y.value = 20;
	input_block_width.value = 10;
	input_block_height.value = 10;
	input_wheel_x.value = 50;
	input_wheel_y.value = 20;
	input_phrase_x.value = 80;
	input_phrase_y.value = 40;
	input_shape_x.value = 10;
	input_shape_y.value = 70;
	input_path_x.value = 85;
	input_path_y.value = 80;
	input_image_width.value = 20;
	input_image_height.value = 20;
	input_image_x.value = 45;
	input_image_y.value = 70;

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_block_x = function(e) {
		stopE(e);
		current_block_x = input_block_x.value + '%';
		block.set({
			startX: current_block_x,
		});
	};
	input_block_x.addEventListener('input', event_block_x, false);
	input_block_x.addEventListener('change', event_block_x, false);
	event_block_y = function(e) {
		stopE(e);
		current_block_y = input_block_y.value + '%';
		block.set({
			startY: current_block_y,
		});
	};
	input_block_y.addEventListener('input', event_block_y, false);
	input_block_y.addEventListener('change', event_block_y, false);

	event_block_width = function(e) {
		stopE(e);
		current_block_width = input_block_width.value + '%';
		block.set({
			width: current_block_width,
		});
	};
	input_block_width.addEventListener('input', event_block_width, false);
	input_block_width.addEventListener('change', event_block_width, false);
	event_block_height = function(e) {
		stopE(e);
		current_block_height = input_block_height.value + '%';
		block.set({
			height: current_block_height,
		});
	};
	input_block_height.addEventListener('input', event_block_height, false);
	input_block_height.addEventListener('change', event_block_height, false);

	event_wheel_x = function(e) {
		stopE(e);
		current_wheel_x = input_wheel_x.value + '%';
		wheel.set({
			startX: current_wheel_x,
		});
	};
	input_wheel_x.addEventListener('input', event_wheel_x, false);
	input_wheel_x.addEventListener('change', event_wheel_x, false);
	event_wheel_y = function(e) {
		stopE(e);
		current_wheel_y = input_wheel_y.value + '%';
		wheel.set({
			startY: current_wheel_y,
		});
	};
	input_wheel_y.addEventListener('input', event_wheel_y, false);
	input_wheel_y.addEventListener('change', event_wheel_y, false);

	event_phrase_x = function(e) {
		stopE(e);
		current_phrase_x = input_phrase_x.value + '%';
		phrase.set({
			startX: current_phrase_x,
		});
	};
	input_phrase_x.addEventListener('input', event_phrase_x, false);
	input_phrase_x.addEventListener('change', event_phrase_x, false);
	event_phrase_y = function(e) {
		stopE(e);
		current_phrase_y = input_phrase_y.value + '%';
		phrase.set({
			startY: current_phrase_y,
		});
	};
	input_phrase_y.addEventListener('input', event_phrase_y, false);
	input_phrase_y.addEventListener('change', event_phrase_y, false);

	event_shape_x = function(e) {
		stopE(e);
		current_shape_x = input_shape_x.value + '%';
		shape.set({
			startX: current_shape_x,
		});
	};
	input_shape_x.addEventListener('input', event_shape_x, false);
	input_shape_x.addEventListener('change', event_shape_x, false);
	event_shape_y = function(e) {
		stopE(e);
		current_shape_y = input_shape_y.value + '%';
		shape.set({
			startY: current_shape_y,
		});
	};
	input_shape_y.addEventListener('input', event_shape_y, false);
	input_shape_y.addEventListener('change', event_shape_y, false);

	event_path_x = function(e) {
		stopE(e);
		current_path_x = input_path_x.value + '%';
		path.set({
			startX: current_path_x,
		});
	};
	input_path_x.addEventListener('input', event_path_x, false);
	input_path_x.addEventListener('change', event_path_x, false);
	event_path_y = function(e) {
		stopE(e);
		current_path_y = input_path_y.value + '%';
		path.set({
			startY: current_path_y,
		});
	};
	input_path_y.addEventListener('input', event_path_y, false);
	input_path_y.addEventListener('change', event_path_y, false);

	event_image_x = function(e) {
		stopE(e);
		current_image_x = input_image_x.value + '%';
		image.set({
			startX: current_image_x,
		});
	};
	input_image_x.addEventListener('input', event_image_x, false);
	input_image_x.addEventListener('change', event_image_x, false);
	event_image_y = function(e) {
		stopE(e);
		current_image_y = input_image_y.value + '%';
		image.set({
			startY: current_image_y,
		});
	};
	input_image_y.addEventListener('input', event_image_y, false);
	input_image_y.addEventListener('change', event_image_y, false);

	event_image_width = function(e) {
		stopE(e);
		current_image_width = input_image_width.value + '%';
		image.set({
			width: current_image_width,
		});
	};
	input_image_width.addEventListener('input', event_image_width, false);
	input_image_width.addEventListener('change', event_image_width, false);
	event_image_height = function(e) {
		stopE(e);
		current_image_height = input_image_height.value + '%';
		image.set({
			height: current_image_height,
		});
	};
	input_image_height.addEventListener('input', event_image_height, false);
	input_image_height.addEventListener('change', event_image_height, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {

			//code here
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
		},
	});

};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel', 'images', 'phrase', 'shape', 'path', 'factories', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
