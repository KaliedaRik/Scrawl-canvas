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
			globalCompositeOperation: 'source-over',
		},
		currentFilter = 'default';

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('filter').value = 'default';

	// define multifilter
	filterDefinitions = {
		default: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'default'
		}),
		grayscale: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'grayscale'
		}),
		sepia: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'sepia'
		}),
		invert: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'invert'
		}),
		red: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'red'
		}),
		green: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'green'
		}),
		blue: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'blue'
		}),
		notred: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'notred'
		}),
		notgreen: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'notgreen'
		}),
		notblue: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'notblue'
		}),
		cyan: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'cyan'
		}),
		magenta: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'magenta'
		}),
		yellow: scrawl.makeFilter({
			multiFilter: 'myFilter',
			species: 'yellow'
		}),
	};

	scrawl.makeMultiFilter({
		name: 'myFilter',
		filters: filterDefinitions[currentFilter]
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
		if (parrot) {
			scrawl.entity.parrot.set(current);
		}
		else {
			scrawl.multifilter.myFilter.set({
				filters: filterDefinitions[currentFilter]
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
	extensions: ['images', 'multifilters', 'wheel', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
