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
		},
		matrix;

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('matrix').value = 'nochange';

	matrix = {
		nochange: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'matrix',
			blockWidth: 1,
			blockHeight: 1,
			offsetX: 0,
			offsetY: 0,
			weights: [1]
		}),
		edge: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'matrix',
			blockWidth: 3,
			blockHeight: 3,
			offsetX: -1,
			offsetY: -1,
			weights: [1, 1, 0, 1, 0, -1, 0, -1, -1]
		}),
		sharp: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'matrix',
			blockWidth: 3,
			blockHeight: 3,
			offsetX: -1,
			offsetY: -1,
			weights: [1, 0, 0, 0, 1, 0, 0, 0, -1]
		}),
		horizontalBlur: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'matrix',
			blockWidth: 20,
			blockHeight: 1,
			offsetX: -9,
			offsetY: 0,
			normalize: true,
			weights: [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05]
		}),
		verticalBlur: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'matrix',
			blockWidth: 1,
			blockHeight: 20,
			offsetX: 0,
			offsetY: -9,
			normalize: true,
			weights: [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05]
		}),
		gaussian: scrawl.makeFilter({
			multiFilter: 'myFilter', 
			species: 'matrix',
			blockWidth: 5,
			blockHeight: 5,
			offsetX: -2,
			offsetY: -2,
			normalize: true,
			weights: [0.003765, 0.015019, 0.023792, 0.015019, 0.003765, 0.015019, 0.059912, 0.094907, 0.059912, 0.015019, 0.023792, 0.094907, 0.150342, 0.094907, 0.023792, 0.015019, 0.059912, 0.094907, 0.059912, 0.015019, 0.003765, 0.015019, 0.023792, 0.015019, 0.003765]
		}),
	}

	filter = scrawl.makeMultiFilter({
		name: 'myFilter',
		filters: matrix.nochange
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
			case 'matrix':
				filter.set({filters: matrix[e.target.value]});
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
