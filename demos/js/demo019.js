var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myCat,

		current_scale = 1,
		current_roll = 0,
		current_flip = 'normal',
		current_loop = 'loop',
		current_running = 'forward',
		current_speed = 1,

		input_scale = document.getElementById('scale'),
		input_roll = document.getElementById('roll'),
		input_flip = document.getElementById('flip'),
		input_loop = document.getElementById('loop'),
		input_running = document.getElementById('running'),
		input_speed = document.getElementById('speed'),

		event_scale,
		event_roll,
		event_flip,
		event_loop,
		event_running,
		event_speed,

		stopE;

	//load entitysheet into scrawl library
	scrawl.getImagesByClass('demo019');

	//define AnimSheet object
	scrawl.newSpriteAnimation({
		name: 'animatedCat',
		running: 'forward',
		loop: 'loop',
		speed: 1,
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

	//define Picture entity which will display animation
	myCat = scrawl.newPicture({
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		width: 400,
		height: 200,
		method: 'fill',
		source: 'runningcat',
		animation: 'animatedCat',
	});

	//set the initial imput values
	input_scale.value = '1';
	input_roll.value = '0';
	input_flip.value = 'normal';
	input_loop.value = 'loop';
	input_running.value = 'forward';
	input_speed.value = '1';

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_scale = function(e) {
		stopE(e);
		current_scale = parseFloat(input_scale.value);
		myCat.set({
			scale: current_scale,
		});
	};
	input_scale.addEventListener('input', event_scale, false);
	input_scale.addEventListener('change', event_scale, false);

	event_roll = function(e) {
		stopE(e);
		current_roll = parseInt(input_roll.value, 10);
		myCat.set({
			roll: current_roll,
		});
	};
	input_roll.addEventListener('input', event_roll, false);
	input_roll.addEventListener('change', event_roll, false);

	event_flip = function(e) {
		var r, u;
		stopE(e);
		current_flip = input_flip.value;
		switch (current_flip) {
			case 'reverse':
				r = true;
				u = false;
				break;
			case 'upend':
				r = false;
				u = true;
				break;
			case 'both':
				r = true;
				u = true;
				break;
			default:
				r = false;
				u = false;
		}
		myCat.set({
			flipReverse: r,
			flipUpend: u,
		});
	};
	input_flip.addEventListener('input', event_flip, false);
	input_flip.addEventListener('change', event_flip, false);

	event_speed = function(e) {
		stopE(e);
		current_speed = parseFloat(input_speed.value);
		myCat.set({
			speed: current_speed,
		});
	};
	input_speed.addEventListener('input', event_speed, false);
	input_speed.addEventListener('change', event_speed, false);

	event_loop = function(e) {
		stopE(e);
		current_loop = input_loop.value;
		myCat.set({
			loop: current_loop,
		});
	};
	input_loop.addEventListener('input', event_loop, false);
	input_loop.addEventListener('change', event_loop, false);

	event_running = function(e) {
		stopE(e);
		current_running = input_running.value;
		myCat.set({
			running: current_running,
		});
	};
	input_running.addEventListener('input', event_running, false);
	input_running.addEventListener('change', event_running, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
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
	modules: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
