var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var minScale = 0.4,
		maxScale = 1.2,
		myRotate = 1,
		myScale = 0.01,
		star,
		box;

	scrawl.makeRadialGradient({
		name: 'gradient',
		startX: '50%',
		endX: '50%',
		startY: '50%',
		endY: '50%',
		shift: 0.001,
		autoUpdate: true,
		lockTo: true,
		color: [{
			color: 'red',
			stop: 0
        }, {
			color: 'green',
			stop: 0.2
        }, {
			color: 'gold',
			stop: 0.4
        }, {
			color: 'purple',
			stop: 0.6
        }, {
			color: 'silver',
			stop: 0.8
        }, {
			color: 'red',
			stop: 0.999999
        }, ],
	});

	//define entitys
	star = scrawl.makeRegularShape({
		name: 'star',
		startX: 200,
		startY: 185,
		winding: 'evenodd',
		fillStyle: 'gradient',
		lineWidth: 2,
		scaleOutline: false,
		method: 'fillDraw',
		radius: 100,
		angle: 144,
		startControlX: 50,
		startControlY: 75,
		endControlX: 50,
		endControlY: 150,
		lineType: 'c',
		shape: true,
	});
	box = star.clone({
		name: 'box',
		startX: 500,
		startY: 185,
		data: 'm-100,-100h200v200h-200v-200m50,50h100v100h-100v-100m-50-50z',
		shape: true,
	});

	//animation object
	scrawl.makeAnimation({
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
	modules: ['path', 'shape', 'animation', 'factories', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
