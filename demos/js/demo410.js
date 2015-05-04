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

		current_cell00 = 0,
		input_cell00 = document.getElementById('cell00'),
		event_cell00,

		current_cell01 = 0,
		input_cell01 = document.getElementById('cell01'),
		event_cell01,

		current_cell02 = 0,
		input_cell02 = document.getElementById('cell02'),
		event_cell02,

		current_cell03 = 0,
		input_cell03 = document.getElementById('cell03'),
		event_cell03,

		current_cell04 = 0,
		input_cell04 = document.getElementById('cell04'),
		event_cell04,

		current_cell05 = 0,
		input_cell05 = document.getElementById('cell05'),
		event_cell05,

		current_cell06 = -2,
		input_cell06 = document.getElementById('cell06'),
		event_cell06,

		current_cell07 = -1,
		input_cell07 = document.getElementById('cell07'),
		event_cell07,

		current_cell08 = 0,
		input_cell08 = document.getElementById('cell08'),
		event_cell08,

		current_cell09 = 0,
		input_cell09 = document.getElementById('cell09'),
		event_cell09,

		current_cell10 = 0,
		input_cell10 = document.getElementById('cell10'),
		event_cell10,

		current_cell11 = -1,
		input_cell11 = document.getElementById('cell11'),
		event_cell11,

		current_cell12 = 1,
		input_cell12 = document.getElementById('cell12'),
		event_cell12,

		current_cell13 = 1,
		input_cell13 = document.getElementById('cell13'),
		event_cell13,

		current_cell14 = 0,
		input_cell14 = document.getElementById('cell14'),
		event_cell14,

		current_cell15 = 0,
		input_cell15 = document.getElementById('cell15'),
		event_cell15,

		current_cell16 = 0,
		input_cell16 = document.getElementById('cell16'),
		event_cell16,

		current_cell17 = 1,
		input_cell17 = document.getElementById('cell17'),
		event_cell17,

		current_cell18 = 2,
		input_cell18 = document.getElementById('cell18'),
		event_cell18,

		current_cell19 = 0,
		input_cell19 = document.getElementById('cell19'),
		event_cell19,

		current_cell20 = 0,
		input_cell20 = document.getElementById('cell20'),
		event_cell20,

		current_cell21 = 0,
		input_cell21 = document.getElementById('cell21'),
		event_cell21,

		current_cell22 = 0,
		input_cell22 = document.getElementById('cell22'),
		event_cell22,

		current_cell23 = 0,
		input_cell23 = document.getElementById('cell23'),
		event_cell23,

		current_cell24 = 0,
		input_cell24 = document.getElementById('cell24'),
		event_cell24,

		setCell,
		stopE;

	//set the initial imput values
	input_alpha.value = '1';
	input_cell00.value = '0';
	input_cell01.value = '0';
	input_cell02.value = '0';
	input_cell03.value = '0';
	input_cell04.value = '0';
	input_cell05.value = '0';
	input_cell06.value = '-2';
	input_cell07.value = '-1';
	input_cell08.value = '0';
	input_cell09.value = '0';
	input_cell10.value = '0';
	input_cell11.value = '-1';
	input_cell12.value = '1';
	input_cell13.value = '1';
	input_cell14.value = '0';
	input_cell15.value = '0';
	input_cell16.value = '0';
	input_cell17.value = '1';
	input_cell18.value = '2';
	input_cell19.value = '0';
	input_cell20.value = '0';
	input_cell21.value = '0';
	input_cell22.value = '0';
	input_cell23.value = '0';
	input_cell24.value = '0';

	//define filter
	filter = scrawl.makeMatrixFilter({
		name: 'myfilter',
		alpha: 1,
		data: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
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

	setCell = function() {
		filter.set({
			data: [
				current_cell00,
				current_cell01,
				current_cell02,
				current_cell03,
				current_cell04,
				current_cell05,
				current_cell06,
				current_cell07,
				current_cell08,
				current_cell09,
				current_cell10,
				current_cell11,
				current_cell12,
				current_cell13,
				current_cell14,
				current_cell15,
				current_cell16,
				current_cell17,
				current_cell18,
				current_cell19,
				current_cell20,
				current_cell21,
				current_cell22,
				current_cell23,
				current_cell24
			],
		});
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

	event_cell00 = function(e) {
		stopE(e);
		current_cell00 = parseFloat(input_cell00.value);
		setCell();
	};
	input_cell00.addEventListener('change', event_cell00, false);

	event_cell01 = function(e) {
		stopE(e);
		current_cell01 = parseFloat(input_cell01.value);
		setCell();
	};
	input_cell01.addEventListener('change', event_cell01, false);

	event_cell02 = function(e) {
		stopE(e);
		current_cell02 = parseFloat(input_cell02.value);
		setCell();
	};
	input_cell02.addEventListener('change', event_cell02, false);

	event_cell03 = function(e) {
		stopE(e);
		current_cell03 = parseFloat(input_cell03.value);
		setCell();
	};
	input_cell03.addEventListener('change', event_cell03, false);

	event_cell04 = function(e) {
		stopE(e);
		current_cell04 = parseFloat(input_cell04.value);
		setCell();
	};
	input_cell04.addEventListener('change', event_cell04, false);

	event_cell05 = function(e) {
		stopE(e);
		current_cell05 = parseFloat(input_cell05.value);
		setCell();
	};
	input_cell05.addEventListener('change', event_cell05, false);

	event_cell06 = function(e) {
		stopE(e);
		current_cell06 = parseFloat(input_cell06.value);
		setCell();
	};
	input_cell06.addEventListener('change', event_cell06, false);

	event_cell07 = function(e) {
		stopE(e);
		current_cell07 = parseFloat(input_cell07.value);
		setCell();
	};
	input_cell07.addEventListener('change', event_cell07, false);

	event_cell08 = function(e) {
		stopE(e);
		current_cell08 = parseFloat(input_cell08.value);
		setCell();
	};
	input_cell08.addEventListener('change', event_cell08, false);

	event_cell09 = function(e) {
		stopE(e);
		current_cell09 = parseFloat(input_cell09.value);
		setCell();
	};
	input_cell09.addEventListener('change', event_cell09, false);

	event_cell10 = function(e) {
		stopE(e);
		current_cell10 = parseFloat(input_cell10.value);
		setCell();
	};
	input_cell10.addEventListener('change', event_cell10, false);

	event_cell11 = function(e) {
		stopE(e);
		current_cell11 = parseFloat(input_cell11.value);
		setCell();
	};
	input_cell11.addEventListener('change', event_cell11, false);

	event_cell12 = function(e) {
		stopE(e);
		current_cell12 = parseFloat(input_cell12.value);
		setCell();
	};
	input_cell12.addEventListener('change', event_cell12, false);

	event_cell13 = function(e) {
		stopE(e);
		current_cell13 = parseFloat(input_cell13.value);
		setCell();
	};
	input_cell13.addEventListener('change', event_cell13, false);

	event_cell14 = function(e) {
		stopE(e);
		current_cell14 = parseFloat(input_cell14.value);
		setCell();
	};
	input_cell14.addEventListener('change', event_cell14, false);

	event_cell15 = function(e) {
		stopE(e);
		current_cell15 = parseFloat(input_cell15.value);
		setCell();
	};
	input_cell15.addEventListener('change', event_cell15, false);

	event_cell16 = function(e) {
		stopE(e);
		current_cell16 = parseFloat(input_cell16.value);
		setCell();
	};
	input_cell16.addEventListener('change', event_cell16, false);

	event_cell17 = function(e) {
		stopE(e);
		current_cell17 = parseFloat(input_cell17.value);
		setCell();
	};
	input_cell17.addEventListener('change', event_cell17, false);

	event_cell18 = function(e) {
		stopE(e);
		current_cell18 = parseFloat(input_cell18.value);
		setCell();
	};
	input_cell18.addEventListener('change', event_cell18, false);

	event_cell19 = function(e) {
		stopE(e);
		current_cell19 = parseFloat(input_cell19.value);
		setCell();
	};
	input_cell19.addEventListener('change', event_cell19, false);

	event_cell20 = function(e) {
		stopE(e);
		current_cell20 = parseFloat(input_cell20.value);
		setCell();
	};
	input_cell20.addEventListener('change', event_cell20, false);

	event_cell21 = function(e) {
		stopE(e);
		current_cell21 = parseFloat(input_cell21.value);
		setCell();
	};
	input_cell21.addEventListener('change', event_cell21, false);

	event_cell22 = function(e) {
		stopE(e);
		current_cell22 = parseFloat(input_cell22.value);
		setCell();
	};
	input_cell22.addEventListener('change', event_cell22, false);

	event_cell23 = function(e) {
		stopE(e);
		current_cell23 = parseFloat(input_cell23.value);
		setCell();
	};
	input_cell23.addEventListener('change', event_cell23, false);

	event_cell24 = function(e) {
		stopE(e);
		current_cell24 = parseFloat(input_cell24.value);
		setCell();
	};
	input_cell24.addEventListener('change', event_cell24, false);

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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['images', 'filters', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
