var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var filter,

		current_alpha = 1,
		input_alpha = document.getElementById('alpha'),
		event_alpha,

		current_red = 2,
		input_red = document.getElementById('red'),
		event_red,

		current_green = 1,
		input_green = document.getElementById('green'),
		event_green,

		current_blue = 0,
		input_blue = document.getElementById('blue'),
		event_blue,

		stopE;

	//set the initial imput values
	input_alpha.value = '1';
	input_red.value = '2';
	input_green.value = '1';
	input_blue.value = '0';

	//define filter
	filter = scrawl.makeChannelsFilter({
		name: 'myfilter',
		alpha: 1,
		red: 2,
		green: 1,
		blue: 0,
	});

	//define entity
	scrawl.makePicture({
		name: 'parrot',
		copyWidth: 360,
		copyHeight: 360,
		pasteWidth: 360,
		pasteHeight: 360,
		copyX: 50,
		pasteX: 20,
		pasteY: 20,
		filters: ['myfilter'],
		// url: 'http://scrawl.rikweb.org.uk/img/carousel/cagedparrot.png',
		url: 'img/carousel/cagedparrot.png',
	});

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	event_alpha = function(e) {
		stopE(e);
		current_alpha = parseFloat(input_alpha.value);
		filter.set({
			alpha: current_alpha,
		});
	};
	input_alpha.addEventListener('input', event_alpha, false);
	input_alpha.addEventListener('change', event_alpha, false);

	event_red = function(e) {
		stopE(e);
		current_red = parseFloat(input_red.value);
		filter.set({
			red: current_red,
		});
	};
	input_red.addEventListener('input', event_red, false);
	input_red.addEventListener('change', event_red, false);

	event_green = function(e) {
		stopE(e);
		current_green = parseFloat(input_green.value);
		filter.set({
			green: current_green,
		});
	};
	input_green.addEventListener('input', event_green, false);
	input_green.addEventListener('change', event_green, false);

	event_blue = function(e) {
		stopE(e);
		current_blue = parseFloat(input_blue.value);
		filter.set({
			blue: current_blue,
		});
	};
	input_blue.addEventListener('input', event_blue, false);
	input_blue.addEventListener('change', event_blue, false);

	//animation object
	scrawl.makeAnimation({
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
	modules: ['images', 'filters', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
