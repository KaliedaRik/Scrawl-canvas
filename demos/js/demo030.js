var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//makeRectangle factory
	scrawl.makeRectangle({
		startX: 200,
		startY: 80,
		width: 200,
		height: 100,
		radius: 20,
		lineWidth: 5,
		fillStyle: 'blue',
		strokeStyle: 'red',
		method: 'fillDraw',
	});
	scrawl.makeRectangle({
		startX: 200,
		startY: 200,
		width: 350,
		height: 60,
		radiusTop: 20,
		lineWidth: 5,
		fillStyle: 'blue',
		strokeStyle: 'red',
		method: 'fillDraw',
	});
	scrawl.makeRectangle({
		startX: 200,
		startY: 320,
		width: 100,
		height: 100,
		radius: 100,
		lineWidth: 5,
		lineJoin: 'round',
		fillStyle: 'blue',
		strokeStyle: 'red',
		method: 'fillDraw',
	});

	//display canvas
	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['path', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
