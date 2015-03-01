var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myGroup,
		brush;

	//define groups
	myGroup = scrawl.makeGroup({
		name: 'myboxes',
	});

	//define, and stamp, entitys
	scrawl.newBlock({
		startX: 20,
		startY: 20,
		width: 40,
		height: 40,
		method: 'draw',
		lineWidth: 3,
		scaleOutline: false,
		group: 'myboxes',
	}).stamp().clone({
		handleX: -40,
		handleY: -40,
		scale: 2,
	}).stamp().clone({
		handleX: -120,
		handleY: -120,
		scale: 4,
	}).stamp().clone({
		handleX: -280,
		handleY: -280,
		scale: 1.5,
	}).stamp();

	//define brush entity ...
	brush = scrawl.newWheel({
		radius: 3,
		method: 'fill',
	});

	//... and stamp it
	for (var dx = 0; dx <= 400; dx += 10) {
		for (var dy = 0; dy <= 400; dy += 10) {
			brush.set({
				startX: dx,
				startY: dy,
				fillStyle: (myGroup.getEntityAt({
					x: dx,
					y: dy
				})) ? 'rgba(255,0,0,0.5)' : 'rgba(0,0,255,0.5)',
			}).stamp();
		}
	}

	//display canvas
	scrawl.show();

	//hide-start
	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
	//hide-end
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
