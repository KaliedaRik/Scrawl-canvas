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
		spriteList = ['Air', 'Bone', 'Clay', 'Fire', 'Metal', 'Radiance', 'Rock', 'Smoke', 'Water', 'Wood'],
		myGroup,
		minX = 10,
		minY = 10,
		maxX = 740,
		maxY = 365,
		mySprite,
		coord,
		hits,
		moveSprites,
		checkBounds,
		checkCollisions;

	//load images into scrawl library
	scrawl.getImagesByClass('demo075');

	//define groups
	myGroup = scrawl.newGroup({
		name: 'myGroup',
		regionRadius: 80,
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

	//define sprites
	for (var i = 0, z = spriteList.length; i < z; i++) {
		scrawl.newPicture({
			name: spriteList[i],
			source: 'button' + spriteList[i],
			startX: (i * 70) + 80,
			startY: (i * 30) + 40,
			deltaX: (Math.random() * 8) - 4,
			deltaY: (Math.random() * 4) - 2,
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
	moveSprites = function() {
		for (var i = 0, z = myGroup.sprites.length; i < z; i++) {
			mySprite = scrawl.sprite[myGroup.sprites[i]];
			if (mySprite.scale < 0.2) {
				mySprite.scale = 0.2;
			}
			mySprite.setDelta({
				scale: (mySprite.scale < 1) ? 0.005 : 0,
				roll: (i / 10) + 0.4,
			});
		}
		myGroup.updateStart();
	};

	checkBounds = function() {
		hits = myGroup.getFieldSpriteHits();
		for (var i = 0, z = hits.length; i < z; i++) {
			mySprite = scrawl.sprite[hits[i][0]];
			coord = hits[i][1];
			mySprite.revertStart();
			if (!scrawl.isBetween(coord.x, minX, maxX, true)) {
				mySprite.reverse('deltaX');
				mySprite.setDelta({
					scale: -0.08,
				});
			}
			if (!scrawl.isBetween(coord.y, minY, maxY, true)) {
				mySprite.reverse('deltaY');
				mySprite.setDelta({
					scale: -0.08,
				});
			}
			mySprite.updateStart();
		}
	};

	checkCollisions = function() {
		hits = myGroup.getInGroupSpriteHits();
		for (var i = 0, z = hits.length; i < z; i++) {
			scrawl.sprite[hits[i][0]].exchange(scrawl.sprite[hits[i][1]], 'delta');
			for (var j = 0; j < 2; j++) {
				mySprite = scrawl.sprite[hits[i][j]];
				mySprite.setDelta({
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
			moveSprites();
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
	modules: ['block', 'images', 'collisions', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
