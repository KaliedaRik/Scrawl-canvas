var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage'),
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
		minX = 10,
		minY = 10,
		maxX = 590,
		maxY = 590,
		totalBunnies = 0,
		group,
		bunny,
		moveEntitys,
		checkBounds,
		myEntity,
		coord,
		hits,
		moveBunnies,
		addBunnies;

	//load images into scrawl library
	scrawl.getImagesByClass('demo031');

	//define groups
	group = scrawl.makeGroup({
		name: 'mygroup',
	});

	//define entitys
	scrawl.makeBlock({ //cell collision zone
		startX: 10,
		startY: 10,
		width: 580,
		height: 580,
		field: true,
		visibility: false,
	});
	scrawl.buildFields();

	bunny = scrawl.makePicture({ //bunny entity template
		name: 'bunny',
		source: 'bunny',
		handleX: 'center',
		handleY: 'center',
		visibility: false,
		collisionPoints: 'center',
	});

	//animation functions
	moveEntitys = function() {
		group.updateStart();
	};

	checkBounds = function() {
		hits = group.getFieldEntityHits();
		for (var i = 0, z = hits.length; i < z; i++) {
			myEntity = scrawl.entity[hits[i][0]];
			coord = hits[i][1];
			myEntity.revertStart();
			if (!scrawl.isBetween(coord.x, minX, maxX, true)) {
				myEntity.reverse('deltaX');
			}
			if (!scrawl.isBetween(coord.y, minY, maxY, true)) {
				myEntity.reverse('deltaY');
			}
			myEntity.updateStart();
		}
	};

	moveBunnies = function() {
		moveEntitys();
		checkBounds();
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

	addBunnies = function() {
		for (var i = 0; i < 10; i++) {
			bunny.clone({
				startX: Math.floor((Math.random() * 560) + 20),
				startY: Math.floor((Math.random() * 560) + 20),
				deltaX: Math.floor((Math.random() * 2) + 1),
				deltaY: Math.floor((Math.random() * 2) + 1),
				visibility: true,
				group: 'mygroup',
			});
		}
		totalBunnies += 10;
	};

	//initialize scene
	addBunnies();

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			moveBunnies();
			pad.render();

			msg.innerHTML = 'Bunnies: ' + totalBunnies;
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			fps = Math.floor(1000 / testTime);
			doTest();
		},
	});
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['images', 'collisions', 'animation', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
