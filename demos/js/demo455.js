var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// define variables
	var multi,
		pixels,
		events,
		stopE,
		current = {
			globalAlpha: 1,
			globalCompositeOperation: 'source-over',
		};

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('width').value = '20';
	document.getElementById('height').value = '20';
	document.getElementById('offsetX').value = '0';
	document.getElementById('offsetY').value = '0';

	pixels = scrawl.makeFilter({
		multiFilter: 'myFilter', 
		species: 'pixelate',
		blockWidth: 20,
		blockHeight: 20,
		offsetX: 0,
		offsetY: 0
	});

	multi = scrawl.makeMultiFilter({
		name: 'myFilter',
		filters: pixels
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
			case 'width':
				pixels.set({blockWidth: parseInt(e.target.value, 10)});
				multi.updateFilters();
				break;
			case 'height':
				pixels.set({blockHeight: parseInt(e.target.value, 10)});
				multi.updateFilters();
				break;
			case 'offsetX':
				pixels.set({offsetX: parseInt(e.target.value, 10)});
				multi.updateFilters();
				break;
			case 'offsetY':
				pixels.set({offsetY: parseInt(e.target.value, 10)});
				multi.updateFilters();
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
