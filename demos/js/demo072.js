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
		myGroup,
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
	myGroup = scrawl.newGroup({
		name: 'myGroup',
		regionRadius: 100,
	});

	//build cell collision map
	scrawl.newBlock({
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
			group: 'myGroup',
			method: 'fillDraw',
			collisionPoints: 3,
		});
		scrawl.newWheel({
			name: 'W' + i,
			startX: (100 * i) + 150,
			startY: 250,
			deltaX: (Math.random() * 8) - 4,
			deltaY: (Math.random() * 4) - 2,
			radius: 40,
			fillStyle: myColors[i],
			method: 'fillDraw',
			group: 'myGroup',
			collisionPoints: 'perimeter',
		});
	}

	//animation functions
	moveEntitys = function() {
		for (var i = 0, z = myGroup.entitys.length; i < z; i++) {
			myEntity = scrawl.entity[myGroup.entitys[i]];
			if (myEntity.scale < 0.2) {
				myEntity.scale = 0.2;
			}
			myEntity.setDelta({
				scale: (myEntity.scale < 1) ? 0.005 : 0,
			});
		}
		myGroup.updateEntitysBy({
			roll: 1,
		});
		myGroup.updateStart();
	};

	checkBounds = function() {
		hits = myGroup.getFieldEntityHits();
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
			myEntity.updateStart();
		}
	};

	checkCollisions = function() {
		hits = myGroup.getInGroupEntityHits();
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
	scrawl.newAnimation({
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
	// path: '../min/',
	path: '../source/',
	minified: false,
	modules: ['block', 'path', 'factories', 'animation', 'collisions', 'wheel'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
