var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// define variables
	var def,
		blur1, blur2, blur3,
		grayscale,
		channels,
		edge,
		options,
		parrot,
		multiFilter,
		events,
		stopE;

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('filters').value = '1';

	// define multifilter
	def = scrawl.makeFilter({
		multiFilter: 'myFilter',
		species: 'default'
	});
	blur1 = scrawl.makeFilter({
		multiFilter: 'myFilter',
		species: 'blur',
		radius: 2
	});
	blur2 = blur1.clone({
		radius: 50,
		step: 10
	});
	blur3 = blur1.clone({
		radius: 3,
		step: 2
	});
	grayscale = scrawl.makeFilter({
		multiFilter: 'myFilter',
		species: 'grayscale'
	});
	channels = scrawl.makeFilter({
		multiFilter: 'myFilter',
		species: 'channelstep',
		red: 127,
		green: 127,
		blue: 127
	});
	edge = scrawl.makeFilter({
		multiFilter: 'myFilter',
		species: 'matrix',
		blockWidth: 1,
		blockHeight: 3,
		offsetX: 0,
		offsetY: -1,
		weights: [1, 0, -1]
	});
	options = [null, [def], [blur1, grayscale], [channels, edge], [blur2, blur3]];

	multiFilter = scrawl.makeMultiFilter({
		name: 'myFilter',
		filters: options[1]
	});

	// define entitys
	scrawl.makeWheel({
		radius: '50%',
		startX: 'center',
		startY: 'center',
		order: 0,
	});
	parrot = scrawl.makePicture({
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
				parrot.set({
					globalAlpha: parseFloat(e.target.value)
				});
				break;
			case 'gco':
				parrot.set({
					globalCompositeOperation: e.target.value
				});
				break;
			case 'filters':
				multiFilter.set({
					filters: options[parseInt(e.target.value, 10)]
				});
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
	extensions: ['images', 'multifilters', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
