var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage'),
		myMessage = document.getElementById('message');

	//define variables
	var here,
		myPad = scrawl.pad.mycanvas,
		myColor,
		titles = document.getElementById('titleBlock'),
		myBird;

	//import image into scrawl library
	scrawl.getImagesByClass('demo018');

	//define Picture sprite ...
	myBird = scrawl.newPicture({
		name: 'bird',
		source: 'peacock',
		startX: 200,
		startY: 200,
		width: 200,
		height: 200,
		handleX: 'center',
		handleY: 'center',
		copyX: 140,
		copyY: 80,
		copyWidth: 250,
		copyHeight: 250,
		roll: 30,
		scale: 1.4,
		flipReverse: true,
		imageDataChannel: 'color',
		// ... and get its image data
	}).getImageData();

	//display the canvas - only needs to be done once
	scrawl.render();

	//the animation object function keeps track of the mouse over the canvas
	//and retrieves the color at the mouse coordinate
	scrawl.newAnimation({
		fn: function() {
			myColor = 'transparent';
			here = myPad.getMouse();

			//here.active is set to TRUE when mouse cursor is over the canvas element
			if (here.active) {
				myColor = myBird.getImageDataValue(here) || 'transparent';
			}

			//update the DOM title block with the current color
			titles.style.backgroundColor = myColor;

			myMessage.innerHTML = (here.active) ? 'Color at mouse cursor point (x: ' + here.x + ', y: ' + here.y + ') is ' + myColor : 'Move mouse over image';
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
