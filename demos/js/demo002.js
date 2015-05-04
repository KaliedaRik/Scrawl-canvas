var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables used in program
	var myWidth = window.innerWidth - 50,
		myHeight = window.innerHeight - 150;

	//manipulate variables
	myWidth = (myWidth > 100) ? myWidth : 100;
	myHeight = (myHeight > 100) ? myHeight : 100;

	//add a canvas to the 'benny' div element, and make it current
	scrawl.addCanvasToPage({
		name: 'mycanvas',
		parentElement: 'benny',
		width: myWidth,
		height: myHeight,
	}).makeCurrent();

	//define a phrase entity to hold some text
	scrawl.makePhrase({
		text: 'Hello, Scrawl World!',
		startX: myWidth / 2,
		startY: myHeight / 2,
		handleX: 'center',
		handleY: 'bottom',
		font: parseInt(myHeight / 10, 10) + 'pt serif',
		method: 'fillDraw',
		fillStyle: 'red',
		// ... and clone it to define a second phrase entity
	}).clone({
		handleY: 'top',
		text: 'canvas id: ' + scrawl.canvas.mycanvas.id +
			'\nwidth: ' + scrawl.canvas.mycanvas.getAttribute('width') +
			'px\nheight: ' + scrawl.canvas.mycanvas.getAttribute('height') + 'px',
		font: '16pt sans-serif',
		textAlign: 'center',
		method: 'fill',
		fillStyle: 'black',
	});

	//update the canvas display
	scrawl.render();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + parseInt(testTime, 10) + 'ms';
	//hide-end
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: 'phrase',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
