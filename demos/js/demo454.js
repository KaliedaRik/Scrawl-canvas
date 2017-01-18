var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// define variables
	var filter,
		events,
		stopE,
		current = {
			globalAlpha: 1,
			globalCompositeOperation: 'source-over',
		};

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('redInRed').value = '1';
	document.getElementById('greenInRed').value = '0';
	document.getElementById('blueInRed').value = '0';
	document.getElementById('redInGreen').value = '0';
	document.getElementById('greenInGreen').value = '1';
	document.getElementById('blueInGreen').value = '0';
	document.getElementById('redInBlue').value = '0';
	document.getElementById('greenInBlue').value = '0';
	document.getElementById('blueInBlue').value = '1';

	filter = scrawl.makeMultiFilter({
		name: 'myFilter',
		definitions: [{
			filter: 'tint',
			redInRed: 1,
			redInGreen: 0,
			redInBlue: 0,
			greenInRed: 0,
			greenInGreen: 1,
			greenInBlue: 0,
			blueInRed: 0,
			blueInGreen: 0,
			blueInBlue: 1,
		}]
	});

	// define entitys
	scrawl.makeWheel({
		radius: '50%',
		startX: 'center',
		startY: 'center',
		order: 0,
	});
	scrawl.makePicture({
		name: 'parrot',
		copyWidth: 360,
		copyHeight: 360,
		pasteWidth: 360,
		pasteHeight: 360,
		copyX: 50,
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		globalAlpha: 1,
		globalCompositeOperation: 'source-over',
		order: 1,
		multiFilter: 'myFilter',
		url: 'img/carousel/cagedparrot.png',
	});

	// define event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	events = function(e) {
		stopE(e);
		switch (e.target.id) {
			case 'globalAlpha':
				current.globalAlpha = e.target.value;
				scrawl.entity.parrot.set(current);
				break;
			case 'gco':
				current.globalCompositeOperation = e.target.value;
				scrawl.entity.parrot.set(current);
				break;
			case 'redInRed':
				filter.definitions[0].redInRed = parseFloat(e.target.value);
				break;
			case 'redInGreen':
				filter.definitions[0].redInGreen = parseFloat(e.target.value);
				break;
			case 'redInBlue':
				filter.definitions[0].redInBlue = parseFloat(e.target.value);
				break;
			case 'greenInRed':
				filter.definitions[0].greenInRed = parseFloat(e.target.value);
				break;
			case 'greenInGreen':
				filter.definitions[0].greenInGreen = parseFloat(e.target.value);
				break;
			case 'greenInBlue':
				filter.definitions[0].greenInBlue = parseFloat(e.target.value);
				break;
			case 'blueInRed':
				filter.definitions[0].blueInRed = parseFloat(e.target.value);
				break;
			case 'blueInGreen':
				filter.definitions[0].blueInGreen = parseFloat(e.target.value);
				break;
			case 'blueInBlue':
				filter.definitions[0].blueInBlue = parseFloat(e.target.value);
				break;
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controls');

	// define animation object
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
	// check to make sure only multifilters gets loaded
	extensions: ['images', 'filters', 'multifilters', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
