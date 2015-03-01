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

	//load images into scrawl library
	scrawl.getImagesByClass('demo071');

	//define groups
	myGroup = scrawl.makeGroup({
		name: 'mycat',
	});

	//define, and stamp, entitys
	scrawl.makePicture({
		startX: 180,
		startY: 200,
		width: 300,
		height: 150,
		method: 'fillDraw',
		source: 'runningcat',
		copyX: 0,
		copyY: 0,
		copyWidth: 512,
		copyHeight: 256,
		scale: 1.3,
		handleX: 'center',
		handleY: '60%',
		roll: 30,
		flipReverse: true,
		checkHitUsingImageData: true,
		group: 'mycat',
	}).getImageData().stamp();

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
	modules: ['wheel', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
