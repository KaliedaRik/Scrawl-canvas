var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var here,
		pad = scrawl.pad.mycanvas,
		minX = 0,
		minY = 0,
		maxX = (465 - 29),
		maxY = (465 - 29),
		dx,
		dy,
		vx,
		vy,
		x,
		y,
		r,
		myEntity,
		background,
		myBlob,
		blobPositions = [],
		moveBlobs;

	//load images into scrawl library
	scrawl.getImagesByClass('demo087');

	//define entitys
	background = scrawl.makePicture({
		source: 'background',
		fastStamp: true,
	});

	myBlob = scrawl.makePicture({
		source: 'blob',
		fastStamp: true,
	});
	for (var i = 0; i < 999; i++) {
		blobPositions.push({
			x: Math.random() * maxX,
			y: Math.random() * maxY,
			mx: 0,
			my: 0,
		});
	}

	//animation function
	moveBlobs = function() {
		pad.clear();
		background.stamp();
		for (var i = 0, z = blobPositions.length; i < z; i++) {
			dx = blobPositions[i].x - here.x;
			dy = blobPositions[i].y - here.y;
			vx = blobPositions[i].mx;
			vy = blobPositions[i].my;

			if ((dx * dx) + (dy * dy) <= 10000) {
				vx += dx * 0.01;
				vy += dy * 0.01;
			}
			vx *= 0.95;
			vy *= 0.95;
			vx += Math.random() - 0.5;
			vy += Math.random() - 0.5;

			x = blobPositions[i].x += vx;
			y = blobPositions[i].y += vy;

			if (x < 0 || x > maxX || y < 0 || y > maxY) {
				r = Math.atan2(y - (maxY / 2), x - (maxX / 2));
				vx = -Math.cos(r);
				vy = -Math.sin(r);
			}
			blobPositions[i].mx = vx;
			blobPositions[i].my = vy;
			myBlob.start.x = blobPositions[i].x;
			myBlob.start.y = blobPositions[i].y;
			myBlob.stamp();
		}
		pad.show();
	};

	//stop touchmove dragging the page up/down
	scrawl.addListener('move', function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
	}, scrawl.canvas.mycanvas);

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			here = pad.getMouse();
			moveBlobs();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
