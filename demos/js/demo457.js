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
		filter,
		events,
		stopE,
		currentFilter = 'default';

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('normalize').value = '1';
	document.getElementById('radius').value = '3';

	// define multifilter
	filter = scrawl.makeFilter({
		multiFilter: 'myFilter', 
		species: 'blur',
		radius: 3,
		normalize: true,
	});

	multi = scrawl.makeMultiFilter({
		name: 'myFilter',
		filters: filter
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
		var parrot = false;
		stopE(e);
		switch (e.target.id) {
			case 'globalAlpha':
				parrot.set({
					globalAlpha: parseFloat(e.target.value)
				});
				break;
			case 'gco':
				parrot.set({
					globalCompositeOperation: e.target.value
				});
				break;
			case 'normalize':
				filter.set({
					normalize: (parseInt(e.target.value, 10)) ? true : false
				});
				multi.updateFilters();
				break;
			case 'radius':
				filter.set({
					radius: parseInt(e.target.value, 10)
				});
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
