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
		name: 'mywheels',
		regionRadius: 90,
	});

	//define, and stamp, entitys
	scrawl.makeWheel({
		startX: 100,
		startY: 100,
		radius: 90,
		lineWidth: 3,
		method: 'draw',
		group: 'mywheels',
	}).stamp().clone({
		startX: 300,
		startAngle: 140,
		endAngle: 40,
		includeCenter: true,
	}).stamp().clone({
		startY: 300,
		checkHitUsingRadius: false,
	}).stamp().clone({
		startX: 100,
		includeCenter: false,
	}).stamp();

	//define brush entity ...
	brush = scrawl.makeWheel({
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
	modules: 'wheel',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
