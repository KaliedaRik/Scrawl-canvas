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
	mySvg = scrawl.newPicture({
		name: 'svgCow',
		source: 'svgCow',
		method: 'fill',
		width: 250,
		height: 300,
		handleX: 'center',
		handleY: 'center',
		pivot: 'mouse',
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = scrawl.pad.mycanvas.getMouse();
			if (here.active) {
				myScale = 1 - (((Math.abs(here.y - 200) / 200) * 0.49) + ((Math.abs(here.x - 300) / 300) * 0.49));
			}
			mySvg.set({
				scale: myScale,
				visibility: (here.active) ? true : false,
			});
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
