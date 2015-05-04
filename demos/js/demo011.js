var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define entitys
	scrawl.makeWheel({
		name: 'mywheel',
		startX: 200,
		startY: 200,
		radius: 180,
		fillStyle: 'Gold',
		strokeStyle: 'rgb(0,190,0)',
		lineWidth: 16,
		lineCap: 'round',
		lineJoin: 'round',
		shadowOffsetX: 4,
		shadowOffsetY: 4,
		shadowBlur: 2,
		shadowColor: 'Black',
		method: 'floatOver',
		startAngle: 30,
		endAngle: 325,
		includeCenter: true,
	});

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			scrawl.entity.mywheel.setDelta({
				roll: 0.5,
			});
			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + parseInt(testTime, 10) + '; fps: ' + parseInt(1000 / testTime, 10);
			//hide-end
		},
	});
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['wheel', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
