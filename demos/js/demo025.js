var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//makeRegularShape factory - using sides
	scrawl.makeRegularShape({
		startX: 100,
		startY: 100,
		radius: 90,
		sides: 5,
	});

	//makeRegularShape factory - using angles
	scrawl.makeRegularShape({
		startX: 300,
		startY: 100,
		radius: 90,
		angle: 72,
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
