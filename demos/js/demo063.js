var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var myGroup,
		brush;

	//define groups
	myGroup = scrawl.newGroup({
		name: 'mystars',
		regionRadius: 190,
	});

	//define, and stamp, sprites
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

	//define brush sprite ...
	brush = scrawl.newWheel({
		radius: 3,
		method: 'fill',
	});

	//... and stamp it
	for (var dx = 0; dx <= 800; dx += 10) {
		for (var dy = 0; dy <= 400; dy += 10) {
			brush.set({
				startX: dx,
				startY: dy,
				fillStyle: (myGroup.getSpriteAt({
					x: dx,
					y: dy
				})) ? 'rgba(255,0,0,0.5)' : 'rgba(0,0,255,0.5)',
			}).stamp();
		}
	}

	//display canvas
	scrawl.show();

	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
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
