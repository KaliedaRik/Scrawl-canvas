var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		blocky,
		wheely,
		currentEntity,
		currentFilter,
		here;

	//import image into scrawl library
	scrawl.getImageById('flower');

	//define filters
	scrawl.newGreyscaleFilter({
		name: 'myGreyscale',
	});

	currentFilter = 'myGreyscale';

	//define entitys
	scrawl.newPicture({
		name: 'background',
		width: 600,
		height: 300,
		copyX: 50,
		copyY: 50,
		copyWidth: 600,
		copyHeight: 300,
		source: 'flower',
	});
	blocky = scrawl.newBlock({
		width: 100,
		height: 100,
		roll: 30,
		method: 'draw',
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
		visibility: false,
		filters: [currentFilter],
	});
	wheely = scrawl.newWheel({
		radius: 70,
		startAngle: 20,
		endAngle: 340,
		includeCenter: true,
		roll: 90,
		method: 'draw',
		pivot: 'mouse',
		visibility: false,
		filters: [currentFilter],
	});

	currentEntity = blocky;

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (here.active) {
				currentEntity.set({
					visibility: true,
				});
			}
			else {
				currentEntity.set({
					visibility: false,
				});
			}
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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'animation', 'filters', 'block', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
