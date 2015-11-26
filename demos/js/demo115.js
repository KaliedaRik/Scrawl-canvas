var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// import images
	scrawl.getImagesByClass('demo115');

	scrawl.makeRegularShape({
		name: 'track',
		radius: 150,
		angle: 90,
		startControlX: 90,
		lineType: 't',
		startX: 'center',
		startY: 'center',
		lineWidth: 3,
		strokeStyle: 'rgba(0, 40, 90, 0.4)',
		scale: 1.65
	});

	scrawl.makeFrame({
		name: 'test',
		topLeftPath: 'track',
		topRightPath: 'track',
		bottomRightPath: 'track',
		bottomLeftPath: 'track',
		topLeftPathPlace: 0,
		topRightPathPlace: 0.25,
		bottomRightPathPlace: 0.5,
		bottomLeftPathPlace: 0.75,
		topLeftDeltaPathPlace: 0.0008,
		topRightDeltaPathPlace: 0.0008,
		bottomRightDeltaPathPlace: 0.0008,
		bottomLeftDeltaPathPlace: 0.0008,
		topLeftPathSpeedConstant: true,
		bottomRightPathSpeedConstant: true,
		source: 'swan'
	});

	// animation loop
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
	extensions: ['images', 'path', 'frame', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
