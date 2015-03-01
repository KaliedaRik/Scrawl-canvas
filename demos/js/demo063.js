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
		name: 'mystars',
		regionRadius: 190,
	});

	//define, and stamp, entitys
	scrawl.makeRegularShape({
		name: 'star1',
		startX: 200,
		startY: 200,
		angle: 144,
		radius: 190,
		lineWidth: 3,
		method: 'draw',
		group: 'mystars',
	}).stamp().clone({
		name: 'star2',
		startX: 600,
		winding: 'evenodd',
	}).stamp();

	//define brush entity ...
	brush = scrawl.makeWheel({
		radius: 3,
		method: 'fill',
	});

	//... and stamp it
	for (var dx = 0; dx <= 800; dx += 10) {
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
	modules: ['factories', 'path', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
