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
		minX = 5,
		minY = 5,
		maxX = 595,
		maxY = 595,
		totalBunnies = 0,
		group,
		bunny,
		moveEntitys,
		checkBounds,
		myEntity,
		hitFlag,
		moveBunnies,
		addBunnies;

	//load images into scrawl library
	scrawl.getImagesByClass('demo032');

	//define groups
	group = scrawl.makeGroup({
		name: 'mygroup',
		entitySort: false,
		//entitySort=false - turns off pre-sorting of entitys before each display cycle (small speed gain)
	});

	//define entitys
	bunny = scrawl.newPicture({ //bunny entity template
		name: 'bunny',
		source: 'bunny',
		handleX: 'center',
		handleY: 'center',
		visibility: false,
		fastStamp: true,
		//fastStamp=true - switches off context engine updating before each entity is stamped (large speed gain)
	});

	//animation functions
	moveEntitys = function() {
		group.updateStart();
	};

	// - use manual checking instead of cell collision field checking (small speed gain)
	checkBounds = function() {
		for (var i = 0, z = group.entitys.length; i < z; i++) {
			hitFlag = false;
			myEntity = scrawl.entity[group.entitys[i]];
			if (!scrawl.isBetween(myEntity.start.x, minX, maxX, true)) {
				myEntity.delta.x = -myEntity.delta.x;
				hitFlag = true;
			}
			if (!scrawl.isBetween(myEntity.start.y, minY, maxY, true)) {
				myEntity.delta.y = -myEntity.delta.y;
				hitFlag = true;
			}
			if (hitFlag) {
				myEntity.updateStart();
			}
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
		for (var i = 0; i < 50; i++) {
			bunny.clone({
				startX: Math.floor((Math.random() * 580) + 10),
				startY: Math.floor((Math.random() * 580) + 10),
				deltaX: Math.floor((Math.random() * 4) + 1),
				deltaY: Math.floor((Math.random() * 4) + 1),
				visibility: true,
				group: 'mygroup',
			});
		}
		totalBunnies += 50;
	};


	//initialize scene
	addBunnies();

	//animation object
	scrawl.newAnimation({
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
