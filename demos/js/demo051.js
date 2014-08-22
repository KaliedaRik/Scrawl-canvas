var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		myCell = scrawl.cell[myPad.base],
		xMin = 65,
		yMin = 65,
		xMax = 750 - 65,
		yMax = 375 - 65;

	//import images; setup variables
	scrawl.getImagesByClass('demo051');

	//reconfigure the base cell
	myCell.set({
		usePadDimensions: false,
		width: 130,
		height: 130,
		targetX: 750 / 2,
		targetY: 375 / 2,
		handleX: 'center',
		handleY: 'center',
		deltaX: 3,
		deltaY: 2,
		flipReverse: true,
		flipUpend: true,
		roll: 45,
	});

	//build sprite
	scrawl.newPattern({
		name: 'p1',
		image: 'warning',
	}).clone({
		name: 'p2',
		image: 'nops',
	});
	scrawl.newWheel({
		startX: 65,
		startY: 65,
		radius: 60,
		strokeStyle: 'p1',
		fillStyle: 'p2',
		lineWidth: 10,
		method: 'fillDraw',
		//sprite is only stamped once - the display cycle will never clear the base cell
	}).stamp();
	scrawl.newWheel({
		startX: 25,
		startY: 25,
		radius: 8,
		fillStyle: 'red',
	}).stamp();


	//animation object
	scrawl.newAnimation({
		fn: function() {
			//move the base cell's show area - use a basic box collision detection system to keep sprite in view
			if (!scrawl.isBetween(myCell.start.x, xMax, xMin, true)) {
				myCell.delta.x = -myCell.delta.x;
			}
			if (!scrawl.isBetween(myCell.start.y, yMax, yMin, true)) {
				myCell.delta.y = -myCell.delta.y;
			}
			myCell.updateStart();

			scrawl.show();

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
	modules: ['wheel', 'images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
