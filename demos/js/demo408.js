var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// define variables
	var colorRange,
		filter,
		parrot,
		multiFilter,
		events,
		stopE;

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';
	document.getElementById('startRed').value = '130';
	document.getElementById('startGreen').value = '0';
	document.getElementById('startBlue').value = '0';
	document.getElementById('endRed').value = '255';
	document.getElementById('endGreen').value = '100';
	document.getElementById('endBlue').value = '255';

	// define multifilter
	colorRange = [130, 0, 0, 255, 100, 255];
	filter = scrawl.makeFilter({
		multiFilter: 'myFilter',
		species: 'chroma',
		ranges: [colorRange]
	});

	multiFilter = scrawl.makeMultiFilter({
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
			case 'startRed':
				colorRange[0] = parseInt(e.target.value, 10);
				filter.set({
					ranges: [colorRange]
				});
				break;
			case 'startGreen':
				colorRange[1] = parseInt(e.target.value, 10);
				filter.set({
					ranges: [colorRange]
				});
				break;
			case 'startBlue':
				colorRange[2] = parseInt(e.target.value, 10);
				filter.set({
					ranges: [colorRange]
				});
				break;
			case 'endRed':
				colorRange[3] = parseInt(e.target.value, 10);
				filter.set({
					ranges: [colorRange]
				});
				break;
			case 'endGreen':
				colorRange[4] = parseInt(e.target.value, 10);
				filter.set({
					ranges: [colorRange]
				});
				break;
			case 'endBlue':
				colorRange[5] = parseInt(e.target.value, 10);
				filter.set({
					ranges: [colorRange]
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
			testMessage.innerHTML = 'Range: [' + colorRange.toString() + ']. Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
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
