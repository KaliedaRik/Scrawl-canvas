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

		current_width = 10,
		input_width = document.getElementById('width'),
		event_width,

		current_height = 10,
		input_height = document.getElementById('height'),
		event_height,

		current_offsetX = 0,
		input_offsetX = document.getElementById('offsetX'),
		event_offsetX,

		current_offsetY = 0,
		input_offsetY = document.getElementById('offsetY'),
		event_offsetY,

		stopE;

	//set the initial imput values
	input_alpha.value = '1';
	input_width.value = '10';
	input_height.value = '10';
	input_offsetX.value = '0';
	input_offsetY.value = '0';

	//define filter
	filter = scrawl.makePixelateFilter({
		name: 'myfilter',
		alpha: 1,
		width: 10,
		height: 10,
		offsetX: 0,
		offsetY: 0,
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

	event_width = function(e) {
		stopE(e);
		current_width = parseFloat(input_width.value);
		filter.set({
			width: current_width,
		});
	};
	input_width.addEventListener('input', event_width, false);
	input_width.addEventListener('change', event_width, false);

	event_height = function(e) {
		stopE(e);
		current_height = parseFloat(input_height.value);
		filter.set({
			height: current_height,
		});
	};
	input_height.addEventListener('input', event_height, false);
	input_height.addEventListener('change', event_height, false);

	event_offsetX = function(e) {
		stopE(e);
		current_offsetX = parseFloat(input_offsetX.value);
		filter.set({
			offsetX: current_offsetX,
		});
	};
	input_offsetX.addEventListener('input', event_offsetX, false);
	input_offsetX.addEventListener('change', event_offsetX, false);

	event_offsetY = function(e) {
		stopE(e);
		current_offsetY = parseFloat(input_offsetY.value);
		filter.set({
			offsetY: current_offsetY,
		});
	};
	input_offsetY.addEventListener('input', event_offsetY, false);
	input_offsetY.addEventListener('change', event_offsetY, false);

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
