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
		multiFilter,
		events,
		stopE;

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('radius').value = '3';
	document.getElementById('blurType').value = 'plus';

	// define multifilter
	filter = {
		filter: 'simpleBlur',
		radius: 3,
		blurType: 'plus'
	};

	multiFilter = scrawl.makeMultiFilter({
		name: 'myFilter',
		definitions: [filter]
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
				scrawl.entity.parrot.set({
					globalAlpha: e.target.value
				})
				break;
			case 'gco':
				scrawl.entity.parrot.set({
					globalCompositeOperation: e.target.value
				})
				break;
			case 'radius':
				console.log('radius')
				filter.radius = parseInt(e.target.value, 10);
				multiFilter.cache.simpleBlur = false;
				break;
			case 'blurType':
				console.log('blurType')
				filter.blurType = e.target.value;
				multiFilter.cache.simpleBlur = false;
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
