var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myPad = scrawl.pad.mycanvas,
		myColors = ['Green', 'Blue', 'lightblue', 'gold', 'lightgreen', 'Pink'],
		groupA,
		groupB,
		allEntitys,
		minX = 10,
		minY = 10,
		maxX = 740,
		maxY = 365,
		myEntity,
		coord,
		hits,
		moveEntitys,
		checkBounds,
		checkCollisions;

	//define groups
	groupA = scrawl.makeGroup({
		name: 'A',
		regionRadius: 100,
	});
	groupB = scrawl.makeGroup({
		name: 'B',
		regionRadius: 100,
	});
	allEntitys = scrawl.makeGroup({
		name: 'all',
	});

	//build cell collision map
	scrawl.makeBlock({
		name: 'fence',
		startX: 10,
		startY: 10,
		width: 730,
		height: 355,
		method: 'draw',
		order: 10,
		field: true,
	});
	scrawl.buildFields();

	//define entitys
	for (var i = 0; i < 6; i++) {
		scrawl.makeRegularShape({
			name: 'T' + i,
			startX: (100 * i) + 100,
			startY: 100,
			deltaX: (Math.random() * 8) - 4,
			deltaY: (Math.random() * 4) - 2,
			angle: 120,
			roll: 15 * i,
			radius: 40,
			fillStyle: myColors[i],
			group: 'A',
			order: i,
			method: 'fillDraw',
			collisionPoints: 3,
		});
		scrawl.makeWheel({
			name: 'W' + i,
			startX: (100 * i) + 150,
			startY: 250,
			deltaX: (Math.random() * 8) - 4,
			deltaY: (Math.random() * 4) - 2,
			radius: 40,
			fillStyle: myColors[i],
			method: 'fillDraw',
			group: 'B',
			order: i,
			collisionPoints: 'perimeter',
		});
	}
	allEntitys.entitys = groupA.entitys.concat(groupB.entitys);

	//animation functions
	moveEntitys = function() {
		for (var i = 0, z = allEntitys.entitys.length; i < z; i++) {
			myEntity = scrawl.entity[allEntitys.entitys[i]];
			if (myEntity.scale < 0.2) {
				myEntity.scale = 0.2;
			}
			myEntity.setDelta({
				scale: (myEntity.scale < 1) ? 0.005 : 0,
			});
		}
		groupA.updateEntitysBy({
			roll: 1,
		});
		allEntitys.updateStart();
	};

	checkBounds = function() {
		hits = allEntitys.getFieldEntityHits();
		for (var i = 0, z = hits.length; i < z; i++) {
			myEntity = scrawl.entity[hits[i][0]];
			coord = hits[i][1];
			myEntity.revertStart();
			if (!scrawl.isBetween(coord.x, minX, maxX, true)) {
				myEntity.reverse('deltaX');
				myEntity.setDelta({
					scale: -0.08,
				});
			}
			if (!scrawl.isBetween(coord.y, minY, maxY, true)) {
				myEntity.reverse('deltaY');
				myEntity.setDelta({
					scale: -0.08,
				});
			}
			allEntitys.updateStart();
		}
	};

	checkCollisions = function() {
		hits = groupB.getBetweenGroupEntityHits(groupA);
		for (var i = 0, z = hits.length; i < z; i++) {
			scrawl.entity[hits[i][0]].exchange(scrawl.entity[hits[i][1]], 'delta');
			for (var j = 0; j < 2; j++) {
				myEntity = scrawl.entity[hits[i][j]];
				myEntity.setDelta({
					scale: -0.08,
				});
			}
		}
	};

	//animation object
	scrawl.makeAnimation({
		fn: function() {
			checkBounds();
			checkCollisions();
			moveEntitys();
			scrawl.render();

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
	modules: ['block', 'path', 'factories', 'wheel', 'animation', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
