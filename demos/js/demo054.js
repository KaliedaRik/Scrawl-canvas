var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var here,
		mySvg,
		myScale;

	//load images into scrawl library
	scrawl.getImagesByClass('demo054');

	//setup canvas
	scrawl.canvas.mycanvas.style.cursor = 'crosshair';

	//define entity
	mySvg = scrawl.makePicture({
		name: 'svgCow',
		source: 'svgCow',
		method: 'fill',
		width: 250,
		height: 300,
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
		scale: 0.01
	});

	//stop touchmove dragging the page up/down
	scrawl.addListener(['move', 'down'], function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		here = scrawl.pad.mycanvas.getMouse();
		mySvg.set({
			scale: 1 - (((Math.abs(here.y - 200) / 200) * 0.49) + ((Math.abs(here.x - 300) / 300) * 0.49)),
			visibility: (here.active) ? true : false,
			mouseIndex: here.id
		});
	}, scrawl.canvas.mycanvas);

	scrawl.addListener(['leave'], function(e) {
		mySvg.visibility = false;
	}, scrawl.canvas.mycanvas);

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
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
