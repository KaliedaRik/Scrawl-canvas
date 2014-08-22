var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define some phrase sprites to hold the text
	scrawl.newPhrase({
		text: 'Hello, Scrawl World!',
		handleX: 'center',
		handleY: 'center',
		startX: 200,
		startY: 70,
		font: '30pt serif',
		method: 'fillDraw',
		fillStyle: 'red',
	}).clone({
		text: 'canvas id: ' + scrawl.canvas.mycanvas.id +
			'\nwidth: ' + scrawl.canvas.mycanvas.getAttribute('width') +
			'px\nheight: ' + scrawl.canvas.mycanvas.getAttribute('height') + 'px',
		textAlign: 'center',
		method: 'fill',
		fillStyle: 'darkblue',
		font: '12pt monospace',
		startY: 130,
	});

	//update the canvas display
	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + parseInt(testTime, 10) + 'ms';
	//hide-end
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: 'phrase',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
