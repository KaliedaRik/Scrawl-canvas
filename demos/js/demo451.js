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
		filterDefinitions,
		events,
		stopE,
		current = {
			globalAlpha: 1,
			globalCompositeOperation: 'source-over'
		},
		currentFilter = 'default';

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('filter').value = 'default';

	// define multifilter
	filterDefinitions = {
		default: [{filter: 'default'}],
		grayscale: [{filter: 'grayscale'}],
		invert: [{filter: 'invert'}],
		red: [{filter: 'red'}],
		green: [{filter: 'green'}],
		blue: [{filter: 'blue'}],
		notred: [{filter: 'notred'}],
		notgreen: [{filter: 'notgreen'}],
		notblue: [{filter: 'notblue'}],
		cyan: [{filter: 'cyan'}],
		magenta: [{filter: 'magenta'}],
		yellow: [{filter: 'yellow'}],
	};

	scrawl.makeMultiFilter({
		name: 'myFilter',
		definitions: filterDefinitions[currentFilter]
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
		pasteX: 20,
		pasteY: 20,
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
				current.globalAlpha = e.target.value;
				parrot = true;
				break;
			case 'gco':
				current.globalCompositeOperation = e.target.value;
				parrot = true;
				break;
			case 'filter':
				currentFilter = e.target.value;
				break;
		}
		if(parrot){
			scrawl.entity.parrot.set(current);
		}
		else{
			scrawl.multifilter.myFilter.set({
				definitions: filterDefinitions[currentFilter]
			});
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
