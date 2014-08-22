var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var mySprite,
		minX = 50,
		minY = 50,
		maxX = 700,
		maxY = 325,
		result,
		moveSprites;

	//define sprites
	mySprite = scrawl.newBlock({
		name: 'block',
		startX: 375,
		startY: 187,
		deltaX: -3,
		deltaY: 2,
		width: 100,
		height: 100,
		handleX: 'center',
		handleY: 'center',
		strokeStyle: 'Purple',
		fillStyle: 'Pink',
		lineWidth: 10,
		lineJoin: 'round',
		method: 'fillDraw',
		collisionPoints: 'center',
	});
	scrawl.newWheel({
		pivot: 'block',
		radius: 4,
		fillStyle: 'blue',
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
	modules: ['block', 'wheel', 'animation', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
