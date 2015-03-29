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

		current_redInRed = 0,
		input_redInRed = document.getElementById('redInRed'),
		event_redInRed,

		current_redInGreen = 1,
		input_redInGreen = document.getElementById('redInGreen'),
		event_redInGreen,

		current_redInBlue = 0,
		input_redInBlue = document.getElementById('redInBlue'),
		event_redInBlue,

		current_greenInRed = 0,
		input_greenInRed = document.getElementById('greenInRed'),
		event_greenInRed,

		current_greenInGreen = 0,
		input_greenInGreen = document.getElementById('greenInGreen'),
		event_greenInGreen,

		current_greenInBlue = 1,
		input_greenInBlue = document.getElementById('greenInBlue'),
		event_greenInBlue,

		current_blueInRed = 1,
		input_blueInRed = document.getElementById('blueInRed'),
		event_blueInRed,

		current_blueInGreen = 0,
		input_blueInGreen = document.getElementById('blueInGreen'),
		event_blueInGreen,

		current_blueInBlue = 0,
		input_blueInBlue = document.getElementById('blueInBlue'),
		event_blueInBlue,

		stopE;

	//set the initial imput values
	input_alpha.value = '1';
	input_redInRed.value = '0';
	input_redInGreen.value = '1';
	input_redInBlue.value = '0';
	input_greenInRed.value = '0';
	input_greenInGreen.value = '0';
	input_greenInBlue.value = '1';
	input_blueInRed.value = '1';
	input_blueInGreen.value = '0';
	input_blueInBlue.value = '0';

	//define filter
	filter = scrawl.makeTintFilter({
		name: 'myfilter',
		alpha: 1,
		redInRed: 0,
		redInGreen: 1,
		redInBlue: 0,
		greenInRed: 0,
		greenInGreen: 0,
		greenInBlue: 1,
		blueInRed: 1,
		blueInGreen: 0,
		blueInBlue: 0,
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

	event_redInRed = function(e) {
		stopE(e);
		current_redInRed = parseFloat(input_redInRed.value);
		filter.set({
			redInRed: current_redInRed,
		});
	};
	input_redInRed.addEventListener('input', event_redInRed, false);
	input_redInRed.addEventListener('change', event_redInRed, false);

	event_redInGreen = function(e) {
		stopE(e);
		current_redInGreen = parseFloat(input_redInGreen.value);
		filter.set({
			redInGreen: current_redInGreen,
		});
	};
	input_redInGreen.addEventListener('input', event_redInGreen, false);
	input_redInGreen.addEventListener('change', event_redInGreen, false);

	event_redInBlue = function(e) {
		stopE(e);
		current_redInBlue = parseFloat(input_redInBlue.value);
		filter.set({
			redInBlue: current_redInBlue,
		});
	};
	input_redInBlue.addEventListener('input', event_redInBlue, false);
	input_redInBlue.addEventListener('change', event_redInBlue, false);

	event_greenInRed = function(e) {
		stopE(e);
		current_greenInRed = parseFloat(input_greenInRed.value);
		filter.set({
			greenInRed: current_greenInRed,
		});
	};
	input_greenInRed.addEventListener('input', event_greenInRed, false);
	input_greenInRed.addEventListener('change', event_greenInRed, false);

	event_greenInGreen = function(e) {
		stopE(e);
		current_greenInGreen = parseFloat(input_greenInGreen.value);
		filter.set({
			greenInGreen: current_greenInGreen,
		});
	};
	input_greenInGreen.addEventListener('input', event_greenInGreen, false);
	input_greenInGreen.addEventListener('change', event_greenInGreen, false);

	event_greenInBlue = function(e) {
		stopE(e);
		current_greenInBlue = parseFloat(input_greenInBlue.value);
		filter.set({
			greenInBlue: current_greenInBlue,
		});
	};
	input_greenInBlue.addEventListener('input', event_greenInBlue, false);
	input_greenInBlue.addEventListener('change', event_greenInBlue, false);

	event_blueInRed = function(e) {
		stopE(e);
		current_blueInRed = parseFloat(input_blueInRed.value);
		filter.set({
			blueInRed: current_blueInRed,
		});
	};
	input_blueInRed.addEventListener('input', event_blueInRed, false);
	input_blueInRed.addEventListener('change', event_blueInRed, false);

	event_blueInGreen = function(e) {
		stopE(e);
		current_blueInGreen = parseFloat(input_blueInGreen.value);
		filter.set({
			blueInGreen: current_blueInGreen,
		});
	};
	input_blueInGreen.addEventListener('input', event_blueInGreen, false);
	input_blueInGreen.addEventListener('change', event_blueInGreen, false);

	event_blueInBlue = function(e) {
		stopE(e);
		current_blueInBlue = parseFloat(input_blueInBlue.value);
		filter.set({
			blueInBlue: current_blueInBlue,
		});
	};
	input_blueInBlue.addEventListener('input', event_blueInBlue, false);
	input_blueInBlue.addEventListener('change', event_blueInBlue, false);

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
