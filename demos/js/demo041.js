var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myEntity,
		minX = 1,
		minY = 1,
		maxX = 99,
		maxY = 99,
		moveEntitys;

	//define entitys
	myEntity = scrawl.newBlock({
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
	moveEntitys = function() {
		if (!scrawl.isBetween(parseFloat(myEntity.start.x), minX, maxX, true)) {
			myEntity.reverse('deltaX');
		}
		if (!scrawl.isBetween(parseFloat(myEntity.start.y), minY, maxY, true)) {
			myEntity.reverse('deltaY');
		}
		myEntity.updateStart();
	};

	//animation object
	scrawl.newAnimation({
		fn: function() {
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
	modules: ['block', 'wheel', 'animation', 'collisions'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
