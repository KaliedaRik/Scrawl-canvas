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
		name: 'mylines',
	});

	//define, and stamp, sprites
	scrawl.makeLine({
		startX: 50,
		startY: 60,
		endX: 350,
		endY: 60,
		lineWidth: 3,
		group: 'mylines',
	}).stamp();
	scrawl.makeRegularShape({
		startX: 200,
		startY: 100,
		radius: 150,
		sides: 2,
		lineWidth: 3,
		group: 'mylines',
	}).stamp();
	scrawl.makeRegularShape({
		startX: 200,
		startY: 140,
		radius: 150,
		angle: 180,
		lineWidth: 3,
		group: 'mylines',
	}).stamp();
	scrawl.makeQuadratic({
		startX: 50,
		startY: 250,
		endX: 350,
		endY: 250,
		controlX: 200,
		controlY: 200,
		lineWidth: 3,
		group: 'mylines',
	}).stamp();
	scrawl.makeBezier({
		startX: 50,
		startY: 350,
		endX: 350,
		endY: 350,
		startControlX: 150,
		startControlY: 300,
		endControlX: 250,
		endControlY: 400,
		lineWidth: 3,
		group: 'mylines',
	}).stamp();

	//define brush sprite ...
	brush = scrawl.newWheel({
		radius: 4,
		method: 'fill',
	});

	//... and stamp it
	for (var dx = 0; dx <= 400; dx += 10) {
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
