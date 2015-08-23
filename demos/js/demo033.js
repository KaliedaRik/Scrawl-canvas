var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var canvas = scrawl.canvas.mycanvas,
		pad = scrawl.pad.mycanvas,
		totalBunnies = 0,
		minX = 5,
		minY = 5,
		maxX = 595,
		maxY = 595,
		bunnyPos = [],
		bunny,
		start,
		addBunnies,
		moveBunnies,
		msg = document.getElementById('message');

	//load image into scrawl library
	scrawl.getImagesByClass('demo033');

	//define a single bunny entity - start and delta values will be stored in the bunnyPos array
	bunny = scrawl.makePicture({
		name: 'bunny',
		source: 'bunny',
		handleX: 'center',
		handleY: 'center',
		collisionPoints: 'center',
		fastStamp: true, //essential if speed gains are to be realised
	});
	start = bunny.currentStart;

	//event listener
	addBunnies = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		for (var i = 0; i < 100; i++) {
			bunnyPos.push({
				x: 10,
				y: 10,
				dx: (Math.random() * 8) + 1,
				dy: (Math.random() * 8) + 1,
			});
		}
		totalBunnies += 100;
	};
	scrawl.addListener('up', addBunnies, canvas);

	//animation (display loop) function
	moveBunnies = function() {
		var temp, b, i, iz;
		pad.clear();
		for (i = 0, iz = bunnyPos.length; i < iz; i++) {
			b = bunnyPos[i];
			temp = b.x + b.dx;
			if (temp < minX || temp > maxX) {
				b.dx = -b.dx;
			}
			b.x += b.dx;
			start.x = b.x;
			temp = b.y + b.dy;
			if (temp < minY || temp > maxY) {
				b.dy = -b.dy;
			}
			b.y += b.dy;
			start.y = b.y;
			bunny.stamp();
		}
		pad.show();
	};

	//initialize scene
	addBunnies();

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			moveBunnies();

			msg.innerHTML = 'Bunnies: ' + totalBunnies;

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
