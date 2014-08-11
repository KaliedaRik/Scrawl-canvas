var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//makeLine factory
	scrawl.makeLine({
		startX: 50,
		startY: 50,
		endX: 350,
		endY: 50,
	});

	//makeRegularShape factory, using sides
	scrawl.makeRegularShape({
		startX: 200,
		startY: 100,
		radius: 150,
		sides: 2,
	});

	//makeRegularShape factory, using angles
	scrawl.makeRegularShape({
		startX: 200,
		startY: 150,
		radius: 150,
		angle: 180,
		roll: 10,
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
