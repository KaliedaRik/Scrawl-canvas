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
		minX = 1,
		minY = 1,
		maxX = 99,
		maxY = 99,
		moveSprites;

	//define sprites
	mySprite = scrawl.newBlock({
		name: 'block',
		startX: '50%',
		startY: '50%',
		deltaX: '-0.35%',
		deltaY: '0.25%',
		width: '12%',
		height: '24%',
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

	//animation function
	moveSprites = function() {
		if (!scrawl.isBetween(parseFloat(mySprite.start.x), minX, maxX, true)) {
			mySprite.reverse('deltaX');
		}
		if (!scrawl.isBetween(parseFloat(mySprite.start.y), minY, maxY, true)) {
			mySprite.reverse('deltaY');
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
