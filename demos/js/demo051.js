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
		yMax = 375 - 65,
		deltaRoll = 0.3;

	//import images; setup variables
	scrawl.getImagesByClass('demo051');

	//reconfigure the base cell
	myCell.set({
		usePadDimensions: false,
		width: 130,
		height: 130,
		pasteX: 750 / 2,
		pasteY: 375 / 2,
		handleX: 'center',
		handleY: 'center',
		deltaX: 3,
		deltaY: 2,
		flipReverse: true,
		flipUpend: true,
	});

	//build entity
	scrawl.makePattern({
		name: 'p1',
		source: 'warning',
	}).clone({
		name: 'p2',
		source: 'nops',
	});
	scrawl.makeWheel({
		startX: 65,
		startY: 65,
		radius: 60,
		strokeStyle: 'p1',
		fillStyle: 'p2',
		lineWidth: 10,
		method: 'fillDraw',
		//entity is only stamped once - the display cycle will never clear the base cell
	}).stamp();
	scrawl.makeWheel({
		startX: 25,
		startY: 25,
		radius: 8,
		fillStyle: 'red',
	}).stamp();
	myCell.compile();


	//animation object
	scrawl.makeAnimation({
		fn: function() {
			//move the base cell's show area - use a basic box collision detection system to keep entity in view
			if (!scrawl.isBetween(myCell.start.x, xMax, xMin, true)) {
				myCell.delta.x = -myCell.delta.x;
			}
			if (!scrawl.isBetween(myCell.start.y, yMax, yMin, true)) {
				myCell.delta.y = -myCell.delta.y;
			}
			myCell.updateStart();
			myCell.set({
				roll: myCell.roll + deltaRoll,
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
	modules: ['wheel', 'images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
