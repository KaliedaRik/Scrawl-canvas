var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var minScale = 0.4,
		maxScale = 1.2,
		myRotate = 1,
		myScale = 0.01,
		star,
		box;

	//define sprites
	star = scrawl.makeRegularShape({
		name: 'star',
		startX: 200,
		startY: 185,
		winding: 'evenodd',
		fillStyle: 'Pink',
		strokeStyle: 'Red',
		lineWidth: 2,
		scaleOutline: false,
		method: 'fillDraw',
		radius: 100,
		angle: 144,
	});
	box = star.clone({
		name: 'box',
		startX: 500,
		startY: 185,
		data: 'm-100,-100h200v200h-200v-200m50,50h100v100h-100v-100m-50-50z'
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			if (!scrawl.isBetween((star.scale + myScale), maxScale, minScale, true)) {
				myScale = -myScale;
			}
			star.setDelta({
				scale: myScale,
				roll: myRotate,
			});
			box.setDelta({
				scale: myScale,
				roll: -myRotate,
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
	modules: ['path', 'animation', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
