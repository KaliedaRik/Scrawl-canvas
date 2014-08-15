var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var myPad = scrawl.pad.mycanvas,
		here,
		gradient,
		myGloom,
		mySpotlight;

	//import images into scrawl library
	scrawl.getImagesByClass('demo092');

	//define designs (gradient)
	gradient = scrawl.newRadialGradient({
		name: 'spotlight',
		startRadius: 50,
		endRadius: 150,
		color: [{
			color: 'rgba(0,0,0,0)',
			stop: 0
        }, {
			color: 'rgba(0,0,0,0.8)',
			stop: 1
        }, ],
	});

	//define sprites
	scrawl.newPicture({
		source: 'flower',
		width: 750,
		height: 500,
	});

	myGloom = scrawl.newBlock({
		name: 'gloomy',
		fillStyle: 'rgba(0,0,0,0.8)',
		method: 'fill',
		width: 750,
		height: 375,
		order: 1,
	});

	mySpotlight = myGloom.clone({
		name: 'shiny',
		fillStyle: 'spotlight',
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			if (here.active) {
				gradient.set({
					startX: here.x,
					startY: here.y,
					endX: here.x,
					endY: here.y,
				});
				myGloom.set({
					visibility: false
				});
				mySpotlight.set({
					visibility: true
				});
			}
			else {
				myGloom.set({
					visibility: true
				});
				mySpotlight.set({
					visibility: false
				});
			}
			scrawl.render();

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
	modules: ['block', 'images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
