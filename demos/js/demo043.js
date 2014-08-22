var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var result,
		minX = 50,
		minY = 50,
		maxX = 700,
		maxY = 325,
		mySprite,
		points = ['frame_p2', 'frame_p4', 'frame_p6', 'frame_p8', 'frame_p10'],
		dRadius = 2,
		minRad = 20,
		maxRad = 80,
		radius = 50,
		dRoll = -1,
		moveSprites;

	//define sprites
	mySprite = scrawl.makeRegularShape({
		name: 'frame',
		startX: 562,
		startY: 187,
		deltaX: 3,
		deltaY: -2,
		method: 'none',
		radius: 50,
		sides: 10,
		collisionPoints: 'start',
	});

	for (var i = 1; i < 11; i++) {
		scrawl.newWheel({
			pivot: 'frame_p' + i,
			radius: 12,
			fillStyle: 'Green',
			method: 'fillDraw',
		});
	}

	scrawl.newWheel({
		pivot: 'frame',
		radius: 4,
		fillStyle: 'red',
		method: 'fill',
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
	modules: ['path', 'factories', 'animation', 'collisions', 'wheel', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
