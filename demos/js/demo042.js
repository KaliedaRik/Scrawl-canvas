var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var mySprite,
		minX = 50,
		minY = 50,
		maxX = 700,
		maxY = 325,
		points = ['star_p2', 'star_p4', 'star_p6', 'star_p8', 'star_p10'],
		dRadius = 2,
		minRad = 20,
		maxRad = 80,
		radius = 80,
		dRoll = 1,
		result,
		moveSprites;

	//define sprites
	mySprite = scrawl.makeRegularShape({
		name: 'star',
		startX: 210,
		startY: 187,
		deltaX: 3,
		deltaY: 2,
		lineWidth: 5,
		lineJoin: 'round',
		lineCap: 'round',
		strokeStyle: 'Red',
		fillStyle: 'Blue',
		method: 'fillDraw',
		miterLimit: 5,
		radius: 80,
		sides: 10,
		collisionPoints: 'start',
	});

	scrawl.newWheel({
		pivot: 'star',
		radius: 4,
		fillStyle: 'gold',
		method: 'fill',
		order: 1,
	});

	//sprite used to build Cell collision zone image
	scrawl.newBlock({
		startX: 50,
		startY: 50,
		width: 650,
		height: 275,
		method: 'draw',
		order: 10,
		field: true,
	});
	scrawl.buildFields();

	//animation function
	moveSprites = function() {
		result = mySprite.checkField();
		if (typeof result !== 'boolean') {
			if (!scrawl.isBetween(result.x, minX, maxX, true)) {
				mySprite.reverse('deltaX');
			}
			if (!scrawl.isBetween(result.y, minY, maxY, true)) {
				mySprite.reverse('deltaY');
			}
		}
		mySprite.updateStart();
		if (!scrawl.isBetween((radius + dRadius), maxRad, minRad)) {
			dRadius = -dRadius;
		}
		radius += dRadius;
		for (var j = 0, z = points.length; j < z; j++) {
			scrawl.point[points[j]].set({
				distance: radius,
			});
		}
		mySprite.setDelta({
			roll: dRoll,
		});
	};

	//animation object
	scrawl.newAnimation({
		fn: function() {
			moveSprites();
			scrawl.render();

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
	modules: ['path', 'factories', 'animation', 'collisions', 'wheel', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
