var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//makeBezier factory
	scrawl.makeBezier({
		startX: 50,
		startY: 100,
		endX: 350,
		endY: 100,
		startControlX: 150,
		startControlY: 0,
		endControlX: 250,
		endControlY: 200,
	});

	//display canvas
	scrawl.render();

	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
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
