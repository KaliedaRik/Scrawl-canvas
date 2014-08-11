var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage'),
		msg = document.getElementById('message');

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
		moveSprites,
		checkBounds,
		mySprite,
		coord,
		hits,
		moveBunnies,
		addBunnies;

	//load images into scrawl library
	scrawl.getImagesByClass('demo031');

	//define groups
	group = scrawl.newGroup({
		name: 'mygroup',
	});

	//define sprites
	scrawl.newBlock({ //cell collision zone
		startX: 5,
		startY: 5,
		width: 590,
		height: 590,
		field: true,
		visibility: false,
	});
	scrawl.buildFields();

	bunny = scrawl.newPicture({ //bunny sprite template
		name: 'bunny',
		source: 'bunny',
		handleX: 'center',
		handleY: 'center',
		visibility: false,
		collisionPoints: 'center',
	});

	//animation functions
	moveSprites = function() {
		group.updateStart();
	};

	checkBounds = function() {
		hits = group.getFieldSpriteHits();
		for (var i = 0, z = hits.length; i < z; i++) {
			mySprite = scrawl.sprite[hits[i][0]];
			coord = hits[i][1];
			mySprite.revertStart();
			if (!scrawl.isBetween(coord.x, minX, maxX, true)) {
				mySprite.reverse('deltaX');
			}
			if (!scrawl.isBetween(coord.y, minY, maxY, true)) {
				mySprite.reverse('deltaY');
			}
			mySprite.updateStart();
		}
	};

	moveBunnies = function() {
		moveSprites();
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
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'collisions', 'animation', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
