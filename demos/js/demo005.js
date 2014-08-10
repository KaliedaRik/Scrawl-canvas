var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define block sprites
	scrawl.newBlock({
		startX: 10,
		startY: 10,
		width: 180,
		height: 180,
	}).clone({
		startX: 210,
		scale: 0.8,
		lineWidth: 5,
		method: 'draw',
	});

	//display canvas
	scrawl.render();

	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + parseInt(testTime, 10) + 'ms';
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: 'block',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
