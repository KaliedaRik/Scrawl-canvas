var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myStack = scrawl.stack.mystack,
		myFront = scrawl.pad.frontcanvas,
		myBack = scrawl.pad.backcanvas;

	//load images into library
	scrawl.getImagesByClass('demo204');

	//apply CSS3 styling to DOM elements
	myStack.set({
		width: 540,
		height: 360,
		perspectiveZ: 2000,
		title: 'containing stack',
	});
	myFront.set({
		backfaceVisibility: 'hidden',
		deltaYaw: 1,
		title: 'parrot picture',
	});
	myBack.set({
		backfaceVisibility: 'hidden',
		yaw: 179.9999,
		deltaYaw: 1,
		title: 'fish picture',
	});

	//build entitys
	scrawl.newPicture({
		width: 540,
		height: 360,
		handleX: 'center',
		handleY: 'center',
		startX: 270,
		startY: 180,
		scale: 0.7,
		source: 'parrot',
		group: myFront.base,
	}).clone({
		source: 'fish',
		group: myBack.base,
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			scrawl.update();
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
	modules: ['images', 'stacks', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
