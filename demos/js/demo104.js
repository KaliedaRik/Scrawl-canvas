var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var mySprite;

	//import images; setup variables
	scrawl.getImagesByClass('demo104');

	//build sprite
	scrawl.newPattern({
		name: 'p1',
		image: 'warning',
	}).clone({
		name: 'p2',
		image: 'leaves',
	});
	mySprite = scrawl.newWheel({
		name: 'mainWheel',
		startX: 100,
		startY: 100,
		radius: 60,
		strokeStyle: 'p1',
		fillStyle: 'p2',
		lineWidth: 10,
		method: 'fillDraw',
	});
	mySprite.convertToPicture({
		name: 'pictureWheel',
		startX: 300,
		startY: 100,
		handleX: 'center',
		handleY: 'center',
		filters: {
			sepia: {},
		},
		roll: 70,
		method: 'fillDraw',
		lineWidth: 2,
	});

	scrawl.newAnimation({
		fn: function() {
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
	modules: ['wheel', 'images', 'animation', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
