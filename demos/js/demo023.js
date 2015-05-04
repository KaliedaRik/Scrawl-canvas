var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//makeRegularShape factory - using sides
	scrawl.makeRegularShape({
		startX: 100,
		startY: 100,
		radius: 90,
		sides: 3,
	});

	//makeRegularShape factory - using angles
	scrawl.makeRegularShape({
		startX: 300,
		startY: 100,
		radius: 90,
		angle: 120,
	});

	//display canvas
	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['path', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
