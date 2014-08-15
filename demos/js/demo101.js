var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var myPad = scrawl.pad.mycanvas,
		brush,
		blur,
		here;

	//import image into scrawl library
	scrawl.getImageById('flower');

	//define sprites
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
	//				blur = scrawl.filter.getBrush(6, 6, 0);
	brush = scrawl.newPicture({
		name: 'highlight',
		source: 'flower',
		method: 'fillDraw',
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
		width: 100,
		height: 100,
		copyWidth: 100,
		copyHeight: 100,
		filters: {
			pixelate: {
				width: 20,
				height: 20,
			},
			//						grayscale: {},
			//						sepia: {},
			//						tint: {
			//							br: 0.5,
			//							},
			//						threshold: {},
			//						saturation: {
			//							value: 2,
			//							},
			//						brightness: {
			//							value: 2,
			//							},
			//						invert: {},
			//						channels: {
			//							blue: 0,
			//							green: 0,
			//							},
			//						channelStep: {
			//							red: 64,
			//							blue: 64,
			//							green: 64,
			//							},
			//						glassTile: {
			//							width: 20,
			//							height: 20,
			//							outerWidth: 30,
			//							outerHeight: 30,
			//							},
			//						matrix: {
			//							data: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
			//							wrap: true,
			//							},
			//						blur: {
			//							brush: blur,
			//							},
			//						sharpen: {},
		},
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (here.active) {
				brush.set({
					visibility: true,
					copyX: here.x,
					copyY: here.y,
				});
			}
			else {
				brush.set({
					visibility: false,
				});
			}
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'animation', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
