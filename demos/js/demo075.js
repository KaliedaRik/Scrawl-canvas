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
		entityList = ['Air', 'Bone', 'Clay', 'Fire', 'Metal', 'Radiance', 'Rock', 'Smoke', 'Water', 'Wood'],
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

	//load images into scrawl library
	scrawl.getImagesByClass('demo075');

	//define groups
	myGroup = scrawl.makeGroup({
		name: 'myGroup',
		regionRadius: 80,
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
	for (var i = 0, z = entityList.length; i < z; i++) {
		scrawl.makePicture({
			name: entityList[i],
			source: 'button' + entityList[i],
			startX: (i * 70) + 80,
			startY: (i * 30) + 40,
			deltaX: (Math.random() * 4) - 2,
			deltaY: (Math.random() * 2) - 1,
			strokeStyle: '#d0d0d0',
			handleX: 'center',
			handleY: 'center',
			method: 'drawFill',
			group: 'myGroup',
			collisionPoints: 'edges',
			checkHitUsingImageData: true,
		}).getImageData();
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
				roll: (i / 10) + 0.4,
			});
		}
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['block', 'images', 'collisions', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
