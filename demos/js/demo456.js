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

	filter = scrawl.makeMultiFilter({
		name: 'myFilter',
		definitions: [{
			filter: 'matrix',
			width: 5,
			height: 5,
			offsetX: -2,
			offsetY: -2,
			weights: [-1,  0,  0,  0,  0, 0, -2,  0,  0,  0, 0,  0,  6,  0,  0, 0,  0,  0, -2,  0, 0,  0,  0,  0, -1]
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
