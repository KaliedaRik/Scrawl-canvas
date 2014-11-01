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
		addBunnies,
		msg = document.getElementById('message');

	//load images into scrawl library
	scrawl.getImagesByClass('demo032');

	//define groups
	group = scrawl.newGroup({
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
		for (var i = 0, iz = group.entitys.length; i < iz; i++) {
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

	//event handlers
	addBunnies = function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		for (var i = 0; i < 10; i++) {
			bunny.clone({
				startX: Math.floor((Math.random() * 580) + 10),
				startY: Math.floor((Math.random() * 580) + 10),
				deltaX: Math.floor((Math.random() * 4) + 1),
				deltaY: Math.floor((Math.random() * 4) + 1),
				visibility: true,
				group: 'mygroup',
				createNewContext: false,
				//createNewContext=false - forces bunny clones to use the original bunny's context object (good speed gain)
			});
		}
		totalBunnies += 10;
	};
	canvas.addEventListener('mouseup', addBunnies, false);

	//initialize scene
	addBunnies();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			moveBunnies();
			pad.render();

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
