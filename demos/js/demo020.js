var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

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
