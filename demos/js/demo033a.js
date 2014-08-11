var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		msg = document.getElementById('message');
	var myresults = [],
		counter = 0,
		level,
		doTest,
		run = [],
		length,
		fps,
		f,
		p,
		result,
		running = true,
		average = 0;

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
		addBunnies,
		moveBunnies;

	//load image into scrawl library
	scrawl.getImagesByClass('demo033');

	//define a single bunny sprite - start and delta values will be stored in the bunnyPos array
	bunny = scrawl.newPicture({
		name: 'bunny',
		source: 'bunny',
		handleX: 'center',
		handleY: 'center',
		collisionPoints: 'center',
		fastStamp: true, //essential if speed gains are to be realised
	});

	//event listener
	addBunnies = function(e) {
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

	//animation (display loop) function
	moveBunnies = function() {
		var temp;
		pad.clear();
		for (var i = 0, z = bunnyPos.length; i < z; i++) {
			temp = bunnyPos[i].x + bunnyPos[i].dx;
			if (temp < minX || temp > maxX) {
				bunnyPos[i].dx = -bunnyPos[i].dx;
			}
			temp = bunnyPos[i].y + bunnyPos[i].dy;
			if (temp < minY || temp > maxY) {
				bunnyPos[i].dy = -bunnyPos[i].dy;
			}
			bunnyPos[i].x += bunnyPos[i].dx;
			bunnyPos[i].y += bunnyPos[i].dy;
			bunny.start.x = bunnyPos[i].x;
			bunny.start.y = bunnyPos[i].y;
			bunny.stamp();
		}
		pad.show();
	};

	doTest = function() {
		var i, iz;
		if (running) {
			run.push(fps);
			if (run.length > 20) {
				length = run.length;
				for (i = 0; i < length; i++) {
					average += run[i];
				}
				result = Math.floor(average / length);
				myresults[totalBunnies] = result;
				run.length = 0;
				average = 0;
				if (result < 20) {
					running = false;
					f = document.getElementById('results');
					p = '';
					for (i = 0, iz = myresults.length; i < iz; i++) {
						if (myresults[i]) {
							p += i + ' bunnies: ' + myresults[i] + 'fps<br />';
						}
					}
					f.innerHTML = p;
				}
				else {
					addBunnies();
				}
			}
		}
	};

	//initialize scene
	addBunnies();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			moveBunnies();

			msg.innerHTML = 'Bunnies: ' + totalBunnies;
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			fps = Math.floor(1000 / testTime);
			doTest();
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
