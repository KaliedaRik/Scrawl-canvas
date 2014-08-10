var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//add a canvas to the end of document.body, and make it current
	scrawl.addCanvasToPage({
		width: 400,
		height: 200,
	}).makeCurrent();

	//define a phrase sprite to hold some text
	scrawl.newPhrase({
		text: 'Hello, Scrawl World!',
		startX: 50,
		startY: 50,
	});

	//update the canvas display
	scrawl.render();

	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + parseInt(testTime, 10) + 'ms';
};

scrawl.loadModules({
	minified: false,
	path: '../source/',
	modules: 'phrase',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
