var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var canvas = scrawl.canvas.mycanvas,
		toggle = false,
		toggleState,
		stopE;

	//import image into scrawl library
	scrawl.getImagesByClass('demo102');

	//define filters
	scrawl.makeMatrixFilter({
		name: 'myMatrix',
		data: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
	});
	scrawl.makeChannelStepFilter({
		name: 'myChannelStep',
		red: 64,
		green: 64,
		blue: 64,
	});
	scrawl.makePixelateFilter({
		name: 'myPixelate',
		width: 8,
		height: 8,
	});

	//define entitys
	scrawl.makePicture({
		name: 'background',
		width: 400,
		height: 400,
		copyX: 50,
		copyY: 50,
		copyWidth: 400,
		copyHeight: 400,
		source: 'flower',
	});
	scrawl.makeWheel({
		name: 'eWheel',
		radius: 200,
		method: 'draw',
		order: 3,
		startX: 50,
		startY: 100,
		filterLevel: 'entity',
		filters: ['myMatrix'],
	}).clone({
		name: 'cWheel',
		startX: 350,
		order: 2,
		filters: ['myChannelStep'],
	}).clone({
		name: 'pWheel',
		startX: 200,
		startY: 300,
		order: 1,
		filters: ['myPixelate'],
	});

	scrawl.render();

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	toggleState = function(e) {
		//hide-start
		testTicker = Date.now();
		//hide-end
		stopE(e);
		toggle = !toggle;
		if (toggle) {
			scrawl.entity.pWheel.set({
				filterLevel: 'pad',
			});
			scrawl.entity.cWheel.set({
				filterLevel: 'cell',
			});
		}
		else {
			scrawl.entity.pWheel.set({
				filterLevel: 'entity',
			});
			scrawl.entity.cWheel.set({
				filterLevel: 'entity',
			});
		}
		scrawl.render();
		//hide-start
		testNow = Date.now();
		testTime = testNow - testTicker;
		testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
		//hide-end
	};
	scrawl.addListener('up', toggleState, canvas);

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end

};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['images', 'filters', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
