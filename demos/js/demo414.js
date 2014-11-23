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

		current_minRed = 0,
		input_minRed = document.getElementById('minRed'),
		event_minRed,

		current_minGreen = 0,
		input_minGreen = document.getElementById('minGreen'),
		event_minGreen,

		current_minBlue = 0,
		input_minBlue = document.getElementById('minBlue'),
		event_minBlue,

		current_maxRed = 50,
		input_maxRed = document.getElementById('maxRed'),
		event_maxRed,

		current_maxGreen = 50,
		input_maxGreen = document.getElementById('maxGreen'),
		event_maxGreen,

		current_maxBlue = 50,
		input_maxBlue = document.getElementById('maxBlue'),
		event_maxBlue,

		stopE;

	//set the initial imput values
	input_alpha.value = '1';
	input_minRed.value = '0';
	input_minGreen.value = '0';
	input_minBlue.value = '0';
	input_maxRed.value = '50';
	input_maxGreen.value = '50';
	input_maxBlue.value = '50';

	//define filter
	filter = scrawl.newLeachFilter({
		name: 'myfilter',
		alpha: 1,
		minRed: 0,
		minGreen: 0,
		minBlue: 0,
		maxRed: 50,
		maxGreen: 50,
		maxBlue: 50,
		preserve: true,
	});

	//define entity
	scrawl.newPicture({
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

	event_minRed = function(e) {
		stopE(e);
		current_minRed = parseFloat(input_minRed.value);
		filter.set({
			minRed: current_minRed,
		});
	};
	input_minRed.addEventListener('input', event_minRed, false);
	input_minRed.addEventListener('change', event_minRed, false);

	event_minGreen = function(e) {
		stopE(e);
		current_minGreen = parseFloat(input_minGreen.value);
		filter.set({
			minGreen: current_minGreen,
		});
	};
	input_minGreen.addEventListener('input', event_minGreen, false);
	input_minGreen.addEventListener('change', event_minGreen, false);

	event_minBlue = function(e) {
		stopE(e);
		current_minBlue = parseFloat(input_minBlue.value);
		filter.set({
			minBlue: current_minBlue,
		});
	};
	input_minBlue.addEventListener('input', event_minBlue, false);
	input_minBlue.addEventListener('change', event_minBlue, false);

	event_maxRed = function(e) {
		stopE(e);
		current_maxRed = parseFloat(input_maxRed.value);
		filter.set({
			maxRed: current_maxRed,
		});
	};
	input_maxRed.addEventListener('input', event_maxRed, false);
	input_maxRed.addEventListener('change', event_maxRed, false);

	event_maxGreen = function(e) {
		stopE(e);
		current_maxGreen = parseFloat(input_maxGreen.value);
		filter.set({
			maxGreen: current_maxGreen,
		});
	};
	input_maxGreen.addEventListener('input', event_maxGreen, false);
	input_maxGreen.addEventListener('change', event_maxGreen, false);

	event_maxBlue = function(e) {
		stopE(e);
		current_maxBlue = parseFloat(input_maxBlue.value);
		filter.set({
			maxBlue: current_maxBlue,
		});
	};
	input_maxBlue.addEventListener('input', event_maxBlue, false);
	input_maxBlue.addEventListener('change', event_maxBlue, false);

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
	modules: ['images', 'filters', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
