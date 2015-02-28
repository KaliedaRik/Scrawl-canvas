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
		events,
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
	document.getElementById('scale').value = '1';
	document.getElementById('roll').value = '0';
	document.getElementById('flip').value = 'normal';
	document.getElementById('loop').value = 'loop';
	document.getElementById('running').value = 'forward';
	document.getElementById('speed').value = '1';

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};
	events = function(e) {
		var items = {},
			temp;
		stop(e);
		switch (e.target.id) {
			case 'scale':
				items.scale = parseFloat(e.target.value);
				break;
			case 'roll':
				items.roll = Math.round(e.target.value);
				break;
			case 'flip':
				temp = e.target.value;
				items.flipReverse = scrawl.contains(['reverse', 'both'], temp) ? true : false;
				items.flipUpend = scrawl.contains(['upend', 'both'], temp) ? true : false;
				break;
			case 'speed':
				items.speed = parseFloat(e.target.value);
				break;
			case 'loop':
				items.loop = e.target.value;
				break;
			case 'running':
				items.running = e.target.value;
				break;
			default:
				items = false;
		}
		if (items) {
			myCat.set(items);
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	// event_speed = function(e) {
	// 	stopE(e);
	// 	current_speed = parseFloat(input_speed.value);
	// 	myCat.set({
	// 		speed: current_speed,
	// 	});
	// };
	// input_speed.addEventListener('input', event_speed, false);
	// input_speed.addEventListener('change', event_speed, false);

	// event_loop = function(e) {
	// 	stopE(e);
	// 	current_loop = input_loop.value;
	// 	myCat.set({
	// 		loop: current_loop,
	// 	});
	// };
	// input_loop.addEventListener('input', event_loop, false);
	// input_loop.addEventListener('change', event_loop, false);

	// event_running = function(e) {
	// 	stopE(e);
	// 	current_running = input_running.value;
	// 	myCat.set({
	// 		running: current_running,
	// 	});
	// };
	// input_running.addEventListener('input', event_running, false);
	// input_running.addEventListener('change', event_running, false);

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
