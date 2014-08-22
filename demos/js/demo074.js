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
		phrase = ['Canvas', 'just', 'wanna\nwanna', 'have', 'some\nFUN', 'innit!'],
		groupA,
		groupB,
		allSprites,
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

	//define groups
	groupA = scrawl.newGroup({
		name: 'A',
		regionRadius: 200,
	});
	groupB = scrawl.newGroup({
		name: 'B',
		regionRadius: 200,
	});
	allSprites = scrawl.newGroup({
		name: 'all',
	});

	//build cell collision map
	scrawl.newBlock({
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
	for (var i = 0; i < 6; i++) {
		scrawl.newPhrase({
			name: 'text' + i,
			startX: (100 * i) + 100,
			startY: 300,
			deltaX: (Math.random() * 8) - 4,
			deltaY: (Math.random() * 4) - 2,
			roll: 15 * i,
			fillStyle: myColors[i],
			handleX: 'center',
			handleY: 'center',
			size: 20,
			metrics: 'pt',
			family: 'Arial, sans-serif',
			group: 'B',
			order: i,
			method: 'fill',
			collisionPoints: 'corners',
			backgroundColor: '#a0a0a0',
			backgroundMargin: 2,
			text: phrase[i],
		});
		scrawl.newBlock({
			name: 'B' + i,
			startX: (100 * i) + 100,
			startY: 60,
			roll: 15 * i,
			deltaX: (Math.random() * 8) - 4,
			deltaY: (Math.random() * 4) - 2,
			width: 80,
			height: 50,
			handleX: 'center',
			handleY: 'center',
			fillStyle: myColors[i],
			method: 'fillDraw',
			group: 'A',
			order: i,
			collisionPoints: 'corners',
		});
	}
	allSprites.sprites = groupA.sprites.concat(groupB.sprites);

	//animation functions
	moveSprites = function() {
		for (var i = 0, z = allSprites.sprites.length; i < z; i++) {
			mySprite = scrawl.sprite[allSprites.sprites[i]];
			if (mySprite.scale < 0.2) {
				mySprite.scale = 0.2;
			}
			mySprite.setDelta({
				scale: (mySprite.scale < 1) ? 0.005 : 0,
			});
		}
		groupA.updateSpritesBy({
			roll: 1,
		});
		groupB.updateSpritesBy({
			roll: -1,
		});
		allSprites.updateStart();
	};

	checkBounds = function() {
		hits = allSprites.getFieldSpriteHits();
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
			allSprites.updateStart();
		}
	};

	checkCollisions = function() {
		hits = groupB.getBetweenGroupSpriteHits(groupA);
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
	modules: ['block', 'phrase', 'animation', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
