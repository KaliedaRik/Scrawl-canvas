var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var hello,
		delta = -10,
		minR = 120,
		maxR = 250,
		x = 375,
		y = 160;

	//import images into scrawl library
	scrawl.getImagesByClass('demo056');

	//define designs (pattern)
	scrawl.newPattern({
		name: 'marble',
		image: 'marble',
	});

	//define sprite
	hello = scrawl.newPhrase({
		name: 'hello',
		text: 'Hello, from Scrawl!',
		weight: 'bold',
		size: 40,
		metrics: 'pt',
		family: 'Garamond, "Times New Roman", Georgia, serif',
		handleX: 'center',
		handleY: 'center',
		strokeStyle: 'Red',
		fillStyle: 'marble',
		method: 'fillDraw',
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			delta = (delta > 180) ? delta - 359 : delta + 1;
			hello.set({
				startX: x + (maxR * Math.cos(delta * scrawl.radian)),
				startY: y + (minR * Math.sin(delta * scrawl.radian)),
				scale: (hello.start.y / 100) + 0.4,
			});
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
	modules: ['images', 'animation', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
